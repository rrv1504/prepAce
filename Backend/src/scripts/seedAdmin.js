require('dotenv').config()

const connectDatabase = require('../config/db')
const User = require('../models/User')

async function seedAdmin() {
  await connectDatabase()

  const email = process.env.ADMIN_EMAIL || 'admin@prepace.com'
  const password = process.env.ADMIN_PASSWORD || 'password123'
  const existingAdmin = await User.findOne({ email })

  if (existingAdmin) {
    existingAdmin.name = process.env.ADMIN_NAME || existingAdmin.name || 'PrepAce Admin'
    existingAdmin.password = password
    existingAdmin.role = 'admin'
    existingAdmin.status = 'active'
    await existingAdmin.save()
    console.log(`Admin updated: ${email}`)
    process.exit(0)
  }

  await User.create({
    name: process.env.ADMIN_NAME || 'PrepAce Admin',
    email,
    password,
    role: 'admin',
    status: 'active',
    college: 'PrepAce',
    branch: 'Admin',
    year: 'N/A',
  })

  console.log(`Admin created: ${email}`)
  process.exit(0)
}

seedAdmin().catch((error) => {
  console.error(error)
  process.exit(1)
})
