import React from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { KerjasamaBilateralFiltersPanel } from "@/components/filters/KerjasamaBilateralFiltersPanel";
import { InvestasiTab } from "@/components/indonesia/kerjasama-bilateral/tabs/InvestasiTab";
import { JasaTab } from "@/components/indonesia/kerjasama-bilateral/tabs/JasaTab";
import { KerjasamaPembangunanTab } from "@/components/indonesia/kerjasama-bilateral/tabs/KerjasamaPembangunanTab";
import { PariwisataTab } from "@/components/indonesia/kerjasama-bilateral/tabs/PariwisataTab";
import { PerdaganganTab } from "@/components/indonesia/kerjasama-bilateral/tabs/PerdaganganTab";
import { Button } from "@/components/ui/Button";
import { FilterFallbackCard } from "@/components/ui/FilterFallbackCard";
import { GuidedTour, type GuidedTourStep } from "@/components/ui/GuidedTour";
import { PageTitle } from "@/components/ui/PageTitle";
import { Tabs } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import { UnauthorizedAccessNotice } from "@/components/ui/UnauthorizedAccessNotice";
import { APP_NAME } from "@/constants/app";
import {
  BILATERAL_DEFAULT_PARTNERS,
  BILATERAL_TABS
} from "@/constants/indonesiaKerjasamaBilateral";
import { useKerjasamaBilateralMasterQuery } from "@/hooks/indonesia/useKerjasamaBilateralMasterQuery";
import { useKerjasamaBilateralOverviewQuery } from "@/hooks/indonesia/useKerjasamaBilateralOverviewQuery";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { downloadKerjasamaBilateralSummaryPdf } from "@/service/indonesia/kerjasama-bilateral";
import type {
  BilateralFilterState,
  BilateralSourceBySector
} from "@/type/indonesiaKerjasamaBilateral";
import {
  toKerjasamaBilateralApiParams,
  validateKerjasamaBilateralFilters
} from "@/validators/kerjasamaBilateralFilters";
import { isUnauthorizedApiError } from "@/utils/apiError";

const KERJASAMA_BILATERAL_TOUR_STEPS: GuidedTourStep[] = [
  {
    selector: "[data-bilateral-tour='page-title']",
    title: "Pahami konteks halaman",
    description:
      "Mulai dari judul dan deskripsi ini dulu untuk memahami bahwa halaman ini membahas kerjasama ekonomi bilateral dan regional Indonesia."
  },
  {
    selector: "[data-bilateral-tour='filters-panel']",
    title: "Atur filter mitra dan sektor",
    description:
      "Pilih negara mitra, HS code, dan sumber data agar analisis yang tampil sesuai kebutuhan."
  },
  {
    selector: "[data-bilateral-tour='tabs-section']",
    title: "Pilih tab analisis",
    description:
      "Gunakan tab untuk berpindah antara perdagangan, pariwisata, investasi, jasa, dan kerjasama pembangunan."
  },
  {
    selector: "[data-bilateral-tour='download-button']",
    title: "Unduh ringkasan PDF",
    description:
      "Gunakan tombol ini untuk mengunduh ringkasan PDF sesuai tab aktif, filter yang dipilih, dan data yang sedang ditampilkan."
  },
  {
    selector: "[data-bilateral-tour='analysis-panel']",
    title: "Baca hasil analisis detail",
    description:
      "Bagian ini menampilkan visualisasi, tabel, dan insight berdasarkan filter dan tab yang sedang aktif."
  }
];

export function IndonesiaKerjasamaBilateralPage() {
  useDocumentTitle(`Kerjasama Bilateral | ${APP_NAME}`);

  const { toast, dismiss } = useToast();
  const masterQuery = useKerjasamaBilateralMasterQuery();
  const [activeTab, setActiveTab] = React.useState(BILATERAL_TABS[0].slug);
  const [summaryPdfLoading, setSummaryPdfLoading] = React.useState(false);
  const hasInitializedFiltersRef = React.useRef(false);

  const sourceOptionsBySector = React.useMemo(
    () =>
      masterQuery.data?.sourceOptionsBySector ?? {
        perdagangan: [],
        pariwisata: [],
        investasi: [],
        jasa: []
      },
    [masterQuery.data?.sourceOptionsBySector]
  );

  const defaultSourceBySector = React.useMemo<BilateralSourceBySector>(() => {
    const jasaDefault =
      sourceOptionsBySector.jasa.find(
        (option) => String(option.value) === "136"
      )?.value ??
      sourceOptionsBySector.jasa[0]?.value ??
      null;

    return {
      perdagangan: sourceOptionsBySector.perdagangan[0]?.value ?? null,
      pariwisata: sourceOptionsBySector.pariwisata[0]?.value ?? null,
      investasi: sourceOptionsBySector.investasi[0]?.value ?? null,
      jasa: jasaDefault
    };
  }, [sourceOptionsBySector]);

  const initialPartners = React.useMemo(() => {
    const matched =
      masterQuery.data?.partnerOptions
        .filter((item) =>
          BILATERAL_DEFAULT_PARTNERS.includes(
            item.value as (typeof BILATERAL_DEFAULT_PARTNERS)[number]
          )
        )
        .map((item) => item.value) ?? [];

    return matched.length > 0 ? matched : [...BILATERAL_DEFAULT_PARTNERS];
  }, [masterQuery.data?.partnerOptions]);

  const [filters, setFilters] = React.useState<BilateralFilterState>({
    partners: [],
    hsCodes: ["ALL"],
    sourceBySector: {
      perdagangan: null,
      pariwisata: null,
      investasi: null,
      jasa: null
    }
  });

  React.useEffect(() => {
    if (!masterQuery.data) return;
    if (hasInitializedFiltersRef.current) return;

    hasInitializedFiltersRef.current = true;
    setFilters((current) => ({
      partners:
        current.partners.length > 0 ? current.partners : initialPartners,
      hsCodes: current.hsCodes.length > 0 ? current.hsCodes : ["ALL"],
      sourceBySector: {
        perdagangan:
          current.sourceBySector.perdagangan ??
          defaultSourceBySector.perdagangan,
        pariwisata:
          current.sourceBySector.pariwisata ?? defaultSourceBySector.pariwisata,
        investasi:
          current.sourceBySector.investasi ?? defaultSourceBySector.investasi,
        jasa: current.sourceBySector.jasa ?? defaultSourceBySector.jasa
      }
    }));
  }, [defaultSourceBySector, initialPartners, masterQuery.data]);

  const filterErrors = React.useMemo(
    () =>
      validateKerjasamaBilateralFilters(
        activeTab,
        filters,
        sourceOptionsBySector
      ),
    [activeTab, filters, sourceOptionsBySector]
  );
  const apiParams = React.useMemo(
    () => toKerjasamaBilateralApiParams(activeTab, filters),
    [activeTab, filters]
  );
  const filtersReady =
    Boolean(apiParams) && Object.keys(filterErrors).length === 0;

  const overviewQuery = useKerjasamaBilateralOverviewQuery(
    activeTab,
    apiParams,
    filtersReady
  );
  const hasUnauthorizedError =
    isUnauthorizedApiError(masterQuery.error) ||
    isUnauthorizedApiError(overviewQuery.error);

  const activeTabLabel =
    BILATERAL_TABS.find((item) => item.slug === activeTab)?.label ?? "-";
  const selectedPartnerLabels = React.useMemo(() => {
    if (!filters.partners.length) return [];

    const partnerLabelByValue = new Map(
      (masterQuery.data?.partnerOptions ?? []).map(
        (item) => [String(item.value), item.label] as const
      )
    );

    return filters.partners.map(
      (value) => partnerLabelByValue.get(value) ?? value
    );
  }, [filters.partners, masterQuery.data?.partnerOptions]);
  const requestLoading = masterQuery.isFetching || overviewQuery.isFetching;
  const toastLoadKey = React.useMemo(() => {
    if (!apiParams) return "";
    const sumberKey = (apiParams.sumber ?? [])
      .map((item) => `${item.sektor}:${item.sumber}`)
      .sort()
      .join("|");
    const partnersKey = [...apiParams.partners].sort().join("|");
    const hsKey = Array.isArray(apiParams.hsCode)
      ? [...apiParams.hsCode].sort().join("|")
      : (apiParams.hsCode ?? "-");
    return `${activeTab}-${partnersKey}-${hsKey}-${sumberKey}`;
  }, [activeTab, apiParams]);
  const lastLoadedToastRef = React.useRef<string>("");
  const loadingToastIdRef = React.useRef<string | null>(null);

  const handleReset = React.useCallback(() => {
    setFilters({
      partners: initialPartners,
      hsCodes: ["ALL"],
      sourceBySector: defaultSourceBySector
    });
  }, [defaultSourceBySector, initialPartners]);

  const handleDownloadSummaryPdf = React.useCallback(async () => {
    if (!apiParams) return;

    const loadingId = toast({
      title: "Menyiapkan ringkasan bilateral",
      description: `Ringkasan ${activeTabLabel} sedang diproses...`,
      tone: "loading",
      durationMs: null
    });
    setSummaryPdfLoading(true);

    try {
      const result = await downloadKerjasamaBilateralSummaryPdf(
        activeTab,
        apiParams,
        `Ringkasan_${activeTabLabel.replace(/\s+/g, "_")}.pdf`
      );
      const filename = result.filename.endsWith(".pdf")
        ? result.filename
        : `${result.filename}.pdf`;
      const url = URL.createObjectURL(result.blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      dismiss(loadingId);
      toast({
        title: "Ringkasan bilateral berhasil diunduh",
        description: `File ${activeTabLabel} siap digunakan.`,
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
            : "Ringkasan PDF belum dapat diunduh.",
        tone: "error",
        durationMs: 3000
      });
    } finally {
      setSummaryPdfLoading(false);
    }
  }, [activeTab, activeTabLabel, apiParams, dismiss, toast]);

  React.useEffect(() => {
    if (!toastLoadKey || !filtersReady) return;

    if (requestLoading) {
      if (loadingToastIdRef.current) return;
      loadingToastIdRef.current = toast({
        title: "Memuat data kerjasama bilateral",
        description: `Tab ${activeTabLabel} sedang diproses...`,
        tone: "loading",
        durationMs: null
      });
      return;
    }

    if (loadingToastIdRef.current) {
      dismiss(loadingToastIdRef.current);
      loadingToastIdRef.current = null;
    }
  }, [
    activeTabLabel,
    dismiss,
    filtersReady,
    requestLoading,
    toast,
    toastLoadKey
  ]);

  React.useEffect(() => {
    if (!toastLoadKey) return;
    if (!masterQuery.isSuccess || !overviewQuery.isSuccess) return;
    if (overviewQuery.isFetching) return;
    if (lastLoadedToastRef.current === toastLoadKey) return;

    lastLoadedToastRef.current = toastLoadKey;
    toast({
      title: "Data kerjasama bilateral siap",
      description: `Tab ${activeTabLabel} selesai dimuat.`,
      tone: "success",
      durationMs: 2200
    });
  }, [
    activeTabLabel,
    masterQuery.isSuccess,
    overviewQuery.isFetching,
    overviewQuery.isSuccess,
    toast,
    toastLoadKey
  ]);

  React.useEffect(() => {
    if (!hasUnauthorizedError) return;
    toast({
      title: "Sesi login diperlukan",
      description:
        "Data kerjasama bilateral tidak dapat dimuat karena akses Anda belum valid.",
      tone: "warning",
      durationMs: 3200
    });
  }, [hasUnauthorizedError, toast]);

  const tabContent =
    activeTab === "perdagangan" ? (
      <PerdaganganTab
        overview={overviewQuery.data ?? null}
        loading={overviewQuery.isLoading || overviewQuery.isFetching}
        error={
          overviewQuery.error instanceof Error
            ? overviewQuery.error.message
            : null
        }
        selectedPartnerLabels={selectedPartnerLabels}
        hsOptions={masterQuery.data?.hsOptions ?? []}
      />
    ) : activeTab === "pariwisata" ? (
      <PariwisataTab
        overview={overviewQuery.data ?? null}
        loading={overviewQuery.isLoading || overviewQuery.isFetching}
        error={
          overviewQuery.error instanceof Error
            ? overviewQuery.error.message
            : null
        }
      />
    ) : activeTab === "investasi" ? (
      <InvestasiTab
        overview={overviewQuery.data ?? null}
        loading={overviewQuery.isLoading || overviewQuery.isFetching}
        error={
          overviewQuery.error instanceof Error
            ? overviewQuery.error.message
            : null
        }
      />
    ) : activeTab === "jasa" ? (
      <JasaTab
        overview={overviewQuery.data ?? null}
        loading={overviewQuery.isLoading || overviewQuery.isFetching}
        error={
          overviewQuery.error instanceof Error
            ? overviewQuery.error.message
            : null
        }
      />
    ) : (
      <KerjasamaPembangunanTab
        overview={overviewQuery.data ?? null}
        loading={overviewQuery.isLoading || overviewQuery.isFetching}
        error={
          overviewQuery.error instanceof Error
            ? overviewQuery.error.message
            : null
        }
      />
    );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <div className="space-y-6 px-4 py-6 lg:px-8">
        <div data-bilateral-tour="page-title">
          <PageTitle
            title="Kerjasama Ekonomi Bilateral dan Regional"
            description="Analisis kerjasama ekonomi Indonesia dengan negara mitra pada sektor perdagangan, pariwisata, investasi, jasa, dan kerjasama pembangunan."
          />
        </div>

        <div data-bilateral-tour="filters-panel">
          <KerjasamaBilateralFiltersPanel
            tab={activeTab}
            hsOptions={masterQuery.data?.hsOptions ?? []}
            selectedPartners={filters.partners}
            selectedHsCodes={filters.hsCodes}
            sourceBySector={filters.sourceBySector}
            sourceOptionsBySector={sourceOptionsBySector}
            loading={masterQuery.isLoading}
            requestLoading={requestLoading}
            onSubmit={setFilters}
            onReset={handleReset}
          />
        </div>

        <section className="overflow-x-auto" data-bilateral-tour="tabs-section">
          <div className="flex min-w-max items-center justify-between gap-3">
            <Tabs
              items={BILATERAL_TABS.map((tab) => ({
                value: tab.slug,
                label: tab.label
              }))}
              value={activeTab}
              onChange={(value) => setActiveTab(value as typeof activeTab)}
            />
            <Button
              type="button"
              variant="primary"
              onClick={handleDownloadSummaryPdf}
              disabled={!filtersReady || summaryPdfLoading}
              data-bilateral-tour="download-button"
              className="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-xs font-semibold text-white transition"
            >
              <ArrowDownTrayIcon className="h-3.5 w-3.5" />
              {summaryPdfLoading
                ? "Menyiapkan PDF..."
                : "Unduh Ringkasan (PDF)"}
            </Button>
          </div>
        </section>

        {hasUnauthorizedError ? (
          <UnauthorizedAccessNotice
            title="Data kerjasama bilateral memerlukan sesi login yang aktif"
            body="Permintaan ke layanan kerjasama bilateral menerima respons 401. Masuk kembali lalu muat ulang halaman ini untuk menampilkan ringkasan, tab, dan datanya."
          />
        ) : !filtersReady ? (
          <FilterFallbackCard
            title="Analisis bilateral belum tersedia"
            body={
              filterErrors.partners ??
              filterErrors.hsCodes ??
              filterErrors.sumber ??
              "Lengkapi filter bilateral untuk menampilkan data."
            }
          />
        ) : (
          <section className="space-y-3" data-bilateral-tour="analysis-panel">
            {tabContent}
          </section>
        )}
      </div>

      <GuidedTour
        steps={KERJASAMA_BILATERAL_TOUR_STEPS}
        storageKey="side-kerjasama-bilateral-tour-completed"
        launcherLabel="Tur Halaman"
        coachmarkLabel="Panduan halaman"
        spotlightZIndex={1600}
        coachmarkZIndex={1700}
      />
    </div>
  );
}
