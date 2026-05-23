import React from "react";
import {
  ArrowDownTrayIcon,
  ChartBarIcon,
  TableCellsIcon
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { FilterFallbackCard } from "@/components/ui/FilterFallbackCard";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { Modal } from "@/components/ui/Modal";
import { TopProdukTable } from "@/components/ui/TopProdukTable";
import { TradeCompetitionInsight } from "@/components/ui/TradeCompetitionInsight";
import { useToast } from "@/components/ui/Toast";
import { TopProductsComparisonBarChart } from "@/components/ui/charts/TopProductsComparisonBarChart";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";
import { useDiplomasiHsProductQuery } from "@/hooks/indonesia/useDiplomasiHsProductQuery";
import { useDiplomasiTradeCompetitionInsightMutation } from "@/hooks/indonesia/useDiplomasiTradeCompetitionInsightMutation";
import { useMitraOverviewTopTradeQuery } from "@/hooks/mitra/useMitraOverviewTopTradeQuery";
import { TopTradePartnersTable } from "@/components/mitra/overview/tabs/TopTradePartnersTable";
import type {
  DiplomasiCompetitionInsightParams,
  DiplomasiExportProductInsightItem,
  DiplomasiCountryValueItem,
  SelectOption,
  TopProdukItem
} from "@/type/indonesiaDiplomasi";
import type { MitraOverviewTradeProduct } from "@/type/mitra";
import { cn } from "@/utils/cn";

type ProductVisualMode = "table" | "chart";
type CompetitionMode = "ekspor" | "impor";

type PerdaganganOverviewTabProps = {
  countryCode: string | null;
  countryName: string;
};

type CompetitionModalState = {
  mode: CompetitionMode;
  product: DiplomasiExportProductInsightItem;
} | null;

type ProductSectionProps = {
  title: string;
  subtitle: string;
  sourceLabel?: string | null;
  visualMode: ProductVisualMode;
  onToggleVisualMode: () => void;
  tableDownloadHandler: (() => void) | null;
  chartDownloadHandler: (() => void) | null;
  tableContent: React.ReactNode;
  chartContent: React.ReactNode;
  expandedTableContent: React.ReactNode;
  expandedChartContent: React.ReactNode;
};

function renderCompetitionTabs(
  value: CompetitionMode,
  onChange: (value: CompetitionMode) => void
) {
  const options = [
    { value: "ekspor" as const, label: "Ekspor" },
    { value: "impor" as const, label: "Impor" }
  ];

  return (
    <div className="hidden rounded-full bg-slate-100 p-1 sm:flex sm:flex-wrap sm:items-center">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-full px-3 py-1 text-[11px] font-semibold transition",
              active
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function toCompetitionProduct(
  product: MitraOverviewTradeProduct,
  latestYear: number | null,
  prevYear: number | null
): DiplomasiExportProductInsightItem {
  const nilai: Record<number, number> = {};
  const share: Record<number, number> = {};
  if (latestYear != null) {
    nilai[latestYear] = product.latestValue ?? 0;
    share[latestYear] = product.share ?? 0;
  }
  if (prevYear != null) nilai[prevYear] = product.prevValue ?? 0;

  return {
    hs: product.hs,
    name: product.name,
    nilai,
    neraca: {},
    share,
    export: nilai,
    import: nilai,
    exportReverse: {},
    importReverse: {},
    tujuanEkspor: product.tujuanEkspor,
    tujuanImpor: product.tujuanImpor,
    kompetitorGlobalTopTujuanEkspor: product.kompetitorGlobalTopTujuanEkspor,
    kompetitorAseanTopTujuanEkspor: product.kompetitorAseanTopTujuanEkspor,
    kompetitorGlobalTopTujuanImpor: product.kompetitorGlobalTopTujuanImpor,
    kompetitorAseanTopTujuanImpor: product.kompetitorAseanTopTujuanImpor
  };
}

function toImportCompetitionProducts(
  products: DiplomasiExportProductInsightItem[]
) {
  return products.map((product) => ({
    ...product,
    nilai: product.import ?? product.nilai,
    tujuanEkspor: product.tujuanImpor ?? [],
    kompetitorGlobalTopTujuanEkspor:
      product.kompetitorGlobalTopTujuanImpor ?? [],
    kompetitorAseanTopTujuanEkspor: product.kompetitorAseanTopTujuanImpor ?? []
  }));
}

function normalizeHsCode4(value: string | null | undefined) {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits ? digits.slice(0, 4) : "";
}

function mapInsightCountries(value: unknown): DiplomasiCountryValueItem[] {
  if (!Array.isArray(value)) return [];
  return value.map((item, index) => {
    const row =
      typeof item === "object" && item !== null
        ? (item as Record<string, unknown>)
        : {};
    return {
      rank: typeof row.rank === "number" ? row.rank : index + 1,
      alpha2: typeof row.kode_alpha2 === "string" ? row.kode_alpha2 : null,
      alpha3: typeof row.kode_alpha3 === "string" ? row.kode_alpha3 : null,
      country: typeof row.negara === "string" ? row.negara : "-",
      nilai: typeof row.nilai === "number" ? row.nilai : 0
    };
  });
}

function mapInsightProduct(
  value: unknown,
  mode: CompetitionMode,
  latestYear: number | null
): DiplomasiExportProductInsightItem | null {
  if (typeof value !== "object" || value == null) return null;
  const row = value as Record<string, unknown>;
  const hs = normalizeHsCode4(String(row.kodeHS ?? row.hs ?? ""));
  if (!hs) return null;
  const name =
    typeof row.namaHS === "string"
      ? row.namaHS
      : typeof row.name === "string"
        ? row.name
        : hs;
  const tujuanEkspor = mapInsightCountries(
    mode === "impor" ? row.tujuan_impor : row.tujuan_ekspor
  );
  const global = mapInsightCountries(
    mode === "impor"
      ? row.kompetitor_global_top_tujuan_impor
      : row.kompetitor_global_top_tujuan_ekspor
  );
  const asean = mapInsightCountries(
    mode === "impor"
      ? row.kompetitor_asean_top_tujuan_impor
      : row.kompetitor_asean_top_tujuan_ekspor
  );
  const activeValue = tujuanEkspor.reduce((sum, item) => sum + item.nilai, 0);
  return {
    hs,
    name,
    nilai: latestYear != null ? { [latestYear]: activeValue } : {},
    neraca: {},
    share:
      latestYear != null && typeof row.share === "number"
        ? { [latestYear]: row.share }
        : {},
    export: {},
    import: {},
    exportReverse: {},
    importReverse: {},
    tujuanEkspor,
    tujuanImpor: [],
    kompetitorGlobalTopTujuanEkspor: global,
    kompetitorAseanTopTujuanEkspor: asean,
    kompetitorGlobalTopTujuanImpor: [],
    kompetitorAseanTopTujuanImpor: []
  };
}

function buildTopProductsRaw(
  products: MitraOverviewTradeProduct[],
  mode: CompetitionMode,
  latestYear: number | null,
  prevYear: number | null
) {
  return {
    data: {
      top_produk: products.map((product) => ({
        kodeHS: product.hs,
        namaHS: product.name,
        nilai: {
          ...(prevYear != null ? { [prevYear]: product.prevValue ?? 0 } : {}),
          ...(latestYear != null
            ? { [latestYear]: product.latestValue ?? 0 }
            : {})
        },
        share: {
          ...(latestYear != null ? { [latestYear]: product.share ?? 0 } : {})
        },
        ...(mode === "ekspor"
          ? {
              tujuan_ekspor: product.tujuanEkspor,
              kompetitor_global_top_tujuan_ekspor:
                product.kompetitorGlobalTopTujuanEkspor,
              kompetitor_asean_top_tujuan_ekspor:
                product.kompetitorAseanTopTujuanEkspor
            }
          : {
              tujuan_impor: product.tujuanImpor,
              kompetitor_global_top_tujuan_impor:
                product.kompetitorGlobalTopTujuanImpor,
              kompetitor_asean_top_tujuan_impor:
                product.kompetitorAseanTopTujuanImpor
            })
      }))
    }
  };
}

function formatYearRange(latestYear: number | null, prevYear: number | null) {
  if (latestYear == null && prevYear == null) return "-";
  if (latestYear != null && prevYear != null) {
    const start = Math.min(latestYear, prevYear);
    const end = Math.max(latestYear, prevYear);
    return start === end ? String(end) : `${start}-${end}`;
  }
  return String(latestYear ?? prevYear ?? "-");
}

function buildProductOptions(
  products: DiplomasiExportProductInsightItem[]
): SelectOption[] {
  return products.map((item) => ({
    value: item.hs,
    label: `${item.hs} - ${item.name}`
  }));
}

function renderProductPrefixes(countryName: string, mode: CompetitionMode) {
  if (mode === "ekspor") {
    return {
      primary: `Tujuan Ekspor ${countryName}`,
      global: "Tujuan Ekspor Utama ke",
      asean: "Tujuan Ekspor ASEAN ke",
      topLabel: "Top Tujuan"
    };
  }

  return {
    primary: `Asal Impor ${countryName}`,
    global: "Asal Impor Utama dari",
    asean: "Asal Impor ASEAN dari",
    topLabel: "Top Asal"
  };
}

function ProductSection({
  title,
  subtitle,
  sourceLabel,
  visualMode,
  onToggleVisualMode,
  tableDownloadHandler,
  chartDownloadHandler,
  tableContent,
  chartContent,
  expandedTableContent,
  expandedChartContent
}: ProductSectionProps) {
  const isChart = visualMode === "chart";
  const activeDownloadHandler = isChart
    ? chartDownloadHandler
    : tableDownloadHandler;

  return (
    <ExpandableCard
      title={title}
      subtitle={subtitle}
      className="min-w-0 min-h-152"
      contentClassName="flex h-full flex-col"
      modalSize="full"
      actions={
        <div className="flex items-center gap-2">
          <IconTooltip label={isChart ? "Unduh chart" : "Unduh tabel"}>
            <span>
              <Button
                type="button"
                disabled={!activeDownloadHandler}
                onClick={() => activeDownloadHandler?.()}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label={isChart ? "Unduh chart" : "Unduh tabel"}
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
              </Button>
            </span>
          </IconTooltip>
          <IconTooltip label={isChart ? "Lihat tabel" : "Lihat bar chart"}>
            <span>
              <Button
                type="button"
                onClick={onToggleVisualMode}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                aria-label={isChart ? "Lihat tabel" : "Lihat bar chart"}
              >
                {isChart ? (
                  <TableCellsIcon className="h-4 w-4" />
                ) : (
                  <ChartBarIcon className="h-4 w-4" />
                )}
              </Button>
            </span>
          </IconTooltip>
        </div>
      }
      expandedContent={isChart ? expandedChartContent : expandedTableContent}
    >
      <div className="flex h-128 min-h-0 flex-col">
        <div className="min-h-0 flex-1">
          {isChart ? chartContent : tableContent}
        </div>
        <p className="mt-2 text-right text-[11px] text-slate-500">
          Sumber: {sourceLabel ?? "-"}
        </p>
      </div>
    </ExpandableCard>
  );
}

export function PerdaganganOverviewTab({
  countryCode,
  countryName
}: PerdaganganOverviewTabProps) {
  const { toast, dismiss } = useToast();
  const query = useMitraOverviewTopTradeQuery(countryCode);
  const hsOptionsQuery = useDiplomasiHsProductQuery(true);
  const competitionInsightMutation =
    useDiplomasiTradeCompetitionInsightMutation();
  const [exportVisualMode, setExportVisualMode] =
    React.useState<ProductVisualMode>("table");
  const [importVisualMode, setImportVisualMode] =
    React.useState<ProductVisualMode>("table");
  const [competitionMode, setCompetitionMode] =
    React.useState<CompetitionMode>("ekspor");
  const [activeCompetitionHs, setActiveCompetitionHs] = React.useState<
    string | null
  >(null);
  const [competitionDraftHs, setCompetitionDraftHs] = React.useState<
    string | null
  >(null);
  const [competitionInsightByMode, setCompetitionInsightByMode] =
    React.useState<
      Record<CompetitionMode, DiplomasiExportProductInsightItem | null>
    >({
      ekspor: null,
      impor: null
    });
  const [competitionInsightError, setCompetitionInsightError] = React.useState<
    string | null
  >(null);
  const [selectedModal, setSelectedModal] =
    React.useState<CompetitionModalState>(null);
  const [topMitraDownloadHandler, setTopMitraDownloadHandler] = React.useState<
    (() => void) | null
  >(null);
  const [exportTableDownloadHandler, setExportTableDownloadHandler] =
    React.useState<(() => void) | null>(null);
  const [exportChartDownloadHandler, setExportChartDownloadHandler] =
    React.useState<(() => void) | null>(null);
  const [importTableDownloadHandler, setImportTableDownloadHandler] =
    React.useState<(() => void) | null>(null);
  const [importChartDownloadHandler, setImportChartDownloadHandler] =
    React.useState<(() => void) | null>(null);
  const [competitionDownloadHandler, setCompetitionDownloadHandler] =
    React.useState<(() => void) | null>(null);
  const lastCompetitionRequestKeyRef = React.useRef<string | null>(null);
  const lastCompetitionCountryCodeRef = React.useRef<string | null>(null);
  const topTradeLoadingToastIdRef = React.useRef<string | null>(null);
  const lastCompletedTopTradeToastKeyRef = React.useRef<string | null>(null);
  const loadingToastIdRef = React.useRef<string | null>(null);
  const lastCompletedCompetitionRequestKeyRef = React.useRef<string | null>(
    null
  );

  const registerTopMitraDownload = React.useCallback(
    (handler: (() => void) | null) => {
      setTopMitraDownloadHandler(() => handler);
    },
    []
  );
  const registerExportTableDownload = React.useCallback(
    (handler: (() => void) | null) => {
      setExportTableDownloadHandler(() => handler);
    },
    []
  );
  const registerExportChartDownload = React.useCallback(
    (handler: (() => void) | null) => {
      setExportChartDownloadHandler(() => handler);
    },
    []
  );
  const registerImportTableDownload = React.useCallback(
    (handler: (() => void) | null) => {
      setImportTableDownloadHandler(() => handler);
    },
    []
  );
  const registerImportChartDownload = React.useCallback(
    (handler: (() => void) | null) => {
      setImportChartDownloadHandler(() => handler);
    },
    []
  );
  const registerCompetitionDownload = React.useCallback(
    (handler: (() => void) | null) => {
      setCompetitionDownloadHandler(() => handler);
    },
    []
  );

  const data = query.data ?? null;
  const {
    mutate: mutateCompetitionInsight,
    isPending: competitionInsightLoading
  } = competitionInsightMutation;
  const latestYear = data?.latestYear ?? null;
  const prevYear = data?.prevYear ?? null;
  const unitLabel = data?.unit ?? "";
  const sourceLabel = data?.source ?? null;
  const countryLabel = data?.asal ?? countryName;
  const selectedCountryNote = `Negara mitra terpilih: ${countryLabel}`;
  const topProductsYearRange = React.useMemo(
    () => formatYearRange(latestYear, prevYear),
    [latestYear, prevYear]
  );

  const exportProductsRaw = React.useMemo(
    () =>
      buildTopProductsRaw(
        data?.exportProducts ?? [],
        "ekspor",
        latestYear,
        prevYear
      ),
    [data?.exportProducts, latestYear, prevYear]
  );
  const importProductsRaw = React.useMemo(
    () =>
      buildTopProductsRaw(
        data?.importProducts ?? [],
        "impor",
        latestYear,
        prevYear
      ),
    [data?.importProducts, latestYear, prevYear]
  );

  const exportCompetitionProducts = React.useMemo(
    () =>
      (data?.exportProducts ?? []).map((item) =>
        toCompetitionProduct(item, latestYear, prevYear)
      ),
    [data?.exportProducts, latestYear, prevYear]
  );
  const importCompetitionProducts = React.useMemo(
    () =>
      toImportCompetitionProducts(
        (data?.importProducts ?? []).map((item) =>
          toCompetitionProduct(item, latestYear, prevYear)
        )
      ),
    [data?.importProducts, latestYear, prevYear]
  );

  const hsOptions = React.useMemo(
    () =>
      (hsOptionsQuery.data ?? [])
        .map((option) => ({
          value: normalizeHsCode4(option.value),
          label: option.label
        }))
        .filter((option) => option.value),
    [hsOptionsQuery.data]
  );
  const competitionProductOptions = hsOptions;
  const selectedCompetitionHs = activeCompetitionHs;
  const competitionProducts = React.useMemo(() => {
    const active = competitionInsightByMode[competitionMode];
    return active ? [active] : [];
  }, [competitionInsightByMode, competitionMode]);

  React.useEffect(() => {
    const nextDefaultHs = exportCompetitionProducts[0]?.hs || null;
    const normalizedCountryCode = countryCode?.toUpperCase() ?? null;

    if (lastCompetitionCountryCodeRef.current !== normalizedCountryCode) {
      lastCompetitionCountryCodeRef.current = normalizedCountryCode;
      lastCompetitionRequestKeyRef.current = null;
      lastCompletedCompetitionRequestKeyRef.current = null;
      setActiveCompetitionHs(nextDefaultHs);
      setCompetitionDraftHs(nextDefaultHs);
      return;
    }

    setActiveCompetitionHs((current) => current || nextDefaultHs);
  }, [countryCode, exportCompetitionProducts]);

  React.useEffect(() => {
    if (
      competitionDraftHs &&
      hsOptions.some((item) => item.value === competitionDraftHs)
    )
      return;
    setCompetitionDraftHs(
      activeCompetitionHs || exportCompetitionProducts[0]?.hs || null
    );
  }, [
    activeCompetitionHs,
    competitionDraftHs,
    exportCompetitionProducts,
    hsOptions
  ]);

  const handleSelectCompetitionHs = React.useCallback((hs: string | null) => {
    setCompetitionDraftHs(hs);
  }, []);

  const handleCompetitionSearch = React.useCallback(() => {
    setActiveCompetitionHs(competitionDraftHs);
  }, [competitionDraftHs]);

  const handleCompetitionModeChange = React.useCallback(
    (nextMode: CompetitionMode) => {
      setCompetitionMode(nextMode);
    },
    []
  );

  React.useEffect(() => {
    const hsCode = normalizeHsCode4(activeCompetitionHs);
    if (!hsCode || !countryCode) return;
    const requestKey = `${countryCode.toUpperCase()}-${latestYear ?? "na"}-${hsCode}`;
    if (lastCompetitionRequestKeyRef.current === requestKey) return;
    lastCompetitionRequestKeyRef.current = requestKey;

    const payload: DiplomasiCompetitionInsightParams = {
      hsCode,
      negara: countryCode.toUpperCase(),
      ...(latestYear != null ? { year: latestYear } : {}),
      sumber: [{ sektor: "perdagangan", sumber: "5" }]
    };

    mutateCompetitionInsight(payload, {
      onSuccess: (response) => {
        const root =
          typeof response === "object" &&
          response !== null &&
          "data" in (response as Record<string, unknown>)
            ? (response as Record<string, unknown>).data
            : response;

        const ekspor = mapInsightProduct(root, "ekspor", latestYear);
        const impor = mapInsightProduct(root, "impor", latestYear);
        setCompetitionInsightByMode({ ekspor, impor });
        setCompetitionInsightError(null);
      },
      onError: () => {
        setCompetitionInsightByMode({ ekspor: null, impor: null });
        setCompetitionInsightError("Gagal memuat insight kompetitor.");
      }
    });
  }, [activeCompetitionHs, countryCode, latestYear, mutateCompetitionInsight]);

  const competitionToastKey = React.useMemo(() => {
    const hsCode = normalizeHsCode4(activeCompetitionHs);
    if (!hsCode || !countryCode) return null;
    return `${countryCode.toUpperCase()}-${competitionMode}-${latestYear ?? "na"}-${hsCode}`;
  }, [activeCompetitionHs, competitionMode, countryCode, latestYear]);
  const topTradeToastKey = React.useMemo(() => {
    if (!countryCode) return null;
    return `mitra-top-trade-${countryCode.toUpperCase()}`;
  }, [countryCode]);

  React.useEffect(() => {
    if (!topTradeToastKey) return;

    if (query.isFetching) {
      if (topTradeLoadingToastIdRef.current) return;
      topTradeLoadingToastIdRef.current = toast({
        title: "Sedang tarik data perdagangan negara mitra",
        description: `Memuat top mitra dagang dan produk ${countryLabel}.`,
        tone: "loading",
        durationMs: null
      });
      return;
    }

    if (topTradeLoadingToastIdRef.current) {
      dismiss(topTradeLoadingToastIdRef.current);
      topTradeLoadingToastIdRef.current = null;
    }
  }, [countryLabel, dismiss, query.isFetching, topTradeToastKey, toast]);

  React.useEffect(() => {
    if (!topTradeToastKey || query.isFetching || !query.isSuccess || !data)
      return;
    if (lastCompletedTopTradeToastKeyRef.current === topTradeToastKey) return;

    lastCompletedTopTradeToastKeyRef.current = topTradeToastKey;
    toast({
      title: "Data perdagangan negara mitra siap",
      description: `Top mitra dagang ${countryLabel} berhasil dimuat.`,
      tone: "success"
    });
  }, [
    countryLabel,
    data,
    query.isFetching,
    query.isSuccess,
    topTradeToastKey,
    toast
  ]);

  React.useEffect(() => {
    if (!competitionToastKey) return;

    if (competitionInsightLoading) {
      if (loadingToastIdRef.current) return;
      loadingToastIdRef.current = toast({
        title: "Sedang tarik data insight produk",
        description: `Memuat insight ${competitionMode} untuk HS ${normalizeHsCode4(activeCompetitionHs)}.`,
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
    activeCompetitionHs,
    competitionInsightLoading,
    competitionMode,
    competitionToastKey,
    dismiss,
    toast
  ]);

  React.useEffect(() => {
    if (
      !competitionToastKey ||
      competitionInsightLoading ||
      competitionInsightError
    )
      return;
    if (!competitionProducts.length) return;
    if (lastCompletedCompetitionRequestKeyRef.current === competitionToastKey)
      return;

    lastCompletedCompetitionRequestKeyRef.current = competitionToastKey;
    toast({
      title: "Data insight kompetitor siap",
      description: `HS ${competitionProducts[0]?.hs ?? "-"} untuk mode ${competitionMode} selesai dimuat.`,
      tone: "success"
    });
  }, [
    competitionInsightError,
    competitionInsightLoading,
    competitionMode,
    competitionProducts,
    competitionToastKey,
    toast
  ]);

  const competitionPrefixes = React.useMemo(
    () => renderProductPrefixes(countryLabel, competitionMode),
    [competitionMode, countryLabel]
  );

  const loading = query.isLoading || (!query.error && !query.data);
  const empty = !loading && !query.error && !data;

  return (
    <div className="space-y-4">
      <Modal
        open={Boolean(selectedModal)}
        onClose={() => setSelectedModal(null)}
        title="Peta Persaingan Produk"
        subtitle={
          selectedModal
            ? `HS ${selectedModal.product.hs} - ${selectedModal.product.name}`
            : undefined
        }
        size="full"
        bodyClassName="space-y-4"
      >
        {selectedModal ? (
          <TradeCompetitionInsight
            variant="modal"
            title={`Peta Persaingan Produk ${countryLabel}`}
            products={[
              selectedModal.mode === "ekspor"
                ? selectedModal.product
                : toImportCompetitionProducts([selectedModal.product])[0]
            ]}
            productOptions={buildProductOptions([selectedModal.product])}
            selectedHs={selectedModal.product.hs}
            onSelectHs={() => {}}
            latestYear={latestYear}
            unitLabel={unitLabel}
            sourceLabel={sourceLabel}
            showHeader={false}
            showProductSelect={false}
            titlePrefixPrimary={
              renderProductPrefixes(countryLabel, selectedModal.mode).primary
            }
            titlePrefixGlobal={
              renderProductPrefixes(countryLabel, selectedModal.mode).global
            }
            titlePrefixAsean={
              renderProductPrefixes(countryLabel, selectedModal.mode).asean
            }
            topDestinationLabel={
              renderProductPrefixes(countryLabel, selectedModal.mode).topLabel
            }
          />
        ) : null}
      </Modal>

      {loading ? (
        <>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="font-semibold tracking-tight text-slate-900">
              Top Mitra Dagang {countryLabel}
            </h3>
            <div className="mt-4">
              <TableSkeleton rows={8} />
            </div>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="font-semibold tracking-tight text-slate-900">
                Top Produk Ekspor {countryLabel} ke Dunia
              </h3>
              <div className="mt-4">
                <TableSkeleton rows={8} />
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="font-semibold tracking-tight text-slate-900">
                Top Produk Impor {countryLabel} ke Dunia
              </h3>
              <div className="mt-4">
                <TableSkeleton rows={8} />
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="font-semibold tracking-tight text-slate-900">
              Peta Persaingan Produk {countryLabel}
            </h3>
            <div className="mt-4">
              <TradeCompetitionInsight
                title={`Peta Persaingan Produk ${countryLabel}`}
                products={[]}
                productOptions={[]}
                selectedHs={null}
                onSelectHs={() => {}}
                latestYear={null}
                unitLabel={unitLabel}
                loading
                showHeader={false}
              />
            </div>
          </div>
        </>
      ) : query.error ? (
        <FilterFallbackCard
          title="Data overview perdagangan negara mitra gagal dimuat"
          body="Terjadi kesalahan saat mengambil top mitra dagang dan top produk."
        />
      ) : empty ? (
        <FilterFallbackCard
          title="Data overview perdagangan negara mitra belum tersedia"
          body="Endpoint top perdagangan belum mengembalikan data untuk negara yang dipilih."
        />
      ) : (
        <>
          <ExpandableCard
            title={`Top Mitra Dagang ${countryLabel}`}
            subtitle={`Tahun ${latestYear ?? "-"} | Unit: ${unitLabel} | Ringkasan mitra dagang utama ${countryLabel} ke dunia dengan total, ekspor, impor, pangsa, dan perubahan tahunannya.`}
            className="min-w-0 min-h-152"
            contentClassName="flex h-full flex-col"
            modalSize="full"
            actions={
              <IconTooltip label="Unduh Excel Top Mitra Dagang">
                <span>
                  <Button
                    type="button"
                    disabled={!topMitraDownloadHandler}
                    onClick={() => topMitraDownloadHandler?.()}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label="Unduh Excel top mitra dagang"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                  </Button>
                </span>
              </IconTooltip>
            }
            expandedContent={
              <TopTradePartnersTable
                rows={data?.partners ?? []}
                latestYear={latestYear}
                prevYear={prevYear}
                unitLabel={unitLabel}
                sourceLabel={sourceLabel}
                countryLabel={countryLabel}
                downloadNotes={selectedCountryNote}
                onRegisterDownload={registerTopMitraDownload}
              />
            }
          >
            <TopTradePartnersTable
              rows={data?.partners ?? []}
              latestYear={latestYear}
              prevYear={prevYear}
              unitLabel={unitLabel}
              sourceLabel={sourceLabel}
              countryLabel={countryLabel}
              downloadNotes={selectedCountryNote}
              onRegisterDownload={registerTopMitraDownload}
            />
          </ExpandableCard>

          <div className="grid gap-4 xl:grid-cols-2">
            <ProductSection
              title={`Top Produk Ekspor ${countryLabel} ke Dunia`}
              subtitle={`Tahun ${topProductsYearRange} | Unit: ${unitLabel}`}
              sourceLabel={sourceLabel}
              visualMode={exportVisualMode}
              onToggleVisualMode={() =>
                setExportVisualMode((current) =>
                  current === "table" ? "chart" : "table"
                )
              }
              tableDownloadHandler={exportTableDownloadHandler}
              chartDownloadHandler={exportChartDownloadHandler}
              tableContent={
                <TopProdukTable
                  raw={exportProductsRaw}
                  unitLabel={unitLabel}
                  downloadTitle={`Top Produk Ekspor ${countryLabel} ${latestYear ?? "-"}`}
                  downloadFilename={`Top_Produk_Ekspor_${countryLabel.replace(/\s+/g, "_")}_${latestYear ?? "-"}`}
                  downloadSource={sourceLabel ?? undefined}
                  downloadNotes={selectedCountryNote}
                  downloadVariant="ekspor"
                  emptyMessage="Data top produk ekspor belum tersedia."
                  valueLabel="Ekspor"
                  shareLabel="Pangsa Pasar"
                  shareContextLabel="pangsa dari total ekspor"
                  totalLabel="Total ekspor produk"
                  changeLabel="Perubahan ekspor YoY"
                  onRegisterDownload={registerExportTableDownload}
                  onHsClick={(item: TopProdukItem) => {
                    const selected = exportCompetitionProducts.find(
                      (product) => product.hs === item.hs
                    );
                    if (!selected) return;
                    setSelectedModal({ mode: "ekspor", product: selected });
                  }}
                />
              }
              chartContent={
                <TopProductsComparisonBarChart
                  rows={(data?.exportProducts ?? [])
                    .sort(
                      (left, right) =>
                        (right.latestValue ?? 0) - (left.latestValue ?? 0)
                    )
                    .slice(0, 10)
                    .map((item) => ({
                      hs: item.hs,
                      name: item.name,
                      latestValue: item.latestValue ?? 0,
                      prevValue: item.prevValue ?? 0,
                      share: item.share ?? 0
                    }))}
                  latestYear={latestYear}
                  prevYear={prevYear}
                  unitLabel={unitLabel}
                  filename={`Chart_Top_Produk_Ekspor_${countryLabel.replace(/\s+/g, "_")}_${latestYear ?? "-"}`}
                  exportTitle={`Top Produk Ekspor ${countryLabel} ke Dunia`}
                  exportSubtitle={`Tahun ${topProductsYearRange} | Unit: ${unitLabel}`}
                  exportFooter={sourceLabel ?? "-"}
                  onRegisterDownload={registerExportChartDownload}
                />
              }
              expandedTableContent={
                <TopProdukTable
                  raw={exportProductsRaw}
                  unitLabel={unitLabel}
                  expanded
                  onRegisterDownload={registerExportTableDownload}
                  downloadTitle={`Top Produk Ekspor ${countryLabel} ke Dunia`}
                  downloadFilename={`Top_Produk_Ekspor_${countryLabel.replace(/\s+/g, "_")}_${latestYear ?? "-"}`}
                  downloadSource={sourceLabel ?? undefined}
                  downloadNotes={selectedCountryNote}
                  downloadVariant="ekspor"
                  emptyMessage="Data top produk ekspor belum tersedia."
                  valueLabel="Ekspor"
                  shareLabel="Pangsa Pasar"
                  shareContextLabel="pangsa dari total ekspor"
                  totalLabel="Total ekspor produk"
                  changeLabel="Perubahan ekspor YoY"
                  onHsClick={(item: TopProdukItem) => {
                    const selected = exportCompetitionProducts.find(
                      (product) => product.hs === item.hs
                    );
                    if (!selected) return;
                    setSelectedModal({ mode: "ekspor", product: selected });
                  }}
                />
              }
              expandedChartContent={
                <TopProductsComparisonBarChart
                  rows={(data?.exportProducts ?? [])
                    .sort(
                      (left, right) =>
                        (right.latestValue ?? 0) - (left.latestValue ?? 0)
                    )
                    .slice(0, 10)
                    .map((item) => ({
                      hs: item.hs,
                      name: item.name,
                      latestValue: item.latestValue ?? 0,
                      prevValue: item.prevValue ?? 0,
                      share: item.share ?? 0
                    }))}
                  latestYear={latestYear}
                  prevYear={prevYear}
                  unitLabel={unitLabel}
                  height={720}
                  latestColor="#0F766E"
                  prevColor="#99F6E4"
                  filename={`Chart_Top_Produk_Ekspor_${countryLabel.replace(/\s+/g, "_")}_${latestYear ?? "-"}`}
                  exportTitle={`Top Produk Ekspor ${countryLabel} ke Dunia`}
                  exportSubtitle={`Tahun ${topProductsYearRange} | Unit: ${unitLabel}`}
                  exportFooter={sourceLabel ?? "-"}
                  onRegisterDownload={registerExportChartDownload}
                />
              }
            />

            <ProductSection
              title={`Top Produk Impor ${countryLabel} ke Dunia`}
              subtitle={`Tahun ${topProductsYearRange} | Unit: ${unitLabel}`}
              sourceLabel={sourceLabel}
              visualMode={importVisualMode}
              onToggleVisualMode={() =>
                setImportVisualMode((current) =>
                  current === "table" ? "chart" : "table"
                )
              }
              tableDownloadHandler={importTableDownloadHandler}
              chartDownloadHandler={importChartDownloadHandler}
              tableContent={
                <TopProdukTable
                  raw={importProductsRaw}
                  unitLabel={unitLabel}
                  onRegisterDownload={registerImportTableDownload}
                  downloadTitle={`Top Produk Impor ${countryLabel} ${latestYear ?? "-"}`}
                  downloadFilename={`Top_Produk_Impor_${countryLabel.replace(/\s+/g, "_")}_${latestYear ?? "-"}`}
                  downloadSource={sourceLabel ?? undefined}
                  downloadNotes={selectedCountryNote}
                  downloadVariant="impor"
                  emptyMessage="Data top produk impor belum tersedia."
                  valueLabel="Impor"
                  shareLabel="Pangsa Pasar"
                  shareContextLabel="pangsa dari total impor"
                  totalLabel="Total impor produk"
                  changeLabel="Perubahan impor YoY"
                  onHsClick={(item: TopProdukItem) => {
                    const selected = importCompetitionProducts.find(
                      (product) => product.hs === item.hs
                    );
                    if (!selected) return;
                    setSelectedModal({ mode: "impor", product: selected });
                  }}
                />
              }
              chartContent={
                <TopProductsComparisonBarChart
                  rows={(data?.importProducts ?? [])
                    .sort(
                      (left, right) =>
                        (right.latestValue ?? 0) - (left.latestValue ?? 0)
                    )
                    .slice(0, 10)
                    .map((item) => ({
                      hs: item.hs,
                      name: item.name,
                      latestValue: item.latestValue ?? 0,
                      prevValue: item.prevValue ?? 0,
                      share: item.share ?? 0
                    }))}
                  latestYear={latestYear}
                  prevYear={prevYear}
                  unitLabel={unitLabel}
                  filename={`Chart_Top_Produk_Impor_${countryLabel.replace(/\s+/g, "_")}_${latestYear ?? "-"}`}
                  exportTitle={`Top Produk Impor ${countryLabel} ke Dunia`}
                  exportSubtitle={`Tahun ${topProductsYearRange} | Unit: ${unitLabel}`}
                  exportFooter={sourceLabel ?? "-"}
                  onRegisterDownload={registerImportChartDownload}
                />
              }
              expandedTableContent={
                <TopProdukTable
                  raw={importProductsRaw}
                  unitLabel={unitLabel}
                  expanded
                  onRegisterDownload={registerImportTableDownload}
                  downloadTitle={`Top Produk Impor ${countryLabel} ke Dunia`}
                  downloadFilename={`Top_Produk_Impor_${countryLabel.replace(/\s+/g, "_")}_${latestYear ?? "-"}`}
                  downloadSource={sourceLabel ?? undefined}
                  downloadNotes={selectedCountryNote}
                  downloadVariant="impor"
                  emptyMessage="Data top produk impor belum tersedia."
                  valueLabel="Impor"
                  shareLabel="Pangsa Pasar"
                  shareContextLabel="pangsa dari total impor"
                  totalLabel="Total impor produk"
                  changeLabel="Perubahan impor YoY"
                  onHsClick={(item: TopProdukItem) => {
                    const selected = importCompetitionProducts.find(
                      (product) => product.hs === item.hs
                    );
                    if (!selected) return;
                    setSelectedModal({ mode: "impor", product: selected });
                  }}
                />
              }
              expandedChartContent={
                <TopProductsComparisonBarChart
                  rows={(data?.importProducts ?? [])
                    .sort(
                      (left, right) =>
                        (right.latestValue ?? 0) - (left.latestValue ?? 0)
                    )
                    .slice(0, 10)
                    .map((item) => ({
                      hs: item.hs,
                      name: item.name,
                      latestValue: item.latestValue ?? 0,
                      prevValue: item.prevValue ?? 0,
                      share: item.share ?? 0
                    }))}
                  latestYear={latestYear}
                  prevYear={prevYear}
                  unitLabel={unitLabel}
                  height={720}
                  latestColor="#1D4ED8"
                  prevColor="#93C5FD"
                  filename={`Chart_Top_Produk_Impor_${countryLabel.replace(/\s+/g, "_")}_${latestYear ?? "-"}`}
                  exportTitle={`Top Produk Impor ${countryLabel} ke Dunia`}
                  exportSubtitle={`Tahun ${topProductsYearRange} | Unit: ${unitLabel}`}
                  exportFooter={sourceLabel ?? "-"}
                  onRegisterDownload={registerImportChartDownload}
                />
              }
            />
          </div>

          <ExpandableCard
            title={`Peta Persaingan Produk ${countryLabel}`}
            subtitle={`Tahun aktif ${latestYear ?? "-"} | unit: ${unitLabel}.`}
            className="min-w-0"
            modalSize="full"
            actions={
              <div className="flex flex-wrap items-center gap-2">
                {renderCompetitionTabs(
                  competitionMode,
                  handleCompetitionModeChange
                )}
                <IconTooltip label="Unduh Excel Peta Persaingan Produk">
                  <span>
                    <Button
                      type="button"
                      disabled={!competitionDownloadHandler}
                      onClick={() => competitionDownloadHandler?.()}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label="Unduh Excel peta persaingan produk"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </Button>
                  </span>
                </IconTooltip>
              </div>
            }
            expandedContent={
              <TradeCompetitionInsight
                title={`Peta Persaingan Produk ${countryLabel}`}
                products={competitionProducts}
                productOptions={competitionProductOptions}
                selectedHs={competitionDraftHs}
                activeHs={selectedCompetitionHs}
                onSelectHs={handleSelectCompetitionHs}
                latestYear={latestYear}
                unitLabel={unitLabel}
                sourceLabel={sourceLabel}
                hsLoading={hsOptionsQuery.isLoading}
                loading={competitionInsightLoading}
                errorMessage={competitionInsightError}
                emptyMessage="Data persaingan produk belum tersedia."
                showHeader={false}
                showSearchButton
                onSearch={handleCompetitionSearch}
                searchDisabled={!competitionDraftHs}
                onRegisterDownload={registerCompetitionDownload}
                titlePrefixPrimary={competitionPrefixes.primary}
                titlePrefixGlobal={competitionPrefixes.global}
                titlePrefixAsean={competitionPrefixes.asean}
                topDestinationLabel={competitionPrefixes.topLabel}
              />
            }
          >
            <TradeCompetitionInsight
              title={`Peta Persaingan Produk ${countryLabel}`}
              products={competitionProducts}
              productOptions={competitionProductOptions}
              selectedHs={competitionDraftHs}
              activeHs={selectedCompetitionHs}
              onSelectHs={handleSelectCompetitionHs}
              latestYear={latestYear}
              unitLabel={unitLabel}
              sourceLabel={sourceLabel}
              hsLoading={hsOptionsQuery.isLoading}
              loading={competitionInsightLoading}
              errorMessage={competitionInsightError}
              emptyMessage="Data persaingan produk belum tersedia."
              showHeader={false}
              showSearchButton
              onSearch={handleCompetitionSearch}
              searchDisabled={!competitionDraftHs}
              onRegisterDownload={registerCompetitionDownload}
              titlePrefixPrimary={competitionPrefixes.primary}
              titlePrefixGlobal={competitionPrefixes.global}
              titlePrefixAsean={competitionPrefixes.asean}
              topDestinationLabel={competitionPrefixes.topLabel}
            />
          </ExpandableCard>
        </>
      )}
    </div>
  );
}
