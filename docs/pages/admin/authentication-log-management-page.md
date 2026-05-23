# Authentication Log Management Page Documentation

## 1. Ringkasan Halaman

- Route: `APP_ROUTES.ADMIN_MANAGEMENT.AUTHENTICATION_LOGS`
- Path: `/admin-management/authentication-logs`
- Permission page: `read_admin_authentication_logs`
- Page: `src/pages/admin-management/AuthenticationLogManagementPage.tsx`

Halaman ini dipakai untuk menampilkan dan mengelola authentication log dari sistem login admin pada area Admin Dashboard.

## 2. Permission yang Dipakai

- `read_admin_authentication_logs`
- `delete_admin_authentication_logs`

Aturan akses UI:

- halaman dan menu sidebar tampil dengan `read_admin_authentication_logs`
- tombol delete tampil dengan `delete_admin_authentication_logs`

## 3. Struktur Halaman

Halaman terdiri dari:

1. `PageTitle` Manajemen Authentication Log
2. Summary cards dari backend
3. Toolbar pencarian tombol submit + filter login berhasil + limit data
4. Tabel sortable authentication log
5. Pagination
6. Modal detail authentication log
7. Modal konfirmasi delete

## 4. Data dan Query

### 4.1 List Authentication Log

- Hook: `src/hooks/admin-dashboard/useAuthenticationLogManagementPage.ts`
- Service: `src/service/admin-dashboard/authentication-log/authenticationLogs.ts`
- Endpoint: `GET /api/admin-dashboard/authentication-logs`

Query params:

```json
{
  "search": "superadmin",
  "page": 1,
  "per_page": 10,
  "login_successful": true,
  "sort_by": "login_at",
  "sort_direction": "desc"
}
```

Sorting backend yang dipakai:

- `login_at`
- `logout_at`

### 4.2 Detail Authentication Log

- Endpoint: `GET /api/admin-dashboard/authentication-logs/{id}`
- `id` memakai UUID authentication log

### 4.3 Delete Authentication Log

- Endpoint: `DELETE /api/admin-dashboard/authentication-logs/{id}`

## 5. Kolom Tabel

- `user`
- `email`
- `ip_address`
- `user_agent`
- `login_at`
- `logout_at`
- `login_successful`
- `location`
- aksi `Detail`
- aksi `Delete`

## 6. Detail Modal

Detail modal menampilkan:

- `user name`
- `user email`
- `ip_address`
- `user_agent`
- `login_at`
- `logout_at`
- `login_successful`
- `location`

## 7. Catatan Bisnis

- authentication log tidak dibuat manual dari frontend
- delete menghapus satu record log berdasarkan UUID

## 8. Struktur Service dan Hook

- Hook halaman:
  - `src/hooks/admin-dashboard/useAuthenticationLogManagementPage.ts`
- Service domain:
  - `src/service/admin-dashboard/authentication-log/authenticationLogs.ts`
  - `src/service/admin-dashboard/authentication-log/shared.ts`
- Validator:
  - `src/validators/admin-management/adminDashboardAuthenticationLog.ts`
- Type:
  - `src/type/admin-management/adminDashboardAuthenticationLog.ts`

## 9. Status

- route halaman aktif
- permission page aktif
- sidebar admin aktif
- search backend aktif dengan tombol submit
- filter login berhasil aktif
- server-side pagination aktif
- sorting backend aktif untuk `login_at` dan `logout_at`
- detail modal aktif
- delete confirmation aktif
