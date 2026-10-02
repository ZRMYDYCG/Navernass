import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer, request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { extname, resolve, sep } from "node:path";

/** 同源代理保留登录 Cookie 和 Agent 流式响应；只监听本机。 */
export async function serveRenderer(directory: string) {
  const backend = new URL(process.env.DESKTOP_BACKEND_URL ?? "http://localhost:3001");
  const mime: Record<string, string> = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".woff2": "font/woff2",
  };
  const server = createServer(async (request, response) => {
    if (request.headers.host !== "localhost:47831") {
      response.writeHead(403).end();
      return;
    }
    if (request.url?.startsWith("/api/")) {
      if (request.headers.origin && request.headers.origin !== "http://localhost:47831") {
        response.writeHead(403).end();
        return;
      }
      const target = new URL(request.url, backend);
      const proxy = (target.protocol === "https:" ? httpsRequest : httpRequest)(
        target,
        {
          method: request.method,
          headers: { ...request.headers, host: backend.host, origin: backend.origin },
        },
        (upstream) => {
          const headers = { ...upstream.headers };
          if (headers["set-cookie"]) {
            headers["set-cookie"] = headers["set-cookie"].map((cookie) =>
              cookie.replace(/;\s*Domain=[^;]+/gi, ""),
            );
          }
          response.writeHead(upstream.statusCode ?? 502, headers);
          upstream.pipe(response);
          response.on("close", () => upstream.destroy());
        },
      );
      proxy.on("error", () => {
        if (!response.headersSent) response.writeHead(502);
        response.end();
      });
      request.pipe(proxy);
      response.on("close", () => proxy.destroy());
      return;
    }
    try {
      const pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
      const file = resolve(directory, `.${pathname === "/" ? "/index.html" : pathname}`);
      if (!file.startsWith(resolve(directory) + sep) || !(await stat(file)).isFile()) {
        response.writeHead(404).end();
        return;
      }
      response.writeHead(200, {
        "content-type": mime[extname(file)] ?? "application/octet-stream",
      });
      createReadStream(file).pipe(response);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise<void>((resolveListen, reject) => {
    server.once("error", reject);
    server.listen(47831, "localhost", resolveListen);
  });
  return server;
}
