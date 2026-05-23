import {
  AdjustmentsHorizontalIcon,
  ChartBarIcon,
  GlobeAltIcon
} from "@heroicons/react/24/outline";
import type { SidebarMenuLink } from "@/components/layouts/SidebarMenu";
import { APP_ROUTES } from "@/constants/routes";

export const reportGeneratorMenuLinks: SidebarMenuLink[] = [
  {
    to: APP_ROUTES.DATABANK.REPORT_GENERATOR.RCA_CMSA,
    label: "RCA & CMSA",
    icon: ChartBarIcon,
    hint: "Buat laporan daya saing (RCA) & spesialisasi (CMSA) terstruktur.",
    roles: ["admin", "user"],
    permissions: ["view_rca_cmsa_report_generator"]
  },
  {
    to: APP_ROUTES.DATABANK.REPORT_GENERATOR.MARKET_SHARE,
    label: "Market Share",
    icon: AdjustmentsHorizontalIcon,
    hint: "Laporan pangsa pasar produk/negara sekaligus tren kompetitif.",
    roles: ["admin", "user"],
    permissions: ["view_market_share_report_generator"]
  },
  {
    to: APP_ROUTES.DATABANK.REPORT_GENERATOR.KERJASAMA_PERDAGANGAN,
    label: "Kerjasama Perdagangan",
    icon: GlobeAltIcon,
    hint: "Ringkas kerangka kerjasama, capaian, dan rekomendasi perdagangan.",
    roles: ["admin", "user"],
    permissions: ["view_kerjasama_perdagangan_report_generator"]
  }
];
