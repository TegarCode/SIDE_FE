import React from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { useKerjasamaBilateralTradeCompetitionInsightMutation } from "@/hooks/indonesia/useKerjasamaBilateralTradeCompetitionInsightMutation";
import { Button } from "@/components/ui/Button";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { FilterFallbackCard } from "@/components/ui/FilterFallbackCard";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { Modal } from "@/components/ui/Modal";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { useToast } from "@/components/ui/Toast";
import { TopMitraTable } from "@/components/ui/TopMitraTable";
import { TopProdukTable } from "@/components/ui/TopProdukTable";
import { TradeCompetitionInsight } from "@/components/ui/TradeCompetitionInsight";
import { PartnerMixedChart } from "@/components/ui/charts/PartnerMixedChart";
import { ChartSkeleton } from "@/components/ui/skeletons/ChartSkeleton";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";
import type {
  DiplomasiExportProductInsightItem,
  DiplomasiSummaryCardView,
  SelectOption,
  TopProdukItem
} from "@/type/indonesiaDiplomasi";
import type { BilateralOverviewData } from "@/type/indonesiaKerjasamaBilateral";
import {
  TRADE_VIEW_OPTIONS,
  TradeViewMode,
  asNumberSeries,
  buildSummaryCard,
  createLoadingCard,
  extractMeta,
  extractUnitLabel,
  getTradeMetricValue,
  isRecord,
  parseCompetitionInsightProducts,
  parseTopProdukInsights,
  parseTradeItems,
  renderCompetitionTabs,
  renderTradeViewTabs
} from "@/components/indonesia/kerjasama-bilateral/tabs/helpers/PerdaganganTab.helpers";

type PerdaganganTabProps = {
  overview: BilateralOverviewData | null;
  loading: boolean;
  error: string | null;
  selectedPartnerLabels?: string[];
  hsOptions?: SelectOption[];
};

export function PerdaganganTab({
  overview,
  loading,
  error,
  selectedPartnerLabels = [],
  hsOptions: masterHsOptions = []
}: PerdaganganTabProps) {
  const [countryView, setCountryView] = React.useState<TradeViewMode>("total");
  const [produkView, setProdukView] = React.useState<TradeViewMode>("total");
  const [competitionView, setCompetitionView] = React.useState<
    "ekspor" | "impor"
  >("ekspor");
  const [sortColumnLabel, setSortColumnLabel] =
    React.useState<string>("tahun terbaru");
  const [produkSortColumnLabel, setProdukSortColumnLabel] =
    React.useState<string>("tahun terbaru");
  const [downloadHandler, setDownloadHandler] = React.useState<
    (() => void) | null
  >(null);
  const [produkDownloadHandler, setProdukDownloadHandler] = React.useState<
    (() => void) | null
  >(null);
  const [competitionDownloadHandler, setCompetitionDownloadHandler] =
    React.useState<(() => void) | null>(null);
  const [selectedHsDraft, setSelectedHsDraft] = React.useState<string | null>(
    null
  );
  const [modalProduct, setModalProduct] =
    React.useState<DiplomasiExportProductInsightItem | null>(null);
  const [competitionProducts, setCompetitionProducts] = React.useState<
    DiplomasiExportProductInsightItem[]
  >([]);
  const [competitionError, setCompetitionError] = React.useState<string | null>(
    null
  );
  const [hasAutoRequestedCompetition, setHasAutoRequestedCompetition] =
    React.useState(false);
  const [lastCompletedCompetitionHs, setLastCompletedCompetitionHs] =
    React.useState<string | null>(null);
  const loadingCompetitionToastIdRef = React.useRef<string | null>(null);
  const lastSuccessCompetitionKeyRef = React.useRef("");
  const competitionRequestModeRef = React.useRef<"auto" | "manual">("auto");
  const competitionInsightMutation =
    useKerjasamaBilateralTradeCompetitionInsightMutation();
  const { toast, dismiss } = useToast();

  const raw = overview?.raw ?? null;
  const meta = React.useMemo(() => extractMeta(raw), [raw]);
  const unitLabel = React.useMemo(() => extractUnitLabel(raw), [raw]);
  const sourceLabel = React.useMemo(() => {
    if (!meta) return null;
    if (typeof meta.sumber === "string" && meta.sumber.trim())
      return meta.sumber.trim();
    if (typeof meta.source === "string" && meta.source.trim())
      return meta.source.trim();
    return null;
  }, [meta]);
  const competitorSourceLabel = React.useMemo(() => {
    if (!meta) return null;
    if (
      typeof meta.kompetitor_sumber === "string" &&
      meta.kompetitor_sumber.trim()
    )
      return meta.kompetitor_sumber.trim();
    if (
      typeof meta.kompetitorSource === "string" &&
      meta.kompetitorSource.trim()
    )
      return meta.kompetitorSource.trim();
    return null;
  }, [meta]);
  const perdaganganSourceCode = React.useMemo(() => {
    if (!meta || !isRecord(meta.sources)) return null;
    const value = meta.sources.perdagangan;
    if (typeof value === "string" || typeof value === "number")
      return String(value);
    return null;
  }, [meta]);

  const items = React.useMemo(() => parseTradeItems(raw), [raw]);
  const topProducts = React.useMemo(() => parseTopProdukInsights(raw), [raw]);
  const selectedPartnersNote = React.useMemo(() => {
    const normalizedSelectedPartners = selectedPartnerLabels
      .map((item) => item.trim())
      .filter(Boolean);
    if (normalizedSelectedPartners.length) {
      return `Negara mitra terpilih: ${normalizedSelectedPartners.join(", ")}`;
    }

    if (!meta) return undefined;

    const readArray = (value: unknown): string[] =>
      Array.isArray(value)
        ? value
            .map((item) => (typeof item === "string" ? item.trim() : ""))
            .filter(Boolean)
        : [];

    const partnerNames = readArray(meta.partner_names);
    if (partnerNames.length)
      return `Negara mitra terpilih: ${partnerNames.join(", ")}`;

    const partnerCodes = readArray(
      meta.partners ?? meta.negara_mitra ?? meta.negara_tujuan
    );
    if (!partnerCodes.length) return undefined;

    const names = partnerCodes.map((code) => {
      const upper = code.toUpperCase();
      const matched = items.find(
        (item) =>
          item.alpha3?.toUpperCase() === upper ||
          item.country.toUpperCase() === upper
      );
      return matched?.country ?? code;
    });

    return `Negara mitra terpilih: ${names.join(", ")}`;
  }, [items, meta, selectedPartnerLabels]);

  const yearsAsc = React.useMemo(() => {
    const all = new Set<number>();
    for (const item of items) {
      for (const year of Object.keys(item.nilai)) {
        const value = Number(year);
        if (Number.isFinite(value)) all.add(value);
      }
    }
    return Array.from(all).sort((a, b) => a - b);
  }, [items]);

  const latestYear = React.useMemo(() => {
    if (typeof meta?.latest_year === "number") return meta.latest_year;
    return yearsAsc[yearsAsc.length - 1] ?? null;
  }, [meta, yearsAsc]);
  const prevYear = React.useMemo(() => {
    if (typeof meta?.prev_year === "number" && meta.prev_year !== latestYear)
      return meta.prev_year;
    return yearsAsc.length > 1 ? yearsAsc[yearsAsc.length - 2] : null;
  }, [latestYear, meta, yearsAsc]);

  const totals = React.useMemo(() => {
    const trade = yearsAsc.map((year) =>
      items.reduce((sum, item) => sum + (item.nilai[year] ?? 0), 0)
    );
    const balance = yearsAsc.map((year) =>
      items.reduce((sum, item) => sum + (item.neraca[year] ?? 0), 0)
    );
    const ekspor = trade.map(
      (value, index) => (value + (balance[index] ?? 0)) / 2
    );
    const impor = trade.map(
      (value, index) => (value - (balance[index] ?? 0)) / 2
    );
    return { trade, ekspor, impor, balance };
  }, [items, yearsAsc]);

  const topPartners = React.useMemo(() => {
    if (latestYear == null) return [];
    return [...items]
      .sort((a, b) => (b.nilai[latestYear] ?? 0) - (a.nilai[latestYear] ?? 0))
      .slice(0, 5);
  }, [items, latestYear]);

  const partnerSeries = React.useMemo(
    () =>
      topPartners.map((partner) => ({
        name: partner.country,
        export: yearsAsc.map(
          (year) =>
            ((partner.nilai[year] ?? 0) + (partner.neraca[year] ?? 0)) / 2
        ),
        import: yearsAsc.map(
          (year) =>
            ((partner.nilai[year] ?? 0) - (partner.neraca[year] ?? 0)) / 2
        ),
        balance: yearsAsc.map((year) => partner.neraca[year] ?? 0)
      })),
    [topPartners, yearsAsc]
  );

  const topPartnerCurrent = React.useMemo(() => {
    if (latestYear == null || !items.length) return null;
    return (
      [...items].sort(
        (a, b) => (b.nilai[latestYear] ?? 0) - (a.nilai[latestYear] ?? 0)
      )[0] ?? null
    );
  }, [items, latestYear]);
  const topPartnerPrevious = React.useMemo(() => {
    if (prevYear == null || !items.length) return null;
    return (
      [...items].sort(
        (a, b) => (b.nilai[prevYear] ?? 0) - (a.nilai[prevYear] ?? 0)
      )[0] ?? null
    );
  }, [items, prevYear]);

  const countryViewLabel = React.useMemo(
    () =>
      TRADE_VIEW_OPTIONS.find((option) => option.value === countryView)
        ?.label ?? "Nilai Perdagangan",
    [countryView]
  );
  const produkViewLabel = React.useMemo(
    () =>
      TRADE_VIEW_OPTIONS.find((option) => option.value === produkView)?.label ??
      "Nilai Perdagangan",
    [produkView]
  );

  const countryViewRaw = React.useMemo(() => {
    const totalsByYear = yearsAsc.reduce<Record<number, number>>(
      (acc, year) => {
        acc[year] = items.reduce(
          (sum, item) =>
            sum +
            getTradeMetricValue(countryView, item.nilai, item.neraca, year),
          0
        );
        return acc;
      },
      {}
    );

    return {
      items: items.map((item) => ({
        negara: item.country,
        kode_alpha2: item.alpha2,
        kode_alpha3: item.alpha3,
        nilai_perdagangan: yearsAsc.reduce<Record<number, number>>(
          (acc, year) => {
            acc[year] = getTradeMetricValue(
              countryView,
              item.nilai,
              item.neraca,
              year
            );
            return acc;
          },
          {}
        ),
        neraca: item.neraca,
        proporsi: yearsAsc.reduce<Record<number, number>>((acc, year) => {
          const total = totalsByYear[year] ?? 0;
          const value = getTradeMetricValue(
            countryView,
            item.nilai,
            item.neraca,
            year
          );
          acc[year] =
            countryView === "neraca" || total <= 0 ? 0 : (value / total) * 100;
          return acc;
        }, {})
      }))
    };
  }, [countryView, items, yearsAsc]);

  const productViewRaw = React.useMemo(() => {
    if (!isRecord(raw)) return { data: { top_produk: [] } };
    const data = isRecord(raw.data) ? raw.data : null;
    const candidates: unknown[] = [
      data?.top_produk,
      raw.top_produk,
      isRecord(data?.data) ? data.data.top_produk : null
    ];
    const list =
      (candidates.find((value) => Array.isArray(value)) as
        | unknown[]
        | undefined) ?? [];

    const totalsByYear = yearsAsc.reduce<Record<number, number>>(
      (acc, year) => {
        acc[year] = list.filter(isRecord).reduce((sum, item) => {
          const nilai = asNumberSeries(item.nilai);
          const neraca = asNumberSeries(item.neraca);
          const ekspor = asNumberSeries(item.export);
          const impor = asNumberSeries(item.import ?? item.impor);
          const direct =
            produkView === "ekspor"
              ? Number(
                  ekspor[year] ?? ((nilai[year] ?? 0) + (neraca[year] ?? 0)) / 2
                )
              : produkView === "impor"
                ? Number(
                    impor[year] ??
                      ((nilai[year] ?? 0) - (neraca[year] ?? 0)) / 2
                  )
                : produkView === "neraca"
                  ? Number(neraca[year] ?? 0)
                  : Number(nilai[year] ?? 0);
          return sum + direct;
        }, 0);
        return acc;
      },
      {}
    );

    return {
      data: {
        top_produk: list.filter(isRecord).map((item) => {
          const nilai = asNumberSeries(item.nilai);
          const neraca = asNumberSeries(item.neraca);
          const ekspor = asNumberSeries(item.export);
          const impor = asNumberSeries(item.import ?? item.impor);
          const selectedNilai = yearsAsc.reduce<Record<number, number>>(
            (acc, year) => {
              acc[year] =
                produkView === "ekspor"
                  ? Number(
                      ekspor[year] ??
                        ((nilai[year] ?? 0) + (neraca[year] ?? 0)) / 2
                    )
                  : produkView === "impor"
                    ? Number(
                        impor[year] ??
                          ((nilai[year] ?? 0) - (neraca[year] ?? 0)) / 2
                      )
                    : produkView === "neraca"
                      ? Number(neraca[year] ?? 0)
                      : Number(nilai[year] ?? 0);
              return acc;
            },
            {}
          );

          const share = yearsAsc.reduce<Record<number, number>>((acc, year) => {
            const total = totalsByYear[year] ?? 0;
            acc[year] =
              produkView === "neraca" || total <= 0
                ? 0
                : ((selectedNilai[year] ?? 0) / total) * 100;
            return acc;
          }, {});

          return {
            ...item,
            nilai: selectedNilai,
            share
          };
        })
      }
    };
  }, [produkView, raw, yearsAsc]);

  const summaryCards = React.useMemo<DiplomasiSummaryCardView[]>(() => {
    const currentIndex = latestYear != null ? yearsAsc.indexOf(latestYear) : -1;
    const prevIndex = prevYear != null ? yearsAsc.indexOf(prevYear) : -1;
    const currentTrade =
      currentIndex >= 0 ? (totals.trade[currentIndex] ?? null) : null;
    const previousTrade =
      prevIndex >= 0 ? (totals.trade[prevIndex] ?? null) : null;
    const currentEkspor =
      currentIndex >= 0 ? (totals.ekspor[currentIndex] ?? null) : null;
    const previousEkspor =
      prevIndex >= 0 ? (totals.ekspor[prevIndex] ?? null) : null;
    const currentImpor =
      currentIndex >= 0 ? (totals.impor[currentIndex] ?? null) : null;
    const previousImpor =
      prevIndex >= 0 ? (totals.impor[prevIndex] ?? null) : null;

    return [
      buildSummaryCard({
        id: "trade-total",
        title: "Nilai Perdagangan Indonesia ke Mitra Tujuan",
        tone: "orange",
        unit: unitLabel,
        value: currentTrade,
        prevValue: previousTrade,
        year: latestYear != null ? String(latestYear) : null,
        prevYear: prevYear != null ? String(prevYear) : null,
        note: "Akumulasi nilai perdagangan Indonesia pada mitra tujuan aktif.",
        highlight: null,
        prevHighlight: null,
        sourceName: sourceLabel
      }),
      buildSummaryCard({
        id: "top-partner",
        title: "Mitra Dagang Utama",
        tone: "purple",
        unit: unitLabel,
        value:
          latestYear != null
            ? (topPartnerCurrent?.nilai[latestYear] ?? null)
            : null,
        prevValue:
          prevYear != null
            ? (topPartnerPrevious?.nilai[prevYear] ?? null)
            : null,
        year: latestYear != null ? String(latestYear) : null,
        prevYear: prevYear != null ? String(prevYear) : null,
        note: "Negara/entitas dengan nilai perdagangan terbesar pada tahun aktif.",
        highlight: topPartnerCurrent?.country ?? null,
        prevHighlight: topPartnerPrevious?.country ?? null,
        highlightType: "country",
        sourceName: sourceLabel
      }),
      buildSummaryCard({
        id: "trade-export",
        title: "Total Ekspor Indonesia ke Mitra Tujuan",
        tone: "emerald",
        unit: unitLabel,
        value: currentEkspor,
        prevValue: previousEkspor,
        year: latestYear != null ? String(latestYear) : null,
        prevYear: prevYear != null ? String(prevYear) : null,
        note: "Ekspor diturunkan dari nilai perdagangan dan neraca pada mitra tujuan aktif.",
        highlight: null,
        prevHighlight: null,
        sourceName: sourceLabel
      }),
      buildSummaryCard({
        id: "trade-import",
        title: "Total Impor Indonesia ke Mitra Tujuan",
        tone: "blue",
        unit: unitLabel,
        value: currentImpor,
        prevValue: previousImpor,
        year: latestYear != null ? String(latestYear) : null,
        prevYear: prevYear != null ? String(prevYear) : null,
        note: "Impor diturunkan dari nilai perdagangan dan neraca pada mitra tujuan aktif.",
        highlight: null,
        prevHighlight: null,
        sourceName: sourceLabel
      })
    ];
  }, [
    latestYear,
    prevYear,
    sourceLabel,
    topPartnerCurrent,
    topPartnerPrevious,
    totals.ekspor,
    totals.impor,
    totals.trade,
    unitLabel,
    yearsAsc
  ]);

  React.useEffect(() => {
    if (!topProducts.length) {
      setSelectedHsDraft(null);
      setHasAutoRequestedCompetition(false);
      return;
    }

    setSelectedHsDraft((current) =>
      current && topProducts.some((item) => item.hs === current)
        ? current
        : topProducts[0].hs
    );
    setHasAutoRequestedCompetition(false);
  }, [topProducts]);

  React.useEffect(() => {
    setCompetitionProducts(topProducts);
  }, [topProducts]);

  const hsOptions = React.useMemo(() => {
    const normalizedMasterHsOptions = masterHsOptions.filter(
      (item) => item.value !== "ALL"
    );
    if (normalizedMasterHsOptions.length) return normalizedMasterHsOptions;
    return topProducts.map((item) => ({
      value: item.hs,
      label: `${item.hs} - ${item.name}`
    }));
  }, [masterHsOptions, topProducts]);

  const competitionDisplayProducts = React.useMemo<
    DiplomasiExportProductInsightItem[]
  >(
    () =>
      competitionProducts.map((item) =>
        competitionView === "ekspor"
          ? item
          : {
              ...item,
              nilai: item.import ?? item.nilai,
              tujuanEkspor: item.tujuanImpor ?? [],
              kompetitorGlobalTopTujuanEkspor:
                item.kompetitorGlobalTopTujuanImpor ?? [],
              kompetitorAseanTopTujuanEkspor:
                item.kompetitorAseanTopTujuanImpor ?? []
            }
      ),
    [competitionProducts, competitionView]
  );

  const competitionToastKey = React.useMemo(
    () =>
      `${lastCompletedCompetitionHs ?? "-"}-${latestYear ?? "-"}-${competitionProducts.length}`,
    [competitionProducts.length, lastCompletedCompetitionHs, latestYear]
  );

  const handleSearchCompetition = React.useCallback(
    async (mode: "auto" | "manual" = "manual") => {
      const hsCode = selectedHsDraft?.trim();
      if (!hsCode) {
        setCompetitionError("Pilih HS produk terlebih dahulu.");
        return;
      }

      competitionRequestModeRef.current = mode;
      setCompetitionError(null);
      try {
        const response = await competitionInsightMutation.mutateAsync({
          hsCode,
          negara: "IDN",
          year: latestYear ?? undefined,
          sumber: perdaganganSourceCode
            ? [{ sektor: "perdagangan", sumber: perdaganganSourceCode }]
            : undefined
        });
        const nextProducts = parseCompetitionInsightProducts(
          response,
          latestYear
        );
        setCompetitionProducts(nextProducts);
        setLastCompletedCompetitionHs(hsCode);
        setHasAutoRequestedCompetition(true);
        if (!nextProducts.length) {
          setCompetitionError(
            "Data insight tujuan kompetitor tidak ditemukan untuk HS terpilih."
          );
        }
      } catch {
        setCompetitionProducts([]);
        setLastCompletedCompetitionHs(null);
        setHasAutoRequestedCompetition(true);
        setCompetitionError("Gagal memuat data insight tujuan kompetitor.");
      }
    },
    [
      competitionInsightMutation,
      latestYear,
      perdaganganSourceCode,
      selectedHsDraft
    ]
  );

  const handleManualSearchCompetition = React.useCallback(() => {
    void handleSearchCompetition("manual");
  }, [handleSearchCompetition]);

  React.useEffect(() => {
    if (hasAutoRequestedCompetition) return;
    if (!topProducts.length || !selectedHsDraft) return;
    if (competitionInsightMutation.isPending) return;
    void handleSearchCompetition("auto");
  }, [
    competitionInsightMutation.isPending,
    handleSearchCompetition,
    hasAutoRequestedCompetition,
    selectedHsDraft,
    topProducts.length
  ]);

  React.useEffect(() => {
    if (competitionRequestModeRef.current !== "manual") return;

    if (competitionInsightMutation.isPending) {
      if (loadingCompetitionToastIdRef.current) return;
      loadingCompetitionToastIdRef.current = toast({
        title: "Sedang tarik data insight kompetitor",
        description: "Peta persaingan produk bilateral sedang diproses...",
        tone: "loading",
        durationMs: null
      });
      return;
    }

    if (loadingCompetitionToastIdRef.current) {
      dismiss(loadingCompetitionToastIdRef.current);
      loadingCompetitionToastIdRef.current = null;
    }
  }, [competitionInsightMutation.isPending, dismiss, toast]);

  React.useEffect(() => {
    if (competitionRequestModeRef.current !== "manual") return;
    if (!competitionInsightMutation.isSuccess) return;
    if (!lastCompletedCompetitionHs) return;
    if (!competitionProducts.length) return;
    if (lastSuccessCompetitionKeyRef.current === competitionToastKey) return;

    lastSuccessCompetitionKeyRef.current = competitionToastKey;
    toast({
      title: "Data insight kompetitor siap",
      description: `HS ${lastCompletedCompetitionHs} selesai dimuat.`,
      tone: "success",
      durationMs: 2200
    });
  }, [
    competitionInsightMutation.isSuccess,
    competitionProducts.length,
    competitionToastKey,
    lastCompletedCompetitionHs,
    toast
  ]);

  const handleRegisterDownload = React.useCallback(
    (handler: (() => void) | null) => {
      setDownloadHandler(() => handler);
    },
    []
  );
  const handleRegisterProdukDownload = React.useCallback(
    (handler: (() => void) | null) => {
      setProdukDownloadHandler(() => handler);
    },
    []
  );
  const handleRegisterCompetitionDownload = React.useCallback(
    (handler: (() => void) | null) => {
      setCompetitionDownloadHandler(() => handler);
    },
    []
  );

  const yearRangeLabel = React.useMemo(() => {
    const startYear = yearsAsc[0] ?? latestYear;
    const endYear = yearsAsc[yearsAsc.length - 1] ?? latestYear;
    if (startYear == null && endYear == null) return "Range tahun -";
    if (startYear != null && endYear != null && startYear !== endYear)
      return `${startYear}-${endYear}`;
    return `Tahun ${endYear ?? startYear ?? "-"}`;
  }, [latestYear, yearsAsc]);
  const tableCaption = React.useMemo(
    () =>
      `${yearRangeLabel} | Unit: ${unitLabel} | Nomor mengikuti urutan sorting pada kolom ${sortColumnLabel}`,
    [sortColumnLabel, unitLabel, yearRangeLabel]
  );
  const produkTableCaption = React.useMemo(
    () =>
      `${yearRangeLabel} | Unit: ${unitLabel} | Nomor mengikuti urutan sorting pada kolom ${produkSortColumnLabel}`,
    [produkSortColumnLabel, unitLabel, yearRangeLabel]
  );
  const competitionExcelSource = React.useMemo(
    () =>
      competitorSourceLabel && competitorSourceLabel !== sourceLabel
        ? `${sourceLabel ?? "-"} | Kompetitor: ${competitorSourceLabel}`
        : (sourceLabel ?? "-"),
    [competitorSourceLabel, sourceLabel]
  );

  const showLoadingLayout = loading || (!error && !overview);
  const shouldShowEmptyFallback =
    !showLoadingLayout && yearsAsc.length === 0 && topProducts.length === 0;

  return (
    <div className="space-y-4">
      <Modal
        open={Boolean(modalProduct)}
        onClose={() => setModalProduct(null)}
        title="Peta Persaingan Produk"
        subtitle={
          modalProduct
            ? `HS ${modalProduct.hs} - ${modalProduct.name}`
            : undefined
        }
        size="full"
        bodyClassName="space-y-4"
      >
        <TradeCompetitionInsight
          variant="modal"
          title="Peta Persaingan Produk"
          products={
            modalProduct
              ? [
                  competitionView === "ekspor"
                    ? modalProduct
                    : {
                        ...modalProduct,
                        nilai: modalProduct.import ?? modalProduct.nilai,
                        tujuanEkspor: modalProduct.tujuanImpor ?? [],
                        kompetitorGlobalTopTujuanEkspor:
                          modalProduct.kompetitorGlobalTopTujuanImpor ?? [],
                        kompetitorAseanTopTujuanEkspor:
                          modalProduct.kompetitorAseanTopTujuanImpor ?? []
                      }
                ]
              : []
          }
          productOptions={
            modalProduct
              ? [
                  {
                    value: modalProduct.hs,
                    label: `${modalProduct.hs} - ${modalProduct.name}`
                  }
                ]
              : []
          }
          selectedHs={modalProduct?.hs ?? null}
          onSelectHs={() => {}}
          latestYear={latestYear}
          unitLabel={unitLabel}
          sourceLabel={sourceLabel}
          competitorSourceLabel={competitorSourceLabel}
          emptyMessage="Detail tujuan ekspor produk belum tersedia."
          showHeader={false}
          showProductSelect={false}
          titlePrefixPrimary={
            competitionView === "ekspor"
              ? "Tujuan Ekspor INDONESIA"
              : "Negara Asal Impor Indonesia"
          }
          titlePrefixGlobal={
            competitionView === "ekspor"
              ? "Tujuan Ekspor Utama ke"
              : "Asal Impor Utama dari"
          }
          titlePrefixAsean={
            competitionView === "ekspor"
              ? "Tujuan Ekspor ASEAN ke"
              : "Asal Impor ASEAN dari"
          }
          topDestinationLabel={
            competitionView === "ekspor" ? "Top Tujuan" : "Top Asal"
          }
        />
      </Modal>

      {showLoadingLayout ? (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              createLoadingCard(
                "trade-total",
                "Nilai Perdagangan Indonesia ke Mitra Tujuan",
                "orange"
              ),
              createLoadingCard("top-partner", "Mitra Dagang Utama", "purple"),
              createLoadingCard(
                "trade-export",
                "Total Ekspor Indonesia ke Mitra Tujuan",
                "emerald"
              ),
              createLoadingCard(
                "trade-import",
                "Total Impor Indonesia ke Mitra Tujuan",
                "blue"
              )
            ].map((card) => (
              <SummaryCard key={card.id} card={card} loading />
            ))}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="font-semibold tracking-tight text-slate-900">
              Komparasi Tren Perdagangan Indonesia (Ekspor, Impor, Neraca) ke
              Negara/Entitas
            </h3>
            <p className="text-xs text-slate-500">
              Memuat visualisasi komparasi top 5...
            </p>
            <div className="mt-4">
              <ChartSkeleton />
            </div>
          </section>

          <section className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="font-semibold tracking-tight text-slate-900">
                Top Produk Nilai Perdagangan Indonesia
              </h3>
              <p className="text-xs text-slate-500">Memuat data tabel...</p>
              <div className="mt-4">
                <TableSkeleton rows={8} />
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="font-semibold tracking-tight text-slate-900">
                Peta Persaingan Produk
              </h3>
              <p className="text-xs text-slate-500">
                Memuat detail persaingan produk...
              </p>
              <div className="mt-4">
                <TradeCompetitionInsight
                  title="Peta Persaingan Produk"
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
          </section>
        </>
      ) : error ? (
        <FilterFallbackCard
          title="Data perdagangan bilateral gagal dimuat"
          body={error}
        />
      ) : shouldShowEmptyFallback ? (
        <FilterFallbackCard
          title="Data perdagangan bilateral belum tersedia"
          body="Lengkapi filter dan pastikan endpoint perdagangan bilateral mengembalikan data."
        />
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <SummaryCard key={card.id} card={card} />
            ))}
          </section>

          <ExpandableCard
            title="Komparasi Tren Perdagangan Indonesia"
            subtitle={`Top 5 negara/entitas | Unit: ${unitLabel}`}
            className="min-w-0 min-h-144"
            modalSize="full"
            expandedContent={
              <PartnerMixedChart
                years={yearsAsc}
                partners={partnerSeries}
                unit={unitLabel}
                height={720}
              />
            }
            contentClassName="flex h-full flex-col gap-3"
          >
            <div className="min-h-0 flex-1">
              <PartnerMixedChart
                years={yearsAsc}
                partners={partnerSeries}
                unit={unitLabel}
                height={480}
              />
            </div>
            {sourceLabel ? (
              <p className="mt-auto text-right text-[11px] text-slate-500">
                Sumber: {sourceLabel}
              </p>
            ) : null}
          </ExpandableCard>

          <section className="">
            <ExpandableCard
              title={`${countryViewLabel} Indonesia ke Negara/Entitas`}
              subtitle={tableCaption}
              actions={
                <div className="flex items-center gap-2">
                  {renderTradeViewTabs(countryView, setCountryView)}
                  <IconTooltip label="Unduh Excel">
                    <span>
                      <Button
                        type="button"
                        disabled={!downloadHandler}
                        onClick={() => downloadHandler?.()}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white disabled:hover:text-slate-600"
                        aria-label="Unduh Excel Top Mitra"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </Button>
                    </span>
                  </IconTooltip>
                </div>
              }
              className="min-w-0 h-full min-h-115"
              contentClassName="flex h-full flex-col"
              expandLabel="Perbesar tabel"
              modalSize="full"
              expandedContent={
                <TopMitraTable
                  raw={countryViewRaw}
                  unitLabel={unitLabel}
                  expanded
                  onSortColumnChange={setSortColumnLabel}
                  onRegisterDownload={handleRegisterDownload}
                  downloadTitle={`${countryViewLabel} Indonesia ke Negara/Entitas`}
                  downloadFilename={`${countryViewLabel.replace(/\s+/g, "_")}_Indonesia_ke_Negara_Entitas_${latestYear ?? "-"}`}
                  downloadSource={sourceLabel ?? undefined}
                  downloadNotes={selectedPartnersNote}
                  emptyMessage="Data top mitra dagang belum tersedia."
                  valueLabel={countryViewLabel}
                  shareLabel={`Pangsa ${countryViewLabel}`}
                  shareContextLabel="dari total mitra"
                  totalLabel={`Total ${countryViewLabel.toLowerCase()}`}
                  changeLabel={`Perubahan ${countryViewLabel} YoY`}
                  showBalanceDetail={
                    countryView === "total" || countryView === "neraca"
                  }
                />
              }
            >
              <div className="flex h-full flex-col">
                <div className="min-h-0 flex-1">
                  <TopMitraTable
                    raw={countryViewRaw}
                    unitLabel={unitLabel}
                    onSortColumnChange={setSortColumnLabel}
                    onRegisterDownload={handleRegisterDownload}
                    downloadTitle={`${countryViewLabel} Indonesia ke Negara/Entitas`}
                    downloadFilename={`${countryViewLabel.replace(/\s+/g, "_")}_Indonesia_ke_Negara_Entitas_${latestYear ?? "-"}`}
                    downloadSource={sourceLabel ?? undefined}
                    downloadNotes={selectedPartnersNote}
                    emptyMessage="Data top mitra dagang belum tersedia."
                    valueLabel={countryViewLabel}
                    shareLabel={`Pangsa ${countryViewLabel}`}
                    shareContextLabel="dari total mitra"
                    totalLabel={`Total ${countryViewLabel.toLowerCase()}`}
                    changeLabel={`Perubahan ${countryViewLabel} YoY`}
                    showBalanceDetail={
                      countryView === "total" || countryView === "neraca"
                    }
                  />
                </div>
                {sourceLabel ? (
                  <p className="mt-auto text-right text-[11px] text-slate-500">
                    Sumber: {sourceLabel}
                  </p>
                ) : null}
              </div>
            </ExpandableCard>
          </section>

          <section className="space-y-4">
            <ExpandableCard
              title={`Top Produk ${produkViewLabel} Indonesia`}
              subtitle={produkTableCaption}
              className="min-w-0 min-h-144"
              modalSize="full"
              contentClassName="flex h-full flex-col gap-3"
              actions={
                <div className="flex items-center gap-2">
                  {renderTradeViewTabs(produkView, setProdukView)}
                  <IconTooltip label="Unduh Excel">
                    <span>
                      <Button
                        type="button"
                        disabled={!produkDownloadHandler}
                        onClick={() => produkDownloadHandler?.()}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white disabled:hover:text-slate-600"
                        aria-label="Unduh Excel Top Produk"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </Button>
                    </span>
                  </IconTooltip>
                </div>
              }
              expandedContent={
                <TopProdukTable
                  raw={productViewRaw}
                  unitLabel={unitLabel}
                  expanded
                  onRegisterDownload={handleRegisterProdukDownload}
                  onSortColumnChange={setProdukSortColumnLabel}
                  downloadTitle={`Top Produk ${produkViewLabel} Indonesia`}
                  downloadFilename={`Top_Produk_${produkViewLabel.replace(/\s+/g, "_")}_Indonesia_${latestYear ?? "-"}`}
                  downloadSource={competitionExcelSource}
                  downloadNotes={selectedPartnersNote}
                  downloadVariant={
                    produkView === "ekspor"
                      ? "ekspor"
                      : produkView === "impor"
                        ? "impor"
                        : "default"
                  }
                  emptyMessage="Data top produk perdagangan belum tersedia."
                  valueLabel={produkViewLabel}
                  shareLabel={`Pangsa ${produkViewLabel}`}
                  shareContextLabel="pangsa dari total produk"
                  totalLabel={`Total ${produkViewLabel.toLowerCase()}`}
                  changeLabel={`Perubahan ${produkViewLabel} YoY`}
                  invoiceMode={
                    produkView === "ekspor"
                      ? "ekspor"
                      : produkView === "impor"
                        ? "impor"
                        : null
                  }
                  onHsClick={(item: TopProdukItem) => {
                    if (produkView !== "ekspor") return;
                    const product =
                      topProducts.find((entry) => entry.hs === item.hs) ?? null;
                    setModalProduct(product);
                  }}
                />
              }
            >
              <div className="h-130">
                <TopProdukTable
                  raw={productViewRaw}
                  unitLabel={unitLabel}
                  onRegisterDownload={handleRegisterProdukDownload}
                  onSortColumnChange={setProdukSortColumnLabel}
                  downloadTitle={`Top Produk ${produkViewLabel} Indonesia`}
                  downloadFilename={`Top_Produk_${produkViewLabel.replace(/\s+/g, "_")}_Indonesia_${latestYear ?? "-"}`}
                  downloadSource={competitionExcelSource}
                  downloadNotes={selectedPartnersNote}
                  downloadVariant={
                    produkView === "ekspor"
                      ? "ekspor"
                      : produkView === "impor"
                        ? "impor"
                        : "default"
                  }
                  emptyMessage="Data top produk perdagangan belum tersedia."
                  valueLabel={produkViewLabel}
                  shareLabel={`Pangsa ${produkViewLabel}`}
                  shareContextLabel="pangsa dari total produk"
                  totalLabel={`Total ${produkViewLabel.toLowerCase()}`}
                  changeLabel={`Perubahan ${produkViewLabel} YoY`}
                  invoiceMode={
                    produkView === "ekspor"
                      ? "ekspor"
                      : produkView === "impor"
                        ? "impor"
                        : null
                  }
                  onHsClick={(item: TopProdukItem) => {
                    if (produkView !== "ekspor") return;
                    const product =
                      topProducts.find((entry) => entry.hs === item.hs) ?? null;
                    setModalProduct(product);
                  }}
                />
              </div>
              {sourceLabel ? (
                <p className="mt-auto text-right text-[11px] text-slate-500">
                  Sumber: {sourceLabel}
                </p>
              ) : null}
            </ExpandableCard>

            <ExpandableCard
              title="Peta Persaingan Produk"
              subtitle={`Tahun aktif ${latestYear ?? "-"} | Unit: ${unitLabel}`}
              className="min-w-0"
              modalSize="full"
              actions={
                <div className="flex items-center gap-2">
                  {renderCompetitionTabs(competitionView, setCompetitionView)}
                  <IconTooltip label="Unduh Excel">
                    <span>
                      <Button
                        type="button"
                        disabled={!competitionDownloadHandler}
                        onClick={() => competitionDownloadHandler?.()}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white disabled:hover:text-slate-600"
                        aria-label="Unduh Excel Peta Persaingan Produk"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </Button>
                    </span>
                  </IconTooltip>
                </div>
              }
              expandedContent={
                <TradeCompetitionInsight
                  title="Peta Persaingan Produk"
                  products={competitionDisplayProducts}
                  productOptions={hsOptions}
                  selectedHs={selectedHsDraft}
                  onSelectHs={setSelectedHsDraft}
                  latestYear={latestYear}
                  unitLabel={unitLabel}
                  sourceLabel={sourceLabel}
                  competitorSourceLabel={competitorSourceLabel}
                  hsLoading={false}
                  showSearchButton
                  onSearch={handleManualSearchCompetition}
                  searchLoading={competitionInsightMutation.isPending}
                  searchDisabled={!selectedHsDraft}
                  errorMessage={competitionError}
                  emptyMessage="Data persaingan produk belum tersedia."
                  showHeader={false}
                  onRegisterDownload={handleRegisterCompetitionDownload}
                  titlePrefixPrimary={
                    competitionView === "ekspor"
                      ? "Tujuan Ekspor INDONESIA"
                      : "Negara Asal Impor Indonesia"
                  }
                  titlePrefixGlobal={
                    competitionView === "ekspor"
                      ? "Tujuan Ekspor Utama ke"
                      : "Asal Impor Utama dari"
                  }
                  titlePrefixAsean={
                    competitionView === "ekspor"
                      ? "Tujuan Ekspor ASEAN ke"
                      : "Asal Impor ASEAN dari"
                  }
                  topDestinationLabel={
                    competitionView === "ekspor" ? "Top Tujuan" : "Top Asal"
                  }
                />
              }
            >
              <TradeCompetitionInsight
                title="Peta Persaingan Produk"
                products={competitionDisplayProducts}
                productOptions={hsOptions}
                selectedHs={selectedHsDraft}
                onSelectHs={setSelectedHsDraft}
                latestYear={latestYear}
                unitLabel={unitLabel}
                sourceLabel={sourceLabel}
                competitorSourceLabel={competitorSourceLabel}
                hsLoading={false}
                showSearchButton
                onSearch={handleManualSearchCompetition}
                searchLoading={competitionInsightMutation.isPending}
                searchDisabled={!selectedHsDraft}
                errorMessage={competitionError}
                emptyMessage="Data persaingan produk belum tersedia."
                showHeader={false}
                onRegisterDownload={handleRegisterCompetitionDownload}
                titlePrefixPrimary={
                  competitionView === "ekspor"
                    ? "Tujuan Ekspor INDONESIA"
                    : "Negara Asal Impor Indonesia"
                }
                titlePrefixGlobal={
                  competitionView === "ekspor"
                    ? "Tujuan Ekspor Utama ke"
                    : "Asal Impor Utama dari"
                }
                titlePrefixAsean={
                  competitionView === "ekspor"
                    ? "Tujuan Ekspor ASEAN ke"
                    : "Asal Impor ASEAN dari"
                }
                topDestinationLabel={
                  competitionView === "ekspor" ? "Top Tujuan" : "Top Asal"
                }
              />
            </ExpandableCard>
          </section>
        </>
      )}
    </div>
  );
}
