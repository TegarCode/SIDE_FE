import { apiClient } from "@/service/httpClient";
import type { DiplomasiMasterData } from "@/type/indonesiaDiplomasi";
import { normalizeMasterData } from "./shared";

export async function fetchDiplomasiMaster(): Promise<DiplomasiMasterData> {
  const [
    tradeYearsResponse,
    investasiYearsResponse,
    pariwisataYearsResponse,
    wilayahResponse,
    sumberPerdaganganResponse,
    sumberInvestasiResponse,
    sumberPariwisataResponse
  ] = await Promise.all([
    apiClient.get("/api/v1/tahun-perdagangan"),
    apiClient.get("/api/v1/tahun-investasi-default"),
    apiClient.get("/api/v1/tahun-pariwisata-default"),
    apiClient.get("/api/v1/wilayah"),
    apiClient.get("/api/v1/data-generator/perdagangan/kode-sumber"),
    apiClient.get("/api/v1/data-generator/investasi/kode-sumber"),
    apiClient.get("/api/v1/data-generator/pariwisata/kode-sumber")
  ]);

  return normalizeMasterData({
    tradeYearsPayload: tradeYearsResponse.data,
    investasiYearsPayload: investasiYearsResponse.data,
    pariwisataYearsPayload: pariwisataYearsResponse.data,
    wilayahPayload: wilayahResponse.data,
    sumberPerdaganganPayload: sumberPerdaganganResponse.data,
    sumberInvestasiPayload: sumberInvestasiResponse.data,
    sumberPariwisataPayload: sumberPariwisataResponse.data
  });
}
