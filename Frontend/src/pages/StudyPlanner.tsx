import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Flame, CheckCircle2, Circle, Plus, X, Trash2, Clock } from 'lucide-react'
import { api, loadCollection, normalizeId } from '../lib/api'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const TOPIC_OPTIONS = ['DSA', 'Aptitude', 'Core CS', 'Resume', 'Interview', 'Mock Test', 'Planning', 'Project']
const TOPIC_COLORS: Record<string, string> = {
  DSA: '#6366f1', Aptitude: '#8b5cf6', 'Core CS': '#06b6d4',
  Resume: '#22c55e', Interview: '#f59e0b', 'Mock Test': '#ef4444',
  Planning: '#ec4899', Project: '#f97316',
}

interface Task {
  id: string | number
  task: string
  topic: string
  done: boolean
  date: string   // YYYY-MM-DD
  time?: string  // HH:MM (optional)
}

const toKey = (year: number, month: number, day: number): string =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

function getRealToday() {
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() }
}

// Seed tasks around today's date
function buildSeedTasks(): Task[] {
  const { year, month, day } = getRealToday()
  const d = (offset: number) => {
    const dt = new Date(year, month, day + offset)
    return toKey(dt.getFullYear(), dt.getMonth(), dt.getDate())
  }
  return [
    { id: 1,  task: 'Graph BFS/DFS – 10 problems',          topic: 'DSA',       done: true,  date: d(-5), time: '09:00' },
    { id: 2,  task: 'TCS Aptitude Mock Test',                topic: 'Aptitude',  done: true,  date: d(-5), time: '14:00' },
    { id: 3,  task: 'Dynamic Programming – DP on strings',   topic: 'DSA',       done: true,  date: d(-4), time: '10:00' },
    { id: 4,  task: 'OS concepts – Process scheduling',      topic: 'Core CS',   done: true,  date: d(-4) },
    { id: 5,  task: 'Resume review + ATS optimization',      topic: 'Resume',    done: false, date: d(-2), time: '16:00' },
    { id: 6,  task: 'Tree problems – 15 problems',           topic: 'DSA',       done: false, date: d(-1) },
    { id: 7,  task: 'Mock coding interview (60 min)',         topic: 'Interview', done: false, date: d(0),  time: '18:00' },
    { id: 8,  task: 'Infosys InfyTQ Full Mock Test',         topic: 'Mock Test', done: false, date: d(1),  time: '10:00' },
    { id: 9,  task: 'Weekly review + planning',              topic: 'Planning',  done: false, date: d(3) },
    { id: 10, task: 'System Design fundamentals',            topic: 'Core CS',   done: false, date: d(5),  time: '11:00' },
  ]
}

function AddTaskModal({
  date,
  onAdd,
  onClose,
}: {
  date: string
  onAdd: (task: Omit<Task, 'id'>) => void
  onClose: () => void
}) {
  const [taskText, setTaskText] = useState('')
  const [topic, setTopic] = useState('DSA')
  const [time, setTime] = useState('')

  const handleAdd = () => {
    if (!taskText.trim()) return
    onAdd({ task: taskText.trim(), topic, done: false, date, time: time || undefined })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl p-6 space-y-4"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg" style={{ color: 'var(--foreground)' }}>Add Task</h2>
          <button onClick={onClose} style={{ color: 'var(--muted-foreground)' }}>
            <X size={18} />
          </button>
        </div>

        <div className="text-xs font-medium px-3 py-2 rounded-lg"
          style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)' }}>
          📅 {date}
        </div>

        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Task Description</label>
          <input
            autoFocus
            value={taskText}
            onChange={e => setTaskText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="e.g. Solve 10 DP problems"
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
          />
        </div>

        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>
            Time <span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}>(optional)</span>
          </label>
          <input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', colorScheme: 'inherit' }}
          />
        </div>

        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Topic</label>
          <div className="flex flex-wrap gap-2">
            {TOPIC_OPTIONS.map(t => (
              <button key={t} onClick={() => setTopic(t)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: topic === t ? `${TOPIC_COLORS[t]}20` : 'var(--muted)',
                  color: topic === t ? TOPIC_COLORS[t] : 'var(--muted-foreground)',
                  border: `1px solid ${topic === t ? `${TOPIC_COLORS[t]}40` : 'var(--border)'}`,
                }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-70"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
            Cancel
          </button>
          <button onClick={handleAdd}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'var(--gradient-primary)', opacity: taskText.trim() ? 1 : 0.4 }}>
            Add Task
          </button>
        </div>
      </div>
    </div>
  )
}

export default function StudyPlanner() {
  const today = getRealToday()
  const [month, setMonth] = useState(today.month)
  const [year, setYear] = useState(today.year)
  const [selectedDay, setSelectedDay] = useState(today.day)
  const [tasks, setTasks] = useState<Task[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [now, setNow] = useState(new Date())

  // Live clock
  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    loadCollection<Task>('/study-tasks')
      .then(items => setTasks(items.map(item => normalizeId(item as any) as Task)))
      .catch(error => {
        console.warn('Failed to load study tasks', error)
        setTasks([])
      })
  }, [])

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const calDays: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const selectedKey = toKey(year, month, selectedDay)
  const selectedTasks = tasks.filter(t => t.date === selectedKey).sort((a, b) => {
    if (!a.time && !b.time) return 0
    if (!a.time) return 1
    if (!b.time) return -1
    return a.time.localeCompare(b.time)
  })
  const completedCount = selectedTasks.filter(t => t.done).length

  const addTask = async (newTask: Omit<Task, 'id'>) => {
    const created = await api.post<Task>('/study-tasks', newTask)
    const normalized = normalizeId(created as any) as Task
    setTasks(prev => [...prev, normalized])
  }

  const toggleTask = async (id: string | number) => {
    const current = tasks.find(t => String(t.id) === String(id))
    if (!current) return
    setTasks(ts => ts.map(t => String(t.id) === String(id) ? { ...t, done: !t.done } : t))
    const updated = await api.put<Task>(`/study-tasks/${id}`, { ...current, done: !current.done })
    setTasks(ts => ts.map(t => String(t.id) === String(id) ? normalizeId(updated as any) as Task : t))
  }

  const deleteTask = async (id: string | number) => {
    await api.delete(`/study-tasks/${id}`)
    setTasks(ts => ts.filter(t => t.id !== id))
  }

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
    setSelectedDay(1)
  }

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
    setSelectedDay(1)
  }

  // Compute streak from tasks (days that have at least one done task)
  const doneKeys = new Set(tasks.filter(t => t.done).map(t => t.date))
  let streakCount = 0
  for (let i = 0; i < 60; i++) {
    const dt = new Date(today.year, today.month, today.day - i)
    const k = toKey(dt.getFullYear(), dt.getMonth(), dt.getDate())
    if (doneKeys.has(k)) streakCount++
    else if (i > 0) break
  }

  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {showAddModal && (
        <AddTaskModal
          date={selectedKey}
          onAdd={addTask}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--foreground)' }}>Study Planner</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            {dateStr}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Live clock */}
          <div className="px-4 py-2 rounded-xl font-mono text-sm font-bold flex items-center gap-2"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
            <Clock size={14} style={{ color: 'var(--primary)' }} />
            {timeStr}
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <Flame size={16} className="text-orange-400" />
            <span className="font-bold text-sm text-orange-400">{streakCount} Day Streak 🔥</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 p-5 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-lg" style={{ color: 'var(--foreground)' }}>{MONTHS[month]} {year}</h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-1.5 rounded-lg transition-all hover:opacity-70"
                style={{ background: 'var(--muted)' }}>
                <ChevronLeft size={16} style={{ color: 'var(--foreground)' }} />
              </button>
              <button onClick={nextMonth} className="p-1.5 rounded-lg transition-all hover:opacity-70"
                style={{ background: 'var(--muted)' }}>
                <ChevronRight size={16} style={{ color: 'var(--foreground)' }} />
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-semibold py-1"
                style={{ color: 'var(--muted-foreground)' }}>{d}</div>
            ))}
          </div>

          {/* Date grid */}
          <div className="grid grid-cols-7 gap-1">
            {calDays.map((day, i) => {
              if (!day) return <div key={`e-${i}`} />
              const isSelected = day === selectedDay
              const isToday = day === today.day && month === today.month && year === today.year
              const dayKey = toKey(year, month, day)
              const dayTasks = tasks.filter(t => t.date === dayKey)
              const hasTasks = dayTasks.length > 0
              const allDone = hasTasks && dayTasks.every(t => t.done)

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className="aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-medium cursor-pointer transition-all hover:scale-110 relative"
                  style={{
                    background: isSelected
                      ? 'var(--gradient-primary)'
                      : isToday
                      ? 'rgba(99,102,241,0.2)'
                      : hasTasks
                      ? 'rgba(99,102,241,0.06)'
                      : 'transparent',
                    color: isSelected ? 'white' : isToday ? 'var(--primary)' : 'var(--foreground)',
                    border: isToday && !isSelected ? '1px solid var(--primary)' : '1px solid transparent',
                  }}>
                  {day}
                  {hasTasks && (
                    <div className="absolute bottom-0.5 flex gap-0.5">
                      {allDone
                        ? <div className="w-1 h-1 rounded-full bg-green-400" />
                        : <div className="w-1 h-1 rounded-full" style={{ background: 'var(--primary)' }} />}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 pt-3 flex gap-4 flex-wrap" style={{ borderTop: '1px solid var(--border)' }}>
            {[
              { dot: 'var(--primary)', label: 'Has tasks' },
              { dot: '#22c55e', label: 'All done' },
              { dot: 'rgba(99,102,241,0.2)', label: 'Today' },
            ].map(({ dot, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: dot }} />
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Task panel for selected date */}
        <div className="p-5 rounded-2xl flex flex-col"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-bold text-base" style={{ color: 'var(--foreground)' }}>
              {MONTHS[month].slice(0, 3)} {selectedDay}
              {selectedDay === today.day && month === today.month && year === today.year && (
                <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--primary)' }}>Today</span>
              )}
            </h2>
            <button onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'var(--gradient-primary)' }}>
              <Plus size={12} /> Add Task
            </button>
          </div>
          <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>
            {completedCount}/{selectedTasks.length} tasks done
          </p>

          {selectedTasks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
              <div className="text-4xl mb-3">📅</div>
              <p className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>No tasks for this day</p>
              <p className="text-xs mt-1 mb-4" style={{ color: 'var(--muted-foreground)' }}>
                Click "+ Add Task" to schedule something
              </p>
              <button onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: 'var(--gradient-primary)' }}>
                <Plus size={14} /> Add Task
              </button>
            </div>
          ) : (
            <div className="flex-1 space-y-2 overflow-y-auto">
              {selectedTasks.map(({ id, task, topic, done, time }) => (
                <div key={id} className="group flex items-start gap-3 p-3 rounded-xl transition-all"
                  style={{
                    background: done ? 'rgba(34,197,94,0.05)' : `${TOPIC_COLORS[topic] ?? 'var(--primary)'}08`,
                    border: `1px solid ${done ? 'rgba(34,197,94,0.15)' : `${TOPIC_COLORS[topic] ?? 'var(--primary)'}20`}`,
                  }}>
                  <button onClick={() => toggleTask(id)} className="flex-shrink-0 mt-0.5">
                    {done
                      ? <CheckCircle2 size={16} className="text-green-400" />
                      : <Circle size={16} style={{ color: TOPIC_COLORS[topic] ?? 'var(--primary)' }} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{
                      textDecoration: done ? 'line-through' : 'none',
                      color: done ? 'var(--muted-foreground)' : 'var(--foreground)',
                    }}>
                      {task}
                    </p>
                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded"
                        style={{
                          background: `${TOPIC_COLORS[topic] ?? 'var(--primary)'}20`,
                          color: TOPIC_COLORS[topic] ?? 'var(--primary)',
                        }}>
                        {topic}
                      </span>
                      {time && (
                        <span className="flex items-center gap-1 text-xs"
                          style={{ color: 'var(--muted-foreground)' }}>
                          <Clock size={10} /> {time}
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => deleteTask(id)}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: '#ef4444' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Streak visualization */}
      <div className="p-5 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold" style={{ color: 'var(--foreground)' }}>Study Streak — {MONTHS[month]} {year}</h2>
          <span className="text-sm font-bold" style={{ color: '#f59e0b' }}>🔥 {streakCount} days</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: daysInMonth }, (_, i) => {
            const d = i + 1
            const dk = toKey(year, month, d)
            const studied = doneKeys.has(dk)
            const isSelected = d === selectedDay
            const isTodayCell = d === today.day && month === today.month && year === today.year
            return (
              <button key={d} onClick={() => setSelectedDay(d)}
                className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-semibold transition-all hover:scale-110"
                style={{
                  background: isSelected ? 'var(--primary)' : studied ? 'rgba(99,102,241,0.4)' : isTodayCell ? 'rgba(99,102,241,0.15)' : 'var(--muted)',
                  color: isSelected ? 'white' : studied ? 'var(--primary)' : 'var(--foreground)',
                  border: isTodayCell && !isSelected ? '2px solid var(--primary)' : isSelected ? '2px solid var(--primary)' : 'none',
                }}>
                {d}
              </button>
            )
          })}
        </div>
      </div>

      {/* All tasks table */}
      <div className="p-5 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold" style={{ color: 'var(--foreground)' }}>All Tasks – {MONTHS[month]} {year}</h2>
          <span className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>
            {tasks.filter(t => t.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).filter(t => t.done).length}/
            {tasks.filter(t => t.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length} done
          </span>
        </div>
        <div className="space-y-1.5">
          {tasks
            .filter(t => t.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`))
            .sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? '').localeCompare(b.time ?? ''))
            .map(({ id, task, topic, done, date, time }) => (
              <div key={id} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: 'var(--muted)' }}>
                <button onClick={() => toggleTask(id)}>
                  {done
                    ? <CheckCircle2 size={15} className="text-green-400" />
                    : <Circle size={15} style={{ color: TOPIC_COLORS[topic] }} />}
                </button>
                <span className="text-xs font-semibold w-16 flex-shrink-0" style={{ color: 'var(--muted-foreground)' }}>
                  {date.split('-')[2]}/{date.split('-')[1]}
                </span>
                {time && (
                  <span className="flex items-center gap-1 text-xs flex-shrink-0"
                    style={{ color: 'var(--muted-foreground)' }}>
                    <Clock size={10} /> {time}
                  </span>
                )}
                <span className="flex-1 text-sm" style={{
                  textDecoration: done ? 'line-through' : 'none',
                  color: done ? 'var(--muted-foreground)' : 'var(--foreground)',
                }}>
                  {task}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-lg font-medium flex-shrink-0"
                  style={{ background: `${TOPIC_COLORS[topic]}15`, color: TOPIC_COLORS[topic] }}>
                  {topic}
                </span>
                <button onClick={() => deleteTask(id)} className="transition-all hover:opacity-70" style={{ color: '#ef4444' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
