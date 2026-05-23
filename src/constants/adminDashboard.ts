import {
  CircleStackIcon,
  ChartBarSquareIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  PresentationChartLineIcon,
  DocumentChartBarIcon,
  ShieldExclamationIcon,
  KeyIcon,
  PlayCircleIcon,
  QuestionMarkCircleIcon,
  ShieldCheckIcon,
  UsersIcon
} from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";
import { PERMISSIONS } from "@/constants/permissions";
import { APP_ROUTES } from "@/constants/routes";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export type AdminSidebarLink = {
  to: string;
  label: string;
  hint: string;
  icon: IconComponent;
  permissions?: readonly string[];
};

export type AdminNotificationItem = {
  title: string;
  description: string;
  time: string;
};

export const ADMIN_SIDEBAR_LINKS: AdminSidebarLink[] = [
  {
    to: APP_ROUTES.ADMIN_MANAGEMENT.DASHBOARD,
    label: "Beranda",
    hint: "Ringkasan awal untuk memantau aktivitas, notifikasi, dan status area pengelolaan admin.",
    icon: ChartBarSquareIcon,
    permissions: [PERMISSIONS.ADMIN_DASHBOARD_MAIN]
  },
  {
    to: APP_ROUTES.ADMIN_MANAGEMENT.PERMISSIONS,
    label: "Manajemen Hak Akses",
    hint: "Kelola daftar permission admin, kategori akses, dan pembaruan hak akses inti.",
    icon: KeyIcon,
    permissions: [PERMISSIONS.ADMIN_PERMISSIONS_READ]
  },
  {
    to: APP_ROUTES.ADMIN_MANAGEMENT.ROLES,
    label: "Manajemen Peran",
    hint: "Kelola role baru, assign permission, dan siapkan struktur akses admin.",
    icon: ShieldCheckIcon,
    permissions: [PERMISSIONS.ADMIN_ROLES_READ]
  },
  {
    to: APP_ROUTES.ADMIN_MANAGEMENT.USERS,
    label: "Manajemen Pengguna",
    hint: "Kelola akun admin, peran yang digunakan, status akun, dan aktivitas login terakhir.",
    icon: UsersIcon,
    permissions: [PERMISSIONS.ADMIN_USERS_READ]
  },
  {
    to: APP_ROUTES.ADMIN_MANAGEMENT.FAQS,
    label: "Manajemen FAQ",
    hint: "Kelola topik FAQ, item pertanyaan dan jawaban, serta prioritas FAQ yang ditampilkan.",
    icon: QuestionMarkCircleIcon,
    permissions: [PERMISSIONS.ADMIN_FAQS_READ]
  },
  {
    to: APP_ROUTES.ADMIN_MANAGEMENT.CONTACTS,
    label: "Manajemen Kontak",
    hint: "Kelola pesan contact dari publik, lihat detail, perbarui isi, dan hapus data yang tidak diperlukan.",
    icon: ChatBubbleLeftRightIcon,
    permissions: [PERMISSIONS.ADMIN_CONTACTS_READ]
  },
  {
    to: APP_ROUTES.ADMIN_MANAGEMENT.TUTORIAL_PLAYLISTS,
    label: "Daftar Video Tutorial",
    hint: "Kelola playlist tutorial video, thumbnail, slug, deskripsi, dan URL video yang tampil di halaman panduan.",
    icon: PlayCircleIcon,
    permissions: [PERMISSIONS.ADMIN_TUTORIAL_PLAYLISTS_READ]
  },
  {
    to: APP_ROUTES.ADMIN_MANAGEMENT.API_CLIENTS,
    label: "Manajemen API Client",
    hint: "Kelola API client untuk akses backend melalui X-API-KEY, abilities, domain yang diizinkan, dan status aktif.",
    icon: CircleStackIcon,
    permissions: [PERMISSIONS.ADMIN_API_CLIENTS_READ]
  },
  {
    to: APP_ROUTES.ADMIN_MANAGEMENT.ECONOMIC_INDICATORS,
    label: "Kinerja Ekonomi",
    hint: "Kelola batch staging dan data aktif kinerja ekonomi, termasuk validasi, approval, publikasi, edit, dan hapus data.",
    icon: PresentationChartLineIcon,
    permissions: [
      PERMISSIONS.ADMIN_KINERJA_EKONOMI_READ,
      PERMISSIONS.ADMIN_KINERJA_EKONOMI_CURRENT_READ
    ]
  },
  {
    to: APP_ROUTES.ADMIN_MANAGEMENT.INVESTMENT_DATA,
    label: "Investasi",
    hint: "Kelola batch staging dan data aktif investasi, termasuk validasi, approval, publikasi, edit, dan hapus data.",
    icon: PresentationChartLineIcon,
    permissions: [
      PERMISSIONS.ADMIN_INVESTMENT_READ,
      PERMISSIONS.ADMIN_INVESTMENT_CURRENT_READ
    ]
  },
  {
    to: APP_ROUTES.ADMIN_MANAGEMENT.TOURISM_DATA,
    label: "Pariwisata",
    hint: "Kelola batch staging dan data aktif pariwisata, termasuk validasi, approval, publikasi, edit, dan hapus data.",
    icon: PresentationChartLineIcon,
    permissions: [
      PERMISSIONS.ADMIN_TOURISM_READ,
      PERMISSIONS.ADMIN_TOURISM_CURRENT_READ
    ]
  },
  {
    to: APP_ROUTES.ADMIN_MANAGEMENT.TRADE_DATA,
    label: "Perdagangan",
    hint: "Kelola batch staging dan data aktif perdagangan, termasuk validasi, approval, publikasi, edit, dan hapus data.",
    icon: PresentationChartLineIcon,
    permissions: [
      PERMISSIONS.ADMIN_TRADE_READ,
      PERMISSIONS.ADMIN_TRADE_CURRENT_READ
    ]
  },
  {
    to: APP_ROUTES.ADMIN_MANAGEMENT.CACHES,
    label: "Manajemen Cache",
    hint: "Tinjau cache dengan prefix side_cache, perbarui waktu expiration, dan hapus cache agar dibangun ulang oleh aplikasi.",
    icon: ClockIcon,
    permissions: [PERMISSIONS.ADMIN_CACHES_READ]
  },
  {
    to: APP_ROUTES.ADMIN_MANAGEMENT.SIDE_PAGE_VIEWS,
    label: "Pengunjung Halaman SIDE",
    hint: "Tinjau data tracking kunjungan halaman SIDE berdasarkan path, module, pengguna, dan waktu akses.",
    icon: DocumentChartBarIcon,
    permissions: [PERMISSIONS.ADMIN_SIDE_PAGE_VIEWS_READ]
  },
  {
    to: APP_ROUTES.ADMIN_MANAGEMENT.AUTHENTICATION_LOGS,
    label: "Authentication Log",
    hint: "Tinjau histori login admin, update status clear, dan hapus authentication log dari sistem login.",
    icon: ShieldExclamationIcon,
    permissions: [PERMISSIONS.ADMIN_AUTHENTICATION_LOGS_READ]
  }
];

export const ADMIN_NOTIFICATIONS: AdminNotificationItem[] = [
  {
    title: "Akses admin aktif",
    description: "12 akun sedang mengakses panel admin hari ini.",
    time: "Baru saja"
  },
  {
    title: "Pembaruan hak akses",
    description: "Ada 3 perubahan role yang perlu ditinjau ulang.",
    time: "10 menit lalu"
  },
  {
    title: "Monitoring sistem",
    description: "Tidak ada antrian persetujuan baru pada sesi ini.",
    time: "Hari ini"
  }
];
