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
const TEMP_DIR = 'py_build'
const DEBUG_SUFFIX = '.debug'

const restArgs = argv._.slice()
// Assume last argument of `py` is the python script file name.
const scriptPath = restArgs[restArgs.length - 1]

function compile (scriptPath, save=false) {
  // Compile
  let code = fs.readFileSync(scriptPath, 'utf-8')
  // TODO: Implement include comment
  if (argv.debug) {
    code = code.replace(/##\s*/g, '')
  }

  // Save
  if (save) {
    const originalName = path.basename(scriptPath)
    const originalDir = path.dirname(scriptPath)
    const buildDir = path.join(originalDir, TEMP_DIR)

    const buildName = originalName
    const buildPath = path.join(buildDir, buildName)
    const debugName = originalName.replace(/\.py$/, '') + DEBUG_SUFFIX + '.py'
    const debugPath = path.join(buildDir, debugName)

    let destination = buildPath
    if (argv.debug) destination = debugPath
    
    // Create directory for built code
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir)
    }

    // Save at destination
    fs.writeFileSync(destination, code, 'utf-8')

    // Change script path to run
    restArgs[restArgs.length - 1] = destination
  }

  return code
}

const compiledCode = compile(scriptPath, save=true)

const pythonProcess = spawn('python', ['-u'].concat(restArgs)) // TODO: Run from string

if (argv.fuzz) {
  // The fuzzer pattern file name must be the same as the python script file name.
  const patternName = scriptPath.replace(/\.py$/, '') + FUZZER_PATTERN_EXTENSION
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
