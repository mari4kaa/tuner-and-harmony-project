const fs = require('fs');
const readline = require('readline');

async function processFile(filePath) {
  const fileStream = fs.createReadStream(filePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const parsedLines = [];

  for await (const line of rl) {
    const { chordLine, textLine } = parseChords(line);
    parsedLines.push(chordLine);
    parsedLines.push(textLine);
  }

  return parsedLines;
}

function parseChords(line) {
  const regex = /\*(.*?)\*/g;
  let match;
  let lastIndex = 0;
  let chordLine = '';
  let textLine = '';

  while ((match = regex.exec(line)) !== null) {
    const chord = match[1];
    const { index } = match;

    textLine += line.substring(lastIndex, index).trim();
    textLine += ' ';

    chordLine += ' '.repeat(textLine.length - chordLine.length);
    chordLine += chord;

    lastIndex = index + match[0].length;
  }

  const remainingText = line.substring(lastIndex).trim();
  textLine += remainingText;

  return { chordLine, textLine };
}

module.exports = processFile;
