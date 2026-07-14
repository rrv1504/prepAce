const express = require('express')
const createCrudController = require('../controllers/crudController')
const { protect, requireAdmin } = require('../middleware/auth')

function createCrudRouter(Model, options = {}) {
  const router = express.Router()
  const controller = createCrudController(Model, options)
  const writeMiddleware = options.publicWrite ? [] : [protect, requireAdmin]
  const readMiddleware = options.protectedRead || options.userScoped ? [protect] : []
  const scopedWriteMiddleware = options.userScoped ? [protect] : writeMiddleware

  router.get('/', ...readMiddleware, controller.list)
  router.get('/:id', ...readMiddleware, controller.getById)
  router.post('/', ...scopedWriteMiddleware, controller.create)
  router.put('/:id', ...scopedWriteMiddleware, controller.update)
  router.patch('/:id', ...scopedWriteMiddleware, controller.update)
  router.delete('/:id', ...scopedWriteMiddleware, controller.remove)

  return router
}

module.exports = createCrudRouter
