const buildQuizPrompt = require("../prompts/quizPrompt");
const buildRoadmapPrompt = require("../prompts/roadmapPrompt");
const {
  validateQuizPayload,
  validateRoadmapPayload,
} = require("../validators/aiValidation");
const { safeJsonParse } = require("../utils/json");
const logger = require("../utils/logger");
const OpenAI = require("openai");

const client = new OpenAI({
  baseURL: "https://models.github.ai/inference",
  apiKey: process.env.GITHUB_TOKEN,
});

function fallbackQuestions(input = {}) {
  const topics = Array.isArray(input.topics) && input.topics.length ? input.topics : [input.topic || input.title || "Interview Preparation"];
  const types = Array.isArray(input.questionTypes) && input.questionTypes.length ? input.questionTypes : ["mcq"];
  const count = Math.max(1, Math.min(Number(input.count) || 10, 50));
  const difficulty = input.difficulty || "Medium";

  return Array.from({ length: count }, (_, i) => {
    const topic = topics[i % topics.length];
    const type = types[i % types.length];
    const base = {
    id: `q-${i + 1}`,
      type,
      question: `Question ${i + 1} about ${topic}`,
      marks: type === "coding" ? 5 : 1,
      timeLimit: type === "coding" ? 600 : 60,
      explanation: "Generated fallback explanation. Add an AI key for richer questions.",
      difficulty,
      topic,
    };

    if (type === "fill_blank") {
      return {
        ...base,
        question: `${topic}: Fill in the blank. A database index is used to improve ____ performance.`,
        blankAnswer: "query",
      };
    }

    if (type === "textual") {
      return {
        ...base,
        question: `Explain one important concept from ${topic} with an example.`,
        sampleAnswer: `A good answer explains the concept clearly and gives a practical ${topic} example.`,
      };
    }

    if (type === "coding") {
      return {
        ...base,
        question: `Write a function to solve a simple ${topic} practice problem.`,
        starterCode: {
          python: "def solve():\n    pass",
          javascript: "function solve() {\n  // write code here\n}",
          java: "class Solution {\n  public void solve() {}\n}",
          cpp: "#include <bits/stdc++.h>\nusing namespace std;\nint main(){ return 0; }",
          c: "#include <stdio.h>\nint main(){ return 0; }",
        },
        testCases: [{ input: "sample", expected: "sample" }],
      };
    }

    return {
      ...base,
    options: ["Option A", "Option B", "Option C", "Option D"],
      correct: 0,
    correctAnswer: "Option A",
    };
  });
}

function fallbackRoadmap(input = {}) {
  return {
    title: `${input.companyName || "Placement"} Roadmap`,
    summary: "Generated fallback roadmap",
    modules: [],
  };
}

async function requestGithubAI(prompt, fallbackValue, operation) {
  const model = process.env.GITHUB_MODEL || "openai/gpt-4.1";

  if (!process.env.GITHUB_TOKEN) {
    logger.warn("GitHub token missing. Using fallback.", { operation });

    return {
      source: "fallback",
      data: fallbackValue,
    };
  }

  try {
    logger.info("GitHub AI request started", {
      operation,
      model,
    });

    const response = await client.chat.completions.create({
      model,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "You are an expert placement mentor. Return ONLY valid JSON. Never use markdown.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    console.log("=========== FULL RESPONSE ===========");
    console.dir(response, { depth: null });

    const text = response.choices?.[0]?.message?.content || "";

    console.log("=========== AI TEXT ===========");
    console.log(text);
    console.log("====================================");
    const parsed = safeJsonParse(text, fallbackValue);

    logger.info("GitHub AI request completed", {
      operation,
    });

    return {
      source: "github-models",
      data: parsed,
    };
  } catch (err) {
    logger.error("GitHub AI failed", {
      operation,
      message: err.message,
    });

    throw err;
  }
}

async function generateQuiz(input) {
  const fallback = {
    questions: fallbackQuestions(input),
  };

  const result = await requestGithubAI(
    buildQuizPrompt(input),
    fallback,
    "quiz",
  );

  console.log("Generated quiz:", result.data);

  return {
    id: `ai-${Date.now()}`,
    title: `${Array.isArray(input.topics) ? input.topics.join(", ") : input.topic || "AI"} Quiz`,
    type: "mixed",
    duration: Number(input.minutes) || Math.max(5, Math.round((Number(input.count) || 10) * 1.5)),
    description: "AI generated mock test",
    source: result.source,
    questions: validateQuizPayload(result.data, fallback).questions,
  };
}

async function generateRoadmap(input) {
  const fallback = fallbackRoadmap(input);

  const result = await requestGithubAI(
    buildRoadmapPrompt(input),
    fallback,
    "roadmap",
  );

  return {
    source: result.source,
    roadmap: validateRoadmapPayload(result.data, fallback),
  };
}

module.exports = {
  generateQuiz,
  generateRoadmap,
  fallbackQuestions,
  fallbackRoadmap,
};
