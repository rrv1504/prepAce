require('dotenv').config()

const app = require('./app')
const connectDatabase = require('./config/db')
const { startAutoCleanup } = require('./utils/codeExecution/cleanupService')
const logger = require('./utils/logger')

const port = process.env.PORT || 5000

process.on('unhandledRejection', error => {
  logger.error('Unhandled promise rejection', { message: error.message, stack: error.stack })
})

process.on('uncaughtException', error => {
  logger.error('Uncaught exception', { message: error.message, stack: error.stack })
  process.exit(1)
})

connectDatabase()
  .then(() => {
    startAutoCleanup()
    app.listen(port, () => {
      logger.info(`PrepAce API running on http://localhost:${port}`)
    })
  })
  .catch((error) => {
    logger.error('Failed to start server', { message: error.message })
    process.exit(1)
  })
