import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, Bookmark, BookmarkCheck, StickyNote,
  CheckCircle2, Circle, Clock, ArrowLeft, Sun, Moon, Code2
} from 'lucide-react'
import ProblemIDE, { type Problem } from '../components/ProblemIDE'
import { useAppContext } from '../context/AppContext'
import type { Theme } from '../App'

const TOPIC_COLORS = ['#6366f1','#8b5cf6','#06b6d4','#22c55e','#f59e0b','#ef4444','#ec4899','#10b981','#f97316','#a855f7','#3b82f6','#14b8a6','#f43f5e','#84cc16','#eab308']

// Legacy detail map kept for ProblemIDE compat when AppContext problems have full detail
const problemDetails: Record<number, Pick<Problem, 'description' | 'examples' | 'constraints' | 'hints' | 'testCases'>> = {
  1: {
    description: 'Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to target. You may assume each input has exactly one solution and you may not use the same element twice.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: 'Because nums[1] + nums[2] == 6' },
    ],
    constraints: ['2 ≤ nums.length ≤ 10⁴', '-10⁹ ≤ nums[i] ≤ 10⁹', 'Only one valid answer exists.'],
    hints: ['Think about using a hash map.', 'For each element, check if target - element exists in the map.'],
    testCases: [
      { input: 'nums = [2,7,11,15]\ntarget = 9', expected: '[0,1]' },
      { input: 'nums = [3,2,4]\ntarget = 6', expected: '[1,2]' },
      { input: 'nums = [3,3]\ntarget = 6', expected: '[0,1]' },
    ],
  },
  2: {
    description: 'Given a string <code>s</code>, find the length of the longest substring without repeating characters.',
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' },
      { input: 's = "bbbbb"', output: '1', explanation: 'The answer is "b", with the length of 1.' },
    ],
    constraints: ['0 ≤ s.length ≤ 5 * 10⁴', 's consists of English letters, digits, symbols and spaces.'],
    hints: ['Use a sliding window with a set.', 'Expand the right pointer and shrink the left when a duplicate is found.'],
    testCases: [
      { input: 's = "abcabcbb"', expected: '3' },
      { input: 's = "bbbbb"', expected: '1' },
      { input: 's = "pwwkew"', expected: '3' },
    ],
  },
  3: {
    description: 'Given two sorted arrays <code>nums1</code> and <code>nums2</code> of size <code>m</code> and <code>n</code> respectively, return the median of the two sorted arrays.',
    examples: [
      { input: 'nums1 = [1,3], nums2 = [2]', output: '2.0', explanation: 'Merged array = [1,2,3] and median is 2.' },
      { input: 'nums1 = [1,2], nums2 = [3,4]', output: '2.5', explanation: 'Merged = [1,2,3,4], median is (2+3)/2 = 2.5.' },
    ],
    constraints: ['m + n >= 1', 'nums1 and nums2 are sorted in non-decreasing order.'],
    hints: ['Binary search on the smaller array.', 'Partition both arrays such that left half contains (m+n)/2 elements.'],
    testCases: [
      { input: 'nums1 = [1,3]\nnums2 = [2]', expected: '2.0' },
      { input: 'nums1 = [1,2]\nnums2 = [3,4]', expected: '2.5' },
    ],
  },
}

const defaultDetail = {
  description: 'Solve this problem using optimal data structures and algorithms.',
  examples: [{ input: 'input = sample', output: 'output', explanation: 'Sample explanation.' }],
  constraints: ['1 ≤ n ≤ 10⁵', 'Values within integer range'],
  hints: ['Think about the time complexity.', 'Consider space-time tradeoffs.'],
  testCases: [{ input: 'input = sample', expected: 'output' }],
}

function diffColor(d: string) {
  if (d === 'Easy') return { color: '#22c55e', bg: 'rgba(34,197,94,0.1)' }
  if (d === 'Medium') return { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' }
  return { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' }
}

function statusIcon(s: string) {
  if (s === 'solved') return <CheckCircle2 size={16} style={{ color: '#22c55e' }} />
  if (s === 'attempted') return <Clock size={16} style={{ color: '#f59e0b' }} />
  return <Circle size={16} style={{ color: 'var(--muted-foreground)' }} />
}

function ProgressRing({ pct, color, size = 56 }: { pct: number; color: string; size?: number }) {
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={5} fill="none" style={{ stroke: 'var(--border)' }} />
      <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={5} fill="none" stroke={color}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
    </svg>
  )
}

export default function DSATracker({ theme, toggleTheme }: { theme?: Theme; toggleTheme?: () => void }) {
  const { dsaProblems, codeSubmissions } = useAppContext()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [difficulty, setDifficulty] = useState('all')
  const submissionStatus = useMemo(() => {
    const solved = new Set<string>()
    const attempted = new Set<string>()
    Object.entries(codeSubmissions).forEach(([problemId, submissions]) => {
      if (submissions.some(sub => sub.verdict === 'Accepted')) solved.add(problemId)
      else if (submissions.length) attempted.add(problemId)
    })
    return { solved, attempted }
  }, [codeSubmissions])
  const [manualSolved, setManualSolved] = useState<Set<string>>(new Set())
  const [manualAttempted, setManualAttempted] = useState<Set<string>>(new Set())
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set(['d4', 'd9']))
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null)

  // Derive unique topics with stats
  const topicMap = new Map<string, { total: number; solved: number; color: string }>()
  dsaProblems.forEach(p => {
    const existing = topicMap.get(p.topic)
    const isSolved = submissionStatus.solved.has(p.id) || manualSolved.has(p.id)
    if (existing) { existing.total++; if (isSolved) existing.solved++ }
    else {
      const colorIdx = topicMap.size % TOPIC_COLORS.length
      topicMap.set(p.topic, { total: 1, solved: isSolved ? 1 : 0, color: TOPIC_COLORS[colorIdx] })
    }
  })
  const topics = Array.from(topicMap.entries()).map(([name, stats]) => ({ name, ...stats }))

  function getStatus(id: string) {
    if (submissionStatus.solved.has(id) || manualSolved.has(id)) return 'solved'
    if (submissionStatus.attempted.has(id) || manualAttempted.has(id)) return 'attempted'
    return 'unsolved'
  }

  // Cycle: unsolved → attempted → solved → unsolved
  function toggleStatus(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    const cur = getStatus(id)
    setManualSolved(prev => { const n = new Set(prev); n.delete(id); return n })
    setManualAttempted(prev => { const n = new Set(prev); n.delete(id); return n })
    if (cur === 'unsolved') setManualAttempted(prev => new Set([...prev, id]))
    else if (cur === 'attempted') setManualSolved(prev => new Set([...prev, id]))
    // solved → unsolved: already cleared above
  }

  const filteredProblems = dsaProblems.filter(p => {
    const status = getStatus(p.id)
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.topic.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || status === filter || (filter === 'bookmarked' && bookmarks.has(p.id))
    const matchDiff = difficulty === 'all' || p.difficulty.toLowerCase() === difficulty
    return matchSearch && matchFilter && matchDiff
  })

  const totalSolvedCount = new Set([...submissionStatus.solved, ...manualSolved]).size
  const totalProblems = dsaProblems.length

  function openProblem(p: typeof dsaProblems[0]) {
    const problemNumber = dsaProblems.findIndex(problem => problem.id === p.id) + 1
    const legacyDetail = problemDetails[problemNumber as keyof typeof problemDetails]
    setSelectedProblem({
      id: problemNumber || 1,
      title: p.title,
      difficulty: p.difficulty,
      topic: p.topic,
      companies: p.companies,
      description: p.description || legacyDetail?.description || defaultDetail.description,
      examples: (p.examples || legacyDetail?.examples || defaultDetail.examples).map(e => ({ ...e, explanation: e.explanation ?? '' })),
      constraints: p.constraints?.length ? p.constraints : (legacyDetail?.constraints || defaultDetail.constraints),
      hints: (p as any).hints || p.tags || legacyDetail?.hints || defaultDetail.hints,
      testCases: p.sampleTestCases?.length ? p.sampleTestCases : (legacyDetail?.testCases || defaultDetail.testCases),
      inputParams: p.inputParams,
      problemId: p.id,
      starterCode: p.starterCode,
    })
    if (!submissionStatus.solved.has(p.id) && !submissionStatus.attempted.has(p.id) && !manualSolved.has(p.id) && !manualAttempted.has(p.id)) {
      setManualAttempted(prev => new Set([...prev, p.id]))
    }
  }

  const TopBar = () => (
    <div className="flex items-center justify-between px-4 h-14 flex-shrink-0"
      style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/app/dashboard')}
          className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
          style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
          <ArrowLeft size={14} />
          Dashboard
        </button>
        <div className="flex items-center gap-2">
          <Code2 size={18} style={{ color: 'var(--primary)' }} />
          <span className="font-black text-base" style={{ color: 'var(--foreground)' }}>PrepAce <span className="font-normal opacity-60 hidden md:inline">/ DSA Tracker</span></span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold px-3 py-1.5 rounded-lg"
          style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
          {totalSolvedCount}/{totalProblems} solved
        </span>
        {toggleTheme && (
          <button onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:opacity-80"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        )}
      </div>
    </div>
  )

  if (selectedProblem) {
    const curIdx = filteredProblems.findIndex(p => dsaProblems.findIndex(problem => problem.id === p.id) + 1 === selectedProblem.id)
    const nextRaw = filteredProblems[curIdx + 1] ?? null
    const handleNext = nextRaw ? () => openProblem(nextRaw) : undefined
    return (
      <div className="flex flex-col" style={{ height: '100dvh', background: 'var(--background)' }}>
        <TopBar />
        <div className="flex-1 min-h-0">
          <ProblemIDE
            problem={selectedProblem}
            onBack={() => setSelectedProblem(null)}
            showBack
            onNext={handleNext}
            theme={theme}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col" style={{ minHeight: '100dvh', background: 'var(--background)' }}>
      <TopBar />
      <div className="flex-1 p-4 lg:p-6 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--foreground)' }}>DSA Tracker</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            {totalSolvedCount}/{totalProblems} problems solved — click any problem to open the IDE
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
          style={{ background: 'var(--gradient-primary)' }}>
          <CheckCircle2 size={14} />
          {totalProblems ? Math.round((totalSolvedCount / totalProblems) * 100) : 0}% Complete
        </div>
      </div>

      {/* Topic cards */}
      <div className="hidden md:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {topics.map(({ name, total, solved, color }) => {
          const pct = Math.round((solved / total) * 100)
          return (
            <div key={name} className="p-4 rounded-2xl transition-all hover:scale-[1.02]"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-3">
                <ProgressRing pct={pct} color={color} />
                <span className="text-lg font-black" style={{ color: 'var(--foreground)' }}>{pct}%</span>
              </div>
              <p className="text-xs font-semibold leading-tight mb-1" style={{ color: 'var(--foreground)' }}>{name}</p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{solved}/{total}</p>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search problems..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'solved', 'attempted', 'unsolved', 'bookmarked'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all"
              style={{
                background: filter === f ? 'var(--primary)' : 'var(--card)',
                color: filter === f ? 'white' : 'var(--muted-foreground)',
                border: '1px solid var(--border)',
              }}>
              {f}
            </button>
          ))}
          {(['easy', 'medium', 'hard'] as const).map(d => (
            <button key={d} onClick={() => setDifficulty(difficulty === d ? 'all' : d)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all"
              style={{
                background: difficulty === d ? 'var(--accent)' : 'var(--card)',
                color: difficulty === d ? 'white' : 'var(--muted-foreground)',
                border: '1px solid var(--border)',
              }}>
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Problem table — desktop */}
      <div className="rounded-2xl overflow-hidden hidden md:block" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="grid grid-cols-12 px-5 py-3 text-xs font-semibold uppercase tracking-wider"
          style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', borderBottom: '1px solid var(--border)' }}>
          <div className="col-span-1">Status</div>
          <div className="col-span-4">Problem</div>
          <div className="col-span-2">Topic</div>
          <div className="col-span-2">Difficulty</div>
          <div className="col-span-2">Companies</div>
          <div className="col-span-1">Save</div>
        </div>
        {filteredProblems.map((p, i) => {
          const { color, bg } = diffColor(p.difficulty)
          const isBookmarked = bookmarks.has(p.id)
          const status = getStatus(p.id)
          return (
            <div key={p.id} onClick={() => openProblem(p)}
              className="grid grid-cols-12 px-5 py-3.5 items-center cursor-pointer transition-all hover:opacity-80"
              style={{ borderBottom: i < filteredProblems.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div className="col-span-1">
                <button onClick={e => toggleStatus(e, p.id)} title="Click to cycle status" className="hover:scale-110 transition-transform">
                  {statusIcon(status)}
                </button>
              </div>
              <div className="col-span-4">
                <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{p.title}</span>
              </div>
              <div className="col-span-2">
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{p.topic}</span>
              </div>
              <div className="col-span-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ color, background: bg }}>{p.difficulty}</span>
              </div>
              <div className="col-span-2 flex gap-1 flex-wrap">
                {p.companies.slice(0, 2).map(c => (
                  <span key={c} className="text-xs px-2 py-0.5 rounded-md" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>{c}</span>
                ))}
              </div>
              <div className="col-span-1">
                <button onClick={e => { e.stopPropagation(); setBookmarks(prev => { const n = new Set(prev); n.has(p.id) ? n.delete(p.id) : n.add(p.id); return n }) }}
                  style={{ color: isBookmarked ? '#f59e0b' : 'var(--muted-foreground)' }}>
                  {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                </button>
              </div>
            </div>
          )
        })}
        {filteredProblems.length === 0 && (
          <div className="py-16 text-center" style={{ color: 'var(--muted-foreground)' }}>
            <StickyNote size={32} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No problems match your filters</p>
          </div>
        )}
      </div>

      {/* Problem cards — mobile */}
      <div className="md:hidden space-y-2">
        {filteredProblems.map(p => {
          const { color, bg } = diffColor(p.difficulty)
          const isBookmarked = bookmarks.has(p.id)
          const status = getStatus(p.id)
          return (
            <div key={p.id} onClick={() => openProblem(p)}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all hover:opacity-80"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <button className="flex-shrink-0 hover:scale-110 transition-transform" onClick={e => toggleStatus(e, p.id)} title="Click to cycle status">
                {statusIcon(status)}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>{p.title}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{p.topic}</p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-lg flex-shrink-0" style={{ color, background: bg }}>{p.difficulty}</span>
              <button onClick={e => { e.stopPropagation(); setBookmarks(prev => { const n = new Set(prev); n.has(p.id) ? n.delete(p.id) : n.add(p.id); return n }) }}
                className="flex-shrink-0" style={{ color: isBookmarked ? '#f59e0b' : 'var(--muted-foreground)' }}>
                {isBookmarked ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
              </button>
            </div>
          )
        })}
        {filteredProblems.length === 0 && (
          <div className="py-12 text-center" style={{ color: 'var(--muted-foreground)' }}>
            <StickyNote size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No problems match your filters</p>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
