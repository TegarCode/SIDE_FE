function parseBooleanEnv(value: string | undefined, fallback: boolean) {
  if (value == null || value.trim() === "") {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["false", "0", "no", "off"].includes(normalized)) {
    return false;
  }

  return fallback;
}

export const env = {
  appName:
    import.meta.env.VITE_APP_NAME ?? "Sistem Informasi Diplomasi Ekonomi",
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "",
  userwayAccountKey: import.meta.env.VITE_USERWAY_ACCOUNT_KEY ?? "",
  requireAuthAccess: parseBooleanEnv(
    import.meta.env.VITE_REQUIRE_AUTH_ACCESS,
    true
  )
};
