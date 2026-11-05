// Adaptador serverless: reutiliza as rotas e validações da API Node existente.
import { criarAplicacao } from '../quiz_cyberseguranca/backend/src/aplicacao.js';
import { lerConfiguracao } from '../quiz_cyberseguranca/backend/src/configuracao.js';
let aplicacao;
export default function handler(req, res) {
  try {
    aplicacao ??= criarAplicacao(lerConfiguracao());
    aplicacao.servidor.emit('request', req, res);
  } catch (erro) {
    console.error('[inicializacao]', erro.code || erro.name);
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ erro: 'Não foi possível iniciar a conexão com o banco.' }));
  }
}

