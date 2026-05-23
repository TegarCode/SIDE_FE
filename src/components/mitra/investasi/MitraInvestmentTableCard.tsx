import React from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { TopMitraTable } from "@/components/ui/TopMitraTable";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";

type MitraInvestmentTableCardProps = {
  title: string;
  raw: unknown;
  unitLabel: string;
  sourceName?: string | null;
  latestYear: number | null;
  prevYear: number | null;
  loading: boolean;
  emptyMessage: string;
};

export function MitraInvestmentTableCard({
  title,
  raw,
  unitLabel,
  sourceName,
  latestYear,
  prevYear,
  loading,
  emptyMessage
}: MitraInvestmentTableCardProps) {
  const [downloadHandler, setDownloadHandler] = React.useState<
    (() => void) | null
  >(null);
  const [sortColumnLabel, setSortColumnLabel] = React.useState(
    latestYear != null ? String(latestYear) : "Negara/Entitas"
  );

  const handleRegisterDownload = React.useCallback(
    (handler: (() => void) | null) => {
      setDownloadHandler(() => handler);
    },
    []
  );

  const subtitle =
    latestYear != null && prevYear != null
      ? `${prevYear}-${latestYear} | Unit: ${unitLabel} | Nomor berdasarkan urutan ${sortColumnLabel}`
      : `Unit: ${unitLabel}`;

  const table = (
    <TopMitraTable
      raw={raw}
      unitLabel={unitLabel}
      onSortColumnChange={setSortColumnLabel}
      downloadTitle={title}
      downloadFilename={title.replace(/[^\w]+/g, "_")}
      downloadSource={sourceName ?? undefined}
      onRegisterDownload={handleRegisterDownload}
      emptyMessage={emptyMessage}
      valueLabel="Nilai Investasi"
      totalLabel="Total investasi"
      changeLabel="Perubahan investasi YoY"
      showBalanceDetail={false}
      showDeltaColumns
      showDeltaPercentColumn={false}
      deltaColumnLabel="Perubahan"
      showShareDetail={false}
      displayZeroAsDash
      showLimitControl={false}
    />
  );

  return (
    <ExpandableCard
      title={title}
      subtitle={subtitle}
      className="min-w-0 min-h-120"
      modalSize="full"
      actions={
        <IconTooltip label="Unduh Excel">
          <span>
            <Button
              type="button"
              variant="outline"
              disabled={!downloadHandler}
              onClick={() => downloadHandler?.()}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label={`Unduh Excel ${title}`}
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
            </Button>
          </span>
        </IconTooltip>
      }
      expandedContent={table}
    >
      <div className="flex h-full flex-col">
        <div className="min-h-0 flex-1">
          {loading ? <TableSkeleton rows={8} /> : table}
        </div>
        <p className="mt-2 text-right text-[11px] text-slate-500">
          Sumber: {sourceName ?? "-"}
        </p>
      </div>
    </ExpandableCard>
  );
}
