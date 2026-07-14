const { AppError, badRequest } = require('../utils/appError')
const logger = require('../utils/logger')

function getJudgeBaseUrl() {
  return (process.env.JUDGE_SERVICE_URL || '')
    .replace(/\/+$/, '')
    .replace(/\/code\/(run|judge)$/i, '')
    .replace(/\/code$/i, '')
}

function isJudgeProxyEnabled() {
  return Boolean(getJudgeBaseUrl())
}

async function proxyCodeRequest({ path, body, authorization }) {
  const baseUrl = getJudgeBaseUrl()
  if (!baseUrl) throw badRequest('Judge service URL is not configured')

  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
  logger.info('Proxying code execution request', {
    url,
    language: body?.language,
    testCases: Array.isArray(body?.testCases) ? body.testCases.length : undefined,
  })

  const headers = { 'Content-Type': 'application/json' }
  if (authorization) headers.Authorization = authorization

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), Number(process.env.JUDGE_PROXY_TIMEOUT_MS || 30000))

  let response
  let raw = ''
  try {
    response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body || {}),
      signal: controller.signal,
    })
    raw = await response.text()
  } catch (error) {
    throw new AppError(
      error.name === 'AbortError' ? 'Judge service timed out' : 'Judge service is unreachable',
      502,
      { url, cause: error.message }
    )
  } finally {
    clearTimeout(timeout)
  }

  let payload = {}
  try {
    payload = raw ? JSON.parse(raw) : {}
  } catch {
    payload = { raw }
  }

  if (!response.ok || payload.success === false) {
    throw new AppError(
      payload.message || `Judge service request failed with status ${response.status}`,
      response.status >= 500 ? 502 : 400,
      {
        judgeStatus: response.status,
        url,
        judgeResponse: payload,
      }
    )
  }

  return payload.data ?? payload
}

module.exports = {
  isJudgeProxyEnabled,
  proxyCodeRequest,
}
