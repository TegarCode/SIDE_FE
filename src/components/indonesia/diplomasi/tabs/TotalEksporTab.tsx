import React from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import type { DiplomasiTabPanelProps } from "@/components/indonesia/diplomasi/tabs/types";
import { useDiplomasiHsProductQuery } from "@/hooks/indonesia/useDiplomasiHsProductQuery";
import { useDiplomasiTradeCompetitionInsightMutation } from "@/hooks/indonesia/useDiplomasiTradeCompetitionInsightMutation";
import { NILAI_PERDAGANGAN_MAP_BUCKETS } from "@/constants/indonesiaDiplomasi";
import { Button } from "@/components/ui/Button";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { FilterFallbackCard } from "@/components/ui/FilterFallbackCard";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { MapHeatLayer } from "@/components/ui/MapHeatLayer";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { TopMitraTable } from "@/components/ui/TopMitraTable";
import { TopProdukTable } from "@/components/ui/TopProdukTable";
import { TradeCompetitionInsight } from "@/components/ui/TradeCompetitionInsight";
import { MultiLineTrendChart } from "@/components/ui/charts/MultiLineTrendChart";
import { ChartSkeleton } from "@/components/ui/skeletons/ChartSkeleton";
import { MapSkeleton } from "@/components/ui/skeletons/MapSkeleton";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";
import type {
  DiplomasiCountryValueItem,
  DiplomasiExportProductInsightItem,
  DiplomasiItemRecord,
  TopProdukItem
} from "@/type/indonesiaDiplomasi";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asNumberSeries(value: unknown): Record<number, number> {
  if (!isRecord(value)) return {};
  const out: Record<number, number> = {};
  for (const [key, raw] of Object.entries(value)) {
    const year = Number(key);
    const num = Number(raw);
    if (Number.isFinite(year) && Number.isFinite(num)) out[year] = num;
  }
  return out;
}

function parseCountryValueList(raw: unknown): DiplomasiCountryValueItem[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter(isRecord)
    .map((item, index) => ({
      rank: typeof item.rank === "number" ? item.rank : index + 1,
      alpha2: typeof item.kode_alpha2 === "string" ? item.kode_alpha2 : null,
      alpha3: typeof item.kode_alpha3 === "string" ? item.kode_alpha3 : null,
      country:
        (typeof item.negara === "string" && item.negara.trim()) ||
        (typeof item.country === "string" && item.country.trim()) ||
        (typeof item.kode_alpha3 === "string" && item.kode_alpha3.trim()) ||
        "-",
      nilai: Number(item.nilai ?? 0)
    }))
    .filter((item) => item.country !== "-");
}

function parseItems(raw: unknown): DiplomasiItemRecord[] {
  if (!isRecord(raw)) return [];
  const candidates: unknown[] = [
    raw.items,
    raw.data,
    isRecord(raw.data) ? raw.data.items : null,
    isRecord(raw.data) && isRecord(raw.data.data) ? raw.data.data.items : null
  ];
  const list = candidates.find((value) => Array.isArray(value)) as
    | unknown[]
    | undefined;
  if (!list) return [];

  return list
    .filter(isRecord)
    .map((item) => ({
      country:
        (typeof item.negara === "string" && item.negara.trim()) ||
        (typeof item.country === "string" && item.country.trim()) ||
        "-",
      alpha3: typeof item.kode_alpha3 === "string" ? item.kode_alpha3 : null,
      nilai: asNumberSeries(
        item.nilai_perdagangan ?? item.nilai ?? item.export
      ),
      neraca: asNumberSeries(item.neraca)
    }))
    .filter((item) => Object.keys(item.nilai).length > 0);
}

function parseTopProdukInsights(
  raw: unknown
): DiplomasiExportProductInsightItem[] {
  if (!isRecord(raw)) return [];
  const data = isRecord(raw.data) ? raw.data : null;
  const candidates: unknown[] = [
    raw.top_produk,
    data?.top_produk,
    isRecord(data?.data) ? data.data.top_produk : null
  ];
  const list = candidates.find((value) => Array.isArray(value)) as
    | unknown[]
    | undefined;
  if (!list) return [];

  return list
    .filter(isRecord)
    .map((item) => ({
      hs:
        typeof item.kodeHS === "string" || typeof item.kodeHS === "number"
          ? String(item.kodeHS)
          : "-",
      name: typeof item.namaHS === "string" ? item.namaHS : "-",
      nilai: asNumberSeries(item.nilai),
      neraca: asNumberSeries(item.neraca),
      share: asNumberSeries(item.share),
      export: asNumberSeries(item.export),
      exportReverse: asNumberSeries(item.export_reverse),
      tujuanEkspor: parseCountryValueList(item.tujuan_ekspor),
      kompetitorGlobalTopTujuanEkspor: parseCountryValueList(
        item.kompetitor_global_top_tujuan_ekspor
      ),
      kompetitorAseanTopTujuanEkspor: parseCountryValueList(
        item.kompetitor_asean_top_tujuan_ekspor
      )
    }))
    .filter((item) => item.hs !== "-" && Object.keys(item.nilai).length > 0);
}

function hasIso2Field(row: Record<string, unknown>) {
  return Boolean(
    row.id_alpha2 ??
    row.kode_alpha2 ??
    row.alpha2 ??
    row.iso2 ??
    row.iso_a2 ??
    row.ISO_A2
  );
}

function toArray(value: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecord);
}

function extractMapData(raw: unknown): Array<Record<string, unknown>> {
  if (!isRecord(raw)) return [];

  const candidates = [
    raw.items,
    raw.rows,
    raw.data,
    isRecord(raw.data) ? raw.data.items : null,
    isRecord(raw.data) && isRecord(raw.data.data) ? raw.data.data.items : null,
    isRecord(raw.payload) ? raw.payload.items : null
  ];

  for (const candidate of candidates) {
    const arr = toArray(candidate);
    if (arr.some(hasIso2Field)) return arr;
  }

  const queue: unknown[] = Object.values(raw);
  while (queue.length > 0) {
    const current = queue.shift();
    const arr = toArray(current);
    if (arr.some(hasIso2Field)) return arr;
    if (isRecord(current)) queue.push(...Object.values(current));
  }

  return [];
}

function extractUnitLabel(raw: unknown) {
  if (!isRecord(raw)) return "Ribu US$";

  const read = (value: unknown) =>
    typeof value === "string" && value.trim() ? value.trim() : null;
  const data = isRecord(raw.data) ? raw.data : null;
  const meta = isRecord(raw.meta)
    ? raw.meta
    : data && isRecord(data.meta)
      ? data.meta
      : null;

  const candidates: unknown[] = [
    raw.unit,
    raw.unitLabel,
    raw.satuan,
    raw.satuan_nilai,
    raw.currency,
    data?.unit,
    data?.unitLabel,
    data?.satuan,
    data?.satuan_nilai,
    data?.currency,
    meta?.unit,
    meta?.unitLabel,
    meta?.satuan,
    meta?.satuan_nilai,
    meta?.currency
  ];

  for (const candidate of candidates) {
    const value = read(candidate);
    if (value) return value;
  }

  return "Ribu US$";
}

function extractMeta(raw: unknown) {
  if (!isRecord(raw)) return null;
  if (isRecord(raw.meta)) return raw.meta;
  if (isRecord(raw.data) && isRecord(raw.data.meta)) return raw.data.meta;
  return null;
}

function parseCompetitionInsightProducts(
  raw: unknown,
  fallbackYear: number | null
): DiplomasiExportProductInsightItem[] {
  const list = parseTopProdukInsights(raw);
  if (list.length > 0) return list;

  if (!isRecord(raw)) return [];
  const data = isRecord(raw.data) ? raw.data : null;
  const candidate =
    isRecord(data) && ("kodeHS" in data || "hs" in data)
      ? data
      : "kodeHS" in raw || "hs" in raw
        ? raw
        : null;
  if (!candidate || !isRecord(candidate)) return [];

  const hs =
    typeof candidate.kodeHS === "string" || typeof candidate.kodeHS === "number"
      ? String(candidate.kodeHS)
      : typeof candidate.hs === "string" || typeof candidate.hs === "number"
        ? String(candidate.hs)
        : "-";
  const tujuanEkspor = parseCountryValueList(candidate.tujuan_ekspor);
  const inferredValue =
    fallbackYear != null
      ? tujuanEkspor.reduce((sum, item) => sum + item.nilai, 0)
      : 0;

  return [
    {
      hs,
      name: typeof candidate.namaHS === "string" ? candidate.namaHS : "-",
      nilai: fallbackYear != null ? { [fallbackYear]: inferredValue } : {},
      neraca: fallbackYear != null ? { [fallbackYear]: inferredValue } : {},
      share: {},
      export: fallbackYear != null ? { [fallbackYear]: inferredValue } : {},
      exportReverse: {},
      tujuanEkspor,
      kompetitorGlobalTopTujuanEkspor: parseCountryValueList(
        candidate.kompetitor_global_top_tujuan_ekspor
      ),
      kompetitorAseanTopTujuanEkspor: parseCountryValueList(
        candidate.kompetitor_asean_top_tujuan_ekspor
      )
    }
  ].filter((item) => item.hs !== "-");
}

export function TotalEksporTab({
  overview,
  loading,
  error,
  periodLabel
}: DiplomasiTabPanelProps) {
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
  const lastSuccessCompetitionKeyRef = React.useRef<string>("");
  const hsProductsQuery = useDiplomasiHsProductQuery();
  const competitionInsightMutation =
    useDiplomasiTradeCompetitionInsightMutation();
  const { toast, dismiss } = useToast();

  const raw = overview?.raw ?? null;
  const unitLabel = React.useMemo(() => extractUnitLabel(raw), [raw]);
  const meta = React.useMemo(() => extractMeta(raw), [raw]);
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
  const competitionExcelSource = React.useMemo(
    () =>
      competitorSourceLabel && competitorSourceLabel !== sourceLabel
        ? `${sourceLabel ?? "-"} | Kompetitor: ${competitorSourceLabel}`
        : (sourceLabel ?? "-"),
    [competitorSourceLabel, sourceLabel]
  );

  const items = React.useMemo(() => parseItems(raw), [raw]);
  const topProducts = React.useMemo(() => parseTopProdukInsights(raw), [raw]);

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

  const latestYear = yearsAsc[yearsAsc.length - 1] ?? null;

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

  const totals = React.useMemo(
    () =>
      yearsAsc.map((year) =>
        items.reduce((sum, item) => sum + (item.nilai[year] ?? 0), 0)
      ),
    [items, yearsAsc]
  );

  const extrasByYear = React.useMemo(() => {
    const out: Record<number, { delta?: number }> = {};
    for (let index = 0; index < yearsAsc.length; index += 1) {
      if (index === 0) continue;
      const current = totals[index] ?? 0;
      const previous = totals[index - 1] ?? 0;
      if (previous !== 0)
        out[yearsAsc[index]] = {
          delta: ((current - previous) / previous) * 100
        };
    }
    return out;
  }, [totals, yearsAsc]);

  const timeSeries = React.useMemo(
    () => [{ label: "Nilai Ekspor", values: totals }],
    [totals]
  );

  const handleRegisterDownload = React.useCallback(
    (handler: (() => void) | null) => {
      if (!handler) {
        setDownloadHandler(null);
        return;
      }
      setDownloadHandler(() => handler);
    },
    []
  );

  const handleRegisterProdukDownload = React.useCallback(
    (handler: (() => void) | null) => {
      if (!handler) {
        setProdukDownloadHandler(null);
        return;
      }
      setProdukDownloadHandler(() => handler);
    },
    []
  );

  const handleRegisterCompetitionDownload = React.useCallback(
    (handler: (() => void) | null) => {
      if (!handler) {
        setCompetitionDownloadHandler(null);
        return;
      }
      setCompetitionDownloadHandler(() => handler);
    },
    []
  );

  const mapData = React.useMemo(() => extractMapData(raw), [raw]);
  const tableCaption = React.useMemo(
    () =>
      `${periodLabel} | Unit: ${unitLabel} | Nomor mengikuti urutan sorting pada kolom ${sortColumnLabel}`,
    [periodLabel, sortColumnLabel, unitLabel]
  );
  const produkTableCaption = React.useMemo(
    () =>
      `${periodLabel} | Unit: ${unitLabel} | Nomor mengikuti urutan sorting pada kolom ${produkSortColumnLabel}`,
    [periodLabel, produkSortColumnLabel, unitLabel]
  );

  const competitionToastKey = React.useMemo(
    () =>
      `${lastCompletedCompetitionHs ?? "-"}-${latestYear ?? "-"}-${competitionProducts.length}`,
    [competitionProducts.length, lastCompletedCompetitionHs, latestYear]
  );

  const handleSearchCompetition = React.useCallback(async () => {
    const hsCode = selectedHsDraft?.trim();
    if (!hsCode) {
      setCompetitionError("Pilih HS produk terlebih dahulu.");
      return;
    }
    if (!perdaganganSourceCode) {
      setCompetitionError(
        "Sumber perdagangan tidak tersedia untuk request insight."
      );
      return;
    }

    setCompetitionError(null);
    try {
      const response = await competitionInsightMutation.mutateAsync({
        hsCode,
        negara: "IDN",
        year: latestYear ?? undefined,
        sumber: [{ sektor: "perdagangan", sumber: perdaganganSourceCode }]
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
  }, [
    competitionInsightMutation,
    latestYear,
    perdaganganSourceCode,
    selectedHsDraft
  ]);

  React.useEffect(() => {
    if (hasAutoRequestedCompetition) return;
    if (!topProducts.length) return;
    if (!selectedHsDraft) return;
    if (competitionInsightMutation.isPending) return;

    void handleSearchCompetition();
  }, [
    competitionInsightMutation.isPending,
    handleSearchCompetition,
    hasAutoRequestedCompetition,
    selectedHsDraft,
    topProducts.length
  ]);

  React.useEffect(() => {
    if (competitionInsightMutation.isPending) {
      if (loadingCompetitionToastIdRef.current) return;
      loadingCompetitionToastIdRef.current = toast({
        title: "Sedang tarik data insight kompetitor",
        description: "Peta persaingan produk ekspor sedang diproses...",
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

  const showLoadingLayout = loading || (!error && !overview);
  const shouldShowEmptyFallback =
    !showLoadingLayout && yearsAsc.length === 0 && topProducts.length === 0;

  return (
    <div className="space-y-4">
      <Modal
        open={Boolean(modalProduct)}
        onClose={() => setModalProduct(null)}
        title="Peta Persaingan Produk Ekspor INDONESIA"
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
          title="Peta Persaingan Produk Ekspor INDONESIA"
          products={modalProduct ? [modalProduct] : []}
          productOptions={
            modalProduct
              ? [
                  {
                    value: modalProduct.hs,
                    label: `HS ${modalProduct.hs} - ${modalProduct.name}`
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
          emptyMessage="Detail tujuan ekspor belum tersedia."
          showHeader={false}
          showProductSelect={false}
        />
      </Modal>

      {showLoadingLayout ? (
        <>
          <section className="space-y-4">
            <div className="grid items-stretch gap-4 xl:grid-cols-[1.8fr_1fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="font-semibold tracking-tight text-slate-900">
                  Peta Nilai Ekspor Indonesia
                </h3>
                <p className="text-xs text-slate-500">Memuat data peta...</p>
                <div className="mt-4">
                  <MapSkeleton />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="font-semibold tracking-tight text-slate-900">
                  Top Mitra Nilai Ekspor Indonesia
                </h3>
                <p className="text-xs text-slate-500">Memuat data tabel...</p>
                <div className="mt-4">
                  <TableSkeleton rows={8} />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-[1.8fr_1fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="font-semibold tracking-tight text-slate-900">
                  Time Series Nilai Ekspor Indonesia
                </h3>
                <p className="text-xs text-slate-500">
                  Memuat visualisasi tren...
                </p>
                <div className="mt-4">
                  <ChartSkeleton />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="font-semibold tracking-tight text-slate-900">
                  Top Produk Nilai Ekspor Indonesia
                </h3>
                <p className="text-xs text-slate-500">Memuat data tabel...</p>
                <div className="mt-4">
                  <TableSkeleton rows={8} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="font-semibold tracking-tight text-slate-900">
                Peta Persaingan Produk Ekspor Indonesia
              </h3>
              <p className="text-xs text-slate-500">
                Memuat detail persaingan produk...
              </p>
              <div className="mt-4">
                <TradeCompetitionInsight
                  title="Peta Persaingan Produk Ekspor Indonesia"
                  products={[]}
                  productOptions={[]}
                  selectedHs={null}
                  onSelectHs={() => {}}
                  latestYear={null}
                  unitLabel="Ribu US$"
                  loading
                  showHeader={false}
                  showProductSelect={false}
                  titlePrefixPrimary="Tujuan Ekspor INDONESIA"
                  titlePrefixGlobal="Tujuan Ekspor Utama ke"
                  titlePrefixAsean="Tujuan Ekspor ASEAN ke"
                />
              </div>
            </div>
          </section>
        </>
      ) : error ? (
        <FilterFallbackCard
          title="Bagian lanjutan belum tersedia"
          body={error}
        />
      ) : shouldShowEmptyFallback ? (
        <FilterFallbackCard
          title="Bagian lanjutan belum tersedia"
          body="Data total ekspor belum tersedia untuk filter aktif."
        />
      ) : (
        <>
          <section className="space-y-4">
            {overview?.metrics.length ? (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {overview.metrics.slice(0, 4).map((metric) => (
                  <div
                    key={metric.key}
                    className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                  >
                    <p className="text-xs text-slate-500">{metric.label}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="grid items-stretch gap-4 xl:grid-cols-[1.8fr_1fr]">
              <ExpandableCard
                title="Peta Nilai Ekspor Indonesia"
                subtitle={`${periodLabel} | Unit: ${unitLabel}`}
                className="min-w-0 h-full"
                expandLabel="Perbesar peta"
                modalSize="full"
                expandedContent={
                  <MapHeatLayer
                    key={`total-ekspor-map-expanded-${periodLabel}`}
                    className="h-[72vh] w-full"
                    data={mapData}
                    title="Peta Nilai Ekspor Indonesia"
                    unitLabel={unitLabel}
                    currencyPrefix={unitLabel}
                    geojsonUrl="/assets/world-countries.geojson"
                    hideBalance={false}
                    seriesAccessors={{
                      value: "nilai_perdagangan",
                      balance: "neraca",
                      proportion: "proporsi",
                      proportion_balance: "proporsi_neraca"
                    }}
                    customBuckets={[...NILAI_PERDAGANGAN_MAP_BUCKETS]}
                    noDataColor="#f1f5f9"
                  />
                }
              >
                <div className="flex h-full flex-col">
                  <MapHeatLayer
                    key={`total-ekspor-map-${periodLabel}`}
                    className="h-56 w-full sm:h-72 lg:h-120"
                    data={mapData}
                    title="Peta Nilai Ekspor Indonesia"
                    unitLabel={unitLabel}
                    currencyPrefix={unitLabel}
                    geojsonUrl="/assets/world-countries.geojson"
                    hideBalance={false}
                    seriesAccessors={{
                      value: "nilai_perdagangan",
                      balance: "neraca",
                      proportion: "proporsi",
                      proportion_balance: "proporsi_neraca"
                    }}
                    customBuckets={[...NILAI_PERDAGANGAN_MAP_BUCKETS]}
                    noDataColor="#f1f5f9"
                  />
                  {sourceLabel ? (
                    <p className="mt-auto text-right text-[11px] text-slate-500">
                      Sumber: {sourceLabel}
                    </p>
                  ) : null}
                </div>
              </ExpandableCard>

              <ExpandableCard
                title="Top Mitra Nilai Ekspor Indonesia"
                subtitle={tableCaption}
                actions={
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
                }
                className="min-w-0 h-full min-h-115"
                contentClassName="flex h-full flex-col"
                expandLabel="Perbesar tabel"
                modalSize="full"
                expandedContent={
                  <TopMitraTable
                    raw={raw}
                    unitLabel={unitLabel}
                    expanded
                    onSortColumnChange={setSortColumnLabel}
                    onRegisterDownload={handleRegisterDownload}
                    downloadTitle="Top Mitra Nilai Ekspor Indonesia"
                    downloadFilename={`Top_Mitra_Nilai_Ekspor_Indonesia_${periodLabel.replace(/\s+/g, "_")}`}
                    downloadSource={sourceLabel ?? undefined}
                    emptyMessage="Data top mitra ekspor belum tersedia."
                  />
                }
              >
                <div className="flex h-full flex-col">
                  <div className="min-h-0 flex-1">
                    <TopMitraTable
                      raw={raw}
                      unitLabel={unitLabel}
                      onSortColumnChange={setSortColumnLabel}
                      onRegisterDownload={handleRegisterDownload}
                      downloadTitle="Top Mitra Nilai Ekspor Indonesia"
                      downloadFilename={`Top_Mitra_Nilai_Ekspor_Indonesia_${periodLabel.replace(/\s+/g, "_")}`}
                      downloadSource={sourceLabel ?? undefined}
                      emptyMessage="Data top mitra ekspor belum tersedia."
                    />
                  </div>
                  {sourceLabel ? (
                    <p className="mt-auto text-right text-[11px] text-slate-500">
                      Sumber: {sourceLabel}
                    </p>
                  ) : null}
                </div>
              </ExpandableCard>
            </div>
          </section>

          <section className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-[1.8fr_1fr]">
              <ExpandableCard
                title="Time Series Nilai Ekspor Indonesia"
                subtitle={`${periodLabel} | Unit: ${unitLabel}`}
                className="min-w-0 min-h-144"
                modalSize="full"
                expandedContent={
                  <MultiLineTrendChart
                    key={`total-ekspor-ts-expanded-${periodLabel}-${yearsAsc.join("-")}`}
                    series={timeSeries}
                    years={yearsAsc}
                    unit={unitLabel}
                    extrasByYear={extrasByYear}
                    height={720}
                  />
                }
                contentClassName="flex h-full flex-col gap-3"
              >
                <div className="h-130">
                  <MultiLineTrendChart
                    key={`total-ekspor-ts-${periodLabel}-${yearsAsc.join("-")}`}
                    series={timeSeries}
                    years={yearsAsc}
                    unit={unitLabel}
                    extrasByYear={extrasByYear}
                    height={520}
                  />
                </div>
                {sourceLabel ? (
                  <p className="mt-auto text-right text-[11px] text-slate-500">
                    Sumber: {sourceLabel}
                  </p>
                ) : null}
              </ExpandableCard>

              <ExpandableCard
                title="Top Produk Nilai Ekspor Indonesia"
                subtitle={produkTableCaption}
                className="min-w-0 min-h-144"
                modalSize="full"
                contentClassName="flex h-full flex-col gap-3"
                actions={
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
                }
                expandedContent={
                  <TopProdukTable
                    raw={raw}
                    unitLabel={unitLabel}
                    expanded
                    onRegisterDownload={handleRegisterProdukDownload}
                    onSortColumnChange={setProdukSortColumnLabel}
                    downloadTitle="Top Produk Nilai Ekspor Indonesia"
                    downloadFilename={`Top_Produk_Nilai_Ekspor_Indonesia_${periodLabel.replace(/\s+/g, "_")}`}
                    downloadSource={competitionExcelSource}
                    downloadVariant="ekspor"
                    emptyMessage="Data top produk ekspor belum tersedia."
                    onHsClick={(item: TopProdukItem) => {
                      const product =
                        topProducts.find((entry) => entry.hs === item.hs) ??
                        null;
                      setModalProduct(product);
                    }}
                  />
                }
              >
                <div className="h-130">
                  <TopProdukTable
                    raw={raw}
                    unitLabel={unitLabel}
                    onRegisterDownload={handleRegisterProdukDownload}
                    onSortColumnChange={setProdukSortColumnLabel}
                    downloadTitle="Top Produk Nilai Ekspor Indonesia"
                    downloadFilename={`Top_Produk_Nilai_Ekspor_Indonesia_${periodLabel.replace(/\s+/g, "_")}`}
                    downloadSource={competitionExcelSource}
                    downloadVariant="ekspor"
                    emptyMessage="Data top produk ekspor belum tersedia."
                    onHsClick={(item: TopProdukItem) => {
                      const product =
                        topProducts.find((entry) => entry.hs === item.hs) ??
                        null;
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
            </div>

            <ExpandableCard
              title="Peta Persaingan Produk Ekspor Indonesia"
              subtitle={`${periodLabel} | Unit: ${unitLabel}`}
              className="min-w-0"
              modalSize="full"
              actions={
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
              }
              expandedContent={
                <TradeCompetitionInsight
                  title="Peta Persaingan Produk Ekspor Indonesia"
                  products={competitionProducts}
                  productOptions={hsProductsQuery.data ?? []}
                  selectedHs={selectedHsDraft}
                  onSelectHs={setSelectedHsDraft}
                  latestYear={latestYear}
                  unitLabel={unitLabel}
                  sourceLabel={sourceLabel}
                  competitorSourceLabel={competitorSourceLabel}
                  hsLoading={hsProductsQuery.isLoading}
                  showSearchButton
                  onSearch={handleSearchCompetition}
                  searchLoading={competitionInsightMutation.isPending}
                  searchDisabled={!selectedHsDraft || hsProductsQuery.isLoading}
                  errorMessage={competitionError}
                  emptyMessage="Data persaingan produk ekspor belum tersedia."
                  showHeader={false}
                  onRegisterDownload={handleRegisterCompetitionDownload}
                />
              }
            >
              <TradeCompetitionInsight
                title="Peta Persaingan Produk Ekspor Indonesia"
                products={competitionProducts}
                productOptions={hsProductsQuery.data ?? []}
                selectedHs={selectedHsDraft}
                onSelectHs={setSelectedHsDraft}
                latestYear={latestYear}
                unitLabel={unitLabel}
                sourceLabel={sourceLabel}
                competitorSourceLabel={competitorSourceLabel}
                hsLoading={hsProductsQuery.isLoading}
                showSearchButton
                onSearch={handleSearchCompetition}
                searchLoading={competitionInsightMutation.isPending}
                searchDisabled={!selectedHsDraft || hsProductsQuery.isLoading}
                errorMessage={competitionError}
                emptyMessage="Data persaingan produk ekspor belum tersedia."
                showHeader={false}
                onRegisterDownload={handleRegisterCompetitionDownload}
              />
            </ExpandableCard>
          </section>
        </>
      )}
    </div>
  );
}
