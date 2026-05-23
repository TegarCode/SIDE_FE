# Analisis Komoditas Ekspor Utama Page Documentation

## 1. Ringkasan Halaman

- Route: `APP_ROUTES.ANALISIS.PRODUK_KOMODITAS`
- Page: `src/pages/analisis/ProdukKomoditasPage.tsx`

Halaman ini menampilkan analisis komoditas ekspor utama dari satu negara asal ke satu atau banyak negara tujuan. Fokus utamanya adalah daftar produk ekspor per HS, dinamika nilai ekspor per tahun, kompetitor utama ASEAN dan global, serta indikasi anomali mirror trade.

## 2. Struktur Utama

Halaman terdiri dari:

1. Judul halaman `Komoditas Ekspor Utama`
2. Panel filter asal dan tujuan
3. Card tabel analisis produk ekspor
4. Modal detail kompetitor

## 3. Filter Asal dan Tujuan

- Komponen: `src/components/filters/OriginSingleDestinationMultiFiltersPanel.tsx`
- Validator: `src/validators/originSingleDestinationMultiFilters.ts`
- Master data:
  - `src/hooks/mitra/useMitraMasterQuery.ts`
  - `src/service/mitra/master.ts`

Field:

- `Asal`
  - `Region (Ditjen)`
  - `Subregion (Wilayah)`
  - `Negara / Entitas`
- `Tujuan`
  - mode `geo/group` multi select

Default:

- `Asal = IDN`
- `Tujuan = CHN`

Validasi:

- negara asal wajib terisi
- tujuan wajib minimal satu negara/entitas
- tombol `Cari Data` disable jika draft belum valid

Catatan implementasi:

- sinkronisasi default `IDN` dilakukan setelah opsi master negara selesai dimuat
- panel memakai accordion dan summary chip seperti pola filter shared lainnya
- halaman induk tidak perlu menjalankan validasi manual tambahan

## 4. Request Data

- Hook: `src/hooks/analisis/useAnalisisProdukKomoditasQuery.ts`
- Service: `src/service/analisis/overview.ts`
- Endpoint: `GET /api/v1/analisis/komoditas-ekspor-utama`

Parameter request:

- `origin`: satu kode negara asal
- `dest`: array kode negara tujuan

Contoh:

```json
{
  "origin": "AUS",
  "dest": ["CHN"]
}
```

Catatan normalisasi:

- tahun dibaca dinamis dari kolom `exp_{year}`, `share_pct_{year}`, dan `exp_rev_{year}`
- nama negara asal, tujuan, unit, dan sumber dibentuk dari `meta`
- data produk dinormalisasi ke bentuk yang kompatibel dengan `TopProdukTable`

## 5. Toast Request

Halaman memakai toast request seperti page-page analitik lain:

- `loading`: saat data komoditas sedang diambil
- `success`: saat data berhasil dimuat
- `error`: saat request gagal

Guard toast:

- key toast dibentuk dari kombinasi `origin + destinations`
- toast success/error tidak ditampilkan berulang untuk kombinasi filter yang sama

## 6. Card Daftar Produk

- Komponen section: `src/components/analisis/produk-komoditas/AnalisisProdukKomoditasTableSection.tsx`
- Komponen tabel: `src/components/ui/TopProdukTable.tsx`

Judul card:

- `Daftar Nilai Ekspor Produk Negara/Entitas {Negara Asal} ke {Negara Tujuan}`
- tujuan ditampilkan maksimal 3 nama
- jika lebih dari 3, sisa tujuan ditampilkan lewat tooltip info

Subtitle card:

- `Tahun {awal}-{akhir}`
- `Unit: ...`
- `Asal: ...`
- `Tujuan: ...`
- `Nomor mengikuti urutan sorting pada kolom ...`
- info interaksi:
  - hover kolom ekspor untuk melihat detail nilai
  - baris/sel warning terkait indikasi invoicing
  - klik kompetitor untuk membuka modal

Header actions:

- `expand`
- `unduh excel`

Catatan:

- card memakai `ExpandableCard`
- saat loading menampilkan `TableSkeleton`
- sumber data tampil di kanan bawah card

## 7. Struktur Kolom Tabel

Mode tabel memakai `columnMode="analysis_export"` dengan kolom:

- `No`
- `HS Produk`
- `Ekspor {tahun}` untuk setiap tahun yang tersedia
- `CAGR %`
- `Kompetitor ASEAN`
- `Kompetitor Global`

Header info:

- tiap kolom utama punya tooltip penjelasan di sisi kanan header
- tooltip tahun menjelaskan isi nilai ekspor, pangsa, dan perubahan

Sorting:

- kolom ekspor tahunan dapat diurutkan
- subtitle card mengikuti nama kolom sort aktif

Limit:

- default limit `10`
- opsi limit: `10`, `15`, `20`, `50`

## 8. Sel Nilai Ekspor

Pada tiap kolom ekspor tahunan, sel menampilkan:

- nilai ekspor utama
- badge perubahan dibanding tahun sebelumnya
- badge pangsa

Layout visual:

- nilai berada di atas
- perubahan berada di kanan, di antara nilai dan pangsa
- pangsa berada tepat di bawah nilai

Tooltip sel ekspor menampilkan:

- `Nilai`
- `Pangsa`
- `Perubahan dari {tahun sebelumnya}`
- `Nilai sebaliknya (mirror)`
- `Selisih nilai (%)`
- status `Under invoicing` atau `Over invoicing` bila melewati ambang batas

Aturan mirror trade:

- basis pembanding memakai nilai mirror pada tahun yang sama
- `under invoicing` jika mirror lebih besar dari nilai utama dan selisih >= 40%
- `over invoicing` jika nilai utama lebih besar dari mirror dan selisih >= 40%

Highlight:

- warning kuning hanya diterapkan pada sel nilai yang terindikasi
- icon warning ditampilkan di area nilai tersebut

## 9. Kolom Kompetitor

Setiap kolom kompetitor menampilkan top 1 di tabel utama:

- flag negara
- nama negara
- pangsa dengan icon

Interaksi:

- sel kompetitor diberi affordance hover agar terlihat bisa diklik
- klik membuka modal detail kompetitor ASEAN atau global

Download Excel:

- saat unduh, kolom kompetitor tidak hanya top 1
- seluruh negara pada list kompetitor ikut diekspor
- format:

`1) INDONESIA (76.75%); 2) AFRIKA SELATAN (8.03%)`

Nomor memakai `rank` dari response, atau fallback ke urutan array.

## 10. Modal Detail Kompetitor

- Komponen: `src/components/ui/TradeCompetitionInsight.tsx`

Modal dipakai untuk melihat detail kompetitor ASEAN atau global dari satu produk tertentu.

Isi modal:

- card tahun aktif
- `Nilai Ekspor Asal ke Mitra`
- `Pangsa Asal ke Mitra`
- daftar negara kompetitor sesuai group aktif

Catatan:

- modal tidak menampilkan list `Negara Tujuan`
- judul modal mengikuti group yang dipilih:
  - `Detail Kompetitor ASEAN`
  - `Detail Kompetitor Global`

## 11. Download

Unduh card utama:

- format `Excel`
- handler di-register dari `TopProdukTable`
- nama file memakai format:
  - `Daftar_Nilai_Ekspor_Produk_{asal}_ke_{tujuan}`

Konten export:

- seluruh kolom tabel aktif
- seluruh list kompetitor pada kolom kompetitor
- share kompetitor memakai 2 angka desimal

## 12. Dependency Utama

- `src/pages/analisis/ProdukKomoditasPage.tsx`
- `src/components/filters/OriginSingleDestinationMultiFiltersPanel.tsx`
- `src/components/analisis/produk-komoditas/AnalisisProdukKomoditasTableSection.tsx`
- `src/components/ui/TopProdukTable.tsx`
- `src/components/ui/TradeCompetitionInsight.tsx`
- `src/hooks/analisis/useAnalisisProdukKomoditasQuery.ts`
- `src/service/analisis/overview.ts`
- `src/type/analisis.ts`

## 13. Status

- filter asal dan tujuan aktif
- request data aktif
- toast request aktif
- tabel analisis aktif
- sorting aktif
- tooltip header aktif
- tooltip detail ekspor aktif
- modal kompetitor aktif
- expand card aktif
- unduh excel aktif
