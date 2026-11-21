// Morning Harbor — Spot the Difference.
// render.js: everything the player sees, drawn on one canvas. The HUD
// (score, best, combo, clock, found counter, hints), the two picture
// panels with their found markers and hint ring, floating score popups,
// and the six screens: title, play, pause, level clear, win, timeout.
// `now` is seconds; staged screenshots pass 0 so the frame never moves.

import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  DIFFERENCES_PER_LEVEL,
  HUD_HEIGHT,
  LEFT_PANEL_X,
  LEVEL_SECONDS,
  PANEL_HEIGHT,
  PANEL_WIDTH,
  PANEL_Y,
  RIGHT_PANEL_X,
  SCREENS,
} from './config.js';
import { SCENES } from './scenes.js';
import { currentScene, foundCount } from './state.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, font, fill, align = 'left') {
  ctx.font = font;
  ctx.fillStyle = fill;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function checkMark(ctx, x, y, s, color, width) {
  ctx.beginPath();
  ctx.moveTo(x - s * 0.5, y);
  ctx.lineTo(x - s * 0.12, y + s * 0.38);
  ctx.lineTo(x + s * 0.55, y - s * 0.42);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
}

function drawFoundMarker(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.strokeStyle = '#2f9e5f';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(47,158,95,0.18)';
  ctx.fill();
  checkMark(ctx, x, y, r * 0.9, '#2f9e5f', 5);
}

function drawHintRing(ctx, x, y, r, now) {
  const pulse = 1 + 0.12 * Math.sin(now * 5);
  ctx.beginPath();
  ctx.arc(x, y, r * pulse, 0, Math.PI * 2);
  ctx.strokeStyle = '#f2b705';
  ctx.lineWidth = 4;
  ctx.setLineDash([10, 7]);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawPanel(ctx, game, originX, variant, now) {
  const scene = currentScene(game);
  ctx.save();
  roundRect(ctx, originX, PANEL_Y, PANEL_WIDTH, PANEL_HEIGHT, 14);
  ctx.clip();
  ctx.save();
  ctx.translate(originX, PANEL_Y);
  scene.draw(ctx, variant);
  ctx.restore();
  for (const diff of scene.diffs) {
    if (game.found.has(diff.id)) drawFoundMarker(ctx, originX + diff.x, PANEL_Y + diff.y, diff.r);
  }
  if (game.hintedId) {
    const hinted = scene.diffs.find((d) => d.id === game.hintedId);
    if (hinted) drawHintRing(ctx, originX + hinted.x, PANEL_Y + hinted.y, hinted.r + 6, now);
  }
  for (const f of game.floats) {
    ctx.font = 'bold 26px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.strokeText(f.text, originX + f.x, PANEL_Y + f.y - 34);
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, originX + f.x, PANEL_Y + f.y - 34);
  }
  ctx.restore();
  ctx.strokeStyle = '#33414f';
  ctx.lineWidth = 3;
  roundRect(ctx, originX, PANEL_Y, PANEL_WIDTH, PANEL_HEIGHT, 14);
  ctx.stroke();
  const tag = variant ? 'RIGHT' : 'LEFT';
  ctx.fillStyle = 'rgba(20,28,38,0.78)';
  roundRect(ctx, originX + 12, PANEL_Y + 12, 74, 30, 8);
  ctx.fill();
  text(ctx, tag, originX + 49, PANEL_Y + 28, 'bold 16px system-ui, sans-serif', '#ffffff', 'center');
}

function drawHud(ctx, game) {
  ctx.fillStyle = '#1d2a38';
  ctx.fillRect(0, 0, CANVAS_WIDTH, HUD_HEIGHT);
  const scene = currentScene(game);
  text(ctx, 'MORNING HARBOR', 20, 26, 'bold 24px system-ui, sans-serif', '#ffd94d');
  text(ctx, `Scene ${game.levelIndex + 1} of 3 · ${scene.name}`, 20, 50, '15px system-ui, sans-serif', '#bcd0de');
  text(ctx, `SCORE  ${game.score}`, 470, 26, 'bold 22px system-ui, sans-serif', '#ffffff');
  text(ctx, `BEST  ${game.best}`, 470, 50, '15px system-ui, sans-serif', '#bcd0de');
  const comboLabel = game.combo > 1 ? `COMBO x${game.combo}` : 'COMBO —';
  text(ctx, comboLabel, 700, 26, 'bold 20px system-ui, sans-serif', game.combo > 1 ? '#7be3a8' : '#8fa5b5');
  text(ctx, `HINTS  ${'●'.repeat(game.hintsLeft)}${'○'.repeat(3 - game.hintsLeft)}  (H)`, 700, 50, '15px system-ui, sans-serif', '#bcd0de');
  const remain = `${foundCount(game)}/${DIFFERENCES_PER_LEVEL} FOUND`;
  text(ctx, remain, 1000, 26, 'bold 20px system-ui, sans-serif', '#ffffff');
  const secs = Math.max(0, Math.ceil(game.timeLeft));
  const frac = Math.max(0, game.timeLeft / LEVEL_SECONDS);
  ctx.fillStyle = '#0f1822';
  roundRect(ctx, 1000, 40, 220, 14, 7);
  ctx.fill();
  ctx.fillStyle = frac < 0.17 ? '#e2574c' : frac < 0.34 ? '#f2a541' : '#2f9e5f';
  if (frac > 0) {
    roundRect(ctx, 1000, 40, 220 * frac, 14, 7);
    ctx.fill();
  }
  text(ctx, `${secs}s`, 1230, 47, 'bold 16px system-ui, sans-serif', '#ffffff');
}

function drawFooter(ctx, game) {
  ctx.fillStyle = '#1d2a38';
  ctx.fillRect(0, PANEL_Y + PANEL_HEIGHT + 14, CANVAS_WIDTH, CANVAS_HEIGHT - PANEL_Y - PANEL_HEIGHT - 14);
  const keys = 'Click a difference  ·  SPACE start  ·  H hint (−50)  ·  P pause  ·  M sound  ·  R restart';
  text(ctx, keys, 20, CANVAS_HEIGHT - 62, '16px system-ui, sans-serif', '#bcd0de');
  SCENES.forEach((scene, i) => {
    const cx = 1120 + i * 48;
    ctx.beginPath();
    ctx.arc(cx, CANVAS_HEIGHT - 62, 9, 0, Math.PI * 2);
    ctx.fillStyle = i < game.levelIndex || game.screen === SCREENS.WIN ? '#2f9e5f' : i === game.levelIndex ? '#ffd94d' : '#46586a';
    ctx.fill();
    text(ctx, String(i + 1), cx, CANVAS_HEIGHT - 61, 'bold 12px system-ui, sans-serif', '#101820', 'center');
  });
  text(ctx, game.muted ? 'SOUND OFF' : 'SOUND ON', 1120, CANVAS_HEIGHT - 30, '13px system-ui, sans-serif', '#8fa5b5');
}

function dim(ctx) {
  ctx.fillStyle = 'rgba(12,20,28,0.72)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function card(ctx, w, h) {
  const x = (CANVAS_WIDTH - w) / 2;
  const y = (CANVAS_HEIGHT - h) / 2;
  ctx.fillStyle = '#f6f1e6';
  roundRect(ctx, x, y, w, h, 18);
  ctx.fill();
  ctx.strokeStyle = '#33414f';
  ctx.lineWidth = 3;
  ctx.stroke();
  return { x, y };
}

function drawTitle(ctx, game) {
  const scene = SCENES[0];
  ctx.save();
  roundRect(ctx, LEFT_PANEL_X, PANEL_Y, PANEL_WIDTH, PANEL_HEIGHT, 14);
  ctx.clip();
  ctx.save();
  ctx.translate(LEFT_PANEL_X, PANEL_Y);
  scene.draw(ctx, false);
  ctx.restore();
  ctx.restore();
  ctx.save();
  roundRect(ctx, RIGHT_PANEL_X, PANEL_Y, PANEL_WIDTH, PANEL_HEIGHT, 14);
  ctx.clip();
  ctx.save();
  ctx.translate(RIGHT_PANEL_X, PANEL_Y);
  scene.draw(ctx, true);
  ctx.restore();
  ctx.restore();
  ctx.fillStyle = 'rgba(12,20,28,0.45)';
  ctx.fillRect(0, PANEL_Y, CANVAS_WIDTH, PANEL_HEIGHT);
  const { x, y } = card(ctx, 640, 470);
  text(ctx, 'MORNING HARBOR', x + 320, y + 62, 'bold 46px system-ui, sans-serif', '#1d2a38', 'center');
  text(ctx, 'Spot the Difference', x + 320, y + 112, 'bold 26px system-ui, sans-serif', '#c94f42', 'center');
  text(ctx, 'Two pictures. Seven differences. Find them all', x + 320, y + 158, '18px system-ui, sans-serif', '#33414f', 'center');
  text(ctx, 'before the clock runs out.', x + 320, y + 184, '18px system-ui, sans-serif', '#33414f', 'center');
  text(ctx, '3 scenes  ·  7 differences each  ·  120 seconds a scene', x + 320, y + 228, 'bold 17px system-ui, sans-serif', '#1d2a38', 'center');
  text(ctx, 'Find +100, combo +25 a step  ·  Miss −25 and −3s  ·  Hint −50', x + 320, y + 258, '16px system-ui, sans-serif', '#5a6b7a', 'center');
  text(ctx, 'Click with the mouse, or use the keys below.', x + 320, y + 288, '16px system-ui, sans-serif', '#5a6b7a', 'center');
  ctx.fillStyle = '#1d2a38';
  roundRect(ctx, x + 170, y + 318, 300, 54, 12);
  ctx.fill();
  text(ctx, 'SPACE  or  CLICK  to start', x + 320, y + 346, 'bold 19px system-ui, sans-serif', '#ffd94d', 'center');
  text(ctx, game.best > 0 ? `Best score: ${game.best}` : 'No best score yet — be the first.', x + 320, y + 408, '17px system-ui, sans-serif', '#33414f', 'center');
  text(ctx, 'H hint   P pause   M sound   R restart', x + 320, y + 440, '15px system-ui, sans-serif', '#8fa5b5', 'center');
}

function drawPause(ctx) {
  dim(ctx);
  const { x, y } = card(ctx, 460, 240);
  text(ctx, 'PAUSED', x + 230, y + 74, 'bold 40px system-ui, sans-serif', '#1d2a38', 'center');
  text(ctx, 'Take a breath. The clock is stopped.', x + 230, y + 128, '17px system-ui, sans-serif', '#33414f', 'center');
  text(ctx, 'P or Esc to carry on  ·  R to restart', x + 230, y + 178, '16px system-ui, sans-serif', '#5a6b7a', 'center');
}

function drawLevelClear(ctx, game) {
  dim(ctx);
  const scene = currentScene(game);
  const { x, y } = card(ctx, 560, 360);
  text(ctx, 'Scene Clear!', x + 280, y + 62, 'bold 40px system-ui, sans-serif', '#2f9e5f', 'center');
  text(ctx, scene.name, x + 280, y + 106, 'bold 20px system-ui, sans-serif', '#33414f', 'center');
  text(ctx, `Finds  +${game.levelFinds}`, x + 280, y + 158, '20px system-ui, sans-serif', '#1d2a38', 'center');
  text(ctx, `Time bonus  +${game.levelBonus}  (${Math.ceil(game.timeLeft)}s left × 10)`, x + 280, y + 192, '20px system-ui, sans-serif', '#1d2a38', 'center');
  text(ctx, `Scene total  ${game.levelFinds + game.levelBonus}`, x + 280, y + 226, 'bold 22px system-ui, sans-serif', '#1d2a38', 'center');
  text(ctx, `Score so far  ${game.score}`, x + 280, y + 260, '20px system-ui, sans-serif', '#33414f', 'center');
  const next = game.levelIndex + 1 < SCENES.length ? `SPACE for ${SCENES[game.levelIndex + 1].name}` : 'SPACE for the results';
  text(ctx, next, x + 280, y + 312, 'bold 18px system-ui, sans-serif', '#c94f42', 'center');
}

function drawWin(ctx, game) {
  dim(ctx);
  const { x, y } = card(ctx, 620, 470);
  text(ctx, 'You found them all!', x + 310, y + 58, 'bold 40px system-ui, sans-serif', '#2f9e5f', 'center');
  text(ctx, 'Three scenes, twenty-one differences —', x + 310, y + 104, '18px system-ui, sans-serif', '#33414f', 'center');
  text(ctx, 'every difference spotted.', x + 310, y + 130, '18px system-ui, sans-serif', '#33414f', 'center');
  SCENES.forEach((scene, i) => {
    text(ctx, `${scene.name}   ${game.levelTotals[i] ?? 0}`, x + 310, y + 178 + i * 34, '20px system-ui, sans-serif', '#1d2a38', 'center');
  });
  text(ctx, `TOTAL  ${game.score}`, x + 310, y + 296, 'bold 30px system-ui, sans-serif', '#1d2a38', 'center');
  text(ctx, game.score >= game.best && game.score > 0 ? `★ New best: ${game.best} ★` : `Best: ${game.best}`, x + 310, y + 338, 'bold 19px system-ui, sans-serif', '#c94f42', 'center');
  text(ctx, `Best combo x${game.bestCombo}`, x + 310, y + 370, '17px system-ui, sans-serif', '#5a6b7a', 'center');
  text(ctx, 'SPACE or R to play again', x + 310, y + 420, 'bold 18px system-ui, sans-serif', '#1d2a38', 'center');
}

function drawTimeout(ctx, game) {
  dim(ctx);
  const scene = currentScene(game);
  const { x, y } = card(ctx, 560, 340);
  text(ctx, "Time's up!", x + 280, y + 62, 'bold 40px system-ui, sans-serif', '#c94f42', 'center');
  text(ctx, `${scene.name} — you found ${foundCount(game)} of ${DIFFERENCES_PER_LEVEL}`, x + 280, y + 112, '19px system-ui, sans-serif', '#33414f', 'center');
  text(ctx, `Score  ${game.score}`, x + 280, y + 158, 'bold 24px system-ui, sans-serif', '#1d2a38', 'center');
  text(ctx, `Best  ${game.best}`, x + 280, y + 194, '18px system-ui, sans-serif', '#5a6b7a', 'center');
  text(ctx, 'SPACE or R to try again', x + 280, y + 258, 'bold 18px system-ui, sans-serif', '#1d2a38', 'center');
  text(ctx, 'Tip: use H for a hint before the clock runs dry.', x + 280, y + 292, '16px system-ui, sans-serif', '#5a6b7a', 'center');
}

export function drawGame(ctx, game, now) {
  ctx.fillStyle = '#101820';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  if (game.screen === SCREENS.TITLE) {
    drawTitle(ctx, game);
    drawFooter(ctx, game);
    return;
  }
  drawHud(ctx, game);
  drawPanel(ctx, game, LEFT_PANEL_X, false, now);
  drawPanel(ctx, game, RIGHT_PANEL_X, true, now);
  drawFooter(ctx, game);
  if (game.screen === SCREENS.PAUSE) drawPause(ctx);
  else if (game.screen === SCREENS.LEVEL) drawLevelClear(ctx, game);
  else if (game.screen === SCREENS.WIN) drawWin(ctx, game);
  else if (game.screen === SCREENS.TIMEOUT) drawTimeout(ctx, game);
}
