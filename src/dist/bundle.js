/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/app.js":
/*!********************!*\
  !*** ./src/app.js ***!
  \********************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

eval("\r\n\r\nconst Tuner = __webpack_require__(/*! ./tuner.js */ \"./src/tuner.js\");\r\nconst Meter = __webpack_require__(/*! ./user-interface/UI-tuner/meter.js */ \"./src/user-interface/UI-tuner/meter.js\");\r\nconst Note = __webpack_require__(/*! ./user-interface/UI-tuner/note.js */ \"./src/user-interface/UI-tuner/note.js\");\r\n\r\nclass Application {\r\n  constructor() {\r\n    this.defaultConfig = {\r\n      mode: 'standardAuto',\r\n      selectedString: 1,\r\n    };\r\n    this.tuner = new Tuner(this.defaultConfig);\r\n    this.meter = new Meter();\r\n    this.note = new Note();\r\n  }\r\n\r\n  start() {\r\n    const onCaptured = (noteData) => {\r\n      this.update(noteData);\r\n    };\r\n\r\n    swal.fire({\r\n      title: 'Welcome to the guitar tuner!',\r\n      showCancelButton: false,\r\n      confirmButtonText: 'OK',\r\n      allowOutsideClick: false\r\n    }).then((result) => {\r\n      if (result.isConfirmed) {\r\n        this.tuner.init();\r\n        this.tuner.tune(onCaptured);\r\n      }\r\n    });\r\n  }\r\n\r\n  update(noteData) {\r\n    this.note.hideNote();\r\n    this.note.displayNote(noteData.name, noteData.octave);\r\n    this.meter.update(noteData.delta);\r\n  }\r\n}\r\n\r\nconst addClickListener = function(app, elementId, configProperties) {\r\n  document.getElementById(elementId).addEventListener('click', () => {\r\n    Object.assign(app.tuner.config, configProperties);\r\n  });\r\n};\r\n\r\nconst app = new Application();\r\n\r\ndocument.addEventListener('DOMContentLoaded', () => {\r\n  addClickListener(app, 'allNotes', { mode: 'allNotes' });\r\n  addClickListener(app, 'standardAuto', { mode: 'standardAuto' });\r\n  addClickListener(app, 'firstStr', { selectedString: 1, mode: 'standardStrict' });\r\n  addClickListener(app, 'secondStr', { selectedString: 2, mode: 'standardStrict' });\r\n  addClickListener(app, 'thirdStr', { selectedString: 3, mode: 'standardStrict' });\r\n  addClickListener(app, 'fourthStr', { selectedString: 4, mode: 'standardStrict' });\r\n  addClickListener(app, 'fifthStr', { selectedString: 5, mode: 'standardStrict' });\r\n  addClickListener(app, 'sixthStr', { selectedString: 6, mode: 'standardStrict' });\r\n});\r\n\r\napp.start();\r\n\n\n//# sourceURL=webpack://tuner-and-harmony-project/./src/app.js?");

/***/ }),

/***/ "./src/tuner.js":
/*!**********************!*\
  !*** ./src/tuner.js ***!
  \**********************/
/***/ ((module) => {

eval("\r\n\r\nconst findNeighbour = function(frequency, prev, next) {\r\n  const deltaPrev = frequency - prev;\r\n  const deltaNext = next - frequency;\r\n  const neighbour = (deltaPrev > deltaNext) ? next : prev;\r\n  return neighbour;\r\n};\r\n\r\nclass Tuner {\r\n  constructor(defaultConfig) {\r\n    this.config = defaultConfig;\r\n    this.START_FREQUENCY = 65.41;\r\n    this.OCTAVES = 4;\r\n    this.MIN_DECIBELS = -50;\r\n    this.TOTAL_NOTES_COUNT = 12;\r\n    this.AllNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];\r\n    this.StandardTune = [\r\n      ['E', 2],\r\n      ['A', 2],\r\n      ['D', 3],\r\n      ['G', 3],\r\n      ['B', 3],\r\n      ['E', 4],\r\n    ];\r\n  }\r\n\r\n  async init() {\r\n    window.AudioContext = window.AudioContext || window.webkitAudioContext;\r\n    this.audioCtx = new window.AudioContext();\r\n    this.analyser = new AnalyserNode(this.audioCtx);\r\n    this.scriptProcessor = this.audioCtx.createScriptProcessor(\r\n      4096,\r\n      1,\r\n      1,\r\n    );\r\n    this.analyser.connect(this.scriptProcessor);\r\n    this.scriptProcessor.connect(this.audioCtx.destination);\r\n    try {\r\n      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });\r\n      window.localStream = stream;\r\n      this.audioCtx.createMediaStreamSource(stream).connect(this.analyser);\r\n    } catch (err) {\r\n      console.error(`Error: ${err}`);\r\n    }\r\n  }\r\n\r\n  tune(onCapturedCb) {\r\n    this.scriptProcessor.addEventListener('audioprocess', () => {\r\n      const userFrequency = this.getUserFrequency();\r\n      if (userFrequency) {\r\n        let noteData;\r\n        if (this.config.mode !== 'standardStrict') {\r\n          noteData = this.autoModes(userFrequency, this.config.mode);\r\n        } else {\r\n          const stringIdx = this.StandardTune.length - this.config.selectedString;\r\n          noteData = this.modeStandardStrict(userFrequency, stringIdx);\r\n        }\r\n        onCapturedCb(noteData);\r\n      }\r\n    });\r\n  }\r\n\r\n  getUserFrequency() {\r\n    const bufferLength = this.analyser.frequencyBinCount;\r\n    const dataArray = new Float32Array(bufferLength);\r\n    this.analyser.getFloatFrequencyData(dataArray);\r\n\r\n    const maxVolumeIndex = dataArray.indexOf(Math.max(...dataArray));\r\n    const binWidth = this.audioCtx.sampleRate / this.analyser.fftSize;\r\n    const userFrequency = maxVolumeIndex * binWidth;\r\n    if (dataArray[maxVolumeIndex] > this.MIN_DECIBELS) return userFrequency;\r\n    return undefined;\r\n  }\r\n\r\n  noteNum(frequency) {\r\n    const octaveCoef = Math.log(frequency / this.START_FREQUENCY) / Math.log(2);\r\n    const noteNum = this.TOTAL_NOTES_COUNT * octaveCoef;\r\n    return Math.round(noteNum);\r\n  }\r\n\r\n  standardNoteNum(noteName, noteOctave) {\r\n    const noteIdx = this.AllNotes.indexOf(noteName);\r\n    const relativeOctave = noteOctave - 1;\r\n    const noteNum = noteIdx + this.TOTAL_NOTES_COUNT * (relativeOctave - 1);\r\n    return noteNum;\r\n  }\r\n\r\n  getOctave(noteNum) {\r\n    const octave = Math.ceil(noteNum / this.TOTAL_NOTES_COUNT) + 1;\r\n    return octave;\r\n  }\r\n\r\n  getNoteFrequency(noteNum) {\r\n    const frequencyCoef = Math.pow(2, noteNum / this.TOTAL_NOTES_COUNT);\r\n    const frequency = this.START_FREQUENCY * frequencyCoef;\r\n    return frequency;\r\n  }\r\n\r\n  targetFrequencyAllNotes(frequency) {\r\n    const minFreq = this.getNoteFrequency(0);\r\n    const maxFreq = this.getNoteFrequency((this.AllNotes.length * this.OCTAVES) - 1);\r\n\r\n    if (frequency <= minFreq) return minFreq;\r\n    if (frequency >= maxFreq) return maxFreq;\r\n\r\n    const allNotes = this.AllNotes.length * this.OCTAVES;\r\n    for (let i = 0; i < allNotes - 1; i++) {\r\n      const prev = this.getNoteFrequency(i);\r\n      const next = this.getNoteFrequency(i + 1);\r\n      if (frequency >= prev && frequency <= next) {\r\n        const targetFrequency = findNeighbour(frequency, prev, next);\r\n        return targetFrequency;\r\n      }\r\n    }\r\n  }\r\n\r\n  targetFrequencyStandard(frequency) {\r\n    const length = this.StandardTune.length;\r\n    const numOfMin = this.standardNoteNum(...this.StandardTune[0]);\r\n    const numOfMax = this.standardNoteNum(...this.StandardTune[length - 1]);\r\n\r\n    const minFreq = this.getNoteFrequency(numOfMin);\r\n    const maxFreq = this.getNoteFrequency(numOfMax);\r\n\r\n    if (frequency <= minFreq) return minFreq;\r\n    if (frequency >= maxFreq) return maxFreq;\r\n\r\n    for (let i = 0; i < length - 1; i++) {\r\n      const standardNotePrev = this.StandardTune[i];\r\n      const standardNoteNext = this.StandardTune[i + 1];\r\n      const [prev, next] = this.standardFreqInterval(standardNotePrev, standardNoteNext);\r\n      if (frequency >= prev && frequency <= next) {\r\n        const targetFrequency = findNeighbour(frequency, prev, next);\r\n        return targetFrequency;\r\n      }\r\n    }\r\n  }\r\n\r\n  standardFreqInterval(standardNotePrev, standardNoteNext) {\r\n    const standardNumPrev = this.standardNoteNum(...standardNotePrev);\r\n    const standardNumNext = this.standardNoteNum(...standardNoteNext);\r\n    const prev = this.getNoteFrequency(standardNumPrev);\r\n    const next = this.getNoteFrequency(standardNumNext);\r\n\r\n    return [prev, next];\r\n  }\r\n\r\n  autoModes(userFrequency, mode) {\r\n    const targetFrequency = (mode === 'allNotes') ?\r\n      this.targetFrequencyAllNotes(userFrequency) :\r\n      this.targetFrequencyStandard(userFrequency);\r\n\r\n    const deltaFreq = userFrequency - targetFrequency;\r\n    const noteNum = this.noteNum(targetFrequency);\r\n    const noteName = this.AllNotes[noteNum % this.TOTAL_NOTES_COUNT];\r\n\r\n    const noteData = {\r\n      delta: deltaFreq,\r\n      name: noteName,\r\n      octave: this.getOctave(noteNum),\r\n    };\r\n\r\n    console.log(noteData);\r\n\r\n    return noteData;\r\n  }\r\n\r\n  modeStandardStrict(userFrequency, stringIdx) {\r\n    const standardNote = this.StandardTune[stringIdx];\r\n    const [noteName, noteOctave] = standardNote;\r\n    const noteNum = this.standardNoteNum(noteName, noteOctave);\r\n    const targetFrequency = this.getNoteFrequency(noteNum);\r\n    const deltaFreq = userFrequency - targetFrequency;\r\n\r\n    const noteData = {\r\n      delta: deltaFreq,\r\n      name: noteName,\r\n      octave: noteOctave,\r\n    };\r\n\r\n    console.log(noteData);\r\n\r\n    return noteData;\r\n  }\r\n\r\n}\r\n\r\nmodule.exports = Tuner;\r\n\n\n//# sourceURL=webpack://tuner-and-harmony-project/./src/tuner.js?");

/***/ }),

/***/ "./src/user-interface/UI-tuner/meter.js":
/*!**********************************************!*\
  !*** ./src/user-interface/UI-tuner/meter.js ***!
  \**********************************************/
/***/ ((module) => {

eval("\r\n\r\nclass Meter {\r\n  constructor() {\r\n    this.NUM_OF_LINES = 70;\r\n    this.BORDER = 5;\r\n    this.container = document.getElementById('meter-container');\r\n    this.pointer = undefined;\r\n    this.createScale();\r\n  }\r\n\r\n  createScale() {\r\n    const containerWidth = this.container.offsetWidth;\r\n    const lineGap = containerWidth / this.NUM_OF_LINES;\r\n\r\n    for (let i = 0; i < this.NUM_OF_LINES; i++) {\r\n      const line = document.createElement('div');\r\n      line.classList.add('scale-line');\r\n      line.style.left = `${lineGap * i}px`;\r\n\r\n      this.container.appendChild(line);\r\n    }\r\n\r\n    const centralLine = document.createElement('div');\r\n    centralLine.classList.add('central-line');\r\n    centralLine.style.left = `${containerWidth / 2}px`;\r\n    this.container.appendChild(centralLine);\r\n\r\n    this.pointer = document.createElement('div');\r\n    this.pointer.classList.add('pointer');\r\n    this.container.appendChild(this.pointer);\r\n\r\n    const metricElement = document.getElementById('metric');\r\n    const metric = Math.round(this.container.offsetWidth / this.NUM_OF_LINES);\r\n    metricElement.textContent = `1 line ~ ${metric} Hz`;\r\n  }\r\n\r\n  update(delta) {\r\n    const maxDelta = this.container.offsetWidth / 2 - this.BORDER;\r\n    const pointerPosition = delta >= maxDelta ? maxDelta : delta;\r\n    this.pointer.style.transform = `translateX(${pointerPosition}px)`;\r\n  }\r\n}\r\n\r\nmodule.exports = Meter;\r\n\n\n//# sourceURL=webpack://tuner-and-harmony-project/./src/user-interface/UI-tuner/meter.js?");

/***/ }),

/***/ "./src/user-interface/UI-tuner/note.js":
/*!*********************************************!*\
  !*** ./src/user-interface/UI-tuner/note.js ***!
  \*********************************************/
/***/ ((module) => {

eval("\r\n\r\nclass Note {\r\n  constructor() {\r\n    this.noteElement = document.getElementById('note');\r\n    this.octaveElement = document.getElementById('octave');\r\n  }\r\n\r\n  displayNote(note, octave) {\r\n    this.noteElement.textContent = note;\r\n    this.octaveElement.textContent = octave;\r\n\r\n    this.noteElement.style.display = 'block';\r\n    this.octaveElement.style.display = 'block';\r\n  }\r\n\r\n  hideNote() {\r\n    this.noteElement.style.display = 'none';\r\n    this.octaveElement.style.display = 'none';\r\n  }\r\n}\r\n\r\nmodule.exports = Note;\r\n\n\n//# sourceURL=webpack://tuner-and-harmony-project/./src/user-interface/UI-tuner/note.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/app.js");
/******/ 	
/******/ })()
;