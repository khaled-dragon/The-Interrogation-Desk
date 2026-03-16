const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
let masterGain = null;
let musicOscillators = [];
let musicPlaying = false;

function initAudio() {
  if (audioCtx) return;
  audioCtx = new AudioCtx();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.18;
  masterGain.connect(audioCtx.destination);
}

function startAmbientMusic(stressLevel = 0) {
  if (!audioCtx) return;
  stopAmbientMusic();
  musicPlaying = true;

  const tempo = 60 + (stressLevel / 100) * 60; 
  const interval = (60 / tempo) * 1000;

  const notes = [55, 58, 62, 65]; 
  const baseFreqs = notes.map(n => 440 * Math.pow(2, (n - 69) / 12));

  function playBeat() {
    if (!musicPlaying) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.value = 400 + stressLevel * 8;

    osc.type = 'triangle';
    osc.frequency.value = baseFreqs[Math.floor(Math.random() * baseFreqs.length)];

    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.9);

    musicOscillators.push(osc);
  }

  playBeat();
  musicOscillators.push(setInterval(playBeat, interval));
}

function stopAmbientMusic() {
  musicPlaying = false;
  musicOscillators.forEach(o => { try { if (typeof o.stop === 'function') o.stop(); else clearInterval(o); } catch(e){} });
  musicOscillators = [];
}

function playSFX(type) {
  if (!audioCtx) return;
  switch(type) {
    case 'slam': playSlamSFX(); break;
    case 'tick': playTickSFX(); break;
    case 'confession': playConfessionSFX(); break;
    case 'whoosh': playWhooshSFX(); break;
    case 'ding': playDingSFX(); break;
  }
}

function playSlamSFX() {
  const duration = 0.4;
  const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * duration, audioCtx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    const t = i / audioCtx.sampleRate;
    data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 15) * 0.9;
  }
  const source = audioCtx.createBufferSource();
  source.buffer = buf;
  const gain = audioCtx.createGain();
  gain.gain.value = 0.7;
  source.connect(gain);
  gain.connect(masterGain);
  source.start();
}

function playTickSFX() {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.frequency.value = 1200;
  osc.type = 'square';
  gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
  osc.connect(gain); gain.connect(masterGain);
  osc.start(); osc.stop(audioCtx.currentTime + 0.05);
}

function playConfessionSFX() {
  [523, 659, 784, 1047].forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = freq;
    osc.type = 'sine';
    const t = audioCtx.currentTime + i * 0.15;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    osc.connect(gain); gain.connect(masterGain);
    osc.start(t); osc.stop(t + 0.6);
  });
}

function playWhooshSFX() {
  const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.3, audioCtx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / data.length * 5) * 0.3;
  }
  const source = audioCtx.createBufferSource();
  source.buffer = buf;
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 800;
  const gain = audioCtx.createGain();
  gain.gain.value = 0.3;
  source.connect(filter); filter.connect(gain); gain.connect(masterGain);
  source.start();
}

function playDingSFX() {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.frequency.value = 880;
  osc.type = 'sine';
  gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
  osc.connect(gain); gain.connect(masterGain);
  osc.start(); osc.stop(audioCtx.currentTime + 1.3);
}

