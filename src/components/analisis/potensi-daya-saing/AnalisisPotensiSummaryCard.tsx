function formatNumberId(value: number) {
  return value.toLocaleString("id-ID");
}

type AnalisisPotensiSummaryCardProps = {
  title: string;
  count: number;
  subtitle: string;
  sumValue?: number | null;
  accent?: "indigo" | "emerald" | "sky" | "amber" | "rose";
};

const accentMap = {
  indigo: { from: "#384AA0", to: "#5E7ADD" },
  emerald: { from: "#059669", to: "#34D399" },
  sky: { from: "#0284C7", to: "#38BDF8" },
  amber: { from: "#B45309", to: "#F59E0B" },
  rose: { from: "#BE123C", to: "#FB7185" }
} as const;

export function AnalisisPotensiSummaryCard({
  title,
  count,
  subtitle,
  sumValue,
  accent = "indigo"
}: AnalisisPotensiSummaryCardProps) {
  const tone = accentMap[accent];

  return (
    <div className="h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div
        className="flex h-full flex-col px-4 pb-3 pt-3 text-white"
        style={{
          backgroundImage: `
            linear-gradient(135deg, ${tone.from}, ${tone.to}),
            radial-gradient(1200px 400px at -10% -50%, rgba(255,255,255,.15), transparent 60%),
            radial-gradient(800px 300px at 110% 10%, rgba(255,255,255,.10), transparent 55%)
          `
        }}
      >
        <div className="text-[11px] uppercase tracking-wide text-white/85">
          {title}
        </div>
        <div className="mt-1 truncate text-2xl font-extrabold tabular-nums sm:text-3xl">
          {formatNumberId(count)}
        </div>
        <div className="mt-auto pt-1">
          <div className="text-[11px] text-white/85">{subtitle}</div>
          {sumValue != null ? (
            <div className="mt-1 text-xs text-white/75">
              Total Nilai: {formatNumberId(sumValue)}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
