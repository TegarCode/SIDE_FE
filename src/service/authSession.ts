import { AUTH_SESSION_TTL_DAYS } from "@/constants/auth";
import { apiClient } from "@/service/httpClient";
import type { AuthUser } from "@/type/auth";

const KEY_TOKEN = "authToken";
const KEY_TOKEN_TYPE = "token_type";
const KEY_EXP = "auth_exp_at";
export const AUTH_SESSION_CHANGED_EVENT = "auth-session-changed";

let currentAuthUser: AuthUser | null = null;
let authUserResolved = false;
let currentAuthError: string | null = null;

type SessionPayload = {
  token: string | null;
  tokenType?: string;
  user: AuthUser | null;
  remember?: boolean;
};

function setAuthHeader(tokenType = "Bearer", token?: string | null) {
  if (!token) {
    delete apiClient.defaults.headers.common.Authorization;
    return;
  }

  apiClient.defaults.headers.common.Authorization = `${tokenType} ${token}`;
}

export function restoreAuthSession() {
  if (typeof window === "undefined") return;

  const token = localStorage.getItem(KEY_TOKEN);
  const tokenType = localStorage.getItem(KEY_TOKEN_TYPE) ?? "Bearer";

  if (!token) {
    currentAuthUser = null;
    authUserResolved = true;
    setAuthHeader();
    return;
  }

  const expAtRaw = localStorage.getItem(KEY_EXP);
  const expAt = expAtRaw ? Number(expAtRaw) : null;

  if (expAt != null && Number.isFinite(expAt) && Date.now() >= expAt) {
    clearAuthSession();
    return;
  }

  currentAuthUser = null;
  authUserResolved = false;
  setAuthHeader(tokenType, token);
}

export function saveAuthSession({
  token,
  tokenType = "Bearer",
  user,
  remember = false
}: SessionPayload) {
  const ttlDays = remember
    ? AUTH_SESSION_TTL_DAYS.REMEMBER
    : AUTH_SESSION_TTL_DAYS.DEFAULT;
  const expAt = Date.now() + ttlDays * 24 * 60 * 60 * 1000;

  if (token) {
    localStorage.setItem(KEY_TOKEN, token);
    localStorage.setItem(KEY_TOKEN_TYPE, tokenType);
    setAuthHeader(tokenType, token);
  } else {
    localStorage.removeItem(KEY_TOKEN);
    localStorage.removeItem(KEY_TOKEN_TYPE);
    setAuthHeader();
  }

  localStorage.setItem(KEY_EXP, String(expAt));
  localStorage.removeItem("user");
  currentAuthUser = user;
  authUserResolved = true;
  currentAuthError = null;

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
  }
}

export function updateAuthSessionUser(user: AuthUser | null) {
  if (typeof window === "undefined") return;

  currentAuthUser = user;
  authUserResolved = true;
  currentAuthError = null;
  localStorage.removeItem("user");

  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
}

export function clearAuthSession() {
  localStorage.removeItem(KEY_TOKEN);
  localStorage.removeItem(KEY_TOKEN_TYPE);
  localStorage.removeItem(KEY_EXP);
  localStorage.removeItem("user");
  currentAuthUser = null;
  authUserResolved = true;
  currentAuthError = null;
  setAuthHeader();

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
  }
}

export async function logoutAuthSession() {
  try {
    await apiClient.post("/api/logout");
  } finally {
    clearAuthSession();
  }
}

export function hasActiveAuthSession() {
  if (typeof window === "undefined") return false;

  const token = localStorage.getItem(KEY_TOKEN);
  if (!token) return false;

  const expAtRaw = localStorage.getItem(KEY_EXP);
  if (!expAtRaw) return true;

  const expAt = Number(expAtRaw);
  if (!Number.isFinite(expAt)) return true;

  if (Date.now() >= expAt) {
    clearAuthSession();
    return false;
  }

  return true;
}

export function getAuthUserFromSession(): AuthUser | null {
  return currentAuthUser;
}

export function isAuthUserResolved() {
  return authUserResolved;
}

export function markAuthSessionResolved() {
  authUserResolved = true;

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
  }
}

export function setAuthSessionError(message: string | null) {
  currentAuthError = message;
  authUserResolved = true;

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
  }
}

export function getAuthSessionError() {
  return currentAuthError;
}
