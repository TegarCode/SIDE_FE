import type { SelectOption } from "@/type/indonesiaDiplomasi";
import type { DiplomasiSummaryCardView } from "@/type/indonesiaDiplomasi";

export type InfrastrukturFilterState = {
  region: string | null;
  subregion: string | null;
  categories: string[];
};

export type InfrastrukturRegionOption = SelectOption;

export type InfrastrukturSubregionOption = SelectOption & {
  regionValue: string;
};

export type InfrastrukturCategoryOption = SelectOption & {
  groupKey: string;
  groupLabel: string;
};

export type InfrastrukturMasterData = {
  regionOptions: InfrastrukturRegionOption[];
  subregionOptions: InfrastrukturSubregionOption[];
  categoryOptions: InfrastrukturCategoryOption[];
};

export type InfrastrukturPerwakilanParams = {
  wilayah: string[];
  categories: string[];
};

export type InfrastrukturPerwakilanAsingParams = {
  wilayah: string[];
};

export type InfrastrukturPerwakilanStatItem = {
  code: string;
  label: string;
  count: number;
};

export type InfrastrukturPerwakilanItem = {
  perwakilan: string;
  kategori: string;
  alamat: string | null;
  koordinat: string | null;
  situsWeb: string | null;
  wilayah: string | null;
  countries: Array<{
    alpha3: string | null;
    alpha2: string | null;
    country: string;
    wilayah: string | null;
  }>;
};

export type InfrastrukturMarker = {
  id: string;
  name: string;
  categoryCode: string;
  categoryLabel: string;
  color: string;
  address: string | null;
  website: string | null;
  wilayah: string | null;
  countries: string[];
  countryAlpha3s: string[];
  latitude: number;
  longitude: number;
};

export type InfrastrukturOverviewData = {
  summaryCards: DiplomasiSummaryCardView[];
  statCards: {
    total: number;
    byKategori: InfrastrukturPerwakilanStatItem[];
  };
  items: InfrastrukturPerwakilanItem[];
  markers: InfrastrukturMarker[];
  meta: Record<string, unknown>;
  raw: unknown;
};

export type InfrastrukturPerwakilanAsingItem = {
  address: string | null;
  email: string | null;
  koordinat: string | null;
  alpha3: string | null;
  alpha2: string | null;
  country: string;
  wilayah: string | null;
};

export type InfrastrukturPerwakilanAsingData = {
  items: InfrastrukturPerwakilanAsingItem[];
  meta: Record<string, unknown>;
  raw: unknown;
};

export type InfrastrukturPameranIndonesiaParams = {
  wilayah: string[];
};

export type InfrastrukturPameranIndonesiaItem = {
  agenda: string;
  kategori: string | null;
  provinsi: string | null;
  tanggalMulai: string | null;
  tanggalBerakhir: string | null;
};

export type InfrastrukturPameranIndonesiaData = {
  items: InfrastrukturPameranIndonesiaItem[];
  meta: Record<string, unknown>;
  raw: unknown;
};

export type InfrastrukturPameranPerwakilanParams = {
  wilayah: string[];
};

export type InfrastrukturPameranPerwakilanItem = {
  perwakilan: string;
  wilayahKerja: string | null;
  tempat: string | null;
  tanggal: string | null;
  exhibitionPromosi: string | null;
  alpha3: string | null;
  alpha2: string | null;
  country: string;
  wilayah: string | null;
};

export type InfrastrukturPameranPerwakilanData = {
  items: InfrastrukturPameranPerwakilanItem[];
  meta: Record<string, unknown>;
  raw: unknown;
};

export type InfrastrukturPerjanjianAntarNegaraParams = {
  wilayah: string[];
};

export type InfrastrukturPerjanjianAntarNegaraItem = {
  kode: string;
  hpi: string | null;
  idWilKemlu: string | null;
  kl: string | null;
  bidangKerjasama: string | null;
  judulPerjanjianIdn: string | null;
  judulPerjanjianEng: string | null;
  tempatTglTtd: string | null;
  catatanPengesahan: string | null;
  mulaiBerlaku: string | null;
  uu: string | null;
  masaBerlaku: string | null;
  caraPengakhiranIdn: string | null;
  caraPengakhiranEng: string | null;
  catatanKhusus: string | null;
  namaWilKemlu: string | null;
};

export type InfrastrukturPerjanjianAntarNegaraData = {
  items: InfrastrukturPerjanjianAntarNegaraItem[];
  meta: Record<string, unknown>;
  raw: unknown;
};

export type InfrastrukturTabSlug =
  | "perwakilan_indonesia"
  | "perwakilan_asing_di_indonesia"
  | "pameran_di_indonesia"
  | "pameran_di_perwakilan"
  | "perjanjian_antar_negara";
