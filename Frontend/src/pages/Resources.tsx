import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import {
  FileText,
  Video,
  BookOpen,
  Map,
  Download,
  ExternalLink,
  Search,
  Filter,
} from "lucide-react";
import { API_BASE_URL } from "../lib/api";

const TYPE_CONFIG = {
  pdf: { icon: FileText, label: "PDF", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  video: { icon: Video, label: "Video", color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
  note: { icon: BookOpen, label: "Note", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  roadmap: { icon: Map, label: "Roadmap", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
};

export default function Resources() {
  const { resources } = useAppContext();
  const [search, setSearch] = useState(() => {
    const value = sessionStorage.getItem("resourceSearch") || "";
    sessionStorage.removeItem("resourceSearch");
    return value;
  });
  const [typeFilter, setTypeFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");

  const topics = ["all", ...Array.from(new Set(resources.map((r) => r.topic)))];
  const types = ["all", "pdf", "video", "note", "roadmap"];

  const filtered = resources.filter((r) => {
    const matchSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      r.topic.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || r.type === typeFilter;
    const matchTopic = topicFilter === "all" || r.topic === topicFilter;
    return matchSearch && matchType && matchTopic;
  });

  function getToken() {
    return (
      localStorage.getItem("prepace_token") ||
      localStorage.getItem("adminToken") ||
      ""
    );
  }

  async function downloadResource(resource) {
    const token = getToken();
    const response = await fetch(
      API_BASE_URL + "/resources/" + resource.id + "/download",
      { headers: token ? { Authorization: "Bearer " + token } : {} }
    );
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error((body && body.message) || "Failed to download resource");
    }

    const blob = await response.blob();
    const disposition = response.headers.get("content-disposition") || "";
    const headerMatch = disposition.match(/filename="([^"]+)"/);
    const headerName = headerMatch ? headerMatch[1] : null;
    const extMatch = resource.originalFilename
      ? resource.originalFilename.match(/\.([a-zA-Z0-9]{2,8})$/)
      : null;
    const fallbackExt = (extMatch && extMatch[1]) || (resource.type === "pdf" ? "pdf" : "bin");
    const fallbackBase = String(
      resource.title || resource.originalFilename || "resource"
    ).replace(/\.[^.]+$/, "");
    const filename = headerName || fallbackBase + "." + fallbackExt;
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  }

  async function openResource(resource) {
    const token = getToken();
    const response = await fetch(
      API_BASE_URL + "/resources/" + resource.id + "/open",
      {
        method: "GET",
        headers: token ? { Authorization: "Bearer " + token } : {},
        redirect: "manual",
      }
    );

    if (response.type === "opaqueredirect" || response.status === 0) {
      const fallbackUrl =
        API_BASE_URL + "/resources/" + resource.id + "/open" +
        (token ? "?token=" + encodeURIComponent(token) : "");
      window.open(fallbackUrl, "_blank", "noopener,noreferrer");
      return;
    }

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error((body && body.message) || "Failed to open resource");
    }
    window.open(response.url, "_blank", "noopener,noreferrer");
  }

  const grouped = {};
  filtered.forEach((r) => {
    if (!grouped[r.topic]) grouped[r.topic] = [];
    grouped[r.topic].push(r);
  });

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black mb-1">Resources</h1>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Study materials, guides, and references curated by your placement team
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {Object.entries(TYPE_CONFIG).map(([type, cfg]) => {
          const count = resources.filter((r) => r.type === type).length;
          const Icon = cfg.icon;
          return (
            <div key={type} className="p-4 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{ background: cfg.bg }}>
                <Icon size={16} style={{ color: cfg.color }} />
              </div>
              <div className="text-xl font-black" style={{ color: cfg.color }}>{count}</div>
              <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>{cfg.label}s</div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resources..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className="px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all"
              style={{
                background: typeFilter === t ? "var(--primary)" : "var(--card)",
                color: typeFilter === t ? "white" : "var(--muted-foreground)",
                border: "1px solid var(--border)",
              }}
            >
              {t === "all" ? "All Types" : t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Filter size={14} style={{ color: "var(--muted-foreground)", marginTop: 4 }} />
        {topics.map((t) => (
          <button
            key={t}
            onClick={() => setTopicFilter(t)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all capitalize"
            style={{
              background: topicFilter === t ? "rgba(99,102,241,0.15)" : "var(--muted)",
              color: topicFilter === t ? "var(--primary)" : "var(--muted-foreground)",
              border: "1px solid " + (topicFilter === t ? "rgba(99,102,241,0.3)" : "transparent"),
            }}
          >
            {t === "all" ? "All Topics" : t}
          </button>
        ))}
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-20" style={{ color: "var(--muted-foreground)" }}>
          <BookOpen size={48} className="mx-auto mb-3 opacity-20" />
          <p className="font-semibold text-lg">No resources found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([topic, items]) => (
            <div key={topic}>
              <h2 className="text-sm font-black uppercase tracking-wider mb-3" style={{ color: "var(--muted-foreground)" }}>
                {topic}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((r) => {
                  const cfg = TYPE_CONFIG[r.type];
                  const Icon = cfg.icon;
                  const hasStorageKey = Boolean(r.storageKey);
                  const isPdfDownload = r.type === "pdf" && hasStorageKey;
                  const isSecureOpen = !isPdfDownload && hasStorageKey;
                  const isPlainLink = !hasStorageKey;

                  return (
                    <div
                      key={r.id}
                      className="group p-4 rounded-2xl transition-all hover:scale-[1.01]"
                      style={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: cfg.bg }}
                        >
                          <Icon size={18} style={{ color: cfg.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="font-semibold text-sm leading-tight"
                            style={{ color: "var(--foreground)" }}
                          >
                            {r.title}
                          </p>
                          <span
                            className="text-xs font-semibold mt-0.5 inline-block"
                            style={{ color: cfg.color }}
                          >
                            {cfg.label}
                          </span>
                        </div>
                      </div>
                      <p
                        className="text-xs mb-3 leading-relaxed"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {r.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          {new Date(r.uploadedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>

                        {isPdfDownload && (
                          <button
                            onClick={() =>
                              downloadResource(r).catch((error) =>
                                alert(
                                  error.message ||
                                    "Failed to download resource",
                                ),
                              )
                            }
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                            style={{ background: cfg.bg, color: cfg.color }}
                          >
                            <Download size={12} />
                            Download
                          </button>
                        )}

                        {isSecureOpen && (
                          <button
                            onClick={() =>
                              openResource(r).catch((error) =>
                                alert(
                                  error.message || "Failed to open resource",
                                ),
                              )
                            }
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                            style={{ background: cfg.bg, color: cfg.color }}
                          >
                            <ExternalLink size={12} />
                            Open
                          </button>
                        )}

                        {isPlainLink && (
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                            style={{ background: cfg.bg, color: cfg.color }}
                          >
                            <ExternalLink size={12} />
                            Open
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}