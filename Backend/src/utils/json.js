const { badRequest } = require('./appError')

function safeJsonParse(value, fallback = null) {
  if (value && typeof value === 'object') return value
  if (typeof value !== 'string' || !value.trim()) return fallback

  try {
    return JSON.parse(value)
  } catch (error) {
    return fallback
  }
}

function parseJsonOrThrow(value, message = 'Invalid JSON received') {
  const parsed = safeJsonParse(value)
  if (!parsed) throw badRequest(message)
  return parsed
}

module.exports = {
  parseJsonOrThrow,
  safeJsonParse,
}
