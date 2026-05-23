# Data Generator Jasa Page Documentation

## 1. Ringkasan Halaman

- Route: `APP_ROUTES.DATABANK.DATA_GENERATOR.SERVICE`
- Page: `src/pages/data-generator/ServicePage.tsx`

Halaman ini menyediakan generator data jasa dengan dua mode output:

- `Tampilan Tabel`
- `Tampilan Visualisasi`

User dapat menyusun kombinasi asal, tujuan, grup negara, rentang tahun, jenis kelamin, profesi, dan sumber data sebelum hasil dimuat ke endpoint generator.

## 2. Struktur Utama

Halaman terdiri dari:

1. Judul halaman `Data Generator Jasa`
2. Banner informasi data generator
3. Panel filter generator jasa
4. Section hasil:
   - tabel jasa, atau
   - visualisasi jasa

## 3. Filter Generator

- Komponen: `src/components/filters/DataGeneratorServiceFiltersPanel.tsx`
- Validator: `src/validators/dataGeneratorServiceFilters.ts`

Field utama:

- `Asal`
  - `Negara / Entitas Asal`
  - `Grup Asal`
- `Tujuan`
  - `Negara / Entitas Tujuan`
  - `Grup Tujuan`
- `Tahun Awal`
- `Tahun Akhir`
- `Jenis Kelamin`
- `Profesi`
- `Sumber Data`
- `Output Generator`

Default:

- `Jenis Kelamin = all`
- `Profesi = ["all"]`
- `Output = Tampilan Tabel`

## 4. Master Data Filter

- Service: `src/service/data-generator/service.ts`
- Hook: `src/hooks/data-generator/useDataGeneratorServiceMasterQuery.ts`

Endpoint master yang dipakai:

- `/api/v1/negara`
- `/api/v1/grupnegara`
- `/api/v1/profesi`
- `/api/v1/data-generator/jasa/tahun-jasa`
- `/api/v1/data-generator/jasa/kode-sumber`

## 5. Mode Tampilan Tabel

- Section: `src/components/data-generator/DataGeneratorServiceTableSection.tsx`
- Detail modal: `src/components/data-generator/DataGeneratorServiceDetailModal.tsx`
- Query hook: `src/hooks/data-generator/useDataGeneratorServiceTableQuery.ts`
- Endpoint: `POST /api/v1/data-generator/jasa/tablefilter`

Relasi utama tabel:

- `asal_ke_tujuan`
- `asal_ke_dunia`
- `dunia_ke_tujuan`

Fitur utama:

- subtitle card memuat tahun, asal, tujuan, gender, profesi, dan sumber
- label `Asal` dan `Tujuan` pada subtitle dapat diklik untuk membuka daftar negara / anggota grup
- klik sel nilai membuka modal detail
- dukung expand card
- dukung unduh Excel

## 6. Mode Tampilan Visualisasi

- Section: `src/components/data-generator/DataGeneratorServiceVisualizationSection.tsx`
- Query hook: `src/hooks/data-generator/useDataGeneratorServiceVisualizationQuery.ts`
- Endpoint: `POST /api/v1/data-generator/jasa/visualizationfilter`

Visualisasi yang ditampilkan:

- `Bar Chart Top 5 Negara Tujuan Jasa`
- `Line Chart Tren Top 5 Pasangan Negara/Entitas Jasa`
- `Stacked Bar Chart Perbandingan Jasa dari Negara Asal ke Tujuan dan ke Dunia`
- `Treemap Pangsa Top 5 Negara Asal Jasa`

Komponen chart:

- `src/components/ui/charts/CountryGroupedBarChart.tsx`
- `src/components/ui/charts/PairLineChart.tsx`
- `src/components/ui/charts/PairStackedBarChart.tsx`
- `src/components/ui/charts/EntityTreemapChart.tsx`

## 7. Catatan Implementasi

- wording dan interaksi dibuat semirip mungkin dengan page `pariwisata`
- nilai visualisasi memakai unit `Orang`
- subtitle visualisasi memuat gender dan profesi aktif
