# Contact Management Page Documentation

## 1. Ringkasan Halaman

- Route list: `APP_ROUTES.ADMIN_MANAGEMENT.CONTACTS`
- Route detail: `APP_ROUTES.ADMIN_MANAGEMENT.CONTACT_DETAIL`
- Path list: `/admin-management/contacts`
- Path detail: `/admin-management/contacts/:contactId`
- Permission page: `read_admin_contacts`
- Page list: `src/pages/admin-management/ContactManagementPage.tsx`
- Page detail: `src/pages/admin-management/ContactDetailPage.tsx`

Halaman ini dipakai untuk mengelola pesan contact dari publik di area Admin Dashboard. Admin hanya bisa membaca, memperbarui, melihat detail, dan menghapus pesan contact.

## 2. Permission yang Dipakai

- `read_admin_contacts`
- `update_admin_contacts`
- `delete_admin_contacts`

Aturan akses UI:

- halaman dan menu sidebar tampil dengan `read_admin_contacts`
- tombol `Edit` tampil dengan `update_admin_contacts`
- tombol `Delete` tampil dengan `delete_admin_contacts`
- tidak ada tombol create karena create contact tetap berasal dari public form

## 3. Struktur Halaman

Halaman list terdiri dari:

1. `PageTitle` Manajemen Kontak
2. Summary cards dari backend
3. Toolbar search, filter jenis, dan limit
4. Tabel sortable contact message
5. Pagination server-side
6. Modal edit contact
7. Modal konfirmasi hapus contact

Halaman detail terdiri dari:

1. ringkasan identitas pengirim
2. isi pesan penuh
3. informasi waktu create dan update
4. aksi edit dan delete

## 4. Data dan Query

### 4.1 List Contact

- Hook: `src/hooks/admin-dashboard/useContactManagementPage.ts`
- Service: `src/service/admin-dashboard/contact/contacts.ts`
- Endpoint: `GET /api/admin-dashboard/contacts`

Query params:

```json
{
  "search": "budi",
  "page": 1,
  "per_page": 10,
  "jenis": "PERTANYAAN",
  "sort_by": "created_at",
  "sort_direction": "desc"
}
```

Sorting backend yang dipakai:

- `nama`
- `email`
- `jenis`
- `created_at`
- `updated_at`

Frontend memakai:

- `summary.total_contact`
- `summary.jenis_aktif`
- `summary.contact_terbaru`
- `data.items`
- `meta.page`
- `meta.per_page`
- `meta.total`
- `meta.last_page`
- `meta.sort_by`
- `meta.sort_direction`

### 4.2 Detail Contact

- Hook: `src/hooks/admin-dashboard/useContactDetailPage.ts`
- Endpoint: `GET /api/admin-dashboard/contacts/{uuid}`

UUID dipakai untuk detail, update, dan delete.

## 5. Edit Contact

- Modal: `src/components/admin-dashboard/contact-management/ContactFormModal.tsx`
- Validator: `src/validators/admin-management/adminDashboardContact.ts`
- Types: `src/type/admin-management/adminDashboardContact.ts`

Field form:

- `name`
- `email`
- `type`
- `message`

Payload ke backend:

```json
{
  "nama": "Budi Santoso",
  "email": "budi@example.com",
  "jenis": "MASUKAN",
  "pesan": "Pesan yang sudah diperbarui."
}
```

Semua error validasi backend ditampilkan di modal, baik per field maupun daftar ringkas di bagian atas form.

## 6. Delete Contact

- Endpoint: `DELETE /api/admin-dashboard/contacts/{uuid}`
- Permission: `delete_admin_contacts`

Aturan UI:

- delete memakai `ConfirmationModal`
- setelah update atau delete sukses, list di-refresh melalui invalidasi query React Query
- success dan error ditampilkan dengan toast

## 7. Komponen Utama

- `src/pages/admin-management/ContactManagementPage.tsx`
- `src/pages/admin-management/ContactDetailPage.tsx`
- `src/components/admin-dashboard/contact-management/ContactFormModal.tsx`
- `src/components/ui/ConfirmationModal.tsx`
- `src/components/ui/SortableDataTable.tsx`
- `src/components/ui/Pagination.tsx`
- `src/components/ui/Form/DataLimitSelect.tsx`
- `src/components/ui/Form/Textarea.tsx`

## 8. Struktur Service dan Hook

- Hook halaman:
  - `src/hooks/admin-dashboard/useContactManagementPage.ts`
  - `src/hooks/admin-dashboard/useContactDetailPage.ts`
- Service domain:
  - `src/service/admin-dashboard/contact/contacts.ts`
  - `src/service/admin-dashboard/contact/shared.ts`

Pola yang dipakai:

- type di `src/type/admin-management`
- validator di `src/validators/admin-management`
- service per domain
- hook per halaman

## 9. Status

- route list aktif
- route detail aktif
- sidebar admin aktif
- server-side search aktif dengan tombol submit
- filter jenis aktif
- server-side pagination aktif
- sorting backend aktif untuk `nama`, `email`, `jenis`, `created_at`, `updated_at`
- detail contact aktif
- edit contact aktif
- delete contact aktif dengan modal konfirmasi
