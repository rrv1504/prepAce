const languageConfig = require('./languageConfig')
const { executeCodeInDocker } = require('./dockerService')
const { saveCode } = require('../utils/codeExecution/fileService')
const { cleanup } = require('../utils/codeExecution/cleanupService')
const Submission = require('../models/Submission')
const JudgeConfig = require('../models/JudgeConfig')
const { badRequest } = require('../utils/appError')
const { refreshDsaProgress } = require('./dsaProgressService')

function normalizeLanguage(language) {
  return typeof language === 'string' ? language.trim().toLowerCase() : ''
}

async function runCodeOnce({ code, language, input = '', timeoutMs }) {
  const normalizedLanguage = normalizeLanguage(language)
  const config = languageConfig[normalizedLanguage]

  if (typeof code !== 'string' || code.trim() === '' || !normalizedLanguage) {
    throw badRequest('Both code and language are required')
  }

  if (!config) {
    throw badRequest(`Unsupported language. Use one of: ${Object.keys(languageConfig).join(', ')}`)
  }

  const savedFile = saveCode(code, config.fileName)
  try {
    const result = await executeCodeInDocker(
      normalizedLanguage,
      savedFile.folderPath,
      String(input),
      timeoutMs,
    );

    return result;
  } finally {
    cleanup(savedFile.folderPath);
  }
}

async function runCode(input) {
  const result = await runCodeOnce(input)
  return {
    passed: result.status === 'Success',
    ...result,
    output: result.stdout,
  }
}

async function judgeCode({ user, code, language, testCases = [], problemId, timeoutMs }) {
  const judgeConfig = problemId ? await JudgeConfig.findOne({ problemId: String(problemId) }) : null
  if (judgeConfig?.languages?.length) {
    const normalizedLabels = judgeConfig.languages.map(item => normalizeLanguage(item).replace('++', 'pp'))
    const current = normalizeLanguage(language)
    const aliases = { cpp: ['cpp', 'c++', 'cplusplus'], javascript: ['javascript', 'js'], python: ['python', 'py'] }
    const allowed = normalizedLabels.some(label => label === current || aliases[current]?.includes(label))
    if (!allowed) throw badRequest(`Language ${language} is disabled for this problem`)
  }
  const effectiveTimeout = timeoutMs || judgeConfig?.timeLimit
  const results = []
  for (const testCase of testCases) {
    const result = await runCodeOnce({
      code,
      language,
      input: testCase.input ?? '',
      timeoutMs: effectiveTimeout,
    })
    const actual = String(result.stdout ?? '').trim()
    const expected = String(testCase.expected ?? '').trim()
    results.push({
      input: testCase.input ?? '',
      expected,
      actual,
      pass: result.status === 'Success' && actual === expected,
      status: result.status,
      error: result.error,
      stderr: result.stderr,
      executionTimeMs: result.executionTimeMs,
    })
  }

  const testsPassed = results.filter(result => result.pass).length
  const allPassed = testsPassed === results.length
  const firstFailure = results.find(result => !result.pass)
  const rawVerdict = allPassed
    ? 'Accepted'
    : firstFailure?.status === 'Success'
      ? 'Wrong Answer'
      : firstFailure?.status || 'Runtime Error'
  const verdict = rawVerdict === 'Time Limit Exceeded'
    ? 'Time Limit Exceeded'
    : rawVerdict === 'Compilation Error'
      ? 'Compilation Error'
      : rawVerdict === 'Accepted' || rawVerdict === 'Wrong Answer'
        ? rawVerdict
        : 'Runtime Error'

  let submission = null
  if (user && problemId) {
    submission = await Submission.create({
      user: user._id,
      problem: problemId,
      lang: normalizeLanguage(language),
      code,
      verdict,
      runtime: `${Math.max(...results.map(result => result.executionTimeMs || 0))}ms`,
      memory: '',
      testsPassed,
      totalTests: results.length,
    })
    await refreshDsaProgress(user._id, problemId)
  }

  return {
    passed: allPassed,
    verdict,
    testsPassed,
    totalTests: results.length,
    results,
    submission,
  }
}

module.exports = {
  judgeCode,
  normalizeLanguage,
  runCode,
  runCodeOnce,
}
