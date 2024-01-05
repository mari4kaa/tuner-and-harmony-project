const fs = require('fs');
const readline = require('readline');

async function parseSong(filePath) {
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

  return parsedLines.join('\n');
}

function parseChords(line) {
  let chordLine = '';
  let textLine = '';

  while (line.includes('*')) {
    const chordStart = line.indexOf('*');
    const chordEnd = line.indexOf('*', chordStart + 1);

    if (chordEnd === -1) break;

    const chord = line.substring(chordStart + 1, chordEnd);
    textLine += line.substring(0, chordStart).trim() + ' ';
    chordLine += ' '.repeat(textLine.length - chordLine.length) + chord;

    line = line.substring(chordEnd + 1);
  }

  textLine += line.trim();

  return { chordLine, textLine };
}

module.exports = parseSong;
