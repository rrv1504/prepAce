const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const test = require("node:test");

const { saveCode } = require("../utils/fileService");
const { cleanup, cleanupOldTempEntries } = require("../utils/cleanupService");

const tempPath = path.join(__dirname, "..", "temp");

test("saveCode writes code to the requested filename", () => {
  const savedFile = saveCode("console.log('hello');", "main.js");

  try {
    assert.equal(path.basename(savedFile.filePath), "main.js");
    assert.equal(fs.readFileSync(savedFile.filePath, "utf8"), "console.log('hello');");
    assert.ok(fs.existsSync(savedFile.folderPath));
  } finally {
    cleanup(savedFile.folderPath);
  }
});

test("cleanup removes an execution folder", () => {
  const savedFile = saveCode("int main() { return 0; }", "main.c");

  cleanup(savedFile.folderPath);

  assert.equal(fs.existsSync(savedFile.folderPath), false);
});

test("cleanupOldTempEntries removes stale temp entries and keeps fresh ones", () => {
  fs.mkdirSync(tempPath, { recursive: true });

  const stalePath = path.join(tempPath, `stale-${Date.now()}`);
  const freshPath = path.join(tempPath, `fresh-${Date.now()}`);
  fs.mkdirSync(stalePath);
  fs.mkdirSync(freshPath);

  const oldTime = new Date(Date.now() - 2 * 60 * 60 * 1000);
  fs.utimesSync(stalePath, oldTime, oldTime);

  try {
    cleanupOldTempEntries(60 * 60 * 1000);

    assert.equal(fs.existsSync(stalePath), false);
    assert.equal(fs.existsSync(freshPath), true);
  } finally {
    cleanup(stalePath);
    cleanup(freshPath);
  }
});
