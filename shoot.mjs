// Morning Harbor — Spot the Difference.
// shoot.mjs: take the four screenshots in shots.json. Serves game/ on a
// throwaway local port, opens each ?shot= frame in headless Chromium at
// 1280 x 800, and saves a JPEG per shot into screenshots/. Any console
// error or failed request fails the run: a screenshot must be a real
// render of the game's own code, not a broken page.
//
//   node shoot.mjs
//
// Needs playwright-core and a Chromium build on this machine (the paths
// below are the usual ones for this workspace; edit them if yours differ).

import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { homedir } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const gameRoot = join(here, 'game');
const shots = JSON.parse(await readFile(join(here, 'shots.json'), 'utf8'));

const PW_CANDIDATES = [
  join(here, 'node_modules', 'playwright-core', 'index.mjs'),
  join(homedir(), 'workspace', 'makefun', 'node_modules', 'playwright-core', 'index.mjs'),
];
let chromium = null;
for (const candidate of PW_CANDIDATES) {
  try {
    ({ chromium } = await import(pathToFileURL(candidate).href));
    break;
  } catch {
    // Try the next place playwright-core might live.
  }
}
if (!chromium) throw new Error('playwright-core not found; install it or fix PW_CANDIDATES in shoot.mjs');

const chromePath = join(homedir(), '.cache', 'ms-playwright', 'chromium-1187', 'chrome-linux', 'chrome');
const types = { '.html': 'text/html', '.js': 'text/javascript' };

const server = createServer(async (req, res) => {
  const path = (req.url ?? '/').split('?')[0];
  if (path === '/favicon.ico') {
    res.writeHead(204);
    res.end();
    return;
  }
  try {
    const data = await readFile(join(gameRoot, path === '/' ? 'index.html' : path));
    res.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;

const browser = await chromium.launch({ executablePath: chromePath, args: ['--no-sandbox'] });
try {
  for (const shot of shots) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', (err) => errors.push(String(err)));
    page.on('requestfailed', (req) => errors.push(`request failed: ${req.url()}`));
    await page.goto(`http://127.0.0.1:${port}/index.html${shot.query}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const file = join(here, 'screenshots', shot.name);
    await mkdir(dirname(file), { recursive: true });
    await page.screenshot({ path: file, type: 'jpeg', quality: 85 });
    const bytes = (await readFile(file)).length;
    console.log(`${shot.name}: ${bytes} bytes${bytes > 262144 ? '  OVER 256 KiB!' : ''}`);
    if (errors.length > 0) throw new Error(`${shot.name}: ${errors.join(' | ')}`);
    await page.close();
  }
} finally {
  await browser.close();
  server.close();
}
console.log('shots done');
