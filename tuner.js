const Tuner = function () {
  this.startfrequency = 55;
  this.chords = [
    'A',
    'A#',
    'B',
    'C',
    'D',
    'D#',
    'E',
    'F',
    'F#',
    'G',
    'G#',
  ];
  console.log('Hello from tuner');
};

Tuner.prototype.record = function () {
  const tuner = this;
  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then((stream) => {
      window.localStream = stream;
      // window.localAudio.srcObject = stream;
      // window.localAudio.autoplay = true;
      console.log('It is okay 1');

      if (tuner.analyser) {
        console.log('Analyser is okay');
      }
      if (tuner.audioCtx) {
        console.log('Ctx is okay');
      }
      if (tuner.scriptProcessor) {
        console.log('scriptProcessor is okay');
      }
      tuner.audioCtx.createMediaStreamSource(stream).connect(tuner.analyser);
      tuner.analyser.connect(tuner.scriptProcessor);
      tuner.scriptProcessor.connect(tuner.audioCtx.destination);
      console.log('Before frequency');

      tuner.scriptProcessor.addEventListener('audioprocess', () => {
        console.log('Inside the eventListener');
        const frequency = tuner.getFrequency();
        if (frequency) {
          const note = tuner.findNote(frequency);
          console.log('Frequency:', frequency);
          console.log('Note number: ', note);
          console.log('Note:', tuner.chords[(note % 12) + 1]);
        }
      });
    })
    .catch((err) => {
      console.error(`Error: ${err}`);
    });
};

Tuner.prototype.init = function () {
  console.log('Init started');
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  this.audioCtx = new window.AudioContext();
  this.analyser = this.audioCtx.createAnalyser();
  this.scriptProcessor = this.audioCtx.createScriptProcessor(
    4096,
    1,
    1,
  );
  this.record();
};

Tuner.prototype.findNote = function (frequency) {
  const note = 12 * (Math.log(frequency / this.startfrequency) / Math.log(2));
  return note;
};

Tuner.prototype.getFrequency = function () {
  const bufferLength = this.analyser.frequencyBinCount;
  const data = new Uint8Array(bufferLength);
  this.analyser.getByteFrequencyData(data);
  const maxFrequencyIndex = data.indexOf(Math.max(...data));
  const frequency = (maxFrequencyIndex * this.audioCtx.sampleRate) / bufferLength;
  return frequency;
};

const tuner = new Tuner();
setTimeout(() => tuner.init(), 5000);