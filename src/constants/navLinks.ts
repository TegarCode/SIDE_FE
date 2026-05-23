import {
  PERMISSION_GROUPS,
  PERMISSION_ROUTES,
  type AppPermission,
  type PermissionPathMap
} from "@/constants/permissions";
import { APP_ROUTES, EXTERNAL_ROUTES } from "@/constants/routes";

export type NavLinkItem = {
  label: string;
  path: string;
  external?: boolean;
  roles?: readonly string[];
  permissions?: readonly AppPermission[];
  permissionPaths?: PermissionPathMap;
  children?: NavLinkItem[];
};

const navLinks: NavLinkItem[] = [
  { label: "Beranda", path: APP_ROUTES.HOME },
  {
    label: "Indonesia",
    path: APP_ROUTES.INDONESIA.DIPLOMASI_EKONOMI,
    permissions: PERMISSION_GROUPS.INDONESIA,
    permissionPaths: PERMISSION_ROUTES.INDONESIA
  },
  {
    label: "Mitra",
    path: APP_ROUTES.MITRA.OVERVIEW,
    permissions: PERMISSION_GROUPS.MITRA,
    permissionPaths: PERMISSION_ROUTES.MITRA
  },
  {
    label: "Sektor",
    path: APP_ROUTES.SEKTOR.ROOT,
    children: [
      {
        label: "Komoditas Utama",
        path: APP_ROUTES.SEKTOR.KOMODITAS_UTAMA_TIK,
        permissions: PERMISSION_GROUPS.SEKTOR_KOMODITAS_UTAMA
      },
      {
        label: "Perdagangan",
        path: APP_ROUTES.SEKTOR.PERDAGANGAN,
        permissions: PERMISSION_GROUPS.SEKTOR_PERDAGANGAN
      },
      {
        label: "Investasi",
        path: EXTERNAL_ROUTES.INVESTOLINK,
        external: true,
        permissions: PERMISSION_GROUPS.SEKTOR_INVESTASI
      },
      {
        label: "Parekraf",
        path: APP_ROUTES.SEKTOR.PAREKRAF_OVERVIEW,
        permissions: PERMISSION_GROUPS.SEKTOR_PAREKRAF
      },
      {
        label: "Jasa",
        path: APP_ROUTES.SEKTOR.JASA_OVERVIEW,
        permissions: PERMISSION_GROUPS.SEKTOR_JASA
      },
      {
        label: "Kerjasama Pembangunan",
        path: EXTERNAL_ROUTES.KSPI,
        external: true,
        permissions: PERMISSION_GROUPS.SEKTOR_KSPI
      }
    ]
  },
  {
    label: "Analisis",
    path: APP_ROUTES.ANALISIS.PRODUK_KOMODITAS,
    permissions: PERMISSION_GROUPS.ANALISIS,
    permissionPaths: PERMISSION_ROUTES.ANALISIS
  },
  {
    label: "Databank",
    path: APP_ROUTES.DATABANK.DATA_GENERATOR.TRADE,
    permissions: PERMISSION_GROUPS.DATABANK,
    permissionPaths: PERMISSION_ROUTES.DATABANK,
    children: [
      {
        label: "Data Generator",
        path: APP_ROUTES.DATABANK.DATA_GENERATOR.TRADE,
        permissions: PERMISSION_GROUPS.DATABANK_DATA_GENERATOR,
        permissionPaths: PERMISSION_ROUTES.DATABANK_DATA_GENERATOR
      },
      {
        label: "Report Generator",
        path: APP_ROUTES.DATABANK.REPORT_GENERATOR.ROOT,
        permissions: PERMISSION_GROUPS.DATABANK_REPORT_GENERATOR,
        permissionPaths: PERMISSION_ROUTES.DATABANK_REPORT_GENERATOR
      }
    ]
  }
];

export default navLinks;
