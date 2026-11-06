// Testes de verdade: sobem a API, falam com o PostgreSQL real e conferem as respostas.
// Para rodar: "npm test" (o banco precisa estar criado e carregado, veja o README).
import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { criarAplicacao } from '../src/aplicacao.js';
import { lerConfiguracao } from '../src/configuracao.js';

// Sobe uma API numa porta livre (a porta 0 significa "o sistema escolhe uma para mim")
// e devolve o endereço dela e uma função para desligar no fim.
async function subirApi(ajustes = {}) {
  const configuracao = { ...lerConfiguracao(), ...ajustes };
  const aplicacao = criarAplicacao(configuracao, { silencioso: true });
  await new Promise((resolver) => aplicacao.servidor.listen(0, resolver));
  const base = `http://localhost:${aplicacao.servidor.address().port}`;
  return { base, aplicacao };
}

const postarJson = (base, corpo, cabecalhos = { 'Content-Type': 'application/json' }) =>
  fetch(`${base}/api/resposta`, {
    method: 'POST',
    headers: cabecalhos,
    body: typeof corpo === 'string' ? corpo : JSON.stringify(corpo),
  });

describe('API do Tech Trivia', () => {
  let base;
  let aplicacao;
  let idCerto; // id da alternativa "Certo"
  let idErrado; // id da alternativa "Errado"

  before(async () => {
    ({ base, aplicacao } = await subirApi({ limiteRequisicoesPorMinuto: 100_000 }));
    const pergunta = await (await fetch(`${base}/api/pergunta`)).json();
    idCerto = pergunta.alternativas.find((a) => a.rotulo === 'Certo').id_alternativa;
    idErrado = pergunta.alternativas.find((a) => a.rotulo === 'Errado').id_alternativa;
  });
  after(() => aplicacao.encerrar());

  test('GET /api/saude responde ok', async () => {
    const resposta = await fetch(`${base}/api/saude`);
    assert.equal(resposta.status, 200);
    assert.deepEqual(await resposta.json(), { status: 'ok' });
  });

  test('RA01: lista as categorias em ordem alfabética, com a quantidade', async () => {
    const { categorias } = await (await fetch(`${base}/api/categorias`)).json();
    const nomes = categorias.map((c) => c.nome);
    assert.deepEqual(nomes, [...nomes].sort((a, b) => a.localeCompare(b, 'pt')));
    assert.equal(categorias.length, 3);
    assert.equal(categorias.reduce((soma, c) => soma + c.qtd_perguntas, 0), 8);
    assert.equal(typeof categorias[0].qtd_perguntas, 'number'); // número de verdade, não texto
  });

  test('RA02a/RA03: sorteia uma pergunta com alternativas e SEM entregar o gabarito', async () => {
    const pergunta = await (await fetch(`${base}/api/pergunta`)).json();
    assert.match(pergunta.id_pergunta, /^fact-\d{3,}$/);
    assert.ok(pergunta.titulo && pergunta.enunciado && pergunta.categoria);
    assert.equal(pergunta.alternativas.length, 2);

    // O ponto mais importante de segurança do quiz:
    const texto = JSON.stringify(pergunta);
    for (const proibido of ['id_alternativa_correta', 'acertou', 'explicacao', 'valor_logico', 'url']) {
      assert.ok(!texto.includes(proibido), `a resposta não pode conter "${proibido}"`);
    }
  });

  test('RA02b: sorteio por categoria só devolve perguntas daquela categoria', async () => {
    for (let i = 0; i < 12; i += 1) {
      const resposta = await fetch(`${base}/api/pergunta?categoria=${encodeURIComponent('Redes e criptografia')}`);
      assert.equal(resposta.status, 200);
      assert.equal((await resposta.json()).categoria, 'Redes e criptografia');
    }
  });

  test('categoria que não existe devolve 404 com mensagem clara', async () => {
    const resposta = await fetch(`${base}/api/pergunta?categoria=Culinaria`);
    assert.equal(resposta.status, 404);
    assert.match((await resposta.json()).erro, /categoria/i);
  });

  test('tentativa de SQL Injection na categoria é tratada como texto comum', async () => {
    const ataques = ["' OR '1'='1", "x'; DROP TABLE pergunta; --", "Redes e criptografia' --", '\u0000'];
    for (const ataque of ataques) {
      const resposta = await fetch(`${base}/api/pergunta?categoria=${encodeURIComponent(ataque)}`);
      assert.ok([400, 404].includes(resposta.status), `"${ataque}" deveria dar 400 ou 404, deu ${resposta.status}`);
    }
    // E o banco continua inteiro:
    const { categorias } = await (await fetch(`${base}/api/categorias`)).json();
    assert.equal(categorias.length, 3);
  });

  test('duas categorias na mesma chamada são recusadas', async () => {
    const resposta = await fetch(`${base}/api/pergunta?categoria=a&categoria=b`);
    assert.equal(resposta.status, 400);
  });

  test('RA04: acerta quando marca a alternativa correta e erra quando marca a outra', async () => {
    // fact-001 (SQL Injection) é "Certo"
    let dados = await (await postarJson(base, { id_pergunta: 'fact-001', id_alternativa: idCerto })).json();
    assert.equal(dados.acertou, true);
    assert.equal(dados.alternativa_correta.rotulo, 'Certo');

    dados = await (await postarJson(base, { id_pergunta: 'fact-001', id_alternativa: idErrado })).json();
    assert.equal(dados.acertou, false);

    // fact-003 (XSS no servidor de banco de dados) é "Errado"
    dados = await (await postarJson(base, { id_pergunta: 'fact-003', id_alternativa: idErrado })).json();
    assert.equal(dados.acertou, true);
    assert.equal(dados.alternativa_correta.rotulo, 'Errado');
  });

  test('RA05: a resposta traz explicação e a fonte completa', async () => {
    const dados = await (await postarJson(base, { id_pergunta: 'fact-008', id_alternativa: idErrado })).json();
    assert.ok(dados.explicacao.length > 20);
    assert.deepEqual(dados.fonte, {
      titulo: 'Cartilha de Segurança para Internet – Senhas',
      url: 'https://cartilha.cert.br/senhas/',
      publicador: 'CERT.br',
      idioma: 'Português',
    });
  });

  test('GET /api/pergunta/:id/explicacao devolve explicação e fonte', async () => {
    const resposta = await fetch(`${base}/api/pergunta/fact-002/explicacao`);
    assert.equal(resposta.status, 200);
    const dados = await resposta.json();
    assert.equal(dados.id_pergunta, 'fact-002');
    assert.equal(dados.fonte.publicador, 'OWASP Foundation');
  });

  test('explicação: id mal formado dá 400 e id inexistente dá 404', async () => {
    assert.equal((await fetch(`${base}/api/pergunta/qualquer-coisa/explicacao`)).status, 400);
    assert.equal((await fetch(`${base}/api/pergunta/%E0%A4%A/explicacao`)).status, 400);
    assert.equal((await fetch(`${base}/api/pergunta/fact-999/explicacao`)).status, 404);
  });

  test('POST /api/resposta valida tudo o que chega', async () => {
    const casos = [
      [{ id_pergunta: 'fact-1', id_alternativa: idCerto }, 400, 'id de pergunta fora do padrão'],
      [{ id_pergunta: "fact-001'; --", id_alternativa: idCerto }, 400, 'id de pergunta com injeção'],
      [{ id_pergunta: 'fact-001', id_alternativa: 'abc' }, 400, 'alternativa não numérica'],
      [{ id_pergunta: 'fact-001', id_alternativa: -1 }, 400, 'alternativa negativa'],
      [{ id_pergunta: 'fact-001', id_alternativa: 1.5 }, 400, 'alternativa decimal'],
      [{ id_pergunta: 'fact-001', id_alternativa: 99999999999 }, 400, 'alternativa estoura o INTEGER'],
      [{ id_pergunta: 'fact-001' }, 400, 'falta a alternativa'],
      [[], 400, 'lista no lugar de objeto'],
      [null, 400, 'null'],
      [{ id_pergunta: 'fact-001', id_alternativa: 999 }, 404, 'alternativa que não existe'],
      [{ id_pergunta: 'fact-777', id_alternativa: idCerto }, 404, 'pergunta que não existe'],
    ];
    for (const [corpo, esperado, descricao] of casos) {
      const resposta = await postarJson(base, corpo);
      assert.equal(resposta.status, esperado, `${descricao}: esperava ${esperado}, veio ${resposta.status}`);
    }
  });

  test('aceita o id da alternativa escrito como texto ("1")', async () => {
    const resposta = await postarJson(base, { id_pergunta: 'fact-001', id_alternativa: String(idCerto) });
    assert.equal(resposta.status, 200);
  });

  test('JSON quebrado, tipo errado e corpo gigante são recusados', async () => {
    assert.equal((await postarJson(base, '{isso nao e json')).status, 400);
    assert.equal((await postarJson(base, '{}', { 'Content-Type': 'text/plain' })).status, 415);
    const gigante = JSON.stringify({ id_pergunta: 'fact-001', lixo: 'x'.repeat(50_000) });
    assert.equal((await postarJson(base, gigante)).status, 413);
  });

  test('RA06/RA07: estatísticas de publicadores e de fontes repetidas', async () => {
    const dados = await (await fetch(`${base}/api/estatisticas`)).json();
    assert.equal(dados.publicadores_mais_citados[0].publicador, 'OWASP Foundation');
    assert.equal(dados.publicadores_mais_citados[0].qtd_perguntas, 4);
    assert.equal(dados.fontes_citadas_mais_de_uma_vez.length, 1);
    assert.equal(dados.fontes_citadas_mais_de_uma_vez[0].fonte, 'SQL Injection');
  });

  test('método errado dá 405 (com Allow) e rota inexistente dá 404', async () => {
    const metodoErrado = await fetch(`${base}/api/resposta`);
    assert.equal(metodoErrado.status, 405);
    assert.equal(metodoErrado.headers.get('allow'), 'POST');
    assert.equal((await fetch(`${base}/api/nao-existe`)).status, 404);
    assert.equal((await fetch(`${base}/api/categorias`, { method: 'DELETE' })).status, 405);
  });

  test('toda resposta leva os cabeçalhos de segurança e nunca revela a tecnologia', async () => {
    const resposta = await fetch(`${base}/api/categorias`);
    assert.equal(resposta.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(resposta.headers.get('x-frame-options'), 'DENY');
    assert.equal(resposta.headers.get('cache-control'), 'no-store');
    assert.equal(resposta.headers.get('x-powered-by'), null);
  });

  test('erros nunca vazam detalhes internos', async () => {
    const resposta = await fetch(`${base}/api/pergunta?categoria=${'a'.repeat(200)}`);
    const texto = JSON.stringify(await resposta.json());
    assert.ok(!/postgres|select|stack|node_modules|at /i.test(texto));
  });
});

describe('Limite de requisições', () => {
  test('depois do limite, responde 429 com Retry-After', async () => {
    const { base, aplicacao } = await subirApi({ limiteRequisicoesPorMinuto: 3 });
    try {
      const status = [];
      for (let i = 0; i < 5; i += 1) status.push((await fetch(`${base}/api/saude`)).status);
      assert.deepEqual(status, [200, 200, 200, 429, 429]);
      const bloqueada = await fetch(`${base}/api/saude`);
      assert.ok(Number(bloqueada.headers.get('retry-after')) >= 1);
    } finally {
      await aplicacao.encerrar();
    }
  });
});

describe('CORS', () => {
  test('libera só a origem configurada', async () => {
    const { base, aplicacao } = await subirApi({ corsOrigem: 'http://localhost:5500' });
    try {
      const permitida = await fetch(`${base}/api/saude`, { headers: { Origin: 'http://localhost:5500' } });
      assert.equal(permitida.headers.get('access-control-allow-origin'), 'http://localhost:5500');

      const intrusa = await fetch(`${base}/api/saude`, { headers: { Origin: 'http://site-malicioso.com' } });
      assert.equal(intrusa.headers.get('access-control-allow-origin'), null);

      const preflight = await fetch(`${base}/api/resposta`, {
        method: 'OPTIONS',
        headers: { Origin: 'http://localhost:5500', 'Access-Control-Request-Method': 'POST' },
      });
      assert.equal(preflight.status, 204);
    } finally {
      await aplicacao.encerrar();
    }
  });
});

describe('Quando o banco cai', () => {
  test('responde 503 em vez de derrubar o servidor ou vazar o erro', async () => {
    const { base, aplicacao } = await subirApi({
      banco: { host: 'localhost', port: 1, database: 'x', user: 'x' }, // porta onde ninguém escuta
    });
    try {
      const resposta = await fetch(`${base}/api/categorias`);
      assert.equal(resposta.status, 503);
      const texto = JSON.stringify(await resposta.json());
      assert.ok(!/ECONNREFUSED|localhost|127\.0\.0\.1/.test(texto));
    } finally {
      await aplicacao.encerrar();
    }
  });
});
