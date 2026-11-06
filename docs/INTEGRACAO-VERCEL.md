# Integração Vercel + Supabase

> Nota: os arquivos descritos aqui já estão na estrutura final do repositório (`api/index.js`, `scripts/build.mjs`, `vercel.json` e `quiz_cyberseguranca/`). Não é mais preciso copiá-los manualmente.

Publicação: https://projeto-interdisciplinar-dun.vercel.app
Projeto Vercel: projeto-interdisciplinar
Banco Supabase: Project-for-University---2026.2

Correções: API serverless em api/index.js; build copia a interface para public; frontend chama /api no próprio domínio; configuração aceita POSTGRES_URL já fornecida pela integração Vercel; certificado CA do Supabase com validação de cadeia e hostname.

Sem credenciais neste pacote. As variáveis ficam no painel da Vercel.

IMPORTANTE: a publicação foi feita diretamente na Vercel porque a integração GitHub recusou gravações (403). Copie estes arquivos para a raiz do repositório preservando os demais arquivos e faça commit antes de publicar novamente pelo GitHub. Um deploy do código antigo pode substituir as correções.

Validação: API local com banco de teste, build, saúde online, listagem de categorias e sorteio de perguntas. O banco contém 20 perguntas com explicações e fontes. A interface mantém o projeto original, Certo/Errado e pontuação temporária.

Certificado público: https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt
