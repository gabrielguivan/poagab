const http = require("http");
const fs = require("fs/promises");
const path = require("path");
const { URL } = require("url");

const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number.parseInt(process.env.PORT || "8080", 10);
const PUBLIC_DIR = path.join(__dirname, "public");

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
  ".webmanifest": "application/manifest+json; charset=utf-8",
};

const server = http.createServer(async (req, res) => {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Metodo nao permitido." });
    return;
  }

  const requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  await serveStaticFile(res, requestUrl.pathname);
});

server.listen(PORT, HOST, () => {
  const hostLabel = HOST === "0.0.0.0" ? "localhost" : HOST;
  console.log(`Servidor pronto em http://${hostLabel}:${PORT}`);
});

async function serveStaticFile(res, pathname) {
  const absolutePath = resolveStaticPath(pathname);

  if (!absolutePath) {
    sendJson(res, 403, { error: "Acesso negado." });
    return;
  }

  try {
    const fileBuffer = await fs.readFile(absolutePath);
    const extension = path.extname(absolutePath).toLowerCase();
    const contentType = MIME_TYPES[extension] || "application/octet-stream";
    const cacheControl =
      extension === ".html"
        ? "no-store"
        : extension === ".woff2"
          ? "public, max-age=31536000, immutable"
          : "public, max-age=600";

    res.writeHead(200, {
      "Cache-Control": cacheControl,
      "Content-Type": contentType,
      "X-Content-Type-Options": "nosniff",
    });
    res.end(fileBuffer);
  } catch (error) {
    if (error && error.code === "ENOENT") {
      sendJson(res, 404, { error: "Arquivo nao encontrado." });
      return;
    }

    sendJson(res, 500, { error: "Falha ao servir recurso estatico." });
  }
}

function resolveStaticPath(pathname) {
  const decodedPath = decodeURIComponent(pathname);
  const requestedPath = decodedPath === "/" ? "/index.html" : decodedPath;
  const normalizedPath = path
    .normalize(requestedPath)
    .replace(/^(\.\.(\/|\\|$))+/, "");
  const absolutePath = path.join(PUBLIC_DIR, normalizedPath);

  if (!absolutePath.startsWith(PUBLIC_DIR)) {
    return null;
  }

  return absolutePath;
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
  });
  res.end(JSON.stringify(payload));
}
