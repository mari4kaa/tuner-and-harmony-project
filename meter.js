'use strict';

const Meter = function () {
  this.NUM_OF_LINES = 70;
  this.BORDER = 5;
  this.container = document.getElementById('meter-container');
  this.pointer = undefined;
  this.createScale();
};

Meter.prototype.createScale = function () {
  const containerWidth = this.container.offsetWidth;
  const lineGap = containerWidth / this.NUM_OF_LINES;

  for (let i = 0; i < this.NUM_OF_LINES; i++) {
    const line = document.createElement('div');
    line.classList.add('scale-line');
    line.style.left = `${lineGap * i}px`;

    this.container.appendChild(line);
  }

  const centralLine = document.createElement('div');
  centralLine.classList.add('central-line');
  centralLine.style.left = `${containerWidth / 2}px`;
  this.container.appendChild(centralLine);

  this.pointer = document.createElement('div');
  this.pointer.classList.add('pointer');
  this.container.appendChild(this.pointer);

  const metricElement = document.getElementById('metric');
  const metric = Math.round(this.container.offsetWidth / this.NUM_OF_LINES);
  metricElement.textContent = `1 line ~ ${metric} Hz`;
};


Meter.prototype.update = function (delta) {
  const maxDelta = this.container.offsetWidth / 2 - this.BORDER;
  const pointerPosition = delta >= maxDelta? maxDelta: delta;
  this.pointer.style.transform = `translateX(${pointerPosition}px)`;
};
