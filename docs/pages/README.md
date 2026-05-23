# Page Docs

Dokumen ini jadi indeks dokumentasi halaman di `side_fe`.

## Daftar Halaman

- [Home](./home-page.md)
- [FAQ](./faq-page.md)
- [Login](./login-page.md)

## Folder Admin

- [Beranda Admin](./admin/admin-dashboard-page.md)
- [Manajemen Peran](./admin/role-management-page.md)
- [Permission Management](./admin/permission-management-page.md)
- [Manajemen Pengguna](./admin/user-management-page.md)
- [Manajemen FAQ](./admin/faq-management-page.md)
- [Manajemen Kontak](./admin/contact-management-page.md)
- [Manajemen API Client](./admin/api-client-management-page.md)
- [Pengunjung Halaman SIDE Management](./admin/side-page-view-management-page.md)
- [Daftar Video Tutorial Management](./admin/tutorial-playlist-management-page.md)
- [Cache Management](./admin/cache-management-page.md)
- [Authentication Log Management](./admin/authentication-log-management-page.md)
- [Trade Management](./admin/trade-management-page.md)
- [Investment Management](./admin/investment-management-page.md)
- [Tourism Management](./admin/tourism-management-page.md)

## Folder Indonesia

- [Indonesia Diplomasi Ekonomi](./indonesia/indonesia-diplomasi-ekonomi-page.md)
- [Indonesia Indikator Ekonomi](./indonesia/indonesia-indikator-ekonomi-page.md)
- [Indonesia Infrastruktur](./indonesia/indonesia-infrastruktur-page.md)
- [Indonesia Kerjasama Bilateral](./indonesia/indonesia-kerjasama-bilateral-page.md)

## Folder Mitra

- [Negara Mitra Overview](./mitra/negara-mitra-overview-page.md)
- [Negara Mitra Perdagangan](./mitra/negara-mitra-perdagangan-page.md)
- [Negara Mitra Investasi](./mitra/negara-mitra-investasi-page.md)
- [Negara Mitra Pariwisata](./mitra/negara-mitra-pariwisata-page.md)
- [Negara Mitra Jasa](./mitra/negara-mitra-jasa-page.md)

## Folder Sektor

- [Komoditas Utama TIK](./sektor/komoditas-utama-tik-page.md)
- [Komoditas Utama Energi](./sektor/komoditas-utama-energi-page.md)
- [Komoditas Utama Mineral Kritis](./sektor/komoditas-utama-mineral-kritis-page.md)
- [Komoditas Utama Kesehatan](./sektor/komoditas-utama-kesehatan-page.md)
- [Komoditas Utama Pangan](./sektor/komoditas-utama-pangan-page.md)
- [Komoditas Utama Pertahanan](./sektor/komoditas-utama-pertahanan-page.md)
- [Komoditas Utama Hilirisasi](./sektor/komoditas-utama-hilirisasi-page.md)

## Folder Analisis

- [Analisis Komoditas Ekspor Utama](./analisis/analisis-komoditas-ekspor-utama-page.md)
- [Analisis Potensi & Daya Saing](./analisis/analisis-potensi-daya-saing-page.md)
- [Analisis Geopolitik & Perdagangan](./analisis/analisis-geopolitik-perdagangan-page.md)
- [Analisis IDE (Indeks Diplomasi Ekonomi)](./analisis/analisis-ide-page.md)
- [Analisis Operational Risk](./analisis/analisis-operational-risk-page.md)

## Folder Data Generator

- [Data Generator Perdagangan](./data-generator/data-generator-perdagangan-page.md)
- [Data Generator Investasi](./data-generator/data-generator-investasi-page.md)
- [Data Generator Pariwisata](./data-generator/data-generator-pariwisata-page.md)
- [Data Generator Jasa](./data-generator/data-generator-jasa-page.md)
- [Data Generator Indikator Ekonomi](./data-generator/data-generator-indikator-ekonomi-page.md)

## Folder Report Generator

- [Report Generator RCA & CMSA](./report-generator/report-generator-rca-cmsa-page.md)
- [Report Generator Market Share](./report-generator/report-generator-market-share-page.md)
- [Report Generator Kerjasama Perdagangan](./report-generator/report-generator-kerjasama-perdagangan-page.md)

## Halaman Planned (Doc Belum Dibuat)

- `Databank`

## Sumber Konfigurasi

- Route: `src/constants/routes.ts`
- Permission: `src/constants/permissions.ts`
- Navigasi + akses menu: `src/constants/navLinks.ts`
- Filter akses menu: `src/utils/access.ts`
- Route React Router aktif: `src/routes/AppRoutes.tsx`
- Page transition splash global: `src/components/ui/PageTransitionSplash.tsx`

## Status Implementasi

- `Implemented`: halaman sudah terdaftar di `AppRoutes`.
- `Planned`: route ada di constants/nav, tapi komponen halaman belum didaftarkan di `AppRoutes`.

## Catatan Global

- Aplikasi memakai splash transition global saat initial load/refresh dan saat perpindahan route halaman.
- Splash hanya bereaksi pada perubahan `pathname`, jadi tidak ikut tampil saat perpindahan tab internal komponen.
- Jika session auth aktif, perpindahan route juga dapat memicu sinkronisasi current user untuk refresh role/permission tanpa relogin.
