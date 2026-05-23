export function RscaTbiQuadrantOverlay() {
  return (
    <div className="pointer-events-none absolute inset-x-8 inset-y-6 z-0 grid grid-cols-2 grid-rows-2 select-none text-[42px] font-semibold text-slate-300/35 md:text-[54px]">
      <div className="flex items-center justify-center">B</div>
      <div className="flex items-center justify-center">A</div>
      <div className="flex items-center justify-center">D</div>
      <div className="flex items-center justify-center">C</div>
    </div>
  );
}
