import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Building2, Code2, Brain, ClipboardList, Award, Trophy,
  BookOpen, Cpu, Users, FileText, LogOut, Zap, ChevronLeft, ChevronRight,
  Menu, X, Sun, Moon,
} from 'lucide-react'

const NAV = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'User Management' },
  { to: '/admin/companies', icon: Building2, label: 'Company Management' },
  { to: '/admin/dsa', icon: Code2, label: 'DSA Management' },
  { to: '/admin/aptitude', icon: Brain, label: 'Aptitude Questions' },
  { to: '/admin/mocktests', icon: ClipboardList, label: 'Mock Test Creator' },
  { to: '/admin/badges', icon: Award, label: 'Badge Management' },
  { to: '/admin/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { to: '/admin/roadmaps', icon: BookOpen, label: 'Study Roadmaps' },
  { to: '/admin/judge', icon: Cpu, label: 'Coding Judge' },
  { to: '/admin/resources', icon: FileText, label: 'Resources' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    (sessionStorage.getItem('admin_theme') as 'dark' | 'light') ?? 'dark'
  )

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    sessionStorage.setItem('admin_theme', next)
  }

  function handleLogout() {
    sessionStorage.removeItem('admin_auth')
    navigate('/admin')
  }

  return (
    <div className={theme} style={{ minHeight: '100vh' }}>
      <div className="flex h-screen overflow-hidden" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
        {/* Mobile overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setMobileOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed md:relative z-50 md:z-auto flex flex-col h-full flex-shrink-0 transition-all duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${collapsed ? 'w-16' : 'w-60'}
        `} style={{ background: 'var(--card)', borderRight: '1px solid var(--border)' }}>
          {/* Logo */}
          <div className="flex items-center gap-2 px-4 py-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
              <Zap size={14} className="text-white" />
            </div>
            {!collapsed && (
              <div>
                <div className="font-black text-sm leading-none" style={{ color: 'var(--foreground)' }}>PrepAce</div>
                <div className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>Admin Portal</div>
              </div>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
            {NAV.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${isActive ? '' : 'hover:opacity-80'}`
                }
                style={({ isActive }) => isActive
                  ? { background: 'rgba(99,102,241,0.15)', color: 'var(--primary)' }
                  : { color: 'var(--muted-foreground)' }
                }
              >
                <Icon size={16} className="flex-shrink-0" />
                {!collapsed && <span>{label}</span>}
              </NavLink>
            ))}
          </nav>

          {/* Footer: theme toggle, collapse, logout */}
          <div className="flex-shrink-0 px-2 pb-4 space-y-1" style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
            <button onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
              style={{ color: 'var(--muted-foreground)' }}>
              {theme === 'dark' ? <Sun size={16} className="flex-shrink-0" /> : <Moon size={16} className="flex-shrink-0" />}
              {!collapsed && (theme === 'dark' ? 'Light Mode' : 'Dark Mode')}
            </button>
            <button onClick={handleLogout}
              className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
              style={{ color: 'rgba(239,68,68,0.8)' }}>
              <LogOut size={16} className="flex-shrink-0" />
              {!collapsed && 'Sign Out'}
            </button>
            <button onClick={() => setCollapsed(c => !c)}
              className="hidden md:flex w-full items-center justify-center gap-2 px-2 py-2 rounded-xl text-xs transition-all hover:opacity-70"
              style={{ color: 'var(--muted-foreground)' }}>
              {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
              {!collapsed && 'Collapse'}
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar (mobile) */}
          <div className="md:hidden flex items-center gap-3 px-4 py-3 flex-shrink-0"
            style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
            <button onClick={() => setMobileOpen(o => !o)} style={{ color: 'var(--muted-foreground)' }}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>Admin Portal</span>
            <button onClick={toggleTheme} className="ml-auto" style={{ color: 'var(--muted-foreground)' }}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
