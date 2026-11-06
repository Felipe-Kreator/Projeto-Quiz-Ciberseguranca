// Regra de ouro de qualquer back-end: NUNCA confie no que chega de fora.
// Tudo o que o navegador manda (ids, nomes, JSON) passa por aqui antes de chegar perto do banco.
// Mesmo com as consultas parametrizadas protegendo contra SQL Injection, validar cedo
// dá mensagens de erro melhores e evita trabalho à toa para o banco.
import { ErroHttp } from './erros.js';

// Mesmo padrão que o banco exige na coluna id_pergunta: "fact-" seguido de 3 ou mais números.
const PADRAO_ID_PERGUNTA = /^fact-[0-9]{3,15}$/;

// O INTEGER do PostgreSQL vai até 2.147.483.647. Acima disso o banco daria erro.
const MAXIMO_INTEGER_DO_BANCO = 2_147_483_647;

// O banco guarda o nome da categoria em no máximo 80 caracteres.
const TAMANHO_MAXIMO_CATEGORIA = 80;

export function validarIdPergunta(valor) {
  if (typeof valor !== 'string' || !PADRAO_ID_PERGUNTA.test(valor)) {
    throw new ErroHttp(400, 'O id da pergunta precisa ter o formato fact-001.');
  }
  return valor;
}

// Aceita o número (2) ou o número escrito como texto ("2"), porque dependendo de como
// o front-end monta o JSON, os dois jeitos podem aparecer. Qualquer outra coisa é recusada.
export function validarIdAlternativa(valor) {
  const numero = typeof valor === 'string' && /^[0-9]{1,10}$/.test(valor) ? Number(valor) : valor;

  if (!Number.isSafeInteger(numero) || numero < 1 || numero > MAXIMO_INTEGER_DO_BANCO) {
    throw new ErroHttp(400, 'O id da alternativa precisa ser um número inteiro positivo.');
  }
  return numero;
}

// A categoria é opcional: sem ela, o sorteio vale para qualquer categoria.
// Quando existe, limpamos os espaços das pontas e conferimos tamanho e caracteres estranhos.
export function validarCategoria(valor) {
  if (valor === null || valor === undefined) return null;

  const nome = String(valor).trim();
  if (nome === '') return null;

  // Caracteres de controle (quebra de linha, byte nulo...) nunca fazem parte do nome de uma categoria.
  // O byte nulo, aliás, faz o PostgreSQL recusar o texto, então melhor barrar aqui.
  if (nome.length > TAMANHO_MAXIMO_CATEGORIA || /[\u0000-\u001F\u007F]/.test(nome)) {
    throw new ErroHttp(400, 'O nome da categoria é inválido.');
  }
  return nome;
}

// Só aceitamos corpo JSON no formato { ... }. Listas, números ou texto solto são recusados.
export function validarCorpoDaResposta(corpo) {
  if (corpo === null || typeof corpo !== 'object' || Array.isArray(corpo)) {
    throw new ErroHttp(400, 'Envie um JSON no formato { "id_pergunta": "fact-001", "id_alternativa": 1 }.');
  }
  return {
    idPergunta: validarIdPergunta(corpo.id_pergunta),
    idAlternativa: validarIdAlternativa(corpo.id_alternativa),
  };
}
