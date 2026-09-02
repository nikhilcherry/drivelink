import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

/**
 * Minimal static server for `dist/` that mirrors vercel.json — cleanUrls
 * (/team resolves team.html) and a 404.html fallback with a real 404 status.
 * `next start` cannot serve an `output: 'export'` build, and a plain static
 * server resolves neither, so audits would test routing the deploy never uses.
 */
const ROOT = 'dist';
const TYPES = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
  '.txt': 'text/plain', '.xml': 'application/xml',
};

const isFile = async (p) => {
  try { return (await stat(p)).isFile(); } catch { return false; }
};

export function serveDist(port = 4321) {
  const server = createServer(async (req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
    for (const candidate of [join(ROOT, path), join(ROOT, path + '.html'), join(ROOT, path, 'index.html')]) {
      if (await isFile(candidate)) {
        res.writeHead(200, { 'Content-Type': TYPES[extname(candidate)] || 'application/octet-stream' });
        return res.end(await readFile(candidate));
      }
    }
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(await readFile(join(ROOT, '404.html')));
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, () => resolve(server));
  });
}
