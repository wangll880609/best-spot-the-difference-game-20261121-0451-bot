// The screenshot scenes behind ?shot=play|start|level2|end. Each one stages a real game
// state — no mock pixels: the panels are the game's own scenes, the markers are the game's
// own found-difference rings, and the counter, timer and score are the game's own HUD.
// The same seed always gives the same frame.
import { SCREEN_LEVEL, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './world.js';

function stageLevel(world, level, foundIds, score, timeLeft) {
  world.resetLevel(level);
  world.state.screen = SCREEN_PLAY;
  world.state.score = score;
  world.state.timeLeft = timeLeft;
  for (const id of foundIds) world.state.found.add(id);
  world.state.totalFound = foundIds.length;
  world.state.combo = foundIds.length;
  world.state.bestCombo = Math.max(world.state.bestCombo, foundIds.length);
  world.state.recentFind = foundIds.length > 0 ? foundIds[foundIds.length - 1] : -1;
  world.state.recentFindAt = 0;
  world.state.elapsed = 1;
  return world.state;
}

/**
 * Set `world` to the named scene and return the screen to draw. Unknown names are the
 * title scene. The shots, in the order the files are named:
 *  play   — level 1 mid-hunt: 3 found (ringed), 4 still hidden, counter on 4;
 *  start  — the title screen over the untouched harbor scene;
 *  level2 — level 2 mid-hunt: 2 found, 5 hidden, a second scene on show;
 *  end    — the win screen: all three scenes cleared, every difference ringed.
 */
export function stageShot(name, world) {
  if (name === 'play') {
    const state = stageLevel(world, 0, [0, 2, 5], 325, 118);
    state.message = 'Found the jumping fish! +150 (combo x3) — 4 to go.';
    state.messageUntil = 999;
    return { screen: SCREEN_PLAY };
  }
  if (name === 'level2') {
    const state = stageLevel(world, 1, [1, 4], 740, 96);
    state.message = 'Found an extra log! +125 (combo x2) — 5 to go.';
    state.messageUntil = 999;
    return { screen: SCREEN_PLAY };
  }
  if (name === 'end') {
    const state = stageLevel(world, 2, [0, 1, 2, 3, 4, 5, 6], 2140, 42);
    state.totalFound = 21;
    state.bestCombo = 7;
    state.best = 2140;
    state.message = 'All 21 differences found — three scenes cleared!';
    state.messageUntil = 999;
    state.screen = SCREEN_WIN;
    return { screen: SCREEN_WIN };
  }
  if (name === 'level') {
    const state = stageLevel(world, 0, [0, 1, 2, 3, 4, 5, 6], 890, 64);
    state.levelBonus = 640;
    state.totalFound = 7;
    state.screen = SCREEN_LEVEL;
    return { screen: SCREEN_LEVEL };
  }
  world.reset();
  world.state.screen = SCREEN_TITLE;
  world.state.elapsed = 1;
  return { screen: SCREEN_TITLE };
}
