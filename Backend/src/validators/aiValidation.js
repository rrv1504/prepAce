const ALLOWED_DIFFICULTIES = ['Easy', 'Medium', 'Hard']

function validDifficulty(value, fallback = 'Medium') {
  return ALLOWED_DIFFICULTIES.includes(value) ? value : fallback
}

function asArray(value) {
  return Array.isArray(value) ? value : []
}

function asNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function normalizeQuestionType(value, question = {}) {
  const raw = String(value || '').toLowerCase().replace(/[\s-]+/g, '_')
  if (['fill_blank', 'fill_blanks', 'fill_in_blank', 'fill_in_blanks'].includes(raw)) return 'fill_blank'
  if (['coding', 'code'].includes(raw)) return 'coding'
  if (['textual', 'text', 'scenario_based', 'scenario'].includes(raw)) return 'textual'
  if (['true_false', 'truefalse', 'output_prediction', 'debugging', 'mcq'].includes(raw)) return 'mcq'
  if (question.starterCode || question.testCases) return 'coding'
  if (question.blankAnswer) return 'fill_blank'
  if (Array.isArray(question.options) && question.options.length) return 'mcq'
  return 'textual'
}

function validateQuizQuestions(value, fallbackQuestions = []) {
  const questions = asArray(value).map((question, index) => {
    const options = asArray(question?.options).map(String).slice(0, 6)
    const type = normalizeQuestionType(question?.type || question?.questionType, question)
    const correctFromAnswer = options.findIndex(option => option === question?.correctAnswer)
    const correct = Number.isInteger(question?.correct)
      ? question.correct
      : correctFromAnswer >= 0
        ? correctFromAnswer
        : 0

    return {
      id: String(question?.id || `question-${Date.now()}-${index}`),
      type,
      questionType: type,
      question: String(question?.question || question?.questionText || question?.statement || `Question ${index + 1}`),
      options,
      correct: Math.max(0, Math.min(correct, Math.max(options.length - 1, 0))),
      correctAnswer: String(question?.correctAnswer || options[correct] || ''),
      blankAnswer: question?.blankAnswer ? String(question.blankAnswer) : undefined,
      sampleAnswer: question?.sampleAnswer ? String(question.sampleAnswer) : undefined,
      starterCode: question?.starterCode && typeof question.starterCode === 'object' ? question.starterCode : undefined,
      testCases: asArray(question?.testCases).map(testCase => ({
        input: String(testCase?.input || ''),
        expected: String(testCase?.expected || testCase?.output || ''),
      })),
      marks: asNumber(question?.marks, type === 'coding' ? 5 : 1),
      timeLimit: asNumber(question?.timeLimit, type === 'coding' ? 600 : 60),
      explanation: String(question?.explanation || ''),
      difficulty: validDifficulty(question?.difficulty),
      topic: String(question?.topic || 'Interview Preparation'),
    }
  }).filter(question => question.question.trim())

  return questions.length ? questions : fallbackQuestions
}

function validateQuizPayload(payload = {}, fallback = { questions: [] }) {
  return {
    questions: validateQuizQuestions(payload.questions, fallback.questions),
  }
}

function validateRoadmapPayload(payload = {}, fallback) {
  const modules = asArray(payload.modules).map((module, moduleIndex) => ({
    id: String(module?.id || `module-${Date.now()}-${moduleIndex}`),
    title: String(module?.title || `Module ${moduleIndex + 1}`),
    description: String(module?.description || ''),
    difficulty: validDifficulty(module?.difficulty),
    estimatedHours: asNumber(module?.estimatedHours, 10),
    learningOutcomes: asArray(module?.learningOutcomes).map(String),
    prerequisites: asArray(module?.prerequisites).map(String),
    resources: asArray(module?.resources).map((resource, resourceIndex) => ({
      id: String(resource?.id || `resource-${moduleIndex}-${resourceIndex}`),
      title: String(resource?.title || 'Learning resource'),
      platform: String(resource?.platform || ''),
      resourceType: String(resource?.resourceType || ''),
      searchKeyword: String(resource?.searchKeyword || ''),
      estimatedTime: String(resource?.estimatedTime || ''),
      linkedResourceId: resource?.linkedResourceId ? String(resource.linkedResourceId) : undefined,
      url: resource?.url ? String(resource.url) : undefined,
    })),
    dailyTasks: asArray(module?.dailyTasks).map((task, taskIndex) => ({
      id: String(task?.id || `task-${moduleIndex}-${taskIndex}`),
      dayNumber: asNumber(task?.dayNumber, taskIndex + 1),
      taskName: String(task?.taskName || `Task ${taskIndex + 1}`),
      description: String(task?.description || ''),
      estimatedMinutes: asNumber(task?.estimatedMinutes, 60),
      status: ['pending', 'in-progress', 'done'].includes(task?.status) ? task.status : 'pending',
    })),
    quiz: {
      id: String(module?.quiz?.id || `quiz-${moduleIndex}`),
      title: String(module?.quiz?.title || `${module?.title || 'Module'} Quiz`),
      difficulty: validDifficulty(module?.quiz?.difficulty || module?.difficulty),
      passingScore: asNumber(module?.quiz?.passingScore, 70),
      distribution: module?.quiz?.distribution && typeof module.quiz.distribution === 'object' ? module.quiz.distribution : {},
      questions: validateQuizQuestions(module?.quiz?.questions, []),
    },
  })).filter(module => module.title.trim())

  if (!modules.length) return fallback

  return {
    title: String(payload.title || fallback.title || 'Roadmap'),
    summary: String(payload.summary || fallback.summary || ''),
    modules,
  }
}

module.exports = {
  validateQuizPayload,
  validateRoadmapPayload,
}
