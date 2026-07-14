const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

function saveCode(code, fileName) {
  const folderName = crypto.randomUUID()
  const folderPath = path.join(__dirname, '..', '..', '..', 'temp', 'code-runs', folderName)
  const filePath = path.join(folderPath, fileName)

  fs.mkdirSync(folderPath, { recursive: true })
  fs.writeFileSync(filePath, code)

  return { folderPath, filePath }
}

module.exports = { saveCode }
