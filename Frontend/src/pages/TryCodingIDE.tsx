import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Lock, Zap } from 'lucide-react'
import ProblemIDE, { type Problem } from '../components/ProblemIDE'
import { loadCollection } from '../lib/api'

const SAMPLE_PROBLEMS: Problem[] = [
  {
    id: 1,
    title: 'Two Sum',
    difficulty: 'Easy',
    topic: 'Arrays & Hashing',
    companies: ['Google', 'Amazon', 'Meta'],
    description:
      'Given an array of integers <code>nums</code> and an integer <code>target</code>, return <strong>indices</strong> of the two numbers such that they add up to <code>target</code>.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nReturn the answer in <em>any order</em>.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] = 2 + 7 = 9, so return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: 'nums[1] + nums[2] = 2 + 4 = 6, return [1, 2].' },
      { input: 'nums = [3,3], target = 6', output: '[0,1]', explanation: 'Same value at different indices is allowed.' },
    ],
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9', 'Only one valid answer exists.'],
    hints: [
      "Use a hash map to store numbers you've seen along with their indices.",
      'For each number x, compute complement = target - x. Check if complement is already in the map.',
      'If found, return [map[complement], current_index]. Otherwise, add x to the map.',
    ],
    testCases: [
      { input: 'nums = [2,7,11,15]\ntarget = 9', expected: '[0,1]' },
      { input: 'nums = [3,2,4]\ntarget = 6', expected: '[1,2]' },
      { input: 'nums = [3,3]\ntarget = 6', expected: '[0,1]' },
    ],
    inputParams: ['nums', 'target'],
  },
  {
    id: 2,
    title: 'Maximum Subarray',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    companies: ['Amazon', 'Microsoft', 'Apple'],
    description:
      'Given an integer array <code>nums</code>, find the <strong>subarray</strong> with the largest sum, and return <em>its sum</em>.\n\nA subarray is a contiguous non-empty sequence of elements within an array.',
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum = 6.' },
      { input: 'nums = [1]', output: '1', explanation: 'Single element array.' },
      { input: 'nums = [5,4,-1,7,8]', output: '23', explanation: 'Entire array is the best subarray.' },
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    hints: [
      "Use Kadane's Algorithm: track the current subarray sum and the global maximum.",
      'At each element, decide: extend the previous subarray or start fresh from current element.',
      'currentSum = max(nums[i], currentSum + nums[i])',
    ],
    testCases: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', expected: '6' },
      { input: 'nums = [1]', expected: '1' },
      { input: 'nums = [5,4,-1,7,8]', expected: '23' },
    ],
    inputParams: ['nums'],
  },
  {
    id: 3,
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    topic: 'Stack',
    companies: ['Google', 'Bloomberg', 'Uber'],
    description:
      'Given a string <code>s</code> containing just the characters <code>(</code>, <code>)</code>, <code>{</code>, <code>}</code>, <code>[</code> and <code>]</code>, determine if the input string is <strong>valid</strong>.\n\nAn input string is valid if:<br />- Open brackets must be closed by the same type of brackets.<br />- Open brackets must be closed in the correct order.<br />- Every close bracket has a corresponding open bracket of the same type.',
    examples: [
      { input: 's = "()"', output: 'true', explanation: 'Single pair of matching parentheses.' },
      { input: 's = "()[]{}"', output: 'true', explanation: 'All brackets properly closed in order.' },
      { input: 's = "(]"', output: 'false', explanation: 'Mismatched bracket types.' },
    ],
    constraints: ['1 <= s.length <= 10^4', "s consists of parentheses only '()[]{}'."],
    hints: [
      'Use a stack to track opening brackets.',
      'When you see a closing bracket, check if it matches the top of the stack.',
      'At the end, the stack should be empty for a valid string.',
    ],
    testCases: [
      { input: 's = "()"', expected: 'true' },
      { input: 's = "()[]{}"', expected: 'true' },
      { input: 's = "(]"', expected: 'false' },
    ],
    inputParams: ['s'],
  },
]

export default function TryCodingIDE() {
  const [problems, setProblems] = useState<Problem[]>(SAMPLE_PROBLEMS)
  const [selected, setSelected] = useState<Problem>(SAMPLE_PROBLEMS[0])

  useEffect(() => {
    loadCollection<any>('/dsa-problems')
      .then(items => {
        const mapped = items.slice(0, 5).map((item, index) => ({
          id: index + 1,
          problemId: item.id,
          title: item.title,
          difficulty: item.difficulty,
          topic: item.topic,
          companies: item.companies || [],
          description: item.description,
          examples: item.examples || [],
          constraints: item.constraints || [],
          hints: item.hints || item.tags || [],
          testCases: item.sampleTestCases || [],
          inputParams: item.inputParams,
        }))
        if (mapped.length) {
          setProblems(mapped)
          setSelected(mapped[0])
        }
      })
      .catch(error => console.warn('Failed to load demo coding problems', error))
  }, [])

  return (
    <div className="dark flex h-screen flex-col overflow-hidden" style={{ background: '#06070d' }}>
      <div
        className="z-10 flex h-14 flex-shrink-0 items-center justify-between gap-4 px-5"
        style={{ background: 'rgba(99,102,241,0.1)', borderBottom: '1px solid rgba(99,102,241,0.2)' }}
      >
        <div className="flex min-w-0 items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
          >
            <Zap size={14} className="text-white" />
          </div>
          <span className="text-base font-black text-white">PrepAce</span>
          <span
            className="rounded-full px-2 py-0.5 text-xs font-semibold"
            style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}
          >
            Demo
          </span>
        </div>

        <div className="flex min-w-0 items-center gap-3">
          <div className="hidden min-w-0 gap-2 lg:flex">
            {problems.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className="max-w-48 truncate rounded-full px-4 py-2 text-sm font-semibold transition-all"
                style={{
                  background: selected.id === p.id ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)',
                  color: selected.id === p.id ? '#c4b5fd' : 'rgba(255,255,255,0.6)',
                  border: `1px solid ${selected.id === p.id ? 'rgba(99,102,241,0.5)' : 'transparent'}`,
                }}
              >
                {p.id}. {p.title}
              </button>
            ))}
          </div>

          <Link
            to="/auth/register"
            className="hidden items-center gap-1.5 rounded-full px-5 py-2 text-sm font-bold text-white transition-all hover:opacity-90 sm:flex"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
          >
            Sign Up Free <ArrowRight size={15} />
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm font-medium transition-all hover:opacity-70"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            <ArrowLeft size={14} /> Back
          </Link>
        </div>
      </div>

      <div
        className="flex flex-shrink-0 gap-2 overflow-x-auto px-3 py-2 lg:hidden"
        style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {problems.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected(p)}
            className="whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-all"
            style={{
              background: selected.id === p.id ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)',
              color: selected.id === p.id ? '#c4b5fd' : 'rgba(255,255,255,0.5)',
            }}
          >
            {p.title}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <ProblemIDE key={selected.id} problem={selected} onBack={() => {}} showBack={false} />
      </div>

      <div
        className="flex h-14 flex-shrink-0 items-center justify-between gap-4 px-6 text-sm"
        style={{ background: 'rgba(0,0,0,0.4)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <p className="flex min-w-0 items-center gap-2 truncate" style={{ color: 'rgba(255,255,255,0.58)' }}>
          <Lock size={15} className="flex-shrink-0" style={{ color: '#a5b4fc' }} />
          <span className="truncate">Sign up to unlock 500+ problems, DSA tracker, mock tests and more</span>
        </p>
        <Link
          to="/auth/register"
          className="flex flex-shrink-0 items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-bold text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
        >
          Get Full Access <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}
