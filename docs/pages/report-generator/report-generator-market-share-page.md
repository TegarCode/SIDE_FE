# Report Generator Market Share Page Documentation

## 1. Ringkasan Halaman

- Route: `APP_ROUTES.DATABANK.REPORT_GENERATOR.MARKET_SHARE`
- Path: `/databank/report-generator/market-share`
- Permission: `view_market_share_report_generator`
- Page: `src/pages/report-generator/MarketSharePage.tsx`

Halaman ini dipakai untuk menyusun laporan `Market Share` berdasarkan kombinasi negara/entitas asal, group tujuan, tipe perdagangan, top produk, sumber data, dan tahun perdagangan. Output utama halaman adalah tabel market share dengan rincian produk dan tombol unduh `Snapshot`.

## 2. Struktur Utama

Halaman terdiri dari:

1. Judul halaman `Report Generator Market Share`
2. Banner informasi report generator
3. Panel filter Market Share
4. Card hasil `Laporan Analisis Market Share`
5. Tabel sortable dengan pagination frontend
6. Tombol unduh `Snapshot`

## 3. Banner Informasi

- Komponen: `src/components/report-generator/ReportGeneratorInfoBanner.tsx`

Banner dipakai untuk menjelaskan konteks halaman report generator dan memberi pengantar singkat bahwa generator ini disiapkan untuk penyusunan laporan market share secara sistematis.

## 4. Filter Market Share

- Komponen: `src/components/report-generator/MarketShareFiltersPanel.tsx`
- Page state: `src/pages/report-generator/MarketSharePage.tsx`

Field filter:

- `Negara/Entitas Asal`
- `Group Tujuan`
- `Tipe Perdagangan`
- `Top Produk yang Diambil`
- `Sumber`
- `Tahun Perdagangan`

Aturan field:

- `Negara/Entitas Asal`
  - memakai endpoint `/api/v1/negara`
  - default ke `IDN`
  - tetap bisa diganti user
- `Group Tujuan`
  - memakai endpoint `/api/v1/grupnegara`
  - opsi `Dunia (Semua Negara/Entitas)` selalu ada
  - urutan opsi menampilkan `benua` lebih dulu lalu grup/organisasi lain
- `Tipe Perdagangan`
  - opsi:
    - `EXPORT`
    - `IMPORT`
- `Top Produk yang Diambil`
  - opsi:
    - `5`
    - `10`
    - `20`
    - `50`
- `Sumber`
  - memakai endpoint `/api/v1/data-generator/perdagangan/kode-sumber`
- `Tahun Perdagangan`
  - memakai endpoint `/api/v1/tahun-perdagangan`
  - default ke tahun terbaru

Default filter:

```json
{
  "origin": "IDN",
  "destination": null,
  "strategy1": null,
  "top_n": null,
  "sumber": null,
  "year": "tahun terbaru"
}
```

Catatan interaksi:

- panel filter memakai accordion
- summary accordion menampilkan chip ringkas untuk asal, tujuan, tipe perdagangan, top produk, dan tahun
- badge panel menampilkan status `Filter belum diterapkan` atau `Filter Aktif`
- validasi field baru muncul setelah tombol `Cari Data` ditekan
- tombol `Reset` mengembalikan filter ke default

## 5. Master Data Filter

- Hook negara asal: `src/hooks/data-generator/useDataGeneratorTradeMasterQuery.ts`
- Hook group tujuan: `src/hooks/indonesia/useCountryGeoQueries.ts`
- Hook sumber dan tahun: `src/hooks/data-generator/useDataGeneratorTradeMasterQuery.ts`

Endpoint master:

- `GET /api/v1/negara`
- `GET /api/v1/grupnegara`
- `GET /api/v1/data-generator/perdagangan/kode-sumber`
- `GET /api/v1/tahun-perdagangan`

Catatan:

- origin mencari `IDN` lebih dulu, dengan fallback label `Indonesia`
- label group tujuan tampil apa adanya tanpa prefix `Benua:` atau `Grup:`

## 6. Request Data Laporan

- Hook: `src/hooks/report-generator/useMarketShareReportQuery.ts`
- Service: `src/service/report-generator/marketShare.ts`
- Endpoint: `POST /api/v1/report-generator/market-share/filter`

Payload request:

```json
{
  "origin": "IDN",
  "destination": "ALL",
  "strategy1": "EXPORT",
  "top_n": 10,
  "sumber": "5",
  "year": "2024"
}
```

Catatan:

- query hanya aktif bila semua field filter wajib sudah tersedia
- loading request ditampilkan lewat toast informasi
- error request ditampilkan lewat toast error

## 7. Tabel Hasil Market Share

- Komponen: `src/components/report-generator/MarketShareTableCard.tsx`

Judul card:

- `Laporan Analisis Market Share`

Subtitle card menampilkan:

- `Asal`
- `Tujuan`
- `Tipe Perdagangan`
- `Top Produk`
- `Tahun`
- `Total Data`
- `Sorting berdasarkan kolom ...`

Kolom tabel utama:

- `Negara/Entitas Asal`
- `Negara/Entitas Tujuan`
- `Tipe Perdagangan`
- `Tahun`
- `Total Nilai (Ribu US$)`

Rincian produk per baris:

- `HS Code`
- `Nama Produk`
- `Nilai per Produk (Ribu US$)`
- `Pangsa Ekspor (%)`

Fitur tabel:

- sortable per kolom utama
- sorting dikontrol dari card
- pagination frontend
- pilihan limit baris:
  - `10`
  - `20`
  - `50`
  - `100`
  - `ALL`
- expand row untuk membuka rincian produk
- state kosong memakai `EmptyStatePanel`
- expand card ke modal full-width tetap memakai data yang sama

Catatan sorting:

- nilai numerik string dinormalisasi dulu sebelum dibandingkan
- sorting default memakai kolom `TotalNilai` descending

## 8. Download Laporan

- Service: `src/service/report-generator/marketShare.ts`
- Trigger UI: `src/components/report-generator/MarketShareTableCard.tsx`
- Handler page: `src/pages/report-generator/MarketSharePage.tsx`

Tombol unduh utama:

- `Snapshot`

Opsi format:

- `PDF`
- `Word`

Endpoint unduh:

- `POST /api/v1/report-generator/market-share/snapshot/word`
- `POST /api/v1/report-generator/market-share/snapshot/pdf`

Payload unduh:

```json
{
  "origin": "IDN",
  "destination": "ALL",
  "strategy1": "EXPORT",
  "top_n": 10,
  "sumber": "5",
  "year": "2024"
}
```

Catatan implementasi:

- tombol `Snapshot` diberi warna sukses
- opsi format muncul dari menu kecil inline
- nama file fallback dibentuk dari kombinasi jenis dokumen + kode origin + kode destination
- hasil blob disimpan memakai `file-saver`
- toast dipakai untuk status `loading`, `success`, dan `error`

## 9. Route, Menu, dan Permission

- Route constants: `src/constants/routes.ts`
- Permission constants: `src/constants/permissions.ts`
- Sidebar links: `src/constants/reportGeneratorLinks.ts`
- Sidebar registry: `src/constants/sidebarLinks.ts`
- Nav access: `src/constants/navLinks.ts`
- Route registration: `src/routes/AppRoutes.tsx`

Konfigurasi akses terkait:

- root report generator: `/databank/report-generator`
- halaman Market Share: `/databank/report-generator/market-share`
- permission page: `view_market_share_report_generator`

## 10. Dependency Utama

- `src/pages/report-generator/MarketSharePage.tsx`
- `src/components/report-generator/MarketShareFiltersPanel.tsx`
- `src/components/report-generator/MarketShareTableCard.tsx`
- `src/components/report-generator/ReportGeneratorInfoBanner.tsx`
- `src/hooks/report-generator/useMarketShareReportQuery.ts`
- `src/service/report-generator/marketShare.ts`

## 11. Status

- route halaman aktif
- permission halaman aktif
- menu sidebar aktif
- banner informasi aktif
- filter aktif
- validasi inline aktif
- request data aktif
- tabel utama aktif
- rincian produk expandable aktif
- pagination frontend aktif
- subtitle ringkas hasil aktif
- unduh `Snapshot` aktif
