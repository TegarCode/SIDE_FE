Refactor halaman [NAMA_HALAMAN] di `side_fe` agar konsisten dengan boilerplate project ini.

Tujuan:

1. Gunakan struktur folder existing (`src/pages`, `src/components`, `src/hooks`, `src/service`, `src/constants`, `src/type`, `src/validators`, `docs/pages`).
2. Pakai TypeScript strict (hindari `any`), reusable component di `src/components/ui` jika ada elemen berulang.
3. Pisahkan concern:
   - UI di page/section component
   - data fetching di hooks React Query
   - transformasi API di service
   - konstanta di constants
   - schema validasi di validators
   - type di `src/type/*`
4. Routing wajib pakai constants di `src/constants/routes.ts` (tanpa hardcoded path).
5. Jika halaman pakai akses menu, ikuti pola permission yang sekarang (`navLinks.ts`, `permissions.ts`, `utils/access.ts`).
6. Pertahankan visual style existing (Tailwind + Framer Motion), rapikan spacing/typography supaya konsisten.
7. Tambahkan/rapikan dokumentasi halaman di `docs/pages/[nama]-page.md`.
8. Setelah edit, jalankan `npm run type-check` dan pastikan lolos.

Output yang saya mau:

- Daftar file yang diubah
- Ringkasan perubahan per file
- Hasil type-check
- Commit message yang cocok
