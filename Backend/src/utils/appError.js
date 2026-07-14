class AppError extends Error {
  constructor(message, statusCode = 500, details) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.details = details
    Error.captureStackTrace?.(this, this.constructor)
  }
}

function badRequest(message, details) {
  return new AppError(message, 400, details)
}

function notFound(message = 'Record not found') {
  return new AppError(message, 404)
}

function unauthorized(message = 'Not authorized') {
  return new AppError(message, 401)
}

function forbidden(message = 'Forbidden') {
  return new AppError(message, 403)
}

module.exports = {
  AppError,
  badRequest,
  forbidden,
  notFound,
  unauthorized,
}
