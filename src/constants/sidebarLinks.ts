import {
  AdjustmentsHorizontalIcon,
  BeakerIcon,
  BoltIcon,
  BuildingLibraryIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  CpuChipIcon,
  CubeIcon,
  GlobeAltIcon,
  MapIcon,
  ShieldExclamationIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon
} from "@heroicons/react/24/outline";
import { reportGeneratorMenuLinks } from "@/constants/reportGeneratorLinks";
import { APP_ROUTES } from "@/constants/routes";
import type { SidebarMenuLink } from "@/components/layouts/SidebarMenu";

export type SidebarLayoutConfig = {
  routePrefix: string;
  title: string;
  menuLinks: SidebarMenuLink[];
};

export const INDONESIA_SIDEBAR_LINKS: SidebarMenuLink[] = [
  {
    to: APP_ROUTES.INDONESIA.DIPLOMASI_EKONOMI,
    label: "Diplomasi Ekonomi Indonesia",
    hint: "Ringkasan indikator utama diplomasi ekonomi Indonesia: perdagangan, investasi, turisme dan komoditas prioritas.",
    icon: GlobeAltIcon
  },
  {
    to: APP_ROUTES.INDONESIA.KERJASAMA_BILATERAL,
    label: "Kerjasama Ekonomi Bilateral dan Regional",
    hint: "Status dan perkembangan kerja sama bilateral & regional yang relevan dengan kepentingan ekonomi.",
    icon: MapIcon
  },
  {
    to: APP_ROUTES.INDONESIA.INDIKATOR_EKONOMI,
    label: "Indikator Ekonomi dan Daya Saing",
    hint: "Indikator makroekonomi dan daya saing untuk diplomasi ekonomi.",
    icon: Cog6ToothIcon
  },
  {
    to: APP_ROUTES.INDONESIA.INFRASTRUKTUR,
    label: "Infrastruktur Diplomasi Ekonomi",
    hint: "Peta infrastruktur pendukung diplomasi ekonomi dan kesiapan layanan data.",
    icon: ChartBarIcon
  }
];

export const MITRA_SIDEBAR_LINKS: SidebarMenuLink[] = [
  {
    to: APP_ROUTES.MITRA.OVERVIEW,
    label: "Ringkasan",
    hint: "Gambaran umum mitra strategis: profil ekonomi, hubungan dagang, dan indikator kunci dari sisi mitra.",
    icon: MapIcon
  },
  {
    to: APP_ROUTES.MITRA.PERDAGANGAN,
    label: "Perdagangan",
    hint: "Analitik perdagangan negara mitra yang relevan dengan Indonesia.",
    icon: ChartBarIcon
  },
  {
    to: APP_ROUTES.MITRA.INVESTASI,
    label: "Investasi",
    hint: "Perkembangan investasi negara mitra dan potensi ekonominya.",
    icon: GlobeAltIcon
  },
  {
    to: APP_ROUTES.MITRA.PARIWISATA,
    label: "Pariwisata",
    hint: "Data arus wisatawan dan indikator pariwisata negara mitra.",
    icon: BuildingLibraryIcon
  },
  {
    to: APP_ROUTES.MITRA.JASA,
    label: "Jasa",
    hint: "Ringkasan sektor jasa pada negara mitra Indonesia.",
    icon: UserGroupIcon
  }
];

export const PRIORITAS_SIDEBAR_LINKS: SidebarMenuLink[] = [
  {
    to: APP_ROUTES.SEKTOR.KOMODITAS_UTAMA_TIK,
    label: "TIK",
    hint: "Perkembangan dan arus TIK pada sektor prioritas serta dukungannya pada transformasi digital.",
    icon: CpuChipIcon
  },
  {
    to: APP_ROUTES.SEKTOR.KOMODITAS_UTAMA_ENERGI,
    label: "Energi",
    hint: "Pemetaan peluang dan tantangan sektor energi: transisi, investasi, dan inovasi.",
    icon: BoltIcon
  },
  {
    to: APP_ROUTES.SEKTOR.KOMODITAS_UTAMA_MINERAL_KRITIS,
    label: "Mineral Kritis",
    hint: "Pemetaan peluang dan tantangan sektor mineral kritis.",
    icon: CubeIcon
  },
  {
    to: APP_ROUTES.SEKTOR.KOMODITAS_UTAMA_KESEHATAN,
    label: "Kesehatan",
    hint: "Kinerja dan potensi sektor farmasi serta rantai pasok kesehatan strategis.",
    icon: BeakerIcon
  },
  {
    to: APP_ROUTES.SEKTOR.KOMODITAS_UTAMA_HILIRISASI,
    label: "Hilirisasi",
    hint: "Perdagangan sektor hilirisasi: komoditas utama, pasar, dan resiliensi.",
    icon: WrenchScrewdriverIcon
  },
  {
    to: APP_ROUTES.SEKTOR.KOMODITAS_UTAMA_PANGAN,
    label: "Pangan",
    hint: "Ketahanan dan perdagangan pangan: komoditas utama, pasar, dan resiliensi.",
    icon: ShoppingBagIcon
  },
  {
    to: APP_ROUTES.SEKTOR.KOMODITAS_UTAMA_PERTAHANAN,
    label: "Pertahanan",
    hint: "Kolaborasi industri pertahanan dan alih teknologi dalam konteks ekonomi.",
    icon: ShieldCheckIcon
  }
];

export const ANALISIS_SIDEBAR_LINKS: SidebarMenuLink[] = [
  {
    to: APP_ROUTES.ANALISIS.PRODUK_KOMODITAS,
    label: "Komoditas Ekspor Utama",
    icon: CubeIcon,
    hint: "Eksplorasi produk unggulan (HS) dan peluang diversifikasi pasar.",
    permissions: ["view_produk_komoditas_analisis"]
  },
  {
    to: APP_ROUTES.ANALISIS.POTENSI_DAYA_SAING,
    label: "Potensi & Daya Saing",
    icon: AdjustmentsHorizontalIcon,
    hint: "Pemodelan potensi, daya saing, dan spesialisasi untuk penentuan prioritas.",
    permissions: ["view_potensi_daya_saing_analisis"]
  },
  {
    to: APP_ROUTES.ANALISIS.IDE,
    label: "IDE (Indeks Diplomasi Ekonomi)",
    icon: ChartBarIcon,
    hint: "Dashboard tab Indeks: Diplomasi Ekonomi, Perdagangan, Investasi, Pariwisata, dan Tenaga Kerja.",
    permissions: ["view_ide_analisis"]
  },
  {
    to: APP_ROUTES.ANALISIS.GEOPOLITIK_PERDAGANGAN,
    label: "Geopolitik & Perdagangan",
    icon: GlobeAltIcon,
    hint: "Top 20 produk ekspor-impor Indonesia, komparasi dengan dunia, posisi global, dan pangsa negara geopolitik utama.",
    permissions: ["view_geopolitik_perdagangan_analisis"]
  },
  {
    to: APP_ROUTES.ANALISIS.OPERATIONAL_RISK,
    label: "Risiko Operasional",
    icon: ShieldExclamationIcon,
    hint: "Risiko operasional lintas pasar/komoditas untuk mitigasi kebijakan dan strategi.",
    permissions: ["view_operational_risk_analisis"]
  }
];

export const DATA_GENERATOR_SIDEBAR_LINKS: SidebarMenuLink[] = [
  {
    to: APP_ROUTES.DATABANK.DATA_GENERATOR.TRADE,
    label: "Perdagangan",
    icon: ShoppingBagIcon,
    hint: "Akses data sektor perdagangan negara, grup, tipe perdagangan, hs code, hingga pilihan sumber data dalam bentuk tabel atau grafik.",
    roles: ["admin", "user"],
    permissions: ["view_perdagangan_data_generator"]
  },
  {
    to: APP_ROUTES.DATABANK.DATA_GENERATOR.INVESTMENT,
    label: "Investasi",
    icon: BuildingLibraryIcon,
    hint: "Akses data sektor investasi negara, grup, tipe investasi, hingga pilihan sumber data dalam bentuk tabel atau grafik.",
    roles: ["admin", "user"],
    permissions: ["view_investasi_data_generator"]
  },
  {
    to: APP_ROUTES.DATABANK.DATA_GENERATOR.TOURISM,
    label: "Wisatawan",
    icon: UserGroupIcon,
    hint: "Akses data sektor pariwisata negara, grup, tipe pariwisata, jenis data, hingga pilihan sumber data dalam bentuk tabel atau grafik.",
    roles: ["admin", "user"],
    permissions: ["view_turis_data_generator"]
  },
  {
    to: APP_ROUTES.DATABANK.DATA_GENERATOR.SERVICE,
    label: "Jasa",
    icon: WrenchScrewdriverIcon,
    hint: "Akses data sektor jasa negara, grup, jenis kelamin, profesi, hingga pilihan sumber data dalam bentuk tabel atau grafik.",
    roles: ["admin", "user"],
    permissions: ["view_jasa_data_generator"]
  },
  {
    to: APP_ROUTES.DATABANK.DATA_GENERATOR.INDIKATOR_EKONOMI,
    label: "Indikator Ekonomi & Daya Saing",
    icon: ChartBarIcon,
    hint: "Akses data indikator ekonomi dan indeks daya saing dalam bentuk tabel atau grafik.",
    roles: ["admin", "user"],
    permissions: ["view_indikator_ekonomi_data_generator"]
  }
];

export const REPORT_GENERATOR_SIDEBAR_LINKS: SidebarMenuLink[] =
  reportGeneratorMenuLinks;

const SIDEBAR_LAYOUT_CONFIGS: SidebarLayoutConfig[] = [
  {
    routePrefix: `${APP_ROUTES.INDONESIA.ROOT}/`,
    title: "Indonesia",
    menuLinks: INDONESIA_SIDEBAR_LINKS
  },
  {
    routePrefix: "/negara-mitra/",
    title: "Negara Mitra",
    menuLinks: MITRA_SIDEBAR_LINKS
  },
  {
    routePrefix: "/sektor/komoditas-utama/",
    title: "Komoditas Utama",
    menuLinks: PRIORITAS_SIDEBAR_LINKS
  },
  {
    routePrefix: `${APP_ROUTES.ANALISIS.ROOT}/`,
    title: "Analisis",
    menuLinks: ANALISIS_SIDEBAR_LINKS
  },
  {
    routePrefix: `${APP_ROUTES.DATABANK.DATA_GENERATOR.ROOT}/`,
    title: "Data Generator",
    menuLinks: DATA_GENERATOR_SIDEBAR_LINKS
  },
  {
    routePrefix: `${APP_ROUTES.DATABANK.REPORT_GENERATOR.ROOT}/`,
    title: "Report Generator",
    menuLinks: REPORT_GENERATOR_SIDEBAR_LINKS
  }
];

export function getSidebarLayoutConfig(
  pathname: string
): SidebarLayoutConfig | null {
  return (
    SIDEBAR_LAYOUT_CONFIGS.find((config) =>
      pathname.startsWith(config.routePrefix)
    ) ?? null
  );
}
