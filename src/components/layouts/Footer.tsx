import { EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";
import logoBskln from "@/assets/images/logobskln.png";
import logoKemlu from "@/assets/images/logo-kemlu.png";

export function Footer() {
  return (
    <footer className="bg-linear-to-r from-[#5E7ADD] to-[#384AA0] py-10 text-white">
      <div className="container mx-auto px-8 md:px-12">
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:gap-12">
          <div className="flex w-full flex-col space-y-4 md:w-1/2 lg:w-1/3">
            <div className="mb-2 flex gap-3">
              <img
                src={logoKemlu}
                alt="Logo Kementerian Luar Negeri RI"
                className="h-14 w-auto"
              />
              <img
                src={logoBskln}
                alt="Logo BSKLN Kementerian Luar Negeri RI"
                className="h-14 w-auto"
              />
            </div>

            <div>
              <span className="block text-2xl font-bold">SIDE</span>
              <p className="mt-1 text-sm leading-relaxed text-white/90">
                SIDE adalah platform digital untuk data dan visualisasi
                diplomasi ekonomi Indonesia, dengan grafik dinamis, peta
                interaktif, dan laporan yang dapat diunduh.
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col space-y-6 text-sm md:w-1/2 lg:w-2/3">
            <div className="space-y-2">
              <p className="font-semibold">
                Badan Strategi Kebijakan Luar Negeri Kementerian Luar Negeri RI
              </p>
              <p>
                Jl. Taman Pejambon No. 6, Senen, Jakarta Pusat, DKI Jakarta,
                10410
              </p>
              <p>07.30-16.00 WIB (Senin-Kamis) | 07.30-16.30 WIB (Jumat)</p>

              <div className="mt-2 flex items-center gap-2">
                <EnvelopeIcon className="h-4 w-4" />
                <a
                  href="mailto:data1.pskikad@kemlu.go.id"
                  className="underline transition hover:text-gray-200"
                >
                  data1.pskikad@kemlu.go.id
                </a>
              </div>

              <div className="mt-1 flex items-center gap-2">
                <PhoneIcon className="h-4 w-4" />
                <span>+62 21 3813480</span>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-3">
              <a
                href="https://www.facebook.com/p/BSKLNKemlu-100068774974595/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
              >
                <FaFacebookF className="h-4 w-4" />
              </a>
              <a
                href="https://www.instagram.com/bskln.kemlu/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
              >
                <FaInstagram className="h-4 w-4" />
              </a>
              <a
                href="https://www.youtube.com/@bsklnkemlu2051"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
              >
                <FaYoutube className="h-4 w-4" />
              </a>
            </div>

            <div className="border-t border-white/30 pt-4">
              <p className="flex items-center gap-2 text-sm font-bold">
                <span>© 2026 SIDE by BSKLN. Seluruh hak cipta dilindungi.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
