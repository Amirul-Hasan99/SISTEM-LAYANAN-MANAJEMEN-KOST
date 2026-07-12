import type { UserSession } from "@/types";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const TOKEN_KEY = "kosthub_token";

export function apiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export function getAuthToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

export function authHeaders(headers?: HeadersInit): HeadersInit {
  const mergedHeaders = new Headers(headers);
  const token = getAuthToken();
  if (token) mergedHeaders.set("Authorization", `Bearer ${token}`);
  return mergedHeaders;
}

export function apiFetch(path: string, init?: RequestInit) {
  return fetch(apiUrl(path), {
    ...init,
    headers: authHeaders(init?.headers),
  });
}

export function normalizeUserSession(user: any): UserSession {
  return {
    userId: user.userId || user.id,
    email: user.email,
    role: String(user.role || "").toLowerCase() === "admin" ? "admin" : "user",
    name: user.name || user.fullName,
    avatar: user.avatar,
  };
}

let fetchInterceptorInstalled = false;

export function installApiFetchInterceptor() {
  if (typeof window === "undefined" || fetchInterceptorInstalled) return;

  const nativeFetch = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    if (typeof input !== "string") {
      return nativeFetch(input, init);
    }

    const apiPathIndex = input.indexOf("/api/");
    const shouldNormalizeUrl =
      input.startsWith("/api/") ||
      input.startsWith("undefined/api/") ||
      input.startsWith("http://localhost:4000/api/");

    const finalInput =
      shouldNormalizeUrl && apiPathIndex >= 0
        ? apiUrl(input.slice(apiPathIndex))
        : input;

    const finalInit =
      apiPathIndex >= 0
        ? { ...init, headers: authHeaders(init?.headers) }
        : init;

    return nativeFetch(finalInput, finalInit);
  };

  fetchInterceptorInstalled = true;
}
