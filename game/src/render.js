// Drawing only: the world's state and the current screen in, pixels out. The 1280x720
// playfield is scaled to fit the window and centred, the margin filled with the backdrop
// colour. The two picture panels sit side by side; found differences wear a gold ring and
// a check, the counter says how many are left, and the timer bar shows the pressure.
import { BAR, DIFFS_PER_LEVEL, FIELD, FONT, HUD, LEVELS, PALETTE, PANEL } from './config.js';
import { SCENES, DIFFS } from './scenes.js';
import { SCREEN_LEVEL, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './world.js';

const BUTTONS = {
  hint: { x: 880, y: 652, w: 120, h: 44, label: 'Hint (H)' },
  pause: { x: 1010, y: 652, w: 120, h: 44, label: 'Pause (P)' },
  sound: { x: 1140, y: 652, w: 120, h: 44, label: 'Sound (M)' },
};

/** Hit-test for the bottom-bar buttons, in logical playfield coordinates. */
export function buttonAt(x, y) {
  for (const [name, b] of Object.entries(BUTTONS)) {
    if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return name;
  }
  return null;
}

/** Which panel (0 left, 1 right) a logical point falls in, and its panel-local coords. */
export function panelAt(x, y) {
  if (y < PANEL.top || y > PANEL.top + PANEL.height) return null;
  if (x >= PANEL.leftX && x <= PANEL.leftX + PANEL.width) {
    return { side: 0, x: x - PANEL.leftX, y: y - PANEL.top };
  }
  if (x >= PANEL.rightX && x <= PANEL.rightX + PANEL.width) {
    return { side: 1, x: x - PANEL.rightX, y: y - PANEL.top };
  }
  return null;
}

export function createRenderer(canvas) {
  const context = canvas.getContext('2d');
  const view = { scale: 1, x: 0, y: 0 };

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    const width = Math.round(window.innerWidth * ratio);
    const height = Math.round(window.innerHeight * ratio);
    canvas.width = width;
    canvas.height = height;
    view.scale = Math.min(width / FIELD.width, height / FIELD.height);
    view.x = (width - FIELD.width * view.scale) / 2;
    view.y = (height - FIELD.height * view.scale) / 2;
  }

  const fonts = new Map();
  function text(value, x, y, size, color, align, weight) {
    const key = `${weight ?? ''}${size}`;
    if (!fonts.has(key)) fonts.set(key, `${weight ?? ''}${size}px ${FONT}`);
    context.font = fonts.get(key);
    context.fillStyle = color;
    context.textAlign = align ?? 'left';
    context.textBaseline = 'top';
    context.fillText(value, x, y);
  }

  function roundRect(x, y, w, h, r) {
    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + w, y, x + w, y + h, r);
    context.arcTo(x + w, y + h, x, y + h, r);
    context.arcTo(x, y + h, x, y, r);
    context.arcTo(x, y, x + w, y, r);
    context.closePath();
  }

  function drawMarker(x, y, r, pulse) {
    const rr = pulse ? r * (1 + 0.08 * Math.sin(pulse * 6)) : r;
    context.strokeStyle = PALETTE.gold;
    context.lineWidth = 5;
    context.beginPath();
    context.arc(x, y, rr, 0, Math.PI * 2);
    context.stroke();
    context.strokeStyle = PALETTE.goldDark;
    context.lineWidth = 2;
    context.beginPath();
    context.arc(x, y, rr + 4, 0, Math.PI * 2);
    context.stroke();
    // The check inside the ring.
    context.strokeStyle = PALETTE.gold;
    context.lineWidth = 5;
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(x - r * 0.45, y);
    context.lineTo(x - r * 0.12, y + r * 0.35);
    context.lineTo(x + r * 0.5, y - r * 0.35);
    context.stroke();
  }

  function drawHintPulse(x, y, r, t) {
    const alpha = 0.55 + 0.45 * Math.sin(t * 6);
    context.strokeStyle = `rgba(255, 211, 77, ${alpha.toFixed(2)})`;
    context.lineWidth = 5;
    context.beginPath();
    context.arc(x, y, r * (1 + 0.12 * Math.sin(t * 6)), 0, Math.PI * 2);
    context.stroke();
  }

  function drawPanel(state, side) {
    const ox = side === 0 ? PANEL.leftX : PANEL.rightX;
    const oy = PANEL.top;
    context.save();
    context.translate(ox, oy);
    // Frame and the scene itself.
    context.fillStyle = PALETTE.panelFrame;
    context.fillRect(-4, -4, PANEL.width + 8, PANEL.height + 8);
    context.save();
    context.beginPath();
    context.rect(0, 0, PANEL.width, PANEL.height);
    context.clip();
    SCENES[state.level](context, side);
    context.restore();
    // Found markers and the hint pulse, on both panels alike.
    const diffs = DIFFS[state.level];
    for (let i = 0; i < diffs.length; i += 1) {
      if (!state.found.has(i)) continue;
      const pulse = state.recentFind === i ? state.elapsed - state.recentFindAt : 0;
      drawMarker(diffs[i].x, diffs[i].y, diffs[i].r, state.recentFind === i && pulse < 1 ? pulse : 0);
    }
    if (state.hintPulse !== null && state.elapsed < state.hintPulseUntil) {
      const d = diffs[state.hintPulse];
      drawHintPulse(d.x, d.y, d.r, state.elapsed);
    }
    // A wrong click flashes a red X where it landed.
    if (state.wrongFlash !== null && state.elapsed - state.wrongFlash.at < 0.6) {
      const f = state.wrongFlash;
      const a = 1 - (state.elapsed - f.at) / 0.6;
      context.strokeStyle = `rgba(255, 107, 94, ${a.toFixed(2)})`;
      context.lineWidth = 5;
      context.lineCap = 'round';
      context.beginPath();
      context.moveTo(f.x - 14, f.y - 14);
      context.lineTo(f.x + 14, f.y + 14);
      context.moveTo(f.x + 14, f.y - 14);
      context.lineTo(f.x - 14, f.y + 14);
      context.stroke();
    }
    // The panel's label tab.
    context.fillStyle = 'rgba(15, 20, 32, 0.85)';
    context.fillRect(0, 0, side === 0 ? 190 : 250, 30);
    text(side === 0 ? 'LEFT · ORIGINAL' : 'RIGHT · FIND THE CHANGES', 10, 7, 16, PALETTE.text, 'left', 'bold ');
    context.restore();
  }

  function drawHud(state) {
    context.fillStyle = PALETTE.hud;
    context.fillRect(0, 0, FIELD.width, HUD.height);
    text('TWIN LANTERNS', 20, 16, 26, PALETTE.gold, 'left', 'bold ');
    text('SPOT THE DIFFERENCE', 20, 44, 12, PALETTE.muted, 'left');
    const remain = DIFFS[state.level].length - state.found.size;
    const mm = Math.floor(state.timeLeft / 60);
    const ss = Math.floor(state.timeLeft % 60).toString().padStart(2, '0');
    text(`REMAINING  ${remain}`, 560, 12, 30, remain === 0 ? PALETTE.green : PALETTE.text, 'center', 'bold ');
    text(`LEVEL ${state.level + 1} / ${LEVELS.length} · ${LEVELS[state.level].name} · ${mm}:${ss}`, 560, 44, 13, PALETTE.muted, 'center');
    text(`SCORE  ${state.score}`, 1260, 12, 26, PALETTE.text, 'right', 'bold ');
    text(state.combo > 1 ? `COMBO x${state.combo}` : 'BEST  ' + state.best, 1260, 42, 13, state.combo > 1 ? PALETTE.gold : PALETTE.muted, 'right');
    // The timer bar, green to red as it runs out.
    const frac = Math.max(0, state.timeLeft / LEVELS[state.level].time);
    context.fillStyle = '#0f1420';
    context.fillRect(20, 66, 1240, 6);
    context.fillStyle = frac > 0.5 ? PALETTE.green : frac > 0.25 ? PALETTE.amber : PALETTE.red;
    context.fillRect(20, 66, 1240 * frac, 6);
  }

  function drawBar(state) {
    context.fillStyle = PALETTE.hud;
    context.fillRect(0, BAR.top, FIELD.width, BAR.height);
    // Level pills.
    LEVELS.forEach((level, i) => {
      const x = 20 + i * 150;
      const done = i < state.level || (i === state.level && state.screen === SCREEN_WIN);
      const current = i === state.level && state.screen !== SCREEN_WIN;
      context.fillStyle = done ? PALETTE.green : current ? PALETTE.gold : PALETTE.button;
      roundRect(x, 656, 138, 36, 8);
      context.fill();
      text(`${i + 1} · ${level.name}`, x + 69, 665, 14, done || current ? '#141821' : PALETTE.text, 'center', 'bold ');
    });
    // The message line: only while playing or on the title screen; the overlays of the
    // other screens carry their own words, and a stale find message would linger under them.
    const showMessage = (state.screen === SCREEN_PLAY || state.screen === SCREEN_TITLE) && state.elapsed < state.messageUntil;
    if (showMessage) text(state.message, 480, 662, 16, PALETTE.text, 'left');
    // Buttons.
    for (const [name, b] of Object.entries(BUTTONS)) {
      context.fillStyle = PALETTE.button;
      roundRect(b.x, b.y, b.w, b.h, 8);
      context.fill();
      context.strokeStyle = PALETTE.buttonEdge;
      context.lineWidth = 1;
      context.stroke();
      let label = b.label;
      if (name === 'hint') label = `Hint (${state.hintsLeft})`;
      if (name === 'sound') label = 'Sound: on';
      text(label, b.x + b.w / 2, b.y + 13, 15, PALETTE.text, 'center');
    }
  }

  function drawOverlayPanel(title, lines, prompt, accent) {
    context.fillStyle = 'rgba(10, 14, 22, 0.72)';
    context.fillRect(0, 0, FIELD.width, FIELD.height);
    const w = 620;
    const h = 150 + lines.length * 34;
    const x = (FIELD.width - w) / 2;
    const y = (FIELD.height - h) / 2;
    context.fillStyle = PALETTE.hud;
    roundRect(x, y, w, h, 14);
    context.fill();
    context.strokeStyle = accent ?? PALETTE.gold;
    context.lineWidth = 3;
    context.stroke();
    text(title, FIELD.width / 2, y + 26, 34, accent ?? PALETTE.gold, 'center', 'bold ');
    lines.forEach((lineText, i) => text(lineText, FIELD.width / 2, y + 82 + i * 34, 19, PALETTE.text, 'center'));
    if (prompt) text(prompt, FIELD.width / 2, y + h - 40, 16, PALETTE.muted, 'center');
  }

  function draw(state, audio) {
    resize();
    context.setTransform(view.scale, 0, 0, view.scale, view.x, view.y);
    context.fillStyle = PALETTE.backdrop;
    context.fillRect(0, 0, FIELD.width, FIELD.height);
    drawHud(state);
    drawPanel(state, 0);
    drawPanel(state, 1);
    drawBar(state);
    // The sound button shows the real mute state.
    if (audio !== undefined) {
      context.fillStyle = PALETTE.button;
      roundRect(BUTTONS.sound.x, BUTTONS.sound.y, BUTTONS.sound.w, BUTTONS.sound.h, 8);
      context.fill();
      context.strokeStyle = PALETTE.buttonEdge;
      context.lineWidth = 1;
      context.stroke();
      text(audio.muted ? 'Sound: off' : 'Sound: on', BUTTONS.sound.x + BUTTONS.sound.w / 2, BUTTONS.sound.y + 13, 15, PALETTE.text, 'center');
    }

    if (state.screen === SCREEN_TITLE) {
      drawOverlayPanel('TWIN LANTERNS', [
        'Two pictures. Seven differences. Find them all.',
        'Click a difference on either panel — a wrong click costs',
        '25 points and 3 seconds. H gives a hint (3 per level).',
        'Three scenes: Harbor at Dawn, Forest Camp, Clockwork Attic.',
      ], 'Click or press Space to play  ·  H hint  ·  P pause  ·  M sound');
    } else if (state.screen === SCREEN_PAUSED) {
      drawOverlayPanel('PAUSED', [
        `${DIFFS[state.level].length - state.found.size} differences still hidden in ${LEVELS[state.level].name}.`,
        `Score ${state.score} · ${Math.ceil(state.timeLeft)}s left on the clock.`,
      ], 'Press P or click to keep hunting');
    } else if (state.screen === SCREEN_LEVEL) {
      drawOverlayPanel(`LEVEL ${state.level + 1} CLEAR!`, [
        `All ${DIFFS[state.level].length} differences found in ${LEVELS[state.level].name}.`,
        `Time bonus +${state.levelBonus}  ·  Score ${state.score}`,
        `Next: ${LEVELS[state.level + 1].name} — ${DIFFS_PER_LEVEL} more differences, trickier ones.`,
      ], 'Click or press Space for the next level');
    } else if (state.screen === SCREEN_WIN) {
      drawOverlayPanel('YOU FOUND THEM ALL!', [
        `All ${DIFFS[state.level].length * LEVELS.length} differences across three scenes.`,
        `Final score ${state.score}  ·  Best combo x${state.bestCombo}  ·  Best ${Math.max(state.best, state.score)}`,
      ], 'Press R or click to play again');
    } else if (state.screen === SCREEN_OVER) {
      drawOverlayPanel("TIME'S UP", [
        `The clock ran out on ${LEVELS[state.level].name}.`,
        `${state.totalFound} differences found  ·  Score ${state.score}`,
      ], 'Press R or click to try again');
    }
    void SCREEN_PLAY;
  }

  return { draw, resize };
}
