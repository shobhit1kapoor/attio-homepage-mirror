import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'attio');
const base = 'https://attio.com';
const concurrency = 10;
const maxAssetBytes = 30 * 1024 * 1024;
const assetExtensions = /\.(?:css|js|mjs|woff2?|ttf|otf|svg|png|jpe?g|webp|avif|gif|ico|mp4|webm|json)$/i;
const queued = new Set();
const downloaded = new Set();
const imageSources = new Map();
let totalBytes = 0;

await mkdir(root, { recursive: true });

async function fetchResponse(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/135.0 Safari/537.36',
      accept: '*/*',
    },
    redirect: 'follow',
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.byteLength > maxAssetBytes) throw new Error(`Asset exceeds 30 MB limit: ${url}`);
  return { response, bytes };
}

function addPath(rawPath, parentPath = '/') {
  if (!rawPath || /^(?:data:|blob:|#|javascript:)/i.test(rawPath)) return;
  const normalizedPath = rawPath.replaceAll('&amp;', '&');
  const assetPath = normalizedPath.startsWith('static/immutable/') ? `/_next/${normalizedPath}` : normalizedPath;
  let parsed;
  try {
    parsed = new URL(assetPath, `${base}${parentPath}`);
  } catch {
    return;
  }
  if (parsed.origin !== base || !assetExtensions.test(parsed.pathname)) return;
  queued.add(parsed.pathname);
}

function scanResources(text, parentPath) {
  for (const match of text.matchAll(/\/(?:_next)\/[A-Za-z0-9_./-]+/g)) addPath(match[0], parentPath);
  for (const match of text.matchAll(/(?:src|href|poster)=["']([^"']+)["']/gi)) addPath(match[1], parentPath);
  for (const match of text.matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/gi)) addPath(match[1], parentPath);
  for (const match of text.matchAll(/(?:import|from)\s*["']([^"']+\.(?:m?js|css))["']/g)) addPath(match[1], parentPath);
  for (const match of text.matchAll(/["'`]((?:\.\.\/)*static\/immutable\/[A-Za-z0-9_./-]+\.(?:m?js|css))["'`]/g)) {
    addPath(`/_next/${match[1].replace(/^(?:\.\.\/)+/, '')}`, '/');
  }

  for (const match of text.matchAll(/\/_next\/image\?url=([^"'\s<>]+)/g)) {
    const encodedSource = match[1].split(/&(?:amp;)?(?:w|q)=/)[0];
    let source;
    try {
      source = decodeURIComponent(encodedSource.replaceAll('&amp;', '&'));
    } catch {
      continue;
    }
    if (source.startsWith('/_next/')) addPath(source, '/');
    else if (/^https:\/\//i.test(source)) imageSources.set(source, null);
  }
}

const page = await fetchResponse(`${base}/`);
let html = page.bytes.toString('utf8');
scanResources(html, '/');
queued.add('/6fc02418cd5ea04e/script.js');

const downloadedAssets = [];
while (true) {
  const batch = [...queued].filter((item) => !downloaded.has(item)).slice(0, concurrency);
  if (!batch.length) break;
  await Promise.all(batch.map(async (resourcePath) => {
    downloaded.add(resourcePath);
    const { bytes } = await fetchResponse(new URL(resourcePath, base));
    const destination = path.resolve(root, `.${resourcePath}`);
    if (!destination.startsWith(`${root}${path.sep}`)) throw new Error(`Unsafe asset path: ${resourcePath}`);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, bytes);
    totalBytes += bytes.byteLength;
    downloadedAssets.push({ path: resourcePath, bytes: bytes.byteLength, sha256: createHash('sha256').update(bytes).digest('hex') });
    if (/\.(?:css|js|mjs)$/i.test(resourcePath)) scanResources(bytes.toString('utf8'), resourcePath);
  }));
}

const localImageSources = {};
for (const [source] of imageSources) {
  const response = await fetchResponse(source);
  const extension = path.extname(new URL(source).pathname).toLowerCase() || '.bin';
  const name = `${createHash('sha256').update(source).digest('hex').slice(0, 20)}${extension}`;
  const relativePath = `/__attio_media/${name}`;
  const destination = path.resolve(root, `.${relativePath}`);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, response.bytes);
  totalBytes += response.bytes.byteLength;
  localImageSources[source] = relativePath;
  downloadedAssets.push({ path: source, localPath: relativePath, bytes: response.bytes.byteLength, sha256: createHash('sha256').update(response.bytes).digest('hex') });
}

const localHtml = html
  .replace(/\/_next\/image\?url=([^"'\s<>]+)/g, (original, rawQuery) => {
  const encodedSource = rawQuery.split(/&(?:amp;)?(?:w|q)=/)[0];
  let source;
  try {
    source = decodeURIComponent(encodedSource.replaceAll('&amp;', '&'));
  } catch {
    return original;
  }
  if (source.startsWith('/_next/')) return source;
  return localImageSources[source] ?? original;
  })
  .replace(/\bhref=(["'])\/([^"']*)\1/gi, (original, quote, route) => {
    if (!route || route.startsWith('#') || route.startsWith('_next/') || route.startsWith('scripts/') || route.startsWith('favicon.ico')) return original;
    return `href=${quote}${base}/${route}${quote}`;
  });

await writeFile(path.join(root, 'index.html'), localHtml);
await writeFile(path.join(root, 'mirror-manifest.json'), JSON.stringify({
  source: base,
  capturedAt: new Date().toISOString(),
  pageSha256: createHash('sha256').update(page.bytes).digest('hex'),
  assetCount: downloadedAssets.length,
  totalBytes,
  assets: downloadedAssets,
}, null, 2));

console.log(`Mirrored Attio homepage and ${downloadedAssets.length} assets (${(totalBytes / 1024 / 1024).toFixed(1)} MB) into ${root}`);
