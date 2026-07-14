import { useState, useMemo, useRef } from 'react'
import { useAppContext, type AptitudeQuestion } from '../../context/AppContext'
import {
  Plus, Pencil, Trash2, Search, X, Check, ChevronRight, ChevronDown,
  Upload, ArrowLeft, AlertTriangle, FileText,
  CheckSquare, Square, Layers, BookOpen,
  MoreHorizontal, ChevronLeft,
} from 'lucide-react'
import RichTextEditor from '../../components/RichTextEditor'

// ── Types ───────────────────────────────────────────────────────────────────────
const DIFFS = ['Easy', 'Medium', 'Hard'] as const
const DIFF_COLORS: Record<string, string> = { Easy: '#22c55e', Medium: '#f59e0b', Hard: '#ef4444' }
const DIFF_BG: Record<string, string> = { Easy: 'rgba(34,197,94,0.1)', Medium: 'rgba(245,158,11,0.1)', Hard: 'rgba(239,68,68,0.1)' }

// ── Style helpers ───────────────────────────────────────────────────────────────
const inputCls = 'w-full px-3 py-2 rounded-lg text-sm outline-none'
const inputSt = { background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }

// ── Toast ───────────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: 'success' | 'error' }[]>([])
  function toast(msg: string, type: 'success' | 'error' = 'success') {
    const id = Date.now()
    setToasts(prev => [...prev, { id, msg, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }
  return { toasts, toast }
}

function Toasts({ toasts }: { toasts: { id: number; msg: string; type: 'success' | 'error' }[] }) {
  return (
    <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-sm font-semibold animate-in"
          style={{
            background: t.type === 'success' ? 'rgba(16,185,129,0.95)' : 'rgba(239,68,68,0.95)',
            color: 'white',
          }}>
          {t.type === 'success' ? <Check size={14} /> : <AlertTriangle size={14} />}
          {t.msg}
        </div>
      ))}
    </div>
  )
}

// ── Topic Explorer (left panel) ─────────────────────────────────────────────────
function TopicExplorer({
  selectedTopic, selectedSub,
  onSelect, questions,
}: {
  selectedTopic: string; selectedSub: string;
  onSelect: (topic: string, sub: string) => void;
  questions: AptitudeQuestion[]
}) {
  const { aptitudeTopics, setAptitudeTopics } = useAppContext()
  const [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState(false)
  const [openTopics, setOpenTopics] = useState<Set<string>>(new Set(aptitudeTopics.slice(0, 3).map(t => t.id)))
  const [editingTopic, setEditingTopic] = useState<string | null>(null)
  const [newTopicName, setNewTopicName] = useState('')
  const [addingSubFor, setAddingSubFor] = useState<string | null>(null)
  const [newSubName, setNewSubName] = useState('')
  const [addingRoot, setAddingRoot] = useState(false)
  const [newRootName, setNewRootName] = useState('')

  const toggleTopic = (id: string) => setOpenTopics(s => {
    const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n
  })

  const filteredTopics = aptitudeTopics.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.subtopics.some(s => s.toLowerCase().includes(search.toLowerCase()))
  )

  function countQ(topic: string, sub?: string) {
    return questions.filter(q => q.topic === topic && (!sub || q.subtopic === sub)).length
  }

  function addRootTopic() {
    if (!newRootName.trim()) return
    setAptitudeTopics([...aptitudeTopics, { id: Date.now().toString(), name: newRootName.trim(), subtopics: [] }])
    setNewRootName(''); setAddingRoot(false)
  }

  function addSubtopic(topicId: string) {
    if (!newSubName.trim()) return
    setAptitudeTopics(aptitudeTopics.map(t => t.id === topicId ? { ...t, subtopics: [...t.subtopics, newSubName.trim()] } : t))
    setNewSubName(''); setAddingSubFor(null)
  }

  function renameTopic(id: string) {
    if (!newTopicName.trim()) return
    setAptitudeTopics(aptitudeTopics.map(t => t.id === id ? { ...t, name: newTopicName.trim() } : t))
    setEditingTopic(null)
  }

  function removeTopic(id: string) { setAptitudeTopics(aptitudeTopics.filter(t => t.id !== id)) }
  function removeSub(topicId: string, sub: string) {
    setAptitudeTopics(aptitudeTopics.map(t => t.id === topicId ? { ...t, subtopics: t.subtopics.filter(s => s !== sub) } : t))
  }

  if (collapsed) {
    return (
      <div className="w-10 flex-shrink-0 flex flex-col items-center py-3 gap-3"
        style={{ borderRight: '1px solid var(--border)' }}>
        <button onClick={() => setCollapsed(false)} className="p-2 rounded-lg hover:opacity-70 transition-opacity"
          style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
          <ChevronRight size={14} />
        </button>
        <Layers size={14} style={{ color: 'var(--muted-foreground)' }} />
      </div>
    )
  }

  return (
    <div className="w-64 flex-shrink-0 flex flex-col" style={{ borderRight: '1px solid var(--border)', minHeight: 0 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Topics</span>
        <div className="flex gap-1">
          <button onClick={() => setAddingRoot(true)} title="Add topic"
            className="w-6 h-6 rounded-md flex items-center justify-center hover:opacity-70 transition-opacity"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
            <Plus size={12} />
          </button>
          <button onClick={() => setCollapsed(true)}
            className="w-6 h-6 rounded-md flex items-center justify-center hover:opacity-70"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
            <ChevronLeft size={12} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2 flex-shrink-0">
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search topics…"
            className="w-full pl-7 pr-2 py-1.5 rounded-lg text-xs outline-none"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
        </div>
      </div>

      {/* Add root input */}
      {addingRoot && (
        <div className="px-3 pb-2 flex-shrink-0">
          <input autoFocus value={newRootName} onChange={e => setNewRootName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addRootTopic(); if (e.key === 'Escape') setAddingRoot(false) }}
            placeholder="Topic name…" className="w-full px-2 py-1.5 rounded-lg text-xs outline-none"
            style={{ background: 'var(--muted)', border: '1px solid var(--primary)', color: 'var(--foreground)' }} />
          <div className="flex gap-1 mt-1">
            <button onClick={addRootTopic} className="flex-1 py-1 rounded text-xs font-semibold text-white"
              style={{ background: 'var(--primary)' }}>Add</button>
            <button onClick={() => setAddingRoot(false)} className="px-2 py-1 rounded text-xs"
              style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* All topics item */}
      <div className="flex-1 overflow-y-auto">
        <button onClick={() => onSelect('', '')}
          className="w-full flex items-center justify-between px-3 py-2 text-left transition-colors"
          style={{ background: !selectedTopic ? 'rgba(99,102,241,0.1)' : 'transparent' }}>
          <div className="flex items-center gap-2">
            <BookOpen size={12} style={{ color: 'var(--muted-foreground)' }} />
            <span className="text-xs font-semibold" style={{ color: !selectedTopic ? 'var(--primary)' : 'var(--muted-foreground)' }}>
              All Questions
            </span>
          </div>
          <span className="text-xs px-1.5 py-0.5 rounded-md font-mono"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
            {questions.length}
          </span>
        </button>

        {filteredTopics.map(topic => {
          const isOpen = openTopics.has(topic.id)
          const count = countQ(topic.name)
          const isTopicSelected = selectedTopic === topic.name && !selectedSub

          return (
            <div key={topic.id}>
              {/* Topic row */}
              <div className="group flex items-center gap-1 px-2 py-1.5 transition-colors"
                style={{ background: isTopicSelected ? 'rgba(99,102,241,0.08)' : 'transparent' }}>
                <button onClick={() => toggleTopic(topic.id)} className="flex-shrink-0 p-0.5"
                  style={{ color: 'var(--muted-foreground)' }}>
                  {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </button>
                {editingTopic === topic.id ? (
                  <input autoFocus value={newTopicName} onChange={e => setNewTopicName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') renameTopic(topic.id); if (e.key === 'Escape') setEditingTopic(null) }}
                    onBlur={() => renameTopic(topic.id)}
                    className="flex-1 px-1 py-0.5 rounded text-xs outline-none"
                    style={{ background: 'var(--muted)', border: '1px solid var(--primary)', color: 'var(--foreground)' }} />
                ) : (
                  <button onClick={() => onSelect(topic.name, '')} className="flex-1 text-left">
                    <span className="text-xs font-semibold truncate block"
                      style={{ color: isTopicSelected ? 'var(--primary)' : 'var(--foreground)' }}>
                      {topic.name}
                    </span>
                  </button>
                )}
                <span className="text-xs px-1 rounded font-mono flex-shrink-0"
                  style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', fontSize: 10 }}>
                  {count}
                </span>
                <div className="opacity-0 group-hover:opacity-100 flex gap-0.5 flex-shrink-0 transition-opacity">
                  <button onClick={() => { setEditingTopic(topic.id); setNewTopicName(topic.name) }}
                    className="w-5 h-5 flex items-center justify-center rounded hover:opacity-70"
                    style={{ color: 'var(--muted-foreground)' }}>
                    <Pencil size={10} />
                  </button>
                  <button onClick={() => removeTopic(topic.id)}
                    className="w-5 h-5 flex items-center justify-center rounded hover:opacity-70"
                    style={{ color: '#f87171' }}>
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>

              {/* Subtopics */}
              {isOpen && (
                <div className="ml-5">
                  {topic.subtopics.map(sub => {
                    const isSubSel = selectedTopic === topic.name && selectedSub === sub
                    return (
                      <div key={sub} className="group flex items-center gap-1 pr-2 py-1 transition-colors"
                        style={{ background: isSubSel ? 'rgba(99,102,241,0.08)' : 'transparent' }}>
                        <button onClick={() => onSelect(topic.name, sub)} className="flex-1 flex items-center gap-1.5 text-left pl-2">
                          <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: isSubSel ? 'var(--primary)' : 'var(--muted-foreground)', opacity: isSubSel ? 1 : 0.5 }} />
                          <span className="text-xs truncate" style={{ color: isSubSel ? 'var(--primary)' : 'var(--muted-foreground)' }}>
                            {sub}
                          </span>
                        </button>
                        <span className="text-xs font-mono flex-shrink-0"
                          style={{ color: 'var(--muted-foreground)', fontSize: 10 }}>
                          {countQ(topic.name, sub)}
                        </span>
                        <button onClick={() => removeSub(topic.id, sub)}
                          className="opacity-0 group-hover:opacity-100 w-4 h-4 flex items-center justify-center rounded hover:opacity-70 flex-shrink-0"
                          style={{ color: '#f87171' }}>
                          <X size={9} />
                        </button>
                      </div>
                    )
                  })}
                  {/* Add subtopic */}
                  {addingSubFor === topic.id ? (
                    <div className="px-2 py-1">
                      <input autoFocus value={newSubName} onChange={e => setNewSubName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') addSubtopic(topic.id); if (e.key === 'Escape') setAddingSubFor(null) }}
                        placeholder="Subtopic name…" className="w-full px-2 py-1 rounded text-xs outline-none"
                        style={{ background: 'var(--muted)', border: '1px solid var(--primary)', color: 'var(--foreground)' }} />
                    </div>
                  ) : (
                    <button onClick={() => { setAddingSubFor(topic.id); setNewSubName('') }}
                      className="flex items-center gap-1 pl-2 py-1 text-xs hover:opacity-70 transition-opacity w-full"
                      style={{ color: 'var(--muted-foreground)' }}>
                      <Plus size={10} /> Add subtopic
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Question Table (right panel) ────────────────────────────────────────────────
function QuestionTable({
  questions,
  selectedIds,
  onToggle,
  onToggleAll,
  onEdit,
  onDelete,
  filterTopic,
  filterSub,
}: {
  questions: AptitudeQuestion[]
  selectedIds: Set<string>
  onToggle: (id: string) => void
  onToggleAll: (ids: string[]) => void
  onEdit: (q: AptitudeQuestion) => void
  onDelete: (id: string) => void
  filterTopic: string
  filterSub: string
}) {
  const [search, setSearch] = useState('')
  const [diffFilter, setDiffFilter] = useState('')
  const [sortBy, setSortBy] = useState<'topic' | 'difficulty' | 'attempts' | 'correctRate'>('topic')
  const [page, setPage] = useState(1)
  const pageSize = 20

  const filtered = useMemo(() => {
    return questions.filter(q => {
      if (filterTopic && q.topic !== filterTopic) return false
      if (filterSub && q.subtopic !== filterSub) return false
      if (diffFilter && q.difficulty !== diffFilter) return false
      if (search) {
        const s = search.toLowerCase()
        if (!q.question.toLowerCase().includes(s) && !q.topic.toLowerCase().includes(s) && !q.subtopic.toLowerCase().includes(s)) return false
      }
      return true
    }).sort((a, b) => {
      if (sortBy === 'difficulty') return ['Easy', 'Medium', 'Hard'].indexOf(a.difficulty) - ['Easy', 'Medium', 'Hard'].indexOf(b.difficulty)
      if (sortBy === 'attempts') return (b.attempts ?? 0) - (a.attempts ?? 0)
      if (sortBy === 'correctRate') return (a.correctRate ?? 100) - (b.correctRate ?? 100)
      return a.topic.localeCompare(b.topic)
    })
  }, [questions, filterTopic, filterSub, diffFilter, search, sortBy])

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)
  const allPageIds = paged.map(q => q.id)
  const allSelected = allPageIds.length > 0 && allPageIds.every(id => selectedIds.has(id))

  return (
    <div className="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2.5 flex-shrink-0 flex-wrap" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder={filterTopic ? `Search in ${filterSub || filterTopic}…` : 'Search all questions…'}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
        </div>

        {/* Difficulty filter */}
        <div className="flex gap-1">
          {['', ...DIFFS].map(d => (
            <button key={d} onClick={() => { setDiffFilter(d); setPage(1) }}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: diffFilter === d ? (d ? DIFF_BG[d] : 'rgba(99,102,241,0.12)') : 'var(--muted)',
                color: diffFilter === d ? (d ? DIFF_COLORS[d] : 'var(--primary)') : 'var(--muted-foreground)',
              }}>
              {d || 'All'}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
          className="px-2 py-1.5 rounded-lg text-xs outline-none"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', colorScheme: 'inherit' }}>
          <option value="topic">Sort: Topic</option>
          <option value="difficulty">Sort: Difficulty</option>
          <option value="attempts">Sort: Attempts</option>
          <option value="correctRate">Sort: Correct Rate ↑</option>
        </select>

        <span className="text-xs ml-auto" style={{ color: 'var(--muted-foreground)' }}>
          {filtered.length} question{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
            style={{ background: 'var(--muted)' }}>📭</div>
          <p className="font-semibold" style={{ color: 'var(--foreground)' }}>
            {filterTopic ? `No questions in ${filterSub || filterTopic}` : 'No questions yet'}
          </p>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            {filterTopic ? 'Add questions to this topic using the + button above.' : 'Select a topic or add your first question.'}
          </p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 z-10" style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
                <tr>
                  <th className="w-8 px-3 py-2.5 text-left">
                    <button onClick={() => onToggleAll(allPageIds)}>
                      {allSelected ? <CheckSquare size={13} style={{ color: 'var(--primary)' }} /> : <Square size={13} style={{ color: 'var(--muted-foreground)' }} />}
                    </button>
                  </th>
                  <th className="px-3 py-2.5 text-left font-semibold" style={{ color: 'var(--muted-foreground)' }}>Question</th>
                  <th className="px-3 py-2.5 text-left font-semibold whitespace-nowrap hidden sm:table-cell" style={{ color: 'var(--muted-foreground)' }}>Topic / Subtopic</th>
                  <th className="px-3 py-2.5 text-left font-semibold" style={{ color: 'var(--muted-foreground)' }}>Difficulty</th>
                  <th className="px-3 py-2.5 text-left font-semibold hidden lg:table-cell" style={{ color: 'var(--muted-foreground)' }}>Stats</th>
                  <th className="px-3 py-2.5 text-left font-semibold hidden md:table-cell" style={{ color: 'var(--muted-foreground)' }}>Tags</th>
                  <th className="w-16 px-3 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {paged.map(q => (
                  <tr key={q.id} className="group border-t transition-colors hover:opacity-90"
                    style={{ borderColor: 'var(--border)', background: selectedIds.has(q.id) ? 'rgba(99,102,241,0.04)' : 'transparent' }}>
                    <td className="px-3 py-2.5">
                      <button onClick={() => onToggle(q.id)}>
                        {selectedIds.has(q.id)
                          ? <CheckSquare size={13} style={{ color: 'var(--primary)' }} />
                          : <Square size={13} style={{ color: 'var(--muted-foreground)' }} />}
                      </button>
                    </td>
                    <td className="px-3 py-2.5 max-w-xs">
                      <p className="line-clamp-2 text-xs leading-relaxed" style={{ color: 'var(--foreground)' }}>
                        {q.question.replace(/<[^>]+>/g, '')}
                      </p>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap hidden sm:table-cell">
                      <p className="font-semibold text-xs" style={{ color: 'var(--foreground)' }}>{q.topic}</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{q.subtopic}</p>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                        style={{ background: DIFF_BG[q.difficulty], color: DIFF_COLORS[q.difficulty] }}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 hidden lg:table-cell">
                      {q.attempts ? (
                        <div>
                          <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{q.attempts} attempts</div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <div className="w-16 h-1 rounded-full" style={{ background: 'var(--muted)' }}>
                              <div className="h-full rounded-full"
                                style={{ width: `${q.correctRate ?? 0}%`, background: (q.correctRate ?? 0) >= 60 ? '#22c55e' : '#f59e0b' }} />
                            </div>
                            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{q.correctRate}%</span>
                          </div>
                        </div>
                      ) : <span style={{ color: 'var(--muted-foreground)' }}>—</span>}
                    </td>
                    <td className="px-3 py-2.5 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {q.companyTags.slice(0, 2).map(c => (
                          <span key={c} className="px-1.5 py-0.5 rounded text-xs"
                            style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)' }}>{c}</span>
                        ))}
                        {q.companyTags.length > 2 && (
                          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>+{q.companyTags.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                        <button onClick={() => onEdit(q)}
                          className="p-1.5 rounded-lg hover:opacity-70" style={{ color: 'var(--primary)' }}>
                          <Pencil size={12} />
                        </button>
                        <button onClick={() => onDelete(q.id)}
                          className="p-1.5 rounded-lg hover:opacity-70" style={{ color: '#f87171' }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
              style={{ borderTop: '1px solid var(--border)' }}>
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
              </span>
              <div className="flex gap-1">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                  className="px-2.5 py-1.5 rounded-lg text-xs disabled:opacity-40"
                  style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                  ← Prev
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      className="w-7 h-7 rounded-lg text-xs font-semibold"
                      style={{ background: page === p ? 'var(--primary)' : 'var(--muted)', color: page === p ? 'white' : 'var(--muted-foreground)' }}>
                      {p}
                    </button>
                  )
                })}
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                  className="px-2.5 py-1.5 rounded-lg text-xs disabled:opacity-40"
                  style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Import Wizard ────────────────────────────────────────────────────────────────
type ImportStep = 'topic' | 'format' | 'upload' | 'preview' | 'done'
type ImportFormat = 'csv' | 'json' | 'excel' | 'paste'

const IMPORT_STEPS: ImportStep[] = ['topic', 'format', 'upload', 'preview', 'done']

function ImportWizard({ onClose, onImport }: { onClose: () => void; onImport: (qs: AptitudeQuestion[]) => void }) {
  const { aptitudeTopics, knownCompanies: _knownCompanies } = useAppContext()
  const [step, setStep] = useState<ImportStep>('topic')
  const [format, setFormat] = useState<ImportFormat>('csv')
  const [pasteText, setPasteText] = useState('')
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState('')
  const [preview, setPreview] = useState<AptitudeQuestion[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [importing, setImporting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const firstTopic = aptitudeTopics[0]?.name ?? 'Quantitative Aptitude'
  const firstSub = aptitudeTopics[0]?.subtopics[0] ?? 'General'
  const [selectedTopic, setSelectedTopic] = useState(firstTopic)
  const [selectedSub, setSelectedSub] = useState(firstSub)

  const defaultTopic = selectedTopic
  const defaultSub = selectedSub

  function parseCSV(text: string): AptitudeQuestion[] {
    const lines = text.trim().split('\n').filter(l => l.trim())
    if (lines.length < 2) return []
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''))
    return lines.slice(1).map((line, i) => {
      const cols = line.match(/(".*?"|[^,]+)/g)?.map(c => c.trim().replace(/^"|"$/g, '')) ?? line.split(',').map(c => c.trim())
      const get = (key: string) => {
        const idx = headers.indexOf(key)
        return idx >= 0 ? (cols[idx] ?? '') : ''
      }
      const options = [get('option_a') || get('option1'), get('option_b') || get('option2'), get('option_c') || get('option3'), get('option_d') || get('option4')].filter(Boolean)
      const correctRaw = get('correct') || get('answer') || '0'
      const correct = isNaN(+correctRaw) ? Math.max(0, ['a', 'b', 'c', 'd'].indexOf(correctRaw.toLowerCase())) : Math.max(0, +correctRaw - 1)
      return {
        id: `imp-${Date.now()}-${i}`,
        question: get('question') || `Question ${i + 1}`,
        options: options.length >= 2 ? options : ['Option A', 'Option B', 'Option C', 'Option D'],
        correct,
        difficulty: (['Easy', 'Medium', 'Hard'].includes(get('difficulty')) ? get('difficulty') : 'Easy') as 'Easy' | 'Medium' | 'Hard',
        topic: get('topic') || defaultTopic,
        subtopic: get('subtopic') || defaultSub,
        explanation: get('explanation') || '',
        timeLimit: +get('time_limit') || 60,
        marks: +get('marks') || 1,
        companyTags: get('company_tags') ? get('company_tags').split(';').map(c => c.trim()) : [],
        attempts: 0,
        correctRate: 0,
      }
    })
  }

  function parseJSON(text: string): AptitudeQuestion[] {
    try {
      const arr = JSON.parse(text)
      if (!Array.isArray(arr)) return []
      return arr.map((item, i) => ({
        id: `imp-${Date.now()}-${i}`,
        question: item.question || `Question ${i + 1}`,
        options: item.options ?? ['Option A', 'Option B', 'Option C', 'Option D'],
        correct: item.correct ?? 0,
        difficulty: (['Easy', 'Medium', 'Hard'].includes(item.difficulty) ? item.difficulty : 'Easy') as 'Easy' | 'Medium' | 'Hard',
        topic: item.topic || defaultTopic,
        subtopic: item.subtopic || defaultSub,
        explanation: item.explanation || '',
        timeLimit: item.timeLimit || 60,
        marks: item.marks || 1,
        companyTags: item.companyTags ?? [],
        attempts: 0, correctRate: 0,
      }))
    } catch { return [] }
  }

  function parsePaste(text: string): AptitudeQuestion[] {
    // Smart parse: numbered questions "1. Question text\nA) option...\nAnswer: B"
    const blocks = text.split(/\n\s*\n/).filter(b => b.trim())
    return blocks.map((block, i) => {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean)
      const questionLine = lines.find(l => /^\d+[.)]\s/.test(l)) ?? lines[0] ?? ''
      const question = questionLine.replace(/^\d+[.)]\s*/, '').trim()
      const options: string[] = []
      const answerLine = lines.find(l => /^(answer|ans|correct)[:\s]/i.test(l))
      let correct = 0
      lines.forEach(l => {
        const m = l.match(/^[A-Da-d][).]\s*(.+)/)
        if (m) options.push(m[1].trim())
      })
      if (answerLine) {
        const ans = answerLine.replace(/^[^:]+:\s*/i, '').trim().toUpperCase()
        correct = ['A', 'B', 'C', 'D'].indexOf(ans)
        if (correct < 0) correct = 0
      }
      return {
        id: `imp-${Date.now()}-${i}`,
        question,
        options: options.length >= 2 ? options : ['Option A', 'Option B', 'Option C', 'Option D'],
        correct,
        difficulty: 'Easy' as const,
        topic: defaultTopic,
        subtopic: defaultSub,
        explanation: '',
        timeLimit: 60,
        marks: 1,
        companyTags: [],
        attempts: 0, correctRate: 0,
      }
    }).filter(q => q.question.length > 3)
  }

  function processText(text: string) {
    let parsed: AptitudeQuestion[] = []
    const errs: string[] = []
    if (format === 'json') parsed = parseJSON(text)
    else if (format === 'csv' || format === 'excel') parsed = parseCSV(text)
    else parsed = parsePaste(text)
    if (!parsed.length) errs.push('Could not parse any questions. Check the format.')
    setPreview(parsed)
    setErrors(errs)
    setStep('preview')
  }

  function handleFile(file: File) {
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = e => {
      const text = e.target?.result as string
      processText(text)
    }
    reader.readAsText(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function doImport() {
    setImporting(true)
    setTimeout(() => {
      onImport(preview)
      setStep('done')
      setImporting(false)
    }, 700)
  }

  const FORMATS: { id: ImportFormat; label: string; ext: string; desc: string }[] = [
    { id: 'csv', label: 'CSV', ext: '.csv', desc: 'Spreadsheet-style: question, option_a, option_b, option_c, option_d, correct, difficulty, topic, subtopic' },
    { id: 'excel', label: 'Excel / TSV', ext: '.xlsx, .tsv', desc: 'Tab-separated or Excel format — paste as CSV' },
    { id: 'json', label: 'JSON', ext: '.json', desc: 'Array of question objects with question, options[], correct, difficulty, topic fields' },
    { id: 'paste', label: 'Paste Questions', ext: 'text', desc: 'Paste numbered questions with A/B/C/D options and Answer: X format' },
  ]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 className="font-bold text-base" style={{ color: 'var(--foreground)' }}>Import Questions</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              Step {IMPORT_STEPS.indexOf(step) + 1} of {IMPORT_STEPS.length}
            </p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--muted-foreground)' }}><X size={18} /></button>
        </div>

        {/* Progress */}
        <div className="flex px-6 py-3 gap-2 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          {IMPORT_STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background: step === s ? 'var(--primary)' : IMPORT_STEPS.indexOf(step) > i ? 'rgba(99,102,241,0.2)' : 'var(--muted)',
                  color: step === s ? 'white' : 'var(--muted-foreground)',
                }}>
                {IMPORT_STEPS.indexOf(step) > i ? '✓' : i + 1}
              </div>
              <span className="text-xs capitalize hidden sm:block"
                style={{ color: step === s ? 'var(--foreground)' : 'var(--muted-foreground)' }}>{s}</span>
              {i < IMPORT_STEPS.length - 1 && <div className="flex-1 h-px ml-1" style={{ background: 'var(--border)' }} />}
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 0: Topic/Subtopic */}
          {step === 'topic' && (
            <div className="space-y-5">
              <div>
                <p className="text-sm font-bold mb-1" style={{ color: 'var(--foreground)' }}>Select Topic & Subtopic</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                  All imported questions will be assigned to the topic and subtopic you choose below.
                  If your file already includes topic/subtopic columns, those will take precedence per question.
                </p>
              </div>
              <div className="p-4 rounded-xl space-y-4" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                <div>
                  <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--muted-foreground)' }}>DEFAULT TOPIC</label>
                  <select
                    value={selectedTopic}
                    onChange={e => {
                      setSelectedTopic(e.target.value)
                      const t = aptitudeTopics.find(t => t.name === e.target.value)
                      setSelectedSub(t?.subtopics[0] ?? 'General')
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: 'var(--secondary)', border: '1px solid var(--border)', color: 'var(--foreground)', colorScheme: 'inherit' }}>
                    {aptitudeTopics.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--muted-foreground)' }}>DEFAULT SUBTOPIC</label>
                  <select
                    value={selectedSub}
                    onChange={e => setSelectedSub(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: 'var(--secondary)', border: '1px solid var(--border)', color: 'var(--foreground)', colorScheme: 'inherit' }}>
                    {(aptitudeTopics.find(t => t.name === selectedTopic)?.subtopics ?? ['General']).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="p-3 rounded-xl flex items-start gap-2" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <span style={{ color: '#f59e0b', fontSize: 14 }}>ℹ</span>
                <p className="text-xs leading-relaxed" style={{ color: '#f59e0b' }}>
                  Questions missing topic/subtopic fields in their source file will automatically inherit the defaults you set here.
                </p>
              </div>
              <div className="flex justify-between pt-1">
                <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm" style={{ color: 'var(--muted-foreground)' }}>Cancel</button>
                <button onClick={() => setStep('format')}
                  className="px-5 py-2 rounded-xl text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Format */}
          {step === 'format' && (
            <div className="space-y-3">
              <p className="text-sm font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Choose import format:</p>
              {FORMATS.map(f => (
                <button key={f.id} onClick={() => setFormat(f.id)}
                  className="w-full flex items-start gap-3 p-4 rounded-xl text-left transition-all"
                  style={{
                    background: format === f.id ? 'rgba(99,102,241,0.08)' : 'var(--muted)',
                    border: `2px solid ${format === f.id ? 'rgba(99,102,241,0.4)' : 'transparent'}`,
                  }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: format === f.id ? 'rgba(99,102,241,0.15)' : 'var(--border)' }}>
                    <FileText size={16} style={{ color: format === f.id ? 'var(--primary)' : 'var(--muted-foreground)' }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>{f.label} <span className="font-normal text-xs" style={{ color: 'var(--muted-foreground)' }}>{f.ext}</span></p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{f.desc}</p>
                  </div>
                  <div className="ml-auto flex-shrink-0 mt-1">
                    <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                      style={{ borderColor: format === f.id ? 'var(--primary)' : 'var(--border)' }}>
                      {format === f.id && <div className="w-2 h-2 rounded-full" style={{ background: 'var(--primary)' }} />}
                    </div>
                  </div>
                </button>
              ))}
              <div className="flex justify-between pt-2">
                <button onClick={() => setStep('topic')}
                  className="px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>← Back</button>
                <button onClick={() => setStep('upload')}
                  className="px-5 py-2 rounded-xl text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Upload */}
          {step === 'upload' && (
            <div className="space-y-4">
              {format !== 'paste' ? (
                <>
                  {/* Drag and drop zone */}
                  <div
                    onDragOver={e => { e.preventDefault(); setDragging(true) }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                    className="relative flex flex-col items-center justify-center py-16 rounded-2xl cursor-pointer transition-all"
                    style={{
                      border: `2px dashed ${dragging ? 'var(--primary)' : 'var(--border)'}`,
                      background: dragging ? 'rgba(99,102,241,0.04)' : 'var(--muted)',
                    }}>
                    <Upload size={32} className="mb-3" style={{ color: dragging ? 'var(--primary)' : 'var(--muted-foreground)' }} />
                    <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
                      {fileName ? fileName : 'Drop your file here or click to browse'}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                      Supports {FORMATS.find(f => f.id === format)?.ext} files
                    </p>
                    <input ref={fileRef} type="file" className="hidden"
                      accept={format === 'json' ? '.json' : '.csv,.tsv,.txt,.xlsx'}
                      onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }} />
                  </div>

                  <div className="text-center">
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Or paste CSV/JSON text directly:</p>
                  </div>
                  <textarea value={pasteText} onChange={e => setPasteText(e.target.value)} rows={6}
                    placeholder={format === 'json' ? '[{"question":"...", "options":["A","B","C","D"], "correct":0, ...}]' : 'question,option_a,option_b,option_c,option_d,correct,difficulty,topic,subtopic\n"What is 2+2?","2","3","4","5",3,Easy,Math,Arithmetic'}
                    className="w-full px-3 py-2.5 rounded-xl text-xs outline-none font-mono resize-none"
                    style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
                  <div className="flex gap-2">
                    <button onClick={() => setStep('format')}
                      className="px-4 py-2 rounded-xl text-sm font-semibold"
                      style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                      ← Back
                    </button>
                    <button onClick={() => processText(pasteText)} disabled={!pasteText.trim()}
                      className="flex-1 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                      Preview →
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Paste your questions:</p>
                  <div className="p-3 rounded-xl text-xs" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                    <p className="font-semibold mb-1" style={{ color: '#a5b4fc' }}>Expected format (each question separated by blank line):</p>
                    <pre className="whitespace-pre-wrap font-mono" style={{ color: 'var(--muted-foreground)' }}>
{`1. What is the capital of France?
A) London
B) Berlin
C) Paris
D) Rome
Answer: C

2. What is 5 × 7?
A) 30  B) 35  C) 40  D) 45
Answer: B`}
                    </pre>
                  </div>
                  <textarea value={pasteText} onChange={e => setPasteText(e.target.value)} rows={12}
                    placeholder="Paste your questions here..."
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                    style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
                  <div className="flex gap-2">
                    <button onClick={() => setStep('format')}
                      className="px-4 py-2 rounded-xl text-sm font-semibold"
                      style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>← Back</button>
                    <button onClick={() => processText(pasteText)} disabled={!pasteText.trim()}
                      className="flex-1 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                      Parse & Preview →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Preview */}
          {step === 'preview' && (
            <div className="space-y-4">
              {errors.length > 0 && (
                <div className="p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {errors.map((e, i) => <p key={i} className="text-xs" style={{ color: '#f87171' }}>⚠ {e}</p>)}
                </div>
              )}

              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
                  {preview.length} questions ready to import
                </p>
                <div className="flex gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  {(['Easy', 'Medium', 'Hard'] as const).map(d => {
                    const cnt = preview.filter(q => q.difficulty === d).length
                    return cnt > 0 ? (
                      <span key={d} className="px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: DIFF_BG[d], color: DIFF_COLORS[d] }}>
                        {cnt} {d}
                      </span>
                    ) : null
                  })}
                </div>
              </div>

              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                <div className="max-h-64 overflow-y-auto divide-y" style={{ borderColor: 'var(--border)' }}>
                  {preview.map((q, i) => (
                    <div key={q.id} className="px-4 py-2.5 flex items-start gap-3">
                      <span className="text-xs font-mono mt-0.5 flex-shrink-0" style={{ color: 'var(--muted-foreground)' }}>{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs line-clamp-1" style={{ color: 'var(--foreground)' }}>{q.question.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}</p>
                        <div className="flex gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{q.topic} › {q.subtopic}</span>
                          <span className="text-xs font-semibold" style={{ color: DIFF_COLORS[q.difficulty] }}>{q.difficulty}</span>
                          <span className="text-xs" style={{ color: '#22c55e' }}>{q.options.length} options, ans: {q.options[q.correct]?.substring(0, 20)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setStep('upload')}
                  className="px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>← Back</button>
                <button onClick={doImport} disabled={preview.length === 0 || importing}
                  className="flex-1 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                  {importing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                  Import {preview.length} Questions
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Done */}
          {step === 'done' && (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(16,185,129,0.12)', border: '2px solid rgba(16,185,129,0.3)' }}>
                <Check size={28} style={{ color: '#10b981' }} />
              </div>
              <h3 className="text-xl font-black mb-2" style={{ color: 'var(--foreground)' }}>Import Complete!</h3>
              <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
                {preview.length} questions have been added to the question bank.
              </p>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {(['Easy', 'Medium', 'Hard'] as const).map(d => {
                  const cnt = preview.filter(q => q.difficulty === d).length
                  return (
                    <div key={d} className="p-3 rounded-xl text-center" style={{ background: 'var(--muted)' }}>
                      <p className="text-lg font-black" style={{ color: DIFF_COLORS[d] }}>{cnt}</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{d}</p>
                    </div>
                  )
                })}
              </div>
              <button onClick={onClose}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Question Editor (full page) ─────────────────────────────────────────────────
function QuestionEditor({
  initial,
  onSave,
  onBack,
}: {
  initial: Partial<AptitudeQuestion> | null
  onSave: (q: AptitudeQuestion) => void
  onBack: () => void
}) {
  const { aptitudeTopics, knownCompanies } = useAppContext()
  const [q, setQ] = useState<Partial<AptitudeQuestion>>({
    topic: aptitudeTopics[0]?.name ?? '',
    subtopic: aptitudeTopics[0]?.subtopics[0] ?? '',
    difficulty: 'Easy',
    question: '',
    options: ['', '', '', ''],
    correct: 0,
    explanation: '',
    timeLimit: 60,
    marks: 1,
    companyTags: [],
    ...initial,
  })
  const [saving, setSaving] = useState(false)
  const [companySearch, setCompanySearch] = useState('')

  const currentTopic = aptitudeTopics.find(t => t.name === q.topic)

  function update(k: keyof AptitudeQuestion, v: any) { setQ(prev => ({ ...prev, [k]: v })) }
  function setOption(i: number, v: string) { update('options', (q.options ?? []).map((o, j) => j === i ? v : o)) }
  function addOption() { if ((q.options?.length ?? 0) < 6) update('options', [...(q.options ?? []), '']) }
  function removeOption(i: number) {
    const newOpts = (q.options ?? []).filter((_, j) => j !== i)
    update('options', newOpts)
    if (q.correct === i) update('correct', 0)
    else if ((q.correct ?? 0) > i) update('correct', (q.correct ?? 0) - 1)
  }

  function handleSave(_isDraft: boolean) {
    if (!q.question?.trim()) return
    setSaving(true)
    setTimeout(() => {
      onSave({
        id: (initial as AptitudeQuestion)?.id ?? `q-${Date.now()}`,
        topic: q.topic ?? '',
        subtopic: q.subtopic ?? '',
        difficulty: q.difficulty ?? 'Easy',
        question: q.question ?? '',
        options: (q.options ?? []).filter(o => o.trim()),
        correct: q.correct ?? 0,
        explanation: q.explanation ?? '',
        timeLimit: q.timeLimit ?? 60,
        marks: q.marks ?? 1,
        companyTags: q.companyTags ?? [],
        attempts: (initial as AptitudeQuestion)?.attempts ?? 0,
        correctRate: (initial as AptitudeQuestion)?.correctRate ?? 0,
      })
      setSaving(false)
    }, 400)
  }

  const filteredCompanies = knownCompanies.filter(c =>
    c.toLowerCase().includes(companySearch.toLowerCase()) && !(q.companyTags ?? []).includes(c)
  )

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Sticky header */}
      <div className="sticky top-0 z-20 flex items-center gap-3 px-4 sm:px-6 py-3"
        style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(12px)' }}>
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium hover:opacity-70 transition-opacity"
          style={{ color: 'var(--muted-foreground)' }}>
          <ArrowLeft size={14} /> Back
        </button>
        <div className="h-4 w-px" style={{ background: 'var(--border)' }} />
        <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
          {initial ? 'Edit Question' : 'New Question'}
        </span>
        <div className="ml-auto flex gap-2">
          <button onClick={() => handleSave(true)} disabled={saving}
            className="px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
            Save Draft
          </button>
          <button onClick={() => handleSave(false)} disabled={saving || !q.question?.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={14} />}
            Publish
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Question text */}
        <div className="p-5 rounded-2xl space-y-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <h2 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Question</h2>
          <RichTextEditor
            value={q.question ?? ''}
            onChange={v => update('question', v)}
            placeholder="Type your question here. You can use formatting, code, and images..."
          />
        </div>

        {/* Options */}
        <div className="p-5 rounded-2xl space-y-3" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Answer Options</h2>
            <button onClick={addOption} disabled={(q.options?.length ?? 0) >= 6}
              className="flex items-center gap-1 text-xs hover:opacity-70 disabled:opacity-40"
              style={{ color: 'var(--primary)' }}>
              <Plus size={12} /> Add Option
            </button>
          </div>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Click the radio to mark the correct answer.</p>
          {(q.options ?? []).map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <button onClick={() => update('correct', i)}
                className="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all"
                style={{ borderColor: q.correct === i ? 'var(--primary)' : 'var(--border)', background: q.correct === i ? 'var(--primary)' : 'transparent' }}>
                {q.correct === i && <div className="w-2 h-2 rounded-full bg-white" />}
              </button>
              <span className="text-xs font-bold flex-shrink-0 w-5" style={{ color: q.correct === i ? 'var(--primary)' : 'var(--muted-foreground)' }}>
                {String.fromCharCode(65 + i)}
              </span>
              <input value={opt} onChange={e => setOption(i, e.target.value)}
                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                style={{ ...inputSt, borderColor: q.correct === i ? 'rgba(99,102,241,0.4)' : 'var(--border)' }} />
              {(q.options?.length ?? 0) > 2 && (
                <button onClick={() => removeOption(i)} className="hover:opacity-70 flex-shrink-0" style={{ color: '#f87171' }}>
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Metadata */}
        <div className="p-5 rounded-2xl space-y-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <h2 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Metadata</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Topic</label>
              <select value={q.topic} onChange={e => { update('topic', e.target.value); update('subtopic', aptitudeTopics.find(t => t.name === e.target.value)?.subtopics[0] ?? '') }}
                className={inputCls} style={{ ...inputSt, colorScheme: 'inherit' }}>
                {aptitudeTopics.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Subtopic</label>
              <select value={q.subtopic} onChange={e => update('subtopic', e.target.value)}
                className={inputCls} style={{ ...inputSt, colorScheme: 'inherit' }}>
                {(currentTopic?.subtopics ?? []).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Difficulty</label>
              <div className="flex gap-2">
                {DIFFS.map(d => (
                  <button key={d} onClick={() => update('difficulty', d)}
                    className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                    style={{
                      background: q.difficulty === d ? DIFF_BG[d] : 'var(--muted)',
                      color: q.difficulty === d ? DIFF_COLORS[d] : 'var(--muted-foreground)',
                      border: `2px solid ${q.difficulty === d ? DIFF_COLORS[d] + '40' : 'transparent'}`,
                    }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Time Limit (sec)</label>
                <input type="number" min="15" max="600" value={q.timeLimit ?? 60}
                  onChange={e => update('timeLimit', +e.target.value)}
                  className={inputCls} style={inputSt} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Marks</label>
                <input type="number" min="1" max="10" value={q.marks ?? 1}
                  onChange={e => update('marks', +e.target.value)}
                  className={inputCls} style={inputSt} />
              </div>
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="p-5 rounded-2xl space-y-3" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <h2 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Explanation</h2>
          <RichTextEditor
            value={q.explanation ?? ''}
            onChange={v => update('explanation', v)}
            placeholder="Explain the correct answer and solution approach..."
          />
        </div>

        {/* Company tags */}
        <div className="p-5 rounded-2xl space-y-3" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <h2 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Company Tags</h2>
          <div className="flex flex-wrap gap-1.5 min-h-6">
            {(q.companyTags ?? []).map(c => (
              <span key={c} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--primary)', border: '1px solid rgba(99,102,241,0.2)' }}>
                {c}
                <button onClick={() => update('companyTags', (q.companyTags ?? []).filter(x => x !== c))}>
                  <X size={9} />
                </button>
              </span>
            ))}
          </div>
          <input value={companySearch} onChange={e => setCompanySearch(e.target.value)}
            placeholder="Search companies..." className={inputCls} style={inputSt} />
          <div className="grid grid-cols-3 gap-1 max-h-28 overflow-y-auto">
            {filteredCompanies.slice(0, 30).map(c => (
              <button key={c} onClick={() => { update('companyTags', [...(q.companyTags ?? []), c]); setCompanySearch('') }}
                className="text-left px-2 py-1.5 rounded-lg text-xs truncate hover:opacity-80"
                style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                + {c}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────────────────────────
export default function AdminAptitudePage() {
  const { aptitudeQuestions, setAptitudeQuestions } = useAppContext()
  const { toasts, toast } = useToast()

  const [selectedTopic, setSelectedTopic] = useState('')
  const [selectedSub, setSelectedSub] = useState('')
  const [editingQ, setEditingQ] = useState<Partial<AptitudeQuestion> | null | 'new'>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showImport, setShowImport] = useState(false)
  const [showBulkMenu, setShowBulkMenu] = useState(false)

  function handleSelect(topic: string, sub: string) {
    setSelectedTopic(topic); setSelectedSub(sub)
  }

  function handleToggle(id: string) {
    setSelectedIds(prev => {
      const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n
    })
  }

  function handleToggleAll(ids: string[]) {
    const allSelected = ids.every(id => selectedIds.has(id))
    if (allSelected) setSelectedIds(prev => { const n = new Set(prev); ids.forEach(id => n.delete(id)); return n })
    else setSelectedIds(prev => { const n = new Set(prev); ids.forEach(id => n.add(id)); return n })
  }

  function handleSave(q: AptitudeQuestion) {
    const isEdit = aptitudeQuestions.some(x => x.id === q.id)
    if (isEdit) setAptitudeQuestions(aptitudeQuestions.map(x => x.id === q.id ? q : x))
    else setAptitudeQuestions([q, ...aptitudeQuestions])
    toast(isEdit ? 'Question updated.' : 'Question added.')
    setEditingQ(null)
  }

  function handleDelete(id: string) {
    setAptitudeQuestions(aptitudeQuestions.filter(q => q.id !== id))
    setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n })
    toast('Question deleted.', 'error')
  }

  function handleBulkDelete() {
    setAptitudeQuestions(aptitudeQuestions.filter(q => !selectedIds.has(q.id)))
    toast(`${selectedIds.size} questions deleted.`, 'error')
    setSelectedIds(new Set())
    setShowBulkMenu(false)
  }

  function handleImport(qs: AptitudeQuestion[]) {
    setAptitudeQuestions([...qs, ...aptitudeQuestions])
    toast(`Imported ${qs.length} questions successfully.`)
    setShowImport(false)
  }

  if (editingQ !== null) {
    return (
      <QuestionEditor
        initial={editingQ === 'new' ? null : editingQ}
        onSave={handleSave}
        onBack={() => setEditingQ(null)}
      />
    )
  }

  return (
    <>
      <Toasts toasts={toasts} />
      {showImport && <ImportWizard onClose={() => setShowImport(false)} onImport={handleImport} />}

      <div className="flex flex-col h-full overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>
        {/* Top bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 flex-shrink-0 flex-wrap"
          style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
          <h1 className="text-base font-black" style={{ color: 'var(--foreground)' }}>Question Bank</h1>
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
            {aptitudeQuestions.length} questions
          </span>

          <div className="flex items-center gap-2 ml-auto">
            {selectedIds.size > 0 && (
              <div className="relative">
                <button onClick={() => setShowBulkMenu(b => !b)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <CheckSquare size={12} /> {selectedIds.size} selected <MoreHorizontal size={12} />
                </button>
                {showBulkMenu && (
                  <div className="absolute right-0 top-full mt-1 z-50 rounded-xl overflow-hidden shadow-xl"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)', minWidth: 160 }}>
                    <button onClick={handleBulkDelete}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:opacity-80 transition-opacity"
                      style={{ color: '#f87171' }}>
                      <Trash2 size={13} /> Delete selected
                    </button>
                    <button onClick={() => { setSelectedIds(new Set()); setShowBulkMenu(false) }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:opacity-80"
                      style={{ color: 'var(--muted-foreground)' }}>
                      <X size={13} /> Clear selection
                    </button>
                  </div>
                )}
              </div>
            )}
            <button onClick={() => setShowImport(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
              <Upload size={12} /> Import
            </button>
            <button onClick={() => setEditingQ('new')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
              <Plus size={13} /> Add Question
            </button>
          </div>
        </div>

        {/* Two-panel layout */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <TopicExplorer
            selectedTopic={selectedTopic}
            selectedSub={selectedSub}
            onSelect={handleSelect}
            questions={aptitudeQuestions}
          />
          <QuestionTable
            questions={aptitudeQuestions}
            selectedIds={selectedIds}
            onToggle={handleToggle}
            onToggleAll={handleToggleAll}
            onEdit={q => setEditingQ(q)}
            onDelete={handleDelete}
            filterTopic={selectedTopic}
            filterSub={selectedSub}
          />
        </div>
      </div>
    </>
  )
}
