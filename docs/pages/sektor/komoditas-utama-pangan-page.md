# Komoditas Utama Pangan Page Documentation

## 1. Ringkasan Halaman

- Route: `APP_ROUTES.SECTOR.KOMODITAS_UTAMA.PANGAN`
- Page: `src/pages/sektor/komoditas-utama/PanganPage.tsx`

Halaman ini menampilkan analitik perdagangan sektor pangan Indonesia ke global.

## 2. Filter HS Code

- Komponen: `src/components/filters/HsCodeFiltersPanel.tsx`
- Endpoint: `GET /api/v1/hscode-pangan`

Validasi:

- minimal satu HS Code wajib dipilih

## 3. Overview Negara

- Komponen:
  - `src/components/sektor/komoditas-utama/pangan/PanganTradeHeroSection.tsx`
  - `src/components/sektor/komoditas-utama/pangan/PanganTradeOverviewGrid.tsx`
- Endpoint: `GET /api/v1/sektor-prioritas/nilai-sektor-pangan`

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

- Komponen: `src/components/sektor/komoditas-utama/pangan/PanganTradeProductsSection.tsx`
- Endpoint: `GET /api/v1/sektor-prioritas/nilai-sektor-produk-pangan`

Catatan:

- mode `table` dan `treemap`
- pangsa dihitung ulang dari total produk metric aktif per tahun
- request produk memakai toast `loading`, `success`, dan `error`

## 6. Unduh Ringkasan PDF

- Endpoint: `POST /api/v1/sektor-prioritas/nilai-sektor-pangan/summary/pdf`

## 7. Status

- Overview aktif
- Produk aktif
- Unduh ringkasan PDF aktif
