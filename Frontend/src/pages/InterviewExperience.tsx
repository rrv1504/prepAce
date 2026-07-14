import { useEffect, useState } from 'react'
import { Search, Heart, MessageSquare, Share2, X, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { api, loadCollection } from '../lib/api'

// ── Share Experience Modal ────────────────────────────────────────────────────
interface NewExp {
  company: string; role: string; college: string; result: string
  package: string; rounds: string; summary: string
  timeline: string; questions: string; tags: string
}

function ShareModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (e: any) => void }) {
  const [form, setForm] = useState<NewExp>({
    company: '', role: '', college: '', result: 'Selected',
    package: '', rounds: '3', summary: '',
    timeline: '', questions: '', tags: '',
  })
  const set = (k: keyof NewExp, v: string) => setForm(f => ({ ...f, [k]: v }))
  const inputSt = {
    background: 'var(--muted)', border: '1px solid var(--border)',
    color: 'var(--foreground)', colorScheme: 'inherit' as const,
  }
  const cls = 'w-full px-3 py-2.5 rounded-xl text-sm outline-none'

  function submit() {
    if (!form.company || !form.role || !form.summary) return
    onSubmit({
      company: form.company,
      role: form.role,
      author: 'you',
      college: form.college || 'Your College',
      avatar: 'photo-1535713875002-d1d0cf377fde',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      result: form.result,
      package: form.result === 'Selected' ? (form.package || 'N/A') : 'N/A',
      rounds: parseInt(form.rounds) || 3,
      likes: 0,
      comments: 0,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      summary: form.summary,
      timeline: form.timeline.split('\n').map(t => t.trim()).filter(Boolean),
      questions: form.questions.split('\n').map(q => q.trim()).filter(Boolean),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between p-5 sticky top-0 z-10"
          style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
          <h2 className="font-bold text-base" style={{ color: 'var(--foreground)' }}>Share Your Experience</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:opacity-70" style={{ color: 'var(--muted-foreground)' }}>
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Company *</label>
              <input value={form.company} onChange={e => set('company', e.target.value)} placeholder="e.g. Google" className={cls} style={inputSt} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Role *</label>
              <input value={form.role} onChange={e => set('role', e.target.value)} placeholder="e.g. SDE Intern" className={cls} style={inputSt} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>College</label>
              <input value={form.college} onChange={e => set('college', e.target.value)} placeholder="e.g. IIT Bombay" className={cls} style={inputSt} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Result</label>
              <select value={form.result} onChange={e => set('result', e.target.value)} className={cls} style={inputSt}>
                <option value="Selected">Selected ✅</option>
                <option value="Rejected">Rejected ❌</option>
                <option value="Pending">Pending ⏳</option>
              </select>
            </div>
            {form.result === 'Selected' && (
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Package</label>
                <input value={form.package} onChange={e => set('package', e.target.value)} placeholder="e.g. 20 LPA" className={cls} style={inputSt} />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Number of Rounds</label>
              <input type="number" min="1" max="10" value={form.rounds} onChange={e => set('rounds', e.target.value)} className={cls} style={inputSt} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Summary * (your overall experience)</label>
            <textarea value={form.summary} onChange={e => set('summary', e.target.value)} rows={4} placeholder="Describe your overall interview experience..." className={cls + ' resize-none'} style={inputSt} />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Interview Rounds (one per line)</label>
            <textarea value={form.timeline} onChange={e => set('timeline', e.target.value)} rows={3}
              placeholder={"Online Assessment (90 min)\nTechnical Round 1 - Arrays\nHR Round"}
              className={cls + ' resize-none font-mono text-xs'} style={inputSt} />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Questions Asked (one per line)</label>
            <textarea value={form.questions} onChange={e => set('questions', e.target.value)} rows={3}
              placeholder={"Find two numbers that add up to target\nDesign a LRU cache"}
              className={cls + ' resize-none font-mono text-xs'} style={inputSt} />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Tags (comma separated)</label>
            <input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="e.g. DP, Graphs, System Design, Behavioral" className={cls} style={inputSt} />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={submit} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: 'var(--gradient-primary)', opacity: !form.company || !form.role || !form.summary ? 0.6 : 1 }}
              disabled={!form.company || !form.role || !form.summary}>
              Post Experience
            </button>
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const experiences = [
  {
    id: 1,
    company: 'Google',
    role: 'SDE Intern',
    author: 'karan_codes',
    college: 'IIT Bombay',
    avatar: 'photo-1500648767791-00dcc994a43e',
    date: 'Jan 12, 2025',
    result: 'Selected',
    package: '80 LPA',
    rounds: 4,
    likes: 342,
    comments: 48,
    tags: ['Graphs', 'DP', 'System Design', 'Behavioral'],
    summary: 'Had an amazing experience interviewing at Google. The process was rigorous but fair. Each interviewer was respectful and genuinely curious about my approach to problems.',
    timeline: ['Online Assessment (90 min)', 'Technical Round 1 - Arrays + Trees', 'Technical Round 2 - DP + Design', 'HR + Team Matching'],
    questions: ['Find the shortest path in a weighted directed graph with negative edges', 'Design a real-time collaborative editor', 'Implement a file system'],
  },
  {
    id: 2,
    company: 'Amazon',
    role: 'SDE-1',
    author: 'sneha_dev',
    college: 'BITS Pilani',
    avatar: 'photo-1438761681033-6461ffad8d80',
    date: 'Dec 28, 2024',
    result: 'Selected',
    package: '42 LPA',
    rounds: 5,
    likes: 287,
    comments: 35,
    tags: ['Leadership Principles', 'OOP', 'Graphs', 'DBMS'],
    summary: 'Amazon\'s interview is unique because of the leadership principles focus. Every answer needs to be backed with a STAR format story. Make sure you prepare 8-10 strong STAR stories.',
    timeline: ['OA - DSA (2 coding)', 'Technical 1 - OOP + DSA', 'Technical 2 - System Design', 'Behavioral (LP rounds) x2'],
    questions: ['Implement a rate limiter', 'Design Amazon\'s cart system', 'Find median from data stream'],
  },
  {
    id: 3,
    company: 'Microsoft',
    role: 'SDE-2',
    author: 'rahul_ms',
    college: 'NIT Warangal',
    avatar: 'photo-1472099645785-5658abf4ff4e',
    date: 'Dec 15, 2024',
    result: 'Rejected',
    package: 'N/A',
    rounds: 3,
    likes: 156,
    comments: 22,
    tags: ['Trees', 'Graphs', 'OOP'],
    summary: 'Got rejected in the final technical round due to a system design question I wasn\'t fully prepared for. The interviewers were kind and gave constructive feedback. Will try again!',
    timeline: ['Phone Screen', 'Technical 1 - DSA', 'Technical 2 - System Design (Failed here)'],
    questions: ['Serialize and deserialize a binary tree', 'Design a distributed key-value store'],
  },
]

const resultColors: Record<string, { color: string; bg: string }> = {
  Selected: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  Rejected: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  Pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
}

const companyColors: Record<string, string> = {
  Google: '#4285f4',
  Amazon: '#ff9900',
  Microsoft: '#00a4ef',
  Flipkart: '#f7c948',
}

export default function InterviewExperience() {
  const [allExps, setAllExps] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [expanded, setExpanded] = useState<string | number | null>(null)
  const [liked, setLiked] = useState<Set<string | number>>(new Set())
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    loadCollection<any>('/interview-experiences')
      .then(items => {
        setAllExps(items)
        setExpanded(items[0]?.id ?? null)
      })
      .catch(error => {
        console.warn('Failed to load interview experiences', error)
        setAllExps(experiences)
        setExpanded(experiences[0]?.id ?? null)
      })
  }, [])

  async function handleShare(newExp: any) {
    const created = await api.post<any>('/interview-experiences', newExp)
    setAllExps(prev => [created, ...prev])
    setExpanded(created.id)
    setShowModal(false)
  }

  const filtered = allExps.filter(e => {
    const matchSearch = e.company.toLowerCase().includes(search.toLowerCase()) ||
      e.author.toLowerCase().includes(search.toLowerCase()) ||
      e.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    const matchFilter = filter === 'All' || e.result === filter || e.company === filter
    return matchSearch && matchFilter
  })

  const toggleLike = (id: string | number) => {
    setLiked(prev => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {showModal && <ShareModal onClose={() => setShowModal(false)} onSubmit={handleShare} />}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Interview Experiences</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Real experiences from students who cracked their placements
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
          style={{ background: 'var(--gradient-primary)' }}>
          <Plus size={14} /> Share Experience
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by company, tag, or author..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
        </div>
        <div className="flex gap-2">
          {['All', 'Selected', 'Rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: filter === f ? 'var(--primary)' : 'var(--card)',
                color: filter === f ? 'white' : 'var(--muted-foreground)',
                border: '1px solid var(--border)',
              }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map(exp => {
          const rc = resultColors[exp.result]
          const isExpanded = expanded === exp.id
          const isLiked = liked.has(exp.id)
          return (
            <div key={exp.id} className="rounded-2xl overflow-hidden"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              {/* Timeline indicator */}
              <div className="h-1" style={{ background: companyColors[exp.company] || 'var(--primary)' }} />

              <div className="p-5">
                <div className="flex items-start gap-4">
                  <img
                    src={`https://images.unsplash.com/${exp.avatar}?w=48&h=48&fit=crop&auto=format`}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    alt={exp.author}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-bold text-sm">{exp.company}</span>
                      <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>–</span>
                      <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{exp.role}</span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ color: rc.color, background: rc.bg }}>
                        {exp.result}
                      </span>
                      {exp.result === 'Selected' && (
                        <span className="text-xs font-semibold" style={{ color: '#22c55e' }}>{exp.package}</span>
                      )}
                    </div>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      @{exp.author} • {exp.college} • {exp.date} • {exp.rounds} rounds
                    </p>
                  </div>
                </div>

                <p className="text-sm leading-relaxed mt-3" style={{ color: 'var(--muted-foreground)' }}>
                  {exp.summary}
                </p>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {exp.tags.map(t => (
                    <span key={t} className="text-xs px-2.5 py-1 rounded-lg font-medium"
                      style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)' }}>
                      {t}
                    </span>
                  ))}
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 space-y-4" style={{ borderTop: '1px solid var(--border)' }}>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>Interview Rounds</p>
                      <div className="space-y-1.5">
                        {exp.timeline.map((t, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white"
                              style={{ background: 'var(--gradient-primary)' }}>{i + 1}</div>
                            <span className="text-sm">{t}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>Questions Asked</p>
                      <ul className="space-y-1.5">
                        {exp.questions.map((q, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                            <span style={{ color: 'var(--primary)' }}>Q{i + 1}.</span> {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 mt-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                  <button onClick={() => toggleLike(exp.id)} className="flex items-center gap-1.5 text-xs transition-all hover:opacity-70">
                    <Heart size={14} className={isLiked ? 'fill-red-400 text-red-400' : ''} style={{ color: isLiked ? undefined : 'var(--muted-foreground)' }} />
                    <span style={{ color: 'var(--muted-foreground)' }}>{exp.likes + (isLiked ? 1 : 0)}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-xs transition-all hover:opacity-70"
                    style={{ color: 'var(--muted-foreground)' }}>
                    <MessageSquare size={14} />
                    {exp.comments}
                  </button>
                  <button className="flex items-center gap-1.5 text-xs transition-all hover:opacity-70"
                    style={{ color: 'var(--muted-foreground)' }}>
                    <Share2 size={14} /> Share
                  </button>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : exp.id)}
                    className="ml-auto text-xs font-semibold transition-all hover:opacity-70"
                    style={{ color: 'var(--primary)' }}>
                    {isExpanded ? 'Show less' : 'Read full experience →'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
