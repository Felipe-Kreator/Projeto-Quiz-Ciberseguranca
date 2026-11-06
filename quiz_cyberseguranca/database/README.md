# Banco de dados

Os scripts do banco devem ser executados nesta ordem:

| Ordem | Arquivo | O que faz |
|---|---|---|
| 1 | `docs/doc_date/templates_origem/04-ddl.sql` | Cria as tabelas, as regras de integridade e as alternativas Certo/Errado |
| 2 | `docs/doc_date/templates_origem/05-dml-consultas.sql` | Carrega as perguntas de exemplo e traz as consultas RA01 a RA07 |
| 3 | `quiz_cyberseguranca/database/criar-usuario-app.sql` | Cria o usuário `quiz_app`, que só pode ler, para a API usar |

> **Atenção:** os arquivos 1 e 2 ainda são os *templates* da disciplina (cheios de `TODO`). Preencha-os com o
> esquema e a carga reais antes de rodar, ou copie-os para uma pasta `entregas/` já completos.
> O esquema usado em produção (Supabase) ainda não está versionado neste repositório.

```bash
createdb tech_trivia
psql -d tech_trivia -v ON_ERROR_STOP=1 -f docs/doc_date/templates_origem/04-ddl.sql
psql -d tech_trivia -v ON_ERROR_STOP=1 -f docs/doc_date/templates_origem/05-dml-consultas.sql
psql -d tech_trivia -f quiz_cyberseguranca/database/criar-usuario-app.sql    # troque a senha antes!
```
