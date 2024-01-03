'use strict';

class ChordProcessor {
  constructor(tuner) {
    this.tuner = tuner;
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
    try {
      this.scriptProcessor.addEventListener('audioprocess', () => {
        const userFrequency = this.tuner.getUserFrequency();

        if (userFrequency && userFrequency > this.START_FREQUENCY) {
          const detectedNote = this.tuner.autoModes(userFrequency, 'allNotes');

          if (noteName === detectedNote.name && noteOctave === detectedNote.octave) {
            collectCb(null, noteName);
          }
        }
      });
    } catch (err) {
      collectCb(err, null);
    }
  }
}

module.exports = ChordProcessor;
