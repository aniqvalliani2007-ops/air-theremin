import { NoteRing } from '../noteRing/NoteRing.js';
import { HitDetector } from '../noteRing/HitDetector.js';

export class Renderer {
  constructor(canvas, appState, callbacks) {
    this.canvas = canvas;
    this.appState = appState;
    this.callbacks = callbacks || {};
    this.noteRing = new NoteRing(canvas);
    this.hitDetector = null;
    this.fingertip = null;
    this.targetFingertip = null;
    this.velocityX = 0;
    this.velocityY = 0;
    this.currentNoteName = null;
    this.lastNoteName = null;
    this.stabilityCounter = 0;
    this.stabilityThreshold = 1; // Reduced from 2 for faster response
    this.rafId = null;
  }

  init() {
    this.noteRing.updateSize();
    this.hitDetector = new HitDetector(this.noteRing.zones, this.canvas, this.appState.sensitivity);
    
    window.addEventListener('resize', () => {
      this.noteRing.updateSize();
      this.hitDetector.updateZones(this.noteRing.zones);
    });
    
    this.appState.subscribe(() => this.render());
    this.startLoop();
  }

  startLoop() {
    const loop = () => {
      this.render();
      this.rafId = requestAnimationFrame(loop);
    };
    loop();
  }

  updateFingertip(fingertip) {
    this.targetFingertip = fingertip;
  }

  render() {
    // Smooth movement with momentum-based interpolation
    if (this.targetFingertip) {
      if (!this.fingertip) {
        // Initial position - instant snap
        this.fingertip = { x: this.targetFingertip.x, y: this.targetFingertip.y };
        this.velocityX = 0;
        this.velocityY = 0;
      } else {
        // Smooth interpolation with velocity tracking
        const dx = this.targetFingertip.x - this.fingertip.x;
        const dy = this.targetFingertip.y - this.fingertip.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Adaptive smoothing: faster for large movements, smoother for small
        const baseSmoothing = 0.25;
        const distanceFactor = Math.min(1, dist * 8);
        const smoothing = baseSmoothing + (distanceFactor * 0.35);
        
        // Apply smoothing with momentum
        this.velocityX = this.velocityX * 0.7 + dx * smoothing;
        this.velocityY = this.velocityY * 0.7 + dy * smoothing;
        
        this.fingertip.x += this.velocityX;
        this.fingertip.y += this.velocityY;
      }
    } else {
      this.fingertip = null;
      this.velocityX = 0;
      this.velocityY = 0;
    }

    // Hit detection using the smoothed fingertip coordinates
    const hit = this.hitDetector?.detect(this.fingertip);
    const newNoteName = hit ? hit.name : null;
    
    if (newNoteName) {
      // A note zone is hit — check stability then fire
      if (newNoteName === this.lastNoteName) {
        this.stabilityCounter++;
      } else {
        this.stabilityCounter = 0;
        this.lastNoteName = newNoteName;
      }
      
      if (this.stabilityCounter >= this.stabilityThreshold) {
        if (newNoteName !== this.currentNoteName) {
          this.currentNoteName = newNoteName;
          if (this.callbacks.onNoteChange) {
            this.callbacks.onNoteChange(hit);
          }
        }
      }
    } else if (!this.fingertip) {
      // Hand completely left the camera — stop sound
      this.stabilityCounter = 0;
      this.lastNoteName = null;
      if (this.currentNoteName !== null) {
        this.currentNoteName = null;
        if (this.callbacks.onNoteChange) {
          this.callbacks.onNoteChange(null);
        }
      }
    }
    // else: finger is visible but between zones — keep last note playing

    this.noteRing.draw(
      this.appState.currentNote,
      this.fingertip,
      this.appState.handDetected
    );
  }

  updateSensitivity(value) {
    this.hitDetector?.updateSensitivity(value);
  }
}