## 1. Ringkasan Halaman

- Route: `APP_ROUTES.ADMIN_MANAGEMENT.INVESTMENT_DATA`
- Path: `/admin-management/investment-data`
- Permission page:
  - `read_admin_investasi`
  - `read_admin_investasi_current`
- Page: `src/pages/admin-management/data-management/investment-management/management-page.tsx`

Halaman ini dipakai untuk mengelola seluruh alur admin investasi:

- daftar batch staging
- input manual
- unggah CSV/Excel
- validasi, approve, reject, publish
- monitoring status queue
- data aktif pada tabel utama
- edit dan hapus data aktif, termasuk bulk delete

## 2. Permission yang Dipakai

- `read_admin_investasi`
- `read_admin_investasi_current`
- `read_all_admin_investasi`
- `create_admin_investasi`
- `update_admin_investasi`
- `approve_admin_investasi`
- `publish_admin_investasi`
- `delete_admin_investasi`

Aturan akses UI:

- tab `Daftar Batch` tampil jika user punya `read_admin_investasi`
- tab `Data Aktif` tampil jika user punya `read_admin_investasi_current`
- tab `Input Manual` dan `Pemetaan Unggahan` tampil jika user punya `create_admin_investasi`
- tombol validasi memakai gate `update_admin_investasi`
- tombol approve dan reject memakai gate `approve_admin_investasi`
- tombol publish memakai gate `publish_admin_investasi`
- tombol hapus batch, hapus row, dan hapus data aktif memakai gate `delete_admin_investasi`

Catatan akses data:

- jika user tidak punya `read_all_admin_investasi`, batch yang terlihat hanya milik user sendiri
- data aktif tetap dibaca dari tabel utama tanpa scope pengunggah

## 3. Struktur Halaman

Halaman terdiri dari:

1. `PageTitle` Manajemen Data Investasi
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

- `src/pages/admin-management/data-management/investment-management/list-section.tsx`

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

- `GET /api/admin-dashboard/investasi`

Response yang dipakai tabel batch:

```ts
{
  success: true;
  message: string;
  data: {
    items: InvestmentBatchItem[];
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
- lookup negara asal/tujuan, sektor, dan sumber
- helper status valid: `Inbound` dan `Outbound`
- helper tipe investasi dan bulan dari lookup backend
- normalisasi payload ke format backend
- submit ke endpoint create batch

Endpoint:

- `POST /api/admin-dashboard/investasi`

Request utama dari FE:

```ts
{
  source_type: "manual";
  note?: string;
  rows: InvestmentRowPayload[];
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
- automap kolom ke target field
- panel referensi kode negara, sumber, sektor, status, tipe investasi, dan bulan
- submit upload ke backend

Endpoint:

- `POST /api/admin-dashboard/investasi/preview`
- `POST /api/admin-dashboard/investasi`

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
  source_type: "upload";
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
    status: "validating";
    total_rows: number;
  }
}
```

## 8. Data Aktif

Komponen:

- `current-data-section.tsx`

Fitur utama:

- list data aktif dari tabel utama
- filter dengan tombol `Cari`
- filter `Negara Asal`
- filter `Negara Tujuan`
- filter `Sumber`
- filter `Status`
- filter `Sektor`
- filter `Tahun`
- filter `Bulan`
- filter `Tipe Investasi`
- limit tampil di kanan judul
- sorting melalui header tabel
- edit satu row
- hapus satu row
- bulk delete row di halaman aktif

Endpoint:

- `GET /api/admin-dashboard/investasi/current`
- `PUT /api/admin-dashboard/investasi/current/{rowId}`
- `DELETE /api/admin-dashboard/investasi/current/{rowId}`
- `POST /api/admin-dashboard/investasi/current/bulk-delete`

Request filter list current:

```ts
{
  origin_code?: string;
  destination_code?: string;
  source_code?: string;
  status?: string;
  sector_id?: string;
  year?: string;
  month?: string;
  investment_type?: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: "asc" | "desc";
}
```

Response list current:

```ts
{
  success: true;
  message: string;
  data: {
    items: InvestmentCurrentItem[];
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

- `APP_ROUTES.ADMIN_MANAGEMENT.INVESTMENT_DATA_DETAIL`
- `/admin-management/investment-data/:batchId`

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

- `GET /api/admin-dashboard/investasi/{uuid}`
- `PUT /api/admin-dashboard/investasi/{uuid}/rows/{rowId}`
- `DELETE /api/admin-dashboard/investasi/{uuid}/rows/{rowId}`
- `POST /api/admin-dashboard/investasi/{uuid}/rows/bulk-delete`
- `POST /api/admin-dashboard/investasi/{uuid}/validate`
- `POST /api/admin-dashboard/investasi/{uuid}/approve`
- `POST /api/admin-dashboard/investasi/{uuid}/reject`
- `POST /api/admin-dashboard/investasi/{uuid}/publish`
- `DELETE /api/admin-dashboard/investasi/{uuid}`
- `POST /api/admin-dashboard/investasi/{uuid}/clear-staging`

Response detail utama:

```ts
{
  success: true;
  message: string;
  data: {
    uuid: string;
    status: string;
    rows: InvestmentRowItem[];
    rows_meta: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    };
  };
}
```

## 10. Data dan Hook

Hook utama:

- `src/hooks/admin-dashboard/useInvestmentManagementPage.ts`

Service:

- `src/service/admin-dashboard/investment/trade.ts`
- `src/service/admin-dashboard/investment/shared.ts`

Type:

- `src/type/admin-management/adminDashboardInvestment.ts`

Data lookup:

- `countries`
- `sources`
- `sectors`
- `statuses`
- `investment_types`
- `months`

Endpoint lookup:

- `GET /api/admin-dashboard/investasi/options`

Response lookup:

```ts
{
  success: true;
  message: string;
  data: {
    countries: SelectOption[];
    sources: SelectOption[];
    sectors: SelectOption[];
    statuses: SelectOption[];
    investment_types: SelectOption[];
    months: SelectOption[];
  };
}
```

## 11. Perbedaan Domain dengan Kinerja Ekonomi

Bagian yang berbeda dari modul referensi hanya ada pada struktur data investasi:

- negara memakai asal dan tujuan, bukan satu kode negara
- ada `Nama_Perusahaan` dan `Tipe_Investasi`
- nilai utama memakai `Nilai_Investasi` dan `Nilai_Proyek`
- status domain investasi memakai `Inbound` atau `Outbound`
- tabel utama target adalah `tbinvestment_testing`
