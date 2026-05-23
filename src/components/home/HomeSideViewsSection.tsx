import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type TooltipItem
} from "chart.js";
import { motion } from "framer-motion";
import {
  ArrowTrendingUpIcon,
  ChartBarIcon,
  ChartBarSquareIcon,
  ChartPieIcon
} from "@heroicons/react/24/outline";
import { FALLBACK_HOME_VIEWS_HISTORY } from "@/constants/home";
import { useHomeOverviewQuery } from "@/hooks/home/useHomeOverviewQuery";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend
);

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 }
};

export function HomeSideViewsSection() {
  const { data, isLoading } = useHomeOverviewQuery(6);

  const history = data?.history?.length
    ? data.history
    : FALLBACK_HOME_VIEWS_HISTORY;
  const labels = history.map((item) => item.label);
  const values = history.map((item) => item.views);

  const totalViews = useMemo(
    () => values.reduce((acc, value) => acc + value, 0),
    [values]
  );
  const latest = history[history.length - 1] ?? { label: "-", views: 0 };
  const previous = history[history.length - 2] ?? latest;
  const avgViews = data?.avgPerPeriod
    ? data.avgPerPeriod
    : Math.round(totalViews / history.length);

  const diff = latest.views - previous.views;
  const diffPercent = previous.views > 0 ? (diff / previous.views) * 100 : 0;
  const isPositive = diff >= 0;
  const diffColor = isPositive ? "text-emerald-600" : "text-rose-600";
  const diffBg = isPositive ? "bg-emerald-50" : "bg-rose-50";
  const diffIconBg = isPositive ? "bg-emerald-100" : "bg-rose-100";

  const lineData = {
    labels,
    datasets: [
      {
        label: "Views",
        data: values,
        borderColor: "#3B5BDB",
        borderWidth: 2.5,
        tension: 0.35,
        pointBorderColor: "#3B5BDB",
        pointBorderWidth: 2,
        pointRadius: (context: { dataIndex: number }) => {
          const isLast = context.dataIndex === values.length - 1;
          return isLast ? 6 : 4;
        },
        pointBackgroundColor: (context: { dataIndex: number }) => {
          const isLast = context.dataIndex === values.length - 1;
          return isLast ? "#3B5BDB" : "#ffffff";
        },
        pointHoverRadius: 7,
        fill: true,
        backgroundColor: (context: { chart: ChartJS }) => {
          const { chart } = context;
          const { ctx, chartArea } = chart;

          if (!chartArea) {
            return "rgba(59,91,219,0.08)";
          }

          const gradient = ctx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom
          );
          gradient.addColorStop(0, "rgba(59,91,219,0.22)");
          gradient.addColorStop(1, "rgba(59,91,219,0.02)");
          return gradient;
        }
      },
      {
        label: "Rata-rata",
        data: Array(values.length).fill(avgViews),
        borderColor: "#CBD5F5",
        borderWidth: 1.5,
        borderDash: [5, 4],
        pointRadius: 0,
        pointHitRadius: 0,
        fill: false
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0f172a",
        cornerRadius: 8,
        displayColors: false,
        padding: 10,
        callbacks: {
          label: (item: TooltipItem<"line">) => {
            if (item.dataset.label === "Rata-rata") {
              return `Rata-rata: ${avgViews.toLocaleString("id-ID")} views`;
            }

            return `${Number(item.raw || 0).toLocaleString("id-ID")} views`;
          },
          title: (items: TooltipItem<"line">[]) => items[0]?.label ?? ""
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: "#64748b",
          maxRotation: 0,
          font: { size: 12 }
        },
        grid: { display: false }
      },
      y: {
        ticks: {
          color: "#94a3b8",
          callback: (value: string | number) =>
            Number(value || 0).toLocaleString("id-ID"),
          font: { size: 11 }
        },
        grid: { color: "#e2e8f0", drawBorder: false }
      }
    },
    interaction: { mode: "index" as const, intersect: false },
    layout: { padding: { top: 8, right: 8, bottom: 4, left: 0 } }
  };

  return (
    <section className="relative overflow-hidden bg-white py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 -top-24 h-64 w-64 rounded-full bg-[#FFB900]/10 blur-3xl" />
        <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-[#5E7ADD]/10 blur-3xl" />
      </div>

      <motion.div
        className="relative z-10 container mx-auto px-6 lg:px-12"
        initial="hidden"
        whileInView="visible"
        variants={containerVariants}
        viewport={{ once: true }}
      >
        <motion.div className="mb-14 text-center" variants={fadeUp}>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#D7E2FF] bg-[#EFF4FF] px-3 py-1 text-xs font-semibold text-[#5E7ADD]">
            <ChartBarSquareIcon className="h-4 w-4" />
            <span>Analitik - Akses SIDE</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-wide text-[#162360] sm:text-4xl lg:text-5xl">
            Visualisasi Akses SIDE
          </h2>
          <div className="mx-auto mt-4 w-16 rounded-full border-t-4 border-[#FFB900] sm:w-20" />
          <p className="mx-auto mt-4 max-w-3xl text-lg font-medium text-[#5E7ADD]">
            Statistik penggunaan SIDE melalui line chart dan kartu ringkasan
            informatif.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-3"
          variants={fadeUp}
        >
          <motion.div
            className="rounded-3xl border border-slate-200 bg-linear-to-b from-white via-[#F5F7FF] to-[#EEF2FF] p-6 shadow-lg sm:p-7 lg:col-span-2"
            variants={fadeUp}
          >
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-[#162360] sm:text-lg">
                  Tren Views SIDE
                </h3>
                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  Garis tren dengan area gradient dan garis rata-rata untuk
                  melihat pola kenaikan akses.
                </p>
              </div>

              <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] text-slate-500 sm:text-xs">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#3B5BDB]" />
                <span>Views per periode</span>
                <span className="inline-flex h-2.5 w-2.5 rounded-full border border-[#CBD5F5] bg-white" />
                <span>Garis rata-rata</span>
              </div>
            </div>

            <div className="relative h-80 sm:h-96">
              <Line data={lineData} options={lineOptions} />
            </div>
            {isLoading && (
              <p className="mt-3 text-xs text-slate-500">
                Memuat data analitik...
              </p>
            )}
          </motion.div>

          <motion.div className="flex flex-col" variants={fadeUp}>
            <div className="grid grid-cols-1 gap-5">
              <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm transition-shadow hover:shadow-md">
                <div className="absolute left-0 top-0 h-1 w-16 rounded-br-full bg-[#FFB900]" />
                <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-[#FFB900]/15 blur-2xl" />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Total Views
                    </p>
                    <p className="mt-2 text-2xl font-bold text-[#162360]">
                      {totalViews.toLocaleString("id-ID")}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Akumulasi seluruh periode.
                    </p>
                  </div>
                  <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-2xl bg-[#FFF7DA]">
                    <ChartBarIcon className="h-4 w-4 text-[#F59E0B]" />
                  </div>
                </div>
              </article>

              <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm transition-shadow hover:shadow-md">
                <div className="absolute left-0 top-0 h-1 w-16 rounded-br-full bg-[#5E7ADD]" />
                <div className="absolute -bottom-8 -left-8 h-16 w-16 rounded-full bg-[#5E7ADD]/15 blur-2xl" />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Rata-rata Per Bulan
                    </p>
                    <p className="mt-2 text-2xl font-bold text-[#162360]">
                      {avgViews.toLocaleString("id-ID")}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Berdasarkan {history.length} periode terakhir.
                    </p>
                  </div>
                  <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-2xl bg-[#E3E9FF]">
                    <ChartPieIcon className="h-4 w-4 text-[#4F46E5]" />
                  </div>
                </div>
              </article>

              <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm transition-shadow hover:shadow-md">
                <div className="absolute left-0 top-0 h-1 w-16 rounded-br-full bg-emerald-500" />
                <div className="absolute -left-4 -top-10 h-16 w-16 rounded-full bg-emerald-200/25 blur-2xl" />
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Periode Terakhir
                </p>
                <p className="mt-2 text-2xl font-bold text-[#162360]">
                  {latest.views.toLocaleString("id-ID")}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  {latest.label}
                </p>

                <div
                  className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium ${diffBg}`}
                >
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${diffIconBg}`}
                  >
                    <ArrowTrendingUpIcon
                      className={`h-3.5 w-3.5 ${diffColor}`}
                    />
                  </span>
                  <span className={diffColor}>
                    {isPositive ? "+" : ""}
                    {diff.toLocaleString("id-ID")} views (
                    {isPositive ? "+" : ""}
                    {diffPercent.toFixed(1)}%)
                  </span>
                </div>
              </article>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
