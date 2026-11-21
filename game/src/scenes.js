// The three scenes, drawn entirely with canvas vector art (no image assets, no network).
// Each scene is drawn twice: variant 0 is the left "original" panel, variant 1 the right panel
// with exactly seven differences. A difference lives at one spot in panel coordinates
// (a 600x560 box); the DIFFS lists give that spot, its radius and a short label.
//
// The art is hand-placed and deterministic: decorative scatter (stars, sparks) comes from a
// seeded generator, so the same level always paints the same picture.
import { createRandom } from './random.js';

function circle(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function poly(ctx, points, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

function line(ctx, x1, y1, x2, y2, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function cloud(ctx, x, y, s, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 18 * s, 0, Math.PI * 2);
  ctx.arc(x + 20 * s, y - 8 * s, 22 * s, 0, Math.PI * 2);
  ctx.arc(x + 42 * s, y, 18 * s, 0, Math.PI * 2);
  ctx.arc(x + 20 * s, y + 8 * s, 20 * s, 0, Math.PI * 2);
  ctx.fill();
}

function gull(ctx, x, y, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 12, y);
  ctx.quadraticCurveTo(x - 5, y - 8, x, y);
  ctx.quadraticCurveTo(x + 5, y - 8, x + 12, y);
  ctx.stroke();
}

function pine(ctx, x, baseY, h, color) {
  ctx.fillStyle = color;
  const w = h * 0.42;
  for (let tier = 0; tier < 3; tier += 1) {
    const ty = baseY - h + tier * (h / 3.4);
    const tw = w * (0.45 + tier * 0.28);
    poly(ctx, [[x - tw, ty + h / 3.2], [x, ty], [x + tw, ty + h / 3.2]], color);
  }
  rect(ctx, x - 5, baseY - 8, 10, 10, '#4a3220');
}

// ---------------------------------------------------------------- level 1: harbor
function drawHarbor(ctx, v) {
  // Dawn sky and sea.
  const sky = ctx.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, '#ffe0ae');
  sky.addColorStop(0.55, '#ffb37a');
  sky.addColorStop(1, '#9fd8e8');
  rect(ctx, 0, 0, 600, 300, sky);
  const sea = ctx.createLinearGradient(0, 300, 0, 560);
  sea.addColorStop(0, '#2f7d9c');
  sea.addColorStop(1, '#17455e');
  rect(ctx, 0, 300, 600, 260, sea);
  // Sun shimmer on the water.
  ctx.fillStyle = 'rgba(255, 220, 150, 0.35)';
  for (let i = 0; i < 5; i += 1) rect(ctx, 440 - i * 6, 312 + i * 44, 60 + i * 14, 5, 'rgba(255, 220, 150, 0.35)');
  // Sun (rays only in the original).
  circle(ctx, 470, 105, 52, 'rgba(255, 236, 170, 0.35)');
  circle(ctx, 470, 105, 40, '#fff2b0');
  if (v === 0) {
    ctx.strokeStyle = '#ffd34d';
    ctx.lineWidth = 5;
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * Math.PI * 2;
      line(ctx, 470 + Math.cos(a) * 48, 105 + Math.sin(a) * 48, 470 + Math.cos(a) * 62, 105 + Math.sin(a) * 62, '#ffd34d', 5);
    }
  }
  cloud(ctx, 110, 70, 1, 'rgba(255, 250, 240, 0.9)');
  cloud(ctx, 300, 48, 0.8, 'rgba(255, 250, 240, 0.85)');
  cloud(ctx, 520, 185, 0.7, 'rgba(255, 250, 240, 0.7)');
  gull(ctx, 200, 90, '#3a3f4a');
  gull(ctx, 330, 68, '#3a3f4a');
  if (v === 0) gull(ctx, 430, 95, '#3a3f4a');
  // Distant headland.
  poly(ctx, [[500, 300], [560, 262], [600, 285], [600, 300]], '#5d7d8c');
  // Lighthouse on its rock.
  poly(ctx, [[48, 300], [150, 300], [132, 268], [66, 268]], '#6b5b4a');
  rect(ctx, 78, 168, 44, 104, '#f4ede0');
  rect(ctx, 78, 196, 44, 14, '#d94f3d');
  rect(ctx, 78, 238, 44, 14, '#d94f3d');
  rect(ctx, 72, 156, 56, 12, '#3a3f4a');
  circle(ctx, 100, 142, 14, '#ffe9a8');
  rect(ctx, 88, 128, 24, 14, '#3a3f4a');
  // Lighthouse window: lit in the original, dark in the changed panel.
  rect(ctx, 92, 205, 16, 20, v === 0 ? '#ffd34d' : '#2c3547');
  // Soft light beam.
  ctx.fillStyle = 'rgba(255, 233, 168, 0.18)';
  poly(ctx, [[112, 142], [300, 118], [300, 168], [112, 150]], 'rgba(255, 233, 168, 0.18)');
  // Wooden pier and crates.
  rect(ctx, 0, 470, 230, 90, '#7a5a38');
  for (let x = 0; x < 230; x += 46) line(ctx, x, 470, x, 560, '#5d4226', 3);
  line(ctx, 0, 500, 230, 500, '#5d4226', 3);
  line(ctx, 0, 530, 230, 530, '#5d4226', 3);
  rect(ctx, 40, 428, 42, 42, '#a8763e');
  line(ctx, 40, 449, 82, 449, '#7a5a38', 3);
  rect(ctx, 92, 440, 34, 30, '#8f6534');
  if (v === 1) { // one crate more in the changed panel
    rect(ctx, 150, 452, 36, 36, '#a8763e');
    line(ctx, 150, 470, 186, 470, '#7a5a38', 3);
  }
  // Lantern post on the pier: glowing in the original, dark in the changed panel.
  line(ctx, 268, 470, 268, 386, '#2c3547', 6);
  circle(ctx, 268, 382, 12, v === 0 ? '#ffd34d' : '#3a3f4a');
  if (v === 0) circle(ctx, 268, 382, 22, 'rgba(255, 211, 77, 0.3)');
  // Sailboat with a flag: red in the original, teal in the changed panel.
  poly(ctx, [[352, 392], [418, 392], [404, 372], [366, 372]], '#8a4a2a');
  line(ctx, 385, 372, 385, 272, '#4a3220', 5);
  poly(ctx, [[385, 276], [385, 366], [428, 366]], '#f4ede0');
  poly(ctx, [[385, 276], [412, 288], [385, 300]], v === 0 ? '#d94f3d' : '#2a9d8f');
  // Rowboat and oar.
  poly(ctx, [[168, 448], [228, 448], [214, 430], [182, 430]], '#6b4a2f');
  line(ctx, 210, 432, 244, 414, '#4a3220', 4);
  // A fish jumping out of the sea (original only).
  if (v === 0) {
    ctx.strokeStyle = '#cfe8ef';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(520, 396, 16, Math.PI, 0);
    ctx.stroke();
    ellipse(ctx, 520, 378, 10, 5, '#9fc6d4');
  }
  // Wave lines.
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 2;
  for (const [x, y, w] of [[60, 330, 70], [250, 350, 90], [440, 330, 60], [120, 520, 80], [330, 520, 100]]) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + w / 2, y - 6, x + w, y);
    ctx.stroke();
  }
}

// ---------------------------------------------------------------- level 2: forest camp
function drawCamp(ctx, v) {
  const sky = ctx.createLinearGradient(0, 0, 0, 340);
  sky.addColorStop(0, '#0c1a2c');
  sky.addColorStop(1, '#1d3a4d');
  rect(ctx, 0, 0, 600, 340, sky);
  // Stars (one missing in the changed panel).
  const rnd = createRandom(20261121);
  ctx.fillStyle = '#e8f2ff';
  for (let i = 0; i < 40; i += 1) {
    const x = 20 + rnd() * 560;
    const y = 14 + rnd() * 220;
    const r = 1 + rnd() * 1.6;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  if (v === 0) circle(ctx, 200, 60, 3, '#ffffff');
  // Moon (one crater missing in the changed panel).
  circle(ctx, 480, 85, 46, 'rgba(244, 234, 208, 0.25)');
  circle(ctx, 480, 85, 36, '#f4ead0');
  circle(ctx, 468, 78, 6, '#d8c9a3');
  if (v === 0) circle(ctx, 492, 96, 4, '#d8c9a3');
  circle(ctx, 478, 104, 3, '#d8c9a3');
  // Mountains and ground.
  poly(ctx, [[0, 340], [140, 250], [260, 340]], '#12283a');
  poly(ctx, [[220, 340], [380, 240], [540, 340]], '#0f2233');
  poly(ctx, [[480, 340], [600, 260], [600, 340]], '#12283a');
  const ground = ctx.createLinearGradient(0, 340, 0, 560);
  ground.addColorStop(0, '#1e3d2f');
  ground.addColorStop(1, '#122619');
  rect(ctx, 0, 340, 600, 220, ground);
  pine(ctx, 52, 430, 190, '#1d4a2e');
  pine(ctx, 552, 420, 170, '#1a4229');
  pine(ctx, 96, 440, 110, '#235636');
  // Tent with a door flap: closed in the original, open in the changed panel.
  poly(ctx, [[200, 420], [400, 420], [300, 282]], '#e8722a');
  poly(ctx, [[200, 420], [400, 420], [300, 282]], 'rgba(0,0,0,0)');
  line(ctx, 250, 351, 300, 282, '#c25a1d', 4);
  line(ctx, 350, 351, 300, 282, '#c25a1d', 4);
  if (v === 0) {
    poly(ctx, [[282, 420], [318, 420], [300, 352]], '#c25a1d');
  } else {
    poly(ctx, [[282, 420], [318, 420], [300, 352]], '#241608');
    poly(ctx, [[282, 420], [300, 352], [300, 420]], '#e8722a');
  }
  // Campfire: stones, logs (one log more in the changed panel), flames, glow.
  circle(ctx, 300, 478, 60, 'rgba(255, 170, 60, 0.16)');
  ellipse(ctx, 300, 478, 34, 10, '#6b5b4a');
  line(ctx, 272, 470, 306, 486, '#6b4423', 8);
  line(ctx, 328, 470, 294, 486, '#7a4e28', 8);
  if (v === 1) line(ctx, 300, 462, 330, 484, '#5d3a1e', 8);
  poly(ctx, [[300, 428], [282, 468], [318, 468]], '#ffb347');
  poly(ctx, [[300, 442], [290, 468], [310, 468]], '#ff7b2f');
  circle(ctx, 268, 482, 6, '#8a8f96');
  circle(ctx, 332, 484, 6, '#8a8f96');
  // Owl on a branch: eyes open in the original, closed in the changed panel.
  line(ctx, 84, 196, 160, 186, '#4a3220', 7);
  ellipse(ctx, 122, 178, 20, 26, '#7a5a38');
  ellipse(ctx, 122, 196, 14, 10, '#8a6a44');
  if (v === 0) {
    circle(ctx, 114, 172, 5, '#ffffff');
    circle(ctx, 130, 172, 5, '#ffffff');
    circle(ctx, 114, 172, 2.5, '#141821');
    circle(ctx, 130, 172, 2.5, '#141821');
  } else {
    line(ctx, 109, 172, 119, 172, '#141821', 2.5);
    line(ctx, 125, 172, 135, 172, '#141821', 2.5);
  }
  poly(ctx, [[122, 180], [118, 186], [126, 186]], '#ffb347');
  // Mushrooms: red caps in the original, purple in the changed panel.
  const cap = v === 0 ? '#d94f3d' : '#8e6cc8';
  ellipse(ctx, 448, 502, 16, 10, cap);
  circle(ctx, 448, 494, 3, '#ffffff');
  rect(ctx, 444, 500, 8, 12, '#f4ede0');
  ellipse(ctx, 472, 508, 11, 7, cap);
  rect(ctx, 469, 506, 6, 9, '#f4ede0');
  // Backpack with a water bottle (original only).
  poly(ctx, [[162, 520], [198, 520], [192, 478], [168, 478]], '#3f7a4a');
  rect(ctx, 168, 478, 24, 10, '#2f5d38');
  line(ctx, 172, 490, 188, 490, '#2f5d38', 3);
  if (v === 0) {
    rect(ctx, 200, 486, 10, 22, '#7ec8e3');
    rect(ctx, 200, 482, 10, 5, '#2a6f8f');
  }
  // Grass tufts.
  ctx.strokeStyle = '#2f6b43';
  ctx.lineWidth = 2;
  for (const [x, y] of [[40, 540], [240, 545], [420, 540], [540, 545], [120, 460], [500, 460]]) {
    line(ctx, x, y, x - 4, y - 10, '#2f6b43', 2);
    line(ctx, x + 4, y, x + 6, y - 12, '#2f6b43', 2);
  }
}

// ---------------------------------------------------------------- level 3: clockwork attic
function drawAttic(ctx, v) {
  // Wooden wall and floor.
  const wall = ctx.createLinearGradient(0, 0, 0, 440);
  wall.addColorStop(0, '#7a5233');
  wall.addColorStop(1, '#5d3d24');
  rect(ctx, 0, 0, 600, 440, wall);
  for (let y = 60; y < 440; y += 62) line(ctx, 0, y, 600, y, 'rgba(0,0,0,0.18)', 2);
  rect(ctx, 0, 440, 600, 120, '#8a5f3c');
  for (let x = 40; x < 600; x += 80) line(ctx, x, 440, x, 560, 'rgba(0,0,0,0.2)', 2);
  line(ctx, 0, 440, 600, 440, '#4a3220', 4);
  // Round window: a moon in the original, a star in the changed panel.
  circle(ctx, 120, 115, 58, '#3a3f4a');
  circle(ctx, 120, 115, 50, '#16233a');
  if (v === 0) {
    circle(ctx, 120, 115, 24, '#f4ead0');
    circle(ctx, 112, 108, 4, '#d8c9a3');
  } else {
    ctx.fillStyle = '#ffd34d';
    ctx.beginPath();
    ctx.moveTo(120, 92);
    ctx.quadraticCurveTo(126, 108, 142, 112);
    ctx.quadraticCurveTo(126, 118, 120, 134);
    ctx.quadraticCurveTo(114, 118, 98, 112);
    ctx.quadraticCurveTo(114, 108, 120, 92);
    ctx.fill();
  }
  // Wall clock: 3:00 in the original, 4:30 in the changed panel.
  circle(ctx, 300, 110, 46, '#3a3f4a');
  circle(ctx, 300, 110, 40, '#f4ede0');
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2;
    circle(ctx, 300 + Math.cos(a) * 33, 110 + Math.sin(a) * 33, 2, '#3a3f4a');
  }
  if (v === 0) {
    line(ctx, 300, 110, 300, 82, '#141821', 4);
    line(ctx, 300, 110, 326, 110, '#141821', 4);
  } else {
    line(ctx, 300, 110, 318, 128, '#141821', 4);
    line(ctx, 300, 110, 300, 136, '#141821', 4);
  }
  circle(ctx, 300, 110, 4, '#d94f3d');
  // Big brass gear: its top tooth is missing in the changed panel.
  ctx.fillStyle = '#c9920e';
  ctx.beginPath();
  for (let i = 0; i < 8; i += 1) {
    if (v === 1 && i === 6) continue; // the missing tooth
    const a = (i / 8) * Math.PI * 2;
    const tx = 480 + Math.cos(a) * 58;
    const ty = 150 + Math.sin(a) * 58;
    ctx.moveTo(tx + 10, ty);
    ctx.arc(tx, ty, 10, 0, Math.PI * 2);
  }
  ctx.fill();
  circle(ctx, 480, 150, 48, '#c9920e');
  circle(ctx, 480, 150, 34, '#8a6a1d');
  circle(ctx, 480, 150, 10, '#5d3d24');
  // Bookshelf with books: one book missing in the changed panel.
  rect(ctx, 430, 250, 150, 190, '#4a3220');
  for (const sy of [290, 340, 390]) rect(ctx, 438, sy, 134, 8, '#6b4423');
  const books = ['#d94f3d', '#2a9d8f', '#e9c46a', '#8e6cc8', '#4a7fb5', '#e8722a'];
  books.forEach((c, i) => {
    if (v === 1 && i === 2) return; // the missing book
    rect(ctx, 444 + i * 20, 252, 16, 38, c);
  });
  books.forEach((c, i) => rect(ctx, 444 + i * 20, 302, 16, 38, books[(i + 2) % books.length]));
  rect(ctx, 444, 352, 60, 38, '#2a9d8f');
  rect(ctx, 510, 352, 50, 38, '#e9c46a');
  circle(ctx, 470, 410, 12, '#c9920e');
  // Rug: its stripe is gold in the original, teal in the changed panel.
  ellipse(ctx, 300, 500, 130, 34, '#a83a32');
  ellipse(ctx, 300, 500, 104, 24, v === 0 ? '#ffd34d' : '#2a9d8f');
  ellipse(ctx, 300, 500, 70, 15, '#a83a32');
  // Cat on the rug: tail up in the original, tail down in the changed panel.
  ellipse(ctx, 300, 468, 34, 26, '#e8722a');
  circle(ctx, 300, 428, 20, '#e8722a');
  poly(ctx, [[284, 414], [290, 396], [296, 412]], '#e8722a');
  poly(ctx, [[304, 412], [310, 396], [316, 414]], '#e8722a');
  if (v === 0) {
    ctx.strokeStyle = '#e8722a';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(330, 470);
    ctx.quadraticCurveTo(352, 450, 344, 424);
    ctx.stroke();
  } else {
    ctx.strokeStyle = '#e8722a';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(330, 474);
    ctx.quadraticCurveTo(348, 490, 336, 500);
    ctx.stroke();
  }
  circle(ctx, 293, 426, 3, '#141821');
  circle(ctx, 307, 426, 3, '#141821');
  // Teapot on its table, with steam in the original only.
  rect(ctx, 84, 392, 90, 10, '#4a3220');
  rect(ctx, 92, 402, 8, 48, '#4a3220');
  rect(ctx, 158, 402, 8, 48, '#4a3220');
  ellipse(ctx, 129, 380, 26, 18, '#4a7fb5');
  circle(ctx, 129, 360, 8, '#4a7fb5');
  line(ctx, 104, 372, 92, 360, '#4a7fb5', 5);
  if (v === 0) {
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(129, 350);
    ctx.quadraticCurveTo(122, 338, 129, 326);
    ctx.quadraticCurveTo(136, 314, 129, 302);
    ctx.stroke();
  }
  circle(ctx, 168, 384, 10, '#f4ede0');
  // Potted plant: a pink flower in the original, none in the changed panel.
  poly(ctx, [[512, 470], [548, 470], [542, 500], [518, 500]], '#a83a32');
  line(ctx, 530, 470, 530, 428, '#2f6b43', 4);
  ellipse(ctx, 516, 442, 12, 7, '#3f7a4a');
  ellipse(ctx, 544, 442, 12, 7, '#3f7a4a');
  if (v === 0) {
    circle(ctx, 530, 424, 9, '#e88bb0');
    circle(ctx, 530, 424, 4, '#ffd34d');
  }
}

export const SCENES = [drawHarbor, drawCamp, drawAttic];

export const DIFFS = [
  [
    { x: 430, y: 95, r: 26, label: 'a gull' },
    { x: 95, y: 205, r: 26, label: 'the lighthouse window' },
    { x: 398, y: 272, r: 26, label: 'the boat flag' },
    { x: 170, y: 478, r: 26, label: 'an extra crate' },
    { x: 470, y: 105, r: 34, label: 'the sun rays' },
    { x: 520, y: 390, r: 26, label: 'the jumping fish' },
    { x: 268, y: 392, r: 26, label: 'the pier lantern' },
  ],
  [
    { x: 200, y: 60, r: 24, label: 'a star' },
    { x: 492, y: 96, r: 22, label: 'a moon crater' },
    { x: 122, y: 178, r: 26, label: 'the owl eyes' },
    { x: 300, y: 365, r: 28, label: 'the tent flap' },
    { x: 335, y: 478, r: 24, label: 'an extra log' },
    { x: 450, y: 500, r: 26, label: 'the mushroom cap' },
    { x: 205, y: 490, r: 24, label: 'the water bottle' },
  ],
  [
    { x: 300, y: 110, r: 30, label: 'the clock hands' },
    { x: 340, y: 445, r: 26, label: 'the cat tail' },
    { x: 492, y: 271, r: 22, label: 'a missing book' },
    { x: 530, y: 424, r: 24, label: 'the plant flower' },
    { x: 129, y: 330, r: 26, label: 'the teapot steam' },
    { x: 480, y: 92, r: 24, label: 'a gear tooth' },
    { x: 120, y: 115, r: 30, label: 'the window sky' },
  ],
];
