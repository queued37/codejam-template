#!/usr/bin/env node
const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

const argv = require('yargs')
  .boolean(['fuzz', 'debug'])
  .alias('f', 'fuzz')
  .alias('d', 'debug')
  .describe('f', 'Use fuzzer')
  .describe('d', 'Enable debug logging')
  .argv

const FUZZER_PATTERN_EXTENSION = '.fuzz'
const DEBUG_DIR = './py_debug'

const restArgs = argv._.slice()
// Assume last argument of `py` is the python script file name.
const scriptPath = restArgs[restArgs.length - 1]

if (argv.debug) {
  const scriptDir = path.dirname(scriptPath)
  const scriptName = path.basename(scriptPath)
  const scriptDebugDir = path.join(scriptDir, DEBUG_DIR)
  const scriptDebugName = path.join(scriptDir, DEBUG_DIR, scriptName)

  // Create directory for debug code
  if (!fs.existsSync(scriptDebugDir)) {
    fs.mkdirSync(scriptDebugDir)
  }

  const code = fs.readFileSync(scriptPath, 'utf-8')
  const replacedCode = code.replace(/##\s*/g, '')

  fs.writeFileSync(scriptDebugName, replacedCode, 'utf-8')

  // Change script path to run
  restArgs[restArgs.length - 1] = scriptDebugName
}

const pythonProcess = spawn('python', ['-u'].concat(restArgs))

if (argv.fuzz) {
  // The fuzzer pattern file name must be the same as the python script file name.
  const patternName = scriptPath.replace(/\.py/, FUZZER_PATTERN_EXTENSION)
  const fuzzerProcess = spawn('python', [path.join(__dirname, '../fuzzer/fuzzer.py'), patternName])
  fuzzerProcess.stdout.pipe(pythonProcess.stdin)
} else {
  process.stdin.pipe(pythonProcess.stdin)
}

pythonProcess.stdout.on('data', (data) => {
  process.stdout.write(data.toString('utf8'))
})

pythonProcess.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[31m${data}\x1b[0m`)
})

pythonProcess.on('close', (code) => {
  console.log(`\nchild process exited with code ${code}`)
  process.stdin.end()
})
