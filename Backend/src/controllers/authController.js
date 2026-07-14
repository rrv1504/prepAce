const asyncHandler = require('../utils/asyncHandler')
const authService = require('../services/authService')
const { sendCreated, sendSuccess } = require('../utils/apiResponse')
const { requireFields } = require('../utils/validation')

const register = asyncHandler(async (req, res) => {
  requireFields(req.body, ['name', 'email', 'password'])
  const user = await authService.register(req.body)
  sendCreated(res, {
    message: 'Registration submitted. Wait for admin approval.',
    data: { user },
    legacy: { user },
  })
})

const login = asyncHandler(async (req, res) => {
  requireFields(req.body, ['email', 'password'])
  const result = await authService.login(req.body)
  sendSuccess(res, {
    message: 'Login successful',
    data: result,
    legacy: result,
  })
})

const me = asyncHandler(async (req, res) => {
  const user = authService.userPayload(req.user)
  sendSuccess(res, {
    message: 'Authenticated user loaded',
    data: { user },
    legacy: { user },
  })
})

const updateMe = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user._id, req.body)
  sendSuccess(res, {
    message: 'Profile updated',
    data: { user },
    legacy: { user },
  })
})

const leaderboard = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 10, 25)
  const result = await authService.getLeaderboard(req.user._id, limit)
  sendSuccess(res, {
    message: 'Leaderboard loaded',
    data: result,
    legacy: result,
  })
})

const weeklyActivity = asyncHandler(async (req, res) => {
  const activity = await authService.getWeeklyActivity(req.user._id)
  sendSuccess(res, {
    message: 'Weekly activity loaded',
    data: activity,
    legacy: { items: activity },
  })
})

module.exports = { register, login, me, updateMe, leaderboard, weeklyActivity }
