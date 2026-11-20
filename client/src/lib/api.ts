const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
export function token() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("gv_token") || "";
}
export async function api(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
      ...(options.headers || {}),
    },
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}
export function saveSession(data: any) {
  localStorage.setItem("gv_token", data.token);
  localStorage.setItem("gv_user", JSON.stringify(data.user));
}
