const assert = require("node:assert/strict");
const test = require("node:test");

const languageConfig = require("../services/languageConfig");

test("supports required languages with correct source filenames", () => {
  assert.equal(languageConfig.c.fileName, "main.c");
  assert.equal(languageConfig.cpp.fileName, "main.cpp");
  assert.equal(languageConfig["c++"].fileName, "main.cpp");
  assert.equal(languageConfig.java.fileName, "Main.java");
  assert.equal(languageConfig.javascript.fileName, "main.js");
});

test("compiled languages define compile and run commands", () => {
  for (const language of ["c", "cpp", "c++", "java"]) {
    assert.ok(languageConfig[language].compile);
    assert.ok(languageConfig[language].run);
  }
});

test("javascript runs without a compile command", () => {
  assert.equal(languageConfig.javascript.compile, null);
  assert.equal(languageConfig.javascript.run, "node main.js");
});
