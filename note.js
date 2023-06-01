'use strict';

function displayNote (note, octave) {
  const noteElement = document.getElementById('note');
  const octaveElement = document.getElementById('octave');

  noteElement.textContent = note;
  octaveElement.textContent = octave;

  noteElement.style.display = 'block';
  octaveElement.style.display = 'block';
}
  
function hideNote () {
  const noteElement = document.getElementById('note');
  const octaveElement = document.getElementById('octave');

  noteElement.style.display = 'none';
  octaveElement.style.display = 'none';
}
