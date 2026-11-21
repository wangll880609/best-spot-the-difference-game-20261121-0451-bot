// Morning Harbor — Spot the Difference.
// state.js: the whole game state and every rule that changes it. The
// renderer only reads this; the input layer only calls its methods. All
// scoring lives here so the staged screenshots in shots.js and the live
// game can never disagree about what a score means.
//
// Find: combo rises first, then the find pays 100 + 25 * (combo - 1).
//   1st find 100, 2nd 125, 3rd 150 ... 7th 250, seven in a row 1225.
// Miss (empty click): -25 points (never below 0), -3 seconds, combo lost.
// Hint: -50 points, one of 3 per level, rings one unfound difference.
// Level clear: +10 points per whole second left on the clock.

import {
  BEST_KEY,
  DIFFERENCES_PER_LEVEL,
  FIND_BASE,
  FIND_COMBO_STEP,
  HINT_COST,
  HINTS_PER_LEVEL,
  LEVEL_SECONDS,
  MISS_POINTS,
  MISS_TIME,
  SCREENS,
  TIME_BONUS_PER_SECOND,
} from './config.js';
import { SCENES } from './scenes.js';

export function loadBest() {
  try {
    return Number(window.localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

export function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Private mode or no storage: the best score just lives for the run.
  }
}

export function createGame() {
  return {
    screen: SCREENS.TITLE,
    levelIndex: 0,
    score: 0,
    levelStartScore: 0,
    combo: 0,
    bestCombo: 0,
    hintsLeft: HINTS_PER_LEVEL,
    timeLeft: LEVEL_SECONDS,
    found: new Set(),
    hintedId: null,
    hintTtl: 0,
    floats: [],
    levelTotals: [],
    levelFinds: 0,
    levelBonus: 0,
    best: loadBest(),
    muted: false,
    lastEvent: null,
  };
}

export function currentScene(game) {
  return SCENES[game.levelIndex];
}

export function foundCount(game) {
  return game.found.size;
}

export function levelComplete(game) {
  return game.found.size >= DIFFERENCES_PER_LEVEL;
}

export function startLevel(game, index) {
  game.levelIndex = index;
  game.levelStartScore = game.score;
  game.combo = 0;
  game.hintsLeft = HINTS_PER_LEVEL;
  game.timeLeft = LEVEL_SECONDS;
  game.found = new Set();
  game.hintedId = null;
  game.hintTtl = 0;
  game.floats = [];
  game.levelFinds = 0;
  game.levelBonus = 0;
  game.screen = SCREENS.PLAY;
  game.lastEvent = null;
}

export function startGame(game) {
  game.score = 0;
  game.levelTotals = [];
  game.bestCombo = 0;
  startLevel(game, 0);
}

// A click at panel-space (x, y) on either picture. Returns what happened.
export function clickAt(game, x, y) {
  if (game.screen !== SCREENS.PLAY) return null;
  const scene = currentScene(game);
  let hit = null;
  for (const diff of scene.diffs) {
    const dx = x - diff.x;
    const dy = y - diff.y;
    if (dx * dx + dy * dy <= 34 * 34) {
      hit = diff;
      break;
    }
  }
  if (hit && game.found.has(hit.id)) {
    game.lastEvent = { kind: 'already', id: hit.id, x: hit.x, y: hit.y };
    return game.lastEvent;
  }
  if (hit) {
    game.found.add(hit.id);
    game.combo += 1;
    if (game.combo > game.bestCombo) game.bestCombo = game.combo;
    const gained = FIND_BASE + FIND_COMBO_STEP * (game.combo - 1);
    game.score += gained;
    game.levelFinds += gained;
    game.floats.push({ x: hit.x, y: hit.y, text: `+${gained}`, color: '#2f9e5f', ttl: 1.2 });
    game.lastEvent = { kind: 'find', id: hit.id, gained, x: hit.x, y: hit.y };
    if (levelComplete(game)) {
      game.levelBonus = Math.ceil(game.timeLeft) * TIME_BONUS_PER_SECOND;
      game.score += game.levelBonus;
      game.levelTotals.push(game.levelFinds + game.levelBonus);
      game.screen = SCREENS.LEVEL;
      game.lastEvent = { kind: 'clear', bonus: game.levelBonus };
    }
    return game.lastEvent;
  }
  game.score = Math.max(0, game.score - MISS_POINTS);
  game.timeLeft = Math.max(0, game.timeLeft - MISS_TIME);
  game.combo = 0;
  game.floats.push({ x, y, text: `-${MISS_POINTS}`, color: '#d94f3d', ttl: 1.2 });
  game.lastEvent = { kind: 'miss', x, y };
  if (game.timeLeft <= 0) {
    game.screen = SCREENS.TIMEOUT;
    game.lastEvent = { kind: 'timeout' };
  }
  return game.lastEvent;
}

// Spend one hint: ring one difference the player has not found yet.
export function useHint(game) {
  if (game.screen !== SCREENS.PLAY || game.hintsLeft <= 0) return null;
  const scene = currentScene(game);
  const remaining = scene.diffs.filter((d) => !game.found.has(d.id));
  if (remaining.length === 0) return null;
  const pick = remaining[0];
  game.hintsLeft -= 1;
  game.score = Math.max(0, game.score - HINT_COST);
  game.hintedId = pick.id;
  game.hintTtl = 2.5;
  game.lastEvent = { kind: 'hint', id: pick.id };
  return game.lastEvent;
}

// Advance the clock. Only the play screen ticks.
export function tick(game, dt) {
  if (game.screen !== SCREENS.PLAY) return;
  game.timeLeft -= dt;
  if (game.hintTtl > 0) {
    game.hintTtl -= dt;
    if (game.hintTtl <= 0) game.hintedId = null;
  }
  for (const f of game.floats) f.ttl -= dt;
  game.floats = game.floats.filter((f) => f.ttl > 0);
  if (game.timeLeft <= 0) {
    game.timeLeft = 0;
    game.screen = SCREENS.TIMEOUT;
    game.lastEvent = { kind: 'timeout' };
  }
}

// Move on from a level-clear screen: next level, or the win screen.
export function advance(game) {
  if (game.screen !== SCREENS.LEVEL) return;
  if (game.levelIndex + 1 < SCENES.length) {
    startLevel(game, game.levelIndex + 1);
  } else {
    game.screen = SCREENS.WIN;
    if (game.score > game.best) {
      game.best = game.score;
      saveBest(game.best);
    }
  }
}

export function togglePause(game) {
  if (game.screen === SCREENS.PLAY) game.screen = SCREENS.PAUSE;
  else if (game.screen === SCREENS.PAUSE) game.screen = SCREENS.PLAY;
}
