/*
  Background music: an original lofi-jazz loop generated in the browser with the Web Audio
  API (no audio files, nothing to license). Electric-piano chords over a ii-V-I-VI loop,
  a soft bass line, brushed drums with a lazy swing, the odd melody note and vinyl crackle.

  Browsers only allow sound after a tap or click, so it starts from the entry page cup
  (unless switched off) or the header button. The visitor's on/off choice is remembered.
*/
(function () {
  const BPM = 72;
  const EIGHTH = 60 / BPM / 2;
  const SWING = EIGHTH * 0.3;
  // One chord per bar, as MIDI notes. Dm9, G13, Cmaj9, A7(b9).
  const BARS = [
    { root: 38, chord: [53, 57, 60, 64], scale: [62, 65, 67, 69, 72, 74, 76] },
    { root: 43, chord: [53, 57, 59, 64], scale: [62, 64, 67, 71, 74, 76, 79] },
    { root: 36, chord: [52, 55, 59, 62], scale: [64, 67, 69, 71, 72, 74, 76] },
    { root: 45, chord: [55, 58, 61, 64], scale: [61, 64, 67, 69, 70, 73, 76] },
  ];

  let ctx, master, keys, drums, lead, noise, crackle, timer;
  let playing = false;
  let step = 0;
  let nextTime = 0;

  const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
  const prefOn = () => {
    try { return localStorage.getItem("music") !== "off"; } catch { return true; }
  };
  const savePref = (on) => {
    try { localStorage.setItem("music", on ? "on" : "off"); } catch {}
  };

  function setup() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();

    master = ctx.createGain();
    master.gain.value = 0;
    const tape = ctx.createBiquadFilter();
    tape.type = "lowpass";
    tape.frequency.value = 3200;
    const glue = ctx.createDynamicsCompressor();
    glue.threshold.value = -20;
    glue.ratio.value = 3;
    tape.connect(glue).connect(master).connect(ctx.destination);

    keys = ctx.createBiquadFilter();
    keys.type = "lowpass";
    keys.frequency.value = 1800;
    keys.connect(tape);

    drums = ctx.createGain();
    drums.gain.value = 0.8;
    drums.connect(tape);

    // Melody notes get a soft echo.
    lead = ctx.createGain();
    lead.gain.value = 0.5;
    const echo = ctx.createDelay();
    echo.delayTime.value = EIGHTH * 3;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.32;
    const echoTone = ctx.createBiquadFilter();
    echoTone.type = "lowpass";
    echoTone.frequency.value = 1500;
    lead.connect(tape);
    lead.connect(echo).connect(echoTone).connect(feedback).connect(echo);
    echoTone.connect(tape);

    // Shared white noise for drums.
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const n = noise.getChannelData(0);
    for (let i = 0; i < n.length; i++) n[i] = Math.random() * 2 - 1;

    // Vinyl: faint hiss with sparse clicks, looped.
    const vinyl = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
    const v = vinyl.getChannelData(0);
    for (let i = 0; i < v.length; i++) {
      v[i] = (Math.random() * 2 - 1) * 0.0015;
      if (Math.random() < 0.00008) v[i] += (Math.random() < 0.5 ? -1 : 1) * (0.08 + Math.random() * 0.12);
    }
    crackle = ctx.createBufferSource();
    crackle.buffer = vinyl;
    crackle.loop = true;
    const vinylTone = ctx.createBiquadFilter();
    vinylTone.type = "bandpass";
    vinylTone.frequency.value = 2500;
    vinylTone.Q.value = 0.5;
    const vinylGain = ctx.createGain();
    vinylGain.gain.value = 0.12;
    crackle.connect(vinylTone).connect(vinylGain).connect(master);
    crackle.start();
  }

  // Electric piano: a sine carrier with a decaying FM bell on the attack.
  function epiano(midi, t, dur, vel) {
    const f = hz(midi);
    const car = ctx.createOscillator();
    const mod = ctx.createOscillator();
    const modGain = ctx.createGain();
    const amp = ctx.createGain();
    car.frequency.value = f;
    mod.frequency.value = f;
    modGain.gain.setValueAtTime(f * 1.4, t);
    modGain.gain.exponentialRampToValueAtTime(f * 0.08, t + 0.6);
    mod.connect(modGain).connect(car.frequency);
    amp.gain.setValueAtTime(0, t);
    amp.gain.linearRampToValueAtTime(vel, t + 0.012);
    amp.gain.exponentialRampToValueAtTime(vel * 0.35, t + 1.2);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    car.connect(amp).connect(keys);
    car.start(t); mod.start(t);
    car.stop(t + dur + 0.05); mod.stop(t + dur + 0.05);
  }

  function bass(midi, t, dur, vel) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "triangle";
    o.frequency.value = hz(midi);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vel, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(keys);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  function pluck(midi, t, vel) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "triangle";
    o.frequency.value = hz(midi);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vel, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    o.connect(g).connect(lead);
    o.start(t);
    o.stop(t + 1);
  }

  function kick(t) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.setValueAtTime(110, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.14);
    g.gain.setValueAtTime(0.55, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    o.connect(g).connect(drums);
    o.start(t);
    o.stop(t + 0.4);
  }

  function hiss(t, type, freq, vel, decay) {
    const s = ctx.createBufferSource();
    const f = ctx.createBiquadFilter();
    const g = ctx.createGain();
    s.buffer = noise;
    f.type = type;
    f.frequency.value = freq;
    g.gain.setValueAtTime(vel, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    s.connect(f).connect(g).connect(drums);
    s.start(t, Math.random() * 0.5);
    s.stop(t + decay + 0.05);
  }

  function schedule(i, t) {
    const pos = i % 8;
    const bar = BARS[Math.floor(i / 8) % BARS.length];
    const next = BARS[(Math.floor(i / 8) + 1) % BARS.length];
    const when = t + (pos % 2 ? SWING : 0);

    if (pos === 0) bar.chord.forEach((m, k) => epiano(m, when + k * 0.012, EIGHTH * 7.5, 0.07));
    if (pos === 5 && Math.random() < 0.4) bar.chord.slice(1).forEach((m) => epiano(m + 12, when, EIGHTH * 2, 0.025));

    if (pos === 0) bass(bar.root, when, EIGHTH * 3, 0.3);
    if (pos === 4) bass(bar.root + 7, when, EIGHTH * 2, 0.22);
    if (pos === 7) bass(next.root + (Math.random() < 0.5 ? 1 : -1), when, EIGHTH, 0.18);

    if (pos === 0 || pos === 5) kick(when);
    if (pos === 2 || pos === 6) hiss(when, "bandpass", 1500, 0.07, 0.18);
    if (pos % 2 === 0) hiss(when, "highpass", 8000, 0.006 + Math.random() * 0.006, 0.04);

    if (pos !== 0 && Math.random() < 0.22) {
      const m = bar.scale[Math.floor(Math.random() * bar.scale.length)];
      pluck(m + 12, when, 0.05);
    }
  }

  function tick() {
    while (nextTime < ctx.currentTime + 0.25) {
      schedule(step, nextTime);
      step++;
      nextTime += EIGHTH;
    }
  }

  function start() {
    if (playing) return;
    if (!ctx) setup();
    ctx.resume();
    playing = true;
    nextTime = ctx.currentTime + 0.1;
    timer = setInterval(tick, 40);
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 2.5);
    sync();
  }

  function stop() {
    if (!playing) return;
    playing = false;
    clearInterval(timer);
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
    setTimeout(() => !playing && ctx.suspend(), 700);
    sync();
  }

  // ---------- Controls ----------
  const NOTE_ON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg>';
  const NOTE_OFF = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/><path d="M3 3l18 18"/></svg>';

  function sync() {
    const btn = document.getElementById("music-toggle");
    if (btn) {
      btn.innerHTML = playing ? NOTE_ON : NOTE_OFF;
      btn.setAttribute("aria-pressed", playing);
      btn.setAttribute("aria-label", playing ? "Turn music off" : "Turn music on");
      btn.title = btn.getAttribute("aria-label");
    }
  }

  document.getElementById("music-toggle")?.addEventListener("click", () => {
    playing ? stop() : start();
    savePref(playing);
    sync();
  });
  sync();

  window.Music = {
    // Called from the entry page tap: play if the visitor hasn't switched it off.
    startIfWanted() {
      if (prefOn()) start();
    },
  };
})();
