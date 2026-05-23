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
import { EnergyRouteTradeSectionHeader } from "@/components/sektor/komoditas-utama/energi/EnergyRouteTradeSectionHeader";
import { EnergyTradeProductsSection } from "@/components/sektor/komoditas-utama/energi/EnergyTradeProductsSection";
import {
  EnergyTradeHeroSection,
  type EnergyMetricMode
} from "@/components/sektor/komoditas-utama/energi/EnergyTradeHeroSection";
import { EnergyTradeOverviewGrid } from "@/components/sektor/komoditas-utama/energi/EnergyTradeOverviewGrid";
import { useToast } from "@/components/ui/Toast";
import { useEnergyTradeFlowQuery } from "@/hooks/indonesia/useEnergyTradeFlowQuery";
import { useEnergyHsCodeGroupsQuery } from "@/hooks/indonesia/useEnergyHsCodeGroupsQuery";
import { useEnergyTradeProductsQuery } from "@/hooks/indonesia/useEnergyTradeProductsQuery";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { downloadEnergySummaryPdf } from "@/service/komoditas-utama";
import { isUnauthorizedApiError } from "@/utils/apiError";

const ENERGI_TOUR_STEPS: GuidedTourStep[] = [
  {
    selector: '[data-komoditas-energi-tour="page-title"]',
    title: "Judul halaman",
    description:
      "Halaman ini merangkum perkembangan perdagangan sektor energi dan analitik lanjutan per rute."
  },
  {
    selector: '[data-komoditas-energi-tour="download-button"]',
    title: "Unduh ringkasan PDF",
    description:
      "Unduhan PDF mengikuti filter HS Code, filter rute, dan data sektor energi yang sedang ditampilkan di halaman."
  },
  {
    selector: '[data-komoditas-energi-tour="hero-section"]',
    title: "Ringkasan utama energi",
    description:
      "Gunakan bagian ini untuk melihat metrik utama, peta sebaran, dan mitra utama sektor energi. Tombol di kanan dipakai untuk mengganti tampilan antara Total Ekspor, Total Impor, dan Total Perdagangan."
  },
  {
    selector: '[data-komoditas-energi-tour="hs-filters"]',
    title: "Filter HS Code",
    description:
      "Pilih HS Code untuk menyesuaikan overview sektor energi dengan komoditas yang ingin dianalisis."
  },
  {
    selector: '[data-komoditas-energi-tour="overview-section"]',
    title: "Overview sektor",
    description:
      "Bagian ini menampilkan ringkasan, peta sebaran, dan mitra utama sesuai filter HS Code yang aktif."
  },
  {
    selector: '[data-komoditas-energi-tour="route-filters"]',
    title: "Filter rute dan HS Code lanjutan",
    description:
      "Atur negara asal, negara tujuan, dan HS Code untuk membaca perdagangan bilateral sektor energi secara lebih spesifik."
  },
  {
    selector: '[data-komoditas-energi-tour="products-section"]',
    title: "Produk dan treemap",
    description:
      "Bagian ini menampilkan produk sektor energi sesuai rute dan HS Code yang sedang dipilih."
  }
];

export function KomoditasUtamaEnergiPage() {
  useDocumentTitle(`Komoditas Utama Energi | ${APP_NAME}`);
  const { toast, dismiss } = useToast();

  const hsCodeGroupsQuery = useEnergyHsCodeGroupsQuery();
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
    React.useState<EnergyMetricMode>("total_trade");
  const [routeMetricMode, setRouteMetricMode] =
    React.useState<EnergyMetricMode>("total_trade");
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

  const energyTradeFlowQuery = useEnergyTradeFlowQuery({
    hsList:
      selectedHsCodes.length === 0 ||
      selectedHsCodes.length === allHsCodes.length
        ? ["all"]
        : selectedHsCodes,
    enabled: didInitializeAll
  });
  const energyTradeProductsQuery = useEnergyTradeProductsQuery({
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
    isUnauthorizedApiError(energyTradeFlowQuery.error) ||
    isUnauthorizedApiError(energyTradeProductsQuery.error);

  const flowToastKey = React.useMemo(() => {
    if (!didInitializeAll) return null;
    const hsKey =
      selectedHsCodes.length === 0 ||
      selectedHsCodes.length === allHsCodes.length
        ? "all"
        : selectedHsCodes.join("|");
    return `energy-flow-${hsKey}`;
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
    return `energy-products-${originKey}-${destKey}-${hsKey}`;
  }, [
    allHsCodes.length,
    didInitializeAll,
    selectedRouteDestinations,
    selectedRouteHsCodes,
    selectedRouteOrigins
  ]);

  React.useEffect(() => {
    if (!flowToastKey) return;

    if (energyTradeFlowQuery.isFetching) {
      if (flowLoadingToastIdRef.current) return;
      flowLoadingToastIdRef.current = toast({
        title: "Sedang memuat data energi",
        description: "Memuat peta sebaran dan top mitra sektor energi.",
        tone: "loading",
        durationMs: null
      });
      return;
    }

    if (flowLoadingToastIdRef.current) {
      dismiss(flowLoadingToastIdRef.current);
      flowLoadingToastIdRef.current = null;
    }
  }, [dismiss, energyTradeFlowQuery.isFetching, flowToastKey, toast]);

  React.useEffect(() => {
    if (
      !flowToastKey ||
      energyTradeFlowQuery.isFetching ||
      !energyTradeFlowQuery.isSuccess ||
      !energyTradeFlowQuery.data
    )
      return;
    if (flowSuccessKeyRef.current === flowToastKey) return;

    flowSuccessKeyRef.current = flowToastKey;
    flowErrorKeyRef.current = null;
    toast({
      title: "Data energi berhasil dimuat",
      description: "Peta sebaran dan top mitra sektor energi berhasil dimuat.",
      tone: "success"
    });
  }, [
    energyTradeFlowQuery.data,
    energyTradeFlowQuery.isFetching,
    energyTradeFlowQuery.isSuccess,
    flowToastKey,
    toast
  ]);

  React.useEffect(() => {
    if (!flowToastKey || !energyTradeFlowQuery.error) return;
    if (flowErrorKeyRef.current === flowToastKey) return;

    flowErrorKeyRef.current = flowToastKey;
    toast({
      title: "Data energi gagal dimuat",
      description:
        energyTradeFlowQuery.error instanceof Error
          ? energyTradeFlowQuery.error.message
          : "Terjadi kesalahan saat memuat data peta sebaran dan top mitra sektor energi.",
      tone: "error"
    });
  }, [energyTradeFlowQuery.error, flowToastKey, toast]);

  React.useEffect(() => {
    if (!productsToastKey) return;

    if (energyTradeProductsQuery.isFetching) {
      if (productsLoadingToastIdRef.current) return;
      productsLoadingToastIdRef.current = toast({
        title: "Sedang memuat produk energi",
        description: "Memuat tabel dan treemap produk sektor energi.",
        tone: "loading",
        durationMs: null
      });
      return;
    }

    if (productsLoadingToastIdRef.current) {
      dismiss(productsLoadingToastIdRef.current);
      productsLoadingToastIdRef.current = null;
    }
  }, [dismiss, energyTradeProductsQuery.isFetching, productsToastKey, toast]);

  React.useEffect(() => {
    if (
      !productsToastKey ||
      energyTradeProductsQuery.isFetching ||
      !energyTradeProductsQuery.isSuccess ||
      !energyTradeProductsQuery.data
    )
      return;
    if (productsSuccessKeyRef.current === productsToastKey) return;

    productsSuccessKeyRef.current = productsToastKey;
    productsErrorKeyRef.current = null;
    toast({
      title: "Produk energi berhasil dimuat",
      description: "Tabel dan treemap produk sektor energi berhasil dimuat.",
      tone: "success"
    });
  }, [
    energyTradeProductsQuery.data,
    energyTradeProductsQuery.isFetching,
    energyTradeProductsQuery.isSuccess,
    productsToastKey,
    toast
  ]);

  React.useEffect(() => {
    if (!productsToastKey || !energyTradeProductsQuery.error) return;
    if (productsErrorKeyRef.current === productsToastKey) return;

    productsErrorKeyRef.current = productsToastKey;
    toast({
      title: "Produk energi gagal dimuat",
      description:
        energyTradeProductsQuery.error instanceof Error
          ? energyTradeProductsQuery.error.message
          : "Terjadi kesalahan saat memuat produk sektor energi.",
      tone: "error"
    });
  }, [energyTradeProductsQuery.error, productsToastKey, toast]);

  React.useEffect(() => {
    if (!hasUnauthorizedError) return;
    toast({
      title: "Sesi login diperlukan",
      description:
        "Data sektor energi tidak dapat dimuat karena akses Anda belum valid.",
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
      description: "Ringkasan sektor energi sedang diproses...",
      tone: "loading",
      durationMs: null
    });

    setSummaryPdfLoading(true);

    try {
      const filenameBase = `Ringkasan_Sektor_Energi_${selectedRouteOrigins.join("-")}_${selectedRouteDestinations.join("-")}.pdf`;
      const result = await downloadEnergySummaryPdf(
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
        description: "File ringkasan sektor energi siap digunakan.",
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
        <div data-komoditas-energi-tour="page-title">
          <PageTitle
            title="Komoditas Utama Energi"
            description="Perkembangan dan arus sektor energi Indonesia ke global berdasarkan filter HS Code, negara asal, dan negara tujuan."
            actions={
              <div data-komoditas-energi-tour="download-button">
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

        <div data-komoditas-energi-tour="hero-section">
          <EnergyTradeHeroSection
            metricMode={metricMode}
            onMetricChange={setMetricMode}
          />
        </div>

        <div data-komoditas-energi-tour="hs-filters">
          <HsCodeFiltersPanel
            data={hsCodeData}
            selectedHsCodes={selectedHsCodes}
            draftHsCodes={draftHsCodes}
            loading={hsCodeGroupsQuery.isLoading}
            sectorLabel="Energi"
            onDraftChange={setDraftHsCodes}
            onReset={handleReset}
            onSubmit={() => {
              setSelectedHsCodes(draftHsCodes);
            }}
          />
        </div>

        {hasUnauthorizedError ? (
          <UnauthorizedAccessNotice
            title="Data sektor energi memerlukan sesi login yang aktif"
            body="Permintaan ke layanan sektor energi menerima respons 401. Masuk kembali lalu muat ulang halaman ini untuk melihat overview, rute, dan produk."
          />
        ) : (
          <>
            <div data-komoditas-energi-tour="overview-section">
              <EnergyTradeOverviewGrid
                metricMode={metricMode}
                data={energyTradeFlowQuery.data}
                loading={energyTradeFlowQuery.isLoading}
              />
            </div>

            <EnergyRouteTradeSectionHeader
              metricMode={routeMetricMode}
              onMetricChange={setRouteMetricMode}
            />

            <div data-komoditas-energi-tour="route-filters">
              <BilateralHsCodeRouteFiltersPanel
                title="Filter Rute dan HS Code Energi"
                description="Pilih negara asal, negara tujuan, dan HS Code untuk analitik lanjutan sektor energi. Klik header untuk membuka atau menutup filter."
                hsGroupedData={hsCodeData}
                value={{
                  origins: selectedRouteOrigins,
                  destinations: selectedRouteDestinations,
                  hsCodes: selectedRouteHsCodes
                }}
                loading={hsCodeGroupsQuery.isLoading}
                requestLoading={energyTradeProductsQuery.isFetching}
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

            <div data-komoditas-energi-tour="products-section">
              <EnergyTradeProductsSection
                data={energyTradeProductsQuery.data}
                loading={energyTradeProductsQuery.isLoading}
                metricMode={routeMetricMode}
              />
            </div>
          </>
        )}
      </div>
      <GuidedTour
        steps={ENERGI_TOUR_STEPS}
        storageKey="side-komoditas-energi-tour-completed"
        spotlightZIndex={1600}
        coachmarkZIndex={1700}
      />
    </div>
  );
}
