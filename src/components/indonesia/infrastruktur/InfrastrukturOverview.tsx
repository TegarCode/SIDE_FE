import React from "react";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { FilterFallbackCard } from "@/components/ui/FilterFallbackCard";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { ChartSkeleton } from "@/components/ui/skeletons/ChartSkeleton";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";
import { InfrastrukturMap } from "@/components/indonesia/infrastruktur/InfrastrukturMap";
import { InfrastrukturTabPlaceholder } from "@/components/indonesia/infrastruktur/tabs/InfrastrukturTabPlaceholder";
import { PameranIndonesiaTab } from "@/components/indonesia/infrastruktur/tabs/PameranIndonesiaTab";
import { PameranPerwakilanTab } from "@/components/indonesia/infrastruktur/tabs/PameranPerwakilanTab";
import { PerjanjianAntarNegaraTab } from "@/components/indonesia/infrastruktur/tabs/PerjanjianAntarNegaraTab";
import { PerwakilanAsingTab } from "@/components/indonesia/infrastruktur/tabs/PerwakilanAsingTab";
import { PerwakilanIndonesiaTab } from "@/components/indonesia/infrastruktur/tabs/PerwakilanIndonesiaTab";
import type {
  InfrastrukturOverviewData,
  InfrastrukturPerjanjianAntarNegaraData,
  InfrastrukturPerwakilanAsingData,
  InfrastrukturPameranIndonesiaData,
  InfrastrukturPameranPerwakilanData,
  InfrastrukturTabSlug
} from "@/type/indonesiaInfrastruktur";

type InfrastrukturOverviewProps = {
  overview: InfrastrukturOverviewData | null;
  foreignOverview: InfrastrukturPerwakilanAsingData | null;
  expoOverview: InfrastrukturPameranIndonesiaData | null;
  repExpoOverview: InfrastrukturPameranPerwakilanData | null;
  agreementOverview: InfrastrukturPerjanjianAntarNegaraData | null;
  loading: boolean;
  foreignLoading: boolean;
  expoLoading: boolean;
  repExpoLoading: boolean;
  agreementLoading: boolean;
  error: string | null;
  foreignError: string | null;
  expoError: string | null;
  repExpoError: string | null;
  agreementError: string | null;
  activeTab: InfrastrukturTabSlug;
  onTabChange: (value: InfrastrukturTabSlug) => void;
};

const TAB_ITEMS: TabItem<InfrastrukturTabSlug>[] = [
  { value: "perwakilan_indonesia", label: "Perwakilan Indonesia" },
  {
    value: "perwakilan_asing_di_indonesia",
    label: "Perwakilan Asing di Indonesia"
  },
  {
    value: "pameran_di_indonesia",
    label: "Pameran di Indonesia"
  },
  {
    value: "pameran_di_perwakilan",
    label: "Pameran di Perwakilan"
  },
  {
    value: "perjanjian_antar_negara",
    label: "Perjanjian Antar Negara"
  }
];

const CATEGORY_STYLE = {
  KBRI: { color: "#1f2937", label: "Perwakilan Diplomatik (KBRI/PTRI)" },
  KJRI: { color: "#0f766e", label: "Perwakilan Konsuler (KJRI/KRI)" },
  ITPC: { color: "#0ea5e9", label: "Perwakilan Dagang (ITPC/KDEI)" },
  IIPC: { color: "#f59e0b", label: "IIPC" },
  BUMN: { color: "#7c3aed", label: "BUMN" },
  PERBANKAN: { color: "#475569", label: "Perbankan & Keuangan" }
} as const;

function hexToRgba(hex: string, alpha = 0.08) {
  const value = hex.replace("#", "");
  const parsed = Number.parseInt(value, 16);
  const r = (parsed >> 16) & 255;
  const g = (parsed >> 8) & 255;
  const b = parsed & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function InfrastrukturSummaryCards({
  overview
}: {
  overview: InfrastrukturOverviewData;
}) {
  const countMap = React.useMemo(
    () =>
      overview.statCards.byKategori.reduce<Record<string, number>>(
        (accumulator, item) => {
          accumulator[item.code.toUpperCase()] = item.count;
          return accumulator;
        },
        {}
      ),
    [overview.statCards.byKategori]
  );

  return (
    <section
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
      data-infrastruktur-tour="summary-cards"
    >
      {Object.entries(CATEGORY_STYLE).map(([code, meta]) => (
        <div
          key={code}
          className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          style={{
            background: hexToRgba(meta.color, 0.08),
            borderColor: hexToRgba(meta.color, 0.24)
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: meta.color }}
            />
            <span className="text-[11px] font-medium text-slate-600">
              Kategori
            </span>
          </div>
          <div className="mt-1 text-sm font-semibold text-slate-900">
            {meta.label}
          </div>
          <div
            className="mt-3 text-3xl font-bold tracking-tight"
            style={{ color: meta.color }}
          >
            {(countMap[code] ?? 0).toLocaleString("id-ID")}
          </div>
          <div className="mt-1 text-[11px] text-slate-600">
            Total di wilayah
          </div>
        </div>
      ))}
    </section>
  );
}

function getTabPlaceholder(tab: InfrastrukturTabSlug) {
  if (tab === "perwakilan_indonesia") {
    return "Endpoint detail tab Perwakilan Indonesia belum dihubungkan pada tahap ini.";
  }
  return "Endpoint tab ini belum dihubungkan pada tahap ini.";
}

export function InfrastrukturOverview({
  overview,
  foreignOverview,
  expoOverview,
  repExpoOverview,
  agreementOverview,
  loading,
  foreignLoading,
  expoLoading,
  repExpoLoading,
  agreementLoading,
  error,
  foreignError,
  expoError,
  repExpoError,
  agreementError,
  activeTab,
  onTabChange
}: InfrastrukturOverviewProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`infrastruktur-summary-${index}`}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="animate-pulse space-y-3">
                <div className="h-3 w-20 rounded bg-slate-200" />
                <div className="h-4 w-full rounded bg-slate-200" />
                <div className="h-8 w-16 rounded bg-slate-200" />
                <div className="h-3 w-24 rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </section>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              Peta Persebaran Perwakilan Indonesia
            </h3>
            <span className="text-[11px] text-slate-500">Memuat...</span>
          </div>
          <div className="mt-4">
            <ChartSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <FilterFallbackCard
        title="Data infrastruktur gagal dimuat"
        body={error}
      />
    );
  }

  if (!overview) {
    return (
      <FilterFallbackCard
        title="Data infrastruktur belum tersedia"
        body="Pilih filter lalu tekan Cari Data untuk menampilkan data infrastruktur."
      />
    );
  }

  return (
    <div className="space-y-4">
      <InfrastrukturSummaryCards overview={overview} />

      <div data-infrastruktur-tour="map-panel">
        <ExpandableCard
          title="Peta Persebaran Perwakilan Indonesia"
          subtitle={`${overview.items.length} marker aktif | Total perwakilan: ${overview.statCards.total.toLocaleString("id-ID")}`}
          className="min-w-0"
          modalSize="full"
          expandedContent={
            <InfrastrukturMap markers={overview.markers} className="h-[78vh]" />
          }
        >
          <div className="relative">
            <InfrastrukturMap markers={overview.markers} className="h-144" />
          </div>
        </ExpandableCard>
      </div>

      <section className="space-y-3">
        <div data-infrastruktur-tour="tabs-section">
          <Tabs
            items={TAB_ITEMS}
            value={activeTab}
            onChange={onTabChange}
            className="overflow-x-auto"
            listClassName="min-w-max"
          />
        </div>

        <div data-infrastruktur-tour="tab-content">
          {activeTab === "perwakilan_indonesia" ? (
            <PerwakilanIndonesiaTab overview={overview} />
          ) : activeTab === "perwakilan_asing_di_indonesia" ? (
            foreignLoading ? (
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <TableSkeleton />
              </div>
            ) : foreignError ? (
              <FilterFallbackCard
                title="Data perwakilan asing gagal dimuat"
                body={foreignError}
              />
            ) : foreignOverview ? (
              <PerwakilanAsingTab data={foreignOverview} />
            ) : (
              <InfrastrukturTabPlaceholder
                title={
                  TAB_ITEMS.find((item) => item.value === activeTab)?.label ??
                  "Tab Infrastruktur"
                }
                description="Data perwakilan asing belum tersedia."
              />
            )
          ) : activeTab === "pameran_di_indonesia" ? (
            expoLoading ? (
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <TableSkeleton />
              </div>
            ) : expoError ? (
              <FilterFallbackCard
                title="Data pameran di Indonesia gagal dimuat"
                body={expoError}
              />
            ) : expoOverview ? (
              <PameranIndonesiaTab data={expoOverview} />
            ) : (
              <InfrastrukturTabPlaceholder
                title={
                  TAB_ITEMS.find((item) => item.value === activeTab)?.label ??
                  "Tab Infrastruktur"
                }
                description="Data pameran di Indonesia belum tersedia."
              />
            )
          ) : activeTab === "pameran_di_perwakilan" ? (
            repExpoLoading ? (
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <TableSkeleton />
              </div>
            ) : repExpoError ? (
              <FilterFallbackCard
                title="Data pameran di perwakilan gagal dimuat"
                body={repExpoError}
              />
            ) : repExpoOverview ? (
              <PameranPerwakilanTab data={repExpoOverview} />
            ) : (
              <InfrastrukturTabPlaceholder
                title={
                  TAB_ITEMS.find((item) => item.value === activeTab)?.label ??
                  "Tab Infrastruktur"
                }
                description="Data pameran di perwakilan belum tersedia."
              />
            )
          ) : activeTab === "perjanjian_antar_negara" ? (
            agreementLoading ? (
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <TableSkeleton />
              </div>
            ) : agreementError ? (
              <FilterFallbackCard
                title="Data perjanjian antar negara gagal dimuat"
                body={agreementError}
              />
            ) : agreementOverview ? (
              <PerjanjianAntarNegaraTab data={agreementOverview} />
            ) : (
              <InfrastrukturTabPlaceholder
                title={
                  TAB_ITEMS.find((item) => item.value === activeTab)?.label ??
                  "Tab Infrastruktur"
                }
                description="Data perjanjian antar negara belum tersedia."
              />
            )
          ) : (
            <InfrastrukturTabPlaceholder
              title={
                TAB_ITEMS.find((item) => item.value === activeTab)?.label ??
                "Tab Infrastruktur"
              }
              description={getTabPlaceholder(activeTab)}
            />
          )}
        </div>
      </section>
    </div>
  );
}
