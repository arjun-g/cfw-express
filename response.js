export class ExpressResponse {
  constructor(event) {
    this.statusCode = 200;
    this.headers = new Headers();
    this.cookies = {};
    this.event = event;
  }

  generateResponse(body) {
    Object.keys(this.cookies).forEach((cookie) => {
      let cookieString = `${cookie}=${this.cookies[cookie].value}`;
      const options = this.cookies[cookie].options;
      Object.keys(options).forEach((key) => {
        cookieString += `; ${key}${options[key] ? `=${options[key]}` : ``}`;
      });
      this.headers.append("Set-Cookie", cookieString);
    });
    const response = new Response(body, {
      status: this.statusCode,
      headers: this.headers,
    });
    return response;
  }

  send(body) {
    if (body instanceof Response) {
      this.response = body;
    } else {
      this.response = this.generateResponse(body);
    }
    return this;
  }

  cookie(name, value, options) {
    this.cookies[name] = { value, options };
    return this;
  }

  clearCookie(name) {
    delete this.cookies[name];
    return this;
  }

  json(body) {
    this.set("Content-Type", "application/json");
    this.response = this.generateResponse(JSON.stringify(body));
    return this;
  }

  jsonp(body, fname = "callback") {
    this.set("Content-Type", "application/jsonp");
    this.response = this.generateResponse(`${fname}(${JSON.stringify(body)})`);
    return this;
  }

  redirect(status, path) {
    if (status) this.response = Response.redirect(path, status);
    else this.response = Response.redirect(status, 302);
    return this;
  }

  set(field, value) {
    this.headers.append(field, value);
    return this;
  }

  status(code) {
    this.statusCode = code;
    return this;
  }
}
