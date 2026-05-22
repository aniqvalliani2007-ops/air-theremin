export class AppState {
  constructor() {
    this.currentNote = null;
    this.handDetected = false;
    this.sensitivity = 1.0;
    this.listeners = [];
  }

  subscribe(fn) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this));
  }

  updateNote(note) {
    if (this.currentNote !== note) {
      this.currentNote = note;
      this.notify();
    }
  }

  setHandDetected(detected) {
    if (this.handDetected !== detected) {
      this.handDetected = detected;
      this.notify();
    }
  }

  setSensitivity(value) {
    this.sensitivity = value;
    this.notify();
  }
}