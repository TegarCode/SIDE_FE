import { apiClient } from "@/service/httpClient";

export type RcaCmsaFilterParams = {
  origin: string;
  destination: string;
  strategy1: string;
};

export type RcaCmsaDownloadParams = {
  origin: string;
  destination: string;
};

export type RcaCmsaItem = {
  HsCode: string;
  NamaProduk: string;
  Class_Asal: string;
  Class_Tujuan: string;
  Strategy: string;
  Asal_World: string;
  Tujuan_World: string;
  Impor_RI_From_World: string;
  Impor_RI_From_Partner: string;
  Ekspor_RI_To_Partner: string;
  Impor_Partner_From_World: string;
};

type RcaCmsaApiResponse = {
  success?: boolean;
  message?: string;
  data?: RcaCmsaItem[];
};

function normalizeStrategyValue(value: string) {
  if (value === "ALL") return "ALL";
  return value.toUpperCase();
}

export async function fetchRcaCmsaReport(params: RcaCmsaFilterParams) {
  const response = await apiClient.post<RcaCmsaApiResponse>(
    "/api/v1/report-generator/rca-cmsa/filter",
    {
      origin: params.origin,
      destination: params.destination,
      strategy1: normalizeStrategyValue(params.strategy1)
    }
  );

  return {
    success: Boolean(response.data?.success),
    message: response.data?.message ?? "",
    data: response.data?.data ?? []
  };
}

async function downloadRcaCmsaFile(
  endpoint: string,
  params: RcaCmsaDownloadParams,
  filenameBase: string
) {
  const response = await apiClient.post(
    endpoint,
    {
      origin: params.origin,
      destination: params.destination
    },
    { responseType: "blob" }
  );

  const disposition = response.headers["content-disposition"];
  const headerFilenameMatch =
    typeof disposition === "string"
      ? disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i)
      : null;
  const headerFilename = headerFilenameMatch?.[1]
    ? decodeURIComponent(headerFilenameMatch[1])
    : null;

  return {
    blob: response.data as Blob,
    filename: headerFilename ?? filenameBase
  };
}

export function downloadRcaCmsaSnapshotWord(
  params: RcaCmsaDownloadParams,
  filenameBase: string
) {
  return downloadRcaCmsaFile(
    "/api/v1/report-generator/rca-cmsa/snapshot/word",
    params,
    filenameBase
  );
}

export function downloadRcaCmsaSummaryWord(
  params: RcaCmsaDownloadParams,
  filenameBase: string
) {
  return downloadRcaCmsaFile(
    "/api/v1/report-generator/rca-cmsa/summary/word",
    params,
    filenameBase
  );
}

export function downloadRcaCmsaSummaryPdf(
  params: RcaCmsaDownloadParams,
  filenameBase: string
) {
  return downloadRcaCmsaFile(
    "/api/v1/report-generator/rca-cmsa/summary/pdf",
    params,
    filenameBase
  );
}

export function downloadRcaCmsaSnapshotPdf(
  params: RcaCmsaDownloadParams,
  filenameBase: string
) {
  return downloadRcaCmsaFile(
    "/api/v1/report-generator/rca-cmsa/snapshot/pdf",
    params,
    filenameBase
  );
}
