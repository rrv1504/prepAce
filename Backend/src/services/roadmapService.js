const Roadmap = require('../models/Roadmap')
const createCrudService = require('./crudService')

module.exports = createCrudService(Roadmap)
