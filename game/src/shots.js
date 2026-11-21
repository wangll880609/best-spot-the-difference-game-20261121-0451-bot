// Morning Harbor — Spot the Difference.
// shots.js: the four staged frames the screenshots are taken from. Each
// one is a state the live game can really reach — the numbers below are
// worked out from the scoring rules in state.js, not typed in by feel:
//
//   find pays 100 + 25 * (combo - 1): 100, 125, 150, 175, 200, 225, 250.
//   Seven clean finds = 1225. Level bonus = seconds left x 10.
//
//   play   — scene 1, 3 finds in a row: 100 + 125 + 150 = 375.
//            4 differences still to find, 108s left, combo x3.
//   level2 — scene 1 cleared with 86s left: 1225 + 86 x 10 = 2085.
//            Scene 2, 5 finds in a row: 100+125+150+175+200 = 750.
//            Total 2085 + 750 = 2835, 97s left, combo x5, 2 left to find.
//   win    — scene 2 cleared with 74s left: 1225 + 74 x 10 = 1965.
//            Scene 3 cleared with 91s left: 1225 + 91 x 10 = 2135.
//            Total 2085 + 1965 + 2135 = 6185, the new best score.
//   title  — the fresh title screen, best 0, no game in progress.
//
// The frames are rendered by the game's own renderer, and the clock is
// frozen while a shot is staged, so the same shot always looks the same.

import { SCREENS } from './config.js';
import { SCENES } from './scenes.js';
import { createGame } from './state.js';

function stageLevel(game, levelIndex, foundIds, score, combo, timeLeft, levelStartScore, levelFinds, levelTotals) {
  game.levelIndex = levelIndex;
  game.found = new Set(foundIds);
  game.score = score;
  game.combo = combo;
  game.bestCombo = combo;
  game.timeLeft = timeLeft;
  game.hintsLeft = 3;
  game.levelStartScore = levelStartScore;
  game.levelFinds = levelFinds;
  game.levelTotals = levelTotals;
  game.screen = SCREENS.PLAY;
}

export function stageShot(name) {
  const game = createGame();
  if (name === 'play') {
    const ids = SCENES[0].diffs.slice(0, 3).map((d) => d.id);
    stageLevel(game, 0, ids, 375, 3, 108, 0, 375, []);
    return game;
  }
  if (name === 'level2') {
    const ids = SCENES[1].diffs.slice(0, 5).map((d) => d.id);
    stageLevel(game, 1, ids, 2835, 5, 97, 2085, 750, [2085]);
    return game;
  }
  if (name === 'win') {
    const ids = SCENES[2].diffs.map((d) => d.id);
    stageLevel(game, 2, ids, 6185, 7, 91, 4050, 1225, [2085, 1965, 2135]);
    game.levelBonus = 910;
    game.best = 6185;
    game.screen = SCREENS.WIN;
    return game;
  }
  return game;
}
