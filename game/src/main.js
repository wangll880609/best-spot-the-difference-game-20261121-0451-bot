// Boot and the one loop: input is read every frame, the world advances in fixed 1/60 s
// steps (several in a slow frame, none in a fast one), and the renderer paints what is
// there. The game moves between six screens: title, play, paused, level-clear, win and
// time-up. Clicks land on a panel (a difference, or a miss), on a bottom-bar button, or
// on an overlay (which confirms, like Space).
//
// ?shot=play|start|level2|end (with &seed=N, ignored: the scenes are fixed art) stages
// that scene instead of running the loop, paints it twice and sets window.__shotReady
// for a screenshot.
import { BEST_KEY, STEP } from './config.js';
import { createAudio } from './audio.js';
import { createInput, ACTION_CONFIRM, ACTION_HINT, ACTION_MUTE, ACTION_PAUSE, ACTION_RESTART } from './input.js';
import { createRenderer, buttonAt, panelAt } from './render.js';
import { stageShot } from './shots.js';
import { createWorld, EVENT_FIND, EVENT_HINT, EVENT_LEVEL, EVENT_OVER, EVENT_WIN, EVENT_WRONG, SCREEN_LEVEL, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './world.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld();
const renderer = createRenderer(canvas);
const audio = createAudio();

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, audio);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
  void scene;
}

function runGame() {
  const input = createInput(canvas);
  world.state.best = readBest();
  window.__world = world; // test hook: lets a play-test read score, found set and screen
  let screen = SCREEN_TITLE;
  let accumulator = 0;
  let last = performance.now();

  function announce(message) {
    status.textContent = message;
  }

  function toLogical(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = 1280 / rect.width;
    const scaleY = 720 / rect.height;
    return { x: (event.clientX - rect.left) * scaleX, y: (event.clientY - rect.top) * scaleY };
  }

  function startOrAdvance() {
    audio.unlock();
    if (screen === SCREEN_TITLE || screen === SCREEN_OVER || screen === SCREEN_WIN) {
      world.startGame();
      screen = SCREEN_PLAY;
      announce(`Playing. Level 1: Harbor at Dawn. Find 7 differences.`);
    } else if (screen === SCREEN_LEVEL) {
      world.nextLevel();
      screen = SCREEN_PLAY;
      announce(`Playing. Level ${world.state.level + 1}.`);
    } else if (screen === SCREEN_PAUSED) {
      screen = SCREEN_PLAY;
      announce('Playing.');
    }
  }

  function finishRun() {
    if (world.state.score > world.state.best) {
      world.state.best = world.state.score;
      saveBest(world.state.best);
    }
  }

  canvas.addEventListener('pointerdown', (event) => {
    audio.unlock();
    const p = toLogical(event);
    const button = buttonAt(p.x, p.y);
    if (button === 'hint') {
      const events = world.useHint();
      if (events & EVENT_HINT) audio.hint();
      return;
    }
    if (button === 'pause') {
      if (screen === SCREEN_PLAY) {
        screen = SCREEN_PAUSED;
        announce('Paused.');
      } else if (screen === SCREEN_PAUSED) {
        screen = SCREEN_PLAY;
        announce('Playing.');
      }
      return;
    }
    if (button === 'sound') {
      audio.toggleMute();
      return;
    }
    if (screen === SCREEN_PLAY) {
      const panel = panelAt(p.x, p.y);
      if (panel === null) return;
      const events = world.click(panel.x, panel.y);
      if (events & EVENT_FIND) audio.find();
      if (events & EVENT_WRONG) audio.wrong();
      if (events & EVENT_LEVEL) {
        audio.level();
        screen = SCREEN_LEVEL;
        announce(`Level clear. Score ${world.state.score}.`);
      }
      if (events & EVENT_WIN) {
        audio.win();
        finishRun();
        screen = SCREEN_WIN;
        announce(`You found them all. Score ${world.state.score}.`);
      }
      return;
    }
    // Any click on an overlay confirms it.
    startOrAdvance();
  });

  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_MUTE) audio.toggleMute();
    if (actions & ACTION_RESTART && (screen === SCREEN_OVER || screen === SCREEN_WIN)) {
      startOrAdvance();
      return;
    }
    if (actions & ACTION_HINT) {
      const events = world.useHint();
      if (events & EVENT_HINT) audio.hint();
    }
    if (actions & ACTION_CONFIRM) startOrAdvance();
    else if (actions & ACTION_PAUSE) {
      if (screen === SCREEN_PLAY) {
        screen = SCREEN_PAUSED;
        announce('Paused.');
      } else if (screen === SCREEN_PAUSED) {
        screen = SCREEN_PLAY;
        announce('Playing.');
      }
    }
  }

  function step() {
    const events = world.step(STEP);
    if (events & EVENT_OVER) {
      audio.over();
      finishRun();
      screen = SCREEN_OVER;
      announce(`Time's up. Score ${world.state.score}.`);
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, 0.25);
    last = now;
    handleActions();
    if (screen === SCREEN_TITLE) {
      world.state.screen = SCREEN_TITLE;
    } else if (screen === SCREEN_PLAY) {
      while (accumulator >= STEP && screen === SCREEN_PLAY) {
        step();
        accumulator -= STEP;
      }
      world.state.screen = SCREEN_PLAY;
    } else {
      accumulator = 0;
      world.state.screen = screen;
    }
    renderer.draw(world.state, audio);
  }

  // Leaving the tab pauses a running game rather than letting the clock run unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      world.state.screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  announce('Twin Lanterns. Press Space or click to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
