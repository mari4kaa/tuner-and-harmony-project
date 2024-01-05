'use strict';

class ChordProcessor {
  constructor(tuner) {
    this.tuner = tuner;
    this.findNote = this.findNote.bind(this);
    this.getUserFrequency = this.getUserFrequency.bind(this);
    this.processHandlers = [];
    this.MIN_DECIBELS = -50;
  }

  async init() {
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
  }

  findNote(noteName, noteOctave, collectCb) {
    console.log('LOOKING FOR A NOTE', noteName);
    const self = this;
    function processHandler() {
      const userFrequency = self.getUserFrequency();
      if (userFrequency) {
        const detectedNote = self.tuner.autoModes(userFrequency, 'standardAuto');
        console.log('Detected note: ', detectedNote);
        if (noteName === detectedNote.name && noteOctave === detectedNote.octave) {
          console.log('COLLECTING', noteName);
          collectCb(null, noteName);
          self.scriptProcessor.removeEventListener('audioprocess', processHandler);
        }
      }
    }

    this.processHandlers.push(processHandler);
    this.scriptProcessor.addEventListener('audioprocess', processHandler);
  }

  getUserFrequency() {
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);
    this.analyser.getFloatFrequencyData(dataArray);

    const maxVolumeIndex = dataArray.indexOf(Math.max(...dataArray));
    const binWidth = this.audioCtx.sampleRate / this.analyser.fftSize;
    const userFrequency = maxVolumeIndex * binWidth;
    if (dataArray[maxVolumeIndex] > this.MIN_DECIBELS) return userFrequency;
    return undefined;
  }
}

module.exports = ChordProcessor;
