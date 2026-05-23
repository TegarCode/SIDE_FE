# Manajemen API Client Page Documentation

## 1. Ringkasan Halaman

- Route: `APP_ROUTES.ADMIN_MANAGEMENT.API_CLIENTS`
- Path: `/admin-management/api-clients`
- Permission route/sidebar saat ini: `view_admin_dashboard`
- Page: `src/pages/admin-management/ApiClientManagementPage.tsx`

Halaman ini dipakai untuk mengelola API client yang akan mengakses endpoint backend melalui header `X-API-KEY`. Admin dapat melihat detail, membuat client baru, memperbarui konfigurasi, dan menghapus client.

## 2. Catatan Akses

Karena backend permission khusus API client belum diberikan, halaman ini saat ini mengikuti gate utama admin dashboard:

- menu sidebar tampil dengan `view_admin_dashboard`
- route diproteksi dengan `view_admin_dashboard`

Jika backend nanti menyediakan permission spesifik seperti `read_admin_api_clients`, gate ini bisa dipindahkan tanpa mengubah pola service dan halaman.

## 3. Struktur Halaman

Halaman terdiri dari:

1. `PageTitle` Manajemen API Client
2. Summary cards dari backend
3. Toolbar search, filter status aktif, dan limit
4. Tabel sortable API client
5. Pagination server-side
6. Modal detail/create/update
7. Modal konfirmasi hapus
8. Modal sukses create untuk menampilkan `plain_text_api_key`
9. Modal regenerate API key dengan input password admin

## 4. Data dan Query

### 4.1 List API Client

- Hook: `src/hooks/admin-dashboard/useApiClientManagementPage.ts`
- Service: `src/service/admin-dashboard/api-client/apiClients.ts`
- Endpoint: `GET /api/admin-dashboard/api-clients`

Query params:

```json
{
  "search": "mobile",
  "page": 1,
  "per_page": 10,
  "active": "true",
  "sort_by": "created_at",
  "sort_direction": "desc"
}
```

Sorting backend yang dipakai:

- `name`
- `active`
- `created_at`
- `updated_at`

Frontend memakai:

- `summary.total_client`
- `summary.client_aktif`
- `summary.client_terbaru`
- `data.items`
- `meta.page`
- `meta.per_page`
- `meta.total`
- `meta.last_page`
- `meta.sort_by`
- `meta.sort_direction`

### 4.2 Detail API Client

- Endpoint: `GET /api/admin-dashboard/api-clients/{uuid}`

UUID dipakai untuk detail, update, dan delete.

### 4.3 Helper Ability

- Endpoint: `GET /api/admin-dashboard/api-client-permissions`
- Data dipakai untuk source multi select `abilities`
- FE mengelompokkan option berdasarkan `category`
- Wildcard `*` tetap didukung pada UI sebagai full access

## 5. Create dan Update API Client

- Modal: `src/components/admin-dashboard/api-client-management/ApiClientFormModal.tsx`
- Validator: `src/validators/admin-management/adminDashboardApiClient.ts`
- Types: `src/type/admin-management/adminDashboardApiClient.ts`

Field form:

- `name`
- `description`
- `abilities`
- `allowedDomains` (opsional)
- `active`

Payload ke backend:

```json
{
  "name": "Mobile Service",
  "description": "Client untuk integrasi mobile service.",
  "abilities": ["view_admin_dashboard"],
  "allowed_domains": ["https://mobile.example.com"],
  "active": true
}
```

Semua error validasi backend ditampilkan di modal, baik per field maupun daftar ringkas di bagian atas form.

## 6. Plain Text API Key

Saat create berhasil, backend mengirim:

- `data`
- `metadata.plain_text_api_key`
- `metadata.api_key_notice`

Frontend menangani ini dengan aturan:

- list di-refresh setelah create sukses
- plain text API key ditampilkan pada modal sukses
- tersedia tombol copy API key
- API key mentah tidak disimpan ke local storage
- endpoint detail dan list tidak dipakai untuk mengambil ulang API key mentah

## 7. Regenerate API Key

- Endpoint: `POST /api/admin-dashboard/api-clients/{uuid}/regenerate-key`
- Request body:

```json
{
  "current_password": "password-user-admin"
}
```

Frontend menangani alur berikut:

- user klik `Regenerate API Key`
- modal konfirmasi tampil dengan warning bahwa API key lama langsung tidak berlaku
- user wajib mengisi `current_password`
- jika sukses, list dan detail di-refresh
- modal sukses menampilkan `metadata.plain_text_api_key`
- tersedia tombol copy API key
- plaintext API key tidak disimpan ke local storage atau session storage

## 8. Delete API Client

- Endpoint: `DELETE /api/admin-dashboard/api-clients/{uuid}`
- Delete memakai `ConfirmationModal`
- Setelah delete sukses, list di-refresh melalui invalidasi query React Query

## 9. Komponen Utama

- `src/pages/admin-management/ApiClientManagementPage.tsx`
- `src/components/admin-dashboard/api-client-management/ApiClientFormModal.tsx`
- `src/components/ui/ConfirmationModal.tsx`
- `src/components/ui/SortableDataTable.tsx`
- `src/components/ui/Pagination.tsx`
- `src/components/ui/Form/GroupedFilterMultiSelect.tsx`

## 10. Struktur Service dan Hook

- Hook halaman:
  - `src/hooks/admin-dashboard/useApiClientManagementPage.ts`
- Service domain:
  - `src/service/admin-dashboard/api-client/apiClients.ts`
  - `src/service/admin-dashboard/api-client/shared.ts`

Pola yang dipakai:

- type di `src/type/admin-management`
- validator di `src/validators/admin-management`
- service per domain
- hook per halaman

## 11. Status

- route aktif
- sidebar admin aktif
- search dengan tombol submit aktif
- filter active aktif
- server-side pagination aktif
- sorting backend aktif untuk `name`, `active`, `created_at`, `updated_at`
- detail modal aktif
- create modal aktif
- update modal aktif
- regenerate API key aktif dengan modal password
- delete aktif dengan modal konfirmasi
- success modal plain text API key aktif
