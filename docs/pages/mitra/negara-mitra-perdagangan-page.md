# Negara Mitra Perdagangan Page Documentation

## 1. Ringkasan Halaman

- Route: `APP_ROUTES.MITRA.PERDAGANGAN`
- Page: `src/pages/mitra/PerdaganganPage.tsx`

Halaman ini disiapkan untuk analisis perdagangan negara mitra dengan filter khusus `asal`, `tujuan`, dan `HS Code`.

Catatan implementasi terbaru:

- header halaman memakai `src/components/ui/PageTitle.tsx` dengan action button `Unduh Ringkasan (PDF)` di sisi kanan judul
- request data overview perdagangan menampilkan toast `loading`, `success`, dan `error`
- unduh ringkasan PDF halaman memakai endpoint khusus perdagangan

## 2. Filter

Komponen filter:

- `src/components/mitra/perdagangan/MitraPerdaganganFiltersPanel.tsx`

Referensi pola:

- `src/pages/indonesia/KerjasamaBilateralPage.tsx`
- `src/components/indonesia/kerjasama-bilateral/KerjasamaBilateralFiltersPanel.tsx`

Field filter:

- `Asal`
- `Tujuan`
- `HS Code`

Catatan implementasi:

- `Asal` dan `Tujuan` masing-masing memakai `src/components/ui/Form/CountryGeoFilter.tsx`
- masing-masing filter negara mendukung mode:
  - `Unit Regional`
  - `Kawasan/Organisasi`
- `HS Code` memakai `src/components/ui/Form/FilterMultiSelect.tsx`
- default awal halaman diset ke `asal = CHN`, `tujuan = IDN`, dan `HS Code = ALL`

## 3. Endpoint Filter

- Negara:
  - `GET /api/v1/common-negara`
  - `GET /api/v1/wilayah`
- HS Code:
  - `GET /api/v1/hsproduk`

Hook yang dipakai:

- `src/hooks/mitra/useMitraMasterQuery.ts`
- `src/hooks/indonesia/useDiplomasiHsProductQuery.ts`

## 4. Ringkasan Nilai Perdagangan

Komponen ringkasan:

- `src/components/mitra/perdagangan/MitraTradeSummarySection.tsx`

Endpoint:

- `POST /api/v1/negara-mitra/perdagangan`

Payload utama:

- `origin`
- `dest`
- `include`

Ringkasan yang ditampilkan:

- `Nilai Ekspor (tahun)`
- `Nilai Impor (tahun)`
- `Total Perdagangan (tahun)`
- `Neraca Perdagangan (tahun)`

Catatan implementasi:

- judul setiap kartu menampilkan tahun aktif dari response
- subtitle section menampilkan konteks alur perdagangan dari negara asal ke negara tujuan yang sedang dipilih
- value `total` dihitung dari `ekspor + impor`
- value `neraca` dihitung dari `ekspor - impor`

Hook dan service:

- `src/hooks/mitra/useMitraTradeOverviewQuery.ts`
- `src/service/mitra/overview.ts`

Toast request:

- `loading` saat query overview perdagangan berjalan
- `success` saat data overview selesai dimuat untuk kombinasi filter aktif
- `error` saat request overview gagal

Unduh ringkasan PDF:

- action button ada di header `PageTitle`
- endpoint: `POST /api/v1/negara-mitra/perdagangan/summary/pdf`
- payload PDF:
  - `origin`
  - `dest`
  - `include = ["summary","timeseries","top_products_export","top_products_import"]`
- file diunduh melalui `file-saver`

## 5. Status

- Filter perdagangan khusus sudah aktif.
- Ringkasan nilai perdagangan sudah aktif.
- Grafik tren tahunan sudah aktif.
- Top produk ekspor & impor sudah aktif.
- Unduh ringkasan PDF sudah aktif.

## 6. Grafik Tren Tahunan

Komponen section:

- `src/components/mitra/perdagangan/MitraTradeAnnualTrendSection.tsx`

Komponen chart:

- `src/components/ui/charts/TradeAnnualAreaChart.tsx`

Visual yang ditampilkan:

- `Tren Ekspor`
- `Tren Impor`
- `Tren Total Perdagangan`
- `Tren Neraca`

Catatan implementasi:

- section ditampilkan dalam grid 2 kolom berisi 4 card
- ringkasan asal dan tujuan memakai pola tooltip klik seperti section summary
- setiap card menampilkan informasi nilai tahun terakhir dan perubahan di sisi kanan header
- indikator perubahan card memakai simbol naik/turun, sedangkan nilai perubahan ditampilkan sebagai nilai absolut tanpa tanda plus/minus
- data tren mengambil `timeseries` dari endpoint `POST /api/v1/negara-mitra/perdagangan`
- `volume` pada subtitle halaman direpresentasikan sebagai `total perdagangan`
- tiap card memiliki tombol unduh PNG di header, di samping tombol expand
- hasil unduhan PNG menambahkan `title`, `subtitle`, dan footer sumber ke atas/bawah visual chart

## 7. Top Produk Ekspor & Impor

Komponen section:

- `src/components/mitra/perdagangan/MitraTradeTopProductsSection.tsx`

Komponen pendukung:

- `src/components/ui/TopProdukTable.tsx`
- `src/components/ui/charts/TradeProductsTreemapChart.tsx`

Visual yang ditampilkan:

- `Top Produk Ekspor`
- `Top Produk Impor`

Catatan implementasi:

- tiap card mendukung switch `table <-> treemap`
- mode `table` memakai unduh Excel dari `TopProdukTable`
- mode `treemap` memakai unduh PNG
- hasil unduhan PNG treemap menambahkan `title`, `subtitle`, dan footer sumber ke visual
- card menggunakan tooltip info untuk menjelaskan mirror value, under invoicing, over invoicing, dan tanda anomali
