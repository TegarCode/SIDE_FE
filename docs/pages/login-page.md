# Login Page Documentation

## 1. Ringkasan Halaman

- Nama halaman: `Login`
- Route: `/login`
- Komponen page: `src/pages/LoginPage.tsx`
- Status: `Implemented`
- Tipe akses: `Public`

Halaman login sudah dimigrasikan ke TypeScript dan mengikuti pola boilerplate:

- UI di page + komponen presentasional kecil
- Fetch/mutation di React Query hooks
- Transformasi API di service
- Validasi form di validators
- Type data di `src/type`

## 2. Alur Login

1. User isi `email`, `password`, `captcha`.
2. Validasi client-side dijalankan (`validateLoginForm`).
3. Request login dikirim ke API dengan `captcha_id`.
4. Jika sukses, session disimpan ke localStorage melalui `saveAuthSession`.
5. Header authorization di axios diisi dari token login.
6. User diarahkan ke route home (`/`).
7. Saat user berpindah route dalam kondisi masih login, frontend akan sinkron ulang profil/permission aktif lewat endpoint current user agar hak akses tidak stale.

## 3. Data yang Ditarik

### 3.1 GET `/api/captcha`

- Hook: `useCaptchaQuery()`
- Service: `fetchCaptcha()`
- Query key: `["auth", "captcha"]`
- Output dipakai UI:
  - `captchaId`
  - `captchaImage` (dinormalisasi jadi data URI jika perlu)

### 3.2 POST `/api/login`

- Hook: `useLoginMutation()`
- Service: `loginWithPassword(payload)`
- Mutation key: `["auth", "login"]`
- Payload:
  - `email`
  - `password`
  - `captcha_id`
  - `captcha`

### 3.3 GET `/api/me`

- Service: `fetchCurrentUser()`
- Dipanggil oleh: `useAuthSessionRefresh()`
- Endpoint default frontend saat ini: `/api/me`
- Tujuan:
  - refresh data profil user aktif
  - refresh role/permission tanpa logout-login ulang
  - sinkronkan visibilitas menu, route admin, dan sidebar admin dengan permission terbaru

Catatan implementasi:

- fetch dilakukan saat route berubah dan session auth masih aktif
- request didedupe per route agar tidak double hit untuk route yang sama
- jika respons `401/403`, session dibersihkan

## 4. Session dan Akses

Session disimpan melalui `src/service/authSession.ts`:

- `authToken`
- `token_type`
- `user`
- `auth_exp_at`

`user` disimpan agar mekanisme menu berbasis permission (`utils/access.ts`) bisa langsung membaca role/permission setelah login.

Session behavior tambahan:

- `restoreAuthSession()` mengembalikan header auth dari localStorage saat app bootstrap
- `updateAuthSessionUser()` memperbarui data `user` di localStorage tanpa mengubah token aktif
- event `AUTH_SESSION_CHANGED_EVENT` dipakai untuk memberi tahu komponen layout bahwa data auth berubah

## 5. Validasi Form

Validator: `src/validators/login.ts`

Aturan:

- email wajib + format valid
- password wajib
- captcha wajib

## 6. Komponen UI Login

- `src/components/auth/CaptchaField.tsx`
  - render gambar captcha + input + tombol refresh
- `src/components/ui/Toast.tsx`
  - notifikasi sukses/error/warning tanpa library eksternal

## 7. Error Handling

- Pesan error API diekstrak dari `error.response.data.message` atau fallback.
- Jika error mengandung kata `captcha`:
  - captcha di-refresh
  - input captcha di-reset
  - focus balik ke input captcha
- Jika error mengandung `email/password`:
  - toast `Email atau kata sandi salah`

## 8. File Terkait

- Page:
  - `src/pages/LoginPage.tsx`
- Hooks:
  - `src/hooks/auth/useCaptchaQuery.ts`
  - `src/hooks/auth/useLoginMutation.ts`
  - `src/hooks/auth/useAuthSessionRefresh.ts`
- Services:
  - `src/service/authService.ts`
  - `src/service/authSession.ts`
- Constants:
  - `src/constants/auth.ts`
  - `src/constants/routes.ts`
- Types:
  - `src/type/auth.ts`
- Validator:
  - `src/validators/login.ts`

## 9. Perilaku Header Setelah Login

Setelah login sukses dan session tersimpan:

- Tombol `Masuk` di header berubah menjadi kartu user (avatar, nama, email).
- Kartu user memiliki dropdown dengan menu:
  - `Beranda Admin`
  - `Profil`
  - `Keluar`
- Status login/logout sinkron realtime melalui event `AUTH_SESSION_CHANGED_EVENT` dari `authSession`.
- Saat permission user berubah di backend, header akan ikut refresh setelah perpindahan route berikutnya karena data user disinkronkan ulang dari endpoint current user.

Referensi implementasi:

- `src/components/layouts/Header.tsx`
- `src/hooks/auth/useAuthSessionRefresh.ts`
- `src/service/authSession.ts`

## 10. Alur Logout dan Animasi

Saat user klik `Keluar`/`Logout`:

1. Tombol berubah ke state loading (spinner + teks proses keluar).
2. Ada delay transisi singkat (`~420ms`) agar animasi terlihat.
3. Session dibersihkan (`clearAuthSession`), menu ditutup, lalu redirect ke Home (`/`).

Behavior ini berlaku untuk:

- dropdown user desktop
- tombol logout di panel mobile
