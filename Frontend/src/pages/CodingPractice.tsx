import { useState, useMemo, useEffect } from "react";
import { Search, ChevronRight, Code2, AlertCircle, Loader } from "lucide-react";
import { api } from "../lib/api";
import ProblemIDE, { type Problem } from "../components/ProblemIDE";

// Convert DSAProblem to Problem type for IDE
function convertDSAProblem(dsa: any, index: number): Problem {
  return {
    id: index + 1,
    problemId: dsa.id || dsa._id,
    title: dsa.title,
    difficulty: dsa.difficulty,
    topic: dsa.topic,
    companies: dsa.companies || [],
    description: dsa.description || "",
    examples: dsa.examples || [],
    constraints: dsa.constraints || [],
    hints: dsa.hints || dsa.tags || [],
    testCases: dsa.sampleTestCases || [],
  };
}

const diffColors: Record<string, { color: string; bg: string }> = {
  Easy: { color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  Medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  Hard: { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
};

export default function CodingPractice() {
  const [selected, setSelected] = useState<Problem | null>(null);
  const [search, setSearch] = useState("");
  const [diff, setDiff] = useState("all");
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch problems from backend API
  useEffect(() => {
    async function loadProblems() {
      try {
        setLoading(true);
        setError("");
        const data = await api.get<any[]>("/dsa-problems");
        const converted = (data || []).map(convertDSAProblem);
        setProblems(converted);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to load problems";
        setError(msg);
        setProblems([]);
      } finally {
        setLoading(false);
      }
    }
    loadProblems();
  }, []);

  const filtered = useMemo(() => {
    return problems.filter((p) => {
      const ms =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.topic.toLowerCase().includes(search.toLowerCase());
      const md = diff === "all" || p.difficulty.toLowerCase() === diff;
      return ms && md;
    });
  }, [problems, search, diff]);

  if (selected) {
    const idx = filtered.findIndex((p) => p.id === selected.id);
    const nextP =
      filtered[idx + 1] ?? problems.find((p) => p.id !== selected.id) ?? null;
    return (
      <div className="h-full">
        <ProblemIDE
          problem={selected}
          onBack={() => setSelected(null)}
          showBack
          onNext={nextP ? () => setSelected(nextP) : undefined}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <Loader
          size={32}
          className="mx-auto mb-3 animate-spin"
          style={{ color: "var(--primary)" }}
        />
        <p style={{ color: "var(--muted-foreground)" }}>Loading problems...</p>
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

  if (problems.length === 0) {
    return (
      <div className="p-6 text-center">
        <AlertCircle
          size={32}
          className="mx-auto mb-3"
          style={{ color: "var(--muted-foreground)" }}
        />
        <p style={{ color: "var(--muted-foreground)" }}>
          No problems available
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black">Coding Practice</h1>
        <p
          className="text-sm mt-1"
          style={{ color: "var(--muted-foreground)" }}
        >
          Select a problem to open the full IDE — Monaco-style editor,
          multi-language, test runner
        </p>
      </div>

      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--muted-foreground)" }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems or topics..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
          />
        </div>
        <div className="flex gap-2">
          {(["all", "easy", "medium", "hard"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDiff(d)}
              className="px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all"
              style={{
                background: diff === d ? "var(--primary)" : "var(--card)",
                color: diff === d ? "white" : "var(--muted-foreground)",
                border: "1px solid var(--border)",
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        {filtered.map((p, i) => {
          const dc = diffColors[p.difficulty];
          return (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              className="w-full flex items-center gap-4 px-5 py-4 text-left transition-all hover:opacity-80 group"
              style={{
                borderBottom:
                  i < filtered.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(99,102,241,0.1)" }}
              >
                <Code2 size={14} style={{ color: "var(--primary)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{p.title}</p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {p.topic} • {p.companies.join(", ")}
                </p>
              </div>
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-lg flex-shrink-0"
                style={{ color: dc.color, background: dc.bg }}
              >
                {p.difficulty}
              </span>
              <ChevronRight
                size={16}
                className="flex-shrink-0 transition-transform group-hover:translate-x-1"
                style={{ color: "var(--muted-foreground)" }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
