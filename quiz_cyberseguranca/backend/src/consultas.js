// Todas as consultas SQL do projeto moram neste arquivo (RA01 a RA07).
// Deixar o SQL num lugar só ajuda muito: se o banco mudar, sabemos exatamente onde mexer,
// e as rotas ficam limpas, só cuidando de "receber pedido e devolver resposta".
//
// Detalhe que pega muita gente: o PostgreSQL devolve COUNT(*) como texto ("3" e não 3)
// porque o tipo é bigint. Por isso usamos ::int, para chegar ao JavaScript como número de verdade.

export function criarConsultas(banco) {
  return {
    // RA01 — categorias em ordem alfabética, com a quantidade de perguntas de cada uma.
    // Usamos LEFT JOIN para que uma categoria vazia também apareça (com 0 perguntas).
    async listarCategorias() {
      return banco.consultar(`
        SELECT c.id_categoria,
               c.nome,
               COUNT(p.id_pergunta)::int AS qtd_perguntas
          FROM categoria c
          LEFT JOIN pergunta p ON p.id_categoria = c.id_categoria
         GROUP BY c.id_categoria, c.nome
         ORDER BY c.nome
      `);
    },

    // RA02a e RA02b — sorteia uma pergunta.
    // Um truque simpático: o mesmo SQL atende os dois casos.
    // Se $1 vier vazio (null), "$1 IS NULL" é verdadeiro e vale qualquer categoria (RA02a).
    // Se vier um nome, só entram perguntas daquela categoria (RA02b).
    // Repare que a resposta correta NÃO está no SELECT, de propósito.
    async sortearPergunta(nomeDaCategoria) {
      const linhas = await banco.consultar(
        `
        SELECT p.id_pergunta,
               p.titulo,
               p.enunciado,
               c.nome AS categoria
          FROM pergunta p
          JOIN categoria c ON c.id_categoria = p.id_categoria
         WHERE $1::text IS NULL OR c.nome = $1::text
         ORDER BY random()
         LIMIT 1
        `,
        [nomeDaCategoria]
      );
      return linhas[0] ?? null;
    },

    // Só serve para a gente saber, quando o sorteio não achou nada, se foi porque
    // a categoria não existe ou porque ela existe mas ainda está sem perguntas.
    async categoriaExiste(nome) {
      const linhas = await banco.consultar('SELECT 1 FROM categoria WHERE nome = $1', [nome]);
      return linhas.length > 0;
    },

    // RA03 (parte das alternativas) — as opções que o jogador vai ver: Certo e Errado.
    // Mandamos só o id e o rótulo. O valor lógico fica de fora porque não faz falta no navegador.
    async listarAlternativas() {
      return banco.consultar('SELECT id_alternativa, rotulo FROM alternativa ORDER BY id_alternativa');
    },

    // RA04 + RA05 — a conferência da resposta e tudo o que vem junto: explicação e fonte.
    // Quem decide se acertou é o próprio banco: comparamos a alternativa escolhida ($2)
    // com a alternativa correta da pergunta. O navegador nunca recebe o gabarito antes de responder.
    //
    // Quando $2 vem vazio (só consultando a explicação), "acertou" fica null, ou seja, "não se aplica".
    async conferirEExplicar(idPergunta, idAlternativaEscolhida) {
      const linhas = await banco.consultar(
        `
        SELECT p.id_pergunta,
               p.explicacao,
               ($2::int IS NOT NULL AND p.id_alternativa_correta = $2::int) AS acertou_ou_falso,
               ($2::int IS NOT NULL) AS houve_resposta,
               p.id_alternativa_correta,
               ac.rotulo AS rotulo_da_correta,
               f.titulo  AS fonte_titulo,
               f.url     AS fonte_url,
               pu.nome   AS publicador,
               i.descricao AS idioma
          FROM pergunta p
          JOIN alternativa ac ON ac.id_alternativa = p.id_alternativa_correta
          JOIN fonte f        ON f.id_fonte        = p.id_fonte
          JOIN publicador pu  ON pu.id_publicador  = f.id_publicador
          JOIN idioma i       ON i.id_idioma       = f.id_idioma
         WHERE p.id_pergunta = $1
        `,
        [idPergunta, idAlternativaEscolhida]
      );
      return linhas[0] ?? null;
    },

    // Confere se uma alternativa existe de verdade (por exemplo, o id 999 não existe).
    async alternativaExiste(idAlternativa) {
      const linhas = await banco.consultar('SELECT 1 FROM alternativa WHERE id_alternativa = $1', [
        idAlternativa,
      ]);
      return linhas.length > 0;
    },

    // RA06 — publicadores mais citados, do que mais aparece para o que menos aparece.
    // Se der empate, desempatamos pelo nome, só para a ordem não ficar mudando.
    async publicadoresMaisCitados() {
      return banco.consultar(`
        SELECT pu.nome AS publicador,
               COUNT(p.id_pergunta)::int AS qtd_perguntas
          FROM publicador pu
          JOIN fonte f    ON f.id_publicador = pu.id_publicador
          JOIN pergunta p ON p.id_fonte      = f.id_fonte
         GROUP BY pu.id_publicador, pu.nome
         ORDER BY qtd_perguntas DESC, pu.nome
      `);
    },

    // RA07 — fontes que foram usadas por mais de uma pergunta.
    async fontesCitadasMaisDeUmaVez() {
      return banco.consultar(`
        SELECT f.titulo AS fonte,
               f.url,
               COUNT(p.id_pergunta)::int AS qtd_perguntas
          FROM fonte f
          JOIN pergunta p ON p.id_fonte = f.id_fonte
         GROUP BY f.id_fonte, f.titulo, f.url
        HAVING COUNT(p.id_pergunta) > 1
         ORDER BY qtd_perguntas DESC, f.titulo
      `);
    },

    // Usado pela rota /api/saude: um "oi, banco, você está aí?".
    async verificarConexao() {
      await banco.consultar('SELECT 1');
    },
  };
}
