import React from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowsUpDownIcon,
  ChartPieIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { EmptyStatePanel } from "@/components/ui/EmptyStatePanel";
import { DataLimitSelect } from "@/components/ui/Form/DataLimitSelect";
import { Input } from "@/components/ui/Form/Input";
import { HoverInfoTooltip } from "@/components/ui/HoverInfoTooltip";
import type {
  SortDirection,
  TopProdukItem,
  TopProdukTableProps
} from "@/type/indonesiaDiplomasi";
import { downloadTableAsExcel } from "@/utils/downloadAsExcel";
import { cn } from "@/utils/cn";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asNumberRecord(value: unknown) {
  if (!isRecord(value)) return {} as Record<number, number>;
  const out: Record<number, number> = {};
  for (const [key, raw] of Object.entries(value)) {
    const year = Number(key);
    const num = Number(raw);
    if (Number.isFinite(year) && Number.isFinite(num)) out[year] = num;
  }
  return out;
}

function toCountryValueList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecord).map((entry, index) => ({
    rank: typeof entry.rank === "number" ? entry.rank : index + 1,
    alpha2: typeof entry.kode_alpha2 === "string" ? entry.kode_alpha2 : null,
    alpha3: typeof entry.kode_alpha3 === "string" ? entry.kode_alpha3 : null,
    country:
      (typeof entry.negara === "string" && entry.negara.trim()) ||
      (typeof entry.country === "string" && entry.country.trim()) ||
      "-",
    nilai: Number(entry.nilai ?? 0),
    share:
      entry.share_pct == null
        ? null
        : Number.isFinite(Number(entry.share_pct))
          ? Number(entry.share_pct)
          : null,
    rankGlobal:
      entry.rank_global == null
        ? null
        : Number.isFinite(Number(entry.rank_global))
          ? Number(entry.rank_global)
          : null
  }));
}

function parseTopProduk(raw: unknown): TopProdukItem[] {
  if (!isRecord(raw)) return [];
  const data = isRecord(raw.data) ? raw.data : {};
  const candidates: unknown[] = [
    data.top_produk,
    raw.top_produk,
    isRecord(data.data) ? data.data.top_produk : null
  ];
  const list = candidates.find((value) => Array.isArray(value)) as
    | unknown[]
    | undefined;
  if (!list) return [];

  return list
    .filter(isRecord)
    .map((item) => {
      const tujuanRaw = Array.isArray(item.tujuan_impor)
        ? item.tujuan_impor
        : Array.isArray(item.tujuan_ekspor)
          ? item.tujuan_ekspor
          : [];
      const kompetitorGlobalRaw = Array.isArray(
        item.kompetitor_global_top_tujuan_impor
      )
        ? item.kompetitor_global_top_tujuan_impor
        : Array.isArray(item.kompetitor_global_top_tujuan_ekspor)
          ? item.kompetitor_global_top_tujuan_ekspor
          : [];
      const kompetitorAseanRaw = Array.isArray(
        item.kompetitor_asean_top_tujuan_impor
      )
        ? item.kompetitor_asean_top_tujuan_impor
        : Array.isArray(item.kompetitor_asean_top_tujuan_ekspor)
          ? item.kompetitor_asean_top_tujuan_ekspor
          : [];

      return {
        hs:
          typeof item.kodeHS === "string" || typeof item.kodeHS === "number"
            ? String(item.kodeHS)
            : "-",
        name: typeof item.namaHS === "string" ? item.namaHS : "-",
        strategi:
          typeof item.strategi === "string" && item.strategi.trim()
            ? item.strategi
            : null,
        rcaAsal:
          item.rcaAsal == null
            ? null
            : Number.isFinite(Number(item.rcaAsal))
              ? Number(item.rcaAsal)
              : null,
        cmsaAsal:
          item.cmsaAsal == null
            ? null
            : Number.isFinite(Number(item.cmsaAsal))
              ? Number(item.cmsaAsal)
              : null,
        classAsal:
          typeof item.classAsal === "string" && item.classAsal.trim()
            ? item.classAsal
            : null,
        rcaTujuan:
          item.rcaTujuan == null
            ? null
            : Number.isFinite(Number(item.rcaTujuan))
              ? Number(item.rcaTujuan)
              : null,
        cmsaTujuan:
          item.cmsaTujuan == null
            ? null
            : Number.isFinite(Number(item.cmsaTujuan))
              ? Number(item.cmsaTujuan)
              : null,
        classTujuan:
          typeof item.classTujuan === "string" && item.classTujuan.trim()
            ? item.classTujuan
            : null,
        asalWorld:
          item.asalWorld == null
            ? null
            : Number.isFinite(Number(item.asalWorld))
              ? Number(item.asalWorld)
              : null,
        tujuanWorld:
          item.tujuanWorld == null
            ? null
            : Number.isFinite(Number(item.tujuanWorld))
              ? Number(item.tujuanWorld)
              : null,
        nilai: asNumberRecord(item.nilai ?? item.import ?? item.impor),
        neraca: asNumberRecord(item.neraca),
        export: asNumberRecord(item.export),
        import: asNumberRecord(item.import ?? item.impor),
        exportReverse: asNumberRecord(item.export_reverse),
        importReverse: asNumberRecord(item.import_reverse),
        share: asNumberRecord(item.share),
        tujuanEkspor: toCountryValueList(tujuanRaw),
        tujuanImpor: toCountryValueList(item.tujuan_impor),
        kompetitorGlobalTopTujuanEkspor:
          toCountryValueList(kompetitorGlobalRaw),
        kompetitorGlobalTopTujuanImpor: toCountryValueList(
          item.kompetitor_global_top_tujuan_impor
        ),
        kompetitorAseanTopTujuanEkspor: toCountryValueList(kompetitorAseanRaw),
        kompetitorAseanTopTujuanImpor: toCountryValueList(
          item.kompetitor_asean_top_tujuan_impor
        ),
        cagr:
          item.growth_cagr_pct == null
            ? null
            : Number.isFinite(Number(item.growth_cagr_pct))
              ? Number(item.growth_cagr_pct)
              : null
      };
    })
    .filter((item) => Object.keys(item.nilai).length > 0);
}

function formatNumber(value: number) {
  return value.toLocaleString("id-ID", { maximumFractionDigits: 0 });
}

function formatSignedNumber(value: number) {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${formatNumber(Math.abs(value))}`;
}

function formatPercent(value: number, digits = 2) {
  return `${value.toFixed(digits)}%`;
}

function toDelta(current: number, previous: number | null) {
  if (previous == null || previous === 0) return null;
  const delta = ((current - previous) / Math.abs(previous)) * 100;
  return Number.isFinite(delta) ? delta : null;
}

function getInvoiceInfo(
  row: TopProdukItem,
  year: number,
  mode: "ekspor" | "impor" | null
) {
  if (!mode) return null;

  const reverse =
    mode === "ekspor"
      ? Number(row.exportReverse?.[year] ?? 0)
      : Number(row.importReverse?.[year] ?? 0);
  const current =
    mode === "ekspor"
      ? Number(row.export?.[year] ?? row.nilai[year] ?? 0)
      : Number(row.import?.[year] ?? row.nilai[year] ?? 0);

  if (
    !Number.isFinite(reverse) ||
    !Number.isFinite(current) ||
    reverse <= 0 ||
    current <= 0
  )
    return null;

  const signedDiff = reverse - current;
  const pct = Math.abs(signedDiff) / reverse;

  if (pct >= 0.4) {
    return {
      type: signedDiff > 0 ? ("under" as const) : ("over" as const),
      diff: Math.abs(signedDiff),
      pct,
      reverse,
      current
    };
  }

  return null;
}

export function TopProdukTable({
  raw,
  unitLabel,
  expanded = false,
  onRegisterDownload,
  onSortColumnChange,
  downloadTitle = "Top Produk Nilai Perdagangan Indonesia",
  downloadFilename = "Top_Produk_Nilai_Perdagangan_Indonesia",
  downloadSource,
  downloadNotes,
  downloadVariant = "default",
  emptyMessage = "Data top produk belum tersedia.",
  onHsClick,
  valueLabel = "Nilai",
  shareLabel = "Pangsa Pasar",
  shareContextLabel = "pangsa dari total produk",
  totalLabel = "Total produk",
  changeLabel = "Perubahan YoY",
  invoiceMode = null,
  invoiceHighlightTone = "split",
  columnMode = "default",
  showShareBadge = true,
  showDeltaBadge = true,
  showLimitControl = true,
  shareTotalValue = null,
  enableRowHoverTooltip = false,
  showCode = true,
  defaultLimit = "10",
  fitHeightToContainer = false,
  tableViewportClassName,
  limitOptions,
  columnInfoByKey,
  onCompetitorClick
}: TopProdukTableProps) {
  const [limit, setLimit] = React.useState(
    showLimitControl ? defaultLimit : "ALL"
  );
  const [query, setQuery] = React.useState("");
  const [sortKey, setSortKey] = React.useState<string>(
    columnMode === "potensi_calc" ? "strategi" : "produk"
  );
  const [direction, setDirection] = React.useState<SortDirection>("desc");

  const items = React.useMemo(() => parseTopProduk(raw), [raw]);

  const years = React.useMemo(() => {
    const all = new Set<number>();
    for (const item of items) {
      for (const key of Object.keys(item.nilai)) {
        const value = Number(key);
        if (Number.isFinite(value)) all.add(value);
      }
    }
    return Array.from(all).sort((a, b) => b - a);
  }, [items]);

  const latestYear = years[0] ?? null;
  const prevYear = years[1] ?? null;

  const totalsByYear = React.useMemo(() => {
    const out: Record<number, number> = {};
    for (const year of years) {
      out[year] = items.reduce((sum, item) => sum + (item.nilai[year] ?? 0), 0);
    }
    return out;
  }, [items, years]);

  React.useEffect(() => {
    if (!latestYear) return;
    if (columnMode === "potensi_calc") return;
    setSortKey((prev) =>
      prev.startsWith("year-") ? prev : `year-${latestYear}`
    );
  }, [columnMode, latestYear]);

  React.useEffect(() => {
    setLimit(showLimitControl ? defaultLimit : "ALL");
  }, [defaultLimit, showLimitControl]);

  const filteredRows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) || item.hs.toLowerCase().includes(q)
    );
  }, [items, query]);

  const getCompetitorList = React.useCallback(
    (item: TopProdukItem, group: "asean" | "global") =>
      group === "asean"
        ? (item.kompetitorAseanTopTujuanEkspor ?? [])
        : (item.kompetitorGlobalTopTujuanEkspor ?? []),
    []
  );

  const sortedRows = React.useMemo(() => {
    const next = [...filteredRows];
    next.sort((a, b) => {
      if (sortKey === "produk") {
        const compared = `${a.hs} ${a.name}`.localeCompare(
          `${b.hs} ${b.name}`,
          "id-ID",
          {
            sensitivity: "base",
            numeric: true
          }
        );
        return direction === "asc" ? compared : -compared;
      }

      if (sortKey === "cagr") {
        const left = a.cagr ?? Number.NEGATIVE_INFINITY;
        const right = b.cagr ?? Number.NEGATIVE_INFINITY;
        return direction === "asc" ? left - right : right - left;
      }

      if (sortKey === "strategi") {
        const compared = (a.strategi ?? "").localeCompare(
          b.strategi ?? "",
          "id-ID",
          {
            sensitivity: "base",
            numeric: true
          }
        );
        return direction === "asc" ? compared : -compared;
      }

      if (
        sortKey === "rcaAsal" ||
        sortKey === "cmsaAsal" ||
        sortKey === "rcaTujuan" ||
        sortKey === "cmsaTujuan" ||
        sortKey === "asalWorld" ||
        sortKey === "tujuanWorld"
      ) {
        const left = Number(a[sortKey] ?? Number.NEGATIVE_INFINITY);
        const right = Number(b[sortKey] ?? Number.NEGATIVE_INFINITY);
        return direction === "asc" ? left - right : right - left;
      }

      if (sortKey === "classAsal" || sortKey === "classTujuan") {
        const compared = String(a[sortKey] ?? "").localeCompare(
          String(b[sortKey] ?? ""),
          "id-ID",
          {
            sensitivity: "base",
            numeric: true
          }
        );
        return direction === "asc" ? compared : -compared;
      }

      if (sortKey === "kompetitor-asean" || sortKey === "kompetitor-global") {
        const group = sortKey === "kompetitor-asean" ? "asean" : "global";
        const left = getCompetitorList(a, group)[0]?.nilai ?? 0;
        const right = getCompetitorList(b, group)[0]?.nilai ?? 0;
        return direction === "asc" ? left - right : right - left;
      }

      const year = Number(sortKey.replace("year-", ""));
      const left = a.nilai[year] ?? 0;
      const right = b.nilai[year] ?? 0;
      return direction === "asc" ? left - right : right - left;
    });
    return next;
  }, [direction, filteredRows, getCompetitorList, sortKey]);

  const visibleRows = React.useMemo(() => {
    if (limit === "ALL") return sortedRows;
    const n = Number(limit);
    return !Number.isFinite(n) || n <= 0
      ? sortedRows.slice(0, 10)
      : sortedRows.slice(0, n);
  }, [limit, sortedRows]);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setDirection("desc");
  };

  const sortIcon = (key: string) => {
    if (sortKey !== key)
      return <ArrowsUpDownIcon className="h-3 w-3 text-slate-400" />;
    return direction === "asc" ? (
      <ArrowUpIcon className="h-3 w-3 text-slate-700" />
    ) : (
      <ArrowDownIcon className="h-3 w-3 text-slate-700" />
    );
  };

  const sortColumnLabel = React.useMemo(() => {
    if (sortKey === "produk") {
      if (columnMode === "analysis_export") return "HS Produk";
      return showCode ? "Produk (HS)" : "Produk";
    }
    if (sortKey === "strategi") return "Strategi";
    if (sortKey === "rcaAsal") return "RCA (Asal)";
    if (sortKey === "cmsaAsal") return "CMSA (Asal)";
    if (sortKey === "classAsal") return "Class (Asal)";
    if (sortKey === "rcaTujuan") return "RCA (Tujuan)";
    if (sortKey === "cmsaTujuan") return "CMSA (Tujuan)";
    if (sortKey === "classTujuan") return "Class (Tujuan)";
    if (sortKey === "asalWorld") return "Asal ke Dunia";
    if (sortKey === "tujuanWorld") return "Tujuan ke Dunia";
    if (sortKey === "cagr") return "CAGR %";
    if (sortKey === "kompetitor-asean") return "Kompetitor ASEAN";
    if (sortKey === "kompetitor-global") return "Kompetitor Global";
    return sortKey.replace("year-", "");
  }, [columnMode, showCode, sortKey]);

  React.useEffect(() => {
    onSortColumnChange?.(sortColumnLabel);
  }, [onSortColumnChange, sortColumnLabel]);

  const handleDownloadExcel = React.useCallback(() => {
    if (columnMode === "trade_pair" && latestYear != null) {
      const exportNotes = [
        "Nilai sebaliknya = nilai mirror berdasarkan laporan negara mitra untuk komoditas yang sama.",
        "Under invoicing diindikasikan bila nilai sebaliknya >= 40% lebih tinggi; over invoicing kebalikannya."
      ];
      const defaultTradePairTitle =
        invoiceMode === "impor" ? "Top Produk Impor" : "Top Produk Ekspor";
      const tradePairTitle = downloadTitle || defaultTradePairTitle;
      const tradePairFilename =
        invoiceMode === "impor"
          ? `top-produk-impor-${latestYear}`
          : `top-produk-ekspor-${latestYear}`;
      const tradePairSheetName =
        invoiceMode === "impor" ? "Top Produk Impor" : "Top Produk Ekspor";

      downloadTableAsExcel({
        title: tradePairTitle,
        subtitle: `${latestYear ? `Tahun ${latestYear}` : "Tahun terakhir"} - Top berdasarkan nilai; data yang dihasilkan terdapat anomali (diskrepansi > 40%)`,
        source: downloadSource,
        notes: downloadNotes?.length
          ? [...exportNotes, ...downloadNotes]
          : exportNotes,
        columns: [
          {
            key: "no",
            label: "No",
            selector: (_row: TopProdukItem, index: number) => index + 1,
            numeric: true
          },
          {
            key: "produk",
            label: "Kode HS",
            selector: (row: TopProdukItem) => row.hs
          },
          {
            key: "label",
            label: "Produk",
            selector: (row: TopProdukItem) => row.name
          },
          {
            key: "nilai",
            label: `Nilai (${unitLabel})`,
            selector: (row: TopProdukItem) => row.nilai[latestYear] ?? 0,
            numeric: true
          },
          {
            key: "nilai_reverse",
            label: `Nilai Sebaliknya (${unitLabel})`,
            selector: (row: TopProdukItem) =>
              invoiceMode === "ekspor"
                ? (row.exportReverse?.[latestYear] ?? 0)
                : (row.importReverse?.[latestYear] ?? 0),
            numeric: true
          },
          {
            key: "selisih",
            label: `Selisih (${unitLabel})`,
            selector: (row: TopProdukItem) =>
              Math.abs(
                (invoiceMode === "ekspor"
                  ? (row.exportReverse?.[latestYear] ?? 0)
                  : (row.importReverse?.[latestYear] ?? 0)) -
                  (row.nilai[latestYear] ?? 0)
              ),
            numeric: true
          },
          {
            key: "pct_diff",
            label: "Selisih (%)",
            selector: (row: TopProdukItem) => {
              const invoiceInfo = getInvoiceInfo(row, latestYear, invoiceMode);
              return invoiceInfo?.pct != null
                ? Number((invoiceInfo.pct * 100).toFixed(2))
                : "";
            }
          },
          {
            key: "invoice_status",
            label: "Indikasi Invoice",
            selector: (row: TopProdukItem) => {
              const invoiceInfo = getInvoiceInfo(row, latestYear, invoiceMode);
              return invoiceInfo?.type === "under"
                ? "Under Invoice"
                : invoiceInfo?.type === "over"
                  ? "Over Invoice"
                  : "Normal";
            }
          }
        ],
        rows: visibleRows,
        filename: tradePairFilename,
        sheetName: tradePairSheetName
      });
      return;
    }

    if (
      (downloadVariant === "ekspor" || downloadVariant === "impor") &&
      latestYear != null
    ) {
      const formatList = (items: NonNullable<TopProdukItem["tujuanEkspor"]>) =>
        (items ?? [])
          .map((entry, index) => `${entry.rank ?? index + 1}) ${entry.country}`)
          .join(", ");
      const getIndonesiaRank = (
        items: NonNullable<TopProdukItem["kompetitorGlobalTopTujuanEkspor"]>
      ) => {
        const rank = (items ?? []).find((entry) => {
          const alpha2 = entry.alpha2?.toUpperCase() ?? "";
          const alpha3 = entry.alpha3?.toUpperCase() ?? "";
          const country = entry.country.toUpperCase();
          return (
            alpha2 === "ID" || alpha3 === "IDN" || country.includes("INDONESIA")
          );
        });
        return rank?.rank ?? "-";
      };
      const yearNowLabel = String(latestYear);
      const yearPrevLabel = String(prevYear ?? "-");
      const destinationLabel =
        downloadVariant === "impor"
          ? `Asal Impor ${latestYear}`
          : `Tujuan Ekspor ${latestYear}`;

      downloadTableAsExcel({
        title: downloadTitle,
        subtitle: `Tahun ${latestYear} - Unit: ${unitLabel}`,
        source: downloadSource,
        notes: downloadNotes,
        columns: [
          {
            key: "rank",
            label: "Rank",
            selector: (_row: TopProdukItem, index: number) => index + 1,
            numeric: true
          },
          {
            key: "produk",
            label: "Produk (HS)",
            selector: (row: TopProdukItem) => `${row.hs} - ${row.name}`
          },
          {
            key: "tujuan",
            label: destinationLabel,
            selector: (row: TopProdukItem) => formatList(row.tujuanEkspor ?? [])
          },
          {
            key: "tujuan_posisi_indonesia",
            label: `Posisi Indonesia (Tujuan) ${latestYear}`,
            selector: (row: TopProdukItem) =>
              String(getIndonesiaRank(row.tujuanEkspor ?? []))
          },
          {
            key: "nilai_now",
            label: `${yearNowLabel} (${unitLabel})`,
            selector: (row: TopProdukItem) => row.nilai[latestYear] ?? 0,
            numeric: true
          },
          {
            key: "nilai_prev",
            label: `${yearPrevLabel} (${unitLabel})`,
            selector: (row: TopProdukItem) =>
              prevYear != null ? (row.nilai[prevYear] ?? 0) : 0,
            numeric: true
          },
          {
            key: "share",
            label: `Share ${latestYear} (%)`,
            selector: (row: TopProdukItem) =>
              formatPercent(row.share?.[latestYear] ?? 0)
          },
          {
            key: "perubahan",
            label: "Δ (%) (YoY)",
            selector: (row: TopProdukItem) => {
              const prev =
                prevYear != null ? (row.nilai[prevYear] ?? null) : null;
              const delta = toDelta(row.nilai[latestYear] ?? 0, prev);
              return delta == null ? "-" : formatPercent(delta);
            }
          },
          {
            key: "kompetitor_global",
            label: `Kompetitor Global ${latestYear}`,
            selector: (row: TopProdukItem) =>
              formatList(row.kompetitorGlobalTopTujuanEkspor ?? [])
          },
          {
            key: "rank_id_global",
            label: `Posisi Indonesia (Global) ${latestYear}`,
            selector: (row: TopProdukItem) =>
              String(
                getIndonesiaRank(row.kompetitorGlobalTopTujuanEkspor ?? [])
              )
          },
          {
            key: "kompetitor_asean",
            label: `Kompetitor ASEAN ${latestYear}`,
            selector: (row: TopProdukItem) =>
              formatList(row.kompetitorAseanTopTujuanEkspor ?? [])
          },
          {
            key: "rank_id_asean",
            label: `Posisi Indonesia (ASEAN) ${latestYear}`,
            selector: (row: TopProdukItem) =>
              String(getIndonesiaRank(row.kompetitorAseanTopTujuanEkspor ?? []))
          }
        ],
        rows: visibleRows,
        filename: downloadFilename,
        sheetName: "Top Produk"
      });
      return;
    }

    if (columnMode === "analysis_export") {
      const formatCompetitorList = (
        items: NonNullable<TopProdukItem["kompetitorAseanTopTujuanEkspor"]>
      ) =>
        (items ?? [])
          .map((entry, index) => {
            const rank = entry.rank ?? index + 1;
            const share =
              entry.share != null ? formatPercent(entry.share) : "-";
            return `${rank}) ${entry.country} (${share})`;
          })
          .join("; ");

      const exportColumns = years
        .slice()
        .reverse()
        .map((year) => ({
          key: `exp_${year}`,
          label: `Ekspor ${year} (${unitLabel})`,
          selector: (row: TopProdukItem) => row.nilai[year] ?? 0,
          numeric: true
        }));

      downloadTableAsExcel({
        title: downloadTitle,
        subtitle: `Tahun ${years[years.length - 1] ?? "-"}-${years[0] ?? "-"} | Unit: ${unitLabel}`,
        source: downloadSource,
        notes: downloadNotes,
        columns: [
          {
            key: "no",
            label: "No",
            selector: (_row: TopProdukItem, index: number) => index + 1,
            numeric: true
          },
          {
            key: "hs",
            label: "HS Produk",
            selector: (row: TopProdukItem) => row.hs
          },
          {
            key: "produk",
            label: "Produk",
            selector: (row: TopProdukItem) => row.name
          },
          ...exportColumns,
          {
            key: "cagr",
            label: "CAGR %",
            selector: (row: TopProdukItem) =>
              row.cagr == null ? "N/A" : formatPercent(row.cagr)
          },
          {
            key: "asean",
            label: "Kompetitor ASEAN",
            selector: (row: TopProdukItem) =>
              row.kompetitorAseanTopTujuanEkspor?.length
                ? formatCompetitorList(row.kompetitorAseanTopTujuanEkspor)
                : "-"
          },
          {
            key: "global",
            label: "Kompetitor Global",
            selector: (row: TopProdukItem) =>
              row.kompetitorGlobalTopTujuanEkspor?.length
                ? formatCompetitorList(row.kompetitorGlobalTopTujuanEkspor)
                : "-"
          }
        ],
        rows: visibleRows,
        filename: downloadFilename,
        sheetName: "Komoditas Ekspor Utama"
      });
      return;
    }

    if (columnMode === "potensi_simple" && latestYear != null) {
      downloadTableAsExcel({
        title: downloadTitle,
        subtitle: `${valueLabel} | Unit: ${unitLabel}`,
        source: downloadSource,
        notes: downloadNotes,
        columns: [
          {
            key: "no",
            label: "No",
            selector: (_row: TopProdukItem, index: number) => index + 1,
            numeric: true
          },
          {
            key: "hs",
            label: "HS Produk",
            selector: (row: TopProdukItem) => row.hs
          },
          {
            key: "produk",
            label: "Produk",
            selector: (row: TopProdukItem) => row.name
          },
          {
            key: "strategi",
            label: "Strategi",
            selector: (row: TopProdukItem) => row.strategi ?? "-"
          },
          {
            key: "nilai",
            label: valueLabel,
            selector: (row: TopProdukItem) => row.nilai[latestYear] ?? 0,
            numeric: true
          }
        ],
        rows: visibleRows,
        filename: downloadFilename,
        sheetName: "Top Potensial"
      });
      return;
    }

    if (columnMode === "potensi_calc") {
      downloadTableAsExcel({
        title: downloadTitle,
        subtitle:
          typeof downloadNotes === "string"
            ? downloadNotes
            : Array.isArray(downloadNotes)
              ? downloadNotes.join(" | ")
              : undefined,
        source: downloadSource,
        columns: [
          {
            key: "no",
            label: "No",
            selector: (_row: TopProdukItem, index: number) => index + 1,
            numeric: true
          },
          {
            key: "hs",
            label: "Kode",
            selector: (row: TopProdukItem) => row.hs
          },
          {
            key: "produk",
            label: "Nama Produk",
            selector: (row: TopProdukItem) => row.name
          },
          {
            key: "strategi",
            label: "Strategi",
            selector: (row: TopProdukItem) => row.strategi ?? "-"
          },
          {
            key: "rcaAsal",
            label: "RCA (Asal)",
            selector: (row: TopProdukItem) => row.rcaAsal ?? "",
            numeric: true
          },
          {
            key: "cmsaAsal",
            label: "CMSA (Asal)",
            selector: (row: TopProdukItem) => row.cmsaAsal ?? "",
            numeric: true
          },
          {
            key: "classAsal",
            label: "Class (Asal)",
            selector: (row: TopProdukItem) => row.classAsal ?? "-"
          },
          {
            key: "rcaTujuan",
            label: "RCA (Tujuan)",
            selector: (row: TopProdukItem) => row.rcaTujuan ?? "",
            numeric: true
          },
          {
            key: "cmsaTujuan",
            label: "CMSA (Tujuan)",
            selector: (row: TopProdukItem) => row.cmsaTujuan ?? "",
            numeric: true
          },
          {
            key: "classTujuan",
            label: "Class (Tujuan)",
            selector: (row: TopProdukItem) => row.classTujuan ?? "-"
          },
          {
            key: "asalWorld",
            label: "Asal ke Dunia",
            selector: (row: TopProdukItem) => row.asalWorld ?? "",
            numeric: true
          },
          {
            key: "tujuanWorld",
            label: "Tujuan ke Dunia",
            selector: (row: TopProdukItem) => row.tujuanWorld ?? "",
            numeric: true
          }
        ],
        rows: visibleRows,
        filename: downloadFilename,
        sheetName: "RCA CMSA"
      });
      return;
    }

    const columns = [
      {
        key: "no",
        label: "No",
        selector: (_row: TopProdukItem, index: number) => index + 1,
        numeric: true
      },
      {
        key: "produk",
        label: "Produk",
        selector: (row: TopProdukItem) => row.name
      }
    ];
    const codeColumn = {
      key: "hs",
      label: "HS",
      selector: (row: TopProdukItem) => row.hs
    };

    const yearColumns = years.map((year) => ({
      key: `y${year}`,
      label: String(year),
      selector: (row: TopProdukItem) => row.nilai[year] ?? 0,
      numeric: true
    }));

    downloadTableAsExcel({
      title: downloadTitle,
      subtitle: `Unit: ${unitLabel}`,
      source: downloadSource,
      notes: downloadNotes,
      columns: [
        ...(showCode ? [columns[0], codeColumn, columns[1]] : columns),
        ...yearColumns
      ],
      rows: visibleRows,
      filename: downloadFilename,
      sheetName: "Top Produk"
    });
  }, [
    columnMode,
    downloadFilename,
    downloadNotes,
    downloadSource,
    downloadTitle,
    downloadVariant,
    invoiceMode,
    latestYear,
    prevYear,
    showCode,
    unitLabel,
    valueLabel,
    visibleRows,
    years
  ]);

  React.useEffect(() => {
    onRegisterDownload?.(handleDownloadExcel);
    return () => onRegisterDownload?.(null);
  }, [handleDownloadExcel, onRegisterDownload]);

  const renderHeaderInfo = React.useCallback(
    (key: string) => {
      const content = columnInfoByKey?.[key];
      if (!content) return null;
      return (
        <HoverInfoTooltip content={content}>
          <span className="inline-flex items-center text-slate-400 transition hover:text-slate-600">
            <InformationCircleIcon className="h-3.5 w-3.5" />
          </span>
        </HoverInfoTooltip>
      );
    },
    [columnInfoByKey]
  );

  const renderCompetitorCell = React.useCallback(
    (item: TopProdukItem, group: "asean" | "global") => {
      const topCompetitor =
        group === "asean"
          ? (item.kompetitorAseanTopTujuanEkspor?.[0] ?? null)
          : (item.kompetitorGlobalTopTujuanEkspor?.[0] ?? null);

      if (!topCompetitor)
        return <span className="text-xs text-slate-400">-</span>;

      const inner = (
        <div className="flex min-w-0 items-center gap-2">
          <CountryFlag
            alpha2={topCompetitor.alpha2}
            countryName={topCompetitor.country}
            className="h-6 w-8 rounded-none bg-transparent text-[18px] ring-0"
          />
          <div className="min-w-0">
            <p className="truncate text-[12px] font-semibold text-slate-800">
              {topCompetitor.country}
            </p>
            <p className="inline-flex items-center gap-0.5 text-[11px] text-slate-500">
              <ChartPieIcon className="h-3 w-3" />
              <span>
                {topCompetitor.share != null
                  ? formatPercent(topCompetitor.share)
                  : "-"}
              </span>
            </p>
          </div>
        </div>
      );

      if (!onCompetitorClick) return inner;

      return (
        <button
          type="button"
          className="group w-full cursor-pointer rounded-md px-1 py-1 text-left transition hover:bg-slate-50"
          onClick={() => onCompetitorClick(item, group)}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">{inner}</div>
            <span className="shrink-0 text-[11px] font-medium text-emerald-700 opacity-0 transition group-hover:opacity-100">
              Lihat
            </span>
          </div>
        </button>
      );
    },
    [onCompetitorClick]
  );

  if (!items.length || !years.length) {
    return (
      <EmptyStatePanel
        compact
        title="Data belum tersedia"
        description={emptyMessage}
        className="min-h-72"
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col gap-2",
        expanded && "min-h-[62vh]"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari produk/HS..."
          containerClassName="max-w-[230px]"
          className="h-8 rounded-md py-1 text-xs"
          leftSlot={<MagnifyingGlassIcon className="h-4 w-4 text-slate-400" />}
        />
        {showLimitControl ? (
          <DataLimitSelect
            value={limit}
            onChange={setLimit}
            className="w-32"
            itemLabel="produk"
            options={limitOptions}
          />
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-md border border-slate-200">
        <div
          className={cn(
            "h-full overflow-x-auto overflow-y-auto",
            fitHeightToContainer ? "min-h-0" : "max-h-125",
            tableViewportClassName
          )}
        >
          <table
            className={cn(
              "w-full border-collapse divide-y divide-slate-200 text-sm",
              expanded && "w-full"
            )}
          >
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="sticky top-0 left-0 z-30 w-8 bg-slate-100 px-2 py-1.5 text-center font-semibold">
                  No
                </th>
                <th className="sticky top-0 left-8 z-20 min-w-56 bg-slate-100 px-2 py-1.5 text-left font-semibold">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 transition hover:text-slate-900"
                      onClick={() => toggleSort("produk")}
                    >
                      {columnMode === "analysis_export"
                        ? "HS Produk"
                        : showCode
                          ? "Produk (HS)"
                          : "Produk"}
                      {sortIcon("produk")}
                    </button>
                    {renderHeaderInfo("produk")}
                  </div>
                </th>
                {columnMode === "trade_pair" && latestYear != null ? (
                  <>
                    <th className="sticky top-0 z-10 min-w-36 bg-slate-100 px-2 py-1.5 text-right font-semibold">
                      <button
                        type="button"
                        className="ml-auto inline-flex items-center gap-1 text-right transition hover:text-slate-900"
                        onClick={() => toggleSort(`year-${latestYear}`)}
                      >
                        {valueLabel} ({latestYear})
                        {sortIcon(`year-${latestYear}`)}
                      </button>
                    </th>
                    <th className="sticky top-0 z-10 min-w-36 bg-slate-100 px-2 py-1.5 text-right font-semibold">
                      <div className="text-right">
                        Nilai Sebaliknya ({latestYear})
                      </div>
                    </th>
                    <th className="sticky top-0 z-10 min-w-36 bg-slate-100 px-2 py-1.5 pr-4 text-right font-semibold">
                      <div className="text-right">Selisih ({latestYear})</div>
                    </th>
                  </>
                ) : columnMode === "analysis_export" ? (
                  <>
                    {years
                      .slice()
                      .reverse()
                      .map((year) => (
                        <th
                          key={year}
                          className="sticky top-0 z-10 min-w-52 bg-slate-100 px-3 py-1.5 text-right font-semibold"
                        >
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              className="ml-auto inline-flex items-center gap-1 text-right transition hover:text-slate-900"
                              onClick={() => toggleSort(`year-${year}`)}
                            >
                              {year}
                              {sortIcon(`year-${year}`)}
                            </button>
                            {renderHeaderInfo(`year-${year}`)}
                          </div>
                        </th>
                      ))}
                    <th className="sticky top-0 z-10 min-w-32 bg-slate-100 px-3 py-1.5 text-right font-semibold">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          className="ml-auto inline-flex items-center gap-1 text-right transition hover:text-slate-900"
                          onClick={() => toggleSort("cagr")}
                        >
                          CAGR %{sortIcon("cagr")}
                        </button>
                        {renderHeaderInfo("cagr")}
                      </div>
                    </th>
                    <th className="sticky top-0 z-10 min-w-48 bg-slate-100 px-3 py-1.5 text-left font-semibold">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 transition hover:text-slate-900"
                          onClick={() => toggleSort("kompetitor-asean")}
                        >
                          Kompetitor ASEAN
                          {sortIcon("kompetitor-asean")}
                        </button>
                        {renderHeaderInfo("kompetitor-asean")}
                      </div>
                    </th>
                    <th className="sticky top-0 z-10 min-w-48 bg-slate-100 px-3 py-1.5 pr-4 text-left font-semibold">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 transition hover:text-slate-900"
                          onClick={() => toggleSort("kompetitor-global")}
                        >
                          Kompetitor Global
                          {sortIcon("kompetitor-global")}
                        </button>
                        {renderHeaderInfo("kompetitor-global")}
                      </div>
                    </th>
                  </>
                ) : columnMode === "potensi_simple" && latestYear != null ? (
                  <>
                    <th className="sticky top-0 z-10 min-w-40 bg-slate-100 px-3 py-1.5 text-left font-semibold">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 transition hover:text-slate-900"
                        onClick={() => toggleSort("strategi")}
                      >
                        Strategi
                        {sortIcon("strategi")}
                      </button>
                    </th>
                    <th className="sticky top-0 z-10 min-w-40 bg-slate-100 px-3 py-1.5 pr-4 text-right font-semibold">
                      <button
                        type="button"
                        className="ml-auto inline-flex items-center gap-1 text-right transition hover:text-slate-900"
                        onClick={() => toggleSort(`year-${latestYear}`)}
                      >
                        {valueLabel}
                        {sortIcon(`year-${latestYear}`)}
                      </button>
                    </th>
                  </>
                ) : columnMode === "potensi_calc" ? (
                  <>
                    <th className="sticky top-0 z-10 min-w-52 bg-slate-100 px-3 py-1.5 text-left font-semibold">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 transition hover:text-slate-900"
                        onClick={() => toggleSort("strategi")}
                      >
                        Strategi
                        {sortIcon("strategi")}
                      </button>
                    </th>
                    {[
                      ["rcaAsal", "RCA (Asal)"],
                      ["cmsaAsal", "CMSA (Asal)"],
                      ["classAsal", "Class (Asal)"],
                      ["rcaTujuan", "RCA (Tujuan)"],
                      ["cmsaTujuan", "CMSA (Tujuan)"],
                      ["classTujuan", "Class (Tujuan)"],
                      ["asalWorld", "Asal ke Dunia"],
                      ["tujuanWorld", "Tujuan ke Dunia"]
                    ].map(([key, label]) => (
                      <th
                        key={key}
                        className={cn(
                          "sticky top-0 z-10 min-w-32 bg-slate-100 px-3 py-1.5 font-semibold",
                          key.includes("class") ? "text-left" : "text-right"
                        )}
                      >
                        <button
                          type="button"
                          className={cn(
                            "inline-flex items-center gap-1 transition hover:text-slate-900",
                            key.includes("class") ? "" : "ml-auto text-right"
                          )}
                          onClick={() => toggleSort(key)}
                        >
                          {label}
                          {sortIcon(key)}
                        </button>
                      </th>
                    ))}
                  </>
                ) : (
                  years.map((year, yearIndex, sourceYears) => (
                    <th
                      key={year}
                      className={cn(
                        "sticky top-0 z-10 min-w-44 bg-slate-100 px-2 py-1.5 text-right font-semibold",
                        yearIndex === sourceYears.length - 1 && "pr-4"
                      )}
                    >
                      <button
                        type="button"
                        className="ml-auto inline-flex items-center gap-1 text-right transition hover:text-slate-900"
                        onClick={() => toggleSort(`year-${year}`)}
                      >
                        {year}
                        {sortIcon(`year-${year}`)}
                      </button>
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {visibleRows.map((item, index) => {
                const rowInvoiceInfo =
                  latestYear != null
                    ? getInvoiceInfo(item, latestYear, invoiceMode)
                    : null;
                const useWarningRow =
                  invoiceHighlightTone === "warning" &&
                  rowInvoiceInfo &&
                  (columnMode === "analysis_export" ? false : true);
                const rowBgClassName = useWarningRow
                  ? "bg-amber-50"
                  : "bg-white";
                const warningTextClassName = useWarningRow
                  ? "text-amber-800"
                  : "text-slate-800";
                const activeShare =
                  latestYear != null
                    ? (item.share?.[latestYear] ??
                      ((item.nilai[latestYear] ?? 0) /
                        Math.max(
                          1,
                          shareTotalValue ?? totalsByYear[latestYear] ?? 0
                        )) *
                        100)
                    : 0;
                const signedDiff =
                  latestYear != null
                    ? (invoiceMode === "ekspor"
                        ? (item.exportReverse?.[latestYear] ?? 0)
                        : (item.importReverse?.[latestYear] ?? 0)) -
                      (item.nilai[latestYear] ?? 0)
                    : 0;
                const rowTooltipContent = (
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <p>Rank: {index + 1}</p>
                      <p className="font-semibold text-slate-800">
                        {showCode ? `HS ${item.hs}` : item.name}
                      </p>
                      {showCode ? (
                        <p className="font-semibold text-slate-700">
                          {item.name}
                        </p>
                      ) : null}
                      {latestYear != null ? (
                        <p>
                          {valueLabel} {latestYear}:{" "}
                          <span className="font-semibold text-slate-800">
                            {formatNumber(item.nilai[latestYear] ?? 0)}
                          </span>
                        </p>
                      ) : null}
                      {latestYear != null ? (
                        <p>
                          Nilai sebaliknya {latestYear}:{" "}
                          <span className="font-semibold text-slate-800">
                            {formatNumber(
                              invoiceMode === "ekspor"
                                ? (item.exportReverse?.[latestYear] ?? 0)
                                : (item.importReverse?.[latestYear] ?? 0)
                            )}
                          </span>
                        </p>
                      ) : null}
                      {latestYear != null ? (
                        <p>
                          Selisih {latestYear}:{" "}
                          <span className="font-semibold text-slate-800">
                            {formatSignedNumber(signedDiff)}
                          </span>
                        </p>
                      ) : null}
                      {latestYear != null ? (
                        <p>
                          Pangsa {latestYear}:{" "}
                          <span className="font-semibold text-slate-800">
                            {formatPercent(activeShare)}
                          </span>
                        </p>
                      ) : null}
                    </div>
                    {rowInvoiceInfo ? (
                      <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-amber-800">
                        <div className="flex items-center gap-1.5 font-semibold">
                          <ExclamationTriangleIcon className="h-4 w-4 shrink-0 text-amber-600" />
                          <span>
                            {rowInvoiceInfo.type === "under"
                              ? "Indikasi under invoicing"
                              : "Indikasi over invoicing"}
                          </span>
                        </div>
                        <div>
                          Selisih: {formatSignedNumber(signedDiff)} (
                          {formatPercent(rowInvoiceInfo.pct * 100)})
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
                const shareTooltipContent = (
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-800">
                      {shareLabel} {latestYear}
                    </p>
                    <p>
                      {formatPercent(activeShare)} {shareContextLabel}
                    </p>
                    <p>
                      {valueLabel} produk:{" "}
                      {formatNumber(
                        latestYear != null ? (item.nilai[latestYear] ?? 0) : 0
                      )}
                    </p>
                    <p>
                      {totalLabel}:{" "}
                      {formatNumber(
                        shareTotalValue ??
                          (latestYear != null
                            ? (totalsByYear[latestYear] ?? 0)
                            : 0)
                      )}
                    </p>
                  </div>
                );
                const wrapRowTooltip = (node: React.ReactNode) =>
                  enableRowHoverTooltip ? (
                    <HoverInfoTooltip
                      content={rowTooltipContent}
                      className="block w-full"
                    >
                      {node}
                    </HoverInfoTooltip>
                  ) : (
                    node
                  );
                const firstColumnTextContent = (
                  <div>
                    <div className="flex items-center gap-1">
                      {showCode ? (
                        onHsClick ? (
                          <button
                            type="button"
                            onClick={() => onHsClick(item)}
                            className="text-left text-[12px] font-semibold leading-tight text-emerald-700 underline-offset-2 transition hover:text-emerald-800 hover:underline"
                          >
                            HS {item.hs}
                          </button>
                        ) : (
                          <p
                            className={cn(
                              "text-[12px] font-semibold leading-tight",
                              warningTextClassName
                            )}
                          >
                            HS {item.hs}
                          </p>
                        )
                      ) : null}
                      {rowInvoiceInfo ? (
                        <ExclamationTriangleIcon className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                      ) : null}
                      {showShareBadge && latestYear != null ? (
                        <HoverInfoTooltip content={shareTooltipContent}>
                          <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-slate-50 px-1 py-0.5 text-[9px] text-slate-600 ring-1 ring-slate-200">
                            <ChartPieIcon className="h-2.5 w-2.5" />
                            {formatPercent(activeShare)}
                          </span>
                        </HoverInfoTooltip>
                      ) : null}
                    </div>
                    {showCode ? (
                      <p
                        className={cn(
                          "mt-0.5 line-clamp-2 text-[11px] leading-tight",
                          useWarningRow ? "text-amber-900" : "text-slate-600"
                        )}
                      >
                        {item.name}
                      </p>
                    ) : (
                      <p
                        className={cn(
                          "line-clamp-2 text-[12px] font-semibold leading-tight",
                          warningTextClassName
                        )}
                      >
                        {item.name}
                      </p>
                    )}
                  </div>
                );
                const firstColumnContent = enableRowHoverTooltip
                  ? wrapRowTooltip(firstColumnTextContent)
                  : firstColumnTextContent;

                return (
                  <tr
                    key={`${item.hs}-${item.name}-${index}`}
                    className={cn(
                      "transition-colors",
                      useWarningRow
                        ? "bg-amber-50 hover:bg-amber-100"
                        : "hover:bg-slate-50"
                    )}
                  >
                    <td
                      className={cn(
                        "sticky left-0 z-20 px-2 py-1.5 text-center text-slate-500",
                        rowBgClassName
                      )}
                    >
                      {index + 1}
                    </td>
                    <td
                      className={cn(
                        "sticky left-8 z-1 px-2 py-1.5",
                        rowBgClassName
                      )}
                    >
                      {firstColumnContent}
                    </td>
                    {columnMode === "trade_pair" && latestYear != null ? (
                      <>
                        <td
                          className={cn("min-w-36 px-2 py-1.5", rowBgClassName)}
                        >
                          {wrapRowTooltip(
                            <div
                              className={cn(
                                "flex items-center justify-end gap-1.5 rounded-md",
                                invoiceHighlightTone === "warning" &&
                                  rowInvoiceInfo &&
                                  "bg-amber-50 px-2 py-1"
                              )}
                            >
                              <span
                                className={cn(
                                  "tabular-nums text-slate-800",
                                  invoiceHighlightTone === "warning" &&
                                    rowInvoiceInfo &&
                                    "font-semibold text-amber-800"
                                )}
                              >
                                {formatNumber(item.nilai[latestYear] ?? 0)}
                              </span>
                            </div>
                          )}
                        </td>
                        <td
                          className={cn("min-w-36 px-2 py-1.5", rowBgClassName)}
                        >
                          {wrapRowTooltip(
                            <div className="flex items-center justify-end gap-1.5 rounded-md">
                              <span
                                className={cn(
                                  "tabular-nums",
                                  useWarningRow
                                    ? "text-amber-800"
                                    : "text-slate-800"
                                )}
                              >
                                {formatNumber(
                                  invoiceMode === "ekspor"
                                    ? (item.exportReverse?.[latestYear] ?? 0)
                                    : (item.importReverse?.[latestYear] ?? 0)
                                )}
                              </span>
                            </div>
                          )}
                        </td>
                        <td
                          className={cn("min-w-36 px-2 py-1.5", rowBgClassName)}
                        >
                          {wrapRowTooltip(
                            <div className="flex items-center justify-end gap-1.5 rounded-md">
                              <span
                                className={cn(
                                  "tabular-nums",
                                  signedDiff > 0
                                    ? "text-emerald-700"
                                    : signedDiff < 0
                                      ? "text-rose-700"
                                      : useWarningRow
                                        ? "text-amber-800"
                                        : "text-slate-800"
                                )}
                              >
                                {formatSignedNumber(signedDiff)}
                              </span>
                            </div>
                          )}
                        </td>
                      </>
                    ) : columnMode === "analysis_export" ? (
                      <>
                        {years
                          .slice()
                          .reverse()
                          .map((year, yearIndex, sourceYears) => {
                            const value = item.nilai[year] ?? 0;
                            const previousYear =
                              yearIndex > 0
                                ? (sourceYears[yearIndex - 1] ?? null)
                                : null;
                            const previousValue =
                              previousYear != null
                                ? (item.nilai[previousYear] ?? null)
                                : null;
                            const delta = toDelta(value, previousValue);
                            const share = item.share?.[year] ?? 0;
                            const yearInvoiceInfo = getInvoiceInfo(
                              item,
                              year,
                              "ekspor"
                            );
                            const mirrorValue = item.exportReverse?.[year] ?? 0;
                            const signedMirrorDiff = mirrorValue - value;
                            const mirrorDiffPct =
                              mirrorValue > 0
                                ? Math.abs(signedMirrorDiff) / mirrorValue
                                : null;
                            const invoiceLabel =
                              yearInvoiceInfo?.type === "under"
                                ? "Under invoicing"
                                : yearInvoiceInfo?.type === "over"
                                  ? "Over invoicing"
                                  : null;
                            const useInvoiceWarning = Boolean(invoiceLabel);

                            return (
                              <td
                                key={`${item.hs}-${year}`}
                                className={cn(
                                  "min-w-52 px-3 py-2",
                                  rowBgClassName,
                                  yearIndex === sourceYears.length - 1 && "pr-4"
                                )}
                              >
                                <HoverInfoTooltip
                                  content={
                                    <div className="space-y-1">
                                      <p className="font-semibold text-slate-800">
                                        {valueLabel} {year}
                                      </p>
                                      <p>Nilai: {formatNumber(value)}</p>
                                      <p>Pangsa: {formatPercent(share)}</p>
                                      {previousYear != null ? (
                                        <p>
                                          Perubahan dari {previousYear}:{" "}
                                          {delta != null
                                            ? formatPercent(delta)
                                            : "N/A"}
                                        </p>
                                      ) : null}
                                      <p>
                                        Nilai sebaliknya (mirror):{" "}
                                        {formatNumber(mirrorValue)}
                                      </p>
                                      <p>
                                        Selisih nilai:{" "}
                                        {formatSignedNumber(signedMirrorDiff)}
                                        {mirrorDiffPct != null
                                          ? ` (${formatPercent(mirrorDiffPct * 100)})`
                                          : ""}
                                      </p>
                                      {invoiceLabel ? (
                                        <>
                                          <p className="font-semibold text-amber-700">
                                            Indikasi {invoiceLabel}
                                          </p>
                                        </>
                                      ) : null}
                                    </div>
                                  }
                                >
                                  <div
                                    className={cn(
                                      "grid grid-cols-[1fr_auto] items-start gap-x-1.5 gap-y-1 rounded-md",
                                      useInvoiceWarning &&
                                        "bg-amber-50 px-2 py-1"
                                    )}
                                  >
                                    <div className="col-start-1 row-start-1 flex justify-end">
                                      <div className="flex items-center gap-1.5">
                                        {useInvoiceWarning ? (
                                          <ExclamationTriangleIcon className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                                        ) : null}
                                        <span className="tabular-nums whitespace-nowrap text-right text-slate-800">
                                          {formatNumber(value)}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="col-start-2 row-span-2 row-start-1 flex items-center justify-center self-center">
                                      {delta != null ? (
                                        <span
                                          className={cn(
                                            "inline-flex min-w-15 whitespace-nowrap items-center justify-center gap-0.5 rounded-full px-1 py-0.5 text-[9px] font-semibold",
                                            delta > 0
                                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                              : delta < 0
                                                ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                                                : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                                          )}
                                        >
                                          <span>{delta > 0 ? "▲" : "▼"}</span>
                                          <span>
                                            {formatPercent(Math.abs(delta))}
                                          </span>
                                        </span>
                                      ) : (
                                        <span className="inline-flex min-w-15 whitespace-nowrap items-center justify-center rounded-full bg-slate-100 px-1 py-0.5 text-[9px] font-semibold text-slate-600 ring-1 ring-slate-200">
                                          N/A
                                        </span>
                                      )}
                                    </div>
                                    <div className="col-start-1 row-start-2 flex justify-end">
                                      <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-50 px-1.5 py-0.5 text-[9px] text-slate-600 ring-1 ring-slate-200">
                                        <ChartPieIcon className="h-2.5 w-2.5" />
                                        {formatPercent(share)}
                                      </span>
                                    </div>
                                  </div>
                                </HoverInfoTooltip>
                              </td>
                            );
                          })}
                        <td
                          className={cn(
                            "min-w-32 px-3 py-2 text-right",
                            rowBgClassName
                          )}
                        >
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2 py-1 text-[11px] font-semibold",
                              item.cagr == null
                                ? "bg-slate-100 text-slate-500"
                                : item.cagr >= 0
                                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                  : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                            )}
                          >
                            {item.cagr == null
                              ? "N/A"
                              : `${item.cagr > 0 ? "+" : ""}${formatPercent(item.cagr)}`}
                          </span>
                        </td>
                        <td
                          className={cn("min-w-48 px-3 py-2", rowBgClassName)}
                        >
                          {renderCompetitorCell(item, "asean")}
                        </td>
                        <td
                          className={cn(
                            "min-w-48 px-3 py-2 pr-4",
                            rowBgClassName
                          )}
                        >
                          {renderCompetitorCell(item, "global")}
                        </td>
                      </>
                    ) : columnMode === "potensi_simple" &&
                      latestYear != null ? (
                      <>
                        <td
                          className={cn("min-w-40 px-3 py-2", rowBgClassName)}
                        >
                          <span className="text-sm text-slate-700">
                            {item.strategi ?? "-"}
                          </span>
                        </td>
                        <td
                          className={cn(
                            "min-w-40 px-3 py-2 pr-4 text-right",
                            rowBgClassName
                          )}
                        >
                          <span className="tabular-nums text-slate-800">
                            {formatNumber(item.nilai[latestYear] ?? 0)}
                          </span>
                        </td>
                      </>
                    ) : columnMode === "potensi_calc" ? (
                      <>
                        <td
                          className={cn("min-w-52 px-3 py-2", rowBgClassName)}
                        >
                          <span className="text-sm text-slate-700">
                            {item.strategi ?? "-"}
                          </span>
                        </td>
                        <td
                          className={cn(
                            "min-w-32 px-3 py-2 text-right",
                            rowBgClassName
                          )}
                        >
                          <span className="tabular-nums text-slate-800">
                            {item.rcaAsal != null
                              ? item.rcaAsal.toFixed(2)
                              : "-"}
                          </span>
                        </td>
                        <td
                          className={cn(
                            "min-w-32 px-3 py-2 text-right",
                            rowBgClassName
                          )}
                        >
                          <span className="tabular-nums text-slate-800">
                            {item.cmsaAsal != null
                              ? item.cmsaAsal.toFixed(2)
                              : "-"}
                          </span>
                        </td>
                        <td
                          className={cn("min-w-32 px-3 py-2", rowBgClassName)}
                        >
                          <span className="text-sm text-slate-700">
                            {item.classAsal ?? "-"}
                          </span>
                        </td>
                        <td
                          className={cn(
                            "min-w-32 px-3 py-2 text-right",
                            rowBgClassName
                          )}
                        >
                          <span className="tabular-nums text-slate-800">
                            {item.rcaTujuan != null
                              ? item.rcaTujuan.toFixed(2)
                              : "-"}
                          </span>
                        </td>
                        <td
                          className={cn(
                            "min-w-32 px-3 py-2 text-right",
                            rowBgClassName
                          )}
                        >
                          <span className="tabular-nums text-slate-800">
                            {item.cmsaTujuan != null
                              ? item.cmsaTujuan.toFixed(2)
                              : "-"}
                          </span>
                        </td>
                        <td
                          className={cn("min-w-32 px-3 py-2", rowBgClassName)}
                        >
                          <span className="text-sm text-slate-700">
                            {item.classTujuan ?? "-"}
                          </span>
                        </td>
                        <td
                          className={cn(
                            "min-w-32 px-3 py-2 text-right",
                            rowBgClassName
                          )}
                        >
                          <span className="tabular-nums text-slate-800">
                            {item.asalWorld != null
                              ? item.asalWorld.toFixed(2)
                              : "-"}
                          </span>
                        </td>
                        <td
                          className={cn(
                            "min-w-32 px-3 py-2 pr-4 text-right",
                            rowBgClassName
                          )}
                        >
                          <span className="tabular-nums text-slate-800">
                            {item.tujuanWorld != null
                              ? item.tujuanWorld.toFixed(2)
                              : "-"}
                          </span>
                        </td>
                      </>
                    ) : (
                      years.map((year, yearIndex, sourceYears) => {
                        const value = item.nilai[year] ?? 0;
                        const prevYear = years[yearIndex + 1] ?? null;
                        const prevValue =
                          prevYear != null
                            ? (item.nilai[prevYear] ?? null)
                            : null;
                        const delta = toDelta(value, prevValue);
                        const invoiceInfo = getInvoiceInfo(
                          item,
                          year,
                          invoiceMode
                        );

                        return (
                          <td
                            key={`${item.hs}-${year}`}
                            className={cn(
                              "min-w-44 px-2 py-1.5",
                              rowBgClassName,
                              yearIndex === sourceYears.length - 1 && "pr-4"
                            )}
                          >
                            {wrapRowTooltip(
                              <div
                                className={cn(
                                  "grid w-full grid-cols-[minmax(0,1fr)_60px] items-center justify-items-end gap-1 rounded-md",
                                  invoiceHighlightTone === "warning" &&
                                    invoiceInfo &&
                                    "bg-amber-50 px-2 py-1"
                                )}
                              >
                                <span
                                  className={cn(
                                    "tabular-nums whitespace-nowrap text-right text-slate-800",
                                    invoiceHighlightTone === "warning" &&
                                      invoiceInfo &&
                                      "font-semibold text-amber-800"
                                  )}
                                >
                                  {formatNumber(value)}
                                </span>
                                {showDeltaBadge ? (
                                  delta != null ? (
                                    <HoverInfoTooltip
                                      content={
                                        <div className="space-y-1">
                                          <p className="font-semibold text-slate-800">
                                            {changeLabel}
                                          </p>
                                          <p>
                                            {valueLabel} {year}:{" "}
                                            {formatNumber(value)}
                                          </p>
                                          {prevYear != null ? (
                                            <p>
                                              {valueLabel} {prevYear}:{" "}
                                              {formatNumber(prevValue ?? 0)}
                                            </p>
                                          ) : null}
                                          <p>
                                            Perubahan: {formatPercent(delta)}
                                          </p>
                                        </div>
                                      }
                                    >
                                      <span
                                        className={cn(
                                          "inline-flex min-w-15 whitespace-nowrap items-center justify-center gap-0.5 rounded-full px-1 py-0.5 text-[9px] font-semibold",
                                          delta > 0
                                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                            : delta < 0
                                              ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                                              : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                                        )}
                                      >
                                        <span>{delta > 0 ? "▲" : "▼"}</span>
                                        <span>
                                          {formatPercent(Math.abs(delta))}
                                        </span>
                                      </span>
                                    </HoverInfoTooltip>
                                  ) : (
                                    <span className="inline-flex min-w-15 whitespace-nowrap items-center justify-center rounded-full bg-slate-100 px-1 py-0.5 text-[9px] font-semibold text-slate-600 ring-1 ring-slate-200">
                                      -
                                    </span>
                                  )
                                ) : (
                                  <span className="inline-block w-15" />
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
