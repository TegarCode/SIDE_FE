import type { ComponentProps, ReactNode } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { MapHeatLayer } from "@/components/ui/MapHeatLayer";
import { Skeleton } from "@/components/ui/Skeleton";
import { SortableDataTable } from "@/components/ui/SortableDataTable";
import { cn } from "@/utils/cn";
import type { DiplomasiOverviewData } from "@/type/indonesiaDiplomasi";

type BaseDiplomasiTabPanelProps = {
  overview: DiplomasiOverviewData | null;
  loading: boolean;
  error: string | null;
  periodLabel: string;
  unitLabel: string;
  mapTitle: string;
  tableTitle: string;
  tableCaption: string;
  mapClassName?: string;
  expandedMapClassName?: string;
  mapLayerKey?: string;
  mapLayerProps?: Omit<
    ComponentProps<typeof MapHeatLayer>,
    | "data"
    | "title"
    | "unitLabel"
    | "currencyPrefix"
    | "geojsonUrl"
    | "className"
  >;
  renderTableContent?: (params: {
    tableData: DiplomasiOverviewData["table"];
    raw: DiplomasiOverviewData["raw"];
    expanded: boolean;
    unitLabel: string;
  }) => ReactNode;
  tableHeaderActions?: ReactNode;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
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

function extractSourceLabel(raw: unknown): string | null {
  if (!isRecord(raw)) return null;

  const pickText = (value: unknown): string | null => {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (isRecord(value)) {
      const fromName = value.name;
      if (typeof fromName === "string" && fromName.trim())
        return fromName.trim();
    }
    return null;
  };

  const directCandidates: unknown[] = [
    raw.sumber,
    raw.source,
    isRecord(raw.meta) ? raw.meta.sumber : null,
    isRecord(raw.meta) ? raw.meta.source : null,
    isRecord(raw.data) ? (raw.data as Record<string, unknown>).sumber : null,
    isRecord(raw.data) ? (raw.data as Record<string, unknown>).source : null
  ];

  for (const candidate of directCandidates) {
    const picked = pickText(candidate);
    if (picked) return picked;
  }

  return null;
}

function PanelSkeleton() {
  return (
    <section className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[2.35fr_1fr]">
        <Skeleton className="h-90 rounded-2xl" />
        <Skeleton className="h-90 rounded-2xl" />
      </div>
    </section>
  );
}

type OverviewTableContentProps = {
  tableData: DiplomasiOverviewData["table"];
  expanded?: boolean;
};

function OverviewTableContent({
  tableData,
  expanded = false
}: OverviewTableContentProps) {
  if (!tableData) {
    return (
      <div className="flex h-full items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-slate-600">
        Tidak ada tabel terstruktur pada respons tab ini. Data mentah tetap
        berhasil dimuat.
      </div>
    );
  }

  return (
    <div
      className={cn(
        "h-full overflow-hidden rounded-xl border border-slate-200 bg-white",
        expanded && "min-h-[62vh]"
      )}
    >
      <SortableDataTable
        columns={tableData.columns}
        rows={tableData.rows}
        className="h-full"
        tableClassName={cn("w-full", expanded && "min-w-[900px]")}
      />
    </div>
  );
}

export function BaseDiplomasiTabPanel({
  overview,
  loading,
  error,
  periodLabel,
  unitLabel,
  mapTitle,
  tableTitle,
  tableCaption,
  mapClassName = "h-72 w-full",
  expandedMapClassName = "h-[70vh] w-full",
  mapLayerKey,
  mapLayerProps,
  renderTableContent,
  tableHeaderActions
}: BaseDiplomasiTabPanelProps) {
  if (loading) return <PanelSkeleton />;

  if (error) {
    return (
      <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        <div className="flex items-start gap-2">
          <ExclamationTriangleIcon className="mt-0.5 h-4 w-4" />
          {error}
        </div>
      </section>
    );
  }

  const tableData = overview?.table ?? null;
  const rawOverview = overview?.raw ?? null;
  const mapData = extractMapData(rawOverview);
  const sourceLabel = extractSourceLabel(rawOverview);

  return (
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
          title={mapTitle}
          subtitle={`${periodLabel} - Unit: ${unitLabel}`}
          className="min-w-0 h-full"
          expandLabel="Perbesar peta"
          modalSize="full"
          expandedContent={
            <MapHeatLayer
              key={mapLayerKey ? `${mapLayerKey}-expanded` : undefined}
              className={expandedMapClassName}
              data={mapData}
              title={mapTitle}
              unitLabel={unitLabel}
              currencyPrefix={unitLabel}
              geojsonUrl="/assets/world-countries.geojson"
              {...mapLayerProps}
            />
          }
        >
          <div className="flex h-full flex-col">
            <MapHeatLayer
              key={mapLayerKey}
              className={mapClassName}
              data={mapData}
              title={mapTitle}
              unitLabel={unitLabel}
              currencyPrefix={unitLabel}
              geojsonUrl="/assets/world-countries.geojson"
              {...mapLayerProps}
            />
            {sourceLabel ? (
              <p className="mt-2 text-right text-[11px] text-slate-500">
                Sumber: {sourceLabel}
              </p>
            ) : null}
          </div>
        </ExpandableCard>

        <ExpandableCard
          title={tableTitle}
          subtitle={tableCaption}
          actions={tableHeaderActions}
          className="min-w-0 h-full min-h-115"
          contentClassName="flex h-full flex-col"
          expandLabel="Perbesar tabel"
          modalSize="2xl"
          expandedContent={
            renderTableContent ? (
              renderTableContent({
                tableData,
                raw: rawOverview,
                expanded: true,
                unitLabel
              })
            ) : (
              <OverviewTableContent tableData={tableData} expanded />
            )
          }
        >
          <div className="flex h-full flex-col">
            <div className="min-h-0 flex-1">
              {renderTableContent ? (
                renderTableContent({
                  tableData,
                  raw: rawOverview,
                  expanded: false,
                  unitLabel
                })
              ) : (
                <OverviewTableContent tableData={tableData} />
              )}
            </div>
            {sourceLabel ? (
              <p className="mt-2 text-right text-[11px] text-slate-500">
                Sumber: {sourceLabel}
              </p>
            ) : null}
          </div>
        </ExpandableCard>
      </div>
    </section>
  );
}
