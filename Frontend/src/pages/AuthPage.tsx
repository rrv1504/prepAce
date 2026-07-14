import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Zap, Mail, Lock, User, Eye, EyeOff, ArrowRight, GitFork, Clock, CheckCircle2, Building2, BookOpen } from 'lucide-react'
import type { Theme } from '../App'
import { useAppContext } from '../context/AppContext'
import { api } from '../lib/api'

interface Props { theme: Theme }

export default function AuthPage({ theme }: Props) {
  const { mode = 'login' } = useParams()
  const navigate = useNavigate()
  const { addPendingRegistration } = useAppContext()

  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [registered, setRegistered] = useState(false)

  // Form fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [college, setCollege] = useState('')
  const [branch, setBranch] = useState('')
  const [year, setYear] = useState('')
  const [password, setPassword] = useState('')

  const isLogin = mode === 'login'
  const isForgot = mode === 'forgot'

  useEffect(() => {
    if (localStorage.getItem('prepace_token')) navigate('/app/dashboard', { replace: true })
    if (sessionStorage.getItem('admin_auth') === 'true' && localStorage.getItem('adminToken')) {
      navigate('/admin/dashboard', { replace: true })
    }
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        const result = await api.post<{ token: string; user: any }>('/auth/login', { email, password })
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
        sessionStorage.removeItem('admin_auth')
        localStorage.setItem('prepace_token', result.token)
        localStorage.setItem('prepace_user', JSON.stringify(result.user))
        window.location.href = '/app/dashboard'
      } else if (!isForgot) {
        await api.post('/auth/register', {
          name: name || 'New User',
          email,
          password,
          college: college || 'Not specified',
          branch: branch || 'Not specified',
          year: year || '1st',
        })
        const newId = `reg-${Date.now()}`
        addPendingRegistration({
          id: newId,
          name: name || 'New User',
          email,
          college: college || 'Not specified',
          branch: branch || 'Not specified',
          year: year || '1st',
          registeredAt: new Date().toISOString().split('T')[0],
        })
        setRegistered(true)
      } else {
        navigate('/auth/login')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all'
  const inputSt = { background: 'var(--secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }

  return (
    <div className={`${theme} min-h-screen flex`} style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Left illustration panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
        style={{ background: 'var(--gradient-primary)' }}>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }} />
        <Link to="/" className="flex items-center gap-2 relative">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold text-xl text-white">PrepAce</span>
        </Link>

        <div className="relative">
          <div className="text-5xl font-black text-white mb-4 leading-tight">
            Your Placement<br />Journey Starts Here
          </div>
          <p className="text-white/70 text-lg mb-8">
            Join 2.4 lakh+ students who cracked their dream company with PrepAce.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { v: '500+', l: 'Companies' },
              { v: '98%', l: 'Success Rate' },
              { v: '15K+', l: 'Problems' },
              { v: '42 LPA', l: 'Avg Package' },
            ].map(({ v, l }) => (
              <div key={l} className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                <div className="text-2xl font-black text-white">{v}</div>
                <div className="text-sm text-white/70">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 relative">
          <div className="flex -space-x-2">
            {['1507003211169-0a1dd7228f2d', '1494790108377-be9c29b29330', '1438761681033-6461ffad8d80'].map(id => (
              <img key={id}
                src={`https://images.unsplash.com/photo-${id}?w=32&h=32&fit=crop&auto=format`}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-white/30"
                alt="student"
              />
            ))}
          </div>
          <p className="text-white/80 text-sm">
            <strong>2,840+</strong> students joined this week
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center glow"
              style={{ background: 'var(--gradient-primary)' }}>
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg gradient-text">PrepAce</span>
          </div>

          {/* Registration Success */}
          {registered ? (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(99,102,241,0.12)', border: '2px solid rgba(99,102,241,0.3)' }}>
                <Clock size={32} style={{ color: 'var(--primary)' }} />
              </div>
              <h2 className="text-2xl font-black mb-2" style={{ color: 'var(--foreground)' }}>Account Under Review</h2>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                Your registration has been submitted! Our admin team will review and approve your account shortly.
                You'll be able to log in once approved.
              </p>
              <div className="p-4 rounded-xl mb-6 text-left space-y-2" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 size={14} style={{ color: '#22c55e' }} />
                  <span style={{ color: 'var(--foreground)' }}>Registration submitted</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={14} style={{ color: '#f59e0b' }} />
                  <span style={{ color: 'var(--muted-foreground)' }}>Awaiting admin approval (usually within 24 hrs)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap size={14} style={{ color: 'var(--muted-foreground)', opacity: 0.5 }} />
                  <span style={{ color: 'var(--muted-foreground)', opacity: 0.5 }}>Account activated — login enabled</span>
                </div>
              </div>
              <Link to="/auth/login"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90"
                style={{ background: 'var(--gradient-primary)' }}>
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-black mb-2">
                {isForgot ? 'Reset Password' : isLogin ? 'Welcome back 👋' : 'Create account'}
              </h1>
              <p className="text-sm mb-8" style={{ color: 'var(--muted-foreground)' }}>
                {isForgot
                  ? "Enter your email and we'll send a reset link."
                  : isLogin
                  ? 'Sign in to continue your preparation.'
                  : 'Register to start your placement journey. Admin approval required.'}
              </p>

              {/* Error message */}
              {error && (
                <div className="p-3 rounded-xl mb-4 flex items-start gap-2"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444' }}>
                  <Clock size={14} className="flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {!isForgot && (
                <button className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-medium text-sm mb-6 transition-all hover:opacity-80"
                  style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
                  <GitFork size={16} />
                  Continue with GitHub
                </button>
              )}

              {!isForgot && (
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>or</span>
                  <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && !isForgot && (
                  <>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Full Name</label>
                      <div className="relative">
                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
                        <input type="text" placeholder="Arjun Sharma" value={name} onChange={e => setName(e.target.value)}
                          required className={inputCls} style={inputSt} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">College</label>
                        <div className="relative">
                          <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
                          <input type="text" placeholder="IIT Delhi" value={college} onChange={e => setCollege(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all" style={inputSt} />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Branch</label>
                        <div className="relative">
                          <BookOpen size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
                          <input type="text" placeholder="CSE" value={branch} onChange={e => setBranch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all" style={inputSt} />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Year of Study</label>
                      <select value={year} onChange={e => setYear(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                        style={{ ...inputSt, colorScheme: 'inherit' }}>
                        <option value="">Select year</option>
                        {['1st', '2nd', '3rd', '4th'].map(y => <option key={y} value={y}>{y} Year</option>)}
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
                    <input type="email" placeholder="arjun@college.edu" value={email} onChange={e => setEmail(e.target.value)}
                      required className={inputCls} style={inputSt} />
                  </div>
                </div>

                {!isForgot && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm font-medium">Password</label>
                      {isLogin && (
                        <Link to="/auth/forgot" className="text-xs" style={{ color: 'var(--primary)' }}>
                          Forgot password?
                        </Link>
                      )}
                    </div>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
                      <input type={showPw ? 'text' : 'password'} placeholder="••••••••"
                        value={password} onChange={e => setPassword(e.target.value)}
                        required className="w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none transition-all" style={inputSt} />
                      <button type="button" onClick={() => setShowPw(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ color: 'var(--muted-foreground)' }}>
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                )}

                {!isLogin && !isForgot && (
                  <div className="p-3 rounded-xl flex items-start gap-2"
                    style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <Clock size={14} className="flex-shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
                    <p className="text-xs leading-relaxed" style={{ color: '#f59e0b' }}>
                      Account registration requires admin approval. You'll receive access within 24 hours after the admin reviews your request.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90 disabled:opacity-70 mt-2"
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {isForgot ? 'Send Reset Link' : isLogin ? 'Sign In' : 'Submit for Approval'}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-sm mt-6" style={{ color: 'var(--muted-foreground)' }}>
                {isLogin ? "Don't have an account? " : isForgot ? 'Remember it? ' : 'Already have an account? '}
                <Link
                  to={isLogin || isForgot ? '/auth/register' : '/auth/login'}
                  style={{ color: 'var(--primary)' }}
                  className="font-semibold"
                >
                  {isLogin || isForgot ? 'Sign up free' : 'Sign in'}
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
