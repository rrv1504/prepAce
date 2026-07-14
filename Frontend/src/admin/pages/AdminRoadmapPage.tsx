import { useMemo, useState } from 'react'
import { Archive, Bot, ChevronDown, ChevronRight, Copy, Eye, GripVertical, Layers, Pencil, Plus, Save, Sparkles, Trash2, X } from 'lucide-react'
import { useAppContext, type MockQuestion, type QuestionType, type StudyRoadmap } from '../../context/AppContext'
import RichTextEditor from '../../components/RichTextEditor'
import { aiService, roadmapService } from '../../lib/services'
import { normalizeId } from '../../lib/api'

type Difficulty = 'Easy' | 'Medium' | 'Hard'
type Status = 'pending' | 'in-progress' | 'done'
type Resource = NonNullable<StudyRoadmap['modules']>[number]['resources'][number]
type DailyTask = NonNullable<StudyRoadmap['modules']>[number]['dailyTasks'][number]
type QuizQuestion = NonNullable<StudyRoadmap['modules']>[number]['quiz']['questions'][number]
type RoadmapModule = NonNullable<StudyRoadmap['modules']>[number]

type BuilderForm = {
  companyName: string
  companyLogo: string
  role: string
  durationWeeks: number
  difficulty: Difficulty
  hiringRequirements: string
  eligibilityCriteria: string
  additionalNotes: string
}

const inputSt = { background: 'var(--muted)', border: '1px solid rgba(99,102,241,0.16)', color: 'var(--foreground)', colorScheme: 'inherit' as const }
const inputCls = 'w-full px-3 py-2 rounded-lg text-sm outline-none'
const cardSt = { background: 'var(--card)', border: '1px solid rgba(99,102,241,0.14)' }
const emptyForm: BuilderForm = { companyName: '', companyLogo: '', role: '', durationWeeks: 6, difficulty: 'Medium', hiringRequirements: '', eligibilityCriteria: '', additionalNotes: '' }
const qTypeLabels: Record<QuestionType, string> = { mcq: 'MCQ', fill_blank: 'Fill Blank', textual: 'Textual', coding: 'Coding' }
const langs = ['python', 'javascript', 'java', 'cpp', 'c'] as const

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function makeQuestion(topic: string, difficulty: Difficulty, questionType = 'MCQ'): QuizQuestion {
  return {
    id: uid('question'),
    question: `What is the strongest preparation strategy for ${topic}?`,
    options: ['Pattern recognition', 'Only memorizing answers', 'Ignoring edge cases', 'Skipping revision'],
    correctAnswer: 'Pattern recognition',
    explanation: 'Strong candidates map concepts to reusable patterns, edge cases, and clear tradeoffs.',
    difficulty,
    topic,
    questionType,
    type: questionType === 'Coding' ? 'coding' : questionType === 'Fill in blanks' ? 'fill_blank' : questionType === 'True False' || questionType === 'MCQ' ? 'mcq' : 'textual',
    marks: questionType === 'Coding' ? 3 : 1,
    timeLimit: questionType === 'Coding' ? 600 : 60,
    correct: 0,
    blankAnswer: questionType === 'Fill in blanks' ? 'Pattern recognition' : undefined,
    sampleAnswer: questionType === 'Scenario Based' ? 'A strong answer should explain the approach, tradeoffs, and edge cases.' : undefined,
    starterCode: questionType === 'Coding' ? { python: '', javascript: '', java: '', cpp: '', c: '' } : undefined,
    testCases: questionType === 'Coding' ? [{ input: '', expected: '' }] : undefined,
  }
}

function makeModule(index: number, difficulty: Difficulty, company = 'Target Company', role = 'SDE'): RoadmapModule {
  const names = ['DSA Foundations', 'Core CS Concepts', 'Advanced Problem Solving', 'Company Practice']
  const title = names[index % names.length]
  return {
    id: uid('module'),
    title,
    description: `${title} for ${company} ${role} preparation.`,
    difficulty,
    estimatedHours: 12 + index * 2,
    learningOutcomes: ['Solve timed interview problems', 'Explain tradeoffs clearly', 'Build revision notes'],
    prerequisites: index === 0 ? ['Basic programming syntax'] : ['Complete previous module'],
    resources: [{ id: uid('resource'), title: `${title} practice set`, platform: 'PrepAce', resourceType: 'Practice Set', searchKeyword: `${company} ${title}`, estimatedTime: '3 hours' }],
    dailyTasks: Array.from({ length: 4 }, (_, i) => ({ id: uid('task'), dayNumber: index * 4 + i + 1, taskName: `${title} Day ${i + 1}`, description: 'Study concepts, solve problems, and revise mistakes.', estimatedMinutes: 120, status: 'pending' as Status })),
    quiz: {
      id: uid('quiz'),
      title: `${title} Quiz`,
      difficulty,
      passingScore: 70,
      distribution: { mcq: 6, coding: 2, outputPrediction: 1, debugging: 1, fillBlanks: 2, trueFalse: 2, scenarioBased: 1 },
      questions: [makeQuestion(title, difficulty)],
    },
  }
}

function localModules(form: BuilderForm) {
  return Array.from({ length: 4 }, (_, i) => makeModule(i, form.difficulty, form.companyName || 'Target Company', form.role || 'SDE'))
}

function localQuizQuestions(module: RoadmapModule) {
  const total = Math.max(3, Math.min(12, Object.values(module.quiz.distribution).reduce((sum, value) => sum + Number(value || 0), 0)))
  const types = ['MCQ', 'Coding', 'Output Prediction', 'Debugging', 'Fill in blanks', 'True False', 'Scenario Based']
  return Array.from({ length: total }, (_, i) => makeQuestion(module.title, module.quiz.difficulty, types[i % types.length]))
}

function normalizeRoadmapModule(input: Partial<RoadmapModule>, index: number, form: BuilderForm): RoadmapModule {
  const fallback = makeModule(index, form.difficulty, form.companyName || 'Target Company', form.role || 'SDE')
  return {
    ...fallback,
    ...input,
    id: input.id || (input as any)._id || uid('module'),
    title: input.title || fallback.title,
    difficulty: (input.difficulty as Difficulty) || form.difficulty,
    estimatedHours: Number(input.estimatedHours ?? fallback.estimatedHours),
    learningOutcomes: Array.isArray(input.learningOutcomes) ? input.learningOutcomes : fallback.learningOutcomes,
    prerequisites: Array.isArray(input.prerequisites) ? input.prerequisites : fallback.prerequisites,
    resources: Array.isArray(input.resources)
      ? input.resources.map((resource: any) => ({
          ...resource,
          id: resource.id || resource._id || uid('resource'),
        }))
      : fallback.resources,
    dailyTasks: Array.isArray(input.dailyTasks)
      ? input.dailyTasks.map((task: any, taskIndex: number) => ({
          ...task,
          id: task.id || task._id || uid('task'),
          dayNumber: Number(task.dayNumber || taskIndex + 1),
          taskName: task.taskName || task.name || task.title || `Task ${taskIndex + 1}`,
          description: task.description || '',
          estimatedMinutes: Number(task.estimatedMinutes || 90),
          status: task.status || 'pending',
        }))
      : fallback.dailyTasks,
    quiz: {
      ...fallback.quiz,
      ...(input.quiz || {}),
      questions: Array.isArray(input.quiz?.questions)
        ? input.quiz.questions.map((question: any) => ({
            ...makeQuestion(question.topic || input.title || fallback.title, question.difficulty || form.difficulty, question.questionType || 'MCQ'),
            ...question,
            id: question.id || question._id || uid('question'),
          }))
        : fallback.quiz.questions,
    },
  }
}

function fromMockQuestion(question: MockQuestion, difficulty: Difficulty): QuizQuestion {
  return {
    id: uid('bank-question'),
    question: question.question,
    options: question.options || ['', '', '', ''],
    correctAnswer: question.type === 'mcq' ? question.options?.[question.correct || 0] || '' : question.blankAnswer || question.sampleAnswer || question.explanation || '',
    explanation: question.explanation || '',
    difficulty,
    topic: question.topic,
    questionType: qTypeLabels[question.type],
    type: question.type,
    marks: question.marks,
    timeLimit: question.timeLimit,
    correct: question.correct,
    blankAnswer: question.blankAnswer,
    sampleAnswer: question.sampleAnswer,
    starterCode: question.starterCode,
    testCases: question.testCases,
    sourceId: question.sourceId,
  }
}

function TextList({ title, items, onChange }: { title: string; items: string[]; onChange: (items: string[]) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase" style={{ color: 'var(--muted-foreground)' }}>{title}</p>
        <button onClick={() => onChange([...items, ''])} className="text-xs font-semibold" style={{ color: '#a5b4fc' }}>Add</button>
      </div>
      {items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <input value={item} onChange={e => onChange(items.map((x, i) => i === index ? e.target.value : x))} className={inputCls} style={inputSt} />
          <button onClick={() => onChange(items.filter((_, i) => i !== index))} className="p-2 rounded-lg" style={{ color: '#f87171' }}><Trash2 size={14} /></button>
        </div>
      ))}
    </div>
  )
}

function ResourceEditor({ resources, onChange }: { resources: Resource[]; onChange: (resources: Resource[]) => void }) {
  const { resources: uploadedResources } = useAppContext()
  const update = (id: string, patch: Partial<Resource>) => onChange(resources.map(r => r.id === id ? { ...r, ...patch } : r))
  const addLinked = (resourceId: string) => {
    const found = uploadedResources.find(r => r.id === resourceId)
    if (!found) return
    onChange([...resources, {
      id: uid('resource'),
      title: found.title,
      platform: 'PrepAce',
      resourceType: found.type,
      searchKeyword: found.topic,
      estimatedTime: 'Self paced',
      linkedResourceId: found.id,
      url: found.url,
    }])
  }
  const generateResource = () => onChange([...resources, {
    id: uid('resource'),
    title: 'AI generated study pack',
    platform: 'PrepAce AI',
    resourceType: 'Generated Guide',
    searchKeyword: 'Auto generated from roadmap topic',
    estimatedTime: '45 minutes',
    url: '#',
  }])
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-sm">Resources</h4>
        <div className="flex gap-2">
          <select onChange={e => { if (e.target.value) addLinked(e.target.value); e.currentTarget.value = '' }} className="px-2 py-1 rounded-lg text-xs outline-none" style={inputSt} defaultValue="">
            <option value="">Link uploaded resource</option>
            {uploadedResources.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
          </select>
          <button onClick={generateResource} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold" style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}><Sparkles size={12} /> AI</button>
          <button onClick={() => onChange([...resources, { id: uid('resource'), title: '', platform: '', resourceType: '', searchKeyword: '', estimatedTime: '' }])} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold" style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}><Plus size={12} /> Add</button>
        </div>
      </div>
      {resources.map(resource => (
        <div key={resource.id} className="grid md:grid-cols-5 gap-2 p-3 rounded-xl" style={{ background: 'var(--muted)' }}>
          <input value={resource.title} onChange={e => update(resource.id, { title: e.target.value })} placeholder="Resource Title" className={inputCls} style={inputSt} />
          <input value={resource.platform} onChange={e => update(resource.id, { platform: e.target.value })} placeholder="Platform" className={inputCls} style={inputSt} />
          <input value={resource.resourceType} onChange={e => update(resource.id, { resourceType: e.target.value })} placeholder="Resource Type" className={inputCls} style={inputSt} />
          <input value={resource.searchKeyword} onChange={e => update(resource.id, { searchKeyword: e.target.value })} placeholder="Search Keyword" className={inputCls} style={inputSt} />
          <div className="flex gap-2">
            <input value={resource.estimatedTime} onChange={e => update(resource.id, { estimatedTime: e.target.value })} placeholder="Time" className={inputCls} style={inputSt} />
            <button onClick={() => onChange(resources.filter(r => r.id !== resource.id))} className="p-2 rounded-lg" style={{ color: '#f87171' }}><Trash2 size={14} /></button>
          </div>
        </div>
      ))}
    </div>
  )
}

function TaskEditor({ tasks, onChange }: { tasks: DailyTask[]; onChange: (tasks: DailyTask[]) => void }) {
  const update = (id: string, patch: Partial<DailyTask>) => onChange(tasks.map(t => t.id === id ? { ...t, ...patch } : t))
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-sm">Daily Tasks</h4>
        <button onClick={() => onChange([...tasks, { id: uid('task'), dayNumber: tasks.length + 1, taskName: '', description: '', estimatedMinutes: 90, status: 'pending' }])} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold" style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}><Plus size={12} /> Add Task</button>
      </div>
      {tasks.map(task => (
        <div key={task.id} className="grid md:grid-cols-[80px_1fr_1.4fr_120px_120px_auto] gap-2 p-3 rounded-xl" style={{ background: 'var(--muted)' }}>
          <input type="number" value={task.dayNumber} onChange={e => update(task.id, { dayNumber: Number(e.target.value) })} className={inputCls} style={inputSt} />
          <input value={task.taskName} onChange={e => update(task.id, { taskName: e.target.value })} placeholder="Task Name" className={inputCls} style={inputSt} />
          <input value={task.description} onChange={e => update(task.id, { description: e.target.value })} placeholder="Description" className={inputCls} style={inputSt} />
          <input type="number" value={task.estimatedMinutes} onChange={e => update(task.id, { estimatedMinutes: Number(e.target.value) })} className={inputCls} style={inputSt} />
          <select value={task.status} onChange={e => update(task.id, { status: e.target.value as Status })} className={inputCls} style={inputSt}><option value="pending">Pending</option><option value="in-progress">In Progress</option><option value="done">Done</option></select>
          <button onClick={() => onChange(tasks.filter(t => t.id !== task.id))} className="p-2 rounded-lg" style={{ color: '#f87171' }}><Trash2 size={14} /></button>
        </div>
      ))}
    </div>
  )
}

function QuizBuilder({ module, onChange, onClose, onGenerate }: { module: RoadmapModule; onChange: (module: RoadmapModule) => void; onClose: () => void; onGenerate: () => Promise<void> }) {
  const { aptitudeQuestions, dsaProblems } = useAppContext()
  const [activeLang, setActiveLang] = useState<typeof langs[number]>('python')
  const quiz = module.quiz
  const updateQuestion = (id: string, patch: Partial<QuizQuestion>) => onChange({ ...module, quiz: { ...quiz, questions: quiz.questions.map(q => q.id === id ? { ...q, ...patch } : q) } })
  const setQuestions = (questions: QuizQuestion[]) => onChange({ ...module, quiz: { ...quiz, questions } })
  const addBankQuestion = (value: string) => {
    const [kind, id] = value.split(':')
    if (kind === 'aptitude') {
      const found = aptitudeQuestions.find(q => q.id === id)
      if (!found) return
      setQuestions([...quiz.questions, fromMockQuestion({
        id: `apt-${found.id}`,
        type: 'mcq',
        topic: found.topic,
        subtopic: found.subtopic,
        question: found.question,
        marks: found.marks,
        timeLimit: found.timeLimit,
        options: found.options,
        correct: found.correct,
        explanation: found.explanation,
        sourceId: found.id,
      }, quiz.difficulty)])
    }
    if (kind === 'dsa') {
      const found = dsaProblems.find(p => p.id === id)
      if (!found) return
      setQuestions([...quiz.questions, fromMockQuestion({
        id: `dsa-${found.id}`,
        type: 'coding',
        topic: found.topic,
        question: `${found.title}<br/>${found.description}`,
        marks: found.difficulty === 'Hard' ? 5 : found.difficulty === 'Medium' ? 3 : 2,
        timeLimit: 600,
        starterCode: found.starterCode,
        testCases: found.sampleTestCases,
        explanation: found.editorial,
        sourceId: found.id,
      }, found.difficulty as Difficulty)])
    }
  }
  const setQuestionType = (question: QuizQuestion, type: QuestionType) => {
    const patch: Partial<QuizQuestion> = { type, questionType: qTypeLabels[type] }
    if (type === 'mcq') Object.assign(patch, { options: question.options?.length ? question.options : ['', '', '', ''], correct: question.correct ?? 0 })
    if (type === 'fill_blank') Object.assign(patch, { blankAnswer: question.blankAnswer || question.correctAnswer || '' })
    if (type === 'textual') Object.assign(patch, { sampleAnswer: question.sampleAnswer || question.correctAnswer || '' })
    if (type === 'coding') Object.assign(patch, { starterCode: question.starterCode || { python: '', javascript: '', java: '', cpp: '', c: '' }, testCases: question.testCases?.length ? question.testCases : [{ input: '', expected: '' }] })
    updateQuestion(question.id, patch)
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.72)' }}>
      <div className="w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-2xl" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
        <div className="sticky top-0 z-10 p-5 space-y-4" style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black">AI Quiz Builder</h2>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Google Forms structure with Coursera-style assessment detail.</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg" style={{ color: 'var(--muted-foreground)' }}><X size={18} /></button>
          </div>
          <div className="grid md:grid-cols-[1fr_130px_130px_140px_auto] gap-3">
            <input value={quiz.title} onChange={e => onChange({ ...module, quiz: { ...quiz, title: e.target.value } })} className={inputCls} style={inputSt} placeholder="Quiz Name" />
            <input type="number" value={quiz.passingScore} onChange={e => onChange({ ...module, quiz: { ...quiz, passingScore: Number(e.target.value) } })} className={inputCls} style={inputSt} />
            <div className="px-3 py-2 rounded-lg text-sm font-bold" style={{ background: 'var(--muted)' }}>{quiz.questions.length} Questions</div>
            <select value={quiz.difficulty} onChange={e => onChange({ ...module, quiz: { ...quiz, difficulty: e.target.value as Difficulty } })} className={inputCls} style={inputSt}><option>Easy</option><option>Medium</option><option>Hard</option></select>
            <button onClick={onGenerate} className="px-4 py-2 rounded-lg text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>Generate Again</button>
          </div>
          <select onChange={e => { if (e.target.value) addBankQuestion(e.target.value); e.currentTarget.value = '' }} defaultValue="" className={inputCls} style={inputSt}>
            <option value="">Link question from existing bank</option>
            {aptitudeQuestions.map(q => <option key={q.id} value={`aptitude:${q.id}`}>{q.topic} - {q.question.replace(/<[^>]+>/g, '').slice(0, 90)}</option>)}
            {dsaProblems.map(p => <option key={p.id} value={`dsa:${p.id}`}>Coding - {p.title}</option>)}
          </select>
        </div>
        <div className="p-6 space-y-4">
          {quiz.questions.map((question, index) => (
            <div key={question.id} className="rounded-2xl overflow-hidden" style={cardSt}>
              <div className="h-2" style={{ background: 'linear-gradient(90deg,#6366f1,#22c55e)' }} />
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black">Question {index + 1}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}>{question.topic || 'Topic'}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>{question.difficulty}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>{question.questionType || 'MCQ'}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => updateQuestion(question.id, makeQuestion(question.topic, question.difficulty, question.questionType))} className="text-xs font-semibold" style={{ color: '#a5b4fc' }}>Regenerate</button>
                    <button onClick={() => setQuestions([...quiz.questions, { ...question, id: uid('question'), question: `${question.question} Copy` }])} className="text-xs font-semibold">Duplicate</button>
                    <button onClick={() => setQuestions(quiz.questions.filter(q => q.id !== question.id))} className="text-xs font-semibold" style={{ color: '#f87171' }}>Delete</button>
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-2">
                  <input value={question.topic} onChange={e => updateQuestion(question.id, { topic: e.target.value })} placeholder="Topic" className={inputCls} style={inputSt} />
                  <select value={question.difficulty} onChange={e => updateQuestion(question.id, { difficulty: e.target.value as Difficulty })} className={inputCls} style={inputSt}><option>Easy</option><option>Medium</option><option>Hard</option></select>
                  <select value={question.type || 'mcq'} onChange={e => setQuestionType(question, e.target.value as QuestionType)} className={inputCls} style={inputSt}>{(Object.keys(qTypeLabels) as QuestionType[]).map(t => <option key={t} value={t}>{qTypeLabels[t]}</option>)}</select>
                </div>
                <RichTextEditor value={question.question} onChange={value => updateQuestion(question.id, { question: value })} placeholder={question.type === 'fill_blank' ? 'Use ___ for blanks.' : 'Question statement'} />
                {(question.type || 'mcq') === 'mcq' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Options</p>
                      <button onClick={() => updateQuestion(question.id, { options: [...(question.options || []), ''] })} className="text-xs font-semibold" style={{ color: '#a5b4fc' }}>+ Add option</button>
                    </div>
                    {(question.options || []).map((option, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <button onClick={() => updateQuestion(question.id, { correct: i, correctAnswer: option })} className="w-5 h-5 rounded-full border-2 flex-shrink-0" style={{ borderColor: question.correct === i ? '#22c55e' : 'var(--border)', background: question.correct === i ? '#22c55e' : 'transparent' }} />
                        <input value={option} onChange={e => updateQuestion(question.id, { options: question.options.map((o, oi) => oi === i ? e.target.value : o), correctAnswer: question.correct === i ? e.target.value : question.correctAnswer })} placeholder={`Option ${i + 1}`} className={inputCls} style={inputSt} />
                        {question.options.length > 2 && <button onClick={() => updateQuestion(question.id, { options: question.options.filter((_, oi) => oi !== i), correct: Math.max(0, Math.min(question.correct || 0, question.options.length - 2)) })} style={{ color: '#f87171' }}><X size={13} /></button>}
                      </div>
                    ))}
                  </div>
                )}
                {question.type === 'fill_blank' && <input value={question.blankAnswer || ''} onChange={e => updateQuestion(question.id, { blankAnswer: e.target.value, correctAnswer: e.target.value })} placeholder="Exact blank answer" className={inputCls} style={inputSt} />}
                {question.type === 'textual' && <RichTextEditor value={question.sampleAnswer || ''} onChange={value => updateQuestion(question.id, { sampleAnswer: value, correctAnswer: value })} placeholder="Sample answer / rubric" />}
                {question.type === 'coding' && (
                  <div className="space-y-3">
                    <div className="flex gap-1 p-1 rounded-lg w-fit" style={{ background: 'var(--muted)' }}>
                      {langs.map(lang => <button key={lang} onClick={() => setActiveLang(lang)} className="px-2 py-1 rounded-md text-xs font-semibold" style={{ background: activeLang === lang ? 'var(--card)' : 'transparent', color: activeLang === lang ? 'var(--foreground)' : 'var(--muted-foreground)' }}>{lang}</button>)}
                    </div>
                    <textarea value={question.starterCode?.[activeLang] || ''} onChange={e => updateQuestion(question.id, { starterCode: { ...(question.starterCode || {}), [activeLang]: e.target.value } })} rows={5} placeholder={`${activeLang} starter code`} className="w-full px-3 py-2 rounded-lg text-xs font-mono outline-none resize-none" style={inputSt} />
                    {(question.testCases || []).map((testCase, i) => (
                      <div key={i} className="grid md:grid-cols-[1fr_1fr_auto] gap-2">
                        <textarea value={testCase.input} onChange={e => updateQuestion(question.id, { testCases: (question.testCases || []).map((tc, ti) => ti === i ? { ...tc, input: e.target.value } : tc) })} rows={2} placeholder="Input" className={inputCls + ' font-mono resize-none'} style={inputSt} />
                        <textarea value={testCase.expected} onChange={e => updateQuestion(question.id, { testCases: (question.testCases || []).map((tc, ti) => ti === i ? { ...tc, expected: e.target.value } : tc) })} rows={2} placeholder="Expected" className={inputCls + ' font-mono resize-none'} style={inputSt} />
                        <button onClick={() => updateQuestion(question.id, { testCases: (question.testCases || []).filter((_, ti) => ti !== i) })} style={{ color: '#f87171' }}><Trash2 size={14} /></button>
                      </div>
                    ))}
                    <button onClick={() => updateQuestion(question.id, { testCases: [...(question.testCases || []), { input: '', expected: '' }] })} className="text-xs font-semibold" style={{ color: '#a5b4fc' }}>+ Add test case</button>
                  </div>
                )}
                <input value={question.correctAnswer} onChange={e => updateQuestion(question.id, { correctAnswer: e.target.value })} placeholder="Correct Answer" className={inputCls} style={inputSt} />
                <textarea value={question.explanation} onChange={e => updateQuestion(question.id, { explanation: e.target.value })} rows={2} placeholder="Explanation" className={inputCls + ' resize-none'} style={inputSt} />
              </div>
            </div>
          ))}
          <div className="sticky bottom-0 flex flex-wrap gap-3 p-4 rounded-2xl" style={cardSt}>
            <button onClick={() => setQuestions([...quiz.questions, makeQuestion(module.title, quiz.difficulty)])} className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: 'var(--muted)' }}>Add Question</button>
            <button onClick={() => alert('Preview is available in the editable cards above.')} className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: 'var(--muted)' }}>Preview Quiz</button>
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}>Save Draft</button>
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}>Publish Quiz</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ModuleCard({ module, index, expanded, onToggle, onChange, onDuplicate, onDelete, onDragStart, onDrop, onQuiz }: {
  module: RoadmapModule
  index: number
  expanded: boolean
  onToggle: () => void
  onChange: (module: RoadmapModule) => void
  onDuplicate: () => void
  onDelete: () => void
  onDragStart: () => void
  onDrop: () => void
  onQuiz: () => void
}) {
  const color = module.difficulty === 'Easy' ? '#22c55e' : module.difficulty === 'Medium' ? '#f59e0b' : '#ef4444'
  return (
    <div draggable onDragStart={onDragStart} onDragOver={e => e.preventDefault()} onDrop={onDrop} className="rounded-2xl overflow-hidden" style={cardSt}>
      <div className="flex items-center gap-3 p-4">
        <GripVertical size={16} style={{ color: 'var(--muted-foreground)' }} />
        <button onClick={onToggle} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc' }}>{expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}</button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold" style={{ color: 'var(--muted-foreground)' }}>Module {index + 1}</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: `${color}20`, color }}>{module.difficulty}</span>
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{module.estimatedHours}h</span>
          </div>
          <input value={module.title} onChange={e => onChange({ ...module, title: e.target.value })} className="mt-1 w-full bg-transparent outline-none font-bold" style={{ color: 'var(--foreground)' }} />
        </div>
        <button onClick={onDuplicate} className="p-2 rounded-lg" style={{ color: '#a5b4fc' }}><Copy size={15} /></button>
        <button onClick={onDelete} className="p-2 rounded-lg" style={{ color: '#f87171' }}><Trash2 size={15} /></button>
      </div>
      {expanded && (
        <div className="p-5 space-y-5" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="grid md:grid-cols-[1fr_150px_140px] gap-3">
            <textarea value={module.description} onChange={e => onChange({ ...module, description: e.target.value })} rows={2} placeholder="Description" className={inputCls + ' resize-none'} style={inputSt} />
            <select value={module.difficulty} onChange={e => onChange({ ...module, difficulty: e.target.value as Difficulty })} className={inputCls} style={inputSt}><option>Easy</option><option>Medium</option><option>Hard</option></select>
            <input type="number" value={module.estimatedHours} onChange={e => onChange({ ...module, estimatedHours: Number(e.target.value) })} className={inputCls} style={inputSt} />
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <TextList title="Learning Outcomes" items={module.learningOutcomes} onChange={learningOutcomes => onChange({ ...module, learningOutcomes })} />
            <TextList title="Prerequisites" items={module.prerequisites} onChange={prerequisites => onChange({ ...module, prerequisites })} />
          </div>
          <ResourceEditor resources={module.resources} onChange={resources => onChange({ ...module, resources })} />
          <TaskEditor tasks={module.dailyTasks} onChange={dailyTasks => onChange({ ...module, dailyTasks })} />
          <div className="p-4 rounded-xl flex flex-wrap items-center justify-between gap-3" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.16)' }}>
            <div>
              <h4 className="font-bold text-sm">{module.quiz.title}</h4>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{module.quiz.questions.length} questions · Passing {module.quiz.passingScore}% · {module.quiz.difficulty}</p>
            </div>
            <button onClick={onQuiz} className="px-3 py-2 rounded-xl text-sm font-bold" style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}>Generate Quiz</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminRoadmapPage() {
  const { roadmaps, setRoadmaps, companyVisits } = useAppContext()
  const [builderOpen, setBuilderOpen] = useState(false)
  const [form, setForm] = useState<BuilderForm>(emptyForm)
  const [modules, setModules] = useState<RoadmapModule[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [quizModuleId, setQuizModuleId] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [editingRoadmapId, setEditingRoadmapId] = useState<string | null>(null)
  const [listFilter, setListFilter] = useState<'published' | 'draft' | 'archived' | 'all'>('published')

  const title = useMemo(() => `${form.companyName || 'Company'} ${form.role || 'Role'} Roadmap`, [form.companyName, form.role])
  const quizModule = modules.find(m => m.id === quizModuleId) || null
  const publishedCount = roadmaps.filter(r => (r.status || 'published') === 'published').length
  const draftCount = roadmaps.filter(r => r.status === 'draft').length
  const archivedCount = roadmaps.filter(r => r.status === 'archived').length
  const filteredRoadmaps = roadmaps.filter(r => listFilter === 'all' || (r.status || 'published') === listFilter)

  const set = (key: keyof BuilderForm, value: string | number) => setForm(prev => ({ ...prev, [key]: value }))
  const updateModule = (id: string, next: RoadmapModule) => setModules(prev => prev.map(m => m.id === id ? next : m))

  function openCreate() {
    setEditingRoadmapId(null); setForm(emptyForm); setModules([]); setExpanded(null); setBuilderOpen(true)
  }

  function openEdit(roadmap: StudyRoadmap) {
    setEditingRoadmapId(roadmap.id)
    setForm({
      companyName: roadmap.companyName || roadmap.targetCompanies[0] || '',
      companyLogo: roadmap.companyLogo || '',
      role: roadmap.role || '',
      durationWeeks: roadmap.durationWeeks || Number.parseInt(roadmap.duration) || 6,
      difficulty: roadmap.difficulty || 'Medium',
      hiringRequirements: roadmap.hiringRequirements || roadmap.description,
      eligibilityCriteria: roadmap.eligibilityCriteria || '',
      additionalNotes: roadmap.additionalNotes || '',
    })
    const restored = roadmap.modules?.length ? roadmap.modules as RoadmapModule[] : roadmap.phases.map((phase, index) => ({ ...makeModule(index, roadmap.difficulty || 'Medium', roadmap.companyName || roadmap.targetCompanies[0] || 'Company', roadmap.role || 'Role'), title: phase.title, dailyTasks: phase.tasks.map((task, taskIndex) => ({ id: uid('task'), dayNumber: taskIndex + 1, taskName: task, description: task, estimatedMinutes: 90, status: 'pending' as Status })) }))
    setModules(restored); setExpanded(restored[0]?.id || null); setBuilderOpen(true)
  }

  async function generateRoadmap() {
    setGenerating(true)
    try {
      const result: any = await aiService.generateRoadmap(form)
      const generated = result.roadmap?.modules || result.modules || []
      setModules((generated.length ? generated : localModules(form)).map((m: RoadmapModule, index: number) => normalizeRoadmapModule(m, index, form)))
    } catch (error) {
      console.warn('AI roadmap generation failed, using local roadmap', error)
      setModules(localModules(form))
    } finally {
      setGenerating(false)
    }
  }

  async function generateQuiz(module: RoadmapModule) {
    try {
      const result: any = await aiService.generateQuiz({ ...module.quiz, topic: module.title })
      const generated = result.questions || result.quiz?.questions || []
      const questions = (generated.length ? generated : localQuizQuestions(module)).map((q: QuizQuestion) => ({ ...makeQuestion(module.title, module.quiz.difficulty), ...q, id: q.id || (q as any)._id || uid('question') }))
      updateModule(module.id, { ...module, quiz: { ...module.quiz, questions } })
    } catch (error) {
      console.warn('AI quiz generation failed, using local questions', error)
      updateModule(module.id, { ...module, quiz: { ...module.quiz, questions: localQuizQuestions(module) } })
    }
  }

  async function saveRoadmap(status: 'draft' | 'published') {
    const roadmap: StudyRoadmap = {
      id: editingRoadmapId || uid(status),
      title,
      description: `${form.difficulty} ${form.durationWeeks}-week roadmap for ${form.companyName} ${form.role}.`,
      targetCompanies: form.companyName ? [form.companyName] : [],
      duration: `${form.durationWeeks} weeks`,
      phases: modules.map(module => ({ title: module.title, tasks: module.dailyTasks.map(task => `Day ${task.dayNumber}: ${task.taskName} - ${task.description}`) })),
      createdAt: new Date().toISOString().split('T')[0],
      enrolledCount: 0,
      status,
      companyName: form.companyName,
      companyLogo: form.companyLogo,
      role: form.role,
      difficulty: form.difficulty,
      durationWeeks: form.durationWeeks,
      hiringRequirements: form.hiringRequirements,
      eligibilityCriteria: form.eligibilityCriteria,
      additionalNotes: form.additionalNotes,
      modules,
    }
    const payload = {
      ...roadmap,
      modules: modules.map((module, index) => normalizeRoadmapModule(module, index, form)),
    }
    try {
      const saved: any = editingRoadmapId
        ? await roadmapService.update(editingRoadmapId, payload)
        : await roadmapService.create(payload)
      const normalized = { ...(normalizeId(saved as any) as StudyRoadmap), __synced: true } as any
      setRoadmaps(editingRoadmapId ? roadmaps.map(r => r.id === editingRoadmapId ? normalized : r) : [normalized, ...roadmaps])
      setEditingRoadmapId(null)
      setBuilderOpen(false)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save roadmap')
    }
  }

  async function archiveRoadmap(id: string) {
    try {
      const saved = await roadmapService.update(id, { status: 'archived' })
      const normalized = { ...(normalizeId(saved as any) as StudyRoadmap), __synced: true } as any
      setRoadmaps(roadmaps.map(r => r.id === id ? normalized : r))
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to archive roadmap')
    }
  }

  function reorder(dropIndex: number) {
    if (dragIndex === null || dragIndex === dropIndex) return
    const next = [...modules]
    const [moved] = next.splice(dragIndex, 1)
    next.splice(dropIndex, 0, moved)
    setModules(next)
    setDragIndex(null)
  }

  if (builderOpen) {
    return (
      <div className="space-y-6">
        {quizModule && <QuizBuilder module={quizModule} onClose={() => setQuizModuleId(null)} onGenerate={() => generateQuiz(quizModule)} onChange={next => updateModule(quizModule.id, next)} />}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black">AI Roadmap Builder</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>{editingRoadmapId ? 'Edit existing roadmap' : 'Generate and edit a company roadmap'}.</p>
          </div>
          <button onClick={() => { setBuilderOpen(false); setEditingRoadmapId(null) }} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>Back</button>
        </div>

        <div className="rounded-2xl p-5 space-y-5" style={cardSt}>
          <div>
            <h2 className="font-black">Requirements</h2>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Tell the AI what this company expects, then refine the generated modules.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            <input value={form.companyName} onChange={e => set('companyName', e.target.value)} placeholder="Company Name" className={inputCls} style={inputSt} />
            <input value={form.companyLogo} onChange={e => set('companyLogo', e.target.value)} placeholder="Company Logo URL or emoji" className={inputCls} style={inputSt} />
            <input value={form.role} onChange={e => set('role', e.target.value)} placeholder="Role" className={inputCls} style={inputSt} />
            <input type="number" value={form.durationWeeks} onChange={e => set('durationWeeks', Number(e.target.value))} placeholder="Duration Weeks" className={inputCls} style={inputSt} />
            <select value={form.difficulty} onChange={e => set('difficulty', e.target.value as Difficulty)} className={inputCls} style={inputSt}><option>Easy</option><option>Medium</option><option>Hard</option></select>
            <textarea value={form.hiringRequirements} onChange={e => set('hiringRequirements', e.target.value)} rows={5} placeholder="Hiring Requirements" className={inputCls + ' md:col-span-3 resize-none'} style={inputSt} />
            <textarea value={form.eligibilityCriteria} onChange={e => set('eligibilityCriteria', e.target.value)} rows={3} placeholder="Eligibility Criteria (optional)" className={inputCls + ' md:col-span-2 resize-none'} style={inputSt} />
            <textarea value={form.additionalNotes} onChange={e => set('additionalNotes', e.target.value)} rows={3} placeholder="Additional Notes" className={inputCls + ' md:col-span-2 resize-none'} style={inputSt} />
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={generateRoadmap} disabled={generating} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-60" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>{generating ? <Bot size={16} className="animate-pulse" /> : <Sparkles size={16} />} Generate with AI</button>
            <button onClick={() => { setForm(emptyForm); setModules([]) }} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>Clear</button>
            <button onClick={() => saveRoadmap('draft')} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: 'var(--muted)', color: 'var(--foreground)' }}><Save size={15} /> Save Draft</button>
          </div>
        </div>

        {!!modules.length && (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={() => setModules([...modules, makeModule(modules.length, form.difficulty, form.companyName, form.role)])} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold" style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}><Plus size={15} /> Add Module</button>
              <button onClick={() => { setEditingRoadmapId(null); setModules(modules.map(m => ({ ...m, id: uid('module'), title: `${m.title} Copy` }))) }} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold" style={{ background: 'var(--muted)' }}><Copy size={15} /> Duplicate Roadmap</button>
              <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold" style={{ background: 'var(--muted)' }}><Eye size={15} /> Preview</button>
              <button onClick={() => saveRoadmap('published')} className="px-3 py-2 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}>Publish</button>
              {editingRoadmapId && <button onClick={() => { archiveRoadmap(editingRoadmapId); setBuilderOpen(false) }} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold" style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}><Archive size={15} /> Archive</button>}
            </div>
            <div className="space-y-4">
              {modules.map((module, index) => (
                <ModuleCard key={module.id} module={module} index={index} expanded={expanded === module.id} onToggle={() => setExpanded(expanded === module.id ? null : module.id)} onChange={next => updateModule(module.id, next)} onDuplicate={() => setModules([...modules.slice(0, index + 1), { ...module, id: uid('module'), title: `${module.title} Copy` }, ...modules.slice(index + 1)])} onDelete={() => setModules(modules.filter(m => m.id !== module.id))} onDragStart={() => setDragIndex(index)} onDrop={() => reorder(index)} onQuiz={() => setQuizModuleId(module.id)} />
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Study Roadmaps</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>{publishedCount} published · {draftCount} drafts · {archivedCount} archived</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}><Sparkles size={16} /> Create Roadmap</button>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl" style={cardSt}><p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Published</p><p className="text-2xl font-black">{publishedCount}</p></div>
        <div className="p-4 rounded-2xl" style={cardSt}><p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Drafts</p><p className="text-2xl font-black">{draftCount}</p></div>
        <div className="p-4 rounded-2xl" style={cardSt}><p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Archived</p><p className="text-2xl font-black">{archivedCount}</p></div>
      </div>
      <div className="flex flex-wrap gap-2">
        {(['published', 'draft', 'archived', 'all'] as const).map(filter => <button key={filter} onClick={() => setListFilter(filter)} className="px-3 py-2 rounded-xl text-sm font-semibold capitalize" style={{ background: listFilter === filter ? 'rgba(99,102,241,0.18)' : 'var(--muted)', color: listFilter === filter ? '#a5b4fc' : 'var(--muted-foreground)' }}>{filter}</button>)}
      </div>
      <div className="space-y-3">
        {filteredRoadmaps.map(roadmap => {
          const status = roadmap.status || 'published'
          const linkedVisits = companyVisits.filter(v => v.roadmapId === roadmap.id)
          return (
            <div key={roadmap.id} className="p-5 rounded-2xl" style={cardSt}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold">{roadmap.title}</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold capitalize" style={{ background: status === 'published' ? 'rgba(34,197,94,0.12)' : status === 'draft' ? 'rgba(245,158,11,0.14)' : 'rgba(239,68,68,0.12)', color: status === 'published' ? '#22c55e' : status === 'draft' ? '#f59e0b' : '#f87171' }}>{status}</span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{roadmap.duration} · {(roadmap.modules?.length || roadmap.phases.length)} modules · {roadmap.description}</p>
                  <p className="text-xs mt-1" style={{ color: linkedVisits.length ? '#22c55e' : 'var(--muted-foreground)' }}>{linkedVisits.length ? `Linked to ${linkedVisits.map(v => v.companyName).join(', ')}` : 'Not linked to any company visit yet'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(roadmap)} className="p-2 rounded-lg" style={{ background: 'var(--muted)', color: '#a5b4fc' }}><Pencil size={15} /></button>
                  <button onClick={() => setRoadmaps([{ ...roadmap, id: uid('copy'), title: `${roadmap.title} Copy`, status: 'draft', createdAt: new Date().toISOString().split('T')[0] }, ...roadmaps])} className="p-2 rounded-lg" style={{ background: 'var(--muted)' }}><Copy size={15} /></button>
                  {status !== 'archived' && <button onClick={() => archiveRoadmap(roadmap.id)} className="p-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}><Archive size={15} /></button>}
                  <Layers size={18} style={{ color: '#a5b4fc' }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
