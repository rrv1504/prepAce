const asyncHandler = require('../utils/asyncHandler')
const userService = require('../services/userService')
const { sendSuccess } = require('../utils/apiResponse')
const { requireEnum, requireFields } = require('../utils/validation')

const listUsers = asyncHandler(async (req, res) => {
  const users = await userService.listUsers(req.query)
  sendSuccess(res, {
    message: 'Users loaded',
    data: users,
    legacy: { items: users },
  })
})

const updateUserStatus = asyncHandler(async (req, res) => {
  requireFields(req.body, ['status'])
  requireEnum(req.body.status, ['pending', 'active', 'suspended'], 'status')
  const user = await userService.updateUserStatus(req.params.id, req.body.status)
  sendSuccess(res, {
    message: 'User status updated',
    data: user,
    legacy: user.toObject ? user.toObject() : user,
  })
})

const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id)
  sendSuccess(res, {
    message: 'User deleted',
    data: {},
    legacy: { message: 'User deleted' },
  })
})

module.exports = { listUsers, updateUserStatus, deleteUser }
