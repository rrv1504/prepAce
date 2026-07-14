const OpenAI = require("openai");

const client = new OpenAI({
  baseURL: "https://models.github.ai/inference",
  apiKey: process.env.GITHUB_TOKEN,
});

module.exports = client;
