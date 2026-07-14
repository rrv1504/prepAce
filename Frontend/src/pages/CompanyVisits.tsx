import { useState } from 'react'
import { useAppContext, type CompanyVisit } from '../context/AppContext'
import { Check, X, Download, Calendar, Package, AlertCircle, CheckCircle2, Clock, Paperclip, ChevronDown, ChevronUp, BookOpen, HelpCircle, DollarSign, GitBranch, XCircle } from 'lucide-react'
import { companyVisitService } from '../lib/services'

// Current user (demo — in real app from auth context)
const CURRENT_USER = { branch: 'CSE', hasBacklogs: false, cgpa: 8.2 }

const STATUS_CONFIG = {
  pending: { label: 'Action Required', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
  accepted: { label: 'Applied', color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)' },
  rejected: { label: 'Not Interested', color: '#6b7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.2)' },
}

function checkEligibility(criteria: CompanyVisit['eligibility']) {
  const reasons: string[] = []
  if (!criteria.branches.includes(CURRENT_USER.branch))
    reasons.push(`Your branch (${CURRENT_USER.branch}) is not eligible`)
  if (criteria.noBacklogs && CURRENT_USER.hasBacklogs)
    reasons.push('You have active backlogs')
  if (CURRENT_USER.cgpa < criteria.minCGPA)
    reasons.push(`Your CGPA (${CURRENT_USER.cgpa}) is below minimum (${criteria.minCGPA})`)
  return { eligible: reasons.length === 0, reasons }
}

function EligibilityBadge({ criteria }: { criteria: CompanyVisit['eligibility'] }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-xs">
        <span className="w-4 h-4 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ background: '#10b981', fontSize: 9 }}>✓</span>
        <span style={{ color: 'var(--foreground)' }}>Min CGPA: <strong>{criteria.minCGPA}</strong></span>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: criteria.noBacklogs ? '#10b981' : '#ef4444', fontSize: 9 }}>
          {criteria.noBacklogs ? '✓' : '✕'}
        </span>
        <span style={{ color: 'var(--foreground)' }}>No active backlogs</span>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="w-4 h-4 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ background: '#10b981', fontSize: 9 }}>✓</span>
        <span style={{ color: 'var(--foreground)' }}>Branches: <strong>{criteria.branches.join(', ')}</strong></span>
      </div>
      {criteria.maxGap > 0 && (
        <div className="flex items-center gap-2 text-xs">
          <span className="w-4 h-4 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ background: '#6366f1', fontSize: 9 }}>i</span>
          <span style={{ color: 'var(--foreground)' }}>Max gap: {criteria.maxGap} year</span>
        </div>
      )}
      {criteria.otherCriteria.map((c, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="w-4 h-4 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ background: '#f59e0b', fontSize: 9 }}>!</span>
          <span style={{ color: 'var(--foreground)' }}>{c}</span>
        </div>
      ))}
    </div>
  )
}

function CompanyPrepSection({ visit }: { visit: CompanyVisit }) {
  const [tab, setTab] = useState<'process' | 'questions' | 'salary'>('process')
  if (!visit.interviewProcess?.length && !visit.pastQuestions?.length && !visit.salaryRange) {
    return (
      <div className="px-5 pb-5">
        <div className="text-center py-8 rounded-2xl" style={{ background: 'var(--muted)' }}>
          <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>Prep data will be added by admin soon</p>
        </div>
      </div>
    )
  }
  return (
    <div className="px-5 pb-5">
      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { id: 'process' as const, icon: GitBranch, label: 'Interview Process' },
          { id: 'questions' as const, icon: HelpCircle, label: 'Past Questions' },
          { id: 'salary' as const, icon: DollarSign, label: 'Salary & CTC' },
        ].map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: tab === id ? 'rgba(99,102,241,0.15)' : 'var(--muted)',
              color: tab === id ? 'var(--primary)' : 'var(--muted-foreground)',
              border: `1px solid ${tab === id ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`,
            }}>
            <Icon size={12} /> {label}
          </button>
        ))}
      </div>

      {tab === 'process' && (
        <div className="space-y-2">
          {(visit.interviewProcess ?? []).map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                style={{ background: 'var(--gradient-primary)' }}>{i + 1}</div>
              <div className="flex-1 px-3 py-2 rounded-xl text-sm" style={{ background: 'var(--muted)', color: 'var(--foreground)' }}>{step}</div>
              {i < (visit.interviewProcess?.length ?? 1) - 1 && (
                <div className="absolute" />
              )}
            </div>
          ))}
          {!visit.interviewProcess?.length && (
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No process data available yet.</p>
          )}
        </div>
      )}

      {tab === 'questions' && (
        <div className="space-y-2">
          {(visit.pastQuestions ?? []).map((q, i) => (
            <div key={i} className="flex items-start gap-3 px-3 py-2.5 rounded-xl text-sm"
              style={{ background: 'var(--muted)', color: 'var(--foreground)' }}>
              <span className="text-yellow-400 mt-0.5 flex-shrink-0">❓</span>
              <span>{q}</span>
            </div>
          ))}
          {!visit.pastQuestions?.length && (
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No past questions available yet.</p>
          )}
        </div>
      )}

      {tab === 'salary' && (
        <div className="space-y-3">
          {visit.salaryRange && (
            <div className="p-4 rounded-2xl" style={{ background: 'var(--muted)' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--muted-foreground)' }}>Expected CTC / Package</div>
              <div className="text-2xl font-black" style={{ color: '#22c55e' }}>{visit.salaryRange}</div>
            </div>
          )}
          {visit.rounds && (
            <div className="p-4 rounded-2xl" style={{ background: 'var(--muted)' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--muted-foreground)' }}>Total Interview Rounds</div>
              <div className="text-2xl font-black" style={{ color: 'var(--primary)' }}>{visit.rounds}</div>
            </div>
          )}
          <div className="p-3 rounded-xl text-xs" style={{ background: 'rgba(245,158,11,0.08)', color: '#f59e0b' }}>
            ⚠️ Salary data is indicative. Actual offer may vary based on performance.
          </div>
        </div>
      )}
    </div>
  )
}

function VisitCard({ visit, onAccept, onReject }: { visit: CompanyVisit; onAccept: () => void; onReject: (reason: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [showPrepSection, setShowPrepSection] = useState(false)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [reason, setReason] = useState('')
  const cfg = STATUS_CONFIG[visit.status]
  const { eligible, reasons } = checkEligibility(visit.eligibility)

  const daysLeft = Math.max(0, Math.ceil((new Date(visit.deadline).getTime() - Date.now()) / 86400000))

  return (
    <div className="rounded-2xl overflow-hidden transition-all" style={{ background: 'var(--card)', border: `1px solid ${cfg.border}` }}>
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
            style={{ background: 'var(--muted)' }}>
            {visit.logo}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h3 className="font-black text-lg">{visit.companyName}</h3>
                <p className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>{visit.role}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className="px-3 py-1 rounded-full text-xs font-bold flex-shrink-0"
                  style={{ background: cfg.bg, color: cfg.color }}>
                  {visit.status === 'pending' && <span className="mr-1">⏳</span>}
                  {visit.status === 'accepted' && <span className="mr-1">✓</span>}
                  {cfg.label}
                </span>
                {/* Eligibility badge */}
                {!eligible ? (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold"
                    style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
                    <XCircle size={11} /> Not Eligible
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold"
                    style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                    <CheckCircle2 size={11} /> Eligible
                  </span>
                )}
              </div>
            </div>

            {/* Ineligibility reasons */}
            {!eligible && (
              <div className="mt-2 space-y-1">
                {reasons.map((r, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg"
                    style={{ background: 'rgba(239,68,68,0.07)', color: '#ef4444' }}>
                    <XCircle size={11} className="flex-shrink-0" /> {r}
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 mt-2 flex-wrap text-xs" style={{ color: 'var(--muted-foreground)' }}>
              <span className="flex items-center gap-1"><Package size={12} /> {visit.package}</span>
              <span className="flex items-center gap-1"><Calendar size={12} /> Visit: {visit.date}</span>
              {visit.status === 'pending' && daysLeft <= 7 && (
                <span className="flex items-center gap-1 font-bold" style={{ color: daysLeft <= 2 ? '#ef4444' : '#f59e0b' }}>
                  <Clock size={12} /> {daysLeft === 0 ? 'Deadline today!' : `${daysLeft} days left`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick info pills */}
        <div className="flex gap-2 mt-3 flex-wrap">
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
            📅 Deadline: {visit.deadline}
          </span>
          {visit.attachmentName && (
            <a href={visit.attachmentUrl ?? '#'} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
              style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)' }}>
              <Paperclip size={11} /> {visit.attachmentName}
            </a>
          )}
        </div>

        {visit.adminNote && (
          <div className="mt-3 flex items-start gap-2 px-3 py-2 rounded-xl text-xs"
            style={{ background: 'rgba(99,102,241,0.08)', color: 'var(--primary)' }}>
            <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
            {visit.adminNote}
          </div>
        )}
      </div>

      {/* Expandable: JD + eligibility */}
      <button onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-3 text-xs font-semibold transition-all hover:opacity-80"
        style={{ borderTop: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
        <span>View details, eligibility &amp; JD</span>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-4" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>Job Description</h4>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>{visit.description}</p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>Eligibility Criteria</h4>
              <EligibilityBadge criteria={visit.eligibility} />
            </div>
          </div>

          {visit.attachmentName && (
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--muted)' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
                <Download size={16} style={{ color: '#ef4444' }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{visit.attachmentName}</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Job Description PDF</p>
              </div>
              <a href={visit.attachmentUrl ?? '#'} download className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                style={{ background: 'var(--primary)', color: 'white' }}>
                Download
              </a>
            </div>
          )}
        </div>
      )}

      {/* Company Prep Section (for accepted visits) */}
      {visit.status === 'accepted' && (
        <>
          <button onClick={() => setShowPrepSection(s => !s)}
            className="w-full flex items-center justify-between px-5 py-3 text-xs font-semibold transition-all hover:opacity-80"
            style={{ borderTop: '1px solid var(--border)', color: '#6366f1' }}>
            <span className="flex items-center gap-1.5"><BookOpen size={13} /> Interview Prep & Past Questions</span>
            {showPrepSection ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {showPrepSection && <CompanyPrepSection visit={visit} />}
        </>
      )}

      {/* Action area */}
      {visit.status === 'pending' && (
        <div className="px-5 pb-5">
          {!eligible ? (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <XCircle size={16} style={{ color: '#ef4444' }} />
              <span style={{ color: '#ef4444' }}>You are not eligible for this drive based on your profile.</span>
            </div>
          ) : !showRejectForm ? (
            <div className="flex gap-3">
              <button onClick={onAccept}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
                <Check size={16} /> Accept &amp; Register
              </button>
              <button onClick={() => setShowRejectForm(true)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                <X size={16} /> Not Interested
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Please provide a reason (helps admin track)</p>
              <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2}
                placeholder="e.g. Location not preferred, role mismatch, already placed..."
                className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                style={{ background: 'var(--muted)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--foreground)' }} />
              <div className="flex gap-2">
                <button onClick={() => onReject(reason)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ background: 'rgba(239,68,68,0.8)' }}>Confirm Rejection</button>
                <button onClick={() => setShowRejectForm(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}

      {visit.status === 'accepted' && !showPrepSection && (
        <div className="px-5 pb-5">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <CheckCircle2 size={16} style={{ color: '#10b981' }} />
            <span style={{ color: '#10b981' }}>You have registered for this drive. Best of luck! 🎉</span>
          </div>
        </div>
      )}

      {visit.status === 'rejected' && visit.userReason && (
        <div className="px-5 pb-5">
          <div className="px-3 py-2.5 rounded-xl text-sm" style={{ background: 'var(--muted)' }}>
            <span style={{ color: 'var(--muted-foreground)' }}>Your reason: </span>
            <span style={{ color: 'var(--foreground)' }}>{visit.userReason}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CompanyVisits() {
  const { companyVisits, setCompanyVisits } = useAppContext()
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all')

  async function respond(id: string, status: 'accepted' | 'rejected', reason?: string) {
    const saved = await companyVisitService.respond(id, status, reason) as any
    const normalizedResponses = (saved.responses || []).map((response: any) => ({
      userId: String(response.user?._id || response.user || response.userId || ''),
      userName: response.userName || 'You',
      status: response.status,
      reason: response.reason,
    }))

    setCompanyVisits(companyVisits.map(v =>
      v.id === id ? {
        ...v,
        ...saved,
        id: saved.id || saved._id || v.id,
        status,
        userReason: reason,
        responses: normalizedResponses.length ? normalizedResponses : v.responses,
        __synced: true,
      } : v
    ))
    window.dispatchEvent(new Event('prepace:company-visits-updated'))
  }

  function accept(id: string) {
    respond(id, 'accepted').catch(error => alert(error instanceof Error ? error.message : 'Failed to accept visit'))
  }

  function reject(id: string, reason: string) {
    respond(id, 'rejected', reason).catch(error => alert(error instanceof Error ? error.message : 'Failed to reject visit'))
  }

  const filtered = companyVisits.filter(v => filter === 'all' || v.status === filter)
  const pendingCount = companyVisits.filter(v => v.status === 'pending').length

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-black">Company Visit Invites</h1>
          {pendingCount > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black text-white" style={{ background: '#ef4444' }}>
              {pendingCount} pending
            </span>
          )}
        </div>
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Campus recruitment drives — your eligibility is checked automatically based on your branch and academic profile
        </p>
      </div>

      {/* User profile summary */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <span className="text-2xl">🎓</span>
        <div className="flex gap-4 flex-wrap text-xs" style={{ color: 'var(--muted-foreground)' }}>
          <span><strong style={{ color: 'var(--foreground)' }}>Branch:</strong> {CURRENT_USER.branch}</span>
          <span><strong style={{ color: 'var(--foreground)' }}>CGPA:</strong> {CURRENT_USER.cgpa}</span>
          <span><strong style={{ color: 'var(--foreground)' }}>Backlogs:</strong> {CURRENT_USER.hasBacklogs ? 'Yes' : 'None'}</span>
        </div>
        <p className="ml-auto text-xs" style={{ color: 'var(--muted-foreground)' }}>Eligibility auto-checked</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Invites', value: companyVisits.length, color: 'var(--primary)', icon: '📨' },
          { label: 'Registered', value: companyVisits.filter(v => v.status === 'accepted').length, color: '#10b981', icon: '✅' },
          { label: 'Pending', value: pendingCount, color: '#f59e0b', icon: '⏳' },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-2xl text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'pending', 'accepted', 'rejected'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all"
            style={{
              background: filter === f ? 'var(--gradient-primary)' : 'var(--muted)',
              color: filter === f ? 'white' : 'var(--muted-foreground)',
            }}>
            {f} {f !== 'all' && `(${companyVisits.filter(v => v.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Visit cards */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="text-center py-16" style={{ color: 'var(--muted-foreground)' }}>
            <div className="text-5xl mb-3">🏢</div>
            <p className="font-semibold">No {filter === 'all' ? '' : filter} invites yet</p>
            <p className="text-sm mt-1">Your placement cell will notify you about upcoming drives</p>
          </div>
        )}
        {filtered.map(v => (
          <VisitCard key={v.id} visit={v}
            onAccept={() => accept(v.id)}
            onReject={(reason) => reject(v.id, reason)} />
        ))}
      </div>
    </div>
  )
}
