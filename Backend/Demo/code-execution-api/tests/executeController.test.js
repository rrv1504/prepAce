const assert = require("node:assert/strict");
const test = require("node:test");

const { createExecuteCodeController } = require("../controllers/executeController");

const createResponse = () => {
  const response = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  return response;
};

test("returns 400 when code or language is missing", async () => {
  const controller = createExecuteCodeController();
  const response = createResponse();

  await controller({ body: {} }, response);

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.success, false);
  assert.match(response.body.error, /code and language/i);
});

test("returns 400 when only language is provided", async () => {
  const controller = createExecuteCodeController();
  const response = createResponse();

  await controller({ body: { language: "abc" } }, response);

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.success, false);
  assert.match(response.body.error, /code and language/i);
});

test("returns 400 for unsupported languages", async () => {
  const controller = createExecuteCodeController();
  const response = createResponse();

  await controller({ body: { code: "print('hello')", language: "python" } }, response);

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.success, false);
  assert.match(response.body.error, /unsupported language/i);
});

test("executes supported language and cleans up the execution folder", async () => {
  const calls = [];
  const logs = [];
  const code = "public class Main { public static void main(String[] args) { System.out.println(\"Hello Java\"); } }";
  const controller = createExecuteCodeController({
    saveCode(code, fileName) {
      calls.push(["saveCode", code, fileName]);
      return { folderPath: "temp-folder", filePath: `temp-folder/${fileName}` };
    },
    executeCodeInDocker(language, folderPath, input) {
      calls.push(["executeCodeInDocker", language, folderPath, input]);
      return Promise.resolve({
        status: "Success",
        stdout: "Hello Java\n",
        stderr: "",
        error: null,
        errorType: null,
        exitCode: 0,
        executionTimeMs: 43,
      });
    },
    cleanup(folderPath) {
      calls.push(["cleanup", folderPath]);
    },
    logger: {
      log(message) {
        logs.push(message);
      },
    },
  });
  const response = createResponse();

  await controller(
    {
      body: {
        code,
        language: "JAVA",
        input: "Roshni\n",
      },
    },
    response
  );

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, {
    success: true,
    status: "Success",
    output: "Hello Java\n",
    error: null,
    errorType: null,
    stderr: "",
    exitCode: 0,
    executionTimeMs: 43,
  });
  assert.deepEqual(calls, [
    ["saveCode", code, "Main.java"],
    ["executeCodeInDocker", "java", "temp-folder", "Roshni\n"],
    ["cleanup", "temp-folder"],
  ]);
  assert.match(logs[0], /Language: java .* Status: Success/);
});

test("passes empty string input when custom input is not provided", async () => {
  const calls = [];
  const controller = createExecuteCodeController({
    saveCode() {
      return { folderPath: "temp-folder", filePath: "temp-folder/main.js" };
    },
    executeCodeInDocker(language, folderPath, input) {
      calls.push(["executeCodeInDocker", language, folderPath, input]);
      return Promise.resolve({
        status: "Success",
        stdout: "done",
        stderr: "",
        error: null,
        errorType: null,
        exitCode: 0,
        executionTimeMs: 10,
      });
    },
    cleanup() {},
  });
  const response = createResponse();

  await controller({ body: { code: "console.log('done')", language: "javascript" } }, response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(calls, [["executeCodeInDocker", "javascript", "temp-folder", ""]]);
});

test("trims and lowercases language names", async () => {
  const calls = [];
  const controller = createExecuteCodeController({
    saveCode() {
      return { folderPath: "temp-folder", filePath: "temp-folder/main.cpp" };
    },
    executeCodeInDocker(language) {
      calls.push(["executeCodeInDocker", language]);
      return Promise.resolve({
        status: "Success",
        stdout: "ok",
        stderr: "",
        error: null,
        errorType: null,
        exitCode: 0,
        executionTimeMs: 5,
      });
    },
    cleanup() {},
  });
  const response = createResponse();

  await controller({ body: { code: "int main(){return 0;}", language: " CPP " } }, response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(calls, [["executeCodeInDocker", "cpp"]]);
});

test("returns compilation error details without 500 status", async () => {
  const controller = createExecuteCodeController({
    saveCode() {
      return { folderPath: "temp-folder", filePath: "temp-folder/main.cpp" };
    },
    executeCodeInDocker() {
      return Promise.resolve({
        status: "Compilation Error",
        stdout: "",
        stderr: "expected ';'",
        error: "expected ';'",
        errorType: "Compilation Error",
        exitCode: 1,
        executionTimeMs: 12,
      });
    },
    cleanup() {},
  });
  const response = createResponse();

  await controller({ body: { code: "bad code", language: "cpp" } }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.success, false);
  assert.equal(response.body.status, "Compilation Error");
  assert.equal(response.body.exitCode, 1);
});

test("returns runtime error details without 500 status", async () => {
  const controller = createExecuteCodeController({
    saveCode() {
      return { folderPath: "temp-folder", filePath: "temp-folder/main.js" };
    },
    executeCodeInDocker() {
      return Promise.resolve({
        status: "Runtime Error",
        stdout: "",
        stderr: "ReferenceError",
        error: "ReferenceError",
        errorType: "Runtime Error",
        exitCode: 1,
        executionTimeMs: 20,
      });
    },
    cleanup() {},
  });
  const response = createResponse();

  await controller({ body: { code: "missing()", language: "javascript" } }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.success, false);
  assert.equal(response.body.status, "Runtime Error");
  assert.equal(response.body.errorType, "Runtime Error");
});

test("cleans up even when execution fails", async () => {
  const calls = [];
  const controller = createExecuteCodeController({
    saveCode() {
      calls.push(["saveCode"]);
      return { folderPath: "temp-folder", filePath: "temp-folder/main.js" };
    },
    executeCodeInDocker() {
      calls.push(["executeCodeInDocker"]);
      return Promise.reject("Runtime error");
    },
    cleanup(folderPath) {
      calls.push(["cleanup", folderPath]);
    },
  });
  const response = createResponse();

  await controller({ body: { code: "throw new Error('x')", language: "javascript" } }, response);

  assert.equal(response.statusCode, 500);
  assert.equal(response.body.success, false);
  assert.match(response.body.error, /runtime error/i);
  assert.deepEqual(calls, [["saveCode"], ["executeCodeInDocker"], ["cleanup", "temp-folder"]]);
});
