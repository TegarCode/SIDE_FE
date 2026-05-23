# Negara Mitra Pariwisata Page Documentation

## 1. Ringkasan Halaman

- Route: `APP_ROUTES.MITRA.PARIWISATA`
- Page: `src/pages/mitra/PariwisataPage.tsx`

Halaman ini menampilkan analisis pariwisata negara mitra dalam dua lapisan:

- ringkasan dan tabel pariwisata untuk satu `negara/entitas mitra`
- grafik tren tahunan untuk kombinasi filter `asal` dan `tujuan`

Catatan implementasi terbaru:

- request data pariwisata `single` menampilkan toast `loading`, `success`, dan `error`
- request data pariwisata `multi` untuk grafik tren juga menampilkan toast `loading`, `success`, dan `error`
- header halaman memakai action button `Unduh Ringkasan (PDF)` di sisi kanan judul
- filter `asal` dan `tujuan` multiple ditempatkan tepat di atas section `Grafik Tren Tahunan`

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
- filter ini dipakai untuk request endpoint pariwisata `single`

## 3. Ringkasan Nilai

Komponen ringkasan:

- `src/components/mitra/pariwisata/MitraTourismSummarySection.tsx`
- `src/components/ui/SummaryCard.tsx`

Endpoint:

- `POST /api/v1/negara-mitra/pariwisata/single`

Ringkasan yang ditampilkan:

- `Wisatawan Masuk {tahun}`
- `Wisatawan Keluar {tahun}`

Catatan implementasi:

- subtitle section menjelaskan jumlah wisatawan masuk, belanja wisatawan, dan wisatawan keluar
- konteks section menampilkan `Asal: Dunia` dan `Tujuan: {negara filter}`
- card `Wisatawan Masuk` menampilkan jumlah wisatawan, dan detail belanja wisatawan muncul pada field highlight/tooltip card
- card `Wisatawan Keluar` menampilkan jumlah wisatawan keluar
- indikator perubahan summary card memakai simbol `▲/▼` dengan warna hijau/merah

Hook dan service:

- `src/hooks/mitra/useMitraSingleTourismQuery.ts`
- `src/service/mitra/overview.ts`

## 4. Tabel Pariwisata Negara / Entitas

Komponen tabel:

- `src/components/mitra/investasi/MitraInvestmentTableCard.tsx`
- `src/components/ui/TopMitraTable.tsx`

Visual yang ditampilkan:

- `Asal Wisatawan Mancanegara ke {negara}`
- `Tujuan Wisatawan {negara} ke Mancanegara`

Kolom utama:

- `No`
- `Negara/Entitas`
- `{tahun terakhir}`
- `{tahun sebelumnya}`
- `Perubahan`

Catatan implementasi:

- tabel memakai `TopMitraTable` dengan data hasil remap dari endpoint `single`
- subtitle card menampilkan tahun aktif, unit, dan keterangan urutan berdasarkan kolom sorting
- unit tabel memakai `Orang`
- kolom `Perubahan`, chip tahun, `N/A`, dan unduh Excel mengikuti perilaku global `TopMitraTable`

Helper:

- `src/components/mitra/pariwisata/helpers.ts`

## 5. Filter Rute Pariwisata

Komponen filter:

- `src/components/mitra/investasi/MitraInvestmentRouteFiltersPanel.tsx`

Field filter:

- `Asal`
- `Tujuan`

Catatan implementasi:

- komponen route filter direuse dari halaman investasi dengan title/description yang dikustom untuk pariwisata
- `Asal` dan `Tujuan` masing-masing memakai `src/components/ui/Form/CountryGeoFilter.tsx`
- masing-masing filter negara mendukung mode:
  - `Unit Regional`
  - `Kawasan/Organisasi`
- default awal panel diset ke `asal = USA` dan `tujuan = IDN`
- panel filter ini khusus untuk request endpoint pariwisata `multi`

## 6. Grafik Tren Tahunan

Komponen section:

- `src/components/mitra/pariwisata/MitraTourismTrendSection.tsx`

Komponen chart:

- `src/components/ui/charts/TradeAnnualAreaChart.tsx`

Endpoint:

- `POST /api/v1/negara-mitra/pariwisata/multi`

Visual yang ditampilkan:

- `Tren Wisatawan Masuk`
- `Tren Wisatawan Keluar`

Catatan implementasi:

- section ditampilkan dalam grid 2 kolom berisi 2 card
- ringkasan asal dan tujuan memakai tooltip klik
- setiap card menampilkan nilai tahun terakhir dan chip perubahan di sisi kanan header
- format chip perubahan card mengikuti pola global reusable: `nilai perubahan|▲/▼persen`
- tooltip chart menampilkan perubahan dalam format `nilai | ▲/▼persen`
- tiap card memiliki tombol unduh PNG di header, di samping tombol expand
- hasil unduhan PNG menambahkan `title`, `subtitle`, baris metadata rute `Asal -> Tujuan`, dan footer sumber
- metadata rute saat unduh dibatasi maksimal `3` negara per sisi, lalu sisanya diringkas sebagai `+n lainnya`

Hook dan service:

- `src/hooks/mitra/useMitraMultiTourismQuery.ts`
- `src/service/mitra/overview.ts`

## 7. Unduh Ringkasan PDF

Endpoint:

- `POST /api/v1/negara-mitra/pariwisata/summary/pdf`

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
      "origin": ["USA"],
      "destination": ["IDN"]
    }
  }
}
```

Catatan implementasi:

- tombol `Unduh Ringkasan (PDF)` ada di sisi kanan judul halaman
- tombol disable saat proses unduh berjalan atau filter wajib belum lengkap
- file diunduh melalui `file-saver`

## 8. Status

- Filter utama negara mitra sudah aktif.
- Ringkasan nilai pariwisata `single` sudah aktif.
- Tabel inbound/outbound pariwisata sudah aktif.
- Filter rute pariwisata `asal/tujuan` sudah aktif.
- Grafik tren tahunan pariwisata `multi` sudah aktif.
- Unduh PNG tren tahunan dengan metadata rute sudah aktif.
- Unduh ringkasan PDF halaman sudah aktif.
