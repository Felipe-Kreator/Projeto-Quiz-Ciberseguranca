// Controla as telas e a partida. O placar mora só aqui, no navegador (o banco não guarda pontuação).
// Regra de ouro: texto vindo da API entra na página com textContent, nunca com innerHTML (evita XSS).
import { api } from './api.js';

const $ = (s) => document.querySelector(s);
const el = (tag, classe, texto) => {
  const e = document.createElement(tag);
  if (classe) e.className = classe;
  if (texto !== undefined) e.textContent = texto;
  return e;
};

let categorias = [];
let partida = null;
let repetir = () => {}; // o que fazer se a pessoa clicar em "Tentar de novo"

// ---------- Telas ----------
function mostrar(nome) {
  for (const t of ['inicio', 'jogo', 'resultado', 'estatisticas', 'erro']) $('#tela-' + t).hidden = t !== nome;
  $(`#tela-${nome} [data-foco]`)?.focus(); // leva o foco ao título, ajuda quem usa leitor de tela
  window.scrollTo(0, 0);
}

function mostrarErro(mensagem, tentarDeNovo) {
  $('#msg-erro').textContent = mensagem;
  repetir = tentarDeNovo;
  mostrar('erro');
}

// Roda uma chamada mostrando o "Carregando…" e cai na tela de erro se algo falhar.
async function comCarga(acao, tentarDeNovo) {
  $('#carregando').hidden = false;
  try {
    return await acao();
  } catch (erro) {
    mostrarErro(erro.message, tentarDeNovo);
  } finally {
    $('#carregando').hidden = true;
  }
}

// ---------- Tela inicial ----------
function opcao(nome, valor, rotulo, marcado, detalhe) {
  const label = el('label', 'opcao');
  const input = el('input');
  Object.assign(input, { type: 'radio', name: nome, value: valor, checked: marcado });
  const texto = el('span', '', rotulo);
  if (detalhe) texto.append(el('small', '', detalhe));
  label.append(input, texto);
  return label;
}

function montarCategorias() {
  const caixa = $('#categorias');
  const total = categorias.reduce((soma, c) => soma + c.qtd_perguntas, 0);
  caixa.replaceChildren(opcao('categoria', '', 'Todas as categorias', true, `${total} perguntas`));
  for (const c of categorias) caixa.append(opcao('categoria', c.nome, c.nome, false, `${c.qtd_perguntas} perguntas`));
  montarQuantidades();
}

// As opções de quantidade nunca passam do que existe na categoria escolhida.
function montarQuantidades() {
  const escolhida = document.querySelector('[name=categoria]:checked').value;
  const disponivel = escolhida
    ? categorias.find((c) => c.nome === escolhida).qtd_perguntas
    : categorias.reduce((soma, c) => soma + c.qtd_perguntas, 0);
  const numeros = [...[5, 10, 15].filter((n) => n < disponivel), disponivel];
  const padrao = numeros.filter((n) => n <= 10).pop() ?? numeros[0];
  $('#quantidades').replaceChildren(
    ...numeros.map((n) => opcao('quantidade', n, n === disponivel ? `Todas (${n})` : String(n), n === padrao))
  );
}

$('#categorias').addEventListener('change', montarQuantidades);
$('#form-inicio').addEventListener('submit', (evento) => {
  evento.preventDefault();
  iniciarPartida(
    document.querySelector('[name=categoria]:checked').value,
    Number(document.querySelector('[name=quantidade]:checked').value)
  );
});

// ---------- Partida ----------
function iniciarPartida(categoria, pedido) {
  partida = { categoria, pedido, total: pedido, indice: 0, acertos: 0, vistas: new Set(), atual: null };
  proximaPergunta();
}

async function proximaPergunta() {
  await comCarga(async () => {
    // A API sorteia sem memória; então pedimos de novo até vir uma pergunta que ainda não apareceu.
    let pergunta = null;
    for (let i = 0; i < 30 && !pergunta; i += 1) {
      const sorteada = await api.sortearPergunta(partida.categoria);
      if (!partida.vistas.has(sorteada.id_pergunta)) pergunta = sorteada;
    }
    if (!pergunta) {
      partida.total = partida.indice; // acabaram as perguntas novas: encerra com as que teve
      return mostrarResultado();
    }
    partida.vistas.add(pergunta.id_pergunta);
    partida.indice += 1;
    partida.atual = pergunta;
    desenharPergunta(pergunta);
  }, proximaPergunta);
}

function desenharPergunta(p) {
  $('#contador').textContent = `Pergunta ${partida.indice} de ${partida.total}`;
  $('#placar').textContent = `Acertos: ${partida.acertos}`;
  const progresso = Math.round(((partida.indice - 1) / partida.total) * 100);
  $('#barra').style.width = progresso + '%';
  document.querySelector('.barra-progresso').setAttribute('aria-valuenow', progresso);
  $('#categoria').textContent = p.categoria;
  $('#titulo-pergunta').textContent = p.titulo;
  $('#enunciado').textContent = p.enunciado;
  $('#area-feedback').hidden = true;

  $('#alternativas').replaceChildren(
    ...p.alternativas.map((alt, i) => {
      const botao = el('button', 'alternativa');
      botao.type = 'button';
      botao.dataset.id = alt.id_alternativa;
      botao.append(el('span', 'num', String(i + 1)), el('span', '', alt.rotulo));
      botao.addEventListener('click', () => responder(alt.id_alternativa, botao));
      return botao;
    })
  );
  mostrar('jogo');
}

async function responder(idAlternativa, botao) {
  const botoes = [...document.querySelectorAll('.alternativa')];
  botoes.forEach((b) => (b.disabled = true)); // depois de responder, ninguém marca de novo
  botao.classList.add('alternativa--escolhida');

  const r = await comCarga(
    () => api.responder(partida.atual.id_pergunta, idAlternativa),
    () => responder(idAlternativa, botao)
  );
  if (!r) return;

  if (r.acertou) partida.acertos += 1;
  $('#placar').textContent = `Acertos: ${partida.acertos}`;
  for (const b of botoes) {
    if (Number(b.dataset.id) === r.alternativa_correta.id_alternativa) b.classList.add('alternativa--correta');
  }
  if (!r.acertou) botao.classList.add('alternativa--errada');

  // Feedback: o símbolo ✓/✕ e o texto garantem que a informação não depende só da cor.
  $('#area-feedback').className = 'area-feedback ' + (r.acertou ? 'ok' : 'erro');
  $('#fb-titulo').textContent = r.acertou ? '✓ Acertou!' : '✕ Não foi dessa vez';
  $('#fb-correta').textContent = `Resposta correta: ${r.alternativa_correta.rotulo}`;
  $('#fb-texto').textContent = r.explicacao;
  $('#fb-link').textContent = r.fonte.titulo;
  $('#fb-link').href = /^https?:\/\//.test(r.fonte.url) ? r.fonte.url : '#'; // só links http(s)
  $('#fb-fonte').textContent = `${r.fonte.publicador} · idioma: ${r.fonte.idioma}`;
  $('#proxima').textContent = partida.indice >= partida.total ? 'Ver resultado' : 'Próxima pergunta';
  $('#area-feedback').hidden = false;
  $('#proxima').focus();
}

$('#proxima').addEventListener('click', () => (partida.indice >= partida.total ? mostrarResultado() : proximaPergunta()));

// Atalho de teclado: 1, 2, 3… escolhem a alternativa correspondente.
document.addEventListener('keydown', (e) => {
  if ($('#tela-jogo').hidden || !/^[1-9]$/.test(e.key)) return;
  document.querySelectorAll('.alternativa:not(:disabled)')[Number(e.key) - 1]?.click();
});

// ---------- Resultado ----------
function comentario(pct) {
  if (pct >= 90) return ['Mestre da segurança!', 'Você domina o assunto. Que tal ensinar o que sabe para amigos e família?'];
  if (pct >= 70) return ['Muito bem!', 'Você tem um bom nível. Reveja as explicações dos erros para chegar ao topo.'];
  if (pct >= 50) return ['No caminho certo', 'Você já reconhece vários riscos. Jogue de novo e leia as fontes para fixar.'];
  return ['Hora de reforçar', 'Sem problema: aprender é o objetivo. Leia as explicações e tente outra vez.'];
}

function mostrarResultado() {
  const { acertos, total } = partida;
  const pct = total ? Math.round((acertos / total) * 100) : 0;
  const [titulo, mensagem] = comentario(pct);
  $('#anel').style.setProperty('--p', pct);
  $('#res-pct').textContent = pct + '%';
  $('#res-nivel').textContent = titulo;
  $('#res-acertos').textContent = `${acertos} de ${total} acertos`;
  $('#res-msg').textContent = mensagem;
  mostrar('resultado');
}

$('#jogar-de-novo').addEventListener('click', () => iniciarPartida(partida.categoria, partida.pedido)); // sem recarregar a página
$('#mudar').addEventListener('click', () => mostrar('inicio'));

// ---------- Estatísticas (RA06 e RA07) ----------
async function mostrarEstatisticas() {
  const dados = await comCarga(() => api.estatisticas(), mostrarEstatisticas);
  if (!dados) return;
  const maior = Math.max(...dados.publicadores_mais_citados.map((p) => p.qtd_perguntas), 1);

  $('#lista-publicadores').replaceChildren(
    ...dados.publicadores_mais_citados.map((p) => {
      const li = el('li');
      const trilho = el('div', 'trilho');
      const barra = el('div', 'preenche');
      barra.style.width = (p.qtd_perguntas / maior) * 100 + '%';
      trilho.append(barra);
      li.append(el('span', '', `${p.publicador} — ${p.qtd_perguntas} perguntas`), trilho);
      return li;
    })
  );
  $('#lista-fontes').replaceChildren(
    ...dados.fontes_citadas_mais_de_uma_vez.map((f) => {
      const li = el('li');
      const link = el('a', '', f.fonte);
      link.href = /^https?:\/\//.test(f.url) ? f.url : '#';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      li.append(link, el('span', '', ` — ${f.qtd_perguntas} perguntas`));
      return li;
    })
  );
  mostrar('estatisticas');
}

$('#ir-estatisticas').addEventListener('click', mostrarEstatisticas);
$('#voltar-estat').addEventListener('click', () => mostrar('inicio'));
$('#erro-tentar').addEventListener('click', () => repetir());
$('#erro-inicio').addEventListener('click', () => (categorias.length ? mostrar('inicio') : iniciar()));

// ---------- Partida inicial ----------
async function iniciar() {
  await comCarga(async () => {
    categorias = (await api.listarCategorias()).categorias;
    montarCategorias();
    mostrar('inicio');
  }, iniciar);
}
iniciar();

