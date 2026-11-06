// Um "porteiro" bem simples: cada pessoa (identificada pelo IP) pode fazer
// um certo número de requisições por minuto. Passou disso, recebe 429 e espera um pouco.
// Não é blindagem total, mas segura robôs e scripts descontrolados.
//
// Ele guarda os contadores na memória do próprio servidor. Para um projeto deste tamanho
// é perfeito. (Se um dia houver vários servidores ao mesmo tempo, aí valeria um Redis.)
import { ErroHttp } from './erros.js';

const UM_MINUTO = 60_000;

export function criarLimitador({ limitePorMinuto, confiarNoProxy }) {
  const contadores = new Map(); // ip -> { quantidade, inicioDaJanela }

  // De tempos em tempos, esquecemos quem já não faz requisição, senão o Map crescia para sempre.
  // O unref() garante que este relógio não impede o servidor de desligar.
  const faxina = setInterval(() => {
    const agora = Date.now();
    for (const [ip, dados] of contadores) {
      if (agora - dados.inicioDaJanela > UM_MINUTO) contadores.delete(ip);
    }
  }, UM_MINUTO);
  faxina.unref();

  function descobrirIp(req) {
    // Atrás de um proxy (Vercel, Render, Nginx), o IP real vem neste cabeçalho.
    // Só confiamos nele quando o .env diz que o proxy é de confiança,
    // porque qualquer um pode mandar esse cabeçalho falso para enganar o limitador.
    if (confiarNoProxy) {
      const encaminhado = req.headers['x-forwarded-for'];
      if (typeof encaminhado === 'string' && encaminhado) return encaminhado.split(',')[0].trim();
    }
    return req.socket.remoteAddress ?? 'desconhecido';
  }

  return {
    // Chame isto no começo de cada requisição. Se passou do limite, lança o erro 429.
    conferir(req) {
      const ip = descobrirIp(req);
      const agora = Date.now();
      let dados = contadores.get(ip);

      // Primeira visita, ou a janela de 1 minuto já acabou: começa a contar de novo.
      if (!dados || agora - dados.inicioDaJanela > UM_MINUTO) {
        dados = { quantidade: 0, inicioDaJanela: agora };
        contadores.set(ip, dados);
      }

      dados.quantidade += 1;

      if (dados.quantidade > limitePorMinuto) {
        const segundos = Math.ceil((dados.inicioDaJanela + UM_MINUTO - agora) / 1000);
        const erro = new ErroHttp(429, 'Muitas requisições. Espere um instante e tente de novo.');
        // O cabeçalho Retry-After diz ao cliente em quantos segundos vale a pena tentar de novo.
        erro.cabecalhos = { 'Retry-After': String(Math.max(segundos, 1)) };
        throw erro;
      }
    },
    parar: () => clearInterval(faxina),
  };
}
