# Indonesia Indikator Ekonomi Page Documentation

## 1. Ringkasan Halaman

- Nama halaman: `Indonesia Indikator Ekonomi dan Daya Saing`
- Route: `APP_ROUTES.INDONESIA.INDIKATOR_EKONOMI`
- Komponen page: `src/pages/indonesia/IndikatorEkonomiPage.tsx`

Halaman ini menyiapkan filter analitik untuk modul indikator ekonomi Indonesia dengan dua master utama:

1. Tahun kinerja ekonomi
2. Indikator makroekonomi dan daya saing

## 2. Data/API yang Dipakai

Service utama:

- `src/service/indonesia/indikator-ekonomi/master.ts`
- `src/service/indonesia/indikator-ekonomi/overview.ts`

Endpoint:

- `GET /api/v1/tahun-kinerja-ekonomi`
- `GET /api/v1/indikator-index-ekonomi`
- `GET /api/v1/indonesia/kinerja-ekonomi`

## 3. Komponen dan Hook

- Page:
  - `src/pages/indonesia/IndikatorEkonomiPage.tsx`
- Components:
  - `src/components/indonesia/indikator-ekonomi/IndikatorEkonomiFiltersPanel.tsx`
  - `src/components/indonesia/indikator-ekonomi/IndikatorEkonomiOverview.tsx`
  - `src/components/ui/Accordion.tsx`
  - `src/components/ui/Button.tsx`
  - `src/components/ui/ExpandableCard.tsx`
  - `src/components/ui/FilterFallbackCard.tsx`
  - `src/components/ui/Form/Select.tsx`
  - `src/components/ui/MapHeatLayer.tsx`
  - `src/components/ui/PageTitle.tsx`
  - `src/components/ui/TopMitraTable.tsx`
- Hooks:
  - `src/hooks/indonesia/useIndikatorEkonomiMasterQuery.ts`
  - `src/hooks/indonesia/useIndikatorEkonomiOverviewQuery.ts`
- Types:
  - `src/type/indonesiaIndikatorEkonomi.ts`

## 4. Catatan Implementasi

- Filter mengikuti pola halaman Indonesia lain: accordion, draft state, tombol `Reset`, dan `Cari Data`.
- Ringkasan filter aktif ditampilkan di header accordion agar tetap terbaca saat panel tertutup.
- Select indikator memakai label `Data Makroekonomi dan Daya Saing`.
- Opsi indikator dinormalisasi ke pasangan `value` dan `label` apa adanya dari API, tanpa klasifikasi kategori turunan di frontend.
- Overview utama mengambil payload `indicator_id` dan `year` dari filter aktif.
- Panel hasil saat ini:
  - `Peta nilai rata-rata - {nama indikator}`
  - `Top Negara/Entitas - {nama indikator}`
  - `Tren 5 Tahun - Top 5 Negara/Entitas ({nama indikator})`
- `Peta`, `Top Negara/Entitas`, dan `Tren 5 Tahun` menampilkan tooltip `keterangan` indikator pada title card.
- `Top Negara/Entitas` memakai `TopMitraTable`, mendukung search, limit, unduh Excel, mengikuti arah sort dari `meta.order`, dan highlight baris `INDONESIA`.
- Unduh Excel `Top Negara/Entitas` mengikuti urutan data yang sedang tampil di tabel, termasuk sorting aktif, limit aktif, pinned row, dan kolom `No` memakai rank aktual.
- Tabel indikator ekonomi tidak menampilkan proporsi, dan `INDONESIA` dipin di bagian bawah tabel jika belum masuk limit aktif.
- `Tren 5 Tahun` mengambil top 5 sesuai `meta.order`, mengecualikan negara dengan nilai `0` pada tahun terbaru, dan tetap menyertakan `INDONESIA` bila nilainya valid walau tidak masuk top 5.
- Saat `meta.is_yoy = true`, detail perubahan tidak ditampilkan pada tabel indikator.
- Bucket peta indikator ekonomi menggunakan label fixed tanpa format koma.
- Visual tren indikator ekonomi memakai chart ECharts ringan di dalam `IndikatorEkonomiOverview.tsx`, mengikuti pola referensi halaman legacy `KinerjaEkonomi`.
- Halaman menampilkan toast `loading` saat request overview berjalan dan toast `success` saat data indikator selesai dimuat.

## 5. Status Integrasi

- Master filter tahun dan indikator sudah terhubung.
- Query overview indikator ekonomi sudah terhubung dan divisualisasikan di peta, tabel top negara, dan chart tren.
