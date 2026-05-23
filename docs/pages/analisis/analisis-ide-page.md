# Analisis IDE (Indeks Diplomasi Ekonomi) Page

## Lokasi

- Page: `src/pages/analisis/IdePage.tsx`
- Route: `/analisis/ide`

## Tujuan Halaman

Halaman ini menampilkan dashboard `IDE (Indeks Diplomasi Ekonomi)` melalui embed Power BI. Fokus halaman adalah menyajikan visualisasi lintas sub modul:

- Perdagangan
- Investasi
- Pariwisata
- Tenaga Kerja

Halaman ini tidak memakai filter internal tambahan. Interaksi utama dilakukan langsung pada dashboard Power BI yang di-embed.

## Struktur Halaman

Halaman terdiri dari:

1. `PageTitle`
2. tombol `Unduh Pedoman`
3. container embed Power BI

## Judul Halaman

Komponen:

- `src/components/ui/PageTitle.tsx`

Judul:

- `IDE (Indeks Diplomasi Ekonomi)`

Deskripsi:

- penjelasan singkat tentang kajian Kementerian Luar Negeri bersama Universitas Padjadjaran
- menjelaskan bahwa IDE disusun dari sub modul Perdagangan, Investasi, Pariwisata, dan Tenaga Kerja

## Tombol Pedoman

Komponen:

- `src/components/ui/Button.tsx`

Ikon:

- `ArrowDownTrayIcon`

Perilaku:

- tombol membuka file PDF pedoman di tab baru
- path file:
  - `/files/pedoman-indeks-diplomasi-ekonomi.pdf`

Sumber file:

- `public/files/pedoman-indeks-diplomasi-ekonomi.pdf`

Catatan:

- tombol dibangun memakai `Button` component, bukan anchor styling manual
- aksi file dilakukan melalui handler `window.open(...)`

## Embed Power BI

Sumber embed:

- `https://app.powerbi.com/view?...`

Implementasi:

- memakai elemen `iframe`
- iframe ditempatkan di dalam container section dengan background gelap
- `allowFullScreen` aktif
- `loading="lazy"`
- `referrerPolicy="no-referrer-when-downgrade"`

## Tinggi Embed

Halaman menghitung tinggi iframe secara dinamis agar mengikuti ruang layar yang tersedia.

Logika:

- memakai `getBoundingClientRect()` dari wrapper embed
- memakai `window.visualViewport.height` bila tersedia
- fallback ke `window.innerHeight`
- menghitung sisa tinggi viewport dari posisi top container sampai bawah layar

Aturan minimum:

- mobile: minimum `460px`
- desktop: minimum `600px`

Update tinggi dilakukan saat:

- initial render
- timeout pendek setelah render untuk antisipasi layout shift
- `resize`
- `orientationchange`

## Perilaku Responsif

Tujuan responsif embed:

- tinggi dashboard tetap pas dengan ruang layar aktif
- tidak terlalu pendek di mobile
- tidak menyisakan ruang kosong besar di desktop

Container embed memakai:

- border
- rounded corner
- background gelap
- overflow hidden

## File Terkait

- `src/pages/analisis/IdePage.tsx`
- `src/components/ui/PageTitle.tsx`
- `src/components/ui/Button.tsx`
- `public/files/pedoman-indeks-diplomasi-ekonomi.pdf`

## Catatan Implementasi

- halaman ini tidak memerlukan service/hook backend tambahan karena seluruh konten utama berasal dari embed Power BI
- jika URL Power BI berubah, cukup memperbarui konstanta `powerBiSrc` di page
- jika file pedoman berubah, cukup ganti file pada `public/files` dengan path yang sama atau perbarui path handler
