// Morning Harbor — Spot the Difference.
// main.js: boot the game. With ?shot=title|play|level2|win in the URL the
// page stages that exact frame and renders it once, frozen, for a
// screenshot. Without it, the game runs live: a requestAnimationFrame
// loop ticks the clock and redraws, and the input layer drives the state.

import { CANVAS_HEIGHT, CANVAS_WIDTH } from './config.js';
import { createGame, tick } from './state.js';
import { drawGame } from './render.js';
import { attachInput } from './input.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const status = document.getElementById('status');

function announce(game) {
  if (!status) return;
  const scene = game.screen;
  status.textContent = `Morning Harbor, ${scene} screen, score ${game.score}.`;
}

if (shot) {
  const game = stageShot(shot);
  drawGame(ctx, game, 0);
  announce(game);
  document.title = `Morning Harbor — shot ${shot}`;
} else {
  const game = createGame();
  attachInput(canvas, game);
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    tick(game, dt);
    drawGame(ctx, game, now / 1000);
    announce(game);
    requestAnimationFrame(frame);
  }
  drawGame(ctx, game, 0);
  requestAnimationFrame(frame);
}
