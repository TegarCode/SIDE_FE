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
import { TikRouteTradeSectionHeader } from "@/components/sektor/komoditas-utama/tik/TikRouteTradeSectionHeader";
import { TikTradeProductsSection } from "@/components/sektor/komoditas-utama/tik/TikTradeProductsSection";
import {
  TikTradeHeroSection,
  type TikMetricMode
} from "@/components/sektor/komoditas-utama/tik/TikTradeHeroSection";
import { TikTradeOverviewGrid } from "@/components/sektor/komoditas-utama/tik/TikTradeOverviewGrid";
import { useToast } from "@/components/ui/Toast";
import { useTikTradeFlowQuery } from "@/hooks/indonesia/useTikTradeFlowQuery";
import { useTikHsCodeGroupsQuery } from "@/hooks/indonesia/useTikHsCodeGroupsQuery";
import { useTikTradeProductsQuery } from "@/hooks/indonesia/useTikTradeProductsQuery";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { downloadTikSummaryPdf } from "@/service/komoditas-utama";
import { isUnauthorizedApiError } from "@/utils/apiError";

const TIK_TOUR_STEPS: GuidedTourStep[] = [
  {
    selector: '[data-komoditas-tik-tour="page-title"]',
    title: "Judul halaman",
    description:
      "Halaman ini merangkum perkembangan perdagangan sektor TIK beserta analitik lanjutannya."
  },
  {
    selector: '[data-komoditas-tik-tour="download-button"]',
    title: "Unduh ringkasan PDF",
    description:
      "Unduhan PDF mengikuti filter HS Code, filter rute, dan data sektor TIK yang sedang ditampilkan di halaman."
  },
  {
    selector: '[data-komoditas-tik-tour="hero-section"]',
    title: "Ringkasan utama TIK",
    description:
      "Gunakan ringkasan ini untuk melihat metrik utama, sebaran, dan top mitra sektor TIK. Tombol di kanan dipakai untuk mengganti tampilan antara Total Ekspor, Total Impor, dan Total Perdagangan."
  },
  {
    selector: '[data-komoditas-tik-tour="hs-filters"]',
    title: "Filter HS Code",
    description:
      "Pilih HS Code untuk mempersempit data overview sektor TIK sesuai komoditas yang ingin dianalisis."
  },
  {
    selector: '[data-komoditas-tik-tour="overview-section"]',
    title: "Overview sektor",
    description:
      "Bagian ini menampilkan ringkasan, peta sebaran, dan mitra utama sesuai filter HS Code yang aktif."
  },
  {
    selector: '[data-komoditas-tik-tour="route-filters"]',
    title: "Filter rute dan HS Code lanjutan",
    description:
      "Atur negara asal, negara tujuan, dan HS Code untuk melihat analitik perdagangan bilateral yang lebih spesifik."
  },
  {
    selector: '[data-komoditas-tik-tour="products-section"]',
    title: "Produk dan treemap",
    description:
      "Bagian ini menampilkan produk sektor TIK sesuai rute dan HS Code yang sedang dipilih."
  }
];

export function KomoditasUtamaTikPage() {
  useDocumentTitle(`Komoditas Utama TIK | ${APP_NAME}`);
  const { toast, dismiss } = useToast();

  const hsCodeGroupsQuery = useTikHsCodeGroupsQuery();
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
    React.useState<TikMetricMode>("total_trade");
  const [routeMetricMode, setRouteMetricMode] =
    React.useState<TikMetricMode>("total_trade");
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

  const tikTradeFlowQuery = useTikTradeFlowQuery({
    hsList:
      selectedHsCodes.length === 0 ||
      selectedHsCodes.length === allHsCodes.length
        ? ["all"]
        : selectedHsCodes,
    enabled: didInitializeAll
  });
  const tikTradeProductsQuery = useTikTradeProductsQuery({
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
    isUnauthorizedApiError(tikTradeFlowQuery.error) ||
    isUnauthorizedApiError(tikTradeProductsQuery.error);
  const flowToastKey = React.useMemo(() => {
    if (!didInitializeAll) return null;
    const hsKey =
      selectedHsCodes.length === 0 ||
      selectedHsCodes.length === allHsCodes.length
        ? "all"
        : selectedHsCodes.join("|");
    return `tik-flow-${hsKey}`;
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
    return `tik-products-${originKey}-${destKey}-${hsKey}`;
  }, [
    allHsCodes.length,
    didInitializeAll,
    selectedRouteDestinations,
    selectedRouteHsCodes,
    selectedRouteOrigins
  ]);

  React.useEffect(() => {
    if (!flowToastKey) return;

    if (tikTradeFlowQuery.isFetching) {
      if (flowLoadingToastIdRef.current) return;
      flowLoadingToastIdRef.current = toast({
        title: "Sedang memuat data TIK",
        description: "Memuat peta sebaran dan top mitra sektor TIK.",
        tone: "loading",
        durationMs: null
      });
      return;
    }

    if (flowLoadingToastIdRef.current) {
      dismiss(flowLoadingToastIdRef.current);
      flowLoadingToastIdRef.current = null;
    }
  }, [dismiss, flowToastKey, tikTradeFlowQuery.isFetching, toast]);

  React.useEffect(() => {
    if (
      !flowToastKey ||
      tikTradeFlowQuery.isFetching ||
      !tikTradeFlowQuery.isSuccess ||
      !tikTradeFlowQuery.data
    )
      return;
    if (flowSuccessKeyRef.current === flowToastKey) return;

    flowSuccessKeyRef.current = flowToastKey;
    flowErrorKeyRef.current = null;
    toast({
      title: "Data TIK berhasil dimuat",
      description: "Peta sebaran dan top mitra sektor TIK berhasil dimuat.",
      tone: "success"
    });
  }, [
    flowToastKey,
    tikTradeFlowQuery.data,
    tikTradeFlowQuery.isFetching,
    tikTradeFlowQuery.isSuccess,
    toast
  ]);

  React.useEffect(() => {
    if (!flowToastKey || !tikTradeFlowQuery.error) return;
    if (flowErrorKeyRef.current === flowToastKey) return;

    flowErrorKeyRef.current = flowToastKey;
    toast({
      title: "Data TIK gagal dimuat",
      description:
        tikTradeFlowQuery.error instanceof Error
          ? tikTradeFlowQuery.error.message
          : "Terjadi kesalahan saat memuat data peta sebaran dan top mitra sektor TIK.",
      tone: "error"
    });
  }, [flowToastKey, tikTradeFlowQuery.error, toast]);

  React.useEffect(() => {
    if (!productsToastKey) return;

    if (tikTradeProductsQuery.isFetching) {
      if (productsLoadingToastIdRef.current) return;
      productsLoadingToastIdRef.current = toast({
        title: "Sedang memuat produk TIK",
        description: "Memuat tabel dan treemap produk sektor TIK.",
        tone: "loading",
        durationMs: null
      });
      return;
    }

    if (productsLoadingToastIdRef.current) {
      dismiss(productsLoadingToastIdRef.current);
      productsLoadingToastIdRef.current = null;
    }
  }, [dismiss, productsToastKey, tikTradeProductsQuery.isFetching, toast]);

  React.useEffect(() => {
    if (
      !productsToastKey ||
      tikTradeProductsQuery.isFetching ||
      !tikTradeProductsQuery.isSuccess ||
      !tikTradeProductsQuery.data
    )
      return;
    if (productsSuccessKeyRef.current === productsToastKey) return;

    productsSuccessKeyRef.current = productsToastKey;
    productsErrorKeyRef.current = null;
    toast({
      title: "Produk TIK berhasil dimuat",
      description: "Tabel dan treemap produk sektor TIK berhasil dimuat.",
      tone: "success"
    });
  }, [
    productsToastKey,
    tikTradeProductsQuery.data,
    tikTradeProductsQuery.isFetching,
    tikTradeProductsQuery.isSuccess,
    toast
  ]);

  React.useEffect(() => {
    if (!productsToastKey || !tikTradeProductsQuery.error) return;
    if (productsErrorKeyRef.current === productsToastKey) return;

    productsErrorKeyRef.current = productsToastKey;
    toast({
      title: "Produk TIK gagal dimuat",
      description:
        tikTradeProductsQuery.error instanceof Error
          ? tikTradeProductsQuery.error.message
          : "Terjadi kesalahan saat memuat produk sektor TIK.",
      tone: "error"
    });
  }, [productsToastKey, tikTradeProductsQuery.error, toast]);

  React.useEffect(() => {
    if (!hasUnauthorizedError) return;
    toast({
      title: "Sesi login diperlukan",
      description:
        "Data sektor TIK tidak dapat dimuat karena akses Anda belum valid.",
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
      description: "Ringkasan sektor TIK sedang diproses...",
      tone: "loading",
      durationMs: null
    });

    setSummaryPdfLoading(true);

    try {
      const filenameBase = `Ringkasan_Sektor_TIK_${selectedRouteOrigins.join("-")}_${selectedRouteDestinations.join("-")}.pdf`;
      const result = await downloadTikSummaryPdf(
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
        description: "File ringkasan sektor TIK siap digunakan.",
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
        <div data-komoditas-tik-tour="page-title">
          <PageTitle
            title="Komoditas Utama TIK"
            description="Perkembangan dan arus TIK pada sektor prioritas serta dukungannya pada transformasi digital."
            actions={
              <div data-komoditas-tik-tour="download-button">
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

        <div data-komoditas-tik-tour="hero-section">
          <TikTradeHeroSection
            metricMode={metricMode}
            onMetricChange={setMetricMode}
          />
        </div>

        <div data-komoditas-tik-tour="hs-filters">
          <HsCodeFiltersPanel
            data={hsCodeData}
            selectedHsCodes={selectedHsCodes}
            draftHsCodes={draftHsCodes}
            loading={hsCodeGroupsQuery.isLoading}
            sectorLabel="TIK"
            onDraftChange={setDraftHsCodes}
            onReset={handleReset}
            onSubmit={() => {
              setSelectedHsCodes(draftHsCodes);
            }}
          />
        </div>

        {hasUnauthorizedError ? (
          <UnauthorizedAccessNotice
            title="Data sektor TIK memerlukan sesi login yang aktif"
            body="Permintaan ke layanan sektor TIK menerima respons 401. Masuk kembali lalu muat ulang halaman ini untuk melihat overview, rute, dan produk."
          />
        ) : (
          <>
            <div data-komoditas-tik-tour="overview-section">
              <TikTradeOverviewGrid
                metricMode={metricMode}
                data={tikTradeFlowQuery.data}
                loading={tikTradeFlowQuery.isLoading}
              />
            </div>

            <TikRouteTradeSectionHeader
              metricMode={routeMetricMode}
              onMetricChange={setRouteMetricMode}
            />

            <div data-komoditas-tik-tour="route-filters">
              <BilateralHsCodeRouteFiltersPanel
                title="Filter Rute dan HS Code TIK"
                description="Pilih negara asal, negara tujuan, dan HS Code untuk analitik lanjutan sektor TIK. Klik header untuk membuka atau menutup filter."
                hsGroupedData={hsCodeData}
                value={{
                  origins: selectedRouteOrigins,
                  destinations: selectedRouteDestinations,
                  hsCodes: selectedRouteHsCodes
                }}
                loading={hsCodeGroupsQuery.isLoading}
                requestLoading={tikTradeProductsQuery.isFetching}
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

            <div data-komoditas-tik-tour="products-section">
              <TikTradeProductsSection
                data={tikTradeProductsQuery.data}
                loading={tikTradeProductsQuery.isLoading}
                metricMode={routeMetricMode}
              />
            </div>
          </>
        )}
      </div>
      <GuidedTour
        steps={TIK_TOUR_STEPS}
        storageKey="side-komoditas-tik-tour-completed"
        spotlightZIndex={1600}
        coachmarkZIndex={1700}
      />
    </div>
  );
}
