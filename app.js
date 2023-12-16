'use strict';

const Tuner = require('./tuner.js');
const Meter = require('./meter.js');
const Note = require('./note.js');

class Application {
  constructor() {
    this.defaultConfig = {
      mode: 'standardAuto',
      selectedString: 1,
    };
    this.tuner = new Tuner(this.defaultConfig);
    this.meter = new Meter();
    this.note = new Note();
  }
}

Application.prototype.start = function() {
  const self = this;

  const onCaptured = function(noteData) {
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
      self.tuner.tune(onCaptured);
    }
  });
};

Application.prototype.update = function(noteData) {
  this.note.hideNote();
  this.note.displayNote(noteData.name, noteData.octave);
  this.meter.update(noteData.delta);
};

const app = new Application();

document.addEventListener('DOMContentLoaded', function () {
  Application.prototype.addClickListener = function (elementId, configProperties) {
    const self = this;
    document.getElementById(elementId).addEventListener('click', () => {
      Object.assign(self.tuner.config, configProperties);
    });
  }

  app.addClickListener('allNotes', { mode: 'allNotes' });
  app.addClickListener('standardAuto', { mode: 'standardAuto' });
  app.addClickListener('firstStr', { selectedString: 1, mode: 'standardStrict' });
  app.addClickListener('secondStr', { selectedString: 2, mode: 'standardStrict' });
  app.addClickListener('thirdStr', { selectedString: 3, mode: 'standardStrict' });
  app.addClickListener('fourthStr', { selectedString: 4, mode: 'standardStrict' });
  app.addClickListener('fifthStr', { selectedString: 5, mode: 'standardStrict' });
  app.addClickListener('sixthStr', { selectedString: 6, mode: 'standardStrict' });
});

app.start();
