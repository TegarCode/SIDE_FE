# Daftar Video Tutorial Management Page Documentation

## 1. Ringkasan Halaman

- Route: `APP_ROUTES.ADMIN_MANAGEMENT.TUTORIAL_PLAYLISTS`
- Path: `/admin-management/tutorial-playlists`
- Permission route/sidebar saat ini: `view_admin_dashboard`
- Page: `src/pages/admin-management/TutorialPlaylistManagementPage.tsx`

Halaman ini dipakai untuk mengelola playlist tutorial video yang tampil pada halaman panduan, termasuk thumbnail image.

## 2. Catatan Akses

Karena backend permission khusus Daftar Video Tutorial belum diberikan, halaman ini saat ini mengikuti gate utama admin dashboard:

- menu sidebar tampil dengan `view_admin_dashboard`
- route diproteksi dengan `view_admin_dashboard`

## 3. Struktur Halaman

Halaman terdiri dari:

1. `PageTitle` Manajemen Daftar Video Tutorial
2. Summary cards dari backend
3. Toolbar search dan limit
4. Tabel sortable Daftar Video Tutorial
5. Pagination server-side
6. Modal detail/create/update
7. Modal konfirmasi hapus

## 4. Data dan Query

### 4.1 List Daftar Video Tutorial

- Hook: `src/hooks/admin-dashboard/useTutorialPlaylistManagementPage.ts`
- Service: `src/service/admin-dashboard/tutorial-playlist/tutorialPlaylists.ts`
- Endpoint: `GET /api/admin-dashboard/tutorial-playlists`

Query params:

```json
{
  "search": "overview",
  "page": 1,
  "per_page": 10,
  "sort_by": "updated_at",
  "sort_direction": "desc"
}
```

Sorting backend yang dipakai:

- `title`
- `slug`
- `created_at`
- `updated_at`

### 4.2 Detail Daftar Video Tutorial

- Endpoint: `GET /api/admin-dashboard/tutorial-playlists/{uuid}`

## 5. Create dan Update Daftar Video Tutorial

- Modal: `src/components/admin-dashboard/tutorial-playlist-management/TutorialPlaylistFormModal.tsx`
- Validator: `src/validators/admin-management/adminDashboardTutorialPlaylist.ts`
- Types: `src/type/admin-management/adminDashboardTutorialPlaylist.ts`

Field form:

- `title`
- `slug`
- `description`
- `url`
- `thumbnail`

Request create dan update memakai `multipart/form-data`.

Catatan implementasi:

- create memakai `POST /api/admin-dashboard/tutorial-playlists`
- update memakai `POST /api/admin-dashboard/tutorial-playlists/{uuid}`
- pendekatan ini dipilih karena backend menyatakan `PUT atau POST` didukung, dan `POST multipart/form-data` lebih stabil untuk upload file
- saat update tanpa file baru, thumbnail lama tetap dipertahankan

## 6. Thumbnail

Frontend menampilkan preview dari:

- `thumbnail_url` bila data berasal dari backend
- object URL lokal saat user memilih file baru

Validasi FE:

- thumbnail wajib saat create
- thumbnail opsional saat update
- format: JPG, JPEG, PNG, WEBP
- ukuran maksimal 2MB

## 7. Delete Daftar Video Tutorial

- Endpoint: `DELETE /api/admin-dashboard/tutorial-playlists/{uuid}`
- delete memakai `ConfirmationModal`
- setelah create, update, atau delete sukses, list di-refresh
- query `home/tutorial-playlists` juga ikut di-refresh

## 8. Status

- route aktif
- sidebar admin aktif
- search backend aktif dengan tombol submit
- pagination server-side aktif
- sorting backend aktif
- detail modal aktif
- create tutorial aktif
- update tutorial aktif
- delete tutorial aktif
- upload thumbnail image aktif
