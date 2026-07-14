const { notFound } = require('../utils/appError')

function createCrudService(Model, options = {}) {
  function scopedFilter(user) {
    if (!options.userScoped || !user || user.role === 'admin') return {}
    return { user: user._id }
  }

  return {
    list(user) {
      return Model.find(scopedFilter(user)).sort({ createdAt: -1 })
    },

    async getById(id, user) {
      const doc = await Model.findOne({ _id: id, ...scopedFilter(user) })
      if (!doc) throw notFound()
      return doc
    },

    create(data, user) {
      const payload = options.userScoped && user ? { ...data, user: user._id } : data
      return Model.create(payload)
    },

    async update(id, data, user) {
      const payload = { ...data }
      if (options.userScoped) delete payload.user
      const doc = await Model.findOneAndUpdate({ _id: id, ...scopedFilter(user) }, payload, {
        new: true,
        runValidators: true,
      })
      if (!doc) throw notFound()
      return doc
    },

    async remove(id, user) {
      const doc = await Model.findOneAndDelete({ _id: id, ...scopedFilter(user) })
      if (!doc) throw notFound()
      return doc
    },
  }
}

module.exports = createCrudService
