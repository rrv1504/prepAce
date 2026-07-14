const cors = require('cors')
const express = require('express')
const morgan = require('morgan')
const apiRoutes = require('./routes')
const { errorHandler, notFound } = require('./middleware/errorHandler')

const app = express()

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:8443',
  exposedHeaders: ['Content-Disposition'],
}))
app.use(express.json({ limit: process.env.JSON_LIMIT || '25mb' }))
app.use(express.urlencoded({ extended: true }))

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}

app.use('/api', apiRoutes)
app.use(notFound)
app.use(errorHandler)

module.exports = app
