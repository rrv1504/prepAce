import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Users, Code2, Building2, TrendingUp, Shield, Bell, Search, MoreHorizontal } from 'lucide-react'

const monthlyUsers = [
  { month: 'Aug', users: 12400 },
  { month: 'Sep', users: 15800 },
  { month: 'Oct', users: 18200 },
  { month: 'Nov', users: 22100 },
  { month: 'Dec', users: 28400 },
  { month: 'Jan', users: 31200 },
  { month: 'Feb', users: 38900 },
]

const recentUsers = [
  { name: 'Arjun Sharma', college: 'NIT Trichy', plan: 'Premium', joined: 'Jan 10', status: 'Active', avatar: 'photo-1507003211169-0a1dd7228f2d' },
  { name: 'Priya Nair', college: 'BITS Pilani', plan: 'Free', joined: 'Jan 9', status: 'Active', avatar: 'photo-1494790108377-be9c29b29330' },
  { name: 'Karan Mehta', college: 'IIT Bombay', plan: 'Elite', joined: 'Jan 8', status: 'Active', avatar: 'photo-1500648767791-00dcc994a43e' },
  { name: 'Sneha Reddy', college: 'IIIT Hyderabad', plan: 'Premium', joined: 'Jan 7', status: 'Inactive', avatar: 'photo-1438761681033-6461ffad8d80' },
  { name: 'Rohan Das', college: 'VIT Vellore', plan: 'Free', joined: 'Jan 6', status: 'Active', avatar: 'photo-1472099645785-5658abf4ff4e' },
]

const planColors: Record<string, { color: string; bg: string }> = {
  Free: { color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
  Premium: { color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  Elite: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
}

function StatCard({ icon: Icon, label, value, delta, color }: {
  icon: typeof Users, label: string, value: string, delta: string, color: string
}) {
  return (
    <div className="p-5 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon size={18} style={{ color }} />
        </div>
        <span className="text-xs font-semibold" style={{ color: '#22c55e' }}>{delta}</span>
      </div>
      <div className="text-2xl font-black">{value}</div>
      <div className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>{label}</div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Shield size={20} style={{ color: 'var(--accent)' }} />
            <h1 className="text-2xl font-black">Admin Dashboard</h1>
          </div>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Platform overview and management
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <Bell size={14} /> Send Announcement
          </button>
          <button className="px-4 py-2 rounded-xl text-white text-sm font-semibold"
            style={{ background: 'var(--gradient-primary)' }}>
            + Add Question
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value="2,41,840" delta="+12.4%" color="#6366f1" />
        <StatCard icon={Code2} label="Problems Solved Today" value="38,420" delta="+8.2%" color="#8b5cf6" />
        <StatCard icon={Building2} label="Companies Listed" value="512" delta="+5" color="#06b6d4" />
        <StatCard icon={TrendingUp} label="Premium Users" value="18,240" delta="+22%" color="#22c55e" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <h2 className="font-bold text-base mb-4">Monthly User Growth</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyUsers}>
              <defs>
                <linearGradient id="ug" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--foreground)', fontSize: 12 }} />
              <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2} fill="url(#ug)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="p-5 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <h2 className="font-bold text-base mb-4">Plan Distribution</h2>
          <div className="space-y-4 pt-4">
            {[
              { plan: 'Free', count: '2,05,200', pct: 85, color: '#6b7280' },
              { plan: 'Premium', count: '28,500', pct: 12, color: '#6366f1' },
              { plan: 'Elite', count: '8,140', pct: 3, color: '#f59e0b' },
            ].map(({ plan, count, pct, color }) => (
              <div key={plan}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium">{plan}</span>
                  <span style={{ color: 'var(--muted-foreground)' }}>{count} ({pct}%)</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User management table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="font-bold text-lg">Recent Users</h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
            <input placeholder="Search users..." className="pl-9 pr-4 py-2 rounded-lg text-xs outline-none"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', width: 200 }} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                {['User', 'College', 'Plan', 'Joined', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentUsers.map(({ name, college, plan, joined, status, avatar }, i) => {
                const pc = planColors[plan]
                return (
                  <tr key={name} style={{ borderBottom: i < recentUsers.length - 1 ? '1px solid var(--border)' : 'none' }}
                    className="transition-all hover:opacity-80">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img src={`https://images.unsplash.com/${avatar}?w=32&h=32&fit=crop&auto=format`}
                          className="w-8 h-8 rounded-full object-cover" alt={name} />
                        <span className="font-medium text-sm">{name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--muted-foreground)' }}>{college}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ color: pc.color, background: pc.bg }}>
                        {plan}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--muted-foreground)' }}>{joined}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: status === 'Active' ? '#22c55e' : '#6b7280' }} />
                        <span className="text-xs font-medium">{status}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <button className="p-1.5 rounded-lg transition-all hover:opacity-70"
                        style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                        <MoreHorizontal size={14} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
