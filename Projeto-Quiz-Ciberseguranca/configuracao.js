// Aqui a gente lê as configurações do projeto (porta, dados do banco etc.).
// Elas vêm de variáveis de ambiente, e não ficam escritas no código por um motivo
// simples: senha de banco dentro do código acaba indo parar no GitHub, e aí todo mundo vê.
import fs from 'node:fs';
import { rootCertificates } from 'node:tls';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const pastaDoBackend = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Em vez de instalar uma biblioteca só pra ler o arquivo ".env", fazemos nós mesmos.
// É pouca coisa: cada linha "CHAVE=valor" vira uma variável de ambiente.
// Se a variável já existe (por exemplo, configurada no servidor de hospedagem), ela vence o arquivo.
function carregarArquivoEnv(caminho) {
  if (!fs.existsSync(caminho)) return;

  for (const linha of fs.readFileSync(caminho, 'utf8').split(/\r?\n/)) {
    const limpa = linha.trim();
    if (!limpa || limpa.startsWith('#')) continue; // linha vazia ou comentário

    const posicaoDoIgual = limpa.indexOf('=');
    if (posicaoDoIgual === -1) continue;

    const chave = limpa.slice(0, posicaoDoIgual).trim();
    let valor = limpa.slice(posicaoDoIgual + 1).trim();

    // Tira as aspas se a pessoa escreveu BANCO_SENHA="minha senha"
    const temAspas =
      (valor.startsWith('"') && valor.endsWith('"')) ||
      (valor.startsWith("'") && valor.endsWith("'"));
    if (temAspas) valor = valor.slice(1, -1);

    if (process.env[chave] === undefined) process.env[chave] = valor;
  }
}

// Converte texto em número. Se vier lixo (ou nada), usa o valor padrão.
function numeroOuPadrao(texto, padrao) {
  const numero = Number.parseInt(texto, 10);
  return Number.isFinite(numero) && numero > 0 ? numero : padrao;
}

export function lerConfiguracao() {
  carregarArquivoEnv(path.join(pastaDoBackend, '.env'));
  const env = process.env;

  // Se a pessoa deu a URL completa do banco, usamos ela e pronto.
  // Senão, montamos a conexão a partir dos campos separados.
  let banco;
  if (env.BANCO_URL || env.POSTGRES_URL) {
    banco = { connectionString: env.BANCO_URL || env.POSTGRES_URL };
  } else {
    // Melhor falhar logo na partida, com uma mensagem clara,
    // do que subir o servidor e só dar erro na primeira pergunta.
    if (!env.BANCO_NOME || !env.BANCO_USUARIO) {
      throw new Error(
        'Faltou configurar o banco. Copie o arquivo ".env.example" para ".env" ' +
          'e preencha BANCO_NOME e BANCO_USUARIO (ou use BANCO_URL).'
      );
    }
    banco = {
      host: env.BANCO_HOST || 'localhost',
      port: numeroOuPadrao(env.BANCO_PORTA, 5432),
      database: env.BANCO_NOME,
      user: env.BANCO_USUARIO,
      password: env.BANCO_SENHA || undefined,
    };
  }

  // O pooler do Supabase usa uma CA própria: valida cadeia e hostname.
  if (banco.connectionString) {
    const conexao = new URL(banco.connectionString);
    if (conexao.hostname.endsWith('.supabase.co') || conexao.hostname.endsWith('.pooler.supabase.com')) {
      for (const chave of ['sslmode','sslcert','sslkey','sslrootcert']) conexao.searchParams.delete(chave);
      banco.connectionString = conexao.toString();
      banco.ssl = { rejectUnauthorized: true, ca: [...rootCertificates, fs.readFileSync(new URL('./supabase-ca.crt', import.meta.url), 'utf8')] };
    }
  }
  // Bancos na nuvem costumam exigir conexão criptografada.
  if (env.BANCO_SSL === 'true' && !banco.ssl) banco.ssl = true;

  return {
    porta: numeroOuPadrao(env.PORTA, 3000),
    corsOrigem: (env.CORS_ORIGEM || '').trim(),
    limiteRequisicoesPorMinuto: numeroOuPadrao(env.LIMITE_REQUISICOES_POR_MINUTO, 120),
    confiarNoProxy: env.CONFIAR_NO_PROXY === 'true' || env.VERCEL === '1',
    banco,
  };
}

