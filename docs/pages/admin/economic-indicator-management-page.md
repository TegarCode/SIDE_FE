# Economic Indicator Management Page Documentation

## 1. Ringkasan Halaman

- Route: `APP_ROUTES.ADMIN_MANAGEMENT.ECONOMIC_INDICATORS`
- Path: `/admin-management/economic-indicators`
- Permission page:
  - `read_admin_kinerja_ekonomi`
  - `read_admin_kinerja_ekonomi_current`
- Page: `src/pages/admin-management/data-management/economic-indicator-management/management-page.tsx`

Halaman ini dipakai untuk mengelola seluruh alur admin kinerja ekonomi:

- daftar batch staging
- input manual
- unggah CSV/Excel
- validasi, approve, reject, publish
- monitoring status queue
- data aktif pada tabel utama
- edit dan hapus data aktif, termasuk bulk delete

## 2. Permission yang Dipakai

- `read_admin_kinerja_ekonomi`
- `read_admin_kinerja_ekonomi_current`
- `read_all_admin_kinerja_ekonomi`
- `create_admin_kinerja_ekonomi`
- `update_admin_kinerja_ekonomi`
- `approve_admin_kinerja_ekonomi`
- `publish_admin_kinerja_ekonomi`
- `delete_admin_kinerja_ekonomi`

Aturan akses UI:

- tab `Daftar Batch` tampil jika user punya `read_admin_kinerja_ekonomi`
- tab `Data Aktif` tampil jika user punya `read_admin_kinerja_ekonomi_current`
- tab `Input Manual` dan `Pemetaan Unggahan` tampil jika user punya `create_admin_kinerja_ekonomi`
- tombol validasi memakai gate `update_admin_kinerja_ekonomi`
- tombol approve dan reject memakai gate `approve_admin_kinerja_ekonomi`
- tombol publish memakai gate `publish_admin_kinerja_ekonomi`
- tombol hapus batch, hapus row, dan hapus data aktif memakai gate `delete_admin_kinerja_ekonomi`

Catatan akses data:

- jika user tidak punya `read_all_admin_kinerja_ekonomi`, batch yang terlihat hanya milik user sendiri
- data aktif tetap dibaca dari tabel utama tanpa scope pengunggah

## 3. Struktur Halaman

Halaman terdiri dari:

1. `PageTitle` Manajemen Data Kinerja Ekonomi
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

- `src/pages/admin-management/data-management/economic-indicator-management/list-section.tsx`

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

- `GET /api/admin-dashboard/kinerja-ekonomi`

Response yang dipakai tabel batch:

```ts
{
  success: true;
  message: string;
  data: {
    items: EconomicIndicatorBatchItem[];
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

Contoh toast:

- `Unggahan diterima`
- `Unggahan selesai diproses`
- `Validasi masuk antrean`
- `Publikasi masuk antrean`
- `Publikasi selesai`
- `Proses batch gagal`

## 6. Input Manual

Komponen:

- `manual-input-section.tsx`

Fitur:

- tambah beberapa row manual
- lookup negara, indikator, dan sumber
- normalisasi payload ke format backend
- submit ke endpoint create batch

Endpoint:

- `POST /api/admin-dashboard/kinerja-ekonomi`

Request utama dari FE:

```ts
{
  source_type: "manual";
  note?: string;
  rows: EconomicIndicatorRowPayload[];
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
- submit upload ke backend

Endpoint:

- `POST /api/admin-dashboard/kinerja-ekonomi/preview`
- `POST /api/admin-dashboard/kinerja-ekonomi`

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
- filter `Negara`
- filter `Indikator`
- filter `Sumber`
- filter `Tahun`
- limit tampil di kanan judul
- sorting melalui header tabel
- edit satu row
- hapus satu row
- bulk delete row di halaman aktif

Catatan UI:

- kolom `ID` tidak ditampilkan di tabel
- checkbox `pilih semua` hanya berlaku untuk data yang sedang tampil di halaman aktif
- jika satu halaman habis terhapus dan masih ada halaman sebelumnya, FE mundur ke halaman valid lalu refetch

Endpoint:

- `GET /api/admin-dashboard/kinerja-ekonomi/current`
- `PUT /api/admin-dashboard/kinerja-ekonomi/current/{rowId}`
- `DELETE /api/admin-dashboard/kinerja-ekonomi/current/{rowId}`
- `POST /api/admin-dashboard/kinerja-ekonomi/current/bulk-delete`

Request filter list current:

```ts
{
  country_code?: string;
  indicator_id?: string;
  source_code?: string;
  year?: string;
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
    items: EconomicIndicatorCurrentItem[];
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

- `APP_ROUTES.ADMIN_MANAGEMENT.ECONOMIC_INDICATOR_DETAIL`
- `/admin-management/economic-indicators/:batchId`

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

- `GET /api/admin-dashboard/kinerja-ekonomi/{uuid}`
- `PUT /api/admin-dashboard/kinerja-ekonomi/{uuid}/rows/{rowId}`
- `DELETE /api/admin-dashboard/kinerja-ekonomi/{uuid}/rows/{rowId}`
- `POST /api/admin-dashboard/kinerja-ekonomi/{uuid}/rows/bulk-delete`
- `POST /api/admin-dashboard/kinerja-ekonomi/{uuid}/validate`
- `POST /api/admin-dashboard/kinerja-ekonomi/{uuid}/approve`
- `POST /api/admin-dashboard/kinerja-ekonomi/{uuid}/reject`
- `POST /api/admin-dashboard/kinerja-ekonomi/{uuid}/publish`
- `DELETE /api/admin-dashboard/kinerja-ekonomi/{uuid}`
- `DELETE /api/admin-dashboard/kinerja-ekonomi/{uuid}/staging`

Response detail utama:

```ts
{
  success: true;
  message: string;
  data: {
    uuid: string;
    status: string;
    rows: EconomicIndicatorRowItem[];
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

- `src/hooks/admin-dashboard/useKinerjaEkonomiManagementPage.ts`

Service:

- `src/service/admin-dashboard/kinerja-ekonomi/kinerjaEkonomi.ts`
- `src/service/admin-dashboard/kinerja-ekonomi/shared.ts`

Type:

- `src/type/admin-management/adminDashboardKinerjaEkonomi.ts`

Data lookup:

- `countries`
- `indicators`
- `sources`

Lookup ini dipakai bersama oleh:

- input manual
- upload mapping
- edit row staging
- edit row data aktif
- filter data aktif

Endpoint lookup:

- `GET /api/admin-dashboard/kinerja-ekonomi/options`

Response lookup:

```ts
{
  success: true;
  message: string;
  data: {
    countries: SelectOption[];
    indicators: SelectOption[];
    sources: SelectOption[];
  };
}
```

## 11. Sidebar dan Route Admin

Sidebar admin management:

- menu `Kinerja Ekonomi` tampil jika user punya:
  - `read_admin_kinerja_ekonomi`, atau
  - `read_admin_kinerja_ekonomi_current`

Route admin:

- halaman utama diproteksi dengan kombinasi permission read batch/current
- detail batch diproteksi dengan `read_admin_kinerja_ekonomi`

## 12. Status

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
- data aktif filter `negara`, `indikator`, `sumber`, `tahun` aktif
- data aktif edit aktif
- data aktif single delete aktif
- data aktif bulk delete aktif
