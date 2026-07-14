import { Trophy, Flame, Zap, MessageSquare, AlertCircle, CheckCircle2, Check, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { api, loadCollection } from '../lib/api'

const STATIC_NOTIFS = [
  { id: 1, icon: Trophy, iconColor: '#f59e0b', title: 'New Achievement Unlocked 🏆', body: "You've solved 100 problems! You earned the 'Century' badge.", time: '1 hour ago', read: false },
  { id: 2, icon: Flame, iconColor: '#ef4444', title: "Don't break your streak!", body: "You haven't solved a problem today. Keep your 42-day streak alive!", time: '3 hours ago', read: false },
  { id: 3, icon: Zap, iconColor: '#8b5cf6', title: 'Weekly Contest starting in 1 hour', body: 'PrepAce Weekly Contest #48 starts at 8:00 PM IST. 4 problems, 90 minutes.', time: '5 hours ago', read: true },
  { id: 4, icon: MessageSquare, iconColor: '#06b6d4', title: 'karan_codes commented on your post', body: '"Great explanation! The hash map approach is spot on. Upvoted."', time: '1 day ago', read: true },
  { id: 5, icon: AlertCircle, iconColor: '#6366f1', title: 'New AI Feature: Code Optimizer', body: 'We launched an AI Code Optimizer! It analyzes your solution and suggests improvements.', time: '2 days ago', read: true },
  { id: 6, icon: CheckCircle2, iconColor: '#22c55e', title: 'Daily Goal Completed!', body: "You've completed all your daily goals for today. Great consistency!", time: '2 days ago', read: true },
]

const ICONS: Record<string, any> = {
  Trophy,
  Flame,
  Zap,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
}

function CompanyVisitCard({ visit, onAccept, onReject }: { visit: any, onAccept: () => void, onReject: (reason: string) => void }) {
  const [showReject, setShowReject] = useState(false)
  const [reason, setReason] = useState('')

  if (visit.status !== 'pending') {
    return (
      <div className="p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{visit.logo}</span>
          <div>
            <p className="font-bold text-sm">{visit.companyName}</p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{visit.role} · {visit.package}</p>
          </div>
          <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold"
            style={{
              background: visit.status === 'accepted' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
              color: visit.status === 'accepted' ? '#34d399' : '#f87171',
            }}>
            {visit.status === 'accepted' ? '✓ Accepted' : '✕ Rejected'}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 rounded-2xl" style={{
      background: 'rgba(99,102,241,0.06)',
      border: '1px solid rgba(99,102,241,0.2)',
    }}>
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl flex-shrink-0">{visit.logo}</span>
        <div className="flex-1">
          <p className="font-bold text-sm">{visit.companyName} is visiting your campus!</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            {visit.role} · {visit.package} · Visit: {visit.date}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{visit.description}</p>
          {visit.adminNote && (
            <p className="text-xs mt-1.5 px-2 py-1 rounded-lg" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)' }}>
              📌 {visit.adminNote}
            </p>
          )}
          <p className="text-xs mt-1.5" style={{ color: 'rgba(239,68,68,0.8)' }}>Apply deadline: {visit.deadline}</p>
        </div>
        <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: 'var(--primary)' }} />
      </div>

      {showReject ? (
        <div className="space-y-2 mt-2">
          <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2}
            placeholder="Reason for not applying (e.g., Location preference, Role mismatch...)"
            className="w-full px-3 py-2 rounded-xl text-xs outline-none resize-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--foreground)' }} />
          <div className="flex gap-2">
            <button onClick={() => onReject(reason)}
              className="flex-1 py-2 rounded-xl text-xs font-bold text-white"
              style={{ background: 'rgba(239,68,68,0.8)' }}>
              Confirm Reject
            </button>
            <button onClick={() => setShowReject(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--muted-foreground)' }}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button onClick={onAccept}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
            <Check size={12} /> Accept & Apply
          </button>
          <button onClick={() => setShowReject(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>
            <X size={12} /> Not Interested
          </button>
        </div>
      )}
    </div>
  )
}

export default function Notifications() {
  const { companyVisits, setCompanyVisits } = useAppContext()
  const [items, setItems] = useState<any[]>([])
  const unreadCount = items.filter(n => !n.read).length + companyVisits.filter(v => v.status === 'pending').length

  useEffect(() => {
    loadCollection<any>('/notifications')
      .then(setItems)
      .catch(error => {
        console.warn('Failed to load notifications', error)
        setItems([])
      })
  }, [])

  const markAllRead = () => {
    items.forEach(n => !n.read && api.put(`/notifications/${n.id}`, { ...n, read: true }).catch(() => {}))
    setItems(ns => ns.map(n => ({ ...n, read: true })))
  }

  const markRead = (id: string | number) => {
    const current = items.find(n => n.id === id)
    if (current && !current.read) api.put(`/notifications/${id}`, { ...current, read: true }).catch(() => {})
    setItems(ns => ns.map(n => n.id === id ? { ...n, read: true } : n))
  }

  async function respondVisit(id: string, status: 'accepted' | 'rejected', reason?: string) {
    const updated = await api.post<any>(`/company-visits/${id}/respond`, { status, reason })
    const normalizedResponses = (updated.responses || []).map((response: any) => ({
      userId: String(response.user?._id || response.user || response.userId || ''),
      userName: response.userName || 'You',
      status: response.status,
      reason: response.reason,
    }))
    setCompanyVisits(companyVisits.map(v => v.id === id ? {
      ...v,
      ...updated,
      id: updated.id || updated._id || v.id,
      status,
      userReason: reason,
      responses: normalizedResponses.length ? normalizedResponses : v.responses,
    } : v))
    window.dispatchEvent(new Event('prepace:company-visits-updated'))
  }

  function acceptVisit(id: string) {
    respondVisit(id, 'accepted').catch(error => console.warn('Failed to accept visit', error))
  }

  function rejectVisit(id: string, reason: string) {
    respondVisit(id, 'rejected', reason).catch(error => console.warn('Failed to reject visit', error))
  }

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Notifications</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-sm font-medium transition-all hover:opacity-70"
            style={{ color: 'var(--primary)' }}>
            Mark all as read
          </button>
        )}
      </div>

      {/* Company visit invites */}
      {companyVisits.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--muted-foreground)' }}>
            Company Visit Invites
          </h2>
          <div className="space-y-3">
            {companyVisits.map(v => (
              <CompanyVisitCard
                key={v.id}
                visit={v}
                onAccept={() => acceptVisit(v.id)}
                onReject={(reason) => rejectVisit(v.id, reason)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Unread static */}
      {items.some(n => !n.read) && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--muted-foreground)' }}>New</h2>
          <div className="space-y-2">
            {items.filter(n => !n.read).map(({ id, icon, iconColor, title, body, time }) => {
              const Icon = typeof icon === 'string' ? ICONS[icon] || AlertCircle : icon
              return (
              <button key={id} onClick={() => markRead(id)} className="w-full text-left p-4 rounded-2xl transition-all hover:opacity-90"
                style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${iconColor}15` }}>
                    <Icon size={18} style={{ color: iconColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{title}</p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{body}</p>
                    <p className="text-xs mt-1.5" style={{ color: 'var(--primary)' }}>{time}</p>
                  </div>
                  <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: 'var(--primary)' }} />
                </div>
              </button>
            )})}
          </div>
        </div>
      )}

      {/* Read */}
      {items.some(n => n.read) && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--muted-foreground)' }}>Earlier</h2>
          <div className="space-y-2">
            {items.filter(n => n.read).map(({ id, icon, iconColor, title, body, time }) => {
              const Icon = typeof icon === 'string' ? ICONS[icon] || AlertCircle : icon
              return (
              <div key={id} className="p-4 rounded-2xl"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 opacity-60"
                    style={{ background: `${iconColor}15` }}>
                    <Icon size={18} style={{ color: iconColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{title}</p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{body}</p>
                    <p className="text-xs mt-1.5" style={{ color: 'var(--muted-foreground)' }}>{time}</p>
                  </div>
                </div>
              </div>
            )})}
          </div>
        </div>
      )}
    </div>
  )
}
