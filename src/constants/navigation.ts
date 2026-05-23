import { APP_ROUTES, EXTERNAL_ROUTES } from "@/constants/routes";

export type NavItem = {
  label: string;
  path: string;
  external?: boolean;
  children?: NavItem[];
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Beranda", path: APP_ROUTES.HOME },
  { label: "Indonesia", path: APP_ROUTES.INDONESIA.DIPLOMASI_EKONOMI },
  { label: "Mitra", path: APP_ROUTES.MITRA.OVERVIEW },
  {
    label: "Sektor",
    path: APP_ROUTES.SEKTOR.ROOT,
    children: [
      { label: "Komoditas Utama", path: APP_ROUTES.SEKTOR.KOMODITAS_UTAMA_TIK },
      { label: "Perdagangan", path: APP_ROUTES.SEKTOR.PERDAGANGAN },
      {
        label: "Investasi",
        path: EXTERNAL_ROUTES.INVESTOLINK,
        external: true
      },
      { label: "Parekraf", path: APP_ROUTES.SEKTOR.PAREKRAF_OVERVIEW },
      { label: "Jasa", path: APP_ROUTES.SEKTOR.JASA_OVERVIEW },
      {
        label: "Kerjasama Pembangunan",
        path: EXTERNAL_ROUTES.KSPI,
        external: true
      }
    ]
  },
  { label: "Analisis", path: APP_ROUTES.ANALISIS.PRODUK_KOMODITAS },
  {
    label: "Databank",
    path: APP_ROUTES.DATABANK.DATA_GENERATOR.TRADE,
    children: [
      {
        label: "Data Generator",
        path: APP_ROUTES.DATABANK.DATA_GENERATOR.TRADE
      },
      {
        label: "Report Generator",
        path: APP_ROUTES.DATABANK.REPORT_GENERATOR.RCA_CMSA
      }
    ]
  }
];
