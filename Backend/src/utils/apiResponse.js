function sendSuccess(res, { statusCode = 200, message = '', data = {}, meta, legacy } = {}) {
  const payload = {
    success: true,
    message,
    data,
  }

  if (meta !== undefined) payload.meta = meta
  if (legacy && typeof legacy === 'object') Object.assign(payload, legacy)

  return res.status(statusCode).json(payload)
}

function sendCreated(res, options = {}) {
  return sendSuccess(res, { ...options, statusCode: 201 })
}

module.exports = {
  sendCreated,
  sendSuccess,
}
