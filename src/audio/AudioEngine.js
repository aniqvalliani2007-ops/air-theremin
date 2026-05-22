export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.currentOsc = null;
    this.currentGain = null;
    this.currentFreq = null;
    this.waveform = 'sine';
    this.volume = 0.65;
  }

  async init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.volume;
    this.masterGain.connect(this.ctx.destination);
  }

  playNote(freq) {
    if (!this.ctx) return false;

    // Resume audio context if suspended
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(err => console.warn('Failed to resume audio context:', err));
    }

    // If already playing the same note, just update frequency
    if (this.currentOsc && this.currentFreq === freq) {
      this.currentOsc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      return true;
    }

    // Stop previous note if different
    if (this.currentOsc) {
      this.stopNote();
    }

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = this.waveform;
      osc.frequency.value = freq;

      gain.gain.value = 0;
      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      gain.gain.linearRampToValueAtTime(0.35, this.ctx.currentTime + 0.02);

      this.currentOsc = osc;
      this.currentGain = gain;
      this.currentFreq = freq;
      return true;
    } catch (err) {
      console.error('Error playing note:', err);
      return false;
    }
  }

  stopNote() {
    if (!this.currentOsc || !this.currentGain) return;

    const now = this.ctx.currentTime;
    this.currentGain.gain.linearRampToValueAtTime(0, now + 0.08);

    setTimeout(() => {
      try {
        this.currentOsc?.stop();
      } catch (err) {
        // Oscillator might already be stopped
      }
      this.currentOsc = null;
      this.currentGain = null;
      this.currentFreq = null;
    }, 100);
  }

  setWaveform(type) {
    this.waveform = type;
    if (this.currentOsc) this.currentOsc.type = type;
  }

  setVolume(value) {
    this.volume = value / 100;
    if (this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(this.volume, this.ctx?.currentTime + 0.1);
    }
  }

  async resume() {
    if (!this.ctx) return false;
    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
        return true;
      } catch (err) {
        console.error('Failed to resume audio context:', err);
        return false;
      }
    }
    return true;
  }
}