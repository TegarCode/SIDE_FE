import React from "react";
import {
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis
} from "recharts";
import { RscaTbiMovementArrowLine } from "@/components/analisis/potensi-daya-saing/RscaTbiMovementArrowLine";
import { RscaTbiQuadrantOverlay } from "@/components/analisis/potensi-daya-saing/RscaTbiQuadrantOverlay";
import { RscaTbiScatterLegend } from "@/components/analisis/potensi-daya-saing/RscaTbiScatterLegend";
import type { AnalisisRscaTbiComparisonRow } from "@/type/analisis";

type Props = {
  rows: AnalisisRscaTbiComparisonRow[];
  originLabel?: string;
  destinationLabel?: string;
};

type Quadrant = "A" | "B" | "C" | "D";
type Perspective = "asal" | "tujuan";

type MovementPoint = {
  movementKey: string;
  kodeHs: string;
  namaProduk: string;
  rsca2019: number;
  rsca2023: number;
  tbi2019: number;
  tbi2023: number;
  pm2019: Quadrant;
  pm2023: Quadrant;
  strategy2019: string | null;
  strategy2023: string | null;
  movement: `${Quadrant}->${Quadrant}`;
  distance: number;
  plotRsca2019: number;
  plotTbi2019: number;
  plotRsca2023: number;
  plotTbi2023: number;
  color: string;
};

type MovementDot = MovementPoint & {
  year: "2019" | "2023";
  x: number;
  y: number;
  z: number;
};

type MovementTooltipProps = {
  active?: boolean;
  payload?: Array<{
    payload?: MovementDot;
  }>;
};

type DotEventPoint = {
  payload?: MovementDot;
};

const quadrants: Quadrant[] = ["A", "B", "C", "D"];

const transitionColorMap: Partial<Record<`${Quadrant}->${Quadrant}`, string>> =
  {
    "A->A": "#059669",
    "B->B": "#0284C7",
    "C->C": "#D97706",
    "D->D": "#64748B",
    "B->A": "#22C55E",
    "C->A": "#06B6D4",
    "D->A": "#14B8A6",
    "A->B": "#2563EB",
    "C->B": "#4F46E5",
    "D->B": "#7C3AED",
    "A->C": "#F59E0B",
    "B->C": "#EA580C",
    "D->C": "#A16207",
    "A->D": "#DC2626",
    "B->D": "#E11D48",
    "C->D": "#BE123C"
  };

function asString(value: string | number | null | undefined) {
  if (value == null || value === "") return "";
  return String(value);
}

function asNullableNumber(value: string | number | null | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function asQuadrant(value: string | number | null | undefined) {
  const normalized = asString(value).trim().toUpperCase();
  return quadrants.includes(normalized as Quadrant)
    ? (normalized as Quadrant)
    : null;
}

function calculateMovementDistance(
  rsca2023: number,
  rsca2019: number,
  tbi2023: number,
  tbi2019: number
) {
  return Math.sqrt((rsca2023 - rsca2019) ** 2 + (tbi2023 - tbi2019) ** 2);
}

function clampAxis(value: number) {
  return Math.max(-1, Math.min(1, value));
}

function deterministicJitter(seed: string, salt: number) {
  let hash = 0;
  const source = `${seed}:${salt}`;

  for (let index = 0; index < source.length; index += 1) {
    hash = (hash * 31 + source.charCodeAt(index)) % 9973;
  }

  return ((hash % 1000) / 1000 - 0.5) * 0.036;
}

function transitionColor(movement: `${Quadrant}->${Quadrant}`) {
  return transitionColorMap[movement] ?? "#384AA0";
}

function formatMetric(value: number) {
  return value.toFixed(4);
}

function formatDistance(value: number) {
  return value.toFixed(4);
}

function getShortArrowSegment(item: MovementPoint) {
  const deltaX = item.plotTbi2023 - item.plotTbi2019;
  const deltaY = item.plotRsca2023 - item.plotRsca2019;
  const length = Math.sqrt(deltaX ** 2 + deltaY ** 2);

  if (length < 0.01) return null;

  const segmentLength = Math.min(length, 0.12);
  return [
    {
      x: item.plotTbi2023 - (deltaX / length) * segmentLength,
      y: item.plotRsca2023 - (deltaY / length) * segmentLength
    },
    {
      x: item.plotTbi2023,
      y: item.plotRsca2023
    }
  ] as const;
}

function fieldPrefix(perspective: Perspective) {
  return perspective === "asal" ? "Asal" : "Tujuan";
}

function perspectiveLabel(
  perspective: Perspective,
  originLabel?: string,
  destinationLabel?: string
) {
  return perspective === "asal"
    ? originLabel || "Negara 1"
    : destinationLabel || "Negara 2";
}

function transformComparisonRows(
  rows: AnalisisRscaTbiComparisonRow[],
  perspective: Perspective
): MovementPoint[] {
  const prefix = fieldPrefix(perspective);

  return rows
    .map((row, index) => {
      const kodeHs = asString(row["Kode HS"]);
      const namaProduk = asString(row["Nama Produk"]) || "-";
      const rsca2019 = asNullableNumber(row[`RSCA ${prefix} 2019`]);
      const rsca2023 = asNullableNumber(row[`RSCA ${prefix} 2023`]);
      const tbi2019 = asNullableNumber(row[`TBI ${prefix} 2019`]);
      const tbi2023 = asNullableNumber(row[`TBI ${prefix} 2023`]);
      const pm2019 = asQuadrant(row[`PM ${prefix} 2019`]);
      const pm2023 = asQuadrant(row[`PM ${prefix} 2023`]);

      if (
        !kodeHs ||
        !pm2019 ||
        !pm2023 ||
        rsca2019 == null ||
        rsca2023 == null ||
        tbi2019 == null ||
        tbi2023 == null
      ) {
        return null;
      }

      const movement: `${Quadrant}->${Quadrant}` = `${pm2019}->${pm2023}`;
      const jitterX = deterministicJitter(kodeHs, 1);
      const jitterY = deterministicJitter(kodeHs, 2);

      return {
        movementKey: `${kodeHs}-${perspective}-${index}`,
        kodeHs,
        namaProduk,
        rsca2019,
        rsca2023,
        tbi2019,
        tbi2023,
        pm2019,
        pm2023,
        strategy2019: asString(row["Strategy 2019"]) || null,
        strategy2023: asString(row["Strategy 2023"]) || null,
        movement,
        distance: calculateMovementDistance(
          rsca2023,
          rsca2019,
          tbi2023,
          tbi2019
        ),
        plotRsca2019: clampAxis(rsca2019 + jitterX),
        plotTbi2019: clampAxis(tbi2019 + jitterY),
        plotRsca2023: clampAxis(rsca2023 + jitterX),
        plotTbi2023: clampAxis(tbi2023 + jitterY),
        color: transitionColor(movement)
      };
    })
    .filter((item): item is MovementPoint => item != null)
    .sort((left, right) => right.distance - left.distance);
}

function MovementTooltip({ active, payload }: MovementTooltipProps) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;

  return (
    <div className="max-w-[320px] rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-lg">
      <div className="font-semibold text-slate-900">{point.kodeHs}</div>
      <div className="mt-1 line-clamp-2 text-slate-600">{point.namaProduk}</div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-md bg-slate-50 p-2">
          <div className="font-semibold text-slate-700">2019</div>
          <div>RSCA: {formatMetric(point.rsca2019)}</div>
          <div>TBI: {formatMetric(point.tbi2019)}</div>
          <div>PM: {point.pm2019}</div>
        </div>
        <div className="rounded-md bg-slate-50 p-2">
          <div className="font-semibold text-slate-700">2023</div>
          <div>RSCA: {formatMetric(point.rsca2023)}</div>
          <div>TBI: {formatMetric(point.tbi2023)}</div>
          <div>PM: {point.pm2023}</div>
        </div>
      </div>
      <div className="mt-3 rounded-md bg-indigo-50 p-2 font-semibold text-[#384AA0]">
        Movement: {point.movement} | Distance: {formatDistance(point.distance)}
      </div>
    </div>
  );
}

export function CountryComparisonQuadrantAnalysisSection({
  rows,
  originLabel,
  destinationLabel
}: Props) {
  const [perspective, setPerspective] = React.useState<Perspective>("asal");
  const [onlyMoved, setOnlyMoved] = React.useState(false);
  const [onlyQuadrantChanges, setOnlyQuadrantChanges] = React.useState(false);
  const [topLimit, setTopLimit] = React.useState<50 | 100>(50);
  const [hoveredMovementKey, setHoveredMovementKey] = React.useState<
    string | null
  >(null);

  const movements = React.useMemo(
    () => transformComparisonRows(rows, perspective),
    [perspective, rows]
  );

  const filteredMovements = React.useMemo(
    () =>
      movements.filter((item) => {
        if (onlyMoved && item.distance === 0) return false;
        if (onlyQuadrantChanges && item.pm2019 === item.pm2023) return false;
        return true;
      }),
    [movements, onlyMoved, onlyQuadrantChanges]
  );

  const visibleMovements = React.useMemo(
    () => filteredMovements.slice(0, topLimit),
    [filteredMovements, topLimit]
  );

  const matrix = React.useMemo(
    () =>
      quadrants.map((from) =>
        quadrants.map((to) => {
          const movement: `${Quadrant}->${Quadrant}` = `${from}->${to}`;
          return {
            from,
            to,
            movement,
            count: filteredMovements.filter(
              (item) => item.pm2019 === from && item.pm2023 === to
            ).length,
            color: transitionColor(movement)
          };
        })
      ),
    [filteredMovements]
  );

  const startPoints = visibleMovements.map<MovementDot>((item) => ({
    ...item,
    year: "2019",
    x: item.plotTbi2019,
    y: item.plotRsca2019,
    z: 26
  }));

  const endPoints = visibleMovements.map<MovementDot>((item) => ({
    ...item,
    year: "2023",
    x: item.plotTbi2023,
    y: item.plotRsca2023,
    z: 78
  }));
  const defaultArrowMovements = visibleMovements
    .map((item) => ({ item, segment: getShortArrowSegment(item) }))
    .filter(
      (
        entry
      ): entry is {
        item: MovementPoint;
        segment: ReturnType<typeof getShortArrowSegment> & {};
      } => entry.segment != null
    );
  const hoveredMovement =
    visibleMovements.find((item) => item.movementKey === hoveredMovementKey) ??
    null;
  const handleDotMouseEnter = React.useCallback((point: DotEventPoint) => {
    setHoveredMovementKey(point.payload?.movementKey ?? null);
  }, []);
  const handleDotMouseLeave = React.useCallback(() => {
    setHoveredMovementKey(null);
  }, []);

  const activePerspectiveLabel = perspectiveLabel(
    perspective,
    originLabel,
    destinationLabel
  );

  if (!rows.length) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
        Data Country Comparison belum tersedia untuk visualisasi quadrant.
      </section>
    );
  }

  if (!movements.length) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
        Data RSCA, TBI, dan PM 2019-2023 belum cukup untuk visualisasi Country
        Comparison.
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Country Comparison Quadrant Analysis
          </h3>
          <p className="mt-1 max-w-3xl text-sm text-slate-500">
            Ringkasan perpindahan quadrant RSCA dan TBI pada 2019 ke 2023 untuk
            perspektif {activePerspectiveLabel}. Sumbu X memakai TBI, sedangkan
            sumbu Y memakai RSCA.
          </p>
        </div>

        <div className="flex flex-col gap-2 text-xs sm:flex-row sm:items-center">
          <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-1 font-semibold text-slate-700">
            {(["asal", "tujuan"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setPerspective(item)}
                aria-pressed={perspective === item}
                className={`rounded px-3 py-1.5 transition-colors ${
                  perspective === item
                    ? "bg-white text-[#384AA0] shadow-sm"
                    : "hover:bg-white/80 hover:text-slate-950"
                }`}
              >
                {item === "asal" ? "Negara 1" : "Negara 2"}
              </button>
            ))}
          </div>
          <label className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2">
            <input
              type="checkbox"
              checked={onlyMoved}
              onChange={(event) => setOnlyMoved(event.target.checked)}
            />
            Only moved
          </label>
          <label className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2">
            <input
              type="checkbox"
              checked={onlyQuadrantChanges}
              onChange={(event) => setOnlyQuadrantChanges(event.target.checked)}
            />
            Only quadrant changes
          </label>
          <select
            value={topLimit}
            onChange={(event) =>
              setTopLimit(Number(event.target.value) as 50 | 100)
            }
            className="rounded-md border border-slate-200 bg-white px-3 py-2"
          >
            <option value={50}>Top 50</option>
            <option value={100}>Top 100</option>
          </select>
        </div>
      </div>

      <div className="grid gap-3 text-xs sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 px-3 py-2">
          <div className="font-semibold text-slate-900">
            {visibleMovements.length}
          </div>
          <div className="text-slate-500">Ditampilkan</div>
        </div>
        <div className="rounded-lg border border-slate-200 px-3 py-2">
          <div className="font-semibold text-slate-900">
            {filteredMovements.length}
          </div>
          <div className="text-slate-500">Sesuai filter</div>
        </div>
        <div className="rounded-lg border border-slate-200 px-3 py-2">
          <div className="font-semibold text-slate-900">
            {
              filteredMovements.filter((item) => item.pm2019 !== item.pm2023)
                .length
            }
          </div>
          <div className="text-slate-500">Berubah quadrant</div>
        </div>
      </div>

      <div>
        <div className="mb-2 text-xs font-semibold uppercase text-slate-500">
          Movement Summary Matrix
        </div>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <div className="min-w-[560px] bg-white p-3">
            <div className="grid grid-cols-[72px_repeat(4,minmax(92px,1fr))] gap-2 text-xs">
              <div />
              {quadrants.map((to) => (
                <div
                  key={to}
                  className="rounded-md bg-slate-50 px-3 py-2 text-center font-semibold text-slate-600"
                >
                  Ke {to}
                </div>
              ))}
              {matrix.map((row, rowIndex) => (
                <React.Fragment key={quadrants[rowIndex]}>
                  <div className="rounded-md bg-slate-50 px-3 py-4 text-center font-semibold text-slate-600">
                    Dari {quadrants[rowIndex]}
                  </div>
                  {row.map((item) => (
                    <div
                      key={item.movement}
                      className="rounded-md border border-slate-200 px-3 py-3 transition hover:bg-slate-50"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-700">
                          {item.movement}
                        </span>
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                      </div>
                      <div className="mt-2 text-lg font-semibold text-slate-900">
                        {item.count}
                      </div>
                      <div className="text-[11px] text-slate-500">produk</div>
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-2 text-xs font-semibold uppercase text-slate-500">
          Quadrant Movement Scatter
        </div>
        <div className="mb-3">
          <RscaTbiScatterLegend />
        </div>
        <div className="relative h-[520px] rounded-lg border border-slate-200 p-3">
          <RscaTbiQuadrantOverlay />
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 18, right: 26, bottom: 28, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="x"
                type="number"
                domain={[-1, 1]}
                tickLine={false}
                axisLine={false}
                label={{
                  value: "TBI",
                  position: "insideBottom",
                  offset: -12
                }}
              />
              <YAxis
                dataKey="y"
                type="number"
                domain={[-1, 1]}
                tickLine={false}
                axisLine={false}
                label={{ value: "RSCA", angle: -90, position: "insideLeft" }}
              />
              <ZAxis dataKey="z" range={[28, 90]} />
              <ReferenceLine x={0} stroke="#0F172A" strokeOpacity={0.45} />
              <ReferenceLine y={0} stroke="#0F172A" strokeOpacity={0.45} />
              {defaultArrowMovements.map(({ item, segment }, index) => (
                <ReferenceLine
                  key={`${item.kodeHs}-${item.movement}-${index}`}
                  segment={segment}
                  stroke={item.color}
                  strokeWidth={1.4}
                  strokeOpacity={item.pm2019 === item.pm2023 ? 0.35 : 0.78}
                  ifOverflow="visible"
                  shape={<RscaTbiMovementArrowLine />}
                />
              ))}
              {hoveredMovement ? (
                <ReferenceLine
                  segment={[
                    {
                      x: hoveredMovement.plotTbi2019,
                      y: hoveredMovement.plotRsca2019
                    },
                    {
                      x: hoveredMovement.plotTbi2023,
                      y: hoveredMovement.plotRsca2023
                    }
                  ]}
                  stroke={hoveredMovement.color}
                  strokeWidth={2}
                  strokeOpacity={0.95}
                  ifOverflow="visible"
                  shape={<RscaTbiMovementArrowLine />}
                />
              ) : null}
              <Tooltip content={<MovementTooltip />} />
              <Scatter
                name="2019"
                data={startPoints}
                fill="#94A3B8"
                fillOpacity={0.36}
                stroke="#64748B"
                strokeOpacity={0.4}
                onMouseEnter={handleDotMouseEnter}
                onMouseLeave={handleDotMouseLeave}
              />
              <Scatter
                name="2023"
                data={endPoints}
                fill="#384AA0"
                onMouseEnter={handleDotMouseEnter}
                onMouseLeave={handleDotMouseLeave}
              >
                {endPoints.map((entry, index) => (
                  <Cell
                    key={`${entry.kodeHs}-${entry.movement}-${index}`}
                    fill={entry.color}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <div className="mb-2 text-xs font-semibold uppercase text-slate-500">
          Top Movement Products
        </div>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-[920px] text-sm">
            <thead className="bg-slate-50">
              <tr className="text-xs uppercase text-slate-600">
                <th className="p-3 text-left">No</th>
                <th className="p-3 text-left">Kode HS</th>
                <th className="p-3 text-left">Nama Produk</th>
                <th className="p-3 text-left">Movement</th>
                <th className="p-3 text-right">Distance</th>
                <th className="p-3 text-left">Strategy 2019</th>
                <th className="p-3 text-left">Strategy 2023</th>
              </tr>
            </thead>
            <tbody>
              {visibleMovements.length ? (
                visibleMovements.slice(0, 12).map((item, index) => (
                  <tr
                    key={`${item.kodeHs}-${item.movement}-${index}`}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3 font-semibold text-slate-900">
                      {item.kodeHs}
                    </td>
                    <td className="max-w-[320px] p-3">{item.namaProduk}</td>
                    <td className="p-3">
                      <span
                        className="inline-flex rounded-full px-2 py-1 text-xs font-semibold text-white"
                        style={{ backgroundColor: item.color }}
                      >
                        {item.movement}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {formatDistance(item.distance)}
                    </td>
                    <td className="p-3">{item.strategy2019 ?? "-"}</td>
                    <td className="p-3">{item.strategy2023 ?? "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="p-6 text-center text-sm text-slate-500"
                    colSpan={7}
                  >
                    Tidak ada produk yang sesuai dengan filter visualisasi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
