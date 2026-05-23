# Manajemen Peran Page Documentation

## 1. Ringkasan Halaman

- Route: `APP_ROUTES.ADMIN_MANAGEMENT.ROLES`
- Path: `/admin-management/roles`
- Permission page: `read_admin_roles`
- Page: `src/pages/admin-management/RoleManagementPage.tsx`
- Layout: `src/components/layouts/AdminManagementLayout.tsx`

Halaman ini dipakai untuk mengelola role admin, termasuk melihat daftar role, menambah role baru, memperbarui role, menghapus role tertentu, dan memilih permission berdasarkan kategori.

## 2. Permission yang Dipakai

- `read_admin_roles`
- `create_admin_roles`
- `update_admin_roles`
- `delete_admin_roles`

Aturan akses UI:

- halaman dan menu sidebar tampil dengan `read_admin_roles`
- tombol `Tambah Role` tampil dengan `create_admin_roles`
- tombol `Update` tampil dengan `update_admin_roles`
- tombol `Delete` tampil dengan `delete_admin_roles`
- tombol `Delete` hanya tampil bila `userCount === 0`

## 3. Struktur Halaman

Halaman terdiri dari:

1. `PageTitle` Manajemen Peran
2. Summary cards
3. Toolbar pencarian + limit data
4. Tabel sortable role
5. Pagination
6. Modal create/update role
7. Modal konfirmasi hapus role

## 4. Data dan Query

### 4.1 List Role

- Hook: `src/hooks/admin-dashboard/useRoleManagementPage.ts`
- Service: `src/service/admin-dashboard/role/roles.ts`
- Endpoint: `GET /api/admin-dashboard/roles`

Query params:

```json
{
  "search": "admin",
  "page": 1,
  "per_page": 10,
  "status": "active"
}
```

Response shape yang dipakai frontend:

```json
{
  "success": true,
  "message": "Roles fetched successfully",
  "data": {
    "items": [],
    "meta": {
      "page": 1,
      "per_page": 10,
      "total": 0,
      "last_page": 1
    }
  }
}
```

Frontend memakai `meta.page`, `meta.per_page`, `meta.total`, dan `meta.last_page` untuk pagination server-side.

Catatan identifier:

- frontend mengambil `items[].id`
- field `id` ini berisi `UUID role`
- UUID dipakai untuk request detail, update, dan delete

### 4.2 Detail Role

- Endpoint: `GET /api/admin-dashboard/roles/{uuid}`

Contoh:

```http
GET /api/admin-dashboard/roles/550e8400-e29b-41d4-a716-446655440000
```

### 4.3 Master Permission

- Hook: `src/hooks/admin-dashboard/useRoleManagementPage.ts`
- Service: `src/service/admin-dashboard/role/permissions.ts`
- Endpoint: `GET /api/admin-dashboard/permissions`

Permission dari backend dikelompokkan berdasarkan field `category`, lalu ditampilkan di modal melalui `GroupedFilterMultiSelect`.

## 5. Create dan Update Role

- Modal: `src/components/admin-dashboard/role-management/RoleFormModal.tsx`
- Validator: `src/validators/admin-management/adminDashboardRole.ts`
- Types: `src/type/admin-management/adminDashboardRole.ts`

Field form:

- `name`
- `slug`
- `description`
- `status`
- `permissions`

### 5.1 Create Role

- Endpoint: `POST /api/admin-dashboard/roles`
- Permission: `create_admin_roles`

Payload:

```json
{
  "name": "Operator Internal",
  "slug": "operator-internal",
  "description": "Role untuk operasional harian.",
  "status": "active",
  "permissions": ["read_admin_roles", "update_admin_roles"]
}
```

### 5.2 Update Role

- Endpoint: `PUT /api/admin-dashboard/roles/{uuid}`
- Permission: `update_admin_roles`

Payload:

```json
{
  "name": "Operator Regional",
  "slug": "operator-regional",
  "description": "Role untuk operasional regional.",
  "status": "active",
  "permissions": ["read_admin_roles", "update_admin_roles"]
}
```

## 6. Delete Role

- Endpoint: `DELETE /api/admin-dashboard/roles/{uuid}`
- Permission: `delete_admin_roles`

Aturan UI saat ini:

- tombol delete hanya muncul bila role tidak dipakai user (`userCount === 0`)
- aksi delete memakai `ConfirmationModal`
- setelah sukses, query list role di-invalidasi lalu data diambil ulang
- jika backend mengembalikan `success: false`, frontend menampilkan pesan error dari backend

## 7. Komponen Utama

- `src/pages/admin-management/RoleManagementPage.tsx`
- `src/components/admin-dashboard/role-management/RoleFormModal.tsx`
- `src/components/ui/ConfirmationModal.tsx`
- `src/components/ui/SortableDataTable.tsx`
- `src/components/ui/Pagination.tsx`
- `src/components/ui/Form/DataLimitSelect.tsx`
- `src/components/ui/Form/GroupedFilterMultiSelect.tsx`

## 8. Struktur Service dan Hook

- Hook halaman: `src/hooks/admin-dashboard/useRoleManagementPage.ts`
- Service domain:
  - `src/service/admin-dashboard/role/roles.ts`
  - `src/service/admin-dashboard/role/permissions.ts`
  - `src/service/admin-dashboard/role/shared.ts`

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
- search backend aktif
- limit backend aktif
- filter `status` backend siap dipakai
- create role aktif
- update role aktif
- delete role aktif dengan guard `userCount === 0` dan UUID role
- grouped permission picker aktif
