function buildQuizPrompt(input = {}) {
  const topics = Array.isArray(input.topics) && input.topics.length ? input.topics : [input.topic || "General Programming"];
  const topic = topics.join(", ");
  const difficulty = input.difficulty || "Medium";
  const passingScore = input.passingScore || 70;

  const requestedTypes = Array.isArray(input.questionTypes) && input.questionTypes.length
    ? input.questionTypes
    : Object.keys(input.distribution || {}).filter(key => Number(input.distribution[key]) > 0);

  const distribution = input.distribution || {};

  const totalQuestions =
    Number(input.count || 0) ||
    Number(distribution.mcq || 0) +
      Number(distribution.coding || 0) +
      Number(distribution.debugging || 0) +
      Number(distribution.trueFalse || 0) +
      Number(distribution.fillBlanks || 0) || 10;

  return `
You are an expert placement interviewer.

Generate EXACTLY ${totalQuestions} interview questions.

Topic:
${topic}

Difficulty:
${difficulty}

Passing Score:
${passingScore}

Question Distribution:
${JSON.stringify(distribution)}

Requested frontend question types:
${requestedTypes.join(", ") || "mcq"}

VERY IMPORTANT RULES:

- Return ONLY valid JSON.
- Do NOT wrap the JSON inside markdown.
- Do NOT write explanations outside JSON.
- Do NOT include \`\`\`json.
- Generate EXACTLY ${totalQuestions} questions.

Each question MUST contain:

{
  "id": "unique-id",
  "type": "mcq | fill_blank | textual | coding",
  "question": "Question text",
  "options": [
    "Option A",
    "Option B",
    "Option C",
    "Option D"
  ],
  "correctAnswer": "Option A",
  "correct": 0,
  "explanation": "Short explanation",
  "difficulty": "${difficulty}",
  "topic": "One of: ${topic}",
  "marks": 1,
  "timeLimit": 60,
  "blankAnswer": "Only for fill_blank",
  "sampleAnswer": "Only for textual",
  "starterCode": { "python": "def solve():\\n    pass", "javascript": "function solve() {}", "java": "class Main {}", "cpp": "#include <bits/stdc++.h>", "c": "#include <stdio.h>" },
  "testCases": [{ "input": "sample input", "expected": "expected output" }]
}

For mcq questions include options and a numeric correct index.
For fill_blank questions include blankAnswer.
For textual questions include sampleAnswer.
For coding questions include starterCode and testCases.

Return ONLY this object:

{
  "questions": [
    ...
  ]
}
`;
}

module.exports = buildQuizPrompt;
