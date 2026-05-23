# Report Generator RCA & CMSA Page Documentation

## 1. Ringkasan Halaman

- Route: `APP_ROUTES.DATABANK.REPORT_GENERATOR.RCA_CMSA`
- Path: `/databank/report-generator/rca-cmsa`
- Permission: `view_rca_cmsa_report_generator`
- Page: `src/pages/report-generator/RcaCmsaPage.tsx`

Halaman ini dipakai untuk menyusun laporan analisis `RCA` dan `CMSA` berdasarkan kombinasi negara/entitas asal, negara/entitas tujuan, dan jenis analisis. Output utama halaman adalah tabel hasil RCA-CMSA dan tombol unduh dokumen laporan dalam format `Snapshot` atau `Summary`.

## 2. Struktur Utama

Halaman terdiri dari:

1. Judul halaman `Report Generator RCA & CMSA`
2. Banner informasi report generator
3. Panel filter RCA-CMSA
4. Card hasil `Laporan Analisis RCA-CMSA`
5. Tabel sortable dengan pagination frontend
6. Tombol unduh `Snapshot` dan `Summary`

## 3. Banner Informasi

- Komponen: `src/components/report-generator/ReportGeneratorInfoBanner.tsx`

Banner dipakai untuk menjelaskan konteks halaman report generator dan memberi pengantar singkat bahwa generator ini disiapkan untuk penyusunan laporan RCA dan CMSA secara sistematis.

## 4. Filter RCA-CMSA

- Komponen: `src/components/report-generator/RcaCmsaFiltersPanel.tsx`
- Page state: `src/pages/report-generator/RcaCmsaPage.tsx`

Field filter:

- `Negara/Entitas Asal`
- `Negara/Entitas Tujuan`
- `Jenis Analisis`

Aturan field:

- `Negara/Entitas Asal`
  - memakai endpoint `/api/v1/common-negara`
  - default terkunci ke `IDN`
  - field dalam keadaan `disabled`
- `Negara/Entitas Tujuan`
  - memakai endpoint `/api/v1/common-negara-rca-cmsa`
  - wajib dipilih sebelum data dimuat
- `Jenis Analisis`
  - opsi:
    - `ALL`
    - `EXPORT`
    - `IMPORT`
    - `FDI INBOUND`
    - `FDI OUTBOUND`

Default filter:

```json
{
  "origin": "IDN",
  "destination": null,
  "strategy1": "ALL"
}
```

Catatan interaksi:

- panel filter memakai accordion
- summary accordion menampilkan chip ringkas untuk asal, tujuan, dan jenis analisis
- badge panel menampilkan status `Filter belum diterapkan` atau `Filter Aktif`
- validasi `Negara/Entitas Tujuan wajib dipilih` baru muncul setelah tombol `Cari Data` ditekan
- tombol `Reset` mengembalikan filter ke default

## 5. Master Data Filter

- Hook negara asal: `src/hooks/indonesia/useCountryGeoQueries.ts`
- Hook negara tujuan RCA-CMSA: `src/hooks/indonesia/useCountryGeoQueries.ts`

Endpoint master:

- `GET /api/v1/common-negara`
- `GET /api/v1/common-negara-rca-cmsa`

Catatan:

- opsi origin dan destination diurutkan alfabetis
- origin mencari `IDN` lebih dulu, dengan fallback label `Indonesia`

## 6. Request Data Laporan

- Hook: `src/hooks/report-generator/useRcaCmsaReportQuery.ts`
- Service: `src/service/report-generator/rcaCmsa.ts`
- Endpoint: `POST /api/v1/report-generator/rca-cmsa/filter`

Payload request:

```json
{
  "origin": "IDN",
  "destination": "CHN",
  "strategy1": "EXPORT"
}
```

Catatan:

- query hanya aktif bila `origin`, `destination`, dan `strategy1` sudah tersedia
- `strategy1` dinormalisasi ke huruf besar di level service
- loading request ditampilkan lewat toast informasi
- error request ditampilkan lewat toast error

## 7. Tabel Hasil RCA-CMSA

- Komponen: `src/components/report-generator/RcaCmsaTableCard.tsx`
- Tabel: `src/components/ui/SortableDataTable.tsx`

Judul card:

- `Laporan Analisis RCA-CMSA`

Subtitle card menampilkan:

- `Asal`
- `Tujuan`
- `Jenis Analisis`
- `Total Data`
- `Sorting berdasarkan kolom ...`

Kolom tabel:

- `HS Code`
- `Nama Produk`
- `{originLabel}`
- `{destinationLabel}`
- `Strategi`
- `Asal Dunia (Ribu US$)`
- `Tujuan Dunia  (Ribu US$)`
- `Impor RI dari Dunia (Ribu US$)`
- `Impor RI dari Negara/Entitas (Ribu US$)`
- `Ekspor RI ke Negara/Entitas (Ribu US$)`
- `Impor Negara/Entitas dari Dunia (Ribu US$)`

Fitur tabel:

- sortable per kolom
- sorting dikontrol dari parent card
- pagination frontend
- pilihan limit baris:
  - `10`
  - `20`
  - `50`
  - `100`
  - `ALL`
- state kosong memakai `EmptyStatePanel`
- expand card ke modal full-width tetap memakai data yang sama

Catatan sorting:

- nilai numerik string seperti `1.130,00` dinormalisasi dulu sebelum dibandingkan
- sorting default memakai kolom `HsCode` ascending

## 8. Download Laporan

- Service: `src/service/report-generator/rcaCmsa.ts`
- Trigger UI: `src/components/report-generator/RcaCmsaTableCard.tsx`
- Handler page: `src/pages/report-generator/RcaCmsaPage.tsx`

Tombol unduh utama:

- `Snapshot`
- `Summary`

Masing-masing tombol membuka opsi:

- `PDF`
- `Word`

Endpoint unduh:

- `POST /api/v1/report-generator/rca-cmsa/snapshot/word`
- `POST /api/v1/report-generator/rca-cmsa/snapshot/pdf`
- `POST /api/v1/report-generator/rca-cmsa/summary/word`
- `POST /api/v1/report-generator/rca-cmsa/summary/pdf`

Payload unduh:

```json
{
  "origin": "IDN",
  "destination": "USA"
}
```

Catatan implementasi:

- tombol `Snapshot` dan `Summary` diberi warna berbeda
- opsi format muncul dari menu kecil inline, bukan empat tombol terpisah
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
- halaman RCA-CMSA: `/databank/report-generator/rca-cmsa`
- permission page: `view_rca_cmsa_report_generator`
- root report generator akan diarahkan ke halaman pertama yang diizinkan user

## 10. Dependency Utama

- `src/pages/report-generator/RcaCmsaPage.tsx`
- `src/components/report-generator/RcaCmsaFiltersPanel.tsx`
- `src/components/report-generator/RcaCmsaTableCard.tsx`
- `src/components/report-generator/ReportGeneratorInfoBanner.tsx`
- `src/hooks/report-generator/useRcaCmsaReportQuery.ts`
- `src/service/report-generator/rcaCmsa.ts`
- `src/components/ui/SortableDataTable.tsx`

## 11. Status

- route halaman aktif
- permission halaman aktif
- menu sidebar aktif
- banner informasi aktif
- filter single select aktif
- validasi inline aktif
- request data aktif
- tabel sortable aktif
- pagination frontend aktif
- subtitle ringkas hasil aktif
- unduh `Snapshot` aktif
- unduh `Summary` aktif
