import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, ChevronRight, Star, DollarSign, Users, ArrowLeft,
  Clock, CheckCircle2, TrendingUp, MessageSquare,
  ThumbsUp, Map, Building2
} from 'lucide-react'
import { useAppContext, type CompanyVisit, type MockQuestion, type MockTestDef } from '../context/AppContext'

const cardSt = { background: 'var(--card)', border: '1px solid var(--border)' }

const staticCompanies = [
  {
    id: 's1', name: 'Google', logo: '🔵', package: '45–80 LPA', minPackage: 45, difficulty: 'Very Hard',
    category: 'FAANG', openings: 12, color: '#4285f4', rating: 4.8, interviewRating: 4.9,
    eligibility: '7.5+ CGPA', bond: 'None', locations: ['Bangalore', 'Hyderabad'],
    overview: 'Google is a global leader in technology, offering roles in SWE, ML, and more. Known for its rigorous coding-heavy interviews and excellent compensation.',
    culture: 'Innovation-first, data-driven, collaborative. Engineers have high autonomy.',
    timeline: [
      { step: 'Resume Shortlisting', duration: '1 week', note: 'GPA + projects matter' },
      { step: 'Online Assessment', duration: '2 hours', note: '3 coding problems, medium-hard' },
      { step: 'Phone Screen', duration: '45 min', note: 'Coding + problem solving' },
      { step: 'Onsite – Technical 1', duration: '1 hour', note: 'Data structures & algorithms' },
      { step: 'Onsite – Technical 2', duration: '1 hour', note: 'More DSA + complexity' },
      { step: 'Onsite – System Design', duration: '1 hour', note: 'Scale systems design' },
      { step: 'Googliness & Leadership', duration: '45 min', note: 'Culture fit + leadership' },
    ],
    questions: [
      { title: 'Find the shortest path with negative edges (Bellman-Ford)', difficulty: 'Hard', frequency: 'Very Often' },
      { title: 'Design a real-time collaborative editor (like Google Docs)', difficulty: 'Hard', frequency: 'Often' },
      { title: 'Implement a file system with cache', difficulty: 'Medium', frequency: 'Often' },
      { title: 'Longest increasing subsequence', difficulty: 'Medium', frequency: 'Very Often' },
      { title: 'LRU Cache implementation', difficulty: 'Medium', frequency: 'Often' },
    ],
    salary: { base: '₹40-60L', bonus: '₹5-15L', stock: '₹15-30L', total: '₹60-105L' },
    reviews: [
      { author: 'karan_iit', role: 'SDE-1 (2024)', rating: 5, text: 'Best experience of my career. The team is brilliant and the problem-solving culture is unmatched. High bar but fair process.' },
      { author: 'priya_bits', role: 'SWE Intern (2023)', rating: 5, text: 'Got an intern return offer. Super collaborative team. The DSA focus is real — solve 200+ LC problems before applying.' },
      { author: 'rohan_nit', role: 'SDE-2 (2024)', rating: 4, text: 'Great comp and work-life balance. System design round was the hardest part. The OA is easy but onsites are brutal.' },
    ],
    topics: ['Graph Algorithms', 'Dynamic Programming', 'System Design', 'Trees & BST', 'String Manipulation', 'Binary Search'],
  },
  {
    id: 's2', name: 'Amazon', logo: '🟠', package: '28–45 LPA', minPackage: 28, difficulty: 'Hard',
    category: 'FAANG', openings: 45, color: '#ff9900', rating: 4.5, interviewRating: 4.6,
    eligibility: '7.0+ CGPA', bond: 'None', locations: ['Bangalore', 'Hyderabad', 'Chennai'],
    overview: 'Amazon hires at massive scale. Known for Leadership Principles-heavy interviews combined with DSA. One of the largest campus recruiters.',
    culture: 'Customer-obsessed, ownership mentality, high performance bar.',
    timeline: [
      { step: 'OA – Coding', duration: '90 min', note: '2 coding + MCQs' },
      { step: 'Technical Round 1', duration: '1 hour', note: 'DSA + OOP concepts' },
      { step: 'Technical Round 2', duration: '1 hour', note: 'More DSA + LPs' },
      { step: 'System Design', duration: '1 hour', note: 'At SDE-2 level only' },
      { step: 'Bar Raiser', duration: '1 hour', note: 'Culture + leadership principles' },
    ],
    questions: [
      { title: 'Implement a rate limiter', difficulty: 'Medium', frequency: 'Very Often' },
      { title: 'Find median from data stream', difficulty: 'Hard', frequency: 'Often' },
      { title: 'Design Amazon cart / shopping system', difficulty: 'Hard', frequency: 'Often' },
      { title: 'Merge k sorted lists', difficulty: 'Hard', frequency: 'Very Often' },
      { title: 'Word break problem', difficulty: 'Medium', frequency: 'Often' },
    ],
    salary: { base: '₹25-38L', bonus: '₹3-8L', stock: '₹8-20L', total: '₹36-66L' },
    reviews: [
      { author: 'sneha_iiit', role: 'SDE-1 (2024)', rating: 4, text: 'Great for freshers. Massive codebase to learn from. The LP interviews are tricky — prepare 10+ STAR stories.' },
      { author: 'arjun_vit', role: 'SDE Intern (2023)', rating: 5, text: 'Amazing internship. Got a full-time offer. The DSA rounds are medium-hard LeetCode. LP rounds require genuine prep.' },
    ],
    topics: ['Leadership Principles', 'Arrays & Strings', 'Trees', 'Graphs', 'OOP', 'DBMS', 'System Design'],
  },
  {
    id: 's3', name: 'Microsoft', logo: '🔷', package: '35–60 LPA', minPackage: 35, difficulty: 'Hard',
    category: 'FAANG', openings: 20, color: '#00a4ef', rating: 4.7, interviewRating: 4.7,
    eligibility: '7.5+ CGPA', bond: 'None', locations: ['Hyderabad', 'Bangalore', 'Noida'],
    overview: 'Microsoft is one of the most prestigious tech companies. The interviews are DSA-heavy and focus on coding quality and CS fundamentals.',
    culture: 'Growth mindset, inclusive, strong work-life balance. Best for career growth.',
    timeline: [
      { step: 'Online Assessment', duration: '75 min', note: '2-3 coding problems' },
      { step: 'Technical Round 1', duration: '1 hour', note: 'DSA + problem solving' },
      { step: 'Technical Round 2', duration: '1 hour', note: 'DSA + code quality' },
      { step: 'Technical Round 3', duration: '1 hour', note: 'Advanced DSA / OS' },
      { step: 'HR Round', duration: '30 min', note: 'Culture fit + expectations' },
    ],
    questions: [
      { title: 'Serialize and deserialize a binary tree', difficulty: 'Hard', frequency: 'Very Often' },
      { title: 'Design a distributed key-value store', difficulty: 'Hard', frequency: 'Often' },
      { title: 'Find all permutations of a string', difficulty: 'Medium', frequency: 'Very Often' },
      { title: 'Clone a linked list with random pointers', difficulty: 'Medium', frequency: 'Often' },
    ],
    salary: { base: '₹30-50L', bonus: '₹4-12L', stock: '₹12-25L', total: '₹46-87L' },
    reviews: [
      { author: 'karan_nit_w', role: 'SDE-1 (2024)', rating: 5, text: 'Best company culture. Interviewers are helpful and the process feels fair. Strong emphasis on CS fundamentals over LeetCode grinding.' },
    ],
    topics: ['Trees & BST', 'Graphs', 'Dynamic Programming', 'OOP Design', 'Operating Systems', 'String Algorithms'],
  },
  {
    id: 's4', name: 'Flipkart', logo: '💛', package: '25–40 LPA', minPackage: 25, difficulty: 'Medium',
    category: 'Product', openings: 35, color: '#f7c948', rating: 4.3, interviewRating: 4.4,
    eligibility: '6.5+ CGPA', bond: 'None', locations: ['Bangalore'],
    overview: "India's largest e-commerce company. Flipkart gives freshers excellent ownership and scope. The interview is balanced between DSA and system design.",
    culture: 'Startup energy inside a large company. High ownership, fast-paced.',
    timeline: [
      { step: 'OA (HackerRank)', duration: '90 min', note: '3 coding problems' },
      { step: 'Technical Round 1', duration: '1 hour', note: 'DSA focus' },
      { step: 'Technical Round 2', duration: '1 hour', note: 'DSA + object design' },
      { step: 'Hiring Manager Round', duration: '45 min', note: 'Problem solving + culture' },
    ],
    questions: [
      { title: "Design Flipkart's search system", difficulty: 'Hard', frequency: 'Very Often' },
      { title: 'Find the k-th largest element in a stream', difficulty: 'Medium', frequency: 'Often' },
      { title: 'Implement a HashMap from scratch', difficulty: 'Medium', frequency: 'Often' },
    ],
    salary: { base: '₹22-32L', bonus: '₹3-8L', stock: '₹6-15L', total: '₹31-55L' },
    reviews: [
      { author: 'priya_nitc', role: 'SDE-1 (2024)', rating: 4, text: 'Great first job. The ownership you get as a fresher is incredible. The interview was challenging but fair.' },
    ],
    topics: ['DSA', 'System Design', 'OOP', 'DBMS', 'Operating Systems'],
  },
]

const diffColors: Record<string, { color: string; bg: string }> = {
  'Very Hard': { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  Hard: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  Medium: { color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  Easy: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
}
const freqColors: Record<string, string> = {
  'Very Often': '#ef4444',
  Often: '#f59e0b',
  Sometimes: '#6366f1',
}

const categories = ['All', 'FAANG', 'Product', 'Finance', 'Service', 'Campus Visit']

type StaticCompany = typeof staticCompanies[0]
type CompanyTab = 'overview' | 'process' | 'questions' | 'salary' | 'reviews'

const roadmapPhases = [
  {
    week: 'Week 1–2', title: 'Foundation & Data Structures', color: '#6366f1',
    tasks: [
      { label: 'Arrays, Strings, Hashing', hours: '8h' },
      { label: 'Linked Lists & Stacks/Queues', hours: '6h' },
      { label: 'Trees & Binary Trees', hours: '8h' },
      { label: 'Solve 30 Easy LeetCode problems', hours: '10h' },
    ],
  },
  {
    week: 'Week 3–4', title: 'Algorithms & Problem Patterns', color: '#8b5cf6',
    tasks: [
      { label: 'Sorting & Searching', hours: '5h' },
      { label: 'Recursion & Backtracking', hours: '7h' },
      { label: 'Dynamic Programming (DP basics)', hours: '10h' },
      { label: 'Graphs – BFS, DFS, Dijkstra', hours: '8h' },
    ],
  },
  {
    week: 'Week 5–6', title: 'Company-Specific Prep', color: '#06b6d4',
    tasks: [
      { label: 'Study past interview questions', hours: '6h' },
      { label: '2 full mock tests (aptitude + technical)', hours: '4h' },
      { label: 'Behavioral & HR round prep', hours: '4h' },
      { label: 'System Design fundamentals', hours: '8h' },
    ],
  },
  {
    week: 'Week 7', title: 'Final Polish & Interview Simulation', color: '#22c55e',
    tasks: [
      { label: 'Mock coding interview (peer/mentor)', hours: '3h' },
      { label: 'Revise weak areas from mock results', hours: '5h' },
      { label: 'Prepare STAR method answers', hours: '2h' },
      { label: 'Company culture & product research', hours: '2h' },
    ],
  },
]

function RoadmapView({ roadmapId, companyName, onBack }: { roadmapId: string; companyName: string; onBack: () => void }) {
  const navigate = useNavigate()
  const { roadmapProgress, toggleRoadmapTask, roadmaps, mockTests, setMockTests, removeRoadmapProgress } = useAppContext()
  const progress = roadmapProgress.find(r => r.roadmapId === roadmapId)
  const completedSet = new Set(progress?.completedTasks ?? [])
  const toggle = (key: string) => toggleRoadmapTask(roadmapId, key)
  const openResource = (resource: any) => {
    sessionStorage.setItem('resourceSearch', resource.linkedResourceId || resource.title || resource.searchKeyword || '')
    navigate('/app/resources')
  }
  const startModuleQuiz = (module: any) => {
    const sourceQuestions = module.quiz.questions.length ? module.quiz.questions : [{
      id: `${module.id}-quick-check`,
      questionType: 'MCQ',
      topic: module.title,
      question: `Which activity best helps you complete the ${module.title} module?`,
      options: ['Follow the listed resources and daily tasks', 'Skip the practice tasks', 'Only read summaries', 'Avoid quizzes'],
      correctAnswer: 'Follow the listed resources and daily tasks',
      explanation: 'Roadmap progress is built by completing the module resources, daily tasks, and quiz practice together.',
      difficulty: module.difficulty,
    }]
    const questions: MockQuestion[] = sourceQuestions.map((question: any, index: number) => ({
      id: question.id || `roadmap-q-${index}`,
      type: question.type || (question.questionType === 'Coding' ? 'coding' : question.questionType === 'Fill in blanks' ? 'fill_blank' : question.questionType === 'Scenario Based' ? 'textual' : 'mcq'),
      topic: question.topic || module.title,
      question: question.question,
      marks: question.marks || (question.type === 'coding' ? 3 : 1),
      timeLimit: question.timeLimit || 90,
      explanation: question.explanation,
      options: question.options,
      correct: question.correct ?? Math.max(0, (question.options || []).findIndex((option: string) => option === question.correctAnswer)),
      blankAnswer: question.blankAnswer || question.correctAnswer,
      sampleAnswer: question.sampleAnswer || question.correctAnswer,
      starterCode: question.starterCode,
      testCases: question.testCases,
      sourceId: question.sourceId,
    }))
    const test: MockTestDef = {
      id: `roadmap-quiz-${roadmapId}-${module.id}`,
      title: module.quiz.title || `${module.title} Quiz`,
      type: 'mixed',
      duration: Math.max(10, Math.ceil(questions.reduce((sum, q) => sum + q.timeLimit, 0) / 60)),
      questions,
      description: `Roadmap quiz for ${companyName}: ${module.title}`,
      createdAt: new Date().toISOString(),
      totalAttempts: 0,
      avgScore: 0,
    }
    setMockTests(mockTests.some(t => t.id === test.id) ? mockTests.map(t => t.id === test.id ? test : t) : [test, ...mockTests])
    sessionStorage.setItem('startMockTestId', test.id)
    sessionStorage.setItem('pendingRoadmapTest', JSON.stringify(test))
    navigate('/app/mocktest')
  }

  const linkedRoadmap = roadmaps.find(r => r.id === roadmapId)
  const richModules = linkedRoadmap?.modules?.map((module: any, moduleIndex: number) => ({
    ...module,
    id: module.id || module._id || `module-${moduleIndex}`,
    resources: (module.resources || []).map((resource: any, resourceIndex: number) => ({
      ...resource,
      id: resource.id || resource._id || resource.linkedResourceId || `resource-${moduleIndex}-${resourceIndex}`,
    })),
    dailyTasks: (module.dailyTasks || []).map((task: any, taskIndex: number) => ({
      ...task,
      id: task.id || task._id || `task-${moduleIndex}-${taskIndex}`,
      dayNumber: task.dayNumber || taskIndex + 1,
      taskName: task.taskName || task.name || task.title || `Task ${taskIndex + 1}`,
      description: task.description || '',
      estimatedMinutes: task.estimatedMinutes || 60,
    })),
    quiz: module.quiz || {
      title: `${module.title} Quiz`,
      difficulty: module.difficulty || 'Easy',
      passingScore: 70,
      questions: [],
    },
  }))
  const fallbackModules = (linkedRoadmap
    ? linkedRoadmap.phases.map((phase, index) => ({ title: phase.title, tasks: phase.tasks.map(task => ({ label: task, hours: '' })), color: ['#6366f1', '#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b'][index % 5] }))
    : roadmapPhases
  ).map((phase, index) => ({
    id: `fallback-${index}`,
    title: phase.title,
    description: `${phase.title} module for ${companyName} preparation.`,
    difficulty: index === 0 ? 'Easy' as const : index === 1 ? 'Medium' as const : 'Hard' as const,
    estimatedHours: phase.tasks.reduce((sum, task) => sum + (Number.parseInt(task.hours) || 2), 0),
    learningOutcomes: phase.tasks.slice(0, 3).map(task => `Complete ${task.label}`),
    prerequisites: index === 0 ? ['Basic programming knowledge'] : ['Complete previous module'],
    resources: phase.tasks.slice(0, 2).map((task, taskIndex) => ({
      id: `fallback-resource-${index}-${taskIndex}`,
      title: task.label,
      platform: 'PrepAce',
      resourceType: 'Practice',
      searchKeyword: `${companyName} ${task.label}`,
      estimatedTime: task.hours || '2h',
    })),
    dailyTasks: phase.tasks.map((task, taskIndex) => ({
      id: `fallback-task-${index}-${taskIndex}`,
      dayNumber: taskIndex + 1,
      taskName: task.label,
      description: `Work on ${task.label}`,
      estimatedMinutes: (Number.parseInt(task.hours) || 2) * 60,
      status: 'pending' as const,
    })),
    quiz: {
      id: `fallback-quiz-${index}`,
      title: `${phase.title} Quiz`,
      difficulty: index === 0 ? 'Easy' as const : index === 1 ? 'Medium' as const : 'Hard' as const,
      passingScore: 70,
      distribution: { mcq: 5, coding: 1, debugging: 1, trueFalse: 2, fillBlanks: 1 },
      questions: [],
    },
  }))
  const displayModules = richModules?.length ? richModules : fallbackModules
  if (displayModules.length) {
    const totalTasks = displayModules.reduce((sum, module) => sum + module.dailyTasks.length, 0)
    const done = displayModules.reduce((sum, module) => sum + module.dailyTasks.filter(task => completedSet.has(`${module.id}:${task.id}`)).length, 0)
    const currentIndex = displayModules.findIndex((module, index) => index === 0 || displayModules[index - 1].dailyTasks.every(task => completedSet.has(`${displayModules[index - 1].id}:${task.id}`)))
    const pct = totalTasks ? Math.round((done / totalTasks) * 100) : 0
    const eta = new Date(Date.now() + Math.max(1, totalTasks - done) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

    return (
      <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium hover:opacity-70" style={{ color: 'var(--muted-foreground)' }}>
            <ArrowLeft size={14} /> Overview
          </button>
          <h1 className="font-bold text-lg">{companyName} Preparation Roadmap</h1>
        </div>

        <div className="relative space-y-5">
          <div className="absolute left-6 top-6 bottom-6 w-0.5 hidden sm:block" style={{ background: 'var(--border)' }} />
          {displayModules.map((module, index) => {
            const moduleDone = module.dailyTasks.filter(task => completedSet.has(`${module.id}:${task.id}`)).length
            const moduleComplete = moduleDone === module.dailyTasks.length && module.dailyTasks.length > 0
            const locked = index > 0 && !displayModules[index - 1].dailyTasks.every(task => completedSet.has(`${displayModules[index - 1].id}:${task.id}`))
            const current = index === Math.max(0, currentIndex) && !moduleComplete && !locked
            return (
              <details key={module.id} open={current || index === 0} className="relative rounded-2xl overflow-hidden" style={{ ...cardSt, opacity: locked ? 0.55 : 1, boxShadow: current ? '0 0 0 1px rgba(99,102,241,0.35), 0 0 28px rgba(99,102,241,0.16)' : undefined }}>
                <summary className="list-none cursor-pointer p-5 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0" style={{ background: moduleComplete ? '#22c55e' : current ? 'var(--gradient-primary)' : 'var(--muted)', color: moduleComplete || current ? 'white' : 'var(--muted-foreground)' }}>
                    {moduleComplete ? '✓' : locked ? '🔒' : index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black">{module.title}</h3>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: 'rgba(99,102,241,0.14)', color: '#a5b4fc' }}>{module.difficulty}</span>
                      {moduleComplete && <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: 'rgba(34,197,94,0.14)', color: '#22c55e' }}>Completed</span>}
                      {current && <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: 'rgba(245,158,11,0.14)', color: '#f59e0b' }}>Current</span>}
                    </div>
                    <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>{module.description}</p>
                    <div className="flex flex-wrap gap-3 mt-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      <span>{module.estimatedHours}h estimated</span>
                      <span>{moduleDone}/{module.dailyTasks.length} tasks</span>
                      <span>{module.resources.length} resources</span>
                      <span>Quiz: {module.quiz.questions.length ? 'Ready' : 'Pending'}</span>
                    </div>
                    <div className="h-2 rounded-full mt-3 overflow-hidden" style={{ background: 'var(--muted)' }}>
                      <div className="h-full rounded-full" style={{ width: `${module.dailyTasks.length ? (moduleDone / module.dailyTasks.length) * 100 : 0}%`, background: moduleComplete ? '#22c55e' : 'var(--gradient-primary)' }} />
                    </div>
                  </div>
                </summary>
                {!locked && (
                  <div className="px-5 pb-5 space-y-5">
                    <section>
                      <h4 className="font-bold text-sm mb-2">Resources</h4>
                      <div className="grid sm:grid-cols-2 gap-2 mb-2">
                        {module.resources.map(resource => (
                          <button key={`open-${resource.id}`} onClick={() => openResource(resource)} className="p-3 rounded-xl text-sm text-left transition-all hover:opacity-80" style={{ background: 'rgba(99,102,241,0.10)', border: '1px solid rgba(99,102,241,0.18)' }}>
                            <p className="font-semibold">Open: {resource.title}</p>
                            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{resource.platform} resource</p>
                          </button>
                        ))}
                      </div>
                      <div className="grid sm:grid-cols-2 gap-2">{module.resources.map(resource => <div key={resource.id} className="p-3 rounded-xl text-sm" style={{ background: 'var(--muted)' }}><p className="font-semibold">{resource.title}</p><p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{resource.platform} · {resource.resourceType} · {resource.estimatedTime}</p></div>)}</div>
                    </section>
                    <section>
                      <h4 className="font-bold text-sm mb-2">Daily Tasks</h4>
                      <div className="space-y-2">{module.dailyTasks.map(task => {
                        const key = `${module.id}:${task.id}`
                        const isDone = completedSet.has(key)
                        return <button key={task.id} onClick={() => toggle(key)} className="w-full p-3 rounded-xl flex items-start gap-3 text-left" style={{ background: 'var(--muted)' }}><span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: isDone ? '#22c55e' : 'var(--card)', color: isDone ? 'white' : 'var(--muted-foreground)' }}>{isDone ? '✓' : task.dayNumber}</span><span><span className="block font-semibold text-sm">{task.taskName}</span><span className="block text-xs" style={{ color: 'var(--muted-foreground)' }}>{task.description} · {task.estimatedMinutes} min</span></span></button>
                      })}</div>
                    </section>
                    <section>
                      <button onClick={() => startModuleQuiz(module)} className="px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: 'var(--gradient-primary)' }}>Take Quiz</button>
                    </section>
                    <section className="grid md:grid-cols-2 gap-4">
                      <div><h4 className="font-bold text-sm mb-2">Learning Outcomes</h4><ul className="space-y-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>{module.learningOutcomes.map(item => <li key={item}>• {item}</li>)}</ul></div>
                      <div><h4 className="font-bold text-sm mb-2">Quiz Information</h4><div className="p-3 rounded-xl text-sm" style={{ background: 'var(--muted)' }}>{module.quiz.title}<p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{module.quiz.difficulty} · Passing {module.quiz.passingScore}% · {module.quiz.questions.length} questions</p></div></div>
                    </section>
                  </div>
                )}
              </details>
            )
          })}
        </div>

        <div className="sticky bottom-4 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4" style={cardSt}>
          <div className="flex-1 min-w-[220px]">
            <div className="flex justify-between text-sm mb-2"><span className="font-semibold">Overall Roadmap Progress</span><span style={{ color: 'var(--primary)' }}>{pct}%</span></div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}><div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--gradient-primary)' }} /></div>
            <p className="text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>Estimated completion: {eta}</p>
          </div>
          <div className="flex gap-2">
            <button className="px-5 py-3 rounded-xl text-sm font-bold text-white" style={{ background: 'var(--gradient-primary)' }}>Continue Learning</button>
            <button onClick={() => { removeRoadmapProgress(roadmapId); onBack() }} className="px-5 py-3 rounded-xl text-sm font-bold" style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>Unenroll</button>
          </div>
        </div>
      </div>
    )
  }

  const phases = linkedRoadmap
    ? linkedRoadmap.phases.map((p, i) => ({
        week: `Phase ${i + 1}`, title: p.title, color: ['#6366f1', '#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b'][i % 5],
        tasks: p.tasks.map(t => ({ label: t, hours: '' })),
      }))
    : roadmapPhases

  const totalTasks = phases.reduce((s, p) => s + p.tasks.length, 0)
  const done = completedSet.size

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium hover:opacity-70"
          style={{ color: 'var(--muted-foreground)' }}>
          <ArrowLeft size={14} /> Overview
        </button>
        <h1 className="font-bold text-lg">{companyName} Preparation Roadmap</h1>
      </div>

      <div className="p-5 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="flex justify-between text-sm mb-2">
          <span className="font-semibold">Overall Progress</span>
          <span style={{ color: 'var(--primary)' }}>{done}/{totalTasks} tasks</span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${totalTasks ? (done / totalTasks) * 100 : 0}%`, background: 'var(--gradient-primary)' }} />
        </div>
      </div>

      <div className="space-y-5">
        {phases.map((phase, pi) => {
          const phaseDone = phase.tasks.filter((_, ti) => completedSet.has(`${pi}-${ti}`)).length
          return (
            <div key={pi} className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <div className="px-5 py-4 flex items-center gap-3" style={{ background: `${phase.color}12` }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ background: phase.color }}>
                  {pi + 1}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold" style={{ color: phase.color }}>{phase.week}</p>
                  <p className="font-bold">{phase.title}</p>
                </div>
                <span className="text-xs font-semibold" style={{ color: phase.color }}>{phaseDone}/{phase.tasks.length}</span>
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
                {phase.tasks.map((task, ti) => {
                  const key = `${pi}-${ti}`
                  const isDone = completedSet.has(key)
                  return (
                    <button key={ti} onClick={() => toggle(key)}
                      className="w-full flex items-center gap-3 px-5 py-3.5 text-left transition-all hover:opacity-80">
                      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                        style={{ borderColor: isDone ? phase.color : 'var(--border)', background: isDone ? phase.color : 'transparent' }}>
                        {isDone && <CheckCircle2 size={12} className="text-white" />}
                      </div>
                      <span className="flex-1 text-sm" style={{ textDecoration: isDone ? 'line-through' : 'none', color: isDone ? 'var(--muted-foreground)' : 'var(--foreground)' }}>
                        {task.label}
                      </span>
                      {task.hours && (
                        <span className="text-xs px-2 py-0.5 rounded flex-shrink-0"
                          style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                          ~{task.hours}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StaticCompanyDetail({ company, onBack }: { company: StaticCompany; onBack: () => void }) {
  const { roadmapProgress, startRoadmap } = useAppContext()
  const [tab, setTab] = useState<CompanyTab>('overview')
  const [showRoadmap, setShowRoadmap] = useState(false)
  const dc = diffColors[company.difficulty]

  const roadmapId = `company-${company.id}`
  const progress = roadmapProgress.find(r => r.roadmapId === roadmapId)
  const totalTasks = roadmapPhases.reduce((s, p) => s + p.tasks.length, 0)
  const doneTasks = progress?.completedTasks.length ?? 0
  const isComplete = doneTasks === totalTasks && totalTasks > 0
  const isStarted = !!progress

  function handleRoadmapClick() {
    if (!isStarted) startRoadmap(roadmapId)
    setShowRoadmap(true)
  }

  if (showRoadmap) return <RoadmapView roadmapId={roadmapId} companyName={company.name} onBack={() => setShowRoadmap(false)} />

  const tabs: { id: CompanyTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'process', label: 'Interview Process' },
    { id: 'questions', label: 'Past Questions' },
    { id: 'salary', label: 'Salary & Comp' },
    { id: 'reviews', label: 'Reviews' },
  ]

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-5xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium transition-all hover:opacity-70"
        style={{ color: 'var(--muted-foreground)' }}>
        <ArrowLeft size={16} /> Back to Companies
      </button>

      <div className="p-6 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="flex flex-col md:flex-row gap-5 items-start">
          <div className="text-5xl">{company.logo}</div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-2xl font-black">{company.name}</h1>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ color: dc.color, background: dc.bg }}>{company.difficulty}</span>
              <span className="text-xs px-2.5 py-1 rounded-lg" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>{company.category}</span>
            </div>
            <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--muted-foreground)' }}>{company.overview}</p>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Eligibility', value: company.eligibility },
                { label: 'Bond', value: company.bond },
                { label: 'Locations', value: company.locations.join(', ') },
                { label: 'Openings', value: `${company.openings} roles` },
              ].map(({ label, value }) => (
                <div key={label} className="px-3 py-2 rounded-xl" style={{ background: 'var(--muted)' }}>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
                  <p className="font-semibold text-sm">{value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-black" style={{ color: 'var(--primary)' }}>{company.package}</div>
            <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Expected CTC</div>
            <div className="flex items-center gap-1 mt-1 justify-end">
              <Star size={13} className="fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-sm">{company.rating}</span>
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>rating</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-0 overflow-x-auto" style={{ borderBottom: '1px solid var(--border)' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all"
            style={{
              color: tab === t.id ? 'var(--primary)' : 'var(--muted-foreground)',
              borderBottom: tab === t.id ? '2px solid var(--primary)' : '2px solid transparent',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl space-y-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <h2 className="font-bold">Company Culture</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{company.culture}</p>
            <div className="space-y-3">
              {[
                { label: 'Work-Life Balance', score: 4.2 },
                { label: 'Career Growth', score: 4.6 },
                { label: 'Compensation', score: 4.8 },
                { label: 'Interview Fairness', score: company.interviewRating },
              ].map(({ label, score }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{label}</span>
                    <span className="font-semibold">{score}/5</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
                    <div className="h-full rounded-full" style={{ width: `${(score / 5) * 100}%`, background: 'var(--gradient-primary)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-5 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <h2 className="font-bold mb-4">Key Topics to Prepare</h2>
            <div className="flex flex-wrap gap-2 mb-5">
              {company.topics.map(t => (
                <span key={t} className="px-3 py-1.5 rounded-xl text-xs font-medium"
                  style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  {t}
                </span>
              ))}
            </div>
            {isStarted && (
              <div className="flex items-center gap-2 mb-3 p-3 rounded-xl" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <Map size={14} style={{ color: 'var(--primary)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>{doneTasks}/{totalTasks} tasks complete</span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden ml-2" style={{ background: 'var(--muted)' }}>
                  <div className="h-full rounded-full" style={{ width: `${(doneTasks / totalTasks) * 100}%`, background: 'var(--gradient-primary)' }} />
                </div>
              </div>
            )}
            <button onClick={handleRoadmapClick}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90"
              style={{ background: 'var(--gradient-primary)' }}>
              {isComplete ? `Review ${company.name} Roadmap →` : isStarted ? `Continue ${company.name} Roadmap →` : `Start ${company.name} Preparation Roadmap →`}
            </button>
          </div>
        </div>
      )}

      {tab === 'process' && (
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Average timeline: 3–6 weeks from OA to offer</p>
          <div className="space-y-3">
            {company.timeline.map(({ step, duration, note }, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ background: 'var(--gradient-primary)' }}>
                    {i + 1}
                  </div>
                  {i < company.timeline.length - 1 && <div className="w-0.5 h-6 mt-1" style={{ background: 'var(--border)' }} />}
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="font-semibold text-sm">{step}</p>
                    <span className="text-xs px-2 py-0.5 rounded-md flex items-center gap-1" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                      <Clock size={10} /> {duration}
                    </span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'questions' && (
        <div className="space-y-3">
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Questions reported by candidates who interviewed at {company.name}</p>
          {company.questions.map(({ title, difficulty, frequency }, i) => {
            const qdc = diffColors[difficulty] ?? diffColors.Medium
            return (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="flex-1"><p className="font-medium text-sm">{title}</p></div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg flex-shrink-0" style={{ color: qdc.color, background: qdc.bg }}>{difficulty}</span>
                <div className="flex items-center gap-1.5 text-xs font-semibold flex-shrink-0" style={{ color: freqColors[frequency] ?? '#6366f1' }}>
                  <TrendingUp size={12} /> {frequency}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'salary' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <h2 className="font-bold text-lg mb-5">Compensation Breakdown</h2>
            <div className="space-y-4">
              {[
                { label: 'Base Salary', value: company.salary.base, color: '#6366f1', pct: 60 },
                { label: 'Annual Bonus', value: company.salary.bonus, color: '#22c55e', pct: 15 },
                { label: 'Stock (RSUs)', value: company.salary.stock, color: '#f59e0b', pct: 25 },
              ].map(({ label, value, color, pct }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium">{label}</span>
                    <span className="font-bold" style={{ color }}>{value}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              ))}
              <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
                <span className="font-bold">Total CTC</span>
                <span className="text-xl font-black" style={{ color: 'var(--primary)' }}>{company.salary.total}</span>
              </div>
            </div>
          </div>
          <div className="p-6 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <h2 className="font-bold text-lg mb-4">Role-wise Packages</h2>
            <div className="space-y-3">
              {[
                { role: 'SDE Intern', ctc: '₹80K-1.2L/month', type: 'Internship' },
                { role: 'SDE-1 / New Grad', ctc: company.package, type: 'Full Time' },
                { role: 'SDE-2 (3+ yrs)', ctc: '₹50-90L', type: 'Full Time' },
                { role: 'Senior SDE', ctc: '₹80-150L', type: 'Full Time' },
              ].map(({ role, ctc, type }) => (
                <div key={role} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--muted)' }}>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{role}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{type}</p>
                  </div>
                  <span className="font-bold text-sm" style={{ color: 'var(--primary)' }}>{ctc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'reviews' && (
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{company.reviews.length} interview reviews from PrepAce community</p>
          {company.reviews.map(({ author, role, rating, text }, i) => (
            <div key={i} className="p-5 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                  style={{ background: 'var(--gradient-primary)' }}>
                  {author[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">@{author}</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{role}</p>
                </div>
                <div className="flex">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={12} className={j < rating ? 'fill-yellow-400 text-yellow-400' : ''} style={{ color: j < rating ? undefined : 'var(--muted-foreground)' }} />
                  ))}
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>"{text}"</p>
              <div className="flex gap-3 mt-3">
                <button className="flex items-center gap-1.5 text-xs transition-all hover:opacity-70" style={{ color: 'var(--muted-foreground)' }}>
                  <ThumbsUp size={12} /> Helpful
                </button>
                <button className="flex items-center gap-1.5 text-xs transition-all hover:opacity-70" style={{ color: 'var(--muted-foreground)' }}>
                  <MessageSquare size={12} /> Comment
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

type VisitTab = 'overview' | 'process' | 'questions' | 'salary' | 'roadmap'

function VisitCompanyDetail({ visit, onBack }: { visit: CompanyVisit; onBack: () => void }) {
  const { roadmapProgress, startRoadmap, roadmaps } = useAppContext()
  const [tab, setTab] = useState<VisitTab>('overview')
  const [showRoadmap, setShowRoadmap] = useState(false)

  const linkedRoadmap = visit.roadmapId ? roadmaps.find(r => r.id === visit.roadmapId) : null
  const roadmapId = visit.roadmapId ?? `visit-${visit.id}`
  const progress = roadmapProgress.find(r => r.roadmapId === roadmapId)
  const linkedPhases = linkedRoadmap
    ? linkedRoadmap.phases.map((p, i) => ({
        week: `Phase ${i + 1}`, title: p.title, color: ['#6366f1', '#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b'][i % 5],
        tasks: p.tasks.map(t => ({ label: t, hours: '' })),
      }))
    : roadmapPhases
  const totalTasks = linkedPhases.reduce((s, p) => s + p.tasks.length, 0)
  const doneTasks = progress?.completedTasks.length ?? 0
  const isStarted = !!progress
  const isComplete = isStarted && doneTasks >= totalTasks

  function handleRoadmapClick() {
    if (!isStarted) startRoadmap(roadmapId)
    setShowRoadmap(true)
  }

  if (showRoadmap) return <RoadmapView roadmapId={roadmapId} companyName={visit.companyName} onBack={() => setShowRoadmap(false)} />

  const availableTabs: { id: VisitTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'process', label: 'Interview Process' },
    { id: 'questions', label: 'Past Questions' },
    { id: 'salary', label: 'Salary' },
    { id: 'roadmap', label: 'Roadmap' },
  ]

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-5xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium transition-all hover:opacity-70"
        style={{ color: 'var(--muted-foreground)' }}>
        <ArrowLeft size={16} /> Back to Companies
      </button>

      {/* Header */}
      <div className="p-6 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="flex flex-col md:flex-row gap-5 items-start">
          <div className="text-5xl">{visit.logo}</div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-2xl font-black">{visit.companyName}</h1>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                Campus Visit
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--muted-foreground)' }}>
              {visit.overview || visit.description || 'Campus recruitment drive.'}
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="px-3 py-2 rounded-xl" style={{ background: 'var(--muted)' }}>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Role</p>
                <p className="font-semibold text-sm">{visit.role}</p>
              </div>
              <div className="px-3 py-2 rounded-xl" style={{ background: 'var(--muted)' }}>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Visit Date</p>
                <p className="font-semibold text-sm">{visit.date}</p>
              </div>
              {visit.rounds && visit.rounds > 0 && (
                <div className="px-3 py-2 rounded-xl" style={{ background: 'var(--muted)' }}>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Rounds</p>
                  <p className="font-semibold text-sm">{visit.rounds}</p>
                </div>
              )}
            </div>
          </div>
          {visit.package && (
            <div className="text-right flex-shrink-0">
              <div className="text-2xl font-black" style={{ color: 'var(--primary)' }}>{visit.package}</div>
              <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Package</div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 overflow-x-auto" style={{ borderBottom: '1px solid var(--border)' }}>
        {availableTabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all"
            style={{
              color: tab === t.id ? 'var(--primary)' : 'var(--muted-foreground)',
              borderBottom: tab === t.id ? '2px solid var(--primary)' : '2px solid transparent',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="p-5 rounded-2xl space-y-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <h2 className="font-bold">About this Visit</h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
            {visit.overview || visit.description || 'No overview provided.'}
          </p>
          {visit.adminNote && (
            <div className="p-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: '#f59e0b' }}>Admin Note</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{visit.adminNote}</p>
            </div>
          )}
          {visit.eligibility && (
            <div>
              <p className="text-sm font-semibold mb-2">Eligibility</p>
              <div className="grid grid-cols-2 gap-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                <span>Min CGPA: <strong style={{ color: 'var(--foreground)' }}>{visit.eligibility.minCGPA}</strong></span>
                <span>Backlogs: <strong style={{ color: 'var(--foreground)' }}>{visit.eligibility.noBacklogs ? 'Not allowed' : 'Allowed'}</strong></span>
                <span className="col-span-2">Branches: <strong style={{ color: 'var(--foreground)' }}>{visit.eligibility.branches.join(', ')}</strong></span>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'process' && (
        <div className="space-y-3">
          {(visit.interviewProcess ?? []).length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No interview process data available.</p>
          ) : (
            (visit.interviewProcess ?? []).map((step, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ background: 'var(--gradient-primary)' }}>
                    {i + 1}
                  </div>
                  {i < (visit.interviewProcess ?? []).length - 1 && <div className="w-0.5 h-6 mt-1" style={{ background: 'var(--border)' }} />}
                </div>
                <div className="flex-1 pb-2 flex items-center">
                  <p className="font-semibold text-sm">{step}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'questions' && (
        <div className="space-y-3">
          {(visit.pastQuestions ?? []).length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No past questions data available.</p>
          ) : (
            (visit.pastQuestions ?? []).map((q, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <span className="text-xs font-bold w-6 text-center flex-shrink-0" style={{ color: '#a5b4fc' }}>Q{i + 1}</span>
                <p className="font-medium text-sm">{q}</p>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'salary' && (
        <div className="p-6 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <h2 className="font-bold text-lg mb-4">Salary Information</h2>
          {visit.salaryRange ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <p className="text-3xl font-black" style={{ color: 'var(--primary)' }}>{visit.salaryRange}</p>
                <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Expected CTC</p>
              </div>
              <div className="p-4 rounded-xl" style={{ background: 'var(--muted)' }}>
                <p className="font-semibold text-sm">{visit.role}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Full Time · Campus Hire</p>
              </div>
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No salary data available.</p>
          )}
        </div>
      )}

      {tab === 'roadmap' && (
        <div className="space-y-4">
          {isStarted && (
            <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <Map size={18} style={{ color: 'var(--primary)' }} />
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>{doneTasks}/{totalTasks} tasks complete</p>
                <div className="h-1.5 rounded-full overflow-hidden mt-1" style={{ background: 'var(--muted)' }}>
                  <div className="h-full rounded-full" style={{ width: `${totalTasks ? (doneTasks / totalTasks) * 100 : 0}%`, background: 'var(--gradient-primary)' }} />
                </div>
              </div>
            </div>
          )}
          {linkedRoadmap && (
            <div className="p-3 rounded-xl text-sm font-medium" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#22c55e' }}>
              Linked to: {linkedRoadmap.title}
            </div>
          )}
          <button onClick={handleRoadmapClick}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90"
            style={{ background: 'var(--gradient-primary)' }}>
            {isComplete ? 'Review Preparation Roadmap →' : isStarted ? 'Continue Preparation Roadmap →' : `Start ${visit.companyName} Preparation Roadmap →`}
          </button>
        </div>
      )}
    </div>
  )
}

type SelectedCompany = { type: 'static'; data: StaticCompany } | { type: 'visit'; data: CompanyVisit }

export default function CompanyPrep() {
  const { companyVisits } = useAppContext()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [selected, setSelected] = useState<SelectedCompany | null>(null)
  const [sortBy, setSortBy] = useState<'rating' | 'package' | 'openings'>('rating')

  const backendVisits = companyVisits
  const showFallbackCompanies = backendVisits.length === 0

  if (selected) {
    if (selected.type === 'static') return <StaticCompanyDetail company={selected.data} onBack={() => setSelected(null)} />
    return <VisitCompanyDetail visit={selected.data} onBack={() => setSelected(null)} />
  }

  const filteredStatic = showFallbackCompanies ? staticCompanies.filter(c => {
    const ms = c.name.toLowerCase().includes(search.toLowerCase())
    const mc = category === 'All' || c.category === category
    return ms && mc
  }).sort((a, b) =>
    sortBy === 'rating' ? b.rating - a.rating :
    sortBy === 'package' ? b.minPackage - a.minPackage :
    b.openings - a.openings
  ) : []

  const filteredVisits = backendVisits.filter(v => {
    const ms = v.companyName.toLowerCase().includes(search.toLowerCase())
    const mc = category === 'All' || category === 'Campus Visit'
    return ms && mc
  })

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black">Company Prep</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            {filteredVisits.length + filteredStatic.length} companies - click for full interview guide, salary, reviews
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search companies..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: category === c ? 'var(--primary)' : 'var(--card)',
                color: category === c ? 'white' : 'var(--muted-foreground)',
                border: '1px solid var(--border)',
              }}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Sort:</span>
          {(['rating', 'package', 'openings'] as const).map(s => (
            <button key={s} onClick={() => setSortBy(s)}
              className="px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all"
              style={{
                background: sortBy === s ? 'var(--accent)' : 'var(--card)',
                color: sortBy === s ? 'white' : 'var(--muted-foreground)',
                border: '1px solid var(--border)',
              }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Campus visits section (shown if any accepted) */}
      {filteredVisits.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Building2 size={15} style={{ color: '#22c55e' }} />
            <p className="text-sm font-bold" style={{ color: '#22c55e' }}>Campus Visits ({filteredVisits.length})</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {filteredVisits.map(visit => (
              <button key={visit.id} onClick={() => setSelected({ type: 'visit', data: visit })}
                className="p-5 rounded-2xl text-left transition-all hover:scale-[1.02] cursor-pointer group"
                style={{ background: 'var(--card)', border: '1px solid rgba(34,197,94,0.25)' }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="text-4xl">{visit.logo}</div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                    {visit.status === 'accepted' ? 'Applied' : visit.status}
                  </span>
                </div>
                <h3 className="font-bold text-lg">{visit.companyName}</h3>
                <div className="mt-2 space-y-1">
                  <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--muted-foreground)' }}>
                    <DollarSign size={11} /> {visit.package || visit.salaryRange || 'TBD'}
                  </p>
                  <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--muted-foreground)' }}>
                    <Clock size={11} /> Visit: {visit.date}
                  </p>
                  {visit.role && (
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      {visit.role}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                  <span className="text-xs font-semibold" style={{ color: '#22c55e' }}>Campus Visit</span>
                  <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" style={{ color: 'var(--muted-foreground)' }} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Static companies */}
      {(category === 'All' || category !== 'Campus Visit') && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStatic.map(company => {
            const dc = diffColors[company.difficulty]
            return (
              <button key={company.id} onClick={() => setSelected({ type: 'static', data: company })}
                className="p-5 rounded-2xl text-left transition-all hover:scale-[1.02] cursor-pointer group"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="text-4xl">{company.logo}</div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ color: dc.color, background: dc.bg }}>
                    {company.difficulty}
                  </span>
                </div>
                <h3 className="font-bold text-lg">{company.name}</h3>
                <div className="mt-2 space-y-1">
                  <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--muted-foreground)' }}>
                    <DollarSign size={11} /> {company.package}
                  </p>
                  <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--muted-foreground)' }}>
                    <Users size={11} /> {company.openings} openings
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    📍 {company.locations[0]}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-1 text-xs">
                    <Star size={11} className="fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{company.rating}</span>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{company.category}</span>
                  <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" style={{ color: 'var(--muted-foreground)' }} />
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
