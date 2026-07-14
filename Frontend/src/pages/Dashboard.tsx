import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState, useEffect } from "react";
import {
  Flame,
  Target,
  Trophy,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Star,
  Zap,
  ArrowUp,
  Map,
  Loader,
} from "lucide-react";
import {
  authService,
  progressService,
  companyVisitService,
  roadmapService,
} from "../lib/services";
import type {
  RoadmapProgress,
  StudyRoadmap,
  CompanyVisit,
} from "../context/AppContext";

type ActivityPoint = { day: string; problems: number; time: number };

type LeaderboardEntry = {
  rank: number;
  name: string;
  college: string;
  xp: number;
  isMe: boolean;
};

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  delta,
}: {
  icon: typeof Flame;
  label: string;
  value: string;
  sub?: string;
  color: string;
  delta?: string;
}) {
  return (
    <div
      className="p-5 rounded-2xl"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}20` }}
        >
          <Icon size={20} style={{ color }} />
        </div>
        {delta && (
          <span
            className="flex items-center gap-1 text-xs font-semibold"
            style={{ color: "#22c55e" }}
          >
            <ArrowUp size={10} /> {delta}
          </span>
        )}
      </div>
      <div className="text-2xl font-black mb-1">{value}</div>
      <div className="text-sm font-medium mb-0.5">{label}</div>
      {sub && (
        <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function ProgressRing({
  pct,
  color,
  size = 60,
}: {
  pct: number;
  color: string;
  size?: number;
}) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        strokeWidth={6}
        fill="none"
        stroke="rgba(99,102,241,0.1)"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        strokeWidth={6}
        fill="none"
        stroke={color}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
    </svg>
  );
}

// Default company prep phases (mirrors CompanyPrep.tsx roadmapPhases)
const DEFAULT_COMPANY_PHASES = [
  {
    title: "Foundation & Data Structures",
    tasks: [
      "Arrays, Strings, Hashing",
      "Linked Lists & Stacks/Queues",
      "Trees & Binary Trees",
      "Solve 30 Easy LeetCode problems",
    ],
  },
  {
    title: "Algorithms & Problem Patterns",
    tasks: [
      "Sorting & Searching",
      "Recursion & Backtracking",
      "Dynamic Programming (DP basics)",
      "Graphs – BFS, DFS, Dijkstra",
    ],
  },
  {
    title: "Company-Specific Prep",
    tasks: [
      "Study past interview questions",
      "2 full mock tests (aptitude + technical)",
      "Behavioral & HR round prep",
      "System Design fundamentals",
    ],
  },
  {
    title: "Final Polish & Interview Simulation",
    tasks: [
      "Mock coding interview (peer/mentor)",
      "Revise weak areas from mock results",
      "Prepare STAR method answers",
      "Company culture & product research",
    ],
  },
];

const STATIC_COMPANY_NAMES: Record<string, string> = {
  s1: "Google",
  s2: "Amazon",
  s3: "Microsoft",
  s4: "Flipkart",
};

type DashboardRoadmapPhase = {
  title: string;
  tasks: { key: string; label: string; aliases?: string[] }[];
};

function phasesFromRoadmap(rm: StudyRoadmap): DashboardRoadmapPhase[] {
  if (rm.modules?.length) {
    return rm.modules.map((module) => ({
      title: module.title,
      tasks: module.dailyTasks.map((task) => ({
        key: `${module.id}:${task.id}`,
        label: task.taskName,
      })),
    }));
  }

  return rm.phases.map((phase, pi) => ({
    title: phase.title,
    tasks: phase.tasks.map((task, ti) => ({
      key: `fallback-${pi}:fallback-task-${pi}-${ti}`,
      label: task,
      aliases: [`${pi}:${ti}`],
    })),
  }));
}

function defaultCompanyDashboardPhases(): DashboardRoadmapPhase[] {
  return DEFAULT_COMPANY_PHASES.map((phase, pi) => ({
    title: phase.title,
    tasks: phase.tasks.map((task, ti) => ({
      key: `fallback-${pi}:fallback-task-${pi}-${ti}`,
      label: task,
      aliases: [`${pi}:${ti}`],
    })),
  }));
}

// Matches the fields your User schema actually has
type DashboardUser = {
  name: string;
  dsaSolved: number;
  aptitudeScore: number;
  mockTestsTaken: number;
  dsaStreak: number;
  totalXP: number;
  coursesCompleted: number;
  aptitudeTests: number;
  strongTopics: string[];
  weakTopics: string[];
  lastActive: string;
};

export default function Dashboard() {
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [roadmapProgress, setRoadmapProgress] = useState<RoadmapProgress[]>([]);
  const [roadmaps, setRoadmaps] = useState<StudyRoadmap[]>([]);
  const [companyVisits, setCompanyVisits] = useState<CompanyVisit[]>([]);
  const [activityData, setActivityData] = useState<ActivityPoint[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");
        const [profile, progress, maps, visits, activity, board] =
          await Promise.all([
            authService.getProfile(),
            progressService.listRoadmaps(),
            roadmapService.listAll(),
            companyVisitService.listAll(),
            authService.getWeeklyActivity(),
            authService.getLeaderboard(),
          ]);
        setUser(profile?.user ?? null);
        setRoadmapProgress(progress || []);
        setRoadmaps(maps || []);
        setCompanyVisits(visits || []);
        setActivityData(activity || []);
        setLeaderboard(board?.entries || []);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to load dashboard data";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function handleToggleTask(roadmapId: string, taskKey: string) {
    try {
      const updated = await progressService.toggleTask(roadmapId, taskKey);
      setRoadmapProgress((prev) =>
        prev.map((item) =>
          item.roadmapId === updated.roadmapId ? updated : item,
        ),
      );
    } catch {
      alert("Failed to update task");
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <Loader
          size={32}
          className="mx-auto mb-3 animate-spin"
          style={{ color: "var(--primary)" }}
        />
        <p style={{ color: "var(--muted-foreground)" }}>
          Loading your dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertCircle
          size={32}
          className="mx-auto mb-3"
          style={{ color: "#ef4444" }}
        />
        <p style={{ color: "#ef4444" }}>{error}</p>
      </div>
    );
  }

  const activeRoadmaps = roadmapProgress.map((rp) => {
    const rm = roadmaps.find((r) => r.id === rp.roadmapId);
    if (rm) {
      const phases = phasesFromRoadmap(rm);
      const allTasks = phases.flatMap((p) => p.tasks);
      const doneCount = allTasks.filter(
        (task) =>
          rp.completedTasks.includes(task.key) ||
          task.aliases?.some((alias) => rp.completedTasks.includes(alias)),
      ).length;
      const totalTasks = allTasks.length;
      const pct = totalTasks ? Math.round((doneCount / totalTasks) * 100) : 0;
      return {
        id: rm.id,
        title: rm.title,
        duration: rm.duration,
        phases,
        progress: rp,
        pct,
        totalTasks,
        isCompanyPrep: false,
      };
    }
    let title = "Company Preparation Roadmap";
    if (rp.roadmapId.startsWith("company-")) {
      const companyId = rp.roadmapId.replace("company-", "");
      title = `${STATIC_COMPANY_NAMES[companyId] ?? "Company"} Preparation Roadmap`;
    } else if (rp.roadmapId.startsWith("visit-")) {
      const visitId = rp.roadmapId.replace("visit-", "");
      const visit = companyVisits.find((v) => v.id === visitId);
      title = `${visit?.companyName ?? "Company"} Preparation Roadmap`;
    }
    const phases = defaultCompanyDashboardPhases();
    const allTasks = phases.flatMap((p) => p.tasks);
    const doneCount = allTasks.filter(
      (task) =>
        rp.completedTasks.includes(task.key) ||
        task.aliases?.some((alias) => rp.completedTasks.includes(alias)),
    ).length;
    const totalTasks = allTasks.length;
    const pct = totalTasks ? Math.round((doneCount / totalTasks) * 100) : 0;
    return {
      id: rp.roadmapId,
      title,
      duration: "7 weeks",
      phases,
      progress: rp,
      pct,
      totalTasks,
      isCompanyPrep: true,
    };
  });

  // Derived progress bars — real where the schema supports it
  const dsaTopicsPct = user
    ? Math.min(100, Math.round((user.dsaSolved / 200) * 100))
    : 0;
  const aptitudePct = user ? Math.min(100, user.aptitudeScore) : 0;
  const companyRoadmaps = activeRoadmaps.filter((r) => r.isCompanyPrep);
  const companyPrepPct = companyRoadmaps.length
    ? Math.round(
        companyRoadmaps.reduce((sum, r) => sum + r.pct, 0) /
          companyRoadmaps.length,
      )
    : 40; // fallback when the student hasn't started a company roadmap yet

  const overallPct = user
    ? Math.round((dsaTopicsPct + aptitudePct + companyPrepPct) / 3)
    : 0;

  const weakSubjects = user?.weakTopics?.length
    ? user.weakTopics
    : ["Dynamic Programming", "Graph Algorithms", "System Design"];
  const strongSubjects = user?.strongTopics?.length
    ? user.strongTopics
    : ["Arrays & Strings", "Binary Search", "Recursion"];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Welcome banner */}
      <div
        className="p-6 rounded-2xl relative overflow-hidden glow"
        style={{ background: "var(--gradient-primary)" }}
      >
        <div
          className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 0)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative">
          <p className="text-white/70 text-sm mb-1">Good morning 🌟</p>
          <h1 className="text-2xl lg:text-3xl font-black text-white mb-2">
            {user?.name ?? "Student"}
          </h1>
          <p className="text-white/80 text-sm mb-4">
            You're on a <strong>{user?.dsaStreak ?? 0}-day streak</strong>! Keep
            going!
          </p>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/20">
              <Flame size={14} className="text-orange-300" />
              <span className="text-white text-sm font-semibold">
                {user?.dsaStreak ?? 0} Day Streak
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/20">
              <Zap size={14} className="text-yellow-300" />
              <span className="text-white text-sm font-semibold">
                {(user?.totalXP ?? 0).toLocaleString()} XP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={CheckCircle2}
          label="Questions Solved"
          value={String(user?.dsaSolved ?? 0)}
          color="#6366f1"
        />
        <StatCard
          icon={Target}
          label="Aptitude Score"
          value={`${user?.aptitudeScore ?? 0}%`}
          color="#8b5cf6"
        />
        <StatCard
          icon={Trophy}
          label="Mock Tests Taken"
          value={String(user?.mockTestsTaken ?? 0)}
          color="#f59e0b"
        />
        <StatCard
          icon={Clock}
          label="Courses Completed"
          value={String(user?.coursesCompleted ?? 0)}
          color="#22c55e"
        />
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Activity graph */}
        <div
          className="lg:col-span-2 p-5 rounded-2xl"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-lg">Weekly Activity</h2>
            <span
              className="text-sm px-3 py-1 rounded-lg"
              style={{
                background: "var(--muted)",
                color: "var(--muted-foreground)",
              }}
            >
              Last 7 Days
            </span>
          </div>
          {activityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={activityData}>
              <defs>
                <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  color: "var(--foreground)",
                }}
              />
              <Area
                type="monotone"
                dataKey="problems"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#pg)"
              />
            </AreaChart>
          </ResponsiveContainer>
          ) : (
            <div
              className="h-[200px] flex items-center justify-center text-sm rounded-xl"
              style={{
                background: "var(--muted)",
                color: "var(--muted-foreground)",
              }}
            >
              No activity yet. Solve problems or take mock tests to track progress.
            </div>
          )}
        </div>

        {/* Overall progress — derived from real fields where possible */}
        <div
          className="p-5 rounded-2xl space-y-4"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
          }}
        >
          <h2 className="font-bold text-lg">Overall Progress</h2>
          <div className="flex flex-col gap-4">
            {[
              { label: "DSA Topics", pct: dsaTopicsPct, color: "#6366f1" },
              { label: "Aptitude", pct: aptitudePct, color: "#8b5cf6" },
              { label: "Company Prep", pct: companyPrepPct, color: "#f59e0b" },
            ].map(({ label, pct, color }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium">{label}</span>
                  <span style={{ color: "var(--muted-foreground)" }}>
                    {pct}%
                  </span>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ background: "var(--muted)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: color }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <ProgressRing pct={overallPct} color="#6366f1" size={72} />
            <div>
              <div className="text-2xl font-black">{overallPct}%</div>
              <div
                className="text-xs"
                style={{ color: "var(--muted-foreground)" }}
              >
                Placement Ready
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Roadmaps — unchanged, already live */}
      {activeRoadmaps.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-2">
              <Map size={18} style={{ color: "var(--primary)" }} />
              <h2 className="font-bold text-lg">Active Roadmaps</h2>
            </div>
            <span
              className="text-xs px-2.5 py-1 rounded-full font-semibold"
              style={{
                background: "rgba(99,102,241,0.12)",
                color: "var(--primary)",
              }}
            >
              {activeRoadmaps.length} in progress
            </span>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {activeRoadmaps.map((rm) => (
              <details key={rm.id} className="group">
                <summary className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:opacity-80 transition-all list-none">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">{rm.title}</span>
                      <span
                        className="text-xs font-bold"
                        style={{ color: "var(--primary)" }}
                      >
                        {rm.pct}%
                      </span>
                    </div>
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{ background: "var(--muted)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${rm.pct}%`,
                          background: "var(--gradient-primary)",
                        }}
                      />
                    </div>
                    <div
                      className="flex items-center gap-3 mt-1.5 text-xs"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      <span>
                        {rm.progress.completedTasks.length}/{rm.totalTasks}{" "}
                        tasks
                      </span>
                      <span>•</span>
                      <span>{rm.duration}</span>
                    </div>
                  </div>
                </summary>
                <div className="px-5 pb-4 space-y-3">
                  {rm.phases.map((phase, pi) => (
                    <div key={pi}>
                      <p
                        className="text-xs font-bold mb-2"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {phase.title}
                      </p>
                      <div className="space-y-1">
                        {phase.tasks.map((task, ti) => {
                          const key = task.key;
                          const done =
                            rm.progress.completedTasks.includes(task.key) ||
                            task.aliases?.some((alias) =>
                              rm.progress.completedTasks.includes(alias),
                            );
                          return (
                            <button
                              key={ti}
                              onClick={() => handleToggleTask(rm.id, key)}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm transition-all hover:opacity-80"
                              style={{
                                background: done
                                  ? "rgba(16,185,129,0.08)"
                                  : "var(--muted)",
                              }}
                            >
                              <div
                                className="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0"
                                style={{
                                  borderColor: done
                                    ? "#10b981"
                                    : "var(--border)",
                                  background: done ? "#10b981" : "transparent",
                                }}
                              >
                                {done && (
                                  <CheckCircle2
                                    size={10}
                                    className="text-white"
                                  />
                                )}
                              </div>
                              <span
                                style={{
                                  color: done ? "#10b981" : "var(--foreground)",
                                  textDecoration: done
                                    ? "line-through"
                                    : "none",
                                }}
                              >
                                {task.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* Bottom grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Leaderboard */}
        <div
          className="p-5 rounded-2xl"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Leaderboard</h2>
            <Trophy size={16} style={{ color: "var(--accent)" }} />
          </div>
          <div className="space-y-3">
            {leaderboard.length > 0 ? (
              leaderboard.map(({ rank, name, college, xp, isMe }) => (
              <div
                key={rank}
                className="flex items-center gap-3 p-2.5 rounded-xl transition-all"
                style={{
                  background: isMe ? "rgba(99,102,241,0.1)" : "transparent",
                  border: isMe
                    ? "1px solid rgba(99,102,241,0.2)"
                    : "1px solid transparent",
                }}
              >
                <span
                  className="w-5 text-center text-sm font-bold"
                  style={{
                    color: rank <= 3 ? "#f59e0b" : "var(--muted-foreground)",
                  }}
                >
                  {rank}
                </span>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {name} {isMe && "(You)"}
                  </p>
                  <p
                    className="text-xs truncate"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {college}
                  </p>
                </div>
                <div
                  className="flex items-center gap-1"
                  style={{ color: "var(--accent)" }}
                >
                  <Zap size={12} />
                  <span className="text-xs font-bold">
                    {xp.toLocaleString()}
                  </span>
                </div>
              </div>
              ))
            ) : (
              <div
                className="py-8 text-center text-sm rounded-xl"
                style={{
                  background: "var(--muted)",
                  color: "var(--muted-foreground)",
                }}
              >
                No leaderboard data yet.
              </div>
            )}
          </div>
        </div>

        {/* Upcoming companies — already live */}
        <div
          className="p-5 rounded-2xl"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Upcoming Companies</h2>
            <Building2 size={16} style={{ color: "var(--muted-foreground)" }} />
          </div>
          <div className="space-y-3">
            {companyVisits.slice(0, 3).map((visit) => (
              <div
                key={visit.id}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{
                  background: "var(--muted)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold text-white"
                  style={{
                    background: "hsl(" + Math.random() * 360 + ",70%,50%)",
                  }}
                >
                  {visit.companyName?.[0] || "C"}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{visit.companyName}</p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {new Date(visit.visitDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-400" />
              </div>
            ))}
          </div>
          {companyVisits.length > 3 && (
            <div
              className="mt-4 p-3 rounded-xl text-center text-sm font-medium cursor-pointer transition-all hover:opacity-80"
              style={{
                background: "rgba(99,102,241,0.1)",
                color: "var(--primary)",
                border: "1px solid rgba(99,102,241,0.2)",
              }}
            >
              View All {companyVisits.length} Companies →
            </div>
          )}
        </div>

        {/* Weak / Strong subjects — now real, from user.weakTopics/strongTopics */}
        <div
          className="p-5 rounded-2xl space-y-4"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
          }}
        >
          <h2 className="font-bold text-lg">Subject Analysis</h2>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={14} className="text-red-400" />
              <span className="text-sm font-semibold text-red-400">
                Needs Work
              </span>
            </div>
            <div className="space-y-2">
              {weakSubjects.map((s) => (
                <div
                  key={s}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.15)",
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  {s}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Star size={14} className="text-green-400" />
              <span className="text-sm font-semibold text-green-400">
                Strong Areas
              </span>
            </div>
            <div className="space-y-2">
              {strongSubjects.map((s) => (
                <div
                  key={s}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: "rgba(34,197,94,0.08)",
                    border: "1px solid rgba(34,197,94,0.15)",
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
