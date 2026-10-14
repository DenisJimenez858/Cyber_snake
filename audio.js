/**
 * CyberSnake - Audio Synthesizer Engine
 * Generates retro 8-bit arcade sound effects dynamically via Web Audio API.
 * No external media dependencies required.
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
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
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // Play a simple synthesized retro tone
  playTone(freq, type, duration, startTime = 0, gainLevel = 0.1) {
    if (!this.enabled || !this.ctx) return;
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

  // Sound: Normal Food Eaten
  playEat() {
    this.init();
    this.playTone(440, 'square', 0.08, 0, 0.12);
    this.playTone(880, 'square', 0.12, 0.05, 0.14);
  }

  // Sound: Special Golden Orb Eaten
  playBonus() {
    this.init();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      this.playTone(freq, 'triangle', 0.1, index * 0.05, 0.18);
    });
  }

  // Sound: Game Over Crash
  playGameOver() {
    this.init();
    const notes = [320, 260, 210, 140, 80];
    notes.forEach((freq, index) => {
      this.playTone(freq, 'sawtooth', 0.18, index * 0.09, 0.2);
    });
  }

  // Sound: Game Start Fanfare
  playGameStart() {
    this.init();
    const arpeggio = [261.63, 329.63, 392.00, 523.25];
    arpeggio.forEach((freq, index) => {
      this.playTone(freq, 'square', 0.12, index * 0.07, 0.15);
    });
  }

  // Sound: Level Up
  playLevelUp() {
    this.init();
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, index) => {
      this.playTone(freq, 'triangle', 0.15, index * 0.06, 0.16);
    });
  }

  // Sound: Direction switch tick
  playTick() {
    this.init();
    this.playTone(180, 'sine', 0.03, 0, 0.04);
  }
}

// Global Sound instance
window.arcadeAudio = new SoundEngine();

