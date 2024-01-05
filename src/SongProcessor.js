'use strict';

const Collector = require("./ChordCollector");
const ChordProcessor = require("./ChordProcessor");

class SongProcessor {
  constructor(tuner) {
    this.tuner = tuner;
    this.chordProc = new ChordProcessor(this.tuner);
    this.allChords = new Map();

    this.allChords.set('Am', [ {name: 'E', octave: 4}, {name: 'B', octave: 3}, {name: 'G', octave: 3} ]);
    this.allChords.set('G', [ {name: 'G', octave: 3}, {name: 'E', octave: 3}, {name: 'A', octave: 2} ]);
    this.allChords.set('C', [ {name: 'G', octave: 3}, {name: 'D', octave: 3}, {name: 'A', octave: 2} ]);
  }

  async init() {
    await this.chordProc.init();
  }

  collect(expected) {
    return new Collector(expected);
  }

  processChords(onCapturedCb) {
    const chord1 = 'Am'; //take from song instead
    const chord2 = 'C'; //take from song instead

    const chordNotes1 = this.allChords.get(chord1);
    const chordNotes2 = this.allChords.get(chord2);

    const collector = this.collect(2)
      .done((err, result) => {
        if (err) {
          const scriptProcessor = this.chordProc.scriptProcessor;
          for (const handle of this.chordProc.processHandlers) {
            scriptProcessor.removeEventListener('audioprocess', handle);
          }
          console.error(err);
        } else {
          console.log('SUCCESS!!!!!!!!!!!');
          console.log(result);
        }
      });
    console.log('chordNotes1', chordNotes1);
    console.log('chordNotes2', chordNotes2);
    collector.takeChord(chord1, this.chordProc.findNote, null, ...chordNotes1);
    collector.takeChord(chord2, this.chordProc.findNote, null, ...chordNotes2);
  }
}

module.exports = SongProcessor;
