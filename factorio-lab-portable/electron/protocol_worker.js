const { parentPort } = require("worker_threads");
const path = require("path");
const fs = require("fs");

const {
  FactoriolabExactMap,
  FactoriolabBasenameMap,
} = require("./FactoriolabFileMap");

const factoriolabRoot = path.join(__dirname, "../build/factoriolab/browser");

function mimeTypeForExtension(ext) {
  return (
    {
      ".js": "application/javascript",
      ".mjs": "application/javascript",
      ".css": "text/css",
      ".html": "text/html",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
      ".ico": "image/x-icon",
      ".webp": "image/webp",
      ".woff": "font/woff",
      ".woff2": "font/woff2",
      ".ttf": "font/ttf",
      ".otf": "font/otf",
      ".eot": "application/vnd.ms-fontobject",
      ".wasm": "application/wasm",
    }[ext] || "application/octet-stream"
  );
}

async function handleRequest(url) {
  const urlObj = new URL(url);
  let pathname = urlObj.pathname.replace(/^\//, "");

  if (pathname.includes("?")) {
    pathname = pathname.split("?")[0];
  }

  // Exact match
  if (FactoriolabExactMap[pathname]) {
    const realPath = path.join(factoriolabRoot, FactoriolabExactMap[pathname]);
    const data = await fs.promises.readFile(realPath);
    return { buffer: data, mime: mimeTypeForExtension(path.extname(realPath)) };
  }

  // Basename match
  const base = path.basename(pathname);
  if (FactoriolabBasenameMap[base]) {
    const chosen = FactoriolabBasenameMap[base][0];
    const realPath = path.join(factoriolabRoot, chosen);
    const data = await fs.promises.readFile(realPath);
    return { buffer: data, mime: mimeTypeForExtension(path.extname(realPath)) };
  }

  // Fallback index.html
  const indexFile = path.join(factoriolabRoot, "index.html");
  const data = await fs.promises.readFile(indexFile);
  return { buffer: data, mime: "text/html" };
}

parentPort.on("message", async ({ id, url }) => {
  try {
    const result = await handleRequest(url);
    parentPort.postMessage({ id, ...result });
  } catch (err) {
    parentPort.postMessage({ id, error: err.message });
  }
});

process.on("uncaughtException", (err) => {
  parentPort.postMessage({ id: null, error: err.message });
});
