import { useState, useRef } from 'react'
import { ChevronDown, ChevronUp, Download, Plus, Trash2, Eye, Edit3, ZoomIn, ZoomOut } from 'lucide-react'

const templates = [
  { id: 1, name: 'Indigo Edge', accent: '#4f46e5', sidebar: '#1e1b4b', style: 'indigo' },
  { id: 2, name: 'Slate Column', accent: '#0f172a', sidebar: '#0f172a', style: 'slate' },
  { id: 3, name: 'Clean ATS', accent: '#111827', sidebar: '#111827', style: 'ats' },
]

interface ResumeData {
  name: string
  role: string
  email: string
  phone: string
  linkedin: string
  github: string
  location: string
  summary: string
  education: { degree: string; institute: string; year: string; cgpa: string }[]
  experience: { title: string; company: string; duration: string; bullets: string[] }[]
  projects: { name: string; tech: string; desc: string }[]
  skills: { category: string; items: string }[]
  achievements: string[]
}

const defaultData: ResumeData = {
  name: 'Arjun Sharma',
  role: 'Software Engineer',
  email: 'arjun.sharma@nit.ac.in',
  phone: '+91 98765 43210',
  linkedin: 'linkedin.com/in/arjunsharma',
  github: 'github.com/arjun-sharma',
  location: 'Trichy, Tamil Nadu',
  summary: 'Final year CSE student at NIT Trichy with strong foundations in DSA and full-stack development. Targeting SDE roles at top product companies.',
  education: [
    { degree: 'B.Tech Computer Science and Engineering', institute: 'National Institute of Technology, Trichy', year: '2021 – 2025', cgpa: '8.7' },
  ],
  experience: [
    { title: 'Software Development Intern', company: 'Flipkart', duration: 'May 2024 – Jul 2024', bullets: [
      'Built a real-time inventory sync service handling 50K+ events/minute using Kafka.',
      'Reduced API response time by 40% by introducing Redis caching layer.',
    ]},
  ],
  projects: [
    { name: 'PrepAce – AI Placement Portal', tech: 'React, Node.js, PostgreSQL, OpenAI', desc: 'Built a full-stack placement prep platform with DSA tracker, coding IDE, and AI-powered features. Achieved 4.8/5 rating from 500+ beta users.' },
    { name: 'Distributed Cache System', tech: 'Java, Redis, Consistent Hashing', desc: 'Implemented a distributed caching system with consistent hashing, LRU eviction, and replication. Handled 10K+ QPS in load tests.' },
    { name: 'Real-Time Code Collaboration', tech: 'WebSockets, React, Node.js, Monaco', desc: 'Built a Google Docs-style collaborative coding editor supporting 100+ concurrent users with OT-based conflict resolution and syntax highlighting.' },
    { name: 'ML Pipeline Orchestrator', tech: 'Python, Apache Airflow, GCP, Docker', desc: 'Designed an end-to-end ML pipeline for training and serving models on GCP. Reduced model deployment time from 3 hours to 12 minutes.' },
  ],
  skills: [
    { category: 'Languages', items: 'Python, Java, C++, JavaScript, TypeScript, SQL' },
    { category: 'Frameworks', items: 'React, Node.js, Spring Boot, FastAPI, Express.js' },
    { category: 'Tools & Platforms', items: 'Git, Docker, Kubernetes, AWS, GCP, PostgreSQL, Redis, Kafka' },
    { category: 'CS Fundamentals', items: 'Data Structures, Algorithms, System Design, DBMS, OS, Networks' },
  ],
  achievements: [
    'Rank 847 in LeetCode Global Ranking (Top 5%) — 1200+ problems solved',
    'Winner – Smart India Hackathon 2024 (National Level, ₹1 Lakh prize)',
    'Google Summer of Code 2024 Contributor – Apache Beam (open-source)',
    'CodeChef 5★ rated (max rating 2134) — Top 0.3% globally',
    'Best Project Award – NIT Trichy Tech Fest 2023',
  ],
}

function calcATS(data: ResumeData): number {
  let score = 50
  if (data.summary.length > 50) score += 8
  if (data.skills.length >= 3) score += 10
  if (data.experience.length >= 1) score += 12
  if (data.projects.length >= 2) score += 10
  if (data.achievements.length >= 2) score += 5
  if (data.github) score += 2
  if (data.linkedin) score += 3
  return Math.min(score, 100)
}

// ── Preview components (template-aware) ───────────────────────────────────────

const PAGE_W = 680
const PAGE_H = 961 // A4 portrait at 680px width (680 × 297/210)

/* ── Template 1: Indigo Edge — two-column, tight spacing ── */
function IndigoPreview({ data }: { data: ResumeData }) {
  const accent = '#4f46e5'
  const dark = '#1e1b4b'
  const SH: React.CSSProperties = {
    fontSize: 7.5, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase',
    color: accent, marginBottom: 5, paddingBottom: 2, borderBottom: `1.5px solid ${accent}`,
  }
  return (
    <div style={{ fontFamily: 'Inter, Arial, sans-serif', color: '#1e1b4b', fontSize: 10,
      display: 'flex', width: PAGE_W, minHeight: PAGE_H }}>
      {/* Accent stripe */}
      <div style={{ width: 4, background: `linear-gradient(180deg,${accent},#818cf8)`, flexShrink: 0 }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header — compact */}
        <div style={{ background: dark, color: '#fff', padding: '14px 18px 12px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 3 }}>
            <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.5px', margin: 0 }}>{data.name}</h1>
            <span style={{ fontSize: 11, color: '#a5b4fc', fontWeight: 600 }}>{data.role}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: 14, rowGap: 2, fontSize: 8.5, color: 'rgba(255,255,255,0.68)' }}>
            <span>{data.email}</span><span>·</span><span>{data.phone}</span><span>·</span><span>{data.location}</span>
            {data.linkedin && <><span>·</span><span>{data.linkedin}</span></>}
            {data.github && <><span>·</span><span>{data.github}</span></>}
          </div>
        </div>

        {/* Body — flex:1 fills remaining height */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '195px 1fr', alignItems: 'stretch' }}>
          {/* Sidebar */}
          <div style={{ background: '#f5f3ff', padding: '14px 12px', borderRight: '1px solid #e0e7ff' }}>
            {data.summary && (
              <section style={{ marginBottom: 12 }}>
                <h2 style={SH}>Profile</h2>
                <p style={{ lineHeight: 1.5, color: '#374151', fontSize: 8.5 }}>{data.summary}</p>
              </section>
            )}
            <section style={{ marginBottom: 12 }}>
              <h2 style={SH}>Skills</h2>
              {data.skills.map((s, i) => (
                <p key={i} style={{ fontSize: 8.5, color: '#374151', lineHeight: 1.45, marginBottom: 4 }}>
                  <strong style={{ color: accent }}>{s.category}:</strong>{' '}{s.items.replace(/,\s*/g, ' • ')}
                </p>
              ))}
            </section>
            <section>
              <h2 style={SH}>Achievements</h2>
              {data.achievements.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 4, fontSize: 8.5, color: '#374151', marginBottom: 4, lineHeight: 1.45 }}>
                  <span style={{ color: accent, fontWeight: 900, flexShrink: 0 }}>›</span>{a}
                </div>
              ))}
            </section>
          </div>

          {/* Main */}
          <div style={{ padding: '14px 16px' }}>
            <section style={{ marginBottom: 12 }}>
              <h2 style={SH}>Education</h2>
              {data.education.map((e, i) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <strong style={{ fontSize: 10 }}>{e.institute}</strong>
                    <span style={{ fontSize: 8.5, color: '#6b7280', flexShrink: 0 }}>{e.year}</span>
                  </div>
                  <p style={{ fontSize: 8.5, color: '#4b5170', margin: '1px 0 0' }}>{e.degree} · CGPA {e.cgpa}</p>
                </div>
              ))}
            </section>

            {data.experience.length > 0 && (
              <section style={{ marginBottom: 12 }}>
                <h2 style={SH}>Experience</h2>
                {data.experience.map((exp, i) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <strong style={{ fontSize: 10 }}>{exp.title}</strong>
                      <span style={{ fontSize: 8.5, color: '#6b7280', flexShrink: 0 }}>{exp.duration}</span>
                    </div>
                    <p style={{ fontSize: 9, color: accent, fontWeight: 700, margin: '1px 0 3px' }}>{exp.company}</p>
                    {exp.bullets.map((b, j) => (
                      <div key={j} style={{ display: 'flex', gap: 4, fontSize: 8.5, color: '#374151', marginBottom: 2, lineHeight: 1.45 }}>
                        <span style={{ color: accent, flexShrink: 0 }}>›</span>{b}
                      </div>
                    ))}
                  </div>
                ))}
              </section>
            )}

            <section>
              <h2 style={SH}>Projects</h2>
              {data.projects.map((p, i) => (
                <div key={i} style={{ marginBottom: 7 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 1 }}>
                    <strong style={{ fontSize: 10 }}>{p.name}</strong>
                    <span style={{ fontSize: 7.5, color: accent, background: '#ede9fe',
                      padding: '1px 6px', borderRadius: 3, flexShrink: 0, maxWidth: 220, textAlign: 'right' }}>{p.tech}</span>
                  </div>
                  <p style={{ fontSize: 8.5, color: '#374151', lineHeight: 1.45, margin: 0 }}>{p.desc}</p>
                </div>
              ))}
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Template 2: Slate Column — dark sidebar, tight spacing ── */
function SlatePreview({ data }: { data: ResumeData }) {
  const sideBg = '#0f172a'
  const accent = '#38bdf8'
  const SH: React.CSSProperties = { fontSize: 7.5, fontWeight: 800, letterSpacing: '0.14em',
    textTransform: 'uppercase', color: accent, borderBottom: '1px solid rgba(56,189,248,0.2)',
    paddingBottom: 2, marginBottom: 6 }
  const MH: React.CSSProperties = { fontSize: 7.5, fontWeight: 800, letterSpacing: '0.12em',
    textTransform: 'uppercase', color: '#0f172a', borderBottom: '1.5px solid #0f172a',
    paddingBottom: 2, marginBottom: 6 }
  return (
    <div style={{ fontFamily: 'Inter, Arial, sans-serif', fontSize: 10,
      display: 'flex', width: PAGE_W, minHeight: PAGE_H }}>
      {/* Dark sidebar */}
      <div style={{ width: 188, background: sideBg, color: '#e2e8f0',
        padding: '16px 12px', flexShrink: 0, boxSizing: 'border-box' }}>
        {/* Contact block */}
        <div style={{ marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h1 style={{ fontSize: 16, fontWeight: 900, color: '#fff', lineHeight: 1.15, margin: '0 0 3px' }}>{data.name}</h1>
          <p style={{ fontSize: 9, color: accent, fontWeight: 600, margin: '0 0 8px' }}>{data.role}</p>
          <div style={{ fontSize: 7.5, color: 'rgba(226,232,240,0.6)', lineHeight: 1.8 }}>
            <div>{data.email}</div><div>{data.phone}</div><div>{data.location}</div>
            {data.linkedin && <div>{data.linkedin}</div>}
            {data.github && <div>{data.github}</div>}
          </div>
        </div>

        {data.summary && (
          <section style={{ marginBottom: 12 }}>
            <h2 style={SH}>About</h2>
            <p style={{ fontSize: 8, color: 'rgba(226,232,240,0.75)', lineHeight: 1.5 }}>{data.summary}</p>
          </section>
        )}

        <section style={{ marginBottom: 12 }}>
          <h2 style={SH}>Skills</h2>
          {data.skills.map((s, i) => (
            <p key={i} style={{ fontSize: 7.5, color: 'rgba(226,232,240,0.7)', lineHeight: 1.45, marginBottom: 5 }}>
              <span style={{ color: accent, fontWeight: 700 }}>{s.category}:</span>{' '}{s.items.replace(/,\s*/g, ' • ')}
            </p>
          ))}
        </section>

        <section>
          <h2 style={SH}>Achievements</h2>
          {data.achievements.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 4, fontSize: 7.5,
              color: 'rgba(226,232,240,0.7)', marginBottom: 4, lineHeight: 1.45 }}>
              <span style={{ color: accent, flexShrink: 0 }}>▸</span>{a}
            </div>
          ))}
        </section>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: '16px 16px', color: '#1e293b' }}>
        <section style={{ marginBottom: 12 }}>
          <h2 style={MH}>Education</h2>
          {data.education.map((e, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: 10 }}>{e.institute}</strong>
                <span style={{ fontSize: 8.5, color: '#64748b', flexShrink: 0 }}>{e.year}</span>
              </div>
              <p style={{ fontSize: 8.5, color: '#475569', margin: '1px 0 0' }}>{e.degree} · CGPA {e.cgpa}</p>
            </div>
          ))}
        </section>

        {data.experience.length > 0 && (
          <section style={{ marginBottom: 12 }}>
            <h2 style={MH}>Experience</h2>
            {data.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ fontSize: 10 }}>{exp.title}</strong>
                  <span style={{ fontSize: 8.5, color: '#64748b', flexShrink: 0 }}>{exp.duration}</span>
                </div>
                <p style={{ fontSize: 9, color: '#0ea5e9', fontWeight: 700, margin: '1px 0 3px' }}>{exp.company}</p>
                {exp.bullets.map((b, j) => (
                  <div key={j} style={{ display: 'flex', gap: 4, fontSize: 8.5, color: '#475569', marginBottom: 2, lineHeight: 1.45 }}>
                    <span style={{ flexShrink: 0 }}>•</span>{b}
                  </div>
                ))}
              </div>
            ))}
          </section>
        )}

        <section>
          <h2 style={MH}>Projects</h2>
          {data.projects.map((p, i) => (
            <div key={i} style={{ marginBottom: 7 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                <strong style={{ fontSize: 10 }}>{p.name}</strong>
                <span style={{ fontSize: 8, color: '#64748b', flexShrink: 0, textAlign: 'right' }}>{p.tech}</span>
              </div>
              <p style={{ fontSize: 8.5, color: '#475569', margin: '1px 0 0', lineHeight: 1.45 }}>{p.desc}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}

/* ── Template 3: Clean ATS — single column, maximally ATS-friendly ── */
function ATSPreview({ data }: { data: ResumeData }) {
  const Rule = ({ title }: { title: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
      <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: '#111827', whiteSpace: 'nowrap' }}>{title}</span>
      <div style={{ flex: 1, height: 1.5, background: '#9ca3af' }} />
    </div>
  )
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#111827', fontSize: 10,
      padding: '22px 28px', width: PAGE_W, minHeight: PAGE_H, boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ marginBottom: 12, paddingBottom: 10, borderBottom: '2px solid #111827' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.3px', margin: 0 }}>{data.name}</h1>
          <span style={{ fontSize: 11, color: '#374151', fontWeight: 600 }}>{data.role}</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: 8, rowGap: 1, fontSize: 9, color: '#6b7280' }}>
          <span>{data.email}</span><span>|</span><span>{data.phone}</span><span>|</span><span>{data.location}</span>
          {data.linkedin && <><span>|</span><span>{data.linkedin}</span></>}
          {data.github && <><span>|</span><span>{data.github}</span></>}
        </div>
      </div>

      {data.summary && (
        <section style={{ marginBottom: 11 }}>
          <Rule title="Summary" />
          <p style={{ lineHeight: 1.55, color: '#374151', fontSize: 9.5 }}>{data.summary}</p>
        </section>
      )}

      <section style={{ marginBottom: 11 }}>
        <Rule title="Education" />
        {data.education.map((e, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: 10 }}>{e.degree}</span>
              <span style={{ fontSize: 9, color: '#4b5563', marginLeft: 6 }}>{e.institute} · CGPA {e.cgpa}</span>
            </div>
            <div style={{ fontSize: 9, color: '#6b7280', flexShrink: 0 }}>{e.year}</div>
          </div>
        ))}
      </section>

      <section style={{ marginBottom: 11 }}>
        <Rule title="Technical Skills" />
        {data.skills.map((s, i) => (
          <div key={i} style={{ fontSize: 9.5, marginBottom: 3, lineHeight: 1.5 }}>
            <strong>{s.category}:</strong>{' '}
            <span style={{ color: '#374151' }}>{s.items.replace(/,\s*/g, ' • ')}</span>
          </div>
        ))}
      </section>

      {data.experience.length > 0 && (
        <section style={{ marginBottom: 11 }}>
          <Rule title="Experience" />
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: 10 }}>{exp.title}</strong>
                <span style={{ fontSize: 9, color: '#6b7280', flexShrink: 0 }}>{exp.duration}</span>
              </div>
              <p style={{ fontSize: 9, color: '#374151', fontWeight: 700, margin: '1px 0 3px' }}>{exp.company}</p>
              {exp.bullets.map((b, j) => (
                <div key={j} style={{ display: 'flex', gap: 5, fontSize: 9.5, color: '#374151', marginTop: 2, lineHeight: 1.45 }}>
                  <span style={{ flexShrink: 0 }}>•</span>{b}
                </div>
              ))}
            </div>
          ))}
        </section>
      )}

      <section style={{ marginBottom: 11 }}>
        <Rule title="Projects" />
        {data.projects.map((p, i) => (
          <div key={i} style={{ marginBottom: 7 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <strong style={{ fontSize: 10 }}>{p.name}</strong>
              <span style={{ fontSize: 8.5, color: '#6b7280' }}>{p.tech}</span>
            </div>
            <p style={{ fontSize: 9.5, color: '#374151', margin: '1px 0 0', lineHeight: 1.45 }}>{p.desc}</p>
          </div>
        ))}
      </section>

      <section>
        <Rule title="Achievements" />
        {data.achievements.map((a, i) => (
          <div key={i} style={{ display: 'flex', gap: 5, fontSize: 9.5, color: '#374151', marginBottom: 3, lineHeight: 1.45 }}>
            <span style={{ flexShrink: 0 }}>•</span>{a}
          </div>
        ))}
      </section>
    </div>
  )
}

function ResumePreview({ data, templateId }: { data: ResumeData; templateId: number }) {
  const tmpl = templates.find(t => t.id === templateId) ?? templates[0]
  if (tmpl.style === 'slate') return <SlatePreview data={data} />
  if (tmpl.style === 'ats') return <ATSPreview data={data} />
  return <IndigoPreview data={data} />
}

// ── Resume Builder Main ───────────────────────────────────────────────────────

const SECTIONS = ['Personal Info', 'Summary', 'Education', 'Experience', 'Projects', 'Skills', 'Achievements']

export default function ResumeBuilder() {
  const [data, setData] = useState<ResumeData>(defaultData)
  const [activeTemplate, setActiveTemplate] = useState(1)
  const [activeSection, setActiveSection] = useState<string | null>('Personal Info')
  const [zoom, setZoom] = useState(0.85)
  const previewRef = useRef<HTMLDivElement>(null)
  const ZOOM_STEPS = [0.6, 0.75, 0.85, 1.0, 1.15]

  const atsScore = calcATS(data)

  const handleDownload = () => {
    const el = previewRef.current
    if (!el) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${data.name} – Resume</title>
          <meta charset="utf-8" />
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Inter, Arial, sans-serif; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>${el.innerHTML}</body>
      </html>
    `)
    printWindow.document.close()
    setTimeout(() => { printWindow.print() }, 400)
  }

  const update = (key: keyof ResumeData, value: unknown) => setData(d => ({ ...d, [key]: value }))
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit')

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Mobile tab switcher */}
      <div className="flex md:hidden gap-2 p-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)', background: 'var(--card)' }}>
        <button onClick={() => setMobileTab('edit')}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-all"
          style={{ background: mobileTab === 'edit' ? 'var(--primary)' : 'var(--muted)', color: mobileTab === 'edit' ? 'white' : 'var(--muted-foreground)' }}>
          <Edit3 size={14} /> Edit
        </button>
        <button onClick={() => setMobileTab('preview')}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-all"
          style={{ background: mobileTab === 'preview' ? 'var(--primary)' : 'var(--muted)', color: mobileTab === 'preview' ? 'white' : 'var(--muted-foreground)' }}>
          <Eye size={14} /> Preview
        </button>
      </div>
    <div className="flex flex-1 overflow-hidden">
      {/* Editor panel */}
      <div className={`${mobileTab === 'preview' ? 'hidden md:flex' : 'flex'} md:flex w-full md:w-80 flex-shrink-0 flex-col overflow-hidden`}
        style={{ borderRight: '1px solid var(--border)', background: 'var(--card)' }}>
        {/* ATS Score */}
        <div className="p-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">ATS Score</span>
            <span className="text-xl font-black" style={{ color: atsScore >= 80 ? '#22c55e' : '#f59e0b' }}>
              {atsScore}%
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${atsScore}%`, background: atsScore >= 80 ? '#22c55e' : '#f59e0b' }} />
          </div>
          <p className="text-xs mt-1.5" style={{ color: 'var(--muted-foreground)' }}>
            {atsScore >= 85 ? '✅ Excellent — ATS-friendly' : '⚠️ Add more content to improve'}
          </p>
        </div>

        {/* Templates */}
        <div className="p-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--muted-foreground)' }}>Template</p>
          <div className="flex gap-2">
            {templates.map(t => (
              <button key={t.id} onClick={() => setActiveTemplate(t.id)}
                className="flex-1 p-3 rounded-xl text-center text-xs transition-all"
                style={{
                  background: activeTemplate === t.id ? 'rgba(99,102,241,0.15)' : 'var(--muted)',
                  border: `1px solid ${activeTemplate === t.id ? 'var(--primary)' : 'var(--border)'}`,
                  color: activeTemplate === t.id ? 'var(--primary)' : 'var(--muted-foreground)',
                }}>
                <div className="w-full h-6 rounded mb-1.5" style={{ background: t.sidebar }} />
                <p className="font-semibold leading-tight">{t.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {SECTIONS.map(section => (
            <div key={section} className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <button onClick={() => setActiveSection(activeSection === section ? null : section)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-left"
                style={{ background: activeSection === section ? 'rgba(99,102,241,0.1)' : 'var(--muted)', color: 'var(--foreground)' }}>
                {section}
                {activeSection === section ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {activeSection === section && (
                <div className="p-3 space-y-2.5" style={{ background: 'var(--muted)', borderTop: '1px solid var(--border)' }}>
                  {section === 'Personal Info' && (
                    <>
                      {[
                        ['Full Name', 'name'], ['Role/Title', 'role'], ['Email', 'email'],
                        ['Phone', 'phone'], ['LinkedIn', 'linkedin'], ['GitHub', 'github'], ['Location', 'location'],
                      ].map(([label, key]) => (
                        <div key={key}>
                          <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--muted-foreground)' }}>{label}</label>
                          <input
                            value={(data as unknown as Record<string, string>)[key] ?? ''}
                            onChange={e => update(key as keyof ResumeData, e.target.value)}
                            className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                            style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                          />
                        </div>
                      ))}
                    </>
                  )}

                  {section === 'Summary' && (
                    <div>
                      <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--muted-foreground)' }}>Professional Summary</label>
                      <textarea
                        value={data.summary}
                        onChange={e => update('summary', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 rounded-lg text-xs outline-none resize-none"
                        style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                      />
                    </div>
                  )}

                  {section === 'Education' && data.education.map((edu, i) => (
                    <div key={i} className="space-y-2 p-2 rounded-lg" style={{ background: 'var(--card)' }}>
                      {[['Degree', 'degree'], ['Institute', 'institute'], ['Year', 'year'], ['CGPA', 'cgpa']].map(([label, field]) => (
                        <div key={field}>
                          <label className="text-xs font-medium mb-0.5 block" style={{ color: 'var(--muted-foreground)' }}>{label}</label>
                          <input
                            value={(edu as Record<string, string>)[field]}
                            onChange={e => {
                              const updated = [...data.education]
                              updated[i] = { ...updated[i], [field]: e.target.value }
                              update('education', updated)
                            }}
                            className="w-full px-2 py-1.5 rounded-md text-xs outline-none"
                            style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                          />
                        </div>
                      ))}
                    </div>
                  ))}

                  {section === 'Skills' && data.skills.map((s, i) => (
                    <div key={i} className="space-y-1.5 p-2 rounded-lg" style={{ background: 'var(--card)' }}>
                      {[['Category', 'category'], ['Items (comma separated)', 'items']].map(([label, field]) => (
                        <div key={field}>
                          <label className="text-xs font-medium mb-0.5 block" style={{ color: 'var(--muted-foreground)' }}>{label}</label>
                          <input
                            value={(s as Record<string, string>)[field]}
                            onChange={e => {
                              const updated = [...data.skills]
                              updated[i] = { ...updated[i], [field]: e.target.value }
                              update('skills', updated)
                            }}
                            className="w-full px-2 py-1.5 rounded-md text-xs outline-none"
                            style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                          />
                        </div>
                      ))}
                    </div>
                  ))}

                  {section === 'Achievements' && (
                    <div className="space-y-2">
                      {data.achievements.map((a, i) => (
                        <div key={i} className="flex gap-2">
                          <input value={a}
                            onChange={e => {
                              const updated = [...data.achievements]
                              updated[i] = e.target.value
                              update('achievements', updated)
                            }}
                            className="flex-1 px-2 py-1.5 rounded-md text-xs outline-none"
                            style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                          />
                          <button onClick={() => update('achievements', data.achievements.filter((_, j) => j !== i))}
                            className="p-1 rounded transition-all hover:opacity-70" style={{ color: '#ef4444' }}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                      <button onClick={() => update('achievements', [...data.achievements, 'New achievement'])}
                        className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--primary)' }}>
                        <Plus size={12} /> Add Achievement
                      </button>
                    </div>
                  )}

                  {section === 'Experience' && (
                    <div className="space-y-3">
                      {data.experience.map((exp, i) => (
                        <div key={i} className="p-3 rounded-xl space-y-2" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>Experience {i + 1}</span>
                            <button onClick={() => update('experience', data.experience.filter((_, j) => j !== i))}
                              className="transition-all hover:opacity-70" style={{ color: '#ef4444' }}>
                              <Trash2 size={12} />
                            </button>
                          </div>
                          {[['Job Title', 'title'], ['Company', 'company'], ['Duration', 'duration']].map(([label, field]) => (
                            <div key={field}>
                              <label className="text-xs mb-0.5 block" style={{ color: 'var(--muted-foreground)' }}>{label}</label>
                              <input
                                value={(exp as unknown as Record<string, string>)[field]}
                                onChange={e => {
                                  const updated = [...data.experience]
                                  updated[i] = { ...updated[i], [field]: e.target.value }
                                  update('experience', updated)
                                }}
                                className="w-full px-2 py-1.5 rounded-md text-xs outline-none"
                                style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                              />
                            </div>
                          ))}
                          <div>
                            <label className="text-xs mb-1 block" style={{ color: 'var(--muted-foreground)' }}>Bullet Points</label>
                            {exp.bullets.map((b, bi) => (
                              <div key={bi} className="flex gap-1.5 mb-1.5">
                                <input value={b}
                                  onChange={e => {
                                    const updated = [...data.experience]
                                    const bullets = [...updated[i].bullets]
                                    bullets[bi] = e.target.value
                                    updated[i] = { ...updated[i], bullets }
                                    update('experience', updated)
                                  }}
                                  className="flex-1 px-2 py-1 rounded-md text-xs outline-none"
                                  style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                                />
                                <button onClick={() => {
                                  const updated = [...data.experience]
                                  updated[i] = { ...updated[i], bullets: exp.bullets.filter((_, j) => j !== bi) }
                                  update('experience', updated)
                                }} style={{ color: '#ef4444' }}>
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            ))}
                            <button onClick={() => {
                              const updated = [...data.experience]
                              updated[i] = { ...updated[i], bullets: [...exp.bullets, 'New bullet point'] }
                              update('experience', updated)
                            }} className="flex items-center gap-1 text-xs font-medium mt-1" style={{ color: 'var(--primary)' }}>
                              <Plus size={10} /> Add Bullet
                            </button>
                          </div>
                        </div>
                      ))}
                      <button onClick={() => update('experience', [...data.experience, { title: 'Role', company: 'Company', duration: 'Jan 2024 – Present', bullets: ['Describe your work here'] }])}
                        className="flex items-center gap-1 text-xs font-medium w-full justify-center py-2 rounded-lg transition-all hover:opacity-80"
                        style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', border: '1px dashed rgba(99,102,241,0.3)' }}>
                        <Plus size={12} /> Add Experience
                      </button>
                    </div>
                  )}

                  {section === 'Projects' && (
                    <div className="space-y-3">
                      {data.projects.map((proj, i) => (
                        <div key={i} className="p-3 rounded-xl space-y-2" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>Project {i + 1}</span>
                            <button onClick={() => update('projects', data.projects.filter((_, j) => j !== i))}
                              className="transition-all hover:opacity-70" style={{ color: '#ef4444' }}>
                              <Trash2 size={12} />
                            </button>
                          </div>
                          {[['Project Name', 'name'], ['Tech Stack', 'tech'], ['Description', 'desc']].map(([label, field]) => (
                            <div key={field}>
                              <label className="text-xs mb-0.5 block" style={{ color: 'var(--muted-foreground)' }}>{label}</label>
                              {field === 'desc' ? (
                                <textarea value={(proj as Record<string, string>)[field]} rows={2}
                                  onChange={e => {
                                    const updated = [...data.projects]
                                    updated[i] = { ...updated[i], [field]: e.target.value }
                                    update('projects', updated)
                                  }}
                                  className="w-full px-2 py-1.5 rounded-md text-xs outline-none resize-none"
                                  style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                                />
                              ) : (
                                <input value={(proj as Record<string, string>)[field]}
                                  onChange={e => {
                                    const updated = [...data.projects]
                                    updated[i] = { ...updated[i], [field]: e.target.value }
                                    update('projects', updated)
                                  }}
                                  className="w-full px-2 py-1.5 rounded-md text-xs outline-none"
                                  style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                      <button onClick={() => update('projects', [...data.projects, { name: 'New Project', tech: 'React, Node.js', desc: 'Project description here.' }])}
                        className="flex items-center gap-1 text-xs font-medium w-full justify-center py-2 rounded-lg transition-all hover:opacity-80"
                        style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', border: '1px dashed rgba(99,102,241,0.3)' }}>
                        <Plus size={12} /> Add Project
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Download */}
        <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90"
            style={{ background: 'var(--gradient-primary)' }}>
            <Download size={14} /> Download / Print PDF
          </button>
        </div>
      </div>

      {/* Preview panel */}
      <div className={`${mobileTab === 'edit' ? 'hidden md:flex' : 'flex'} md:flex flex-1 overflow-auto flex-col`} style={{ background: '#d1d5db' }}>
        {/* Preview toolbar */}
        <div className="flex items-center justify-between px-4 py-2 flex-shrink-0 sticky top-0 z-10"
          style={{ background: '#d1d5db', borderBottom: '1px solid #b6bcc6' }}>
          <p className="text-xs font-semibold" style={{ color: '#4b5563' }}>
            {templates.find(t => t.id === activeTemplate)?.name} · A4
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setZoom(z => { const i = ZOOM_STEPS.indexOf(z); return ZOOM_STEPS[Math.max(0, i - 1)] ?? z })}
              disabled={zoom <= ZOOM_STEPS[0]}
              className="p-1.5 rounded hover:opacity-70 disabled:opacity-30"
              style={{ background: '#b6bcc6', color: '#1f2937' }}>
              <ZoomOut size={12} />
            </button>
            <span className="text-xs font-bold px-2" style={{ color: '#374151', minWidth: 40, textAlign: 'center' }}>
              {Math.round(zoom * 100)}%
            </span>
            <button onClick={() => setZoom(z => { const i = ZOOM_STEPS.indexOf(z); return ZOOM_STEPS[Math.min(ZOOM_STEPS.length - 1, i + 1)] ?? z })}
              disabled={zoom >= ZOOM_STEPS[ZOOM_STEPS.length - 1]}
              className="p-1.5 rounded hover:opacity-70 disabled:opacity-30"
              style={{ background: '#b6bcc6', color: '#1f2937' }}>
              <ZoomIn size={12} />
            </button>
          </div>
        </div>
        {/* Scaled resume — origin top-center */}
        <div className="flex-1 flex flex-col items-center py-6"
          style={{ minHeight: PAGE_H * zoom + 80 }}>
          <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
            <div ref={previewRef} className="shadow-2xl bg-white" style={{ width: PAGE_W }}>
              <ResumePreview data={data} templateId={activeTemplate} />
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
