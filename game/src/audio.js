// Morning Harbor — Spot the Difference.
// audio.js: tiny WebAudio chimes, synthesized on the spot. No audio files,
// no network, nothing to load. The context is created on the first user
// gesture (browsers forbid it earlier) and every sound is a short
// oscillator note, so muting is just a flag.

let context = null;

export function ensureAudio() {
  if (context) return;
  try {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (Ctor) context = new Ctor();
  } catch {
    context = null;
  }
}

function tone(freq, at, dur, type, vol) {
  if (!context) return;
  try {
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, context.currentTime + at);
    gain.gain.linearRampToValueAtTime(vol, context.currentTime + at + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + at + dur);
    osc.connect(gain);
    gain.connect(context.destination);
    osc.start(context.currentTime + at);
    osc.stop(context.currentTime + at + dur + 0.05);
  } catch {
    // Sound is garnish: a failure here must never break the game.
  }
}

export function playSound(game, kind) {
  if (game.muted) return;
  ensureAudio();
  if (!context) return;
  if (context.state === 'suspended') context.resume().catch(() => {});
  if (kind === 'find') {
    tone(660, 0, 0.12, 'sine', 0.18);
    tone(880, 0.09, 0.18, 'sine', 0.18);
  } else if (kind === 'miss') {
    tone(160, 0, 0.2, 'square', 0.08);
  } else if (kind === 'hint') {
    tone(520, 0, 0.15, 'sine', 0.14);
  } else if (kind === 'clear') {
    tone(523, 0, 0.14, 'sine', 0.18);
    tone(659, 0.12, 0.14, 'sine', 0.18);
    tone(784, 0.24, 0.22, 'sine', 0.18);
  } else if (kind === 'win') {
    tone(523, 0, 0.16, 'sine', 0.18);
    tone(659, 0.14, 0.16, 'sine', 0.18);
    tone(784, 0.28, 0.16, 'sine', 0.18);
    tone(1047, 0.42, 0.3, 'sine', 0.18);
  } else if (kind === 'timeout') {
    tone(392, 0, 0.2, 'sine', 0.16);
    tone(311, 0.18, 0.3, 'sine', 0.16);
  }
}
