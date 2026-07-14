const mongoose = require('mongoose')
const dns = require('dns')
const logger = require('../utils/logger')

async function connectDatabase() {
  const mongoUri = process.env.MONGO_URI

  if (!mongoUri) {
    throw new Error('MONGO_URI is missing. Add it to Backend/.env')
  }

  if (process.env.DNS_SERVERS) {
    dns.setServers(process.env.DNS_SERVERS.split(',').map(server => server.trim()).filter(Boolean))
  }

  mongoose.set('strictQuery', true)
  const connection = await mongoose.connect(mongoUri)
  logger.info('MongoDB connected', { host: connection.connection.host })
}

module.exports = connectDatabase
