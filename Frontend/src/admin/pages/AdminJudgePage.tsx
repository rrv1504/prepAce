import { useEffect, useState } from 'react'
import { Plus, Settings2, X } from 'lucide-react'
import { api, loadCollection, normalizeId } from '../../lib/api'

interface JudgeConfig {
  id: string
  problemId: string
  timeLimit: number
  memoryLimit: number
  languages: string[]
  checker: string
}

const ALL_LANGUAGES = ['Python', 'Java', 'C++', 'C', 'JavaScript', 'Go', 'Rust', 'Kotlin']

const DEMO: JudgeConfig[] = [
  { id: '1', problemId: 'Two Sum', timeLimit: 1000, memoryLimit: 256, languages: ['Python', 'Java', 'C++', 'JavaScript'], checker: 'exact_match' },
  { id: '2', problemId: 'Valid Parentheses', timeLimit: 500, memoryLimit: 128, languages: ['Python', 'C++', 'Java'], checker: 'exact_match' },
]

const EMPTY: Omit<JudgeConfig, 'id'> = { problemId: '', timeLimit: 1000, memoryLimit: 256, languages: ['Python', 'Java', 'C++'], checker: 'exact_match' }

export default function AdminJudgePage() {
  const [configs, setConfigs] = useState<JudgeConfig[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Omit<JudgeConfig, 'id'>>({ ...EMPTY })
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const inputSt = { background: 'var(--muted)', border: '1px solid rgba(99,102,241,0.15)', color: 'var(--foreground)', colorScheme: 'inherit' as const }
  const inputCls = "w-full px-3 py-2 rounded-lg text-sm outline-none"

  function toggleLang(lang: string) {
    set('languages', form.languages.includes(lang)
      ? form.languages.filter(l => l !== lang)
      : [...form.languages, lang])
  }

  useEffect(() => {
    loadCollection<JudgeConfig>('/judge-configs')
      .then(setConfigs)
      .catch(error => {
        console.warn('Failed to load judge configs', error)
        setConfigs(DEMO)
      })
  }, [])

  async function saveConfig() {
    const created = await api.post<JudgeConfig>('/judge-configs', form)
    setConfigs([normalizeId(created as any) as JudgeConfig, ...configs])
    setShowForm(false)
    setForm({ ...EMPTY })
  }

  async function deleteConfig(id: string) {
    await api.delete(`/judge-configs/${id}`)
    setConfigs(configs.filter(x => x.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--foreground)' }}>Coding Judge Configuration</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Set time limits, memory limits, and language support per problem</p>
        </div>
        <button onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
          <Plus size={16} /> Add Config
        </button>
      </div>

      {/* Global settings */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid rgba(99,102,241,0.1)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Settings2 size={16} style={{ color: '#a5b4fc' }} />
          <h2 className="font-bold" style={{ color: 'var(--foreground)' }}>Global Defaults</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Default Time Limit', value: '2000ms' },
            { label: 'Default Memory Limit', value: '256 MB' },
            { label: 'Max Test Cases', value: '20' },
          ].map(({ label, value }) => (
            <div key={label} className="p-3 rounded-xl" style={{ background: 'var(--muted)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
              <p className="font-bold" style={{ color: 'var(--foreground)' }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="rounded-2xl p-6 space-y-4" style={{ background: 'var(--card)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <h2 className="font-bold" style={{ color: 'var(--foreground)' }}>New Judge Config</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Problem ID / Name</label>
              <input value={form.problemId} onChange={e => set('problemId', e.target.value)} placeholder="Two Sum"
                className={inputCls} style={inputSt} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Time Limit (ms)</label>
              <input type="number" value={form.timeLimit} onChange={e => set('timeLimit', +e.target.value)} className={inputCls} style={inputSt} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Memory Limit (MB)</label>
              <input type="number" value={form.memoryLimit} onChange={e => set('memoryLimit', +e.target.value)} className={inputCls} style={inputSt} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Checker</label>
              <select value={form.checker} onChange={e => set('checker', e.target.value)} className={inputCls} style={inputSt}>
                <option value="exact_match">Exact Match</option>
                <option value="token_match">Token Match</option>
                <option value="special">Special Judge</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--muted-foreground)' }}>Supported Languages</label>
            <div className="flex gap-2 flex-wrap">
              {ALL_LANGUAGES.map(lang => (
                <button key={lang} onClick={() => toggleLang(lang)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: form.languages.includes(lang) ? 'rgba(99,102,241,0.25)' : 'var(--muted)',
                    color: form.languages.includes(lang) ? '#a5b4fc' : 'var(--muted-foreground)',
                    border: `1px solid ${form.languages.includes(lang) ? 'rgba(99,102,241,0.4)' : 'transparent'}`,
                  }}>
                  {lang}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={saveConfig} className="px-5 py-2 rounded-xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>Save Config</button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Table — desktop */}
      <div className="rounded-2xl overflow-hidden hidden md:block" style={{ background: 'var(--card)', border: '1px solid rgba(99,102,241,0.1)' }}>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
              {['Problem', 'Time Limit', 'Memory Limit', 'Languages', 'Checker', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {configs.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td className="px-4 py-3 font-semibold" style={{ color: 'var(--foreground)' }}>{c.problemId}</td>
                <td className="px-4 py-3" style={{ color: 'var(--muted-foreground)' }}>{c.timeLimit}ms</td>
                <td className="px-4 py-3" style={{ color: 'var(--muted-foreground)' }}>{c.memoryLimit}MB</td>
                <td className="px-4 py-3" style={{ color: 'var(--muted-foreground)' }}>{c.languages.slice(0, 3).join(', ')}{c.languages.length > 3 ? ` +${c.languages.length - 3}` : ''}</td>
                <td className="px-4 py-3" style={{ color: 'var(--muted-foreground)' }}>{c.checker}</td>
                <td className="px-4 py-3">
                  <button onClick={() => deleteConfig(c.id)} className="p-1.5 rounded-lg hover:opacity-70" style={{ color: '#f87171' }}><X size={13} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards — mobile */}
      <div className="md:hidden space-y-3">
        {configs.map(c => (
          <div key={c.id} className="rounded-2xl p-4 space-y-2" style={{ background: 'var(--card)', border: '1px solid rgba(99,102,241,0.1)' }}>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>{c.problemId}</p>
              <button onClick={() => deleteConfig(c.id)} className="p-1.5 rounded-lg" style={{ color: '#f87171' }}><X size={13} /></button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg" style={{ background: 'var(--muted)' }}>
                <p style={{ color: 'var(--muted-foreground)' }}>Time Limit</p>
                <p className="font-semibold mt-0.5" style={{ color: 'var(--foreground)' }}>{c.timeLimit}ms</p>
              </div>
              <div className="p-2 rounded-lg" style={{ background: 'var(--muted)' }}>
                <p style={{ color: 'var(--muted-foreground)' }}>Memory Limit</p>
                <p className="font-semibold mt-0.5" style={{ color: 'var(--foreground)' }}>{c.memoryLimit}MB</p>
              </div>
            </div>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              <span className="font-semibold" style={{ color: 'var(--foreground)' }}>Languages: </span>{c.languages.join(', ')}
            </p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Checker: {c.checker}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
