import { parseCookie } from "./utils.js";

export class ExpressRequest {
  constructor(event, extend) {
    const req = event.request;
    this.event = event;
    this.body = req.body;
    this.bodyUsed = req.bodyUsed;
    this.cf = req.cf;
    this.headers = req.headers;
    this.method = req.method;
    this.redirect = req.redirect;
    this.url = new URL(req.url);

    this.clone = req.clone;
    this.arrayBuffer = req.arrayBuffer;
    this.formData = req.formData;
    this.json = req.json;

    this.cookies =
      req.headers.get("Cookie") && parseCookie(req.headers.get("Cookie"));
    this.ip = req.headers.get("CF-Connecting-IP");
    this.query = Array.from(this.url.searchParams.keys()).reduce(
      (memo, key) => {
        memo[key] = this.url.searchParams.get(key);
        return memo;
      },
      {}
    );

    for (let key in extend) {
      this[key] = extend[key];
    }
  }
}
