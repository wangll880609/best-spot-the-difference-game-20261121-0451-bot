// Morning Harbor — Spot the Difference.
// scenes.js: the three hand-drawn scenes. Each scene draws the same picture
// twice (left panel, then right panel with `variant` true) and lists its
// seven differences as { id, x, y, r, label } in the 610 x 600 panel space.
// Every difference is drawn by the scene itself at exactly the coordinates
// listed, so a click on the drawn change is a click on the listed spot.
// No images, no network: every shape is a canvas path.

function sky(ctx, top, bottom) {
  const g = ctx.createLinearGradient(0, 0, 0, 360);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 610, 360);
}

function circle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function poly(ctx, points, fill) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function cloud(ctx, x, y, s, fill) {
  circle(ctx, x, y, 22 * s, fill);
  circle(ctx, x + 24 * s, y - 8 * s, 26 * s, fill);
  circle(ctx, x + 52 * s, y, 20 * s, fill);
  rect(ctx, x - 20 * s, y, 92 * s, 18 * s, fill);
}

function gull(ctx, x, y, stroke) {
  ctx.beginPath();
  ctx.moveTo(x - 14, y);
  ctx.quadraticCurveTo(x - 6, y - 10, x, y);
  ctx.quadraticCurveTo(x + 6, y - 10, x + 14, y);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 3;
  ctx.stroke();
}

// ---------------------------------------------------------------------------
// Scene 1 — Harbor Morning. Sun, lighthouse, sailboat, gulls, dock, buoy.
// ---------------------------------------------------------------------------
function drawHarbor(ctx, variant) {
  sky(ctx, '#8ec9ee', '#d9eefb');
  // Sun, top left. Difference 1: the right picture's sun has no rays.
  circle(ctx, 92, 82, 34, '#ffd94d');
  if (!variant) {
    ctx.strokeStyle = '#f2b705';
    ctx.lineWidth = 5;
    for (let i = 0; i < 8; i += 1) {
      const a = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(92 + Math.cos(a) * 44, 82 + Math.sin(a) * 44);
      ctx.lineTo(92 + Math.cos(a) * 58, 82 + Math.sin(a) * 58);
      ctx.stroke();
    }
  }
  cloud(ctx, 210, 70, 1, '#ffffff');
  cloud(ctx, 380, 120, 0.8, '#f4fafd');
  // Three gulls. Difference 4: the right picture has only two.
  gull(ctx, 250, 150, '#3a4a5a');
  gull(ctx, 300, 112, '#3a4a5a');
  if (!variant) gull(ctx, 345, 152, '#3a4a5a');
  // Distant hills.
  poly(ctx, [[0, 360], [120, 285], [260, 360]], '#7fae7a');
  poly(ctx, [[180, 360], [330, 275], [470, 360]], '#6b9e6e');
  // Sea.
  const sea = ctx.createLinearGradient(0, 360, 0, 600);
  sea.addColorStop(0, '#3d8fc4');
  sea.addColorStop(1, '#1d5f8f');
  ctx.fillStyle = sea;
  ctx.fillRect(0, 360, 610, 240);
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 2;
  for (const [wx, wy, wl] of [[60, 420, 70], [300, 400, 90], [430, 520, 80], [120, 540, 90]]) {
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.lineTo(wx + wl, wy);
    ctx.stroke();
  }
  // Lighthouse on the right. Difference 2: the top red band is missing
  // on the right; difference 5: its little flag is missing on the right.
  rect(ctx, 448, 356, 52, 10, '#5a4632');
  poly(ctx, [[448, 168], [500, 168], [492, 356], [456, 356]], '#f6f1e6');
  rect(ctx, 452, 168, 44, 34, '#d94f3d');
  if (!variant) rect(ctx, 450, 236, 48, 34, '#d94f3d');
  rect(ctx, 454, 304, 40, 34, '#d94f3d');
  rect(ctx, 462, 128, 24, 40, '#33414f');
  poly(ctx, [[456, 128], [492, 128], [474, 104]], '#d94f3d');
  circle(ctx, 474, 116, 9, '#ffe9a8');
  if (!variant) {
    ctx.strokeStyle = '#33414f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(474, 104);
    ctx.lineTo(474, 76);
    ctx.stroke();
    poly(ctx, [[474, 76], [508, 84], [474, 94]], '#d94f3d');
  }
  // Sailboat, centre left. Difference 3: red sail on the left, blue on
  // the right.
  ctx.strokeStyle = '#5a4632';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(182, 408);
  ctx.lineTo(182, 330);
  ctx.stroke();
  poly(ctx, [[186, 336], [186, 402], [238, 402]], variant ? '#3f6fb5' : '#d94f3d');
  poly(ctx, [[178, 344], [178, 402], [140, 402]], '#f6f1e6');
  poly(ctx, [[120, 408], [250, 408], [232, 432], [138, 432]], '#7a4a2b');
  // Rowboat.
  poly(ctx, [[320, 478], [392, 478], [376, 496], [336, 496]], '#8a5a2e');
  // Dock with crates, bottom left. Difference 6: three crates on the
  // left, two on the right.
  rect(ctx, 24, 496, 170, 12, '#6b4a2b');
  rect(ctx, 36, 508, 10, 44, '#6b4a2b');
  rect(ctx, 168, 508, 10, 44, '#6b4a2b');
  rect(ctx, 52, 462, 34, 34, '#b07a3e');
  rect(ctx, 92, 462, 34, 34, '#c08a45');
  if (!variant) rect(ctx, 72, 428, 34, 34, '#a86f36');
  ctx.strokeStyle = '#7a4a2b';
  ctx.lineWidth = 2;
  ctx.strokeRect(52, 462, 34, 34);
  ctx.strokeRect(92, 462, 34, 34);
  if (!variant) ctx.strokeRect(72, 428, 34, 34);
  // Buoy. Difference 7: red on the left, green on the right.
  circle(ctx, 520, 472, 14, variant ? '#3fae6a' : '#d94f3d');
  rect(ctx, 514, 446, 12, 12, '#33414f');
  ctx.beginPath();
  ctx.moveTo(508, 486);
  ctx.lineTo(532, 486);
  ctx.lineTo(526, 496);
  ctx.lineTo(514, 496);
  ctx.closePath();
  ctx.fillStyle = variant ? '#3fae6a' : '#d94f3d';
  ctx.fill();
}

// ---------------------------------------------------------------------------
// Scene 2 — Night Market. Lantern strings, two stalls, moon, cat, fruit.
// ---------------------------------------------------------------------------
function drawMarket(ctx, variant) {
  sky(ctx, '#1c2340', '#3a2d5e');
  for (const [sx, sy, sr] of [[60, 60, 2], [150, 40, 1.5], [240, 90, 2], [330, 50, 1.5], [420, 36, 2], [560, 130, 1.5], [90, 130, 1.5], [470, 90, 1.5]]) {
    circle(ctx, sx, sy, sr, '#ffe9a8');
  }
  // Moon. Difference 3: the right picture hides it behind a cloud.
  circle(ctx, 522, 72, 30, '#f6ead0');
  circle(ctx, 512, 64, 26, '#e8d5a8');
  if (variant) cloud(ctx, 492, 66, 1.1, '#8d86a8');
  // String lights across the top. Difference 7: one bulb is dark on the
  // right. Difference 1 (lanterns) hangs below the same line.
  ctx.strokeStyle = '#0f1226';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 96);
  ctx.quadraticCurveTo(305, 138, 610, 96);
  ctx.stroke();
  const bulbs = [60, 160, 260, 360, 460, 556];
  bulbs.forEach((bx, i) => {
    const by = 96 + Math.sin((bx / 610) * Math.PI) * 30;
    const dark = variant && i === 4;
    circle(ctx, bx, by + 12, 8, dark ? '#5a5470' : '#ffd94d');
    if (!dark) {
      ctx.beginPath();
      ctx.arc(bx, by + 12, 15, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,217,77,0.25)';
      ctx.fill();
    }
  });
  // Paper lanterns under the line. Difference 1: the middle lantern is
  // missing on the right.
  for (const [lx, lcol] of [[140, '#e2574c'], [305, '#f2a541'], [470, '#e2574c']]) {
    if (variant && lx === 305) continue;
    circle(ctx, lx, 168, 20, lcol);
    rect(ctx, lx - 8, 146, 16, 6, '#f6d365');
    rect(ctx, lx - 8, 184, 16, 6, '#f6d365');
  }
  // Left stall. Difference 2: striped awning on the left, plain red on
  // the right. Difference 6: the sign carries a star on the left, a
  // circle on the right.
  rect(ctx, 44, 236, 10, 190, '#5a4632');
  rect(ctx, 266, 236, 10, 190, '#5a4632');
  poly(ctx, [[36, 236], [284, 236], [266, 196], [54, 196]], '#c94f42');
  if (!variant) {
    for (const sx of [86, 136, 186, 236]) poly(ctx, [[sx - 14, 236], [sx + 14, 236], [sx + 8, 196], [sx - 8, 196]], '#f6ead0');
  }
  rect(ctx, 96, 150, 128, 34, '#f6ead0');
  ctx.strokeStyle = '#5a4632';
  ctx.lineWidth = 3;
  ctx.strokeRect(96, 150, 128, 34);
  if (!variant) {
    poly(ctx, [[160, 158], [163, 166], [171, 166], [165, 171], [167, 179], [160, 174], [153, 179], [155, 171], [149, 166], [157, 166]], '#e2a13a');
  } else {
    circle(ctx, 160, 167, 8, '#3f6fb5');
  }
  rect(ctx, 36, 330, 248, 96, '#7a4a2b');
  rect(ctx, 36, 330, 248, 12, '#9a6a3e');
  circle(ctx, 90, 312, 18, '#e2574c');
  circle(ctx, 130, 312, 18, '#f2a541');
  circle(ctx, 170, 312, 18, '#e2574c');
  // Cat asleep on the left stall's counter. Difference 4: no cat on the
  // right.
  if (!variant) {
    ctx.beginPath();
    ctx.ellipse(228, 318, 26, 12, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#3a3a44';
    ctx.fill();
    circle(ctx, 250, 306, 11, '#3a3a44');
    poly(ctx, [[244, 298], [247, 288], [251, 297]], '#3a3a44');
    poly(ctx, [[254, 297], [258, 288], [260, 298]], '#3a3a44');
  }
  // Right stall.
  rect(ctx, 336, 256, 10, 170, '#5a4632');
  rect(ctx, 560, 256, 10, 170, '#5a4632');
  poly(ctx, [[328, 256], [578, 256], [560, 216], [346, 216]], '#3f6fb5');
  for (const sx of [378, 428, 478, 528]) poly(ctx, [[sx - 14, 256], [sx + 14, 256], [sx + 8, 216], [sx - 8, 216]], '#f6ead0');
  rect(ctx, 328, 350, 250, 76, '#7a4a2b');
  rect(ctx, 328, 350, 250, 12, '#9a6a3e');
  // Basket of fruit. Difference 5: oranges on the left, red apples on
  // the right.
  poly(ctx, [[396, 330], [468, 330], [456, 356], [408, 356]], '#b07a3e');
  for (const [fx, fy] of [[412, 322], [432, 316], [452, 322], [422, 328], [442, 328]]) {
    circle(ctx, fx, fy, 10, variant ? '#c93a3a' : '#f28c28');
  }
  circle(ctx, 520, 322, 12, '#7fae7a');
  circle(ctx, 544, 330, 10, '#7fae7a');
  // Cobbles.
  rect(ctx, 0, 426, 610, 174, '#4a4266');
  ctx.strokeStyle = 'rgba(255,255,255,0.10)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath();
    ctx.moveTo(0, 460 + i * 32);
    ctx.lineTo(610, 460 + i * 32);
    ctx.stroke();
  }
}

// ---------------------------------------------------------------------------
// Scene 3 — Tea Garden. Mountain, pagoda, pond, bridge, tea house, pines.
// ---------------------------------------------------------------------------
function drawGarden(ctx, variant) {
  sky(ctx, '#bfe3d8', '#eaf6ee');
  cloud(ctx, 90, 70, 1, '#ffffff');
  cloud(ctx, 420, 50, 0.8, '#ffffff');
  // Mountain with a snow cap. Difference 6: no snow on the right.
  poly(ctx, [[0, 360], [130, 130], [300, 360]], '#7d9bb5');
  if (!variant) poly(ctx, [[104, 176], [130, 130], [158, 178], [142, 186], [128, 172], [116, 188]], '#ffffff');
  poly(ctx, [[220, 360], [400, 210], [560, 360]], '#6b8aa5');
  // Pine trees. Difference 3: the middle pine loses its top on the right.
  function pine(px, py, s, top) {
    ctx.fillStyle = '#5a4632';
    ctx.fillRect(px - 3 * s, py, 6 * s, 26 * s);
    ctx.fillStyle = '#3f7a4e';
    if (top) poly(ctx, [[px, py - 62 * s], [px + 26 * s, py], [px - 26 * s, py]], '#3f7a4e');
    poly(ctx, [[px, py - 34 * s], [px + 32 * s, py + 14 * s], [px - 32 * s, py + 14 * s]], '#4c8a5c');
    poly(ctx, [[px, py - 8 * s], [px + 38 * s, py + 26 * s], [px - 38 * s, py + 26 * s]], '#5a9a68');
  }
  pine(330, 330, 1, !variant);
  pine(80, 360, 0.8, true);
  pine(560, 350, 0.9, true);
  // Tea house, left. Difference 7: its window glows warm on the left,
  // dark on the right.
  rect(ctx, 44, 330, 180, 130, '#c9a06a');
  poly(ctx, [[28, 332], [240, 332], [196, 286], [72, 286]], '#8a4a3a');
  rect(ctx, 56, 300, 156, 12, '#8a4a3a');
  rect(ctx, 106, 372, 56, 88, '#5a4632');
  rect(ctx, 118, 360, 44, 34, variant ? '#3a3f4a' : '#ffd94d');
  ctx.strokeStyle = '#5a4632';
  ctx.lineWidth = 3;
  ctx.strokeRect(118, 360, 44, 34);
  ctx.beginPath();
  ctx.moveTo(140, 360);
  ctx.lineTo(140, 394);
  ctx.moveTo(118, 377);
  ctx.lineTo(162, 377);
  ctx.stroke();
  // Pagoda, right. Difference 1: three tiers on the left, two on the
  // right.
  rect(ctx, 452, 300, 96, 80, '#a8573c');
  function tier(y, w) {
    rect(ctx, 500 - w / 2, y, w, 26, '#a8573c');
    poly(ctx, [[500 - w / 2 - 16, y + 26], [500 + w / 2 + 16, y + 26], [500 + w / 2, y], [500 - w / 2, y]], '#33414f');
  }
  tier(274, 110);
  tier(232, 92);
  if (!variant) tier(190, 74);
  poly(ctx, [[488, 190], [512, 190], [500, 168]], variant ? '#33414f' : '#c9a13a');
  // Stone lantern by the pond. Difference 4: lit flame on the left,
  // cold grey on the right.
  rect(ctx, 292, 440, 18, 40, '#8d8d94');
  rect(ctx, 282, 428, 38, 14, '#8d8d94');
  rect(ctx, 288, 404, 26, 24, '#a9a9b0');
  circle(ctx, 301, 416, 7, variant ? '#6a6a72' : '#ffd94d');
  poly(ctx, [[278, 404], [324, 404], [301, 384]], '#6a6a72');
  // Pond with koi. Difference 2: three koi on the left, two on the right.
  const pond = ctx.createLinearGradient(0, 470, 0, 600);
  pond.addColorStop(0, '#5fb3c9');
  pond.addColorStop(1, '#2f7d96');
  ctx.fillStyle = pond;
  ctx.fillRect(0, 470, 610, 130);
  function koi(kx, ky, col) {
    ctx.beginPath();
    ctx.ellipse(kx, ky, 20, 8, 0.3, 0, Math.PI * 2);
    ctx.fillStyle = col;
    ctx.fill();
    poly(ctx, [[kx - 20, ky], [kx - 30, ky - 7], [kx - 30, ky + 7]], col);
  }
  koi(120, 520, '#f28c28');
  koi(200, 545, '#f6f1e6');
  if (!variant) koi(280, 520, '#e2574c');
  // Arched bridge. Difference 5: five planks on the left, four on the
  // right.
  ctx.strokeStyle = '#8a4a3a';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(150, 560, 78, Math.PI, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 3;
  const planks = variant ? 4 : 5;
  for (let i = 0; i < planks; i += 1) {
    const a = Math.PI + ((i + 0.5) / planks) * Math.PI;
    const bx = 150 + Math.cos(a) * 78;
    const by = 560 + Math.sin(a) * 78;
    ctx.beginPath();
    ctx.moveTo(bx, by - 8);
    ctx.lineTo(bx, by + 8);
    ctx.stroke();
  }
  // Grass.
  rect(ctx, 0, 440, 610, 30, '#6fae62');
}

export const SCENES = [
  {
    id: 'harbor',
    name: 'Harbor Morning',
    hint: 'Sun, lighthouse, boats and the dock',
    draw: drawHarbor,
    diffs: [
      { id: 'sun-rays', x: 92, y: 82, r: 40, label: 'Sun rays' },
      { id: 'lighthouse-band', x: 474, y: 253, r: 26, label: 'Lighthouse band' },
      { id: 'sail-colour', x: 190, y: 372, r: 30, label: 'Sail colour' },
      { id: 'third-gull', x: 345, y: 152, r: 22, label: 'Third gull' },
      { id: 'lighthouse-flag', x: 488, y: 84, r: 20, label: 'Lighthouse flag' },
      { id: 'top-crate', x: 89, y: 445, r: 26, label: 'Top crate' },
      { id: 'buoy-colour', x: 520, y: 472, r: 22, label: 'Buoy colour' },
    ],
  },
  {
    id: 'market',
    name: 'Night Market',
    hint: 'Lanterns, stalls, moonlight and the cat',
    draw: drawMarket,
    diffs: [
      { id: 'middle-lantern', x: 305, y: 168, r: 24, label: 'Middle lantern' },
      { id: 'awning-stripes', x: 160, y: 216, r: 28, label: 'Awning stripes' },
      { id: 'moon-cloud', x: 522, y: 72, r: 30, label: 'Moon behind cloud' },
      { id: 'stall-cat', x: 238, y: 312, r: 22, label: 'Stall cat' },
      { id: 'fruit-colour', x: 432, y: 322, r: 26, label: 'Fruit colour' },
      { id: 'sign-star', x: 160, y: 167, r: 20, label: 'Sign star' },
      { id: 'dark-bulb', x: 460, y: 120, r: 18, label: 'Dark bulb' },
    ],
  },
  {
    id: 'garden',
    name: 'Tea Garden',
    hint: 'Mountain, pagoda, pond and tea house',
    draw: drawGarden,
    diffs: [
      { id: 'pagoda-tier', x: 500, y: 203, r: 26, label: 'Pagoda tier' },
      { id: 'third-koi', x: 280, y: 520, r: 24, label: 'Third koi' },
      { id: 'pine-top', x: 330, y: 288, r: 26, label: 'Pine top' },
      { id: 'lantern-flame', x: 301, y: 416, r: 20, label: 'Lantern flame' },
      { id: 'bridge-plank', x: 150, y: 482, r: 24, label: 'Bridge plank' },
      { id: 'snow-cap', x: 130, y: 160, r: 28, label: 'Snow cap' },
      { id: 'tea-window', x: 140, y: 377, r: 24, label: 'Tea window' },
    ],
  },
];
