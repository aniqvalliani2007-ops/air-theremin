export const LANDMARKS = {
  WRIST: 0,
  THUMB_TIP: 4,
  INDEX_TIP: 8,
  MIDDLE_TIP: 12,
  RING_TIP: 16,
  PINKY_TIP: 20
};

export function getFingertip(landmarks, finger = LANDMARKS.INDEX_TIP) {
  if (!landmarks || landmarks.length <= finger) return null;
  return landmarks[finger];
}

export function normalizePosition(point, mirrorX = true) {
  if (!point) return null;
  return {
    x: mirrorX ? 1 - point.x : point.x,
    y: point.y
  };
}