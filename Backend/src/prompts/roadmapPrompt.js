function buildRoadmapPrompt(input = {}) {
  return `
Generate a placement preparation roadmap as strict JSON.
Company: ${input.companyName}
Role: ${input.role}
Duration weeks: ${input.durationWeeks}
Difficulty: ${input.difficulty}
Hiring requirements: ${input.hiringRequirements}
Eligibility: ${input.eligibilityCriteria || 'Not provided'}
Additional notes: ${input.additionalNotes || 'None'}

Return shape:
{
  "title": string,
  "summary": string,
  "modules": [{
    "id": string,
    "title": string,
    "description": string,
    "difficulty": string,
    "estimatedHours": number,
    "learningOutcomes": string[],
    "prerequisites": string[],
    "resources": [{ "id": string, "title": string, "platform": string, "resourceType": string, "searchKeyword": string, "estimatedTime": string }],
    "dailyTasks": [{ "id": string, "dayNumber": number, "taskName": string, "description": string, "estimatedMinutes": number, "status": "pending" }],
    "quiz": { "id": string, "title": string, "difficulty": string, "passingScore": number, "distribution": { "mcq": number, "coding": number, "debugging": number, "trueFalse": number, "fillBlanks": number }, "questions": [] }
  }]
}`
}

module.exports = buildRoadmapPrompt
