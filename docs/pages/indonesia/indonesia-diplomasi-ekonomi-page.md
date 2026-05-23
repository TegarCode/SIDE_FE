# Indonesia Diplomasi Ekonomi Page Documentation

## 1. Ringkasan Halaman

- Nama halaman: `Indonesia Diplomasi Ekonomi`
- Route: `APP_ROUTES.INDONESIA.DIPLOMASI_EKONOMI`
- Komponen page: `src/pages/indonesia/DiplomasiEkonomiPage.tsx`
- Tipe akses route: `Public route` (visibilitas menu tetap mengikuti permission)

Halaman ini menampilkan analisis diplomasi ekonomi Indonesia dengan struktur utama:

1. Sidebar submodul Indonesia di kiri.
2. Filter tahun, HS, Unit Regional Kemlu, dan sumber data per sektor.
3. Summary cards indikator utama.
4. Tabs analisis (nilai perdagangan, ekspor, impor, neraca, investasi, turis).
5. Konten tab aktif berisi map, tabel top mitra/top produk, serta chart tren.

## 2. Route dan Permission

- Route wajib dari constants: `src/constants/routes.ts`.
- Permission menu mengikuti pola existing:
  - `src/constants/navLinks.ts`
  - `src/constants/permissions.ts`
  - `src/utils/access.ts`

## 3. Data/API yang Dipakai

Service utama:

- `src/service/indonesia/diplomasi-ekonomi/master.ts`
- `src/service/indonesia/diplomasi-ekonomi/stats.ts`
- `src/service/indonesia/diplomasi-ekonomi/overview.ts`
- `src/service/indonesia/diplomasi-ekonomi/competition.ts`
- `src/service/indonesia/diplomasi-ekonomi/shared.ts`

### 3.1 Master Data Filter

- `GET /api/v1/tahun-perdagangan`
- `GET /api/v1/tahun-investasi-default`
- `GET /api/v1/tahun-pariwisata-default`
- `GET /api/v1/wilayah`
- `GET /api/v1/data-generator/perdagangan/kode-sumber`
- `GET /api/v1/data-generator/investasi/kode-sumber`
- `GET /api/v1/data-generator/pariwisata/kode-sumber`

### 3.2 Statistik Ringkasan

- `GET /api/v1/indonesia/diplomasi-ekonomi/stats`

### 3.3 Data Overview per Tab

- `nilai_perdagangan` -> `/api/v1/indonesia/diplomasi-ekonomi/nilai-perdagangan`
- `total_ekspor` -> `/api/v1/indonesia/diplomasi-ekonomi/total-ekspor`
- `total_impor` -> `/api/v1/indonesia/diplomasi-ekonomi/total-impor`
- `neraca_perdagangan` -> `/api/v1/indonesia/diplomasi-ekonomi/nilai-perdagangan`
- `investasi_masuk` -> `/api/v1/indonesia/diplomasi-ekonomi/total-inbound-investasi`
- `turis_masuk` -> `/api/v1/indonesia/diplomasi-ekonomi/total-inbound-wisatawan`

## 4. State Loading/Error/Empty

- Loading:
  - Skeleton untuk filter, summary, map, table, dan chart.
  - Tab `Nilai Perdagangan` memakai skeleton reusable dari `src/components/ui/skeletons/`:
    - `MapSkeleton.tsx`
    - `TableSkeleton.tsx`
    - `ChartSkeleton.tsx`
  - Toast request dipisah per query:
    - `statsQuery` untuk ringkasan statistik
    - `overviewQuery` untuk analisis tab aktif
- Error:
  - Panel fallback error per section.
- Empty:
  - Jika data overview kosong, tampil fallback card dinamis.
  - Komponen tabel/chart punya empty state masing-masing.

## 5. Interaksi Utama User

1. Mengatur filter dan sumber data.
2. Pindah tab analisis.
3. Melihat peta heatmap + legenda.
4. Sort/search/limit pada tabel Top Mitra dan Top Produk.
5. Download Excel untuk Top Mitra dan Top Produk.
6. Expand card ke modal (ukuran modal diseragamkan).
7. Melihat tooltip `Pangsa Pasar` dan `Perubahan` pada tabel, termasuk wording kontekstual pada tab neraca perdagangan.
8. Pada tab `Total Ekspor`, klik HS di tabel `Top Produk Nilai Ekspor Indonesia` untuk membuka modal detail tujuan ekspor dan kompetitor.
9. Pada tab `Total Ekspor`, memilih produk HS aktif di panel `Peta Persaingan Produk Ekspor`.
10. Pada tab `Total Impor`, klik HS di tabel `Top Produk Nilai Impor Indonesia` untuk membuka modal detail negara asal impor dan kompetitor.
11. Pada tab `Total Impor`, memilih produk HS aktif di panel `Peta Persaingan Produk Impor`.
12. Pada tab `Investasi Masuk`, melihat tabel `Tren Investasi Masuk ke Indonesia` beserta delta nilai dan delta persentase YoY.
13. Pada tab `Turis Masuk`, melihat tabel `Tren Wisatawan Masuk` beserta delta nilai dan delta persentase YoY.

## 6. Komponen UI dan Pola Reusable

- Card/Modal:
  - `src/components/ui/ExpandableCard.tsx`
  - `src/components/ui/InsightStatCard.tsx`
  - `src/components/ui/Modal.tsx`
- Tabel:
  - `src/components/ui/TopMitraTable.tsx`
  - `src/components/ui/TopProdukTable.tsx`
- Modal/Competition:
  - `src/components/ui/TradeCompetitionInsight.tsx`
- Chart:
  - `src/components/ui/charts/MultiLineTrendChart.tsx`
  - `src/components/ui/charts/PartnerMixedChart.tsx`
- Map:
  - `src/components/ui/MapHeatLayer.tsx`
  - `src/components/ui/DiplomasiLegendTooltip.tsx`
- Skeleton:
  - `src/components/ui/Skeleton.tsx`
  - `src/components/ui/skeletons/ChartSkeleton.tsx`
  - `src/components/ui/skeletons/MapSkeleton.tsx`
  - `src/components/ui/skeletons/TableSkeleton.tsx`
- Utility:
  - `src/utils/downloadAsExcel.ts`
- Service:
  - `src/service/indonesia/diplomasi-ekonomi/index.ts`
  - `src/service/indonesia/diplomasi-ekonomi/master.ts`
  - `src/service/indonesia/diplomasi-ekonomi/stats.ts`
  - `src/service/indonesia/diplomasi-ekonomi/overview.ts`
  - `src/service/indonesia/diplomasi-ekonomi/competition.ts`
  - `src/service/indonesia/diplomasi-ekonomi/shared.ts`

## 7. Catatan Implementasi Terbaru

- Unit tampil dinamis dari response API (tidak hardcoded).
- Istilah `Proporsi` diseragamkan menjadi `Pangsa Pasar` di tooltip terkait.
- Subtitle tabel Top Mitra/Top Produk dinamis:
  - `Nomor mengikuti urutan sorting pada kolom {kolom aktif}`.
- Posisi `Sumber: ...` dibuat konsisten di kanan-bawah card.
- Loading `Nilai Perdagangan` tidak lagi memakai `DiplomasiTabLoadingSkeleton.tsx`;
  pola loading diganti ke komposisi skeleton reusable per jenis visual.
- Loading `Peta Persaingan Produk` pada tab ekspor dan impor juga memakai skeleton per-list melalui `TradeCompetitionInsight`, bukan visualisasi chart generik.
- `Total Ekspor` memakai layout panel spesifik:
  - Peta Nilai Ekspor Indonesia
  - Top Mitra Nilai Ekspor Indonesia
  - Time Series Nilai Ekspor Indonesia
  - Top Produk Nilai Ekspor Indonesia
  - Peta Persaingan Produk Ekspor
- Klik HS pada `Top Produk Nilai Ekspor Indonesia` membuka modal detail tujuan ekspor Indonesia, tujuan ekspor utama ke negara tujuan teratas, dan tujuan ekspor ASEAN ke negara tujuan teratas.
- Pilihan produk pada `Peta Persaingan Produk Ekspor` memakai endpoint master `/api/v1/hsproduk`.
- Stat card pada panel persaingan produk diekstrak ke komponen reusable `src/components/ui/InsightStatCard.tsx`.
- Export Excel `Top Produk Nilai Ekspor Indonesia` memakai format kolom insight produk. Kolom kompetitor utama dan ASEAN hanya dimunculkan jika datanya tersedia.
- `Total Impor` memakai layout panel spesifik:
  - Peta Nilai Impor Indonesia
  - Top Mitra Nilai Impor Indonesia
  - Time Series Nilai Impor Indonesia
  - Top Produk Nilai Impor Indonesia
  - Peta Persaingan Produk Impor
- Klik HS pada `Top Produk Nilai Impor Indonesia` membuka modal detail negara asal impor Indonesia, asal impor utama dari negara asal teratas, dan asal impor ASEAN dari negara asal teratas.
- `Peta Persaingan Produk Impor` memakai title list:
  - `Negara Asal Impor Indonesia`
  - `Asal Impor Utama dari {top negara asal}`
  - `Asal Impor ASEAN dari {top negara asal}`
- Export Excel `Top Produk Nilai Impor Indonesia` disamakan dengan pola ekspor, tetapi wording kolom mengikuti istilah impor dan panel `Peta Persaingan Produk Impor`. Kolom kompetitor utama dan ASEAN juga bersifat kondisional.
- `Investasi Masuk` memakai layout panel spesifik:
  - Peta Nilai Investasi Masuk ke Indonesia
  - Top Mitra Investasi Masuk ke Indonesia
  - Time Series Nilai Investasi Masuk ke Indonesia
  - Tren Investasi Masuk ke Indonesia
- Pada tab `Investasi Masuk`, peta dan top mitra memakai data `nilai_investasi` yang diremap agar kompatibel dengan komponen map/table existing.
- `Time Series Nilai Investasi Masuk ke Indonesia` memakai agregasi `meta.total_world_per_year` dengan fallback ke penjumlahan `items`.
- `Tren Investasi Masuk ke Indonesia` memakai tabel lokal dengan sorting pada negara, nilai aktif, nilai tahun sebelumnya, delta nilai, dan delta persentase.
- Tooltip `Top Mitra Investasi Masuk` memakai wording kontekstual: `Nilai Investasi`, `Pangsa Investasi`, dan `Perubahan Investasi YoY`.
- `Turis Masuk` memakai layout panel spesifik:
  - Peta Nilai Wisatawan Masuk
  - Top Mitra Wisatawan Masuk
  - Time Series Nilai Wisatawan Masuk
  - Tren Wisatawan Masuk
- Pada tab `Turis Masuk`, peta dan top mitra memakai data `Jumlah_Wisatawan` yang diremap agar kompatibel dengan komponen map/table existing.
- `Time Series Nilai Wisatawan Masuk` memakai agregasi `meta.total_world_per_year` dengan fallback ke penjumlahan `items`.
- `Tren Wisatawan Masuk` memakai tabel lokal dengan sorting pada negara, nilai aktif, nilai tahun sebelumnya, delta nilai, dan delta persentase.
- Tooltip `Top Mitra Wisatawan Masuk` memakai wording kontekstual: `Nilai Wisatawan`, `Pangsa Wisatawan`, dan `Perubahan Wisatawan YoY`.
- Toast halaman dipisah menjadi dua alur:
  - `Ringkasan diplomasi ekonomi` untuk request `stats`
  - `Analisis diplomasi ekonomi` untuk request `overview` tab aktif
- `Neraca Perdagangan` sekarang memakai layout panel yang setara dengan `Nilai Perdagangan`, tetapi tanpa panel `Komparasi Tren Perdagangan Indonesia`.
- Pada tab `Neraca Perdagangan`, peta, top mitra, time series, dan top produk memakai nilai dari field `neraca`.
- Tooltip `Top Mitra` dan `Top Produk` mendukung label kontekstual. Pada tab neraca, wording yang dipakai disesuaikan menjadi `Proporsi Neraca`, `Perubahan Neraca YoY`, dan label nilai berbasis neraca.
- Layer service diplomasi ekonomi sudah dirapikan ke folder `src/service/indonesia/diplomasi-ekonomi` dan dibagi menjadi `master`, `stats`, `overview`, `competition`, dan `shared`.
- Type dipusatkan di:
  - `src/type/indonesiaDiplomasi.ts`
