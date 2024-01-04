'use strict';

const Collector = require("./ChordCollector");
const ChordProcessor = require("./ChordProcessor");

class SongProcessor {
  constructor(tuner) {
    this.tuner = tuner;
    this.chordProc = new ChordProcessor(this.tuner);
    this.allChords = new Map();

    this.allChords.set('Am', [ {name: 'E', octave: 4}, {name: 'B', octave: 3}, {name: 'G', octave: 3} ]);
    this.allChords.set('C', [ {name: 'G', octave: 3}, {name: 'D', octave: 3}, {name: 'A', octave: 2} ]);
  }

  async init() {
    await this.chordProc.init();
  }

  collect(expected) {
    return new Collector(expected);
  }

  processChords(onCapturedCb) {
    //const song = ask from db;
    /*let i = 0;
    for (const line of song) {
      if (i % 2 === 0) {
        const chord = getOneChord();
        const {note1, note2, note3} = findChordValue in map
        
        const collector = collect(3)
          .timeout(3000)
          .done((err, result) => {
            console.log("SUCCESS!!!!!!!!!!!");
            onCapturedCb();
          });

        collector.take('CHORD', findNoteFunc, note1.name, note1.octave);
        collector.take('CHORD', findNoteFunc, note2.name, note2.octave);
        collector.take('CHORD', findNoteFunc, note3.name, note3.octave);
      }
      i++;
    }*/
    const chord1 = 'Am'; //take from song instead
    const chord2 = 'C'; //take from song instead

    const chordNotes1 = this.allChords.get(chord1);
    const chordNotes2 = this.allChords.get(chord2);

    const collector = this.collect(2)
      .timeout(1000000)
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
    collector.takeChord(chord1, this.chordProc.findNote, 3000, ...chordNotes1);
    collector.takeChord(chord2, this.chordProc.findNote, null, ...chordNotes2);
  }
}

module.exports = SongProcessor;
