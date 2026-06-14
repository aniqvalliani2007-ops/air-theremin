export class NotePlayer {
  constructor(audioEngine) {
    this.audio = audioEngine;
    this.currentNote = null;
  }

  play(note) {
    if (!note) {
      this.stop();
      return;
    }
    
    // Always update frequency - AudioEngine handles smooth gliding
    this.audio.playNote(note.frequency);
    this.currentNote = note;
  }

  stop() {
    if (this.currentNote) {
      this.audio.stopNote();
      this.currentNote = null;
    }
  }
}