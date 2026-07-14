import { useState, useRef } from 'react'
import { useAppContext, type MockTestDef, type MockQuestion, type QuestionType } from '../../context/AppContext'
import {
  Plus, Trash2, Clock, X, Check, Search, ChevronRight, ChevronDown,
  Folder, FolderOpen, FileText, Code2, AlignLeft, Edit3, Pencil, GripVertical,
  Cpu, BookOpen, ArrowLeft, BarChart3, Minus, Bell,
} from 'lucide-react'
import RichTextEditor from '../../components/RichTextEditor'

const TYPE_COLORS = { aptitude: '#6366f1', technical: '#06b6d4', mixed: '#8b5cf6' } as const
const QTYPE_COLORS: Record<QuestionType, string> = { mcq: '#6366f1', fill_blank: '#f59e0b', textual: '#10b981', coding: '#ef4444' }
const QTYPE_ICONS: Record<QuestionType, any> = { mcq: BookOpen, fill_blank: Edit3, textual: AlignLeft, coding: Code2 }
const QTYPE_LABELS: Record<QuestionType, string> = { mcq: 'MCQ', fill_blank: 'Fill Blank', textual: 'Textual', coding: 'Coding' }
const LANGS = ['python', 'javascript', 'java', 'cpp', 'c'] as const

const inputSt = { background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', colorScheme: 'inherit' as const }
const inputCls = 'w-full px-3 py-2.5 rounded-xl text-sm outline-none'
const labelCls = 'block text-xs font-semibold mb-1.5'

function stripHtml(value = '') {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

// ── File Explorer ─────────────────────────────────────────────────────────────
function FileExplorer({ onAddQuestion }: { onAddQuestion: (q: MockQuestion) => void }) {
  const { aptitudeQuestions, aptitudeTopics, dsaProblems, dsaTopics } = useAppContext()
  const [openTopics, setOpenTopics] = useState<Set<string>>(new Set())
  const [openSubs, setOpenSubs] = useState<Set<string>>(new Set())
  const [section, setSection] = useState<'aptitude' | 'dsa'>('aptitude')
  const [search, setSearch] = useState('')

  function toggleT(k: string) { setOpenTopics(s => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n }) }
  function toggleS(k: string) { setOpenSubs(s => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n }) }

  function addAptQuestion(q: typeof aptitudeQuestions[0]) {
    onAddQuestion({
      id: `bank-${q.id}-${Date.now()}`,
      type: 'mcq',
      topic: q.topic,
      subtopic: q.subtopic,
      question: q.question,
      options: q.options,
      correct: q.correct,
      marks: q.marks,
      timeLimit: q.timeLimit,
      explanation: q.explanation,
      sourceId: q.id,
    })
  }

  function addDsaQuestion(p: typeof dsaProblems[0]) {
    onAddQuestion({
      id: `dsa-${p.id}-${Date.now()}`,
      type: 'coding',
      topic: p.topic,
      question: `${p.title}\n\n${p.description}`,
      starterCode: p.starterCode,
      testCases: p.sampleTestCases,
      marks: p.difficulty === 'Hard' ? 5 : p.difficulty === 'Medium' ? 3 : 2,
      timeLimit: 600,
      sourceId: p.id,
    })
  }

  const filteredDsa = dsaProblems.filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.topic.toLowerCase().includes(search.toLowerCase()))
  const dsaGrouped = dsaTopics.map(t => ({ topic: t, problems: filteredDsa.filter(p => p.topic === t.name) })).filter(g => g.problems.length > 0)
  const aptitudeGrouped = Array.from(new Set(aptitudeQuestions.map(q => q.topic))).map((name, index) => ({
    id: `apt-topic-${index}`,
    name,
    subtopics: Array.from(new Set(aptitudeQuestions.filter(q => q.topic === name).map(q => q.subtopic || 'General'))),
  }))

  return (
    <div className="space-y-3">
      {/* Bank switcher */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--muted)' }}>
        {(['aptitude', 'dsa'] as const).map(s => (
          <button key={s} onClick={() => setSection(s)}
            className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: section === s ? 'var(--card)' : 'transparent',
              color: section === s ? 'var(--foreground)' : 'var(--muted-foreground)',
              boxShadow: section === s ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
            }}>
            {s === 'dsa' ? '⚡ DSA Bank' : '📚 Aptitude Bank'}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={section === 'aptitude' ? 'Search aptitude questions…' : 'Search DSA problems…'}
          className="w-full pl-8 pr-3 py-2 rounded-xl text-xs outline-none" style={inputSt} />
      </div>

      {/* Tree */}
      <div className="overflow-y-auto rounded-xl space-y-0.5" style={{ maxHeight: 320 }}>
        {section === 'aptitude' ? (
          aptitudeGrouped.map(topic => {
            const topicQs = aptitudeQuestions.filter(q => q.topic === topic.name && (!search || q.question.toLowerCase().includes(search.toLowerCase())))
            if (!topicQs.length) return null
            const isOpen = openTopics.has(topic.id)
            return (
              <div key={topic.id}>
                <button onClick={() => toggleT(topic.id)}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left hover:opacity-80 transition-opacity">
                  {isOpen ? <ChevronDown size={11} style={{ color: 'var(--muted-foreground)' }} /> : <ChevronRight size={11} style={{ color: 'var(--muted-foreground)' }} />}
                  {isOpen ? <FolderOpen size={13} style={{ color: '#f59e0b' }} /> : <Folder size={13} style={{ color: '#f59e0b' }} />}
                  <span className="flex-1 text-xs font-semibold truncate" style={{ color: 'var(--foreground)' }}>{topic.name}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc' }}>{topicQs.length}</span>
                </button>
                {isOpen && topic.subtopics.map(sub => {
                  const subKey = `apt-${topic.id}:${sub}`
                  const subQs = topicQs.filter(q => q.subtopic === sub)
                  if (!subQs.length && search) return null
                  const isSubOpen = openSubs.has(subKey)
                  return (
                    <div key={sub} className="ml-5">
                      <button onClick={() => toggleS(subKey)} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left hover:opacity-80">
                        {isSubOpen ? <ChevronDown size={10} style={{ color: 'var(--muted-foreground)' }} /> : <ChevronRight size={10} style={{ color: 'var(--muted-foreground)' }} />}
                        <FileText size={11} style={{ color: '#a5b4fc' }} />
                        <span className="flex-1 text-xs truncate" style={{ color: 'var(--foreground)' }}>{sub}</span>
                        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{subQs.length}</span>
                      </button>
                      {isSubOpen && subQs.map(q => (
                        <button key={q.id} onClick={() => addAptQuestion(q)}
                          className="w-full flex items-center gap-2 px-3 py-2 ml-3 rounded-lg text-left text-xs hover:opacity-80 group transition-all"
                          style={{ background: 'var(--muted)' }}>
                          <span className="flex-1 text-xs line-clamp-1" style={{ color: 'var(--foreground)' }}>{stripHtml(q.question)}</span>
                          <Plus size={11} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#6366f1' }} />
                        </button>
                      ))}
                    </div>
                  )
                })}
              </div>
            )
          })
        ) : (
          dsaGrouped.map(g => {
            const isOpen = openTopics.has(`dsa-${g.topic.id}`)
            return (
              <div key={g.topic.id}>
                <button onClick={() => toggleT(`dsa-${g.topic.id}`)}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left hover:opacity-80">
                  {isOpen ? <ChevronDown size={11} style={{ color: 'var(--muted-foreground)' }} /> : <ChevronRight size={11} style={{ color: 'var(--muted-foreground)' }} />}
                  {isOpen ? <FolderOpen size={13} style={{ color: '#f59e0b' }} /> : <Folder size={13} style={{ color: '#f59e0b' }} />}
                  <span className="flex-1 text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{g.topic.name}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5' }}>{g.problems.length}</span>
                </button>
                {isOpen && g.problems.map(p => (
                  <button key={p.id} onClick={() => addDsaQuestion(p)}
                    className="w-full flex items-center gap-2 px-3 py-2 ml-5 rounded-lg text-left text-xs hover:opacity-80 group transition-all"
                    style={{ background: 'var(--muted)' }}>
                    <Cpu size={11} className="flex-shrink-0" style={{ color: '#ef4444' }} />
                    <span className="flex-1 text-xs" style={{ color: 'var(--foreground)' }}>{p.title}</span>
                    <span className="text-xs font-semibold" style={{ color: p.difficulty === 'Easy' ? '#22c55e' : p.difficulty === 'Medium' ? '#f59e0b' : '#ef4444' }}>
                      {p.difficulty[0]}
                    </span>
                    <Plus size={11} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#ef4444' }} />
                  </button>
                ))}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// ── Create Question Form ───────────────────────────────────────────────────────
function CreateQuestionForm({ onAdd, onCancel }: { onAdd: (q: MockQuestion) => void; onCancel: () => void }) {
  const [qtype, setQtype] = useState<QuestionType>('mcq')
  const [form, setForm] = useState({
    topic: '',
    question: '',
    marks: 1,
    timeLimit: 60,
    explanation: '',
    options: ['', '', '', ''],
    correct: 0,
    blankAnswer: '',
    sampleAnswer: '',
    starterCode: { python: '', javascript: '', java: '', cpp: '', c: '' } as Record<string, string>,
    testCases: [{ input: '', expected: '' }],
    activeLang: 'python',
  })
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  function submit() {
    const base = { id: `new-${Date.now()}`, type: qtype, topic: form.topic, question: form.question, marks: form.marks, timeLimit: form.timeLimit, explanation: form.explanation }
    if (qtype === 'mcq') onAdd({ ...base, options: form.options, correct: form.correct })
    else if (qtype === 'fill_blank') onAdd({ ...base, blankAnswer: form.blankAnswer })
    else if (qtype === 'textual') onAdd({ ...base, sampleAnswer: form.sampleAnswer })
    else onAdd({ ...base, starterCode: form.starterCode, testCases: form.testCases })
  }

  return (
    <div className="space-y-4">
      {/* Type: segmented buttons */}
      <div>
        <label className={labelCls} style={{ color: 'var(--muted-foreground)' }}>Question Type</label>
        <div className="flex gap-1.5">
          {(Object.keys(QTYPE_LABELS) as QuestionType[]).map(t => {
            const Icon = QTYPE_ICONS[t]
            const active = qtype === t
            return (
              <button key={t} onClick={() => setQtype(t)}
                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: active ? `${QTYPE_COLORS[t]}18` : 'var(--muted)',
                  border: `1.5px solid ${active ? QTYPE_COLORS[t] : 'transparent'}`,
                  color: active ? QTYPE_COLORS[t] : 'var(--muted-foreground)',
                }}>
                <Icon size={13} />
                <span className="hidden sm:inline">{QTYPE_LABELS[t]}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Topic + Question */}
      <div>
        <label className={labelCls} style={{ color: 'var(--muted-foreground)' }}>Topic</label>
        <input value={form.topic} onChange={e => set('topic', e.target.value)} placeholder="e.g. Quantitative Aptitude"
          className={inputCls} style={inputSt} />
      </div>
      <div>
        <label className={labelCls} style={{ color: 'var(--muted-foreground)' }}>
          {qtype === 'coding' ? 'Problem Statement' : 'Question'}
        </label>
        <RichTextEditor
          value={form.question}
          onChange={v => set('question', v)}
          placeholder={qtype === 'fill_blank' ? 'Use ___ for blank. e.g. "The capital of France is ___."' : 'Enter question text…'}
        />
      </div>

      {/* MCQ options — configurable count */}
      {qtype === 'mcq' && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={labelCls} style={{ color: 'var(--muted-foreground)', marginBottom: 0 }}>
              Options <span style={{ color: '#22c55e', fontWeight: 400 }}>· click ○ to mark correct</span>
            </label>
            <div className="flex gap-1.5">
              <button onClick={() => { if (form.options.length <= 2) return; const o = form.options.slice(0, -1); set('options', o); if (form.correct >= o.length) set('correct', o.length - 1) }}
                disabled={form.options.length <= 2}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold disabled:opacity-40 transition-all"
                style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                <Minus size={10} />
              </button>
              <button onClick={() => { if (form.options.length >= 6) return; set('options', [...form.options, '']) }}
                disabled={form.options.length >= 6}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold disabled:opacity-40 transition-all"
                style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--primary)' }}>
                <Plus size={10} />
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {form.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <button onClick={() => set('correct', i)}
                  className="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all"
                  style={{ borderColor: form.correct === i ? '#22c55e' : 'var(--border)', background: form.correct === i ? '#22c55e' : 'transparent' }}>
                  {form.correct === i && <Check size={9} className="text-white" />}
                </button>
                <span className="text-xs font-bold w-4 text-center flex-shrink-0" style={{ color: 'var(--muted-foreground)' }}>
                  {String.fromCharCode(65 + i)}
                </span>
                <input value={opt} onChange={e => { const o = [...form.options]; o[i] = e.target.value; set('options', o) }}
                  placeholder={`Option ${String.fromCharCode(65 + i)}`}
                  className="flex-1 min-w-0 px-3 py-2 rounded-xl text-sm outline-none" style={inputSt} />
                {form.options.length > 2 && (
                  <button onClick={() => { const o = form.options.filter((_, j) => j !== i); set('options', o); if (form.correct >= o.length) set('correct', o.length - 1) }}
                    className="hover:opacity-70 transition-opacity" style={{ color: '#f87171' }}>
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fill blank */}
      {qtype === 'fill_blank' && (
        <div>
          <label className={labelCls} style={{ color: 'var(--muted-foreground)' }}>Correct Answer</label>
          <input value={form.blankAnswer} onChange={e => set('blankAnswer', e.target.value)}
            placeholder="The exact answer for the blank" className={inputCls} style={inputSt} />
        </div>
      )}

      {/* Textual */}
      {qtype === 'textual' && (
        <div>
          <label className={labelCls} style={{ color: 'var(--muted-foreground)' }}>Sample Answer / Rubric</label>
          <textarea value={form.sampleAnswer} onChange={e => set('sampleAnswer', e.target.value)}
            rows={3} className={inputCls + ' resize-none'} style={inputSt} placeholder="Model answer or grading rubric…" />
        </div>
      )}

      {/* Coding */}
      {qtype === 'coding' && (
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Starter Code</label>
              <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: 'var(--muted)' }}>
                {LANGS.map(l => (
                  <button key={l} onClick={() => set('activeLang', l)}
                    className="px-2 py-0.5 rounded-md text-xs font-semibold transition-all"
                    style={{
                      background: form.activeLang === l ? 'var(--card)' : 'transparent',
                      color: form.activeLang === l ? 'var(--foreground)' : 'var(--muted-foreground)',
                    }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <textarea value={form.starterCode[form.activeLang] || ''} onChange={e => set('starterCode', { ...form.starterCode, [form.activeLang]: e.target.value })}
              rows={4} className="w-full px-3 py-2.5 rounded-xl text-xs outline-none font-mono resize-none" style={inputSt}
              placeholder={`Starter code for ${form.activeLang}…`} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Test Cases</label>
              <button onClick={() => set('testCases', [...form.testCases, { input: '', expected: '' }])}
                className="text-xs font-semibold hover:opacity-70" style={{ color: '#a5b4fc' }}>+ Add case</button>
            </div>
            {form.testCases.map((tc, i) => (
              <div key={i} className="flex gap-2 mb-2 items-start">
                <div className="flex-1">
                  <div className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Input</div>
                  <textarea value={tc.input} onChange={e => { const t = [...form.testCases]; t[i] = { ...t[i], input: e.target.value }; set('testCases', t) }}
                    rows={2} placeholder="e.g. nums = [2,7]" className="w-full px-2.5 py-1.5 rounded-lg text-xs outline-none font-mono resize-none" style={inputSt} />
                </div>
                <div className="flex-1">
                  <div className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Expected</div>
                  <textarea value={tc.expected} onChange={e => { const t = [...form.testCases]; t[i] = { ...t[i], expected: e.target.value }; set('testCases', t) }}
                    rows={2} placeholder="Expected output" className="w-full px-2.5 py-1.5 rounded-lg text-xs outline-none font-mono resize-none" style={inputSt} />
                </div>
                <button onClick={() => set('testCases', form.testCases.filter((_, j) => j !== i))} className="mt-5 flex-shrink-0 hover:opacity-70" style={{ color: '#f87171' }}>
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Marks | Time | Explanation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className={labelCls} style={{ color: 'var(--muted-foreground)' }}>Marks</label>
          <input type="number" value={form.marks} onChange={e => set('marks', +e.target.value)} min="1" className={inputCls} style={inputSt} />
        </div>
        <div>
          <label className={labelCls} style={{ color: 'var(--muted-foreground)' }}>Time (sec)</label>
          <input type="number" value={form.timeLimit} onChange={e => set('timeLimit', +e.target.value)} min="10" className={inputCls} style={inputSt} />
        </div>
        <div>
          <label className={labelCls} style={{ color: 'var(--muted-foreground)' }}>Explanation</label>
          <input value={form.explanation} onChange={e => set('explanation', e.target.value)} placeholder="Brief note" className={inputCls} style={inputSt} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button onClick={submit}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
          Add to Test
        </button>
        <button onClick={onCancel}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
          style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

// ── Builder View ──────────────────────────────────────────────────────────────
function BuilderView({
  editingTest,
  draftConfig,
  setDraftConfig,
  draftQuestions,
  setDraftQuestions,
  onSave,
  onBack,
}: {
  editingTest: MockTestDef | null
  draftConfig: Partial<MockTestDef>
  setDraftConfig: React.Dispatch<React.SetStateAction<Partial<MockTestDef>>>
  draftQuestions: MockQuestion[]
  setDraftQuestions: React.Dispatch<React.SetStateAction<MockQuestion[]>>
  onSave: () => void
  onBack: () => void
}) {
  const [addTab, setAddTab] = useState<'bank' | 'create'>('bank')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const dragIdx = useRef<number | null>(null)

  const totalMarks = draftQuestions.reduce((s, q) => s + q.marks, 0)
  const estimatedMin = Math.ceil(draftQuestions.reduce((s, q) => s + q.timeLimit, 0) / 60)
  const cfg = (k: string, v: any) => setDraftConfig(f => ({ ...f, [k]: v }))

  function handleDragStart(i: number) { dragIdx.current = i }
  function handleDragOver(e: React.DragEvent, i: number) { e.preventDefault(); setDragOverIdx(i) }
  function handleDrop(i: number) {
    if (dragIdx.current === null || dragIdx.current === i) { setDragOverIdx(null); return }
    const arr = [...draftQuestions]
    const [item] = arr.splice(dragIdx.current, 1)
    arr.splice(i, 0, item)
    setDraftQuestions(arr)
    dragIdx.current = null
    setDragOverIdx(null)
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center gap-2 px-3 sm:px-6 py-3"
        style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(12px)' }}>
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium hover:opacity-70 transition-opacity"
          style={{ color: 'var(--muted-foreground)' }}>
          <ArrowLeft size={15} /> <span className="hidden sm:inline">Back to Tests</span><span className="sm:hidden">Back</span>
        </button>
        <div className="h-4 w-px hidden sm:block" style={{ background: 'var(--border)' }} />
        <h1 className="text-sm sm:text-base font-bold" style={{ color: 'var(--foreground)' }}>
          {editingTest ? 'Edit Mock Test' : 'Create Mock Test'}
        </h1>
        <div className="ml-auto flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
          {draftQuestions.length > 0 && (
            <div className="flex items-center gap-1.5 sm:gap-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>
              <span className="flex items-center gap-1"><BarChart3 size={12} /> {draftQuestions.length}q</span>
              <span className="hidden sm:flex items-center gap-1"><Check size={12} /> {totalMarks} marks</span>
              <span className="hidden sm:flex items-center gap-1"><Clock size={12} /> ~{estimatedMin}min</span>
            </div>
          )}
          <button onClick={onSave}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
            Save Test
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-8">

        {/* ── Section 1: Test Configuration ── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>1</span>
            <h2 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Test Configuration</h2>
          </div>
          <div className="p-5 rounded-2xl space-y-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div>
              <label className={labelCls} style={{ color: 'var(--muted-foreground)' }}>Test Title</label>
              <input value={draftConfig.title || ''} onChange={e => cfg('title', e.target.value)}
                placeholder="e.g. TCS NQT Mock Test — Set 2"
                className={inputCls} style={{ ...inputSt, fontSize: 14 }} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls} style={{ color: 'var(--muted-foreground)' }}>Type</label>
                <select value={draftConfig.type || 'aptitude'} onChange={e => cfg('type', e.target.value)} className={inputCls} style={inputSt}>
                  <option value="aptitude">Aptitude</option>
                  <option value="technical">Technical</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
              <div>
                <label className={labelCls} style={{ color: 'var(--muted-foreground)' }}>Duration (minutes)</label>
                <input type="number" min="5" max="180" value={draftConfig.duration || 30}
                  onChange={e => cfg('duration', +e.target.value)} className={inputCls} style={inputSt} />
              </div>
            </div>
            <div>
              <label className={labelCls} style={{ color: 'var(--muted-foreground)' }}>Description</label>
              <textarea value={draftConfig.description || ''} onChange={e => cfg('description', e.target.value)}
                rows={2} className={inputCls + ' resize-none'} style={inputSt}
                placeholder="Optional — describe what this test covers…" />
            </div>
            <div>
              <label className={labelCls} style={{ color: 'var(--muted-foreground)' }}>
                Go-Live Date & Time
                <span className="font-normal ml-1.5" style={{ color: 'var(--muted-foreground)', opacity: 0.7 }}>
                  — users are notified when test goes live
                </span>
              </label>
              <input type="datetime-local" value={draftConfig.liveAt ? draftConfig.liveAt.slice(0, 16) : ''}
                onChange={e => cfg('liveAt', e.target.value || undefined)}
                className={inputCls} style={{ ...inputSt, colorScheme: 'inherit' }} />
              {draftConfig.liveAt && (() => {
                const live = new Date(draftConfig.liveAt)
                const isLive = live <= new Date()
                return (
                  <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: isLive ? '#22c55e' : '#f97316' }}>
                    <Bell size={11} />
                    {isLive ? 'Test is currently live (visible to users)' : `Goes live ${live.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })} at ${live.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                  </p>
                )
              })()}
            </div>
          </div>
        </section>

        {/* ── Section 2: Selected Questions ── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>2</span>
            <h2 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Selected Questions</h2>
            {draftQuestions.length > 0 && (
              <div className="ml-auto flex items-center gap-4 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                <span className="font-semibold" style={{ color: 'var(--primary)' }}>{draftQuestions.length} questions</span>
                <span>{totalMarks} marks</span>
                <span>~{estimatedMin} min estimated</span>
              </div>
            )}
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            {draftQuestions.length === 0 ? (
              /* Empty state */
              <div className="py-16 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4"
                  style={{ background: 'var(--muted)' }}>📄</div>
                <p className="font-semibold text-sm mb-1" style={{ color: 'var(--foreground)' }}>No questions added yet</p>
                <p className="text-xs mb-5" style={{ color: 'var(--muted-foreground)' }}>
                  Add questions from the bank below or create a new one.
                </p>
                <button onClick={() => { setAddTab('bank'); document.getElementById('add-questions-section')?.scrollIntoView({ behavior: 'smooth' }) }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                  <Plus size={14} /> Add Questions
                </button>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {draftQuestions.map((q, idx) => {
                  const Icon = QTYPE_ICONS[q.type]
                  const color = QTYPE_COLORS[q.type]
                  return (
                    <div key={q.id}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={e => handleDragOver(e, idx)}
                      onDrop={() => handleDrop(idx)}
                      onDragEnd={() => setDragOverIdx(null)}
                      className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 transition-all hover:opacity-90 group cursor-default"
                      style={{ borderTop: dragOverIdx === idx ? '2px solid var(--primary)' : '1px solid transparent', borderBottom: '1px solid transparent' }}>
                      <GripVertical size={14} className="flex-shrink-0 opacity-30 group-hover:opacity-60 cursor-grab hidden sm:block"
                        style={{ color: 'var(--muted-foreground)' }} />
                      <span className="text-xs font-bold w-5 text-center flex-shrink-0" style={{ color: 'var(--muted-foreground)' }}>{idx + 1}</span>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${color}18` }}>
                        <Icon size={13} style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm line-clamp-2 sm:line-clamp-1" style={{ color: 'var(--foreground)' }}>{stripHtml(q.question)}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs px-1.5 py-0.5 rounded-md font-semibold"
                            style={{ background: `${color}15`, color }}>{QTYPE_LABELS[q.type]}</span>
                          {q.topic && <span className="text-xs hidden sm:inline" style={{ color: 'var(--muted-foreground)' }}>{q.topic}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        <span className="font-semibold">{q.marks}pt</span>
                        <span className="hidden sm:inline">{q.timeLimit}s</span>
                      </div>
                      <button onClick={() => setDraftQuestions(qs => qs.filter((_, i) => i !== idx))}
                        className="flex-shrink-0 hover:opacity-70 transition-opacity" style={{ color: '#f87171' }}>
                        <X size={15} />
                      </button>
                    </div>
                  )
                })}
                {/* Summary footer */}
                <div className="px-4 py-3 flex items-center gap-4 text-xs" style={{ background: 'rgba(99,102,241,0.04)' }}>
                  <span style={{ color: 'var(--muted-foreground)' }}>Total</span>
                  <span className="font-bold" style={{ color: 'var(--primary)' }}>{draftQuestions.length} questions</span>
                  <span style={{ color: 'var(--muted-foreground)' }}>·</span>
                  <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{totalMarks} marks</span>
                  <span style={{ color: 'var(--muted-foreground)' }}>·</span>
                  <span style={{ color: 'var(--muted-foreground)' }}>~{estimatedMin} min</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── Section 3: Add Questions ── */}
        <section id="add-questions-section">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>3</span>
            <h2 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Add Questions</h2>
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            {/* Tab bar */}
            <div className="flex" style={{ borderBottom: '1px solid var(--border)' }}>
              {([
                { id: 'bank' as const, label: '📁 From Bank', sub: 'Browse existing questions' },
                { id: 'create' as const, label: '✏️ Create New', sub: 'Write a custom question' },
              ]).map(t => (
                <button key={t.id}
                  onClick={() => { setAddTab(t.id); if (t.id === 'create') setShowCreateForm(true) }}
                  className="flex-1 px-5 py-3.5 text-left transition-colors"
                  style={{
                    borderBottom: addTab === t.id ? '2px solid var(--primary)' : '2px solid transparent',
                    background: addTab === t.id ? 'rgba(99,102,241,0.04)' : 'transparent',
                    marginBottom: -1,
                  }}>
                  <div className="text-sm font-semibold" style={{ color: addTab === t.id ? 'var(--primary)' : 'var(--muted-foreground)' }}>
                    {t.label}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)', opacity: 0.7 }}>{t.sub}</div>
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-5">
              {addTab === 'bank' && (
                <FileExplorer onAddQuestion={q => setDraftQuestions(qs => [...qs, q])} />
              )}
              {addTab === 'create' && (
                showCreateForm ? (
                  <CreateQuestionForm
                    onAdd={q => { setDraftQuestions(qs => [...qs, q]); setShowCreateForm(false); setAddTab('bank') }}
                    onCancel={() => { setShowCreateForm(false); setAddTab('bank') }}
                  />
                ) : (
                  <div className="py-10 text-center">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
                      style={{ background: 'var(--muted)' }}>✏️</div>
                    <p className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Create a custom question</p>
                    <p className="text-xs mb-5" style={{ color: 'var(--muted-foreground)' }}>
                      Write MCQ, fill-in-the-blank, textual, or coding questions from scratch.
                    </p>
                    <button onClick={() => setShowCreateForm(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white mx-auto transition-all hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                      <Plus size={14} /> New Question
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        {/* Bottom save */}
        <div className="flex justify-end pb-8">
          <button onClick={onSave}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
            Save Test
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function AdminMockTestPage() {
  const { mockTests, setMockTests } = useAppContext()
  const [view, setView] = useState<'list' | 'builder'>('list')
  const [editingTest, setEditingTest] = useState<MockTestDef | null>(null)
  const [draftConfig, setDraftConfig] = useState<Partial<MockTestDef>>({ type: 'mixed', duration: 45, title: '', description: '' })
  const [draftQuestions, setDraftQuestions] = useState<MockQuestion[]>([])

  function openBuilder(test?: MockTestDef) {
    if (test) {
      setEditingTest(test)
      setDraftConfig({ title: test.title, type: test.type, duration: test.duration, description: test.description, liveAt: test.liveAt })
      setDraftQuestions([...test.questions])
    } else {
      setEditingTest(null)
      setDraftConfig({ type: 'mixed', duration: 45, title: '', description: '' })
      setDraftQuestions([])
    }
    setView('builder')
  }

  function saveTest() {
    const t: MockTestDef = {
      id: editingTest?.id ?? Date.now().toString(),
      title: draftConfig.title || 'Untitled Test',
      type: (draftConfig.type ?? 'mixed') as MockTestDef['type'],
      duration: draftConfig.duration ?? 45,
      description: draftConfig.description ?? '',
      questions: draftQuestions,
      createdAt: editingTest?.createdAt ?? new Date().toISOString().split('T')[0],
      totalAttempts: editingTest?.totalAttempts ?? 0,
      avgScore: editingTest?.avgScore,
      liveAt: draftConfig.liveAt,
    }
    setMockTests(mockTests.find(m => m.id === t.id) ? mockTests.map(m => m.id === t.id ? t : m) : [...mockTests, t])
    setView('list')
  }

  if (view === 'builder') {
    return (
      <BuilderView
        editingTest={editingTest}
        draftConfig={draftConfig}
        setDraftConfig={setDraftConfig}
        draftQuestions={draftQuestions}
        setDraftQuestions={setDraftQuestions}
        onSave={saveTest}
        onBack={() => setView('list')}
      />
    )
  }

  // ── List view ──
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--foreground)' }}>Mock Test Creator</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            {mockTests.length} tests · MCQ, Fill Blank, Textual, Coding
          </p>
        </div>
        <button onClick={() => openBuilder()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
          <Plus size={15} /> Create Test
        </button>
      </div>

      {!mockTests.length ? (
        <div className="py-20 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4" style={{ background: 'var(--card)' }}>📝</div>
          <p className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>No tests yet</p>
          <p className="text-sm mb-5" style={{ color: 'var(--muted-foreground)' }}>Create your first mock test to get started.</p>
          <button onClick={() => openBuilder()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
            <Plus size={14} /> Create Test
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {mockTests.map(t => {
            const color = TYPE_COLORS[t.type]
            const qtypeCounts = t.questions.reduce((acc, q) => { acc[q.type] = (acc[q.type] || 0) + 1; return acc }, {} as Record<QuestionType, number>)
            const totalMarksT = t.questions.reduce((s, q) => s + q.marks, 0)
            return (
              <div key={t.id} className="p-5 rounded-2xl transition-all hover:shadow-sm"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold capitalize"
                        style={{ background: `${color}18`, color }}>{t.type}</span>
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        <Clock size={11} /> {t.duration} min
                      </span>
                      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        {t.questions.length} questions · {totalMarksT} marks
                      </span>
                      {t.totalAttempts ? (
                        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{t.totalAttempts} attempts</span>
                      ) : null}
                      {t.liveAt && (() => {
                        const now = new Date()
                        const live = new Date(t.liveAt)
                        const isLive = live <= now
                        return (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{ background: isLive ? 'rgba(34,197,94,0.12)' : 'rgba(249,115,22,0.12)', color: isLive ? '#22c55e' : '#f97316' }}>
                            <Bell size={10} />
                            {isLive ? 'Live' : `Goes live ${live.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${live.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                          </span>
                        )
                      })()}
                    </div>
                    <h3 className="font-bold text-base leading-tight" style={{ color: 'var(--foreground)' }}>{t.title}</h3>
                    {t.description && (
                      <p className="text-xs mt-1 line-clamp-1" style={{ color: 'var(--muted-foreground)' }}>{t.description}</p>
                    )}
                    <div className="flex gap-1.5 mt-2.5 flex-wrap">
                      {(Object.keys(qtypeCounts) as QuestionType[]).map(qt => {
                        const Ic = QTYPE_ICONS[qt]
                        return (
                          <span key={qt} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{ background: `${QTYPE_COLORS[qt]}12`, color: QTYPE_COLORS[qt] }}>
                            <Ic size={10} /> {qtypeCounts[qt]} {QTYPE_LABELS[qt]}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button onClick={() => openBuilder(t)}
                      className="p-2 rounded-xl hover:opacity-70 transition-opacity"
                      style={{ background: 'var(--muted)', color: '#a5b4fc' }}>
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setMockTests(mockTests.filter(m => m.id !== t.id))}
                      className="p-2 rounded-xl hover:opacity-70 transition-opacity"
                      style={{ background: 'var(--muted)', color: '#f87171' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
