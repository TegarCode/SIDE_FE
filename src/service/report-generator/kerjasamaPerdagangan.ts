import { apiClient } from "@/service/httpClient";

export type KerjasamaPerdaganganFilterParams = {
  origin: string;
  destinations: string[];
  sumber: string;
  year_start: number;
  year_end: number;
};

export type KerjasamaPerdaganganMetricDetail = {
  ekspor?: string;
  impor?: string;
  neraca?: string;
  total?: string;
};

export type KerjasamaPerdaganganYearItem = {
  tahun: string;
  detail?: KerjasamaPerdaganganMetricDetail[];
};

export type KerjasamaPerdaganganItem = {
  NegaraAsal: string;
  NegaraTujuan: string;
  per: KerjasamaPerdaganganYearItem[];
};

export type KerjasamaPerdaganganResponse = {
  success: boolean;
  message: string;
  data: KerjasamaPerdaganganItem[];
  meta: Record<string, unknown>;
};

type KerjasamaPerdaganganApiResponse = {
  success?: boolean;
  message?: string;
  data?: KerjasamaPerdaganganItem[];
  meta?: Record<string, unknown>;
};

export async function fetchKerjasamaPerdaganganReport(
  params: KerjasamaPerdaganganFilterParams
): Promise<KerjasamaPerdaganganResponse> {
  const response = await apiClient.post<KerjasamaPerdaganganApiResponse>(
    "/api/v1/report-generator/kerjasama-perdagangan/filter",
    {
      origin: params.origin,
      destinations: params.destinations,
      sumber: params.sumber,
      year_start: params.year_start,
      year_end: params.year_end
    }
  );

  return {
    success: Boolean(response.data?.success),
    message: response.data?.message ?? "",
    data: response.data?.data ?? [],
    meta: response.data?.meta ?? {}
  };
}

async function downloadKerjasamaPerdaganganFile(
  endpoint: string,
  params: KerjasamaPerdaganganFilterParams,
  filenameBase: string
) {
  const response = await apiClient.post(
    endpoint,
    {
      origin: params.origin,
      destinations: params.destinations,
      sumber: params.sumber,
      year_start: params.year_start,
      year_end: params.year_end
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

export function downloadKerjasamaPerdaganganSnapshotWord(
  params: KerjasamaPerdaganganFilterParams,
  filenameBase: string
) {
  return downloadKerjasamaPerdaganganFile(
    "/api/v1/report-generator/kerjasama-perdagangan/snapshot/word",
    params,
    filenameBase
  );
}

export function downloadKerjasamaPerdaganganSnapshotPdf(
  params: KerjasamaPerdaganganFilterParams,
  filenameBase: string
) {
  return downloadKerjasamaPerdaganganFile(
    "/api/v1/report-generator/kerjasama-perdagangan/snapshot/pdf",
    params,
    filenameBase
  );
}
