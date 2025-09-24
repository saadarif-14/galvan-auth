
import { authManager } from './auth';

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000/api";

function getCookie(name: string): string | undefined {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : undefined;
}

function needsCsrf(method: string) {
  const m = method.toUpperCase();
  return m !== "GET" && m !== "HEAD" && m !== "OPTIONS";
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || "GET").toString().toUpperCase();

  // Choose which CSRF cookie to send
  const isRefresh = path === "/auth/refresh";
  const csrfCookieName = isRefresh ? "csrf_refresh_token" : "csrf_access_token";
  const csrf = needsCsrf(method) ? getCookie(csrfCookieName) : undefined;

  // Ensure we have a valid token before making the request
  if (authManager.isAuthenticated() && !isRefresh) {
    await authManager.ensureValidToken();
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(csrf ? { "X-CSRF-TOKEN": csrf } : {}),
      ...(options.headers || {}),
    },
    credentials: "include",
    cache: "no-store",
  });

  // Handle token expiration
  if (res.status === 401 && !isRefresh) {
    try {
      await authManager.refreshToken();
      // Retry the request once
      const retryRes = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(csrf ? { "X-CSRF-TOKEN": csrf } : {}),
          ...(options.headers || {}),
        },
        credentials: "include",
        cache: "no-store",
      });
      
      if (retryRes.ok) {
        const text = await retryRes.text();
        return text ? JSON.parse(text) : ({} as T);
      }
    } catch {
      // Refresh failed, user needs to login again
      authManager.logout();
      throw new Error('Session expired. Please login again.');
    }
  }

  const text = await res.text();
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const data = JSON.parse(text || "{}");
      message = data?.message || message;
    } catch {
      if (text) message = `${message}: ${text}`;
    }
    throw new Error(message);
  }
  return text ? JSON.parse(text) : ({} as T);
}
