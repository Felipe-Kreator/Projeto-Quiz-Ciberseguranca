# Documentação do Projeto — CyberQuiz

**Projeto:** CyberQuiz — Quiz de Cibersegurança  
**Disciplina:** Projeto Universitário  
**Período:** 2026.2  
**Integrantes:** João, Maria e Felipe  
**Tecnologias previstas:** HTML5, CSS3, JavaScript e PostgreSQL

## 1. Introdução

O CyberQuiz é uma aplicação web educacional destinada a testar e ampliar os conhecimentos dos usuários sobre cibersegurança por meio de perguntas interativas.

A aplicação abordará conceitos de segurança digital, boas práticas de proteção de dados, ameaças cibernéticas e prevenção de ataques. O sistema deverá permitir que os participantes respondam a perguntas, acompanhem seu desempenho e consultem um ranking.

## 2. Objetivos

### 2.1 Objetivo geral

Desenvolver uma aplicação web de quiz sobre cibersegurança que incentive o aprendizado e permita avaliar os conhecimentos dos participantes de forma interativa.

### 2.2 Objetivos específicos

- Desenvolver uma interface intuitiva e acessível.
- Apresentar perguntas sobre diferentes tópicos de cibersegurança.
- Implementar respostas e cálculo de pontuação.
- Armazenar perguntas e resultados.
- Disponibilizar um ranking.
- Separar as responsabilidades do frontend, backend e banco de dados.
- Aplicar boas práticas de segurança durante o desenvolvimento.

## 3. Justificativa

A cibersegurança é relevante diante do crescimento das ameaças digitais e da utilização cotidiana de sistemas conectados. O quiz propõe uma forma interativa de abordar temas como senhas, phishing, proteção de dados e segurança na internet.

O projeto também permite aplicar conhecimentos de desenvolvimento web, lógica de programação, banco de dados, integração de sistemas e segurança da informação.

## 4. Escopo

### 4.1 Funcionalidades previstas

- Tela inicial com apresentação do projeto.
- Início de partidas.
- Exibição de perguntas de múltipla escolha.
- Seleção de alternativas.
- Validação das respostas.
- Cálculo e apresentação da pontuação.
- Registro de resultados.
- Consulta ao ranking.
- Organização de perguntas por categorias ou níveis, conforme decisão da equipe.

### 4.2 Fora do escopo inicial

- Aplicativo nativo para dispositivos móveis.
- Autenticação avançada.
- Geração automática de perguntas por inteligência artificial.
- Multijogador em tempo real.
- Integração com plataformas externas de ensino.
- Painel administrativo avançado.

Esses itens poderão ser avaliados em versões futuras.

## 5. Tecnologias

| Tecnologia | Finalidade |
|---|---|
| HTML5 | Estrutura das páginas |
| CSS3 | Estilização e responsividade |
| JavaScript | Lógica do frontend e backend |
| PostgreSQL | Persistência dos dados |
| Git | Controle de versão |
| GitHub | Colaboração e hospedagem |

O ambiente de execução do backend precisa ser confirmado. JavaScript no navegador não substitui um ambiente de servidor. Node.js é uma possibilidade, mas seu uso deve respeitar as regras da disciplina.

## 6. Arquitetura

A aplicação será organizada em três componentes:

- **Frontend:** apresenta as telas, recebe as interações e comunica-se com o backend.
- **Backend:** disponibiliza operações, consulta perguntas, valida respostas, calcula pontuações e registra resultados.
- **Banco de dados:** armazena perguntas, alternativas, participantes e partidas.

### Fluxo principal

1. O usuário acessa a aplicação.
2. O frontend solicita perguntas ao backend.
3. O backend consulta o banco de dados.
4. As perguntas são apresentadas ao usuário.
5. O usuário envia suas respostas.
6. O backend valida as respostas e calcula a pontuação.
7. O resultado é registrado.
8. O frontend apresenta o resultado e permite consultar o ranking.

## 7. Segurança

A aplicação deverá considerar que os dados enviados pelo frontend podem ser manipulados. A validação da resposta e o cálculo da pontuação devem ocorrer no backend.

Medidas previstas:

- Validar entradas recebidas pelo backend.
- Utilizar consultas parametrizadas para reduzir o risco de SQL Injection.
- Não enviar a resposta correta antes do momento adequado.
- Não armazenar segredos diretamente no código-fonte.
- Retornar apenas as informações necessárias ao frontend.
- Tratar erros sem expor detalhes internos.
- Proteger o acesso ao banco de dados.
- Utilizar HTTPS em ambientes publicados na internet.

## 8. Testes previstos

- Exibição de perguntas e alternativas.
- Seleção de respostas.
- Validação de respostas corretas e incorretas.
- Cálculo da pontuação.
- Registro e consulta de resultados.
- Ordenação do ranking.
- Tratamento de entradas inválidas.
- Comunicação entre frontend, backend e banco de dados.
- Verificação de que respostas corretas não são expostas antecipadamente.

## 9. Resultados esperados

Espera-se entregar uma aplicação funcional que permita testar conhecimentos sobre cibersegurança, visualizar resultados e consultar um ranking. O projeto também deverá demonstrar a aplicação prática de conceitos de programação, banco de dados, integração e desenvolvimento seguro.

## 10. Considerações finais

Esta documentação descreve a proposta inicial do CyberQuiz. Ela deverá ser atualizada ao longo do desenvolvimento para refletir os requisitos confirmados, as decisões técnicas e as funcionalidades efetivamente implementadas.


## 11. Conceito de cibersegurança

Cibersegurança é a área da tecnologia dedicada a identificar vulnerabilidades e falhas de segurança em sistemas, redes, programas, dispositivos e dados, buscando protegê-los contra ataques, danos, roubos e acessos não autorizados.

### 11.1 Pilares da cibersegurança

- **Confidencialidade:** mantém os dados em sigilo, garantindo que somente pessoas autorizadas tenham acesso às informações sensíveis.
- **Integridade:** preserva a exatidão e a completude das informações, evitando alterações ou corrupção não autorizadas.
- **Disponibilidade:** busca assegurar que sistemas, redes e dados estejam acessíveis aos usuários legítimos quando necessário.

Esses três pilares, conhecidos como tríade CIA, servirão como conceitos fundamentais para o conteúdo educacional do CyberQuiz.

## 12. Responsabilidades do banco de dados

O banco de dados será responsável pela persistência e organização das informações utilizadas pela aplicação.

### 12.1 O que o banco de dados armazena

- Informações dos participantes ou usuários, conforme o modelo de identificação adotado.
- Pontuações e resultados.
- Registros de erros, quando definidos como eventos que precisam ser persistidos.
- Perguntas.
- Respostas e alternativas.
- Categorias das perguntas.
- Níveis de dificuldade.
- Explicações associadas às perguntas.

### 12.2 O que não é responsabilidade exclusiva do banco de dados

O banco de dados não será responsável, por si só, por toda a lógica da aplicação. Em particular:

- A lógica principal do quiz será executada pelo backend.
- As condições e regras de negócio serão implementadas na aplicação.
- A integração entre arquivos e componentes será organizada pelo código do projeto.
- A comunicação com o frontend será intermediada pelo backend.

O banco poderá aplicar restrições, relacionamentos, validações e operações SQL para preservar a integridade dos dados. Isso não substitui a lógica de negócio da aplicação.

## 13. Considerações sobre registros de erros

Caso o projeto registre erros, a equipe deverá definir quais eventos serão armazenados e quais informações serão necessárias para diagnóstico. Os registros não devem guardar senhas, tokens ou outros dados sensíveis desnecessários.


## 14. Conteúdo e organização das perguntas

Conforme o minimundo do sistema, as perguntas abordarão temas de cibersegurança, como phishing, senhas, malware, privacidade e segurança em redes.

Cada pergunta deverá conter um enunciado e estar relacionada a uma categoria, a um idioma, a uma fonte de referência e a um publicador. Também deverá possuir alternativas, com identificação de uma ou mais opções corretas.

A quantidade de alternativas não será fixa. O sistema deverá permitir ampliar o número de opções de uma pergunta sem exigir mudanças estruturais a cada nova quantidade.

O minimundo completo e a identificação inicial das entidades estão registrados em `minimundo.md`. A modelagem conceitual correspondente está descrita em `banco-de-dados.md`.
