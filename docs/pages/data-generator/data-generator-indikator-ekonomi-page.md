# Data Generator Indikator Ekonomi Page Documentation

## 1. Ringkasan Halaman

- Route: `APP_ROUTES.DATABANK.DATA_GENERATOR.ECONOMIC_INDICATOR`
- Page: `src/pages/data-generator/EconomicIndicatorPage.tsx`

Halaman ini menyediakan generator data indikator ekonomi dan daya saing dengan dua mode output:

- `Tampilan Tabel`
- `Tampilan Visualisasi`

User dapat memilih indikator dan rentang tahun sebelum hasil dimuat ke endpoint generator.

## 2. Struktur Utama

Halaman terdiri dari:

1. Judul halaman `Data Generator Indikator Ekonomi & Daya Saing`
2. Banner informasi data generator
3. Panel filter indikator ekonomi
4. Section hasil:
   - tabel indikator ekonomi, atau
   - visualisasi indikator ekonomi

## 3. Filter Generator

- Komponen: `src/components/filters/DataGeneratorEconomicIndicatorFiltersPanel.tsx`
- Validator: `src/validators/dataGeneratorEconomicIndicatorFilters.ts`

Field utama:

- `Indikator`
- `Tahun Awal`
- `Tahun Akhir`
- `Output Generator`

Endpoint master yang dipakai:

- `/api/v1/indikator-index-ekonomi-all`
- `/api/v1/tahun-kinerja-ekonomi`

Catatan:

- filter output menentukan query tabel atau visualisasi yang dijalankan
- badge panel menampilkan status `Draft aktif` atau `Sinkron`
- validasi menjaga `Tahun Akhir` tidak lebih kecil dari `Tahun Awal`

## 4. Mode Tampilan Tabel

- Section: `src/components/data-generator/DataGeneratorEconomicIndicatorTableSection.tsx`
- Query hook: `src/hooks/data-generator/useDataGeneratorEconomicIndicatorTableQuery.ts`
- Endpoint: `POST /api/v1/data-generator/kinerja-ekonomi/tablefilter`

Payload utama:

```json
{
  "indicator_id": 7,
  "yearFrom": 2020,
  "yearTo": 2025,
  "viewType": "table"
}
```

Struktur tabel:

- kolom pertama `Rank`
- kolom kedua `Negara`
- kolom berikutnya berupa pivot per tahun di bawah header nama indikator

Perilaku utama:

- nilai `Rank` tetap memakai rank asli dari response
- baris disortir naik berdasarkan rank
- baris yang nilai pada tahun terakhir kosong dipindahkan ke bagian bawah
- tidak ada modal detail saat klik nilai sel
- tersedia unduh Excel

## 5. Mode Tampilan Visualisasi

- Section: `src/components/data-generator/DataGeneratorEconomicIndicatorVisualizationSection.tsx`
- Query hook: `src/hooks/data-generator/useDataGeneratorEconomicIndicatorVisualizationQuery.ts`
- Endpoint: `POST /api/v1/data-generator/kinerja-ekonomi/visualizationfilter`

Payload utama:

```json
{
  "indicator_id": 7,
  "yearFrom": 2020,
  "yearTo": 2025,
  "viewType": "chart"
}
```

Visualisasi yang ditampilkan:

- `Line Chart Tren Top 5 Negara/Entitas`
- `Bar Chart Top 5 Negara/Entitas`

Komponen chart:

- `src/components/ui/charts/PairLineChart.tsx`
- `src/components/ui/charts/CountryGroupedBarChart.tsx`

Perilaku utama:

- top 5 ditentukan dari tahun terakhir yang benar-benar tersedia pada `data`
- jika range filter `2020-2026` tetapi data terakhir yang terisi `2023`, chart akan memakai `2023`
- jika ada key tahun kosong di response, tahun kosong tidak dipakai sebagai acuan top 5
- nilai chart tidak dipaksa bulat, sehingga angka desimal tetap tampil
- tooltip chart menampilkan nilai, nilai sebelumnya, perubahan, dan perubahan persen
- tersedia unduh PNG pada setiap card

## 6. Request State

Halaman memakai toast untuk lifecycle request:

- `loading`
- `error`

Scope toast:

- request tabel indikator ekonomi
- request visualisasi indikator ekonomi
- error backend atau request gagal

## 7. Dependency Utama

- `src/pages/data-generator/EconomicIndicatorPage.tsx`
- `src/components/data-generator/DataGeneratorInfoBanner.tsx`
- `src/components/filters/DataGeneratorEconomicIndicatorFiltersPanel.tsx`
- `src/components/data-generator/DataGeneratorEconomicIndicatorTableSection.tsx`
- `src/components/data-generator/DataGeneratorEconomicIndicatorVisualizationSection.tsx`
- `src/hooks/data-generator/useDataGeneratorEconomicIndicatorMasterQuery.ts`
- `src/hooks/data-generator/useDataGeneratorEconomicIndicatorTableQuery.ts`
- `src/hooks/data-generator/useDataGeneratorEconomicIndicatorVisualizationQuery.ts`
- `src/service/data-generator/economicIndicator.ts`
- `src/validators/dataGeneratorEconomicIndicatorFilters.ts`

## 8. Status

- filter generator aktif
- mode tabel aktif
- mode visualisasi aktif
- unduh Excel tabel aktif
- unduh PNG visualisasi aktif
