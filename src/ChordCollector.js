'use strict';

class Collector {
  constructor(expected) {
    this.expectKeys = Array.isArray(expected) ? new Set(expected) : null;
    this.expected = this.expectKeys ? expected.length : expected;
    this.keys = new Set();
    this.count = 0;
    this.timer = null;
    this.doneCallback = () => {};
    this.finished = false;
    this.data = {};
    this.subCollectors = new Map();
  }

  collect(key, err, value) {
    if (this.finished) return this;
    if (err) {
      this.finalize(err, this.data);
      return this;
    }
    if (!this.keys.has(key)) {
      this.count++;
    }
    this.data[key] = value;
    this.keys.add(key);
    if (this.expected === this.count) {
      this.finalize(null, this.data);
    }
    return this;
  }

  take(key, fn, ...args) {
    fn(...args, (err, data) => {
      this.collect(key, err, data);
    });
    return this;
  }

  takeChord(chordKey, fn, ...args) {
    if (!this.subCollectors.has(chordKey)) {
      this.subCollectors.set(chordKey, new Collector(args.length)
        .done((err, chordData) => {
          if (err) {
            console.error(`Error collecting chord ${chordKey}: ${err}`);
          } else {
            console.log(`Chord ${chordKey} collected!`);
            console.log(chordData);
            this.collect(chordKey, null, chordData);
          }
        }));
    }

    const subCollector = this.subCollectors.get(chordKey);
    args.forEach((note, index) => {
      console.log(note);
      subCollector.take(`${chordKey}-note-${index + 1}`, fn, note.name, note.octave);
    });

    return this;
  }

  timeout(msec) {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (msec > 0) {
      this.timer = setTimeout(() => {
        const err = new Error('Collector timed out');
        this.finalize(err, this.data);
      }, msec);
    }
    return this;
  }

  done(callback) {
    this.doneCallback = callback;
    return this;
  }

  finalize(err, data) {
    if (this.finished) return this;
    if (this.doneCallback) {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.finished = true;
      this.doneCallback(err, data);
    }
    return this;
  }
}

module.exports = Collector;
