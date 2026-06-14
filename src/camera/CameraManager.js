export class CameraManager {
  constructor(videoElement) {
    this.video = videoElement;
    this.stream = null;
  }

  async init() {
    try {
      // Try front-facing camera first (better for hand gestures)
      const constraints = {
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30, max: 60 }
        }
      };
      
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.video.srcObject = this.stream;
      await this.video.play();
      return true;
    } catch (err) {
      console.warn('Front camera failed, trying default:', err);
      try {
        // Fallback to any available camera
        const constraints = { 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        };
        this.stream = await navigator.mediaDevices.getUserMedia(constraints);
        this.video.srcObject = this.stream;
        await this.video.play();
        return true;
      } catch (fallbackErr) {
        throw new Error('Camera access denied or not available. Please allow camera permissions.');
      }
    }
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }
}