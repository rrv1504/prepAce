const asyncHandler = require('../utils/asyncHandler')
const createCrudService = require('../services/crudService')
const { sendCreated, sendSuccess } = require('../utils/apiResponse')

function createCrudController(Model, options = {}) {
  const service = createCrudService(Model, options)

  return {
    list: asyncHandler(async (req, res) => {
      const docs = await service.list(req.user)
      sendSuccess(res, {
        message: 'Records loaded',
        data: docs,
        legacy: { items: docs },
      })
    }),

    getById: asyncHandler(async (req, res) => {
      const doc = await service.getById(req.params.id, req.user)
      sendSuccess(res, {
        message: 'Record loaded',
        data: doc,
        legacy: doc.toObject ? doc.toObject() : doc,
      })
    }),

    create: asyncHandler(async (req, res) => {
      const doc = await service.create(req.body, req.user)
      sendCreated(res, {
        message: 'Record created',
        data: doc,
        legacy: doc.toObject ? doc.toObject() : doc,
      })
    }),

    update: asyncHandler(async (req, res) => {
      const doc = await service.update(req.params.id, req.body, req.user)
      sendSuccess(res, {
        message: 'Record updated',
        data: doc,
        legacy: doc.toObject ? doc.toObject() : doc,
      })
    }),

    remove: asyncHandler(async (req, res) => {
      await service.remove(req.params.id, req.user)
      sendSuccess(res, {
        message: 'Record deleted',
        data: {},
        legacy: { message: 'Record deleted' },
      })
    }),
  }
}

module.exports = createCrudController
