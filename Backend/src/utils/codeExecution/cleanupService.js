const fs = require('fs')
const path = require('path')

function cleanup(folderPath) {
  try {
    fs.rmSync(folderPath, { recursive: true, force: true })
  } catch (error) {
    console.error('Cleanup error:', error.message)
  }
}

function cleanupOldTempEntries(maxAgeMs = 60 * 60 * 1000) {
  const tempPath = path.join(__dirname, '..', '..', '..', 'temp', 'code-runs')
  if (!fs.existsSync(tempPath)) return

  const now = Date.now()
  for (const entry of fs.readdirSync(tempPath, { withFileTypes: true })) {
    const entryPath = path.join(tempPath, entry.name)
    const stats = fs.statSync(entryPath)

    if (now - stats.mtimeMs > maxAgeMs) {
      cleanup(entryPath)
    }
  }
}

function startAutoCleanup(intervalMs = 30 * 60 * 1000, maxAgeMs = 60 * 60 * 1000) {
  cleanupOldTempEntries(maxAgeMs)
  const timer = setInterval(() => cleanupOldTempEntries(maxAgeMs), intervalMs)
  timer.unref()
}

module.exports = { cleanup, cleanupOldTempEntries, startAutoCleanup }
