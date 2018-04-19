#!/usr/bin/env node

const FUZZER_PATTERN_EXTENSION = '.fuzz'

const argv = require('yargs')
    .boolean(['fuzz', 'debug'])
    .alias('f', 'fuzz')
    .alias('d', 'debug')
    .describe('f', 'Use fuzzer')
    .describe('d', 'Enable debug logging')
    .argv;

const { spawn } = require('child_process');
const path = require('path');

if (argv.debug) {
    console.log('debug');    // TODO: Implement debug logging
}

const pythonProcess = spawn('python', ['-u'].concat(argv._));

if (argv.fuzz) {
    // Assume last argument of `py` is the python script file name.
    // The fuzzer pattern file name must be the same as the python script file name.
    const patternName = argv._[argv._.length-1].replace(/\.py/, '.fuzz');
    const fuzzerProcess = spawn('python', [path.join(__dirname, '../fuzzer/fuzzer.py'), patternName]);
    fuzzerProcess.stdout.pipe(pythonProcess.stdin)
} else {
    process.stdin.pipe(pythonProcess.stdin)
}

pythonProcess.stdout.on('data', (data) => {
  process.stdout.write(data.toString('utf8'));
});

pythonProcess.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[31m${data}\x1b[0m`);
});

pythonProcess.on('close', (code) => {
  console.log(`\nchild process exited with code ${code}`);
  process.stdin.end()
});
