# Beranda Admin Page Documentation

## 1. Ringkasan Halaman

- Route: `APP_ROUTES.ADMIN_MANAGEMENT.DASHBOARD`
- Path: `/admin-management/dashboard`
- Permission: `view_admin_dashboard`
- Page: `src/pages/admin-management/DashboardPage.tsx`
- Layout: `src/components/layouts/AdminManagementLayout.tsx`

Halaman ini menjadi landing page area `Beranda Admin`. Akses halaman berasal dari menu profile pada header utama, dan hanya tampil bila user memiliki permission admin yang sesuai.

Permission admin di frontend tidak dianggap statis selama session aktif. Saat user berpindah route, frontend akan sinkron ulang data current user sehingga visibilitas menu header, route admin, dan sidebar admin dapat ikut berubah tanpa perlu relogin.

## 2. Struktur Halaman

Halaman terdiri dari:

1. Layout admin khusus dengan sidebar dan navbar internal
2. Header halaman `Beranda Admin`
3. Card ringkas ucapan selamat datang / shortcut awal

Halaman ini sengaja dibuat ringan sebagai entry point area admin sebelum modul manajemen lain ditambahkan.

## 3. Layout Admin

- Layout: `src/components/layouts/AdminManagementLayout.tsx`

Karakter utama layout:

- sidebar admin terpisah dari layout utama
- navbar internal admin berbeda dari navbar umum
- notifikasi admin tersedia di navbar internal
- profile dropdown menyediakan aksi `Kembali ke Beranda`
- sidebar mendukung collapse desktop dan drawer mobile
- nama user dan daftar menu sidebar ikut sinkron saat `AUTH_SESSION_CHANGED_EVENT` dipicu oleh pembaruan session auth

## 4. Navigasi dan Akses

- Entry header utama: `src/components/layouts/Header.tsx`
- Route registration: `src/routes/AppRoutes.tsx`
- Route constants: `src/constants/routes.ts`
- Permission constants: `src/constants/permissions.ts`

Aturan akses:

- menu `Beranda Admin` di profile header hanya tampil bila user memiliki permission Beranda Admin
- route dashboard admin diproteksi dengan `view_admin_dashboard`
- root `/admin-management` akan diarahkan ke halaman admin pertama yang boleh diakses user
- layout sidebar admin membaca ulang permission dari session user aktif
- perubahan permission backend akan tercermin setelah route change berikutnya lewat sinkronisasi `GET /api/me`

## 5. Komponen Utama

- `src/pages/admin-management/DashboardPage.tsx`
- `src/components/layouts/AdminManagementLayout.tsx`
- `src/components/layouts/Header.tsx`
- `src/components/ui/PageTitle.tsx`
- `src/components/ui/Card.tsx`
- `src/components/ui/Button.tsx`
- `src/hooks/auth/useAuthSessionRefresh.ts`
- `src/service/authSession.ts`
- `src/service/authService.ts`

## 6. Status

- route halaman aktif
- permission halaman aktif
- akses header aktif
- layout admin aktif
- sidebar admin aktif
- navbar internal admin aktif
- sinkronisasi session auth ke sidebar admin aktif
