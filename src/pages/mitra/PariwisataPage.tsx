import React from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { saveAs } from "file-saver";
import { APP_NAME } from "@/constants/app";
import { MitraInvestmentRouteFiltersPanel } from "@/components/filters/BilateralRouteFiltersPanel";
import { RegionCountryEntityFiltersPanel } from "@/components/filters/RegionCountryEntityFiltersPanel";
import { MitraInvestmentTableCard } from "@/components/mitra/investasi/MitraInvestmentTableCard";
import { MitraTourismSummarySection } from "@/components/mitra/pariwisata/MitraTourismSummarySection";
import { MitraTourismTrendSection } from "@/components/mitra/pariwisata/MitraTourismTrendSection";
import { toTopMitraRaw } from "@/components/mitra/pariwisata/helpers";
import { Button } from "@/components/ui/Button";
import { FilterFallbackCard } from "@/components/ui/FilterFallbackCard";
import { GuidedTour, type GuidedTourStep } from "@/components/ui/GuidedTour";
import { PageTitle } from "@/components/ui/PageTitle";
import { useToast } from "@/components/ui/Toast";
import { UnauthorizedAccessNotice } from "@/components/ui/UnauthorizedAccessNotice";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useMitraMasterQuery } from "@/hooks/mitra/useMitraMasterQuery";
import { useMitraMultiTourismQuery } from "@/hooks/mitra/useMitraMultiTourismQuery";
import { useMitraSingleTourismQuery } from "@/hooks/mitra/useMitraSingleTourismQuery";
import type { MitraFilterState } from "@/type/mitra";
import { downloadMitraTourismSummaryPdf } from "@/service/mitra";
import { isUnauthorizedApiError } from "@/utils/apiError";

const DEFAULT_ROUTE_FILTERS = {
  origins: ["CHN"],
  destinations: ["IDN"]
};

const MITRA_PARIWISATA_TOUR_STEPS: GuidedTourStep[] = [
  {
    selector: "[data-mitra-pariwisata-tour='page-title']",
    title: "Pahami konteks halaman",
    description:
      "Halaman ini menampilkan ringkasan dan tren pariwisata negara mitra."
  },
  {
    selector: "[data-mitra-pariwisata-tour='download-button']",
    title: "Unduh ringkasan PDF",
    description:
      "Gunakan tombol ini untuk mengunduh ringkasan PDF sesuai negara, filter rute, dan data pariwisata yang sedang ditampilkan."
  },
  {
    selector: "[data-mitra-pariwisata-tour='country-filter']",
    title: "Pilih negara mitra",
    description:
      "Gunakan filter negara untuk menentukan ringkasan dan tabel pariwisata yang ingin dianalisis."
  },
  {
    selector: "[data-mitra-pariwisata-tour='summary-section']",
    title: "Lihat ringkasan dan tabel pariwisata",
    description:
      "Bagian ini menampilkan ringkasan wisatawan dan tabel asal/tujuan wisatawan."
  },
  {
    selector: "[data-mitra-pariwisata-tour='route-filter']",
    title: "Atur filter rute pariwisata",
    description:
      "Filter ini dipakai untuk memilih asal dan tujuan pada grafik tren tahunan pariwisata."
  },
  {
    selector: "[data-mitra-pariwisata-tour='trend-section']",
    title: "Baca tren tahunan pariwisata",
    description:
      "Bagian ini menunjukkan perkembangan arus wisata berdasarkan rute yang dipilih."
  }
];

export function MitraPariwisataPage() {
  useDocumentTitle(`Pariwisata Negara Mitra | ${APP_NAME}`);
  const masterQuery = useMitraMasterQuery();
  const [filters, setFilters] = React.useState<MitraFilterState>({
    region: null,
    subregion: null,
    country: null
  });
  const hasInitializedFiltersRef = React.useRef(false);
  const { toast, dismiss } = useToast();
  const [routeFilters, setRouteFilters] = React.useState(DEFAULT_ROUTE_FILTERS);
  const query = useMitraSingleTourismQuery(filters.country);
  const multiQuery = useMitraMultiTourismQuery(
    routeFilters.origins,
    routeFilters.destinations
  );
  const hasUnauthorizedError =
    isUnauthorizedApiError(masterQuery.error) ||
    isUnauthorizedApiError(query.error) ||
    isUnauthorizedApiError(multiQuery.error);
  const loadingToastIdRef = React.useRef<string | null>(null);
  const lastCompletedToastKeyRef = React.useRef<string | null>(null);
  const multiLoadingToastIdRef = React.useRef<string | null>(null);
  const lastCompletedMultiToastKeyRef = React.useRef<string | null>(null);
  const [summaryPdfLoading, setSummaryPdfLoading] = React.useState(false);
  const selectedCountryLabel =
    query.data?.countryName ??
    masterQuery.data?.countryOptions.find(
      (item) => item.value === filters.country
    )?.label ??
    filters.country ??
    "-";
  const toastKey = React.useMemo(() => {
    if (!filters.country) return null;
    return `mitra-pariwisata-single-${filters.country.toUpperCase()}`;
  }, [filters.country]);
  const multiToastKey = React.useMemo(() => {
    if (
      routeFilters.origins.length === 0 ||
      routeFilters.destinations.length === 0
    )
      return null;
    return `mitra-pariwisata-multi-${routeFilters.origins.join("|")}-${routeFilters.destinations.join("|")}`;
  }, [routeFilters.destinations, routeFilters.origins]);
  const routeSummaryLabel = React.useMemo(() => {
    const originLabel =
      multiQuery.data && multiQuery.data.origins.length > 0
        ? `${multiQuery.data.origins.length} asal`
        : `${routeFilters.origins.length} asal`;
    const destinationLabel =
      multiQuery.data && multiQuery.data.destinations.length > 0
        ? `${multiQuery.data.destinations.length} tujuan`
        : `${routeFilters.destinations.length} tujuan`;
    return `${originLabel} dan ${destinationLabel}`;
  }, [
    multiQuery.data,
    routeFilters.destinations.length,
    routeFilters.origins.length
  ]);

  React.useEffect(() => {
    if (!toastKey) return;

    if (query.isFetching) {
      if (loadingToastIdRef.current) return;
      loadingToastIdRef.current = toast({
        title: "Sedang memuat data pariwisata",
        description: `Memuat data pariwisata untuk ${selectedCountryLabel}.`,
        tone: "loading",
        durationMs: null
      });
      return;
    }

    if (loadingToastIdRef.current) {
      dismiss(loadingToastIdRef.current);
      loadingToastIdRef.current = null;
    }
  }, [dismiss, query.isFetching, selectedCountryLabel, toast, toastKey]);

  React.useEffect(() => {
    if (!toastKey || query.isFetching || !query.isSuccess || !query.data)
      return;
    if (lastCompletedToastKeyRef.current === toastKey) return;

    lastCompletedToastKeyRef.current = toastKey;
    toast({
      title: "Data pariwisata berhasil dimuat",
      description: `Data pariwisata untuk ${selectedCountryLabel} berhasil dimuat.`,
      tone: "success"
    });
  }, [
    query.data,
    query.isFetching,
    query.isSuccess,
    selectedCountryLabel,
    toast,
    toastKey
  ]);

  React.useEffect(() => {
    if (!query.error) return;
    toast({
      title: "Data pariwisata gagal dimuat",
      description:
        query.error instanceof Error
          ? query.error.message
          : "Terjadi kesalahan saat memuat data pariwisata.",
      tone: "error"
    });
  }, [query.error, toast]);

  React.useEffect(() => {
    if (!multiToastKey) return;

    if (multiQuery.isFetching) {
      if (multiLoadingToastIdRef.current) return;
      multiLoadingToastIdRef.current = toast({
        title: "Sedang memuat grafik pariwisata",
        description: `Memuat tren tahunan pariwisata untuk ${routeSummaryLabel}.`,
        tone: "loading",
        durationMs: null
      });
      return;
    }

    if (multiLoadingToastIdRef.current) {
      dismiss(multiLoadingToastIdRef.current);
      multiLoadingToastIdRef.current = null;
    }
  }, [dismiss, multiQuery.isFetching, multiToastKey, routeSummaryLabel, toast]);

  React.useEffect(() => {
    if (
      !multiToastKey ||
      multiQuery.isFetching ||
      !multiQuery.isSuccess ||
      !multiQuery.data
    )
      return;
    if (lastCompletedMultiToastKeyRef.current === multiToastKey) return;

    lastCompletedMultiToastKeyRef.current = multiToastKey;
    toast({
      title: "Grafik pariwisata berhasil dimuat",
      description: `Tren tahunan pariwisata untuk ${routeSummaryLabel} berhasil dimuat.`,
      tone: "success"
    });
  }, [
    multiQuery.data,
    multiQuery.isFetching,
    multiQuery.isSuccess,
    multiToastKey,
    routeSummaryLabel,
    toast
  ]);

  React.useEffect(() => {
    if (!multiQuery.error) return;
    toast({
      title: "Grafik pariwisata gagal dimuat",
      description:
        multiQuery.error instanceof Error
          ? multiQuery.error.message
          : "Terjadi kesalahan saat memuat grafik tren tahunan pariwisata.",
      tone: "error"
    });
  }, [multiQuery.error, toast]);

  React.useEffect(() => {
    if (!hasUnauthorizedError) return;
    toast({
      title: "Sesi login diperlukan",
      description:
        "Data pariwisata mitra tidak dapat dimuat karena akses Anda belum valid.",
      tone: "warning",
      durationMs: 3200
    });
  }, [hasUnauthorizedError, toast]);

  const inboundRaw = React.useMemo(
    () =>
      toTopMitraRaw(
        query.data?.tableInbound ?? [],
        query.data?.year ?? null,
        query.data?.prevYear ?? null
      ),
    [query.data]
  );
  const outboundRaw = React.useMemo(
    () =>
      toTopMitraRaw(
        query.data?.tableOutbound ?? [],
        query.data?.year ?? null,
        query.data?.prevYear ?? null
      ),
    [query.data]
  );

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

  const handleDownloadSummary = React.useCallback(async () => {
    if (!filters.country) return;

    const loadingId = toast({
      title: "Menyiapkan ringkasan PDF",
      description: "Ringkasan sektor pariwisata sedang diproses...",
      tone: "loading",
      durationMs: null
    });

    setSummaryPdfLoading(true);

    try {
      const filenameBase = `Ringkasan_Pariwisata_${filters.country}_${routeFilters.origins.join("-")}_${routeFilters.destinations.join("-")}.pdf`;
      const result = await downloadMitraTourismSummaryPdf(
        {
          country: filters.country,
          origin: routeFilters.origins,
          destination: routeFilters.destinations
        },
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
        description: "File ringkasan sektor pariwisata siap digunakan.",
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
  }, [
    dismiss,
    filters.country,
    routeFilters.destinations,
    routeFilters.origins,
    toast
  ]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <div className="space-y-6 px-4 py-6 lg:px-8">
        <div data-mitra-pariwisata-tour="page-title">
          <PageTitle
            title="Sektor Pariwisata"
            description="Data dan tren kerjasama sektor pariwisata negara/entitas mitra. Angka yang ditampilkan umumnya menggunakan tahun data terbaru yang tersedia."
            actions={
              <Button
                type="button"
                variant="primary"
                onClick={handleDownloadSummary}
                disabled={
                  summaryPdfLoading ||
                  !filters.country ||
                  routeFilters.origins.length === 0 ||
                  routeFilters.destinations.length === 0
                }
                data-mitra-pariwisata-tour="download-button"
                className="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-xs font-semibold text-white transition"
              >
                <ArrowDownTrayIcon className="h-3.5 w-3.5" />
                {summaryPdfLoading
                  ? "Menyiapkan PDF..."
                  : "Unduh Ringkasan (PDF)"}
              </Button>
            }
          />
        </div>

        <div data-mitra-pariwisata-tour="country-filter">
          <RegionCountryEntityFiltersPanel
            regionOptions={masterQuery.data?.regionOptions ?? []}
            subregionOptions={masterQuery.data?.subregionOptions ?? []}
            countryOptions={masterQuery.data?.countryOptions ?? []}
            value={filters}
            loading={masterQuery.isLoading}
            requestLoading={
              masterQuery.isFetching ||
              query.isFetching ||
              multiQuery.isFetching
            }
            onSubmit={setFilters}
            onReset={handleReset}
          />
        </div>

        <div className="space-y-6">
          {hasUnauthorizedError ? (
            <UnauthorizedAccessNotice
              title="Data pariwisata mitra memerlukan sesi login yang aktif"
              body="Permintaan ke layanan pariwisata mitra menerima respons 401. Masuk kembali lalu muat ulang halaman ini untuk melihat ringkasan, tabel, dan tren tahunannya."
            />
          ) : !filters.country ? (
            <FilterFallbackCard
              title="Negara / entitas mitra belum dipilih"
              body="Pilih satu negara mitra untuk menampilkan ringkasan dan tabel pariwisata."
            />
          ) : query.error ? (
            <FilterFallbackCard
              title="Data pariwisata negara mitra gagal dimuat"
              body={
                query.error instanceof Error
                  ? query.error.message
                  : "Terjadi kesalahan saat mengambil data pariwisata."
              }
            />
          ) : !query.isLoading && !query.data ? (
            <FilterFallbackCard
              title="Data pariwisata negara mitra belum tersedia"
              body={`Data pariwisata untuk ${selectedCountryLabel} belum tersedia.`}
            />
          ) : (
            <div
              className="space-y-6"
              data-mitra-pariwisata-tour="summary-section"
            >
              <MitraTourismSummarySection
                data={query.data}
                loading={query.isLoading && !query.data}
                countryLabel={selectedCountryLabel}
              />

              <section className="space-y-3">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                    Tabel Pariwisata
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Daftar asal wisatawan mancanegara dan tujuan wisatawan pada
                    tahun terbaru yang tersedia.
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
                    <span>Asal</span>
                    <span className="font-medium text-slate-700">Dunia</span>
                    <span>Tujuan</span>
                    <span className="font-medium text-slate-700">
                      {selectedCountryLabel}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  <MitraInvestmentTableCard
                    title="Asal Wisatawan Mancanegara"
                    raw={inboundRaw}
                    unitLabel="Orang"
                    sourceName={query.data?.sourceName}
                    latestYear={query.data?.year ?? null}
                    prevYear={query.data?.prevYear ?? null}
                    loading={query.isLoading && !query.data}
                    emptyMessage={`Data asal wisatawan mancanegara ke ${selectedCountryLabel} belum tersedia.`}
                  />
                  <MitraInvestmentTableCard
                    title="Tujuan Wisatawan Mancanegara"
                    raw={outboundRaw}
                    unitLabel="Orang"
                    sourceName={query.data?.sourceName}
                    latestYear={query.data?.year ?? null}
                    prevYear={query.data?.prevYear ?? null}
                    loading={query.isLoading && !query.data}
                    emptyMessage={`Data tujuan wisatawan ${selectedCountryLabel} ke mancanegara belum tersedia.`}
                  />
                </div>
              </section>
            </div>
          )}

          <div data-mitra-pariwisata-tour="route-filter">
            <MitraInvestmentRouteFiltersPanel
              value={routeFilters}
              loading={masterQuery.isLoading}
              requestLoading={masterQuery.isFetching || multiQuery.isFetching}
              title="Filter Rute Pariwisata"
              description="Pilih asal dan tujuan untuk menampilkan grafik tren tahunan pariwisata. Klik header untuk membuka atau menutup filter."
              onSubmit={setRouteFilters}
              onReset={() => setRouteFilters(DEFAULT_ROUTE_FILTERS)}
            />
          </div>

          {hasUnauthorizedError ? null : multiQuery.error ? (
            <FilterFallbackCard
              title="Grafik tren tahunan pariwisata gagal dimuat"
              body={
                multiQuery.error instanceof Error
                  ? multiQuery.error.message
                  : "Terjadi kesalahan saat mengambil grafik tren tahunan pariwisata."
              }
            />
          ) : (
            <div data-mitra-pariwisata-tour="trend-section">
              <MitraTourismTrendSection
                data={multiQuery.data}
                loading={multiQuery.isLoading && !multiQuery.data}
              />
            </div>
          )}
        </div>
      </div>

      <GuidedTour
        steps={MITRA_PARIWISATA_TOUR_STEPS}
        storageKey="side-mitra-pariwisata-tour-completed"
        launcherLabel="Tur Halaman"
        coachmarkLabel="Panduan halaman"
        spotlightZIndex={1600}
        coachmarkZIndex={1700}
      />
    </div>
  );
}
