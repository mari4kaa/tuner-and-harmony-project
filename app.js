const Application = function () {
  this.tuner = new Tuner();
  this.meter = new Meter();
}

Application.prototype.start = function () {
  const self = this;

  self.tuner.onCaptured = function (noteData) {
    self.update(noteData);
  }

  swal.fire('Welcome to the guitar tuner!').then(setTimeout(function () {
    self.tuner.init();
  }, 3000))
};

Application.prototype.update = function (noteData) {
  this.meter.update(noteData.delta);
};

const app = new Application();
app.start();