import type { BilateralTabSlug } from "@/type/indonesiaKerjasamaBilateral";

export const BILATERAL_DEFAULT_PARTNERS = ["USA", "CHN", "JPN"] as const;

export const BILATERAL_TABS: Array<{
  slug: BilateralTabSlug;
  label: string;
  description: string;
}> = [
  {
    slug: "perdagangan",
    label: "Perdagangan",
    description: "Analisis perdagangan barang Indonesia dengan negara mitra."
  },
  {
    slug: "pariwisata",
    label: "Pariwisata",
    description: "Arus wisatawan bilateral Indonesia dengan negara mitra."
  },
  {
    slug: "investasi",
    label: "Investasi",
    description: "Kinerja investasi bilateral Indonesia dengan negara mitra."
  },
  {
    slug: "jasa",
    label: "Jasa",
    description: "Kinerja jasa bilateral Indonesia dengan negara mitra."
  },
  {
    slug: "kerjasama_pembangunan",
    label: "Kerjasama Pembangunan",
    description: "Kerjasama pembangunan Indonesia dengan negara mitra."
  }
];
