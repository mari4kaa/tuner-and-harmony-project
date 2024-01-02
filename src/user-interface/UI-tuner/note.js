'use strict';

class Note {
  constructor() {
    this.noteElement = document.getElementById('note');
    this.octaveElement = document.getElementById('octave');
  }

  displayNote(note, octave) {
    this.noteElement.textContent = note;
    this.octaveElement.textContent = octave;

    this.noteElement.style.display = 'block';
    this.octaveElement.style.display = 'block';
  }

  hideNote() {
    this.noteElement.style.display = 'none';
    this.octaveElement.style.display = 'none';
  }
}

module.exports = Note;
