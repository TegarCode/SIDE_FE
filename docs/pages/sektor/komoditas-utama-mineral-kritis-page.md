# Komoditas Utama Mineral Kritis Page Documentation

## 1. Ringkasan Halaman

- Route: `APP_ROUTES.SECTOR.KOMODITAS_UTAMA.MINERAL_KRITIS`
- Page: `src/pages/sektor/komoditas-utama/MineralKritisPage.tsx`

Halaman ini menampilkan analitik perdagangan sektor mineral kritis Indonesia ke global.

## 2. Filter HS Code

- Komponen: `src/components/filters/HsCodeFiltersPanel.tsx`
- Endpoint: `GET /api/v1/hscode-mineral-kritis`

Validasi:

- minimal satu HS Code wajib dipilih

## 3. Overview Negara

- Komponen:
  - `src/components/sektor/komoditas-utama/mineral-kritis/MineralKritisTradeHeroSection.tsx`
  - `src/components/sektor/komoditas-utama/mineral-kritis/MineralKritisTradeOverviewGrid.tsx`
- Endpoint: `GET /api/v1/sektor-prioritas/nilai-sektor-mineral-kritis`

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

- Komponen: `src/components/sektor/komoditas-utama/mineral-kritis/MineralKritisTradeProductsSection.tsx`
- Endpoint: `GET /api/v1/sektor-prioritas/nilai-sektor-produk-mineral-kritis`

Catatan:

- mode `table` dan `treemap`
- pangsa dihitung ulang dari total produk metric aktif per tahun
- request produk memakai toast `loading`, `success`, dan `error`

## 6. Unduh Ringkasan PDF

- Endpoint: `POST /api/v1/sektor-prioritas/nilai-sektor-mineral-kritis/summary/pdf`

## 7. Status

- Overview aktif
- Produk aktif
- Unduh ringkasan PDF aktif
