import { useAppContext } from '../../context/AppContext'
import { Users, Building2, Code2, ClipboardList, TrendingUp, Activity, Award, BookOpen } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const topicColors = ['#6366f1', '#8b5cf6', '#a78bfa', '#7c3aed', '#4338ca']

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any, label: string, value: string, sub: string, color: string }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid rgba(99,102,241,0.12)' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon size={18} style={{ color }} />
        </div>
        <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc' }}>{sub}</span>
      </div>
      <div className="text-2xl font-black mb-1" style={{ color: 'var(--foreground)' }}>{value}</div>
      <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{label}</div>
    </div>
  )
}

function ChartCard({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid rgba(99,102,241,0.12)' }}>
      <h3 className="font-bold text-sm mb-4" style={{ color: 'var(--foreground)' }}>{title}</h3>
      {children}
    </div>
  )
}

export default function AdminDashboardPage() {
  const { adminUsers, companyVisits, dsaProblems, aptitudeQuestions, badges, roadmaps, mockTestHistory, codeSubmissions } = useAppContext()
  const allSubmissions = Object.values(codeSubmissions).flat()
  const monthFmt = new Intl.DateTimeFormat('en-US', { month: 'short' })
  const userGrowth = Array.from({ length: 6 }, (_, offset) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (5 - offset))
    const month = monthFmt.format(date)
    const users = adminUsers.filter(user => {
      const joined = new Date((user as any).createdAt || user.joinedAt || Date.now())
      return joined <= new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)
    }).length
    return { month, users }
  })
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const dailyActivity = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - offset))
    const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date); dayEnd.setHours(23, 59, 59, 999)
    const inDay = (value?: string) => {
      const parsed = value ? new Date(value) : null
      return parsed && parsed >= dayStart && parsed <= dayEnd
    }
    return {
      day: dayLabels[date.getDay()],
      dsa: allSubmissions.filter(submission => inDay(submission.timestamp)).length,
      aptitude: aptitudeQuestions.reduce((sum, question) => sum + (question.attempts || 0), 0),
      mock: mockTestHistory.filter(attempt => inDay((attempt as any).createdAt || attempt.date)).length,
    }
  })
  const averageMockScore = mockTestHistory.length
    ? Math.round(mockTestHistory.reduce((sum, attempt) => sum + (attempt.percentage || 0), 0) / mockTestHistory.length)
    : 0
  const averageAptitudeRate = aptitudeQuestions.length
    ? Math.round(aptitudeQuestions.reduce((sum, question) => sum + (question.correctRate || 0), 0) / aptitudeQuestions.length)
    : 0
  const dsaTopics = Object.entries(dsaProblems.reduce<Record<string, number>>((acc, problem) => {
    acc[problem.topic || 'Other'] = (acc[problem.topic || 'Other'] || 0) + 1
    return acc
  }, {})).map(([name, count], index) => ({
    name,
    value: dsaProblems.length ? Math.round((count / dsaProblems.length) * 100) : 0,
    color: topicColors[index % topicColors.length],
  }))
  const companyBars = companyVisits.map(visit => ({ name: visit.companyName, views: visit.responses?.length || 0 }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black" style={{ color: 'var(--foreground)' }}>Admin Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Overview of PrepAce platform activity</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={adminUsers.length.toLocaleString()} sub="+12% this month" color="#6366f1" />
        <StatCard icon={Building2} label="Company Visits" value={companyVisits.length.toString()} sub="Active listings" color="#8b5cf6" />
        <StatCard icon={Code2} label="DSA Problems" value={dsaProblems.length.toString()} sub="In problem bank" color="#06b6d4" />
        <StatCard icon={ClipboardList} label="Aptitude Q's" value={aptitudeQuestions.length.toString()} sub="Across all topics" color="#f59e0b" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Activity} label="Submissions" value={allSubmissions.length.toString()} sub="Code judge" color="#10b981" />
        <StatCard icon={TrendingUp} label="Avg Score" value={`${Math.max(averageMockScore, averageAptitudeRate)}%`} sub="Tests" color="#ec4899" />
        <StatCard icon={Award} label="Badges" value={badges.length.toString()} sub="Defined" color="#f97316" />
        <StatCard icon={BookOpen} label="Roadmaps" value={roadmaps.length.toString()} sub="Published" color="#a78bfa" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="User Growth (Last 6 Months)">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={userGrowth}>
              <defs>
                <linearGradient id="ugGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--muted)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, fontSize: 12, color: 'var(--foreground)' }} />
              <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2} fill="url(#ugGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Daily Activity Breakdown">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyActivity} barSize={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--muted)" />
              <XAxis dataKey="day" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, fontSize: 12, color: 'var(--foreground)' }} />
              <Bar dataKey="dsa" fill="#6366f1" radius={[4, 4, 0, 0]} name="DSA" />
              <Bar dataKey="aptitude" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Aptitude" />
              <Bar dataKey="mock" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Mock" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Top Company Views">
          <div className="space-y-3 mt-2">
            {companyBars.map((c, i) => (
              <div key={c.name} className="flex items-center gap-3">
                <span className="text-xs w-5" style={{ color: 'var(--muted-foreground)' }}>{i + 1}</span>
                <span className="text-xs font-semibold w-24" style={{ color: 'var(--foreground)' }}>{c.name}</span>
                <div className="flex-1 h-2 rounded-full" style={{ background: 'var(--muted)' }}>
                  <div className="h-full rounded-full" style={{
                    width: `${(c.views / Math.max(...companyBars.map(company => company.views), 1)) * 100}%`,
                    background: 'linear-gradient(90deg,#6366f1,#8b5cf6)',
                  }} />
                </div>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{c.views}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="DSA Topics Solved">
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={160}>
              <PieChart>
                <Pie data={dsaTopics} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {dsaTopics.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {dsaTopics.map(t => (
                <div key={t.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: t.color }} />
                  <span className="text-xs" style={{ color: 'var(--foreground)' }}>{t.name}</span>
                  <span className="text-xs ml-auto" style={{ color: 'var(--muted-foreground)' }}>{t.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Recent users */}
      <ChartCard title="Recent Users">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ color: 'var(--muted-foreground)' }}>
                {['Name', 'College', 'Branch', 'Status', 'DSA', 'Joined'].map(h => (
                  <th key={h} className="text-left pb-3 pr-4 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {adminUsers.map(u => (
                <tr key={u.id}>
                  <td className="py-2.5 pr-4 font-semibold" style={{ color: 'var(--foreground)' }}>{u.name}</td>
                  <td className="py-2.5 pr-4" style={{ color: 'var(--muted-foreground)' }}>{u.college}</td>
                  <td className="py-2.5 pr-4" style={{ color: 'var(--muted-foreground)' }}>{u.branch}</td>
                  <td className="py-2.5 pr-4">
                    <span className="px-2 py-0.5 rounded-full font-semibold" style={{
                      background: u.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                      color: u.status === 'active' ? '#34d399' : '#f87171',
                    }}>{u.status}</span>
                  </td>
                  <td className="py-2.5 pr-4" style={{ color: 'var(--foreground)' }}>{u.dsaSolved}</td>
                  <td className="py-2.5" style={{ color: 'var(--muted-foreground)' }}>{u.joinedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  )
}
