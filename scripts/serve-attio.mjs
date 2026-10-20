import { createServer } from 'node:http';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'attio');
const port = Number(process.env.ATTIO_PORT ?? 4174);
const mime = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.gif', 'image/gif'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.mp4', 'video/mp4'],
  ['.otf', 'font/otf'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.ttf', 'font/ttf'],
  ['.webm', 'video/webm'],
  ['.webp', 'image/webp'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
]);

async function sendFile(response, filePath, method) {
  const bytes = await readFile(filePath);
  response.writeHead(200, {
    'content-type': mime.get(path.extname(filePath).toLowerCase()) ?? 'application/octet-stream',
    'content-length': bytes.byteLength,
    'cache-control': filePath.endsWith('index.html') ? 'no-cache' : 'public, max-age=31536000, immutable',
    'x-content-type-options': 'nosniff',
  });
  response.end(method === 'HEAD' ? undefined : bytes);
}

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url ?? '/', `http://127.0.0.1:${port}`);
  if (request.method === 'POST' && ['/api/consent', '/monitoring'].includes(requestUrl.pathname)) {
    request.resume();
    response.writeHead(204, { 'cache-control': 'no-store' }).end();
    return;
  }

  if (!['GET', 'HEAD'].includes(request.method ?? '')) {
    response.writeHead(405, { allow: 'GET, HEAD' }).end();
    return;
  }

  try {
    let pathname = decodeURIComponent(requestUrl.pathname);
    if (pathname === '/') pathname = '/index.html';

    if (pathname === '/_next/image') {
      const source = requestUrl.searchParams.get('url') ?? '';
      if (source.startsWith('/_next/')) pathname = source;
      else if (source.startsWith('/__attio_media/')) pathname = source;
      else {
        response.writeHead(404).end();
        return;
      }
    }

    const resolved = path.resolve(root, `.${pathname}`);
    if (!resolved.startsWith(`${root}${path.sep}`) && resolved !== path.join(root, 'index.html')) {
      response.writeHead(403).end();
      return;
    }

    let filePath = resolved;
    try {
      await access(filePath);
    } catch {
      if (path.extname(pathname)) {
        response.writeHead(404).end();
        return;
      }
      filePath = path.join(root, 'index.html');
    }
    await sendFile(response, filePath, request.method);
  } catch {
    if (!response.headersSent) response.writeHead(400).end();
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Attio snapshot available at http://127.0.0.1:${port}`);
});
