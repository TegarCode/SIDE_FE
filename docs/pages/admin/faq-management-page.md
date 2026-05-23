# FAQ Management Page Documentation

## 1. Ringkasan Halaman

- Route: `APP_ROUTES.ADMIN_MANAGEMENT.FAQS`
- Path: `/admin-management/faqs`
- Permission page: `read_admin_faqs`
- Page: `src/pages/admin-management/FaqManagementPage.tsx`
- Layout: `src/components/layouts/AdminManagementLayout.tsx`

Halaman ini dipakai untuk mengelola topik FAQ dan seluruh item pertanyaan-jawaban di dalam tiap topik langsung dari area Admin Dashboard.

## 2. Permission yang Dipakai

- `read_admin_faqs`
- `create_admin_faqs`
- `update_admin_faqs`
- `delete_admin_faqs`

Aturan akses UI:

- halaman dan menu sidebar tampil dengan `read_admin_faqs`
- tombol `Tambah FAQ` tampil dengan `create_admin_faqs`
- tombol `Edit` tampil dengan `update_admin_faqs`
- tombol `Delete` tampil dengan `delete_admin_faqs`
- tombol `Detail` tetap tampil selama user bisa membuka halaman

## 3. Struktur Halaman

Halaman terdiri dari:

1. `PageTitle` Manajemen FAQ
2. Summary cards dari backend
3. Toolbar search, filter featured, dan limit
4. Tabel sortable FAQ topic
5. Pagination server-side
6. Modal detail/create/update FAQ
7. Modal konfirmasi hapus FAQ

## 4. Data dan Query

### 4.1 List FAQ

- Hook: `src/hooks/admin-dashboard/useFaqManagementPage.ts`
- Service: `src/service/admin-dashboard/faq/faqs.ts`
- Endpoint: `GET /api/admin-dashboard/faqs`

Query params:

```json
{
  "search": "akun",
  "page": 1,
  "per_page": 10,
  "isFeatured": true,
  "sort_by": "order",
  "sort_direction": "desc"
}
```

Sorting backend yang dipakai:

- `topic`
- `order`
- `created_at`
- `updated_at`

Frontend memakai:

- `summary.total_faq_topic`
- `summary.faq_featured`
- `summary.faq_terbaru`
- total `itemsCount` pada data halaman untuk summary card `Jumlah Item FAQ`
- `data.items`
- `meta.page`
- `meta.per_page`
- `meta.total`
- `meta.last_page`
- `meta.sort_by`
- `meta.sort_direction`

### 4.2 Detail FAQ

- Endpoint: `GET /api/admin-dashboard/faqs/{uuid}`
- dipakai saat modal detail atau update dibuka

## 5. Form FAQ Topic

- Modal: `src/components/admin-dashboard/faq-management/FaqFormModal.tsx`
- Validator: `src/validators/admin-management/adminDashboardFaq.ts`
- Types: `src/type/admin-management/adminDashboardFaq.ts`

Field topik:

- `topic`
- `summary`
- `isFeatured`
- `order`
- `items[]`

Field item FAQ:

- `question`
- `answer`
- `order`

Catatan implementasi:

- item FAQ tidak memakai endpoint CRUD terpisah
- create/update mengirim seluruh `items` dalam satu payload
- form memakai dynamic field array
- minimal harus ada 1 item FAQ
- error validasi backend ditampilkan penuh di modal dan per field

## 6. Create, Update, Delete

### 6.1 Create FAQ

- Endpoint: `POST /api/admin-dashboard/faqs`
- Permission: `create_admin_faqs`

### 6.2 Update FAQ

- Endpoint: `PUT /api/admin-dashboard/faqs/{uuid}`
- Permission: `update_admin_faqs`

### 6.3 Delete FAQ

- Endpoint: `DELETE /api/admin-dashboard/faqs/{uuid}`
- Permission: `delete_admin_faqs`

Aturan UI:

- delete memakai `ConfirmationModal`
- setelah create/update/delete sukses, list di-refresh melalui invalidasi query React Query
- success dan error ditampilkan dengan toast

## 7. Komponen Utama

- `src/pages/admin-management/FaqManagementPage.tsx`
- `src/components/admin-dashboard/faq-management/FaqFormModal.tsx`
- `src/components/ui/Form/Textarea.tsx`
- `src/components/ui/ConfirmationModal.tsx`
- `src/components/ui/SortableDataTable.tsx`
- `src/components/ui/Pagination.tsx`
- `src/components/ui/Form/DataLimitSelect.tsx`

## 8. Struktur Service dan Hook

- Hook halaman: `src/hooks/admin-dashboard/useFaqManagementPage.ts`
- Service domain:
  - `src/service/admin-dashboard/faq/faqs.ts`
  - `src/service/admin-dashboard/faq/shared.ts`

Pola yang dipakai:

- type di `src/type/admin-management`
- validator di `src/validators/admin-management`
- service per domain
- satu hook per halaman

## 9. Status

- route halaman aktif
- sidebar admin aktif
- permission page aktif
- server-side search aktif dengan tombol submit
- filter featured aktif
- query filter featured ke backend memakai param `isFeatured`
- server-side pagination aktif
- sorting backend aktif untuk `topic`, `order`, `created_at`, `updated_at`
- detail FAQ aktif
- create FAQ aktif
- update FAQ aktif
- delete FAQ aktif dengan modal konfirmasi
