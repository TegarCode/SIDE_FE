# Data Generator Perdagangan Page Documentation

## 1. Ringkasan Halaman

- Route: `APP_ROUTES.DATABANK.DATA_GENERATOR.TRADE`
- Page: `src/pages/data-generator/TradePage.tsx`

Halaman ini menyediakan generator data perdagangan dengan dua mode output:

- `Tampilan Tabel`
- `Tampilan Visualisasi`

User dapat menyusun kombinasi asal, tujuan, grup negara, rentang tahun, tipe perdagangan, level HS, HS code, dan sumber data sebelum hasil dimuat ke endpoint generator.

## 2. Struktur Utama

Halaman terdiri dari:

1. Judul halaman `Data Generator Perdagangan`
2. Banner informasi data generator
3. Panel filter generator perdagangan
4. Section hasil:
   - tabel perdagangan, atau
   - visualisasi perdagangan

## 3. Banner Informasi

- Komponen: `src/components/data-generator/DataGeneratorInfoBanner.tsx`

Banner ini dipakai sebagai pengantar halaman data generator. Isinya menjelaskan cakupan filter perdagangan dan dua mode output utama yang tersedia.

## 4. Filter Generator

- Komponen: `src/components/filters/DataGeneratorTradeFiltersPanel.tsx`
- Validator: `src/validators/dataGeneratorTradeFilters.ts`
- Page state: `src/pages/data-generator/TradePage.tsx`

Field utama:

- `Asal`
  - `Negara / Entitas`
  - `Grup Negara`
- `Tujuan`
  - `Negara / Entitas`
  - `Grup Negara`
- `Tahun Awal`
- `Tahun Akhir`
- `Tipe Perdagangan`
- `HS Level`
- `HS Code`
- `Sumber Data`
- `Output Generator`
  - `Tampilan Tabel`
  - `Tampilan Visualisasi`

Catatan interaksi:

- filter memakai accordion
- badge panel menampilkan status `Draft aktif` atau `Sinkron`
- tombol output menjadi aksi apply filter
- tombol action disable saat request masih berjalan
- error validasi frontend tampil inline dan juga dikirim ke toast

## 5. Master Data Filter

- Service: `src/service/data-generator/trade.ts`
- Hook: `src/hooks/data-generator/useDataGeneratorTradeMasterQuery.ts`

Endpoint master yang dipakai:

- `/api/v1/negara`
- `/api/v1/grupnegara`
- `/api/v1/tahun-perdagangan`
- `/api/v1/data-generator/perdagangan/kode-sumber`
- `/api/v1/hsproduk?level=...`

Catatan:

- filter negara memakai `FilterMultiSelect`
- dropdown negara memakai `CountryFlag`
- dropdown multi-select sudah memakai virtualized list dan debounce search
- flag untuk `Israel` dan `Taiwan` disembunyikan di level komponen `CountryFlag`

## 6. Default dan Aturan Filter

Default saat master berhasil dimuat:

- `Tipe Perdagangan = Export`
- `HS Level = 4-digit`
- `Tahun Akhir = tahun terbaru`
- `Tahun Awal = satu tahun sebelum tahun terbaru`
- `HS Code = Pilih Semua HS Code`
- `Output = Tampilan Tabel`

Aturan validasi dan sinkronisasi:

- `Tahun Akhir` tidak boleh lebih kecil dari `Tahun Awal`
- opsi `Tahun Awal` dibatasi sampai `Tahun Akhir`
- opsi `Tahun Akhir` dibatasi mulai `Tahun Awal`
- `Grup Asal` dan `Grup Tujuan` tidak boleh aktif bersamaan
- bila negara yang sama dipilih pada `Asal`, negara tersebut otomatis dibuang dari `Tujuan`
- bila negara yang sama dipilih pada `Tujuan`, negara tersebut otomatis dibuang dari `Asal`

Aturan HS Code:

- `Pilih Semua HS Code` disimpan sebagai token `ALL`
- saat `Pilih Semua` aktif, HS code individual tidak ikut checked
- bila user klik HS code saat `Pilih Semua` aktif, `Pilih Semua` dihapus dan hanya HS itu yang dipilih
- bila user klik `Pilih Semua` saat ada HS lain terpilih, pilihan lain dibersihkan

## 7. Toast Request

Halaman memakai toast untuk lifecycle request:

- `loading`
- `error`

Scope toast:

- request tabel perdagangan
- request visualisasi perdagangan
- error validasi frontend
- error backend / request gagal

Catatan:

- toast loading mengikuti mode output yang aktif
- dedup key dipakai agar toast error tidak spam berulang

## 8. Mode Tampilan Tabel

- Section: `src/components/data-generator/DataGeneratorTradeTableSection.tsx`
- Detail modal: `src/components/data-generator/DataGeneratorTradeDetailModal.tsx`
- Query hook: `src/hooks/data-generator/useDataGeneratorTradeTableQuery.ts`
- Endpoint: `POST /api/v1/data-generator/perdagangan/tablefilter`

Request utama:

```json
{
  "origins": ["JPN"],
  "destinations": ["IDN", "MYS"],
  "originGroups": [],
  "destinationGroups": [],
  "tradeType": "Total",
  "hsLevel": 4,
  "product": ["all"],
  "yearFrom": "2024",
  "yearTo": "2024",
  "source": "5",
  "viewType": "table",
  "page": 1,
  "perPage": 50
}
```

Fitur utama:

- card hasil dengan subtitle tahun, unit, asal, tujuan, dan sumber
- tabel utama dengan header bertingkat
- sticky header dan sticky kolom kiri:
  - `No`
  - `HS Code`
  - `Produk`
- default sorting dari nilai `asal ke tujuan` pada tahun terakhir, descending
- pagination dan pilihan jumlah baris
- expand card
- unduh Excel

Struktur blok data:

- `asal ke tujuan`
- `asal ke dunia`
- `dunia ke tujuan`

Catatan label:

- label card memakai bahasa Indonesia, misalnya `Data Ekspor Perdagangan`
- label hubungan memakai `ke` dan `dari`, bukan panah

### Detail Modal Tabel

Klik sel nilai pada tabel utama membuka modal detail, bukan child row.

Detail modal:

- komponen terpisah agar logika tetap rapi
- ada search memakai komponen `Input`
- ada tombol unduh Excel
- default sorting `Total Nilai` descending
- kolom yang tampil menyesuaikan konteks:
  - `asal ke dunia`: kolom tujuan disembunyikan
  - `dunia ke tujuan`: kolom asal disembunyikan
  - `asal ke tujuan`: asal dan tujuan tampil

Judul detail:

- judul utama hanya konteks arus data
- subtitle memuat:
  - `Tahun`
  - `HS`
  - `Nama produk`

## 9. Mode Tampilan Visualisasi

- Section: `src/components/data-generator/DataGeneratorTradeVisualizationSection.tsx`
- Query hook: `src/hooks/data-generator/useDataGeneratorTradeVisualizationQuery.ts`
- Endpoint: `POST /api/v1/data-generator/perdagangan/visualizationfilter`

Request memakai payload yang sama dengan mode tabel, tetapi:

- `viewType = "chart"`

Visualisasi mengikuti response generator visual:

- `Bar Chart ... per Negara/Entitas`
- `Line Chart ... Top 5 HS Code`
- `Stacked Chart ... Top 5 HS Code`
- `Treemap ... Top 5 HS Code`

Komponen chart:

- `src/components/ui/charts/CountryGroupedBarChart.tsx`
- `src/components/ui/charts/HsLineChart.tsx`
- `src/components/ui/charts/HsStackedBarChart.tsx`
- `src/components/ui/charts/TradeProductsTreemapChart.tsx`

### Bar Chart per Negara/Entitas

Sumber data:

- `total_all_hs`

Perilaku:

- sumbu `x` = rentang tahun dari filter
- tiap batang/series = negara/entitas dari blok `per_negara`
- tooltip per batang menampilkan:
  - `Nilai {tahun aktif}`
  - `Nilai {tahun sebelumnya}`
  - `Perubahan`
  - `Perubahan %`

### Line Chart dan Stacked Chart per HS Code

Sumber data:

- `products`
- hanya `Top 5 HS Code` berdasarkan nilai tahun terakhir

Perilaku:

- legend dan tooltip menampilkan `HS + nama produk`
- label legend dipersingkat agar tidak terlalu panjang
- tooltip per titik/batang menampilkan:
  - `Nilai {tahun aktif}`
  - `Nilai {tahun sebelumnya}`
  - `Perubahan`
  - `Perubahan %`

### Treemap per HS Code

Sumber data:

- `products`

Perilaku:

- hanya menampilkan `Top 5 HS Code`
- memakai `TradeProductsTreemapChart`
- nilai utama = tahun terakhir
- subtitle memakai `tahun sebelumnya - tahun terakhir`
- pangsa dihitung dari `total_all_hs` tahun terakhir, bukan hanya total top 5
- tooltip menampilkan pangsa dengan label tahun aktif

## 10. Download Visualisasi

Setiap card visualisasi memiliki:

- tombol `unduh PNG`
- tombol `expand`

Metadata unduhan PNG:

- judul chart sesuai card
- subtitle:
  - `Tahun ...`
  - `Unit: Ribu US$`
  - `Asal: ...`
  - `Tujuan: ...`
- footer sumber memakai format:
  - `Sumber: ...`

Catatan implementasi:

- handler unduh chart di-register dari chart ke parent
- parent menyimpan handler via `ref`, bukan `state`, agar tidak memicu infinite render loop

## 11. Dependency Utama

- `src/pages/data-generator/TradePage.tsx`
- `src/components/data-generator/DataGeneratorInfoBanner.tsx`
- `src/components/filters/DataGeneratorTradeFiltersPanel.tsx`
- `src/components/data-generator/DataGeneratorTradeTableSection.tsx`
- `src/components/data-generator/DataGeneratorTradeDetailModal.tsx`
- `src/components/data-generator/DataGeneratorTradeVisualizationSection.tsx`
- `src/hooks/data-generator/useDataGeneratorTradeTableQuery.ts`
- `src/hooks/data-generator/useDataGeneratorTradeVisualizationQuery.ts`
- `src/service/data-generator/trade.ts`
- `src/validators/dataGeneratorTradeFilters.ts`

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
