// Aqui ficam as "portas de entrada" da API: cada rota diz qual endereço e qual método
// ela atende, e o que fazer quando alguém bate nela.
//
// Um combinado que deixa o código mais simples: cada rota NÃO mexe na resposta HTTP.
// Ela só devolve { status, corpo } e quem envia de verdade é o arquivo aplicacao.js.
// Assim, cada rota fica curtinha e fácil de testar.
import { ErroHttp } from './erros.js';
import {
  validarCategoria,
  validarCorpoDaResposta,
  validarIdPergunta,
} from './validacao.js';

// Monta o bloco "fonte" do jeito que o front-end vai mostrar (RA05).
function montarFonte(linha) {
  return {
    titulo: linha.fonte_titulo,
    url: linha.fonte_url,
    publicador: linha.publicador,
    idioma: linha.idioma,
  };
}

export function criarRotas(consultas) {
  return [
    // -----------------------------------------------------------------
    // GET /api/saude
    // Uma rota boba e muito útil: serve para saber se a API e o banco estão vivos.
    // Plataformas de hospedagem costumam chamar isso para saber se o servidor está bem.
    // -----------------------------------------------------------------
    {
      metodo: 'GET',
      padrao: /^\/api\/saude$/,
      async tratador() {
        await consultas.verificarConexao();
        return { status: 200, corpo: { status: 'ok' } };
      },
    },

    // -----------------------------------------------------------------
    // GET /api/categorias   (RA01)
    // É a primeira coisa que o front-end pede: a lista de temas para o jogador escolher.
    // -----------------------------------------------------------------
    {
      metodo: 'GET',
      padrao: /^\/api\/categorias$/,
      async tratador() {
        const categorias = await consultas.listarCategorias();
        return { status: 200, corpo: { categorias } };
      },
    },

    // -----------------------------------------------------------------
    // GET /api/pergunta              -> sorteia de qualquer categoria (RA02a)
    // GET /api/pergunta?categoria=X  -> sorteia só da categoria X     (RA02b)
    // Devolve também as alternativas (RA03).
    //
    // ATENÇÃO: aqui NÃO vai a resposta certa. Se fosse, qualquer pessoa abriria
    // o "Network" do navegador, veria o gabarito e o quiz perderia a graça.
    // -----------------------------------------------------------------
    {
      metodo: 'GET',
      padrao: /^\/api\/pergunta$/,
      async tratador({ url }) {
        const categoriasInformadas = url.searchParams.getAll('categoria');
        if (categoriasInformadas.length > 1) {
          throw new ErroHttp(400, 'Informe apenas uma categoria por vez.');
        }
        const categoria = validarCategoria(categoriasInformadas[0]);

        const pergunta = await consultas.sortearPergunta(categoria);

        if (!pergunta) {
          // Não achamos nada. Vale explicar o motivo certo para quem está usando a API:
          if (categoria && !(await consultas.categoriaExiste(categoria))) {
            throw new ErroHttp(404, 'Não existe uma categoria com esse nome.');
          }
          throw new ErroHttp(404, 'Ainda não há perguntas para sortear.');
        }

        const alternativas = await consultas.listarAlternativas();
        return { status: 200, corpo: { ...pergunta, alternativas } };
      },
    },

    // -----------------------------------------------------------------
    // POST /api/resposta   (RA04, e já entrega a RA05 de brinde)
    // Recebe: { "id_pergunta": "fact-001", "id_alternativa": 1 }
    // Devolve: se acertou, qual era a certa, a explicação e a fonte completa.
    //
    // Por que a explicação vem junto? Porque assim o jogador só descobre o
    // gabarito DEPOIS de responder, e o front-end resolve tudo com uma chamada só.
    // -----------------------------------------------------------------
    {
      metodo: 'POST',
      padrao: /^\/api\/resposta$/,
      async tratador({ lerCorpo }) {
        const { idPergunta, idAlternativa } = validarCorpoDaResposta(await lerCorpo());

        // Um id bem escrito (ex.: 999) ainda pode não existir no banco.
        if (!(await consultas.alternativaExiste(idAlternativa))) {
          throw new ErroHttp(404, 'Alternativa não encontrada.');
        }

        const linha = await consultas.conferirEExplicar(idPergunta, idAlternativa);
        if (!linha) throw new ErroHttp(404, 'Pergunta não encontrada.');

        return {
          status: 200,
          corpo: {
            id_pergunta: linha.id_pergunta,
            id_alternativa_escolhida: idAlternativa,
            acertou: linha.acertou_ou_falso,
            alternativa_correta: {
              id_alternativa: linha.id_alternativa_correta,
              rotulo: linha.rotulo_da_correta,
            },
            explicacao: linha.explicacao,
            fonte: montarFonte(linha),
          },
        };
      },
    },

    // -----------------------------------------------------------------
    // GET /api/pergunta/:id/explicacao   (RA05)
    // Só a explicação e a fonte de uma pergunta, sem precisar responder.
    //
    // Um aviso sincero: como não há login nem sessão, a API não tem como saber se a pessoa
    // já respondeu. Então esta rota entrega a explicação (que revela a resposta) para quem pedir.
    // O front-end deve chamar APENAS depois de o jogador responder. Se quiser evitar
    // isso de vez, use só o POST /api/resposta, que já devolve tudo.
    // -----------------------------------------------------------------
    {
      metodo: 'GET',
      padrao: /^\/api\/pergunta\/([^/]+)\/explicacao$/,
      async tratador({ parametros }) {
        let idPergunta;
        try {
          idPergunta = validarIdPergunta(decodeURIComponent(parametros[0]));
        } catch (erro) {
          // decodeURIComponent reclama de coisas como "%E0%A4%A", que viram um 400 para quem chamou.
          if (erro instanceof ErroHttp) throw erro;
          throw new ErroHttp(400, 'O id da pergunta precisa ter o formato fact-001.');
        }

        const linha = await consultas.conferirEExplicar(idPergunta, null);
        if (!linha) throw new ErroHttp(404, 'Pergunta não encontrada.');

        return {
          status: 200,
          corpo: {
            id_pergunta: linha.id_pergunta,
            explicacao: linha.explicacao,
            fonte: montarFonte(linha),
          },
        };
      },
    },

    // -----------------------------------------------------------------
    // GET /api/estatisticas   (RA06 e RA07)
    // Quem são os publicadores mais citados e quais fontes apoiam mais de uma pergunta.
    // As duas consultas não dependem uma da outra, então rodam ao mesmo tempo.
    // -----------------------------------------------------------------
    {
      metodo: 'GET',
      padrao: /^\/api\/estatisticas$/,
      async tratador() {
        const [publicadores, fontes] = await Promise.all([
          consultas.publicadoresMaisCitados(),
          consultas.fontesCitadasMaisDeUmaVez(),
        ]);
        return {
          status: 200,
          corpo: {
            publicadores_mais_citados: publicadores,
            fontes_citadas_mais_de_uma_vez: fontes,
          },
        };
      },
    },
  ];
}
