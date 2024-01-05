'use strict';

const Collector = require("./ChordCollector");
const ChordProcessor = require("./ChordProcessor");

class SongProcessor {
  constructor(tuner) {
    this.tuner = tuner;
    this.chordProc = new ChordProcessor(this.tuner);
    this.allChords = this.getChordsMap();
    this.stopped = false;
  }

  async init() {
    await this.chordProc.init();
  }

  collect(expected) {
    return new Collector(expected);
  }

  async processChords(onCapturedCb) {
    this.stopped = false;
    const songId = 4; //testing value

    const song = await this.getSong(songId);
    const songArr = song.split('\n');

    this.processSongIteration(0, songArr, onCapturedCb);
  }

  processSongIteration(index, songArr, onCapturedCb) {
    if (index >= songArr.length || index % 2 !== 0 || this.stopped === true) {
      return;
    }
    const line = songArr[index];
    const chords = line.split(' ').filter(String);
    const chordsCount = chords.length;

    if (chordsCount) {
      const collector = this.collect()
        .done((err, result) => {
          if (err) {
            const scriptProcessor = this.chordProc.scriptProcessor;
            for (const handle of this.chordProc.processHandlers) {
              scriptProcessor.removeEventListener('audioprocess', handle);
            }
            console.error(err);
          } else {
            console.log('SUCCESS!!!');
            console.log(result);
            onCapturedCb();
            this.processSongIteration(index + 2, songArr, onCapturedCb);
          }
        });

      chords.map((chord) => {
        const chordNotes = this.allChords.get(chord);
        collector.takeChord(chord, this.chordProc.findNote, null, ...chordNotes);
      });
    } else {
      this.processSongIteration(index + 2, songArr, onCapturedCb);
    }
  }

  stop() {
    const handlers = this.chordProc.processHandlers;
    if (!handlers.length) return;

    const scriptProcessor = this.chordProc.scriptProcessor;
    for (const handle of handlers) {
      scriptProcessor.removeEventListener('audioprocess', handle);
    }
    this.stopped = true;
  }

  async getSong(songId) {
    try {
      const response = await fetch(`http://localhost:5000/songs/${songId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const { content } = await response.json();
      return content;
    } catch (error) {
      console.error('Error getting a song');
    }
  }

  getChordsMap() {
    const chordsMap = new Map();

    chordsMap.set('Am', [ {name: 'E', octave: 4}, {name: 'B', octave: 3}, {name: 'G', octave: 3} ]);
    chordsMap.set('G', [ {name: 'G', octave: 3}, {name: 'E', octave: 4}, {name: 'A', octave: 2} ]);
    chordsMap.set('C', [ {name: 'G', octave: 3}, {name: 'D', octave: 3}, {name: 'A', octave: 2} ]);

    return chordsMap;
  }
}

module.exports = SongProcessor;
