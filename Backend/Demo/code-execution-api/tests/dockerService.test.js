const assert = require("node:assert/strict");
const path = require("path");
const test = require("node:test");

const {
  DEFAULT_EXECUTION_TIMEOUT_MS,
  DEFAULT_MEMORY_LIMIT,
  TIMEOUT_EXIT_CODE,
  buildDockerArgs,
  isMemoryLimitError,
} = require("../services/dockerService");

test("uses a 10 second default execution timeout", () => {
  assert.equal(DEFAULT_EXECUTION_TIMEOUT_MS, 10000);
});

test("uses a 512mb default memory limit", () => {
  assert.equal(DEFAULT_MEMORY_LIMIT, "512m");
});

test("uses linux timeout exit code for time limit exceeded", () => {
  assert.equal(TIMEOUT_EXIT_CODE, 124);
});

test("detects compiler processes killed by memory limits", () => {
  assert.equal(isMemoryLimitError("g++: fatal error: Killed signal terminated program cc1plus"), true);
  assert.equal(isMemoryLimitError("expected ';'"), false);
});

test("buildDockerArgs enables stdin, disables network, limits memory, and uses configured language commands", () => {
  const folderPath = path.join("tmp", "run-1");
  const args = buildDockerArgs("cpp", folderPath);

  assert.equal(args[0], "run");
  assert.ok(args.includes("-i"));
  assert.ok(args.includes("--network"));
  assert.ok(args.includes("none"));
  assert.ok(args.includes("--memory"));
  assert.ok(args.includes("512m"));
  assert.ok(args.includes("--cpus"));
  assert.ok(args.includes("1"));
  assert.ok(args.includes("gcc:latest"));
  assert.equal(args.at(-3), "sh");
  assert.equal(args.at(-2), "-lc");
  assert.equal(args.at(-1), "timeout 10s sh -lc 'g++ main.cpp -o main && echo __COMPILE_SUCCESS__ 1>&2 && ./main'");
});

test("buildDockerArgs does not add compile marker for javascript", () => {
  const args = buildDockerArgs("javascript", "temp-folder");

  assert.equal(args.at(-1), "timeout 10s sh -lc 'node main.js'");
});

test("buildDockerArgs throws for unsupported languages", () => {
  assert.throws(() => buildDockerArgs("python", "temp-folder"), /unsupported language/i);
});
