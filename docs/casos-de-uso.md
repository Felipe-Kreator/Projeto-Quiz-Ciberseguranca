# Casos de Uso — CyberQuiz

## Atores

- **Participante:** pessoa que responde ao quiz.
- **Visitante:** pessoa que consulta informações públicas, como o ranking.

## UC01 — Iniciar partida

**Ator principal:** Participante.

**Pré-condição:** a aplicação está disponível e existem perguntas cadastradas.

**Fluxo principal:**
1. O participante acessa a tela inicial.
2. Seleciona a opção para iniciar.
3. O frontend solicita o início da partida.
4. O backend seleciona ou recupera as perguntas conforme as regras definidas.
5. O sistema apresenta a primeira pergunta.

**Pós-condição:** uma partida está em andamento.

**Exceção:** se não houver perguntas disponíveis, o sistema informa que não é possível iniciar a partida.

## UC02 — Responder pergunta

**Ator principal:** Participante.

**Pré-condição:** existe uma partida em andamento e uma pergunta está sendo exibida.

**Fluxo principal:**
1. O sistema apresenta a pergunta e as alternativas.
2. O participante seleciona uma alternativa.
3. O frontend envia a escolha ao backend.
4. O backend valida a resposta.
5. O sistema atualiza o progresso.
6. A próxima pergunta é apresentada, se houver.

**Exceções:**
- Se a alternativa enviada for inválida, o backend rejeita a solicitação.
- Se a partida não estiver ativa, o backend não aceita a resposta.

## UC03 — Finalizar partida

**Ator principal:** Participante.

**Pré-condição:** todas as perguntas da partida foram respondidas ou a partida foi encerrada conforme as regras definidas.

**Fluxo principal:**
1. O backend determina o resultado da partida.
2. O backend calcula a pontuação.
3. O resultado é persistido.
4. O frontend solicita ou recebe os dados do resultado.
5. O sistema apresenta o desempenho.

**Pós-condição:** a partida está finalizada e o resultado foi registrado, quando o armazenamento estiver disponível.

## UC04 — Consultar ranking

**Ator principal:** Visitante.

**Pré-condição:** existem resultados registrados.

**Fluxo principal:**
1. O visitante acessa a área de ranking.
2. O frontend solicita os dados ao backend.
3. O backend consulta os resultados.
4. O sistema ordena os registros conforme os critérios definidos.
5. O ranking é apresentado.

**Exceção:** se não houver resultados, o sistema apresenta uma mensagem informativa.

## UC05 — Consultar resultado

**Ator principal:** Participante.

**Pré-condição:** uma partida foi concluída.

**Fluxo principal:**
1. O sistema obtém o resultado da partida.
2. O resultado é apresentado ao participante.
3. O participante pode retornar à tela inicial ou iniciar outra partida, conforme as funcionalidades implementadas.
