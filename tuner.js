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
    ['E', 1],
    ['A', 1],
    ['D', 2],
    ['G', 2],
    ['B', 2],
    ['E', 3],
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

    this.tune();
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
        const stringNum = this.StandardTune.length;
        noteData = this.modeStandardStrict(userFrequency, stringNum - config.selectedString);
      }
      this.onCaptured(noteData);
    }
  });
};

Tuner.prototype.getUserFrequency = function() {
  const bufferLength = this.analyser.frequencyBinCount;
  const dataArray = new Float32Array(bufferLength);
  this.analyser.getFloatFrequencyData(dataArray);

  const frequencyIndex = dataArray.indexOf(Math.max(...dataArray));
  const binWidth = this.audioCtx.sampleRate / this.analyser.fftSize;
  const userFrequency = frequencyIndex * binWidth;
  if (dataArray[frequencyIndex] > this.MIN_DECIBELS) return userFrequency;
  return undefined;
};

Tuner.prototype.noteNum = function(frequency) {
  const noteNum = this.TOTAL_NOTES_COUNT * (Math.log(frequency / this.START_FREQUENCY) / Math.log(2));
  return Math.round(noteNum);
};

Tuner.prototype.standardNoteNum = function(chord, octave) {
  const noteNum = this.AllNotes.indexOf(chord) + this.TOTAL_NOTES_COUNT * (octave - 1);
  return noteNum;
};

Tuner.prototype.getNoteFrequency = function(noteNum) {
  const frequency = this.START_FREQUENCY * Math.pow(2, noteNum / this.TOTAL_NOTES_COUNT);
  return frequency;
};

Tuner.prototype.nearestAllFrequency = function(frequency) {
  const minFreq = this.getNoteFrequency(0);
  const maxFreq = this.getNoteFrequency((this.AllNotes.length * this.OCTAVES) - 1);

  if (frequency <= minFreq) return minFreq;
  if (frequency >= maxFreq) return maxFreq;

  const allNotes = this.AllNotes.length * this.OCTAVES;
  for (let i = 0; i < allNotes - 1; i++) {
    const prev = this.getNoteFrequency(i);
    const next = this.getNoteFrequency(i + 1);
    if (frequency >= prev && frequency <= next) {
      const nearestFrequency = this.findNeighbour(frequency, prev, next);
      return nearestFrequency;
    }
  }
};

Tuner.prototype.nearestStandardFrequency = function(frequency) {
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
    const [prev, next] = this.standardPrevAndNext(standardNotePrev, standardNoteNext);
    if (frequency >= prev && frequency <= next) {
      const nearestFrequency = this.findNeighbour(frequency, prev, next);
      return nearestFrequency;
    }
  }
};

Tuner.prototype.findNeighbour = function(frequency, prev, next) {
  const deltaPrev = frequency - prev;
  const deltaNext = next - frequency;
  const neighbour = (deltaPrev > deltaNext) ? next : prev;
  return neighbour;
};

Tuner.prototype.standardPrevAndNext = function(standardNotePrev, standardNoteNext) {
  const standardNumPrev = this.standardNoteNum(...standardNotePrev);
  const standardNumNext = this.standardNoteNum(...standardNoteNext);
  const prev = this.getNoteFrequency(standardNumPrev);
  const next = this.getNoteFrequency(standardNumNext);

  return [prev, next];
};

Tuner.prototype.getOctave = function(noteNum) {
  const octave = Math.ceil(noteNum / this.TOTAL_NOTES_COUNT);
  return octave;
};

Tuner.prototype.autoModes = function(userFrequency, mode) {
  const nearestFrequency = (mode === 'allNotes') ?
    this.nearestAllFrequency(userFrequency) :
    this.nearestStandardFrequency(userFrequency);

  const delta = userFrequency - nearestFrequency;
  const noteNum = this.noteNum(nearestFrequency);
  const octave = this.getOctave(noteNum);

  const noteData = {
    delta: delta,
    noteName: this.AllNotes[noteNum % this.TOTAL_NOTES_COUNT],
    octave: octave + 1,
  };

  console.log(noteData);

  return noteData;
};

Tuner.prototype.modeStandardStrict = function(userFrequency, noteIdx) {
  const standardNote = this.StandardTune[noteIdx];
  const [chord, octave] = standardNote;
  const noteNum = this.standardNoteNum(chord, octave);
  const strictFrequency = this.getNoteFrequency(noteNum);
  const delta = userFrequency - strictFrequency;

  const noteData = {
    delta: delta,
    noteName: this.AllNotes[noteNum % this.TOTAL_NOTES_COUNT],
    octave: octave + 1,
  };

  console.log(noteData);

  return noteData;
};
