// Um erro "com educação": além da mensagem, ele já traz o código HTTP
// que deve ser devolvido (400, 404, 429...). Assim, em qualquer lugar do código
// basta fazer `throw new ErroHttp(404, 'Não achei isso')` e o servidor
// sabe exatamente o que responder para quem chamou.
export class ErroHttp extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.name = 'ErroHttp';
    this.status = status;
  }
}
