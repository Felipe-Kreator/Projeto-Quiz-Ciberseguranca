// Único arquivo que conversa com o back-end. Se a API mudar de endereço, é só mexer aqui.
// Em produção (Vercel) a API fica no mesmo domínio: /api.
// Em desenvolvimento local, com o front em outra porta (ex.: 5500), a API roda em localhost:3000.
const emDesenvolvimento =
  ['localhost', '127.0.0.1'].includes(location.hostname) && location.port !== '' && location.port !== '3000';
export const API_URL = emDesenvolvimento ? 'http://localhost:3000/api' : '/api';

async function chamar(caminho, opcoes = {}) {
  let resposta;
  try {
    // Se a API não responder em 8 segundos, desistimos em vez de deixar a pessoa esperando.
    resposta = await fetch(API_URL + caminho, { ...opcoes, signal: AbortSignal.timeout(8000) });
  } catch {
    throw new Error('Não consegui falar com o servidor. Confira se a API está ligada.');
  }
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(dados.erro || 'Algo deu errado. Tente de novo.');
  return dados;
}

export const api = {
  listarCategorias: () => chamar('/categorias'),
  sortearPergunta: (categoria) => chamar('/pergunta' + (categoria ? `?categoria=${encodeURIComponent(categoria)}` : '')),
  responder: (idPergunta, idAlternativa) =>
    chamar('/resposta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_pergunta: idPergunta, id_alternativa: idAlternativa }),
    }),
  estatisticas: () => chamar('/estatisticas'),
};
