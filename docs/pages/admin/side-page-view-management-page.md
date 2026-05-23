# Pengunjung Halaman SIDE Management Page Documentation

## 1. Ringkasan Halaman

- Route: `APP_ROUTES.ADMIN_MANAGEMENT.SIDE_PAGE_VIEWS`
- Path: `/admin-management/analytics/page-view`
- Permission page: `read_admin_side_page_views`
- Page: `src/pages/admin-management/SidePageViewManagementPage.tsx`

Halaman ini dipakai untuk menampilkan data tracking page view SIDE secara read-only di area Admin Dashboard.

## 2. Permission yang Dipakai

- `read_admin_side_page_views`

Aturan akses UI:

- halaman dan menu sidebar tampil dengan `read_admin_side_page_views`
- tidak ada create, update, atau delete
- aksi yang tersedia hanya `Detail`

## 3. Struktur Halaman

Halaman terdiri dari:

1. `PageTitle` Pengunjung Halaman SIDE
2. Summary cards dari backend
3. Toolbar pencarian tombol submit + filter module select + limit data
4. Tabel sortable Pengunjung Halaman SIDE
5. Pagination
6. Modal detail read-only

## 4. Data dan Query

### 4.1 List Pengunjung Halaman SIDE

- Hook: `src/hooks/admin-dashboard/useSidePageViewManagementPage.ts`
- Service: `src/service/admin-dashboard/side-page-view/sidePageViews.ts`
- Endpoint: `GET /api/admin-dashboard/side-page-views`
- Helper module: `GET /api/admin-dashboard/side-page-view-modules`

Query params:

```json
{
  "search": "home",
  "page": 1,
  "per_page": 10,
  "module": "home",
  "sort_by": "created_at",
  "sort_direction": "desc"
}
```

Sorting backend yang dipakai:

- `path`
- `module`
- `created_at`

### 4.2 Detail Pengunjung Halaman SIDE

- Endpoint: `GET /api/admin-dashboard/side-page-views/{id}`
- `id` memakai integer internal dari list

## 5. Kolom Tabel

- `path`
- `module`
- `user.name`
- `user.email`
- `user_agent`
- `created_at`
- aksi `Detail`

Catatan:

- data user bisa `null`
- frontend akan menampilkan `Guest` dan `-` bila data user kosong
- filter module memakai helper endpoint `side-page-view-modules`

## 6. Detail Modal

Detail modal menampilkan:

- `id`
- `path`
- `module`
- `user name`
- `user email`
- `user agent`
- `ip hash`
- `created_at`
- `updated_at`

## 7. Struktur Service dan Hook

- Hook halaman:
  - `src/hooks/admin-dashboard/useSidePageViewManagementPage.ts`
- Service domain:
  - `src/service/admin-dashboard/side-page-view/sidePageViews.ts`
  - `src/service/admin-dashboard/side-page-view/shared.ts`

Pola yang dipakai:

- type di `src/type/admin-management`
- service per domain
- satu hook per halaman
- tanpa validator karena module read-only

## 8. Status

- route halaman aktif
- permission page aktif
- sidebar admin aktif
- search backend aktif dengan tombol submit
- filter module aktif
- server-side pagination aktif
- sorting backend aktif untuk `path`, `module`, `created_at`
- detail modal aktif
