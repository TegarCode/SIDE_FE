# SIDE Frontend

Frontend React + TypeScript untuk aplikasi `SIDE` (`Sistem Informasi Diplomasi Ekonomi`). Repo ini menangani halaman publik, login, dashboard Indonesia, negara mitra, sektor prioritas, analisis, data generator, report generator, serta integrasi chatbot.

## Fitur Utama

- Halaman publik: home, FAQ, login, not found, dan under construction
- Dashboard Indonesia: diplomasi ekonomi, kerja sama bilateral, indikator ekonomi, infrastruktur
- Dashboard negara mitra: overview, perdagangan, investasi, pariwisata, jasa
- Dashboard sektor: TIK, energi, mineral kritis, kesehatan/farmasi, hilirisasi, pangan, pertahanan
- Modul analisis: produk komoditas, potensi daya saing, IDE, operational risk, geopolitik perdagangan
- Databank:
  - data generator perdagangan, pariwisata, investasi, jasa, indikator ekonomi
  - report generator RCA-CMSA, market share, kerja sama perdagangan
- Chatbot dan widget pendukung di level aplikasi

## Stack

- `react` 19
- `typescript`
- `vite`
- `tailwindcss` v4
- `react-router-dom`
- `@tanstack/react-query`
- `axios`
- `echarts`, `recharts`, `chart.js`, `react-chartjs-2`
- `leaflet`, `react-leaflet`, `react-globe.gl`, `three`
- `eslint`, `prettier`, `husky`, `lint-staged`

## Prasyarat

- Node.js 20 atau lebih baru
- npm 10 atau lebih baru

## Instalasi

```bash
npm install
```

Jika hook git belum aktif:

```bash
npm run prepare
```

## Menjalankan Project

Development:

```bash
npm run dev
```

Development + type-check watch:

```bash
npm run dev:full
```

Build production:

```bash
npm run build
```

Preview hasil build:

```bash
npm run preview
```

## Environment

Project ini memakai file:

- `.env.example`
- `.env.development`
- `.env.production`

Contoh variabel yang dipakai:

```env
VITE_APP_NAME="SIDE"
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_USERWAY_ACCOUNT_KEY=
VITE_REQUIRE_AUTH_ACCESS=true
```

Keterangan:

- `VITE_APP_NAME`: nama aplikasi yang tampil di frontend
- `VITE_API_BASE_URL`: base URL backend API
- `VITE_USERWAY_ACCOUNT_KEY`: key integrasi UserWay jika dipakai
- `VITE_REQUIRE_AUTH_ACCESS`: kontrol akses halaman protected

Catatan git:

- file `.env*` sebaiknya tidak di-track kecuali `.env.example`
- jika file env sudah pernah ter-track, jalankan `git rm --cached <nama-file>`

## Akses dan Routing

Halaman protected dikontrol dari:

- `src/constants/routes.ts`
- `src/service/accessControl.ts`

Prefix route protected meliputi:

- `/analisis`
- `/indonesia`
- `/negara-mitra`
- `/sektor`
- `/databank/data-generator`
- `/databank/report-generator`

Jika `VITE_REQUIRE_AUTH_ACCESS=true`, user harus lolos mekanisme akses untuk membuka area tersebut.

## Script

- `npm run dev`: menjalankan Vite dev server
- `npm run dev:full`: menjalankan dev server dan type-check watch paralel
- `npm run build`: type-check lalu build
- `npm run preview`: preview build
- `npm run type-check`: cek TypeScript
- `npm run lint`: cek ESLint
- `npm run lint:fix`: auto-fix lint
- `npm run format`: format file dengan Prettier
- `npm run format:check`: cek format tanpa mengubah file
- `npm run prepare`: aktivasi Husky

## Struktur Folder

```text
docs/
public/
src/
  assets/
  components/
  constants/
  context/
  hooks/
  pages/
  routes/
  service/
  styles/
  type/
  utils/
  validators/
```

Ringkasan:

- `src/pages`: entry halaman per modul
- `src/components`: komponen UI, section, chart, filter, layout, chatbot
- `src/hooks`: query/mutation dan logic per domain
- `src/service`: layer HTTP client dan service API per modul
- `src/constants`: env, route, navigation, permission, dan static config
- `src/context`: provider global aplikasi
- `src/utils`: helper umum seperti export chart dan formatting
- `src/validators`: validasi form dan filter
- `docs`: dokumentasi tambahan project

## Alur Kerja Harian

Jalankan pengecekan sebelum commit:

```bash
npm run lint
npm run type-check
npm run format:check
```

Jika perlu auto-fix:

```bash
npm run lint:fix
npm run format
```

## Catatan

- `lint-staged` berjalan saat `git commit`, bukan saat `git push`
- file yang di-format atau di-fix hanya file yang di-stage ketika commit
- jangan commit file env sensitif ke repository
