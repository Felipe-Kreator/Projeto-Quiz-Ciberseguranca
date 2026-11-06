# Responsabilidades do Banco de Dados e da Aplicação

## Responsabilidades do banco de dados

O banco de dados PostgreSQL será utilizado para armazenar e organizar:

- Informações dos usuários ou participantes.
- Pontuações e resultados.
- Registros de erros que precisem ser persistidos.
- Perguntas.
- Respostas e alternativas.
- Categorias de perguntas.
- Níveis de dificuldade.
- Explicações das perguntas.

O banco também poderá impor chaves, relacionamentos, restrições e validações para preservar a integridade dos dados.

## Responsabilidades do backend

O backend será responsável pela lógica de negócio, incluindo:

- Executar as regras e condições do quiz.
- Validar respostas.
- Calcular pontuações.
- Coordenar operações de leitura e gravação no banco.
- Integrar os componentes da aplicação.
- Receber requisições do frontend e devolver respostas apropriadas.
- Tratar erros e validar os dados recebidos.

## Responsabilidades do frontend

O frontend será responsável pela interface e pela interação com o participante:

- Exibir perguntas e alternativas.
- Receber escolhas do usuário.
- Apresentar progresso, feedback e resultados.
- Comunicar-se com o backend por meio das operações disponibilizadas.

## Limite importante

O banco de dados não executa sozinho a lógica completa da aplicação, não substitui o backend e não se comunica diretamente com o frontend neste desenho arquitetural. Entretanto, ele pode executar operações SQL, restrições, funções ou gatilhos quando isso fizer parte do projeto. A lógica central e a integração permanecem sob responsabilidade do backend.
