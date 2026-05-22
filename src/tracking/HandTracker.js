import { Hands } from '@mediapipe/hands';

export class HandTracker {
  constructor(videoElement, onFingertipUpdate, onHandStatus) {
    this.video = videoElement;
    this.onFingertipUpdate = onFingertipUpdate;
    this.onHandStatus = onHandStatus;
    this.hands = null;
    this.isRunning = false;
    this.rafId = null;
  }

  init() {
    this.hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    this.hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    this.hands.onResults((results) => this.handleResults(results));
    this.startTracking();
  }

  handleResults(results) {
    if (!this.isRunning) return;
    
    if (results.multiHandLandmarks?.length > 0) {
      const fingertip = results.multiHandLandmarks[0][8];
      const mirroredX = 1 - fingertip.x;
      const clampedX = Math.max(0, Math.min(1, mirroredX));
      const clampedY = Math.max(0, Math.min(1, fingertip.y));
      
      this.onFingertipUpdate({ x: clampedX, y: clampedY });
      this.onHandStatus?.(true);
    } else {
      this.onFingertipUpdate(null);
      this.onHandStatus?.(false);
    }
  }

  startTracking() {
    this.isRunning = true;
    
    const processFrame = async () => {
      if (!this.isRunning) return;
      if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
        await this.hands.send({ image: this.video });
      }
      this.rafId = requestAnimationFrame(processFrame);
    };
    
    processFrame();
  }

  stop() {
    this.isRunning = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.hands?.close();
  }
}