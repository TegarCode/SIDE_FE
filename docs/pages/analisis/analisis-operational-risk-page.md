# Analisis Operational Risk Page

## Lokasi

- Page: `src/pages/analisis/OperationalRiskPage.tsx`
- Route: `/analisis/operational-risk`

## Tujuan Halaman

Halaman ini menampilkan analisis risiko operasional untuk negara yang dipilih, terdiri dari:

- peta skor total operational risk seluruh negara/entitas
- radar breakdown skor indikator untuk negara aktif
- detail tren tahunan per indikator risiko operasional

## Struktur Utama

Halaman terdiri dari:

1. `PageTitle`
2. filter `Region / Subregion / Negara`
3. section overview:
   - `Peta Skor Risiko Operasional Per Negara/Entitas`
   - `Risiko Operasional {negara}`
4. section `Detail Nilai Per Indikator Risiko Operasional {negara}`

## Filter

Komponen:

- `src/components/filters/RegionCountryEntityFiltersPanel.tsx`

Sumber master:

- `GET /api/v1/common-negara`

Catatan:

- halaman ini tidak memakai endpoint `wilayah`
- opsi `Region` dan `Subregion` diturunkan langsung dari `common-negara`
- `Subregion` memakai `nama wilayah`
- default filter:
  - `Region = Semua`
  - `Subregion = Semua`
  - `Negara = Indonesia (IDN)`

## Endpoint Data

Hook:

- `src/hooks/analisis/useAnalisisOperationalRiskQuery.ts`

Service:

- `src/service/analisis/overview.ts`

Endpoint:

- `GET /api/v1/analisis/operational-risk`

Parameter:

- `negara`

Contoh:

- `negara=SGP`

## Toast Request

Halaman memakai toast request untuk data operational risk:

- loading: saat data sedang diambil
- success: saat data berhasil dimuat
- error: saat request gagal

Catatan:

- toast loading dibersihkan saat request selesai
- success dan error memakai request key agar tidak muncul berulang untuk kombinasi filter yang sama

## Section 1: Peta Skor Risiko Operasional

Komponen:

- `src/components/analisis/operational-risk/AnalisisOperationalRiskOverviewSection.tsx`
- `src/components/ui/MapHeatLayer.tsx`

Judul:

- `Peta Skor Risiko Operasional Per Negara/Entitas Tahun {tahun terakhir}`

Subtitle:

- `Tahun {tahun sebelumnya}-{tahun terakhir} | Unit: Skor`

Perilaku:

- memakai `ExpandableCard`
- tooltip peta tidak menampilkan `Pangsa Pasar`
- label bucket dibulatkan tanpa dua angka desimal
- ada tombol `Unduh PNG`

Unduh PNG:

- memakai `downloadComposedPng`
- menyertakan judul, subtitle, legend bucket, dan sumber

## Section 2: Radar Breakdown Risiko Operasional

Komponen:

- `src/components/analisis/operational-risk/AnalisisOperationalRiskOverviewSection.tsx`

Judul:

- `Risiko Operasional {negara} Tahun {tahun terakhir}`

Subtitle:

- `Tahun {tahun sebelumnya}-{tahun terakhir} | Unit: Skor | Breakdown skor risiko operasional per indikator.`

Visual:

- `RadarChart` dari `recharts`
- data diambil dari `breakdown`
- nilai yang dipakai adalah skor pada `tahun terakhir`

Fitur:

- memakai `ExpandableCard`
- ada tombol `Unduh PNG`
- unduhan menyertakan judul, subtitle, dan sumber

## Section 3: Detail Nilai Per Indikator Risiko Operasional

Komponen:

- `src/components/analisis/operational-risk/AnalisisOperationalRiskIndicatorDetailSection.tsx`
- `src/components/ui/charts/TradeAnnualAreaChart.tsx`

Judul section:

- `Detail Nilai Per Indikator Risiko Operasional {negara}`

Subtitle section:

- `Tahun {tahun sebelumnya}-{tahun terakhir} | Unit: Skor | Breakdown skor risiko operasional per indikator.`

Perilaku:

- jumlah card mengikuti jumlah item `breakdown` dari response
- setiap indikator memiliki satu card chart sendiri
- masing-masing card memakai `ExpandableCard`
- chart memakai `TradeAnnualAreaChart`

Header card indikator:

- title indikator
- subtitle tahun dan unit skor
- di kanan title ada:
  - nilai terbaru
  - chip perubahan absolut dan persen terhadap tahun sebelumnya
  - tombol unduh
  - tombol expand

Unduh chart:

- format `PNG`
- memakai handler bawaan `TradeAnnualAreaChart`
- judul export memakai nama indikator
- subtitle export memakai rentang tahun dan unit skor

## Loading dan Empty State

Komponen loading:

- `MapSkeleton`
- `ChartSkeleton`

Komponen empty:

- `EmptyStatePanel`

Kondisi:

- peta: saat data total belum tersedia
- radar: saat breakdown kosong
- detail indikator: saat breakdown kosong atau belum ada data

## Tipe Data

Definisi tipe:

- `src/type/analisis.ts`

Tipe utama:

- `AnalisisOperationalRiskCountryRow`
- `AnalisisOperationalRiskBreakdownRow`
- `AnalisisOperationalRiskResult`

## Catatan Implementasi

- `MapHeatLayer` diberi prop opt-in `showProportionInTooltip={false}` untuk halaman ini
- handler unduh chart detail dipisah antara mode normal dan expand agar tombol unduh tidak mati setelah expand ditutup
