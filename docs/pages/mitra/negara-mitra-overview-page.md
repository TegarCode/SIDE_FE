# Negara Mitra Overview Page Documentation

## 1. Ringkasan Halaman

- Route group: `APP_ROUTES.MITRA.*`
- Route: `APP_ROUTES.MITRA.OVERVIEW`
- Page: `src/pages/mitra/OverviewPage.tsx`
- Sidebar config: `src/constants/sidebarLinks.ts`
- Route registration: `src/routes/AppRoutes.tsx`

Halaman ini menampilkan ringkasan negara mitra terpilih dalam bentuk globe perdagangan dunia, kartu statistik utama, dan tab analitik ringkas per sektor.

## 2. Struktur Utama

- Header dan layout dirender langsung dari page `src/pages/mitra/OverviewPage.tsx`
- Filter halaman memakai `src/components/filters/RegionCountryEntityFiltersPanel.tsx`
- Visual utama:
  - `src/components/mitra/overview/MitraOverviewGlobe.tsx`
  - `src/components/mitra/overview/MitraOverviewLegend.tsx`
  - `src/components/ui/SummaryCard.tsx`
- Tab overview:
  - `src/components/mitra/overview/tabs/PerdaganganOverviewTab.tsx`
  - `src/components/mitra/overview/tabs/InvestasiOverviewTab.tsx`
  - `src/components/mitra/overview/tabs/PariwisataOverviewTab.tsx`
  - `src/components/mitra/overview/tabs/JasaOverviewTab.tsx`

## 3. Filter

Filter overview mitra memakai filter shared modul `Negara Mitra`:

- `Region (Ditjen)` dari `/api/v1/wilayah`
- `Subregion (Wilayah)` mengikuti region aktif
- `Negara / Entitas` dari `/api/v1/common-negara`
- Default negara: `CHN / TIONGKOK` bila tersedia

Catatan:

- Modul `Negara Mitra` tidak memakai `MitraPageShell`; setiap page merender layout dan filter langsung dari page.
- Komponen filter utama berada di `src/components/filters/RegionCountryEntityFiltersPanel.tsx`.
- Komponen filter dipakai lintas page mitra agar reusable.

## 4. Endpoint dan Hooks

- Master filter:
  - `src/service/mitra/master.ts`
  - `src/hooks/mitra/useMitraMasterQuery.ts`
- Stats overview:
  - `GET /api/v1/negara-mitra/overview/stats/?negara={alpha3}`
  - `src/hooks/mitra/useMitraOverviewStatsQuery.ts`
- Data perdagangan dunia untuk globe:
  - `GET /api/v1/negara-mitra/overview/perdagangan-negara`
  - `src/hooks/mitra/useMitraOverviewTradeQuery.ts`
- Data top perdagangan tab overview:
  - `GET /api/v1/negara-mitra/overview/top-perdagangan/?negara={alpha3}`
  - `src/hooks/mitra/useMitraOverviewTopTradeQuery.ts`
- Data top investasi tab overview:
  - `GET /api/v1/negara-mitra/overview/top-investasi/?negara={alpha3}`
  - `src/hooks/mitra/useMitraOverviewTopInvestmentQuery.ts`
- Data top pariwisata tab overview:
  - `GET /api/v1/negara-mitra/overview/top-pariwisata/?negara={alpha3}`
  - `src/hooks/mitra/useMitraOverviewTopTourismQuery.ts`
- Data top jasa tab overview:
  - `GET /api/v1/negara-mitra/overview/top-jasa?negara={alpha3}`
  - `src/hooks/mitra/useMitraOverviewTopServiceQuery.ts`
- Summary PDF per tab overview:
  - `POST /api/v1/negara-mitra/overview/top-perdagangan/summary/pdf`
  - `POST /api/v1/negara-mitra/overview/top-investasi/summary/pdf`
  - `POST /api/v1/negara-mitra/overview/top-pariwisata/summary/pdf`
  - `POST /api/v1/negara-mitra/overview/top-jasa/summary/pdf`
  - payload: `{ negara: alpha3 }`
  - service: `src/service/mitra/overview.ts`
- Insight persaingan produk:
  - `GET /api/v1/hsproduk`
  - `POST /api/v1/indonesia/kerjasama-bilateral/nilai-perdagangan/insight-tujuan-kompetitor`
  - `src/hooks/indonesia/useDiplomasiHsProductQuery.ts`
  - `src/hooks/indonesia/useDiplomasiTradeCompetitionInsightMutation.ts`

## 5. Globe dan Ringkasan

- Globe mengikuti referensi legacy `OverviewNegaraMitra.jsx`
- Negara diwarnai dari total perdagangan (`export + import`)
- Default fokus globe diarahkan ke negara aktif, dan berubah animatif saat negara diganti
- Tooltip negara pada globe menampilkan:
  - flag
  - nama negara
  - unit
  - total trade
  - export
  - import
  - balance
  - nilai sebelumnya
- `MitraOverviewLegend` memakai popup legend yang membuka ke kiri
- Grid statistik memakai `SummaryCard`
- Nilai `0` pada `SummaryCard` dirender sebagai `N/A`
- Untuk metric yang punya `prev.year`, kartu tetap menampilkan konteks `dari {tahun sebelumnya}`

## 6. Tab Perdagangan Overview

`src/components/mitra/overview/tabs/PerdaganganOverviewTab.tsx`

Section yang tampil:

- `Top Mitra Dagang {negara}`
- `Top Produk Ekspor {negara} ke Dunia`
- `Top Produk Impor {negara} ke Dunia`
- `Peta Persaingan Produk {negara}`

Komponen yang dipakai:

- `src/components/mitra/overview/tabs/TopTradePartnersTable.tsx`
- `src/components/ui/TopProdukTable.tsx`
- `src/components/ui/charts/TopProductsComparisonBarChart.tsx`
- `src/components/ui/TradeCompetitionInsight.tsx`
- `src/components/ui/ExpandableCard.tsx`

Catatan implementasi terbaru:

- `Top Mitra Dagang`:
  - header sticky
  - kolom `Rank` dan `Negara/Entitas` sticky saat scroll horizontal
  - seluruh data tampil tanpa limit
  - nominal memakai format `id-ID`
  - `Pangsa` dan `Perubahan` memakai chip icon + tooltip
  - `INDONESIA` di-highlight
- `Top Produk`:
  - mode `Tabel / Bar Chart`
  - chart memakai sumbu `x = HS code`, `y = nilai`
  - ekspor dan impor memakai tone warna chart yang sama
  - tooltip chart menampilkan HS, nama produk, nilai aktif, nilai sebelumnya, pangsa, perubahan, dan unit
  - tabel top produk tampil semua tanpa limit
- `Peta Persaingan Produk`:
  - opsi HS diambil dari endpoint `/api/v1/hsproduk`
  - data insight diambil langsung dari endpoint insight kompetitor
  - default HS mengikuti top produk ekspor pertama
  - ada tombol `Cari`
  - saat ganti tab `Ekspor / Impor`, HS aktif tetap dipertahankan
  - toast loading dan success muncul saat insight sedang ditarik dan selesai dimuat

## 7. Tab Investasi Overview

`src/components/mitra/overview/tabs/InvestasiOverviewTab.tsx`

Section yang tampil:

- `Investasi Masuk ke {negara}`
- `Investasi Keluar dari {negara}`

Komponen yang dipakai:

- `src/components/ui/TopMitraTable.tsx`
- `src/components/ui/charts/TopCountryComparisonBarChart.tsx`
- `src/components/ui/ExpandableCard.tsx`

Catatan implementasi:

- mode `Tabel / Chart` mengikuti pola tab perdagangan
- request data dilakukan per tab dengan filter negara aktif dari induk
- tabel memakai `TopMitraTable` hasil remap data investasi
- seluruh data tampil tanpa limit
- proporsi tidak ditampilkan
- nilai investasi memakai presisi natural response, dengan maksimum dua desimal
- `INDONESIA` tetap di-highlight dan dipin
- source tampil di footer card
- toast loading dan success muncul saat request investasi berjalan dan selesai

## 8. Tab Pariwisata Overview

`src/components/mitra/overview/tabs/PariwisataOverviewTab.tsx`

Section yang tampil:

- `Top Negara/Entitas Asal Turis ke Indonesia`
- `Top Negara/Entitas Tujuan Turis dari Indonesia`

Komponen yang dipakai:

- `src/components/ui/TopMitraTable.tsx`
- `src/components/ui/charts/TopCountryComparisonBarChart.tsx`
- `src/components/ui/ExpandableCard.tsx`

Catatan implementasi:

- mode `Tabel / Chart` mengikuti pola tab investasi
- request data dilakukan per tab dengan filter negara aktif dari induk
- tabel memakai `TopMitraTable`
- flag negara tampil jika endpoint mengembalikan `alpha2`
- seluruh data tampil tanpa limit
- proporsi tidak ditampilkan
- source tampil di footer card
- toast loading dan success muncul saat request pariwisata berjalan dan selesai dimuat

## 9. Tab Jasa Overview

`src/components/mitra/overview/tabs/JasaOverviewTab.tsx`

Section yang tampil:

- `Tenaga Kerja Indonesia di {negara}`

Komponen yang dipakai:

- `src/components/ui/TopMitraTable.tsx`
- `src/components/ui/ExpandableCard.tsx`

Catatan implementasi:

- request data dilakukan per tab dengan filter negara aktif dari induk
- tabel memakai `TopMitraTable` hasil remap data jasa
- label kolom pertama diubah menjadi `Aktivitas/Profesi`
- seluruh data tampil tanpa limit
- proporsi tidak ditampilkan
- source tampil di footer card
- toast loading dan success muncul saat request jasa berjalan dan selesai dimuat

## 10. Download

- Di kanan tab overview tersedia tombol `Unduh Ringkasan (PDF)` yang mengikuti tab aktif.
- Tombol ini mengirim request summary PDF dengan body filter negara aktif dari induk.
- Download tabel top mitra dan top produk mengikuti pola legacy `databank-fe`
- `Top Mitra Dagang` export memuat:
  - rank
  - negara/entitas
  - total
  - pangsa total
  - perubahan total
  - ekspor
  - pangsa ekspor
  - perubahan ekspor
  - impor
  - pangsa impor
  - perubahan impor
- `Top Produk` export memuat:
  - rank
  - produk (HS)
  - daftar tujuan/asal
  - posisi Indonesia pada daftar tujuan/asal
  - nilai tahun aktif
  - nilai tahun sebelumnya
  - share
  - perubahan YoY
  - kompetitor global
  - posisi Indonesia global
  - kompetitor ASEAN
  - posisi Indonesia ASEAN

## 11. Feedback Loading

- Halaman overview mitra menampilkan loading state dari query utama
- Query top perdagangan, top investasi, dan top pariwisata direfresh saat tab aktif dibuka dengan filter negara terbaru
- Query top jasa juga direfresh saat tab aktif dibuka dengan filter negara terbaru
- Request insight kompetitor di tab perdagangan menampilkan toast:
  - `loading` saat request berjalan
  - `success` saat response selesai dimuat
- Request investasi, pariwisata, dan jasa juga menampilkan toast:
  - `loading` saat request tab sedang ditarik
  - `success` saat response tab selesai dimuat
