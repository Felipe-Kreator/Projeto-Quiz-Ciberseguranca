# Back-end — Tech Trivia de Cibersegurança

API em **JavaScript (Node.js)**, **sem frameworks**: usa só o módulo `http` que já vem com o Node e o driver `pg` para falar com o PostgreSQL.

O trabalho dela é ser a ponte entre o navegador e o banco: recebe o pedido, valida, roda a consulta SQL certa e devolve JSON.

## O que você precisa ter

- Node.js 20 ou mais novo (`node -v` mostra a versão)
- PostgreSQL com o banco `tech_trivia` já criado e carregado (veja [`../database/README.md`](../database/README.md))

## Como rodar

```bash
cd quiz_cyberseguranca/backend
npm install                  # instala o "pg", a única dependência
cp .env.example .env         # depois abra o .env e preencha com os dados do seu banco
npm start                    # a API sobe em http://localhost:3000
```

Se tudo deu certo, o terminal mostra:

```
API do Tech Trivia ouvindo em http://localhost:3000
Conexão com o banco de dados: OK
```

Para desenvolver, `npm run dev` reinicia o servidor sozinho a cada alteração no código.
Para rodar os testes: `npm test`.

## Os endereços da API

| Método e rota | O que faz | Requisito |
|---|---|---|
| `GET /api/saude` | Diz se a API e o banco estão vivos | — |
| `GET /api/categorias` | Lista as categorias em ordem alfabética, com a quantidade de perguntas | RA01 |
| `GET /api/pergunta` | Sorteia uma pergunta de qualquer categoria | RA02a, RA03 |
| `GET /api/pergunta?categoria=Redes e criptografia` | Sorteia uma pergunta só daquela categoria | RA02b, RA03 |
| `POST /api/resposta` | Confere a resposta e devolve a explicação e a fonte | RA04, RA05 |
| `GET /api/pergunta/fact-001/explicacao` | Só a explicação e a fonte de uma pergunta | RA05 |
| `GET /api/estatisticas` | Publicadores mais citados e fontes usadas por mais de uma pergunta | RA06, RA07 |

### Exemplos para testar no terminal

```bash
curl http://localhost:3000/api/categorias

curl "http://localhost:3000/api/pergunta?categoria=Redes%20e%20criptografia"

curl -X POST http://localhost:3000/api/resposta \
  -H "Content-Type: application/json" \
  -d '{"id_pergunta": "fact-001", "id_alternativa": 1}'
```

### O que a API devolve

**Sortear pergunta** (repare que a resposta certa **não** vem aqui, de propósito):

```json
{
  "id_pergunta": "fact-006",
  "titulo": "HTTPS",
  "enunciado": "O HTTPS protege a comunicação entre o navegador e o servidor usando criptografia TLS.",
  "categoria": "Redes e criptografia",
  "alternativas": [
    { "id_alternativa": 1, "rotulo": "Certo" },
    { "id_alternativa": 2, "rotulo": "Errado" }
  ]
}
```

**Responder:**

```json
{
  "id_pergunta": "fact-001",
  "id_alternativa_escolhida": 1,
  "acertou": true,
  "alternativa_correta": { "id_alternativa": 1, "rotulo": "Certo" },
  "explicacao": "Quando a aplicação monta consultas SQL juntando texto digitado...",
  "fonte": {
    "titulo": "SQL Injection",
    "url": "https://owasp.org/www-community/attacks/SQL_Injection",
    "publicador": "OWASP Foundation",
    "idioma": "Inglês"
  }
}
```

### Códigos de resposta

| Código | Quando acontece |
|---|---|
| 200 | Deu certo |
| 400 | O pedido veio malformado (id fora do padrão, JSON quebrado...) |
| 404 | Não existe (pergunta, alternativa, categoria ou rota) |
| 405 | A rota existe, mas o método está errado (ex.: GET em `/api/resposta`) |
| 413 | Corpo da requisição grande demais |
| 415 | O POST não veio como `application/json` |
| 429 | Requisições demais em um minuto |
| 503 | O banco de dados está fora do ar |
| 500 | Erro inesperado do nosso lado (a mensagem é genérica de propósito) |

Toda mensagem de erro vem assim: `{ "erro": "texto explicando" }`.

## Como o código está organizado

```text
backend/
├── src/
│   ├── servidor.js           ponto de partida: liga a API e trata o desligamento
│   ├── aplicacao.js          recebe cada requisição, aplica a segurança e escolhe a rota
│   ├── rotas.js              as 6 rotas da API
│   ├── consultas.js          todo o SQL (RA01 a RA07) num lugar só
│   ├── banco.js              conexão com o PostgreSQL
│   ├── validacao.js          confere tudo o que chega de fora
│   ├── utilitarios-http.js   JSON, cabeçalhos de segurança e CORS
│   ├── limitador.js          limite de requisições por minuto
│   ├── configuracao.js       leitura do .env
│   └── erros.js              o erro que já carrega o código HTTP
├── teste/api.test.js         21 testes automáticos
├── .env.example              modelo do arquivo de configuração
└── package.json
```

## Segurança: o que foi feito e por quê

- **SQL Injection:** todas as consultas usam parâmetros (`$1`, `$2`). O que o usuário digita é tratado como dado, nunca como parte do comando.
- **Gabarito protegido:** a rota que sorteia a pergunta nunca envia a resposta correta. Quem decide se acertou é o banco, na hora da resposta.
- **Validação de entrada:** ids, nomes e JSON são conferidos (formato, tamanho, tipo) antes de chegar ao banco.
- **Corpo limitado:** o POST aceita no máximo 10 KB, para ninguém travar o servidor com um arquivo gigante.
- **Limite de requisições:** por padrão, 120 por minuto por pessoa. Passou disso, recebe 429.
- **Erros sem vazamento:** o usuário nunca vê mensagem do banco, caminho de arquivo ou stack trace. O detalhe verdadeiro vai só para o log do servidor.
- **Cabeçalhos de segurança:** `nosniff`, `X-Frame-Options`, `Content-Security-Policy` restrita, `no-store`, sem `X-Powered-By`.
- **CORS restrito:** só o endereço do front-end definido em `CORS_ORIGEM` pode chamar a API pelo navegador.
- **Segredos fora do Git:** senha do banco fica no `.env`, que está no `.gitignore`.
- **Menor privilégio:** a API usa o usuário `quiz_app`, que só pode ler (veja `../database/criar-usuario-app.sql`).
- **Timeouts:** consulta ao banco com mais de 5 segundos é cancelada; cliente lento não fica pendurado para sempre.

### Uma limitação honesta

Como o projeto não tem login nem sessão, a rota `GET /api/pergunta/:id/explicacao` entrega a explicação (que revela a resposta) para quem pedir. O front-end deve chamá-la só **depois** do jogador responder. O jeito mais seguro é usar apenas o `POST /api/resposta`, que já devolve tudo de uma vez.

## Para o front-end

- Fale sempre com a API por `fetch`. O front-end **nunca** acessa o banco.
- Se o front-end rodar em outro endereço (por exemplo, `http://localhost:5500`), coloque esse endereço em `CORS_ORIGEM` no `.env`.
- O placar da partida fica no navegador (o banco não guarda pontuação).

Exemplo de uma rodada:

```js
const API = 'http://localhost:3000/api';

// 1. sortear uma pergunta
const pergunta = await (await fetch(`${API}/pergunta`)).json();

// 2. o jogador clicou em uma alternativa
const resultado = await (
  await fetch(`${API}/resposta`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id_pergunta: pergunta.id_pergunta,
      id_alternativa: pergunta.alternativas[0].id_alternativa,
    }),
  })
).json();

// 3. mostrar o feedback
console.log(resultado.acertou ? 'Acertou!' : 'Errou.', resultado.explicacao);
```

## Hospedagem

O GitHub Pages **não** roda Node.js, então a API precisa de outro lugar (Vercel, Render, Railway...). Em qualquer um deles, configure as variáveis do `.env` no painel do serviço (e use `BANCO_SSL=true` se o banco exigir conexão segura) e `CONFIAR_NO_PROXY=true`.
