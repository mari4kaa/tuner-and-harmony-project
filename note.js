'use strict';

const Note = function() {
  this.noteElement = document.getElementById('note');
  this.octaveElement = document.getElementById('octave');
};

Note.prototype.displayNote = function(note, octave) {
  this.noteElement.textContent = note;
  this.octaveElement.textContent = octave;

  this.noteElement.style.display = 'block';
  this.octaveElement.style.display = 'block';
};

Note.prototype.hideNote = function() {
  this.noteElement.style.display = 'none';
  this.octaveElement.style.display = 'none';
};
