'use strict';

const Application = function() {
  this.tuner = new Tuner();
  this.meter = new Meter();
};

Application.prototype.start = function() {
  const self = this;

  self.tuner.onCaptured = function(noteData) {
    self.update(noteData);
  };

  swal.fire({
    title: 'Welcome to the guitar tuner!',
    showCancelButton: true,
    confirmButtonText: 'OK',
    allowOutsideClick: false
  }).then((result) => {
    if (result.isConfirmed) {
      self.tuner.init();
    }
  });
};

Application.prototype.update = function(noteData) {
  hideNote();
  displayNote(noteData.note, noteData.octave);
  this.meter.update(noteData.delta);
};

const app = new Application();
app.start();
