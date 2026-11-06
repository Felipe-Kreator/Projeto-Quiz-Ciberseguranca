// Este arquivo costura tudo: recebe cada requisição, passa pelos cuidados de segurança,
// escolhe a rota certa, devolve a resposta e, se algo der errado, responde com educação
// sem vazar nenhum detalhe interno.
import http from 'node:http';
import { criarBanco } from './banco.js';
import { criarConsultas } from './consultas.js';
import { ErroHttp } from './erros.js';
import { criarLimitador } from './limitador.js';
import { criarRotas } from './rotas.js';
import {
  aplicarCabecalhosDeSeguranca,
  aplicarCors,
  enviarJson,
  lerCorpoJson,
} from './utilitarios-http.js';

// Descobre quem deve levar a culpa: um erro "nosso" (ErroHttp, com status e tudo)
// ou algo inesperado. No inesperado, quase sempre é o banco fora do ar.
function traduzirErro(erro) {
  if (erro instanceof ErroHttp) return erro;

  const codigo = String(erro?.code ?? '');
  const mensagem = String(erro?.message ?? '');

  const bancoForaDoAr =
    ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNRESET'].includes(codigo) ||
    codigo.startsWith('08') || // família "problema de conexão" do PostgreSQL
    codigo === '57P01' || // banco está sendo desligado
    codigo === '57014' || // consulta demorou demais (statement_timeout)
    mensagem.includes('timeout exceeded when trying to connect');

  if (bancoForaDoAr) return new ErroHttp(503, 'O banco de dados está indisponível no momento. Tente de novo em instantes.');

  // Qualquer outra coisa é um bug nosso. A pessoa recebe uma mensagem genérica
  // (nunca o texto do erro, que poderia revelar nomes de tabela, caminhos etc.).
  return new ErroHttp(500, 'Ops, algo deu errado do nosso lado.');
}

export function criarAplicacao(configuracao, { banco: bancoPronto, silencioso = false } = {}) {
  const registrar = silencioso ? () => {} : (...partes) => console.log(...partes);
  const registrarErro = silencioso ? () => {} : (...partes) => console.error(...partes);

  const banco = bancoPronto ?? criarBanco(configuracao.banco);
  const consultas = criarConsultas(banco);
  const rotas = criarRotas(consultas);
  const limitador = criarLimitador({
    limitePorMinuto: configuracao.limiteRequisicoesPorMinuto,
    confiarNoProxy: configuracao.confiarNoProxy,
  });

  async function atender(req, res) {
    const inicio = Date.now();
    let caminho = '-';

    // Quando a resposta termina, anotamos uma linha de log: método, caminho, status e tempo.
    // Não registramos o corpo nem a query string, para não guardar nada que o usuário digitou.
    res.on('finish', () => {
      registrar(`${new Date().toISOString()} ${req.method} ${caminho} ${res.statusCode} ${Date.now() - inicio}ms`);
    });

    aplicarCabecalhosDeSeguranca(res);

    try {
      aplicarCors(req, res, configuracao.corsOrigem);

      // O navegador faz uma "pré-pergunta" (OPTIONS) antes de certos pedidos entre sites diferentes.
      // Respondemos "sem conteúdo" e deixamos os cabeçalhos do CORS fazerem o trabalho.
      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      limitador.conferir(req);

      // O endereço pode vir esquisito. Se não der nem para interpretar, é pedido ruim.
      let url;
      try {
        url = new URL(req.url, 'http://localhost');
      } catch {
        throw new ErroHttp(400, 'Endereço inválido.');
      }
      caminho = url.pathname;

      // Procura rotas cujo endereço combine. Se acha o endereço mas o método não confere
      // (ex.: GET em /api/resposta), o certo é 405 e não 404: a rota existe, o jeito de chamar é que está errado.
      const candidatas = rotas.filter((rota) => rota.padrao.test(url.pathname));
      if (candidatas.length === 0) throw new ErroHttp(404, 'Rota não encontrada.');

      const rota = candidatas.find((candidata) => candidata.metodo === req.method);
      if (!rota) {
        const erro = new ErroHttp(405, 'Método não permitido para esta rota.');
        erro.cabecalhos = { Allow: candidatas.map((c) => c.metodo).join(', ') };
        throw erro;
      }

      const parametros = url.pathname.match(rota.padrao).slice(1);
      const resultado = await rota.tratador({
        url,
        parametros,
        lerCorpo: () => lerCorpoJson(req),
      });

      enviarJson(res, resultado.status, resultado.corpo);
    } catch (erroOriginal) {
      const erro = traduzirErro(erroOriginal);

      // Erros 5xx são problemas nossos: vale registrar o detalhe verdadeiro para investigar depois.
      if (erro.status >= 500) registrarErro('[erro]', req.method, caminho, erroOriginal);

      if (res.headersSent) {
        res.end();
        return;
      }
      enviarJson(res, erro.status, { erro: erro.message }, erro.cabecalhos);
    }
  }

  const servidor = http.createServer((req, res) => {
    // O .catch é a última rede de proteção: nada pode escapar e derrubar o processo.
    atender(req, res).catch((erro) => {
      registrarErro('[erro grave]', erro);
      if (!res.headersSent) enviarJson(res, 500, { erro: 'Ops, algo deu errado do nosso lado.' });
    });
  });

  // Um cliente lento não pode ficar pendurado para sempre ocupando o servidor.
  servidor.requestTimeout = 15_000;
  servidor.headersTimeout = 10_000;

  return {
    servidor,

    // Pergunta ao banco "tudo certo?". Útil para avisar logo na partida se a senha estiver errada.
    async verificarBanco() {
      await consultas.verificarConexao();
    },

    // Desliga com calma: para o limitador, fecha o servidor e devolve as conexões do banco.
    async encerrar() {
      limitador.parar();
      await new Promise((resolver) => {
        servidor.close(resolver);
        servidor.closeAllConnections(); // não espera conexões "keep-alive" ociosas
      });
      await banco.encerrar();
    },
  };
}
