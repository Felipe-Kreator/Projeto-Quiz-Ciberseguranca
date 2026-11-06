# Minimundo — Quiz de Cibersegurança

Precisamos de um sistema de Quiz sobre Cibersegurança que permita cadastrar e disponibilizar perguntas relacionadas a diferentes temas da área, como phishing, senhas, malware, privacidade e segurança em redes.

Cada pergunta deverá pertencer a uma categoria, possuir um enunciado, estar associada a um idioma e conter uma fonte de referência, utilizada para indicar a origem ou fundamentação da informação apresentada. As perguntas também deverão estar vinculadas a um publicador, responsável por cadastrar ou publicar aquele conteúdo no sistema.

Cada pergunta deverá possuir alternativas de resposta, sendo necessário identificar qual ou quais são consideradas corretas. O sistema não deverá limitar uma pergunta a apenas duas alternativas, permitindo que futuramente sejam cadastradas três, quatro ou mais opções sem necessidade de alterar a estrutura do banco de dados.

Dessa forma, queremos manter as perguntas, categorias, fontes, publicadores, idiomas e alternativas organizados e relacionados, permitindo que o conteúdo do Quiz seja ampliado e atualizado ao longo do tempo.

## Entidades identificadas diretamente

A partir do minimundo, podem ser identificadas as seguintes entidades:

- **Pergunta:** conteúdo apresentado ao participante.
- **Categoria:** tema ao qual a pergunta pertence.
- **Fonte:** referência que fundamenta ou indica a origem da informação.
- **Publicador:** responsável por cadastrar ou publicar a pergunta.
- **Idioma:** idioma em que a pergunta está disponível.
- **Alternativa:** opção de resposta associada a uma pergunta.

## Relacionamentos sugeridos pelo texto

- Cada pergunta pertence a uma categoria.
- Cada pergunta está associada a um idioma.
- Cada pergunta possui uma fonte de referência.
- Cada pergunta está vinculada a um publicador.
- Cada pergunta possui alternativas.
- Uma ou mais alternativas de uma pergunta podem ser consideradas corretas.

As cardinalidades exatas devem ser confirmadas com as regras do sistema. Por exemplo, o texto indica que uma pergunta possui alternativas, mas não especifica se uma mesma fonte pode fundamentar várias perguntas ou se um publicador pode publicar várias perguntas. Essas interpretações devem ser registradas como decisões de modelagem.

## Observação de escopo

O minimundo descreve o que o sistema precisa oferecer na perspectiva de quem o encomenda. Ele não define tabelas, tipos de dados, comandos SQL, linguagem de programação ou detalhes de implementação.
