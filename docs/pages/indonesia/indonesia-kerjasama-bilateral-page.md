# Indonesia Kerjasama Bilateral Page Documentation

## 1. Ringkasan Halaman

- Nama halaman: `Indonesia Kerjasama Bilateral`
- Route: `APP_ROUTES.INDONESIA.KERJASAMA_BILATERAL`
- Komponen page: `src/pages/indonesia/KerjasamaBilateralPage.tsx`

Halaman ini menampilkan analisis kerjasama ekonomi bilateral Indonesia dengan struktur utama:

1. Header halaman dan deskripsi modul.
2. Filter bilateral berbasis accordion.
3. Tabs analisis sektor bilateral.
4. Tombol unduh ringkasan PDF per tab.
5. Konten tab aktif berupa panel analitik per sektor dengan pola visual yang diseragamkan dengan halaman diplomasi ekonomi.

## 2. Route dan Permission

- Route wajib dari constants: `src/constants/routes.ts`.
- Permission menu mengikuti pola existing:
  - `src/constants/navLinks.ts`
  - `src/constants/permissions.ts`
  - `src/utils/access.ts`

## 3. Data/API yang Dipakai

Service utama:

- `src/service/indonesia/kerjasama-bilateral/master.ts`
- `src/service/indonesia/kerjasama-bilateral/overview.ts`

### 3.1 Master Data Filter

- `GET /api/v1/negara`
- `GET /api/v1/hsproduk`
- `GET /api/v1/data-generator/perdagangan/kode-sumber`
- `GET /api/v1/data-generator/pariwisata/kode-sumber`
- `GET /api/v1/data-generator/investasi/kode-sumber`
- `GET /api/v1/data-generator/jasa/kode-sumber`

### 3.2 Overview per Tab

- `perdagangan` -> `/api/v1/indonesia/kerjasama-bilateral/nilai-perdagangan`
- `pariwisata` -> `/api/v1/indonesia/kerjasama-bilateral/nilai-pariwisata`
- `investasi` -> `/api/v1/indonesia/kerjasama-bilateral/nilai-investasi`
- `jasa` -> `/api/v1/indonesia/kerjasama-bilateral/nilai-jasa`
- `kerjasama_pembangunan` -> `/api/v1/indonesia/kerjasama-bilateral/kerjasama-pembangunan`

### 3.3 Insight Persaingan Produk Perdagangan

- `POST /api/v1/indonesia/kerjasama-bilateral/nilai-perdagangan/insight-tujuan-kompetitor`

### 3.4 Summary PDF per Tab

- `perdagangan` -> `/api/v1/indonesia/kerjasama-bilateral/nilai-perdagangan/summary/pdf`
- `pariwisata` -> `/api/v1/indonesia/kerjasama-bilateral/nilai-pariwisata/summary/pdf`
- `investasi` -> `/api/v1/indonesia/kerjasama-bilateral/nilai-investasi/summary/pdf`
- `jasa` -> `/api/v1/indonesia/kerjasama-bilateral/nilai-jasa/summary/pdf`
- `kerjasama_pembangunan` -> `/api/v1/indonesia/kerjasama-bilateral/nilai-bantuan/summary/pdf`

## 4. Komponen dan Hook

- Page:
  - `src/pages/indonesia/KerjasamaBilateralPage.tsx`
- Components:
  - `src/components/indonesia/kerjasama-bilateral/KerjasamaBilateralFiltersPanel.tsx`
  - `src/components/indonesia/kerjasama-bilateral/tabs/PerdaganganTab.tsx`
  - `src/components/indonesia/kerjasama-bilateral/tabs/PariwisataTab.tsx`
  - `src/components/indonesia/kerjasama-bilateral/tabs/InvestasiTab.tsx`
  - `src/components/indonesia/kerjasama-bilateral/tabs/JasaTab.tsx`
  - `src/components/indonesia/kerjasama-bilateral/tabs/KerjasamaPembangunanTab.tsx`
  - `src/components/ui/Accordion.tsx`
  - `src/components/ui/Button.tsx`
  - `src/components/ui/ExpandableCard.tsx`
  - `src/components/ui/InsightStatCard.tsx`
  - `src/components/ui/TopMitraTable.tsx`
  - `src/components/ui/TopProdukTable.tsx`
  - `src/components/ui/SortableDataTable.tsx`
  - `src/components/ui/SummaryCard.tsx`
  - `src/components/ui/Tabs.tsx`
  - `src/components/ui/TradeCompetitionInsight.tsx`
  - `src/components/ui/Form/CountryGeoFilter.tsx`
  - `src/components/ui/Form/FilterMultiSelect.tsx`
  - `src/components/ui/Form/GroupedSelect.tsx`
  - `src/components/ui/MapHeatLayer.tsx`
  - `src/components/ui/charts/MultiLineTrendChart.tsx`
  - `src/components/ui/charts/PartnerMixedChart.tsx`
- Hooks:
  - `src/hooks/indonesia/useKerjasamaBilateralMasterQuery.ts`
  - `src/hooks/indonesia/useKerjasamaBilateralOverviewQuery.ts`
  - `src/hooks/indonesia/useKerjasamaBilateralTradeCompetitionInsightMutation.ts`
- Validators:
  - `src/validators/kerjasamaBilateralFilters.ts`

## 5. Catatan Implementasi

- Filter bilateral memakai draft state, tetapi saat halaman pertama kali terbuka default filter langsung di-submit untuk memuat data awal.
- Filter `Negara Mitra` memakai `CountryGeoFilter` dengan dua mode:
  - `Unit Regional`
  - `Kawasan/Organisasi`
- Saat parent geo/group dipilih, negara turunannya otomatis ikut terpilih.
- Saat mode filter negara diganti, pilihan negara di-reset ke default mitra bilateral:
  - `Amerika Serikat`
  - `Tiongkok`
  - `Jepang`
- Filter `Negara Mitra` dan `HS Code` memakai `FilterMultiSelect` yang menampilkan chip item terpilih, daftar pilihan terpilih yang bisa di-resize, dan opsi clear.
- Jika seluruh HS Code terpilih pada tab `Perdagangan`, payload API dikirim sebagai `hsCode: "ALL"`.
- `Sumber Data` memakai grouped select tunggal per sektor, tetapi payload tetap dikirim sebagai array `sumber` per sektor.
- Fetch master bilateral dan geo filter sudah dirapikan ke React Query + dedupe in-flight request agar request `negara`, `grupnegara`, `common-negara`, dan `hsproduk` tidak ditarik ganda oleh komponen yang berbeda.
- Tombol tab dan mode aktif sudah memakai variant reusable pada `Button`.
- Loading halaman, loading unduh ringkasan PDF, dan loading request insight persaingan produk semuanya memakai toast.
- Download Excel pada tab `Perdagangan` sekarang memuat metadata tambahan:
  - `Sumber`
  - `Negara mitra terpilih`
  - `Diekspor`
- Untuk tabel `Top Produk` pada tab `Perdagangan`, file Excel membawa seluruh tahun yang tersedia, bukan hanya tahun terakhir.
- Tab `Perdagangan` sudah tidak generic lagi dan mengikuti pola visual `TotalEksporTab`, dengan panel:
  - Summary cards perdagangan bilateral
  - `Komparasi Tren Perdagangan Indonesia` (top 5)
  - `Nilai Perdagangan Indonesia ke Negara/Entitas`
  - `Top Produk Nilai Perdagangan Indonesia`
  - `Peta Persaingan Produk`
- Panel `Nilai Perdagangan Indonesia ke Negara/Entitas` dan `Top Produk Nilai Perdagangan Indonesia` memiliki sub-tab:
  - `Nilai Perdagangan`
  - `Ekspor`
  - `Impor`
  - `Neraca`
- `Top Produk` mendukung indikasi under-invoice / over-invoice via warna background sel dan tooltip detail:
  - nilai utama
  - nilai sebaliknya
  - selisih
  - gap
- `Peta Persaingan Produk` mendukung tab `Ekspor` dan `Impor`, select HS, tombol `Cari`, auto-load default HS dari top produk, modal detail HS, dan unduh Excel.
- Tab `Pariwisata` sekarang memakai layout khusus inbound/outbound:
  - `Tren Wisatawan Masuk & Keluar Indonesia ke Mitra Tujuan` dalam `MultiLineTrendChart`
  - `Top Mitra Wisatawan Masuk ke Indonesia`
  - `Top Mitra Wisatawan Keluar dari Indonesia`
  - `Tren Wisatawan Masuk ke Indonesia`
  - `Tren Wisatawan Keluar dari Indonesia`
- Grafik `Tren Wisatawan Masuk & Keluar Indonesia ke Mitra Tujuan` dihitung dari agregasi `items` mitra aktif, bukan `total_world_per_year`, sehingga hanya merepresentasikan partner yang dipilih pada filter.
- Card tren pariwisata menampilkan total masuk dan total keluar kumulatif seluruh tahun mitra aktif, dan subtitle card memuat unit.
- `Top Mitra` inbound/outbound pada tab `Pariwisata` memakai `TopMitraTable` dengan remap `Jumlah_Wisatawan -> nilai_perdagangan` dan `share -> proporsi`.
- Tabel `Tren Wisatawan Masuk/Keluar` pada tab `Pariwisata` juga memakai `TopMitraTable`, sehingga tetap mendapat flag negara, search, limit, sorting, empty state, dan unduh Excel yang konsisten.
- Untuk mode tren wisatawan, `TopMitraTable` menampilkan kolom `Delta` dan `Delta (%)` di samping dua tahun pembanding.
- Subtitle tabel `Top Mitra` dan `Tren Wisatawan` pada tab `Pariwisata` memuat unit satuan dan catatan bahwa nomor mengikuti kolom sorting aktif.
- Helper parsing dan transform tab `Pariwisata` dipisah ke `src/components/indonesia/kerjasama-bilateral/tabs/PariwisataTab.helpers.ts`.
- Tab `Investasi` sekarang memakai layout khusus inbound/outbound yang setara dengan tab `Pariwisata`:
  - `Tren Investasi Masuk & Keluar Indonesia ke Mitra Tujuan`
  - `Top Mitra Investasi Masuk ke Indonesia`
  - `Top Mitra Investasi Keluar dari Indonesia`
  - `Tren Investasi Masuk ke Indonesia`
  - `Tren Investasi Keluar dari Indonesia`
- Grafik `Tren Investasi Masuk & Keluar Indonesia ke Mitra Tujuan` dihitung dari agregasi `items` mitra aktif.
- `Top Mitra` inbound/outbound pada tab `Investasi` memakai `TopMitraTable` dengan remap `nilai_investasi -> nilai_perdagangan` dan `share -> proporsi`.
- Tabel `Tren Investasi Masuk/Keluar` pada tab `Investasi` juga memakai `TopMitraTable`, termasuk kolom `Delta` dan `Delta (%)`, flag negara, search, limit, sorting, empty state, dan unduh Excel.
- Subtitle chart, top mitra, dan tabel tren pada tab `Investasi` memuat unit satuan serta catatan bahwa nomor mengikuti kolom sorting aktif.
- Helper parsing dan transform tab `Investasi` dipisah ke `src/components/indonesia/kerjasama-bilateral/tabs/InvestasiTab.helpers.ts`.
- Tab `Jasa` sekarang memakai layout inbound/outbound yang searah dengan tab `Pariwisata` dan `Investasi`:
  - `Tren Jasa Masuk & Keluar dari Indonesia ke Mitra Tujuan`
  - `Top Mitra Jasa Masuk ke Indonesia`
  - `Top Mitra Jasa Keluar dari Indonesia`
  - `Tren Jasa Masuk ke Indonesia`
  - `Tren Jasa Keluar dari Indonesia`
  - `Top Profesi Jasa Indonesia ke Mitra Tujuan`
  - `Top Profesi Jasa Indonesia dari Mitra Tujuan`
- Grafik jasa dihitung dari agregasi `items` mitra aktif pada inbound/outbound.
- `Top Mitra` dan `Tren Jasa` memakai `TopMitraTable`, dengan remap `Jumlah_Jasa -> nilai_perdagangan` dan `share -> proporsi`, serta kolom `Delta` dan `Delta (%)` pada mode tren.
- Card `Top Mitra Jasa Masuk/Keluar` menyediakan tombol unduh Excel di header card dan tetap memakai `TopMitraTable` untuk konten tabel.
- Panel `Top Profesi Jasa` memakai `TopProdukTable` dalam mode tanpa kode HS, sehingga yang tampil langsung nama profesi beserta pangsa, seri tahun, dan unduh Excel.
- Subtitle chart, top mitra, tabel tren, dan tabel profesi pada tab `Jasa` memuat unit satuan serta catatan urutan sorting aktif.
- Helper parsing dan transform tab `Jasa` dipisah ke `src/components/indonesia/kerjasama-bilateral/tabs/JasaTab.helpers.ts` agar file tab utama fokus ke state dan render.
- Tab `Kerjasama Pembangunan` sekarang memakai layout khusus dengan dua panel utama:
  - `Time Series Nilai Kerjasama Pembangunan dari Indonesia ke Mitra Tujuan`
  - `Top Mitra Kerjasama Pembangunan dari Indonesia ke Mitra Tujuan`
- Grafik `Time Series` memakai seri `nilai_bantuan` per tahun, dengan ringkasan tahun aktif, nilai tahun aktif, total nilai seluruh tahun, dan total jumlah kegiatan.
- Tabel `Top Mitra Kerjasama Pembangunan` memakai `TopMitraTable` dengan remap `nilai_bantuan -> nilai_perdagangan`, `share -> proporsi`, dan `total_kegiatan -> kegiatan`.
- Informasi `jumlah kegiatan` ditampilkan pada tooltip detail tahunan dan ikut dibawa ke export Excel top mitra.
- Nilai pada tabel `Kerjasama Pembangunan` ditampilkan dengan unit inline dan mempertahankan angka desimal sesuai format `IDR Miliar`.
- Helper parsing dan transform tab `Kerjasama Pembangunan` dipisah ke `src/components/indonesia/kerjasama-bilateral/tabs/KerjasamaPembangunanTab.helpers.ts`.
- Loading state memanfaatkan skeleton reusable yang sudah dipakai pada halaman diplomasi ekonomi.
