import {
  ArrowTrendingUpIcon,
  CircleStackIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";
import { cn } from "@/utils/cn";

type ReportGeneratorInfoBannerProps = {
  sectorLabel: string;
  description: string;
  className?: string;
};

const PILLARS = [
  {
    title: "Struktur Laporan",
    description:
      "Susun keluaran laporan yang lebih rapi untuk kebutuhan briefing dan bahan presentasi.",
    icon: DocumentTextIcon
  },
  {
    title: "Parameter Terarah",
    description:
      "Atur kombinasi indikator, negara, atau topik laporan sesuai fokus analisis yang dibutuhkan.",
    icon: CircleStackIcon
  },
  {
    title: "Insight Cepat",
    description:
      "Siapkan landasan laporan lebih cepat sebelum dilanjutkan ke rangkuman, visual, atau ekspor dokumen.",
    icon: ArrowTrendingUpIcon
  }
] as const;

export function ReportGeneratorInfoBanner({
  sectorLabel,
  description,
  className
}: ReportGeneratorInfoBannerProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm",
        className
      )}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#f8fbff_0%,#eef5ff_36%,#fff8ef_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(37,99,235,0.22),transparent_28%),radial-gradient(circle_at_100%_0%,rgba(249,115,22,0.18),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(14,165,233,0.14),transparent_28%)]" />
      <div className="absolute inset-y-0 right-0 hidden w-80 bg-[linear-gradient(135deg,rgba(255,255,255,0),rgba(37,99,235,0.08))] lg:block" />
      <div className="absolute -left-10 top-8 h-36 w-36 rounded-full bg-blue-300/20 blur-3xl" />
      <div className="absolute right-12 top-6 h-24 w-24 rounded-full bg-amber-300/20 blur-3xl" />
      <div className="absolute bottom-0 right-24 h-28 w-28 rounded-full bg-cyan-300/20 blur-3xl" />

      <div className="relative p-5 sm:p-6 lg:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/70 bg-white/84 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-800 shadow-sm backdrop-blur-[10px]">
              Report Generator
            </div>

            <div className="space-y-2">
              <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-slate-900 sm:text-[30px]">
                Generator laporan {sectorLabel} untuk penyusunan insight yang
                lebih terarah
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-slate-700 sm:text-[15px]">
                {description}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:w-135 lg:grid-cols-1 xl:w-155 xl:grid-cols-3">
            {PILLARS.map(
              ({ title, description: itemDescription, icon: Icon }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/70 bg-white/72 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)] backdrop-blur-[14px]"
                >
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#0f172a,#1d4ed8)] text-white shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {title}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    {itemDescription}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
