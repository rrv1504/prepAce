import { useEffect, useState } from 'react'
import { Shield, Eye, EyeOff, AlertCircle, Zap } from 'lucide-react'
import { api } from '../lib/api'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') === 'true' && localStorage.getItem('adminToken')) {
      window.location.href = '/admin/dashboard'
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await api.post<{ token: string; user: any }>('/auth/login', { email, password })
      if (result.user?.role !== 'admin') {
        setError('Admin access required')
        return
      }
      localStorage.removeItem('prepace_token')
      localStorage.removeItem('prepace_user')
      localStorage.setItem('adminToken', result.token)
      localStorage.setItem('adminUser', JSON.stringify(result.user))
      sessionStorage.setItem('admin_auth', 'true')
      window.location.href = '/admin/dashboard'
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Invalid admin credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0b14' }}>
      {/* BG grid */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'linear-gradient(rgba(99,102,241,0.15) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.15) 1px,transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div className="relative w-full max-w-md mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
              <Zap size={20} className="text-white" />
            </div>
            <span className="font-black text-xl text-white">PrepAce</span>
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield size={18} style={{ color: '#a5b4fc' }} />
            <h1 className="text-xl font-bold text-white">Admin Portal</h1>
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Restricted access — authorized personnel only
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8" style={{
          background: 'rgba(13,15,26,0.9)',
          border: '1px solid rgba(99,102,241,0.2)',
          backdropFilter: 'blur(20px)',
        }}>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@prepace.com"
                required
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-opacity-30 outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  color: 'white',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.2)'}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    color: 'white',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.2)'}
                />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                  style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
            >
              {loading ? 'Authenticating...' : 'Sign In to Admin Portal'}
            </button>
          </form>

          <div className="mt-6 pt-4 text-center text-xs"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.3)' }}>
            Use the seeded admin account from Backend seed data.
          </div>
        </div>
      </div>
    </div>
  )
}
