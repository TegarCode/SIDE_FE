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
import type { AnalisisRscaTbiRow } from "@/type/analisis";

type Props = {
  rows: AnalisisRscaTbiRow[];
};

type Quadrant = "A" | "B" | "C" | "D";

type MovementPoint = {
  movementKey: string;
  kodeHs: string;
  namaProduk: string;
  rsca2019: number;
  tbi2019: number;
  pm2019: Quadrant;
  rsca2023: number;
  tbi2023: number;
  pm2023: Quadrant;
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
const topMovementLimit = 50;

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

function asQuadrant(value: string | null | undefined): Quadrant | null {
  const normalized = String(value ?? "")
    .trim()
    .toUpperCase();

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

export function AnalisisRSCATBIMovementTrajectoryChart({ rows }: Props) {
  const [showMovedOnly, setShowMovedOnly] = React.useState(false);
  const [showTopOnly, setShowTopOnly] = React.useState(true);
  const [transitionFilter, setTransitionFilter] = React.useState("ALL");
  const [hoveredMovementKey, setHoveredMovementKey] = React.useState<
    string | null
  >(null);

  const movements = React.useMemo<MovementPoint[]>(
    () =>
      rows
        .map((row, index) => {
          const pm2019 = asQuadrant(row.pm2019);
          const pm2023 = asQuadrant(row.pm2023);
          const { rsca2019, tbi2019, rsca2023, tbi2023 } = row;

          if (
            !pm2019 ||
            !pm2023 ||
            rsca2019 == null ||
            tbi2019 == null ||
            rsca2023 == null ||
            tbi2023 == null
          ) {
            return null;
          }

          const kodeHs = row.kode ?? row.hs4;
          const movement: `${Quadrant}->${Quadrant}` = `${pm2019}->${pm2023}`;
          const jitterX = deterministicJitter(kodeHs, 1);
          const jitterY = deterministicJitter(kodeHs, 2);

          return {
            movementKey: `${kodeHs}-${index}`,
            kodeHs,
            namaProduk: row.nama,
            rsca2019,
            tbi2019,
            pm2019,
            rsca2023,
            tbi2023,
            pm2023,
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
        .sort((left, right) => right.distance - left.distance),
    [rows]
  );

  const transitionOptions = React.useMemo(
    () => Array.from(new Set(movements.map((item) => item.movement))).sort(),
    [movements]
  );

  const visibleMovements = React.useMemo(() => {
    const filtered = movements.filter((item) => {
      if (showMovedOnly && item.pm2019 === item.pm2023) return false;
      if (transitionFilter !== "ALL" && item.movement !== transitionFilter) {
        return false;
      }
      return true;
    });

    return showTopOnly ? filtered.slice(0, topMovementLimit) : filtered;
  }, [movements, showMovedOnly, showTopOnly, transitionFilter]);

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

  if (!movements.length) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
        Data RSCA, TBI, dan PM 2019-2023 belum cukup untuk menampilkan movement
        trajectory.
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Movement Trajectory RSCA - TBI
          </h3>
          <p className="mt-1 max-w-3xl text-sm text-slate-500">
            Peta before-after dari posisi produk pada 2019 ke 2023. Titik abu
            menunjukkan awal, titik berwarna menunjukkan posisi akhir, dan panah
            menunjukkan arah pergerakan. Sumbu X memakai TBI, sedangkan sumbu Y
            memakai RSCA.
          </p>
        </div>

        <div className="flex flex-col gap-2 text-xs sm:flex-row sm:items-center">
          <label className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2">
            <input
              type="checkbox"
              checked={showMovedOnly}
              onChange={(event) => setShowMovedOnly(event.target.checked)}
            />
            Hanya berpindah
          </label>
          <label className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2">
            <input
              type="checkbox"
              checked={showTopOnly}
              onChange={(event) => setShowTopOnly(event.target.checked)}
            />
            Top 50
          </label>
          <select
            value={transitionFilter}
            onChange={(event) => setTransitionFilter(event.target.value)}
            className="rounded-md border border-slate-200 bg-white px-3 py-2"
          >
            <option value="ALL">Semua transisi</option>
            {transitionOptions.map((transition) => (
              <option key={transition} value={transition}>
                {transition}
              </option>
            ))}
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
          <div className="font-semibold text-slate-900">{movements.length}</div>
          <div className="text-slate-500">Data valid</div>
        </div>
        <div className="rounded-lg border border-slate-200 px-3 py-2">
          <div className="font-semibold text-slate-900">
            {transitionOptions.length}
          </div>
          <div className="text-slate-500">Jenis transisi</div>
        </div>
      </div>

      <RscaTbiScatterLegend />

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
              label={{ value: "TBI", position: "insideBottom", offset: -12 }}
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
              {endPoints.map((entry) => (
                <Cell
                  key={`${entry.kodeHs}-${entry.movement}`}
                  fill={entry.color}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
