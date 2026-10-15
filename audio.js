/**
 * CyberSnake - Audio Synthesizer Engine v2.0
 * Generates retro 8-bit arcade sound effects and chiptune BGM dynamically via Web Audio API.
 * 100% standalone, zero external audio assets required.
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.sfxEnabled = true;
    this.bgmEnabled = true;

    // BGM Sequencer state
    this.bgmTimer = null;
    this.bgmStep = 0;
    this.bgmBpm = 128;
    this.isPlayingBgm = false;

    // Bassline and lead melodies (note frequencies in Hz)
    // A minor arcade synth progression (Am - F - C - G)
    this.bassNotes = [
      110, 110, 110, 110, 110, 110, 110, 164.81, // A2 -> E3
      87.31, 87.31, 87.31, 87.31, 87.31, 87.31, 87.31, 130.81, // F2 -> C3
      130.81, 130.81, 130.81, 130.81, 130.81, 130.81, 130.81, 196, // C3 -> G3
      98, 98, 98, 98, 98, 98, 98, 146.83 // G2 -> D3
    ];

    this.leadNotes = [
      440, 0, 523.25, 0, 659.25, 0, 587.33, 523.25,
      349.23, 0, 440, 0, 523.25, 0, 440, 0,
      523.25, 0, 659.25, 0, 783.99, 0, 659.25, 0,
      392, 0, 493.88, 0, 587.33, 0, 659.25, 587.33
    ];
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound() {
    this.sfxEnabled = !this.sfxEnabled;
    return this.sfxEnabled;
  }

  toggleBgm() {
    this.bgmEnabled = !this.bgmEnabled;
    if (!this.bgmEnabled) {
      this.stopBgm();
    } else if (this.isPlayingBgm) {
      this.startBgm();
    }
    return this.bgmEnabled;
  }

  // Play a simple synthesized retro tone
  playTone(freq, type, duration, startTime = 0, gainLevel = 0.1) {
    if (!this.sfxEnabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);

      gain.gain.setValueAtTime(gainLevel, this.ctx.currentTime + startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + startTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + startTime);
      osc.stop(this.ctx.currentTime + startTime + duration);
    } catch (e) {
      console.warn("Audio playTone error:", e);
    }
  }

  // --- Sound Effects ---

  // Normal Food Eaten
  playEat() {
    this.init();
    this.playTone(440, 'square', 0.08, 0, 0.12);
    this.playTone(880, 'square', 0.12, 0.05, 0.14);
  }

  // Golden Orb Eaten
  playBonus() {
    this.init();
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, index) => {
      this.playTone(freq, 'triangle', 0.1, index * 0.05, 0.18);
    });
  }

  // Power-up Acquired (Magnet, Slow-Mo, Ghost, Scissors)
  playPowerup() {
    this.init();
    const notes = [330, 415.3, 493.88, 659.25, 830.61];
    notes.forEach((freq, index) => {
      this.playTone(freq, 'sawtooth', 0.08, index * 0.04, 0.14);
    });
  }

  // Portal Teleportation Whoosh
  playPortal() {
    this.init();
    if (!this.sfxEnabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.15);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 0.3);
    } catch (e) {}
  }

  // Ghost Mode Activate
  playGhost() {
    this.init();
    const notes = [600, 650, 700, 750, 800];
    notes.forEach((freq, index) => {
      this.playTone(freq, 'sine', 0.15, index * 0.04, 0.12);
    });
  }

  // Tail Cutter Slice
  playCutTail() {
    this.init();
    if (!this.sfxEnabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1100, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.18);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 0.18);
    } catch (e) {}
  }

  // Slow-Mo Activate
  playSlowMo() {
    this.init();
    this.playTone(220, 'triangle', 0.3, 0, 0.2);
    this.playTone(110, 'triangle', 0.4, 0.1, 0.22);
  }

  // Time Attack Hurry Up Warning
  playTimeWarning() {
    this.init();
    this.playTone(880, 'square', 0.06, 0, 0.1);
    this.playTone(880, 'square', 0.06, 0.12, 0.1);
  }

  // Game Over Crash
  playGameOver() {
    this.init();
    this.stopBgm();
    const notes = [320, 260, 210, 140, 80];
    notes.forEach((freq, index) => {
      this.playTone(freq, 'sawtooth', 0.18, index * 0.09, 0.2);
    });
  }

  // Game Start Fanfare
  playGameStart() {
    this.init();
    const arpeggio = [261.63, 329.63, 392.00, 523.25];
    arpeggio.forEach((freq, index) => {
      this.playTone(freq, 'square', 0.12, index * 0.07, 0.15);
    });
  }

  // Level Up
  playLevelUp() {
    this.init();
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, index) => {
      this.playTone(freq, 'triangle', 0.15, index * 0.06, 0.16);
    });
  }

  // Direction switch tick
  playTick() {
    this.init();
    this.playTone(180, 'sine', 0.03, 0, 0.04);
  }

  // --- Chiptune Background Music Loop ---
  startBgm() {
    this.init();
    this.isPlayingBgm = true;
    if (!this.bgmEnabled || !this.ctx) return;
    this.stopBgm();
    this.isPlayingBgm = true;

    const stepInterval = (60 / this.bgmBpm / 4) * 1000; // 16th note interval in ms
    this.bgmStep = 0;

    this.bgmTimer = setInterval(() => {
      if (!this.bgmEnabled || !this.ctx || !this.isPlayingBgm) return;

      const currentBass = this.bassNotes[this.bgmStep % this.bassNotes.length];
      const currentLead = this.leadNotes[this.bgmStep % this.leadNotes.length];

      // Play soft bass note
      if (currentBass > 0) {
        this.playTone(currentBass, 'triangle', 0.1, 0, 0.045);
      }
      // Play lead melody note
      if (currentLead > 0) {
        this.playTone(currentLead, 'square', 0.08, 0, 0.035);
      }

      this.bgmStep++;
    }, stepInterval);
  }

  stopBgm() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  setBpm(bpm) {
    this.bgmBpm = Math.min(180, Math.max(100, bpm));
    if (this.isPlayingBgm && this.bgmEnabled) {
      this.startBgm();
    }
  }
}

// Global Sound instance
window.arcadeAudio = new SoundEngine();
