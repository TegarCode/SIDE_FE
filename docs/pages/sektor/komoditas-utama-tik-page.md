# Komoditas Utama TIK Page Documentation

## 1. Ringkasan Halaman

- Route: `APP_ROUTES.SECTOR.KOMODITAS_UTAMA.TIK`
- Page: `src/pages/sektor/komoditas-utama/TikPage.tsx`

Halaman ini menampilkan analitik perdagangan sektor TIK Indonesia ke global, terdiri dari overview negara, peta sebaran, top mitra, filter rute, dan produk sektor.

## 2. Filter HS Code

- Komponen: `src/components/filters/HsCodeFiltersPanel.tsx`
- Endpoint: `GET /api/v1/hscode-tik`

Catatan:

- default semua HS Code aktif
- panel memakai grouped multi select
- filter atas khusus untuk overview sektor
- validasi filter dilakukan di level komponen:
  - minimal satu HS Code harus dipilih
  - tombol `Cari Data` disable jika draft belum valid

## 3. Overview Negara

- Komponen:
  - `src/components/sektor/komoditas-utama/tik/TikTradeHeroSection.tsx`
  - `src/components/sektor/komoditas-utama/tik/TikTradeOverviewGrid.tsx`
- Endpoint: `GET /api/v1/sektor-prioritas/ekonomi-digital/nilai-arus-tik`

Visual:

- `Total Ekspor`
- `Total Impor`
- `Total Perdagangan`
- peta sebaran
- top mitra

Catatan:

- metric default `Total Perdagangan`
- peta mendukung expand dan unduh PNG
- top mitra memakai `TopMitraTable`
- request overview menampilkan toast `loading`, `success`, dan `error`
- subtitle peta dan top mitra menampilkan tahun aktif dan unit

## 4. Filter Rute dan HS Code

- Komponen: `src/components/filters/BilateralHsCodeRouteFiltersPanel.tsx`

Field:

- `Asal`
- `Tujuan`
- `HS Code`

Default:

- `Asal = IDN`
- `Tujuan = CHN`

Validasi:

- asal wajib minimal satu negara/entitas
- tujuan wajib minimal satu negara/entitas
- HS Code wajib minimal satu item
- pesan validasi tampil langsung di panel filter

## 5. Produk Sektor

- Komponen: `src/components/sektor/komoditas-utama/tik/TikTradeProductsSection.tsx`
- Endpoint: `GET /api/v1/sektor-prioritas/ekonomi-digital/nilai-arus-tik-produk`

Visual:

- mode `table`
- mode `treemap`

Catatan:

- card mendukung `expand` dan `download`
- tabel memakai `TopProdukTable`
- treemap memakai `TradeProductsTreemapChart`
- pangsa dihitung dari `nilai produk / total nilai semua produk` per tahun untuk metric aktif
- request produk menampilkan toast `loading`, `success`, dan `error`
- treemap mendukung pilih tahun aktif dan limit produk
- hasil unduh menyertakan title, subtitle, asal, tujuan, dan sumber

## 6. Unduh Ringkasan PDF

- Endpoint: `POST /api/v1/sektor-prioritas/ekonomi-digital/summary/pdf`

Payload:

- `negara.reporter`
- `negara.hscode`
- `produk.origin`
- `produk.dest`
- `produk.hscode`

## 7. Status

- Overview sektor aktif
- Peta sebaran aktif
- Top mitra aktif
- Produk table/treemap aktif
- Unduh ringkasan PDF aktif
