import { apiClient } from "@/service/httpClient";
import type {
  DiplomasiApiParams,
  DiplomasiOverviewData,
  DiplomasiTabSlug
} from "@/type/indonesiaDiplomasi";
import {
  normalizeMetrics,
  normalizeOverviewTable,
  parseJsonPayload
} from "./shared";

const OVERVIEW_ENDPOINTS: Record<DiplomasiTabSlug, string> = {
  nilai_perdagangan: "/api/v1/indonesia/diplomasi-ekonomi/nilai-perdagangan",
  total_ekspor: "/api/v1/indonesia/diplomasi-ekonomi/total-ekspor",
  total_impor: "/api/v1/indonesia/diplomasi-ekonomi/total-impor",
  neraca_perdagangan: "/api/v1/indonesia/diplomasi-ekonomi/nilai-perdagangan",
  investasi_masuk:
    "/api/v1/indonesia/diplomasi-ekonomi/total-inbound-investasi",
  turis_masuk: "/api/v1/indonesia/diplomasi-ekonomi/total-inbound-wisatawan"
};

const SUMMARY_PDF_ENDPOINTS: Record<DiplomasiTabSlug, string> = {
  nilai_perdagangan:
    "/api/v1/indonesia/diplomasi-ekonomi/nilai-perdagangan/summary/pdf",
  total_ekspor: "/api/v1/indonesia/diplomasi-ekonomi/total-ekspor/summary/pdf",
  total_impor: "/api/v1/indonesia/diplomasi-ekonomi/total-impor/summary/pdf",
  neraca_perdagangan: "/api/v1/indonesia/diplomasi-ekonomi/neraca/summary/pdf",
  investasi_masuk:
    "/api/v1/indonesia/diplomasi-ekonomi/total-inbound-investasi/summary/pdf",
  turis_masuk:
    "/api/v1/indonesia/diplomasi-ekonomi/total-inbound-wisatawan/summary/pdf"
};

type DiplomasiSummaryPdfResult = {
  blob: Blob;
  filename: string;
};

function sanitizePdfFilename(value: string) {
  const sanitized = Array.from(value, (char) => {
    const code = char.charCodeAt(0);
    if (code >= 0 && code <= 31) return "_";
    return /[<>:"/\\|?*]/.test(char) ? "_" : char;
  }).join("");

  return sanitized.trim() || "ringkasan_diplomasi_ekonomi";
}

function getFilenameFromDisposition(
  headerValue: string | undefined,
  fallback: string
) {
  if (!headerValue) return fallback;

  const utf8Match = headerValue.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return sanitizePdfFilename(decodeURIComponent(utf8Match[1]));
    } catch {
      return sanitizePdfFilename(utf8Match[1]);
    }
  }

  const asciiMatch = headerValue.match(/filename="?([^"]+)"?/i);
  if (asciiMatch?.[1]) return sanitizePdfFilename(asciiMatch[1]);

  return fallback;
}

async function fetchDiplomasiOverviewByEndpoint(
  endpoint: string,
  params: DiplomasiApiParams
): Promise<DiplomasiOverviewData> {
  const response = await apiClient.get(endpoint, { params });
  const parsedData = parseJsonPayload(response.data);

  return {
    metrics: normalizeMetrics(parsedData),
    table: normalizeOverviewTable(parsedData),
    raw: parsedData
  };
}

export function fetchDiplomasiOverview(
  tab: DiplomasiTabSlug,
  params: DiplomasiApiParams
): Promise<DiplomasiOverviewData> {
  return fetchDiplomasiOverviewByEndpoint(OVERVIEW_ENDPOINTS[tab], params);
}

export async function downloadDiplomasiSummaryPdf(
  tab: DiplomasiTabSlug,
  params: DiplomasiApiParams,
  fallbackFilename: string
): Promise<DiplomasiSummaryPdfResult> {
  const response = await apiClient.post(SUMMARY_PDF_ENDPOINTS[tab], params, {
    responseType: "blob",
    headers: {
      Accept: "application/pdf"
    }
  });

  return {
    blob: response.data as Blob,
    filename: getFilenameFromDisposition(
      typeof response.headers["content-disposition"] === "string"
        ? response.headers["content-disposition"]
        : undefined,
      sanitizePdfFilename(fallbackFilename)
    )
  };
}
