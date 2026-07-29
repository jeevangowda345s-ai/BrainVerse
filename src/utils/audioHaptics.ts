/**
 * Web Audio API & Haptics Feedback Engine for MindForge BrainVerse
 */

class AudioHapticsEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private hapticsEnabled: boolean = true;

  constructor() {
    // Lazy init AudioContext on user interaction
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setPreferences(sound: boolean, haptics: boolean) {
    this.soundEnabled = sound;
    this.hapticsEnabled = haptics;
  }

  // --- HAPTICS ---
  public triggerHaptic(pattern: 'tap' | 'success' | 'error' | 'levelUp' | 'heavy') {
    if (!this.hapticsEnabled) return;

    // Trigger device vibration if available
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        switch (pattern) {
          case 'tap':
            navigator.vibrate(12);
            break;
          case 'success':
            navigator.vibrate([15, 30, 25]);
            break;
          case 'error':
            navigator.vibrate([40, 40, 40]);
            break;
          case 'levelUp':
            navigator.vibrate([30, 50, 40, 50, 60]);
            break;
          case 'heavy':
            navigator.vibrate(50);
            break;
        }
      } catch (e) {
        // Ignore vibration permission issues
      }
    }

    // Trigger screen subtle tactile ripple effect
    this.triggerVisualHapticEffect(pattern);
  }

  private triggerVisualHapticEffect(pattern: string) {
    if (typeof document === 'undefined') return;
    const body = document.body;
    if (!body) return;

    body.classList.remove('haptic-pulse-light', 'haptic-pulse-success', 'haptic-pulse-error');
    void body.offsetWidth; // force reflow

    if (pattern === 'tap') {
      body.classList.add('haptic-pulse-light');
    } else if (pattern === 'success' || pattern === 'levelUp') {
      body.classList.add('haptic-pulse-success');
    } else if (pattern === 'error') {
      body.classList.add('haptic-pulse-error');
    }

    setTimeout(() => {
      body.classList.remove('haptic-pulse-light', 'haptic-pulse-success', 'haptic-pulse-error');
    }, 200);
  }

  // --- AUDIO SYNTHESIZERS ---
  public playClick() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {
      // Audio fallback silent
    }
  }

  public playCorrect() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0, now + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.15);
      });
    } catch (e) {
      // silent
    }
  }

  public playError() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.2);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {
      // silent
    }
  }

  public playTileFlip(freq = 440) {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  }

  public playFanfare() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const chords = [
        [523.25, 659.25, 783.99], // C
        [587.33, 698.46, 880.00], // Dm
        [659.25, 783.99, 987.77], // Em
        [783.99, 987.77, 1174.66, 1567.98] // G / C Major
      ];

      chords.forEach((chord, step) => {
        chord.forEach((freq) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + step * 0.12);

          gain.gain.setValueAtTime(0, now + step * 0.12);
          gain.gain.linearRampToValueAtTime(0.15, now + step * 0.12 + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now + step * 0.12 + 0.3);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);

          osc.start(now + step * 0.12);
          osc.stop(now + step * 0.12 + 0.3);
        });
      });
    } catch (e) {}
  }
}

export const audioHaptics = new AudioHapticsEngine();
