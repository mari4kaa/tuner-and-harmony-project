'use strict';

class Collector {
  constructor(expectedCount) {
    this.expectedCount = expectedCount;
    this.keys = new Set();
    this.subCollectors = new Map();
    this.isSubCollector = false;
    this.count = 0;
    this.timer = null;
    this.onDoneCallback = () => {};
    this.finished = false;
    this.data = {};
  }

  takeNote(key, fn, ...args) {
    fn(...args, (err, data) => {
      this.collect(key, err, data);
    });
    return this;
  }

  takeChord(chordKey, fn, subTimeout, ...args) {
    if (this.isSubCollector) return this;
    if (!this.subCollectors.has(chordKey)) {
      const subCollector = new Collector(args.length);
      subCollector.timeout(subTimeout)
        .done((err, chordData) => {
          if (err) {
            console.error('Main collector was timed out');
          } else {
            console.log(`Chord ${chordKey} collected!`);
            console.log(chordData);
            this.collect(chordKey, null, chordData);
          }
        });
      this.subCollectors.set(chordKey, subCollector);
    }
    const subCollector = this.subCollectors.get(chordKey);
    args.forEach((note, index) => {
      subCollector.takeNote(`${chordKey}-note-${index + 1}`, fn, note.name, note.octave);
    });
    return this;
  }

  collect(key, err, value) {
    if (this.finished) return this;
    if (err) {
      this.finish(err, this.data);
      return this;
    }
    if (!this.keys.has(key)) {
      this.count++;
      this.keys.add(key);
    }
    this.data[key] = value;
    if (this.expectedCount === this.count) {
      this.finish(null, this.data);
    }
    return this;
  }

  timeout(msec) {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (msec > 0) {
      this.timer = setTimeout(() => {
        const err = new Error('Timed out');
        if (!this.isSubCollector) {
          this.subCollectors.forEach((subCollector, key) => {
            subCollector.finish(err, key);
          });
        }
        this.finish(err, this.data);
      }, msec);
    }
    return this;
  }

  fail(key, err) {
    this.collect(key, err);
    return this;
  }

  done(callback) {
    this.onDoneCallback = callback;
    return this;
  }

  finish(err, data) {
    if (this.finished) return this;
    if (this.onDoneCallback) {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.finished = true;
      this.onDoneCallback(err, data);
    }
    return this;
  }
}

module.exports = Collector;
