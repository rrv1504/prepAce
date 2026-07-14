import { useState } from 'react'
import { useAppContext, type Badge } from '../../context/AppContext'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { badgeService } from '../../lib/services'
import { normalizeId } from '../../lib/api'

const COLORS = ['#6366f1', '#8b5cf6', '#f97316', '#10b981', '#ec4899', '#f59e0b', '#06b6d4', '#ef4444']

const EMPTY: Omit<Badge, 'id'> = { name: '', emoji: '🏆', description: '', xp: 100, color: '#6366f1', criteria: '' }

function BadgeForm({ initial, onSave, onCancel }: { initial: Partial<Badge>, onSave: (b: any) => void, onCancel: () => void }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial })
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))
  const inputSt = { background: 'var(--muted)', border: '1px solid rgba(99,102,241,0.15)', color: 'var(--foreground)' }
  const inputCls = "w-full px-3 py-2 rounded-lg text-sm outline-none"

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Badge Name</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="DSA Hero" className={inputCls} style={inputSt} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Emoji</label>
          <input value={form.emoji} onChange={e => set('emoji', e.target.value)} placeholder="🏆" className={inputCls} style={inputSt} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>XP Reward</label>
          <input type="number" value={form.xp} onChange={e => set('xp', +e.target.value)} className={inputCls} style={inputSt} />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--muted-foreground)' }}>Badge Color</label>
        <div className="flex gap-2">
          {COLORS.map(c => (
            <button key={c} onClick={() => set('color', c)}
              className="w-8 h-8 rounded-full transition-all"
              style={{ background: c, outline: form.color === c ? `3px solid var(--foreground)` : 'none', outlineOffset: '2px' }} />
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Description (shown to users)</label>
        <input value={form.description} onChange={e => set('description', e.target.value)} placeholder="Solve 50 DSA problems"
          className={inputCls} style={inputSt} />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Criteria (admin reference)</label>
        <textarea value={form.criteria} onChange={e => set('criteria', e.target.value)} rows={2}
          className={inputCls + ' resize-none'} style={inputSt}
          placeholder="Define exactly when this badge is awarded..." />
      </div>

      {/* Preview */}
      <div className="p-4 rounded-xl" style={{ background: 'var(--muted)' }}>
        <p className="text-xs font-semibold mb-3" style={{ color: 'var(--muted-foreground)' }}>Preview</p>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: `${form.color}20`, border: `2px solid ${form.color}40` }}>
            {form.emoji}
          </div>
          <div>
            <p className="font-bold" style={{ color: 'var(--foreground)' }}>{form.name || 'Badge Name'}</p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{form.description || 'Description'}</p>
            <p className="text-xs font-semibold mt-0.5" style={{ color: form.color }}>+{form.xp} XP</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={() => onSave({ ...form, id: (initial as any).id ?? Date.now().toString() })}
          className="px-5 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
          Save Badge
        </button>
        <button onClick={onCancel} className="px-5 py-2 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

export default function AdminBadgePage() {
  const { badges, setBadges } = useAppContext()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Badge | null>(null)

  async function saveBadge(b: Badge) {
    const existing = badges.find(x => x.id === b.id)
    const { id, ...payload } = b as any
    try {
      const saved = existing ? await badgeService.update(existing.id, payload) : await badgeService.create(payload)
      const normalized = { ...(normalizeId(saved as any) as Badge), __synced: true } as any
      if (existing) setBadges(badges.map(x => x.id === existing.id ? normalized : x))
      else setBadges([normalized, ...badges])
      setShowForm(false)
      setEditing(null)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save badge')
    }
  }

  async function deleteBadge(id: string) {
    try {
      await badgeService.delete(id)
      setBadges(badges.filter(x => x.id !== id).map(badge => ({ ...badge, __synced: true } as any)))
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete badge')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--foreground)' }}>Badge Management</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>{badges.length} badges defined</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null) }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
          <Plus size={16} /> Create Badge
        </button>
      </div>

      {(showForm || editing) && (
        <div className="rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <h2 className="font-bold mb-4" style={{ color: 'var(--foreground)' }}>{editing ? 'Edit Badge' : 'New Badge'}</h2>
          <BadgeForm initial={editing ?? {}} onSave={saveBadge} onCancel={() => { setShowForm(false); setEditing(null) }} />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map(b => (
          <div key={b.id} className="rounded-2xl p-5 flex items-start justify-between gap-3"
            style={{ background: 'var(--card)', border: `1px solid ${b.color}25` }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: `${b.color}15`, border: `2px solid ${b.color}30` }}>
                {b.emoji}
              </div>
              <div>
                <p className="font-bold" style={{ color: 'var(--foreground)' }}>{b.name}</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{b.description}</p>
                <p className="text-xs font-bold mt-1" style={{ color: b.color }}>+{b.xp} XP</p>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 flex-shrink-0">
              <button onClick={() => { setEditing(b); setShowForm(false) }} className="p-1.5 rounded-lg hover:opacity-70" style={{ color: '#a5b4fc' }}><Pencil size={13} /></button>
              <button onClick={() => deleteBadge(b.id)} className="p-1.5 rounded-lg hover:opacity-70" style={{ color: '#f87171' }}><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
