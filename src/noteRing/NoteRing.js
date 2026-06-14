import { NOTES, RING_CONFIG } from './notes.config.js';

export class NoteRing {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.zones = [];
    this.center = { x: 0, y: 0 };
    this.ringRadius = 0;
  }

  updateSize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.calculateZones();
  }

  calculateZones() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const minDim = Math.min(w, h);
    
    this.center.x = w * RING_CONFIG.centerX;
    this.center.y = h * RING_CONFIG.centerY;
    this.ringRadius = minDim * RING_CONFIG.radius;
    
    // Responsive zone sizing based on screen size
    let zoneRadiusRatio = RING_CONFIG.zoneRadius;
    
    // Adjust zone size for smaller screens
    if (minDim < 500) {
      zoneRadiusRatio = RING_CONFIG.minZoneRadius;
    } else if (minDim > 1200) {
      zoneRadiusRatio = RING_CONFIG.maxZoneRadius;
    } else {
      // Linear interpolation between min and max
      const t = (minDim - 500) / (1200 - 500);
      zoneRadiusRatio = RING_CONFIG.minZoneRadius + t * (RING_CONFIG.maxZoneRadius - RING_CONFIG.minZoneRadius);
    }
    
    const zoneRadiusPx = minDim * zoneRadiusRatio;
    
    this.zones = NOTES.map(note => {
      const angleRad = ((note.angle + RING_CONFIG.rotationOffset) * Math.PI) / 180;
      return {
        ...note,
        x: this.center.x + this.ringRadius * Math.cos(angleRad),
        y: this.center.y + this.ringRadius * Math.sin(angleRad),
        radius: zoneRadiusPx,
        angle: angleRad
      };
    });
  }

  draw(activeNote, fingertip, handDetected) {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.drawRing();
    this.drawZones(activeNote);
    if (fingertip && handDetected) this.drawCursor(fingertip);
  }

  drawRing() {
    this.ctx.beginPath();
    this.ctx.arc(this.center.x, this.center.y, this.ringRadius, 0, Math.PI * 2);
    this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
    
    this.ctx.beginPath();
    this.ctx.arc(this.center.x, this.center.y, this.ringRadius - 3, 0, Math.PI * 2);
    this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.2)';
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();
  }

  drawZones(activeNote) {
    const time = Date.now() / 1000;
    
    this.zones.forEach(zone => {
      const isActive = activeNote?.name === zone.name;
      
      // Add subtle pulse animation to active zone
      const pulseScale = isActive ? 1 + Math.sin(time * 6) * 0.08 : 1;
      const pulseRadius = zone.radius * pulseScale;
      
      this.ctx.beginPath();
      this.ctx.arc(zone.x, zone.y, pulseRadius, 0, Math.PI * 2);
      
      if (isActive) {
        const grad = this.ctx.createRadialGradient(
          zone.x - 5, zone.y - 5, 5, 
          zone.x, zone.y, pulseRadius
        );
        grad.addColorStop(0, 'rgba(255, 215, 0, 0.95)');
        grad.addColorStop(0.6, 'rgba(255, 150, 0, 0.7)');
        grad.addColorStop(1, 'rgba(255, 100, 0, 0.5)');
        this.ctx.fillStyle = grad;
        this.ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
        this.ctx.shadowBlur = 15;
      } else {
        this.ctx.fillStyle = 'rgba(30, 30, 60, 0.7)';
        this.ctx.shadowBlur = 0;
      }
      
      this.ctx.fill();
      this.ctx.strokeStyle = isActive ? 'rgba(255, 215, 0, 0.9)' : 'rgba(255, 215, 0, 0.5)';
      this.ctx.lineWidth = isActive ? 2.5 : 2;
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;
      
      // Note label
      this.ctx.font = `${Math.max(12, zone.radius * 0.45)}px "Inter", monospace`;
      this.ctx.fillStyle = isActive ? '#fff' : '#ffd700';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(zone.name, zone.x, zone.y);
    });
  }

  drawCursor(pos) {
    const x = pos.x * this.canvas.width;
    const y = pos.y * this.canvas.height;
    
    // Outer glow
    const glowGrad = this.ctx.createRadialGradient(x, y, 0, x, y, 28);
    glowGrad.addColorStop(0, 'rgba(255, 100, 100, 0.4)');
    glowGrad.addColorStop(1, 'rgba(255, 100, 100, 0)');
    this.ctx.beginPath();
    this.ctx.arc(x, y, 28, 0, Math.PI * 2);
    this.ctx.fillStyle = glowGrad;
    this.ctx.fill();
    
    // Main ring
    this.ctx.beginPath();
    this.ctx.arc(x, y, 14, 0, Math.PI * 2);
    this.ctx.strokeStyle = 'rgba(255, 100, 100, 0.9)';
    this.ctx.lineWidth = 2.5;
    this.ctx.stroke();
    
    // Inner dot with gradient
    const dotGrad = this.ctx.createRadialGradient(x - 2, y - 2, 0, x, y, 5);
    dotGrad.addColorStop(0, 'rgba(255, 150, 150, 1)');
    dotGrad.addColorStop(1, 'rgba(255, 100, 100, 0.9)');
    this.ctx.beginPath();
    this.ctx.arc(x, y, 5, 0, Math.PI * 2);
    this.ctx.fillStyle = dotGrad;
    this.ctx.fill();
    
    // Center highlight
    this.ctx.beginPath();
    this.ctx.arc(x, y, 2, 0, Math.PI * 2);
    this.ctx.fillStyle = '#fff';
    this.ctx.fill();
  }
}