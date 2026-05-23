import {
  ClipboardDocumentCheckIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  BellAlertIcon,
  FolderOpenIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";
import { AdminManagementLayout } from "@/components/layouts/AdminManagementLayout";
import { Card } from "@/components/ui/Card";
import { PageTitle } from "@/components/ui/PageTitle";
import { APP_NAME } from "@/constants/app";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const STAT_CARDS = [
  {
    title: "Admin Aktif",
    value: "12",
    caption: "Akun yang sedang mengakses panel hari ini.",
    icon: UserGroupIcon
  },
  {
    title: "Notifikasi Baru",
    value: "3",
    caption: "Perlu ditinjau sebelum ada perubahan berikutnya.",
    icon: BellAlertIcon
  },
  {
    title: "Permintaan Akses",
    value: "5",
    caption: "Pengajuan akses yang menunggu pemeriksaan.",
    icon: ClipboardDocumentCheckIcon
  },
  {
    title: "Aktivitas Hari Ini",
    value: "28",
    caption: "Perubahan, login, dan pemantauan yang tercatat.",
    icon: ArrowTrendingUpIcon
  },
  {
    title: "Data Dikelola",
    value: "124",
    caption: "Item yang saat ini masuk area pengelolaan admin.",
    icon: FolderOpenIcon
  },
  {
    title: "Sesi Terakhir",
    value: "08:45",
    caption: "Waktu login terakhir yang tercatat pada panel admin.",
    icon: ClockIcon
  }
] as const;

export function AdminManagementDashboardPage() {
  useDocumentTitle(`Beranda Admin | ${APP_NAME}`);

  return (
    <AdminManagementLayout
      title="Beranda Admin"
      description="Selamat datang di area pengelolaan admin SIDE."
    >
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <PageTitle
          title="Selamat datang kembali"
          description="Dashboard ini menjadi halaman awal untuk memantau aktivitas, notifikasi, dan ringkasan area manajemen admin."
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {STAT_CARDS.map(({ title, value, caption, icon: Icon }) => (
            <Card key={title} className="rounded-lg p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900">
                    {title}
                  </div>
                  <div className="mt-2 text-2xl font-bold text-[#223B8F]">
                    {value}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    {caption}
                  </p>
                </div>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-blue-50 text-[#223B8F] ring-1 ring-blue-100">
                  <Icon className="h-5 w-5" />
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminManagementLayout>
  );
}
