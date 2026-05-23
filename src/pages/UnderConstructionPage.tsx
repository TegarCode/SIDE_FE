import { Link } from "react-router-dom";

export function UnderConstructionPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-white">
      <div className="pointer-events-none absolute -top-20 -left-32 h-96 w-96 rounded-full bg-blue-400 opacity-30 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 -bottom-20 h-96 w-96 rounded-full bg-blue-500 opacity-30 blur-3xl" />

      <main className="relative z-10 mx-auto w-full max-w-2xl px-4 text-center">
        <div className="mb-4 flex justify-center">
          <img
            src="/images/under-contruction.png"
            alt="Halaman sedang dalam pengembangan"
            className="max-h-64 w-auto object-contain drop-shadow-md"
          />
        </div>

        <p className="text-sm font-semibold tracking-widest text-blue-600">
          SEDANG DALAM PENGEMBANGAN
        </p>
        <h1 className="mt-2 text-4xl font-extrabold text-blue-700 sm:text-5xl">
          Fitur Belum Siap Digunakan
        </h1>

        <p className="mt-3 text-lg font-semibold text-gray-900">
          Kami masih menyempurnakan halaman ini.
        </p>
        <p className="mt-2 text-gray-500">
          Silakan kembali ke beranda atau gunakan menu lain yang sudah tersedia
          untuk sementara waktu.
        </p>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700 active:scale-[.98]"
          >
            Kembali ke Beranda
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-lg bg-blue-50 px-5 py-2.5 font-semibold text-blue-700 transition hover:bg-blue-100 active:scale-[.98]"
          >
            Masuk / Ganti Akun
          </Link>
        </div>
      </main>
    </div>
  );
}
