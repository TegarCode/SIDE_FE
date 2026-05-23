# Manajemen Pengguna Page Documentation

## 1. Ringkasan Halaman

- Route: `APP_ROUTES.ADMIN_MANAGEMENT.USERS`
- Path: `/admin-management/users`
- Permission page: `read_admin_users`
- Page: `src/pages/admin-management/UserManagementPage.tsx`
- Layout: `src/components/layouts/AdminManagementLayout.tsx`

Halaman ini dipakai untuk mengelola akun admin, termasuk melihat daftar pengguna, menambah pengguna baru, memperbarui data pengguna, dan menghapus pengguna bila backend mengizinkan.

## 2. Permission yang Dipakai

- `read_admin_users`
- `create_admin_users`
- `update_admin_users`
- `delete_admin_users`

Aturan akses UI:

- halaman dan menu sidebar tampil dengan `read_admin_users`
- tombol `Tambah Pengguna` tampil dengan `create_admin_users`
- tombol `Update` tampil dengan `update_admin_users`
- tombol `Delete` tampil dengan `delete_admin_users`
- delete dijalankan ke backend sebagai soft delete, sehingga user yang dihapus tidak muncul lagi di list
- backend tetap menjadi pengambil keputusan akhir untuk delete; frontend akan menampilkan error bila request ditolak

## 3. Struktur Halaman

Halaman terdiri dari:

1. `PageTitle` Manajemen Pengguna
2. Summary cards
3. Toolbar pencarian tombol submit + limit data
4. Tabel sortable user
5. Pagination server-side
6. Modal create/update user
7. Modal konfirmasi hapus user

## 4. Data dan Query

### 4.1 List User

- Hook: `src/hooks/admin-dashboard/useUserManagementPage.ts`
- Service: `src/service/admin-dashboard/user/users.ts`
- Endpoint: `GET /api/admin-dashboard/users`

Query params:

```json
{
  "search": "rizky",
  "page": 1,
  "per_page": 10,
  "status": "active",
  "role": "super_admin",
  "sort_by": "updated_at",
  "sort_direction": "desc"
}
```

Response shape yang dipakai frontend saat ini:

```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": {
    "summary": {
      "total_user": 6,
      "role_aktif": 5,
      "user_terbaru": {}
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

Field item yang dipakai frontend:

- `id`
- `name`
- `email`
- `status`
- `roles`
- `created_at`
- `updated_at`

Sorting backend yang dipakai:

- `name`
- `email`
- `created_at`
- `updated_at`

Kolom tabel yang saat ini dibuat sortable di UI:

- `Nama`
- `Email`
- `Terakhir Diubah`

Catatan pencarian:

- input pencarian disimpan lokal lebih dulu
- request ke backend baru dikirim saat tombol `Cari` diklik atau form di-submit

Catatan identifier:

- frontend mengambil `items[].id`
- field `id` ini berisi `UUID user`
- UUID dipakai untuk request detail, update, dan delete

### 4.2 Detail User

- Endpoint: `GET /api/admin-dashboard/users/{uuid}`
- dipakai saat modal update dibuka agar detail terbaru diambil dari backend

### 4.3 Master Role

- Hook: `src/hooks/admin-dashboard/useUserManagementPage.ts`
- Service: `src/service/admin-dashboard/user/users.ts`
- Endpoint: `GET /api/admin-dashboard/user-roles`

Frontend mengambil daftar role untuk select peran pengguna.
UI saat ini memakai `src/components/ui/Form/Select.tsx` dan hanya memilih satu role.

## 5. Create dan Update User

- Modal: `src/components/admin-dashboard/user-management/UserFormModal.tsx`
- Validator: `src/validators/admin-management/adminDashboardUser.ts`
- Types: `src/type/admin-management/adminDashboardUser.ts`

Field form:

- `name`
- `email`
- `role`
- `status`
- `password`
- `passwordConfirmation`

Asumsi payload frontend saat ini:

- `password` wajib saat create
- `password` opsional saat update
- jika password kosong saat update, field password tidak dikirim ke backend
- meskipun backend meminta `roles: string[]`, UI saat ini memilih satu role lalu mengirimkannya sebagai array dengan satu item

### 5.1 Create User

- Endpoint: `POST /api/admin-dashboard/users`
- Permission: `create_admin_users`

Payload:

```json
{
  "name": "Rizky Pratama",
  "email": "rizky@contoh.id",
  "status": "active",
  "roles": ["super_admin"],
  "password": "rahasia123",
  "password_confirmation": "rahasia123"
}
```

### 5.2 Update User

- Endpoint: `PUT /api/admin-dashboard/users/{uuid}`
- Permission: `update_admin_users`

Payload:

```json
{
  "name": "Rizky Pratama",
  "email": "rizky@contoh.id",
  "status": "active",
  "roles": ["admin"]
}
```

Jika password ikut diperbarui, frontend juga mengirim:

```json
{
  "password": "rahasiaBaru123",
  "password_confirmation": "rahasiaBaru123"
}
```

## 6. Delete User

- Endpoint: `DELETE /api/admin-dashboard/users/{uuid}`
- Permission: `delete_admin_users`

Aturan UI saat ini:

- tombol delete tampil bila user punya `delete_admin_users`
- aksi delete memakai `ConfirmationModal`
- setelah sukses, query list user di-invalidasi lalu data diambil ulang
- jika backend mengembalikan `success: false`, frontend menampilkan pesan error dari backend

## 7. Komponen Utama

- `src/pages/admin-management/UserManagementPage.tsx`
- `src/components/admin-dashboard/user-management/UserFormModal.tsx`
- `src/components/ui/ConfirmationModal.tsx`
- `src/components/ui/SortableDataTable.tsx`
- `src/components/ui/Pagination.tsx`
- `src/components/ui/Form/DataLimitSelect.tsx`
- `src/components/ui/Form/Select.tsx`

## 8. Struktur Service dan Hook

- Hook halaman: `src/hooks/admin-dashboard/useUserManagementPage.ts`
- Service domain:
  - `src/service/admin-dashboard/user/users.ts`
  - `src/service/admin-dashboard/user/shared.ts`

Pola yang dipakai:

- type di `src/type/admin-management`
- validator di `src/validators/admin-management`
- service per domain
- satu hook per halaman

## 9. Catatan Soft Delete

Frontend tidak menambahkan field baru untuk soft delete user. Delete user diperlakukan sebagai soft delete backend, dan user yang sudah dihapus tidak akan tampil lagi di list.

## 10. Status

- route halaman aktif
- permission page aktif
- sidebar admin aktif
- server-side pagination aktif
- search backend aktif dengan tombol submit
- limit backend aktif
- sorting backend aktif untuk `name`, `email`, `created_at`, `updated_at`
- create user aktif
- update user aktif
- delete user aktif dengan UUID user
- role select aktif memakai endpoint `user-roles`
