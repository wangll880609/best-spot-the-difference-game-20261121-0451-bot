// Every tuning number and colour in one place. The playfield is a fixed 1280x720 logical area;
// the renderer scales it to the window, so no rule below depends on the screen size.
export const FIELD = { width: 1280, height: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second whatever the display's rate. */
export const STEP = 1 / 60;

// The two picture panels, side by side. Each scene is drawn in a 600x560 box.
export const PANEL = { width: 600, height: 560, top: 72, gap: 40, leftX: 20, rightX: 660 };
export const HUD = { height: 60 };
export const BAR = { top: 644, height: 76 };

export const LEVELS = [
  { name: 'Harbor at Dawn', time: 150 },
  { name: 'Forest Camp', time: 150 },
  { name: 'Clockwork Attic', time: 180 },
];

export const DIFFS_PER_LEVEL = 7;
export const FIND_POINTS = 100;
export const COMBO_BONUS = 25;
export const WRONG_PENALTY = 25;
export const WRONG_TIME = 3;
export const HINTS_PER_LEVEL = 3;
export const HINT_COST = 50;
export const HINT_SHOW_SECONDS = 2.5;

export const PALETTE = {
  backdrop: '#141821',
  hud: '#1d2330',
  panelFrame: '#2c3547',
  panelLabel: '#0f1420',
  text: '#f2f0e6',
  muted: '#9aa3b5',
  gold: '#ffd34d',
  goldDark: '#c9920e',
  green: '#7ddc8a',
  red: '#ff6b5e',
  amber: '#ffb347',
  button: '#2e3a52',
  buttonEdge: '#4a5a78',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

export const BEST_KEY = 'twin-lanterns.best';
