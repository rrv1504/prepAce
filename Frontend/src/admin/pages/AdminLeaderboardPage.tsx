import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { RotateCcw, Plus, Medal } from "lucide-react";
import { api, loadCollection } from "../../lib/api";

const CONTESTS = [
  {
    id: "1",
    name: "30-Day Placement Sprint",
    start: "2025-01-01",
    end: "2025-01-31",
    participants: 142,
    status: "active",
  },
  {
    id: "2",
    name: "DSA Weekly Challenge",
    start: "2025-01-15",
    end: "2025-01-22",
    participants: 89,
    status: "completed",
  },
];

export default function AdminLeaderboardPage() {
  const { adminUsers, badges } = useAppContext();
  const [contests, setContests] = useState(CONTESTS);
  const [showContestForm, setShowContestForm] = useState(false);
  const [contestForm, setContestForm] = useState({
    name: "",
    start: "",
    end: "",
  });
  const [awardModal, setAwardModal] = useState<string | null>(null);
  const [selectedBadge, setSelectedBadge] = useState("");
  const [xpAmount, setXpAmount] = useState(100);
  useEffect(() => {
    loadCollection<any>("/contests")
      .then(setContests)
      .catch((error) => {
        console.warn("Failed to load contests", error);
        setContests(CONTESTS);
      });
  }, []);

  const leaderboard = [...adminUsers]
    .sort(
      (a, b) => b.dsaSolved + b.aptitudeScore - (a.dsaSolved + a.aptitudeScore),
    )
    .map((u, i) => ({
      ...u,
      rank: i + 1,
      xp: u.dsaSolved * 10 + u.aptitudeScore * 2 + u.mockTestsTaken * 15,
    }));

  async function createContest() {
    if (contestForm.name && contestForm.start && contestForm.end) {
      const created = await api.post<any>("/contests", {
        ...contestForm,
        participants: 0,
        status: "upcoming",
      });
      setContests([...contests, created]);
      setContestForm({ name: "", start: "", end: "" });
      setShowContestForm(false);
    }
  }

  const inputSt = {
    background: "var(--muted)",
    border: "1px solid rgba(99,102,241,0.15)",
    color: "var(--foreground)",
    colorScheme: "inherit" as const,
  };

  const MEDAL = ["🥇", "🥈", "🥉"];

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-black"
          style={{ color: "var(--foreground)" }}
        >
          Leaderboard Management
        </h1>
        <p
          className="text-sm mt-1"
          style={{ color: "var(--muted-foreground)" }}
        >
          Manage rankings, contests, and award badges/XP
        </p>
      </div>

      {/* Reset controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(["weekly", "monthly"] as const).map((period) => (
          <div
            key={period}
            className="rounded-2xl p-5 flex items-center justify-between"
            style={{
              background: "var(--card)",
              border: "1px solid rgba(99,102,241,0.1)",
            }}
          >
            <div>
              <p
                className="font-bold capitalize"
                style={{ color: "var(--foreground)" }}
              >
                Reset {period}
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--muted-foreground)" }}
              >
                Clear {period} XP and rankings
              </p>
            </div>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
              style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}
            >
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        ))}
      </div>

      {/* Contests */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: "var(--card)",
          border: "1px solid rgba(99,102,241,0.1)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold" style={{ color: "var(--foreground)" }}>
            Contests
          </h2>
          <button
            onClick={() => setShowContestForm((s) => !s)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
          >
            <Plus size={13} /> New Contest
          </button>
        </div>

        {showContestForm && (
          <div
            className="mb-4 p-4 rounded-xl space-y-3"
            style={{
              background: "var(--muted)",
              border: "1px solid rgba(99,102,241,0.1)",
            }}
          >
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-3">
                <label
                  className="block text-xs font-semibold mb-1"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Contest Name
                </label>
                <input
                  value={contestForm.name}
                  onChange={(e) =>
                    setContestForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Weekly DSA Challenge"
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={inputSt}
                />
              </div>
              <div>
                <label
                  className="block text-xs font-semibold mb-1"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Start Date
                </label>
                <input
                  type="date"
                  value={contestForm.start}
                  onChange={(e) =>
                    setContestForm((f) => ({ ...f, start: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={inputSt}
                />
              </div>
              <div>
                <label
                  className="block text-xs font-semibold mb-1"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  End Date
                </label>
                <input
                  type="date"
                  value={contestForm.end}
                  onChange={(e) =>
                    setContestForm((f) => ({ ...f, end: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={inputSt}
                />
              </div>
              <button
                onClick={createContest}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white"
                style={{
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                }}
              >
                Create
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {contests.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between p-3 rounded-xl"
              style={{ background: "var(--muted)" }}
            >
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  {c.name}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {c.start} → {c.end} · {c.participants} participants
                </p>
              </div>
              <span
                className="px-2.5 py-1 rounded-full text-xs font-bold capitalize"
                style={{
                  background:
                    c.status === "active"
                      ? "rgba(16,185,129,0.15)"
                      : c.status === "upcoming"
                        ? "rgba(99,102,241,0.15)"
                        : "var(--muted)",
                  color:
                    c.status === "active"
                      ? "#34d399"
                      : c.status === "upcoming"
                        ? "#a5b4fc"
                        : "var(--muted-foreground)",
                }}
              >
                {c.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: "var(--card)",
          border: "1px solid rgba(99,102,241,0.1)",
        }}
      >
        <h2 className="font-bold mb-4" style={{ color: "var(--foreground)" }}>
          Current Leaderboard
        </h2>
        <div className="space-y-2">
          {leaderboard.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-3 p-3 rounded-xl transition-all hover:opacity-80 flex-wrap"
              style={{
                background:
                  u.rank <= 3 ? `rgba(99,102,241,0.08)` : "var(--muted)",
              }}
            >
              <span className="text-lg w-7 text-center flex-shrink-0">
                {u.rank <= 3 ? MEDAL[u.rank - 1] : `#${u.rank}`}
              </span>
              <div
                className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm text-white"
                style={{
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                }}
              >
                {u.name[0]}
              </div>
              <div className="flex-1 min-w-0" style={{ minWidth: 120 }}>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  {u.name}
                </p>
                <p
                  className="text-xs truncate"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {u.college} · {u.dsaSolved} DSA
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-black text-sm" style={{ color: "#a5b4fc" }}>
                  {u.xp} XP
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {u.badges.length} badges
                </p>
              </div>
              <button
                onClick={() => setAwardModal(u.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 transition-all hover:opacity-80"
                style={{
                  background: "rgba(99,102,241,0.15)",
                  color: "#a5b4fc",
                }}
              >
                <Medal size={12} /> Award
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Award Modal */}
      {awardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div
            className="w-80 rounded-2xl p-6"
            style={{
              background: "var(--card)",
              border: "1px solid rgba(99,102,241,0.2)",
            }}
          >
            <h3
              className="font-bold mb-4"
              style={{ color: "var(--foreground)" }}
            >
              Award Badge / XP
            </h3>
            <div className="space-y-3">
              <div>
                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Select Badge
                </label>
                <select
                  value={selectedBadge}
                  onChange={(e) => setSelectedBadge(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={inputSt}
                >
                  <option value="">No badge (XP only)</option>
                  {badges.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.emoji} {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Bonus XP
                </label>
                <input
                  type="number"
                  value={xpAmount}
                  onChange={(e) => setXpAmount(+e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={inputSt}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setAwardModal(null)}
                  className="flex-1 py-2 rounded-xl text-sm font-bold text-white"
                  style={{
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  }}
                >
                  Award
                </button>
                <button
                  onClick={() => setAwardModal(null)}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold"
                  style={{
                    background: "var(--muted)",
                    color: "var(--muted-foreground)",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
