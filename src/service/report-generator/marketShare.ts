import { apiClient } from "@/service/httpClient";

export type MarketShareFilterParams = {
  origin: string;
  destination: string;
  strategy1: string;
  top_n: number;
  sumber: string;
  year: number | string;
};

export type MarketShareProductItem = {
  hs4: string;
  nama_produk: string;
  nilai: string;
  pangsa: string;
};

export type MarketShareItem = {
  NegaraAsal: string;
  NegaraTujuan: string;
  TipePerdagangan: string;
  Tahun: string | number;
  TotalNilai: string;
  products?: MarketShareProductItem[];
};

export type MarketShareResponse = {
  success: boolean;
  message: string;
  data: MarketShareItem[];
  meta: Record<string, unknown>;
};

type MarketShareApiResponse = {
  success?: boolean;
  message?: string;
  data?: MarketShareItem[];
  meta?: Record<string, unknown>;
};

export async function fetchMarketShareReport(
  params: MarketShareFilterParams
): Promise<MarketShareResponse> {
  const response = await apiClient.post<MarketShareApiResponse>(
    "/api/v1/report-generator/market-share/filter",
    {
      origin: params.origin,
      destination: params.destination,
      strategy1: params.strategy1,
      top_n: params.top_n,
      sumber: params.sumber,
      year: params.year
    }
  );

  return {
    success: Boolean(response.data?.success),
    message: response.data?.message ?? "",
    data: response.data?.data ?? [],
    meta: response.data?.meta ?? {}
  };
}

async function downloadMarketShareFile(
  endpoint: string,
  params: MarketShareFilterParams,
  filenameBase: string
) {
  const response = await apiClient.post(
    endpoint,
    {
      origin: params.origin,
      destination: params.destination,
      strategy1: params.strategy1,
      top_n: params.top_n,
      sumber: params.sumber,
      year: params.year
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

export function downloadMarketShareSnapshotWord(
  params: MarketShareFilterParams,
  filenameBase: string
) {
  return downloadMarketShareFile(
    "/api/v1/report-generator/market-share/snapshot/word",
    params,
    filenameBase
  );
}

export function downloadMarketShareSnapshotPdf(
  params: MarketShareFilterParams,
  filenameBase: string
) {
  return downloadMarketShareFile(
    "/api/v1/report-generator/market-share/snapshot/pdf",
    params,
    filenameBase
  );
}
