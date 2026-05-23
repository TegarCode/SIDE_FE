import { apiClient } from "@/service/httpClient";
import type {
  CaptchaData,
  AuthUser,
  LoginRequestPayload,
  LoginResult
} from "@/type/auth";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
}

function unwrapPayload(payload: unknown) {
  if (!isRecord(payload)) return payload;
  if (isRecord(payload.data)) return payload.data;
  return payload;
}

function normalizeCaptchaImage(rawImage: string) {
  const image = rawImage.trim();
  if (!image) return "";
  if (image.startsWith("data:image")) return image;
  return `data:image/png;base64,${image}`;
}

function normalizeCaptcha(payload: unknown): CaptchaData {
  const unwrapped = unwrapPayload(payload);
  if (!isRecord(unwrapped)) {
    return { id: "", image: "" };
  }

  const id = asString(unwrapped.id || unwrapped.captcha_id);
  const rawImage = asString(
    unwrapped.image || unwrapped.captcha_image || unwrapped.captchaImage
  );

  return {
    id,
    image: normalizeCaptchaImage(rawImage)
  };
}

function normalizeLoginResult(payload: unknown): LoginResult {
  const unwrapped = unwrapPayload(payload);
  const root = isRecord(unwrapped) ? unwrapped : {};
  const token = asString(root.access_token || root.token) || null;
  const tokenType = asString(root.token_type || root.tokenType, "Bearer");
  const user = normalizeAuthUser(root);

  return {
    token,
    tokenType,
    user,
    raw: payload
  };
}

function normalizeAuthUser(payload: unknown): AuthUser | null {
  const unwrapped = unwrapPayload(payload);
  const root = isRecord(unwrapped) ? unwrapped : {};
  const userValue = isRecord(root.user) ? root.user : null;
  const source = userValue ?? root;
  const roles = toStringArray(root.roles ?? userValue?.roles);
  const permissions = toStringArray(root.permissions ?? userValue?.permissions);

  if (
    !userValue &&
    roles.length === 0 &&
    permissions.length === 0 &&
    Object.keys(source).length === 0
  ) {
    return null;
  }

  return {
    ...source,
    roles,
    permissions
  };
}

export async function fetchCaptcha() {
  const response = await apiClient.get("/api/captcha");
  return normalizeCaptcha(response.data);
}

export async function loginWithPassword(payload: LoginRequestPayload) {
  const response = await apiClient.post("/api/login", payload);
  return normalizeLoginResult(response.data);
}

export async function fetchCurrentUser() {
  const response = await apiClient.get("/api/me", {
    timeout: 10000
  });
  return normalizeAuthUser(response.data);
}
