const OCTAVES = 4;

const Tuner = function () {
  this.startfrequency = 65.41;
  this.AllNotes = [
    'C',
    'D',
    'D#',
    'E',
    'F',
    'F#',
    'G',
    'G#',
    'A',
    'A#',
    'B',
  ];
};

Tuner.prototype.init = async function () {
  console.log('Init started');
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  this.audioCtx = new window.AudioContext();
  this.analyser = new AnalyserNode(this.audioCtx);
  this.scriptProcessor = this.audioCtx.createScriptProcessor(
    2048,
    1,
    1,
  );
  this.analyser.connect(this.scriptProcessor);
  this.scriptProcessor.connect(this.audioCtx.destination);
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    window.localStream = stream;
    this.audioCtx.createMediaStreamSource(stream).connect(this.analyser);

    this.tune();
  } 
  catch (err) {
    console.error(`Error: ${err}`);
  }
};

Tuner.prototype.tune = function () {
  this.scriptProcessor.addEventListener('audioprocess', () => {
    console.log('Captured');
    const userFrequency = this.getUserFrequency();
    if (userFrequency) {
      this.modeAll(userFrequency);
    }
  });
};

Tuner.prototype.getUserFrequency = function () {
  const bufferLength = this.analyser.frequencyBinCount;
  const dataArray = new Float32Array(bufferLength);
  this.analyser.getFloatFrequencyData(dataArray);

  const frequencyIndex = dataArray.indexOf(Math.max(...dataArray));
  const binWidth = this.audioCtx.sampleRate / this.analyser.fftSize;
  const frequency = frequencyIndex * binWidth;

  return frequency;
}

Tuner.prototype.noteNum = function (frequency) {
  const noteNum = 12 * (Math.log(frequency / this.startfrequency) / Math.log(2));
  return Math.round(noteNum);
};

Tuner.prototype.getNoteFrequency = function (noteNum) {
  const frequency = this.startfrequency * Math.pow(2, noteNum/12);
  return frequency;
}

Tuner.prototype.nearestAllFrequency = function (frequency) {
  const minFreq = this.getNoteFrequency(0);
  const maxFreq = this.getNoteFrequency((this.AllNotes.length * OCTAVES) - 1);
  let nearestFrequency = minFreq;
  const allNotes = this.AllNotes.length * OCTAVES;
  for(let i = 0; i < allNotes; i++) {
    const prev = this.getNoteFrequency(i);
    const next = this.getNoteFrequency(i + 1);
    if(frequency >= prev && frequency <= next) {
      nearestFrequency = this.findNeighbour(frequency, prev, next);
    }
  }
  if (frequency > maxFreq) {
    nearestFrequency = maxFreq;
  }
  return nearestFrequency;
}

Tuner.prototype.findNeighbour = function (frequency, prev, next) {
  const delta_prev = frequency - prev;
  const delta_next = next - frequency;
  const neighbour = (delta_prev > delta_next)? next: prev;
  return neighbour;
}

Tuner.prototype.getOctave = function (noteNum) {
  const octave = Math.ceil(noteNum / 12) + 1;
  return octave;
}

Tuner.prototype.modeAll = function(userFrequency) {
  const nearestFrequency = this.nearestAllFrequency(userFrequency);
  const delta = Math.abs(nearestFrequency - userFrequency);
  const noteNum = this.noteNum(nearestFrequency);
  const octave = this.getOctave(noteNum);

  console.log('User frequency:', userFrequency);
  console.log('Nearest frequency:', nearestFrequency);
  console.log('Delta:', delta);
  console.log('Note:', this.AllNotes[(noteNum % 12)]);
  console.log('Octave: ', octave);
}

const tuner = new Tuner();
setTimeout(function () {
  tuner.init();
}, 2000);