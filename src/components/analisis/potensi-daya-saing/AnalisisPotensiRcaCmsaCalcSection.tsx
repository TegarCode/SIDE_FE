import React from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { Button } from "@/components/ui/Button";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";
import { TopProdukTable } from "@/components/ui/TopProdukTable";
import type {
  AnalisisPotensiDayaSaingCalculationResult,
  AnalisisPotensiDayaSaingCalcRow
} from "@/type/analisis";

type AnalisisPotensiRcaCmsaCalcSectionProps = {
  data: AnalisisPotensiDayaSaingCalculationResult | null;
  loading?: boolean;
  errorMessage?: string | null;
};

function toTopProdukRaw(rows: AnalisisPotensiDayaSaingCalcRow[]) {
  const currentYear = new Date().getFullYear();
  return {
    top_produk: rows.map((row) => ({
      kodeHS: row.kode ?? row.hs4,
      namaHS: row.nama,
      strategi: row.strategi ?? null,
      rcaAsal: row.rcaAsal,
      cmsaAsal: row.cmsaAsal,
      classAsal: row.classAsal,
      rcaTujuan: row.rcaTujuan,
      cmsaTujuan: row.cmsaTujuan,
      classTujuan: row.classTujuan,
      asalWorld: row.asalWorld,
      tujuanWorld: row.tujuanWorld,
      nilai: {
        [currentYear]: row.rcaAsal ?? 0
      }
    }))
  };
}

export function AnalisisPotensiRcaCmsaCalcSection({
  data,
  loading = false,
  errorMessage
}: AnalisisPotensiRcaCmsaCalcSectionProps) {
  const downloadHandlerRef = React.useRef<(() => void) | null>(null);
  const [hasDownloadHandler, setHasDownloadHandler] = React.useState(false);
  const [sortColumnLabel, setSortColumnLabel] = React.useState("HS Produk");
  const tableRaw = React.useMemo(
    () => toTopProdukRaw(data?.rows ?? []),
    [data?.rows]
  );
  const subtitle = React.useMemo(
    () =>
      [
        "Dekomposisi dan metrik inti per HS4 berdasarkan filter negara.",
        `Asal: ${data?.origin.name ?? data?.origin.code ?? "-"}`,
        `Tujuan: ${data?.destination.name ?? data?.destination.code ?? "-"}`,
        `Nomor mengikuti urutan sorting pada kolom ${sortColumnLabel}`
      ].join(" | "),
    [
      data?.destination.code,
      data?.destination.name,
      data?.origin.code,
      data?.origin.name,
      sortColumnLabel
    ]
  );

  const table = (
    <TopProdukTable
      raw={tableRaw}
      unitLabel="-"
      columnMode="potensi_calc"
      valueLabel="Perhitungan RCA & CMSA"
      emptyMessage="Data perhitungan RCA & CMSA belum tersedia."
      showShareBadge={false}
      downloadTitle="Perhitungan RCA & CMSA"
      downloadFilename="Perhitungan_RCA_CMSA"
      downloadSource={data?.sourceName ?? undefined}
      downloadNotes={subtitle}
      onSortColumnChange={setSortColumnLabel}
      onRegisterDownload={(handler) => {
        downloadHandlerRef.current = handler;
        setHasDownloadHandler(Boolean(handler));
      }}
      limitOptions={["10", "25", "50", "ALL"]}
      tableViewportClassName="h-[720px] max-h-[720px]"
    />
  );

  return (
    <ExpandableCard
      title="Perhitungan RCA & CMSA"
      subtitle={subtitle}
      actions={
        <IconTooltip label="Unduh Excel">
          <span>
            <Button
              type="button"
              className="shrink-0 rounded-md border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
              onClick={() => downloadHandlerRef.current?.()}
              disabled={!hasDownloadHandler}
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
            </Button>
          </span>
        </IconTooltip>
      }
      expandedContent={
        loading ? (
          <TableSkeleton rows={8} />
        ) : errorMessage ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : (
          table
        )
      }
      modalSize="full"
    >
      {loading ? (
        <TableSkeleton rows={8} />
      ) : errorMessage ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : (
        table
      )}
    </ExpandableCard>
  );
}
