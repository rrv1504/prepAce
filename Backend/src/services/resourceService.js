const Resource = require('../models/Resource')
const createCrudService = require('./crudService')

module.exports = createCrudService(Resource)
