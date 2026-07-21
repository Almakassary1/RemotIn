# AGENTS.md — RemotIn

Panduan konteks untuk AI coding assistant (Claude Code, dll) yang bekerja di
repo ini. Untuk gambaran umum proyek & tech stack, lihat `README.md`.

## Bahasa & gaya kode

- **Komentar kode dan teks UI dalam Bahasa Indonesia.** Nama variabel/fungsi
  tetap Bahasa Inggris standar, tapi komentar penjelasan ("kenapa", bukan
  "apa") selalu Indonesia. Ikuti gaya ini untuk kode baru.
- Komentar di titik-titik keputusan penting SELALU menjelaskan **alasan**,
  bukan cuma mendeskripsikan kode (lihat `lib/admin-auth.ts`,
  `lib/job-utils.ts` sebagai contoh gaya yang diharapkan).

## Arsitektur & pola yang WAJIB diikuti

- **Mutasi data sensitif (insert/update ke tabel yang tidak punya RLS
  policy publik) selalu lewat `createAdminClient()`** (`utils/supabase/admin.ts`,
  service role), dipanggil dari Server Action SETELAH validasi lolos —
  bukan dengan membuka RLS policy publik. Pola ini dipakai konsisten di
  upload logo perusahaan, insert job dari admin panel, dan
  `lib/company-service.ts`.
- **Halaman publik yang menampilkan status login user harus dites dulu
  dampaknya ke ISR/caching.** `app/layout.tsx` memanggil `cookies()` lewat
  `supabase.auth.getUser()`, yang membuat SELURUH situs dynamic-render
  (lihat catatan di `app/page.tsx`). Ini keputusan yang sudah diambil
  secara sadar, jangan diubah tanpa mempertimbangkan trade-off-nya.
- **Filter & pencarian loker (homepage, `/kategori/[slug]`) berjalan
  server-side, digerakkan oleh URL query params** — lihat `lib/job-query.ts`.
  Jangan kembalikan ke pola fetch-semua-lalu-filter-di-client.
- **Data yang di-inject lewat `dangerouslySetInnerHTML` (JSON-LD, dll)
  WAJIB di-escape** pakai `safeJsonLd()` dari `lib/job-utils.ts` — JANGAN
  `JSON.stringify()` polos, itu tidak meng-escape `</script>` dan jadi
  celah XSS.
- **Upload logo perusahaan cuma menerima PNG/JPG/WEBP.** SVG sengaja tidak
  diizinkan (risiko stored XSS lewat `<script>` di dalam SVG) — jangan
  ditambahkan kembali tanpa sanitasi yang proper.

## Environment variables

Lihat `.env.local` (tidak di-commit) untuk daftar lengkap. Yang perlu
diperhatikan khusus:
- **`ADMIN_SESSION_SECRET`** — kunci HMAC untuk cookie sesi admin. **WAJIB
  beda nilainya** antara `.env.local` (lokal) dan environment variable di
  Vercel (production). Jangan pernah disamakan.
- **`ADMIN_PASSWORD`** — password login admin, terpisah dari
  `ADMIN_SESSION_SECRET` di atas. Dibandingkan pakai `timingSafeEqual`,
  jangan diganti ke `===` biasa.

## Database (Supabase, project `nteatwvbkgbtkyasrhyh`)

- Tabel utama: `jobs`, `categories`, `companies`, `payments`,
  `newsletter_subscribers`, `saved_jobs`.
- `companies` dipisah dari `jobs.company_name` (migrasi
  `add_companies_table`) — tiap loker baru otomatis ter-link ke
  `companies` lewat `upsertCompany()` di `lib/company-service.ts`. Jangan
  insert ke `jobs` tanpa memanggil helper ini duluan.
- RLS aktif di semua tabel publik. Tabel `companies` cuma punya policy
  SELECT publik — semua insert/update lewat service role.

## Command yang sering dipakai

```
npm run dev      # development server
npm run build    # production build — WAJIB dijalankan sebelum commit
                  # perubahan besar, tsc --noEmit saja tidak cukup untuk
                  # menangkap error konfigurasi Next.js (next.config.ts,
                  # route baru, dst)
npx tsc --noEmit  # type-check cepat
npm run lint      # eslint
```

## Hal spesifik lingkungan Windows (kalau relevan)

- Nama folder yang mengandung tanda kurung siku (`[slug]`, `[id]`, dst)
  kadang tidak terdeteksi dengan benar oleh `git status` di PowerShell
  kalau folder itu di-rename lewat File Explorer. Kalau kejadian, hapus
  folder via terminal dan buat ulang dari nol (`Remove-Item` +
  `New-Item`), bukan lewat rename di Explorer.
- Build lokal butuh akses internet ke `fonts.googleapis.com` (dipakai
  `next/font/google` di `app/layout.tsx`) — kalau build gagal spesifik di
  langkah font, itu soal jaringan, bukan bug kode.
