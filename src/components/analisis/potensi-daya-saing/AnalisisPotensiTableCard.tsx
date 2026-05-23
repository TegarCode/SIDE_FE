import React from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { Button } from "@/components/ui/Button";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";
import { TopProdukTable } from "@/components/ui/TopProdukTable";
import type { AnalisisPotensiDayaSaingSimpleRow } from "@/type/analisis";

type AnalisisPotensiTableCardProps = {
  title: string;
  titleValue: string;
  rows: AnalisisPotensiDayaSaingSimpleRow[];
  loading?: boolean;
  errorMessage?: string | null;
  sourceName?: string | null;
  originLabel?: string;
  destinationLabel?: string;
  emptyMessage?: string;
};

function toTopProdukRaw(rows: AnalisisPotensiDayaSaingSimpleRow[]) {
  const currentYear = new Date().getFullYear();
  return {
    top_produk: rows.map((row) => ({
      kodeHS: row.kode ?? row.hs4,
      namaHS: row.nama,
      strategi: row.strategi ?? null,
      nilai: {
        [currentYear]: row.nilai ?? 0
      }
    }))
  };
}

export function AnalisisPotensiTableCard({
  title,
  titleValue,
  rows,
  loading = false,
  errorMessage,
  sourceName,
  originLabel,
  destinationLabel,
  emptyMessage = "Data saran strategi belum tersedia."
}: AnalisisPotensiTableCardProps) {
  const downloadHandlerRef = React.useRef<(() => void) | null>(null);
  const [hasDownloadHandler, setHasDownloadHandler] = React.useState(false);
  const tableRaw = React.useMemo(() => toTopProdukRaw(rows), [rows]);
  const subtitleParts: string[] = [];
  if (originLabel) subtitleParts.push(`Asal: ${originLabel}`);
  if (destinationLabel) subtitleParts.push(`Tujuan: ${destinationLabel}`);
  const subtitle = subtitleParts.join(" | ");

  const table = (
    <TopProdukTable
      raw={tableRaw}
      unitLabel="-"
      columnMode="potensi_simple"
      valueLabel={titleValue}
      emptyMessage={emptyMessage}
      downloadTitle={title}
      downloadFilename={title.replace(/\s+/g, "_")}
      downloadSource={sourceName ?? undefined}
      onRegisterDownload={(handler) => {
        downloadHandlerRef.current = handler;
        setHasDownloadHandler(Boolean(handler));
      }}
    />
  );

  return (
    <ExpandableCard
      title={title}
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
