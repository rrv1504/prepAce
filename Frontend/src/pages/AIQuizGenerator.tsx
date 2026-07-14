import { useState, useRef } from 'react'
import {
  Sparkles, Upload, FileText, X, ChevronRight, ChevronLeft, Send,
  RotateCcw, CheckCircle2, XCircle, BarChart2,
  Loader2, AlertCircle, BookOpen, Brain, Zap, Trophy,
  Target, TrendingUp, RefreshCw, Eye, EyeOff,
} from 'lucide-react'
import { aiService } from "../lib/services";

type Difficulty = 'Easy' | 'Medium' | 'Hard'
type QuestionType = 'MCQ' | 'True/False' | 'Fill in the Blank' | 'Mixed'

interface MCQOption { label: string; text: string }

interface Question {
  id: number
  type: 'MCQ' | 'TrueFalse' | 'FillBlank'
  text: string
  options?: MCQOption[]
  correct: string
  explanation: string
  topic: string
}

interface QuizConfig {
  topic: string
  difficulty: Difficulty
  questionType: QuestionType
  count: number
  notes: string
  fileName: string
}

interface QuizResult {
  questionId: number
  userAnswer: string
  correct: boolean
  timeTaken: number
}

// Simulated quiz generation
function generateQuestions(config: QuizConfig): Question[] {
  const topics = config.topic || 'General Knowledge'
  const count = Math.min(config.count, 20)

  const mcqBank: Omit<Question, 'id'>[] = [
    {
      type: 'MCQ',
      text: `Which of the following best describes the time complexity of binary search on a sorted array?`,
      options: [
        { label: 'A', text: 'O(n)' },
        { label: 'B', text: 'O(log n)' },
        { label: 'C', text: 'O(n log n)' },
        { label: 'D', text: 'O(1)' },
      ],
      correct: 'B',
      explanation: 'Binary search divides the search space in half at each step, giving O(log n) time complexity. It eliminates half the remaining elements in each comparison.',
      topic: topics,
    },
    {
      type: 'MCQ',
      text: `What data structure does a HashMap primarily use internally?`,
      options: [
        { label: 'A', text: 'Linked List' },
        { label: 'B', text: 'Binary Tree' },
        { label: 'C', text: 'Array of buckets' },
        { label: 'D', text: 'Stack' },
      ],
      correct: 'C',
      explanation: 'A HashMap uses an array of buckets (linked lists or trees at each index) with a hash function to determine which bucket each key-value pair goes into.',
      topic: topics,
    },
    {
      type: 'MCQ',
      text: `In dynamic programming, what does "memoization" refer to?`,
      options: [
        { label: 'A', text: 'Storing subproblem results to avoid recomputation' },
        { label: 'B', text: 'Sorting data before processing' },
        { label: 'C', text: 'Using recursion without base cases' },
        { label: 'D', text: 'Compressing data in memory' },
      ],
      correct: 'A',
      explanation: 'Memoization is a top-down DP technique where results of expensive function calls are cached (stored), so when the same inputs occur again, the cached result is returned instead of recomputing.',
      topic: topics,
    },
    {
      type: 'MCQ',
      text: `Which sorting algorithm has the best average-case time complexity?`,
      options: [
        { label: 'A', text: 'Bubble Sort — O(n²)' },
        { label: 'B', text: 'Merge Sort — O(n log n)' },
        { label: 'C', text: 'Insertion Sort — O(n²)' },
        { label: 'D', text: 'Selection Sort — O(n²)' },
      ],
      correct: 'B',
      explanation: 'Merge Sort guarantees O(n log n) in all cases (best, average, worst) by recursively dividing the array and merging sorted halves.',
      topic: topics,
    },
    {
      type: 'MCQ',
      text: `What is the maximum number of nodes in a binary tree of height h?`,
      options: [
        { label: 'A', text: '2h' },
        { label: 'B', text: 'h²' },
        { label: 'C', text: '2^(h+1) − 1' },
        { label: 'D', text: '2h + 1' },
      ],
      correct: 'C',
      explanation: 'A complete binary tree of height h has at most 2^(h+1) − 1 nodes. At each level i, there can be at most 2^i nodes, and summing from 0 to h gives 2^(h+1) − 1.',
      topic: topics,
    },
    {
      type: 'MCQ',
      text: `Which graph traversal algorithm uses a queue data structure?`,
      options: [
        { label: 'A', text: 'Depth-First Search (DFS)' },
        { label: 'B', text: 'Dijkstra\'s Algorithm' },
        { label: 'C', text: 'Breadth-First Search (BFS)' },
        { label: 'D', text: 'Bellman-Ford Algorithm' },
      ],
      correct: 'C',
      explanation: 'BFS uses a queue (FIFO) to explore all neighbors of a node before moving to the next level, ensuring level-by-level traversal of the graph.',
      topic: topics,
    },
    {
      type: 'TrueFalse',
      text: `A stack follows the FIFO (First In, First Out) principle.`,
      correct: 'False',
      explanation: 'A stack follows LIFO (Last In, First Out). The last element pushed is the first one popped. Queues follow FIFO order.',
      topic: topics,
    },
    {
      type: 'TrueFalse',
      text: `Quick Sort is always faster than Merge Sort in practice.`,
      correct: 'False',
      explanation: 'While Quick Sort has better cache performance and is often faster in practice for random data, Merge Sort has a guaranteed O(n log n) worst case. Quick Sort can degrade to O(n²) on already sorted arrays without pivot optimization.',
      topic: topics,
    },
    {
      type: 'TrueFalse',
      text: `Dijkstra\'s algorithm can handle graphs with negative weight edges.`,
      correct: 'False',
      explanation: 'Dijkstra\'s algorithm assumes all edge weights are non-negative. For graphs with negative weights, Bellman-Ford algorithm should be used instead.',
      topic: topics,
    },
    {
      type: 'TrueFalse',
      text: `A balanced BST guarantees O(log n) search time.`,
      correct: 'True',
      explanation: 'In a balanced BST (like AVL or Red-Black tree), the height is kept at O(log n), ensuring search, insert, and delete operations are all O(log n) time.',
      topic: topics,
    },
    {
      type: 'FillBlank',
      text: `The time complexity of accessing an element in an array by index is ______.`,
      correct: 'O(1)',
      explanation: 'Array elements are stored in contiguous memory locations. Given the base address and index, the element address is computed in constant time: base + index × element_size.',
      topic: topics,
    },
    {
      type: 'FillBlank',
      text: `In a min-heap, the ______ element is always at the root.`,
      correct: 'smallest',
      explanation: 'A min-heap maintains the heap property where every parent node is smaller than or equal to its children. This guarantees the minimum element is always at the root (index 0).',
      topic: topics,
    },
    {
      type: 'FillBlank',
      text: `A graph with V vertices and E edges represented as an adjacency list uses O(______) space.`,
      correct: 'V + E',
      explanation: 'An adjacency list stores each vertex once (O(V)) and each edge once per direction (O(E) for directed, O(2E) for undirected ≈ O(E)), giving O(V + E) total space.',
      topic: topics,
    },
    {
      type: 'MCQ',
      text: `What does the "Two Pointer" technique primarily optimize?`,
      options: [
        { label: 'A', text: 'Memory usage in recursive problems' },
        { label: 'B', text: 'Reducing O(n²) brute-force solutions to O(n)' },
        { label: 'C', text: 'Sorting arrays in-place' },
        { label: 'D', text: 'Graph traversal problems' },
      ],
      correct: 'B',
      explanation: 'Two pointers use two indices (start and end) that move toward each other, turning what would be a nested loop O(n²) comparison into a single O(n) pass through the data.',
      topic: topics,
    },
    {
      type: 'MCQ',
      text: `Which of the following is NOT a property of a Red-Black Tree?`,
      options: [
        { label: 'A', text: 'Every node is either red or black' },
        { label: 'B', text: 'The root is always black' },
        { label: 'C', text: 'Red nodes cannot have red children' },
        { label: 'D', text: 'All leaves must be at the same depth' },
      ],
      correct: 'D',
      explanation: 'Red-Black trees do NOT require all leaves to be at the same depth. They only require that each path from root to a null leaf has the same number of black nodes (black-height property).',
      topic: topics,
    },
    {
      type: 'TrueFalse',
      text: `In a singly linked list, you can traverse backwards from any node.`,
      correct: 'False',
      explanation: 'Singly linked lists only have pointers to the next node. To traverse backwards, you need a doubly linked list which maintains both next and previous pointers.',
      topic: topics,
    },
    {
      type: 'FillBlank',
      text: `The space complexity of the recursive Fibonacci implementation without memoization is O(______).`,
      correct: 'n',
      explanation: 'The recursive Fibonacci function has O(n) space complexity because the maximum depth of the recursion tree is n (the call stack grows to depth n at most before unwinding).',
      topic: topics,
    },
    {
      type: 'MCQ',
      text: `Which algorithmic paradigm is used by Kruskal\'s Minimum Spanning Tree algorithm?`,
      options: [
        { label: 'A', text: 'Dynamic Programming' },
        { label: 'B', text: 'Greedy Algorithm' },
        { label: 'C', text: 'Divide and Conquer' },
        { label: 'D', text: 'Backtracking' },
      ],
      correct: 'B',
      explanation: 'Kruskal\'s algorithm is a greedy algorithm. It sorts all edges by weight and greedily adds the next smallest edge that doesn\'t form a cycle, using a Union-Find data structure to detect cycles.',
      topic: topics,
    },
    {
      type: 'TrueFalse',
      text: `Topological Sort is only defined for Directed Acyclic Graphs (DAGs).`,
      correct: 'True',
      explanation: 'Topological sort requires a DAG. If there\'s a cycle, no valid topological ordering exists because at least one node in the cycle would need to come before itself.',
      topic: topics,
    },
    {
      type: 'MCQ',
      text: `What is the amortized time complexity of a dynamic array (like ArrayList) push operation?`,
      options: [
        { label: 'A', text: 'O(n) always' },
        { label: 'B', text: 'O(log n)' },
        { label: 'C', text: 'O(1) amortized' },
        { label: 'D', text: 'O(n log n)' },
      ],
      correct: 'C',
      explanation: 'Dynamic arrays double their capacity when full. While occasional insertions cost O(n) to copy, if you amortize this cost over n insertions, each push costs O(1) on average (amortized O(1)).',
      topic: topics,
    },
  ]

  // Filter by question type
  let pool = [...mcqBank]
  if (config.questionType === 'MCQ') pool = pool.filter(q => q.type === 'MCQ')
  else if (config.questionType === 'True/False') pool = pool.filter(q => q.type === 'TrueFalse')
  else if (config.questionType === 'Fill in the Blank') pool = pool.filter(q => q.type === 'FillBlank')

  // Shuffle and take count
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map((q, i) => ({ ...q, id: i + 1 }))
}

const DIFFICULTY_COLORS: Record<Difficulty, { color: string; bg: string; border: string }> = {
  Easy: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)' },
  Medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
  Hard: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)' },
}

export default function AIQuizGenerator() {
  // Config state
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium')
  const [questionType, setQuestionType] = useState<QuestionType>('Mixed')
  const [count, setCount] = useState(10)
  const [notes, setNotes] = useState('')
  const [fileName, setFileName] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // Generation state
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])

  // Quiz state
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [fillAnswer, setFillAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState<QuizResult[]>([])
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({})
  const [, setStartTime] = useState<number>(0)
  const [, setQuestionStartTime] = useState<number>(Date.now())

  const quizPhase = questions.length === 0 ? 'setup' : submitted ? 'results' : 'quiz'

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      setNotes(text?.slice(0, 3000) ?? '')
    }
    reader.readAsText(file)
  }


  async function handleGenerate() {
    try {
      setGenerating(true);

      const result = await aiService.generateQuiz({
        topic: selectedTopics.join(", "),
        difficulty,
        passingScore: 70,
        distribution: {
          mcq: count,
          coding: 0,
          debugging: 0,
          trueFalse: 0,
          fillBlanks: 0,
        },
      });

      if (!result?.questions?.length) {
        throw new Error("No questions returned");
      }

      const questions: MockQuestion[] = result.questions.map(
        (q: any, i: number) => {
          const correctIndex = Array.isArray(q.options)
            ? q.options.findIndex((opt: string) => opt === q.correctAnswer)
            : -1;
          return {
            id: q.id || `ai-q-${i + 1}`,
            type: "mcq",
            question: q.question,
            options: q.options ?? [],
            correct: correctIndex >= 0 ? correctIndex : 0,
            marks: 1,
            explanation: q.explanation ?? "",
            topic: q.topic ?? selectedTopics.join(", "),
          };
        },
      );

      const test: MockTestDef = {
        id: `ai-${Date.now()}`,
        title: `AI Quiz: ${selectedTopics.join(", ")}`,
        description: `${difficulty} · ${selectedTopics.join(", ")}`,
        type: "mixed",
        duration: minutes,
        questions,
      };

      onStart(test);
    } catch (err) {
      console.error("Failed to generate quiz:", err);
      alert("Failed to generate AI quiz. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  function handleAnswer(qId: number, answer: string) {
    setAnswers(prev => ({ ...prev, [qId]: answer }))
  }

  function handleNext() {
    const q = questions[currentIdx]
    // auto-save fill blank answer
    if (q.type === 'FillBlank' && fillAnswer.trim()) {
      setAnswers(prev => ({ ...prev, [q.id]: fillAnswer.trim() }))
    }
    setFillAnswer('')
    setQuestionStartTime(Date.now())
    if (currentIdx < questions.length - 1) setCurrentIdx(i => i + 1)
  }

  function handlePrev() {
    setFillAnswer(answers[questions[currentIdx - 1]?.id] ?? '')
    setQuestionStartTime(Date.now())
    if (currentIdx > 0) setCurrentIdx(i => i - 1)
  }

  function handleSubmitQuiz() {
    const q = questions[currentIdx]
    const finalAnswers = { ...answers }
    if (q.type === 'FillBlank' && fillAnswer.trim()) finalAnswers[q.id] = fillAnswer.trim()

    const res: QuizResult[] = questions.map(q => {
      const userAnswer = finalAnswers[q.id] ?? ''
      const correct = q.type === 'FillBlank'
        ? userAnswer.toLowerCase().replace(/\s+/g, '') === q.correct.toLowerCase().replace(/\s+/g, '')
        : userAnswer === q.correct
      return { questionId: q.id, userAnswer, correct, timeTaken: 0 }
    })
    setResults(res)
    setAnswers(finalAnswers)
    setSubmitted(true)
    setCurrentIdx(0)
  }

  function handleReset() {
    setQuestions([])
    setAnswers({})
    setFillAnswer('')
    setSubmitted(false)
    setResults([])
    setTopic('')
    setNotes('')
    setFileName('')
    setError('')
  }

  const answeredCount = Object.keys(answers).length + (
    questions[currentIdx]?.type === 'FillBlank' && fillAnswer.trim() && !answers[questions[currentIdx].id] ? 1 : 0
  )
  const score = results.filter(r => r.correct).length
  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0

  const currentQ = questions[currentIdx]

  return (
    <div className="min-h-full p-4 md:p-6" style={{ background: 'var(--background)' }}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                <Brain size={18} className="text-white" />
              </div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>AI Quiz Generator</h1>
            </div>
            <p className="text-sm ml-12" style={{ color: 'var(--muted-foreground)' }}>
              Generate personalized quizzes from any topic or your study material
            </p>
          </div>
          {quizPhase !== 'setup' && (
            <button onClick={handleReset}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
              style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}>
              <RefreshCw size={13} /> New Quiz
            </button>
          )}
        </div>

        {/* ── SETUP PHASE ── */}
        {quizPhase === 'setup' && (
          <div className="space-y-4">
            {/* Topic Input */}
            <div className="p-5 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--muted-foreground)' }}>
                Topic or Prompt *
              </label>
              <textarea
                value={topic}
                onChange={e => { setTopic(e.target.value); setError('') }}
                placeholder="e.g. Data Structures and Algorithms, Binary Search Trees, Operating Systems concepts, React hooks..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl outline-none text-sm resize-none transition-all"
                style={{
                  background: 'var(--muted)', color: 'var(--foreground)',
                  border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'var(--border)'}`,
                }}
              />
              {error && (
                <p className="mt-2 text-xs flex items-center gap-1" style={{ color: '#ef4444' }}>
                  <AlertCircle size={12} /> {error}
                </p>
              )}
            </div>

            {/* Config row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Difficulty */}
              <div className="p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--muted-foreground)' }}>Difficulty</label>
                <div className="flex flex-col gap-2">
                  {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map(d => {
                    const dc = DIFFICULTY_COLORS[d]
                    return (
                      <button key={d} onClick={() => setDifficulty(d)}
                        className="px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all"
                        style={{
                          background: difficulty === d ? dc.bg : 'var(--muted)',
                          color: difficulty === d ? dc.color : 'var(--muted-foreground)',
                          border: `1px solid ${difficulty === d ? dc.border : 'var(--border)'}`,
                        }}>
                        {d === 'Easy' ? '🟢' : d === 'Medium' ? '🟡' : '🔴'} {d}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Question Type */}
              <div className="p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--muted-foreground)' }}>Question Type</label>
                <div className="flex flex-col gap-2">
                  {(['MCQ', 'True/False', 'Fill in the Blank', 'Mixed'] as QuestionType[]).map(t => (
                    <button key={t} onClick={() => setQuestionType(t)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all"
                      style={{
                        background: questionType === t ? 'rgba(99,102,241,0.12)' : 'var(--muted)',
                        color: questionType === t ? 'var(--primary)' : 'var(--muted-foreground)',
                        border: `1px solid ${questionType === t ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`,
                      }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Count */}
              <div className="p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--muted-foreground)' }}>Questions</label>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 10, 15, 20, 25, 30].map(n => (
                    <button key={n} onClick={() => setCount(n)}
                      className="py-2 rounded-xl text-xs font-bold transition-all"
                      style={{
                        background: count === n ? 'rgba(99,102,241,0.12)' : 'var(--muted)',
                        color: count === n ? 'var(--primary)' : 'var(--muted-foreground)',
                        border: `1px solid ${count === n ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`,
                      }}>
                      {n}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>Selected: <strong style={{ color: 'var(--foreground)' }}>{count} questions</strong></p>
              </div>
            </div>

            {/* Study Material Upload */}
            <div className="p-5 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--muted-foreground)' }}>
                Study Material <span className="font-normal normal-case" style={{ color: 'var(--muted-foreground)' }}>(optional)</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                {/* File upload */}
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold transition-all hover:opacity-80 flex-shrink-0"
                  style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: '2px dashed var(--border)' }}>
                  <Upload size={14} />
                  {fileName ? (
                    <span className="flex items-center gap-1.5" style={{ color: 'var(--primary)' }}>
                      <FileText size={12} /> {fileName.slice(0, 20)}{fileName.length > 20 ? '…' : ''}
                    </span>
                  ) : 'Upload PDF / TXT'}
                </button>
                <input ref={fileRef} type="file" accept=".txt,.pdf,.md" className="hidden" onChange={handleFileUpload} />
                {fileName && (
                  <button onClick={() => { setFileName(''); setNotes('') }}
                    className="p-2 rounded-lg hover:opacity-70 flex-shrink-0 self-center"
                    style={{ color: 'var(--muted-foreground)' }}>
                    <X size={14} />
                  </button>
                )}
              </div>
              <p className="text-xs mt-2 mb-3" style={{ color: 'var(--muted-foreground)' }}>or paste your notes below:</p>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Paste your study notes, lecture content, or any text here. The AI will generate questions based on this content..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl outline-none text-sm resize-none"
                style={{ background: 'var(--muted)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
              />
              {notes.length > 0 && (
                <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{notes.length} characters</p>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-3 transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff' }}>
              {generating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating {count} questions on "{topic}"…
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate Quiz · {count} questions · {difficulty}
                </>
              )}
            </button>

            {/* Feature hints */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: Zap, title: 'Instant Generation', desc: 'AI crafts questions in seconds from any topic' },
                { icon: Target, title: 'Adaptive Difficulty', desc: 'Easy to Hard questions tailored to your level' },
                { icon: TrendingUp, title: 'Detailed Analytics', desc: 'Per-question analysis with explanations' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="p-4 rounded-xl flex items-start gap-3"
                  style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                  <Icon size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
                  <div>
                    <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--foreground)' }}>{title}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── QUIZ PHASE ── */}
        {quizPhase === 'quiz' && currentQ && (
          <div className="space-y-4">
            {/* Progress bar */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
                <div className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${((currentIdx + 1) / questions.length) * 100}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
              </div>
              <span className="text-xs font-semibold flex-shrink-0" style={{ color: 'var(--muted-foreground)' }}>
                {currentIdx + 1} / {questions.length}
              </span>
            </div>

            {/* Question card */}
            <div className="p-6 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              {/* Meta row */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="text-xs font-bold px-2 py-0.5 rounded-md"
                  style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  Q{currentIdx + 1}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md"
                  style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                  {currentQ.type === 'MCQ' ? 'Multiple Choice' : currentQ.type === 'TrueFalse' ? 'True / False' : 'Fill in the Blank'}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md" style={{ ...DIFFICULTY_COLORS[difficulty] }}>
                  {difficulty}
                </span>
                <span className="ml-auto text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  {answeredCount} / {questions.length} answered
                </span>
              </div>

              {/* Question text */}
              <p className="text-sm font-medium leading-relaxed mb-5" style={{ color: 'var(--foreground)' }}>
                {currentQ.text}
              </p>

              {/* MCQ options */}
              {currentQ.type === 'MCQ' && currentQ.options && (
                <div className="space-y-2">
                  {currentQ.options.map(opt => {
                    const selected = answers[currentQ.id] === opt.label
                    return (
                      <button key={opt.label} onClick={() => handleAnswer(currentQ.id, opt.label)}
                        className="w-full text-left px-4 py-3 rounded-xl text-sm transition-all hover:opacity-90"
                        style={{
                          background: selected ? 'rgba(99,102,241,0.12)' : 'var(--muted)',
                          color: selected ? 'var(--primary)' : 'var(--foreground)',
                          border: `1.5px solid ${selected ? 'rgba(99,102,241,0.4)' : 'var(--border)'}`,
                        }}>
                        <span className="font-bold mr-3" style={{ color: selected ? 'var(--primary)' : 'var(--muted-foreground)' }}>{opt.label}.</span>
                        {opt.text}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* True/False */}
              {currentQ.type === 'TrueFalse' && (
                <div className="flex gap-3">
                  {['True', 'False'].map(v => {
                    const selected = answers[currentQ.id] === v
                    return (
                      <button key={v} onClick={() => handleAnswer(currentQ.id, v)}
                        className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
                        style={{
                          background: selected ? (v === 'True' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)') : 'var(--muted)',
                          color: selected ? (v === 'True' ? '#22c55e' : '#ef4444') : 'var(--foreground)',
                          border: `1.5px solid ${selected ? (v === 'True' ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)') : 'var(--border)'}`,
                        }}>
                        {v === 'True' ? '✓ True' : '✗ False'}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Fill in the Blank */}
              {currentQ.type === 'FillBlank' && (
                <input
                  value={fillAnswer}
                  onChange={e => setFillAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: 'var(--muted)', color: 'var(--foreground)',
                    border: `1.5px solid ${fillAnswer.trim() ? 'rgba(99,102,241,0.4)' : 'var(--border)'}`,
                  }}
                  onKeyDown={e => { if (e.key === 'Enter') handleAnswer(currentQ.id, fillAnswer.trim()) }}
                />
              )}
            </div>

            {/* Question dots nav */}
            <div className="flex flex-wrap gap-1.5 justify-center">
              {questions.map((q, i) => {
                const isAnswered = !!answers[q.id]
                const isCurrent = i === currentIdx
                return (
                  <button key={q.id} onClick={() => { setCurrentIdx(i); setFillAnswer(answers[q.id] ?? '') }}
                    className="w-7 h-7 rounded-lg text-xs font-bold transition-all"
                    style={{
                      background: isCurrent ? 'var(--primary)' : isAnswered ? 'rgba(99,102,241,0.2)' : 'var(--muted)',
                      color: isCurrent ? '#fff' : isAnswered ? 'var(--primary)' : 'var(--muted-foreground)',
                      border: `1px solid ${isCurrent ? 'var(--primary)' : isAnswered ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`,
                    }}>
                    {i + 1}
                  </button>
                )
              })}
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-3">
              <button onClick={handlePrev} disabled={currentIdx === 0}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80 disabled:opacity-30"
                style={{ background: 'var(--muted)', color: 'var(--foreground)', border: '1px solid var(--border)' }}>
                <ChevronLeft size={14} /> Previous
              </button>

              {currentIdx < questions.length - 1 ? (
                <button onClick={handleNext}
                  className="ml-auto flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
                  style={{ background: 'var(--muted)', color: 'var(--foreground)', border: '1px solid var(--border)' }}>
                  Next <ChevronRight size={14} />
                </button>
              ) : (
                <button onClick={handleSubmitQuiz}
                  className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  <Send size={14} /> Submit Quiz
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── RESULTS PHASE ── */}
        {quizPhase === 'results' && (
          <div className="space-y-4">
            {/* Score card */}
            <div className="p-6 rounded-2xl text-center"
              style={{
                background: pct >= 80 ? 'rgba(34,197,94,0.06)' : pct >= 60 ? 'rgba(245,158,11,0.06)' : 'rgba(239,68,68,0.06)',
                border: `1px solid ${pct >= 80 ? 'rgba(34,197,94,0.2)' : pct >= 60 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}`,
              }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{
                  background: pct >= 80 ? 'rgba(34,197,94,0.12)' : pct >= 60 ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
                  border: `3px solid ${pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444'}`,
                }}>
                <span className="text-2xl font-bold"
                  style={{ color: pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444' }}>
                  {pct}%
                </span>
              </div>
              <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--foreground)' }}>
                {pct >= 80 ? '🎉 Excellent Work!' : pct >= 60 ? '👍 Good Effort!' : '📚 Keep Practicing!'}
              </h2>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                {score} out of {questions.length} correct · {topic}
              </p>

              {/* Stats row */}
              <div className="flex justify-center gap-6 mt-4">
                {[
                  { icon: CheckCircle2, label: 'Correct', value: score, color: '#22c55e' },
                  { icon: XCircle, label: 'Wrong', value: questions.length - score, color: '#ef4444' },
                  { icon: Trophy, label: 'Score', value: `${pct}%`, color: pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444' },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="flex flex-col items-center gap-1">
                    <Icon size={18} style={{ color }} />
                    <span className="text-lg font-bold" style={{ color }}>{value}</span>
                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance analytics */}
            <div className="p-5 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                <BarChart2 size={15} style={{ color: 'var(--primary)' }} /> Performance Analytics
              </h3>
              <div className="space-y-2">
                {[
                  { label: 'Accuracy', value: pct, color: pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444' },
                  { label: 'Questions Attempted', value: Math.round((Object.keys(answers).length / questions.length) * 100), color: '#6366f1' },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{label}</span>
                      <span className="text-xs font-bold" style={{ color }}>{value}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${value}%`, background: color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Per-question review */}
            <div className="p-5 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                <BookOpen size={15} style={{ color: 'var(--primary)' }} /> Question Review
              </h3>
              <div className="space-y-3">
                {questions.map((q, i) => {
                  const result = results.find(r => r.questionId === q.id)
                  const isCorrect = result?.correct ?? false
                  const userAns = result?.userAnswer ?? ''
                  const showExp = showExplanation[q.id]
                  return (
                    <div key={q.id} className="p-4 rounded-xl"
                      style={{
                        background: isCorrect ? 'rgba(34,197,94,0.04)' : 'rgba(239,68,68,0.04)',
                        border: `1px solid ${isCorrect ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`,
                      }}>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {isCorrect
                            ? <CheckCircle2 size={16} style={{ color: '#22c55e' }} />
                            : <XCircle size={16} style={{ color: '#ef4444' }} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold mb-1" style={{ color: isCorrect ? '#22c55e' : '#ef4444' }}>
                            Q{i + 1}: {isCorrect ? 'Correct' : 'Incorrect'}
                          </p>
                          <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--foreground)' }}>{q.text}</p>
                          <div className="flex flex-wrap gap-3 text-xs mb-2">
                            <span>Your answer: <strong style={{ color: isCorrect ? '#22c55e' : '#ef4444' }}>{userAns || '—'}</strong></span>
                            {!isCorrect && <span>Correct: <strong style={{ color: '#22c55e' }}>{q.correct}</strong></span>}
                          </div>
                          <button onClick={() => setShowExplanation(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                            className="flex items-center gap-1.5 text-xs font-semibold transition-all hover:opacity-70"
                            style={{ color: 'var(--primary)' }}>
                            {showExp ? <EyeOff size={11} /> : <Eye size={11} />}
                            {showExp ? 'Hide' : 'Show'} Explanation
                          </button>
                          {showExp && (
                            <div className="mt-2 p-3 rounded-lg text-xs leading-relaxed"
                              style={{ background: 'rgba(99,102,241,0.06)', color: 'var(--muted-foreground)', border: '1px solid rgba(99,102,241,0.12)' }}>
                              {q.explanation}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => {
                setAnswers({})
                setFillAnswer('')
                setSubmitted(false)
                setResults([])
                setCurrentIdx(0)
                setShowExplanation({})
                setStartTime(Date.now())
                setQuestionStartTime(Date.now())
              }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                style={{ background: 'var(--muted)', color: 'var(--foreground)', border: '1px solid var(--border)' }}>
                <RotateCcw size={15} /> Retake Quiz
              </button>
              <button onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                <Sparkles size={15} /> Generate New Quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
