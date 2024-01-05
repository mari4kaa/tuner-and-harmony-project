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

  async processChords(onCapturedCb, songId) {
    this.stopped = false;

    const song = await this.getSong(songId);
    const songArr = song.split('\n');

    for (let i = 0; i < songArr.length; i += 2) {
      const line = songArr[i];
      const chords = line.split(' ').filter(String);
      const chordsCount = chords.length;

      if (chordsCount) {
        const collector = this.collect(chordsCount);
        const collectorDonePromise = new Promise((resolve) =>
          collector.done((err, result) => {
            if (err) {
              const scriptProcessor = this.chordProc.scriptProcessor;
              for (const handle of this.chordProc.processHandlers) {
                scriptProcessor.removeEventListener('audioprocess', handle);
              }
              console.error(err);
            } else {
              console.log(result);
              onCapturedCb();
              resolve();
            }
          })
        );

        chords.map((chord) => {
          const chordNotes = this.allChords.get(chord);
          collector.takeChord(chord, this.chordProc.findNote, null, ...chordNotes);
        });

        await collectorDonePromise;
      }
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
      this.showSong(content);
      return content;
    } catch (error) {
      console.error('Error getting a song');
    }
  }

  showSong(content) {
    const scrollablePanel = document.getElementById('scrollable-panel');
    const contentDiv = document.createElement('div');
    contentDiv.textContent = content;
    scrollablePanel.appendChild(contentDiv);
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
