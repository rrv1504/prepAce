const logger = require('../utils/logger')

function notFound(req, res, next) {
  const error = new Error(`Not found - ${req.originalUrl}`)
  error.statusCode = 404
  next(error)
}

function normalizeError(error, res) {
  let statusCode = error.statusCode || (res.statusCode === 200 ? 500 : res.statusCode)
  let message = error.message || 'Server error'
  let details = error.details

  if (error.name === 'ValidationError') {
    statusCode = 400
    message = 'Validation failed'
    details = Object.values(error.errors || {}).map(err => err.message)
  }

  if (error.name === 'CastError') {
    statusCode = 400
    message = 'Invalid resource id'
  }

  if (error.code === 11000) {
    statusCode = 409
    message = 'A record with this value already exists'
    details = error.keyValue
  }

  return { statusCode, message, details }
}

function errorHandler(error, req, res, next) {
  const { statusCode, message, details } = normalizeError(error, res)

  logger.error('Request failed', {
    method: req.method,
    path: req.originalUrl,
    statusCode,
    message,
  })

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
    details,
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
  })
}

module.exports = { notFound, errorHandler }
