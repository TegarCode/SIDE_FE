# Analisis Potensi & Daya Saing Page

## Lokasi

- Page: `src/pages/analisis/PotensiDayaSaingPage.tsx`
- Route: `/analisis/potensi-daya-saing`

## Tujuan Halaman

Halaman ini menampilkan analisis potensi dan daya saing antara negara asal dan negara tujuan melalui 2 tampilan utama:

- `RCA CMSA`
- `View RCA CMSA Calculations`

Halaman dipakai untuk membaca rekomendasi strategi produk serta dekomposisi metrik RCA dan CMSA per HS4.

## Struktur Utama

Halaman terdiri dari:

1. `PageTitle`
2. filter asal dan tujuan
3. tab analisis
4. section ringkasan `RCA CMSA`
5. section tabel `Perhitungan RCA & CMSA`

## Filter

Komponen filter:

- `src/components/filters/OriginSingleDestinationSingleFiltersPanel.tsx`

Validator:

- `src/validators/originSingleDestinationSingleFilters.ts`

Perilaku filter:

- asal memakai endpoint negara umum
- tujuan memakai endpoint negara khusus RCA-CMSA
- asal dikunci ke `Indonesia (IDN)`
- region dan subregion asal tetap default `Semua`
- tujuan default `Tiongkok / China (CHN)`

Sumber data filter:

- `src/hooks/indonesia/useCountryGeoQueries.ts`
- `useCommonCountriesQuery()` untuk asal
- `useCommonCountriesRcaCmsaQuery()` untuk tujuan
- `fetchMitraWilayah()` untuk region dan subregion

## Endpoint

### Master Filter

- `GET /api/v1/common-negara`
- `GET /api/v1/common-negara-rca-cmsa`
- `GET /api/v1/wilayah`

### Analisis

- `GET /api/v1/analisis/rca-cmsa`
- `GET /api/v1/analisis/rca-cmsa-kalkulasi`

Service:

- `src/service/analisis/overview.ts`

Hook:

- `src/hooks/analisis/useAnalisisPotensiDayaSaingQuery.ts`

## Tab 1: RCA CMSA

Komponen:

- `src/components/analisis/potensi-daya-saing/AnalisisPotensiRcaCmsaOverviewSection.tsx`

Isi tab:

- hero penjelasan konsep `RCA` dan `CMSA`
- chip kategori `Perdagangan` dan `Daya Saing`
- chip asal dan tujuan
- search bar
- 5 summary card
- 4 card tabel strategi

Summary card:

- total semua produk
- top produk ekspor
- top produk impor
- top produk FDI inbound
- top produk FDI outbound

Subtitle summary card menampilkan jumlah awal:

- contoh `917 entri (awal)`

Search bar memfilter:

- rank
- HS4 / kode
- nama produk
- strategi
- nilai

Jika hasil search kosong, fallback card tabel berubah jadi:

- `Tidak ada hasil yang sesuai dengan pencarian.`

Jika data memang kosong dari backend:

- `Data saran strategi belum tersedia.`

### Card Strategi

Komponen:

- `src/components/analisis/potensi-daya-saing/AnalisisPotensiTableCard.tsx`

Semua card strategi memakai:

- `src/components/ui/TopProdukTable.tsx`

Mode tabel:

- `columnMode="potensi_simple"`

Judul card:

- `Saran Strategi Produk Ekspor Teratas`
- `Saran Strategi Produk Impor Teratas`
- `Saran Strategi Produk FDI Masuk Teratas`
- `Saran Strategi Produk FDI Keluar Teratas`

Subtitle card:

- hanya menampilkan `Asal` dan `Tujuan`

Kolom tabel:

- `No`
- `Produk (HS)`
- `Strategi`
- `Nilai`

Fitur:

- search
- sort
- limit
- expand
- unduh Excel

## Tab 2: View RCA CMSA Calculations

Komponen:

- `src/components/analisis/potensi-daya-saing/AnalisisPotensiRcaCmsaCalcSection.tsx`

Section ini juga memakai:

- `src/components/ui/TopProdukTable.tsx`

Mode tabel:

- `columnMode="potensi_calc"`

Subtitle card:

- `Dekomposisi dan metrik inti per HS4 berdasarkan filter negara.`
- `Asal: ...`
- `Tujuan: ...`
- `Nomor mengikuti urutan sorting pada kolom ...`

Default sort:

- `Strategi`

Kolom tabel:

- `No`
- `Produk (HS)`
- `Strategi`
- `RCA (Asal)`
- `CMSA (Asal)`
- `Class (Asal)`
- `RCA (Tujuan)`
- `CMSA (Tujuan)`
- `Class (Tujuan)`
- `Asal ke Dunia`
- `Tujuan ke Dunia`

Catatan tampilan:

- nilai RCA/CMSA/world ditampilkan sebagai angka biasa 2 desimal
- tidak memakai badge proporsi
- viewport tabel dibuat lebih tinggi
- opsi limit dimulai dari `10`

Fitur:

- search
- sort
- limit
- expand
- unduh Excel

## Toast Request

Toast di page:

- loading saat request aktif
- success saat data berhasil dimuat
- error saat request gagal

Toast dibedakan berdasarkan tab aktif:

- `RCA CMSA`
- `Perhitungan RCA & CMSA`

## Dokumen Pedoman

Tombol di kanan judul halaman:

- `Pedoman RCA-CMSA`

Perilaku:

- membuka file `/files/pedoman-rca-cmsa.pdf`
- tampil sebagai button dengan icon unduh

## Tipe Data

Definisi tipe utama:

- `src/type/analisis.ts`

Tipe shared untuk tabel produk:

- `src/type/indonesiaDiplomasi.ts`

## Catatan Implementasi

- Filter tujuan memakai endpoint khusus RCA-CMSA karena daftar negaranya berbeda dari endpoint umum.
- Filter asal dikunci ke Indonesia untuk menjaga skenario analisis tetap konsisten.
- `TopProdukTable` dipakai ulang melalui mode khusus agar perilaku search, sort, limit, expand, dan download tetap seragam dengan halaman lain.
