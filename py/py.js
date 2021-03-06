#!/usr/bin/env node
const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

const clipboardy = require('clipboardy')
const argv = require('yargs')
  .boolean(['fuzz', 'debug', 'save-same-dir', 'copy'])
  .string(['save'])
  .alias('f', 'fuzz')
  .alias('d', 'debug')
  .alias('s', 'save-same-dir')
  .alias('S', 'save')
  .alias('c', 'copy')
  .describe('f', 'Use fuzzer')
  .describe('d', 'Enable debug logging')
  .describe('s', 'Save compiled code at the same directory')
  .describe('S', 'Save compiled code')
  .describe('c', "Copy compiled code and don't run")
  .demandCommand(1)
  .argv

const FUZZER_PATTERN_EXTENSION = '.fuzz'
const BUILD_SUFFIX = '.build'
const DEBUG_SUFFIX = '.debug'

// Assume last argument of `py` is the python script file name.
const scriptPath = argv._[argv._.length - 1]
const restArgs = argv._.slice(0, -1)

function inform (message) {
  const cyanStart = '\x1b[36m'
  const cyanEnd = '\x1b[0m'
  console.error(`${cyanStart}INFO: ${message}${cyanEnd}`)
}

function error (message) {
  const redStart = '\x1b[31m'
  const redEnd = '\x1b[0m'
  const beep = '\x07'
  console.error(`${redStart}ERROR: ${message}${redEnd}${beep}`)
}

function compile () {
  const debug = argv.debug
  const save = argv.save || argv.s
  const copy = argv.copy
  let shouldRun = true

  /*** Compile ***/
  let code = fs.readFileSync(scriptPath, 'utf-8')

  // Include comment
  const libDir = path.resolve(__dirname, '../library')
  code = code.replace(/##include (.+)/g, (_, libName) => {
    libName = libName.replace(/\.py$/, '') + '.py'
    const libPath = path.join(libDir, libName)
    if (!fs.existsSync(libPath)) {
      error(`Error: library '${libName}' not found. Ignoring include statement.`)
      return ''
    }
    return fs.readFileSync(libPath, 'utf-8')
  })

  // Debug comment
  if (debug) {
    code = code.replace(/## /g, '')
  }

  /*** Copy ***/
  if (copy) {
    clipboardy.writeSync(code)
    inform('Successfully copied compiled code!')
    shouldRun = false
  }

  /*** Save ***/
  let savedPath = undefined
  if (save) {
    const originalName = path.basename(scriptPath)
    const originalDir = path.dirname(scriptPath)
    let saveDir = (typeof save === 'string') ? save : originalDir
    
    if (!fs.existsSync(saveDir)) {
      error('Error: Save directory not found. Saving at the directory of the script.')
      saveDir = originalDir
    }

    const buildName = originalName.replace(/\.py$/, '') + BUILD_SUFFIX + '.py'
    const buildPath = path.join(saveDir, buildName)
    const debugName = originalName.replace(/\.py$/, '') + DEBUG_SUFFIX + '.py'
    const debugPath = path.join(saveDir, debugName)

    let destination = buildPath
    if (debug) destination = debugPath

    // Save at destination
    fs.writeFileSync(destination, code, 'utf-8')
    savedPath = destination
    inform(`Saved at ${savedPath}.`)
  }

  return {compiledCode: code, savedPath, shouldRun}
}

function runPython () {
  const pythonProcess = spawn('python', ['-u'].concat(restArgs))

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
    inform(`Child process exited with code ${code}.`)
    process.stdin.unref()
  })
}

function main() {
  const {compiledCode, savedPath, shouldRun} = compile()

  if (savedPath) restArgs.push(savedPath) // Add the script path to python argument.
  else restArgs.push('-c', compiledCode) // If the script is not saved, run python from string.

  if (shouldRun) runPython()
}

main()
