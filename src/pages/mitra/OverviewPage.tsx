import React from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { saveAs } from "file-saver";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { Button } from "@/components/ui/Button";
import { FilterFallbackCard } from "@/components/ui/FilterFallbackCard";
import { GuidedTour, type GuidedTourStep } from "@/components/ui/GuidedTour";
import { PageTitle } from "@/components/ui/PageTitle";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import { UnauthorizedAccessNotice } from "@/components/ui/UnauthorizedAccessNotice";
import { APP_NAME } from "@/constants/app";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useMitraMasterQuery } from "@/hooks/mitra/useMitraMasterQuery";
import { useMitraOverviewStatsQuery } from "@/hooks/mitra/useMitraOverviewStatsQuery";
import { useMitraOverviewTradeQuery } from "@/hooks/mitra/useMitraOverviewTradeQuery";
import { MitraOverviewGlobe } from "@/components/mitra/overview/MitraOverviewGlobe";
import { MitraOverviewLegend } from "@/components/mitra/overview/MitraOverviewLegend";
import { RegionCountryEntityFiltersPanel } from "@/components/filters/RegionCountryEntityFiltersPanel";
import { InvestasiOverviewTab } from "@/components/mitra/overview/tabs/InvestasiOverviewTab";
import { JasaOverviewTab } from "@/components/mitra/overview/tabs/JasaOverviewTab";
import { PariwisataOverviewTab } from "@/components/mitra/overview/tabs/PariwisataOverviewTab";
import { PerdaganganOverviewTab } from "@/components/mitra/overview/tabs/PerdaganganOverviewTab";
import { downloadMitraOverviewSummaryPdf } from "@/service/mitra";
import { isUnauthorizedApiError } from "@/utils/apiError";
import type { DiplomasiSummaryCardView } from "@/type/indonesiaDiplomasi";
import type {
  MitraFilterState,
  MitraOverviewStatMetric,
  MitraOverviewTopPartnerMetric
} from "@/type/mitra";

type MitraOverviewTabValue =
  | "perdagangan"
  | "investasi"
  | "pariwisata"
  | "jasa";

const TAB_ITEMS: TabItem<MitraOverviewTabValue>[] = [
  { value: "perdagangan", label: "Top Mitra Perdagangan" },
  { value: "investasi", label: "Top Negara/Entitas Investasi" },
  { value: "pariwisata", label: "Top Wisatawan" },
  { value: "jasa", label: "Top Jasa & Layanan" }
];

const MITRA_OVERVIEW_TOUR_STEPS: GuidedTourStep[] = [
  {
    selector: "[data-mitra-overview-tour='page-title']",
    title: "Pahami ringkasan halaman",
    description:
      "Mulai dari judul dan deskripsi untuk memahami bahwa halaman ini menampilkan overview umum negara mitra."
  },
  {
    selector: "[data-mitra-overview-tour='filters-panel']",
    title: "Pilih negara mitra",
    description:
      "Gunakan filter region, subregion, dan negara untuk menentukan mitra yang ingin dianalisis."
  },
  {
    selector: "[data-mitra-overview-tour='globe-section']",
    title: "Lihat globe dan ringkasan",
    description:
      "Bagian ini memperlihatkan peta globe dan kartu ringkasan utama untuk negara mitra yang dipilih."
  },
  {
    selector: "[data-mitra-overview-tour='tabs-section']",
    title: "Pilih tab top mitra",
    description:
      "Gunakan tab untuk berpindah antara perdagangan, investasi, pariwisata, dan jasa."
  },
  {
    selector: "[data-mitra-overview-tour='download-button']",
    title: "Unduh ringkasan PDF",
    description:
      "Gunakan tombol ini untuk mengunduh ringkasan PDF sesuai negara mitra, tab aktif, dan data overview yang sedang ditampilkan."
  },
  {
    selector: "[data-mitra-overview-tour='tab-content']",
    title: "Baca detail per tab",
    description:
      "Di bagian ini user bisa melihat detail dan ranking berdasarkan tab aktif."
  }
];

function extractYear(
  title: string | null | undefined,
  fallback: number | null
) {
  if (!title) return fallback ? String(fallback) : null;
  const match = title.match(/\b(20\d{2})\b/);
  return match?.[1] ?? (fallback ? String(fallback) : null);
}

function toCard(
  id: string,
  tone: DiplomasiSummaryCardView["tone"],
  metric: MitraOverviewStatMetric | null,
  override?: Partial<DiplomasiSummaryCardView>
): DiplomasiSummaryCardView {
  const year = extractYear(
    metric?.title,
    metric?.prev?.year != null ? metric.prev.year + 1 : null
  );
  return {
    id,
    title: metric?.title ?? "-",
    tone,
    unit: metric?.unit ?? "",
    value: metric?.value ?? null,
    prevValue: metric?.prev?.value ?? null,
    year,
    prevYear: metric?.prev?.year != null ? String(metric.prev.year) : null,
    note: "",
    highlight: null,
    prevHighlight: null,
    highlightType: "none",
    sourceName: metric?.source ?? null,
    ...override
  };
}

function topPartnerCard(
  metric: MitraOverviewTopPartnerMetric | null
): DiplomasiSummaryCardView {
  const year = extractYear(metric?.title, null);
  const shareText =
    typeof metric?.sharePercent === "number" &&
    Number.isFinite(metric.sharePercent)
      ? `${metric.sharePercent.toFixed(2)}% dari total perdagangan`
      : "";

  return {
    id: "mitra-overview-partner",
    title: metric?.title ?? "Mitra Dagang Terbesar",
    tone: "amber",
    unit: metric?.unit ?? "",
    value: metric?.value ?? null,
    prevValue: null,
    year,
    prevYear: null,
    note: shareText,
    highlight: metric?.partner?.name ?? null,
    prevHighlight: null,
    highlightType: "country",
    sourceName: metric?.source ?? null
  };
}

export function MitraOverviewPage() {
  useDocumentTitle(`Ringkasan Mitra | ${APP_NAME}`);
  const masterQuery = useMitraMasterQuery();
  const [filters, setFilters] = React.useState<MitraFilterState>({
    region: null,
    subregion: null,
    country: null
  });
  const hasInitializedFiltersRef = React.useRef(false);
  const { toast, dismiss } = useToast();
  const [activeTab, setActiveTab] =
    React.useState<MitraOverviewTabValue>("perdagangan");
  const statsQuery = useMitraOverviewStatsQuery(filters.country);
  const tradeQuery = useMitraOverviewTradeQuery();
  const hasUnauthorizedError =
    isUnauthorizedApiError(masterQuery.error) ||
    isUnauthorizedApiError(statsQuery.error) ||
    isUnauthorizedApiError(tradeQuery.error);
  const loadingToastIdRef = React.useRef<string | null>(null);
  const lastCompletedOverviewToastKeyRef = React.useRef<string | null>(null);
  const [summaryPdfLoading, setSummaryPdfLoading] = React.useState(false);

  const selectedCountryOption = React.useMemo(
    () =>
      masterQuery.data?.countryOptions.find(
        (item) => item.value === filters.country
      ) ?? null,
    [filters.country, masterQuery.data?.countryOptions]
  );

  const selectedCountryName =
    statsQuery.data?.country ?? selectedCountryOption?.label ?? "TIONGKOK";
  const selectedCountryAlpha2 =
    statsQuery.data?.alpha2 ?? selectedCountryOption?.alpha2 ?? "CN";

  React.useEffect(() => {
    if (!masterQuery.data || hasInitializedFiltersRef.current) return;

    const defaultChina =
      masterQuery.data.countryOptions.find((item) => item.value === "CHN")
        ?.value ??
      masterQuery.data.countryOptions[0]?.value ??
      null;

    hasInitializedFiltersRef.current = true;
    setFilters({
      region: null,
      subregion: null,
      country: defaultChina
    });
  }, [masterQuery.data]);

  const handleReset = React.useCallback(() => {
    const defaultChina =
      masterQuery.data?.countryOptions.find((item) => item.value === "CHN")
        ?.value ??
      masterQuery.data?.countryOptions[0]?.value ??
      null;

    setFilters({
      region: null,
      subregion: null,
      country: defaultChina
    });
  }, [masterQuery.data?.countryOptions]);

  const summaryCards = React.useMemo<DiplomasiSummaryCardView[]>(
    () => [
      toCard(
        "mitra-overview-trade",
        "orange",
        statsQuery.data?.totalPerdagangan ?? null
      ),
      toCard(
        "mitra-overview-balance",
        "purple",
        statsQuery.data?.neracaPerdagangan ?? null
      ),
      toCard(
        "mitra-overview-export",
        "emerald",
        statsQuery.data?.ekspor ?? null
      ),
      toCard("mitra-overview-import", "rose", statsQuery.data?.impor ?? null),
      toCard(
        "mitra-overview-inbound-investment",
        "blue",
        statsQuery.data?.inboundInvestment ?? null
      ),
      toCard(
        "mitra-overview-outbound-investment",
        "sky",
        statsQuery.data?.outboundInvestment ?? null
      ),
      toCard(
        "mitra-overview-tourism",
        "cyan",
        statsQuery.data?.outboundTourism ?? null
      ),
      topPartnerCard(statsQuery.data?.topTradePartner ?? null)
    ],
    [statsQuery.data]
  );

  const overviewLoading = statsQuery.isLoading || tradeQuery.isLoading;
  const overviewFetching = statsQuery.isFetching || tradeQuery.isFetching;
  const overviewToastKey = React.useMemo(() => {
    if (!filters.country) return null;
    return `mitra-overview-${filters.country.toUpperCase()}`;
  }, [filters.country]);

  React.useEffect(() => {
    if (!overviewToastKey) return;

    if (overviewFetching) {
      if (loadingToastIdRef.current) return;
      loadingToastIdRef.current = toast({
        title: "Sedang tarik ringkasan negara mitra",
        description: `Memuat data overview untuk ${selectedCountryName}.`,
        tone: "loading",
        durationMs: null
      });
      return;
    }

    if (loadingToastIdRef.current) {
      dismiss(loadingToastIdRef.current);
      loadingToastIdRef.current = null;
    }
  }, [dismiss, overviewFetching, overviewToastKey, selectedCountryName, toast]);

  React.useEffect(() => {
    if (!overviewToastKey || overviewFetching) return;
    if (!statsQuery.isSuccess || !tradeQuery.isSuccess) return;
    if (lastCompletedOverviewToastKeyRef.current === overviewToastKey) return;

    lastCompletedOverviewToastKeyRef.current = overviewToastKey;
    toast({
      title: "Ringkasan negara mitra siap",
      description: `Data overview ${selectedCountryName} berhasil dimuat.`,
      tone: "success"
    });
  }, [
    overviewFetching,
    overviewToastKey,
    selectedCountryName,
    statsQuery.isSuccess,
    toast,
    tradeQuery.isSuccess
  ]);

  React.useEffect(() => {
    if (!hasUnauthorizedError) return;
    toast({
      title: "Sesi login diperlukan",
      description:
        "Ringkasan mitra tidak dapat dimuat karena akses Anda belum valid.",
      tone: "warning",
      durationMs: 3200
    });
  }, [hasUnauthorizedError, toast]);

  const handleDownloadSummaryPdf = React.useCallback(async () => {
    if (!filters.country) return;

    const loadingId = toast({
      title: "Menyiapkan ringkasan PDF",
      description: `Ringkasan ${selectedCountryName} untuk tab ${activeTab} sedang diproses...`,
      tone: "loading",
      durationMs: null
    });

    setSummaryPdfLoading(true);

    try {
      const filenameBase = `Ringkasan_${activeTab}_${filters.country}.pdf`;
      const result = await downloadMitraOverviewSummaryPdf(
        activeTab,
        filters.country,
        filenameBase
      );
      saveAs(
        result.blob,
        result.filename.endsWith(".pdf")
          ? result.filename
          : `${result.filename}.pdf`
      );

      dismiss(loadingId);
      toast({
        title: "Ringkasan PDF berhasil diunduh",
        description: `File overview ${selectedCountryName} siap digunakan.`,
        tone: "success",
        durationMs: 2200
      });
    } catch (error) {
      dismiss(loadingId);
      toast({
        title: "Unduh ringkasan gagal",
        description:
          error instanceof Error
            ? error.message
            : "PDF ringkasan belum dapat diunduh.",
        tone: "error",
        durationMs: 3200
      });
    } finally {
      setSummaryPdfLoading(false);
    }
  }, [activeTab, dismiss, filters.country, selectedCountryName, toast]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <div className="space-y-6 px-4 py-6 lg:px-8">
        <div data-mitra-overview-tour="page-title">
          <PageTitle
            title="Ringkasan Mitra"
            description="Gambaran umum mitra strategis. Angka yang ditampilkan umumnya menggunakan tahun data terbaru yang tersedia."
          />
        </div>

        <div data-mitra-overview-tour="filters-panel">
          <RegionCountryEntityFiltersPanel
            regionOptions={masterQuery.data?.regionOptions ?? []}
            subregionOptions={masterQuery.data?.subregionOptions ?? []}
            countryOptions={masterQuery.data?.countryOptions ?? []}
            value={filters}
            loading={masterQuery.isLoading}
            requestLoading={masterQuery.isFetching || overviewFetching}
            onSubmit={setFilters}
            onReset={handleReset}
          />
        </div>

        {hasUnauthorizedError ? (
          <UnauthorizedAccessNotice
            title="Data ringkasan mitra memerlukan sesi login yang aktif"
            body="Permintaan ke layanan overview mitra menerima respons 401. Masuk kembali lalu muat ulang halaman ini untuk melihat globe, ringkasan, dan tab analisis."
          />
        ) : !filters.country ? (
          <FilterFallbackCard
            title="Negara / entitas mitra belum dipilih"
            body="Pilih minimal satu negara mitra untuk menampilkan globe dan ringkasan statistik."
          />
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-end">
              <MitraOverviewLegend />
            </div>

            <div
              className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)]"
              data-mitra-overview-tour="globe-section"
            >
              <MitraOverviewGlobe
                tradeSummary={tradeQuery.data ?? null}
                highlightA2={selectedCountryAlpha2}
                countryName={selectedCountryName}
                loading={tradeQuery.isLoading && !tradeQuery.data}
                onCountrySelect={(alpha2) => {
                  const nextCountry =
                    masterQuery.data?.countryOptions.find(
                      (option) =>
                        option.alpha2?.toUpperCase() === alpha2.toUpperCase()
                    )?.value ?? null;

                  if (!nextCountry || nextCountry === filters.country) return;
                  setFilters({
                    region: null,
                    subregion: null,
                    country: nextCountry
                  });
                }}
              />

              <div className="">
                <div className="inline-flex items-center gap-1 py-3">
                  <CountryFlag
                    alpha2={selectedCountryAlpha2}
                    countryName={selectedCountryName}
                    className="h-14 w-14 rounded-none p-0 text-[2.5rem] leading-none"
                  />
                  <div>
                    <div className="text-3xl font-extrabold tracking-tight text-slate-900">
                      {selectedCountryName}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {summaryCards.map((card) => (
                    <SummaryCard
                      key={card.id}
                      card={card}
                      loading={overviewLoading && !statsQuery.data}
                    />
                  ))}
                </div>
              </div>
            </div>

            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div data-mitra-overview-tour="tabs-section">
                  <Tabs
                    items={TAB_ITEMS}
                    value={activeTab}
                    onChange={setActiveTab}
                    listClassName="flex-wrap"
                    tabClassName="px-4 py-2 text-sm"
                  />
                </div>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleDownloadSummaryPdf}
                  disabled={!filters.country || summaryPdfLoading}
                  data-mitra-overview-tour="download-button"
                  className="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-xs font-semibold text-white transition"
                >
                  <ArrowDownTrayIcon className="h-3.5 w-3.5" />
                  {summaryPdfLoading
                    ? "Menyiapkan PDF..."
                    : "Unduh Ringkasan (PDF)"}
                </Button>
              </div>

              <div data-mitra-overview-tour="tab-content">
                {activeTab === "perdagangan" ? (
                  <PerdaganganOverviewTab
                    key={`perdagangan-${filters.country ?? "na"}`}
                    countryCode={filters.country}
                    countryName={selectedCountryName}
                  />
                ) : null}
                {activeTab === "investasi" ? (
                  <InvestasiOverviewTab
                    key={`investasi-${filters.country ?? "na"}`}
                    countryCode={filters.country}
                    countryName={selectedCountryName}
                  />
                ) : null}
                {activeTab === "pariwisata" ? (
                  <PariwisataOverviewTab
                    key={`pariwisata-${filters.country ?? "na"}`}
                    countryCode={filters.country}
                    countryName={selectedCountryName}
                  />
                ) : null}
                {activeTab === "jasa" ? (
                  <JasaOverviewTab
                    key={`jasa-${filters.country ?? "na"}`}
                    countryCode={filters.country}
                    countryName={selectedCountryName}
                  />
                ) : null}
              </div>
            </section>
          </div>
        )}
      </div>

      <GuidedTour
        steps={MITRA_OVERVIEW_TOUR_STEPS}
        storageKey="side-mitra-overview-tour-completed"
        launcherLabel="Tur Halaman"
        coachmarkLabel="Panduan halaman"
        spotlightZIndex={1600}
        coachmarkZIndex={1700}
      />
    </div>
  );
}
