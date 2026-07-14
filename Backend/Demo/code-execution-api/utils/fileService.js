const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const saveCode = (code, fileName) => {
  const folderName = crypto.randomUUID();

  const folderPath = path.join(__dirname, "..", "temp", folderName);

  fs.mkdirSync(folderPath, { recursive: true });

  const filePath = path.join(folderPath, fileName);

  fs.writeFileSync(filePath, code);

  return {
    folderPath,
    filePath,
  };
};

module.exports = {
  saveCode,
};
