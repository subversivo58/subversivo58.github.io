/**
 * @file server.js
 * @description Express static server for local and development hosting, with blocked-path rules.
 * @license The MIT License (MIT) - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2010-2026 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]
 */
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

const BLOCKED_PATHS = new Set([
  '/server.js',
  '/package.json',
  '/package-lock.json',
]);

/**
 * Blocks requests for server files and dependencies, returning the 404 page.
 * @description Blocked paths are server.js, package.json, package-lock.json and anything under /node_modules.
 */
app.use((req, res, next) => {
  if (
    BLOCKED_PATHS.has(req.path) ||
    req.path.startsWith('/node_modules')
  ) {
    return res.status(404).sendFile(path.join(__dirname, '404.html'));
  }
  next();
});

app.use(
  express.static(__dirname, {
    index: 'index.html',
    dotfiles: 'ignore',
    /**
     * Sets the Content-Type header for module and WebAssembly files.
     * @param {express.Response} res
     * @param {string} filePath - Path of the file being served.
     * @description .mjs files are sent as application/javascript and .wasm files as application/wasm.
     */
    setHeaders(res, filePath) {
      if (filePath.endsWith('.mjs')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      } else if (filePath.endsWith('.wasm')) {
        res.setHeader('Content-Type', 'application/wasm');
      }
    },
  })
);

/**
 * Returns the 404 page for any path that was not handled by the previous middleware.
 */
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});
