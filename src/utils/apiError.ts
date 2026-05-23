import axios from "axios";

export function getApiErrorStatus(error: unknown) {
  if (axios.isAxiosError(error)) {
    return error.response?.status ?? null;
  }

  if (error && typeof error === "object" && "status" in error) {
    const status = (error as { status?: unknown }).status;
    return typeof status === "number" ? status : null;
  }

  return null;
}

export function isUnauthorizedApiError(error: unknown) {
  return getApiErrorStatus(error) === 401;
}
