const CompanyVisit = require('../models/CompanyVisit')
const { notFound } = require('../utils/appError')

async function respondToVisit({ visitId, user, status, reason }) {
  const visit = await CompanyVisit.findById(visitId)
  if (!visit) throw notFound('Company visit not found')

  visit.responses = visit.responses.filter(response => String(response.user) !== String(user._id))
  visit.responses.push({
    user: user._id,
    userName: user.name,
    status,
    reason,
  })

  return visit.save()
}

module.exports = {
  respondToVisit,
}
