# Arquitetura do CyberQuiz

## 1. Visão geral

A arquitetura proposta separa a aplicação em frontend, backend e banco de dados.

```text
[Usuário]
    |
    v
[Frontend: HTML, CSS e JavaScript]
    |
    | Requisições HTTP
    v
[Backend: JavaScript em ambiente servidor]
    |
    | Consultas e operações
    v
[Banco de dados: PostgreSQL]
```

## 2. Frontend

Responsabilidades:

- Apresentar as telas e os componentes visuais.
- Exibir perguntas e alternativas.
- Capturar as escolhas do usuário.
- Mostrar progresso e resultado.
- Solicitar dados ao backend.
- Apresentar mensagens de erro de forma compreensível.

Tecnologias previstas: HTML5, CSS3 e JavaScript sem frameworks.

## 3. Backend

Responsabilidades:

- Receber e validar requisições.
- Consultar perguntas disponíveis.
- Gerenciar o fluxo da partida.
- Validar respostas.
- Calcular pontuações.
- Registrar resultados.
- Fornecer dados para o ranking.
- Tratar erros e controlar o acesso ao banco.

A equipe deverá confirmar qual ambiente de execução JavaScript é permitido pela disciplina. A definição do backend não deve depender de um framework caso a regra seja não utilizar frameworks.

## 4. Banco de dados

O PostgreSQL armazenará os dados persistentes, incluindo perguntas, alternativas, categorias, participantes e partidas.

O modelo inicial está descrito em `banco-de-dados.md`.

## 5. Fluxo de uma partida

1. O frontend solicita o início de uma partida.
2. O backend seleciona as perguntas conforme as regras definidas.
3. O backend envia ao frontend apenas os dados necessários para exibir as perguntas.
4. O usuário responde.
5. O backend valida a resposta e atualiza o estado da partida.
6. Ao finalizar, o backend calcula e registra o resultado.
7. O frontend apresenta o resultado ao usuário.

## 6. Considerações de segurança

- A resposta correta não deve ser enviada antecipadamente ao frontend.
- A pontuação não deve ser aceita cegamente de um valor calculado pelo navegador.
- As consultas ao banco devem ser parametrizadas.
- Credenciais devem ficar fora do controle de versão.
- As operações devem validar identificadores e dados recebidos.

## 7. Decisões pendentes

- Ambiente de execução do backend.
- Forma de comunicação e formato das respostas.
- Estratégia de seleção de perguntas.
- Necessidade de identificação do participante.
- Regras de sessão e persistência de uma partida.
