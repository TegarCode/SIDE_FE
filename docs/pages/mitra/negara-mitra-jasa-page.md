# Negara Mitra Jasa Page Documentation

## 1. Ringkasan Halaman

- Route: `APP_ROUTES.MITRA.JASA`
- Page: `src/pages/mitra/JasaPage.tsx`

Halaman ini menampilkan analisis jasa negara mitra dalam dua lapisan:

- ringkasan dan tabel jasa untuk satu `negara/entitas mitra`
- grafik tren tahunan dan `Top Jasa Masuk & Keluar` untuk kombinasi filter `asal` dan `tujuan`

Catatan implementasi terbaru:

- request data jasa `single` menampilkan toast `loading`, `success`, dan `error`
- request data jasa `multi` untuk grafik tren dan top jasa juga menampilkan toast `loading`, `success`, dan `error`
- header halaman memakai action button `Unduh Ringkasan (PDF)` di sisi kanan judul

## 2. Filter Utama

Komponen filter:

- `src/pages/mitra/_shared.tsx`
- `src/components/mitra/overview/MitraFiltersPanel.tsx`

Field filter:

- `Region`
- `Subregion`
- `Negara / Entitas`

Catatan implementasi:

- filter utama mengikuti pola bersama semua halaman negara mitra
- nilai default awal halaman diarahkan ke `CHN` jika tersedia
- filter ini dipakai untuk request endpoint jasa `country`

## 3. Ringkasan Nilai Jasa

Komponen ringkasan:

- `src/components/mitra/jasa/MitraServiceSummarySection.tsx`
- `src/components/ui/SummaryCard.tsx`

Endpoint:

- `POST /api/v1/negara-mitra/jasa/country`

Payload:

```json
{
  "filters": {
    "country": "CHN"
  },
  "include": ["summary", "top_countries_inbound", "top_countries_outbound"]
}
```

Ringkasan yang ditampilkan:

- `Jasa Masuk {tahun}`
- `Jasa Keluar {tahun}`

Catatan implementasi:

- subtitle section menampilkan konteks `Asal: Dunia` dan `Tujuan: {negara filter}`
- indikator perubahan summary card memakai simbol `▲/▼` dengan warna hijau/merah
- nilai utama di sisi kanan card akan tampil `-` jika value `0`

## 4. Tabel Negara / Entitas

Komponen tabel:

- `src/components/mitra/investasi/MitraInvestmentTableCard.tsx`
- `src/components/ui/TopMitraTable.tsx`

Visual yang ditampilkan:

- `Jasa Masuk dari Dunia ke {negara}`
- `Jasa Keluar dari {negara} ke Dunia`

Kolom utama:

- `No`
- `Negara/Entitas`
- `{tahun terakhir}`
- `{tahun sebelumnya}`
- `Perubahan`

Catatan implementasi:

- tabel memakai `TopMitraTable` dengan data hasil remap dari endpoint `country`
- subtitle card menampilkan tahun aktif, unit, dan keterangan urutan berdasarkan kolom sorting
- unit default jasa memakai `US$`
- perilaku `Perubahan`, chip tahun, `N/A`, dan unduh Excel mengikuti perilaku global `TopMitraTable`

## 5. Filter Rute Jasa

Komponen filter:

- `src/components/mitra/investasi/MitraInvestmentRouteFiltersPanel.tsx`

Field filter:

- `Asal`
- `Tujuan`

Catatan implementasi:

- komponen route filter direuse dari halaman investasi dengan title/description yang dikustom untuk jasa
- `Asal` dan `Tujuan` masing-masing memakai `src/components/ui/Form/CountryGeoFilter.tsx`
- masing-masing filter negara mendukung mode:
  - `Unit Regional`
  - `Kawasan/Organisasi`
- default awal panel diset ke `asal = IDN` dan `tujuan = MYS`

## 6. Grafik Tren Tahunan

Komponen section:

- `src/components/mitra/jasa/MitraServiceTrendSection.tsx`

Komponen chart:

- `src/components/ui/charts/TradeAnnualAreaChart.tsx`

Endpoint:

- `POST /api/v1/negara-mitra/jasa`

Payload:

```json
{
  "filters": {
    "origin": ["IDN"],
    "dest": ["MYS"]
  },
  "include": ["timeseries", "top_services_inbound", "top_services_outbound"]
}
```

Visual yang ditampilkan:

- `Tren Jasa Masuk`
- `Tren Jasa Keluar`

Catatan implementasi:

- section ditampilkan dalam grid 2 kolom berisi 2 card
- ringkasan asal dan tujuan memakai tooltip klik
- setiap card menampilkan nilai tahun terakhir dan chip perubahan di sisi kanan header
- format chip perubahan card mengikuti pola global reusable: `nilai perubahan|▲/▼persen`
- tooltip chart menampilkan perubahan dalam format `nilai | ▲/▼persen`
- fallback tren dibuat global di komponen chart shared bila seluruh nilai kosong atau `0`

## 7. Top Jasa Masuk & Keluar

Komponen section:

- `src/components/mitra/jasa/MitraServiceTopProductsSection.tsx`

Komponen pendukung:

- `src/components/ui/charts/TradeProductsTreemapChart.tsx`
- `src/utils/downloadAsExcel.ts`

Visual yang ditampilkan:

- `Top Jasa Masuk`
- `Top Jasa Keluar`

Catatan implementasi:

- tiap card mendukung switch `table <-> treemap`
- mode `table` memakai unduh Excel
- mode `treemap` memakai unduh PNG
- data kategori jasa diambil dari `top_services_inbound` dan `top_services_outbound`
- treemap memakai renderer shared yang juga dipakai di perdagangan, tetapi dimapping ke label jasa dan nilai jasa

## 8. Unduh Ringkasan PDF

Endpoint:

- `POST /api/v1/negara-mitra/jasa/summary/pdf`

Payload:

```json
{
  "single": {
    "filters": {
      "country": "CHN"
    }
  },
  "multi": {
    "filters": {
      "origin": ["IDN"],
      "dest": ["MYS"]
    }
  }
}
```

Catatan implementasi:

- tombol `Unduh Ringkasan (PDF)` ada di sisi kanan judul halaman
- tombol disable saat proses unduh berjalan atau filter wajib belum lengkap
- file diunduh melalui `file-saver`

## 9. Status

- Filter utama negara mitra sudah aktif.
- Ringkasan nilai jasa `single` sudah aktif.
- Tabel inbound/outbound jasa sudah aktif.
- Filter rute jasa `asal/tujuan` sudah aktif.
- Grafik tren tahunan jasa `multi` sudah aktif.
- Top jasa masuk & keluar dengan opsi `table/treemap` sudah aktif.
- Unduh ringkasan PDF halaman sudah aktif.
