import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Zap, ArrowRight, Star, ChevronDown, ChevronUp,
  Sun, Moon, Code2, Brain, BarChart3, Building2, Trophy,
  FileText, Calendar, Users, TrendingUp, Shield, Sparkles,
  Play, GitFork, Link2, ExternalLink
} from 'lucide-react'
import type { Theme } from '../App'

interface Props {
  theme: Theme
  toggleTheme: () => void
}

const features = [
  { icon: Code2, title: 'DSA Tracker', desc: 'LeetCode-style problem tracker with topic-wise progress, revision notes, and difficulty filters.' },
  { icon: Brain, title: 'Coding IDE', desc: 'Full online judge with Monaco editor, multi-language support, and AI code reviewer.' },
  { icon: Building2, title: 'Company Prep', desc: 'Detailed company profiles with hiring timelines, past questions, and preparation roadmaps.' },
  { icon: BarChart3, title: 'Analytics', desc: 'Deep insights into study patterns, accuracy trends, and placement readiness score.' },
  { icon: FileText, title: 'Resume Builder', desc: 'Drag-and-drop resume builder with ATS score, templates, and AI review.' },
  { icon: Sparkles, title: 'AI Features', desc: 'AI Study Planner, Interview Simulator, Doubt Solver, and Code Optimizer built in.' },
]

const stats = [
  { value: '2.4L+', label: 'Students Placed' },
  { value: '500+', label: 'Companies Listed' },
  { value: '15K+', label: 'DSA Problems' },
  { value: '98%', label: 'Satisfaction Rate' },
]

const testimonials = [
  {
    name: 'Priya Nair',
    role: 'SDE @ Google',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=48&h=48&fit=crop&auto=format',
    text: 'PrepAce completely transformed my interview preparation. The DSA tracker kept me disciplined and the coding IDE is just like LeetCode but better!'
  },
  {
    name: 'Rahul Gupta',
    role: 'SDE2 @ Amazon',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=48&h=48&fit=crop&auto=format',
    text: 'The company-specific preparation modules saved me weeks of research. I landed Amazon with 42 LPA — PrepAce was my secret weapon.'
  },
  {
    name: 'Sneha Reddy',
    role: 'Engineer @ Stripe',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=48&h=48&fit=crop&auto=format',
    text: 'The AI Interview Simulator is incredibly realistic. I practiced 30+ rounds before my actual interviews and felt completely prepared.'
  },
]

const faqs = [
  { q: 'Is PrepAce free to use?', a: 'Yes! The Free plan includes DSA tracker, 50 practice problems/month, and basic analytics. Premium unlocks unlimited problems, coding IDE, resume builder, and all AI features.' },
  { q: 'Which coding languages are supported?', a: 'Our IDE supports C, C++, Java, Python, and JavaScript with full syntax highlighting, autocomplete, and real-time execution.' },
  { q: 'How accurate is the AI Interview Simulator?', a: 'It uses real interview questions from our database of 10,000+ verified experiences. The AI evaluates your answers and gives detailed feedback.' },
  { q: 'Can I track company-specific preparation?', a: 'Absolutely. Each company profile shows the hiring process, past questions asked, preparation roadmap, and community experiences.' },
]

const companies = ['Google', 'Amazon', 'Microsoft', 'Flipkart', 'Uber', 'Adobe', 'Goldman Sachs', 'Atlassian']


export default function LandingPage({ theme, toggleTheme }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const isAdmin = sessionStorage.getItem('admin_auth') === 'true' && Boolean(localStorage.getItem('adminToken'))
  const isStudent = Boolean(localStorage.getItem('prepace_token'))
  const dashboardPath = isAdmin ? '/admin/dashboard' : '/app/dashboard'

  return (
    <div style={{ background: 'var(--background)', color: 'var(--foreground)', minHeight: '100vh' }}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center glow"
              style={{ background: 'var(--gradient-primary)' }}>
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg gradient-text">PrepAce</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 ml-8 text-sm" style={{ color: 'var(--muted-foreground)' }}>
            {['Features', 'Companies', 'Blog'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="transition-colors hover:opacity-80" style={{ color: 'var(--foreground)' }}>{item}</a>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-lg transition-all hover:opacity-80"
              style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            {isAdmin || isStudent ? (
              <Link to={dashboardPath} className="text-sm font-semibold px-4 py-2 rounded-lg text-white transition-all hover:opacity-90"
                style={{ background: 'var(--gradient-primary)' }}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/auth/login" className="text-sm font-medium px-4 py-2 rounded-lg transition-all hover:opacity-80"
                  style={{ color: 'var(--muted-foreground)' }}>
                  Login
                </Link>
                <Link to="/auth/register" className="text-sm font-semibold px-4 py-2 rounded-lg text-white transition-all hover:opacity-90"
                  style={{ background: 'var(--gradient-primary)' }}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
        {/* Glow orbs */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: 'var(--primary)' }} />
        <div className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full blur-3xl opacity-15"
          style={{ background: 'var(--accent)' }} />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', color: 'var(--primary)' }}>
            <Sparkles size={14} />
            AI-Powered Placement Preparation
          </div>

          <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-tight mb-6">
            Crack Your Dream{' '}
            <span className="gradient-text">Placement</span>
            <br />with PrepAce
          </h1>

          <p className="text-xl lg:text-2xl max-w-3xl mx-auto mb-10 leading-relaxed"
            style={{ color: 'var(--muted-foreground)' }}>
            The most complete placement prep platform — DSA tracking, coding IDE, company roadmaps,
            AI features, and real interview experiences. All in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to={isAdmin || isStudent ? dashboardPath : '/auth/register'}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-semibold text-lg glow transition-all hover:scale-105 hover:opacity-90"
              style={{ background: 'var(--gradient-primary)' }}>
              {isAdmin || isStudent ? 'Open Dashboard' : 'Start Free Today'} <ArrowRight size={20} />
            </Link>
            <Link to="/try-ide"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:opacity-80"
              style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
              <Play size={18} /> Try Coding IDE
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map(({ value, label }) => (
              <div key={label} className="glass p-4 rounded-xl">
                <div className="text-2xl font-black gradient-text">{value}</div>
                <div className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product preview */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 px-4 py-3" style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div className="flex-1 mx-4 h-6 rounded-md flex items-center justify-center text-xs"
                style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                app.prepace.io/dashboard
              </div>
            </div>
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop&auto=format"
              alt="PrepAce Dashboard Preview"
              className="w-full object-cover"
              style={{ height: '400px' }}
            />
          </div>
        </div>
      </section>

      {/* Companies */}
      <section id="companies" className="py-12 px-4 overflow-hidden" style={{ borderTop: '1px solid var(--border)' }}>
        <p className="text-center text-sm font-medium mb-8" style={{ color: 'var(--muted-foreground)' }}>
          PREPARATION RESOURCES FOR TOP COMPANIES
        </p>
        <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
          {companies.map(name => (
            <div key={name} className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 cursor-pointer"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
              {name}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-black mb-4">
              Everything You Need to{' '}
              <span className="gradient-text">Get Placed</span>
            </h2>
            <p className="text-lg" style={{ color: 'var(--muted-foreground)' }}>
              10+ integrated modules designed specifically for engineering placement preparation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:scale-110"
                  style={{ background: 'rgba(99,102,241,0.15)' }}>
                  <Icon size={20} style={{ color: 'var(--primary)' }} />
                </div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4" style={{ background: 'var(--card)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-black text-center mb-12">
            Students Who{' '}<span className="gradient-text">Made It</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, avatar, text }) => (
              <div key={name} className="p-6 rounded-2xl" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--muted-foreground)' }}>
                  "{text}"
                </p>
                <div className="flex items-center gap-3">
                  <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-sm">{name}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-10">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <div className="space-y-3">
            {faqs.map(({ q, a }, i) => (
              <div key={i} className="rounded-xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold text-sm"
                >
                  {q}
                  {openFaq === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                    {a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center p-12 rounded-3xl glow"
          style={{ background: 'var(--gradient-primary)' }}>
          <h2 className="text-3xl lg:text-5xl font-black text-white mb-4">
            Your Dream Company is Waiting
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Join 2.4 lakh+ students who cracked their placements with PrepAce.
          </p>
          <Link to="/auth/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white rounded-xl text-indigo-600 font-bold text-lg transition-all hover:scale-105">
            Start Preparing Now <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
                  <Zap size={14} className="text-white" />
                </div>
                <span className="font-bold gradient-text">PrepAce</span>
              </div>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                AI-powered placement preparation for engineering students.
              </p>
              <div className="flex gap-3 mt-4">
                {[GitFork, Link2, ExternalLink].map((Icon, i) => (
                  <button key={i} className="p-2 rounded-lg transition-all hover:opacity-80"
                    style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                    <Icon size={14} />
                  </button>
                ))}
              </div>
            </div>
            {[
              { title: 'Product', links: ['Dashboard', 'DSA Tracker', 'Coding IDE', 'Analytics'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Cookies', 'Security'] },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="font-semibold text-sm mb-4">{title}</h4>
                <ul className="space-y-2">
                  {links.map(link => (
                    <li key={link}>
                      <a href="#" className="text-sm transition-colors hover:text-white"
                        style={{ color: 'var(--muted-foreground)' }}>
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
            style={{ borderTop: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
            <p className="text-sm">© 2025 PrepAce. All rights reserved.</p>
            <p className="text-sm">Made with ❤️ for engineering students across India</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
