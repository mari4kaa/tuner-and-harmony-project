'use strict';

const config = {
  mode: 'standardAuto',
  selectedString: 1,
};

const Tuner = function() {
  this.START_FREQUENCY = 65.41;
  this.OCTAVES = 4;
  this.MIN_DECIBELS = -50;
  this.TOTAL_NOTES_COUNT = 12;
  this.AllNotes = [
    'C',
    'C#',
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
  this.StandardTune = [
    ['E', 2],
    ['A', 2],
    ['D', 3],
    ['G', 3],
    ['B', 3],
    ['E', 4],
  ];
};

Tuner.prototype.init = async function() {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  this.audioCtx = new window.AudioContext();
  this.analyser = new AnalyserNode(this.audioCtx);
  this.scriptProcessor = this.audioCtx.createScriptProcessor(
    4096,
    1,
    1,
  );
  this.analyser.connect(this.scriptProcessor);
  this.scriptProcessor.connect(this.audioCtx.destination);
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    window.localStream = stream;
    this.audioCtx.createMediaStreamSource(stream).connect(this.analyser);
  } catch (err) {
    console.error(`Error: ${err}`);
  }
};

Tuner.prototype.tune = function() {
  this.scriptProcessor.addEventListener('audioprocess', () => {
    const userFrequency = this.getUserFrequency();
    if (userFrequency) {
      let noteData;
      if (config.mode !== 'standardStrict') {
        noteData = this.autoModes(userFrequency, config.mode);
      } else {
        const stringIdx = this.StandardTune.length - config.selectedString;
        noteData = this.modeStandardStrict(userFrequency, stringIdx);
      }
      this.onCaptured(noteData);
    }
  });
};

Tuner.prototype.getUserFrequency = function() {
  const bufferLength = this.analyser.frequencyBinCount;
  const dataArray = new Float32Array(bufferLength);
  this.analyser.getFloatFrequencyData(dataArray);

  const maxVolumeIndex = dataArray.indexOf(Math.max(...dataArray));
  const binWidth = this.audioCtx.sampleRate / this.analyser.fftSize;
  const userFrequency = maxVolumeIndex * binWidth;
  if (dataArray[maxVolumeIndex] > this.MIN_DECIBELS) return userFrequency;
  return undefined;
};

Tuner.prototype.noteNum = function(frequency) {
  const octaveCoef = Math.log(frequency / this.START_FREQUENCY) / Math.log(2);
  const noteNum = this.TOTAL_NOTES_COUNT * octaveCoef;
  return Math.round(noteNum);
};

Tuner.prototype.standardNoteNum = function(noteName, noteOctave) {
  const noteIdx = this.AllNotes.indexOf(noteName);
  const relativeOctave = noteOctave - 1;
  const noteNum = noteIdx + this.TOTAL_NOTES_COUNT * (relativeOctave - 1);
  return noteNum;
};

Tuner.prototype.getOctave = function(noteNum) {
  const octave = Math.ceil(noteNum / this.TOTAL_NOTES_COUNT) + 1;
  return octave;
};

Tuner.prototype.getNoteFrequency = function(noteNum) {
  const frequencyCoef = Math.pow(2, noteNum / this.TOTAL_NOTES_COUNT);
  const frequency = this.START_FREQUENCY * frequencyCoef;
  return frequency;
};

Tuner.prototype.targetFrequencyAllNotes = function(frequency) {
  const minFreq = this.getNoteFrequency(0);
  const maxFreq = this.getNoteFrequency((this.AllNotes.length * this.OCTAVES) - 1);

  if (frequency <= minFreq) return minFreq;
  if (frequency >= maxFreq) return maxFreq;

  const allNotes = this.AllNotes.length * this.OCTAVES;
  for (let i = 0; i < allNotes - 1; i++) {
    const prev = this.getNoteFrequency(i);
    const next = this.getNoteFrequency(i + 1);
    if (frequency >= prev && frequency <= next) {
      const targetFrequency = this.findNeighbour(frequency, prev, next);
      return targetFrequency;
    }
  }
};

Tuner.prototype.targetFrequencyStandard = function(frequency) {
  const length = this.StandardTune.length;
  const numOfMin = this.standardNoteNum(...this.StandardTune[0]);
  const numOfMax = this.standardNoteNum(...this.StandardTune[length - 1]);

  const minFreq = this.getNoteFrequency(numOfMin);
  const maxFreq = this.getNoteFrequency(numOfMax);

  if (frequency <= minFreq) return minFreq;
  if (frequency >= maxFreq) return maxFreq;

  for (let i = 0; i < length - 1; i++) {
    const standardNotePrev = this.StandardTune[i];
    const standardNoteNext = this.StandardTune[i + 1];
    const [prev, next] = this.standardFreqInterval(standardNotePrev, standardNoteNext);
    if (frequency >= prev && frequency <= next) {
      const targetFrequency = this.findNeighbour(frequency, prev, next);
      return targetFrequency;
    }
  }
};

Tuner.prototype.findNeighbour = function(frequency, prev, next) {
  const deltaPrev = frequency - prev;
  const deltaNext = next - frequency;
  const neighbour = (deltaPrev > deltaNext) ? next : prev;
  return neighbour;
};

Tuner.prototype.standardFreqInterval = function(standardNotePrev, standardNoteNext) {
  const standardNumPrev = this.standardNoteNum(...standardNotePrev);
  const standardNumNext = this.standardNoteNum(...standardNoteNext);
  const prev = this.getNoteFrequency(standardNumPrev);
  const next = this.getNoteFrequency(standardNumNext);

  return [prev, next];
};

Tuner.prototype.autoModes = function(userFrequency, mode) {
  const targetFrequency = (mode === 'allNotes') ?
    this.targetFrequencyAllNotes(userFrequency) :
    this.targetFrequencyStandard(userFrequency);

  const deltaFreq = userFrequency - targetFrequency;
  const noteNum = this.noteNum(targetFrequency);
  const noteName = this.AllNotes[noteNum % this.TOTAL_NOTES_COUNT];

  const noteData = {
    delta: deltaFreq,
    name: noteName,
    octave: this.getOctave(noteNum),
  };

  console.log(noteData);

  return noteData;
};

Tuner.prototype.modeStandardStrict = function(userFrequency, stringIdx) {
  const standardNote = this.StandardTune[stringIdx];
  const [noteName, noteOctave] = standardNote;
  const noteNum = this.standardNoteNum(noteName, noteOctave);
  const targetFrequency = this.getNoteFrequency(noteNum);
  const deltaFreq = userFrequency - targetFrequency;

  const noteData = {
    delta: deltaFreq,
    name: noteName,
    octave: noteOctave,
  };

  console.log(noteData);

  return noteData;
};
