# Data Generator Pariwisata Page Documentation

## 1. Ringkasan Halaman

- Route: `APP_ROUTES.DATABANK.DATA_GENERATOR.TOURISM`
- Page: `src/pages/data-generator/TourismPage.tsx`

Halaman ini menyediakan generator data pariwisata dengan dua mode output:

- `Tampilan Tabel`
- `Tampilan Visualisasi`

User dapat menyusun kombinasi asal, tujuan, grup negara, rentang tahun, jenis data, dan sumber data sebelum hasil dimuat ke endpoint generator.

## 2. Struktur Utama

Halaman terdiri dari:

1. Judul halaman `Data Generator Pariwisata`
2. Banner informasi data generator
3. Panel filter generator pariwisata
4. Section hasil:
   - tabel pariwisata, atau
   - visualisasi pariwisata

## 3. Banner Informasi

- Komponen: `src/components/data-generator/DataGeneratorInfoBanner.tsx`

Banner ini dipakai sebagai pengantar halaman data generator. Isinya menjelaskan cakupan filter pariwisata dan dua mode output utama yang tersedia.

## 4. Filter Generator

- Komponen: `src/components/filters/DataGeneratorTourismFiltersPanel.tsx`
- Validator: `src/validators/dataGeneratorTourismFilters.ts`
- Page state: `src/pages/data-generator/TourismPage.tsx`

Field utama:

- `Asal`
  - `Negara / Entitas Asal`
  - `Grup Asal`
- `Tujuan`
  - `Negara / Entitas Tujuan`
  - `Grup Tujuan`
- `Tahun Awal`
- `Tahun Akhir`
- `Jenis Data`
- `Sumber Data`
- `Output Generator`
  - `Tampilan Tabel`
  - `Tampilan Visualisasi`

Nilai `Jenis Data` yang aktif saat ini:

- `Jumlah_Wisatawan`

Catatan interaksi:

- filter memakai accordion
- badge panel menampilkan status `Draft aktif` atau `Sinkron`
- tombol output menjadi aksi apply filter
- tombol action disable saat request masih berjalan
- error validasi frontend tampil inline dan juga dikirim ke toast
- info anggota grup tampil lewat tooltip klik

## 5. Master Data Filter

- Service: `src/service/data-generator/tourism.ts`
- Hook: `src/hooks/data-generator/useDataGeneratorTourismMasterQuery.ts`

Endpoint master yang dipakai:

- `/api/v1/negara`
- `/api/v1/grupnegara`
- `/api/v1/data-generator/pariwisata/tahun-pariwisata`
- `/api/v1/data-generator/pariwisata/kode-sumber`

Catatan:

- filter negara memakai `FilterMultiSelect`
- dropdown negara memakai `CountryFlag`
- data negara dan grup direuse dari service perdagangan

## 6. Default dan Aturan Filter

Default saat master berhasil dimuat:

- `Jenis Data = Jumlah_Wisatawan`
- `Tahun Akhir = tahun terbaru`
- `Tahun Awal = satu tahun sebelum tahun terbaru`
- `Output = Tampilan Tabel`
- `Sumber Data = option pertama`

Aturan validasi dan sinkronisasi:

- `Tahun Akhir` tidak boleh lebih kecil dari `Tahun Awal`
- opsi `Tahun Awal` dibatasi sampai `Tahun Akhir`
- opsi `Tahun Akhir` dibatasi mulai `Tahun Awal`
- `Grup Asal` dan `Grup Tujuan` tidak boleh aktif bersamaan
- bila negara yang sama dipilih pada `Asal`, negara tersebut otomatis dibuang dari `Tujuan`
- bila negara yang sama dipilih pada `Tujuan`, negara tersebut otomatis dibuang dari `Asal`
- wajib memilih minimal satu `Asal` atau `Grup Asal`
- wajib memilih minimal satu `Tujuan` atau `Grup Tujuan`

## 7. Toast Request

Halaman memakai toast untuk lifecycle request:

- `loading`
- `error`

Scope toast:

- request tabel pariwisata
- request visualisasi pariwisata
- error validasi frontend
- error backend / request gagal

Catatan:

- toast loading mengikuti mode output yang aktif
- dedup key dipakai agar toast error tidak spam berulang

## 8. Mode Tampilan Tabel

- Section: `src/components/data-generator/DataGeneratorTourismTableSection.tsx`
- Detail modal: `src/components/data-generator/DataGeneratorTourismDetailModal.tsx`
- Query hook: `src/hooks/data-generator/useDataGeneratorTourismTableQuery.ts`
- Endpoint: `POST /api/v1/data-generator/pariwisata/tablefilter`

Request utama:

```json
{
  "origins": [],
  "destinations": ["IDN"],
  "originGroups": ["SIA"],
  "destinationGroups": [],
  "sourceCode": 1,
  "typeData": "Jumlah_Wisatawan",
  "yearFrom": 2018,
  "yearTo": 2024,
  "viewType": "table"
}
```

Fitur utama:

- card hasil dengan subtitle tahun, jenis data, asal, tujuan, dan sumber
- label `Asal` dan `Tujuan` pada subtitle dapat diklik
- subtitle memakai `cursor-help` agar affordance tooltip terlihat jelas saat hover
- tooltip subtitle menampilkan daftar negara / anggota grup yang aktif pada filter
- tabel utama dengan 3 blok relasi:
  - `pariwisata_asal_ke_tujuan`
  - `pariwisata_asal_ke_dunia`
  - `pariwisata_dunia_ke_tujuan`
- klik sel nilai membuka modal detail
- expand card
- unduh Excel

Catatan label:

- label card mengikuti `Jenis Data`, misalnya `Jumlah Wisatawan`
- relasi data memakai `ke` dan `Dunia`

### Detail Modal Tabel

Klik sel nilai pada tabel utama membuka modal detail, bukan child row.

Detail modal:

- komponen terpisah agar logika tetap rapi
- ada search memakai komponen `Input`
- ada tombol unduh Excel
- default sorting `Total` descending
- kolom yang tampil menyesuaikan konteks:
  - `asal ke dunia`: kolom tujuan disembunyikan
  - `dunia ke tujuan`: kolom asal disembunyikan
  - `asal ke tujuan`: asal dan tujuan tampil

Judul detail:

- judul utama hanya konteks arus data
- subtitle memuat:
  - `Tahun`
  - `Jenis Data`

## 9. Mode Tampilan Visualisasi

- Section: `src/components/data-generator/DataGeneratorTourismVisualizationSection.tsx`
- Query hook: `src/hooks/data-generator/useDataGeneratorTourismVisualizationQuery.ts`
- Endpoint: `POST /api/v1/data-generator/pariwisata/visualizationfilter`

Request memakai payload yang sama dengan mode tabel, tetapi:

- `viewType = "chart"`

Visualisasi yang ditampilkan:

- `Bar Chart Top 5 Negara Tujuan Jumlah Wisatawan`
- `Line Chart Tren Top 5 Pasangan Negara/Entitas Jumlah Wisatawan`
- `Stacked Bar Chart Perbandingan Jumlah Wisatawan dari Negara Asal ke Tujuan dan ke Dunia`
- `Treemap Pangsa Top 5 Negara Asal Jumlah Wisatawan`

Komponen chart:

- `src/components/ui/charts/CountryGroupedBarChart.tsx`
- `src/components/ui/charts/PairLineChart.tsx`
- `src/components/ui/charts/PairStackedBarChart.tsx`
- `src/components/ui/charts/EntityTreemapChart.tsx`

### Bar Chart

Sumber data:

- `pariwisata_asal_ke_tujuan.per_negara`
- dikelompokkan per tujuan

Perilaku:

- sumbu `x` = rentang tahun dari filter
- series = top 5 negara tujuan berdasarkan nilai tahun terakhir
- judul card mengikuti jenis data aktif

### Line Chart

Sumber data:

- `pariwisata_asal_ke_tujuan.per_negara`

Perilaku:

- menampilkan top 5 pasangan negara berdasarkan nilai tahun terakhir
- label legend dipersingkat agar tidak terlalu panjang
- judul card mengikuti jenis data aktif

### Stacked Chart

Sumber data:

- `pariwisata_asal_ke_tujuan.per_negara`
- `pariwisata_asal_ke_dunia.per_negara`

Perilaku:

- kategori chart per `tahun + negara asal`
- warna bar dibedakan per negara asal
- legend kustom di bawah chart menampilkan warna negara
- legend dapat di-check/uncheck untuk hide/show negara pada chart
- judul card menegaskan perbandingan arus `asal ke tujuan` vs `asal ke dunia`
- tooltip menampilkan:
  - `Nilai` saat ini
  - `Nilai Sebelumnya` untuk negara yang sama pada tahun sebelumnya
  - `Perubahan`
  - `Perubahan %`

### Treemap

Sumber data:

- `pariwisata_asal_ke_tujuan.per_negara`

Perilaku:

- hanya menampilkan top 5 negara asal
- nilai utama = tahun aktif terakhir yang tersedia
- nilai sebelumnya = tahun sebelum tahun aktif terakhir yang tersedia
- pangsa dihitung dari total `pariwisata_asal_ke_tujuan.total` pada tahun aktif terakhir
- judul card menegaskan bahwa treemap menampilkan pangsa

## 10. Download Visualisasi

Setiap card visualisasi memiliki:

- tombol `unduh PNG`
- tombol `expand`

Metadata unduhan PNG:

- judul chart sesuai card
- subtitle:
  - `Tahun ...`
  - `Jenis Data: ...`
  - `Asal: ...`
  - `Tujuan: ...`
- footer sumber memakai format:
  - `Sumber: ...`

Catatan implementasi:

- handler unduh chart di-register dari chart ke parent
- parent menyimpan handler via `ref`, bukan `state`, agar tidak memicu render loop
- untuk stacked chart, legend kustom ikut dimasukkan ke hasil unduhan PNG
- status legend yang sedang di-uncheck ikut terbawa ke export PNG

## 11. Dependency Utama

- `src/pages/data-generator/TourismPage.tsx`
- `src/components/data-generator/DataGeneratorInfoBanner.tsx`
- `src/components/filters/DataGeneratorTourismFiltersPanel.tsx`
- `src/components/data-generator/DataGeneratorTourismTableSection.tsx`
- `src/components/data-generator/DataGeneratorTourismDetailModal.tsx`
- `src/components/data-generator/DataGeneratorTourismVisualizationSection.tsx`
- `src/hooks/data-generator/useDataGeneratorTourismTableQuery.ts`
- `src/hooks/data-generator/useDataGeneratorTourismVisualizationQuery.ts`
- `src/hooks/data-generator/useDataGeneratorTourismMasterQuery.ts`
- `src/service/data-generator/tourism.ts`
- `src/validators/dataGeneratorTourismFilters.ts`

## 12. Status

- banner informasi aktif
- filter generator aktif
- validasi frontend aktif
- toast request aktif
- mode tabel aktif
- modal detail tabel aktif
- unduh Excel tabel aktif
- mode visualisasi aktif
- unduh PNG visualisasi aktif
