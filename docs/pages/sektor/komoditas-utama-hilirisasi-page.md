# Komoditas Utama Hilirisasi Page Documentation

## 1. Ringkasan Halaman

- Route: `APP_ROUTES.SECTOR.KOMODITAS_UTAMA.HILIRISASI`
- Page: `src/pages/sektor/komoditas-utama/HilirisasiPage.tsx`

Halaman ini menampilkan analitik perdagangan sektor hilirisasi Indonesia ke global, termasuk overview negara, tren per sektor, dan produk sektor.

## 2. Filter HS Code

- Komponen: `src/components/filters/HsCodeFiltersPanel.tsx`
- Endpoint: `GET /api/v1/hscode-hilirisasi`

Validasi:

- minimal satu HS Code wajib dipilih

## 3. Overview Negara

- Komponen:
  - `src/components/sektor/komoditas-utama/hilirisasi/HilirisasiTradeHeroSection.tsx`
  - `src/components/sektor/komoditas-utama/hilirisasi/HilirisasiTradeOverviewGrid.tsx`
- Endpoint: `GET /api/v1/sektor-prioritas/nilai-sektor-hilirisasi`

Catatan:

- summary card hilirisasi dihitung dari agregasi `items[].nilai_perdagangan` dan `items[].neraca` per tahun
- request overview memakai toast `loading`, `success`, dan `error`

## 4. Filter Rute dan HS Code

- Komponen: `src/components/filters/BilateralHsCodeRouteFiltersPanel.tsx`
- default:
  - `Asal = IDN`
  - `Tujuan = CHN`

Validasi:

- asal, tujuan, dan HS Code wajib terisi

## 5. Tren Per Sektor

- Komponen: `src/components/sektor/komoditas-utama/hilirisasi/HilirisasiSectorTrendSection.tsx`
- Komponen chart: `src/components/ui/charts/TradeAnnualAreaChart.tsx`
- Sumber data: endpoint produk hilirisasi

Catatan:

- chart di-split berdasarkan kategori `sektor`
- title chart mengikuti metric aktif dan nama sektor
- tiap card mendukung tooltip daftar HS Code sektor, expand, dan unduh PNG
- section menampilkan skeleton chart saat request produk masih loading

## 6. Produk Sektor

- Komponen: `src/components/sektor/komoditas-utama/hilirisasi/HilirisasiTradeProductsSection.tsx`
- Endpoint: `GET /api/v1/sektor-prioritas/nilai-sektor-produk-hilirisasi`

Catatan response:

- endpoint produk baru memakai `data.sektor_produk[]`
- setiap grup sektor di-flatten ke daftar produk untuk tabel dan treemap
- field `sektor` tetap dipertahankan untuk section `Tren Per Sektor`
- pangsa dihitung ulang dari total produk metric aktif per tahun
- request produk memakai toast `loading`, `success`, dan `error`

## 7. Unduh Ringkasan PDF

- Endpoint: `POST /api/v1/sektor-prioritas/nilai-sektor-hilirisasi/summary/pdf`

## 8. Status

- Overview aktif
- Tren per sektor aktif
- Produk aktif
- Unduh ringkasan PDF aktif
