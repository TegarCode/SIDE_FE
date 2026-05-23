# Admin Pariwisata

- Route: `APP_ROUTES.ADMIN_MANAGEMENT.TOURISM_DATA`
- Path: `/admin-management/tourism-data`
- Detail path: `/admin-management/tourism-data/:batchId`
- FE entry:
  - `src/pages/admin-management/data-management/tourism-management/management-page.tsx`
  - `src/pages/admin-management/data-management/tourism-management/detail-page.tsx`

Modul ini mengikuti pola `trade-management`, tetapi target data memakai:

- tabel utama `tbtourism`
- staging `tbtourism_staging`

## Permission

- `read_admin_pariwisata`
- `read_admin_pariwisata_current`
- `read_all_admin_pariwisata`
- `create_admin_pariwisata`
- `update_admin_pariwisata`
- `delete_admin_pariwisata`
- `update_admin_pariwisata_current`
- `delete_admin_pariwisata_current`
- `approve_admin_pariwisata`
- `publish_admin_pariwisata`

## Tab

- `Daftar Batch`
- `Data Aktif`
- `Input Manual`
- `Pemetaan Unggahan`

## Field Domain

- `Kode_Alpha3_Asal`
- `Provinsi_Asal`
- `Kota_Asal`
- `Kode_Alpha3_Tujuan`
- `Provinsi_Tujuan`
- `Kota_Tujuan`
- `Tujuan_Perjalanan`
- `Lama_Perjalanan`
- `Bulan`
- `Tahun`
- `Jumlah_Wisatawan`
- `Nilai_Spending`
- `Port_Entry`
- `Kode_Sumber`
- `Status`

## Endpoint FE ke Backend

### Daftar batch

- `GET /api/admin-dashboard/pariwisata`

Query:

```ts
{
  search?: string;
  status?: string;
  source_type?: "manual" | "upload";
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: "asc" | "desc";
}
```

Response ringkas:

```ts
{
  success: true;
  data: {
    summary: {
      total_batch: number;
      pending_batch: number;
      approved_batch: number;
      published_batch: number;
      invalid_batch: number;
    };
    items: TourismBatchRecord[];
    meta: {
      page: number;
      per_page: number;
      total: number;
      last_page: number;
      sort_by: string;
      sort_direction: "asc" | "desc";
    };
  };
}
```

### Detail batch

- `GET /api/admin-dashboard/pariwisata/{uuid}`

Query:

```ts
{
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: "asc" | "desc";
}
```

Response ringkas:

```ts
{
  success: true;
  data: TourismBatchRecord & {
    rows: TourismRowRecord[];
    rows_meta: {
      page: number;
      per_page: number;
      total: number;
      last_page: number;
      sort_by: string;
      sort_direction: "asc" | "desc";
    };
  };
}
```

### Data aktif

- `GET /api/admin-dashboard/pariwisata/current`

Query:

```ts
{
  origin_code?: string;
  destination_code?: string;
  source_code?: string;
  status?: string;
  travel_purpose?: string;
  year?: string;
  month?: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: "asc" | "desc";
}
```

Response ringkas:

```ts
{
  success: true;
  data: {
    items: TourismCurrentRecord[];
    meta: {
      page: number;
      per_page: number;
      total: number;
      last_page: number;
      sort_by: string;
      sort_direction: "asc" | "desc";
    };
  };
}
```

### Input manual

- `POST /api/admin-dashboard/pariwisata`

Request:

```json
{
  "source_type": "manual",
  "note": "Input manual pariwisata",
  "rows": [
    {
      "Kode_Alpha3_Asal": "IDN",
      "Provinsi_Asal": "DKI Jakarta",
      "Kota_Asal": "Jakarta",
      "Kode_Alpha3_Tujuan": "SGP",
      "Provinsi_Tujuan": "Central",
      "Kota_Tujuan": "Singapore",
      "Tujuan_Perjalanan": "Liburan",
      "Lama_Perjalanan": 4,
      "Bulan": "Januari",
      "Tahun": 2025,
      "Jumlah_Wisatawan": 120,
      "Nilai_Spending": "54000000",
      "Port_Entry": "Changi",
      "Kode_Sumber": "B1",
      "Status": "Outbound"
    }
  ]
}
```

### Preview upload

- `POST /api/admin-dashboard/pariwisata/preview`

Request: `multipart/form-data`

- `file`
- `sample_size`

Response:

```ts
{
  success: true;
  data: {
    original_filename: string;
    headers: string[];
    sample_rows: Record<string, unknown>[];
    sample_size: number;
  };
}
```

### Submit upload

- `POST /api/admin-dashboard/pariwisata`

Request: `multipart/form-data`

- `source_type=upload`
- `file`
- `original_filename`
- `note`
- `column_mapping[<target_field>]`

Response:

```ts
{
  success: true;
  message: string;
  data: TourismBatchRecord;
}
```

### Workflow batch

- `POST /api/admin-dashboard/pariwisata/{uuid}/validate`
- `POST /api/admin-dashboard/pariwisata/{uuid}/approve`
- `POST /api/admin-dashboard/pariwisata/{uuid}/reject`
- `POST /api/admin-dashboard/pariwisata/{uuid}/publish`
- `DELETE /api/admin-dashboard/pariwisata/{uuid}`

Response umum:

```ts
{
  success: true;
  message: string;
  data: TourismBatchRecord | { id: string };
}
```

### Edit dan hapus row staging

- `PUT /api/admin-dashboard/pariwisata/{uuid}/rows/{rowId}`
- `DELETE /api/admin-dashboard/pariwisata/{uuid}/rows/{rowId}`
- `POST /api/admin-dashboard/pariwisata/{uuid}/rows/bulk-delete`
- `DELETE /api/admin-dashboard/pariwisata/{uuid}/staging`

### Edit dan hapus data aktif

- `PUT /api/admin-dashboard/pariwisata/current/{rowId}`
- `DELETE /api/admin-dashboard/pariwisata/current/{rowId}`
- `POST /api/admin-dashboard/pariwisata/current/bulk-delete`

### Lookup panel referensi

- `GET /api/admin-dashboard/pariwisata/options`

Response:

```ts
{
  success: true;
  data: {
    countries: SelectOption[];
    sources: SelectOption[];
    statuses: SelectOption[];
    travel_purposes: SelectOption[];
    months: SelectOption[];
  };
}
```
