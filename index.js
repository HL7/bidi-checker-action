const core = require('@actions/core');
const github = require('@actions/github');
const path = require('path')
const fs = require('fs');
const readline = require('readline');

const findBidiCharactersInDirectory = async (inputDirectory) => {
  let failedFiles = 0;

  const files = fs.readdirSync(inputDirectory);

  if (!fs.lstatSync(inputDirectory).isDirectory()) {
    throw new Error('Input is not a directory');
  }

  for (const file of files) {
    const filePath = inputDirectory + path.sep + file
    const lstat = fs.lstatSync(filePath);
    if (lstat.isDirectory()) {
      failedFiles += await findBidiCharactersInDirectory(filePath);
    } else if (lstat.isFile()) {
      const fileResult = await findBidiCharactersInFile(filePath, 'utf-8')
      if (fileResult.length > 0) {
        console.log(`${filePath} contains bidi characters.`);
        for (const resultLine of fileResult) {
          console.log(`   ${resultLine.line}:${resultLine.col}`);
        }
        failedFiles++;
      }
    }
  }

  return failedFiles;
}

const BIDI_CHARS = [
  '\u202a',
  '\u202b',
  '\u202c',
  '\u202d',
  '\u202e',
  '\u2066',
  '\u2067',
  '\u2068',
  '\u2069',
  '\u200E',
  '\u200F',
  '\u061C'
];

const bidiRegex = new RegExp(`[${BIDI_CHARS.join("")}]`);

const findBidiCharactersInFile = async (inputFile) => {
  if (!fs.lstatSync(inputFile).isFile()) {
    throw new Error('Input is not a file');
  }

  const output = [];

  const fileStream = fs.createReadStream(inputFile);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineNumber = 0;
  for await (const line of rl) {
    lineNumber++;   
    const match = bidiRegex.exec(line);
    if (match) {
      output.push({ line: lineNumber, col: match.index });
    }
  }
  return output;
}

try {
  // `who-to-greet` input defined in action metadata file
  const nameToGreet = core.getInput('who-to-greet');
  console.log(`Hello ${nameToGreet}!`);
  const time = (new Date()).toTimeString();
  core.setOutput("time", time);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);

  const success = findBidiCharactersInDirectory('/your/directory/here');

  success.then(failures => {
  
    if (failures == 0) {
      console.log('CHECK PASSED');
    } else {
      const error = `CHECK FAILED: ${failures} files found with non-ascii characters.`;
      console.log(error);
      throw new Error(error + ' Check log for details.');
    }
  });

} catch (error) {
  core.setFailed(error.message);
}
