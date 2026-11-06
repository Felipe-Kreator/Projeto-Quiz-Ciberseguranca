# Passos 1 a 3 — Contexto, minimundo e requisitos

Marco M1. Copiem para `entregas/01-contexto.md`.

## 1. Introdução e contexto

O CyberQuiz é uma adaptação do Tech Trivia voltada à aprendizagem de cibersegurança por estudantes e usuários da internet, com perguntas sobre senhas, phishing, engenharia social e links maliciosos. O objetivo deste banco de dados é armazenar e organizar perguntas, categorias, idiomas, fontes de referência, publicadores e alternativas, permitindo consultar o conteúdo necessário para apresentar o quiz, identificar as opções corretas e fornecer explicações educativas. A organização das alternativas deverá permitir incluir mais de duas opções por pergunta sem modificar a estrutura do banco.

Escopo. Listem só o que o banco faz e o que fica de fora.

| O banco faz | O banco não faz |
| --- | --- |
| Armazena perguntas, enunciados e explicações educativas. | Não desenha as telas nem controla a navegação do quiz. |
| Organiza perguntas por categoria e idioma. | Não traduz automaticamente os conteúdos. |
| Registra fontes com título, endereço eletrônico e publicador responsável. | Não verifica automaticamente a confiabilidade ou a disponibilidade dos sites de referência. |
| Armazena duas ou mais alternativas por pergunta e identifica quais estão corretas. | Não exige cadastro, senha ou sessão de jogadores. |
| Permite consultar perguntas e alternativas para a aplicação apresentar o quiz e corrigir as respostas. | Não armazena respostas dos jogadores, tentativas, histórico, ranking ou resultados individuais nesta versão. |
| Mantém a integridade dos dados e dos relacionamentos. | Não calcula nem apresenta sozinho o resultado final; essa lógica pertence à aplicação. |

Usuários. Quem usa o sistema e o que cada um faz com os dados. Não criem tabela de usuário se nenhum requisito pedir cadastro, senha ou sessão.

| Usuário | O que faz |
| --- | --- |
| Jogador | Consulta, por meio da aplicação, perguntas e alternativas, seleciona respostas e recebe explicações educativas e resultado. Suas respostas e seu resultado são processados pela aplicação, sem armazenamento permanente no banco nesta versão. |
| Quem cadastra perguntas | Cadastra e revisa categorias, idiomas, publicadores, fontes, perguntas, explicações e alternativas; indica quais alternativas estão corretas e mantém os vínculos entre os dados. Esse papel não implica uma entidade de usuário nem um requisito de autenticação. |

## 2. Minimundo

> Precisamos de um sistema de Quiz sobre Cibersegurança que permita cadastrar e disponibilizar perguntas relacionadas a diferentes temas da área, como phishing, senhas, malware, privacidade e segurança em redes.

>Cada pergunta deverá pertencer a uma categoria, possuir um enunciado, estar associada a um idioma e conter uma fonte de referência, utilizada para indicar a origem ou fundamentação da informação apresentada. As perguntas também deverão estar vinculadas a um publicador, responsável por cadastrar ou publicar aquele conteúdo no sistema.

>Cada pergunta deverá possuir alternativas de resposta, sendo necessário identificar qual ou quais são consideradas corretas. O sistema não deverá limitar uma pergunta a apenas duas alternativas, permitindo que futuramente sejam cadastradas três, quatro ou mais opções sem necessidade de alterar a estrutura do banco de dados.

>Dessa forma, queremos manter as perguntas, categorias, fontes, publicadores, idiomas e alternativas organizados e relacionados, permitindo que o conteúdo do Quiz seja ampliado e atualizado ao longo do tempo.

## 3. Requisitos e regras de negócio

Cada RD01–RD11 e cada RA01–RA07 entra numa linha. Não deixem código de fora.

**Proposta para revisão:** os textos originais de RD01–RD11 e RA01–RA07 não foram fornecidos. As linhas abaixo são requisitos propostos para este projeto; sua correspondência com os códigos da atividade ainda precisa ser conferida com a lista oficial.

| Código | Texto do requisito | Tipo |
| --- | --- | --- |
| RD01 | O banco deverá armazenar perguntas com identificador único, enunciado e explicação educativa. | funcional |
| RD02 | O banco deverá armazenar categorias com identificador único, nome e descrição opcional. | funcional |
| RD03 | Cada pergunta deverá estar vinculada a exatamente uma categoria; uma categoria poderá estar vinculada a zero ou várias perguntas. | regra de negócio |
| RD04 | O banco deverá armazenar idiomas com identificador único, nome e código; cada pergunta deverá estar vinculada a exatamente um idioma, que poderá ser utilizado por zero ou várias perguntas. | regra de negócio |
| RD05 | O banco deverá armazenar fontes de referência com identificador único, título e endereço eletrônico; cada pergunta deverá ter exatamente uma fonte, que poderá fundamentar zero ou várias perguntas. | regra de negócio |
| RD06 | O banco deverá armazenar publicadores com identificador único, nome e tipo, limitado a pessoa ou organização. | regra de negócio |
| RD07 | Cada fonte deverá possuir exatamente um publicador; um publicador poderá ser responsável por zero ou várias fontes. | regra de negócio |
| RD08 | Cada alternativa deverá possuir identificador único, texto e indicação booleana de correção, além de pertencer a exatamente uma pergunta. | regra de negócio |
| RD09 | Cada pergunta disponível para o quiz deverá possuir pelo menos duas alternativas, sem limite máximo fixo de duas opções. | regra de negócio |
| RD10 | Cada pergunta disponível para o quiz deverá possuir pelo menos uma alternativa correta, podendo possuir várias. | regra de negócio |
| RD11 | O banco deverá utilizar PostgreSQL e preservar a integridade: identificadores não poderão se repetir nem ficar nulos; códigos de idioma não poderão se repetir; enunciado e explicação de pergunta, nome de categoria, nome e código de idioma, título e endereço de fonte, nome e tipo de publicador, texto e indicação de correção de alternativa não poderão ficar nulos. Os textos obrigatórios também não poderão ficar vazios. Os vínculos obrigatórios não poderão ficar nulos nem referenciar registros inexistentes. | não funcional |
| RA01 | A aplicação deverá permitir cadastrar e revisar perguntas e seus dados relacionados, verificando as informações obrigatórias antes de disponibilizar cada pergunta no quiz. | funcional |
| RA02 | A aplicação deverá consultar o banco para apresentar o enunciado e as alternativas de cada pergunta do quiz. | funcional |
| RA03 | A aplicação deverá informar quando uma pergunta possuir mais de uma alternativa correta e permitir selecionar várias opções nesse caso. | funcional |
| RA04 | A aplicação deverá comparar as alternativas selecionadas com as corretas; nas questões com várias respostas, deverá considerar acerto quando o conjunto selecionado corresponder exatamente ao conjunto de alternativas corretas. | regra de negócio |
| RA05 | A aplicação deverá apresentar a explicação educativa da pergunta após a confirmação da resposta. | funcional |
| RA06 | A aplicação deverá calcular e apresentar o resultado final com a quantidade de acertos e o percentual de aproveitamento; cada questão correta valerá um ponto. | funcional |
| RA07 | A aplicação deverá permitir jogar sem cadastro, senha ou sessão autenticada, processando respostas e resultado durante o quiz, sem exigir armazenamento permanente desses dados nem tabela de usuário. | funcional |

Não funcional inclui, no mínimo, o SGBD e a integridade (o que não pode duplicar nem ficar nulo).
