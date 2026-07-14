import { useState } from "react";
import { useAppContext, type Resource } from "../../context/AppContext";
import {
  Plus,
  Pencil,
  Trash2,
  FileText,
  Video,
  BookOpen,
  Map,
  ExternalLink,
  Upload,
} from "lucide-react";
import { resourceService } from "../../lib/services";
import { normalizeId, API_BASE_URL } from "../../lib/api";

const TYPE_ICONS = {
  pdf: FileText,
  video: Video,
  note: BookOpen,
  roadmap: Map,
};
const TYPE_COLORS = {
  pdf: "#ef4444",
  video: "#6366f1",
  note: "#10b981",
  roadmap: "#f59e0b",
};
const TYPES = ["pdf", "video", "note", "roadmap"] as const;
const TOPICS = [
  "DSA",
  "Aptitude",
  "System Design",
  "Interview Prep",
  "Verbal",
  "Logical Reasoning",
  "Quantitative",
  "Technical",
  "HR",
  "Company Specific",
  "General",
];
const MAX_UPLOAD_MB = 20;

const inputSt = {
  background: "var(--muted)",
  border: "1px solid rgba(99,102,241,0.15)",
  color: "var(--foreground)",
  colorScheme: "inherit" as const,
};
const inputCls = "w-full px-3 py-2 rounded-lg text-sm outline-none";

function getToken() {
  return (
    localStorage.getItem("prepace_token") ||
    localStorage.getItem("adminToken") ||
    ""
  );
}

async function openResource(resource: Resource) {
  const token = getToken();
  const response = await fetch(
    `${API_BASE_URL}/resources/${resource.id}/open`,
    {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      redirect: "manual",
    },
  );

  if (response.type === "opaqueredirect" || response.status === 0) {
    window.open(
      `${API_BASE_URL}/resources/${resource.id}/open${token ? `?token=${encodeURIComponent(token)}` : ""}`,
      "_blank",
      "noopener,noreferrer",
    );
    return;
  }

  if (!response.ok) throw new Error("Failed to open resource");
  window.open(response.url, "_blank", "noopener,noreferrer");
}

function ResourceForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Partial<Resource>;
  onSave: (r: any) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    title: initial.title ?? "",
    type: (initial.type ?? "pdf") as Resource["type"],
    url: initial.url ?? "",
    topic: initial.topic ?? "DSA",
    description: initial.description ?? "",
    storageKey: (initial as any).storageKey ?? "",
    storageProvider: (initial as any).storageProvider ?? "",
    mimeType: (initial as any).mimeType ?? "",
    size: (initial as any).size ?? undefined,
    cloudinaryPublicId: (initial as any).cloudinaryPublicId ?? "",
    cloudinaryResourceType: (initial as any).cloudinaryResourceType ?? "",
    cloudinaryFormat: (initial as any).cloudinaryFormat ?? "",
    originalFilename: (initial as any).originalFilename ?? "",
  });
  const [uploading, setUploading] = useState(false);
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  async function handleFile(file: File) {
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      alert(`File is too large. Maximum upload size is ${MAX_UPLOAD_MB}MB.`);
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      const uploadResourceType = file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("video/")
          ? "video"
          : "raw";
      const folder = `prepace/resources/${form.topic.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
      const uploaded: any = await resourceService.upload({
        file: dataUrl,
        folder,
        resourceType: uploadResourceType,
        filename: file.name,
        type: form.type,
      });
      set("url", uploaded.url);
      set("storageKey", uploaded.storageKey);
      set("storageProvider", uploaded.provider);
      set("mimeType", uploaded.contentType);
      set("size", uploaded.bytes);
      set("cloudinaryPublicId", uploaded.publicId);
      set("cloudinaryResourceType", uploaded.resourceType);
      set("cloudinaryFormat", uploaded.format);
      set("originalFilename", uploaded.originalFilename || file.name);
      if (!form.title) set("title", file.name.replace(/\.[^.]+$/, ""));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label
            className="block text-xs font-semibold mb-1.5"
            style={{ color: "var(--muted-foreground)" }}
          >
            Title
          </label>
          <input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="DSA Sheet - 150 Problems"
            className={inputCls}
            style={inputSt}
          />
        </div>
        <div>
          <label
            className="block text-xs font-semibold mb-1.5"
            style={{ color: "var(--muted-foreground)" }}
          >
            Type
          </label>
          <select
            value={form.type}
            onChange={(e) => set("type", e.target.value)}
            className={inputCls}
            style={inputSt}
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            className="block text-xs font-semibold mb-1.5"
            style={{ color: "var(--muted-foreground)" }}
          >
            Topic
          </label>
          <select
            value={form.topic}
            onChange={(e) => set("topic", e.target.value)}
            className={inputCls}
            style={inputSt}
          >
            {TOPICS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <label
            className="block text-xs font-semibold mb-1.5"
            style={{ color: "var(--muted-foreground)" }}
          >
            URL / Link or Upload File
          </label>
          <div className="flex gap-2">
            <input
              value={form.url}
              onChange={(e) => {
                set("url", e.target.value);
                set("storageKey", "");
                set("storageProvider", "");
              }}
              placeholder="https://..."
              className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
              style={inputSt}
            />
            <label
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer flex-shrink-0 hover:opacity-80 transition-all"
              style={{
                background: "rgba(99,102,241,0.2)",
                color: "#a5b4fc",
                border: "1px solid rgba(99,102,241,0.3)",
              }}
            >
              <Upload size={13} /> {uploading ? "Uploading..." : "Upload"}
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md,image/*,video/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </label>
          </div>
          {form.storageKey && (
            <p
              className="text-xs mt-1"
              style={{ color: "var(--muted-foreground)" }}
            >
              File uploaded to storage — will open securely.
            </p>
          )}
        </div>
      </div>
      <div>
        <label
          className="block text-xs font-semibold mb-1.5"
          style={{ color: "var(--muted-foreground)" }}
        >
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={2}
          className={inputCls + " resize-none"}
          style={inputSt}
        />
      </div>
      <div className="flex gap-3">
        <button
          disabled={uploading}
          onClick={() =>
            onSave({
              ...form,
              id: (initial as any).id ?? Date.now().toString(),
              uploadedAt: new Date().toISOString().split("T")[0],
            })
          }
          className="px-5 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
        >
          {uploading ? "Uploading..." : "Save Resource"}
        </button>
        <button
          onClick={onCancel}
          className="px-5 py-2 rounded-xl text-sm font-semibold"
          style={{
            background: "var(--muted)",
            color: "var(--muted-foreground)",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function AdminResourcePage() {
  const { resources, setResources } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Resource | null>(null);
  const [filterType, setFilterType] = useState<"" | Resource["type"]>("");
  const [filterTopic, setFilterTopic] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function saveResource(r: Resource) {
    const existing = resources.find((x) => x.id === r.id);
    const { id, uploadedAt, ...payload } = r as any;
    try {
      const saved = existing
        ? await resourceService.update(existing.id, payload)
        : await resourceService.create(payload);
      const normalized = {
        ...(normalizeId(saved as any) as Resource),
        __synced: true,
      } as any;
      if (existing)
        setResources(
          resources.map((x) => (x.id === existing.id ? normalized : x)),
        );
      else setResources([normalized, ...resources]);
      setShowForm(false);
      setEditing(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save resource");
    }
  }

  async function deleteResource(id: string) {
    if (deletingId) return;
    setDeletingId(id);
    try {
      await resourceService.delete(id);
      setResources(
        resources
          .filter((x) => x.id !== id)
          .map((resource) => ({ ...resource, __synced: true }) as any),
      );
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Failed to delete resource",
      );
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = resources.filter(
    (r) =>
      (!filterType || r.type === filterType) &&
      (!filterTopic || r.topic === filterTopic),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-black"
            style={{ color: "var(--foreground)" }}
          >
            Resource Management
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--muted-foreground)" }}
          >
            {resources.length} resources published
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditing(null);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
        >
          <Plus size={16} /> Add Resource
        </button>
      </div>

      {(showForm || editing) && (
        <div
          className="rounded-2xl p-6"
          style={{
            background: "var(--card)",
            border: "1px solid rgba(99,102,241,0.2)",
          }}
        >
          <h2 className="font-bold mb-4" style={{ color: "var(--foreground)" }}>
            {editing ? "Edit Resource" : "New Resource"}
          </h2>
          <ResourceForm
            initial={editing ?? {}}
            onSave={saveResource}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
          />
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <div className="flex gap-1">
          {(["", ...TYPES] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t as any)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all"
              style={{
                background:
                  filterType === t ? "rgba(99,102,241,0.2)" : "var(--muted)",
                color: filterType === t ? "#a5b4fc" : "var(--muted-foreground)",
              }}
            >
              {t || "All"}
            </button>
          ))}
        </div>
        <select
          value={filterTopic}
          onChange={(e) => setFilterTopic(e.target.value)}
          className="px-3 py-2 rounded-xl text-sm outline-none"
          style={{
            background: "var(--muted)",
            border: "1px solid rgba(99,102,241,0.15)",
            color: "var(--foreground)",
            colorScheme: "inherit",
          }}
        >
          <option value="">All Topics</option>
          {TOPICS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3">
        {filtered.map((r) => {
          const Icon = TYPE_ICONS[r.type];
          const color = TYPE_COLORS[r.type];
          const hasStorageKey = Boolean((r as any).storageKey);
          return (
            <div
              key={r.id}
              className="flex items-center gap-4 p-4 rounded-2xl"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}15` }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  {r.title}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {r.topic} · {r.type} · {r.uploadedAt}
                </p>
                {r.description && (
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {r.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {r.url &&
                  r.url !== "#" &&
                  (hasStorageKey ? (
                    <button
                      onClick={() =>
                        openResource(r).catch((error) =>
                          alert(
                            error instanceof Error
                              ? error.message
                              : "Failed to open resource",
                          ),
                        )
                      }
                      className="p-1.5 rounded-lg hover:opacity-70"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      <ExternalLink size={13} />
                    </button>
                  ) : (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg hover:opacity-70"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      <ExternalLink size={13} />
                    </a>
                  ))}
                <button
                  onClick={() => {
                    setEditing(r);
                    setShowForm(false);
                  }}
                  className="p-1.5 rounded-lg hover:opacity-70"
                  style={{ color: "#a5b4fc" }}
                >
                  <Pencil size={13} />
                </button>
                <button
                  disabled={deletingId === r.id}
                  onClick={() => deleteResource(r.id)}
                  className="p-1.5 rounded-lg hover:opacity-70 disabled:opacity-40"
                  style={{ color: "#f87171" }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div
            className="text-center py-8"
            style={{ color: "var(--muted-foreground)" }}
          >
            No resources found.
          </div>
        )}
      </div>
    </div>
  );
}
