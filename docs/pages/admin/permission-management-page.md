# Permission Management Page Documentation

## 1. Ringkasan Halaman

- Route: `APP_ROUTES.ADMIN_MANAGEMENT.PERMISSIONS`
- Path: `/admin-management/permissions`
- Permission page: `read_admin_permissions`
- Page: `src/pages/admin-management/PermissionManagementPage.tsx`
- Layout: `src/components/layouts/AdminManagementLayout.tsx`

Halaman ini dipakai untuk mengelola permission admin, termasuk melihat daftar permission, menambah permission baru, memperbarui permission, dan menghapus permission tertentu.

## 2. Permission yang Dipakai

- `read_admin_permissions`
- `create_admin_permissions`
- `update_admin_permissions`
- `delete_admin_permissions`

Aturan akses UI:

- halaman dan menu sidebar tampil dengan `read_admin_permissions`
- tombol `Tambah Permission` tampil dengan `create_admin_permissions`
- tombol `Update` tampil dengan `update_admin_permissions`
- tombol `Delete` tampil dengan `delete_admin_permissions`

## 3. Struktur Halaman

Halaman terdiri dari:

1. `PageTitle` Manajemen Hak Akses
2. Summary cards dari backend
3. Toolbar pencarian tombol submit + limit data
4. Tabel sortable permission
5. Pagination
6. Modal create/update permission
7. Modal konfirmasi hapus permission

## 4. Data dan Query

### 4.1 List Permission

- Hook: `src/hooks/admin-dashboard/usePermissionManagementPage.ts`
- Service: `src/service/admin-dashboard/permission/permissions.ts`
- Endpoint: `GET /api/admin-dashboard/permissions`

Query params:

```json
{
  "search": "read",
  "page": 1,
  "per_page": 10,
  "category": "Modul Role Admin",
  "sort_by": "updated_at",
  "sort_direction": "desc"
}
```

Response shape yang dipakai frontend:

```json
{
  "success": true,
  "message": "Permissions fetched successfully",
  "data": {
    "summary": {
      "total_permission": 50,
      "kategori_aktif": 14,
      "permission_terbaru": {}
    },
    "items": [],
    "meta": {
      "page": 1,
      "per_page": 10,
      "total": 0,
      "last_page": 1,
      "sort_by": "updated_at",
      "sort_direction": "desc"
    }
  }
}
```

Frontend memakai `meta.page`, `meta.per_page`, `meta.total`, dan `meta.last_page` untuk pagination server-side.
Frontend juga memakai `summary` untuk summary cards dan `sort_by` / `sort_direction` untuk sorting server-side.

Nilai sorting yang dipakai:

- `sort_by`: `name | category | created_at | updated_at`
- `sort_direction`: `asc | desc`

Catatan pencarian:

- input pencarian disimpan lokal lebih dulu
- request ke backend baru dikirim saat tombol `Cari` diklik atau form di-submit

Catatan identifier:

- frontend mengambil `items[].id`
- field `id` ini berisi `UUID permission`
- UUID dipakai untuk request detail, update, dan delete

### 4.2 Detail Permission

- Endpoint: `GET /api/admin-dashboard/permissions/{uuid}`
- dipakai saat modal update dibuka agar detail terbaru diambil dari backend

## 5. Create dan Update Permission

- Modal: `src/components/admin-dashboard/permission-management/PermissionFormModal.tsx`
- Validator: `src/validators/admin-management/adminDashboardPermission.ts`
- Types: `src/type/admin-management/adminDashboardPermission.ts`

Field form:

- `name`
- `category`
- `description`

Catatan UI:

- field `name` adalah code permission yang dikirim ke backend
- label `Nama Permission` di tabel diturunkan dari code, misalnya `read_admin_roles` menjadi `Read Admin Roles`

### 5.1 Create Permission

- Endpoint: `POST /api/admin-dashboard/permissions`
- Permission: `create_admin_permissions`

Payload:

```json
{
  "name": "approve_admin_permissions",
  "category": "Modul Permission Admin",
  "description": "Menyetujui perubahan permission admin."
}
```

### 5.2 Update Permission

- Endpoint: `PUT /api/admin-dashboard/permissions/{uuid}`
- Permission: `update_admin_permissions`

Payload:

```json
{
  "name": "approve_admin_permissions",
  "category": "Modul Permission Admin",
  "description": "Menyetujui dan mengubah permission admin."
}
```

## 6. Delete Permission

- Endpoint: `DELETE /api/admin-dashboard/permissions/{uuid}`
- Permission: `delete_admin_permissions`

Aturan UI saat ini:

- aksi delete memakai `ConfirmationModal`
- setelah sukses, query list permission di-invalidasi lalu data diambil ulang
- jika backend mengembalikan `success: false`, frontend menampilkan pesan error dari backend

## 7. Komponen Utama

- `src/pages/admin-management/PermissionManagementPage.tsx`
- `src/components/admin-dashboard/permission-management/PermissionFormModal.tsx`
- `src/components/ui/ConfirmationModal.tsx`
- `src/components/ui/SortableDataTable.tsx`
- `src/components/ui/Pagination.tsx`
- `src/components/ui/Form/DataLimitSelect.tsx`

## 8. Struktur Service dan Hook

- Hook halaman: `src/hooks/admin-dashboard/usePermissionManagementPage.ts`
- Service domain:
  - `src/service/admin-dashboard/permission/permissions.ts`
  - `src/service/admin-dashboard/permission/shared.ts`

Pola yang dipakai:

- type di `src/type/admin-management`
- validator di `src/validators/admin-management`
- service per domain
- satu hook per halaman

## 9. Status

- route halaman aktif
- permission page aktif
- sidebar admin aktif
- server-side pagination aktif
- search backend aktif dengan tombol submit
- limit backend aktif
- parameter `category` backend siap dipakai
- sorting backend aktif untuk `name`, `category`, `created_at`, `updated_at`
- create permission aktif
- update permission aktif
- delete permission aktif dengan UUID permission
