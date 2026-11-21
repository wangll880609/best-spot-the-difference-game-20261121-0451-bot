// Play-test Twin Lanterns in a real browser: start, click every difference on the
// left panel, advance through all three levels, and check the win screen. Also probes
// the two hit-test centres the earlier build fixed (moon crater, missing book) and
// verifies a click just outside a difference is a miss.
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';

const BOT = '/home/hatch/workspace/makefun/best-spot-the-difference-game-20261121-0451-bot-r1';
const DIFFS = [
  [[430, 95], [95, 205], [398, 272], [170, 478], [470, 105], [520, 390], [268, 392]],
  [[200, 60], [492, 96], [122, 178], [300, 365], [335, 478], [450, 500], [205, 490]],
  [[300, 110], [340, 445], [492, 271], [530, 424], [129, 330], [480, 92], [120, 115]],
];
// Logical playfield is 1280x720, viewport 1280x800: the canvas is scaled to fit, so the
// scale is min(1280/1280, 800/720) = 1, offset y = (800 - 720) / 2 = 40.
const OX = 0;
const OY = 40;
const server = spawn('node', ['serve.ts', '--port', '8083'], { cwd: BOT, stdio: 'pipe' });
await new Promise((r) => setTimeout(r, 1200));
const browser = await chromium.launch({
  executablePath: '/home/hatch/.cache/ms-playwright/chromium-1187/chrome-linux/chrome',
  args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});
const results = [];
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 200)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
  await page.goto('http://localhost:8083/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const state = () => page.evaluate(() => {
    const w = window.__world;
    return { screen: w.state.screen, level: w.state.level, score: w.state.score, found: [...w.state.found], totalFound: w.state.totalFound };
  });
  // Start the game.
  await page.mouse.click(640, 400);
  await page.waitForTimeout(300);
  let s = await state();
  results.push(`after start: screen=${s.screen} level=${s.level}`);
  // Miss probe: click empty water on level 1 (panel-local 100,500 -> screen 120,540).
  await page.mouse.click(20 + 100 + OX, 72 + 500 + OY);
  await page.waitForTimeout(200);
  s = await state();
  results.push(`miss probe: score=${s.score} (expect 0, penalty floored) found=${s.found.length}`);
  // Click all 7 differences of each level on the LEFT panel (panel origin 20,72).
  for (let level = 0; level < 3; level += 1) {
    for (const [x, y] of DIFFS[level]) {
      await page.mouse.click(20 + x + OX, 72 + y + OY);
      await page.waitForTimeout(120);
    }
    s = await state();
    results.push(`level ${level + 1} done: screen=${s.screen} score=${s.score} totalFound=${s.totalFound}`);
    if (s.screen === 'level') {
      await page.mouse.click(640, 400); // advance to next level
      await page.waitForTimeout(300);
      s = await state();
      results.push(`advanced: screen=${s.screen} level=${s.level}`);
    }
  }
  s = await state();
  results.push(`final: screen=${s.screen} score=${s.score} totalFound=${s.totalFound}`);
  results.push(`page errors: ${JSON.stringify(errors)}`);
  console.log(results.join('\n'));
} finally {
  await browser.close();
  server.kill();
}
