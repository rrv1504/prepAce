import { useState } from 'react'
import { useAppContext, type DSAProblem } from '../../context/AppContext'
import {
  Plus, Pencil, Trash2, X, BarChart2, Check, Search,
  ArrowLeft, BookOpen,
} from 'lucide-react'
import RichTextEditor from '../../components/RichTextEditor'
import { dsaService } from '../../lib/services'
import { normalizeId } from '../../lib/api'

// ── Shared style helpers (CSS-variable aware) ──────────────────────────────
const inputCls = 'w-full px-3 py-2 rounded-lg text-sm outline-none'
const inputSt = {
  background: 'var(--muted)',
  border: '1px solid var(--border)',
  color: 'var(--foreground)',
}
const labelCls = 'block text-xs font-semibold mb-1.5'
const labelSt = { color: 'var(--muted-foreground)' }

const DIFFS = ['Easy', 'Medium', 'Hard'] as const
const DIFF_COLORS: Record<string, string> = { Easy: '#22c55e', Medium: '#f59e0b', Hard: '#ef4444' }
const LANGS = ['python', 'javascript', 'java', 'cpp', 'c'] as const
const LANG_LABELS: Record<string, string> = { python: 'Python', javascript: 'JavaScript', java: 'Java', cpp: 'C++', c: 'C' }
const TOPIC_COLORS = ['#6366f1','#8b5cf6','#06b6d4','#22c55e','#f59e0b','#ef4444','#ec4899','#10b981','#f97316','#a855f7','#3b82f6','#14b8a6']

function diffColor(d: string) { return DIFF_COLORS[d] ?? '#6366f1' }


// ── Company checklist ────────────────────────────────────────────────────────
function CompanyChecklist({ all, selected, onChange }: { all: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  const [search, setSearch] = useState('')
  const filtered = all.filter(c => c.toLowerCase().includes(search.toLowerCase()))
  const toggle = (c: string) => onChange(selected.includes(c) ? selected.filter(x => x !== c) : [...selected, c])
  return (
    <div>
      <div className="flex gap-1.5 mb-2 flex-wrap min-h-5">
        {selected.map(c => (
          <span key={c} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--primary)' }}>
            {c} <button onClick={() => toggle(c)} className="hover:opacity-70"><X size={9} /></button>
          </span>
        ))}
      </div>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter companies..."
        className={inputCls} style={inputSt} />
      <div className="grid grid-cols-3 gap-1 mt-2 max-h-32 overflow-y-auto pr-1">
        {filtered.map(c => (
          <button key={c} onClick={() => toggle(c)} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-left"
            style={{
              background: selected.includes(c) ? 'rgba(99,102,241,0.12)' : 'var(--muted)',
              border: `1px solid ${selected.includes(c) ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`,
              color: selected.includes(c) ? 'var(--primary)' : 'var(--muted-foreground)',
            }}>
            <div className="w-3 h-3 rounded border flex-shrink-0 flex items-center justify-center"
              style={{ borderColor: selected.includes(c) ? '#6366f1' : 'var(--border)', background: selected.includes(c) ? '#6366f1' : 'transparent' }}>
              {selected.includes(c) && <Check size={8} className="text-white" />}
            </div>
            <span className="truncate">{c}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Stats panel (slide-over) ──────────────────────────────────────────────────
function StatsPanel({ p, onClose, onEdit }: { p: DSAProblem; onClose: () => void; onEdit: () => void }) {
  const rate = p.submissions ? Math.round((p.accepted ?? 0) / p.submissions * 100) : 0
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="h-full w-full max-w-sm overflow-y-auto" style={{ background: 'var(--card)', borderLeft: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 className="font-black text-base" style={{ color: 'var(--foreground)' }}>{p.title}</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${diffColor(p.difficulty)}15`, color: diffColor(p.difficulty) }}>{p.difficulty}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={onEdit} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
              <Pencil size={12} className="inline mr-1" />Edit
            </button>
            <button onClick={onClose} style={{ color: 'var(--muted-foreground)' }}><X size={18} /></button>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Submissions', value: (p.submissions ?? 0).toLocaleString(), color: 'var(--primary)' },
              { label: 'Accepted', value: (p.accepted ?? 0).toLocaleString(), color: '#22c55e' },
              { label: 'Accept Rate', value: `${rate}%`, color: rate > 60 ? '#22c55e' : rate > 40 ? '#f59e0b' : '#ef4444' },
              { label: 'Companies', value: String(p.companies.length), color: '#8b5cf6' },
            ].map(s => (
              <div key={s.label} className="p-3 rounded-xl text-center" style={{ background: 'var(--muted)' }}>
                <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{s.label}</p>
              </div>
            ))}
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>
              <span>Acceptance Rate</span><span>{rate}%</span>
            </div>
            <div className="h-2 rounded-full" style={{ background: 'var(--muted)' }}>
              <div className="h-full rounded-full" style={{ width: `${rate}%`, background: rate > 60 ? '#22c55e' : rate > 40 ? '#f59e0b' : '#ef4444' }} />
            </div>
          </div>
          {p.companies.length > 0 && (
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: 'var(--muted-foreground)' }}>Companies</p>
              <div className="flex gap-1.5 flex-wrap">
                {p.companies.map(c => <span key={c} className="px-2 py-1 rounded-lg text-xs font-semibold" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>{c}</span>)}
              </div>
            </div>
          )}
          {p.tags.length > 0 && (
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: 'var(--muted-foreground)' }}>Tags</p>
              <div className="flex gap-1.5 flex-wrap">
                {p.tags.map(t => <span key={t} className="px-2 py-1 rounded-lg text-xs" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>{t}</span>)}
              </div>
            </div>
          )}
          {(p.timeComplexity || p.spaceComplexity) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-3 rounded-xl" style={{ background: 'var(--muted)' }}>
                <p className="text-xs mb-0.5" style={{ color: 'var(--muted-foreground)' }}>Time</p>
                <p className="font-mono font-bold text-sm" style={{ color: 'var(--foreground)' }}>{p.timeComplexity}</p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: 'var(--muted)' }}>
                <p className="text-xs mb-0.5" style={{ color: 'var(--muted-foreground)' }}>Space</p>
                <p className="font-mono font-bold text-sm" style={{ color: 'var(--foreground)' }}>{p.spaceComplexity}</p>
              </div>
            </div>
          )}
          <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {p.sampleTestCases.length} sample · {p.hiddenTestCases.length} hidden test cases
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Full-page Problem Form ────────────────────────────────────────────────────
function ProblemForm({
  initial, topics, companies, onSave, onBack, onAddTopic,
}: {
  initial: Partial<DSAProblem>; topics: string[]; companies: string[]
  onSave: (d: DSAProblem) => void; onBack: () => void; onAddTopic: (n: string) => void
}) {
  const defaultStarter: Record<string, string> = {
    python: '# Write your solution here\npass',
    javascript: '// Write your solution here',
    java: '// Write your solution here\nreturn null;',
    cpp: '// Write your solution here\nreturn 0;',
    c: '// Write your solution here\nreturn 0;',
  }

  const EMPTY: Omit<DSAProblem, 'id'> = {
    title: '', difficulty: 'Easy', topic: topics[0] ?? 'Arrays', description: '',
    examples: [{ input: '', output: '', explanation: '' }],
    constraints: [''],
    starterCode: initial.starterCode ?? defaultStarter,
    companies: [], tags: [],
    sampleTestCases: [{ input: '', expected: '' }],
    hiddenTestCases: [{ input: '', expected: '' }],
    editorial: '', videoLink: '', imageUrl: '', timeComplexity: '', spaceComplexity: '',
    submissions: 0, accepted: 0,
    inputParams: [],
  }

  const [form, setForm] = useState<Omit<DSAProblem, 'id'>>({ ...EMPTY, ...initial })
  const [tagInput, setTagInput] = useState('')
  const [tab, setTab] = useState<'basic' | 'testcases' | 'code' | 'editorial'>('basic')
  const [codeTab, setCodeTab] = useState<typeof LANGS[number]>('python')
  const [newTopic, setNewTopic] = useState('')
  const [showTopicInput, setShowTopicInput] = useState(false)

  const set = (k: keyof typeof form, v: any) => setForm(f => ({ ...f, [k]: v }))

  function setStarterCode(lang: string, code: string) {
    setForm(f => ({ ...f, starterCode: { ...(f.starterCode as Record<string, string>), [lang]: code } }))
  }

  const tabs = ['basic', 'code', 'testcases', 'editorial'] as const
  const tabLabels: Record<string, string> = { basic: 'Problem Details', code: 'Starter Code', testcases: 'Test Cases', editorial: 'Editorial & Media' }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl hover:opacity-70 transition-opacity"
          style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-black" style={{ color: 'var(--foreground)' }}>
            {(initial as DSAProblem).id ? 'Edit Problem' : 'New DSA Problem'}
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Fill in all tabs, then save</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            style={tab === t
              ? { background: 'rgba(99,102,241,0.15)', color: 'var(--primary)', border: '1px solid rgba(99,102,241,0.25)' }
              : { background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}>
            {tabLabels[t]}
          </button>
        ))}
      </div>

      {/* Form card */}
      <div className="rounded-2xl p-6 space-y-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>

        {/* Basic */}
        {tab === 'basic' && (
          <div className="space-y-4">
            <div>
              <label className={labelCls} style={labelSt}>Title *</label>
              <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Two Sum"
                className={inputCls} style={inputSt} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls} style={labelSt}>Difficulty</label>
                <select value={form.difficulty} onChange={e => set('difficulty', e.target.value as any)}
                  className={inputCls} style={{ ...inputSt, colorScheme: 'inherit' }}>
                  {DIFFS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls} style={labelSt}>
                  Topic
                  <button onClick={() => setShowTopicInput(s => !s)} className="ml-2 text-xs" style={{ color: 'var(--primary)' }}>+ New</button>
                </label>
                {showTopicInput ? (
                  <div className="flex gap-2">
                    <input value={newTopic} onChange={e => setNewTopic(e.target.value)} placeholder="Topic name"
                      className={inputCls} style={inputSt}
                      onKeyDown={e => { if (e.key === 'Enter' && newTopic.trim()) { onAddTopic(newTopic.trim()); set('topic', newTopic.trim()); setNewTopic(''); setShowTopicInput(false) } }} />
                    <button onClick={() => { if (newTopic.trim()) { onAddTopic(newTopic.trim()); set('topic', newTopic.trim()); setNewTopic(''); setShowTopicInput(false) } }}
                      className="px-3 py-2 rounded-lg text-xs font-bold text-white flex-shrink-0" style={{ background: '#6366f1' }}>Add</button>
                  </div>
                ) : (
                  <select value={form.topic} onChange={e => set('topic', e.target.value)}
                    className={inputCls} style={{ ...inputSt, colorScheme: 'inherit' }}>
                    {topics.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                )}
              </div>
            </div>
            <div>
              <label className={labelCls} style={labelSt}>Description * <span className="font-normal opacity-60">(supports bold, italic, underline, font size, image paste)</span></label>
              <RichTextEditor
                value={form.description}
                onChange={v => set('description', v)}
                placeholder="Write the problem statement here... You can bold text, change font size, insert images by pasting or URL."
                minHeight={200}
              />
            </div>
            {/* Examples */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={labelCls} style={labelSt}>Examples</label>
                <button onClick={() => set('examples', [...form.examples, { input: '', output: '', explanation: '' }])}
                  className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>+ Add</button>
              </div>
              {form.examples.map((ex, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                  <input placeholder="Input" value={ex.input} onChange={e => { const xs = [...form.examples]; xs[i] = { ...xs[i], input: e.target.value }; set('examples', xs) }} className={inputCls} style={inputSt} />
                  <input placeholder="Output" value={ex.output} onChange={e => { const xs = [...form.examples]; xs[i] = { ...xs[i], output: e.target.value }; set('examples', xs) }} className={inputCls} style={inputSt} />
                  <div className="flex gap-1">
                    <input placeholder="Explanation" value={ex.explanation ?? ''} onChange={e => { const xs = [...form.examples]; xs[i] = { ...xs[i], explanation: e.target.value }; set('examples', xs) }} className={inputCls} style={inputSt} />
                    {form.examples.length > 1 && <button onClick={() => set('examples', form.examples.filter((_, j) => j !== i))} style={{ color: '#ef4444' }}><X size={14} /></button>}
                  </div>
                </div>
              ))}
            </div>
            {/* Constraints */}
            <div>
              <label className={labelCls} style={labelSt}>Constraints (one per line)</label>
              <textarea value={form.constraints.join('\n')} onChange={e => set('constraints', e.target.value.split('\n'))}
                rows={3} className={inputCls + ' resize-none'} style={inputSt} placeholder="1 ≤ n ≤ 10⁵" />
            </div>
            {/* Tags */}
            <div>
              <label className={labelCls} style={labelSt}>Tags</label>
              <div className="flex gap-1.5 mb-2 flex-wrap">
                {form.tags.map((t, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--primary)' }}>
                    {t} <button onClick={() => set('tags', form.tags.filter((_, j) => j !== i))}><X size={9} /></button>
                  </span>
                ))}
              </div>
              <input value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="Type tag + Enter"
                className={inputCls} style={inputSt}
                onKeyDown={e => { if (e.key === 'Enter' && tagInput.trim()) { set('tags', [...form.tags, tagInput.trim()]); setTagInput('') } }} />
            </div>
            {/* Companies */}
            <div>
              <label className={labelCls} style={labelSt}>Companies</label>
              <CompanyChecklist all={companies} selected={form.companies} onChange={v => set('companies', v)} />
            </div>
            {/* Complexity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls} style={labelSt}>Time Complexity</label>
                <input value={form.timeComplexity ?? ''} onChange={e => set('timeComplexity', e.target.value)} placeholder="O(n)" className={inputCls} style={inputSt} />
              </div>
              <div>
                <label className={labelCls} style={labelSt}>Space Complexity</label>
                <input value={form.spaceComplexity ?? ''} onChange={e => set('spaceComplexity', e.target.value)} placeholder="O(1)" className={inputCls} style={inputSt} />
              </div>
            </div>
          </div>
        )}

        {/* Starter Code per language */}
        {tab === 'code' && (
          <div className="space-y-4">
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              Write starter code for each language — students will see their chosen language.
            </p>
            <div className="flex gap-2 flex-wrap">
              {LANGS.map(l => (
                <button key={l} onClick={() => setCodeTab(l)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={codeTab === l
                    ? { background: 'rgba(99,102,241,0.15)', color: 'var(--primary)', border: '1px solid rgba(99,102,241,0.25)' }
                    : { background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}>
                  {LANG_LABELS[l]}
                </button>
              ))}
            </div>
            <div>
              <label className={labelCls} style={labelSt}>{LANG_LABELS[codeTab]} starter code</label>
              <textarea
                value={(form.starterCode as Record<string, string>)[codeTab] ?? ''}
                onChange={e => setStarterCode(codeTab, e.target.value)}
                rows={16} className={inputCls + ' resize-none font-mono text-xs'}
                style={{ ...inputSt, background: 'var(--background)' }} />
              <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                {Object.entries(form.starterCode as Record<string, string>).filter(([,v]) => v.trim()).length} / {LANGS.length} languages filled
              </p>
            </div>
          </div>
        )}

        {/* Test Cases */}
        {tab === 'testcases' && (
          <div className="space-y-6">
            {/* Step 1: Define Input Parameter Names */}
            <div className="p-4 rounded-2xl" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                  style={{ background: 'var(--primary)' }}>1</span>
                <label className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                  Define Input Parameter Names
                </label>
              </div>
              <p className="text-xs mb-3" style={{ color: 'var(--muted-foreground)' }}>
                Enter the variable names for this problem's inputs (e.g. <code className="font-mono px-1 rounded" style={{ background: 'var(--muted)' }}>nums</code>, <code className="font-mono px-1 rounded" style={{ background: 'var(--muted)' }}>target</code>, <code className="font-mono px-1 rounded" style={{ background: 'var(--muted)' }}>k</code>). Each will get its own box in the test cases below.
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {(form.inputParams ?? []).map((p, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-mono font-semibold"
                    style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--primary)', border: '1px solid rgba(99,102,241,0.3)' }}>
                    {p}
                    <button onClick={() => set('inputParams', (form.inputParams ?? []).filter((_, j) => j !== i))}
                      className="hover:opacity-70 ml-0.5"><X size={10} /></button>
                  </span>
                ))}
                {(form.inputParams ?? []).length === 0 && (
                  <span className="text-xs italic" style={{ color: 'var(--muted-foreground)' }}>No params yet — add them below</span>
                )}
              </div>
              <div className="flex gap-2">
                <input id="paramInput" placeholder="Type param name and press Enter (e.g. nums)"
                  className={inputCls + ' font-mono'} style={{ ...inputSt, flex: 1 }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const val = (e.currentTarget as HTMLInputElement).value.trim()
                      if (val) { set('inputParams', [...(form.inputParams ?? []), val]); (e.currentTarget as HTMLInputElement).value = '' }
                    }
                  }} />
                <button onClick={() => {
                  const el = document.getElementById('paramInput') as HTMLInputElement | null
                  if (el?.value.trim()) { set('inputParams', [...(form.inputParams ?? []), el.value.trim()]); el.value = '' }
                }} className="px-4 py-2 rounded-lg text-xs font-bold text-white flex-shrink-0" style={{ background: '#6366f1' }}>
                  + Add
                </button>
              </div>
            </div>

            {/* Step 2: Test Case Values */}
            {[
              { key: 'sampleTestCases' as const, label: 'Sample Test Cases', sub: 'Visible to students in the problem view', color: '#10b981' },
              { key: 'hiddenTestCases' as const, label: 'Hidden Test Cases', sub: 'Used for automated judging only', color: '#f59e0b' },
            ].map(({ key, label, sub, color }, sectionIdx) => {
              const params = form.inputParams ?? []
              return (
                <div key={key}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                      style={{ background: color }}>{sectionIdx + 2}</span>
                    <div>
                      <div className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{label}</div>
                      <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{sub}</div>
                    </div>
                    <button onClick={() => {
                      const emptyInputs = params.length > 0 ? params.map(() => '').join('\n') : ''
                      set(key, [...form[key], { input: emptyInputs, expected: '' }])
                    }}
                      className="ml-auto px-3 py-1.5 rounded-lg text-xs font-bold text-white flex-shrink-0"
                      style={{ background: color }}>
                      + Add Case
                    </button>
                  </div>

                  <div className="space-y-3">
                    {form[key].map((tc, i) => {
                      const inputLines = tc.input.split('\n')
                      const updateNamedInput = (paramIdx: number, val: string) => {
                        const lines = params.map((_, pi) => pi === paramIdx ? val : (inputLines[pi] ?? ''))
                        const ts = [...form[key]]; ts[i] = { ...ts[i], input: lines.join('\n') }; set(key, ts)
                      }
                      return (
                        <div key={i} className="rounded-2xl overflow-hidden"
                          style={{ border: `1px solid ${color}30`, background: 'var(--card)' }}>
                          {/* Case header */}
                          <div className="flex items-center justify-between px-4 py-2.5"
                            style={{ borderBottom: `1px solid ${color}20`, background: `${color}08` }}>
                            <span className="text-xs font-bold" style={{ color }}>Case {i + 1}</span>
                            {form[key].length > 1 && (
                              <button onClick={() => set(key, form[key].filter((_, j) => j !== i))}
                                className="text-xs px-2 py-0.5 rounded-lg"
                                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                                Remove
                              </button>
                            )}
                          </div>

                          <div className="p-4 space-y-3">
                            {params.length > 0 ? (
                              /* Named param boxes */
                              <>
                                <div className="grid gap-3" style={{ gridTemplateColumns: params.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(160px, 1fr))' }}>
                                  {params.map((paramName, pi) => (
                                    <div key={pi}>
                                      <label className="block text-xs mb-1.5 font-mono font-semibold"
                                        style={{ color: 'var(--primary)' }}>
                                        {paramName}
                                        <span className="ml-1 font-normal opacity-50">=</span>
                                      </label>
                                      <textarea
                                        value={inputLines[pi] ?? ''}
                                        onChange={e => updateNamedInput(pi, e.target.value)}
                                        rows={2}
                                        placeholder={`e.g. [2,7,11,15]`}
                                        className={inputCls + ' resize-none font-mono text-xs'}
                                        style={{ ...inputSt, background: 'var(--background)' }} />
                                    </div>
                                  ))}
                                </div>
                                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                                  <label className="block text-xs mb-1.5 font-semibold"
                                    style={{ color: '#22c55e' }}>
                                    ✓ Expected Output
                                  </label>
                                  <textarea
                                    value={tc.expected}
                                    onChange={e => { const ts = [...form[key]]; ts[i] = { ...ts[i], expected: e.target.value }; set(key, ts) }}
                                    rows={2}
                                    placeholder="e.g. [0,1]"
                                    className={inputCls + ' resize-none font-mono text-xs'}
                                    style={{ ...inputSt, background: 'var(--background)', borderColor: 'rgba(34,197,94,0.3)' }} />
                                </div>
                              </>
                            ) : (
                              /* Raw input mode (no params defined) */
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs mb-1 font-semibold" style={{ color: 'var(--muted-foreground)' }}>Input</label>
                                  <textarea
                                    value={tc.input}
                                    onChange={e => { const ts = [...form[key]]; ts[i] = { ...ts[i], input: e.target.value }; set(key, ts) }}
                                    rows={4} placeholder={'nums = [2,7]\ntarget = 9'}
                                    className={inputCls + ' resize-none font-mono text-xs'}
                                    style={{ ...inputSt, background: 'var(--background)' }} />
                                </div>
                                <div>
                                  <label className="block text-xs mb-1 font-semibold" style={{ color: '#22c55e' }}>✓ Expected Output</label>
                                  <textarea
                                    value={tc.expected}
                                    onChange={e => { const ts = [...form[key]]; ts[i] = { ...ts[i], expected: e.target.value }; set(key, ts) }}
                                    rows={4} placeholder={'[0, 1]'}
                                    className={inputCls + ' resize-none font-mono text-xs'}
                                    style={{ ...inputSt, background: 'var(--background)', borderColor: 'rgba(34,197,94,0.3)' }} />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Editorial */}
        {tab === 'editorial' && (
          <div className="space-y-4">
            <div>
              <label className={labelCls} style={labelSt}>Editorial / Solution Explanation</label>
              <textarea value={form.editorial ?? ''} onChange={e => set('editorial', e.target.value)} rows={8}
                placeholder="Explain the approach in detail..." className={inputCls + ' resize-none'} style={inputSt} />
            </div>
            <div>
              <label className={labelCls} style={labelSt}>Video Solution URL</label>
              <input value={form.videoLink ?? ''} onChange={e => set('videoLink', e.target.value)} placeholder="https://youtube.com/..." className={inputCls} style={inputSt} />
            </div>
            <div>
              <label className={labelCls} style={labelSt}>Problem Diagram Image URL</label>
              <input value={form.imageUrl ?? ''} onChange={e => set('imageUrl', e.target.value)} placeholder="https://..." className={inputCls} style={inputSt} />
            </div>
          </div>
        )}
      </div>

      {/* Save bar */}
      <div className="flex gap-3">
        <button onClick={() => onSave({ ...form, id: (initial as DSAProblem).id ?? `d${Date.now()}` })}
          className="px-6 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
          Save Problem
        </button>
        <button onClick={onBack} className="px-6 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminDSAPage() {
  const { dsaProblems, setDsaProblems, dsaTopics, setDsaTopics, knownCompanies } = useAppContext()
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list')
  const [editing, setEditing] = useState<DSAProblem | null>(null)
  const [viewing, setViewing] = useState<DSAProblem | null>(null)
  const [search, setSearch] = useState('')
  const [filterDiff, setFilterDiff] = useState('')
  const [filterTopic, setFilterTopic] = useState('')

  const topicNames = dsaTopics.map(t => t.name)

  function addTopic(name: string) {
    if (!dsaTopics.find(t => t.name === name))
      setDsaTopics([...dsaTopics, { id: Date.now().toString(), name, subtopics: [] }])
  }

  async function saveProblem(p: DSAProblem) {
    const existing = dsaProblems.find(d => d.id === p.id)
    const { id, ...payload } = p as any
    try {
      const saved = existing
        ? await dsaService.update(existing.id, payload)
        : await dsaService.create(payload)
      const normalized = { ...(normalizeId(saved as any) as DSAProblem), __synced: true } as any
      if (existing) setDsaProblems(dsaProblems.map(d => d.id === existing.id ? normalized : d))
      else setDsaProblems([normalized, ...dsaProblems])
      setView('list'); setEditing(null)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save problem')
    }
  }

  // Derive topic stats for cards
  const topicMap = new Map<string, { total: number; solved: number; color: string }>()
  dsaProblems.forEach(p => {
    const ex = topicMap.get(p.topic)
    if (ex) ex.total++
    else topicMap.set(p.topic, { total: 1, solved: 0, color: TOPIC_COLORS[topicMap.size % TOPIC_COLORS.length] })
  })
  const topicCards = Array.from(topicMap.entries()).map(([name, s]) => ({ name, ...s }))

  const filtered = dsaProblems.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) &&
    (!filterDiff || p.difficulty === filterDiff) &&
    (!filterTopic || p.topic === filterTopic)
  )

  // Full-page form views
  if (view === 'create' || view === 'edit') {
    return (
      <ProblemForm
        initial={editing ?? {}}
        topics={topicNames.length ? topicNames : ['Arrays']}
        companies={knownCompanies}
        onSave={saveProblem}
        onBack={() => { setView('list'); setEditing(null) }}
        onAddTopic={addTopic}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats panel slide-over */}
      {viewing && (
        <StatsPanel p={viewing} onClose={() => setViewing(null)} onEdit={() => { setEditing(viewing); setView('edit'); setViewing(null) }} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--foreground)' }}>DSA Management</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            {dsaProblems.length} problems · {topicCards.length} topics
          </p>
        </div>
        <button onClick={() => { setEditing(null); setView('create') }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
          <Plus size={16} /> Add Problem
        </button>
      </div>

      {/* Topic cards — like DSATracker */}
      {topicCards.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {topicCards.map(({ name, color }) => {
            const count = dsaProblems.filter(p => p.topic === name).length
            return (
              <button key={name} onClick={() => setFilterTopic(filterTopic === name ? '' : name)}
                className="p-4 rounded-2xl text-left transition-all hover:scale-[1.02]"
                style={{
                  background: 'var(--card)', border: `1px solid ${filterTopic === name ? color : 'var(--border)'}`,
                  boxShadow: filterTopic === name ? `0 0 0 2px ${color}30` : 'none',
                }}>
                <div className="w-8 h-8 rounded-xl mb-3 flex items-center justify-center" style={{ background: `${color}20` }}>
                  <BookOpen size={16} style={{ color }} />
                </div>
                <p className="text-xs font-semibold leading-tight" style={{ color: 'var(--foreground)' }}>{name}</p>
                <p className="text-xs mt-0.5 font-black" style={{ color }}>{count} problems</p>
              </button>
            )
          })}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search problems..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
        </div>
        <select value={filterTopic} onChange={e => setFilterTopic(e.target.value)}
          className="px-3 py-2 rounded-xl text-sm outline-none"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)', colorScheme: 'inherit' }}>
          <option value="">All Topics</option>
          {topicNames.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <div className="flex gap-2">
          {(['', ...DIFFS] as const).map(d => (
            <button key={d} onClick={() => setFilterDiff(d)}
              className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: filterDiff === d ? (d ? `${DIFF_COLORS[d]}20` : 'rgba(99,102,241,0.15)') : 'var(--card)',
                color: filterDiff === d ? (d ? DIFF_COLORS[d] : 'var(--primary)') : 'var(--muted-foreground)',
                border: `1px solid ${filterDiff === d ? (d ? DIFF_COLORS[d] + '40' : 'rgba(99,102,241,0.3)') : 'var(--border)'}`,
              }}>
              {d || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Problem table — desktop */}
      <div className="rounded-2xl overflow-hidden hidden md:block" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="grid grid-cols-12 px-5 py-3 text-xs font-semibold uppercase tracking-wider"
          style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', borderBottom: '1px solid var(--border)' }}>
          <div className="col-span-4">Title</div>
          <div className="col-span-2">Difficulty</div>
          <div className="col-span-2">Topic</div>
          <div className="col-span-2">Companies</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        {filtered.map((p, i) => {
          const dc = diffColor(p.difficulty)
          return (
            <div key={p.id} className="grid grid-cols-12 px-5 py-3.5 items-center transition-all hover:opacity-90"
              style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div className="col-span-4">
                <button onClick={() => setViewing(p)} className="text-sm font-semibold text-left hover:underline" style={{ color: 'var(--foreground)' }}>{p.title}</button>
                {p.tags.length > 0 && (
                  <div className="flex gap-1 mt-0.5 flex-wrap">
                    {p.tags.slice(0, 2).map(t => (
                      <span key={t} className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="col-span-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: `${dc}15`, color: dc }}>{p.difficulty}</span>
              </div>
              <div className="col-span-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>{p.topic}</div>
              <div className="col-span-2">
                <div className="flex gap-1 flex-wrap">
                  {p.companies.slice(0, 2).map(c => (
                    <span key={c} className="text-xs px-2 py-0.5 rounded-md" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>{c}</span>
                  ))}
                  {p.companies.length > 2 && <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>+{p.companies.length - 2}</span>}
                </div>
              </div>
              <div className="col-span-2 flex gap-2 justify-end">
                <button onClick={() => setViewing(p)} title="Stats" className="p-1.5 rounded-lg hover:opacity-70" style={{ color: '#06b6d4' }}><BarChart2 size={14} /></button>
                <button onClick={() => { setEditing(p); setView('edit') }} className="p-1.5 rounded-lg hover:opacity-70" style={{ color: 'var(--primary)' }}><Pencil size={14} /></button>
                <button onClick={() => setDsaProblems(dsaProblems.filter(d => d.id !== p.id))} className="p-1.5 rounded-lg hover:opacity-70" style={{ color: '#ef4444' }}><Trash2 size={14} /></button>
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="py-14 text-center" style={{ color: 'var(--muted-foreground)' }}>
            <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No problems match your filters</p>
            <button onClick={() => { setEditing(null); setView('create') }}
              className="mt-3 px-4 py-2 rounded-xl text-sm font-bold text-white inline-flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
              <Plus size={14} /> Add First Problem
            </button>
          </div>
        )}
      </div>

      {/* Problem cards — mobile */}
      <div className="md:hidden space-y-2">
        {filtered.map(p => {
          const dc = diffColor(p.difficulty)
          return (
            <div key={p.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="flex-1 min-w-0">
                <button onClick={() => setViewing(p)} className="text-sm font-semibold text-left"
                  style={{ color: 'var(--foreground)' }}>{p.title}</button>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{p.topic}</p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-lg flex-shrink-0" style={{ background: `${dc}15`, color: dc }}>{p.difficulty}</span>
              <div className="flex gap-1.5 flex-shrink-0">
                <button onClick={() => setViewing(p)} className="p-1.5 rounded-lg" style={{ color: '#06b6d4' }}><BarChart2 size={13} /></button>
                <button onClick={() => { setEditing(p); setView('edit') }} className="p-1.5 rounded-lg" style={{ color: 'var(--primary)' }}><Pencil size={13} /></button>
                <button onClick={() => setDsaProblems(dsaProblems.filter(d => d.id !== p.id))} className="p-1.5 rounded-lg" style={{ color: '#ef4444' }}><Trash2 size={13} /></button>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="py-12 text-center" style={{ color: 'var(--muted-foreground)' }}>
            <p className="text-sm font-medium">No problems match your filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
