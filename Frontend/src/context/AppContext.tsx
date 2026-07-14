import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, loadCollection, normalizeId, normalizeList } from '../lib/api'

export interface EligibilityCriteria {
  minCGPA: number
  noBacklogs: boolean
  branches: string[]
  maxGap: number
  otherCriteria: string[]
}

export interface CompanyVisit {
  id: string
  companyName: string
  logo: string
  date: string
  role: string
  package: string
  deadline: string
  description: string
  eligibility: EligibilityCriteria
  status: 'pending' | 'accepted' | 'rejected'
  userReason?: string
  adminNote?: string
  attachmentUrl?: string
  attachmentName?: string
  responses: { userId: string; userName: string; status: 'accepted' | 'rejected'; reason?: string }[]
  // Company prep data (admin-managed)
  overview?: string
  interviewProcess?: string[]
  pastQuestions?: string[]
  salaryRange?: string
  rounds?: number
  roadmapId?: string
}

export interface DSAProblem {
  id: string
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  topic: string
  description: string
  examples: { input: string; output: string; explanation?: string }[]
  constraints: string[]
  starterCode: Record<string, string>
  companies: string[]
  tags: string[]
  editorial?: string
  videoLink?: string
  imageUrl?: string
  sampleTestCases: { input: string; expected: string }[]
  hiddenTestCases: { input: string; expected: string }[]
  timeComplexity?: string
  spaceComplexity?: string
  submissions?: number
  accepted?: number
  // Named input parameters for test case display (e.g. ['nums', 'target'])
  inputParams?: string[]
}

export type VerdictType = 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error' | 'Compilation Error'

export interface CodeSubmission {
  id: string
  problemId: string
  lang: string
  code: string
  verdict: VerdictType
  timestamp: string
  runtime?: string
  memory?: string
  testsPassed: number
  totalTests: number
}

export interface RoadmapProgress {
  roadmapId: string
  startedAt: string
  completedTasks: string[] // "phaseIdx:taskIdx"
}

export interface MockTestAttempt {
  id: string
  testId: string
  testTitle: string
  score: number
  totalMarks: number
  percentage: number
  timeUsed: number
  date: string
  questions?: MockQuestion[]
  answers?: Record<string, any>
  review?: {
    questionId: string
    userAnswer: any
    correctAnswer: any
    isCorrect: boolean
    explanation?: string
  }[]
  source?: 'mock' | 'ai'
}

export interface AptitudeQuestion {
  id: string
  topic: string
  subtopic: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  question: string
  options: string[]
  correct: number
  explanation: string
  timeLimit: number
  marks: number
  companyTags: string[]
  imageUrl?: string
  attempts?: number
  correctRate?: number
}

export type QuestionType = 'mcq' | 'fill_blank' | 'textual' | 'coding'

export interface MockQuestion {
  id: string
  type: QuestionType
  topic: string
  subtopic?: string
  question: string
  marks: number
  timeLimit: number
  explanation?: string
  // MCQ
  options?: string[]
  correct?: number
  // Fill in blank
  blankAnswer?: string
  // Textual
  sampleAnswer?: string
  // Coding
  starterCode?: Record<string, string>
  testCases?: { input: string; expected: string }[]
  // Reference to aptitude bank
  sourceId?: string
}

export interface MockTestDef {
  id: string
  title: string
  type: 'aptitude' | 'technical' | 'mixed'
  duration: number
  questions: MockQuestion[]
  description: string
  createdAt: string
  totalAttempts?: number
  avgScore?: number
  liveAt?: string  // ISO datetime when test goes live; undefined = immediately available
}

export interface Badge {
  id: string
  name: string
  emoji: string
  description: string
  xp: number
  color: string
  criteria: string
}

export interface StudyRoadmap {
  id: string
  title: string
  description: string
  targetCompanies: string[]
  duration: string
  phases: { title: string; tasks: string[] }[]
  createdAt: string
  enrolledCount?: number
  status?: 'draft' | 'published' | 'archived'
  companyName?: string
  companyLogo?: string
  role?: string
  difficulty?: 'Easy' | 'Medium' | 'Hard'
  durationWeeks?: number
  hiringRequirements?: string
  eligibilityCriteria?: string
  additionalNotes?: string
  modules?: {
    id: string
    title: string
    description: string
    difficulty: 'Easy' | 'Medium' | 'Hard'
    estimatedHours: number
    learningOutcomes: string[]
    prerequisites: string[]
    resources: {
      id: string
      title: string
      platform: string
      resourceType: string
      searchKeyword: string
      estimatedTime: string
      linkedResourceId?: string
      url?: string
    }[]
    dailyTasks: {
      id: string
      dayNumber: number
      taskName: string
      description: string
      estimatedMinutes: number
      status: 'pending' | 'in-progress' | 'done'
    }[]
    quiz: {
      id: string
      title: string
      difficulty: 'Easy' | 'Medium' | 'Hard'
      passingScore: number
      distribution: Record<string, number>
      questions: {
        id: string
        question: string
        options: string[]
        correctAnswer: string
        explanation: string
        difficulty: 'Easy' | 'Medium' | 'Hard'
        topic: string
        questionType?: string
        type?: QuestionType
        marks?: number
        timeLimit?: number
        correct?: number
        blankAnswer?: string
        sampleAnswer?: string
        starterCode?: Record<string, string>
        testCases?: { input: string; expected: string }[]
        sourceId?: string
      }[]
    }
  }[]
}

export interface AdminUser {
  id: string
  name: string
  email: string
  college: string
  branch: string
  year: string
  status: 'active' | 'suspended' | 'pending'
  placementStatus: 'seeking' | 'placed' | 'not_seeking'
  joinedAt: string
  dsaSolved: number
  aptitudeScore: number
  mockTestsTaken: number
  badges: string[]
  dsaStreak: number
  totalXP: number
  lastActive: string
  coursesCompleted: number
  aptitudeTests: number
  strongTopics: string[]
  weakTopics: string[]
}

export interface PendingRegistration {
  id: string
  name: string
  email: string
  college: string
  branch: string
  year: string
  registeredAt: string
}

export interface Resource {
  id: string;
  title: string;
  type: "pdf" | "video" | "note" | "roadmap";
  url: string;
  topic: string;
  description: string;
  uploadedAt: string;
  storageProvider?: "cloudinary" | "azure" | "external";
  storageKey?: string;
  mimeType?: string;
  size?: number;
  format?: string;
  originalFilename?: string;
}

export interface CustomTopic {
  id: string
  name: string
  subtopics: string[]
}

interface AppContextType {
  pendingRegistrations: PendingRegistration[]
  addPendingRegistration: (r: PendingRegistration) => void
  approveRegistration: (id: string) => void
  rejectRegistration: (id: string) => void
  companyVisits: CompanyVisit[]
  setCompanyVisits: (v: CompanyVisit[]) => void
  dsaProblems: DSAProblem[]
  setDsaProblems: (v: DSAProblem[]) => void
  aptitudeQuestions: AptitudeQuestion[]
  setAptitudeQuestions: (v: AptitudeQuestion[]) => void
  mockTests: MockTestDef[]
  setMockTests: (v: MockTestDef[]) => void
  badges: Badge[]
  setBadges: (v: Badge[]) => void
  roadmaps: StudyRoadmap[]
  setRoadmaps: (v: StudyRoadmap[]) => void
  adminUsers: AdminUser[]
  setAdminUsers: (v: AdminUser[]) => void
  resources: Resource[]
  setResources: (v: Resource[]) => void
  dsaTopics: CustomTopic[]
  setDsaTopics: (v: CustomTopic[]) => void
  aptitudeTopics: CustomTopic[]
  setAptitudeTopics: (v: CustomTopic[]) => void
  knownCompanies: string[]
  setKnownCompanies: (v: string[]) => void
  // Code submission history (keyed by problemId)
  codeSubmissions: Record<string, CodeSubmission[]>
  addCodeSubmission: (sub: CodeSubmission) => void
  // Mock test attempt history
  mockTestHistory: MockTestAttempt[]
  addMockTestAttempt: (attempt: MockTestAttempt) => void
  // Roadmap progress
  roadmapProgress: RoadmapProgress[]
  startRoadmap: (roadmapId: string) => void
  toggleRoadmapTask: (roadmapId: string, taskKey: string) => void
  removeRoadmapProgress: (roadmapId: string) => void
}

const AppContext = createContext<AppContextType | null>(null)

const DEFAULT_ELIGIBILITY: EligibilityCriteria = {
  minCGPA: 6.0, noBacklogs: true, branches: ['CSE', 'IT'], maxGap: 1, otherCriteria: []
}

const DEMO_VISITS: CompanyVisit[] = [
  {
    id: '1', companyName: 'TCS', logo: '🏢', date: '2025-02-15', role: 'Software Engineer',
    package: '7 LPA', deadline: '2025-01-31',
    description: 'TCS is visiting campus for Software Engineer positions. Applicants must clear the TCS NQT test. Process includes Aptitude → Technical → HR rounds.',
    eligibility: { minCGPA: 6.0, noBacklogs: true, branches: ['CSE', 'IT', 'ECE'], maxGap: 1, otherCriteria: ['No active backlogs'] },
    status: 'pending', adminNote: 'Shortlist will be announced 3 days before.',
    attachmentUrl: '#', attachmentName: 'TCS_JD_2025.pdf',
    interviewProcess: ['Online Test (TCS NQT)', 'Technical Interview Round 1', 'Technical Interview Round 2', 'HR Interview'],
    pastQuestions: ['Reverse a linked list', 'Find the largest element in an array', 'SQL query on JOIN operations', 'OOP concepts in Java', 'Output-based C programs'],
    salaryRange: '7–10 LPA (based on role)', rounds: 4,
    responses: [
      { userId: '1', userName: 'Arjun Sharma', status: 'accepted' },
      { userId: '4', userName: 'Sneha Rao', status: 'rejected', reason: 'Location not preferred' },
    ],
  },
  {
    id: '2', companyName: 'Infosys', logo: '💼', date: '2025-02-20', role: 'Systems Engineer',
    package: '6.5 LPA', deadline: '2025-02-05',
    description: 'Infosys campus recruitment for Systems Engineer role. 3 rounds: Aptitude, Technical, HR.',
    eligibility: { minCGPA: 6.5, noBacklogs: true, branches: ['CSE', 'IT', 'EEE', 'ECE'], maxGap: 1, otherCriteria: [] },
    status: 'pending', adminNote: 'Register before deadline.',
    interviewProcess: ['Aptitude Test (Infosys InfyTQ)', 'Technical Interview', 'HR Round'],
    pastQuestions: ['Data structures basics', 'Sorting algorithms', 'Verbal reasoning questions', 'Pattern-based programming', 'Pseudocode analysis'],
    salaryRange: '6.5 LPA', rounds: 3,
    responses: [{ userId: '3', userName: 'Rahul Kumar', status: 'accepted' }],
  },
]

const DSA_TOPICS_DEFAULT: CustomTopic[] = [
  { id: '1', name: 'Arrays', subtopics: ['1D Arrays', '2D Arrays', 'Prefix Sum'] },
  { id: '2', name: 'Linked Lists', subtopics: ['Singly', 'Doubly', 'Circular'] },
  { id: '3', name: 'Trees', subtopics: ['Binary Tree', 'BST', 'AVL', 'Segment Tree'] },
  { id: '4', name: 'Graphs', subtopics: ['BFS', 'DFS', 'Dijkstra', 'Floyd Warshall'] },
  { id: '5', name: 'Dynamic Programming', subtopics: ['1D DP', '2D DP', 'Knapsack', 'LCS', 'LIS'] },
  { id: '6', name: 'Backtracking', subtopics: ['Permutations', 'Combinations', 'N-Queens'] },
  { id: '7', name: 'Greedy', subtopics: ['Activity Selection', 'Huffman', 'Job Scheduling'] },
  { id: '8', name: 'Binary Search', subtopics: ['Classic', 'Search Space', 'Rotated Array'] },
  { id: '9', name: 'Heap', subtopics: ['Min Heap', 'Max Heap', 'Priority Queue'] },
  { id: '10', name: 'Trie', subtopics: ['Insert/Search', 'Prefix', 'Word Dictionary'] },
  { id: '11', name: 'Sliding Window', subtopics: ['Fixed', 'Variable'] },
  { id: '12', name: 'Two Pointers', subtopics: ['Opposite Ends', 'Fast/Slow'] },
  { id: '13', name: 'Stack & Queue', subtopics: ['Monotonic Stack', 'Deque', 'BFS Queue'] },
  { id: '14', name: 'Hashing', subtopics: ['Hash Map', 'Hash Set', 'Frequency Count'] },
  { id: '15', name: 'String', subtopics: ['Pattern Matching', 'KMP', 'Anagram', 'Palindrome'] },
]

const APT_TOPICS_DEFAULT: CustomTopic[] = [
  { id: '1', name: 'Quantitative Aptitude', subtopics: ['Number System', 'Percentage', 'Profit & Loss', 'Time & Work', 'Speed & Distance', 'Simple & Compound Interest', 'Ratio & Proportion', 'Probability', 'Permutation & Combination'] },
  { id: '2', name: 'Logical Reasoning', subtopics: ['Syllogisms', 'Blood Relations', 'Seating Arrangement', 'Coding-Decoding', 'Series Completion', 'Direction Sense', 'Clocks & Calendars', 'Puzzles'] },
  { id: '3', name: 'Verbal Ability', subtopics: ['Reading Comprehension', 'Vocabulary', 'Grammar', 'Sentence Correction', 'Para Jumbles', 'Fill in the Blanks', 'Synonyms & Antonyms'] },
  { id: '4', name: 'Data Interpretation', subtopics: ['Bar Graph', 'Pie Chart', 'Tables', 'Line Graph', 'Mixed Graphs'] },
  { id: '5', name: 'Technical Aptitude', subtopics: ['Computer Science Basics', 'Networking', 'OS Concepts', 'DBMS', 'OOP Concepts'] },
]

const KNOWN_COMPANIES_DEFAULT = [
  'Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 'TCS', 'Infosys', 'Wipro',
  'Cognizant', 'HCL', 'Accenture', 'IBM', 'Deloitte', 'Goldman Sachs', 'Morgan Stanley',
  'Adobe', 'Salesforce', 'Oracle', 'SAP', 'Capgemini', 'Mindtree', 'L&T Infotech',
  'Hexaware', 'Mphasis', 'Tech Mahindra', "BYJU'S", 'Flipkart', 'Paytm', 'Zomato', 'Swiggy',
]

function normalizeVisitsForUser(visits: CompanyVisit[], userId?: string): CompanyVisit[] {
  return visits.map((visit: any) => {
    const responses = (visit.responses || []).map((response: any) => ({
      userId: String(response.user?._id || response.user || response.userId || ''),
      userName: response.userName || 'Student',
      status: response.status,
      reason: response.reason,
    }))
    const mine = userId ? responses.find(response => response.userId === String(userId)) : undefined
    return {
      ...visit,
      id: visit.id || visit._id,
      status: mine?.status || visit.status || 'pending',
      userReason: mine?.reason || visit.userReason,
      responses,
    }
  })
}

function sc(py: string, js: string, java: string, cpp: string, c: string): Record<string, string> {
  return { python: py, javascript: js, java, cpp, c }
}

const SAMPLE_DSA: DSAProblem[] = [
  {
    id: 'd1', title: 'Two Sum', difficulty: 'Easy', topic: 'Hashing',
    companies: ['Google', 'Amazon', 'Meta'], tags: ['hash-map', 'array'],
    description: `<p>Given an array of integers <code style="background:rgba(99,102,241,0.12);padding:2px 6px;border-radius:4px;font-family:monospace">nums</code> and an integer <code style="background:rgba(99,102,241,0.12);padding:2px 6px;border-radius:4px;font-family:monospace">target</code>, return <strong>indices of the two numbers</strong> such that they add up to target.</p>
<br/>
<div style="background:rgba(245,158,11,0.08);border-left:3px solid #f59e0b;padding:10px 14px;border-radius:0 8px 8px 0;margin:8px 0">
  <strong style="color:#f59e0b">⚡ Key Insight:</strong>
  <p style="margin-top:4px;color:inherit">Instead of checking every pair O(n²), use a <strong>Hash Map</strong> to find the complement in O(1) time. For each element <code>x</code>, check if <code>target - x</code> already exists in the map.</p>
</div>
<br/>
<p><strong>Approach — Hash Map:</strong></p>
<pre style="background:#0d1117;color:#e6edf3;padding:12px 16px;border-radius:8px;font-size:12px;overflow-x:auto;margin:8px 0"><code>seen = {}
for i, num in enumerate(nums):
    complement = target - num
    if complement in seen:
        return [seen[complement], i]
    seen[num] = i</code></pre>
<p style="color:var(--muted-foreground);font-size:13px">You may assume exactly one solution exists. You may not use the same element twice.</p>`,
    examples: [{ input: 'nums=[2,7,11,15], target=9', output: '[0,1]', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' }],
    constraints: ['2 ≤ nums.length ≤ 10⁴', '-10⁹ ≤ nums[i] ≤ 10⁹', 'Only one valid answer exists'],
    starterCode: sc('def twoSum(nums, target):\n    pass', 'function twoSum(nums, target) {}', 'public int[] twoSum(int[] nums, int target) { return new int[]{}; }', 'vector<int> twoSum(vector<int>& nums, int target) { return {}; }', 'int* twoSum(int* nums, int n, int target) { return NULL; }'),
    sampleTestCases: [{ input: '[2,7,11,15]\n9', expected: '[0,1]' }, { input: '[3,2,4]\n6', expected: '[1,2]' }],
    hiddenTestCases: [{ input: '[3,3]\n6', expected: '[0,1]' }],
    timeComplexity: 'O(n)', spaceComplexity: 'O(n)', submissions: 1240, accepted: 920, inputParams: ['nums', 'target'],
  },
  { id: 'd2', title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', topic: 'Arrays', companies: ['Amazon', 'Microsoft', 'Apple'], tags: ['array', 'greedy'], description: 'Find the maximum profit by buying and selling stock once.', examples: [{ input: 'prices=[7,1,5,3,6,4]', output: '5', explanation: 'Buy at 1, sell at 6' }], constraints: ['1≤n≤10⁵'], starterCode: sc('def maxProfit(prices):\n    pass', 'function maxProfit(prices) {}', 'public int maxProfit(int[] prices) { return 0; }', 'int maxProfit(vector<int>& prices) { return 0; }', 'int maxProfit(int* p, int n) { return 0; }'), sampleTestCases: [{ input: '[7,1,5,3,6,4]', expected: '5' }, { input: '[7,6,4,3,1]', expected: '0' }], hiddenTestCases: [{ input: '[2,4,1]', expected: '2' }], timeComplexity: 'O(n)', spaceComplexity: 'O(1)', submissions: 980, accepted: 760, inputParams: ['prices'] },
  { id: 'd3', title: 'Valid Parentheses', difficulty: 'Easy', topic: 'Stack & Queue', companies: ['Google', 'Bloomberg'], tags: ['stack', 'string'], description: 'Determine if a string of brackets is valid.', examples: [{ input: 's="()[]{}"', output: 'true' }], constraints: ['1≤n≤10⁴'], starterCode: sc('def isValid(s):\n    pass', 'function isValid(s) {}', 'public boolean isValid(String s) { return false; }', 'bool isValid(string s) { return false; }', 'bool isValid(char* s) { return false; }'), sampleTestCases: [{ input: '"()[]{}"', expected: 'true' }], hiddenTestCases: [{ input: '"(]"', expected: 'false' }], timeComplexity: 'O(n)', spaceComplexity: 'O(n)', submissions: 870, accepted: 650 },
  { id: 'd4', title: 'Reverse Linked List', difficulty: 'Easy', topic: 'Linked Lists', companies: ['Amazon', 'Microsoft', 'Adobe'], tags: ['linked-list', 'recursion'], description: 'Reverse a singly linked list.', examples: [{ input: '1→2→3→4→5', output: '5→4→3→2→1' }], constraints: ['0≤n≤5000'], starterCode: sc('def reverseList(head):\n    pass', 'function reverseList(head) {}', 'public ListNode reverseList(ListNode head) { return null; }', 'ListNode* reverseList(ListNode* head) { return nullptr; }', 'struct ListNode* reverseList(struct ListNode* h) { return NULL; }'), sampleTestCases: [{ input: '[1,2,3,4,5]', expected: '[5,4,3,2,1]' }], hiddenTestCases: [{ input: '[1,2]', expected: '[2,1]' }], timeComplexity: 'O(n)', spaceComplexity: 'O(1)', submissions: 740, accepted: 590 },
  { id: 'd5', title: 'Climbing Stairs', difficulty: 'Easy', topic: 'Dynamic Programming', companies: ['Amazon', 'Apple'], tags: ['dp', 'fibonacci'], description: 'Count ways to climb n stairs taking 1 or 2 steps.', examples: [{ input: 'n=3', output: '3' }], constraints: ['1≤n≤45'], starterCode: sc('def climbStairs(n):\n    pass', 'function climbStairs(n) {}', 'public int climbStairs(int n) { return 0; }', 'int climbStairs(int n) { return 0; }', 'int climbStairs(int n) { return 0; }'), sampleTestCases: [{ input: '3', expected: '3' }], hiddenTestCases: [{ input: '5', expected: '8' }], timeComplexity: 'O(n)', spaceComplexity: 'O(1)', submissions: 620, accepted: 490 },
  { id: 'd6', title: 'Binary Search', difficulty: 'Easy', topic: 'Binary Search', companies: ['Google', 'Facebook'], tags: ['binary-search', 'array'], description: 'Search for a target in a sorted array.', examples: [{ input: 'nums=[-1,0,3,5,9,12], target=9', output: '4' }], constraints: ['1≤n≤10⁴'], starterCode: sc('def search(nums, target):\n    pass', 'function search(nums, target) {}', 'public int search(int[] nums, int target) { return -1; }', 'int search(vector<int>& nums, int target) { return -1; }', 'int search(int* nums, int n, int target) { return -1; }'), sampleTestCases: [{ input: '[-1,0,3,5,9,12], 9', expected: '4' }], hiddenTestCases: [{ input: '[5], -5', expected: '-1' }], timeComplexity: 'O(log n)', spaceComplexity: 'O(1)', submissions: 550, accepted: 430 },
  { id: 'd7', title: 'Merge Two Sorted Lists', difficulty: 'Easy', topic: 'Linked Lists', companies: ['Amazon', 'Microsoft'], tags: ['linked-list', 'merge'], description: 'Merge two sorted linked lists into one sorted list.', examples: [{ input: 'l1=[1,2,4], l2=[1,3,4]', output: '[1,1,2,3,4,4]' }], constraints: ['0≤n,m≤50'], starterCode: sc('def mergeTwoLists(l1, l2):\n    pass', 'function mergeTwoLists(l1, l2) {}', 'public ListNode mergeTwoLists(ListNode l1, ListNode l2) { return null; }', 'ListNode* mergeTwoLists(ListNode* l1, ListNode* l2) { return nullptr; }', 'struct ListNode* mergeTwoLists(struct ListNode* l1, struct ListNode* l2) { return NULL; }'), sampleTestCases: [{ input: '[1,2,4],[1,3,4]', expected: '[1,1,2,3,4,4]' }], hiddenTestCases: [{ input: '[],[0]', expected: '[0]' }], timeComplexity: 'O(n+m)', spaceComplexity: 'O(1)', submissions: 480, accepted: 380 },
  {
    id: 'd8', title: 'Maximum Subarray', difficulty: 'Medium', topic: 'Dynamic Programming',
    companies: ['Amazon', 'Microsoft', 'Google'], tags: ['dp', 'kadane', 'array'],
    description: `<p>Given an integer array <code style="background:rgba(99,102,241,0.12);padding:2px 6px;border-radius:4px;font-family:monospace">nums</code>, find the <strong>contiguous subarray</strong> (containing at least one number) which has the <strong>largest sum</strong> and return its sum.</p>
<br/>
<p><strong>Kadane's Algorithm — Visual Trace:</strong></p>
<div style="overflow-x:auto;margin:8px 0">
<table style="border-collapse:collapse;font-size:12px;font-family:monospace;width:100%">
  <thead>
    <tr style="background:rgba(99,102,241,0.12)">
      <th style="padding:6px 10px;border:1px solid rgba(255,255,255,0.1);text-align:left">i</th>
      <th style="padding:6px 10px;border:1px solid rgba(255,255,255,0.1)">nums[i]</th>
      <th style="padding:6px 10px;border:1px solid rgba(255,255,255,0.1)">cur_sum</th>
      <th style="padding:6px 10px;border:1px solid rgba(255,255,255,0.1)">max_sum</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding:5px 10px;border:1px solid rgba(255,255,255,0.06)">0</td><td style="padding:5px 10px;border:1px solid rgba(255,255,255,0.06);text-align:center">-2</td><td style="padding:5px 10px;border:1px solid rgba(255,255,255,0.06);text-align:center">-2</td><td style="padding:5px 10px;border:1px solid rgba(255,255,255,0.06);text-align:center">-2</td></tr>
    <tr style="background:rgba(255,255,255,0.03)"><td style="padding:5px 10px;border:1px solid rgba(255,255,255,0.06)">1</td><td style="padding:5px 10px;border:1px solid rgba(255,255,255,0.06);text-align:center">1</td><td style="padding:5px 10px;border:1px solid rgba(255,255,255,0.06);text-align:center">1</td><td style="padding:5px 10px;border:1px solid rgba(255,255,255,0.06);text-align:center">1</td></tr>
    <tr><td style="padding:5px 10px;border:1px solid rgba(255,255,255,0.06)">4</td><td style="padding:5px 10px;border:1px solid rgba(255,255,255,0.06);text-align:center">4</td><td style="padding:5px 10px;border:1px solid rgba(255,255,255,0.06);text-align:center">4</td><td style="padding:5px 10px;border:1px solid rgba(255,255,255,0.06);text-align:center">4</td></tr>
    <tr style="background:rgba(34,197,94,0.08)"><td style="padding:5px 10px;border:1px solid rgba(255,255,255,0.06)">6</td><td style="padding:5px 10px;border:1px solid rgba(255,255,255,0.06);text-align:center;color:#22c55e"><strong>1</strong></td><td style="padding:5px 10px;border:1px solid rgba(255,255,255,0.06);text-align:center;color:#22c55e"><strong>6</strong></td><td style="padding:5px 10px;border:1px solid rgba(255,255,255,0.06);text-align:center;color:#22c55e"><strong>6 ✓</strong></td></tr>
  </tbody>
</table>
</div>
<br/>
<div style="background:rgba(239,68,68,0.08);border-left:3px solid #ef4444;padding:10px 14px;border-radius:0 8px 8px 0;margin:8px 0">
  <strong style="color:#ef4444">⚠ Common Mistake:</strong>
  <p style="margin-top:4px">Don't reset <code>cur_sum = 0</code> when it goes negative — reset to <code>nums[i]</code> because a single element can be the answer.</p>
</div>
<pre style="background:#0d1117;color:#e6edf3;padding:12px 16px;border-radius:8px;font-size:12px;overflow-x:auto;margin:8px 0"><code>def maxSubArray(nums):
    cur = max_sum = nums[0]
    for num in nums[1:]:
        cur = max(num, cur + num)   # extend or restart
        max_sum = max(max_sum, cur)
    return max_sum</code></pre>`,
    examples: [{ input: 'nums=[-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'Subarray [4,-1,2,1] has largest sum = 6' }],
    constraints: ['1 ≤ n ≤ 10⁵', '-10⁴ ≤ nums[i] ≤ 10⁴'],
    starterCode: sc('def maxSubArray(nums):\n    pass', 'function maxSubArray(nums) {}', 'public int maxSubArray(int[] nums) { return 0; }', 'int maxSubArray(vector<int>& nums) { return 0; }', 'int maxSubArray(int* nums, int n) { return 0; }'),
    sampleTestCases: [{ input: '[-2,1,-3,4,-1,2,1,-5,4]', expected: '6' }], hiddenTestCases: [{ input: '[1]', expected: '1' }],
    timeComplexity: 'O(n)', spaceComplexity: 'O(1)', submissions: 920, accepted: 640,
  },
  { id: 'd9', title: 'Longest Substring Without Repeating', difficulty: 'Medium', topic: 'Sliding Window', companies: ['Amazon', 'Google', 'Bloomberg'], tags: ['sliding-window', 'hash-map'], description: 'Find the length of the longest substring without repeating characters.', examples: [{ input: 's="abcabcbb"', output: '3', explanation: '"abc"' }], constraints: ['0≤n≤5×10⁴'], starterCode: sc('def lengthOfLongestSubstring(s):\n    pass', 'function lengthOfLongestSubstring(s) {}', 'public int lengthOfLongestSubstring(String s) { return 0; }', 'int lengthOfLongestSubstring(string s) { return 0; }', 'int lengthOfLongestSubstring(char* s) { return 0; }'), sampleTestCases: [{ input: '"abcabcbb"', expected: '3' }], hiddenTestCases: [{ input: '"bbbbb"', expected: '1' }], timeComplexity: 'O(n)', spaceComplexity: 'O(min(n,m))', submissions: 840, accepted: 580 },
  { id: 'd10', title: 'Number of Islands', difficulty: 'Medium', topic: 'Graphs', companies: ['Amazon', 'Google', 'Microsoft'], tags: ['bfs', 'dfs', 'matrix'], description: 'Count the number of islands in a 2D grid.', examples: [{ input: '4×5 grid', output: '1' }], constraints: ['1≤rows,cols≤300'], starterCode: sc('def numIslands(grid):\n    pass', 'function numIslands(grid) {}', 'public int numIslands(char[][] grid) { return 0; }', 'int numIslands(vector<vector<char>>& grid) { return 0; }', 'int numIslands(char** grid, int r, int c) { return 0; }'), sampleTestCases: [{ input: '[["1","1","0"],["0","1","0"]]', expected: '1' }], hiddenTestCases: [{ input: '[["1","0"],["0","1"]]', expected: '2' }], timeComplexity: 'O(m×n)', spaceComplexity: 'O(m×n)', submissions: 780, accepted: 520 },
  { id: 'd11', title: 'Coin Change', difficulty: 'Medium', topic: 'Dynamic Programming', companies: ['Amazon', 'Apple', 'Google'], tags: ['dp', 'bfs'], description: 'Find minimum number of coins to make amount.', examples: [{ input: 'coins=[1,5,11], amount=15', output: '3' }], constraints: ['1≤n≤12'], starterCode: sc('def coinChange(coins, amount):\n    pass', 'function coinChange(coins, amount) {}', 'public int coinChange(int[] coins, int amount) { return -1; }', 'int coinChange(vector<int>& coins, int amount) { return -1; }', 'int coinChange(int* coins, int n, int amount) { return -1; }'), sampleTestCases: [{ input: '[1,5,11], 15', expected: '3' }], hiddenTestCases: [{ input: '[2], 3', expected: '-1' }], timeComplexity: 'O(n×amount)', spaceComplexity: 'O(amount)', submissions: 690, accepted: 440 },
  { id: 'd12', title: 'LRU Cache', difficulty: 'Medium', topic: 'Hashing', companies: ['Amazon', 'Microsoft', 'Oracle'], tags: ['design', 'linked-list', 'hash-map'], description: 'Design an LRU (Least Recently Used) cache.', examples: [{ input: 'LRUCache(2), put(1,1), put(2,2), get(1)', output: '1' }], constraints: ['1≤capacity≤3000'], starterCode: sc('class LRUCache:\n  def __init__(self,cap): pass\n  def get(self,key): pass\n  def put(self,k,v): pass', 'class LRUCache { constructor(cap){} get(k){} put(k,v){} }', 'class LRUCache { public LRUCache(int c){} public int get(int k){return -1;} public void put(int k,int v){} }', 'class LRUCache{public: LRUCache(int c){} int get(int k){return -1;} void put(int k,int v){}};', '// Use doubly-linked list + hashmap in C'), sampleTestCases: [{ input: 'capacity=2', expected: '[1,-1,3,-1]' }], hiddenTestCases: [{ input: 'capacity=1', expected: '[-1]' }], timeComplexity: 'O(1)', spaceComplexity: 'O(capacity)', submissions: 560, accepted: 320 },
  { id: 'd13', title: 'Word Search', difficulty: 'Medium', topic: 'Backtracking', companies: ['Amazon', 'Microsoft', 'Snapchat'], tags: ['backtracking', 'dfs', 'matrix'], description: 'Find if a word exists in a grid by adjacent cells.', examples: [{ input: 'board, word="ABCCED"', output: 'true' }], constraints: ['1≤m,n≤6'], starterCode: sc('def exist(board, word):\n    pass', 'function exist(board, word) {}', 'public boolean exist(char[][] board, String word) { return false; }', 'bool exist(vector<vector<char>>& board, string word) { return false; }', 'bool exist(char** board, int r, int c, char* word) { return false; }'), sampleTestCases: [{ input: '[["A","B"],["C","D"]], "AB"', expected: 'true' }], hiddenTestCases: [{ input: '[["A"]], "B"', expected: 'false' }], timeComplexity: 'O(m×n×4^L)', spaceComplexity: 'O(L)', submissions: 470, accepted: 280 },
  {
    id: 'd14', title: 'Trapping Rain Water', difficulty: 'Hard', topic: 'Two Pointers',
    companies: ['Amazon', 'Google', 'Goldman Sachs'], tags: ['two-pointers', 'dp', 'stack'],
    description: `<p>Given <code style="background:rgba(99,102,241,0.12);padding:2px 6px;border-radius:4px;font-family:monospace">n</code> non-negative integers representing an elevation map where the width of each bar is <code>1</code>, compute how much water it can trap after raining.</p>
<br/>
<p><strong>Visual Representation:</strong></p>
<div style="background:#0d1117;padding:14px 16px;border-radius:8px;font-family:monospace;font-size:13px;line-height:1.8;margin:8px 0;overflow-x:auto">
<div style="color:#60a5fa">height = [0,1,0,2,1,0,1,3,2,1,2,1]</div>
<div style="color:#6b7280;margin-top:8px">Level 3:       <span style="color:#374151">█</span></div>
<div style="color:#6b7280">Level 2:   <span style="color:#374151">█</span> <span style="color:#93c5fd">░░</span> <span style="color:#374151">█ █</span> <span style="color:#374151">█</span> <span style="color:#374151">█</span></div>
<div style="color:#6b7280">Level 1: <span style="color:#374151">█</span> <span style="color:#93c5fd">░</span> <span style="color:#374151">██</span> <span style="color:#93c5fd">░</span> <span style="color:#374151">████</span></div>
<div style="color:#4ade80;margin-top:4px">Water trapped = <strong style="color:#4ade80">6 units</strong> (shown as ░)</div>
</div>
<br/>
<p><strong>Three Approaches:</strong></p>
<div style="display:grid;gap:8px;margin:8px 0">
  <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);padding:10px 12px;border-radius:8px">
    <strong style="color:#ef4444">❌ Brute Force O(n²)</strong> — For each position, scan left & right for max heights
  </div>
  <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);padding:10px 12px;border-radius:8px">
    <strong style="color:#f59e0b">⚡ DP O(n) space</strong> — Precompute leftMax[] and rightMax[] arrays
  </div>
  <div style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);padding:10px 12px;border-radius:8px">
    <strong style="color:#22c55e">✅ Two Pointers O(1) space</strong> — Optimal solution below
  </div>
</div>
<pre style="background:#0d1117;color:#e6edf3;padding:12px 16px;border-radius:8px;font-size:12px;overflow-x:auto;margin:8px 0"><code>def trap(height):
    left, right = 0, len(height) - 1
    left_max = right_max = 0
    water = 0
    while left < right:
        if height[left] < height[right]:
            if height[left] >= left_max:
                left_max = height[left]
            else:
                water += left_max - height[left]
            left += 1
        else:
            if height[right] >= right_max:
                right_max = height[right]
            else:
                water += right_max - height[right]
            right -= 1
    return water</code></pre>`,
    examples: [{ input: 'height=[0,1,0,2,1,0,1,3,2,1,2,1]', output: '6', explanation: '6 units of rain water are trapped' }, { input: 'height=[4,2,0,3,2,5]', output: '9' }],
    constraints: ['n ≥ 0', '0 ≤ height[i] ≤ 10⁴'],
    starterCode: sc('def trap(height):\n    pass', 'function trap(height) {}', 'public int trap(int[] height) { return 0; }', 'int trap(vector<int>& height) { return 0; }', 'int trap(int* height, int n) { return 0; }'),
    sampleTestCases: [{ input: '[0,1,0,2,1,0,1,3,2,1,2,1]', expected: '6' }], hiddenTestCases: [{ input: '[4,2,0,3,2,5]', expected: '9' }],
    timeComplexity: 'O(n)', spaceComplexity: 'O(1)', submissions: 620, accepted: 340,
  },
  { id: 'd15', title: 'Median of Two Sorted Arrays', difficulty: 'Hard', topic: 'Binary Search', companies: ['Google', 'Amazon', 'Apple'], tags: ['binary-search', 'divide-conquer'], description: 'Find the median of two sorted arrays in O(log(m+n)) time.', examples: [{ input: 'nums1=[1,3], nums2=[2]', output: '2.0' }], constraints: ['0≤m,n≤1000'], starterCode: sc('def findMedianSortedArrays(nums1, nums2):\n    pass', 'function findMedianSortedArrays(nums1, nums2) {}', 'public double findMedianSortedArrays(int[] n1, int[] n2) { return 0.0; }', 'double findMedianSortedArrays(vector<int>& n1, vector<int>& n2) { return 0.0; }', 'double findMedianSortedArrays(int* n1, int s1, int* n2, int s2) { return 0.0; }'), sampleTestCases: [{ input: '[1,3],[2]', expected: '2.00000' }], hiddenTestCases: [{ input: '[1,2],[3,4]', expected: '2.50000' }], timeComplexity: 'O(log(min(m,n)))', spaceComplexity: 'O(1)', submissions: 480, accepted: 190 },
]

const SAMPLE_APTITUDE: AptitudeQuestion[] = [
  {
    id: 'a1', topic: 'Quantitative Aptitude', subtopic: 'Percentage', difficulty: 'Easy',
    question: `<p>A shopkeeper <strong>marks up</strong> the price of an article by <span style="color:#6366f1;font-weight:bold">20%</span> and then gives a <span style="color:#ef4444;font-weight:bold">10% discount</span> on the marked price.</p>
<br/>
<div style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);padding:12px 14px;border-radius:8px;font-family:monospace;font-size:13px">
  CP = 100 &nbsp;→&nbsp; MP = 120 &nbsp;→&nbsp; SP = 120 × 0.9 = <strong style="color:#6366f1">108</strong>
</div>
<br/>
<p>What is the <strong>profit percentage</strong> on the cost price?</p>`,
    options: ['8%', '10%', '12%', '6%'], correct: 0,
    explanation: `<p>Let CP = 100. MP = 100 × 1.20 = <strong>120</strong></p>
<p>SP = 120 × 0.90 = <strong>108</strong></p>
<p>Profit = SP - CP = 108 - 100 = <strong>8</strong></p>
<p>Profit% = (8/100) × 100 = <span style="color:#22c55e;font-weight:bold">8%</span></p>
<br/>
<div style="background:rgba(34,197,94,0.08);border-left:3px solid #22c55e;padding:8px 12px;border-radius:0 6px 6px 0">
  <strong>Formula:</strong> Profit% = (1 + markup/100) × (1 - discount/100) - 1 = 1.2 × 0.9 - 1 = 0.08 = 8%
</div>`,
    timeLimit: 60, marks: 1, companyTags: ['TCS', 'Infosys'], attempts: 320, correctRate: 62,
  },
  {
    id: 'a2', topic: 'Quantitative Aptitude', subtopic: 'Time & Work', difficulty: 'Easy',
    question: `<p><strong>A</strong> can complete a piece of work in <span style="color:#6366f1;font-weight:bold">10 days</span>, and <strong>B</strong> can complete the same work in <span style="color:#f59e0b;font-weight:bold">15 days</span>.</p>
<br/>
<div style="overflow-x:auto">
<table style="border-collapse:collapse;font-size:12px;width:100%;margin:4px 0">
  <thead><tr style="background:rgba(99,102,241,0.1)">
    <th style="padding:7px 12px;border:1px solid rgba(255,255,255,0.1);text-align:left">Worker</th>
    <th style="padding:7px 12px;border:1px solid rgba(255,255,255,0.1)">Days</th>
    <th style="padding:7px 12px;border:1px solid rgba(255,255,255,0.1)">Work/Day</th>
  </tr></thead>
  <tbody>
    <tr><td style="padding:6px 12px;border:1px solid rgba(255,255,255,0.07)">A</td><td style="padding:6px 12px;border:1px solid rgba(255,255,255,0.07);text-align:center">10</td><td style="padding:6px 12px;border:1px solid rgba(255,255,255,0.07);text-align:center;color:#6366f1">1/10</td></tr>
    <tr style="background:rgba(255,255,255,0.02)"><td style="padding:6px 12px;border:1px solid rgba(255,255,255,0.07)">B</td><td style="padding:6px 12px;border:1px solid rgba(255,255,255,0.07);text-align:center">15</td><td style="padding:6px 12px;border:1px solid rgba(255,255,255,0.07);text-align:center;color:#f59e0b">1/15</td></tr>
    <tr style="background:rgba(34,197,94,0.06)"><td style="padding:6px 12px;border:1px solid rgba(255,255,255,0.07)"><strong>Together</strong></td><td style="padding:6px 12px;border:1px solid rgba(255,255,255,0.07);text-align:center">?</td><td style="padding:6px 12px;border:1px solid rgba(255,255,255,0.07);text-align:center;color:#22c55e">1/10 + 1/15</td></tr>
  </tbody>
</table>
</div>
<br/>
<p>If they work <strong>together</strong>, in how many days will the work be completed?</p>`,
    options: ['5 days', '6 days', '7 days', '8 days'], correct: 1,
    explanation: 'Combined rate = 1/10 + 1/15 = 3/30 + 2/30 = 5/30 = 1/6. Days = 6.',
    timeLimit: 90, marks: 1, companyTags: ['TCS', 'Wipro'], attempts: 280, correctRate: 71,
  },
  {
    id: 'a3', topic: 'Quantitative Aptitude', subtopic: 'Speed & Distance', difficulty: 'Medium',
    question: `<p>Two trains are moving on <strong>parallel tracks</strong>:</p>
<ul style="margin:8px 0 8px 16px;line-height:2">
  <li>Train A: Length = <code style="background:rgba(99,102,241,0.12);padding:2px 6px;border-radius:4px">100 m</code>, Speed = <code style="background:rgba(99,102,241,0.12);padding:2px 6px;border-radius:4px">60 km/h</code></li>
  <li>Train B: Length = <code style="background:rgba(245,158,11,0.12);padding:2px 6px;border-radius:4px">150 m</code>, Speed = <code style="background:rgba(245,158,11,0.12);padding:2px 6px;border-radius:4px">90 km/h</code></li>
</ul>
<div style="background:rgba(239,68,68,0.08);border-left:3px solid #ef4444;padding:10px 14px;border-radius:0 8px 8px 0;margin:8px 0">
  <strong style="color:#ef4444">Condition:</strong> The trains move in the <strong>same direction</strong>.
  <br/>Total distance to cover = 100 + 150 = <strong>250 m</strong>
  <br/>Relative Speed = 90 - 60 = <strong>30 km/h = 25/3 m/s</strong>
</div>
<p>How many seconds does it take for them to completely cross each other?</p>`,
    options: ['30s', '36s', '42s', '50s'], correct: 0,
    explanation: 'Relative speed (same dir) = 90-60 = 30 km/h = 30×(5/18) = 25/3 m/s. Time = 250 ÷ (25/3) = 250 × 3/25 = 30s',
    timeLimit: 120, marks: 2, companyTags: ['Wipro', 'Cognizant'], attempts: 190, correctRate: 44,
  },
  {
    id: 'a4', topic: 'Quantitative Aptitude', subtopic: 'Probability', difficulty: 'Medium',
    question: `<p>A bag contains the following coloured balls:</p>
<div style="display:flex;gap:12px;margin:12px 0;flex-wrap:wrap">
  <div style="background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.3);padding:10px 16px;border-radius:10px;text-align:center">
    <div style="font-size:20px">🔴</div>
    <div style="font-weight:bold;color:#ef4444">3 Red</div>
  </div>
  <div style="background:rgba(59,130,246,0.12);border:1px solid rgba(59,130,246,0.3);padding:10px 16px;border-radius:10px;text-align:center">
    <div style="font-size:20px">🔵</div>
    <div style="font-weight:bold;color:#3b82f6">4 Blue</div>
  </div>
  <div style="background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.3);padding:10px 16px;border-radius:10px;text-align:center">
    <div style="font-size:20px">🟢</div>
    <div style="font-weight:bold;color:#22c55e">5 Green</div>
  </div>
</div>
<p>One ball is drawn at random. What is the probability that it is <strong>red or blue</strong>?</p>`,
    options: ['7/12', '1/2', '3/4', '5/12'], correct: 0,
    explanation: 'P(red or blue) = (3+4)/12 = 7/12. Total = 3+4+5 = 12 balls.',
    timeLimit: 60, marks: 1, companyTags: ['Amazon', 'Google'], attempts: 240, correctRate: 68,
  },
  { id: 'a5', topic: 'Quantitative Aptitude', subtopic: 'Number System', difficulty: 'Easy', question: 'Which is the largest prime number less than 50?', options: ['47', '43', '41', '49'], correct: 0, explanation: '47 is prime; 49=7×7', timeLimit: 45, marks: 1, companyTags: ['TCS'], attempts: 410, correctRate: 82 },
  {
    id: 'a6', topic: 'Quantitative Aptitude', subtopic: 'Profit & Loss', difficulty: 'Easy',
    question: `<p>A merchant buys an item at <strong>Cost Price = ₹500</strong> and sells it at <strong>Selling Price = ₹625</strong>.</p>
<div style="display:flex;gap:12px;margin:10px 0;flex-wrap:wrap">
  <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25);padding:10px 16px;border-radius:8px">
    <div style="font-size:11px;opacity:0.7;margin-bottom:2px">COST PRICE</div>
    <div style="font-size:20px;font-weight:bold;color:#ef4444">₹500</div>
  </div>
  <div style="display:flex;align-items:center;font-size:18px;color:rgba(255,255,255,0.4)">→</div>
  <div style="background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.25);padding:10px 16px;border-radius:8px">
    <div style="font-size:11px;opacity:0.7;margin-bottom:2px">SELLING PRICE</div>
    <div style="font-size:20px;font-weight:bold;color:#22c55e">₹625</div>
  </div>
  <div style="display:flex;align-items:center;font-size:18px;color:rgba(255,255,255,0.4)">=</div>
  <div style="background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.25);padding:10px 16px;border-radius:8px">
    <div style="font-size:11px;opacity:0.7;margin-bottom:2px">PROFIT</div>
    <div style="font-size:20px;font-weight:bold;color:#6366f1">₹125</div>
  </div>
</div>
<p>What is the <strong>profit percentage</strong>?</p>`,
    options: ['20%', '25%', '15%', '30%'], correct: 1,
    explanation: 'Profit = 625-500 = ₹125. Profit% = (125/500) × 100 = <strong>25%</strong>',
    timeLimit: 60, marks: 1, companyTags: ['Infosys', 'TCS'], attempts: 350, correctRate: 78,
  },
  {
    id: 'a7', topic: 'Logical Reasoning', subtopic: 'Syllogisms', difficulty: 'Easy',
    question: `<p><strong>Given Statements:</strong></p>
<div style="margin:10px 0;space-y:4px">
  <div style="background:rgba(99,102,241,0.08);border-left:3px solid #6366f1;padding:8px 14px;border-radius:0 6px 6px 0;margin-bottom:6px">
    <strong>Statement 1:</strong> All cats are animals.
  </div>
  <div style="background:rgba(245,158,11,0.08);border-left:3px solid #f59e0b;padding:8px 14px;border-radius:0 6px 6px 0">
    <strong>Statement 2:</strong> Some animals are dogs.
  </div>
</div>
<br/>
<p><strong>Conclusion:</strong> "Some cats are dogs." — Is this <strong>True, False, or Cannot be determined</strong>?</p>
<p style="font-size:12px;color:rgba(255,255,255,0.5);margin-top:8px">Hint: Draw a Venn diagram to visualize the sets.</p>`,
    options: ['True', 'False', 'Maybe', 'Cannot determine'], correct: 3,
    explanation: 'The statements do not establish any link between cats and dogs. We cannot conclude cats are dogs.',
    timeLimit: 60, marks: 1, companyTags: ['TCS', 'Wipro'], attempts: 290, correctRate: 55,
  },
  {
    id: 'a8', topic: 'Logical Reasoning', subtopic: 'Blood Relations', difficulty: 'Easy',
    question: `<p>Analyze the following family relationships:</p>
<div style="font-family:monospace;font-size:13px;background:rgba(30,30,60,0.5);padding:14px;border-radius:8px;margin:10px 0;border:1px solid rgba(99,102,241,0.2)">
  A <span style="color:#f59e0b">is father of</span> B<br/>
  A <span style="color:#f59e0b">is father of</span> C<br/>
  C <span style="color:#6366f1">is sister of</span> A &nbsp;← <span style="color:#ef4444">Wait, re-read carefully!</span><br/>
  <span style="color:rgba(255,255,255,0.4)">—————————————————</span><br/>
  C <span style="color:#22c55e">is sister of</span> A &nbsp;(A is brother of C)
</div>
<p>How is <strong>C related to B</strong>?</p>`,
    options: ['Aunt', 'Mother', 'Sister', 'Grandmother'], correct: 0,
    explanation: "C is A's sister. A is B's father. So C is B's paternal aunt.",
    timeLimit: 60, marks: 1, companyTags: ['TCS', 'Cognizant'], attempts: 380, correctRate: 72,
  },
  {
    id: 'a9', topic: 'Logical Reasoning', subtopic: 'Series Completion', difficulty: 'Medium',
    question: `<p>Identify the pattern and find the <strong>next number</strong> in the series:</p>
<div style="display:flex;align-items:center;gap:8px;margin:14px 0;flex-wrap:wrap">
  ${['2','6','12','20','30','?'].map((n,i) => `<div style="background:rgba(99,102,241,${n==='?'?'0.2':'0.1'});border:1px solid rgba(99,102,241,${n==='?'?'0.5':'0.3'});padding:10px 14px;border-radius:8px;font-size:18px;font-weight:bold;color:${n==='?'?'#6366f1':'inherit'}">${n}</div>${i<5?'<span style="color:rgba(255,255,255,0.3)">→</span>':''}`).join('')}
</div>
<div style="background:rgba(30,30,60,0.5);padding:10px 14px;border-radius:8px;font-family:monospace;font-size:13px;border:1px solid rgba(255,255,255,0.06)">
  Difference: <span style="color:#f59e0b">+4</span> → <span style="color:#f59e0b">+6</span> → <span style="color:#f59e0b">+8</span> → <span style="color:#f59e0b">+10</span> → <span style="color:#6366f1">+?</span>
</div>`,
    options: ['42', '40', '44', '38'], correct: 0,
    explanation: 'Differences increase by 2 each time: +4,+6,+8,+10,+12. Next = 30+12 = 42.',
    timeLimit: 90, marks: 2, companyTags: ['Wipro', 'Infosys'], attempts: 220, correctRate: 61,
  },
  {
    id: 'a10', topic: 'Logical Reasoning', subtopic: 'Coding-Decoding', difficulty: 'Easy',
    question: `<p>In a certain code, <strong>each letter is assigned its alphabet position number</strong>:</p>
<div style="overflow-x:auto;margin:10px 0">
<table style="border-collapse:collapse;font-size:12px;width:100%;font-family:monospace">
  <thead><tr style="background:rgba(99,102,241,0.1)">
    <th style="padding:7px 10px;border:1px solid rgba(255,255,255,0.08)">Word</th>
    <th style="padding:7px 10px;border:1px solid rgba(255,255,255,0.08)">Calculation</th>
    <th style="padding:7px 10px;border:1px solid rgba(255,255,255,0.08)">Code</th>
  </tr></thead>
  <tbody>
    <tr><td style="padding:6px 10px;border:1px solid rgba(255,255,255,0.05)">APPLE</td><td style="padding:6px 10px;border:1px solid rgba(255,255,255,0.05);color:#f59e0b">1+16+16+12+5</td><td style="padding:6px 10px;border:1px solid rgba(255,255,255,0.05);color:#22c55e;font-weight:bold">50</td></tr>
    <tr style="background:rgba(255,255,255,0.02)"><td style="padding:6px 10px;border:1px solid rgba(255,255,255,0.05)">BALL</td><td style="padding:6px 10px;border:1px solid rgba(255,255,255,0.05);color:#f59e0b">2+1+12+12+1</td><td style="padding:6px 10px;border:1px solid rgba(255,255,255,0.05);color:#22c55e;font-weight:bold">28</td></tr>
    <tr style="background:rgba(99,102,241,0.05)"><td style="padding:6px 10px;border:1px solid rgba(255,255,255,0.05)"><strong>CAT</strong></td><td style="padding:6px 10px;border:1px solid rgba(255,255,255,0.05);color:#6366f1">3+1+20 = ?</td><td style="padding:6px 10px;border:1px solid rgba(255,255,255,0.05);color:#6366f1;font-weight:bold">?</td></tr>
  </tbody>
</table>
</div>`,
    options: ['24', '22', '26', '28'], correct: 0,
    explanation: 'C=3, A=1, T=20. CAT = 3+1+20 = 24.',
    timeLimit: 75, marks: 1, companyTags: ['TCS'], attempts: 310, correctRate: 59,
  },
  {
    id: 'a11', topic: 'Verbal Ability', subtopic: 'Synonyms & Antonyms', difficulty: 'Easy',
    question: `<p>Find the <strong>ANTONYM</strong> (opposite meaning) of the word:</p>
<div style="text-align:center;margin:16px 0">
  <span style="font-size:28px;font-weight:900;letter-spacing:4px;background:linear-gradient(135deg,#6366f1,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent">BENEVOLENT</span>
</div>
<div style="background:rgba(30,30,60,0.5);border:1px solid rgba(99,102,241,0.15);padding:10px 14px;border-radius:8px;font-size:13px">
  <strong>Definition:</strong> <em>Benevolent</em> — well-meaning, kind-hearted, charitable, generous in spirit.
  <br/><span style="color:rgba(255,255,255,0.5);font-size:12px;margin-top:4px;display:block">Example: "The benevolent king donated to the poor."</span>
</div>`,
    options: ['Malevolent', 'Generous', 'Kind', 'Helpful'], correct: 0,
    explanation: '"Malevolent" = having evil intentions. Antonym of benevolent (kind/well-meaning).',
    timeLimit: 45, marks: 1, companyTags: ['Infosys', 'Amazon'], attempts: 260, correctRate: 75,
  },
  {
    id: 'a12', topic: 'Verbal Ability', subtopic: 'Grammar', difficulty: 'Easy',
    question: `<p>Choose the grammatically <strong>correct verb form</strong> to fill in the blank:</p>
<div style="background:rgba(30,30,60,0.5);border:1px solid rgba(99,102,241,0.2);padding:16px 20px;border-radius:8px;margin:12px 0;text-align:center;font-size:18px">
  "Neither of them <span style="border-bottom:2px dashed #6366f1;padding:0 12px;color:#6366f1">____</span> correct."
</div>
<div style="background:rgba(245,158,11,0.07);border-left:3px solid #f59e0b;padding:8px 14px;border-radius:0 6px 6px 0;font-size:12px">
  <strong>Grammar Rule:</strong> Indefinite pronouns like <em>neither, either, everyone, nobody</em> take a <strong>singular verb</strong>.
</div>`,
    options: ['are', 'is', 'were', 'have been'], correct: 1,
    explanation: '"Neither" is singular → takes singular verb "is". "Neither of them is correct."',
    timeLimit: 45, marks: 1, companyTags: ['TCS', 'Wipro'], attempts: 340, correctRate: 66,
  },
  {
    id: 'a13', topic: 'Data Interpretation', subtopic: 'Pie Chart', difficulty: 'Medium',
    question: `<p>The following pie chart shows the <strong>sales distribution</strong> of a retail store:</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0">
  ${[['Electronics','30%','#6366f1'],['Clothing','25%','#f59e0b'],['Food','20%','#22c55e'],['Others','25%','#ec4899']].map(([cat,pct,col]) => `<div style="background:rgba(30,30,60,0.5);border:1px solid ${col}33;border-left:3px solid ${col};padding:8px 12px;border-radius:0 6px 6px 0;display:flex;justify-content:space-between;align-items:center"><span style="font-size:13px">${cat}</span><span style="font-weight:bold;color:${col}">${pct}</span></div>`).join('')}
</div>
<div style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);padding:10px 14px;border-radius:8px;font-size:13px">
  <strong>Total Sales = ₹2,00,000</strong>
</div>
<br/>
<p>What is the <strong>sales value for Electronics</strong>?</p>`,
    options: ['₹60,000', '₹50,000', '₹40,000', '₹70,000'], correct: 0,
    explanation: 'Electronics = 30% of 2,00,000 = 0.30 × 2,00,000 = ₹60,000.',
    timeLimit: 90, marks: 2, companyTags: ['Cognizant', 'Capgemini'], attempts: 180, correctRate: 71,
  },
  {
    id: 'a14', topic: 'Quantitative Aptitude', subtopic: 'Simple & Compound Interest', difficulty: 'Medium',
    question: `<p>Compare <strong>Simple Interest (SI)</strong> vs <strong>Compound Interest (CI)</strong>:</p>
<div style="overflow-x:auto;margin:10px 0">
<table style="border-collapse:collapse;font-size:12px;width:100%">
  <thead><tr style="background:rgba(99,102,241,0.1)">
    <th style="padding:7px 12px;border:1px solid rgba(255,255,255,0.08);text-align:left">Parameter</th>
    <th style="padding:7px 12px;border:1px solid rgba(255,255,255,0.08);text-align:center;color:#f59e0b">SI</th>
    <th style="padding:7px 12px;border:1px solid rgba(255,255,255,0.08);text-align:center;color:#22c55e">CI</th>
  </tr></thead>
  <tbody>
    <tr><td style="padding:6px 12px;border:1px solid rgba(255,255,255,0.05)">Principal</td><td style="padding:6px 12px;border:1px solid rgba(255,255,255,0.05);text-align:center">₹1,000</td><td style="padding:6px 12px;border:1px solid rgba(255,255,255,0.05);text-align:center">₹1,000</td></tr>
    <tr style="background:rgba(255,255,255,0.02)"><td style="padding:6px 12px;border:1px solid rgba(255,255,255,0.05)">Rate</td><td style="padding:6px 12px;border:1px solid rgba(255,255,255,0.05);text-align:center">10% p.a.</td><td style="padding:6px 12px;border:1px solid rgba(255,255,255,0.05);text-align:center">10% p.a.</td></tr>
    <tr><td style="padding:6px 12px;border:1px solid rgba(255,255,255,0.05)">Time</td><td style="padding:6px 12px;border:1px solid rgba(255,255,255,0.05);text-align:center">2 years</td><td style="padding:6px 12px;border:1px solid rgba(255,255,255,0.05);text-align:center">2 years</td></tr>
    <tr style="background:rgba(99,102,241,0.05)"><td style="padding:6px 12px;border:1px solid rgba(255,255,255,0.05)"><strong>Interest</strong></td><td style="padding:6px 12px;border:1px solid rgba(255,255,255,0.05);text-align:center;color:#f59e0b">₹200</td><td style="padding:6px 12px;border:1px solid rgba(255,255,255,0.05);text-align:center;color:#22c55e"><strong>₹?</strong></td></tr>
  </tbody>
</table>
</div>
<p>What is the <strong>Compound Interest</strong> for the given values?</p>`,
    options: ['₹210', '₹200', '₹220', '₹230'], correct: 0,
    explanation: 'CI = P(1+r)ⁿ - P = 1000(1.1)² - 1000 = 1210 - 1000 = ₹210.',
    timeLimit: 90, marks: 2, companyTags: ['TCS', 'Infosys'], attempts: 260, correctRate: 58,
  },
  {
    id: 'a15', topic: 'Quantitative Aptitude', subtopic: 'Ratio & Proportion', difficulty: 'Easy',
    question: `<p>Given two ratios:</p>
<div style="font-family:monospace;font-size:15px;background:rgba(30,30,60,0.5);padding:14px 20px;border-radius:8px;margin:10px 0;border:1px solid rgba(99,102,241,0.2)">
  A : B = <span style="color:#6366f1">3 : 4</span><br/>
  B : C = <span style="color:#f59e0b">2 : 3</span><br/>
  <span style="color:rgba(255,255,255,0.3)">━━━━━━━━━━━━</span><br/>
  A : B : C = <span style="color:#22c55e">?</span>
</div>
<div style="background:rgba(245,158,11,0.07);border-left:3px solid #f59e0b;padding:8px 14px;border-radius:0 6px 6px 0;font-size:12px">
  <strong>Tip:</strong> Make B's value equal in both ratios by finding LCM of B values (4 and 2 → LCM = 4).
</div>`,
    options: ['3:4:6', '6:8:12', '6:4:3', '3:6:4'], correct: 0,
    explanation: 'B LCM=4: A:B=3:4 stays. B:C=2:3 → multiply by 2 → 4:6. So A:B:C = 3:4:6.',
    timeLimit: 75, marks: 1, companyTags: ['Wipro'], attempts: 295, correctRate: 64,
  },
  {
    id: 'a16', topic: 'Logical Reasoning', subtopic: 'Direction Sense', difficulty: 'Easy',
    question: `<p>Ram starts from point <strong>O</strong> and travels as follows:</p>
<div style="font-family:monospace;background:rgba(30,30,60,0.5);padding:14px;border-radius:8px;margin:10px 0;border:1px solid rgba(99,102,241,0.15);font-size:13px;line-height:2">
  <span style="color:#22c55e">↑ North 5 km</span> &nbsp;→ Point A<br/>
  <span style="color:#6366f1">→ Right (East) 3 km</span> &nbsp;→ Point B<br/>
  <span style="color:#ef4444">↓ Right (South) 5 km</span> &nbsp;→ Point C<br/><br/>
  O ←—3km—→ C<br/>
  Distance O to C = <span style="color:#f59e0b">?</span>
</div>
<p>What is Ram's <strong>distance from the starting point</strong> O?</p>`,
    options: ['3km', '5km', '8km', '0km'], correct: 0,
    explanation: 'Ram forms a U-shape. North 5km, East 3km, South 5km. Back at same horizontal line, but 3km East.',
    timeLimit: 90, marks: 1, companyTags: ['TCS'], attempts: 230, correctRate: 61,
  },
  {
    id: 'a17', topic: 'Technical Aptitude', subtopic: 'OOP Concepts', difficulty: 'Medium',
    question: `<p>Consider the following Java code snippet:</p>
<pre style="background:rgba(15,15,30,0.8);border:1px solid rgba(99,102,241,0.2);padding:14px;border-radius:8px;font-size:13px;overflow-x:auto;margin:10px 0"><code><span style="color:#c792ea">class</span> <span style="color:#82aaff">Calculator</span> {
  <span style="color:#89ddff">int</span> <span style="color:#82aaff">add</span>(<span style="color:#89ddff">int</span> a, <span style="color:#89ddff">int</span> b) { <span style="color:#c792ea">return</span> a + b; }
  <span style="color:#89ddff">double</span> <span style="color:#82aaff">add</span>(<span style="color:#89ddff">double</span> a, <span style="color:#89ddff">double</span> b) { <span style="color:#c792ea">return</span> a + b; }
  <span style="color:#89ddff">int</span> <span style="color:#82aaff">add</span>(<span style="color:#89ddff">int</span> a, <span style="color:#89ddff">int</span> b, <span style="color:#89ddff">int</span> c) { <span style="color:#c792ea">return</span> a+b+c; }
}</code></pre>
<p>Which OOP concept is demonstrated here — <strong>same method name, different parameters</strong>?</p>`,
    options: ['Polymorphism', 'Encapsulation', 'Inheritance', 'Abstraction'], correct: 0,
    explanation: 'Method overloading (compile-time polymorphism). Same name, different signatures.',
    timeLimit: 60, marks: 1, companyTags: ['Amazon', 'Google', 'Microsoft'], attempts: 420, correctRate: 79,
  },
  {
    id: 'a18', topic: 'Technical Aptitude', subtopic: 'Computer Science Basics', difficulty: 'Easy',
    question: `<p>Binary Search works by <strong>repeatedly halving the search space</strong>. Trace through an example:</p>
<div style="font-family:monospace;font-size:12px;background:rgba(15,15,30,0.8);border:1px solid rgba(34,197,94,0.2);padding:14px;border-radius:8px;margin:10px 0;line-height:1.8">
  Array: [1, 3, 5, 7, <span style="color:#22c55e;font-weight:bold">9</span>, 11, 13, 15] &nbsp; Target = 9<br/>
  Step 1: mid=7, arr[3]=7 &lt; 9 → <span style="color:#f59e0b">search right half</span><br/>
  Step 2: mid=11, arr[5]=11 &gt; 9 → <span style="color:#f59e0b">search left half</span><br/>
  Step 3: mid=9, arr[4]=9 = 9 → <span style="color:#22c55e">FOUND! ✓</span><br/>
  <span style="color:rgba(255,255,255,0.4)">3 steps for n=8 elements → log₂(8) = 3</span>
</div>
<p>What is the <strong>time complexity</strong> of Binary Search?</p>`,
    options: ['O(log n)', 'O(n)', 'O(n log n)', 'O(1)'], correct: 0,
    explanation: 'Each step halves the search space. n → n/2 → n/4 → ... → 1 takes log₂(n) steps.',
    timeLimit: 45, marks: 1, companyTags: ['Google', 'Amazon', 'TCS'], attempts: 510, correctRate: 88,
  },
  {
    id: 'a19', topic: 'Quantitative Aptitude', subtopic: 'Permutation & Combination', difficulty: 'Hard',
    question: `<p>You have <strong>5 books</strong> to arrange on a shelf:</p>
<div style="display:flex;gap:6px;margin:10px 0;flex-wrap:wrap">
  ${[['📘','A'],['📗','B'],['📕','C'],['📙','D'],['📒','E']].map(([em,n]) => `<div style="background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.3);padding:8px 10px;border-radius:6px;text-align:center"><div style="font-size:18px">${em}</div><div style="font-size:11px;opacity:0.7">${n}</div></div>`).join('')}
</div>
<div style="background:rgba(239,68,68,0.08);border-left:3px solid #ef4444;padding:10px 14px;border-radius:0 6px 6px 0;margin:8px 0">
  <strong>Constraint:</strong> Books <strong>A</strong> and <strong>B</strong> must <strong>always stay together</strong>.
</div>
<p>In how many ways can all 5 books be arranged?</p>`,
    options: ['48', '24', '96', '120'], correct: 0,
    explanation: 'Treat A+B as one unit → 4 units → 4! = 24. A,B can swap internally → ×2. Total = 48.',
    timeLimit: 120, marks: 3, companyTags: ['Google', 'Amazon'], attempts: 140, correctRate: 38,
  },
  {
    id: 'a20', topic: 'Data Interpretation', subtopic: 'Bar Graph', difficulty: 'Easy',
    question: `<p>The bar graph shows <strong>annual revenue</strong> of 4 companies (in Lakhs ₹):</p>
<div style="margin:14px 0">
  ${[['A','50','#6366f1'],['B','80','#22c55e'],['C','60','#f59e0b'],['D','70','#ec4899']].map(([co,val,col]) => `
    <div style="display:flex;align-items:center;gap:10px;margin:6px 0">
      <div style="width:20px;font-weight:bold;font-size:13px">${co}</div>
      <div style="flex:1;background:rgba(255,255,255,0.05);border-radius:4px;overflow:hidden">
        <div style="width:${parseInt(val)}%;background:${col};height:24px;border-radius:4px;display:flex;align-items:center;padding-left:8px;font-size:12px;color:white;font-weight:bold">₹${val}L</div>
      </div>
    </div>`).join('')}
</div>
<p>Which company has the <strong>highest revenue</strong>?</p>`,
    options: ['B', 'A', 'C', 'D'], correct: 0,
    explanation: 'B = ₹80L is the highest. A=50, C=60, D=70.',
    timeLimit: 45, marks: 1, companyTags: ['Infosys', 'TCS'], attempts: 380, correctRate: 91,
  },
  {
    id: 'a21', topic: 'Verbal Ability', subtopic: 'Para Jumbles', difficulty: 'Medium',
    question: `<p>Arrange the following <strong>jumbled sentences</strong> in logical order:</p>
<div style="margin:10px 0;space-y:6px">
  ${[['P','He runs 5km every morning.','#6366f1'],['Q','As a result, he is very healthy.','#22c55e'],['R','He eats a balanced diet with plenty of vegetables.','#f59e0b'],['S','He sleeps for 8 hours every night.','#ec4899']].map(([l,s,c]) => `<div style="background:rgba(30,30,60,0.5);border-left:3px solid ${c};padding:8px 14px;border-radius:0 6px 6px 0;margin-bottom:6px;font-size:13px"><strong style="color:${c}">${l}:</strong> ${s}</div>`).join('')}
</div>
<p>What is the correct <strong>logical sequence</strong>?</p>`,
    options: ['R → S → P → Q', 'P → R → Q → S', 'R → S → Q → P', 'Q → R → S → P'], correct: 0,
    explanation: 'Logical flow: Diet (R) → Sleep (S) → Exercise (P) → Health outcome (Q). RSPQ.',
    timeLimit: 90, marks: 2, companyTags: ['Wipro'], attempts: 170, correctRate: 42,
  },
  {
    id: 'a22', topic: 'Quantitative Aptitude', subtopic: 'Time & Work', difficulty: 'Medium',
    question: `<p>Applying the <strong>Man-Day concept</strong>:</p>
<div style="font-family:monospace;background:rgba(15,15,30,0.8);padding:14px;border-radius:8px;margin:10px 0;border:1px solid rgba(99,102,241,0.15);font-size:13px;line-height:1.9">
  Workers × Days = <span style="color:#f59e0b">Total Work (Man-days)</span><br/>
  <span style="color:#6366f1">10 workers × 12 days = 120 man-days</span><br/>
  <span style="color:rgba(255,255,255,0.4)">━━━━━━━━━━━━━━━━━━━━━━━</span><br/>
  ? workers × 8 days = 120 man-days<br/>
  ? workers = <span style="color:#22c55e">120 ÷ 8 = ?</span>
</div>
<p>How many workers are needed to complete the same work in <strong>8 days</strong>?</p>`,
    options: ['15', '18', '12', '20'], correct: 0,
    explanation: 'Total work = 10×12 = 120 man-days. Workers needed = 120/8 = 15.',
    timeLimit: 75, marks: 2, companyTags: ['TCS', 'Cognizant'], attempts: 245, correctRate: 67,
  },
  {
    id: 'a23', topic: 'Logical Reasoning', subtopic: 'Puzzles', difficulty: 'Hard',
    question: `<p>Map out the <strong>family tree</strong> from given clues:</p>
<div style="font-family:monospace;font-size:12px;background:rgba(15,15,30,0.8);padding:14px;border-radius:8px;margin:10px 0;border:1px solid rgba(99,102,241,0.15);line-height:1.9">
  <span style="color:#6366f1">A</span> is father of B and C<br/>
  <span style="color:#ec4899">D</span> is mother of B &nbsp;<span style="color:rgba(255,255,255,0.4)">(so D is A's wife)</span><br/>
  <span style="color:#f59e0b">E</span> is brother of C<br/>
  <span style="color:#22c55e">F</span> is daughter of D &nbsp;<span style="color:rgba(255,255,255,0.4)">(D=A's wife → F is also A's child)</span>
</div>
<p>How many children does <strong>A</strong> have in total?</p>`,
    options: ['3', '4', '2', '5'], correct: 0,
    explanation: "A's children: B (stated), C (stated), F (D's daughter & D is A's wife). E is brother of C so also A's child. Total = 4? Let's re-check: B, C, E, F → but E is listed as brother of C. A's children = B, C, F (and E if E is also A's son) = 3 confirmed.",
    timeLimit: 150, marks: 3, companyTags: ['Amazon'], attempts: 120, correctRate: 35,
  },
  {
    id: 'a24', topic: 'Technical Aptitude', subtopic: 'DBMS', difficulty: 'Medium',
    question: `<p>Consider this SQL query structure:</p>
<pre style="background:rgba(15,15,30,0.8);border:1px solid rgba(99,102,241,0.2);padding:14px;border-radius:8px;font-size:13px;overflow-x:auto;margin:10px 0;line-height:1.8"><code><span style="color:#c792ea">SELECT</span> department, <span style="color:#82aaff">COUNT</span>(*) as emp_count, <span style="color:#82aaff">AVG</span>(salary) as avg_sal
<span style="color:#c792ea">FROM</span> employees
<span style="color:#c792ea">WHERE</span> salary &gt; <span style="color:#f78c6c">30000</span>
<span style="color:#c792ea">GROUP BY</span> department
<span style="color:#89ddff">____</span> avg_sal &gt; <span style="color:#f78c6c">50000</span>  <span style="color:rgba(255,255,255,0.4)">← filter on grouped result</span>
<span style="color:#c792ea">ORDER BY</span> emp_count <span style="color:#c792ea">DESC</span>;</code></pre>
<p>Which clause goes in the blank to <strong>filter aggregated/grouped results</strong>?</p>`,
    options: ['HAVING', 'WHERE', 'GROUP BY', 'ORDER BY'], correct: 0,
    explanation: 'HAVING filters after GROUP BY aggregation. WHERE filters individual rows before grouping.',
    timeLimit: 45, marks: 1, companyTags: ['TCS', 'Oracle', 'IBM'], attempts: 390, correctRate: 72,
  },
  {
    id: 'a25', topic: 'Technical Aptitude', subtopic: 'Networking', difficulty: 'Easy',
    question: `<p>In web communications, you see this in your browser:</p>
<div style="background:rgba(15,15,30,0.8);border:1px solid rgba(34,197,94,0.2);padding:14px;border-radius:8px;margin:10px 0;font-family:monospace">
  <div style="display:flex;align-items:center;gap:8px">
    <span style="color:#22c55e;font-size:16px">🔒</span>
    <span style="color:#22c55e;font-weight:bold">https</span><span style="color:rgba(255,255,255,0.4)">://www.example.com/page</span>
  </div>
  <div style="margin-top:8px;font-size:11px;color:rgba(255,255,255,0.4)">Protocol &nbsp;&nbsp;└── HyperText ??? Protocol</div>
</div>
<p>What does <strong>HTTP</strong> stand for?</p>`,
    options: ['HyperText Transfer Protocol', 'High Text Transfer Protocol', 'HyperText Transmission Protocol', 'Host Transfer Text Protocol'], correct: 0,
    explanation: 'HTTP = HyperText Transfer Protocol. It is the foundation of data communication on the web.',
    timeLimit: 30, marks: 1, companyTags: ['TCS', 'Infosys', 'Wipro'], attempts: 580, correctRate: 94,
  },
  {
    id: 'a26', topic: 'Verbal Ability', subtopic: 'Reading Comprehension', difficulty: 'Medium',
    question: `<p>Read the famous quote and identify the <strong>figure of speech</strong>:</p>
<div style="text-align:center;margin:16px 0;padding:16px;background:rgba(99,102,241,0.06);border:1px solid rgba(99,102,241,0.15);border-radius:10px">
  <span style="font-size:20px;font-style:italic;font-weight:600">"The pen is mightier than the sword."</span>
  <div style="font-size:12px;opacity:0.5;margin-top:6px">— Edward Bulwer-Lytton</div>
</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;margin:8px 0">
  <div style="background:rgba(30,30,60,0.5);padding:8px;border-radius:6px"><strong>Simile</strong>: compares using "like/as"<br/><em>e.g., fast as a rocket</em></div>
  <div style="background:rgba(30,30,60,0.5);padding:8px;border-radius:6px"><strong>Metaphor</strong>: direct comparison<br/><em>e.g., life is a journey</em></div>
  <div style="background:rgba(30,30,60,0.5);padding:8px;border-radius:6px"><strong>Hyperbole</strong>: extreme exaggeration<br/><em>e.g., I'm dying of hunger</em></div>
  <div style="background:rgba(30,30,60,0.5);padding:8px;border-radius:6px"><strong>Personification</strong>: gives human traits<br/><em>e.g., the wind whispered</em></div>
</div>`,
    options: ['Metaphor', 'Simile', 'Hyperbole', 'Personification'], correct: 0,
    explanation: 'Pen is compared to sword directly (no "like/as") → Metaphor. Writing vs physical force.',
    timeLimit: 60, marks: 2, companyTags: ['Infosys'], attempts: 210, correctRate: 61,
  },
  {
    id: 'a27', topic: 'Quantitative Aptitude', subtopic: 'Number System', difficulty: 'Easy',
    question: `<p>Find the <strong>LCM</strong> (Least Common Multiple) of 12 and 18:</p>
<div style="font-family:monospace;font-size:13px;background:rgba(15,15,30,0.8);padding:14px;border-radius:8px;margin:10px 0;border:1px solid rgba(99,102,241,0.15);line-height:1.9">
  12 = 2² × <span style="color:#6366f1">3</span><br/>
  18 = 2 × <span style="color:#6366f1">3²</span><br/>
  <span style="color:rgba(255,255,255,0.3)">━━━━━━━━━━━</span><br/>
  LCM = 2<span style="font-size:10px;vertical-align:super">²</span> × 3<span style="font-size:10px;vertical-align:super">²</span> = 4 × 9 = <span style="color:#22c55e;font-weight:bold">?</span>
</div>
<p>What is <strong>LCM(12, 18)</strong>?</p>`,
    options: ['36', '24', '6', '72'], correct: 0,
    explanation: 'LCM = product of highest powers of all prime factors = 2² × 3² = 4 × 9 = 36.',
    timeLimit: 45, marks: 1, companyTags: ['TCS', 'Wipro'], attempts: 460, correctRate: 85,
  },
  {
    id: 'a28', topic: 'Logical Reasoning', subtopic: 'Seating Arrangement', difficulty: 'Hard',
    question: `<p>5 people <strong>A, B, C, D, E</strong> sit in a straight row. Apply constraints one by one:</p>
<div style="margin:10px 0;space-y:6px">
  ${[
    ['1','C sits at one end','#6366f1'],
    ['2','D sits between E and B','#f59e0b'],
    ['3','A is NOT adjacent to B','#ef4444'],
  ].map(([n,c,col]) => `<div style="background:rgba(30,30,60,0.5);border-left:3px solid ${col};padding:8px 14px;border-radius:0 6px 6px 0;margin-bottom:6px;font-size:13px"><strong style="color:${col}">${n}.</strong> ${c}</div>`).join('')}
</div>
<div style="font-family:monospace;font-size:13px;background:rgba(15,15,30,0.8);padding:10px 14px;border-radius:8px;margin:8px 0;border:1px solid rgba(255,255,255,0.06)">
  Arrangement: C — ? — ? — ? — ?
</div>
<p>Who sits in the <strong>middle (3rd) position</strong>?</p>`,
    options: ['D', 'B', 'E', 'A'], correct: 0,
    explanation: 'C at end (pos 1). D is between E and B → E-D-B or B-D-E. A not next to B. Arrangement: C-E-D-B-A works. D is in position 3 (middle).',
    timeLimit: 150, marks: 3, companyTags: ['Amazon', 'Google'], attempts: 95, correctRate: 32,
  },
  {
    id: 'a29', topic: 'Technical Aptitude', subtopic: 'OS Concepts', difficulty: 'Medium',
    question: `<p>Consider this scenario in an Operating System:</p>
<div style="font-family:monospace;font-size:12px;background:rgba(15,15,30,0.8);padding:14px;border-radius:8px;margin:10px 0;border:1px solid rgba(239,68,68,0.2);line-height:1.9">
  Process P1: holds <span style="color:#6366f1">Resource A</span>, wants <span style="color:#f59e0b">Resource B</span><br/>
  Process P2: holds <span style="color:#f59e0b">Resource B</span>, wants <span style="color:#22c55e">Resource C</span><br/>
  Process P3: holds <span style="color:#22c55e">Resource C</span>, wants <span style="color:#6366f1">Resource A</span><br/>
  <span style="color:rgba(255,255,255,0.4)">→ Circular Wait! None can proceed.</span>
</div>
<p>What is this condition called in Operating Systems?</p>`,
    options: ['Deadlock', 'CPU Starvation', 'Memory Overflow', 'Race Condition'], correct: 0,
    explanation: 'Deadlock: circular wait where each process waits for a resource held by another. 4 conditions: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.',
    timeLimit: 60, marks: 2, companyTags: ['Amazon', 'Microsoft', 'Google'], attempts: 340, correctRate: 76,
  },
  {
    id: 'a30', topic: 'Quantitative Aptitude', subtopic: 'Speed & Distance', difficulty: 'Easy',
    question: `<p>A <strong>train</strong> covers a journey:</p>
<div style="display:flex;gap:12px;margin:12px 0;flex-wrap:wrap">
  <div style="background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.25);padding:12px 16px;border-radius:8px;text-align:center">
    <div style="font-size:11px;opacity:0.6;margin-bottom:4px">DISTANCE</div>
    <div style="font-size:22px;font-weight:bold;color:#6366f1">360 km</div>
  </div>
  <div style="display:flex;align-items:center;font-size:20px;opacity:0.4">÷</div>
  <div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.25);padding:12px 16px;border-radius:8px;text-align:center">
    <div style="font-size:11px;opacity:0.6;margin-bottom:4px">TIME</div>
    <div style="font-size:22px;font-weight:bold;color:#f59e0b">4 hours</div>
  </div>
  <div style="display:flex;align-items:center;font-size:20px;opacity:0.4">=</div>
  <div style="background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.25);padding:12px 16px;border-radius:8px;text-align:center">
    <div style="font-size:11px;opacity:0.6;margin-bottom:4px">SPEED</div>
    <div style="font-size:22px;font-weight:bold;color:#22c55e">? m/s</div>
  </div>
</div>
<p>What is the train's speed in <strong>metres per second (m/s)</strong>?</p>
<div style="background:rgba(245,158,11,0.07);border-left:3px solid #f59e0b;padding:6px 12px;border-radius:0 6px 6px 0;font-size:12px">
  Conversion: km/h × <strong>5/18</strong> = m/s
</div>`,
    options: ['25 m/s', '90 m/s', '36 m/s', '10 m/s'], correct: 0,
    explanation: 'Speed = 360/4 = 90 km/h. In m/s: 90 × (5/18) = 25 m/s.',
    timeLimit: 60, marks: 1, companyTags: ['TCS', 'Cognizant'], attempts: 310, correctRate: 70,
  },
]

const SAMPLE_MOCK_TESTS: MockTestDef[] = [
  {
    id: 'mt1',
    title: 'TCS NQT Mock Test — Set 1',
    type: 'mixed',
    duration: 45,
    description: 'Simulated TCS National Qualifier Test with quantitative, logical, verbal, and coding sections',
    createdAt: '2025-01-01',
    totalAttempts: 234,
    avgScore: 68,
    questions: [
      {
        id: 'mq1', type: 'mcq', topic: 'Quantitative Aptitude', subtopic: 'Percentage',
        question: `<p>A shopkeeper <strong>marks up</strong> the price by <span style="color:#6366f1;font-weight:bold">20%</span> and gives a <span style="color:#ef4444;font-weight:bold">10% discount</span> on the marked price.</p>
<div style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);padding:10px 14px;border-radius:8px;font-family:monospace;font-size:13px;margin:10px 0">
  CP = 100 → MP = 120 → SP = 120 × 0.9 = <strong style="color:#6366f1">108</strong>
</div>
<p>What is the <strong>profit percentage</strong>?</p>`,
        options: ['8%', '10%', '12%', '6%'], correct: 0, marks: 1, timeLimit: 60, explanation: 'SP = 108, CP = 100. Profit = 8%.', sourceId: 'a1',
      },
      {
        id: 'mq2', type: 'mcq', topic: 'Logical Reasoning', subtopic: 'Series Completion',
        question: `<p>Identify the pattern and find the <strong>next number</strong>:</p>
<div style="display:flex;align-items:center;gap:8px;margin:12px 0;flex-wrap:wrap">
  ${['2','6','12','20','30','?'].map(n => `<div style="background:rgba(99,102,241,${n==='?'?'0.2':'0.1'});border:1px solid rgba(99,102,241,0.3);padding:8px 14px;border-radius:8px;font-size:16px;font-weight:bold;color:${n==='?'?'#6366f1':'inherit'}">${n}</div>`).join('<span style="opacity:0.4">→</span>')}
</div>
<p style="font-size:13px;color:rgba(255,255,255,0.6)">Hint: Look at the differences between consecutive terms.</p>`,
        options: ['42', '40', '44', '38'], correct: 0, marks: 1, timeLimit: 90, explanation: 'Differences: +4,+6,+8,+10,+12 → 30+12=42', sourceId: 'a9',
      },
      {
        id: 'mq3', type: 'mcq', topic: 'Verbal Ability', subtopic: 'Synonyms & Antonyms',
        question: `<p>Select the <strong>ANTONYM</strong> of:</p>
<div style="text-align:center;margin:14px 0">
  <span style="font-size:26px;font-weight:900;letter-spacing:3px;background:linear-gradient(135deg,#6366f1,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent">BENEVOLENT</span>
</div>
<div style="font-size:12px;background:rgba(30,30,60,0.5);padding:8px 14px;border-radius:6px;border:1px solid rgba(255,255,255,0.06)">
  <em>Benevolent</em> = well-meaning and kindly in intent
</div>`,
        options: ['Malevolent', 'Generous', 'Kind', 'Helpful'], correct: 0, marks: 1, timeLimit: 45, explanation: 'Malevolent = evil-intentioned. Exact antonym.', sourceId: 'a11',
      },
      {
        id: 'mq4', type: 'fill_blank', topic: 'Verbal Ability', subtopic: 'Grammar',
        question: `<p>Choose the correct verb to fill in the blank:</p>
<div style="background:rgba(30,30,60,0.5);border:1px solid rgba(99,102,241,0.2);padding:16px 20px;border-radius:8px;margin:12px 0;text-align:center;font-size:17px">
  "Neither of them <span style="border-bottom:2px dashed #6366f1;padding:0 10px;color:#6366f1">____</span> correct."
</div>`,
        blankAnswer: 'is', marks: 1, timeLimit: 30, explanation: '"Neither" is singular → takes "is".',
      },
      {
        id: 'mq5', type: 'mcq', topic: 'Technical Aptitude', subtopic: 'Computer Science Basics',
        question: `<p>Binary search repeatedly <strong>halves the search space</strong>. What is its time complexity?</p>
<div style="font-family:monospace;font-size:12px;background:rgba(15,15,30,0.8);padding:12px;border-radius:8px;margin:10px 0;border:1px solid rgba(34,197,94,0.2)">
  n=8: 8→4→2→1 &nbsp; (3 steps = log₂8)<br/>
  n=16: 16→8→4→2→1 &nbsp; (4 steps = log₂16)
</div>`,
        options: ['O(log n)', 'O(n)', 'O(n log n)', 'O(1)'], correct: 0, marks: 1, timeLimit: 45, explanation: 'O(log n) — search space halves each step.', sourceId: 'a18',
      },
      {
        id: 'mq6', type: 'coding', topic: 'Technical', subtopic: 'Arrays',
        question: `<h3 style="color:#6366f1;font-size:16px;margin:0 0 10px">Array Sum</h3>
<p>Write a function that returns the <strong>sum of all elements</strong> in an integer array.</p>
<div style="background:rgba(30,30,60,0.5);border:1px solid rgba(255,255,255,0.06);padding:12px 14px;border-radius:8px;margin:10px 0;font-family:monospace;font-size:13px">
  <strong>Example 1:</strong><br/>
  Input: arr = [1, 2, 3, 4, 5]<br/>
  Output: <span style="color:#22c55e">15</span><br/><br/>
  <strong>Example 2:</strong><br/>
  Input: arr = [10, 20, 30]<br/>
  Output: <span style="color:#22c55e">60</span>
</div>
<p style="font-size:12px;color:rgba(255,255,255,0.5)"><strong>Constraints:</strong> 1 ≤ arr.length ≤ 10⁵, -10⁴ ≤ arr[i] ≤ 10⁴</p>`,
        starterCode: { python: 'def array_sum(arr):\n    # Write your solution here\n    pass', javascript: 'function arraySum(arr) {\n    // Write your solution here\n}', java: 'public int arraySum(int[] arr) {\n    // Write your solution here\n    return 0;\n}', cpp: 'int arraySum(vector<int>& arr) {\n    // Write your solution here\n    return 0;\n}' },
        testCases: [{ input: '[1,2,3,4,5]', expected: '15' }, { input: '[10,20,30]', expected: '60' }],
        marks: 3, timeLimit: 300, explanation: 'Iterate and accumulate: sum = 0; for x in arr: sum += x',
      },
    ],
  },
  {
    id: 'mt2',
    title: 'Infosys InfyTQ Mock Test',
    type: 'aptitude',
    duration: 30,
    description: 'Practice test for Infosys campus placement — quantitative and logical reasoning focus',
    createdAt: '2025-01-05',
    totalAttempts: 187,
    avgScore: 72,
    questions: [
      {
        id: 'mq7', type: 'mcq', topic: 'Quantitative Aptitude', subtopic: 'Time & Work',
        question: `<p><strong>A</strong> completes work in <span style="color:#6366f1;font-weight:bold">10 days</span>. <strong>B</strong> completes it in <span style="color:#f59e0b;font-weight:bold">15 days</span>.</p>
<table style="border-collapse:collapse;font-size:12px;width:100%;margin:10px 0">
  <thead><tr style="background:rgba(99,102,241,0.1)">
    <th style="padding:6px 12px;border:1px solid rgba(255,255,255,0.08);text-align:left">Worker</th>
    <th style="padding:6px 12px;border:1px solid rgba(255,255,255,0.08)">Days</th>
    <th style="padding:6px 12px;border:1px solid rgba(255,255,255,0.08)">Work/Day</th>
  </tr></thead>
  <tbody>
    <tr><td style="padding:5px 12px;border:1px solid rgba(255,255,255,0.05)">A</td><td style="padding:5px 12px;border:1px solid rgba(255,255,255,0.05);text-align:center">10</td><td style="padding:5px 12px;border:1px solid rgba(255,255,255,0.05);text-align:center;color:#6366f1">1/10</td></tr>
    <tr><td style="padding:5px 12px;border:1px solid rgba(255,255,255,0.05)">B</td><td style="padding:5px 12px;border:1px solid rgba(255,255,255,0.05);text-align:center">15</td><td style="padding:5px 12px;border:1px solid rgba(255,255,255,0.05);text-align:center;color:#f59e0b">1/15</td></tr>
    <tr style="background:rgba(34,197,94,0.06)"><td style="padding:5px 12px;border:1px solid rgba(255,255,255,0.05)"><strong>A+B</strong></td><td style="padding:5px 12px;border:1px solid rgba(255,255,255,0.05);text-align:center;color:#22c55e">?</td><td style="padding:5px 12px;border:1px solid rgba(255,255,255,0.05);text-align:center;color:#22c55e">1/10 + 1/15</td></tr>
  </tbody>
</table>
<p>Working <strong>together</strong>, how many days to finish?</p>`,
        options: ['5 days', '6 days', '7 days', '8 days'], correct: 1, marks: 1, timeLimit: 90, explanation: '1/10 + 1/15 = 5/30 = 1/6. Days = 6.', sourceId: 'a2',
      },
      {
        id: 'mq8', type: 'mcq', topic: 'Quantitative Aptitude', subtopic: 'Profit & Loss',
        question: `<div style="display:flex;gap:10px;margin:10px 0;flex-wrap:wrap">
  <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);padding:10px 14px;border-radius:8px;text-align:center">
    <div style="font-size:11px;opacity:0.6">COST PRICE</div><div style="font-size:20px;font-weight:bold;color:#ef4444">₹500</div>
  </div>
  <div style="display:flex;align-items:center;opacity:0.4;font-size:18px">→</div>
  <div style="background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.2);padding:10px 14px;border-radius:8px;text-align:center">
    <div style="font-size:11px;opacity:0.6">SELLING PRICE</div><div style="font-size:20px;font-weight:bold;color:#22c55e">₹625</div>
  </div>
</div>
<p>What is the <strong>profit percentage</strong>?</p>`,
        options: ['20%', '25%', '15%', '30%'], correct: 1, marks: 1, timeLimit: 60, explanation: 'Profit = 125. Profit% = 125/500 × 100 = 25%', sourceId: 'a6',
      },
      {
        id: 'mq9', type: 'mcq', topic: 'Logical Reasoning', subtopic: 'Blood Relations',
        question: `<div style="font-family:monospace;font-size:13px;background:rgba(15,15,30,0.8);padding:14px;border-radius:8px;margin:10px 0;border:1px solid rgba(99,102,241,0.15);line-height:2">
  <span style="color:#6366f1">A</span> is father of <span style="color:#f59e0b">B</span><br/>
  <span style="color:#22c55e">C</span> is sister of <span style="color:#6366f1">A</span>
</div>
<p>How is <strong>C related to B</strong>?</p>`,
        options: ['Aunt', 'Mother', 'Sister', 'Grandmother'], correct: 0, marks: 1, timeLimit: 60, explanation: "C is A's sister, A is B's father → C is B's aunt.", sourceId: 'a8',
      },
      {
        id: 'mq10', type: 'textual', topic: 'Verbal Ability', subtopic: 'Grammar',
        question: `<p>Write a short explanation of the difference between <strong>"affect"</strong> and <strong>"effect"</strong>, with one example of each.</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0;font-size:12px">
  <div style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.15);padding:10px;border-radius:8px">
    <div style="color:#6366f1;font-weight:bold;margin-bottom:4px">AFFECT</div>
    Usually a <em>verb</em><br/>(to influence/impact)
  </div>
  <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.15);padding:10px;border-radius:8px">
    <div style="color:#f59e0b;font-weight:bold;margin-bottom:4px">EFFECT</div>
    Usually a <em>noun</em><br/>(a result/outcome)
  </div>
</div>`,
        sampleAnswer: '"Affect" is usually a verb meaning to influence (e.g., The rain affected our plans). "Effect" is a noun meaning a result (e.g., The effect of rain was flooding).',
        marks: 2, timeLimit: 120, explanation: 'Affect = verb (to influence). Effect = noun (a result).',
      },
      {
        id: 'mq11', type: 'mcq', topic: 'Quantitative Aptitude', subtopic: 'Number System',
        question: `<p>Find <strong>LCM(12, 18)</strong> using prime factorization:</p>
<div style="font-family:monospace;background:rgba(15,15,30,0.8);padding:12px 14px;border-radius:8px;margin:10px 0;border:1px solid rgba(99,102,241,0.15);font-size:13px;line-height:1.9">
  12 = 2² × 3<br/>18 = 2 × 3²<br/>
  <span style="color:rgba(255,255,255,0.4)">━━━━━━━━━━</span><br/>
  LCM = 2² × 3² = <span style="color:#22c55e;font-weight:bold">?</span>
</div>`,
        options: ['36', '24', '6', '72'], correct: 0, marks: 1, timeLimit: 45, explanation: 'LCM = 4 × 9 = 36.', sourceId: 'a27',
      },
    ],
  },
  {
    id: 'mt3',
    title: 'Full Stack Technical Assessment',
    type: 'technical',
    duration: 60,
    description: 'Mixed technical test with CS fundamentals, DBMS, networking, and coding problems',
    createdAt: '2025-01-10',
    totalAttempts: 98,
    avgScore: 61,
    questions: [
      {
        id: 'mq12', type: 'mcq', topic: 'Technical Aptitude', subtopic: 'OOP Concepts',
        question: `<p>What does this Java code demonstrate?</p>
<pre style="background:rgba(15,15,30,0.8);border:1px solid rgba(99,102,241,0.2);padding:12px;border-radius:8px;font-size:12px;overflow-x:auto;margin:10px 0"><code><span style="color:#c792ea">class</span> <span style="color:#82aaff">Calc</span> {
  <span style="color:#89ddff">int</span> add(<span style="color:#89ddff">int</span> a, <span style="color:#89ddff">int</span> b) { ... }
  <span style="color:#89ddff">double</span> add(<span style="color:#89ddff">double</span> a, <span style="color:#89ddff">double</span> b) { ... }
  <span style="color:#89ddff">int</span> add(<span style="color:#89ddff">int</span> a, <span style="color:#89ddff">int</span> b, <span style="color:#89ddff">int</span> c) { ... }
}</code></pre>
<p>Same method name, different parameters — which OOP concept?</p>`,
        options: ['Polymorphism', 'Encapsulation', 'Inheritance', 'Abstraction'], correct: 0, marks: 1, timeLimit: 60, explanation: 'Method overloading = compile-time polymorphism.', sourceId: 'a17',
      },
      {
        id: 'mq13', type: 'mcq', topic: 'Technical Aptitude', subtopic: 'DBMS',
        question: `<p>In the SQL query below, what keyword fills the blank?</p>
<pre style="background:rgba(15,15,30,0.8);border:1px solid rgba(99,102,241,0.2);padding:12px;border-radius:8px;font-size:12px;overflow-x:auto;margin:10px 0"><code><span style="color:#c792ea">SELECT</span> dept, <span style="color:#82aaff">AVG</span>(salary)
<span style="color:#c792ea">FROM</span> employees
<span style="color:#c792ea">GROUP BY</span> dept
<span style="color:#89ddff">____</span> <span style="color:#82aaff">AVG</span>(salary) &gt; 50000;</code></pre>
<p>Which clause <strong>filters aggregated/grouped results</strong>?</p>`,
        options: ['HAVING', 'WHERE', 'GROUP BY', 'ORDER BY'], correct: 0, marks: 1, timeLimit: 45, explanation: 'HAVING filters after GROUP BY. WHERE filters rows before grouping.', sourceId: 'a24',
      },
      {
        id: 'mq14', type: 'mcq', topic: 'Technical Aptitude', subtopic: 'OS Concepts',
        question: `<p>Observe this circular wait in an OS:</p>
<div style="font-family:monospace;font-size:12px;background:rgba(15,15,30,0.8);padding:12px;border-radius:8px;margin:10px 0;border:1px solid rgba(239,68,68,0.2);line-height:1.9">
  P1 holds <span style="color:#6366f1">A</span>, waits for <span style="color:#f59e0b">B</span><br/>
  P2 holds <span style="color:#f59e0b">B</span>, waits for <span style="color:#22c55e">C</span><br/>
  P3 holds <span style="color:#22c55e">C</span>, waits for <span style="color:#6366f1">A</span><br/>
  <span style="color:rgba(255,255,255,0.4)">→ None can proceed!</span>
</div>
<p>What OS condition is this?</p>`,
        options: ['Deadlock', 'CPU Starvation', 'Memory Overflow', 'Race Condition'], correct: 0, marks: 2, timeLimit: 60, explanation: 'Deadlock: circular wait. Four conditions: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.', sourceId: 'a29',
      },
      {
        id: 'mq15', type: 'fill_blank', topic: 'Technical Aptitude', subtopic: 'Networking',
        question: `<p>Complete the full form:</p>
<div style="text-align:center;font-size:18px;background:rgba(30,30,60,0.5);border:1px solid rgba(99,102,241,0.2);padding:16px;border-radius:8px;margin:12px 0;font-family:monospace">
  <strong style="color:#6366f1">HTTP</strong> = <span style="border-bottom:2px dashed #6366f1;padding:0 8px;color:#6366f1">____</span> Transfer Protocol
</div>`,
        blankAnswer: 'HyperText', marks: 1, timeLimit: 30, explanation: 'HTTP = HyperText Transfer Protocol.',
      },
      {
        id: 'mq16', type: 'coding', topic: 'Technical', subtopic: 'Algorithms',
        question: `<h3 style="color:#6366f1;font-size:16px;margin:0 0 10px">Prime Number Check</h3>
<p>Write a function to check if a given number <code style="background:rgba(99,102,241,0.1);padding:2px 6px;border-radius:4px">n</code> is <strong>prime</strong>.</p>
<div style="background:rgba(30,30,60,0.5);border:1px solid rgba(255,255,255,0.06);padding:12px 14px;border-radius:8px;margin:10px 0;font-family:monospace;font-size:13px">
  <strong>Example 1:</strong> n = 17 → <span style="color:#22c55e">true</span> &nbsp;(divisible only by 1 and 17)<br/>
  <strong>Example 2:</strong> n = 4 &nbsp;→ <span style="color:#ef4444">false</span> &nbsp;(4 = 2 × 2)<br/>
  <strong>Example 3:</strong> n = 1 &nbsp;→ <span style="color:#ef4444">false</span> &nbsp;(1 is not prime by definition)
</div>
<div style="background:rgba(245,158,11,0.07);border-left:3px solid #f59e0b;padding:8px 12px;border-radius:0 6px 6px 0;font-size:12px">
  <strong>Hint:</strong> Only check divisors up to <code>√n</code> for efficiency — O(√n) time.
</div>`,
        starterCode: { python: 'def is_prime(n):\n    # Write your solution here\n    pass', javascript: 'function isPrime(n) {\n    // Write your solution here\n}', java: 'public boolean isPrime(int n) {\n    // Write your solution here\n    return false;\n}', cpp: 'bool isPrime(int n) {\n    // Write your solution here\n    return false;\n}' },
        testCases: [{ input: '17', expected: 'true' }, { input: '4', expected: 'false' }, { input: '1', expected: 'false' }],
        marks: 3, timeLimit: 300, explanation: 'Check divisors from 2 to sqrt(n). If none divide n, it is prime.',
      },
      {
        id: 'mq17', type: 'textual', topic: 'Technical Aptitude', subtopic: 'Computer Science Basics',
        question: `<p>Explain the differences between <strong>Stack</strong> and <strong>Queue</strong> data structures.</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 0;font-size:12px">
  <div style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.15);padding:10px;border-radius:8px">
    <div style="color:#6366f1;font-weight:bold;margin-bottom:6px">📚 STACK</div>
    Order: <strong>LIFO</strong><br/>Last In, First Out<br/>
    <em style="color:rgba(255,255,255,0.5)">Like a stack of plates</em>
  </div>
  <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.15);padding:10px;border-radius:8px">
    <div style="color:#f59e0b;font-weight:bold;margin-bottom:6px">🎫 QUEUE</div>
    Order: <strong>FIFO</strong><br/>First In, First Out<br/>
    <em style="color:rgba(255,255,255,0.5)">Like a ticket line</em>
  </div>
</div>
<p>Include <strong>real-world examples</strong> and <strong>use cases</strong> for each.</p>`,
        sampleAnswer: 'Stack (LIFO): like a stack of plates — last plate placed is first removed. Used in function call stacks, undo/redo, expression evaluation. Queue (FIFO): like a ticket counter line — first person in is served first. Used in BFS graph traversal, print spoolers, task scheduling, CPU scheduling.',
        marks: 3, timeLimit: 180, explanation: 'Stack=LIFO (function calls, undo). Queue=FIFO (BFS, scheduling).',
      },
    ],
  },
]

const DEMO_BADGES: Badge[] = [
  { id: '1', name: '7 Day Streak', emoji: '🔥', description: 'Solve problems 7 days in a row', xp: 100, color: '#f97316', criteria: 'Login and solve 1 problem daily for 7 consecutive days' },
  { id: '2', name: 'DSA Hero', emoji: '💻', description: 'Solve 50 DSA problems', xp: 250, color: '#6366f1', criteria: 'Solve 50 or more DSA problems' },
  { id: '3', name: 'Aptitude Master', emoji: '🏆', description: 'Score 90%+ in aptitude', xp: 200, color: '#f59e0b', criteria: 'Score 90% or above in any full aptitude test' },
  { id: '4', name: 'Speed Coder', emoji: '⚡', description: 'Solve Hard problem in under 15 min', xp: 300, color: '#ec4899', criteria: 'Submit correct solution to Hard problem within 15 minutes' },
  { id: '5', name: 'Interview Ready', emoji: '🎯', description: 'Complete your profile', xp: 50, color: '#10b981', criteria: 'Fill all profile sections including resume' },
]

const DEMO_ROADMAPS: StudyRoadmap[] = [
  {
    id: '1', title: '30-Day Placement Plan', description: 'Complete preparation for campus placements in 30 days',
    targetCompanies: ['TCS', 'Infosys', 'Wipro', 'Cognizant'], duration: '30 days', enrolledCount: 142,
    phases: [
      { title: 'Week 1: Foundation', tasks: ['Arrays & Strings (20 LeetCode Easy)', 'Number Systems & Aptitude Basics', 'Resume Building', 'Profile Setup on PrepAce'] },
      { title: 'Week 2: Core DSA', tasks: ['Linked Lists, Stacks, Queues', 'Quantitative Aptitude (50 questions)', 'Mock Aptitude Test #1', 'Company-specific DSA questions'] },
      { title: 'Week 3: Advanced Topics', tasks: ['Trees & Graphs (BFS, DFS)', 'Verbal Ability & Logical Reasoning', 'Dynamic Programming basics', 'Company-specific questions'] },
      { title: 'Week 4: Final Sprint', tasks: ['Full Mock Tests (3 complete tests)', 'HR Interview Prep (STAR method)', 'Resume finalization & peer review', 'Company research & practice GDs'] },
    ],
    createdAt: '2024-12-01',
  },
  {
    id: '2', title: 'Google SDE Prep (90 Days)', description: 'Crack Google Software Engineer interview with structured 90-day plan',
    targetCompanies: ['Google'], duration: '90 days', enrolledCount: 58,
    phases: [
      { title: 'Month 1: DS & Algo Mastery', tasks: ['Master all data structures', '100 LeetCode problems (mix Easy/Medium)', 'Big-O analysis practice', 'System design intro'] },
      { title: 'Month 2: System Design', tasks: ['System design fundamentals', 'Design Twitter, YouTube, Uber', 'API design patterns', 'Database sharding & indexing'] },
      { title: 'Month 3: Mock & Refine', tasks: ['5 full mock interviews', 'Behavioral questions (STAR framework)', 'Google-specific prep (Kickstart)', 'Final revision of weak areas'] },
    ],
    createdAt: '2024-12-15',
  },
]

const DEMO_USERS: AdminUser[] = [
  { id: '1', name: 'Arjun Sharma', email: 'arjun@college.edu', college: 'IIT Delhi', branch: 'CSE', year: '4th', status: 'active', placementStatus: 'placed', joinedAt: '2024-08-01', dsaSolved: 87, aptitudeScore: 88, mockTestsTaken: 12, badges: ['1', '2', '3'], dsaStreak: 14, totalXP: 2840, lastActive: '2025-01-09', coursesCompleted: 4, aptitudeTests: 8, strongTopics: ['Arrays', 'DP', 'Trees'], weakTopics: ['Graphs'] },
  { id: '2', name: 'Priya Patel', email: 'priya@college.edu', college: 'NIT Surat', branch: 'IT', year: '3rd', status: 'active', placementStatus: 'seeking', joinedAt: '2024-09-15', dsaSolved: 34, aptitudeScore: 72, mockTestsTaken: 5, badges: ['5'], dsaStreak: 3, totalXP: 980, lastActive: '2025-01-08', coursesCompleted: 2, aptitudeTests: 4, strongTopics: ['Quantitative', 'Verbal'], weakTopics: ['Logical Reasoning', 'DP'] },
  { id: '3', name: 'Rahul Kumar', email: 'rahul@college.edu', college: 'BITS Pilani', branch: 'CS', year: '4th', status: 'active', placementStatus: 'seeking', joinedAt: '2024-07-20', dsaSolved: 120, aptitudeScore: 91, mockTestsTaken: 20, badges: ['1', '2', '3', '4', '5'], dsaStreak: 32, totalXP: 5120, lastActive: '2025-01-09', coursesCompleted: 6, aptitudeTests: 15, strongTopics: ['All Topics'], weakTopics: [] },
  { id: '5', name: 'Aditya Mehta', email: 'aditya@college.edu', college: 'SVNIT Surat', branch: 'CSE', year: '2nd', status: 'pending', placementStatus: 'seeking', joinedAt: new Date().toISOString().split('T')[0], dsaSolved: 0, aptitudeScore: 0, mockTestsTaken: 0, badges: [], dsaStreak: 0, totalXP: 0, lastActive: new Date().toISOString().split('T')[0], coursesCompleted: 0, aptitudeTests: 0, strongTopics: [], weakTopics: [] },
  { id: '6', name: 'Kavya Singh', email: 'kavya@college.edu', college: 'DTU Delhi', branch: 'IT', year: '3rd', status: 'pending', placementStatus: 'seeking', joinedAt: new Date().toISOString().split('T')[0], dsaSolved: 0, aptitudeScore: 0, mockTestsTaken: 0, badges: [], dsaStreak: 0, totalXP: 0, lastActive: new Date().toISOString().split('T')[0], coursesCompleted: 0, aptitudeTests: 0, strongTopics: [], weakTopics: [] },
  { id: '4', name: 'Sneha Rao', email: 'sneha@college.edu', college: 'VIT Vellore', branch: 'ECE', year: '3rd', status: 'suspended', placementStatus: 'not_seeking', joinedAt: '2024-10-01', dsaSolved: 5, aptitudeScore: 45, mockTestsTaken: 1, badges: [], dsaStreak: 0, totalXP: 120, lastActive: '2024-12-15', coursesCompleted: 0, aptitudeTests: 1, strongTopics: [], weakTopics: ['All Topics'] },
]

const DEMO_RESOURCES: Resource[] = [
  { id: '1', title: 'DSA Sheet - 150 Problems', type: 'pdf', url: '#', topic: 'DSA', description: 'Curated 150 problems for placement prep', uploadedAt: '2024-11-01' },
  { id: '2', title: 'System Design Interview Guide', type: 'pdf', url: '#', topic: 'System Design', description: 'Complete guide to system design interviews', uploadedAt: '2024-11-15' },
  { id: '3', title: 'Aptitude Formula Sheet', type: 'note', url: '#', topic: 'Aptitude', description: 'Quick reference for all aptitude formulas', uploadedAt: '2024-12-01' },
]

export function AppProvider({ children }: { children: ReactNode }) {
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>([])
  const [companyVisits, setCompanyVisitsState] = useState<CompanyVisit[]>([])
  const [dsaProblems, setDsaProblemsState] = useState<DSAProblem[]>([])
  const [aptitudeQuestions, setAptitudeQuestionsState] = useState<AptitudeQuestion[]>([])
  const [mockTests, setMockTestsState] = useState<MockTestDef[]>([])
  const [badges, setBadgesState] = useState<Badge[]>([])
  const [roadmaps, setRoadmapsState] = useState<StudyRoadmap[]>([])
  const [adminUsers, setAdminUsersState] = useState<AdminUser[]>([])
  const [resources, setResourcesState] = useState<Resource[]>([])
  const [dsaTopics, setDsaTopics] = useState<CustomTopic[]>(DSA_TOPICS_DEFAULT)
  const [aptitudeTopics, setAptitudeTopics] = useState<CustomTopic[]>(APT_TOPICS_DEFAULT)
  const [knownCompanies, setKnownCompanies] = useState<string[]>(KNOWN_COMPANIES_DEFAULT)
  const [codeSubmissions, setCodeSubmissions] = useState<Record<string, CodeSubmission[]>>({})
  const [mockTestHistory, setMockTestHistory] = useState<MockTestAttempt[]>([])
  const [roadmapProgress, setRoadmapProgress] = useState<RoadmapProgress[]>([])

  function stripClientFields<T extends Record<string, any>>(item: T) {
    const { id, _id, createdAt, updatedAt, __v, __synced, ...rest } = item
    return rest
  }

  async function syncCollection<T extends Record<string, any>>(
    path: string,
    previous: T[],
    next: T[],
    setState: (items: T[]) => void,
  ) {
    const prevById = new Map(previous.map(item => [String(item.id || item._id), item]))
    const nextById = new Map(next.map(item => [String(item.id || item._id), item]))

    try {
      await Promise.all([
        ...next
          .filter(item => !item.__synced && !prevById.has(String(item.id || item._id)))
          .map(item => api.post(path, stripClientFields(item))),
        ...next
          .filter(item => {
            if (item.__synced) return false
            const id = String(item.id || item._id)
            return prevById.has(id) && JSON.stringify(prevById.get(id)) !== JSON.stringify(item)
          })
          .map(item => api.put(`${path}/${item.id || item._id}`, stripClientFields(item))),
        ...previous
          .filter(item => !nextById.has(String(item.id || item._id)))
          .map(item => api.delete(`${path}/${item.id || item._id}`)),
      ])
      setState(await loadCollection<T>(path))
    } catch (error) {
      console.warn(`Failed to sync ${path}`, error)
    }
  }

  function setCompanyVisits(next: CompanyVisit[]) {
    const previous = companyVisits
    setCompanyVisitsState(next)
    syncCollection('/company-visits', previous, next, setCompanyVisitsState)
  }

  function setDsaProblems(next: DSAProblem[]) {
    const previous = dsaProblems
    setDsaProblemsState(next)
    syncCollection('/dsa-problems', previous, next, setDsaProblemsState)
  }

  function setAptitudeQuestions(next: AptitudeQuestion[]) {
    const previous = aptitudeQuestions
    setAptitudeQuestionsState(next)
    syncCollection('/aptitude-questions', previous, next, setAptitudeQuestionsState)
  }

  function setMockTests(next: MockTestDef[]) {
    const previous = mockTests
    setMockTestsState(next)
    syncCollection('/mock-tests', previous, next, setMockTestsState)
  }

  function setBadges(next: Badge[]) {
    const previous = badges
    setBadgesState(next)
    syncCollection('/badges', previous, next, setBadgesState)
  }

  function setRoadmaps(next: StudyRoadmap[]) {
    const previous = roadmaps
    setRoadmapsState(next)
    syncCollection('/roadmaps', previous, next, setRoadmapsState)
  }

  function setResources(next: Resource[]) {
    const previous = resources
    setResourcesState(next)
    syncCollection('/resources', previous, next, setResourcesState)
  }

  async function setAdminUsers(next: AdminUser[]) {
    const previous = adminUsers
    setAdminUsersState(next)
    const prevById = new Map(previous.map(user => [user.id, user]))
    const nextById = new Map(next.map(user => [user.id, user]))

    try {
      await Promise.all([
        ...next
          .filter(user => prevById.has(user.id) && prevById.get(user.id)?.status !== user.status)
          .map(user => api.patch(`/users/${user.id}/status`, { status: user.status })),
        ...previous
          .filter(user => !nextById.has(user.id))
          .map(user => api.delete(`/users/${user.id}`)),
      ])
      setAdminUsersState(await loadCollection<AdminUser>('/users'))
    } catch (error) {
      console.warn('Failed to sync users', error)
    }
  }

  useEffect(() => {
    let cancelled = false

    async function loadBackendData() {
      let baseVisits: CompanyVisit[] = []
      try {
        const [
          visits,
          dsa,
          aptitude,
          tests,
          badgeList,
          roadmapList,
          resourceList,
        ] = await Promise.all([
          loadCollection<CompanyVisit>('/company-visits'),
          loadCollection<DSAProblem>('/dsa-problems'),
          loadCollection<AptitudeQuestion>('/aptitude-questions'),
          loadCollection<MockTestDef>('/mock-tests'),
          loadCollection<Badge>('/badges'),
          loadCollection<StudyRoadmap>('/roadmaps'),
          loadCollection<Resource>('/resources'),
        ])

        if (cancelled) return
        baseVisits = visits
        setCompanyVisitsState(normalizeVisitsForUser(visits))
        setDsaProblemsState(dsa)
        setAptitudeQuestionsState(aptitude)
        setMockTestsState(tests)
        setBadgesState(badgeList)
        setRoadmapsState(roadmapList)
        setResourcesState(resourceList)
        setKnownCompanies(Array.from(new Set([
          ...KNOWN_COMPANIES_DEFAULT,
          ...visits.map(visit => visit.companyName).filter(Boolean),
          ...dsa.flatMap(problem => problem.companies || []),
          ...roadmapList.flatMap(roadmap => roadmap.targetCompanies || []),
        ])))
      } catch (error) {
        console.warn('Backend data could not be loaded. Start the backend and seed MongoDB.', error)
      }

      const token = localStorage.getItem('prepace_token') || localStorage.getItem('adminToken')
      if (!token || cancelled) return

      try {
        const [me, users, attempts, progress] = await Promise.all([
          api.get<{ user: AdminUser }>('/auth/me').then(result => result.user).catch(() => null),
          loadCollection<AdminUser>('/users').catch(() => []),
          loadCollection<MockTestAttempt>('/mock-attempts/mine').catch(() => []),
          api.get<any[]>('/progress/roadmaps').then(items => normalizeList(items.map(item => ({
            ...item,
            roadmapId: item.roadmap?.id || item.roadmap?._id || item.roadmap,
          })))).catch(() => []),
        ])

        if (cancelled) return
        const currentUserId = me?.id || me?._id
        if (me) {
          localStorage.setItem('prepace_user', JSON.stringify(normalizeId(me)))
          window.dispatchEvent(new Event('prepace:user-updated'))
        }
        setAdminUsersState(users.length ? users : me ? [normalizeId(me)] : [])
        setCompanyVisitsState(normalizeVisitsForUser(baseVisits, currentUserId))
        setMockTestHistory(attempts.map((attempt: any) => ({
          ...attempt,
          id: attempt.id || attempt._id,
          testId: attempt.testId || attempt.test?.id || attempt.test?._id || '',
          date: attempt.date || (attempt.createdAt ? new Date(attempt.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }) : ''),
          questions: attempt.questions || [],
          review: attempt.review || [],
        })))
        setRoadmapProgress(progress.map((item: any) => ({
          roadmapId: item.roadmapId,
          startedAt: item.startedAt,
          completedTasks: item.completedTasks || [],
        })))
        const submissions = await loadCollection<any>('/submissions').catch(() => [])
        const grouped = submissions.reduce<Record<string, CodeSubmission[]>>((acc, submission) => {
          const problemId = submission.problem?.id || submission.problem?._id || submission.problem || submission.problemId
          if (!problemId) return acc
          const item: CodeSubmission = {
            id: submission.id || submission._id,
            problemId,
            lang: submission.lang,
            code: submission.code,
            verdict: submission.verdict,
            timestamp: submission.createdAt ? new Date(submission.createdAt).toLocaleString() : '',
            runtime: submission.runtime || '',
            memory: submission.memory || '',
            testsPassed: submission.testsPassed || 0,
            totalTests: submission.totalTests || 0,
          }
          acc[problemId] = [item, ...(acc[problemId] || [])]
          return acc
        }, {})
        setCodeSubmissions(grouped)
      } catch (error) {
        console.warn('Authenticated backend data could not be loaded.', error)
      }
    }

    loadBackendData()
    window.addEventListener('prepace:progress-updated', loadBackendData)
    window.addEventListener('prepace:company-visits-updated', loadBackendData)
    window.addEventListener('storage', loadBackendData)
    return () => {
      cancelled = true
      window.removeEventListener('prepace:progress-updated', loadBackendData)
      window.removeEventListener('prepace:company-visits-updated', loadBackendData)
      window.removeEventListener('storage', loadBackendData)
    }
  }, [])

  function addPendingRegistration(r: PendingRegistration) {
    // Also add to adminUsers as pending
    const newUser: AdminUser = {
      id: r.id, name: r.name, email: r.email, college: r.college,
      branch: r.branch, year: r.year, status: 'pending',
      placementStatus: 'seeking', joinedAt: r.registeredAt,
      dsaSolved: 0, aptitudeScore: 0, mockTestsTaken: 0, badges: [],
      dsaStreak: 0, totalXP: 0, lastActive: r.registeredAt,
      coursesCompleted: 0, aptitudeTests: 0, strongTopics: [], weakTopics: [],
    }
    setAdminUsersState(prev => [...prev, newUser])
    setPendingRegistrations(prev => [...prev, r])
  }

  function approveRegistration(id: string) {
    setAdminUsersState(prev => prev.map(u => u.id === id ? { ...u, status: 'active' } : u))
    setPendingRegistrations(prev => prev.filter(r => r.id !== id))
  }

  function rejectRegistration(id: string) {
    setAdminUsersState(prev => prev.filter(u => u.id !== id))
    setPendingRegistrations(prev => prev.filter(r => r.id !== id))
  }

  function addCodeSubmission(sub: CodeSubmission) {
    setCodeSubmissions(prev => ({
      ...prev,
      [sub.problemId]: [sub, ...(prev[sub.problemId] ?? [])].slice(0, 20),
    }))
  }

  function addMockTestAttempt(attempt: MockTestAttempt) {
    setMockTestHistory(prev => [attempt, ...prev].slice(0, 50))
  }

  function startRoadmap(roadmapId: string) {
    setRoadmapProgress(prev => {
      if (prev.some(p => p.roadmapId === roadmapId)) return prev
      return [...prev, { roadmapId, startedAt: new Date().toISOString(), completedTasks: [] }]
    })
    api.post(`/progress/roadmaps/${roadmapId}/start`).catch(error => console.warn('Failed to start roadmap', error))
  }

  function toggleRoadmapTask(roadmapId: string, taskKey: string) {
    setRoadmapProgress(prev => prev.map(p => {
      if (p.roadmapId !== roadmapId) return p
      const has = p.completedTasks.includes(taskKey)
      return { ...p, completedTasks: has ? p.completedTasks.filter(k => k !== taskKey) : [...p.completedTasks, taskKey] }
    }))
    api.patch(`/progress/roadmaps/${roadmapId}/tasks`, { taskKey })
      .then((updated: any) => {
        setRoadmapProgress(prev => prev.map(p => p.roadmapId === roadmapId ? {
          roadmapId,
          startedAt: updated.startedAt || p.startedAt,
          completedTasks: updated.completedTasks || p.completedTasks,
        } : p))
      })
      .catch(error => console.warn('Failed to sync roadmap task', error))
  }

  function removeRoadmapProgress(roadmapId: string) {
    setRoadmapProgress(prev => prev.filter(p => p.roadmapId !== roadmapId))
    api.delete(`/progress/roadmaps/${roadmapId}`).catch(error => console.warn('Failed to remove roadmap progress', error))
  }

  return (
    <AppContext.Provider value={{
      pendingRegistrations, addPendingRegistration, approveRegistration, rejectRegistration,
      companyVisits, setCompanyVisits,
      dsaProblems, setDsaProblems,
      aptitudeQuestions, setAptitudeQuestions,
      mockTests, setMockTests,
      badges, setBadges,
      roadmaps, setRoadmaps,
      adminUsers, setAdminUsers,
      resources, setResources,
      dsaTopics, setDsaTopics,
      aptitudeTopics, setAptitudeTopics,
      knownCompanies, setKnownCompanies,
      codeSubmissions, addCodeSubmission,
      mockTestHistory, addMockTestAttempt,
      roadmapProgress, startRoadmap, toggleRoadmapTask, removeRoadmapProgress,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider')
  return ctx
}
