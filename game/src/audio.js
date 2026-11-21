// Sound, made with the Web Audio API alone: no audio files, no network. The context is
// created on the first user gesture, so the page never complains about autoplay.
export function createAudio() {
  let context = null;
  let muted = false;

  function ensure() {
    if (context === null) {
      try {
        const Ctor = window.AudioContext ?? window.webkitAudioContext;
        context = new Ctor();
      } catch {
        context = null;
      }
    }
    if (context !== null && context.state === 'suspended') void context.resume();
    return context;
  }

  function tone(freq, at, dur, type, gain) {
    const ctx = ensure();
    if (ctx === null || muted) return;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    amp.gain.setValueAtTime(0, ctx.currentTime + at);
    amp.gain.linearRampToValueAtTime(gain, ctx.currentTime + at + 0.02);
    amp.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + at + dur);
    osc.connect(amp);
    amp.connect(ctx.destination);
    osc.start(ctx.currentTime + at);
    osc.stop(ctx.currentTime + at + dur + 0.05);
  }

  return {
    get muted() {
      return muted;
    },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    unlock() {
      ensure();
    },
    find() {
      tone(660, 0, 0.16, 'sine', 0.18);
      tone(990, 0.09, 0.22, 'sine', 0.16);
    },
    wrong() {
      tone(160, 0, 0.18, 'sawtooth', 0.08);
    },
    hint() {
      tone(520, 0, 0.12, 'triangle', 0.12);
      tone(780, 0.1, 0.14, 'triangle', 0.1);
    },
    level() {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.1, 0.22, 'triangle', 0.15));
    },
    win() {
      [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.12, 0.3, 'triangle', 0.16));
    },
    over() {
      [392, 330, 262].forEach((f, i) => tone(f, i * 0.16, 0.28, 'sine', 0.14));
    },
  };
}
