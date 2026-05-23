import React from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { saveAs } from "file-saver";
import { APP_NAME } from "@/constants/app";
import { Button } from "@/components/ui/Button";
import { GuidedTour, type GuidedTourStep } from "@/components/ui/GuidedTour";
import { PageTitle } from "@/components/ui/PageTitle";
import { UnauthorizedAccessNotice } from "@/components/ui/UnauthorizedAccessNotice";
import { BilateralHsCodeRouteFiltersPanel } from "@/components/filters/BilateralHsCodeRouteFiltersPanel";
import { HsCodeFiltersPanel } from "@/components/filters/HsCodeFiltersPanel";
import { HilirisasiRouteTradeSectionHeader } from "@/components/sektor/komoditas-utama/hilirisasi/HilirisasiRouteTradeSectionHeader";
import { HilirisasiSectorTrendSection } from "@/components/sektor/komoditas-utama/hilirisasi/HilirisasiSectorTrendSection";
import { HilirisasiTradeProductsSection } from "@/components/sektor/komoditas-utama/hilirisasi/HilirisasiTradeProductsSection";
import {
  HilirisasiTradeHeroSection,
  type HilirisasiMetricMode
} from "@/components/sektor/komoditas-utama/hilirisasi/HilirisasiTradeHeroSection";
import { HilirisasiTradeOverviewGrid } from "@/components/sektor/komoditas-utama/hilirisasi/HilirisasiTradeOverviewGrid";
import { useToast } from "@/components/ui/Toast";
import { useHilirisasiTradeFlowQuery } from "@/hooks/indonesia/useHilirisasiTradeFlowQuery";
import { useHilirisasiHsCodeGroupsQuery } from "@/hooks/indonesia/useHilirisasiHsCodeGroupsQuery";
import { useHilirisasiTradeProductsQuery } from "@/hooks/indonesia/useHilirisasiTradeProductsQuery";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { downloadHilirisasiSummaryPdf } from "@/service/komoditas-utama";
import { isUnauthorizedApiError } from "@/utils/apiError";

const HILIRISASI_TOUR_STEPS: GuidedTourStep[] = [
  {
    selector: '[data-komoditas-hilirisasi-tour="page-title"]',
    title: "Judul halaman",
    description:
      "Halaman ini merangkum perkembangan perdagangan sektor hilirisasi beserta analitik turunannya."
  },
  {
    selector: '[data-komoditas-hilirisasi-tour="download-button"]',
    title: "Unduh ringkasan PDF",
    description:
      "Unduhan PDF mengikuti filter HS Code, filter rute, serta data hilirisasi yang sedang ditampilkan di halaman."
  },
  {
    selector: '[data-komoditas-hilirisasi-tour="hero-section"]',
    title: "Ringkasan utama hilirisasi",
    description:
      "Gunakan bagian ini untuk melihat metrik utama, peta sebaran, dan mitra utama sektor hilirisasi. Tombol di kanan dipakai untuk mengganti tampilan antara Total Ekspor, Total Impor, dan Total Perdagangan."
  },
  {
    selector: '[data-komoditas-hilirisasi-tour="hs-filters"]',
    title: "Filter HS Code",
    description:
      "Pilih HS Code untuk menyesuaikan overview sektor hilirisasi dengan komoditas yang ingin dianalisis."
  },
  {
    selector: '[data-komoditas-hilirisasi-tour="overview-section"]',
    title: "Overview sektor",
    description:
      "Bagian ini menampilkan ringkasan, peta sebaran, dan mitra utama sesuai filter HS Code yang aktif."
  },
  {
    selector: '[data-komoditas-hilirisasi-tour="route-filters"]',
    title: "Filter rute dan HS Code lanjutan",
    description:
      "Atur negara asal, negara tujuan, dan HS Code untuk melihat analitik perdagangan bilateral sektor hilirisasi."
  },
  {
    selector: '[data-komoditas-hilirisasi-tour="trend-section"]',
    title: "Tren sektor",
    description:
      "Section ini menampilkan tren sektor hilirisasi berdasarkan rute dan filter yang sedang aktif."
  },
  {
    selector: '[data-komoditas-hilirisasi-tour="products-section"]',
    title: "Produk dan treemap",
    description:
      "Bagian ini menampilkan rincian produk sektor hilirisasi sesuai rute dan HS Code yang dipilih."
  }
];

export function KomoditasUtamaHilirisasiPage() {
  useDocumentTitle(`Komoditas Utama Hilirisasi | ${APP_NAME}`);
  const { toast, dismiss } = useToast();

  const hsCodeGroupsQuery = useHilirisasiHsCodeGroupsQuery();
  const [selectedHsCodes, setSelectedHsCodes] = React.useState<string[]>([]);
  const [draftHsCodes, setDraftHsCodes] = React.useState<string[]>([]);
  const [selectedRouteOrigins, setSelectedRouteOrigins] = React.useState<
    string[]
  >(["IDN"]);
  const [selectedRouteDestinations, setSelectedRouteDestinations] =
    React.useState<string[]>(["CHN"]);
  const [selectedRouteHsCodes, setSelectedRouteHsCodes] = React.useState<
    string[]
  >([]);
  const [didInitializeAll, setDidInitializeAll] = React.useState(false);
  const [metricMode, setMetricMode] =
    React.useState<HilirisasiMetricMode>("total_trade");
  const [routeMetricMode, setRouteMetricMode] =
    React.useState<HilirisasiMetricMode>("total_trade");
  const [summaryPdfLoading, setSummaryPdfLoading] = React.useState(false);
  const flowLoadingToastIdRef = React.useRef<string | null>(null);
  const flowSuccessKeyRef = React.useRef<string | null>(null);
  const flowErrorKeyRef = React.useRef<string | null>(null);
  const productsLoadingToastIdRef = React.useRef<string | null>(null);
  const productsSuccessKeyRef = React.useRef<string | null>(null);
  const productsErrorKeyRef = React.useRef<string | null>(null);

  const hsCodeData = hsCodeGroupsQuery.data;
  const allHsCodes = React.useMemo(
    () =>
      (hsCodeData?.groups ?? []).flatMap((group) =>
        group.options.map((option) => option.value)
      ),
    [hsCodeData]
  );

  React.useEffect(() => {
    if (didInitializeAll) return;
    if (allHsCodes.length === 0) return;

    setSelectedHsCodes(allHsCodes);
    setDraftHsCodes(allHsCodes);
    setSelectedRouteHsCodes(allHsCodes);
    setDidInitializeAll(true);
  }, [allHsCodes, didInitializeAll]);

  const hilirisasiTradeFlowQuery = useHilirisasiTradeFlowQuery({
    hsList:
      selectedHsCodes.length === 0 ||
      selectedHsCodes.length === allHsCodes.length
        ? ["all"]
        : selectedHsCodes,
    enabled: didInitializeAll
  });
  const hilirisasiTradeProductsQuery = useHilirisasiTradeProductsQuery({
    origin: selectedRouteOrigins,
    dest: selectedRouteDestinations,
    hsList:
      selectedRouteHsCodes.length === 0 ||
      selectedRouteHsCodes.length === allHsCodes.length
        ? ["all"]
        : selectedRouteHsCodes,
    enabled: didInitializeAll
  });
  const hasUnauthorizedError =
    isUnauthorizedApiError(hsCodeGroupsQuery.error) ||
    isUnauthorizedApiError(hilirisasiTradeFlowQuery.error) ||
    isUnauthorizedApiError(hilirisasiTradeProductsQuery.error);

  const flowToastKey = React.useMemo(() => {
    if (!didInitializeAll) return null;
    const hsKey =
      selectedHsCodes.length === 0 ||
      selectedHsCodes.length === allHsCodes.length
        ? "all"
        : selectedHsCodes.join("|");
    return `hilirisasi-flow-${hsKey}`;
  }, [allHsCodes.length, didInitializeAll, selectedHsCodes]);

  const productsToastKey = React.useMemo(() => {
    if (!didInitializeAll) return null;
    const originKey = selectedRouteOrigins.length
      ? selectedRouteOrigins.join("|")
      : "all-origin";
    const destKey = selectedRouteDestinations.length
      ? selectedRouteDestinations.join("|")
      : "all-dest";
    const hsKey =
      selectedRouteHsCodes.length === 0 ||
      selectedRouteHsCodes.length === allHsCodes.length
        ? "all"
        : selectedRouteHsCodes.join("|");
    return `hilirisasi-products-${originKey}-${destKey}-${hsKey}`;
  }, [
    allHsCodes.length,
    didInitializeAll,
    selectedRouteDestinations,
    selectedRouteHsCodes,
    selectedRouteOrigins
  ]);

  React.useEffect(() => {
    if (!flowToastKey) return;

    if (hilirisasiTradeFlowQuery.isFetching) {
      if (flowLoadingToastIdRef.current) return;
      flowLoadingToastIdRef.current = toast({
        title: "Sedang memuat data hilirisasi",
        description: "Memuat peta sebaran dan top mitra sektor hilirisasi.",
        tone: "loading",
        durationMs: null
      });
      return;
    }

    if (flowLoadingToastIdRef.current) {
      dismiss(flowLoadingToastIdRef.current);
      flowLoadingToastIdRef.current = null;
    }
  }, [dismiss, flowToastKey, hilirisasiTradeFlowQuery.isFetching, toast]);

  React.useEffect(() => {
    if (
      !flowToastKey ||
      hilirisasiTradeFlowQuery.isFetching ||
      !hilirisasiTradeFlowQuery.isSuccess ||
      !hilirisasiTradeFlowQuery.data
    )
      return;
    if (flowSuccessKeyRef.current === flowToastKey) return;

    flowSuccessKeyRef.current = flowToastKey;
    flowErrorKeyRef.current = null;
    toast({
      title: "Data hilirisasi berhasil dimuat",
      description:
        "Peta sebaran dan top mitra sektor hilirisasi berhasil dimuat.",
      tone: "success"
    });
  }, [
    flowToastKey,
    hilirisasiTradeFlowQuery.data,
    hilirisasiTradeFlowQuery.isFetching,
    hilirisasiTradeFlowQuery.isSuccess,
    toast
  ]);

  React.useEffect(() => {
    if (!flowToastKey || !hilirisasiTradeFlowQuery.error) return;
    if (flowErrorKeyRef.current === flowToastKey) return;

    flowErrorKeyRef.current = flowToastKey;
    toast({
      title: "Data hilirisasi gagal dimuat",
      description:
        hilirisasiTradeFlowQuery.error instanceof Error
          ? hilirisasiTradeFlowQuery.error.message
          : "Terjadi kesalahan saat memuat data peta sebaran dan top mitra sektor hilirisasi.",
      tone: "error"
    });
  }, [flowToastKey, hilirisasiTradeFlowQuery.error, toast]);

  React.useEffect(() => {
    if (!productsToastKey) return;

    if (hilirisasiTradeProductsQuery.isFetching) {
      if (productsLoadingToastIdRef.current) return;
      productsLoadingToastIdRef.current = toast({
        title: "Sedang memuat produk hilirisasi",
        description: "Memuat tabel dan treemap produk sektor hilirisasi.",
        tone: "loading",
        durationMs: null
      });
      return;
    }

    if (productsLoadingToastIdRef.current) {
      dismiss(productsLoadingToastIdRef.current);
      productsLoadingToastIdRef.current = null;
    }
  }, [
    dismiss,
    hilirisasiTradeProductsQuery.isFetching,
    productsToastKey,
    toast
  ]);

  React.useEffect(() => {
    if (
      !productsToastKey ||
      hilirisasiTradeProductsQuery.isFetching ||
      !hilirisasiTradeProductsQuery.isSuccess ||
      !hilirisasiTradeProductsQuery.data
    )
      return;
    if (productsSuccessKeyRef.current === productsToastKey) return;

    productsSuccessKeyRef.current = productsToastKey;
    productsErrorKeyRef.current = null;
    toast({
      title: "Produk hilirisasi berhasil dimuat",
      description:
        "Tabel dan treemap produk sektor hilirisasi berhasil dimuat.",
      tone: "success"
    });
  }, [
    hilirisasiTradeProductsQuery.data,
    hilirisasiTradeProductsQuery.isFetching,
    hilirisasiTradeProductsQuery.isSuccess,
    productsToastKey,
    toast
  ]);

  React.useEffect(() => {
    if (!productsToastKey || !hilirisasiTradeProductsQuery.error) return;
    if (productsErrorKeyRef.current === productsToastKey) return;

    productsErrorKeyRef.current = productsToastKey;
    toast({
      title: "Produk hilirisasi gagal dimuat",
      description:
        hilirisasiTradeProductsQuery.error instanceof Error
          ? hilirisasiTradeProductsQuery.error.message
          : "Terjadi kesalahan saat memuat produk sektor hilirisasi.",
      tone: "error"
    });
  }, [hilirisasiTradeProductsQuery.error, productsToastKey, toast]);

  React.useEffect(() => {
    if (!hasUnauthorizedError) return;
    toast({
      title: "Sesi login diperlukan",
      description:
        "Data sektor hilirisasi tidak dapat dimuat karena akses Anda belum valid.",
      tone: "warning",
      durationMs: 3200
    });
  }, [hasUnauthorizedError, toast]);

  const handleReset = React.useCallback(() => {
    setDraftHsCodes(allHsCodes);
    setSelectedHsCodes(allHsCodes);
  }, [allHsCodes]);

  const handleRouteReset = React.useCallback(() => {
    setSelectedRouteOrigins(["IDN"]);
    setSelectedRouteDestinations(["CHN"]);
    setSelectedRouteHsCodes(allHsCodes);
  }, [allHsCodes]);

  const handleDownloadSummary = React.useCallback(async () => {
    const overviewHsValue =
      selectedHsCodes.length === 0 ||
      selectedHsCodes.length === allHsCodes.length
        ? "all"
        : selectedHsCodes;
    const productHsValue =
      selectedRouteHsCodes.length === 0 ||
      selectedRouteHsCodes.length === allHsCodes.length
        ? "all"
        : selectedRouteHsCodes;

    const loadingId = toast({
      title: "Menyiapkan ringkasan PDF",
      description: "Ringkasan sektor hilirisasi sedang diproses...",
      tone: "loading",
      durationMs: null
    });

    setSummaryPdfLoading(true);

    try {
      const filenameBase = `Ringkasan_Sektor_Hilirisasi_${selectedRouteOrigins.join("-")}_${selectedRouteDestinations.join("-")}.pdf`;
      const result = await downloadHilirisasiSummaryPdf(
        {
          negara: {
            reporter: ["IDN"],
            hscode: overviewHsValue
          },
          produk: {
            origin: selectedRouteOrigins,
            dest: selectedRouteDestinations,
            hscode: productHsValue
          }
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
        description: "File ringkasan sektor hilirisasi siap digunakan.",
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
    allHsCodes.length,
    dismiss,
    selectedHsCodes,
    selectedRouteDestinations,
    selectedRouteHsCodes,
    selectedRouteOrigins,
    toast
  ]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8fafc] text-slate-900">
      <div className="space-y-5 px-3 py-4 sm:space-y-6 sm:px-4 sm:py-6 lg:px-8">
        <div data-komoditas-hilirisasi-tour="page-title">
          <PageTitle
            title="Komoditas Utama Hilirisasi"
            description="Perkembangan dan arus sektor hilirisasi Indonesia ke global berdasarkan filter HS Code, negara asal, dan negara tujuan."
            actions={
              <div data-komoditas-hilirisasi-tour="download-button">
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleDownloadSummary}
                  disabled={summaryPdfLoading}
                  className="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-xs font-semibold text-white transition"
                >
                  <ArrowDownTrayIcon className="h-3.5 w-3.5" />
                  {summaryPdfLoading
                    ? "Menyiapkan PDF..."
                    : "Unduh Ringkasan (PDF)"}
                </Button>
              </div>
            }
          />
        </div>

        <div data-komoditas-hilirisasi-tour="hero-section">
          <HilirisasiTradeHeroSection
            metricMode={metricMode}
            onMetricChange={setMetricMode}
          />
        </div>

        <div data-komoditas-hilirisasi-tour="hs-filters">
          <HsCodeFiltersPanel
            data={hsCodeData}
            selectedHsCodes={selectedHsCodes}
            draftHsCodes={draftHsCodes}
            loading={hsCodeGroupsQuery.isLoading}
            sectorLabel="Hilirisasi"
            onDraftChange={setDraftHsCodes}
            onReset={handleReset}
            onSubmit={() => {
              setSelectedHsCodes(draftHsCodes);
            }}
          />
        </div>

        {hasUnauthorizedError ? (
          <UnauthorizedAccessNotice
            title="Data sektor hilirisasi memerlukan sesi login yang aktif"
            body="Permintaan ke layanan sektor hilirisasi menerima respons 401. Masuk kembali lalu muat ulang halaman ini untuk melihat overview, tren, rute, dan produk."
          />
        ) : (
          <>
            <div data-komoditas-hilirisasi-tour="overview-section">
              <HilirisasiTradeOverviewGrid
                metricMode={metricMode}
                data={hilirisasiTradeFlowQuery.data}
                loading={hilirisasiTradeFlowQuery.isLoading}
              />
            </div>

            <HilirisasiRouteTradeSectionHeader
              metricMode={routeMetricMode}
              onMetricChange={setRouteMetricMode}
            />

            <div data-komoditas-hilirisasi-tour="route-filters">
              <BilateralHsCodeRouteFiltersPanel
                title="Filter Rute dan HS Code Hilirisasi"
                description="Pilih negara asal, negara tujuan, dan HS Code untuk analitik lanjutan sektor hilirisasi. Klik header untuk membuka atau menutup filter."
                hsGroupedData={hsCodeData}
                value={{
                  origins: selectedRouteOrigins,
                  destinations: selectedRouteDestinations,
                  hsCodes: selectedRouteHsCodes
                }}
                loading={hsCodeGroupsQuery.isLoading}
                requestLoading={hilirisasiTradeProductsQuery.isFetching}
                originDefaultValues={["IDN"]}
                destinationDefaultValues={["CHN"]}
                onReset={handleRouteReset}
                onSubmit={(next) => {
                  setSelectedRouteOrigins(next.origins);
                  setSelectedRouteDestinations(next.destinations);
                  setSelectedRouteHsCodes(next.hsCodes);
                }}
              />
            </div>

            <div data-komoditas-hilirisasi-tour="trend-section">
              <HilirisasiSectorTrendSection
                data={hilirisasiTradeProductsQuery.data}
                loading={hilirisasiTradeProductsQuery.isLoading}
                metricMode={routeMetricMode}
              />
            </div>

            <div data-komoditas-hilirisasi-tour="products-section">
              <HilirisasiTradeProductsSection
                data={hilirisasiTradeProductsQuery.data}
                loading={hilirisasiTradeProductsQuery.isLoading}
                metricMode={routeMetricMode}
              />
            </div>
          </>
        )}
      </div>
      <GuidedTour
        steps={HILIRISASI_TOUR_STEPS}
        storageKey="side-komoditas-hilirisasi-tour-completed"
        spotlightZIndex={1600}
        coachmarkZIndex={1700}
      />
    </div>
  );
}
