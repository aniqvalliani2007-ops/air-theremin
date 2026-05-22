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
    
    // Compare by name to avoid redundant calls for the same note
    if (this.currentNote && this.currentNote.name === note.name) {
      return;
    }
    
    // AudioEngine handles smooth frequency glide internally
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