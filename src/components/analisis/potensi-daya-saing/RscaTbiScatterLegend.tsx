const stableMovementColors = [
  { label: "A -> A", color: "#059669", description: "tetap di kuadran A" },
  { label: "B -> B", color: "#0284C7", description: "tetap di kuadran B" },
  { label: "C -> C", color: "#D97706", description: "tetap di kuadran C" },
  { label: "D -> D", color: "#64748B", description: "tetap di kuadran D" }
];

const transitionSamples = [
  { label: "B -> A", color: "#22C55E" },
  { label: "A -> D", color: "#DC2626" },
  { label: "C -> A", color: "#06B6D4" }
];

export function RscaTbiScatterLegend() {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
      <div className="text-xs font-semibold uppercase text-slate-500">
        Panduan scatter
      </div>

      <div className="mt-3 grid gap-3 text-xs md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
          <div className="flex items-center gap-2 font-semibold text-slate-700">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-400 opacity-60" />
            Titik 2019
          </div>
          <p className="mt-1 text-slate-500">Posisi awal produk.</p>
        </div>

        <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
          <div className="flex items-center gap-2 font-semibold text-slate-700">
            <span className="h-3.5 w-3.5 rounded-full bg-[#384AA0]" />
            Titik 2023
          </div>
          <p className="mt-1 text-slate-500">
            Posisi akhir produk. Warna mengikuti movement PM.
          </p>
        </div>

        <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
          <div className="flex items-center gap-2 font-semibold text-slate-700">
            <span className="relative inline-flex h-3 w-8 items-center">
              <span className="h-px w-7 bg-slate-500" />
              <span className="-ml-1 h-0 w-0 border-y-[4px] border-l-[6px] border-y-transparent border-l-slate-500" />
            </span>
            Panah pendek
          </div>
          <p className="mt-1 text-slate-500">
            Arah ringkas perpindahan. Hover titik untuk garis penuh.
          </p>
        </div>

        <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
          <div className="flex items-center gap-2 font-semibold text-slate-700">
            <span className="h-px w-8 bg-slate-900 opacity-45" />
            Garis tengah
          </div>
          <p className="mt-1 text-slate-500">
            Pembatas TBI = 0 di sumbu X dan RSCA = 0 di sumbu Y.
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
        Kuadran ditandai samar di tengah plot:{" "}
        <span className="font-semibold text-slate-700">B | A</span> di bagian
        atas dan <span className="font-semibold text-slate-700">D | C</span> di
        bagian bawah.
      </div>

      <div className="mt-3 grid gap-3 text-xs xl:grid-cols-[1fr_1fr]">
        <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
          <div className="font-semibold text-slate-700">
            Warna saat tetap di kuadran
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {stableMovementColors.map((item) => (
              <span
                key={item.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700"
                title={item.description}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
          <div className="font-semibold text-slate-700">
            Warna saat berpindah kuadran
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {transitionSamples.map((item) => (
              <span
                key={item.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
              </span>
            ))}
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-500">
              Transisi lain mengikuti warna movement di tooltip dan tabel.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
