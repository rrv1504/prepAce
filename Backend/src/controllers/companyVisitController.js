const asyncHandler = require('../utils/asyncHandler')
const companyVisitService = require('../services/companyVisitService')
const { sendSuccess } = require('../utils/apiResponse')
const { requireEnum } = require('../utils/validation')

const respondToVisit = asyncHandler(async (req, res) => {
  requireEnum(req.body.status, ['accepted', 'rejected'], 'status')
  const visit = await companyVisitService.respondToVisit({
    visitId: req.params.id,
    user: req.user,
    status: req.body.status,
    reason: req.body.reason,
  })

  sendSuccess(res, {
    message: 'Company visit response saved',
    data: visit,
    legacy: visit.toObject ? visit.toObject() : visit,
  })
})

module.exports = { respondToVisit }
