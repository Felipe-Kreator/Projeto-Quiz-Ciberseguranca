// Pequenas ferramentas para falar HTTP sem precisar de framework nenhum:
// mandar JSON, ler o corpo de um POST, cabeçalhos de segurança e CORS.
import { ErroHttp } from './erros.js';

// Responde com JSON. Os cabeçalhos aqui valem para toda resposta de sucesso.
export function enviarJson(res, status, corpo, cabecalhosExtras = {}) {
  const texto = JSON.stringify(corpo);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(texto),
    // Não queremos que ninguém guarde a resposta em cache: a pergunta sorteada tem que mudar sempre.
    'Cache-Control': 'no-store',
    ...cabecalhosExtras,
  });
  res.end(texto);
}

// Cabeçalhos de segurança que vão em TODAS as respostas.
// Como esta API só devolve JSON (nunca páginas), podemos ser bem restritivos.
export function aplicarCabecalhosDeSeguranca(res) {
  // "Navegador, não tente adivinhar o tipo do arquivo. Confie no que eu disse."
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Ninguém pode colocar as respostas da API dentro de um <iframe>.
  res.setHeader('X-Frame-Options', 'DENY');
  // Não manda o endereço da página de origem quando o usuário clica em algo.
  res.setHeader('Referrer-Policy', 'no-referrer');
  // Esta API não carrega nada (imagem, script, estilo), então não permitimos nada.
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
  // Não conta a tecnologia para curiosos.
  res.removeHeader('X-Powered-By');
}

// CORS: por padrão o navegador NÃO deixa um site (ex.: localhost:5500) chamar outro endereço
// (ex.: localhost:3000). A gente libera apenas o endereço que escolhemos no .env.
// Nada de "*" por conveniência: liberar para todo mundo é abrir a porta da casa.
export function aplicarCors(req, res, corsOrigem) {
  if (!corsOrigem) return;

  res.setHeader('Vary', 'Origin');
  if (req.headers.origin === corsOrigem) {
    res.setHeader('Access-Control-Allow-Origin', corsOrigem);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '600');
  }
}

// Lê o corpo de um POST e devolve o JSON já convertido em objeto.
// Três cuidados importantes aqui:
//   1) só aceitamos "Content-Type: application/json";
//   2) cortamos a conversa se o corpo passar do limite (alguém mandando 1 GB para travar o servidor);
//   3) se o JSON estiver quebrado, respondemos 400 em vez de deixar o servidor cair.
export async function lerCorpoJson(req, limiteEmBytes = 10_000) {
  const tipo = req.headers['content-type'] ?? '';
  if (!tipo.toLowerCase().startsWith('application/json')) {
    throw new ErroHttp(415, 'Envie o corpo como JSON (Content-Type: application/json).');
  }

  const pedacos = [];
  let total = 0;

  for await (const pedaco of req) {
    total += pedaco.length;
    if (total > limiteEmBytes) {
      throw new ErroHttp(413, 'O corpo da requisição é grande demais.');
    }
    pedacos.push(pedaco);
  }

  try {
    return JSON.parse(Buffer.concat(pedacos).toString('utf8'));
  } catch {
    throw new ErroHttp(400, 'O JSON enviado está mal formado.');
  }
}
