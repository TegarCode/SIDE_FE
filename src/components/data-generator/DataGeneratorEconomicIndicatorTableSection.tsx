import React from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { EmptyStatePanel } from "@/components/ui/EmptyStatePanel";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { downloadTableAsExcel } from "@/utils/downloadAsExcel";

type EconomicIndicatorItem = {
  negara?: string;
  kode_alpha3?: string;
  tahun?: number;
  nilai?: number;
  rank?: number;
};

type EconomicIndicatorResponse = {
  data?: Record<string, EconomicIndicatorItem[]>;
  meta?: {
    indicator_id?: number;
    indicator_name?: string;
    years?: number[];
    order?: string;
    is_yoy?: string;
    sumber?: string;
    viewType?: string;
    count?: number;
  };
};

type Props = {
  data: EconomicIndicatorResponse | null;
  loading: boolean;
};

type PivotRow = {
  country: string;
  alpha3: string | null;
  rank: number | null;
  values: Record<number, number | null>;
};

function formatNumber(value: number | null) {
  if (value == null || !Number.isFinite(value)) return "-";
  return value.toLocaleString("id-ID", { maximumFractionDigits: 3 });
}

export function DataGeneratorEconomicIndicatorTableSection({
  data,
  loading
}: Props) {
  const meta = data?.meta ?? {};
  const indicatorName = meta.indicator_name ?? "Indikator";
  const source = meta.sumber ?? "-";
  const years = React.useMemo(() => {
    const datasetYears = Object.keys(data?.data ?? {})
      .map(Number)
      .filter(Number.isFinite);
    return Array.from(new Set([...(meta.years ?? []), ...datasetYears])).sort(
      (a, b) => a - b
    );
  }, [data?.data, meta.years]);

  const rows = React.useMemo<PivotRow[]>(() => {
    const latestYear = years[years.length - 1] ?? null;
    const map = new Map<string, PivotRow>();
    years.forEach((year) => {
      (data?.data?.[String(year)] ?? []).forEach((item) => {
        const country = item.negara ?? "-";
        const current = map.get(country) ?? {
          country,
          alpha3: item.kode_alpha3 ?? null,
          rank: null,
          values: {}
        };
        current.values[year] =
          typeof item.nilai === "number" ? item.nilai : null;
        if (year === years[years.length - 1]) {
          current.rank =
            typeof item.rank === "number" ? item.rank : current.rank;
        }
        map.set(country, current);
      });
    });
    return [...map.values()].sort((left, right) => {
      const leftLatestValue =
        latestYear != null ? (left.values[latestYear] ?? null) : null;
      const rightLatestValue =
        latestYear != null ? (right.values[latestYear] ?? null) : null;
      const leftEmpty = leftLatestValue == null;
      const rightEmpty = rightLatestValue == null;
      if (leftEmpty !== rightEmpty) return leftEmpty ? 1 : -1;

      const leftRank = left.rank ?? Number.MAX_SAFE_INTEGER;
      const rightRank = right.rank ?? Number.MAX_SAFE_INTEGER;
      if (leftRank !== rightRank) return leftRank - rightRank;
      return left.country.localeCompare(right.country, "id");
    });
  }, [data?.data, years]);

  const subtitle = `Tahun ${years[0] ?? "-"}-${years[years.length - 1] ?? "-"} | Total data: ${(meta.count ?? rows.length).toLocaleString("id-ID")} | Sumber: ${source}`;

  const handleDownload = React.useCallback(() => {
    void downloadTableAsExcel({
      filename: "data_generator_kinerja_ekonomi_table",
      title: `Data ${indicatorName}`,
      subtitle,
      source: `Sumber: ${source}`,
      columns: [
        { key: "rank", label: "Rank" },
        { key: "negara", label: "Negara" },
        ...years.map((year) => ({ key: String(year), label: String(year) }))
      ],
      rows: rows.map((row) => ({
        rank: row.rank ?? "-",
        negara: row.country,
        ...Object.fromEntries(
          years.map((year) => [
            String(year),
            formatNumber(row.values[year] ?? null)
          ])
        )
      }))
    });
  }, [indicatorName, rows, source, subtitle, years]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-5 w-56 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-4 w-80 animate-pulse rounded bg-slate-100" />
        <div className="mt-5 h-72 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (!data || rows.length === 0 || years.length === 0) {
    return (
      <EmptyStatePanel
        title="Data indikator ekonomi belum tersedia"
        description="Atur filter indikator ekonomi lalu pilih Tampilan Tabel untuk memuat hasil generator."
      />
    );
  }

  const tableContent = (
    <div className="overflow-hidden border border-slate-300 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-sm text-slate-700">
          <thead className="bg-[#2563eb] text-white">
            <tr>
              <th
                rowSpan={2}
                className="border-b border-r border-blue-300 px-6 py-4 text-left text-[16px] font-semibold"
              >
                Rank
              </th>
              <th
                rowSpan={2}
                className="border-b border-r border-blue-300 px-6 py-4 text-left text-[16px] font-semibold"
              >
                Negara
              </th>
              <th
                colSpan={years.length}
                className="border-b border-blue-300 px-6 py-3 text-center text-[16px] font-semibold"
              >
                {indicatorName}
              </th>
            </tr>
            <tr>
              {years.map((year) => (
                <th
                  key={year}
                  className="border-b border-r border-blue-300 px-6 py-3 text-center text-[16px] font-semibold last:border-r-0"
                >
                  {year}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {rows.map((row, index) => (
              <tr
                key={row.country}
                className={index % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
              >
                <td className="border-b border-r border-slate-200 px-6 py-3 text-left font-medium text-slate-800">
                  {row.rank ?? "-"}
                </td>
                <td className="border-b border-r border-slate-200 px-6 py-3 font-medium text-slate-800">
                  {row.country}
                </td>
                {years.map((year, yearIndex) => (
                  <td
                    key={`${row.country}-${year}`}
                    className={`border-b border-slate-200 px-6 py-3 text-right tabular-nums ${yearIndex < years.length - 1 ? "border-r" : ""}`}
                  >
                    {formatNumber(row.values[year] ?? null)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <ExpandableCard
      title={`Data ${indicatorName}`}
      subtitle={subtitle}
      className="shadow-sm"
      modalSize="full"
      actions={
        <Button
          type="button"
          variant="outline"
          className="rounded-md border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
          onClick={handleDownload}
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
        </Button>
      }
      expandedContent={tableContent}
    >
      {tableContent}
    </ExpandableCard>
  );
}
