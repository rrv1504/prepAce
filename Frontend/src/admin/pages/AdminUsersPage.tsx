import { useEffect, useState } from "react";
import { useAppContext, type AdminUser } from "../../context/AppContext";
import { notificationService, userService } from "../../lib/services";
import { normalizeList } from "../../lib/api";
import {
  Search,
  Filter,
  Eye,
  UserX,
  UserCheck,
  Trash2,
  Bell,
  X,
  TrendingUp,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";

const FILTERS = {
  college: ["IIT Delhi", "NIT Surat", "BITS Pilani", "VIT Vellore"],
  year: ["1st", "2nd", "3rd", "4th"],
  branch: ["CSE", "IT", "ECE", "EEE", "ME"],
  status: ["active", "suspended"],
  placementStatus: ["seeking", "placed", "not_seeking"],
};

const cardSt = { background: "var(--card)", border: "1px solid var(--border)" };

// ── UserDetailPanel stays exactly as you had it (no API changes needed there yet) ──
function UserDetailPanel({
  user,
  onClose,
  badges,
}: {
  user: AdminUser;
  onClose: () => void;
  badges: any[];
}) {
  const [notifMsg, setNotifMsg] = useState("");
  const [showNotif, setShowNotif] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  async function sendNotification() {
    if (!notifMsg.trim()) return;
    setSending(true);
    setSendError("");
    try {
      await notificationService.create({
        title: "Message from admin",
        body: notifMsg.trim(),
        user: user.id,
        type: "admin",
        icon: "Bell",
        iconColor: "#6366f1",
      });
      setSent(true);
      setShowNotif(false);
      setNotifMsg("");
      setTimeout(() => setSent(false), 3000);
    } catch (error) {
      setSendError(error instanceof Error ? error.message : "Failed to send notification");
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)" }}
    >
      <div
        className="h-full w-full max-w-lg overflow-y-auto"
        style={{
          background: "var(--card)",
          borderLeft: "1px solid var(--border)",
        }}
      >
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <h2 className="font-black" style={{ color: "var(--foreground)" }}>
            Student Profile
          </h2>
          <button
            onClick={onClose}
            style={{ color: "var(--muted-foreground)" }}
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
            >
              {user.name[0]}
            </div>
            <div>
              <h3
                className="text-lg font-black"
                style={{ color: "var(--foreground)" }}
              >
                {user.name}
              </h3>
              <p
                className="text-sm"
                style={{ color: "var(--muted-foreground)" }}
              >
                {user.email}
              </p>
              <div className="flex gap-2 mt-1 flex-wrap">
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{
                    background:
                      user.status === "active"
                        ? "rgba(16,185,129,0.15)"
                        : "rgba(239,68,68,0.15)",
                    color: user.status === "active" ? "#34d399" : "#f87171",
                  }}
                >
                  {user.status}
                </span>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{
                    background: "rgba(245,158,11,0.15)",
                    color: "#f59e0b",
                  }}
                >
                  {user.placementStatus.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              ["College", user.college],
              ["Branch", user.branch],
              ["Year", user.year],
              ["Joined", user.joinedAt],
              ["Last Active", user.lastActive],
            ].map(([k, v]) => (
              <div
                key={k}
                className="p-2.5 rounded-xl"
                style={{ background: "var(--muted)" }}
              >
                <p
                  className="mb-0.5"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {k}
                </p>
                <p
                  className="font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  {v}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div
              className="p-3 rounded-xl text-center"
              style={{
                background: "rgba(99,102,241,0.1)",
                border: "1px solid rgba(99,102,241,0.2)",
              }}
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                <Zap size={14} style={{ color: "#a5b4fc" }} />
                <span
                  className="text-xl font-black"
                  style={{ color: "#a5b4fc" }}
                >
                  {user.totalXP.toLocaleString()}
                </span>
              </div>
              <p
                className="text-xs"
                style={{ color: "var(--muted-foreground)" }}
              >
                Total XP
              </p>
            </div>
            <div
              className="p-3 rounded-xl text-center"
              style={{
                background: "rgba(249,115,22,0.1)",
                border: "1px solid rgba(249,115,22,0.2)",
              }}
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-xl">🔥</span>
                <span
                  className="text-xl font-black"
                  style={{ color: "#f97316" }}
                >
                  {user.dsaStreak}
                </span>
              </div>
              <p
                className="text-xs"
                style={{ color: "var(--muted-foreground)" }}
              >
                Day Streak
              </p>
            </div>
          </div>

          <div>
            <p
              className="text-xs font-bold mb-3"
              style={{ color: "var(--primary)" }}
            >
              Learning Progress
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                {
                  label: "DSA Solved",
                  value: user.dsaSolved,
                  max: 200,
                  color: "#6366f1",
                },
                {
                  label: "Aptitude Score",
                  value: user.aptitudeScore,
                  max: 100,
                  color: "#10b981",
                  suffix: "%",
                },
                {
                  label: "Mock Tests",
                  value: user.mockTestsTaken,
                  max: 30,
                  color: "#8b5cf6",
                },
              ].map((s) => (
                <div key={s.label} className="p-2.5 rounded-xl" style={cardSt}>
                  <p
                    className="text-lg font-black"
                    style={{ color: "var(--foreground)" }}
                  >
                    {s.value}
                    {s.suffix ?? ""}
                  </p>
                  <div
                    className="w-full h-1.5 rounded-full my-1"
                    style={{ background: "var(--muted)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (s.value / s.max) * 100)}%`,
                        background: s.color,
                      }}
                    />
                  </div>
                  <p
                    className="text-xs"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Courses Completed", value: user.coursesCompleted },
              { label: "Aptitude Tests", value: user.aptitudeTests },
            ].map((s) => (
              <div
                key={s.label}
                className="p-3 rounded-xl flex items-center gap-3"
                style={cardSt}
              >
                <TrendingUp size={16} style={{ color: "var(--primary)" }} />
                <div>
                  <p
                    className="font-bold"
                    style={{ color: "var(--foreground)" }}
                  >
                    {s.value}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {s.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {(user.strongTopics.length > 0 || user.weakTopics.length > 0) && (
            <div className="grid grid-cols-2 gap-3">
              {user.strongTopics.length > 0 && (
                <div>
                  <p
                    className="text-xs font-semibold mb-1.5"
                    style={{ color: "#34d399" }}
                  >
                    💪 Strong Topics
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {user.strongTopics.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-full text-xs"
                        style={{
                          background: "rgba(16,185,129,0.1)",
                          color: "#34d399",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {user.weakTopics.length > 0 && (
                <div>
                  <p
                    className="text-xs font-semibold mb-1.5"
                    style={{ color: "#f87171" }}
                  >
                    ⚠️ Needs Work
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {user.weakTopics.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-full text-xs"
                        style={{
                          background: "rgba(239,68,68,0.1)",
                          color: "#f87171",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <p
              className="text-xs font-bold mb-2"
              style={{ color: "var(--muted-foreground)" }}
            >
              Badges Earned ({user.badges.length})
            </p>
            <div className="flex gap-2 flex-wrap">
              {user.badges.map((bid) => {
                const badge = badges.find((b) => b.id === bid);
                return badge ? (
                  <span
                    key={bid}
                    className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: `${badge.color}15`,
                      color: badge.color,
                      border: `1px solid ${badge.color}30`,
                    }}
                  >
                    {badge.emoji} {badge.name}
                  </span>
                ) : null;
              })}
              {user.badges.length === 0 && (
                <p
                  className="text-xs"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  No badges yet
                </p>
              )}
            </div>
          </div>

          {/* Send notification — UI only until a /users/:id/notify route exists */}
          <div
            style={{ borderTop: "1px solid var(--border)", paddingTop: "16px" }}
          >
            <p
              className="text-xs font-bold mb-2"
              style={{ color: "var(--muted-foreground)" }}
            >
              Send Notification
            </p>
            {sent ? (
              <div
                className="px-3 py-2 rounded-lg text-xs"
                style={{ background: "rgba(16,185,129,0.1)", color: "#34d399" }}
              >
                ✓ Notification sent!
              </div>
            ) : showNotif ? (
              <div className="space-y-2">
                {sendError && (
                  <div className="px-3 py-2 rounded-lg text-xs" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}>
                    {sendError}
                  </div>
                )}
                <textarea
                  value={notifMsg}
                  onChange={(e) => setNotifMsg(e.target.value)}
                  rows={2}
                  placeholder="Type your message..."
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                  style={{
                    background: "var(--muted)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                />
                <div className="flex gap-2">
                  <button
                    disabled={sending || !notifMsg.trim()}
                    onClick={sendNotification}
                    className="flex-1 py-2 rounded-xl text-sm font-bold text-white"
                    style={{
                      background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                      opacity: sending || !notifMsg.trim() ? 0.6 : 1,
                    }}
                  >
                    {sending ? "Sending..." : "Send"}
                  </button>
                  <button
                    onClick={() => setShowNotif(false)}
                    className="px-4 py-2 rounded-xl text-sm"
                    style={{
                      background: "var(--muted)",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowNotif(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-80"
                style={{
                  background: "rgba(99,102,241,0.1)",
                  color: "var(--primary)",
                }}
              >
                <Bell size={14} /> Notify User
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const { badges } = useAppContext(); // badges still come from context/local seed — swap to badgeService.listAll() if you want that live too

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [viewUser, setViewUser] = useState<AdminUser | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  async function fetchUsers() {
    setLoading(true);
    setError("");
    try {
      const data = await userService.listAll();
      setUsers(normalizeList(data as any[]));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function runAction(id: string, fn: () => Promise<void>) {
    setPendingActionId(id);
    setActionError("");
    try {
      await fn();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setPendingActionId(null);
    }
  }

  function toggleStatus(id: string) {
    const target = users.find((u) => u.id === id);
    if (!target) return;
    const newStatus = target.status === "active" ? "suspended" : "active";
    runAction(id, async () => {
      const updated = await userService.updateStatus(id, newStatus);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...updated } : u)),
      );
    });
  }

  function approveRegistration(id: string) {
    runAction(id, async () => {
      const updated = await userService.updateStatus(id, "active");
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...updated } : u)),
      );
    });
  }

  function rejectRegistration(id: string) {
    // No 'rejected' status in the schema yet, so this deletes the pending signup.
    runAction(id, async () => {
      await userService.delete(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    });
  }

  function deleteUser(id: string) {
    runAction(id, async () => {
      await userService.delete(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    });
  }

  const pendingUsers = users.filter((u) => u.status === "pending");
  const activeUsers = users.filter((u) => u.status !== "pending");

  const filtered = activeUsers.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.college.toLowerCase().includes(q);
    const matchFilters = Object.entries(filters).every(
      ([k, v]) => !v || (u as any)[k] === v,
    );
    return matchSearch && matchFilters;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2
          size={24}
          className="animate-spin"
          style={{ color: "var(--primary)" }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <AlertCircle size={24} style={{ color: "#f87171" }} />
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          {error}
        </p>
        <button
          onClick={fetchUsers}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {viewUser && (
        <UserDetailPanel
          user={viewUser}
          onClose={() => setViewUser(null)}
          badges={badges}
        />
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1
            className="text-2xl font-black"
            style={{ color: "var(--foreground)" }}
          >
            User Management
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--muted-foreground)" }}
          >
            {activeUsers.length} active students · {pendingUsers.length} pending
            approval
          </p>
        </div>
        <button
          onClick={() => setShowFilters((s) => !s)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: showFilters ? "rgba(99,102,241,0.15)" : "var(--muted)",
            color: showFilters ? "var(--primary)" : "var(--muted-foreground)",
          }}
        >
          <Filter size={15} /> Filters
        </button>
      </div>

      {actionError && (
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs"
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.25)",
            color: "#f87171",
          }}
        >
          <AlertCircle size={14} /> {actionError}
        </div>
      )}

      <div className="relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "var(--muted-foreground)" }}
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, college..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
          style={{
            background: "var(--muted)",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
          }}
        />
      </div>

      {showFilters && (
        <div
          className="rounded-xl p-4 grid grid-cols-2 sm:grid-cols-3 gap-3"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
          }}
        >
          {Object.entries(FILTERS).map(([key, vals]) => (
            <div key={key}>
              <label
                className="block text-xs font-semibold mb-1.5 capitalize"
                style={{ color: "var(--muted-foreground)" }}
              >
                {key}
              </label>
              <select
                value={filters[key] ?? ""}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, [key]: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                style={{
                  background: "var(--muted)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                  colorScheme: "inherit",
                }}
              >
                <option value="">All</option>
                {vals.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <div className="col-span-2 sm:col-span-3">
            <button
              onClick={() => setFilters({})}
              className="text-xs hover:opacity-70"
              style={{ color: "var(--primary)" }}
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}

      {pendingUsers.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "var(--card)",
            border: "1px solid rgba(245,158,11,0.4)",
          }}
        >
          <div
            className="flex items-center gap-2 px-4 py-3"
            style={{
              background: "rgba(245,158,11,0.08)",
              borderBottom: "1px solid rgba(245,158,11,0.2)",
            }}
          >
            <Clock size={14} style={{ color: "#f59e0b" }} />
            <span className="text-sm font-bold" style={{ color: "#f59e0b" }}>
              Pending Approvals ({pendingUsers.length})
            </span>
            <span
              className="text-xs ml-1"
              style={{ color: "var(--muted-foreground)" }}
            >
              — Review and approve new user registrations
            </span>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {pendingUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-3 px-4 py-3 flex-wrap"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg,#f59e0b,#f97316)",
                  }}
                >
                  {u.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold text-sm"
                    style={{ color: "var(--foreground)" }}
                  >
                    {u.name}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {u.email} · {u.college} · {u.branch} · {u.year} Year
                  </p>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                  style={{
                    background: "rgba(245,158,11,0.12)",
                    color: "#f59e0b",
                    border: "1px solid rgba(245,158,11,0.3)",
                  }}
                >
                  <Clock size={10} /> Pending
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={pendingActionId === u.id}
                    onClick={() => approveRegistration(u.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                    style={{
                      background: "rgba(16,185,129,0.12)",
                      color: "#10b981",
                      border: "1px solid rgba(16,185,129,0.25)",
                    }}
                  >
                    <CheckCircle2 size={12} /> Approve
                  </button>
                  <button
                    disabled={pendingActionId === u.id}
                    onClick={() => rejectRegistration(u.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                    style={{
                      background: "rgba(239,68,68,0.1)",
                      color: "#ef4444",
                      border: "1px solid rgba(239,68,68,0.25)",
                    }}
                  >
                    <XCircle size={12} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        className="rounded-2xl overflow-x-auto"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {[
                "Name",
                "College / Branch",
                "Year",
                "Status",
                "DSA",
                "Aptitude",
                "Tests",
                "XP",
                "Streak",
                "",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-3 py-3 font-semibold whitespace-nowrap"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr
                key={u.id}
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <td className="px-3 py-3">
                  <div>
                    <p
                      className="font-semibold"
                      style={{ color: "var(--foreground)" }}
                    >
                      {u.name}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {u.email}
                    </p>
                  </div>
                </td>
                <td
                  className="px-3 py-3 whitespace-nowrap"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {u.college} / {u.branch}
                </td>
                <td
                  className="px-3 py-3"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {u.year}
                </td>
                <td className="px-3 py-3">
                  <span
                    className="px-2 py-0.5 rounded-full font-bold"
                    style={{
                      background:
                        u.status === "active"
                          ? "rgba(16,185,129,0.15)"
                          : u.status === "suspended"
                            ? "rgba(239,68,68,0.15)"
                            : "rgba(245,158,11,0.15)",
                      color:
                        u.status === "active"
                          ? "#34d399"
                          : u.status === "suspended"
                            ? "#f87171"
                            : "#f59e0b",
                    }}
                  >
                    {u.status}
                  </span>
                </td>
                <td
                  className="px-3 py-3 font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  {u.dsaSolved}
                </td>
                <td
                  className="px-3 py-3 font-semibold"
                  style={{
                    color:
                      u.aptitudeScore >= 80
                        ? "#34d399"
                        : u.aptitudeScore >= 60
                          ? "#f59e0b"
                          : "#f87171",
                  }}
                >
                  {u.aptitudeScore}%
                </td>
                <td
                  className="px-3 py-3"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {u.mockTestsTaken}
                </td>
                <td className="px-3 py-3" style={{ color: "var(--primary)" }}>
                  {u.totalXP.toLocaleString()}
                </td>
                <td className="px-3 py-3">
                  {u.dsaStreak > 0 ? (
                    <span style={{ color: "#f97316" }}>🔥{u.dsaStreak}</span>
                  ) : (
                    <span style={{ color: "var(--muted-foreground)" }}>—</span>
                  )}
                </td>
                <td className="px-3 py-3">
                  <div className="flex gap-1 justify-end">
                    <button
                      onClick={() => setViewUser(u)}
                      title="View"
                      className="p-1.5 rounded-lg hover:opacity-70"
                      style={{ color: "var(--primary)" }}
                    >
                      <Eye size={13} />
                    </button>
                    <button
                      disabled={pendingActionId === u.id}
                      onClick={() => toggleStatus(u.id)}
                      title={u.status === "active" ? "Suspend" : "Activate"}
                      className="p-1.5 rounded-lg hover:opacity-70 disabled:opacity-50"
                      style={{
                        color: u.status === "active" ? "#f59e0b" : "#10b981",
                      }}
                    >
                      {u.status === "active" ? (
                        <UserX size={13} />
                      ) : (
                        <UserCheck size={13} />
                      )}
                    </button>
                    <button
                      disabled={pendingActionId === u.id}
                      onClick={() => deleteUser(u.id)}
                      className="p-1.5 rounded-lg hover:opacity-70 disabled:opacity-50"
                      style={{ color: "#f87171" }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={10}
                  className="px-4 py-8 text-center"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  No students match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
