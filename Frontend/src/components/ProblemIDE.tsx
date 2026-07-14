import { useState, useEffect, useRef } from 'react'
import {
  ArrowLeft, Play, Send, RotateCcw, Bookmark, BookmarkCheck,
  MessageSquare, Lightbulb, CheckCircle2, XCircle, Clock, Cpu,
  Code2, ChevronRight, Loader2, History,
  Zap, MemoryStick, FlaskConical, Timer, PauseCircle, PlayCircle,
  LayoutPanelLeft, Columns2, Maximize2, ChevronDown, Sun, Moon, ChevronUp,
} from 'lucide-react'
import { useAppContext, type VerdictType, type CodeSubmission } from '../context/AppContext'
import { codeService } from '../lib/services'

export interface Problem {
  id: number
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  topic: string
  companies: string[]
  description: string
  examples: { input: string; output: string; explanation: string }[]
  constraints: string[]
  hints: string[]
  testCases: { input: string; expected: string }[]
  inputParams?: string[]   // named params e.g. ['nums', 'target']
  problemId?: string       // AppContext problem id for submission history
  starterCode?: Partial<Record<Lang, string>>
}

type Lang = 'python' | 'javascript' | 'java' | 'cpp' | 'c'
type LeftTab = 'problem' | 'editorial' | 'hints' | 'discussion' | 'submissions'
type BottomTab = 'testcases' | 'output'
type MobilePanel = 'problem' | 'code'
type LayoutPreset = 'default' | 'focus' | 'split'
type TimerMode = 'stopwatch' | 'countdown'

const LANG_LABELS: Record<Lang, string> = {
  python: 'Python', javascript: 'JavaScript', java: 'Java', cpp: 'C++', c: 'C',
}

const STARTERS: Record<Lang, (fn: string) => string> = {
  python: (fn) => `def ${fn}(nums, target):\n    # Your solution here\n    pass`,
  javascript: (fn) => `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar ${fn} = function(nums, target) {\n    // Your solution here\n};`,
  java: (_fn) => `class Solution {\n    public int[] solve(int[] nums, int target) {\n        // Your solution here\n        return new int[]{};\n    }\n}`,
  cpp: (_fn) => `class Solution {\npublic:\n    vector<int> solve(vector<int>& nums, int target) {\n        // Your solution here\n        return {};\n    }\n};`,
  c: (_fn) => `int* solve(int* nums, int numsSize, int target, int* returnSize) {\n    int* result = malloc(2 * sizeof(int));\n    *returnSize = 0;\n    // Your solution here\n    return result;\n}`,
}

const diffColors: Record<string, { color: string; bg: string }> = {
  Easy: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  Medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  Hard: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
}

const VERDICT_META: Record<VerdictType, { icon: string; color: string; bg: string; border: string }> = {
  'Accepted':            { icon: '✅', color: '#22c55e', bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.25)' },
  'Wrong Answer':        { icon: '❌', color: '#ef4444', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.25)' },
  'Time Limit Exceeded': { icon: '⏱',  color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
  'Runtime Error':       { icon: '💥', color: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.25)' },
  'Compilation Error':   { icon: '❗', color: '#a855f7', bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.25)' },
}

// Parse named inputs from a multi-line input string
function parseNamedInputs(input: string, params: string[]): { name: string; value: string }[] {
  const lines = input.split('\n').filter(l => l.trim() !== '')
  return params.map((name, i) => {
    const line = lines[i] ?? ''
    // Strip "name = " prefix if present
    const eqIdx = line.indexOf('=')
    const value = eqIdx >= 0 && line.substring(0, eqIdx).trim().toLowerCase() === name.toLowerCase()
      ? line.substring(eqIdx + 1).trim()
      : line.trim()
    return { name, value }
  })
}

// Simulate run result — 2 pass, 1 fail for realism
function simulateRun(testCases: Problem['testCases']) {
  return testCases.map((tc, i) => ({
    ...tc,
    actual: i < testCases.length - 1 ? tc.expected : `[${tc.expected.slice(1, -1).split(',').reverse().join(',')}]`,
    pass: i < testCases.length - 1,
    time: `${28 + i * 14}ms`,
    memory: `${14.2 + i * 0.3}MB`,
  }))
}

// Simulate submit verdict
function simulateSubmit(testCases: Problem['testCases'], attempt: number): {
  verdict: VerdictType
  testsPassed: number
  totalTests: number
  runtime: string
  memory: string
  errorMsg?: string
  failedInput?: string
  failedExpected?: string
  failedActual?: string
  perTestResults?: { input: string; expected: string; actual: string; pass: boolean; time: string }[]
} {
  const total = testCases.length + 3 // hidden tests
  const rand = Math.random()
  // First attempt: 90% Accepted, then more variance
  const acceptThreshold = attempt === 1 ? 0.9 : 0.72

  // Build per-test results for visible test cases
  const buildPerTest = (passCount: number) =>
    testCases.map((tc, i) => ({
      input: tc.input,
      expected: tc.expected,
      actual: i < passCount ? tc.expected : `[${tc.expected.slice(1, -1).split(',').reverse().join(',')}]`,
      pass: i < passCount,
      time: `${22 + i * 12}ms`,
    }))

  if (rand < acceptThreshold) {
    return {
      verdict: 'Accepted',
      testsPassed: total,
      totalTests: total,
      runtime: `${24 + Math.floor(Math.random() * 30)}ms`,
      memory: `${14 + (Math.random() * 2).toFixed(1)}MB`,
      perTestResults: buildPerTest(testCases.length),
    }
  } else if (rand < acceptThreshold + 0.12) {
    const failAt = Math.floor(Math.random() * testCases.length)
    const tc = testCases[failAt]
    return {
      verdict: 'Wrong Answer',
      testsPassed: failAt,
      totalTests: total,
      runtime: `${24 + Math.floor(Math.random() * 20)}ms`,
      memory: `${14 + (Math.random() * 2).toFixed(1)}MB`,
      failedInput: tc?.input ?? 'n = 5',
      failedExpected: tc?.expected ?? '5',
      failedActual: '[wrong output]',
      perTestResults: buildPerTest(failAt),
    }
  } else if (rand < acceptThreshold + 0.20) {
    return {
      verdict: 'Time Limit Exceeded',
      testsPassed: Math.floor(total * 0.6),
      totalTests: total,
      runtime: '>2000ms',
      memory: `${24 + (Math.random() * 4).toFixed(1)}MB`,
      errorMsg: 'Time Limit Exceeded\n\nYour solution took longer than 2 seconds on test case ' + (Math.floor(total * 0.6) + 1) + '.\n\nHint: Check for nested loops O(n²) or infinite loops. Consider a more efficient approach using hash maps or sorting.',
    }
  } else if (rand < acceptThreshold + 0.26) {
    const runtimeErrors = [
      'Traceback (most recent call last):\n  File "solution.py", line 4, in twoSum\n    return [seen[complement], i]\nIndexError: list index out of range\n\nInput was a large array — check boundary conditions.',
      'Traceback (most recent call last):\n  File "solution.py", line 3, in twoSum\n    for i in range(len(nums)):\nTypeError: object of type \'NoneType\' has no len()\n\nMake sure your function handles null/None input.',
      'Traceback (most recent call last):\n  File "solution.py", line 6, in twoSum\n    result = nums[idx]\nIndexError: list index out of range (index 10, size 3)',
    ]
    return {
      verdict: 'Runtime Error',
      testsPassed: Math.floor(total * 0.4),
      totalTests: total,
      runtime: `${10 + Math.floor(Math.random() * 15)}ms`,
      memory: `${12 + (Math.random() * 2).toFixed(1)}MB`,
      errorMsg: runtimeErrors[Math.floor(Math.random() * runtimeErrors.length)],
    }
  } else {
    const compileErrors = [
      'SyntaxError: invalid syntax (solution.py, line 3)\n\n    def twoSum(nums target):  # ← missing comma\n                     ^\nExpected \',\' or \')\' in argument list.',
      'SyntaxError: expected \':\' (solution.py, line 2)\n\n    def twoSum(nums, target)\n                            ^\nMissing colon at end of function definition.',
      'IndentationError: unexpected indent (solution.py, line 5)\n\n        return result  # ← bad indentation\n    ^\nCode block is not properly indented inside the function.',
    ]
    return {
      verdict: 'Compilation Error',
      testsPassed: 0,
      totalTests: total,
      runtime: '—',
      memory: '—',
      errorMsg: compileErrors[Math.floor(Math.random() * compileErrors.length)],
    }
  }
}

interface Props {
  problem: Problem
  onBack: () => void
  showBack?: boolean
  onNext?: () => void
  theme?: 'dark' | 'light'
}

export default function ProblemIDE({ problem, onBack, showBack = true, onNext, theme }: Props) {
  const { codeSubmissions, addCodeSubmission } = useAppContext()
  const problemId = problem.problemId ?? String(problem.id)

  const [lang, setLang] = useState<Lang>('python')
  const [code, setCode] = useState('')
  const [leftTab, setLeftTab] = useState<LeftTab>('problem')
  const [bottomTab, setBottomTab] = useState<BottomTab>('testcases')
  const [running, setRunning] = useState(false)
  const [runMode, setRunMode] = useState<'run' | 'submit' | 'custom' | null>(null)
  const [runResults, setRunResults] = useState<any[] | null>(null)
  const [submitResult, setSubmitResult] = useState<any | null>(null)
  const [bookmarked, setBookmarked] = useState(false)
  const [activeTestIdx, setActiveTestIdx] = useState(0)
  // Custom case (shown inside testcases tab after clicking "+")
  const [showCustomCase, setShowCustomCase] = useState(false)
  const [customInputs, setCustomInputs] = useState<string[]>([])
  const [customExpected, setCustomExpected] = useState('')
  const [customInput, setCustomInput] = useState('') // raw fallback for non-param mode
  const [customOutput, setCustomOutput] = useState<{ text: string; runtime: string; memory: string } | null>(null)
  // Track submit attempts per session for simulation realism
  const [submitAttempts, setSubmitAttempts] = useState(0)
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('problem')
  // Layout preset
  const [layout, setLayout] = useState<LayoutPreset>('default')
  const [layoutOpen, setLayoutOpen] = useState(false)
  // Editor theme — follows app theme by default
  const [editorDark, setEditorDark] = useState(theme !== 'light')
  // Stopwatch
  const [swSeconds, setSwSeconds] = useState(0)
  const [swRunning, setSwRunning] = useState(true)
  const swRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // Countdown timer
  const [timerMode, setTimerMode] = useState<TimerMode>('stopwatch')
  const [countdownTotal, setCountdownTotal] = useState(30 * 60) // 30 min default
  const [countdownLeft, setCountdownLeft] = useState(30 * 60)
  const [countdownRunning, setCountdownRunning] = useState(false)
  const [countdownFinished, setCountdownFinished] = useState(false)
  const [showTimerPicker, setShowTimerPicker] = useState(false)
  const cdRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Draggable divider — left panel width (px), null = use layout default
  const [leftWidth, setLeftWidth] = useState<number | null>(null)
  const dividerDragging = useRef(false)
  const dividerStartX = useRef(0)
  const dividerStartW = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Draggable console height
  const [consoleH, setConsoleH] = useState(280)
  const [consoleVisible, setConsoleVisible] = useState(true)
  const consoleDragging = useRef(false)
  const consoleStartY = useRef(0)
  const consoleStartH = useRef(0)

  const submissions = codeSubmissions[problemId] ?? []

  // Stopwatch tick
  useEffect(() => {
    if (swRunning) {
      swRef.current = setInterval(() => setSwSeconds(s => s + 1), 1000)
    } else {
      if (swRef.current) clearInterval(swRef.current)
    }
    return () => { if (swRef.current) clearInterval(swRef.current) }
  }, [swRunning])

  // Countdown tick
  useEffect(() => {
    if (countdownRunning && !countdownFinished) {
      cdRef.current = setInterval(() => {
        setCountdownLeft(t => {
          if (t <= 1) {
            setCountdownFinished(true)
            setCountdownRunning(false)
            return 0
          }
          return t - 1
        })
      }, 1000)
    } else {
      if (cdRef.current) clearInterval(cdRef.current)
    }
    return () => { if (cdRef.current) clearInterval(cdRef.current) }
  }, [countdownRunning, countdownFinished])

  // Reset both timers when problem changes
  useEffect(() => {
    setSwSeconds(0)
    setSwRunning(true)
    setCountdownLeft(countdownTotal)
    setCountdownRunning(false)
    setCountdownFinished(false)
  }, [problem.id])

  // Reset panel sizes when layout changes
  useEffect(() => {
    setLeftWidth(null)
    setConsoleH(280)
  }, [layout])

  useEffect(() => {
    const fn = problem.title.toLowerCase().replace(/[^a-z]/g, '_')
    const latest = submissions.find(submission => submission.lang === lang)
    setCode(latest?.code || problem.starterCode?.[lang] || STARTERS[lang](fn))
  }, [lang, problem.id, problem.problemId, submissions])

  useEffect(() => {
    setRunResults(null)
    setSubmitResult(null)
    setRunMode(null)
    setBottomTab('testcases')
    setActiveTestIdx(0)
    setCustomOutput(null)
    setShowCustomCase(false)
    setCustomInputs([])
    setCustomExpected('')
    setSubmitAttempts(0)
  }, [problem.id])

  // Horizontal divider drag handlers
  function onDividerMouseDown(e: React.MouseEvent) {
    e.preventDefault()
    dividerDragging.current = true
    dividerStartX.current = e.clientX
    dividerStartW.current = leftWidth ?? (containerRef.current ? containerRef.current.offsetWidth * 0.4 : 400)
    const onMove = (mv: MouseEvent) => {
      if (!dividerDragging.current) return
      const delta = mv.clientX - dividerStartX.current
      const total = containerRef.current?.offsetWidth ?? 1000
      const next = Math.max(200, Math.min(total - 250, dividerStartW.current + delta))
      setLeftWidth(next)
    }
    const onUp = () => { dividerDragging.current = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // Console height drag handlers
  function onConsoleDragMouseDown(e: React.MouseEvent) {
    e.preventDefault()
    consoleDragging.current = true
    consoleStartY.current = e.clientY
    consoleStartH.current = consoleH
    const onMove = (mv: MouseEvent) => {
      if (!consoleDragging.current) return
      const delta = consoleStartY.current - mv.clientY
      setConsoleH(Math.max(180, Math.min(520, consoleStartH.current + delta)))
    }
    const onUp = () => { consoleDragging.current = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const dc = diffColors[problem.difficulty]
  const lineCount = code.split('\n').length

  async function handleRun() {
    setRunning(true)
    setRunMode('run')
    setSubmitResult(null)
    setRunResults(null)
    setBottomTab('output')
    setConsoleVisible(true)
    if (layout === 'default') setMobilePanel('code')
    try {
      const results = await Promise.all(problem.testCases.map(async (tc) => {
        const result: any = await codeService.run({ language: lang, code, input: tc.input })
        const actual = String(result.output ?? result.stdout ?? '').trim()
        const expected = String(tc.expected ?? '').trim()
        return {
          input: tc.input,
          expected,
          actual,
          pass: Boolean(result.passed) && actual === expected,
          time: result.executionTimeMs ? `${result.executionTimeMs}ms` : result.runtime || '-',
          memory: result.memory || '-',
          error: result.error || result.stderr,
        }
      }))
      setRunResults(results)
    } catch (error) {
      setRunResults([{
        input: problem.testCases[0]?.input || '',
        expected: problem.testCases[0]?.expected || '',
        actual: '',
        pass: false,
        time: '-',
        memory: '-',
        error: error instanceof Error ? error.message : 'Code execution failed',
      }])
    } finally {
      setRunning(false)
    }
  }

  async function handleSubmit() {
    setRunning(true)
    setRunMode('submit')
    setRunResults(null)
    setSubmitResult(null)
    setBottomTab('output')
    setConsoleVisible(true)
    const attempt = submitAttempts + 1
    setSubmitAttempts(attempt)
    try {
      const result: any = await codeService.judge({
        language: lang,
        code,
        testCases: problem.testCases,
        problemId,
      })
      const perTestResults = (result.results || []).map((r: any) => ({
        input: r.input,
        expected: r.expected,
        actual: r.actual,
        pass: r.pass,
        time: r.executionTimeMs ? `${r.executionTimeMs}ms` : '-',
        error: r.error || r.stderr,
      }))
      const normalized = {
        verdict: result.verdict || (result.passed ? 'Accepted' : 'Wrong Answer'),
        testsPassed: result.testsPassed || 0,
        totalTests: result.totalTests || problem.testCases.length,
        runtime: perTestResults[0]?.time || '-',
        memory: '-',
        errorMsg: perTestResults.find((r: any) => !r.pass)?.error,
        perTestResults,
      }
      setSubmitResult(normalized)
      const sub: CodeSubmission = {
        id: result.submission?.id || result.submission?._id || `sub-${Date.now()}`,
        problemId,
        lang,
        code,
        verdict: normalized.verdict as VerdictType,
        timestamp: new Date().toLocaleString(),
        runtime: normalized.runtime,
        memory: normalized.memory,
        testsPassed: normalized.testsPassed,
        totalTests: normalized.totalTests,
      }
      addCodeSubmission(sub)
      if (normalized.verdict === 'Accepted') {
        setTimeout(() => window.dispatchEvent(new Event('prepace:progress-updated')), 0)
      }
      setLeftTab('submissions')
    } catch (error) {
      const result = {
        verdict: 'Runtime Error' as VerdictType,
        testsPassed: 0,
        totalTests: problem.testCases.length,
        runtime: '-',
        memory: '-',
        errorMsg: error instanceof Error ? error.message : 'Submission failed',
        perTestResults: [],
      }
      setSubmitResult(result)
      addCodeSubmission({
        id: `sub-${Date.now()}`,
        problemId,
        lang,
        code,
        verdict: result.verdict,
        timestamp: new Date().toLocaleString(),
        runtime: result.runtime,
        memory: result.memory,
        testsPassed: result.testsPassed,
        totalTests: result.totalTests,
      })
      setLeftTab('submissions')
    } finally {
      setRunning(false)
    }
  }

  async function handleCustomRun() {
    const inputStr = problem.inputParams
      ? problem.inputParams.map((p, i) => `${p} = ${customInputs[i] ?? ''}`).join('\n')
      : customInput
    if (!inputStr.trim()) return
    setRunning(true)
    setRunMode('custom')
    setCustomOutput(null)
    setTimeout(() => {
      const runtime = `${18 + Math.floor(Math.random() * 35)}ms`
      const memory = `${(13.8 + Math.random() * 2).toFixed(1)}MB`
      setCustomOutput({
        text: `Your Input:\n${inputStr}\n\nOutput:\n[Execution simulated — no backend judge]\n\n✓ Code compiled successfully`,
        runtime,
        memory,
      })
      setRunning(false)
    }, 900)
  }

  const allRunPassed = runResults?.every(r => r.pass)

  // Derived timer values
  const swDisp = `${String(Math.floor(swSeconds / 60)).padStart(2, '0')}:${String(swSeconds % 60).padStart(2, '0')}`
  const cdDisp = `${String(Math.floor(countdownLeft / 60)).padStart(2, '0')}:${String(countdownLeft % 60).padStart(2, '0')}`
  const cdPct = countdownTotal > 0 ? (countdownLeft / countdownTotal) * 100 : 100

  const LAYOUT_OPTIONS: { id: LayoutPreset; label: string; icon: any; desc: string }[] = [
    { id: 'default', label: 'Default Layout', icon: LayoutPanelLeft, desc: 'Problem + Editor side by side' },
    { id: 'split', label: 'Split View', icon: Columns2, desc: 'Equal 50/50 split' },
    { id: 'focus', label: 'Focus Code', icon: Maximize2, desc: 'Editor only, no problem panel' },
  ]

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}
      ref={containerRef}
      onClick={() => { setLayoutOpen(false); setShowTimerPicker(false) }}>
      {/* Top bar */}
      <div className="flex flex-shrink-0 items-center gap-3 px-4 py-2"
        style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)', minHeight: 48 }}>
        {showBack && (
          <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-medium mr-1 transition-all hover:opacity-70"
            style={{ color: 'var(--muted-foreground)' }}>
            <ArrowLeft size={14} /> Problems
          </button>
        )}
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-bold" style={{ color: 'var(--foreground)' }}>{problem.id}. {problem.title}</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ color: dc.color, background: dc.bg }}>
            {problem.difficulty}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
            {problem.topic}
          </span>
        </div>

        {/* Centre: Layout Preset Dropdown */}
        <div className="hidden md:flex items-center gap-2 mx-auto relative" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => { setLayoutOpen(o => !o); setShowTimerPicker(false) }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
            {(() => { const opt = LAYOUT_OPTIONS.find(o => o.id === layout)!; const Icon = opt.icon; return <Icon size={13} /> })()}
            <span>{LAYOUT_OPTIONS.find(o => o.id === layout)?.label}</span>
            <ChevronDown size={11} style={{ color: 'var(--muted-foreground)' }} />
          </button>
          {layoutOpen && (
            <div className="absolute top-full mt-1 left-0 z-50 w-56 rounded-xl overflow-hidden shadow-2xl"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="p-1.5 text-xs font-bold px-3 pt-2 pb-1" style={{ color: 'var(--muted-foreground)' }}>PRESETS</div>
              {LAYOUT_OPTIONS.map(opt => {
                const Icon = opt.icon
                return (
                  <button key={opt.id} onClick={() => { setLayout(opt.id); setLayoutOpen(false) }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all hover:opacity-80"
                    style={{ background: layout === opt.id ? 'rgba(99,102,241,0.1)' : 'transparent', color: layout === opt.id ? 'var(--primary)' : 'var(--foreground)' }}>
                    <Icon size={14} />
                    <div>
                      <div className="text-xs font-semibold">{opt.label}</div>
                      <div className="text-xs opacity-60">{opt.desc}</div>
                    </div>
                    {layout === opt.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-current" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          {problem.companies.slice(0, 3).map(c => (
            <span key={c} className="text-xs px-2 py-0.5 rounded-md hidden md:inline"
              style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>{c}</span>
          ))}
          <button onClick={() => setBookmarked(b => !b)}
            className="p-1.5 rounded-lg transition-all hover:opacity-80"
            style={{ background: 'var(--muted)', color: bookmarked ? '#f59e0b' : 'var(--muted-foreground)' }}>
            {bookmarked ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
          </button>
          {onNext && submitResult?.verdict === 'Accepted' && (
            <button onClick={onNext}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'var(--gradient-primary)' }}>
              Next <ChevronRight size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Mobile panel tab switcher */}
      <div className="flex md:hidden flex-shrink-0" style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
        {(['problem', 'code'] as MobilePanel[]).map(p => (
          <button key={p} onClick={() => setMobilePanel(p)}
            className="flex-1 py-2 text-xs font-bold capitalize transition-all"
            style={{
              color: mobilePanel === p ? 'var(--primary)' : 'var(--muted-foreground)',
              borderBottom: mobilePanel === p ? '2px solid var(--primary)' : '2px solid transparent',
            }}>
            {p === 'problem' ? '📄 Problem' : '💻 Code'}
          </button>
        ))}
      </div>

      {/* Main 2-panel layout */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left: Problem description */}
        <div className={`min-h-0 flex-col overflow-hidden flex-shrink-0
          ${layout === 'focus' ? 'hidden' : ''}
          ${mobilePanel === 'problem' ? 'flex' : 'hidden md:flex'}
          ${layout !== 'focus' ? 'flex' : ''}
        `}
          style={{
            borderRight: '1px solid var(--border)',
            width: typeof window !== 'undefined' && window.innerWidth < 768
              ? '100%'
              : layout === 'split'
                ? (leftWidth != null ? leftWidth : '50%')
                : (leftWidth != null ? leftWidth : '41%'),
          }}>
          {/* Tabs: problem / editorial / hints / discussion / submissions */}
          <div className="flex flex-shrink-0 overflow-x-auto" style={{ borderBottom: '1px solid var(--border)' }}>
            {(['problem', 'editorial', 'hints', 'discussion', 'submissions'] as LeftTab[]).map(t => (
              <button key={t} onClick={() => setLeftTab(t)}
                className="px-3 py-2.5 text-xs font-semibold capitalize whitespace-nowrap relative"
                style={{
                  color: leftTab === t ? 'var(--primary)' : 'var(--muted-foreground)',
                  borderBottom: leftTab === t ? '2px solid var(--primary)' : '2px solid transparent',
                }}>
                {t}
                {t === 'submissions' && submissions.length > 0 && (
                  <span className="ml-1 text-xs font-bold" style={{ color: 'var(--primary)' }}>
                    {submissions.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Mobile: switch to code button */}
          <div className="flex md:hidden px-4 py-2 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
            <button onClick={() => setMobilePanel('code')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 ml-auto"
              style={{ background: 'var(--gradient-primary)', color: '#fff' }}>
              Write Code →
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-5 text-sm space-y-4" style={{ color: 'var(--foreground)' }}>
            {leftTab === 'problem' && (
              <>
                <p className="leading-relaxed" style={{ color: 'var(--foreground)' }}
                  dangerouslySetInnerHTML={{ __html: problem.description }} />
                <div className="space-y-3">
                  {problem.examples.map((ex, i) => (
                    <div key={i} className="p-4 rounded-xl" style={{ background: 'var(--muted)' }}>
                      <p className="font-semibold text-xs mb-2 uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
                        Example {i + 1}
                      </p>
                      <div className="mono text-xs space-y-1">
                        <p><span style={{ color: 'var(--muted-foreground)' }}>Input: </span>{ex.input}</p>
                        <p><span style={{ color: 'var(--muted-foreground)' }}>Output: </span>{ex.output}</p>
                        {ex.explanation && <p><span style={{ color: 'var(--muted-foreground)' }}>Explanation: </span>{ex.explanation}</p>}
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="font-semibold text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>Constraints</p>
                  <ul className="space-y-1">
                    {problem.constraints.map((c, i) => (
                      <li key={i} className="mono text-xs" style={{ color: 'var(--muted-foreground)' }}>• {c}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
            {leftTab === 'hints' && (
              <div className="space-y-3">
                {problem.hints.map((h, i) => (
                  <div key={i} className="p-4 rounded-xl flex items-start gap-3"
                    style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                    <Lightbulb size={15} className="flex-shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
                    <div>
                      <p className="text-xs font-semibold mb-1" style={{ color: '#f59e0b' }}>Hint {i + 1}</p>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{h}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {leftTab === 'editorial' && (
              <div className="space-y-4">
                <h3 className="font-bold" style={{ color: 'var(--foreground)' }}>Optimal Approach</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                  Use a hash map to achieve O(n) time complexity. For each element, compute its complement and check if it exists in the map.
                </p>
                <div className="p-4 rounded-xl mono text-xs" style={{ background: 'var(--muted)' }}>
                  <p style={{ color: 'var(--foreground)' }}>Time Complexity: O(n)</p>
                  <p style={{ color: 'var(--foreground)' }}>Space Complexity: O(n)</p>
                </div>
                <div className="p-4 rounded-xl text-sm" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
                  <p className="font-semibold mb-2" style={{ color: 'var(--primary)' }}>Key Insight</p>
                  <p style={{ color: 'var(--muted-foreground)' }}>
                    Instead of searching for the complement in remaining elements (O(n) per element), store visited elements in a hash map for O(1) lookup.
                  </p>
                </div>
              </div>
            )}
            {leftTab === 'discussion' && (
              <div className="space-y-3">
                {[
                  { user: 'karan_codes', text: 'Hash map is the way! Make sure to handle the edge case where the same element is used twice.', likes: 234, time: '2h ago' },
                  { user: 'priya_dev', text: 'For beginners: first understand the O(n²) brute force, then optimize with hash map.', likes: 156, time: '5h ago' },
                  { user: 'sneha_ms', text: 'Good problem to understand hash map fundamentals. This pattern repeats in many harder problems too.', likes: 98, time: '1d ago' },
                ].map(({ user, text, likes, time }) => (
                  <div key={user} className="p-4 rounded-xl" style={{ background: 'var(--muted)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-xs" style={{ color: 'var(--primary)' }}>@{user}</span>
                      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{time}</span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{text}</p>
                    <button className="text-xs mt-2 hover:opacity-70" style={{ color: 'var(--muted-foreground)' }}>
                      <MessageSquare size={10} className="inline mr-1" />👍 {likes}
                    </button>
                  </div>
                ))}
              </div>
            )}
            {/* ── Submissions tab (left panel) ── */}
            {leftTab === 'submissions' && (
              <div className="space-y-2">
                {submissions.length === 0 ? (
                  <div className="py-10 text-center">
                    <History size={28} className="mx-auto mb-2 opacity-30" style={{ color: 'var(--muted-foreground)' }} />
                    <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>No submissions yet.</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Click Submit to evaluate your solution.</p>
                  </div>
                ) : (
                  submissions.map((sub) => {
                    const meta = VERDICT_META[sub.verdict]
                    return (
                      <div key={sub.id} className="p-3 rounded-xl cursor-pointer hover:opacity-90 transition-all"
                        style={{ background: meta.bg, border: `1px solid ${meta.border}` }}
                        onClick={() => { setCode(sub.code); setLang(sub.lang as Lang) }}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-sm">{meta.icon}</span>
                          <span className="text-xs font-bold" style={{ color: meta.color }}>{sub.verdict}</span>
                          <span className="text-xs ml-auto" style={{ color: 'var(--muted-foreground)' }}>{LANG_LABELS[sub.lang as Lang] ?? sub.lang}</span>
                        </div>
                        <div className="flex gap-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                          <span><CheckCircle2 size={10} className="inline mr-1" />{sub.testsPassed}/{sub.totalTests}</span>
                          <span><Clock size={10} className="inline mr-1" />{sub.runtime}</span>
                          <span className="ml-auto">{sub.timestamp}</span>
                        </div>
                        <p className="text-xs mt-1.5" style={{ color: 'var(--muted-foreground)' }}>Click to restore this code</p>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* Drag divider — desktop only, hidden in focus mode */}
        {layout !== 'focus' && (
          <div
            className="hidden md:flex items-center justify-center flex-shrink-0 cursor-col-resize select-none"
            style={{ width: 6, background: 'var(--border)', transition: 'background 0.15s' }}
            onMouseDown={onDividerMouseDown}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--primary)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--border)')}>
            <div style={{ width: 2, height: 32, borderRadius: 2, background: 'rgba(255,255,255,0.3)' }} />
          </div>
        )}

        {/* Right: Editor + Console */}
        <div className={`min-h-0 flex-col overflow-hidden min-w-0 flex-1 ${mobilePanel === 'code' ? 'flex' : 'hidden md:flex'} ${layout === 'focus' ? '!flex' : ''}`}>
          {/* Editor toolbar */}
          <div className="flex flex-shrink-0 items-center gap-2 px-3 py-2"
            style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}>
            <Code2 size={13} style={{ color: 'var(--muted-foreground)' }} />

            {/* Timer mode tabs — icon only */}
            <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <button onClick={() => setTimerMode('stopwatch')} title="Stopwatch"
                className="w-7 h-7 flex items-center justify-center transition-all"
                style={{ background: timerMode === 'stopwatch' ? 'var(--primary)' : 'var(--muted)', color: timerMode === 'stopwatch' ? 'white' : 'var(--muted-foreground)' }}>
                <Timer size={12} />
              </button>
              <button onClick={() => setTimerMode('countdown')} title="Countdown"
                className="w-7 h-7 flex items-center justify-center transition-all"
                style={{ background: timerMode === 'countdown' ? 'var(--primary)' : 'var(--muted)', color: timerMode === 'countdown' ? 'white' : 'var(--muted-foreground)' }}>
                <Clock size={12} />
              </button>
            </div>

            {/* Stopwatch */}
            {timerMode === 'stopwatch' && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg"
                style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                <Timer size={11} style={{ color: swRunning ? 'var(--primary)' : 'var(--muted-foreground)' }} />
                <span className="font-mono text-xs font-semibold" style={{ color: swRunning ? 'var(--foreground)' : 'var(--muted-foreground)', minWidth: 36 }}>
                  {swDisp}
                </span>
                <button onClick={() => setSwRunning(r => !r)} className="hover:opacity-70 transition-opacity">
                  {swRunning ? <PauseCircle size={12} style={{ color: 'var(--muted-foreground)' }} /> : <PlayCircle size={12} style={{ color: 'var(--primary)' }} />}
                </button>
                <button onClick={() => { setSwSeconds(0); setSwRunning(true) }} className="hover:opacity-70 transition-opacity" title="Reset">
                  <RotateCcw size={10} style={{ color: 'var(--muted-foreground)' }} />
                </button>
              </div>
            )}

            {/* Countdown timer */}
            {timerMode === 'countdown' && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg relative"
                style={{ background: 'var(--muted)', border: `1px solid ${countdownFinished ? 'rgba(239,68,68,0.5)' : countdownLeft < 300 ? 'rgba(239,68,68,0.3)' : 'var(--border)'}` }}>
                <Clock size={11} style={{ color: countdownFinished ? '#ef4444' : countdownRunning ? 'var(--primary)' : 'var(--muted-foreground)' }} />
                <button onClick={() => setShowTimerPicker(p => !p)}
                  className="font-mono text-xs font-semibold hover:opacity-70" style={{ color: countdownFinished ? '#ef4444' : countdownLeft < 300 ? '#f59e0b' : 'var(--foreground)', minWidth: 36 }}>
                  {countdownFinished ? 'Done!' : cdDisp}
                </button>
                {/* Progress bar */}
                <div className="h-1 w-12 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${cdPct}%`, background: countdownLeft < 300 ? '#ef4444' : 'var(--primary)' }} />
                </div>
                <button onClick={() => { setCountdownRunning(r => !r); setCountdownFinished(false) }} className="hover:opacity-70">
                  {countdownRunning ? <PauseCircle size={12} style={{ color: 'var(--muted-foreground)' }} /> : <PlayCircle size={12} style={{ color: 'var(--primary)' }} />}
                </button>
                <button onClick={() => { setCountdownLeft(countdownTotal); setCountdownRunning(false); setCountdownFinished(false) }} className="hover:opacity-70" title="Reset">
                  <RotateCcw size={10} style={{ color: 'var(--muted-foreground)' }} />
                </button>
                {/* Picker dropdown */}
                {showTimerPicker && (
                  <div className="absolute top-full mt-1 left-0 z-50 p-3 rounded-xl shadow-2xl w-48"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                    <p className="text-xs font-semibold mb-2" style={{ color: 'var(--muted-foreground)' }}>Set Duration</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[10, 15, 20, 25, 30, 45, 60, 90, 120].map(m => (
                        <button key={m} onClick={() => { const s = m*60; setCountdownTotal(s); setCountdownLeft(s); setCountdownRunning(false); setCountdownFinished(false); setShowTimerPicker(false) }}
                          className="py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                          style={{ background: countdownTotal === m*60 ? 'var(--primary)' : 'var(--muted)', color: countdownTotal === m*60 ? 'white' : 'var(--foreground)' }}>
                          {m}m
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <select value={lang} onChange={e => setLang(e.target.value as Lang)}
              className="text-xs font-semibold px-2 py-1.5 rounded-lg appearance-none cursor-pointer outline-none"
              style={{ background: 'var(--muted)', color: 'var(--foreground)', border: '1px solid var(--border)', colorScheme: 'inherit' }}>
              {(['python', 'javascript', 'java', 'cpp', 'c'] as Lang[]).map(l => (
                <option key={l} value={l}>{LANG_LABELS[l]}</option>
              ))}
            </select>
            <div className="ml-auto flex items-center gap-2">
              {/* Editor theme toggle */}
              <button onClick={() => setEditorDark(d => !d)}
                className="p-1.5 rounded-lg transition-all hover:opacity-80"
                title={editorDark ? 'Switch to light editor' : 'Switch to dark editor'}
                style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                {editorDark ? <Sun size={12} /> : <Moon size={12} />}
              </button>
              <button onClick={() => setCode(STARTERS[lang](problem.title.toLowerCase().replace(/[^a-z]/g, '_')))}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                <RotateCcw size={11} /> Reset
              </button>
              <button onClick={handleRun} disabled={running}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
                {running && runMode === 'run' ? <Loader2 size={11} className="animate-spin" /> : <Play size={11} />}
                Run
              </button>
              <button onClick={handleSubmit} disabled={running}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: 'var(--gradient-primary)' }}>
                {running && runMode === 'submit' ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}
                Submit
              </button>
            </div>
          </div>

          {/* Code editor */}
          <div className="flex-1 overflow-hidden relative" style={{ background: editorDark ? '#0d1117' : '#f6f8fa', minHeight: 0 }}>
            <div className="absolute left-0 top-0 bottom-0 w-11 flex flex-col items-end pr-2.5 pt-4 select-none pointer-events-none overflow-hidden"
              style={{ color: editorDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.25)', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', lineHeight: '1.6rem', borderRight: `1px solid ${editorDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.08)'}` }}>
              {Array.from({ length: lineCount }, (_, i) => <span key={i}>{i + 1}</span>)}
            </div>
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              spellCheck={false}
              className="absolute inset-0 w-full h-full resize-none outline-none"
              style={{
                paddingLeft: 52, paddingRight: 16, paddingTop: 16, paddingBottom: 16,
                background: 'transparent', color: editorDark ? '#e6edf3' : '#1f2937',
                fontFamily: 'JetBrains Mono, monospace', fontSize: 13, lineHeight: '1.6rem',
                caretColor: '#6366f1', tabSize: 4,
              }}
              onKeyDown={e => {
                if (e.key === 'Tab') {
                  e.preventDefault()
                  const s = e.currentTarget.selectionStart
                  const end = e.currentTarget.selectionEnd
                  const v = e.currentTarget.value
                  setCode(v.substring(0, s) + '    ' + v.substring(end))
                  setTimeout(() => e.currentTarget.setSelectionRange(s + 4, s + 4), 0)
                }
              }}
            />
          </div>

          {/* Console / test results — fixed height on mobile, draggable on desktop */}
          <div className="flex-shrink-0 overflow-hidden flex flex-col"
            style={{ height: consoleVisible ? (typeof window !== 'undefined' && window.innerWidth < 768 ? 260 : consoleH) : 'auto', background: 'var(--card)' }}>
            {/* Drag handle on top — desktop only, when visible */}
            {consoleVisible && (
              <div
                className="hidden md:flex items-center justify-center flex-shrink-0 cursor-row-resize select-none"
                style={{ height: 6, background: 'var(--border)', transition: 'background 0.15s' }}
                onMouseDown={onConsoleDragMouseDown}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--primary)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--border)')}>
                <div style={{ width: 32, height: 2, borderRadius: 2, background: 'rgba(255,255,255,0.3)' }} />
              </div>
            )}
            {/* Console tabs */}
            <div className="flex items-center flex-shrink-0" style={{ borderBottom: consoleVisible ? '1px solid var(--border)' : 'none', borderTop: '1px solid var(--border)' }}>
              {([
                { id: 'testcases', label: 'Test Cases', icon: FlaskConical },
                { id: 'output', label: 'Output', icon: Zap },
              ] as { id: BottomTab; label: string; icon: any }[]).map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => { setBottomTab(id); setConsoleVisible(true) }}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold whitespace-nowrap"
                  style={{
                    color: bottomTab === id && consoleVisible ? 'var(--foreground)' : 'var(--muted-foreground)',
                    borderBottom: bottomTab === id && consoleVisible ? '2px solid var(--primary)' : '2px solid transparent',
                  }}>
                  <Icon size={11} />
                  {label}
                </button>
              ))}
              {/* Toggle console visibility */}
              <button
                onClick={() => setConsoleVisible(v => !v)}
                title={consoleVisible ? 'Hide test cases panel' : 'Show test cases panel'}
                className="ml-auto flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-all hover:opacity-80"
                style={{ color: 'var(--muted-foreground)' }}>
                {consoleVisible ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
                <span className="hidden sm:inline">{consoleVisible ? 'Hide' : 'Show'}</span>
              </button>
            </div>

            {consoleVisible && <div className="flex-1 overflow-y-auto p-3 min-h-0">

              {/* ── Test Cases tab ── */}
              {bottomTab === 'testcases' && (
                <div>
                  {/* Case selector row */}
                  <div className="flex gap-2 mb-3 flex-wrap items-center">
                    {problem.testCases.map((_, i) => (
                      <button key={i} onClick={() => { setActiveTestIdx(i); setShowCustomCase(false) }}
                        className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                        style={{
                          background: activeTestIdx === i && !showCustomCase ? 'rgba(99,102,241,0.15)' : 'var(--muted)',
                          color: activeTestIdx === i && !showCustomCase ? 'var(--primary)' : 'var(--muted-foreground)',
                          border: activeTestIdx === i && !showCustomCase ? '1px solid rgba(99,102,241,0.3)' : '1px solid var(--border)',
                        }}>
                        Case {i + 1}
                      </button>
                    ))}
                    {/* Custom case button */}
                    <button onClick={() => { setShowCustomCase(true); setCustomInputs(problem.inputParams ? problem.inputParams.map(() => '') : []); setCustomExpected(''); setCustomOutput(null) }}
                      className="w-6 h-6 rounded-md flex items-center justify-center text-sm font-bold transition-all hover:opacity-80"
                      style={{ background: showCustomCase ? 'rgba(99,102,241,0.15)' : 'var(--muted)', color: showCustomCase ? 'var(--primary)' : 'var(--muted-foreground)', border: showCustomCase ? '1px solid rgba(99,102,241,0.3)' : '1px solid var(--border)' }}>
                      +
                    </button>
                  </div>

                  {/* Existing case display */}
                  {!showCustomCase && (
                    problem.inputParams && problem.inputParams.length > 0 ? (
                      <div className="space-y-2">
                        {parseNamedInputs(problem.testCases[activeTestIdx]?.input ?? '', problem.inputParams).map(({ name, value }) => (
                          <div key={name}>
                            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--muted-foreground)' }}>{name} =</p>
                            <pre className="mono text-xs p-2 rounded-lg" style={{ background: 'var(--muted)', color: 'var(--foreground)' }}>{value}</pre>
                          </div>
                        ))}
                        <div>
                          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--muted-foreground)' }}>Expected Output:</p>
                          <pre className="mono text-xs p-2 rounded-lg" style={{ background: 'var(--muted)', color: '#22c55e' }}>
                            {problem.testCases[activeTestIdx]?.expected}
                          </pre>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--muted-foreground)' }}>Input:</p>
                          <pre className="mono text-xs p-2 rounded-lg" style={{ background: 'var(--muted)', color: 'var(--foreground)' }}>
                            {problem.testCases[activeTestIdx]?.input}
                          </pre>
                        </div>
                        <div>
                          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--muted-foreground)' }}>Expected Output:</p>
                          <pre className="mono text-xs p-2 rounded-lg" style={{ background: 'var(--muted)', color: '#22c55e' }}>
                            {problem.testCases[activeTestIdx]?.expected}
                          </pre>
                        </div>
                      </div>
                    )
                  )}

                  {/* Custom case editor */}
                  {showCustomCase && (
                    <div className="space-y-2">
                      {problem.inputParams && problem.inputParams.length > 0 ? (
                        problem.inputParams.map((param, i) => (
                          <div key={param}>
                            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--muted-foreground)' }}>{param} =</p>
                            <input
                              value={customInputs[i] ?? ''}
                              onChange={e => { const next = [...customInputs]; next[i] = e.target.value; setCustomInputs(next) }}
                              placeholder={`Enter ${param}...`}
                              className="w-full px-3 py-2 rounded-lg outline-none font-mono text-xs"
                              style={{ background: 'var(--muted)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
                            />
                          </div>
                        ))
                      ) : (
                        <div>
                          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--muted-foreground)' }}>Input:</p>
                          <textarea value={customInput} onChange={e => setCustomInput(e.target.value)} rows={3}
                            placeholder="Enter custom input..."
                            className="w-full px-3 py-2 rounded-lg outline-none font-mono text-xs resize-none"
                            style={{ background: 'var(--muted)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
                          />
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-semibold mb-1" style={{ color: 'var(--muted-foreground)' }}>Expected Output (optional):</p>
                        <input value={customExpected} onChange={e => setCustomExpected(e.target.value)}
                          placeholder="e.g. [0, 1]"
                          className="w-full px-3 py-2 rounded-lg outline-none font-mono text-xs"
                          style={{ background: 'var(--muted)', color: '#22c55e', border: '1px solid var(--border)' }}
                        />
                      </div>
                      <button onClick={handleCustomRun} disabled={running}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 transition-all"
                        style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                        {running && runMode === 'custom' ? <Loader2 size={10} className="animate-spin" /> : <Play size={10} />}
                        Run Custom Case
                      </button>
                      {customOutput && (
                        <div className="p-3 rounded-xl space-y-1" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                          <pre className="mono text-xs whitespace-pre-wrap" style={{ color: 'var(--foreground)' }}>{customOutput.text}</pre>
                          <div className="flex gap-4 text-xs pt-1" style={{ color: 'var(--muted-foreground)', borderTop: '1px solid var(--border)' }}>
                            <span className="flex items-center gap-1"><Clock size={10} /> {customOutput.runtime}</span>
                            <span className="flex items-center gap-1"><MemoryStick size={10} /> {customOutput.memory}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── Output tab ── */}
              {bottomTab === 'output' && (
                <div>
                  {running ? (
                    <div className="flex items-center gap-2 text-sm py-2" style={{ color: 'var(--muted-foreground)' }}>
                      <Loader2 size={14} className="animate-spin" style={{ color: 'var(--primary)' }} />
                      {runMode === 'submit' ? 'Submitting to judge...' : 'Running test cases...'}
                    </div>
                  ) : submitResult ? (
                    /* Submit verdict */
                    <div className="space-y-2">
                      {(() => {
                        const meta = VERDICT_META[submitResult.verdict]
                        return (
                          <div className="p-3 rounded-xl" style={{ background: meta.bg, border: `1px solid ${meta.border}` }}>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-lg">{meta.icon}</span>
                              <span className="text-sm font-bold" style={{ color: meta.color }}>{submitResult.verdict}</span>
                            </div>
                            <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                              <span className="flex items-center gap-1"><CheckCircle2 size={11} /> {submitResult.testsPassed}/{submitResult.totalTests} tests</span>
                              <span className="flex items-center gap-1"><Clock size={11} /> {submitResult.runtime}</span>
                              <span className="flex items-center gap-1"><Cpu size={11} /> {submitResult.memory}</span>
                            </div>
                            {submitResult.errorMsg && (
                              <pre className="mt-2 text-xs font-mono whitespace-pre-wrap p-2 rounded-lg" style={{ background: 'rgba(0,0,0,0.2)', color: meta.color }}>
                                {submitResult.errorMsg}
                              </pre>
                            )}
                          </div>
                        )
                      })()}
                      {/* Per-test case breakdown */}
                      {submitResult.perTestResults && submitResult.perTestResults.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-xs font-semibold uppercase tracking-wider pt-1" style={{ color: 'var(--muted-foreground)' }}>Sample Test Cases</p>
                          {submitResult.perTestResults.map((r, i) => (
                            <div key={i} className="p-2.5 rounded-xl"
                              style={{ background: r.pass ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.05)', border: `1px solid ${r.pass ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}` }}>
                              <div className="flex items-center gap-2 mb-1">
                                {r.pass ? <CheckCircle2 size={12} style={{ color: '#22c55e' }} /> : <XCircle size={12} style={{ color: '#ef4444' }} />}
                                <span className="text-xs font-semibold" style={{ color: r.pass ? '#22c55e' : '#ef4444' }}>Test {i + 1}: {r.pass ? 'Passed' : 'Failed'}</span>
                                <span className="text-xs ml-auto" style={{ color: 'var(--muted-foreground)' }}>{r.time}</span>
                              </div>
                              <div className="mono text-xs space-y-0.5">
                                <p style={{ color: 'var(--muted-foreground)' }}>Input: <span style={{ color: 'var(--foreground)' }}>{r.input.split('\n')[0]}</span></p>
                                <p style={{ color: 'var(--muted-foreground)' }}>Expected: <span style={{ color: '#22c55e' }}>{r.expected}</span></p>
                                {!r.pass && <p style={{ color: 'var(--muted-foreground)' }}>Got: <span style={{ color: '#ef4444' }}>{r.actual}</span></p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : runResults ? (
                    /* Run results — per-case */
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-2.5 rounded-xl mb-2"
                        style={{
                          background: allRunPassed ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                          border: `1px solid ${allRunPassed ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                        }}>
                        {allRunPassed ? <CheckCircle2 size={15} style={{ color: '#22c55e' }} /> : <XCircle size={15} style={{ color: '#ef4444' }} />}
                        <div>
                          <p className="text-xs font-bold" style={{ color: allRunPassed ? '#22c55e' : '#ef4444' }}>
                            {allRunPassed ? '✓ All sample tests passed' : `✗ Wrong Answer — ${runResults.filter(r => r.pass).length}/${runResults.length} passed`}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                            Runtime: {runResults[0]?.time} · Memory: {runResults[0]?.memory}
                          </p>
                        </div>
                      </div>
                      {runResults.map((r, i) => (
                        <div key={i} className="p-2.5 rounded-xl"
                          style={{ background: r.pass ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.05)', border: `1px solid ${r.pass ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}` }}>
                          <div className="flex items-center gap-2 mb-1.5">
                            {r.pass ? <CheckCircle2 size={12} style={{ color: '#22c55e' }} /> : <XCircle size={12} style={{ color: '#ef4444' }} />}
                            <span className="text-xs font-semibold" style={{ color: r.pass ? '#22c55e' : '#ef4444' }}>
                              Test {i + 1}: {r.pass ? 'Passed' : 'Failed'}
                            </span>
                            <span className="text-xs ml-auto" style={{ color: 'var(--muted-foreground)' }}>{r.time}</span>
                          </div>
                          <div className="mono text-xs space-y-0.5">
                            <p style={{ color: 'var(--muted-foreground)' }}>Input: <span style={{ color: 'var(--foreground)' }}>{r.input.split('\n')[0]}</span></p>
                            <p style={{ color: 'var(--muted-foreground)' }}>Expected: <span style={{ color: '#22c55e' }}>{r.expected}</span></p>
                            {!r.pass && <p style={{ color: 'var(--muted-foreground)' }}>Got: <span style={{ color: '#ef4444' }}>{r.actual}</span></p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs py-2" style={{ color: 'var(--muted-foreground)' }}>
                      Press <strong>Run</strong> to test against sample cases or <strong>Submit</strong> to judge against all hidden test cases.
                    </p>
                  )}
                </div>
              )}

            </div>
            }
          </div>
        </div>
      </div>
    </div>
  )
}
