// Morning Harbor — Spot the Difference.
// config.js: every fixed number the game runs on. One place, no magic numbers
// scattered through the other files. Times are seconds, points follow the
// rulebook in the README (find 100 + 25 per combo step, miss -25 and -3s,
// hint -50, level bonus 10 points per second left).

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 800;

// The two picture panels. Both are 610 x 600, the exact space the scenes
// in scenes.js draw in, so a difference drawn at (x, y) sits at the same
// place on the left panel and on the right panel.
export const PANEL_WIDTH = 610;
export const PANEL_HEIGHT = 600;
export const PANEL_Y = 76;
export const LEFT_PANEL_X = 20;
export const RIGHT_PANEL_X = 650;
export const HUD_HEIGHT = 64;

// A click counts as a find when it lands within this many pixels of a
// difference's centre (in panel space).
export const FIND_RADIUS = 34;

// One round of the game.
export const LEVEL_SECONDS = 120;
export const HINTS_PER_LEVEL = 3;
export const DIFFERENCES_PER_LEVEL = 7;

// Scoring. Seven clean finds in a row pay
// 100 + 125 + 150 + 175 + 200 + 225 + 250 = 1225.
export const FIND_BASE = 100;
export const FIND_COMBO_STEP = 25;
export const MISS_POINTS = 25;
export const MISS_TIME = 3;
export const HINT_COST = 50;
export const TIME_BONUS_PER_SECOND = 10;

export const BEST_KEY = 'morningHarborBestScore';
export const SCREENS = {
  TITLE: 'title',
  PLAY: 'play',
  PAUSE: 'pause',
  LEVEL: 'level',
  WIN: 'win',
  TIMEOUT: 'timeout',
};
