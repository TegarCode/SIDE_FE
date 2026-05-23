# Trade Management Page Documentation

## 1. Ringkasan Halaman

- Route: `APP_ROUTES.ADMIN_MANAGEMENT.TRADE_DATA`
- Path: `/admin-management/trade-data`
- Permission page:
  - `read_admin_perdagangan`
  - `read_admin_perdagangan_current`
- Page: `src/pages/admin-management/data-management/trade-management/management-page.tsx`

Halaman ini dipakai untuk mengelola seluruh alur admin data perdagangan:

- daftar batch staging
- input manual
- unggah CSV/Excel
- validasi, approve, reject, publish
- monitoring status queue
- data aktif pada tabel utama `tbtrade`
- edit dan hapus data aktif, termasuk bulk delete

## 2. Permission yang Dipakai

- `read_admin_perdagangan`
- `read_admin_perdagangan_current`
- `read_all_admin_perdagangan`
- `create_admin_perdagangan`
- `update_admin_perdagangan`
- `approve_admin_perdagangan`
- `publish_admin_perdagangan`
- `delete_admin_perdagangan`

Aturan akses UI:

- tab `Daftar Batch` tampil jika user punya `read_admin_perdagangan`
- tab `Data Aktif` tampil jika user punya `read_admin_perdagangan_current`
- tab `Input Manual` dan `Pemetaan Unggahan` tampil jika user punya `create_admin_perdagangan`
- tombol validasi memakai gate `update_admin_perdagangan`
- tombol approve dan reject memakai gate `approve_admin_perdagangan`
- tombol publish memakai gate `publish_admin_perdagangan`
- tombol hapus batch, hapus row, dan hapus data aktif memakai gate `delete_admin_perdagangan`

Catatan akses data:

- jika user tidak punya `read_all_admin_perdagangan`, batch yang terlihat hanya milik user sendiri
- data aktif tetap dibaca dari tabel utama tanpa scope pengunggah

## 3. Struktur Halaman

Halaman terdiri dari:

1. `PageTitle` Manajemen Data Perdagangan
2. Summary cards batch
3. Tab:
   - `Daftar Batch`
   - `Data Aktif`
   - `Input Manual`
   - `Pemetaan Unggahan`
4. Modal konfirmasi workflow batch
5. Toast notifikasi proses background

## 4. Daftar Batch

Komponen:

- `src/pages/admin-management/data-management/trade-management/list-section.tsx`

Fitur:

- search dengan tombol submit
- filter `status`
- filter `source_type`
- limit `10/25/50/100`
- sortable table
- pagination server-side
- tombol `Detail`
- tombol workflow sesuai permission dan status

Endpoint utama:

- `GET /api/admin-dashboard/perdagangan`

Response yang dipakai tabel batch:

```ts
{
  success: true;
  message: string;
  data: {
    items: TradeBatchItem[];
    meta: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    };
  };
}
```

## 5. Notifikasi Proses Background

Halaman melacak batch yang sedang diproses untuk:

- upload
- validasi
- publish

Mekanisme:

- setelah aksi queue dipicu, FE menyimpan `trackedBatchIds`
- FE polling detail batch berkala
- saat status final terdeteksi, toast ditampilkan
- list batch di-refetch otomatis

## 6. Input Manual

Komponen:

- `manual-input-section.tsx`

Fitur:

- tambah beberapa row manual
- lookup kode negara reporter
- lookup kode negara partner
- lookup sektor
- lookup sumber
- lookup status arus `Export/Import`
- lookup `hs_len`
- normalisasi payload ke format backend
- submit ke endpoint create batch

Payload manual mengikuti field target `tbtrade`:

- `Kode_Alpha3_Reporter`
- `Provinsi_Reporter`
- `Kota_Reporter`
- `Kode_Alpha3_Partner`
- `Provinsi_Partner`
- `Kota_Partner`
- `Bulan`
- `Tahun`
- `HsCode`
- `ID_Sektor`
- `Vol`
- `Satuan`
- `Tarif`
- `Nilai`
- `Kode_Sumber`
- `Status`
- `Berat_Bersih`
- `Pelabuhan`
- `hs_len`

Endpoint:

- `POST /api/admin-dashboard/perdagangan`

Request utama dari FE:

```ts
{
  source_type: 'manual';
  note?: string;
  rows: TradeRowPayload[];
}
```

Response utama:

```ts
{
  success: true;
  message: string;
  data: {
    uuid: string;
    source_type: "manual";
    status: string;
    total_rows: number;
  }
}
```

## 7. Pemetaan Unggahan

Komponen:

- `upload-section.tsx`

Fitur:

- pilih file CSV/Excel
- preview header dan sample row dari backend
- automap kolom ke target field `tbtrade`
- panel referensi kode untuk:
  - negara
  - sumber
  - sektor
  - status arus
  - panjang HS
- submit upload ke backend

Endpoint:

- `POST /api/admin-dashboard/perdagangan/preview`
- `POST /api/admin-dashboard/perdagangan`

Request preview:

```ts
FormData {
  file: File;
  sample_size?: number;
}
```

Response preview:

```ts
{
  success: true;
  message: string;
  data: {
    original_filename: string;
    headers: string[];
    sample_rows: Record<string, unknown>[];
    sample_size: number;
  };
}
```

Request upload:

```ts
FormData {
  source_type: 'upload';
  file: File;
  original_filename?: string;
  note?: string;
  column_mapping?: Record<string, string>;
}
```

Response upload:

```ts
{
  success: true;
  message: string;
  data: {
    uuid: string;
    source_type: "upload";
    status: "validating" | "draft";
    original_filename: string;
  }
}
```

## 8. Data Aktif

Komponen:

- `current-data-section.tsx`

Fitur utama:

- list data aktif dari tabel utama `tbtrade`
- filter dengan tombol `Cari`
- filter `Reporter`
- filter `Partner`
- filter `Sumber`
- filter `Status`
- filter `Sektor`
- filter `Tahun`
- filter `hs_len`
- limit tampil di kanan judul
- sorting melalui header tabel
- edit satu row
- hapus satu row
- bulk delete row di halaman aktif

Endpoint:

- `GET /api/admin-dashboard/perdagangan/current`
- `PUT /api/admin-dashboard/perdagangan/current/{rowId}`
- `DELETE /api/admin-dashboard/perdagangan/current/{rowId}`
- `POST /api/admin-dashboard/perdagangan/current/bulk-delete`

Request filter list current:

```ts
{
  reporter_code?: string;
  partner_code?: string;
  source_code?: string;
  status?: 'Export' | 'Import';
  sector_id?: string;
  year?: number;
  hs_len?: number;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}
```

Response list current:

```ts
{
  success: true;
  message: string;
  data: {
    items: TradeCurrentRow[];
    meta: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    };
  };
}
```

## 9. Detail Batch

Route detail:

- `APP_ROUTES.ADMIN_MANAGEMENT.TRADE_DATA_DETAIL`
- `/admin-management/trade-data/:batchId`

Komponen detail:

- `detail-page.tsx`

Fitur detail:

- daftar row staging batch
- edit row staging
- hapus row staging
- bulk delete row staging
- clear staging setelah publish
- tombol kembali dengan icon

Endpoint detail:

- `GET /api/admin-dashboard/perdagangan/{uuid}`
- `PUT /api/admin-dashboard/perdagangan/{uuid}/rows/{rowId}`
- `DELETE /api/admin-dashboard/perdagangan/{uuid}/rows/{rowId}`
- `POST /api/admin-dashboard/perdagangan/{uuid}/rows/bulk-delete`
- `POST /api/admin-dashboard/perdagangan/{uuid}/validate`
- `POST /api/admin-dashboard/perdagangan/{uuid}/approve`
- `POST /api/admin-dashboard/perdagangan/{uuid}/reject`
- `POST /api/admin-dashboard/perdagangan/{uuid}/publish`
- `DELETE /api/admin-dashboard/perdagangan/{uuid}`
- `DELETE /api/admin-dashboard/perdagangan/{uuid}/staging`

Response detail utama:

```ts
{
  success: true;
  message: string;
  data: {
    batch: TradeBatchDetail;
    rows: {
      items: TradeStagingRow[];
      meta: {
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
      };
    };
  };
}
```

## 10. Data dan Hook

Hook utama:

- `src/hooks/admin-dashboard/useTradeManagementPage.ts`

Service:

- `src/service/admin-dashboard/trade/trade.ts`
- `src/service/admin-dashboard/trade/shared.ts`

Type:

- `src/type/admin-management/adminDashboardTrade.ts`

Data lookup:

- `countries`
- `sources`
- `sectors`
- `statuses`
- `hsLevels`

Lookup ini dipakai bersama oleh:

- input manual
- upload mapping
- edit row staging
- edit row data aktif
- filter data aktif

Endpoint lookup:

- `GET /api/admin-dashboard/perdagangan/options`

Response lookup:

```ts
{
  success: true;
  message: string;
  data: {
    countries: ReferenceOption[];
    sources: ReferenceOption[];
    sectors: ReferenceOption[];
    statuses: ReferenceOption[];
    hsLevels: ReferenceOption[];
  };
}
```

## 11. Sidebar dan Route Admin

Sidebar admin management:

- menu `Perdagangan` tampil jika user punya:
  - `read_admin_perdagangan`, atau
  - `read_admin_perdagangan_current`

Route admin:

- halaman utama diproteksi dengan kombinasi permission read batch/current/create
- detail batch diproteksi dengan `read_admin_perdagangan`, `update_admin_perdagangan`, atau `delete_admin_perdagangan`

## 12. Perbedaan dari Kinerja Ekonomi

Modul ini sengaja mengikuti pola `Kinerja Ekonomi`, tetapi field domain berbeda:

- memakai pasangan reporter dan partner
- memakai `HsCode` dan `hs_len`
- memakai `ID_Sektor`
- memakai status arus `Export/Import`
- memakai field perdagangan seperti `Vol`, `Tarif`, `Nilai`, `Berat_Bersih`, dan `Pelabuhan`

Karena itu filter, form manual, mapping upload, dan tabel aktif/detail disesuaikan ke struktur `tbtrade`.

## 13. Status

- route aktif
- sidebar admin aktif
- permission tab aktif
- own-data vs all-data scope aktif
- summary batch aktif
- search dan filter batch aktif
- input manual aktif
- preview upload aktif
- upload batch aktif
- notifikasi proses background aktif
- validasi queue aktif
- publish queue aktif
- data aktif list aktif
- data aktif filter `reporter`, `partner`, `sumber`, `status`, `sektor`, `tahun`, `hs_len` aktif
- data aktif edit aktif
- data aktif single delete aktif
- data aktif bulk delete aktif
