export const NOTES = [
  { name: "C",  frequency: 261.63, angle: 0 },
  { name: "C#", frequency: 277.18, angle: 30 },
  { name: "D",  frequency: 293.66, angle: 60 },
  { name: "D#", frequency: 311.13, angle: 90 },
  { name: "E",  frequency: 329.63, angle: 120 },
  { name: "F",  frequency: 349.23, angle: 150 },
  { name: "F#", frequency: 369.99, angle: 180 },
  { name: "G",  frequency: 392.00, angle: 210 },
  { name: "G#", frequency: 415.30, angle: 240 },
  { name: "A",  frequency: 440.00, angle: 270 },
  { name: "A#", frequency: 466.16, angle: 300 },
  { name: "B",  frequency: 493.88, angle: 330 }
];

export const RING_CONFIG = {
  centerX: 0.5,
  centerY: 0.5,
  radius: 0.32,
  zoneRadius: 0.07,
  rotationOffset: -90,
  // Responsive scaling
  minZoneRadius: 0.05,  // Minimum zone size for small screens
  maxZoneRadius: 0.09   // Maximum zone size for large screens
};