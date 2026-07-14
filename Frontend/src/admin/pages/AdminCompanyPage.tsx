import { useState } from 'react'
import { useAppContext, type CompanyVisit, type EligibilityCriteria } from '../../context/AppContext'
import { Plus, X, Check, Pencil, Trash2, Users, ChevronDown, ChevronUp, Paperclip, ArrowLeft, Search } from 'lucide-react'

const STATUSES = {
  pending: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  accepted: { label: 'Accepted', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  rejected: { label: 'Rejected', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
}

const ALL_BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'AE', 'Biotech', 'Chemical', 'Other']

const inputSt = { background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }
const inputCls = 'w-full px-3 py-2 rounded-lg text-sm outline-none'

const EMPTY_ELIGIBILITY: EligibilityCriteria = {
  minCGPA: 6.0, noBacklogs: true, branches: ['CSE', 'IT'], maxGap: 1, otherCriteria: [],
}

function EligibilityForm({ value, onChange }: { value: EligibilityCriteria; onChange: (v: EligibilityCriteria) => void }) {
  const [newCriteria, setNewCriteria] = useState('')

  function toggleBranch(b: string) {
    onChange({ ...value, branches: value.branches.includes(b) ? value.branches.filter(x => x !== b) : [...value.branches, b] })
  }

  return (
    <div className="space-y-3 p-4 rounded-xl" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
      <p className="text-xs font-bold" style={{ color: '#a5b4fc' }}>Eligibility Criteria</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--muted-foreground)' }}>Minimum CGPA</label>
          <input type="number" step="0.5" min="0" max="10" value={value.minCGPA}
            onChange={e => onChange({ ...value, minCGPA: parseFloat(e.target.value) })}
            className={inputCls} style={inputSt} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--muted-foreground)' }}>Max Gap Year</label>
          <input type="number" min="0" max="5" value={value.maxGap}
            onChange={e => onChange({ ...value, maxGap: parseInt(e.target.value) })}
            className={inputCls} style={inputSt} />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => onChange({ ...value, noBacklogs: !value.noBacklogs })}
          className="w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 transition-all"
          style={{ borderColor: value.noBacklogs ? '#10b981' : 'rgba(255,255,255,0.2)', background: value.noBacklogs ? '#10b981' : 'transparent' }}>
          {value.noBacklogs && <Check size={12} className="text-white" />}
        </button>
        <span className="text-sm" style={{ color: 'var(--foreground)' } as any}>No active backlogs required</span>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--muted-foreground)' }}>Eligible Branches</label>
        <div className="flex flex-wrap gap-2">
          {ALL_BRANCHES.map(b => (
            <button key={b} onClick={() => toggleBranch(b)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: value.branches.includes(b) ? 'rgba(99,102,241,0.25)' : 'var(--muted)',
                color: value.branches.includes(b) ? '#a5b4fc' : 'rgba(255,255,255,0.5)',
                border: `1px solid ${value.branches.includes(b) ? 'rgba(99,102,241,0.4)' : 'transparent'}`,
              }}>
              {value.branches.includes(b) && <Check size={10} />}
              {b}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--muted-foreground)' }}>Additional Criteria</label>
        <div className="space-y-1 mb-2">
          {value.otherCriteria.map((c, i) => (
            <div key={i} className="flex items-center justify-between text-xs px-2 py-1 rounded" style={{ background: 'var(--card)', color: 'var(--muted-foreground)' }}>
              <span>{c}</span>
              <button onClick={() => onChange({ ...value, otherCriteria: value.otherCriteria.filter((_, j) => j !== i) })} style={{ color: '#f87171' }}><X size={11} /></button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newCriteria} onChange={e => setNewCriteria(e.target.value)} placeholder="e.g. Valid PAN card required"
            className={inputCls} style={inputSt}
            onKeyDown={e => { if (e.key === 'Enter' && newCriteria.trim()) { onChange({ ...value, otherCriteria: [...value.otherCriteria, newCriteria.trim()] }); setNewCriteria('') } }} />
          <button onClick={() => { if (newCriteria.trim()) { onChange({ ...value, otherCriteria: [...value.otherCriteria, newCriteria.trim()] }); setNewCriteria('') } }}
            className="px-3 py-2 rounded-lg text-xs font-bold text-white flex-shrink-0" style={{ background: 'rgba(99,102,241,0.3)' }}>
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

function VisitForm({ initial, onSave, onBack }: { initial: Partial<CompanyVisit>; onSave: (v: any) => void; onBack: () => void }) {
  const { roadmaps } = useAppContext()
  const publishedRoadmaps = roadmaps.filter(r => (r.status || 'published') === 'published')
  const [form, setForm] = useState({
    companyName: initial.companyName ?? '',
    logo: initial.logo ?? '🏢',
    date: initial.date ?? '',
    role: initial.role ?? '',
    package: initial.package ?? '',
    deadline: initial.deadline ?? '',
    description: initial.description ?? '',
    overview: initial.overview ?? '',
    adminNote: initial.adminNote ?? '',
    attachmentName: initial.attachmentName ?? '',
    attachmentUrl: initial.attachmentUrl ?? '',
    eligibility: initial.eligibility ?? { ...EMPTY_ELIGIBILITY },
    roadmapId: initial.roadmapId ?? '',
    // Prep data
    interviewProcess: (initial.interviewProcess ?? []).join('\n'),
    pastQuestions: (initial.pastQuestions ?? []).join('\n'),
    salaryRange: initial.salaryRange ?? '',
    rounds: initial.rounds ?? 0,
  })
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl hover:opacity-70"
          style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-black" style={{ color: 'var(--foreground)' }}>
            {(initial as CompanyVisit).id ? 'Edit Company Visit' : 'New Company Visit'}
          </h1>
        </div>
      </div>
      <div className="rounded-2xl p-6 space-y-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Company Name</label>
          <input value={form.companyName} onChange={e => set('companyName', e.target.value)} placeholder="TCS" className={inputCls} style={inputSt} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Logo Emoji</label>
          <input value={form.logo} onChange={e => set('logo', e.target.value)} placeholder="🏢" className={inputCls} style={inputSt} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Role / Position</label>
          <input value={form.role} onChange={e => set('role', e.target.value)} placeholder="Software Engineer" className={inputCls} style={inputSt} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Package (LPA)</label>
          <input value={form.package} onChange={e => set('package', e.target.value)} placeholder="7 LPA" className={inputCls} style={inputSt} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Visit Date</label>
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className={inputCls} style={inputSt} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Apply Deadline</label>
          <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} className={inputCls} style={inputSt} />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Company Overview (shown in Company Prep page)</label>
        <textarea value={form.overview} onChange={e => set('overview', e.target.value)} rows={2}
          className={inputCls + ' resize-none'} style={inputSt}
          placeholder="Brief overview of the company and what they look for..." />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Job Description</label>
        <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
          className={inputCls + ' resize-none'} style={inputSt} />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Linked Roadmap (for Company Prep page)</label>
        <select value={form.roadmapId} onChange={e => set('roadmapId', e.target.value)}
          className={inputCls} style={{ ...inputSt, colorScheme: 'inherit' as const }}>
          <option value="">None (no linked roadmap)</option>
          {publishedRoadmaps.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
        </select>
        <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Only published roadmaps can be linked to student-facing company visits.</p>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Admin Note (shown to students)</label>
        <input value={form.adminNote} onChange={e => set('adminNote', e.target.value)}
          className={inputCls} style={inputSt} placeholder="Important note for students..." />
      </div>
      {/* Attachment */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Attachment Name</label>
          <input value={form.attachmentName} onChange={e => set('attachmentName', e.target.value)}
            className={inputCls} style={inputSt} placeholder="TCS_JD_2025.pdf" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Attachment URL or Upload</label>
          <div className="flex gap-2">
            <input value={form.attachmentUrl} onChange={e => set('attachmentUrl', e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg text-sm outline-none" style={inputSt} placeholder="https://..." />
            <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer flex-shrink-0 hover:opacity-80 transition-all"
              style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--primary)', border: '1px solid rgba(99,102,241,0.3)' }}>
              <Paperclip size={13} /> Upload
              <input type="file" className="hidden" onChange={e => {
                const f = e.target.files?.[0]
                if (f) { set('attachmentName', f.name); set('attachmentUrl', URL.createObjectURL(f)) }
              }} />
            </label>
          </div>
        </div>
      </div>
      {/* Eligibility form */}
      <EligibilityForm value={form.eligibility} onChange={v => set('eligibility', v)} />
      </div>

      {/* Interview Prep Data */}
      <div className="rounded-2xl p-6 space-y-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <h2 className="text-sm font-black" style={{ color: 'var(--foreground)' }}>Interview Prep Data (shown to accepted students)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Salary Range</label>
            <input value={form.salaryRange} onChange={e => set('salaryRange', e.target.value)}
              placeholder="e.g. 7–10 LPA" className={inputCls} style={inputSt} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Total Rounds</label>
            <input type="number" min="0" value={form.rounds} onChange={e => set('rounds', parseInt(e.target.value) || 0)}
              placeholder="4" className={inputCls} style={inputSt} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
            Interview Process (one step per line)
          </label>
          <textarea value={form.interviewProcess} onChange={e => set('interviewProcess', e.target.value)} rows={4}
            className={inputCls + ' resize-none'} style={inputSt}
            placeholder="Online Test (TCS NQT)&#10;Technical Interview Round 1&#10;Technical Interview Round 2&#10;HR Interview" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
            Past Questions (one per line)
          </label>
          <textarea value={form.pastQuestions} onChange={e => set('pastQuestions', e.target.value)} rows={4}
            className={inputCls + ' resize-none'} style={inputSt}
            placeholder="Reverse a linked list&#10;Find the largest element in array&#10;SQL JOIN queries" />
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => onSave({
          ...form,
          interviewProcess: form.interviewProcess.split('\n').map((s: string) => s.trim()).filter(Boolean),
          pastQuestions: form.pastQuestions.split('\n').map((s: string) => s.trim()).filter(Boolean),
        })} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
          Save Visit
        </button>
        <button onClick={onBack} className="px-6 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

function ResponsesPanel({ visit }: { visit: CompanyVisit }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'accepted' | 'rejected'>('all')

  const filtered = visit.responses.filter(r => {
    const matchStatus = filter === 'all' || r.status === filter
    const matchSearch = r.userName.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const accepted = visit.responses.filter(r => r.status === 'accepted').length
  const rejected = visit.responses.filter(r => r.status === 'rejected').length

  return (
    <div className="pt-3 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs font-bold" style={{ color: 'var(--muted-foreground)' }}>
          Student Responses ({visit.responses.length} total)
        </p>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399' }}>
            ✓ {accepted} applied
          </span>
          <span className="px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>
            ✕ {rejected} declined
          </span>
        </div>
      </div>

      {visit.responses.length === 0 ? (
        <p className="text-xs py-3 text-center" style={{ color: 'var(--muted-foreground)' }}>No responses yet</p>
      ) : (
        <>
          {/* Search + Filter bar */}
          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-0 px-3 py-1.5 rounded-lg"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
              <Search size={12} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search student name..."
                className="flex-1 min-w-0 outline-none bg-transparent text-xs"
                style={{ color: 'var(--foreground)' }} />
            </div>
            <div className="flex gap-1">
              {(['all', 'accepted', 'rejected'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
                  style={{
                    background: filter === f ? (f === 'accepted' ? 'rgba(16,185,129,0.15)' : f === 'rejected' ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)') : 'var(--muted)',
                    color: filter === f ? (f === 'accepted' ? '#34d399' : f === 'rejected' ? '#f87171' : 'var(--primary)') : 'var(--muted-foreground)',
                  }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-xs">
                <thead style={{ background: 'var(--muted)', position: 'sticky', top: 0 }}>
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold" style={{ color: 'var(--muted-foreground)' }}>#</th>
                    <th className="text-left px-3 py-2 font-semibold" style={{ color: 'var(--muted-foreground)' }}>Student Name</th>
                    <th className="text-left px-3 py-2 font-semibold" style={{ color: 'var(--muted-foreground)' }}>Status</th>
                    <th className="text-left px-3 py-2 font-semibold" style={{ color: 'var(--muted-foreground)' }}>Reason / Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-4 text-center" style={{ color: 'var(--muted-foreground)' }}>
                        No results found
                      </td>
                    </tr>
                  ) : filtered.map((r, idx) => (
                    <tr key={r.userId} className="transition-colors hover:opacity-90"
                      style={{ background: r.status === 'accepted' ? 'rgba(16,185,129,0.03)' : 'rgba(239,68,68,0.03)' }}>
                      <td className="px-3 py-2 font-semibold" style={{ color: 'var(--muted-foreground)' }}>{idx + 1}</td>
                      <td className="px-3 py-2 font-semibold" style={{ color: 'var(--foreground)' }}>{r.userName}</td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold"
                          style={{
                            background: r.status === 'accepted' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                            color: r.status === 'accepted' ? '#34d399' : '#f87171',
                          }}>
                          {r.status === 'accepted' ? '✓ Applied' : '✕ Declined'}
                        </span>
                      </td>
                      <td className="px-3 py-2" style={{ color: 'var(--muted-foreground)' }}>
                        {r.reason ?? <span style={{ opacity: 0.4 }}>—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2 max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-xs text-center py-3" style={{ color: 'var(--muted-foreground)' }}>No results found</p>
            ) : filtered.map((r, idx) => (
              <div key={r.userId} className="flex items-start gap-3 px-3 py-2.5 rounded-xl"
                style={{ background: r.status === 'accepted' ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)', border: `1px solid ${r.status === 'accepted' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}` }}>
                <span className="text-xs font-bold mt-0.5 flex-shrink-0 w-5 text-center" style={{ color: 'var(--muted-foreground)' }}>{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{r.userName}</p>
                  {r.reason && <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{r.reason}</p>}
                </div>
                <span className="text-xs font-semibold flex-shrink-0"
                  style={{ color: r.status === 'accepted' ? '#34d399' : '#f87171' }}>
                  {r.status === 'accepted' ? '✓ Applied' : '✕ Declined'}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function AdminCompanyPage() {
  const { companyVisits, setCompanyVisits } = useAppContext()
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list')
  const [editing, setEditing] = useState<CompanyVisit | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  function saveVisit(data: any) {
    if (editing) setCompanyVisits(companyVisits.map(v => v.id === editing.id ? { ...editing, ...data } : v))
    else setCompanyVisits([...companyVisits, { ...data, id: Date.now().toString(), status: 'pending' as const, responses: [] }])
    setView('list'); setEditing(null)
  }

  if (view === 'create' || view === 'edit') {
    return <VisitForm initial={editing ?? {}} onSave={saveVisit} onBack={() => { setView('list'); setEditing(null) }} />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--foreground)' }}>Company Management</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Manage campus visit invites and track student responses</p>
        </div>
        <button onClick={() => { setEditing(null); setView('create') }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
          <Plus size={16} /> Add Visit
        </button>
      </div>

      <div className="space-y-4">
        {companyVisits.map(v => {
          const st = STATUSES[v.status]
          const isExp = expanded === v.id
          return (
            <div key={v.id} className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="flex items-start gap-3 p-4 sm:p-5 flex-wrap">
                <span className="text-3xl flex-shrink-0">{v.logo}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold" style={{ color: 'var(--foreground)' }}>{v.companyName}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{v.role} · {v.package} · Visit: {v.date} · Deadline: {v.deadline}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    <span className="flex items-center gap-1">
                      <Users size={11} />
                      <span style={{ color: '#34d399' }}>{v.responses.filter(r => r.status === 'accepted').length} accepted</span>
                      {' · '}
                      <span style={{ color: '#f87171' }}>{v.responses.filter(r => r.status === 'rejected').length} declined</span>
                    </span>
                    {v.attachmentName && (
                      <span className="flex items-center gap-1" style={{ color: '#a5b4fc' }}>
                        <Paperclip size={11} /> {v.attachmentName}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setExpanded(isExp ? null : v.id)} className="p-1.5 rounded-lg transition-colors hover:opacity-70" style={{ color: 'var(--muted-foreground)' }}>
                    {isExp ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                  <button onClick={() => { setEditing(v); setView('edit') }} className="p-1.5 rounded-lg hover:opacity-70" style={{ color: 'var(--primary)' }}><Pencil size={14} /></button>
                  <button onClick={() => setCompanyVisits(companyVisits.filter(x => x.id !== v.id))} className="p-1.5 rounded-lg hover:opacity-70" style={{ color: '#f87171' }}><Trash2 size={14} /></button>
                </div>
              </div>

              {isExp && (
                <div className="px-5 pb-5 space-y-4" style={{ borderTop: '1px solid var(--muted)' }}>
                  {/* Eligibility display */}
                  <div className="pt-4">
                    <p className="text-xs font-bold mb-2" style={{ color: 'var(--muted-foreground)' }}>Eligibility Criteria</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: '#10b981' }}>
                          <Check size={9} className="text-white" />
                        </div>
                        <span style={{ color: 'var(--muted-foreground)' }}>Min CGPA: <strong className="text-white">{v.eligibility.minCGPA}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: v.eligibility.noBacklogs ? '#10b981' : '#ef4444' }}>
                          {v.eligibility.noBacklogs ? <Check size={9} className="text-white" /> : <X size={9} className="text-white" />}
                        </div>
                        <span style={{ color: 'var(--muted-foreground)' }}>No backlogs: <strong className="text-white">{v.eligibility.noBacklogs ? 'Required' : 'Not required'}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-xs col-span-2">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: '#6366f1' }}>
                          <Check size={9} className="text-white" />
                        </div>
                        <span style={{ color: 'var(--muted-foreground)' }}>Branches: <strong className="text-white">{v.eligibility.branches.join(', ')}</strong></span>
                      </div>
                      {v.eligibility.otherCriteria.map((c, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: '#f59e0b' }}>
                            <span style={{ fontSize: 8, color: 'var(--foreground)' }}>!</span>
                          </div>
                          <span style={{ color: 'var(--muted-foreground)' }}>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <ResponsesPanel visit={v} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
