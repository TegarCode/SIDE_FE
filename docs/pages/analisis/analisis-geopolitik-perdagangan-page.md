# Analisis Geopolitik & Perdagangan Page

## Lokasi

- Page: `src/pages/analisis/GeopolitikPerdaganganPage.tsx`
- Route: `/analisis/geopolitik-perdagangan`

## Tujuan Halaman

Halaman ini menampilkan analisis perdagangan Indonesia dalam konteks geopolitik melalui tiga blok utama:

- `Top 5 Negara Geopolitik`
- `Komparasi Ekspor dan Impor`
- `Top 20 Produk`

Fokus analisisnya adalah posisi Indonesia terhadap dunia dan negara geopolitik utama, baik pada level negara maupun produk.

## Struktur Utama

Halaman terdiri dari:

1. `PageTitle`
2. filter tahun
3. section `Top 5 Negara Geopolitik`
4. section `Komparasi Ekspor dan Impor`
5. section `Top 20 Produk`

## Filter Tahun

Filter tahun berada di sisi kanan judul halaman.

Komponen:

- `src/components/ui/Form/Select.tsx`

Sumber data:

- `useAnalisisGeopolitikPerdaganganYearsQuery()`

Endpoint:

- `GET /api/v1/analisis/geopolitik-perdagangan/tahun`

Catatan:

- tahun dibaca dari payload `data`
- jika payload tahun berbentuk object seperti `{ "Tahun": "2024" }`, service tetap melakukan parsing numerik
- tahun aktif default mengambil tahun terbaru dari daftar hasil request

## Endpoint Data Utama

Service:

- `src/service/analisis/overview.ts`

Hook:

- `src/hooks/analisis/useAnalisisGeopolitikPerdaganganQuery.ts`

Endpoint:

- `GET /api/v1/analisis/geopolitik-perdagangan`

Parameter:

- `tahun`

## Toast Request

Halaman memakai toast request untuk dua fetch:

### 1. Daftar Tahun

- loading: saat daftar tahun sedang diambil
- success: saat daftar tahun berhasil dimuat
- error: saat daftar tahun gagal dimuat

### 2. Data Geopolitik Perdagangan

- loading: saat data geopolitik perdagangan sedang diambil
- success: saat data geopolitik perdagangan berhasil dimuat
- error: saat data geopolitik perdagangan gagal dimuat

Catatan:

- toast loading dibersihkan saat request selesai
- toast success/error memakai guard key agar tidak muncul berulang untuk request yang sama

## Section 1: Top 5 Negara Geopolitik

Komponen:

- `src/components/analisis/geopolitik-perdagangan/AnalisisGeopolitikTopCountriesSection.tsx`

Tujuan:

- membandingkan negara geopolitik utama untuk ekspor dan impor

Struktur:

- 2 card:
  - `Top 5 Negara Geopolitik Ekspor`
  - `Top 5 Negara Geopolitik Impor`

Kolom tabel:

- `Rank`
- `Negara`
- `{tahun aktif} (nilai|pangsa)`
- `{tahun sebelumnya} (nilai|pangsa)`
- `Perubahan`

Perilaku:

- kolom `Rank` memakai `rank` dari response
- jika rank tidak ada atau `0`, tetap tampil tetapi nilainya menjadi `-`
- kolom `Rank` dan `Negara` dibuat sticky/fixed
- default sorting ada di kolom tahun aktif
- urutan kolom tahun adalah `tahun aktif` lalu `tahun sebelumnya`

Isi sel tahun:

- nilai perdagangan
- badge pangsa dengan icon pie

Expand:

- card memakai `ExpandableCard`
- modal expand ukuran `2xl`

Unduh:

- format `Excel`
- subtitle export memuat tahun dan unit

## Section 2: Komparasi Ekspor dan Impor

Komponen:

- `src/components/analisis/geopolitik-perdagangan/AnalisisGeopolitikComparisonSection.tsx`

Chart:

- memakai `ReactECharts`

Tujuan:

- membandingkan ekspor dan impor top produk Indonesia terhadap dunia dan negara geopolitik

Card:

- `Komparasi Ekspor {tahun aktif}: Indonesia, Dunia, dan Negara Geopolitik`
- `Komparasi Impor {tahun aktif}: Indonesia, Dunia, dan Negara Geopolitik`

Subtitle:

- `Top 5 produk | Tahun {tahun sebelumnya}-{tahun aktif} | Unit: {unit}`

Tooltip chart:

- nilai tahun aktif
- nilai tahun sebelumnya
- pangsa tahun aktif
- pangsa tahun sebelumnya
- perubahan persen

Fitur:

- expand
- unduh PNG

## Section 3: Top 20 Produk

Komponen:

- `src/components/analisis/geopolitik-perdagangan/AnalisisGeopolitikTopProductsSection.tsx`

Helper:

- `src/components/analisis/geopolitik-perdagangan/helpers.tsx`

Tujuan:

- menampilkan daftar produk utama ekspor atau impor Indonesia terhadap dunia dan negara geopolitik

Card:

- `Top 20 Produk Ekspor Indonesia`
- `Top 20 Produk Impor Indonesia`

Subtitle:

- `Tahun {tahun aktif} | Unit: {unit} | Nomor mengikuti urutan sorting pada kolom {kolom aktif}`

Header actions:

- segmented switch `Ekspor / Impor`
- tombol unduh Excel
- tombol expand bawaan `ExpandableCard`

Segmented switch:

- tampil sebagai pill selector
- active state putih
- wrapper abu muda

Toolbar tabel:

- search
- select limit

Catatan layout:

- toolbar search/limit terpisah dari surface tabel
- card mengikuti tinggi tabel
- panel search/limit hanya memakai border tanpa background tegas

Kolom tabel:

- `No`
- `HS Produk`
- `Dunia`
- kolom negara geopolitik
- `Rank Negara`

Perilaku khusus:

- `No` dibuat sebagai kolom lokal, bukan row number bawaan
- `HS Produk` menggabungkan kode HS dan nama produk dalam satu kolom
- kolom `HS Produk` dibuat sticky/fixed
- default sorting ada di kolom `Indonesia`
- nilai sel negara menampilkan `nilai | pangsa`

Kolom `Rank Negara`:

- disusun dari daftar negara di response
- hanya memasukkan entri yang memiliki `rank > 0`
- entri tanpa nilai tidak dimasukkan

Unduh:

- format `Excel`
- seluruh kolom aktif ikut diekspor
- kolom `HS Produk` diekspor sebagai `HS - nama produk`

Expand:

- modal expand `full`
- viewport tabel lebih tinggi daripada mode normal

## Tipe Data

Definisi tipe utama:

- `src/type/analisis.ts`

Tipe yang dipakai:

- `AnalisisGeopolitikCountryMeta`
- `AnalisisGeopolitikTopCountryRow`
- `AnalisisGeopolitikProductCountryMetric`
- `AnalisisGeopolitikProductItem`
- `AnalisisGeopolitikPerdaganganResult`

## File Terkait

- `src/pages/analisis/GeopolitikPerdaganganPage.tsx`
- `src/components/analisis/geopolitik-perdagangan/AnalisisGeopolitikTopCountriesSection.tsx`
- `src/components/analisis/geopolitik-perdagangan/AnalisisGeopolitikComparisonSection.tsx`
- `src/components/analisis/geopolitik-perdagangan/AnalisisGeopolitikTopProductsSection.tsx`
- `src/components/analisis/geopolitik-perdagangan/helpers.tsx`
- `src/hooks/analisis/useAnalisisGeopolitikPerdaganganQuery.ts`
- `src/service/analisis/overview.ts`
- `src/type/analisis.ts`

## Catatan Implementasi

- tabel `Top 5 Negara Geopolitik` memakai tabel custom lokal agar struktur `nilai + pangsa` per tahun tetap fleksibel
- tabel `Top 20 Produk` juga memakai tabel custom lokal karena struktur kolom geopolitik tidak cocok langsung dengan `TopProdukTable`
- parsing daftar tahun dibuat toleran terhadap format string/object dari backend
- source label ditampilkan di footer card jika tersedia
