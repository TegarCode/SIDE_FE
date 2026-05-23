# Report Generator Kerjasama Perdagangan Page Documentation

## 1. Ringkasan Halaman

- Route: `APP_ROUTES.DATABANK.REPORT_GENERATOR.KERJASAMA_PERDAGANGAN`
- Path: `/databank/report-generator/kerjasama-perdagangan`
- Permission: `view_kerjasama_perdagangan_report_generator`
- Page: `src/pages/report-generator/KerjasamaPerdaganganPage.tsx`

Halaman ini dipakai untuk menyusun laporan `Kerjasama Perdagangan` berdasarkan negara asal, satu atau beberapa negara tujuan, sumber data, serta rentang tahun perdagangan. Output utama halaman adalah tabel tren metrik perdagangan per pasangan negara dan tombol unduh `Snapshot`.

## 2. Struktur Utama

Halaman terdiri dari:

1. Judul halaman `Report Generator Kerjasama Perdagangan`
2. Banner informasi report generator
3. Panel filter Kerjasama Perdagangan
4. Card hasil `Laporan Analisis Kerjasama Perdagangan`
5. Tabel tren expandable dengan pagination frontend
6. Tombol unduh `Snapshot`

## 3. Banner Informasi

- Komponen: `src/components/report-generator/ReportGeneratorInfoBanner.tsx`

Banner dipakai untuk menjelaskan konteks halaman report generator dan memberi pengantar singkat bahwa generator ini disiapkan untuk merangkum dinamika kerjasama perdagangan dalam format laporan yang lebih terarah.

## 4. Filter Kerjasama Perdagangan

- Komponen: `src/components/report-generator/KerjasamaPerdaganganFiltersPanel.tsx`
- Page state: `src/pages/report-generator/KerjasamaPerdaganganPage.tsx`

Field filter:

- `Negara/Entitas Asal`
- `Negara/Entitas Tujuan`
- `Sumber`
- `Tahun Awal`
- `Tahun Akhir`

Aturan field:

- `Negara/Entitas Asal`
  - memakai endpoint `/api/v1/negara`
  - default ke `IDN`
  - tetap bisa diganti user
- `Negara/Entitas Tujuan`
  - memakai endpoint `/api/v1/negara`
  - multi-select
  - opsi tujuan akan mengecualikan negara asal yang sedang aktif
- `Sumber`
  - memakai endpoint `/api/v1/data-generator/perdagangan/kode-sumber`
  - default ke nilai sumber terkecil
- `Tahun Awal`
  - memakai endpoint `/api/v1/tahun-perdagangan`
  - default ke satu tahun sebelum tahun terbaru
- `Tahun Akhir`
  - memakai endpoint `/api/v1/tahun-perdagangan`
  - default ke tahun terbaru

Default filter:

```json
{
  "origin": "IDN",
  "destinations": [],
  "sumber": "nilai sumber terkecil",
  "year_start": "satu tahun sebelum terbaru",
  "year_end": "tahun terbaru"
}
```

Catatan interaksi:

- panel filter memakai accordion
- summary accordion menampilkan chip ringkas untuk asal, jumlah tujuan, sumber, dan rentang tahun
- badge panel menampilkan status `Filter belum diterapkan` atau `Filter Aktif`
- validasi field baru muncul setelah tombol `Cari Data` ditekan
- tombol `Reset` mengembalikan filter ke default

## 5. Master Data Filter

- Hook negara: `src/hooks/data-generator/useDataGeneratorTradeMasterQuery.ts`
- Hook sumber: `src/hooks/data-generator/useDataGeneratorTradeMasterQuery.ts`
- Hook tahun: `src/hooks/data-generator/useDataGeneratorTradeMasterQuery.ts`

Endpoint master:

- `GET /api/v1/negara`
- `GET /api/v1/data-generator/perdagangan/kode-sumber`
- `GET /api/v1/tahun-perdagangan`

Catatan:

- origin mencari `IDN` lebih dulu, dengan fallback label `Indonesia`
- tujuan multi-select memakai `FilterMultiSelect`
- daftar tujuan mendukung tampilan bendera lewat `alpha2`

## 6. Request Data Laporan

- Hook: `src/hooks/report-generator/useKerjasamaPerdaganganReportQuery.ts`
- Service: `src/service/report-generator/kerjasamaPerdagangan.ts`
- Endpoint: `POST /api/v1/report-generator/kerjasama-perdagangan/filter`

Payload request:

```json
{
  "origin": "IDN",
  "destinations": ["USA", "JPN"],
  "sumber": "1",
  "year_start": 2023,
  "year_end": 2024
}
```

Catatan:

- query hanya aktif bila semua field filter wajib sudah tersedia
- loading request ditampilkan lewat toast informasi
- error request ditampilkan lewat toast error

## 7. Tabel Hasil Kerjasama Perdagangan

- Komponen: `src/components/report-generator/KerjasamaPerdaganganTableCard.tsx`

Judul card:

- `Laporan Analisis Kerjasama Perdagangan`

Subtitle card menampilkan:

- `Asal`
- `Tujuan`
- `Tahun`
- `Total Data`

Catatan subtitle:

- bila daftar `Asal` atau `Tujuan` lebih dari 2 item, label ringkas di subtitle akan punya tooltip klik untuk melihat daftar lengkap

Kolom tabel utama:

- `Pasangan Negara`
- kolom tahun berdasarkan rentang `Tahun Awal` sampai `Tahun Akhir`

Baris detail per pasangan negara:

- `Ekspor`
- `Impor`
- `Neraca`
- `Total Perdagangan`

Fitur tabel:

- expandable per pasangan negara
- parent row memakai highlight hijau lembut
- teks parent row diposisikan ke tengah
- pagination frontend
- pilihan limit baris:
  - `5`
  - `10`
  - `20`
  - `50`
  - `ALL`
- expand card ke modal full-width tetap memakai data yang sama
- state kosong memakai `EmptyStatePanel`

## 8. Download Laporan

- Service: `src/service/report-generator/kerjasamaPerdagangan.ts`
- Trigger UI: `src/components/report-generator/KerjasamaPerdaganganTableCard.tsx`
- Handler page: `src/pages/report-generator/KerjasamaPerdaganganPage.tsx`

Tombol unduh utama:

- `Snapshot`

Opsi format:

- `PDF`
- `Word`

Endpoint unduh:

- `POST /api/v1/report-generator/kerjasama-perdagangan/snapshot/word`
- `POST /api/v1/report-generator/kerjasama-perdagangan/snapshot/pdf`

Payload unduh:

```json
{
  "origin": "IDN",
  "destinations": ["USA", "JPN"],
  "sumber": "1",
  "year_start": 2023,
  "year_end": 2024
}
```

Catatan implementasi:

- tombol `Snapshot` diberi warna sukses
- opsi format muncul dari menu kecil inline
- nama file fallback dibentuk dari kombinasi jenis dokumen + kode origin
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
- halaman Kerjasama Perdagangan: `/databank/report-generator/kerjasama-perdagangan`
- permission page: `view_kerjasama_perdagangan_report_generator`

## 10. Dependency Utama

- `src/pages/report-generator/KerjasamaPerdaganganPage.tsx`
- `src/components/report-generator/KerjasamaPerdaganganFiltersPanel.tsx`
- `src/components/report-generator/KerjasamaPerdaganganTableCard.tsx`
- `src/components/report-generator/ReportGeneratorInfoBanner.tsx`
- `src/hooks/report-generator/useKerjasamaPerdaganganReportQuery.ts`
- `src/service/report-generator/kerjasamaPerdagangan.ts`

## 11. Status

- route halaman aktif
- permission halaman aktif
- menu sidebar aktif
- banner informasi aktif
- filter aktif
- validasi inline aktif
- request data aktif
- tabel tren utama aktif
- detail metrik expandable aktif
- pagination frontend aktif
- tooltip subtitle aktif
- unduh `Snapshot` aktif
