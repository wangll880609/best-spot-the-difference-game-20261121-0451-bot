# Morning Harbor — Spot the Difference

[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/wangll880609/best-spot-the-difference-game-20261121-0451-bot/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/wangll880609/best-spot-the-difference-game-20261121-0451-bot/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

Built for the make.fun bounty [Make the best spot the difference game](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451).

A complete spot-the-difference game that runs offline in a desktop browser
from its own static files. Two near-identical hand-drawn pictures sit side
by side; find the seven differences in each scene before the clock runs
out. Three original scenes — Harbor Morning, Night Market, Tea Garden —
each drawn as pure canvas vector art, no images and no network requests.

## How to play

- **Click** a difference on either picture to ring it. Found differences
  get a green circle and a check mark on both pictures.
- **Space / Enter** — start, move to the next scene, play again.
- **H** — hint: rings one difference you have not found yet (3 per scene,
  −50 points each).
- **P / Esc** — pause (the clock stops). **M** — mute. **R** — restart.

## Scoring

- Find: **100 + 25 × (combo − 1)** — the first find pays 100, the second
  in a row 125, the third 150, up to 250 for the seventh. Seven clean
  finds in a scene pay 1225.
- Empty click (miss): **−25 points, −3 seconds**, combo resets.
- Clicking a difference already found: 0 points.
- Hint: **−50 points**.
- Clearing a scene: **+10 points per second left** on the clock.
- Best score is saved in the browser (localStorage).

## Run it

Node 22 or later, no install step, no network:

```sh
node serve.ts
# open http://localhost:8080 in desktop Chrome
```

Take the screenshots (headless Chromium + playwright-core):

```sh
node shoot.mjs
```

Hand the entry in (writes `out/` with `game/`, `screenshots/` and
`dossier.json`):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Layout

- `main.ts` — the hand-in program: copies `game/` and `screenshots/`
  and writes `dossier.json` with `vendor/makefun-game.ts`.
- `game/index.html` — the page; `game/src/` holds one file per job:
  `config.js` (numbers and scoring), `scenes.js` (the three hand-drawn
  scenes and their differences), `state.js` (rules and score),
  `render.js` (HUD, panels, markers, screens), `input.js` (mouse and
  keyboard), `audio.js` (synthesized chimes, no audio files),
  `shots.js` (the four staged screenshot states), `main.js` (boot).
- `screenshots/` — four real renders of the game's own code, 1280×800:
  title, mid-game (3 found, 375 points), second scene (5 found, 2835
  points), victory (6185 points). Every number on them follows the
  scoring rules above.
- `vendor/makefun-game.ts` — the kit's library, unchanged.
- `shots.json` — which `?shot=` frame each screenshot shows.

## License

MIT — see `LICENSE`.
