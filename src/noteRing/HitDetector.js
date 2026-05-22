export class HitDetector {
  constructor(zones, canvas, sensitivity = 1.0) {
    this.zones = zones;
    this.canvas = canvas;
    this.sensitivity = Math.max(0.3, Math.min(3.0, sensitivity)); // Clamp between 0.3 and 3.0
  }

  detect(fingertip) {
    if (!fingertip || !this.zones.length) return null;
    
    const px = fingertip.x * this.canvas.width;
    const py = fingertip.y * this.canvas.height;
    
    let closest = null;
    let minDist = Infinity;
    
    // Find the closest zone within threshold
    for (const zone of this.zones) {
      const dx = px - zone.x;
      const dy = py - zone.y;
      const dist = Math.hypot(dx, dy);
      const threshold = zone.radius * this.sensitivity;
      
      if (dist < threshold && dist < minDist) {
        minDist = dist;
        closest = zone;
      }
    }
    
    return closest;
  }

  updateSensitivity(value) {
    this.sensitivity = Math.max(0.3, Math.min(3.0, value)); // Clamp for safety
  }

  updateZones(zones) {
    this.zones = zones;
  }
}