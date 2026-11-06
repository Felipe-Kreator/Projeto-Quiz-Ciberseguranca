# Modelagem Conceitual do Banco de Dados — CyberQuiz

## 1. Objetivo

Este documento registra as entidades e os relacionamentos identificados no minimundo do Quiz de Cibersegurança. A descrição está no nível conceitual e não define comandos SQL nem tipos físicos de implementação.

## 2. Entidades identificadas

### Pergunta
Representa uma questão do quiz.

Atributos identificados no minimundo:
- Enunciado.

### Categoria
Representa o tema da pergunta, como phishing, senhas, malware, privacidade ou segurança em redes.

### Fonte
Representa a referência utilizada para indicar a origem ou fundamentação da informação da pergunta.

### Publicador
Representa quem é responsável por cadastrar ou publicar o conteúdo da pergunta.

### Idioma
Representa o idioma associado à pergunta.

### Alternativa
Representa uma opção de resposta de uma pergunta.

A alternativa também precisa indicar se é considerada correta. Uma pergunta pode ter uma ou mais alternativas corretas, conforme o minimundo.

## 3. Relacionamentos identificados

| Relacionamento | Interpretação inicial |
|---|---|
| Pergunta pertence a Categoria | Cada pergunta pertence a uma categoria. |
| Pergunta está associada a Idioma | Cada pergunta possui um idioma associado. |
| Pergunta contém/usa Fonte | Cada pergunta possui uma fonte de referência. |
| Pergunta é publicada por Publicador | Cada pergunta está vinculada a um publicador. |
| Pergunta possui Alternativa | Uma pergunta possui alternativas de resposta. |

As cardinalidades do lado inverso devem ser confirmadas. Uma interpretação comum é que uma categoria, fonte, idioma ou publicador possa estar associado a várias perguntas, mas isso deve ser validado com quem definiu os requisitos.

## 4. Regra de alternativas

O sistema não deve limitar as perguntas a duas alternativas. Cada pergunta poderá ter três, quatro ou mais opções, sem exigir uma mudança estrutural para cada nova quantidade.

Também deve ser possível identificar uma ou mais alternativas corretas por pergunta. A modelagem deve permitir essa flexibilidade.

## 5. Regras e decisões a confirmar

- Uma pergunta deve ter exatamente uma categoria ou pode pertencer a várias?
- Uma pergunta terá exatamente uma fonte ou poderá ter várias referências?
- Um publicador poderá cadastrar várias perguntas?
- Um idioma poderá ser utilizado por várias perguntas?
- Toda pergunta deverá possuir pelo menos duas alternativas?
- Deve existir pelo menos uma alternativa correta por pergunta?
- Será permitido que todas as alternativas estejam incorretas?
- O sistema armazenará apenas perguntas publicadas ou também rascunhos?
- O que caracteriza um publicador: pessoa, equipe ou organização?

## 6. Separação entre modelo conceitual e implementação

O minimundo e o modelo conceitual descrevem os elementos do domínio e suas relações. A definição de tabelas, chaves, restrições, tipos de dados e comandos SQL pertence às etapas posteriores de modelagem lógica e física.
