# CyberQuiz — Quiz de Cibersegurança

Projeto acadêmico de uma aplicação web educacional para testar e ampliar conhecimentos sobre cibersegurança por meio de perguntas de Certo/Errado, com explicação e fonte de referência a cada resposta.

**Período:** 2026.2  
**Integrantes:** João, Maria e Felipe  
**Publicação:** https://projeto-interdisciplinar-dun.vercel.app

## Sobre o projeto

O quiz sorteia perguntas sobre segurança digital (senhas, phishing, malware, privacidade, redes), confere a resposta no servidor e mostra uma explicação com a fonte. O placar da partida fica no navegador; o banco não guarda pontuação nem dados de jogadores.

## Tecnologias

| Tecnologia | Finalidade |
|---|---|
| HTML5, CSS3, JavaScript (ES modules) | Frontend, sem frameworks |
| Node.js 20+ (módulo `http`) | API, sem frameworks |
| PostgreSQL (`pg`) | Persistência das perguntas |
| Vercel + Supabase | Hospedagem e banco em produção |

## Estrutura do repositório

```text
.
├── api/index.js                 função serverless da Vercel (reutiliza o backend)
├── scripts/build.mjs            copia o frontend para public/ no deploy
├── vercel.json                  configuração de deploy
├── package.json                 scripts da raiz (build e testes)
├── docs/                        documentação do projeto
│   └── doc_date/                templates e orientações da disciplina
└── quiz_cyberseguranca/
    ├── frontend/frontend/       interface (index.html, css/, js/, img/)
    ├── backend/                 API Node.js (src/, teste/, .env.example)
    └── database/                scripts do banco
```

## Como rodar localmente

```bash
# 1. Banco: veja quiz_cyberseguranca/database/README.md
# 2. API
cd quiz_cyberseguranca/backend
npm install
cp .env.example .env        # preencha com os dados do seu banco
npm start                   # http://localhost:3000

# 3. Frontend: sirva a pasta quiz_cyberseguranca/frontend/frontend
#    (ex.: extensão Live Server do VS Code, porta 5500) e coloque
#    CORS_ORIGEM=http://localhost:5500 no .env
```

Testes: `npm test` dentro de `quiz_cyberseguranca/backend` (precisam do PostgreSQL carregado).

## Documentação

- [Minimundo](docs/minimundo.md)
- [Documentação geral](docs/documentacao.md)
- [Requisitos](docs/requisitos.md)
- [Arquitetura](docs/arquitetura.md)
- [Banco de dados](docs/banco-de-dados.md)
- [Casos de uso](docs/casos-de-uso.md)
- [Conceitos de cibersegurança](docs/conceitos-ciberseguranca.md)
- [Responsabilidades do banco e da aplicação](docs/responsabilidades-banco-e-aplicacao.md)
- [Integração Vercel + Supabase](docs/INTEGRACAO-VERCEL.md)
- [README do backend](quiz_cyberseguranca/backend/README.md)

## Segurança

Validação de entrada no backend, consultas parametrizadas, gabarito nunca enviado junto com a pergunta, limite de requisições, cabeçalhos de segurança, CORS restrito, erros genéricos para o usuário e segredos fora do Git (`.env` no `.gitignore`). A API usa um usuário de banco somente leitura.

## Equipe

| Integrante | Responsabilidades |
|---|---|
| João | Backend e apoio à documentação técnica |
| Maria | Frontend e interface |
| Felipe | Banco de dados, integração, documentação geral e organização do repositório |

## Status

Aplicação funcional e publicada. Pendente: versionar o esquema/carga reais do banco em `04-ddl.sql` e `05-dml-consultas.sql`, que ainda são templates.

## Licença

A licença do projeto deve ser definida pela equipe e registrada em um arquivo `LICENSE`.
