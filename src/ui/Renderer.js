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
    this.currentNoteName = null;
    this.lastNoteName = null;
    this.stabilityCounter = 0;
    this.stabilityThreshold = 2; // require 2 frames of same note
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
    // 60fps Dynamic EMA Smoothing Logic (Fast for large movements, smooth for small)
    if (this.targetFingertip) {
      if (!this.fingertip) {
        this.fingertip = { x: this.targetFingertip.x, y: this.targetFingertip.y };
      } else {
        const dx = this.targetFingertip.x - this.fingertip.x;
        const dy = this.targetFingertip.y - this.fingertip.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Dynamic alpha: if distance is large, alpha approaches 0.6 (fast). If small, approaches 0.15 (smooth).
        const alpha = Math.min(0.6, Math.max(0.15, dist * 5));
        
        this.fingertip.x += dx * alpha;
        this.fingertip.y += dy * alpha;
      }
    } else {
      this.fingertip = null;
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
    // else: finger is visible but between zones — keep last note playing, do nothing

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