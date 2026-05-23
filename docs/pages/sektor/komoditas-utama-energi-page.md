# Komoditas Utama Energi Page Documentation

## 1. Ringkasan Halaman

- Route: `APP_ROUTES.SECTOR.KOMODITAS_UTAMA.ENERGI`
- Page: `src/pages/sektor/komoditas-utama/EnergiPage.tsx`

Halaman ini menampilkan analitik perdagangan sektor energi Indonesia ke global dengan pola yang setara dengan halaman TIK.

## 2. Filter HS Code

- Komponen: `src/components/filters/HsCodeFiltersPanel.tsx`
- Endpoint: `GET /api/v1/hscode-energi`

Validasi:

- minimal satu HS Code wajib dipilih sebelum submit

## 3. Overview Negara

- Komponen:
  - `src/components/sektor/komoditas-utama/energi/EnergyTradeHeroSection.tsx`
  - `src/components/sektor/komoditas-utama/energi/EnergyTradeOverviewGrid.tsx`
- Endpoint: `GET /api/v1/sektor-prioritas/nilai-sektor-energi`

Visual:

- summary card ekspor, impor, total perdagangan
- peta sebaran
- top mitra

Toast:

- request overview memakai toast `loading`, `success`, dan `error`

## 4. Filter Rute dan HS Code

- Komponen: `src/components/filters/BilateralHsCodeRouteFiltersPanel.tsx`
- default:
  - `Asal = IDN`
  - `Tujuan = CHN`

Validasi:

- asal, tujuan, dan HS Code wajib terisi

## 5. Produk Sektor

- Komponen: `src/components/sektor/komoditas-utama/energi/EnergyTradeProductsSection.tsx`
- Endpoint: `GET /api/v1/sektor-prioritas/nilai-sektor-produk-energi`

Catatan:

- mode `table` dan `treemap`
- pangsa dihitung ulang dari total produk metric aktif per tahun
- card mendukung `expand` dan `download`
- request produk memakai toast `loading`, `success`, dan `error`

## 6. Unduh Ringkasan PDF

- Endpoint: `POST /api/v1/sektor-prioritas/nilai-sektor-energi/summary/pdf`

## 7. Status

- Overview aktif
- Produk aktif
- Unduh ringkasan PDF aktif
