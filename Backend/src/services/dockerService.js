const path = require('path')
const { spawn } = require('child_process')
const languageConfig = require('./languageConfig')

const DEFAULT_EXECUTION_TIMEOUT_MS = Number(process.env.EXECUTION_TIMEOUT_MS) || 10000
const DEFAULT_MEMORY_LIMIT = process.env.EXECUTION_MEMORY_LIMIT || '512m'
const COMPILE_SUCCESS_MARKER = '__COMPILE_SUCCESS__'
const TIMEOUT_EXIT_CODE = 124

function shellQuote(value) {
  return `'${value.replace(/'/g, "'\\''")}'`
}

function isMemoryLimitError(stderr) {
  return /killed signal terminated program|out of memory|memory limit/i.test(stderr)
}

function buildDockerArgs(language, folderPath, timeoutMs = DEFAULT_EXECUTION_TIMEOUT_MS) {
  const config = languageConfig[language]
  if (!config) throw new Error(`Unsupported language: ${language}`)

  const steps = config.compile
    ? `${config.compile} && echo ${COMPILE_SUCCESS_MARKER} 1>&2 && ${config.run}`
    : config.run
  const timeoutSeconds = Math.ceil(timeoutMs / 1000)

  return [
    'run',
    '--rm',
    '-i',
    '--network',
    'none',
    '--memory',
    DEFAULT_MEMORY_LIMIT,
    '--cpus',
    '1',
    '-v',
    `${path.resolve(folderPath)}:/app`,
    '-w',
    '/app',
    config.image,
    'sh',
    '-lc',
    `timeout ${timeoutSeconds}s sh -lc ${shellQuote(steps)}`,
  ]
}

function executeCodeInDocker(language, folderPath, input = '', timeoutMs = DEFAULT_EXECUTION_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    let dockerArgs
    const startedAt = process.hrtime.bigint()

    try {
      dockerArgs = buildDockerArgs(language, folderPath, timeoutMs)
    } catch (error) {
      return reject(error)
    }

    const dockerProcess = spawn('/usr/bin/docker', dockerArgs)    
    let stdout = ''
    let stderr = ''
    let settled = false

    function finish(callback, value) {
      if (settled) return
      settled = true
      callback(value)
    }

    function getExecutionTimeMs() {
      return Number((process.hrtime.bigint() - startedAt) / 1000000n)
    }

    dockerProcess.stdout.on('data', data => {
      stdout += data.toString()
    })

    dockerProcess.stderr.on('data', data => {
      stderr += data.toString()
    })

    dockerProcess.on('error', error => {
      finish(reject, error)
    })

    dockerProcess.on('close', (code, signal) => {
      const executionTimeMs = getExecutionTimeMs()
      const compileSucceeded = stderr.includes(COMPILE_SUCCESS_MARKER)
      const cleanStderr = stderr.replace(COMPILE_SUCCESS_MARKER, '').trim()

      if (signal) {
        return finish(reject, new Error(`Execution stopped by signal: ${signal}`))
      }

      if (code !== 0) {
        if (code === TIMEOUT_EXIT_CODE) {
          return finish(resolve, {
            status: 'Time Limit Exceeded',
            stdout,
            stderr: cleanStderr,
            error: `Time limit exceeded. Execution took longer than ${timeoutMs / 1000} seconds.`,
            errorType: 'Time Limit Exceeded',
            exitCode: code,
            executionTimeMs,
          })
        }

        if (isMemoryLimitError(cleanStderr)) {
          return finish(resolve, {
            status: 'Memory Limit Exceeded',
            stdout,
            stderr: cleanStderr,
            error: cleanStderr || 'Memory limit exceeded.',
            errorType: 'Memory Limit Exceeded',
            exitCode: code,
            executionTimeMs,
          })
        }

        const errorType = languageConfig[language].compile && !compileSucceeded ? 'Compilation Error' : 'Runtime Error'
        return finish(resolve, {
          status: errorType,
          stdout,
          stderr: cleanStderr,
          error: cleanStderr || `Execution failed with exit code ${code}`,
          errorType,
          exitCode: code,
          executionTimeMs,
        })
      }

      finish(resolve, {
        status: 'Success',
        stdout,
        stderr: cleanStderr,
        error: null,
        errorType: null,
        exitCode: code,
        executionTimeMs,
      })
    })

    dockerProcess.stdin.write(input)
    dockerProcess.stdin.end()
  })
}

module.exports = {
  DEFAULT_EXECUTION_TIMEOUT_MS,
  DEFAULT_MEMORY_LIMIT,
  TIMEOUT_EXIT_CODE,
  buildDockerArgs,
  executeCodeInDocker,
  isMemoryLimitError,
}
