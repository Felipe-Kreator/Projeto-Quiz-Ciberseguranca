// A conversa com o PostgreSQL fica toda aqui.
// Usamos um "pool": em vez de abrir e fechar uma conexão a cada pedido (o que é lento),
// o pool mantém algumas conexões abertas e vai emprestando para quem precisa.
import pg from 'pg';

export function criarBanco(configuracaoDoBanco) {
  const pool = new pg.Pool({
    ...configuracaoDoBanco,
    max: 10, // no máximo 10 conexões ao mesmo tempo, o que sobra de sobra para um quiz
    idleTimeoutMillis: 30_000, // conexão parada por 30s é fechada
    connectionTimeoutMillis: 5_000, // se o banco não responde em 5s, desistimos e avisamos
    statement_timeout: 5_000, // nenhuma consulta pode passar de 5s (protege contra consulta travada)
  });

  // Se uma conexão ociosa cair (o banco reiniciou, por exemplo), o pool avisa por aqui.
  // Sem este "ouvinte" o Node derrubaria o servidor inteiro por causa disso.
  pool.on('error', (erro) => {
    console.error('[banco] uma conexão parada deu erro:', erro.message);
  });

  return {
    // Roda um SQL e devolve só as linhas do resultado.
    // IMPORTANTE: os valores sempre vão em `parametros` ($1, $2...), nunca grudados no texto do SQL.
    // É isso que impede SQL Injection: o banco trata o que o usuário digitou como DADO, nunca como comando.
    async consultar(sql, parametros = []) {
      const resultado = await pool.query(sql, parametros);
      return resultado.rows;
    },
    encerrar: () => pool.end(),
  };
}

