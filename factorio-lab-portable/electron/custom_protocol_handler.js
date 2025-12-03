const { Worker } = require("worker_threads");
const path = require("path");

const worker = new Worker(path.join(__dirname, "protocol_worker.js"));
const pending = new Map();
let nextId = 1;

function customProtocolHandler(url) {
  return new Promise((resolve, reject) => {
    const id = nextId++;

    const timeout = setTimeout(() => {
      pending.delete(id);
      reject(new Error("Worker timeout"));
    }, 20000);

    pending.set(id, { resolve, reject, timeout });

    worker.postMessage({ id, url });
  });
}

worker.on("message", (msg) => {
  const { id, buffer, mime, error } = msg;

  const entry = pending.get(id);
  if (!entry) return;

  clearTimeout(entry.timeout);
  pending.delete(id);

  if (error) entry.reject(new Error(error));
  else entry.resolve({ buffer, mime });
});

worker.on("error", (err) => {
  for (const [, entry] of pending) {
    clearTimeout(entry.timeout);
    entry.reject(err);
  }
  pending.clear();
});

worker.on("exit", (code) => {
  const err = new Error(`Worker exited with code ${code}`);
  for (const [, entry] of pending) {
    clearTimeout(entry.timeout);
    entry.reject(err);
  }
  pending.clear();
});

module.exports = { customProtocolHandler };
