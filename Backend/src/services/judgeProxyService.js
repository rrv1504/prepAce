const { badRequest } = require('../utils/appError')
const logger = require('../utils/logger')

function getJudgeBaseUrl() {
  return (process.env.JUDGE_SERVICE_URL || '').replace(/\/+$/, '')
}

function isJudgeProxyEnabled() {
  return Boolean(getJudgeBaseUrl())
}

async function proxyCodeRequest({ path, body, authorization }) {
  const baseUrl = getJudgeBaseUrl()
  if (!baseUrl) throw badRequest('Judge service URL is not configured')

  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
  logger.info('Proxying code execution request', { url })

  const headers = { 'Content-Type': 'application/json' }
  if (authorization) headers.Authorization = authorization

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body || {}),
  })
  const payload = await response.json().catch(() => ({}))

  if (!response.ok || payload.success === false) {
    throw badRequest(payload.message || `Judge service request failed with status ${response.status}`, payload)
  }

  return payload.data ?? payload
}

module.exports = {
  isJudgeProxyEnabled,
  proxyCodeRequest,
}
