# Indonesia Infrastruktur Diplomasi Page Documentation

## 1. Ringkasan Halaman

- Nama halaman: `Indonesia Infrastruktur Diplomasi Ekonomi`
- Route: `APP_ROUTES.INDONESIA.INFRASTRUKTUR`
- Komponen page: `src/pages/indonesia/InfrastrukturPage.tsx`

Halaman ini menyiapkan filter master untuk modul infrastruktur diplomasi ekonomi Indonesia.

## 2. Data/API yang Dipakai

Service utama:

- `src/service/indonesia/infrastruktur/master.ts`
- `src/service/indonesia/infrastruktur/overview.ts`

Endpoint:

- `GET /api/v1/wilayah`
- `GET /api/v1/indonesia/infrastruktur/kategori`
- `GET /api/v1/indonesia/infrastruktur/perwakilan`
- `GET /api/v1/indonesia/infrastruktur/perwakilan-asing`
- `GET /api/v1/indonesia/infrastruktur/pameran-indonesia`
- `GET /api/v1/indonesia/infrastruktur/pameran-perwakilan`
- `GET /api/v1/indonesia/infrastruktur/perjanjian-antar-negara`

## 3. Komponen dan Hook

- Page:
  - `src/pages/indonesia/InfrastrukturPage.tsx`
- Components:
  - `src/components/indonesia/infrastruktur/InfrastrukturFiltersPanel.tsx`
  - `src/components/indonesia/infrastruktur/InfrastrukturMap.tsx`
  - `src/components/indonesia/infrastruktur/InfrastrukturOverview.tsx`
  - `src/components/indonesia/infrastruktur/tabs/PerwakilanIndonesiaTab.tsx`
  - `src/components/indonesia/infrastruktur/tabs/PerwakilanAsingTab.tsx`
  - `src/components/indonesia/infrastruktur/tabs/PameranIndonesiaTab.tsx`
  - `src/components/indonesia/infrastruktur/tabs/PameranPerwakilanTab.tsx`
  - `src/components/indonesia/infrastruktur/tabs/PerjanjianAntarNegaraTab.tsx`
  - `src/components/indonesia/infrastruktur/tabs/InfrastrukturTabPlaceholder.tsx`
  - `src/components/ui/Accordion.tsx`
  - `src/components/ui/Button.tsx`
  - `src/components/ui/ExpandableCard.tsx`
  - `src/components/ui/FilterFallbackCard.tsx`
  - `src/components/ui/Form/MultiSelect.tsx`
  - `src/components/ui/Form/Select.tsx`
  - `src/components/ui/PageTitle.tsx`
  - `src/components/ui/SummaryCard.tsx`
  - `src/components/ui/Tabs.tsx`
- Hooks:
  - `src/hooks/indonesia/useInfrastrukturMasterQuery.ts`
  - `src/hooks/indonesia/useInfrastrukturPerwakilanQuery.ts`
  - `src/hooks/indonesia/useInfrastrukturPerwakilanAsingQuery.ts`
  - `src/hooks/indonesia/useInfrastrukturPameranIndonesiaQuery.ts`
  - `src/hooks/indonesia/useInfrastrukturPameranPerwakilanQuery.ts`
  - `src/hooks/indonesia/useInfrastrukturPerjanjianAntarNegaraQuery.ts`
- Types:
  - `src/type/indonesiaInfrastruktur.ts`

## 4. Catatan Implementasi

- Filter mengikuti pola halaman Indonesia lain: accordion, draft state, tombol `Reset`, dan `Cari Data`.
- Ringkasan filter aktif ditampilkan di header accordion agar tetap terbaca saat panel tertutup.
- `Region (Ditjen)` mengambil data parent dari endpoint `/api/v1/wilayah`.
- `Subregion (Wilayah)` difilter sesuai region aktif.
- `Kategori` memakai `MultiSelect` dan mengambil data dari endpoint `/api/v1/indonesia/infrastruktur/kategori`.
- Label kategori ditampilkan dengan pola `{group_label} - {nama}` agar grouping tetap terbaca walau saat ini masih flat select.
- Query overview mengirim `wilayah` dan `categories` sebagai query params array ke endpoint `/api/v1/indonesia/infrastruktur/perwakilan`.
- Overview saat ini menampilkan:
  - summary cards jumlah perwakilan
  - peta persebaran perwakilan Indonesia
  - tab bar seperti referensi legacy
  - tabel `Perwakilan Indonesia` dengan search, limit, dan unduh Excel
  - tabel `Perwakilan Asing di Indonesia` dengan search, limit, dan unduh Excel
  - tabel `Pameran di Indonesia` dengan search, limit, dan unduh Excel
  - tabel `Pameran di Perwakilan` dengan search, limit, dan unduh Excel
- Tabel `Perwakilan Indonesia` menampilkan:
  - `Perwakilan`
  - `Negara` dalam bentuk chip multi-value
  - `Kategori`
  - `Alamat`
  - `Website` yang bisa dibuka di tab baru
- Tabel `Perwakilan Asing di Indonesia` menampilkan:
  - `Negara` dengan flag
  - `Email`
  - `Alamat`
  - `Map` ke Google Maps
- Tabel `Pameran di Indonesia` menampilkan:
  - `Agenda`
  - `Kategori`
  - `Provinsi`
  - `Tanggal Mulai`
  - `Tanggal Berakhir`
- Tabel `Pameran di Perwakilan` menampilkan:
  - `Perwakilan`
  - `Negara`
  - `Wilayah Kerja`
  - `Tempat`
  - `Tanggal`
  - `Exhibition / Promosi`
- Tabel `Perjanjian Antar Negara` menampilkan:
  - `Kode`
  - `HPI`
  - `Wilayah Kemlu`
  - `Bidang Kerjasama`
  - `Judul Perjanjian (Indonesia)`
  - tombol `Detail` untuk membuka modal semua field
- Tab `Perjanjian Antar Negara` punya filter lokal `Bidang Kerjasama`, search, pagination, unduh Excel, dan modal detail.
- Filter `Bidang Kerjasama` pada tab perjanjian memakai `Select` ukuran kecil agar lebih compact di toolbar tabel.
- Modal detail `Perjanjian Antar Negara` memakai layout dua kolom dengan badge metadata di header (`Kode`, `HPI`, `Bidang`, `Wilayah Kemlu`) dan tombol `Close` di footer.
- Halaman menampilkan toast `loading` saat request tab infrastruktur aktif berjalan dan toast `success` saat data tab selesai dimuat.

## 5. Status Integrasi

- Master filter region, subregion, dan kategori sudah terhubung.
- Query overview perwakilan sudah terhubung.
- Query `perwakilan-asing` terhubung khusus untuk tab `Perwakilan Asing di Indonesia`.
- Query `pameran-indonesia` terhubung khusus untuk tab `Pameran di Indonesia`.
- Query `pameran-perwakilan` terhubung khusus untuk tab `Pameran di Perwakilan`.
- Query `perjanjian-antar-negara` terhubung khusus untuk tab `Perjanjian Antar Negara`.
- Konten tab `Perwakilan Indonesia` sudah menampilkan peta dan tabel detail.
- Konten tab `Perwakilan Asing di Indonesia`, `Pameran di Indonesia`, dan `Pameran di Perwakilan` sudah menampilkan tabel detail.
- Konten tab `Perjanjian Antar Negara` sudah menampilkan tabel detail dan modal.
