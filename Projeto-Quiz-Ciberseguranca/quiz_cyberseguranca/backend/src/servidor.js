// Ponto de partida: é este arquivo que o "npm start" executa.
// Ele só liga as peças (configuração + aplicação) e coloca o servidor para ouvir.
import { criarAplicacao } from './aplicacao.js';
import { lerConfiguracao } from './configuracao.js';

let configuracao;
try {
  configuracao = lerConfiguracao();
} catch (erro) {
  // Configuração faltando é erro de quem está instalando, então a mensagem tem que ser clara.
  console.error(`\n${erro.message}\n`);
  process.exit(1);
}

const aplicacao = criarAplicacao(configuracao);

aplicacao.servidor.listen(configuracao.porta, async () => {
  console.log(`API do Tech Trivia ouvindo em http://localhost:${configuracao.porta}`);

  // Testamos o banco logo de cara. Se falhar não derrubamos o servidor
  // (o banco pode voltar a qualquer momento), mas avisamos bem alto.
  try {
    await aplicacao.verificarBanco();
    console.log('Conexão com o banco de dados: OK');
  } catch (erro) {
    console.error(`ATENÇÃO: não consegui falar com o banco (${erro.message}). Confira o arquivo .env.`);
  }
});

// Ctrl+C ou o servidor de hospedagem pedindo para desligar: fechamos tudo direitinho.
async function desligar(sinal) {
  console.log(`\nRecebi ${sinal}. Desligando com calma...`);
  try {
    await aplicacao.encerrar();
  } finally {
    process.exit(0);
  }
}
process.on('SIGINT', () => desligar('SIGINT'));
process.on('SIGTERM', () => desligar('SIGTERM'));

// Se uma Promise der erro e ninguém tratar, só registramos. O servidor continua de pé.
process.on('unhandledRejection', (motivo) => {
  console.error('[promessa sem tratamento]', motivo);
});
