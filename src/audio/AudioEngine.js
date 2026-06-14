export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.currentOsc = null;
    this.currentGain = null;
    this.currentFreq = null;
    this.waveform = 'sine';
    this.volume = 0.65;
    this.isPlaying = false;
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

    const now = this.ctx.currentTime;

    // If already playing, smoothly glide to new frequency
    if (this.currentOsc && this.isPlaying) {
      // Exponential ramp for smooth pitch transition
      this.currentOsc.frequency.cancelScheduledValues(now);
      this.currentOsc.frequency.setValueAtTime(this.currentFreq || freq, now);
      this.currentOsc.frequency.exponentialRampToValueAtTime(freq, now + 0.08);
      this.currentFreq = freq;
      return true;
    }

    // Start new oscillator if not playing
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = this.waveform;
      osc.frequency.value = freq;

      gain.gain.value = 0;
      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      
      // Smooth fade in to prevent clicks
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.05);

      this.currentOsc = osc;
      this.currentGain = gain;
      this.currentFreq = freq;
      this.isPlaying = true;
      return true;
    } catch (err) {
      console.error('Error playing note:', err);
      return false;
    }
  }

  stopNote() {
    if (!this.currentOsc || !this.currentGain || !this.isPlaying) return;

    const now = this.ctx.currentTime;
    
    // Smooth fade out to prevent clicks
    this.currentGain.gain.cancelScheduledValues(now);
    this.currentGain.gain.setValueAtTime(this.currentGain.gain.value, now);
    this.currentGain.gain.linearRampToValueAtTime(0, now + 0.1);

    this.isPlaying = false;

    setTimeout(() => {
      try {
        this.currentOsc?.stop();
      } catch (err) {
        // Oscillator might already be stopped
      }
      this.currentOsc = null;
      this.currentGain = null;
      this.currentFreq = null;
    }, 120);
  }

  setWaveform(type) {
    this.waveform = type;
    if (this.currentOsc) this.currentOsc.type = type;
  }

  setVolume(value) {
    this.volume = value / 100;
    if (this.masterGain) {
      const now = this.ctx?.currentTime || 0;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(this.volume, now + 0.1);
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