require('dotenv').config()

const mongoose = require('mongoose')
const connectDatabase = require('../config/db')
const AptitudeQuestion = require('../models/AptitudeQuestion')
const AptitudeAttempt = require('../models/AptitudeAttempt')
const Badge = require('../models/Badge')
const CompanyVisit = require('../models/CompanyVisit')
const Contest = require('../models/Contest')
const DSAProblem = require('../models/DSAProblem')
const InterviewExperience = require('../models/InterviewExperience')
const JudgeConfig = require('../models/JudgeConfig')
const MockTest = require('../models/MockTest')
const MockTestAttempt = require('../models/MockTestAttempt')
const Notification = require('../models/Notification')
const Resource = require('../models/Resource')
const Roadmap = require('../models/Roadmap')
const RoadmapProgress = require('../models/RoadmapProgress')
const Submission = require('../models/Submission')
const StudyTask = require('../models/StudyTask')
const User = require('../models/User')

const password = 'password123'

const usersSeed = [
  { name: 'PrepAce Admin', email: 'admin@prepace.com', role: 'admin', status: 'active', college: 'PrepAce', branch: 'Admin', year: 'N/A', totalXP: 9999 },
  { name: 'Arjun Sharma', email: 'arjun@college.edu', status: 'active', college: 'IIT Delhi', branch: 'CSE', year: '4th', placementStatus: 'placed', dsaSolved: 92, aptitudeScore: 88, mockTestsTaken: 14, dsaStreak: 18, totalXP: 3120, coursesCompleted: 5, aptitudeTests: 9, strongTopics: ['Arrays', 'DP', 'Trees'], weakTopics: ['Graphs'] },
  { name: 'Priya Patel', email: 'priya@college.edu', status: 'active', college: 'NIT Surat', branch: 'IT', year: '3rd', dsaSolved: 46, aptitudeScore: 76, mockTestsTaken: 7, dsaStreak: 5, totalXP: 1280, coursesCompleted: 2, aptitudeTests: 5, strongTopics: ['Verbal', 'Arrays'], weakTopics: ['Probability', 'DP'] },
  { name: 'Rahul Kumar', email: 'rahul@college.edu', status: 'active', college: 'BITS Pilani', branch: 'CS', year: '4th', dsaSolved: 134, aptitudeScore: 93, mockTestsTaken: 22, dsaStreak: 35, totalXP: 5680, coursesCompleted: 7, aptitudeTests: 16, strongTopics: ['Graphs', 'DP', 'System Design'], weakTopics: [] },
  { name: 'Kavya Singh', email: 'kavya@college.edu', status: 'pending', college: 'DTU Delhi', branch: 'IT', year: '3rd', dsaSolved: 0, aptitudeScore: 0, mockTestsTaken: 0, totalXP: 0 },
  { name: 'Sneha Rao', email: 'sneha@college.edu', status: 'suspended', college: 'VIT Vellore', branch: 'ECE', year: '3rd', placementStatus: 'not_seeking', dsaSolved: 5, aptitudeScore: 45, mockTestsTaken: 1, totalXP: 120, weakTopics: ['All Topics'] },
]

const badgesSeed = [
  { name: '7 Day Streak', emoji: '🔥', description: 'Login and solve daily for 7 days', xp: 100, color: '#22c55e', criteria: 'Maintain a 7-day practice streak' },
  { name: 'DSA Hero', emoji: '💻', description: 'Solve 50 DSA problems', xp: 250, color: '#6366f1', criteria: 'Solve 50 or more DSA problems' },
  { name: 'Aptitude Master', emoji: '🏆', description: 'Score 90%+ in aptitude', xp: 200, color: '#f59e0b', criteria: 'Score 90% or above in any aptitude mock' },
  { name: 'Speed Coder', emoji: '⚡', description: 'Solve a hard problem quickly', xp: 300, color: '#ec4899', criteria: 'Submit accepted hard solution under 15 minutes' },
  { name: 'Interview Ready', emoji: '🎯', description: 'Complete placement profile', xp: 50, color: '#10b981', criteria: 'Complete profile and resume sections' },
  { name: 'AI Learner', emoji: '✨', description: 'Complete 5 AI-generated quizzes', xp: 150, color: '#8b5cf6', criteria: 'Finish 5 AI mock tests' },
]

const roadmapSeed = [
  {
    title: '30-Day Placement Sprint',
    description: 'Daily plan for service and product company campus placement readiness.',
    targetCompanies: ['TCS', 'Infosys', 'Wipro', 'Cognizant'],
    duration: '30 days',
    enrolledCount: 186,
    phases: [
      { title: 'Week 1: Foundations', tasks: ['Arrays and strings', 'Quant basics', 'Resume cleanup', 'GitHub profile'] },
      { title: 'Week 2: Core DSA', tasks: ['Linked lists', 'Stacks and queues', 'Mock aptitude test', 'Company MCQs'] },
      { title: 'Week 3: Advanced Topics', tasks: ['Trees and graphs', 'DP basics', 'Verbal practice', 'Past interview questions'] },
      { title: 'Week 4: Final Sprint', tasks: ['Full mock tests', 'HR answers', 'Resume review', 'Company research'] },
    ],
  },
  {
    title: 'Product Company DSA Roadmap',
    description: 'Structured 90-day DSA and interview plan for top product companies.',
    targetCompanies: ['Google', 'Amazon', 'Microsoft', 'Adobe'],
    duration: '90 days',
    enrolledCount: 74,
    phases: [
      { title: 'Month 1: Patterns', tasks: ['Sliding window', 'Two pointers', 'Hashing', 'Binary search'] },
      { title: 'Month 2: Advanced DSA', tasks: ['Trees', 'Graphs', 'Dynamic programming', 'Heaps'] },
      { title: 'Month 3: Interview Mode', tasks: ['Timed mocks', 'System design basics', 'Behavioral prep', 'Revision sheet'] },
    ],
  },
  {
    title: 'Aptitude Excellence Plan',
    description: 'Focused plan for quant, logical reasoning, verbal, and company tests.',
    targetCompanies: ['Accenture', 'Capgemini', 'Infosys', 'TCS'],
    duration: '21 days',
    enrolledCount: 213,
    phases: [
      { title: 'Quant', tasks: ['Percentages', 'Profit and loss', 'Time and work', 'Permutation and combination'] },
      { title: 'Logical', tasks: ['Series', 'Puzzles', 'Blood relations', 'Seating arrangement'] },
      { title: 'Verbal', tasks: ['Reading comprehension', 'Grammar', 'Para jumbles', 'Synonyms'] },
    ],
  },
]

const dsaSeed = [
  {
    title: 'Two Sum',
    difficulty: 'Easy',
    topic: 'Arrays',
    description: 'Return indices of two numbers such that they add up to target.',
    examples: [{ input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: '2 + 7 = 9' }],
    constraints: ['2 <= nums.length <= 10^4', 'Only one valid answer exists'],
    starterCode: { python: 'def two_sum(nums, target):\n    pass', javascript: 'function twoSum(nums, target) {\n}' },
    companies: ['Google', 'Amazon', 'Meta'],
    tags: ['hash-map', 'array'],
    editorial: 'Use a hash map to store complements.',
    sampleTestCases: [{ input: '2 7 11 15\n9', expected: '0 1' }],
    hiddenTestCases: [{ input: '3 2 4\n6', expected: '1 2' }],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    submissions: 1540,
    accepted: 1192,
    inputParams: ['nums', 'target'],
  },
  {
    title: 'Maximum Subarray',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    description: 'Find the contiguous subarray with the largest sum.',
    examples: [{ input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: '[4,-1,2,1]' }],
    constraints: ['1 <= nums.length <= 10^5'],
    starterCode: { python: 'def max_sub_array(nums):\n    pass', javascript: 'function maxSubArray(nums) {\n}' },
    companies: ['Amazon', 'Microsoft', 'Apple'],
    tags: ['kadane', 'dp'],
    editorial: 'Use Kadane algorithm and track current/global best.',
    sampleTestCases: [{ input: '-2 1 -3 4 -1 2 1 -5 4', expected: '6' }],
    hiddenTestCases: [{ input: '5 4 -1 7 8', expected: '23' }],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    submissions: 982,
    accepted: 681,
    inputParams: ['nums'],
  },
  {
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    topic: 'Stack',
    description: 'Determine if bracket string is valid.',
    examples: [{ input: 's = "()[]{}"', output: 'true', explanation: 'Every bracket closes correctly' }],
    constraints: ['1 <= s.length <= 10^4'],
    starterCode: { python: 'def is_valid(s):\n    pass', javascript: 'function isValid(s) {\n}' },
    companies: ['Google', 'Bloomberg', 'Uber'],
    tags: ['stack', 'string'],
    editorial: 'Push opening brackets and match closing brackets.',
    sampleTestCases: [{ input: '()[]{}', expected: 'true' }],
    hiddenTestCases: [{ input: '(]', expected: 'false' }],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    submissions: 760,
    accepted: 610,
    inputParams: ['s'],
  },
  {
    title: 'Merge Intervals',
    difficulty: 'Medium',
    topic: 'Intervals',
    description: 'Merge all overlapping intervals.',
    examples: [{ input: '[[1,3],[2,6],[8,10]]', output: '[[1,6],[8,10]]' }],
    constraints: ['1 <= intervals.length <= 10^4'],
    starterCode: { python: 'def merge(intervals):\n    pass' },
    companies: ['Facebook', 'Google', 'Adobe'],
    tags: ['sorting', 'intervals'],
    editorial: 'Sort by start time and merge when current start <= previous end.',
    sampleTestCases: [{ input: '1 3|2 6|8 10', expected: '1 6|8 10' }],
    hiddenTestCases: [{ input: '1 4|4 5', expected: '1 5' }],
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    submissions: 504,
    accepted: 329,
  },
  {
    title: 'Word Ladder',
    difficulty: 'Hard',
    topic: 'Graphs',
    description: 'Find shortest transformation sequence length from beginWord to endWord.',
    examples: [{ input: 'hit -> cog', output: '5', explanation: 'hit hot dot dog cog' }],
    constraints: ['1 <= wordList.length <= 5000'],
    starterCode: { python: 'def ladder_length(beginWord, endWord, wordList):\n    pass' },
    companies: ['Amazon', 'LinkedIn', 'Snap'],
    tags: ['bfs', 'graph'],
    editorial: 'Use BFS over wildcard pattern adjacency.',
    sampleTestCases: [{ input: 'hit\ncog\nhot dot dog lot log cog', expected: '5' }],
    hiddenTestCases: [{ input: 'hit\ncog\nhot dot dog', expected: '0' }],
    timeComplexity: 'O(n * m^2)',
    spaceComplexity: 'O(n * m)',
    submissions: 208,
    accepted: 83,
  },
]

const aptitudeSeed = [
  { topic: 'Quantitative', subtopic: 'Percentages', difficulty: 'Easy', question: 'A value increases from 80 to 100. What is the percentage increase?', options: ['20%', '25%', '30%', '40%'], correct: 1, explanation: 'Increase is 20 over original 80 = 25%.', timeLimit: 45, marks: 1, companyTags: ['TCS', 'Infosys'], attempts: 210, correctRate: 78 },
  { topic: 'Quantitative', subtopic: 'Time and Work', difficulty: 'Medium', question: 'A can finish work in 10 days and B in 15 days. Together they finish in?', options: ['5 days', '6 days', '8 days', '12 days'], correct: 1, explanation: 'Combined work per day = 1/10 + 1/15 = 1/6.', timeLimit: 60, marks: 2, companyTags: ['Accenture'], attempts: 180, correctRate: 64 },
  { topic: 'Logical', subtopic: 'Series', difficulty: 'Easy', question: 'Find next: 2, 6, 12, 20, 30, ?', options: ['36', '40', '42', '44'], correct: 2, explanation: 'Differences are 4,6,8,10, next 12.', timeLimit: 45, marks: 1, companyTags: ['Wipro'], attempts: 198, correctRate: 72 },
  { topic: 'Verbal', subtopic: 'Synonyms', difficulty: 'Easy', question: 'Choose synonym of "Abundant".', options: ['Scarce', 'Plentiful', 'Tiny', 'Weak'], correct: 1, explanation: 'Abundant means plentiful.', timeLimit: 30, marks: 1, companyTags: ['Cognizant'], attempts: 256, correctRate: 84 },
  { topic: 'Technical', subtopic: 'DBMS', difficulty: 'Medium', question: 'Which normal form removes transitive dependency?', options: ['1NF', '2NF', '3NF', 'BCNF'], correct: 2, explanation: '3NF removes transitive dependencies.', timeLimit: 60, marks: 2, companyTags: ['Infosys', 'TCS'], attempts: 130, correctRate: 59 },
  { topic: 'Technical', subtopic: 'OS', difficulty: 'Hard', question: 'Which condition is not required for deadlock?', options: ['Mutual exclusion', 'Hold and wait', 'Preemption', 'Circular wait'], correct: 2, explanation: 'No preemption is required; preemption breaks deadlock.', timeLimit: 75, marks: 3, companyTags: ['Microsoft'], attempts: 96, correctRate: 41 },
]

const mockTestsSeed = [
  {
    title: 'TCS NQT Aptitude Sprint',
    type: 'aptitude',
    duration: 30,
    description: 'Quant, logical, and verbal practice for TCS NQT.',
    totalAttempts: 248,
    avgScore: 72,
    questions: [
      { type: 'mcq', topic: 'Quantitative', subtopic: 'Percentages', question: 'A price is increased by 20% and then decreased by 20%. Net change?', marks: 1, timeLimit: 60, options: ['0%', '4% decrease', '4% increase', '2% decrease'], correct: 1, explanation: '100 -> 120 -> 96, so 4% decrease.' },
      { type: 'fill_blank', topic: 'Logical', subtopic: 'Series', question: 'Next number: 3, 6, 12, 24, ___', marks: 1, timeLimit: 45, blankAnswer: '48', explanation: 'Each term doubles.' },
      { type: 'textual', topic: 'Verbal', question: 'Write a short paragraph explaining teamwork.', marks: 3, timeLimit: 180, sampleAnswer: 'Teamwork is collaboration toward shared goals with communication and accountability.' },
    ],
  },
  {
    title: 'Product DSA Mixed Mock',
    type: 'technical',
    duration: 45,
    description: 'Interview-style DSA and conceptual questions.',
    totalAttempts: 117,
    avgScore: 64,
    questions: [
      { type: 'mcq', topic: 'DSA', subtopic: 'Trees', question: 'Inorder traversal of BST gives?', marks: 1, timeLimit: 45, options: ['Random order', 'Sorted order', 'Reverse sorted only', 'Level order'], correct: 1, explanation: 'BST inorder traversal visits keys in sorted order.' },
      { type: 'coding', topic: 'Strings', question: 'Write a function to check palindrome.', marks: 5, timeLimit: 600, starterCode: { python: 'def is_palindrome(s):\n    pass' }, testCases: [{ input: 'madam', expected: 'true' }, { input: 'hello', expected: 'false' }] },
      { type: 'fill_blank', topic: 'Complexity', question: 'Binary search time complexity is O(___).', marks: 1, timeLimit: 45, blankAnswer: 'log n', explanation: 'Search space halves each step.' },
    ],
  },
  {
    title: 'AI Generated Practice: DBMS + OS',
    type: 'mixed',
    duration: 25,
    description: 'Sample AI-style quiz stored as a normal mock test.',
    totalAttempts: 53,
    avgScore: 69,
    questions: [
      { type: 'mcq', topic: 'DBMS', question: 'ACID property for all-or-nothing transaction?', marks: 1, timeLimit: 45, options: ['Isolation', 'Atomicity', 'Durability', 'Consistency'], correct: 1, explanation: 'Atomicity means all or nothing.' },
      { type: 'mcq', topic: 'OS', question: 'Round Robin scheduling uses?', marks: 1, timeLimit: 45, options: ['Priority queue', 'Time quantum', 'Shortest job', 'Paging'], correct: 1, explanation: 'Round Robin assigns each process a fixed time quantum.' },
      { type: 'textual', topic: 'Networks', question: 'Explain TCP vs UDP.', marks: 3, timeLimit: 180, sampleAnswer: 'TCP is reliable and connection-oriented; UDP is faster and connectionless.' },
    ],
  },
]

const resourcesSeed = [
  { title: 'DSA Sheet - 150 Problems', type: 'pdf', url: 'https://example.com/dsa-sheet.pdf', topic: 'DSA', description: 'Curated problem sheet for placement prep.' },
  { title: 'Aptitude Formula Sheet', type: 'note', url: 'https://example.com/aptitude-formulas', topic: 'Aptitude', description: 'Important formulas for quant rounds.' },
  { title: 'System Design Basics', type: 'video', url: 'https://example.com/system-design-video', topic: 'System Design', description: 'Introductory system design concepts.' },
  { title: 'DBMS Interview Notes', type: 'note', url: 'https://example.com/dbms-notes', topic: 'DBMS', description: 'Normalization, indexing, transactions, and SQL.' },
  { title: '90-Day Product Roadmap', type: 'roadmap', url: 'https://example.com/product-roadmap', topic: 'Roadmap', description: 'Daily study plan for product companies.' },
]

const contestsSeed = [
  { name: '30-Day Placement Sprint', start: '2026-07-01', end: '2026-07-31', participants: 142, status: 'active' },
  { name: 'DSA Weekly Challenge', start: '2026-07-15', end: '2026-07-22', participants: 89, status: 'upcoming' },
  { name: 'Aptitude Speed Run', start: '2026-06-01', end: '2026-06-07', participants: 211, status: 'completed' },
]

const judgeConfigsSeed = [
  { problemId: 'Two Sum', timeLimit: 1000, memoryLimit: 256, languages: ['Python', 'Java', 'C++', 'JavaScript'], checker: 'exact_match' },
  { problemId: 'Valid Parentheses', timeLimit: 500, memoryLimit: 128, languages: ['Python', 'C++', 'Java'], checker: 'exact_match' },
  { problemId: 'Maximum Subarray', timeLimit: 1200, memoryLimit: 256, languages: ['Python', 'JavaScript', 'Java', 'C++'], checker: 'token_match' },
]

const notificationsSeed = [
  { icon: 'Trophy', iconColor: '#f59e0b', title: 'New Achievement Unlocked', body: "You've solved 100 problems! You earned the Century badge.", time: '1 hour ago', read: false, type: 'achievement' },
  { icon: 'Flame', iconColor: '#ef4444', title: "Don't break your streak!", body: "You haven't solved a problem today. Keep your streak alive.", time: '3 hours ago', read: false, type: 'streak' },
  { icon: 'Zap', iconColor: '#8b5cf6', title: 'Weekly Contest starting soon', body: 'PrepAce Weekly Contest starts at 8:00 PM IST. 4 problems, 90 minutes.', time: '5 hours ago', read: true, type: 'contest' },
  { icon: 'AlertCircle', iconColor: '#6366f1', title: 'New AI Feature: Code Optimizer', body: 'AI Code Optimizer can analyze your solution and suggest improvements.', time: '2 days ago', read: true, type: 'feature' },
]

const interviewExperiencesSeed = [
  {
    company: 'Google',
    role: 'SDE Intern',
    author: 'karan_codes',
    college: 'IIT Bombay',
    avatar: 'photo-1500648767791-00dcc994a43e',
    date: 'Jan 12, 2026',
    result: 'Selected',
    package: '80 LPA',
    rounds: 4,
    likes: 342,
    comments: 48,
    tags: ['Graphs', 'DP', 'System Design', 'Behavioral'],
    summary: 'The process was rigorous but fair. Interviewers cared about clarity, edge cases, and how I explained tradeoffs.',
    timeline: ['Online Assessment (90 min)', 'Technical Round 1 - Arrays + Trees', 'Technical Round 2 - DP + Design', 'HR + Team Matching'],
    questions: ['Shortest path with negative edges', 'Design a collaborative editor', 'Implement a file system'],
  },
  {
    company: 'Amazon',
    role: 'SDE-1',
    author: 'sneha_dev',
    college: 'BITS Pilani',
    avatar: 'photo-1438761681033-6461ffad8d80',
    date: 'Dec 28, 2025',
    result: 'Selected',
    package: '42 LPA',
    rounds: 5,
    likes: 287,
    comments: 35,
    tags: ['Leadership Principles', 'OOP', 'Graphs', 'DBMS'],
    summary: 'Every behavioral answer needed a STAR story. DSA rounds focused on clean implementation and follow-up optimization.',
    timeline: ['OA - DSA', 'Technical 1 - OOP + DSA', 'Technical 2 - System Design', 'Behavioral rounds x2'],
    questions: ['Implement a rate limiter', 'Design a cart system', 'Find median from data stream'],
  },
  {
    company: 'Microsoft',
    role: 'SDE-2',
    author: 'rahul_ms',
    college: 'NIT Warangal',
    avatar: 'photo-1472099645785-5658abf4ff4e',
    date: 'Dec 15, 2025',
    result: 'Rejected',
    package: 'N/A',
    rounds: 3,
    likes: 156,
    comments: 22,
    tags: ['Trees', 'Graphs', 'OOP'],
    summary: 'Reached the final technical round and missed a system design discussion. The feedback was useful for my next attempt.',
    timeline: ['Phone Screen', 'Technical 1 - DSA', 'Technical 2 - System Design'],
    questions: ['Serialize and deserialize a binary tree', 'Design a distributed key-value store'],
  },
]

function plannerSeedFor(userId) {
  const today = new Date()
  const date = offset => {
    const next = new Date(today)
    next.setDate(today.getDate() + offset)
    return next.toISOString().slice(0, 10)
  }

  return [
    { task: 'Graph BFS/DFS - 10 problems', topic: 'DSA', done: true, date: date(-5), time: '09:00', user: userId },
    { task: 'TCS Aptitude Mock Test', topic: 'Aptitude', done: true, date: date(-4), time: '14:00', user: userId },
    { task: 'Dynamic Programming - DP on strings', topic: 'DSA', done: true, date: date(-3), time: '10:00', user: userId },
    { task: 'Resume review and ATS optimization', topic: 'Resume', done: false, date: date(-1), time: '16:00', user: userId },
    { task: 'Mock coding interview', topic: 'Interview', done: false, date: date(0), time: '18:00', user: userId },
    { task: 'Infosys InfyTQ full mock', topic: 'Mock Test', done: false, date: date(1), time: '10:00', user: userId },
    { task: 'Weekly review and planning', topic: 'Planning', done: false, date: date(3), user: userId },
  ]
}

async function clearCollections() {
  await Promise.all([
    AptitudeQuestion.deleteMany({}),
    AptitudeAttempt.deleteMany({}),
    Badge.deleteMany({}),
    CompanyVisit.deleteMany({}),
    DSAProblem.deleteMany({}),
    Contest.deleteMany({}),
    InterviewExperience.deleteMany({}),
    JudgeConfig.deleteMany({}),
    MockTest.deleteMany({}),
    MockTestAttempt.deleteMany({}),
    Notification.deleteMany({}),
    Resource.deleteMany({}),
    Roadmap.deleteMany({}),
    RoadmapProgress.deleteMany({}),
    Submission.deleteMany({}),
    StudyTask.deleteMany({}),
    User.deleteMany({}),
  ])
}

async function seedAll() {
  await connectDatabase()
  await clearCollections()

  const badges = await Badge.insertMany(badgesSeed)
  const users = await User.create(usersSeed.map((user, index) => ({
    ...user,
    password,
    badges: index > 0 ? badges.slice(0, Math.min(index, badges.length)).map(badge => badge._id) : [],
    lastActive: new Date(Date.now() - index * 24 * 60 * 60 * 1000),
  })))
  const admin = users.find(user => user.role === 'admin')
  const students = users.filter(user => user.role === 'student')

  const roadmaps = await Roadmap.insertMany(roadmapSeed)
  const problems = await DSAProblem.insertMany(dsaSeed)
  const aptitudeQuestions = await AptitudeQuestion.insertMany(aptitudeSeed)
  const mockTests = await MockTest.insertMany(mockTestsSeed)
  await Resource.insertMany(resourcesSeed.map(resource => ({ ...resource, uploadedBy: admin._id })))
  await Contest.insertMany(contestsSeed)
  await JudgeConfig.insertMany(judgeConfigsSeed)
  await InterviewExperience.insertMany(interviewExperiencesSeed.map((experience, index) => ({
    ...experience,
    user: students[index % students.length]._id,
  })))
  await Notification.insertMany(notificationsSeed.map(notification => ({ ...notification, user: students[0]._id })))
  await StudyTask.insertMany(plannerSeedFor(students[0]._id))

  await CompanyVisit.insertMany([
    {
      companyName: 'TCS',
      logo: 'TCS',
      date: new Date('2026-08-15'),
      role: 'Software Engineer',
      package: '7 LPA',
      deadline: new Date('2026-08-01'),
      description: 'Campus drive for Software Engineer roles. Process includes aptitude, technical, and HR rounds.',
      eligibility: { minCGPA: 6, noBacklogs: true, branches: ['CSE', 'IT', 'ECE'], maxGap: 1, otherCriteria: ['No active backlogs'] },
      adminNote: 'Shortlist will be announced 3 days before test.',
      attachmentUrl: 'https://example.com/tcs-jd.pdf',
      attachmentName: 'TCS_JD_2026.pdf',
      overview: 'TCS is hiring for Ninja and Digital profiles.',
      interviewProcess: ['NQT', 'Technical Interview', 'Managerial Round', 'HR Round'],
      pastQuestions: ['Reverse a linked list', 'SQL joins', 'OOP concepts', 'Pattern printing'],
      salaryRange: '7-10 LPA',
      rounds: 4,
      roadmapId: roadmaps[0]._id,
      responses: [
        { user: students[0]._id, userName: students[0].name, status: 'accepted' },
        { user: students[1]._id, userName: students[1].name, status: 'accepted' },
      ],
    },
    {
      companyName: 'Amazon',
      logo: 'AMZ',
      date: new Date('2026-09-10'),
      role: 'SDE Intern',
      package: '45 LPA',
      deadline: new Date('2026-08-25'),
      description: 'Product company hiring for internship and full-time conversion track.',
      eligibility: { minCGPA: 7.5, noBacklogs: true, branches: ['CSE', 'IT'], maxGap: 0, otherCriteria: ['Strong DSA profile'] },
      adminNote: 'Online assessment has two coding questions.',
      overview: 'Amazon focuses heavily on DSA, problem solving, and leadership principles.',
      interviewProcess: ['Online Assessment', 'DSA Round 1', 'DSA Round 2', 'Bar Raiser'],
      pastQuestions: ['LRU cache', 'Word ladder', 'Merge intervals', 'Leadership principles'],
      salaryRange: '30-45 LPA',
      rounds: 4,
      roadmapId: roadmaps[1]._id,
      responses: [{ user: students[2]._id, userName: students[2].name, status: 'accepted' }],
    },
    {
      companyName: 'Infosys',
      logo: 'INFY',
      date: new Date('2026-08-28'),
      role: 'Systems Engineer',
      package: '6.5 LPA',
      deadline: new Date('2026-08-12'),
      description: 'Aptitude and technical hiring process for Systems Engineer role.',
      eligibility: { minCGPA: 6.5, noBacklogs: true, branches: ['CSE', 'IT', 'EEE', 'ECE'], maxGap: 1 },
      interviewProcess: ['InfyTQ', 'Technical Interview', 'HR Round'],
      pastQuestions: ['Pseudocode', 'DBMS basics', 'Java OOP', 'Logical reasoning'],
      salaryRange: '6.5 LPA',
      rounds: 3,
      roadmapId: roadmaps[2]._id,
    },
  ])

  await RoadmapProgress.insertMany([
    { user: students[0]._id, roadmap: roadmaps[0]._id, completedTasks: ['0:0', '0:1', '1:0'] },
    { user: students[1]._id, roadmap: roadmaps[2]._id, completedTasks: ['0:0', '1:0'] },
    { user: students[2]._id, roadmap: roadmaps[1]._id, completedTasks: ['0:0', '0:1', '0:2', '1:0'] },
  ])

  await Submission.insertMany([
    { user: students[0]._id, problem: problems[0]._id, lang: 'python', code: 'def two_sum(nums, target):\n    seen={}\n    for i,n in enumerate(nums):\n        if target-n in seen: return [seen[target-n],i]\n        seen[n]=i', verdict: 'Accepted', runtime: '32ms', memory: '14MB', testsPassed: 6, totalTests: 6 },
    { user: students[1]._id, problem: problems[1]._id, lang: 'javascript', code: 'function maxSubArray(nums){let best=nums[0],cur=0; for(const n of nums){cur=Math.max(n,cur+n); best=Math.max(best,cur)} return best}', verdict: 'Accepted', runtime: '45ms', memory: '18MB', testsPassed: 8, totalTests: 8 },
    { user: students[2]._id, problem: problems[4]._id, lang: 'python', code: 'def ladder_length(beginWord, endWord, wordList):\n    return 0', verdict: 'Wrong Answer', runtime: '21ms', memory: '13MB', testsPassed: 2, totalTests: 9 },
  ])

  const aptitudeAttempts = aptitudeQuestions.slice(0, 10).flatMap((question, index) =>
    students.slice(0, 3).map((student, studentIndex) => {
      const correct = (index + studentIndex) % 3 !== 0
      return {
        user: student._id,
        question: question._id,
        selected: correct ? question.correct : (question.correct + 1) % Math.max(question.options.length, 1),
        correct,
        timeUsed: 35 + index * 3 + studentIndex * 4,
      }
    })
  )
  await AptitudeAttempt.insertMany(aptitudeAttempts)
  await Promise.all(aptitudeQuestions.map(async question => {
    const attempts = aptitudeAttempts.filter(attempt => String(attempt.question) === String(question._id)).length
    const correct = aptitudeAttempts.filter(attempt => String(attempt.question) === String(question._id) && attempt.correct).length
    question.attempts = attempts
    question.correctRate = attempts ? Math.round((correct / attempts) * 100) : 0
    await question.save()
  }))

  await MockTestAttempt.insertMany([
    { user: students[0]._id, test: mockTests[0]._id, testTitle: mockTests[0].title, source: 'mock', score: 24, totalMarks: 30, percentage: 80, timeUsed: 1420, answers: { q1: 1 } },
    { user: students[1]._id, test: mockTests[1]._id, testTitle: mockTests[1].title, source: 'mock', score: 14, totalMarks: 25, percentage: 56, timeUsed: 1880, answers: { q1: 1 } },
    { user: students[2]._id, test: mockTests[2]._id, testTitle: mockTests[2].title, source: 'ai', score: 18, totalMarks: 22, percentage: 82, timeUsed: 1020, answers: { q1: 1 }, generatedConfig: { topics: ['DBMS', 'OS'], count: 10, minutes: 25 } },
  ])

  console.log('Seed complete')
  console.log(`Users: ${users.length} | Password for all users: ${password}`)
  console.log(`Admin: admin@prepace.com / ${password}`)
  await mongoose.connection.close()
}

seedAll().catch(async error => {
  console.error(error)
  await mongoose.connection.close()
  process.exit(1)
})
