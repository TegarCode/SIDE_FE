import { EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/outline";

export function Footer() {
  return (
    <footer className="bg-linear-to-r from-[#5E7ADD] to-[#384AA0] py-10 text-white">
      <div className="container mx-auto px-8 md:px-12">
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:gap-12">
          <div className="flex w-full flex-col space-y-4 md:w-1/2 lg:w-1/3">
            <div className="mb-2 flex items-center gap-3">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-lg font-bold tracking-[0.24em] text-white ring-1 ring-white/25">
                PF
              </div>
              <div>
                <span className="block text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
                  Portfolio
                </span>
                <span className="block text-lg font-semibold text-white">
                  Trade Analytics Demo
                </span>
              </div>
            </div>

            <div>
              <span className="block text-2xl font-bold">SIDE</span>
              <p className="mt-1 text-sm leading-relaxed text-white/90">
                SIDE adalah platform digital untuk data dan visualisasi analitik
                perdagangan, dengan grafik dinamis, peta interaktif, dan
                laporan yang dapat diunduh.
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col space-y-6 text-sm md:w-1/2 lg:w-2/3">
            <div className="space-y-2">
              <p className="font-semibold">Portfolio Demo Team</p>
              <p>Remote-ready showcase project for trade analytics workflows.</p>
              <p>Contact window: Monday-Friday | 09.00-17.00</p>

              <div className="mt-2 flex items-center gap-2">
                <EnvelopeIcon className="h-4 w-4" />
                <a
                  href="mailto:portfolio@example.com"
                  className="underline transition hover:text-gray-200"
                >
                  portfolio@example.com
                </a>
              </div>

              <div className="mt-1 flex items-center gap-2">
                <PhoneIcon className="h-4 w-4" />
                <span>+62 000 0000 0000</span>
              </div>

              <p className="pt-1 text-xs text-white/80">
                External organization links have been removed in this portfolio
                copy.
              </p>
            </div>

            <div className="border-t border-white/30 pt-4">
              <p className="flex items-center gap-2 text-sm font-bold">
                <span>(c) 2026 SIDE Portfolio Demo. Showcase build.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
