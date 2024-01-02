'use strict';

class ChordProcessor {
  constructor() {
    this.allChords = [];
    this.START_FREQUENCY = 65.41;
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

  processChord() {
    this.scriptProcessor.addEventListener('audioprocess', () => {

    });
  }
}

module.exports = ChordProcessor;
