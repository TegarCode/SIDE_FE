import { apiClient } from "@/service/httpClient";
import type {
  BilateralOverviewData,
  BilateralOverviewParams,
  BilateralTradeCompetitionInsightParams,
  BilateralTabSlug
} from "@/type/indonesiaKerjasamaBilateral";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

const OVERVIEW_ENDPOINTS: Record<BilateralTabSlug, string> = {
  perdagangan: "/api/v1/indonesia/kerjasama-bilateral/nilai-perdagangan",
  pariwisata: "/api/v1/indonesia/kerjasama-bilateral/nilai-pariwisata",
  investasi: "/api/v1/indonesia/kerjasama-bilateral/nilai-investasi",
  jasa: "/api/v1/indonesia/kerjasama-bilateral/nilai-jasa",
  kerjasama_pembangunan:
    "/api/v1/indonesia/kerjasama-bilateral/kerjasama-pembangunan"
};

const SUMMARY_ENDPOINTS: Record<BilateralTabSlug, string> = {
  perdagangan:
    "/api/v1/indonesia/kerjasama-bilateral/nilai-perdagangan/summary/pdf",
  pariwisata:
    "/api/v1/indonesia/kerjasama-bilateral/nilai-pariwisata/summary/pdf",
  investasi:
    "/api/v1/indonesia/kerjasama-bilateral/nilai-investasi/summary/pdf",
  jasa: "/api/v1/indonesia/kerjasama-bilateral/nilai-jasa/summary/pdf",
  kerjasama_pembangunan:
    "/api/v1/indonesia/kerjasama-bilateral/nilai-bantuan/summary/pdf"
};

function normalizeOverviewPayload(payload: unknown): BilateralOverviewData {
  const root = isRecord(payload) ? payload : {};
  const data = isRecord(root.data) ? root.data : root;
  const items = Array.isArray(data.items)
    ? data.items.filter(isRecord)
    : Array.isArray(root.items)
      ? root.items.filter(isRecord)
      : [];
  const meta = isRecord(root.meta)
    ? root.meta
    : isRecord(data.meta)
      ? data.meta
      : {};

  return { raw: payload, items, meta };
}

function sanitizeFilename(value: string) {
  const sanitized = Array.from(value, (char) => {
    const code = char.charCodeAt(0);
    if (code >= 0 && code <= 31) return "_";
    return /[<>:"/\\|?*]/.test(char) ? "_" : char;
  }).join("");
  return sanitized.trim() || "ringkasan_kerjasama_bilateral";
}

function getFilenameFromDisposition(
  headerValue: string | undefined,
  fallback: string
) {
  if (!headerValue) return fallback;
  const utf8Match = headerValue.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return sanitizeFilename(decodeURIComponent(utf8Match[1]));
    } catch {
      return sanitizeFilename(utf8Match[1]);
    }
  }
  const asciiMatch = headerValue.match(/filename="?([^"]+)"?/i);
  return asciiMatch?.[1] ? sanitizeFilename(asciiMatch[1]) : fallback;
}

export async function fetchKerjasamaBilateralOverview(
  tab: BilateralTabSlug,
  params: BilateralOverviewParams
): Promise<BilateralOverviewData> {
  const response = await apiClient.get(OVERVIEW_ENDPOINTS[tab], { params });
  return normalizeOverviewPayload(response.data);
}

export async function fetchKerjasamaBilateralTradeCompetitionInsight(
  payload: BilateralTradeCompetitionInsightParams
) {
  const response = await apiClient.post(
    "/api/v1/indonesia/kerjasama-bilateral/nilai-perdagangan/insight-tujuan-kompetitor",
    payload
  );
  return response.data;
}

export async function downloadKerjasamaBilateralSummaryPdf(
  tab: BilateralTabSlug,
  payload: BilateralOverviewParams,
  fallbackFilename: string
) {
  const response = await apiClient.post(SUMMARY_ENDPOINTS[tab], payload, {
    responseType: "blob",
    headers: { Accept: "application/pdf" }
  });

  return {
    blob: response.data as Blob,
    filename: getFilenameFromDisposition(
      typeof response.headers["content-disposition"] === "string"
        ? response.headers["content-disposition"]
        : undefined,
      sanitizeFilename(fallbackFilename)
    )
  };
}
