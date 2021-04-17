import regexparam from "regexparam";
import { ExpressRequest } from "./request";
import { ExpressResponse } from "./response";
import { parseParams } from "./utils.js";

export function express() {
  const routes = [];
  let sourceEvent = null;

  async function handleRequest(request) {
    const url = new URL(request.url);
    const method = request.method.toLowerCase();
    let req = null,
      res = null;
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      const regex = regexparam(route.route);
      if (
        (route.method === "*" || route.method === method) &&
        (route.domains ? route.domains.includes(url.hostname) : true) &&
        regex.pattern.test(url.pathname)
      ) {
        if (!res) res = new ExpressResponse(sourceEvent);
        if (!req) {
          req = new ExpressRequest(sourceEvent, {
            params: parseParams(url.pathname, regex),
          });
        } else {
          req.params = parseParams(url.pathname, regex);
        }
        req.route = route.route;
        await routes[i].callback(req, res);
        if (res.response) return res.response;
      }
    }
    return new Response("not found", { status: 404 });
  }

  function addRouteHandlers(route, callback, method, domains) {
    routes.push({
      route,
      callback,
      method,
      domains: domains && (Array.isArray(domains) ? domains : [domains]),
    });
  }

  const methods = {
    use: (callback) => {
      addRouteHandlers("*", callback, "*");
    },
    all: (route, callback) => {
      addRouteHandlers(route, callback, "*");
    },
    get: (route, callback) => {
      addRouteHandlers(route, callback, "get");
    },
    put: (route, callback) => {
      addRouteHandlers(route, callback, "put");
    },
    post: (route, callback) => {
      addRouteHandlers(route, callback, "post");
    },
    delete: (route, callback) => {
      addRouteHandlers(route, callback, "delete");
    },
    domain: (domains) => {
      return {
        use: (callback) => {
          addRouteHandlers("*", callback, "*", domains);
        },
        all: (route, callback) => {
          addRouteHandlers(route, callback, "*", domains);
        },
        get: (route, callback) => {
          addRouteHandlers(route, callback, "get", domains);
        },
        put: (route, callback) => {
          addRouteHandlers(route, callback, "put", domains);
        },
        post: (route, callback) => {
          addRouteHandlers(route, callback, "post", domains);
        },
        delete: (route, callback) => {
          addRouteHandlers(route, callback, "delete", domains);
        },
      };
    },
    listen: () => {
      addEventListener("fetch", (event) => {
        sourceEvent = event;
        event.respondWith(handleRequest(event.request));
      });
    },
  };

  return methods;
}
