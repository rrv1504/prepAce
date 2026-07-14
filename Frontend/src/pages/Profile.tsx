import { useEffect, useState } from 'react'
import { GitFork, Link2, Award, Code2, BookOpen, Zap, Star, Shield, ExternalLink, Edit2, X, Camera, Plus, Trash2, Loader, AlertCircle } from 'lucide-react'
import { authService, badgeService } from '../lib/services'

const fallbackBadges = [
  { name: 'First Blood', icon: '🩸', desc: 'First problem solved', earned: true },
  { name: '7-Day Streak', icon: '🔥', desc: 'Solved 7 days in a row', earned: true },
  { name: 'Century', icon: '💯', desc: '100 problems solved', earned: true },
  { name: 'Speed Demon', icon: '⚡', desc: 'Solved Hard in < 20min', earned: true },
  { name: 'Contest Winner', icon: '🏆', desc: 'Won a weekly contest', earned: false },
  { name: 'DP Master', icon: '🧠', desc: 'Solved all DP problems', earned: false },
]

const CERT_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#ff9900']

interface Cert { name: string; issuer: string; date: string; color: string }

const defaultCerts: Cert[] = []

function buildSkillsFromUser(user: any) {
  if (user.skills?.length) return user.skills
  return [
    { name: 'Data Structures', level: Math.min(100, user.dsaSolved || 0), color: '#6366f1' },
    { name: 'Aptitude', level: user.aptitudeScore || 0, color: '#ec4899' },
    { name: 'Mock Tests', level: Math.min(100, (user.mockTestsTaken || 0) * 5), color: '#8b5cf6' },
    { name: 'Consistency', level: Math.min(100, (user.dsaStreak || 0) * 3), color: '#f59e0b' },
    { name: 'Courses', level: Math.min(100, (user.coursesCompleted || 0) * 12), color: '#22c55e' },
  ]
}

function profileFromUser(user: any): ProfileData {
  return {
    name: user.name || 'Student',
    branch: user.branch || 'Not specified',
    college: user.college || 'Not specified',
    year: user.year || '1st',
    bio: user.bio || `${user.name || 'Student'} is preparing for placements with PrepAce.`,
    github: user.github || '',
    linkedin: user.linkedin || '',
    phone: user.phone || '',
    skills: buildSkillsFromUser(user),
  }
}

function AddCertModal({ onAdd, onClose }: { onAdd: (c: Cert) => void; onClose: () => void }) {
  const [name, setName] = useState('')
  const [issuer, setIssuer] = useState('')
  const [date, setDate] = useState('')
  const [color, setColor] = useState(CERT_COLORS[0])

  const handleAdd = () => {
    if (!name.trim() || !issuer.trim()) return
    onAdd({ name: name.trim(), issuer: issuer.trim(), date: date || 'Present', color })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl p-6 space-y-4"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">Add Certificate</h2>
          <button onClick={onClose} style={{ color: 'var(--muted-foreground)' }}><X size={18} /></button>
        </div>
        {[['Certificate Name', name, setName, 'e.g. AWS Cloud Practitioner'], ['Issuing Organisation', issuer, setIssuer, 'e.g. Amazon'], ['Date', date, setDate, 'e.g. Jan 2025']].map(([label, val, setter, ph]) => (
          <div key={label as string}>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--muted-foreground)' }}>{label as string}</label>
            <input value={val as string} onChange={e => (setter as (v: string) => void)(e.target.value)} placeholder={ph as string}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
          </div>
        ))}
        <div>
          <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--muted-foreground)' }}>Badge Color</label>
          <div className="flex flex-wrap gap-2">
            {CERT_COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)}
                className="w-7 h-7 rounded-full transition-all"
                style={{ background: c, outline: color === c ? `3px solid ${c}` : 'none', outlineOffset: 2 }} />
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium hover:opacity-70"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>Cancel</button>
          <button onClick={handleAdd} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90"
            style={{ background: 'var(--gradient-primary)', opacity: name.trim() && issuer.trim() ? 1 : 0.4 }}>
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

interface ProfileData {
  name: string
  branch: string
  college: string
  year: string
  bio: string
  github: string
  linkedin: string
  phone: string
  skills: { name: string; level: number; color: string }[]
}

const defaultProfile: ProfileData = {
  name: '',
  branch: '',
  college: '',
  year: '',
  bio: '',
  github: '',
  linkedin: '',
  phone: '',
  skills: [],
}

function EditProfileModal({ data, onSave, onClose }: {
  data: ProfileData
  onSave: (d: ProfileData) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<ProfileData>({ ...data })
  const set = (k: keyof ProfileData, v: string) => setForm(f => ({ ...f, [k]: v }))

  const Field = ({ label, field, placeholder }: { label: string; field: keyof ProfileData; placeholder?: string }) => (
    <div>
      <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--muted-foreground)' }}>{label}</label>
      <input
        value={form[field] as string}
        onChange={e => set(field, e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
        style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
      />
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden flex flex-col"
        style={{ background: 'var(--card)', border: '1px solid var(--border)', maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}>

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="font-bold text-lg">Edit Profile</h2>
          <button onClick={onClose} style={{ color: 'var(--muted-foreground)' }}><X size={18} /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          {/* Avatar section */}
          <div className="flex items-center gap-4 mb-2">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format"
                className="w-16 h-16 rounded-xl object-cover"
                style={{ outline: '3px solid var(--primary)', outlineOffset: '2px' }}
                alt=""
              />
              <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: 'var(--primary)' }}>
                <Camera size={10} className="text-white" />
              </button>
            </div>
            <div>
              <p className="font-semibold text-sm">Profile Photo</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>JPG, PNG or GIF • Max 2MB</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Full Name" field="name" placeholder="Your full name" />
            <Field label="Phone" field="phone" placeholder="+91 XXXXX XXXXX" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Branch" field="branch" placeholder="B.Tech CSE" />
            <Field label="Year" field="year" placeholder="Final Year" />
          </div>
          <Field label="College / University" field="college" placeholder="IIT/NIT/..." />

          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--muted-foreground)' }}>Bio</label>
            <textarea
              value={form.bio}
              onChange={e => set('bio', e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="GitHub URL" field="github" placeholder="github.com/username" />
            <Field label="LinkedIn URL" field="linkedin" placeholder="linkedin.com/in/..." />
          </div>

          {/* Skill levels */}
          <div>
            <p className="text-xs font-semibold mb-3" style={{ color: 'var(--muted-foreground)' }}>Skill Levels</p>
            <div className="space-y-3">
              {form.skills.map((s, i) => (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="text-xs w-32 flex-shrink-0">{s.name}</span>
                  <input type="range" min={0} max={100} value={s.level}
                    onChange={e => {
                      const updated = [...form.skills]
                      updated[i] = { ...s, level: +e.target.value }
                      setForm(f => ({ ...f, skills: updated }))
                    }}
                    className="flex-1 accent-indigo-500" />
                  <span className="text-xs w-8 text-right font-bold" style={{ color: s.color }}>{s.level}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-70"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
            Cancel
          </button>
          <button onClick={() => { onSave(form); onClose() }}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'var(--gradient-primary)' }}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Profile() {
  const [profile, setProfile] = useState<ProfileData>(defaultProfile)
  const [stats, setStats] = useState({ problems: 0, xp: 0, courses: 0, streak: 0 })
  const [myRank, setMyRank] = useState<number | null>(null)
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<string[]>([])
  const [allBadges, setAllBadges] = useState<Array<{ id: string; name: string; emoji: string; description: string }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [certs, setCerts] = useState<Cert[]>(defaultCerts)
  const [addCertOpen, setAddCertOpen] = useState(false)

  const displayBadges = allBadges.length
    ? allBadges.map(badge => ({
      name: badge.name,
      icon: badge.emoji,
      desc: badge.description,
      earned: earnedBadgeIds.includes(badge.id),
    }))
    : fallbackBadges

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true)
        setError('')
        const [{ user }, badges, board] = await Promise.all([
          authService.getProfile(),
          badgeService.listAll().catch(() => []),
          authService.getLeaderboard().catch(() => ({ entries: [], myRank: null })),
        ])

        setProfile(profileFromUser(user))
        setCerts(user.certificates || [])
        setEarnedBadgeIds((user.badges || []).map((id: string) => String(id)))
        setAllBadges(badges)
        setMyRank(board.myRank)
        setStats({
          problems: user.dsaSolved || 0,
          xp: user.totalXP || 0,
          courses: user.coursesCompleted || 0,
          streak: user.dsaStreak || 0,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  async function saveProfile(nextProfile: ProfileData) {
    try {
      setSaving(true)
      const { user } = await authService.updateProfile({
        name: nextProfile.name,
        branch: nextProfile.branch,
        college: nextProfile.college,
        year: nextProfile.year,
        bio: nextProfile.bio,
        github: nextProfile.github,
        linkedin: nextProfile.linkedin,
        phone: nextProfile.phone,
        skills: nextProfile.skills,
        certificates: certs,
      })
      setProfile(profileFromUser(user))
      setCerts(user.certificates || [])
      setStats({
        problems: user.dsaSolved || 0,
        xp: user.totalXP || 0,
        courses: user.coursesCompleted || 0,
        streak: user.dsaStreak || 0,
      })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  async function persistCertificates(nextCerts: Cert[]) {
    setCerts(nextCerts)
    try {
      const { user } = await authService.updateProfile({ certificates: nextCerts })
      setCerts(user.certificates || nextCerts)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save certificates')
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <Loader size={32} className="mx-auto mb-3 animate-spin" style={{ color: 'var(--primary)' }} />
        <p style={{ color: 'var(--muted-foreground)' }}>Loading your profile...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertCircle size={32} className="mx-auto mb-3" style={{ color: '#ef4444' }} />
        <p style={{ color: '#ef4444' }}>{error}</p>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-5xl mx-auto">
      {editOpen && (
        <EditProfileModal
          data={profile}
          onSave={saveProfile}
          onClose={() => setEditOpen(false)}
        />
      )}
      {addCertOpen && (
        <AddCertModal
          onAdd={c => persistCertificates([...certs, c])}
          onClose={() => setAddCertOpen(false)}
        />
      )}

      {/* Profile card */}
      <div className="p-6 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&auto=format"
              className="w-24 h-24 rounded-2xl object-cover"
              style={{ outline: '4px solid var(--primary)', outlineOffset: '2px' }}
              alt={profile.name}
            />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'var(--gradient-primary)' }}>
              {myRank ? `#${myRank}` : '—'}
            </div>
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl font-black">{profile.name}</h1>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)' }}>
                Premium
              </span>
            </div>
            <p className="text-sm mb-1" style={{ color: 'var(--muted-foreground)' }}>
              {profile.branch} • {profile.college} • {profile.year}
            </p>
            <p className="text-sm leading-relaxed max-w-lg" style={{ color: 'var(--muted-foreground)' }}>
              {profile.bio}
            </p>
            <div className="flex gap-3 mt-4 flex-wrap">
              <a href={`https://${profile.github}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                <GitFork size={14} /> GitHub
              </a>
              <a href={`https://${profile.linkedin}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                <Link2 size={14} /> LinkedIn
              </a>
              <button onClick={() => setEditOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 ml-auto"
                style={{ background: 'var(--gradient-primary)' }}>
                <Edit2 size={13} /> Edit Profile
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Code2, label: 'Problems', value: stats.problems.toString(), color: '#6366f1' },
              { icon: Zap, label: 'XP Points', value: stats.xp.toLocaleString(), color: '#f59e0b' },
              { icon: BookOpen, label: 'Courses', value: stats.courses.toString(), color: '#22c55e' },
              { icon: Star, label: 'Streak', value: `${stats.streak}d`, color: '#ef4444' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="p-3 rounded-xl text-center" style={{ background: 'var(--muted)' }}>
                <Icon size={16} className="mx-auto mb-1" style={{ color }} />
                <div className="text-lg font-black">{value}</div>
                <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Skills */}
        <div className="p-5 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Skills</h2>
            <button onClick={() => setEditOpen(true)}
              className="text-xs font-medium flex items-center gap-1 transition-all hover:opacity-70"
              style={{ color: 'var(--primary)' }}>
              <Edit2 size={11} /> Edit
            </button>
          </div>
          <div className="space-y-4">
            {profile.skills.map(({ name, level, color }) => (
              <div key={name}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium">{name}</span>
                  <span style={{ color: 'var(--muted-foreground)' }}>{level}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${level}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Badges */}
        <div className="p-5 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Badges & Achievements</h2>
            <Award size={16} style={{ color: 'var(--accent)' }} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {displayBadges.map(({ name, icon, desc, earned }) => (
              <div key={name} className="p-3 rounded-xl text-center transition-all"
                style={{
                  background: earned ? 'rgba(99,102,241,0.08)' : 'var(--muted)',
                  border: `1px solid ${earned ? 'rgba(99,102,241,0.2)' : 'var(--border)'}`,
                  opacity: earned ? 1 : 0.4,
                }}>
                <div className="text-2xl mb-1">{icon}</div>
                <p className="text-xs font-semibold">{name}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Certificates */}
      <div className="p-5 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Certificates</h2>
          <button onClick={() => setAddCertOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'var(--gradient-primary)' }}>
            <Plus size={12} /> Add Certificate
          </button>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {certs.map(({ name, issuer, date, color }, idx) => (
            <div key={idx} className="p-4 rounded-xl flex items-start gap-3 group cursor-pointer transition-all hover:scale-[1.02]"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}20` }}>
                <Shield size={18} style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{name}</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{issuer} • {date}</p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink size={13} style={{ color: 'var(--muted-foreground)' }} />
                <button onClick={e => { e.stopPropagation(); setCerts(c => c.filter((_, i) => i !== idx)) }}
                  style={{ color: '#ef4444' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
          {certs.length === 0 && (
            <div className="col-span-3 py-8 text-center rounded-xl" style={{ background: 'var(--muted)' }}>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No certificates yet. Add your first one!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
