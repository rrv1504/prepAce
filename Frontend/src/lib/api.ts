const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type ApiOptions = RequestInit & { auth?: boolean };

function getToken() {
  const adminToken = localStorage.getItem("adminToken") || "";
  const studentToken = localStorage.getItem("prepace_token") || "";
  return sessionStorage.getItem("admin_auth") === "true" && adminToken
    ? adminToken
    : studentToken || adminToken;
}

export function normalizeId<T extends Record<string, any>>(item: T): T {
  if (!item || typeof item !== "object") return item;
  return { ...item, id: item.id ?? item._id };
}

export function normalizeList<T extends Record<string, any>>(
  items: T[] = [],
): T[] {
  return items.map(normalizeId);
}

async function request<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body)
    headers.set("Content-Type", "application/json");

  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || `Request failed: ${response.status}`);
  }

  return (payload.data ?? payload.items ?? payload) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body ?? {}) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body ?? {}) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export async function loadCollection<T extends Record<string, any>>(
  path: string,
): Promise<T[]> {
  const data = await api.get<T[] | { items?: T[] }>(path);
  const items = Array.isArray(data) ? data : (data.items ?? []);
  return normalizeList(items);
}

export { API_BASE_URL };
