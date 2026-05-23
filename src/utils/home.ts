export function toSlug(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, "-");
}

export function clampPercent(value: number) {
  if (Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, value));
}
