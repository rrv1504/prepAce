function format(level, message, meta) {
  const entry = {
    level,
    message,
    time: new Date().toISOString(),
    ...(meta ? { meta } : {}),
  }
  return JSON.stringify(entry)
}

function info(message, meta) {
  console.log(format('info', message, meta))
}

function warn(message, meta) {
  console.warn(format('warn', message, meta))
}

function error(message, meta) {
  console.error(format('error', message, meta))
}

module.exports = {
  error,
  info,
  warn,
}
