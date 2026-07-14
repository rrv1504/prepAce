import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { TrendingUp, Target, Clock, Zap } from 'lucide-react'
import { useAppContext } from '../context/AppContext'

const baseWeeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8']
const fallbackTopics = [
  { topic: 'Arrays', score: 88 },
  { topic: 'Trees', score: 72 },
  { topic: 'Graphs', score: 55 },
  { topic: 'DP', score: 48 },
  { topic: 'Greedy', score: 70 },
  { topic: 'Binary Search', score: 90 },
  { topic: 'Strings', score: 82 },
]
const fallbackReadiness = [
  { name: 'Google', score: 68, color: '#4285f4' },
  { name: 'Amazon', score: 82, color: '#ff9900' },
  { name: 'Microsoft', score: 75, color: '#00a4ef' },
  { name: 'Flipkart', score: 88, color: '#f7c948' },
]
const colors = ['#4285f4', '#ff9900', '#00a4ef', '#f7c948', '#1a6eff']

function StatCard({ icon: Icon, label, value, trend, color }: {
  icon: typeof TrendingUp
  label: string
  value: string
  trend: string
  color: string
}) {
  return (
    <div className="p-5 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon size={16} style={{ color }} />
        </div>
        <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>{label}</span>
      </div>
      <div className="text-2xl font-black">{value}</div>
      <div className="text-xs mt-1" style={{ color: '#22c55e' }}>{trend}</div>
    </div>
  )
}

export default function Analytics() {
  const { dsaProblems, mockTestHistory, companyVisits, roadmaps, roadmapProgress, adminUsers } = useAppContext()
  const currentUser = adminUsers.find(user => user.status === 'active') || adminUsers[0]
  const solved = currentUser?.dsaSolved || 0
  const avgMock = mockTestHistory.length
    ? Math.round(mockTestHistory.reduce((sum, attempt) => sum + (attempt.percentage || 0), 0) / mockTestHistory.length)
    : currentUser?.aptitudeScore || 0

  const weeklyData = baseWeeks.map((week, index) => ({
    week,
    problems: Math.max(0, Math.round((solved / 8) * (0.65 + index * 0.07))),
    time: Math.max(1, Math.round((solved / 14 + index) * 10) / 10),
    accuracy: Math.min(100, Math.max(40, avgMock + index - 4)),
  }))

  const topicPerf = Object.entries(dsaProblems.reduce<Record<string, number>>((acc, problem) => {
    const topic = problem.topic || 'Other'
    acc[topic] = (acc[topic] || 0) + (problem.accepted || 1)
    return acc
  }, {})).slice(0, 7).map(([topic, value]) => ({
    topic,
    score: Math.min(95, Math.max(45, Math.round(value / Math.max(1, dsaProblems.length)))),
  }))
  const topics = topicPerf.length ? topicPerf : fallbackTopics

  const radarData = [
    { subject: 'DSA', A: Math.min(100, Math.round((solved / Math.max(dsaProblems.length, 1)) * 100)) },
    { subject: 'Aptitude', A: avgMock || 50 },
    { subject: 'Core CS', A: currentUser?.coursesCompleted ? Math.min(100, currentUser.coursesCompleted * 12) : 55 },
    { subject: 'System Design', A: roadmaps.length ? 60 + Math.min(25, roadmaps.length * 4) : 45 },
    { subject: 'Coding', A: currentUser?.dsaSolved ? Math.min(100, currentUser.dsaSolved) : 50 },
    { subject: 'Communication', A: mockTestHistory.length ? 70 : 55 },
  ]

  const companyReadiness = companyVisits.map((visit, index) => ({
    name: visit.companyName,
    score: Math.min(95, Math.max(45, avgMock + (roadmapProgress[index]?.completedTasks?.length || 0) * 6)),
    color: colors[index % colors.length],
  }))
  const readiness = companyReadiness.length ? companyReadiness : fallbackReadiness
  const readinessScore = readiness.length ? Math.round(readiness.reduce((sum, item) => sum + item.score, 0) / readiness.length) : 0
  const latestProblems = weeklyData.at(-1)?.problems || 0
  const studyHours = weeklyData.at(-1)?.time || 0

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black">Analytics</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
          Deep insights into your placement preparation journey
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Target} label="Placement Readiness" value={`${readinessScore}%`} trend="From roadmaps and tests" color="#6366f1" />
        <StatCard icon={TrendingUp} label="Weekly Problems" value={latestProblems.toString()} trend="Based on solved count" color="#8b5cf6" />
        <StatCard icon={Clock} label="Study Hours" value={`${studyHours}h`} trend="Estimated this week" color="#06b6d4" />
        <StatCard icon={Zap} label="Accuracy Rate" value={`${avgMock}%`} trend="From mock attempts" color="#22c55e" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <h2 className="font-bold text-base mb-4">Problems Solved (8 weeks)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="week" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--foreground)', fontSize: 12 }} />
              <Area type="monotone" dataKey="problems" stroke="#6366f1" strokeWidth={2} fill="url(#ag1)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="p-5 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <h2 className="font-bold text-base mb-4">Accuracy Trend (%)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="ag2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="week" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[60, 100]} hide />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--foreground)', fontSize: 12 }} />
              <Area type="monotone" dataKey="accuracy" stroke="#22c55e" strokeWidth={2} fill="url(#ag2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="p-5 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <h2 className="font-bold text-base mb-4">Topic Performance</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topics} barSize={28}>
              <XAxis dataKey="topic" tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} hide />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--foreground)', fontSize: 12 }} />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                {topics.map((entry, i) => (
                  <Cell key={i} fill={entry.score >= 80 ? '#22c55e' : entry.score >= 65 ? '#6366f1' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-5 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <h2 className="font-bold text-base mb-4">Skill Radar</h2>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(99,102,241,0.15)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
              <Radar name="Score" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-5 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <h2 className="font-bold text-base mb-5">Company Readiness Score</h2>
        <div className="space-y-4">
          {readiness.map(({ name, score, color }) => (
            <div key={name} className="flex items-center gap-4">
              <div className="w-24 text-sm font-semibold">{name}</div>
              <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, background: color }} />
              </div>
              <div className="w-10 text-sm font-bold text-right">{score}%</div>
              <div className="w-20 text-xs" style={{ color: score >= 80 ? '#22c55e' : score >= 65 ? '#f59e0b' : '#ef4444' }}>
                {score >= 80 ? 'Ready' : score >= 65 ? 'Almost' : 'Needs Work'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
