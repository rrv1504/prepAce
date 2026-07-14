const { saveCode } = require("../utils/fileService");
const { executeCodeInDocker } = require("../services/dockerService");
const languageConfig = require("../services/languageConfig");
const { cleanup } = require("../utils/cleanupService");

const createExecuteCodeController = (dependencies = {}) => {
  const saveCodeFn = dependencies.saveCode || saveCode;
  const executeCodeInDockerFn = dependencies.executeCodeInDocker || executeCodeInDocker;
  const cleanupFn = dependencies.cleanup || cleanup;
  const languageConfigMap = dependencies.languageConfig || languageConfig;
  const logger = dependencies.logger || console;

  return async (req, res) => {
    let folderPath = null;
    let normalizedLanguage = null;
    let startedAt = Date.now();
    let status = "Failed";
    try {
      const { code, language, input = "" } = req.body || {};
      normalizedLanguage = typeof language === "string" ? language.trim().toLowerCase() : "";
      const config = languageConfigMap[normalizedLanguage];

      if (typeof code !== "string" || code.trim() === "" || !normalizedLanguage) {
        return res.status(400).json({
          success: false,
          error: "Both code and language are required.",
        });
      }

      if (!config) {
        return res.status(400).json({
          success: false,
          error: `Unsupported language. Use one of: ${Object.keys(languageConfigMap).join(", ")}`,
        });
      }

      const savedFile = saveCodeFn(code, config.fileName);
      folderPath = savedFile.folderPath;

      const result = await executeCodeInDockerFn(normalizedLanguage, folderPath, String(input));
      status = result.status;

      res.json({
        success: result.status === "Success",
        status: result.status,
        output: result.stdout,
        error: result.error,
        errorType: result.errorType,
        stderr: result.stderr,
        exitCode: result.exitCode,
        executionTimeMs: result.executionTimeMs,
      });
    } catch (err) {
      status = "Server Error";
      return res.status(500).json({
        success: false,
        status,
        error: String(err),
      });
    } finally {
      if (folderPath) {
        cleanupFn(folderPath);
      }

      if (normalizedLanguage) {
        logger.log(`Language: ${normalizedLanguage} | Time: ${Date.now() - startedAt}ms | Status: ${status}`);
      }
    }
  };
};

const executeCode = createExecuteCodeController();

module.exports = {
  createExecuteCodeController,
  executeCode,
};
