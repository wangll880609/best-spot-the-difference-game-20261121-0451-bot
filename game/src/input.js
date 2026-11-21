// Morning Harbor — Spot the Difference.
// input.js: mouse and keyboard, translated into game actions. A canvas
// click is mapped back into panel space (the canvas is 1280 x 800 inside,
// whatever size it shows at), and only clicks inside a picture panel
// reach the state. Keys: Space/Enter start or carry on, H hint, P or
// Escape pause, M mute, R restart.

import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  LEFT_PANEL_X,
  PANEL_HEIGHT,
  PANEL_WIDTH,
  PANEL_Y,
  RIGHT_PANEL_X,
  SCREENS,
} from './config.js';
import { advance, clickAt, startGame, togglePause, useHint } from './state.js';
import { ensureAudio, playSound } from './audio.js';

function soundFor(event) {
  if (!event) return null;
  if (event.kind === 'find') return 'find';
  if (event.kind === 'miss') return 'miss';
  if (event.kind === 'hint') return 'hint';
  if (event.kind === 'clear') return 'clear';
  if (event.kind === 'timeout') return 'timeout';
  return null;
}

function panelHit(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const x = ((clientX - rect.left) / rect.width) * CANVAS_WIDTH;
  const y = ((clientY - rect.top) / rect.height) * CANVAS_HEIGHT;
  if (y < PANEL_Y || y > PANEL_Y + PANEL_HEIGHT) return null;
  if (x >= LEFT_PANEL_X && x <= LEFT_PANEL_X + PANEL_WIDTH) {
    return { x: x - LEFT_PANEL_X, y: y - PANEL_Y };
  }
  if (x >= RIGHT_PANEL_X && x <= RIGHT_PANEL_X + PANEL_WIDTH) {
    return { x: x - RIGHT_PANEL_X, y: y - PANEL_Y };
  }
  return null;
}

export function attachInput(canvas, game) {
  canvas.addEventListener('pointerdown', (ev) => {
    ensureAudio();
    if (game.screen === SCREENS.TITLE) {
      startGame(game);
      return;
    }
    if (game.screen === SCREENS.LEVEL) {
      advance(game);
      if (game.screen === SCREENS.WIN) playSound(game, 'win');
      return;
    }
    if (game.screen === SCREENS.WIN || game.screen === SCREENS.TIMEOUT) {
      startGame(game);
      return;
    }
    if (game.screen !== SCREENS.PLAY) return;
    const hit = panelHit(canvas, ev.clientX, ev.clientY);
    if (!hit) return;
    const event = clickAt(game, hit.x, hit.y);
    const sound = soundFor(event);
    if (sound) playSound(game, sound);
  });

  window.addEventListener('keydown', (ev) => {
    if (ev.repeat) return;
    const key = ev.key;
    if (key === ' ' || key === 'Enter') {
      ev.preventDefault();
      ensureAudio();
      if (game.screen === SCREENS.TITLE || game.screen === SCREENS.WIN || game.screen === SCREENS.TIMEOUT) {
        startGame(game);
      } else if (game.screen === SCREENS.LEVEL) {
        advance(game);
        if (game.screen === SCREENS.WIN) playSound(game, 'win');
      }
      return;
    }
    if (key === 'h' || key === 'H') {
      if (game.screen === SCREENS.PLAY) {
        const event = useHint(game);
        if (event) playSound(game, 'hint');
      }
      return;
    }
    if (key === 'p' || key === 'P' || key === 'Escape') {
      if (game.screen === SCREENS.PLAY || game.screen === SCREENS.PAUSE) togglePause(game);
      return;
    }
    if (key === 'm' || key === 'M') {
      game.muted = !game.muted;
      return;
    }
    if (key === 'r' || key === 'R') {
      if (game.screen !== SCREENS.TITLE) startGame(game);
    }
  });
}
