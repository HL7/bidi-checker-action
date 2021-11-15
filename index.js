const core = require('@actions/core');
const github = require('@actions/github');
const path = require('path')
const fs = require('fs');
const readline = require('readline');

const FILE_IGNORE_REGEX = [
  '^\.git'
]

const ignorePath = (inputFile) => {
  const fullPath = path.resolve(process.env.GITHUB_WORKSPACE);
  const inputPath = path.resolve(inputFile);

  const relativePath = path.relative(fullPath, inputPath);
  for (regex of FILE_IGNORE_REGEX) {
    if (new RegExp(regex).test(relativePath)) {
      return true;
    }
  }
  return false;
}

const findBidiCharactersInDirectory = async (inputDirectory) => {
  let failedFiles = 0;

  const files = fs.readdirSync(inputDirectory);

  if (!fs.lstatSync(inputDirectory).isDirectory()) {
    throw new Error('Input is not a directory');
  }

  for (const file of files) {
    const filePath = inputDirectory + path.sep + file
    if (ignorePath(filePath)) {
      console.log(`Ignoring path: ${filePath}`);
    }
    else
    {
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


// most @actions toolkit packages have async methods
async function run() {
  try {
    const startTime = (new Date()).getTime();
  
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`github.context.payload: ${payload}`);
    console.log('');
  
    const workspacePath = path.resolve(process.env.GITHUB_WORKSPACE);
    console.log('Executing in ' + workspacePath);
  
    if (fs.readdirSync(workspacePath).length == 0) {
      throw new Error('GITHUB_WORKSPACE is empty. Please include an actions/checkout action in your steps to populate this directory.');
    }
  
    const success = findBidiCharactersInDirectory(workspacePath);
  
    success.then(failures => {
      const endTime = (new Date()).getTime();
      const runTime = endTime - startTime;
  
      core.setOutput("time", `${runTime}ms` );
      if (failures == 0) {
        console.log('CHECK PASSED');
      } else {
        const error = `CHECK FAILED: ${failures} files found with non-ascii characters.`;
        console.log(error);
        core.setFailed(error + ' Check log for details.');
      }
    })
  
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
