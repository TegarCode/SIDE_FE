import React from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { saveAs } from "file-saver";
import { APP_NAME } from "@/constants/app";
import { PageTitle } from "@/components/ui/PageTitle";
import { Button } from "@/components/ui/Button";
import { GuidedTour, type GuidedTourStep } from "@/components/ui/GuidedTour";
import { UnauthorizedAccessNotice } from "@/components/ui/UnauthorizedAccessNotice";
import { useToast } from "@/components/ui/Toast";
import {
  BilateralHsCodeRouteFiltersPanel,
  type MitraTradeFilterState
} from "@/components/filters/BilateralHsCodeRouteFiltersPanel";
import { MitraTradeAnnualTrendSection } from "@/components/mitra/perdagangan/MitraTradeAnnualTrendSection";
import { MitraTradeSummarySection } from "@/components/mitra/perdagangan/MitraTradeSummarySection";
import { MitraTradeTopProductsSection } from "@/components/mitra/perdagangan/MitraTradeTopProductsSection";
import { useDiplomasiHsProductQuery } from "@/hooks/indonesia/useDiplomasiHsProductQuery";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useMitraMasterQuery } from "@/hooks/mitra/useMitraMasterQuery";
import { useMitraTradeOverviewQuery } from "@/hooks/mitra/useMitraTradeOverviewQuery";
import { downloadMitraTradeSummaryPdf } from "@/service/mitra";
import { isUnauthorizedApiError } from "@/utils/apiError";

const MITRA_PERDAGANGAN_TOUR_STEPS: GuidedTourStep[] = [
  {
    selector: "[data-mitra-perdagangan-tour='page-title']",
    title: "Pahami konteks halaman",
    description:
      "Bagian ini menjelaskan bahwa halaman ini fokus pada analisis perdagangan negara mitra."
  },
  {
    selector: "[data-mitra-perdagangan-tour='download-button']",
    title: "Unduh ringkasan PDF",
    description:
      "Gunakan tombol ini untuk mengunduh ringkasan PDF sesuai filter rute, HS code, dan data perdagangan yang sedang ditampilkan."
  },
  {
    selector: "[data-mitra-perdagangan-tour='filters-panel']",
    title: "Atur filter rute dan HS code",
    description:
      "Pilih negara asal, tujuan, dan HS code untuk menentukan data perdagangan yang ingin dianalisis."
  },
  {
    selector: "[data-mitra-perdagangan-tour='summary-section']",
    title: "Lihat ringkasan perdagangan",
    description:
      "Bagian ini menampilkan ringkasan nilai perdagangan utama berdasarkan filter aktif."
  },
  {
    selector: "[data-mitra-perdagangan-tour='trend-section']",
    title: "Baca tren tahunan",
    description:
      "Di sini user bisa melihat perkembangan nilai perdagangan dari waktu ke waktu."
  },
  {
    selector: "[data-mitra-perdagangan-tour='products-section']",
    title: "Telusuri produk utama",
    description:
      "Bagian ini memuat daftar produk utama untuk memperdalam analisis perdagangan."
  }
];

export function MitraPerdaganganPage() {
  useDocumentTitle(`Perdagangan Negara Mitra | ${APP_NAME}`);
  const { toast, dismiss } = useToast();
  const masterQuery = useMitraMasterQuery();
  const hsQuery = useDiplomasiHsProductQuery(true);
  const [filters, setFilters] = React.useState<MitraTradeFilterState>({
    origins: ["CHN"],
    destinations: ["IDN"],
    hsCodes: ["ALL"]
  });
  const hasInitializedRef = React.useRef(false);
  const loadingToastIdRef = React.useRef<string | null>(null);
  const lastErrorMessageRef = React.useRef<string | null>(null);
  const lastSuccessToastKeyRef = React.useRef<string | null>(null);
  const [summaryPdfLoading, setSummaryPdfLoading] = React.useState(false);

  React.useEffect(() => {
    if (!masterQuery.data || hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    setFilters({
      origins: ["CHN"],
      destinations: ["IDN"],
      hsCodes: ["ALL"]
    });
  }, [masterQuery.data]);

  const handleReset = React.useCallback(() => {
    setFilters({
      origins: ["CHN"],
      destinations: ["IDN"],
      hsCodes: ["ALL"]
    });
  }, []);

  const summaryQuery = useMitraTradeOverviewQuery(
    {
      origin: filters.origins,
      dest: filters.destinations,
      hsCodes: filters.hsCodes
    },
    filters.origins.length > 0 && filters.destinations.length > 0
  );
  const hasUnauthorizedError =
    isUnauthorizedApiError(masterQuery.error) ||
    isUnauthorizedApiError(hsQuery.error) ||
    isUnauthorizedApiError(summaryQuery.error);
  const requestLoading =
    masterQuery.isFetching || hsQuery.isFetching || summaryQuery.isFetching;
  const exportOrigins = React.useMemo(
    () =>
      filters.origins.map(
        (code) =>
          masterQuery.data?.countryOptions.find((item) => item.value === code)
            ?.label ?? code
      ),
    [filters.origins, masterQuery.data?.countryOptions]
  );
  const exportDestinations = React.useMemo(
    () =>
      filters.destinations.map(
        (code) =>
          masterQuery.data?.countryOptions.find((item) => item.value === code)
            ?.label ?? code
      ),
    [filters.destinations, masterQuery.data?.countryOptions]
  );
  const requestToastKey = React.useMemo(
    () =>
      `${filters.origins.join(",")}|${filters.destinations.join(",")}|${filters.hsCodes.join(",")}`,
    [filters.destinations, filters.hsCodes, filters.origins]
  );
  const handleDownloadSummary = React.useCallback(async () => {
    const loadingId = toast({
      title: "Menyiapkan ringkasan PDF",
      description: "Ringkasan sektor perdagangan sedang diproses...",
      tone: "loading",
      durationMs: null
    });

    setSummaryPdfLoading(true);

    try {
      const filenameBase = `Ringkasan_Perdagangan_${filters.origins.join("-")}_${filters.destinations.join("-")}.pdf`;
      const result = await downloadMitraTradeSummaryPdf(
        {
          origin: filters.origins,
          dest: filters.destinations,
          hsCodes: filters.hsCodes
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
        description: "File ringkasan sektor perdagangan siap digunakan.",
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
  }, [dismiss, filters.destinations, filters.hsCodes, filters.origins, toast]);

  React.useEffect(() => {
    if (!requestToastKey) return;

    if (summaryQuery.isFetching) {
      if (loadingToastIdRef.current) return;
      loadingToastIdRef.current = toast({
        title: "Sedang memuat data perdagangan",
        description: "Permintaan data perdagangan sedang diproses.",
        tone: "loading",
        durationMs: null
      });
      return;
    }

    if (loadingToastIdRef.current) {
      dismiss(loadingToastIdRef.current);
      loadingToastIdRef.current = null;
    }
  }, [dismiss, requestToastKey, summaryQuery.isFetching, toast]);

  React.useEffect(() => {
    const errorMessage =
      summaryQuery.error instanceof Error ? summaryQuery.error.message : null;
    if (!errorMessage || lastErrorMessageRef.current === errorMessage) return;
    lastErrorMessageRef.current = errorMessage;

    toast({
      title: "Gagal memuat data perdagangan",
      description: errorMessage,
      tone: "error"
    });
  }, [summaryQuery.error, toast]);

  React.useEffect(() => {
    if (summaryQuery.isFetching || !summaryQuery.isSuccess) return;
    if (lastSuccessToastKeyRef.current === requestToastKey) return;

    lastSuccessToastKeyRef.current = requestToastKey;
    toast({
      title: "Data perdagangan berhasil dimuat",
      description: "Data perdagangan untuk filter yang dipilih sudah siap.",
      tone: "success"
    });
  }, [requestToastKey, summaryQuery.isFetching, summaryQuery.isSuccess, toast]);

  React.useEffect(() => {
    if (!hasUnauthorizedError) return;
    toast({
      title: "Sesi login diperlukan",
      description:
        "Data perdagangan mitra tidak dapat dimuat karena akses Anda belum valid.",
      tone: "warning",
      durationMs: 3200
    });
  }, [hasUnauthorizedError, toast]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <div className="space-y-6 px-4 py-6 lg:px-8">
        <div data-mitra-perdagangan-tour="page-title">
          <PageTitle
            title="Sektor Perdagangan"
            description="Data dan tren kerjasama sektor perdagangan negara/entitas mitra. Gunakan filter asal, tujuan, dan HS Code untuk menyiapkan analisis halaman ini."
            actions={
              <Button
                type="button"
                variant="primary"
                onClick={handleDownloadSummary}
                disabled={
                  summaryPdfLoading ||
                  filters.origins.length === 0 ||
                  filters.destinations.length === 0
                }
                data-mitra-perdagangan-tour="download-button"
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

        <div data-mitra-perdagangan-tour="filters-panel">
          <BilateralHsCodeRouteFiltersPanel
            value={filters}
            hsOptions={hsQuery.data ?? []}
            loading={masterQuery.isLoading || hsQuery.isLoading}
            requestLoading={requestLoading}
            onSubmit={setFilters}
            onReset={handleReset}
          />
        </div>

        {hasUnauthorizedError ? (
          <UnauthorizedAccessNotice
            title="Data perdagangan mitra memerlukan sesi login yang aktif"
            body="Permintaan ke layanan perdagangan mitra menerima respons 401. Masuk kembali lalu muat ulang halaman ini untuk melihat ringkasan, tren tahunan, dan produk utama."
          />
        ) : (
          <>
            <div data-mitra-perdagangan-tour="summary-section">
              <MitraTradeSummarySection
                data={summaryQuery.data}
                loading={summaryQuery.isLoading && !summaryQuery.data}
              />
            </div>

            <div data-mitra-perdagangan-tour="trend-section">
              <MitraTradeAnnualTrendSection
                data={summaryQuery.data}
                loading={summaryQuery.isLoading && !summaryQuery.data}
                exportOrigins={exportOrigins}
                exportDestinations={exportDestinations}
              />
            </div>

            <div data-mitra-perdagangan-tour="products-section">
              <MitraTradeTopProductsSection
                data={summaryQuery.data}
                loading={summaryQuery.isLoading && !summaryQuery.data}
              />
            </div>
          </>
        )}
      </div>

      <GuidedTour
        steps={MITRA_PERDAGANGAN_TOUR_STEPS}
        storageKey="side-mitra-perdagangan-tour-completed"
        launcherLabel="Tur Halaman"
        coachmarkLabel="Panduan halaman"
        spotlightZIndex={1600}
        coachmarkZIndex={1700}
      />
    </div>
  );
}
