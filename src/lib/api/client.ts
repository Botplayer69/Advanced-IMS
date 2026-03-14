/**
 * Centralised HTTP client for the FastAPI backend.
 * All API functions in this folder import from here — no page
 * components need to change.
 *
 * The JWT token is persisted in localStorage under "ims_token".
 * On 401 responses the token is cleared so the app can redirect to login.
 */
const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

function getToken(): string | null {
  return localStorage.getItem("ims_token");
}

export function setToken(token: string) {
  localStorage.setItem("ims_token", token);
}

export function clearToken() {
  localStorage.removeItem("ims_token");
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    throw new Error("Unauthorised — please log in again.");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.detail ?? `Request failed: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
