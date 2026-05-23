# FAQ Page Documentation

## 1. Ringkasan Halaman

- Nama halaman: `FAQ`
- Route: `/faq`
- Komponen page: `src/pages/FaqPage.tsx`
- Status: `Implemented`
- Tipe akses: `Public`

Halaman ini menampilkan:

1. Hero `Pusat Bantuan`
2. Card `Topik Pilihan` (anchor ke tiap topik)
3. Daftar FAQ per topik (accordion)

## 2. Akses dan Navigasi

- Route publik, tidak memakai guard permission.
- Dapat diakses dari:
  - tombol `Lihat Semua FAQ` di `HomeFaqSection`
  - URL langsung `/faq`
- Tersedia tombol kembali ke beranda (`/`).

## 3. Data yang Ditarik

### 3.1 GET `/api/faqs`

- Hook: `useFaqTopicsQuery()`
- Query key: `["home", "faq-topics"]`
- Stale time: `10 menit`
- Service: `fetchFaqTopics()` di `src/service/homeService.ts`

Data yang dipakai UI:

- `topics[]`
  - `topic`
  - `summary` (opsional)
  - `items[]`
    - `question`
    - `answer`

## 4. Normalisasi Data di Halaman

Di `FaqPage.tsx`, data FAQ dirapikan lagi sebelum render:

- membersihkan whitespace berlebih
- mereduksi judul/teks yang terduplikasi berulang
- membersihkan pertanyaan yang berulang dalam satu topik
- menjaga item kosong tidak ikut tampil

Tujuannya agar tampilan tetap rapi meski payload API tidak konsisten.

## 5. State dan Interaksi

State utama:

- `openItems: Set<string>` untuk accordion buka/tutup per item

Interaksi:

1. Klik card `Topik Pilihan` -> scroll ke topik (`#topic-...`)
2. Klik pertanyaan -> toggle jawaban
3. Klik tombol kembali -> ke Home

## 6. Loading, Empty, Error

- `isLoading`: menampilkan skeleton pada topik pilihan dan list FAQ
- `isError`: menampilkan pesan gagal muat
- empty data: menampilkan fallback `Belum ada data FAQ yang tersedia`

## 7. Dependensi Teknis

- `react-query` untuk fetch + cache FAQ
- `framer-motion` untuk animasi reveal
- `heroicons` untuk ikon
- `Button` shared component (`src/components/ui/Button.tsx`)

## 8. File Terkait

- `src/pages/FaqPage.tsx`
- `src/components/home/HomeFaqSection.tsx`
- `src/hooks/home/useFaqTopicsQuery.ts`
- `src/service/homeService.ts`
- `src/routes/AppRoutes.tsx`
- `src/constants/routes.ts`
