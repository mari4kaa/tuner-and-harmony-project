const Application = function () {
  this.tuner = new Tuner();
}

Application.prototype.start = function () {
  const self = this;
  swal.fire('Welcome to the tuner!').then(setTimeout(function () {
    self.tuner.init();
  }, 3000))
}

const app = new Application();
app.start();