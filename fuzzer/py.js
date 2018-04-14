#!/usr/bin/env node

const argv = require('yargs')
    .boolean(['fuzz', 'debug'])
    .alias('f', 'fuzz')
    .alias('d', 'debug')
    .describe('f', 'Use fuzzer')
    .describe('d', 'Enable debug logging')
    .argv;

const { spawn } = require('child_process');

if (argv.debug) {
    console.log("debug");    // TODO: Implement debug logging
}

const pythonProcess = spawn('python', argv._);

if (argv.fuzz) {
    const fuzzerProcess = spawn('python', ['fuzzer.py']);
    fuzzerProcess.stdout.pipe(pythonProcess.stdin)
} else {
    process.stdin.pipe(pythonProcess.stdin)
}

pythonProcess.stdout.on('data', (data) => {
  console.log(data.toString('utf8'));
});

pythonProcess.stderr.on('data', (data) => {
  console.error(`\x1b[31m${data}\x1b[0m`);
});

pythonProcess.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
  process.stdin.end()
});
