const { badRequest } = require('./appError')

function requireFields(source, fields) {
  const missing = fields.filter(field => {
    const value = source?.[field]
    return value === undefined || value === null || value === ''
  })

  if (missing.length) {
    throw badRequest(`Missing required fields: ${missing.join(', ')}`, { missing })
  }
}

function requireEnum(value, allowed, fieldName) {
  if (!allowed.includes(value)) {
    throw badRequest(`${fieldName} must be one of: ${allowed.join(', ')}`)
  }
}

function requireNonEmptyArray(value, fieldName) {
  if (!Array.isArray(value) || value.length === 0) {
    throw badRequest(`${fieldName} must be a non-empty array`)
  }
}

module.exports = {
  requireEnum,
  requireFields,
  requireNonEmptyArray,
}
