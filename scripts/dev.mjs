import http from 'node:http';
import next from 'next';
import chatHandler from '../api/chat.js';

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const app = next({ dev: true, hostname: 'localhost', port });
const handle = app.getRequestHandler();

await app.prepare();

const server = http.createServer(async (req, res) => {
  if (req.url === '/api/chat' || req.url.startsWith('/api/chat?')) {
    let bodyStr = '';
    for await (const chunk of req) {
      bodyStr += chunk;
    }
    try {
      req.body = bodyStr ? JSON.parse(bodyStr) : {};
    } catch {
      req.body = {};
    }
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
    res.json = (data) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
      return res;
    };
    return chatHandler(req, res);
  }

  return handle(req, res);
});

server.listen(port, () => {
  console.log(`> Lyra development server ready on http://localhost:${port}`);
});
