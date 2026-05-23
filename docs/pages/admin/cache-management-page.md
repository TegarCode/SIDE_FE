# Cache Management Page Documentation

## 1. Ringkasan Halaman

- Route: `APP_ROUTES.ADMIN_MANAGEMENT.CACHES`
- Path: `/admin-management/caches`
- Permission page: `read_admin_caches`
- Page: `src/pages/admin-management/CacheManagementPage.tsx`

Halaman ini dipakai untuk menampilkan dan mengelola cache backend dengan prefix `side_cache:` pada area Admin Dashboard.

## 2. Permission yang Dipakai

- `read_admin_caches`
- `update_admin_caches`
- `delete_admin_caches`

Aturan akses UI:

- halaman dan menu sidebar tampil dengan `read_admin_caches`
- tombol edit tampil dengan `update_admin_caches`
- tombol delete tampil dengan `delete_admin_caches`

## 3. Struktur Halaman

Halaman terdiri dari:

1. `PageTitle` Manajemen Cache
2. Summary cards dari backend
3. Toolbar pencarian tombol submit + limit data
4. Tabel sortable cache
5. Pagination
6. Modal detail cache
7. Modal update expiration
8. Modal konfirmasi delete

## 4. Data dan Query

### 4.1 List Cache

- Hook: `src/hooks/admin-dashboard/useCacheManagementPage.ts`
- Service: `src/service/admin-dashboard/cache/caches.ts`
- Endpoint: `GET /api/admin-dashboard/caches`

Query params:

```json
{
  "search": "side_cache:indonesia atau indonesia>infrastruktur",
  "page": 1,
  "per_page": 10,
  "sort_by": "expiration",
  "sort_direction": "desc"
}
```

Catatan:

- toolbar frontend saat ini memakai satu input pencarian untuk `key` atau `category`
- query `category` backend tetap tersedia, tetapi belum dipakai sebagai field terpisah di UI

Sorting backend yang dipakai:

- `key`
- `expiration`

### 4.2 Detail Cache

- Endpoint: `GET /api/admin-dashboard/caches/{id}`
- `id` memakai raw cache key yang harus di-encode dengan `encodeURIComponent`

### 4.3 Update Expiration Cache

- Endpoint: `PUT /api/admin-dashboard/caches/{id}`
- request body:

```json
{
  "expiration_at": "2026-04-25 00:00:00"
}
```

### 4.4 Delete Cache

- Endpoint: `DELETE /api/admin-dashboard/caches/{id}`
- `id` selalu memakai encoded cache key

## 5. Kolom Tabel

- `key`
- `category`
- `expiration`
- aksi `Detail`
- aksi `Edit`
- aksi `Delete`

Catatan:

- frontend menampilkan `category_parent` dan `category_child` sebagai informasi tambahan pada kolom category
- frontend menampilkan `expiration_timestamp` sebagai informasi tambahan pada kolom expiration
- frontend menampilkan badge peringatan jika cache akan expired kurang dari 24 jam

## 6. Detail Modal

Detail modal menampilkan:

- `key`
- `category`
- `category_parent`
- `category_child`
- `expiration`
- `expiration_timestamp`
- `value`

Catatan:

- field `value` berasal dari endpoint detail
- jika backend mengirim object atau array, frontend menampilkannya dalam format JSON rapi
- jika backend mengirim string mentah, frontend menampilkannya apa adanya

## 7. Catatan Bisnis

- module ini tidak punya create cache baru dari admin dashboard
- update hanya mengubah expiration, tidak membangun ulang isi cache
- jika ingin cache dibangun ulang, cache cukup dihapus lalu aplikasi akan membuat ulang saat endpoint sumber dipanggil
- semua akses detail, update, dan delete wajib memakai `encodeURIComponent(key)` di service

## 8. Struktur Service dan Hook

- Hook halaman:
  - `src/hooks/admin-dashboard/useCacheManagementPage.ts`
- Service domain:
  - `src/service/admin-dashboard/cache/caches.ts`
  - `src/service/admin-dashboard/cache/shared.ts`
- Validator:
  - `src/validators/admin-management/adminDashboardCache.ts`
- Type:
  - `src/type/admin-management/adminDashboardCache.ts`

## 9. Status

- route halaman aktif
- permission page aktif
- sidebar admin aktif
- search backend aktif dengan tombol submit
- server-side pagination aktif
- sorting backend aktif untuk `key` dan `expiration`
- detail modal aktif
- update expiration modal aktif
- delete confirmation aktif
