-- Usuário do banco que a API vai usar.
--
-- Por que não usar o "postgres" (o superusuário) direto? Porque a API só LÊ dados:
-- sortear pergunta, conferir resposta, listar categorias. Ela nunca precisa inserir, alterar
-- ou apagar nada. Se um dia alguém descobrir uma brecha na API, o estrago máximo possível
-- fica limitado a "ler" o que já é público. Isso se chama princípio do menor privilégio.
--
-- Como usar (depois de rodar 04-ddl.sql e 05-dml-consultas.sql):
--   1) troque TROQUE_ESTA_SENHA por uma senha forte;
--   2) psql -d tech_trivia -f database/criar-usuario-app.sql   (rode como administrador do banco)
--   3) coloque o mesmo usuário e senha no arquivo backend/.env

CREATE ROLE quiz_app LOGIN PASSWORD 'TROQUE_ESTA_SENHA';

GRANT CONNECT ON DATABASE tech_trivia TO quiz_app;
GRANT USAGE ON SCHEMA public TO quiz_app;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO quiz_app;
