import { useEffect, useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Code2, BookOpen, BarChart3, Building2,
  Calendar, MessageSquare, User, Bell,
  ChevronLeft, ChevronRight, Sun, Moon, Zap, Menu, X, LogOut,
  Trophy, Flame, ClipboardList, Briefcase, FolderOpen
} from 'lucide-react'
import type { Theme } from '../App'

const navItems = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/dsa', icon: Code2, label: 'DSA Tracker' },
  { to: '/app/aptitude', icon: BookOpen, label: 'Aptitude' },
  { to: '/app/companies', icon: Building2, label: 'Companies' },
  { to: '/app/visits', icon: Briefcase, label: 'Company Visits' },
  { to: '/app/resources', icon: FolderOpen, label: 'Resources' },
  { to: '/app/planner', icon: Calendar, label: 'Study Planner' },
  { to: '/app/interviews', icon: MessageSquare, label: 'Interviews' },
  { to: '/app/mocktest', icon: ClipboardList, label: 'Mock Tests' },
  { to: '/app/analytics', icon: BarChart3, label: 'Analytics' },
]

const bottomNav = [
  { to: '/app/notifications', icon: Bell, label: 'Notifications' },
  { to: '/app/profile', icon: User, label: 'Profile' },
]

interface Props { theme: Theme; toggleTheme: () => void }

export default function AppLayout({ theme, toggleTheme }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<any>(() => {
    try { return JSON.parse(localStorage.getItem('prepace_user') || 'null') } catch { return null }
  })
  const navigate = useNavigate()

  const sidebarW = collapsed ? 'w-16' : 'w-60'

  function handleSignOut() {
    localStorage.removeItem('prepace_token')
    localStorage.removeItem('prepace_user')
    sessionStorage.removeItem('admin_auth')
    navigate('/')
  }

  useEffect(() => {
    function refreshUser() {
      try { setUser(JSON.parse(localStorage.getItem('prepace_user') || 'null')) } catch { setUser(null) }
    }
    window.addEventListener('prepace:progress-updated', refreshUser)
    window.addEventListener('prepace:user-updated', refreshUser)
    window.addEventListener('storage', refreshUser)
    return () => {
      window.removeEventListener('prepace:progress-updated', refreshUser)
      window.removeEventListener('prepace:user-updated', refreshUser)
      window.removeEventListener('storage', refreshUser)
    }
  }, [])

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`fixed lg:relative z-50 flex flex-col h-full ${sidebarW} transition-all duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ background: 'var(--card)', borderRight: '1px solid var(--border)' }}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 glow"
            style={{ background: 'var(--gradient-primary)' }}>
            <Zap size={16} className="text-white" />
          </div>
          {!collapsed && <span className="font-bold text-lg tracking-tight gradient-text">PrepAce</span>}
          <button onClick={() => setMobileOpen(false)} className="ml-auto lg:hidden opacity-60 hover:opacity-100"><X size={18} /></button>
        </div>

        {/* User card */}
        {!collapsed && (
          <div className="mx-3 mt-3 p-3 rounded-xl" style={{ background: 'var(--muted)' }}>
            <div className="flex items-center gap-3">
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'PrepAce User')}&background=6366f1&color=fff`}
                className="w-9 h-9 rounded-full object-cover"
                style={{ outline: '2px solid var(--primary)', outlineOffset: '2px' }} alt={user?.name || 'User'} />
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{user?.name || 'Student'}</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{user?.year || 'Year'} • {user?.branch || 'Branch'}</p>
              </div>
              <div className="ml-auto flex items-center gap-1 text-orange-400">
                <Flame size={14} />
                <span className="text-xs font-bold">{user?.dsaStreak || 0}</span>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${isActive ? 'text-white' : 'hover:text-white'}`}
              style={({ isActive }) => ({
                background: isActive ? 'var(--gradient-primary)' : 'transparent',
                color: isActive ? 'white' : 'var(--muted-foreground)',
                boxShadow: isActive ? 'var(--glow-primary)' : 'none',
              })}>
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom nav */}
        <div className="px-2 pb-3 space-y-0.5 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
          {bottomNav.map(({ to, icon: Icon, label, badge }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative ${isActive ? 'text-white' : ''}`}
              style={({ isActive }) => ({
                background: isActive ? 'var(--gradient-primary)' : 'transparent',
                color: isActive ? 'white' : 'var(--muted-foreground)',
                boxShadow: isActive ? 'var(--glow-primary)' : 'none',
              })}>
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
              {badge && !collapsed && (
                <span className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: '#ef4444' }}>{badge}</span>
              )}
            </NavLink>
          ))}
          <button onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full transition-all duration-150 hover:opacity-80"
            style={{ color: 'var(--muted-foreground)' }}>
            <LogOut size={18} />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>

        <button onClick={() => setCollapsed(c => !c)}
          className="hidden lg:flex items-center justify-center w-full py-3 border-t transition-all hover:opacity-80"
          style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center gap-4 px-4 lg:px-6 h-14 flex-shrink-0"
          style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
          <button className="lg:hidden" onClick={() => setMobileOpen(true)}><Menu size={20} /></button>
          <div className="flex-1" />
          <div className="hidden md:flex items-center gap-2">
            <Trophy size={14} style={{ color: 'var(--accent)' }} />
            <div className="w-28 h-1.5 rounded-full" style={{ background: 'var(--muted)' }}>
              <div className="h-full w-3/5 rounded-full" style={{ background: 'var(--gradient-primary)' }} />
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>{user?.totalXP || 0} XP</span>
          </div>
          <button onClick={toggleTheme} className="p-2 rounded-lg transition-all hover:opacity-80"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <NavLink to="/app/notifications" className="relative p-2 rounded-lg transition-all hover:opacity-80"
            style={{ background: 'var(--muted)' }}>
            <Bell size={16} style={{ color: 'var(--muted-foreground)' }} />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500" />
          </NavLink>
          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'PrepAce User')}&background=6366f1&color=fff`}
            className="w-8 h-8 rounded-full object-cover cursor-pointer"
            style={{ outline: '2px solid var(--primary)', outlineOffset: '2px' }}
            alt="Profile" onClick={() => navigate('/app/profile')} />
        </header>
        <main className="flex-1 overflow-y-auto"><Outlet /></main>
      </div>
    </div>
  )
}
