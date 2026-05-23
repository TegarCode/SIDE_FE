# Negara Mitra Investasi Page Documentation

## 1. Ringkasan Halaman

- Route: `APP_ROUTES.MITRA.INVESTASI`
- Page: `src/pages/mitra/InvestasiPage.tsx`

Halaman ini menampilkan analisis investasi negara mitra dalam dua lapisan:

- ringkasan dan tabel investasi untuk satu `negara/entitas mitra`
- grafik tren tahunan untuk kombinasi filter `asal` dan `tujuan`

Catatan implementasi terbaru:

- request data investasi `single` menampilkan toast `loading`, `success`, dan `error`
- request data investasi `multi` untuk grafik tren juga menampilkan toast `loading`, `success`, dan `error`
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
- filter ini dipakai untuk request endpoint investasi `single`

## 3. Ringkasan Nilai Investasi

Komponen ringkasan:

- `src/components/mitra/investasi/MitraInvestmentSummarySection.tsx`
- `src/components/ui/SummaryCard.tsx`

Endpoint:

- `POST /api/v1/negara-mitra/investasi/single`

Payload:

```json
{
  "filters": {
    "country": "CHN"
  }
}
```

Ringkasan yang ditampilkan:

- `Investasi Masuk Dari Dunia ke {negara} {tahun}`
- `Investasi Keluar Dari {negara} ke Dunia {tahun}`

Catatan implementasi:

- subtitle section menampilkan konteks `Asal: Dunia` dan `Tujuan: {negara filter}`
- indikator perubahan pada summary card memakai simbol `▲/▼` dengan warna hijau/merah
- nilai utama di sisi kanan card akan tampil `-` jika value `0`
- format chip perubahan card mengikuti pola global tren tahunan

Hook dan service:

- `src/hooks/mitra/useMitraSingleInvestmentQuery.ts`
- `src/service/mitra/overview.ts`

## 4. Tabel Investasi Negara / Entitas

Komponen tabel:

- `src/components/mitra/investasi/MitraInvestmentTableCard.tsx`
- `src/components/ui/TopMitraTable.tsx`

Visual yang ditampilkan:

- `Investasi Masuk dari Dunia ke {negara}`
- `Investasi Keluar dari {negara} ke Dunia`

Kolom utama:

- `No`
- `Negara/Entitas`
- `{tahun terakhir}`
- `{tahun sebelumnya}`
- `Perubahan`

Catatan implementasi:

- tabel memakai `TopMitraTable` dengan data hasil remap dari endpoint `single`
- subtitle card menampilkan tahun aktif, unit, dan keterangan urutan berdasarkan kolom sorting
- kolom `Perubahan` menampilkan teks signed `+/-nilai`
- `N/A` dipakai saat nilai pembanding tidak valid, misalnya tahun sebelumnya `0/tidak ada` atau tahun terakhir `0`
- chip perubahan di kolom tahun terbaru memakai simbol teks `▲/▼`
- chip perubahan di kolom tahun sebelumnya tampil `-`
- unduh tabel mengikuti mekanisme Excel bawaan `TopMitraTable`

Helper:

- `src/components/mitra/investasi/helpers.ts`

## 5. Filter Rute Investasi

Komponen filter:

- `src/components/mitra/investasi/MitraInvestmentRouteFiltersPanel.tsx`

Field filter:

- `Asal`
- `Tujuan`

Catatan implementasi:

- `Asal` dan `Tujuan` masing-masing memakai `src/components/ui/Form/CountryGeoFilter.tsx`
- masing-masing filter negara mendukung mode:
  - `Unit Regional`
  - `Kawasan/Organisasi`
- default awal panel diset ke `asal = CHN` dan `tujuan = IDN`
- panel filter ini khusus untuk request endpoint investasi `multi`
- panel ditempatkan tepat di atas section `Grafik Tren Tahunan`

## 6. Grafik Tren Tahunan

Komponen section:

- `src/components/mitra/investasi/MitraInvestmentTrendSection.tsx`

Komponen chart:

- `src/components/ui/charts/TradeAnnualAreaChart.tsx`

Endpoint:

- `POST /api/v1/negara-mitra/investasi/multi`

Payload:

```json
{
  "origin": ["CHN"],
  "dest": ["IDN"]
}
```

Visual yang ditampilkan:

- `Tren Nilai Investasi Masuk Tahunan`
- `Tren Nilai Investasi Keluar Tahunan`

Catatan implementasi:

- section ditampilkan dalam grid 2 kolom berisi 2 card
- ringkasan asal dan tujuan memakai tooltip klik
- setiap card menampilkan nilai tahun terakhir dan chip perubahan di sisi kanan header
- format chip perubahan card dibuat global dan reusable: `nilai perubahan|▲/▼persen`
- nilai utama di sisi kanan card tampil `-` jika value `0`
- tooltip chart menampilkan perubahan dalam format `nilai | ▲/▼persen`
- tiap card memiliki tombol unduh PNG di header, di samping tombol expand
- hasil unduhan PNG menambahkan `title`, `subtitle`, baris metadata rute `Asal -> Tujuan`, dan footer sumber
- metadata rute saat unduh dibatasi maksimal `3` negara per sisi, lalu sisanya diringkas sebagai `+n lainnya`

Hook dan service:

- `src/hooks/mitra/useMitraMultiInvestmentQuery.ts`
- `src/service/mitra/overview.ts`

Util reusable:

- `src/utils/downloadComposedPng.ts`
- `src/utils/chartExport.ts`

## 7. Status

- Filter utama negara mitra sudah aktif.
- Ringkasan nilai investasi `single` sudah aktif.
- Tabel inbound/outbound investasi sudah aktif.
- Filter rute investasi `asal/tujuan` sudah aktif.
- Grafik tren tahunan investasi `multi` sudah aktif.
- Unduh PNG tren tahunan dengan metadata rute sudah aktif.
