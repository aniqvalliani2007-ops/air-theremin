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
    this.center.x = w * RING_CONFIG.centerX;
    this.center.y = h * RING_CONFIG.centerY;
    this.ringRadius = Math.min(w, h) * RING_CONFIG.radius;
    const zoneRadiusPx = Math.min(w, h) * RING_CONFIG.zoneRadius;
    
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
    this.zones.forEach(zone => {
      const isActive = activeNote?.name === zone.name;
      
      this.ctx.beginPath();
      this.ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
      
      if (isActive) {
        const grad = this.ctx.createRadialGradient(zone.x - 5, zone.y - 5, 5, zone.x, zone.y, zone.radius);
        grad.addColorStop(0, 'rgba(255, 215, 0, 0.9)');
        grad.addColorStop(1, 'rgba(255, 100, 0, 0.6)');
        this.ctx.fillStyle = grad;
      } else {
        this.ctx.fillStyle = 'rgba(30, 30, 60, 0.7)';
      }
      
      this.ctx.fill();
      this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      
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
    
    this.ctx.beginPath();
    this.ctx.arc(x, y, 14, 0, Math.PI * 2);
    this.ctx.strokeStyle = 'rgba(255, 100, 100, 0.8)';
    this.ctx.lineWidth = 2.5;
    this.ctx.stroke();
    
    this.ctx.beginPath();
    this.ctx.arc(x, y, 5, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(255, 100, 100, 0.9)';
    this.ctx.fill();
    
    this.ctx.beginPath();
    this.ctx.arc(x, y, 2, 0, Math.PI * 2);
    this.ctx.fillStyle = '#fff';
    this.ctx.fill();
  }
}