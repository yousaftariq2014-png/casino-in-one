/**
 * Web Audio API Sound Synthesizer for Grand Royale Casino
 * Requires no external asset downloads, works smoothly and instantaneously in all modern browsers.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private loungePlaying: boolean = false;
  private loungeInterval: any = null;
  public loungeVolume: number = 0.25;

  public isLoungePlaying(): boolean {
    return this.loungePlaying;
  }

  public toggleLoungeMusic(): boolean {
    if (this.loungePlaying) {
      this.stopLoungeMusic();
      return false;
    } else {
      this.startLoungeMusic();
      return true;
    }
  }

  public startLoungeMusic() {
    this.initCtx();
    if (!this.ctx) return;
    if (this.loungePlaying) return;
    this.loungePlaying = true;

    // A smooth, rhythmic, luxurious casino lounge chord progression:
    // Chords: Dm9 -> G13 -> Cmaj9 -> Am9 (Classic jazzy casino groove)
    const chords = [
      [293.66, 349.23, 440.00, 523.25, 659.25], // Dm9: D4, F4, A4, C5, E5
      [246.94, 329.63, 392.00, 440.00, 659.25], // G13: B3, E4, G4, A4, E5
      [261.63, 329.63, 392.00, 493.88, 587.33], // Cmaj9: C4, E4, G4, B4, D5
      [220.00, 261.63, 329.63, 392.00, 493.88], // Am9: A3, C4, E4, G4, B4
    ];
    const bassNotes = [146.83, 98.00, 130.81, 110.00]; // D3, G2, C3, A2

    let step = 0;
    const playLoungeStep = () => {
      if (!this.loungePlaying || !this.ctx) return;

      const chordIdx = Math.floor(step / 4) % chords.length;
      const beatInBar = step % 4;
      const chord = chords[chordIdx];
      const bass = bassNotes[chordIdx];
      const now = this.ctx.currentTime;

      // 1. Warm electric piano / Rhodes chord on beats 0 and 2
      if (beatInBar === 0 || beatInBar === 2.5) {
        chord.forEach((freq, i) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(1200, now);

          const vel = (beatInBar === 0 ? 0.08 : 0.05) * this.loungeVolume;
          gain.gain.setValueAtTime(vel, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now);
          osc.stop(now + 1.2);
        });
      }

      // 2. Warm acoustic upright bass on beats 0 and 2
      if (beatInBar === 0 || beatInBar === 2) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(bass, now);

        const bassVol = 0.15 * this.loungeVolume;
        bassGain.gain.setValueAtTime(bassVol, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

        bassOsc.connect(bassGain);
        bassGain.connect(this.ctx.destination);

        bassOsc.start(now);
        bassOsc.stop(now + 0.65);
      }

      // 3. Subtle casino hi-hat / jazz brush cymbal on each beat
      try {
        const bufferSize = this.ctx.sampleRate * 0.04;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let j = 0; j < bufferSize; j++) {
          data[j] = Math.random() * 2 - 1;
        }
        const hatSource = this.ctx.createBufferSource();
        hatSource.buffer = buffer;

        const hatFilter = this.ctx.createBiquadFilter();
        hatFilter.type = 'highpass';
        hatFilter.frequency.setValueAtTime(6500, now);

        const hatGain = this.ctx.createGain();
        const hatVol = (beatInBar % 2 === 1 ? 0.04 : 0.02) * this.loungeVolume;
        hatGain.gain.setValueAtTime(hatVol, now);
        hatGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

        hatSource.connect(hatFilter);
        hatFilter.connect(hatGain);
        hatGain.connect(this.ctx.destination);

        hatSource.start(now);
      } catch {}

      // 4. Occasional distant golden coin clink (casino floor ambiance)
      if (Math.random() < 0.18) {
        const clink = this.ctx.createOscillator();
        const clinkGain = this.ctx.createGain();
        clink.type = 'sine';
        const clinkFreq = 3000 + Math.random() * 2500;
        clink.frequency.setValueAtTime(clinkFreq, now + 0.1);
        clinkGain.gain.setValueAtTime(0.025 * this.loungeVolume, now + 0.1);
        clinkGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

        clink.connect(clinkGain);
        clinkGain.connect(this.ctx.destination);

        clink.start(now + 0.1);
        clink.stop(now + 0.25);
      }

      step = (step + 1) % 16;
    };

    // 110 BPM -> 545ms per quarter beat (136ms per 16th note)
    this.loungeInterval = setInterval(playLoungeStep, 320);
    playLoungeStep();
  }

  public stopLoungeMusic() {
    this.loungePlaying = false;
    if (this.loungeInterval) {
      clearInterval(this.loungeInterval);
      this.loungeInterval = null;
    }
  }

  public playChip() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // AudioContext muted/unsupported
    }
  }

  public playCardDeal() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      // Filtered noise swoosh for realistic card flip
      const bufferSize = this.ctx.sampleRate * 0.08;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, this.ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(600, this.ctx.currentTime + 0.08);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
    } catch {
      // AudioContext muted/unsupported
    }
  }

  public playSpinTick() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(900, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.02);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.02);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.02);
    } catch {
      // AudioContext muted/unsupported
    }
  }

  public playPlinkoBounce() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freq = 600 + Math.random() * 800;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {
      // AudioContext muted/unsupported
    }
  }

  public playWin() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      // Ascending celebratory major chord arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.09);

        gain.gain.setValueAtTime(0.25, this.ctx.currentTime + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.09 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + idx * 0.09);
        osc.stop(this.ctx.currentTime + idx * 0.09 + 0.25);
      });
    } catch {
      // AudioContext muted/unsupported
    }
  }

  public playBigWin() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51]; // A major triumphant fanfare
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.35, this.ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + idx * 0.08);
        osc.stop(this.ctx.currentTime + idx * 0.08 + 0.45);
      });
    } catch {
      // AudioContext muted/unsupported
    }
  }

  public playLose() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch {
      // AudioContext muted/unsupported
    }
  }

  public playRocketAscend(multiplier: number = 1) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const baseFreq = Math.min(800, 180 + Math.log2(multiplier) * 90);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(baseFreq + 25, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // AudioContext muted
    }
  }

  public playRocketCrash() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      // Noise explosion buffer
      const bufferSize = this.ctx.sampleRate * 0.35;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.12));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.35);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
    } catch {
      // muted
    }
  }

  public playGemReveal() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, this.ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch {
      // muted
    }
  }

  public playMineExplosion() {
    this.playRocketCrash();
  }

  public playCashout() {
    this.playWin();
  }
}

export const sound = new SoundManager();
