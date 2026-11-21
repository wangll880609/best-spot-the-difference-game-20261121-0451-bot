// Capture the four screenshots of Twin Lanterns (real renders, no edits).
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import { statSync } from 'node:fs';

const BOT = '/home/hatch/workspace/makefun/best-spot-the-difference-game-20261121-0451-bot-r1';
const server = spawn('node', ['serve.ts', '--port', '8082'], { cwd: BOT, stdio: 'pipe' });
await new Promise((r) => setTimeout(r, 1200));
const shots = JSON.parse((await import('node:fs')).readFileSync(`${BOT}/shots.json`, 'utf8'));
const errors = [];
const browser = await chromium.launch({
  executablePath: '/home/hatch/.cache/ms-playwright/chromium-1187/chrome-linux/chrome',
  args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});
try {
  for (const { name, query } of shots) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    page.on('pageerror', (e) => errors.push(`${name}: ${e.message.slice(0, 300)}`));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(`${name} console: ${m.text().slice(0, 300)}`); });
    await page.goto(`http://localhost:8082/${query}`, { waitUntil: 'networkidle' });
    try {
      await page.waitForFunction(() => window.__shotReady === true, null, { timeout: 8000 });
    } catch {
      errors.push(`${name}: __shotReady never set`);
    }
    await page.screenshot({ path: `${BOT}/screenshots/${name}`, type: 'jpeg', quality: 82 });
    const st = statSync(`${BOT}/screenshots/${name}`);
    console.log(name, (st.size / 1024).toFixed(1) + ' KiB');
    await page.close();
  }
  console.log('errors:', JSON.stringify(errors));
} finally {
  await browser.close();
  server.kill();
}
