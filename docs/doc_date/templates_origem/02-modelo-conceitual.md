# Passo 4 — Modelo conceitual

DER na notação de Chen em `entregas/02-conceitual.pdf` (e `.png`). As tabelas abaixo descrevem o mesmo modelo.

## Entidades

| Entidade | Atributos | Identificador |
| --- | --- | --- |
| Pergunta | codigo (fact-001, ...), titulo, enunciado, explicacao | codigo |
| Categoria | nome | nome |
| Fonte | titulo, url | url |
| Publicador | nome | nome |
| Idioma | codigo, descricao | codigo |
| Alternativa | rotulo, valor_logico | rotulo |

O código `fact-001` é o identificador da pergunta (RD08); rótulo e valor lógico ficam na alternativa (RD05); a pergunta aponta a alternativa correta pelo relacionamento "tem como correta" (RD06); uma terceira alternativa é só mais uma ocorrência de Alternativa, e a pergunta não muda (RD07); nome de categoria, nome de publicador e URL aparecem uma vez, fora da pergunta (RD10).

## Relacionamentos

| Relacionamento | Cardinalidade | Justificativa | Requisito |
| --- | --- | --- | --- |
| Pergunta **pertence a** Categoria | Pergunta (1,1) — Categoria (0,N) | Cada pergunta pertence a exatamente uma categoria e uma categoria reúne zero ou várias perguntas. | RD01 |
| Pergunta **cita** Fonte | Pergunta (1,1) — Fonte (0,N) | Cada pergunta cita exatamente uma fonte e a mesma URL pode aparecer em mais de uma pergunta; é obrigatório do lado da pergunta e múltiplo do lado da fonte. | RD02 |
| Fonte **é publicada por** Publicador | Fonte (1,1) — Publicador (0,N) | Toda fonte tem exatamente um publicador, que pode publicar zero ou várias fontes. | RD03 |
| Fonte **é escrita em** Idioma | Fonte (1,1) — Idioma (0,N) | Toda fonte tem exatamente um idioma, que pode qualificar zero ou várias fontes. | RD04 |
| Pergunta **tem como correta** Alternativa | Pergunta (1,1) — Alternativa (0,N) | Cada pergunta indica exatamente uma alternativa correta, e a mesma alternativa (Certo ou Errado) é a correta de várias perguntas. | RD05, RD06 |
