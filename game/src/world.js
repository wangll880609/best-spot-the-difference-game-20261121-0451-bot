// The game's rules and state, with no drawing and no browser in it: the current level, which
// differences are found, score, combo, hints, the countdown, and the screens. step() advances
// the clock; click() resolves one pointer press and returns what happened as bit flags.
import { DIFFS_PER_LEVEL, HINTS_PER_LEVEL, HINT_COST, HINT_SHOW_SECONDS, LEVELS, WRONG_PENALTY, WRONG_TIME, COMBO_BONUS, FIND_POINTS } from './config.js';
import { DIFFS } from './scenes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_LEVEL = 'level';
export const SCREEN_WIN = 'win';
export const SCREEN_OVER = 'over';

export const EVENT_FIND = 1;
export const EVENT_WRONG = 2;
export const EVENT_LEVEL = 4;
export const EVENT_WIN = 8;
export const EVENT_OVER = 16;
export const EVENT_HINT = 32;

export function createWorld() {
  const state = {
    screen: SCREEN_TITLE,
    level: 0,
    found: new Set(),
    score: 0,
    combo: 0,
    bestCombo: 0,
    hintsLeft: HINTS_PER_LEVEL,
    timeLeft: LEVELS[0].time,
    levelBonus: 0,
    totalFound: 0,
    message: 'Click a difference — or press H for a hint.',
    messageUntil: 0,
    elapsed: 0,
    recentFind: -1,
    recentFindAt: 0,
    wrongFlash: null,
    hintPulse: null,
    hintPulseUntil: 0,
    best: 0,
  };

  function resetLevel(level) {
    state.level = level;
    state.found = new Set();
    state.combo = 0;
    state.hintsLeft = HINTS_PER_LEVEL;
    state.timeLeft = LEVELS[level].time;
    state.levelBonus = 0;
    state.recentFind = -1;
    state.wrongFlash = null;
    state.hintPulse = null;
    state.message = `Level ${level + 1}: ${LEVELS[level].name} — find all ${DIFFS_PER_LEVEL}.`;
    state.messageUntil = state.elapsed + 4;
  }

  function reset() {
    state.score = 0;
    state.totalFound = 0;
    state.bestCombo = 0;
    state.screen = SCREEN_TITLE;
    resetLevel(0);
  }

  function setMessage(text, seconds) {
    state.message = text;
    state.messageUntil = state.elapsed + (seconds ?? 3);
  }

  /** Advance the countdown while playing; returns EVENT_OVER when time runs out. */
  function step(dt) {
    state.elapsed += dt;
    if (state.screen !== SCREEN_PLAY) return 0;
    state.timeLeft -= dt;
    if (state.timeLeft <= 10 && state.timeLeft + dt > 10) setMessage('Hurry — ten seconds left!', 2);
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.screen = SCREEN_OVER;
      return EVENT_OVER;
    }
    return 0;
  }

  function remaining() {
    return DIFFS_PER_LEVEL - state.found.size;
  }

  /**
   * Resolve a click at panel-local coordinates (x, y) on panel `side` (0 left, 1 right).
   * A click within a difference's radius finds it; anywhere else in a panel is a miss.
   */
  function click(x, y) {
    if (state.screen !== SCREEN_PLAY) return 0;
    const diffs = DIFFS[state.level];
    for (let i = 0; i < diffs.length; i += 1) {
      const d = diffs[i];
      const dx = x - d.x;
      const dy = y - d.y;
      if (dx * dx + dy * dy <= d.r * d.r) {
        if (state.found.has(i)) {
          setMessage(`Already found: ${d.label}.`, 2);
          return 0;
        }
        state.found.add(i);
        state.totalFound += 1;
        state.combo += 1;
        state.bestCombo = Math.max(state.bestCombo, state.combo);
        const points = FIND_POINTS + COMBO_BONUS * (state.combo - 1);
        state.score += points;
        state.recentFind = i;
        state.recentFindAt = state.elapsed;
        state.hintPulse = null;
        if (state.found.size === DIFFS_PER_LEVEL) {
          state.levelBonus = Math.round(state.timeLeft) * 10;
          state.score += state.levelBonus;
          if (state.level === LEVELS.length - 1) {
            state.screen = SCREEN_WIN;
            return EVENT_FIND | EVENT_WIN;
          }
          state.screen = SCREEN_LEVEL;
          return EVENT_FIND | EVENT_LEVEL;
        }
        setMessage(`Found ${d.label}! +${points}${state.combo > 1 ? ` (combo x${state.combo})` : ''} — ${remaining()} to go.`, 3);
        return EVENT_FIND;
      }
    }
    // A miss: points and time lost, combo broken.
    state.score = Math.max(0, state.score - WRONG_PENALTY);
    state.timeLeft = Math.max(0, state.timeLeft - WRONG_TIME);
    state.combo = 0;
    state.wrongFlash = { x, y, at: state.elapsed };
    setMessage(`Not a difference. -${WRONG_PENALTY} points, -${WRONG_TIME}s.`, 2);
    return EVENT_WRONG;
  }

  /** Spend a hint: briefly circle one difference nobody has found yet, on both panels. */
  function useHint() {
    if (state.screen !== SCREEN_PLAY) return 0;
    if (state.hintsLeft <= 0) {
      setMessage('No hints left on this level.', 2);
      return 0;
    }
    const diffs = DIFFS[state.level];
    const open = [];
    for (let i = 0; i < diffs.length; i += 1) if (!state.found.has(i)) open.push(i);
    if (open.length === 0) return 0;
    const pick = open[Math.floor(open.length / 2)];
    state.hintsLeft -= 1;
    state.score = Math.max(0, state.score - HINT_COST);
    state.hintPulse = pick;
    state.hintPulseUntil = state.elapsed + HINT_SHOW_SECONDS;
    setMessage(`Hint: look near ${diffs[pick].label}. -${HINT_COST} points.`, 3);
    return EVENT_HINT;
  }

  function nextLevel() {
    if (state.screen !== SCREEN_LEVEL) return;
    resetLevel(state.level + 1);
    state.screen = SCREEN_PLAY;
  }

  function startGame() {
    state.score = 0;
    state.totalFound = 0;
    state.bestCombo = 0;
    resetLevel(0);
    state.screen = SCREEN_PLAY;
  }

  reset();
  return { state, reset, resetLevel, startGame, nextLevel, step, click, useHint, remaining };
}
