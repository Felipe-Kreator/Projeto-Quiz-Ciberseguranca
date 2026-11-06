# Banco de dados

Os scripts do banco ficam em `entregas/` (na raiz do repositório):

| Ordem | Arquivo | O que faz |
|---|---|---|
| 1 | `entregas/04-ddl.sql` | Cria as tabelas, as regras de integridade e as alternativas Certo/Errado |
| 2 | `entregas/05-dml-consultas.sql` | Carrega as perguntas de exemplo e mostra as consultas RA01 a RA07 |
| 3 | `database/criar-usuario-app.sql` | Cria o usuário `quiz_app`, que só pode ler, para a API usar |

```bash
createdb tech_trivia
psql -d tech_trivia -v ON_ERROR_STOP=1 -f entregas/04-ddl.sql
psql -d tech_trivia -v ON_ERROR_STOP=1 -f entregas/05-dml-consultas.sql
psql -d tech_trivia -f database/criar-usuario-app.sql    # troque a senha antes!
```
