# Home Page Documentation

## 1. Ringkasan Halaman

- Nama halaman: `Home`
- Route: `/`
- Komponen page: `src/pages/HomePage.tsx`
- Status: `Implemented`
- Tipe akses: `Public`

Home adalah landing page utama yang merangkai 9 section visual + data:

1. `HomeHeroSection`
2. `HomeFloatingImageSection`
3. `HomePainPointSection`
4. `HomeFeatureSection`
5. `HomeSectorSection`
6. `HomeSideViewsSection`
7. `HomeFaqSection`
8. `HomeContactSection`
9. `HomeCtaSection`

## 2. Akses dan Hak Akses

### 2.1 Akses Route

- Route `/` tidak memakai guard permission.
- User tanpa login tetap bisa membuka halaman.

### 2.2 Kaitan dengan Permission

- Halaman Home tidak memfilter konten berdasarkan permission.
- CTA FAQ mengarah ke route publik `/faq`.
- Beberapa CTA lain mengarah ke route modul (contoh: `/indonesia/diplomasi-ekonomi`) yang pada implementasi akhir biasanya bergantung permission user di modul tersebut.

## 3. Data yang Ditarik (API)

Semua request Home menggunakan `apiClient` (`axios`) dengan `baseURL = env.apiBaseUrl`.
Sumber:

- `src/service/httpClient.ts`
- `src/service/homeService.ts`

### 3.1 GET `/api/tutorial-playlists`

- Dipakai oleh: `HomeHeroSection`
- Hook: `useTutorialPlaylistsQuery()`
- Query key: `["home", "tutorial-playlists"]`
- Stale time: `5 menit`

Data yang dipakai UI:

- `id`
- `slug`
- `title`
- `url` (wajib; item tanpa `url` dibuang)
- `description`
- `thumbnail`

Normalisasi penting:

- Mendukung bentuk payload array langsung atau nested (`data.data`).
- Field API fleksibel: `desc/description`, `thumbnail_url/thumbnail`.

### 3.2 GET `/api/analytics/overview?months=6`

- Dipakai oleh: `HomeSideViewsSection`
- Hook: `useHomeOverviewQuery(6)`
- Query key: `["home", "overview", 6]`
- Stale time: `5 menit`

Data yang dipakai UI:

- `history[]` berisi `{ label, views }`
- `avgPerPeriod`

Fallback behavior:

- Jika `history` kosong/tidak valid, pakai `FALLBACK_HOME_VIEWS_HISTORY` dari `src/constants/home.ts`.

### 3.3 GET `/api/faqs`

- Dipakai oleh: `HomeFaqSection`
- Hook: `useFaqTopicsQuery()`
- Query key: `["home", "faq-topics"]`
- Stale time: `10 menit`

Data yang dipakai UI:

- `topics[]`
  - `topic`
  - `summary` (opsional)
  - `items[]`
    - `question`
    - `answer`

Normalisasi penting:

- Parser mendukung payload berlapis dan format string JSON.
- Mendukung struktur flat FAQ dan struktur bertopik.
- Aliasing field dijembatani (`question/pertanyaan/title/...`, `answer/jawaban/content/...`).

### 3.4 POST `/api/contact`

- Dipakai oleh: `HomeContactSection`
- Hook: `useContactMutation()`
- Mutation key: `["home", "contact"]`

Request payload:

- `nama: string`
- `email: string`
- `jenis: "PERTANYAAN" | "MASUKAN" | "SARAN"`
- `pesan: string`

Validasi client-side (Yup):

- `nama` wajib, min 2
- `email` wajib, format email valid
- `jenis` wajib, hanya 3 nilai valid
- `pesan` wajib, min 10

Response handling:

- Jika `status === false`, dianggap error dan tampilkan pesan gagal.
- Jika sukses, tampilkan pesan sukses dan reset form.

## 4. Section vs Sumber Data

### 4.1 Section Dinamis (pakai API)

- `HomeHeroSection` -> Daftar Video Tutorial
- `HomeSideViewsSection` -> analytics overview
- `HomeFaqSection` -> FAQ topics
- `HomeContactSection` -> submit form contact

### 4.2 Section Statis (tanpa API)

- `HomeFloatingImageSection`
- `HomePainPointSection`
- `HomeFeatureSection`
- `HomeSectorSection`
- `HomeCtaSection`

Konten statis diambil dari:

- konstanta lokal dalam file section
- aset lokal (`src/assets/images/...`)
- beberapa URL gambar eksternal pada `HomeSectorSection`

## 5. Interaksi Utama User

1. User membuka halaman Home -> section tampil bertahap dengan animasi.
2. User klik `Tonton Video Panduan` -> modal video playlist terbuka.
3. User bisa memilih item video dari daftar playlist.
4. User melihat statistik akses SIDE di chart.
5. User buka FAQ accordion per item.
6. User bisa klik `Lihat Semua FAQ` untuk pindah ke halaman FAQ penuh (`/faq`).
7. User kirim form kontak -> validasi -> request `POST /api/contact`.

## 6. State Error dan Fallback

- Daftar Video Tutorial gagal: tampil pesan error di Hero.
- Analytics belum tersedia: chart tetap tampil dengan fallback history.
- FAQ gagal/empty: tampil pesan `FAQ gagal dimuat` atau `Belum ada data FAQ`.
- Contact submit gagal: tampil feedback error pada form.

## 7. Dependensi Teknis

- React Query: caching query dan mutation
- Framer Motion: animasi section/elemen
- Chart.js + react-chartjs-2: grafik akses
- Yup: validasi form kontak
- Heroicons: ikon UI

## 8. File Terkait

- Page:
  - `src/pages/HomePage.tsx`
- Sections:
  - `src/components/home/*`
- Hooks:
  - `src/hooks/home/useTutorialPlaylistsQuery.ts`
  - `src/hooks/home/useHomeOverviewQuery.ts`
  - `src/hooks/home/useFaqTopicsQuery.ts`
  - `src/hooks/home/useContactMutation.ts`
- Services:
  - `src/service/homeService.ts`
  - `src/service/httpClient.ts`
- Validasi dan konstanta:
  - `src/validators/contact.ts`
  - `src/constants/home.ts`
  - `src/type/home.ts`
