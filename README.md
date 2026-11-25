# Sistem Monitoring Satwa Liar — Frontend

README ini adalah dokumentasi utama repository `wildlife-tracking-frontend`. Isinya disusun dari audit langsung terhadap kode sumber frontend, konfigurasi, rute, hook, service, tipe, komponen, dan integrasi API yang ada. Dokumen lama yang menyebut AI belum memiliki UI, logout tidak mencabut token, atau validasi sesi hanya membaca cookie sudah tidak sesuai dengan kode saat ini.

**Audit terakhir:** 21 November 2026.

## Daftar isi

- [Pembaruan 26 November 2026 (lanjutan 4): panduan pengguna interaktif (`/manual`, Normal & Peak Mode)](#pembaruan-26-november-2026-lanjutan-4-panduan-pengguna-interaktif-manual-normal--peak-mode)
- [Pembaruan 26 November 2026 (lanjutan 3): notifikasi semua role (no-show), dark/light mode & bahasa ID/EN](#pembaruan-26-november-2026-lanjutan-3-notifikasi-semua-role-no-show-darklight-mode--bahasa-iden)
- [Pembaruan 26 November 2026 (lanjutan 2): peta 3D kualitas tinggi & simulator pembayaran otomatis](#pembaruan-26-november-2026-lanjutan-2-peta-3d-kualitas-tinggi--simulator-pembayaran-otomatis)
- [Pembaruan 26 November 2026 (lanjutan): perbaikan pesan error login & audit](#pembaruan-26-november-2026-lanjutan-perbaikan-pesan-error-login--audit)
- [Pembaruan 26 November 2026: satwa 3D, perbaikan bug & risiko](#pembaruan-26-november-2026-satwa-3d-perbaikan-bug--risiko)
- [Pembaruan 25 November 2026: POS loket & peta 3D](#pembaruan-25-november-2026-pos-loket--peta-3d)
- [Pembaruan 24 November 2026: modul wisata & role pengunjung](#pembaruan-24-november-2026-modul-wisata--role-pengunjung)
- [Pembaruan 24 November 2026: semua endpoint backend](#pembaruan-24-november-2026-semua-endpoint-backend)
- [1. Ringkasan aplikasi](#1-ringkasan-aplikasi)
- [2. Status implementasi](#2-status-implementasi)
- [3. Tumpukan teknologi](#3-tumpukan-teknologi)
- [4. Arsitektur frontend](#4-arsitektur-frontend)
- [5. Routing dan fitur](#5-routing-dan-fitur)
- [6. Integrasi backend](#6-integrasi-backend)
- [7. Integrasi AI](#7-integrasi-ai)
- [8. UI, validasi, dan pengalaman pengguna](#8-ui-validasi-dan-pengalaman-pengguna)
- [9. Instalasi dan pengembangan](#9-instalasi-dan-pengembangan)
- [10. Pemeliharaan dan konvensi](#10-pemeliharaan-dan-konvensi)
- [11. Keterbatasan dan pekerjaan berikutnya](#11-keterbatasan-dan-pekerjaan-berikutnya)
- [12. Referensi](#12-referensi)

---

## Pembaruan 26 November 2026 (lanjutan 4): panduan pengguna interaktif (`/manual`, Normal & Peak Mode)

- **Menu Panduan Pengguna (`/manual`, semua 6 role)**: berisi 6 bab lengkap (sistem & role, pelacakan & insiden, analisis AI, wisata & pembayaran otomatis, POS loket & check-in, ensiklopedia satwa 3D & bantuan cepat) dalam Bahasa Indonesia & Inggris serta mendukung Dark/Light mode.
- **Normal Mode**: tata letak dokumentasi standar dengan daftar isi sticky, pencarian topik, langkah bernomor, dan tautan langsung ke fitur terkait.
- **Peak Mode**: pengalaman interaktif 3D per bab — panggung halaman penuh 3D berlapis (Bab 01), lembaran bab 3D dua sisi yang dapat diputar 360° (Bab 02), karusel silinder 3D AI berputar (Bab 03), gunung 3D Gunung Leuser yang terus berputar dengan 4 pin POI berisi papan kanvas 3D (`CanvasTexture`) langsung di sisi gunung (Bab 04), dek kartu taktil 3D (Bab 05), dan tata surya 3D dengan 4 planet mengorbit berisi papan kanvas 3D langsung di tiap planet yang dapat di-zoom penuh (Bab 06).
- **Drunk Mode / Mode Mabuk (`lib/drunk-mode.ts`, `lib/drunk-audio.ts`, `components/navigation/main/drunk-mode-toggle.tsx`, `components/navigation/main/drunk-effects-engine.tsx`)**: tombol pengubah di samping Night Mode pada header setelah login; menghadirkan efek optik sinematik (ayunan kamera `rAF` + inersia kursor, diplopia, *analog color grading*, header & panel 3D, judul berputar 3D, teks kabur di `#main-content` pada desktop dengan proteksi *coarse-pointer* mobile, *lagging ghost cursor*, pilihan intensitas `Tipsy`/`Drunk`/`Heavy`, serta efek guyuran air dingin + suara Web Audio API yang dapat di-mute saat klik `Sadar Sekarang`), sementara menu Sidebar tetap stabil dan seluruh modul transaksi (`/pos`, `/bookings`, `/tourism/bookings`, `/tourism/payments`, `/tourism/check-in`, `/tourism/prices`, `/tours/*/book`) otomatis menjeda Drunk Mode.
- **Aksesibilitas & Asisten Suara AI (`lib/voice-assistant.ts`, `components/accessibility/voice-a11y-widget.tsx`)**: tombol simbol disabilitas mengambang di kiri bawah (`Alt+A` panel, `Alt+V` mikrofon) dengan pengenalan suara (*Web Speech API*) + kolom perintah teks, umpan balik bicara (*SpeechSynthesis*) dengan pilihan model suara & kecepatan bicara (`0.5×`–`2.0×`), navigasi & eksekusi perintah di halaman (buka menu, bacakan halaman, gulir, klik tombol, isi input), serta bantuan visual (*A 100%/115%/130%*, *Kontras Tinggi*, *Spasi Lega*).

---

## Pembaruan 26 November 2026 (lanjutan 3): notifikasi semua role (no-show), dark/light mode & bahasa ID/EN

- **Notifikasi untuk seluruh 6 role (`lib/navigation.ts`, `app/(protected)/notifications/page.tsx`)**: menu Notifikasi dipindahkan ke bagian Akun agar semua role (`administrator_sistem`, `peneliti_ekologi`, `konservasionis_lapangan`, `pengambil_kebijakan`, `petugas_loket`, `pengunjung`) dapat mengaksesnya, sementara chip filter dan isi notifikasi dibatasi ketat sesuai role (pengunjung & petugas loket hanya melihat notifikasi `Sistem`; peringatan zona risiko dan perangkat tidak pernah tampil/no-show).
- **Mode Gelap & Terang (`app/layout.tsx`, `app/globals.css`, `components/navigation/main/theme-toggle.tsx`)**: mendukung `color-scheme: light dark` dengan tombol pengubah di header yang menyimpan preferensi di `localStorage` tanpa FOUC dan otomatis kembali ke preferensi sistem bila disamakan.
- **Pilihan Bahasa `ID` / `EN` (`lib/i18n.ts`, `lib/auto-translate.ts`, `components/providers/preferences-provider.tsx`)**: tombol pengubah bahasa di header serta halaman login/register menerjemahkan navigasi, role, breadcrumb, label status, form, tabel, notifikasi, peta 3D, dan modal secara penuh saat mode `EN` aktif, dan mengembalikan teks asli Indonesia 100% saat mode `ID` aktif.
- **Perbaikan basemap Peta Jalan (`components/tourism/route-map-3d.tsx`)**: default tab **Peta** diganti dari CARTO Voyager (yang mewajibkan API key) ke **Esri World Street Map** (gratis tanpa watermark).

---

## Pembaruan 26 November 2026 (lanjutan 2): peta 3D kualitas tinggi & simulator pembayaran otomatis

- **Peta & Rute 3D (`components/tourism/route-map-3d.tsx`)**:
  - **3 mode basemap gratis tanpa API key**: **Satelit Hybrid** (Esri World Imagery + overlay batas wilayah, nama tempat & jalan yang dapat di-toggle), **Topografi** (OpenTopoMap dengan garis kontur & jalur), dan **Peta Jalan** (CARTO Voyager `@2x`). Semua tetap dapat dioverride lewat env `NEXT_PUBLIC_MAP_*`.
  - **Kontrol & HUD 3D**: proyeksi globe pada zoom jauh, atmosfer langit, kontrol geolokasi, pilihan skala relief (`1×`, `1.8×`, `2.5×`), tombol reset kamera, penanda titik Mulai & Puncak (mdpl) saat rute dipilih, serta HUD koordinat & elevasi real-time saat kursor digerakkan.
  - **Fly-through interaktif**: tombol jeda/lanjut, kecepatan `1×` / `2×`, jarak tempuh (`km`), dan elevasi (`mdpl`).
- **Simulator Payment Gateway Otomatis (`components/tourism/payment-simulator-modal.tsx`, `app/(protected)/bookings/[code]/page.tsx`)**:
  - Ketika `PAYMENT_SIMULATOR_ENABLED=true` di backend, halaman detail pemesanan menampilkan kartu **Bayar Instan & Verifikasi Otomatis** dengan modal checkout realistis (**QRIS Instan** dengan QR yang di-generate di browser, **Virtual Account** BCA/BNI/BRI/Mandiri dengan tombol salin, dan **E-Wallet** GoPay/OVO/DANA/ShopeePay).
  - Pembayaran simulasi memanggil `POST /visitor/bookings/{code}/simulate-payment`, langsung memverifikasi status ke `paid`, dan menerbitkan e-tiket QR tanpa antrean verifikasi manual petugas.
- **Hasil uji**: `npx tsc --noEmit` (0 error), `npm run lint` (0 error, 1 peringatan bawaan TanStack Table), `npm run build` lulus.

---

## Pembaruan 26 November 2026 (lanjutan): perbaikan pesan error login & audit

- **Perbaikan pesan error login (`hooks/use-login.ts`)**: menghapus penggabungan `formatApiMessage` yang membuat pesan error login tertulis ganda (`"...salah. email: Email atau password salah."`). Sekarang hanya pesan utama (atau error field pertama bila pesan utama kosong) yang ditampilkan di form dan toast.
- **Hasil uji & audit**:
  - `npx tsc --noEmit`: 0 error.
  - `npm run lint`: 0 error, 1 peringatan bawaan TanStack Table di `components/data-table/data-table.tsx` (React Compiler, bukan bug).
  - `npm run build`: lulus (56 halaman statis + seluruh rute dinamis).
  - `npm audit --omit=dev`: 3 kerentanan (1 high pada `zod`, 2 critical pada `maplibre-gl` dan `next` yang membutuhkan pembaruan versi mayor/minor terencana; tidak dilakukan upgrade otomatis agar tidak memecah kompatibilitas).

---

## Pembaruan 26 November 2026: satwa 3D, perbaikan bug & risiko

### Penting setelah `git pull`

Jalankan `npm install` setiap kali ada paket baru. Paket baru rilis ini: `@google/model-viewer` dan `three`; rilis sebelumnya: `qrcode` dan `maplibre-gl`.

Mulai rilis ini, `npm run dev` dan `npm run build` otomatis menjalankan `scripts/check-deps.mjs`. Bila paket belum terpasang atau versinya tidak cocok dengan `package-lock.json`, muncul pesan "Jalankan: npm install". Sebelumnya yang muncul error "Module not found: Can't resolve 'qrcode'".

### Ensiklopedia satwa 3D (`/wildlife-3d`)

Menu "Satwa 3D" terlihat oleh peneliti, konservasionis, pengambil kebijakan, admin, pengunjung, dan petugas loket.

- **Daftar**: kartu tiap satwa dengan pratinjau 3D, status IUCN (CR/EN/VU…), dan taksonomi. Bisa dicari berdasarkan nama, nama ilmiah, atau nama daerah, dan disaring per kelompok (mamalia/burung/…).
- **Detail** (`/wildlife-3d/[id]`):
  - Model 3D bisa diputar (seret), diperbesar (scroll/cubit), digeser, diputar otomatis, dan dibuka layar penuh. Ada tombol AR di ponsel yang mendukung WebXR.
  - **Titik keterangan bernomor** di tubuh satwa; klik untuk mengarahkan kamera ke ciri tersebut.
  - Ukuran, umur, pola aktivitas, populasi, dan status perlindungan.
  - Bagian ciri-ciri, perilaku, makanan, habitat & sebaran, ancaman, dan fakta menarik.
- **Kelola** (khusus `manage_master_data`: peneliti & admin):
  - Unggah/ganti model `.glb` (hasil pemindaian atau model berlisensi) beserta kreditnya.
  - Tambah titik keterangan dengan **mengklik langsung bagian tubuh pada model**.
  - Ubah seluruh profil, dan sembunyikan satwa dari publik bila perlu.
- **Model bawaan**: 8 model **ilustratif** (low-poly) yang dibuat sistem, bukan hasil pemindaian, dan diberi label begitu di halaman. Ganti dengan model asli bila ada.
- **Keamanan**:
  - Lokasi individu satwa tidak pernah ditampilkan (risiko perburuan).
  - Model dimuat lewat proxy sebagai blob.
  - Backend menolak GLB yang merujuk URL eksternal.
- **File**: `components/wildlife/*` (viewer `<model-viewer>`, badge IUCN), `services/wildlife.service.ts`, `hooks/use-wildlife.ts`, `types/wildlife.type.ts`, `types/model-viewer.d.ts`.

### Bug yang ditemukan & diperbaiki

Seluruh 69 halaman di-crawl otomatis untuk keenam role.

| Bug | Perbaikan |
|---|---|
| Halaman **Riwayat Sesi Kas** (`/pos/sessions`) crash: "Cannot read properties of undefined (reading 'transactions')" | Backend mengirim `summary` di daftar sesi |
| Breadcrumb di halaman detail/edit menautkan ke `/species/1`, `/users/3`, dst. yang tidak ada (prefetch 404; diklik → halaman 404) | Segmen ID tidak lagi menjadi tautan |
| Sesi habis (idle 2 jam) membuat semua halaman menampilkan error 401 tanpa jalan keluar | `QueryProvider` menangani 401 secara global: hapus sesi, lalu ke `/login?reason=expired` |
| Error 4xx (validasi/izin/404) ikut dicoba ulang | Hanya error jaringan/5xx yang dicoba ulang |
| Status insiden bisa diisi teks bebas | Pilihan baku: Menunggu, Diselidiki, Selesai, Ditolak (divalidasi backend) |
| Petugas loket tidak punya menu Profil (tidak bisa ganti password) | Ditambahkan |
| `useMemo` di halaman satwa, perangkat, insiden, dan peta live dihitung ulang setiap render | Data dibungkus `useMemo`; ref cleanup peta diperbaiki |

### Risiko yang ditutup

- **Pendaftaran**:
  - Soal keamanan (CAPTCHA hitungan dari server, sekali pakai) dengan tombol "Ganti soal".
  - Field honeypot tersembunyi.
  - Soal baru otomatis setelah gagal.
- **Rate limit per pengunjung**: server action meneruskan IP pengunjung (`X-Forwarded-For`). Backend hanya memercayainya bila `TRUSTED_PROXIES` diisi IP server FE.
- **Pembayaran online Midtrans**: tombol "Bayar online sekarang" di halaman pesanan. Tombol hanya muncul bila backend mengisi `MIDTRANS_SERVER_KEY`, dan hanya mengarahkan ke domain `*.midtrans.com`.
- **Token perangkat** di detail perangkat (`/devices/[id]/detail`, khusus `manage_master_data`):
  - Buat, salin (sekali tampil), dan cabut token untuk kamera jebak/perekam/kalung GPS.
  - Token tidak kedaluwarsa karena idle dan hanya bisa mengirim data perangkat itu.
- **Tile peta 3D bisa diganti lewat env**: `NEXT_PUBLIC_MAP_SATELLITE_URL`, `NEXT_PUBLIC_MAP_SATELLITE_ATTRIBUTION`, `NEXT_PUBLIC_MAP_STREET_URL`, `NEXT_PUBLIC_MAP_TERRAIN_URL`. Isi dengan URL penyedia berlisensi (mis. MapTiler/Stadia dengan key) untuk trafik publik besar.

### Hasil uji

- `tsc` dan `next build` lulus.
- `eslint`: 0 error. Sisa 1 peringatan berasal dari library TanStack Table yang tidak kompatibel dengan React Compiler (bukan bug).
- Backend: 130/130 test.
- Uji browser:
  - **Daftar akun**: CAPTCHA salah ditolak, soal berganti, lalu berhasil daftar.
  - **Ensiklopedia sebagai pengunjung**: 8 satwa tampil, ke detail, klik titik keterangan; panel kelola tidak terlihat.
  - **Peneliti**: unggah GLB, lalu klik pada model menghasilkan titik dan tersimpan.
  - **Konservasionis**: hanya bisa melihat.
  - **Token dicabut**: halaman berikutnya langsung diarahkan ke login.

### Masih di luar jangkauan kode

- **Model 3D asli**: perlu hasil pemindaian (fotogrametri) atau model berlisensi; sumber model terbuka untuk satwa Sumatra tidak tersedia.
- **POS offline & printer ESC/POS** butuh perangkat keras dan desain sinkronisasi kuota. Untuk saat ini cetak lewat browser; Chrome `--kiosk-printing` membuat struk tercetak dengan satu klik.
- **Midtrans**: kode sudah siap, tetapi butuh akun merchant dan uji sandbox dengan kunci asli.

---

## Pembaruan 25 November 2026: POS loket & peta 3D

Lanjutan "Next Plan": **POS (Point of Sales)** untuk penjualan tiket walk-in di loket dan **peta & rute 3D**. Backend: `wildlife-tracking-backend` commit `df3cbcc` (POS), `8abd0f9` (zona waktu WIB), `08818b9` (rate limit).

### POS loket

| Rute | Untuk | Isi | Endpoint |
|---|---|---|---|
| `/pos` | kasir (`sell_tickets`) | Buka sesi kas → pilih rute, tanggal (7 hari), shift (hanya yang masih bisa dijual), jumlah WNI/pelajar/WNA/drone, nama pembeli → total dari server → bayar Tunai (tombol uang pas/pecahan, kembalian otomatis), QRIS, atau EDC (no. referensi) → struk + tiket QR. Opsi "langsung check-in" untuk kunjungan hari ini. Panel samping: ringkasan sesi, kas di laci, cetak ulang, void (wajib alasan), laporan X, tutup kas | `/pos/session*`, `/pos/sales*`, `/tourism/schedule`, `/tourism/quote` |
| `/pos/sessions`, `/pos/sessions/[id]` | kasir (miliknya) / admin (semua) | Riwayat sesi, selisih kas, daftar transaksi, cetak laporan X/Z | `/pos/sessions*` |
| `/pos/report` | pengelola (`manage_tourism`) | Laporan harian online + loket: total, **PNBP vs jasa pemandu**, per metode, per kanal, per sesi kasir; cetak A4 | `GET /pos/report` |

- **Role baru `petugas_loket`** (`sell_tickets` + `validate_tickets`). Akun contoh: `loket@wildlife.id` / `password123`. Menu "Loket" berisi Kasir, Check-in Tiket, Riwayat Sesi Kas, dan Laporan Harian (khusus admin).
- **Struk thermal 58/80 mm.** Struk dan laporan dibuat sebagai dokumen HTML tersendiri (`components/pos/receipt-html.ts`) dan dicetak dari iframe `sandbox`, sehingga ukuran kertas tidak bentrok dengan `@page` A4 aplikasi. Semua teks di-escape dan iframe tidak menjalankan skrip. Lebar kertas dipilih di halaman kasir dan disimpan per komputer (localStorage).
- **"Hari ini" mengikuti WIB**, bukan zona waktu komputer kasir (`app/(protected)/pos/utils.ts`), sama dengan backend (`TOURISM_TIMEZONE`). Shift masih bisa dijual sampai 30 menit setelah jam mulai.
- Struk memuat porsi PNBP (PP 36/2024) agar mudah direkonsiliasi dengan setoran kas negara.

### Peta & rute 3D

| Rute | Isi |
|---|---|
| `/tours/map-3d` (menu "Peta 3D") | Relief 3D kawasan (data elevasi) + citra satelit/peta. Semua jalur tur berwarna, label titik kumpul, klik rute untuk detail + profil ketinggian. **Fly-through**: kamera terbang mengikuti jalur sambil menampilkan ketinggian saat itu |
| `/tours/[slug]` | Tombol 2D/3D di bagian "Peta jalur & titik kumpul" |

- **Library**: `maplibre-gl@5.19.0` (WebGL, open source). Komponen `components/tourism/route-map-3d.tsx` dimuat dengan `next/dynamic` (`ssr: false`) dan tidak masuk barrel, jadi halaman lain tidak ikut memuatnya.
- **Data**: memakai `waypoints` rute dari backend (`[lat, lon, ketinggian]`). Admin bisa menambah titik lewat `/tourism/routes/[id]/edit` agar jalur makin detail.
- **Sumber tile** (tanpa API key, diunduh langsung oleh browser pengguna):
  - Elevasi: Mapzen Terrain Tiles di AWS Open Data.
  - Citra satelit: Esri World Imagery.
  - Peta: OpenStreetMap.
  - Atribusi tampil di pojok peta.
- **Mode cadangan**: jika WebGL tidak tersedia, muncul pesan dan pengguna diarahkan ke peta 2D. Jika tile gagal dimuat (offline), jalur dan titik kumpul tetap tampil dengan peringatan.

### Hasil uji

- `tsc`, `eslint` (tanpa error baru), dan `next build` lulus.
- Backend: `php artisan test` 110/110 (termasuk `PosTest` 8).
- Uji browser (Playwright) terhadap backend lokal:
  - **Kasir**: buka sesi → jual 3 orang tunai (kembalian benar) → struk → jual QRIS → void → tutup kas dengan selisih → laporan Z.
  - **Akses**: kasir ditolak di `/pos/report`.
  - **Admin**: membuka laporan harian.
  - **Pengunjung**: peta 3D, pilih rute, fly-through, dan mode 3D di detail rute.
  - Sandbox tidak bisa mengakses server tile, jadi uji peta memakai tile elevasi/citra sintetis. Di laptop dengan internet, tile asli dimuat.

### Masih dikembangkan / risiko

- **Printer**: cetak lewat dialog print browser. Untuk satu klik, jadikan printer thermal default dan jalankan Chrome dengan `--kiosk-printing`. ESC/POS langsung (laci kas otomatis) belum ada.
- **Offline**: loket butuh koneksi ke server. Belum ada mode offline.
- **Lisensi & privasi tile**: Esri World Imagery dan tile OSM punya kebijakan penggunaan wajar. Untuk trafik publik besar, pakai penyedia berlisensi (MapTiler/Stadia dengan API key) atau tile sendiri. Browser pengunjung menghubungi server tile pihak ketiga, sehingga IP-nya terlihat oleh mereka.
- **Akurasi jalur 3D**: elevasi global beresolusi ±30–90 m, dan waypoint contoh hanya 4–5 titik per rute. Garis peta bukan panduan navigasi.
- **Model 3D satwa** (bagian "User: 3D model" di Next Plan) belum dikerjakan.

---

## Pembaruan 24 November 2026: modul wisata & role pengunjung

Frontend untuk modul wisata di backend (`9ee3dd5`, tabel `tour_routes`, `tour_guides`, `guide_shifts`, `bookings`, `payments`, `tour_reviews`). Struktur dan komponen mengikuti konvensi repo ini (lihat bagian berikutnya).

### Role dan izin

| Role | Izin wisata | Menu yang tampil |
|---|---|---|
| `pengunjung` (baru) | `book_tickets` | Jelajah Tur, Jadwal Pemandu, Pesanan Saya, Profil. Tidak melihat data konservasi. |
| `konservasionis_lapangan` | + `validate_tickets` | Check-in Tiket |
| `administrator_sistem` | semua (`*`) | Seluruh menu "Kelola Wisata" |

`types/auth.type.ts` memuat role dan izin baru; `lib/navigation.ts` kini menerima izin berupa array (cukup salah satu), sehingga menu Profil terbuka untuk pengunjung. Halaman yang bukan haknya tampil "Akses ditolak", dan backend tetap membalas 403.

### Halaman

| Rute | Untuk | Isi | Endpoint |
|---|---|---|---|
| `/register` (publik) | calon pengunjung | Daftar akun, langsung masuk. Role selalu `pengunjung` (ditentukan server). Ada link dari halaman login. | `POST /register` |
| `/tours` | pengunjung | Katalog rute + tabel tarif PNBP | `GET /tourism/routes`, `/tourism/prices` |
| `/tours/[slug]` | pengunjung | Itinerary, peta jalur & titik kumpul (Leaflet), profil ketinggian, satwa, paket, barang bawaan, aturan, shift terdekat, ulasan | `GET /tourism/routes/{slug}` |
| `/tours/[slug]/book` | pengunjung | Pilih shift, jumlah WNI/pelajar/WNA/drone, nama peserta, kontak darurat, metode bayar, rincian harga langsung dari server | `POST /tourism/quote`, `POST /visitor/bookings` |
| `/guides`, `/guides/[id]` | pengunjung | Siapa bertugas per tanggal & shift, sisa kuota, satwa favorit + alasan, fun fact, bahasa, sertifikasi, rating | `GET /tourism/schedule`, `/tourism/guides`, `/tourism/guides/{id}` |
| `/bookings`, `/bookings/[code]` | pengunjung | Hitung mundur batas bayar, rekening tujuan, unggah bukti, batal, e-tiket QR (+cetak), checklist bawaan, ulasan setelah check-in | `/visitor/bookings*`, `/tourism/payment-info` |
| `/tourism/check-in` | petugas loket | Ketik atau pindai QR (kamera, `BarcodeDetector`), daftar kunjungan hari ini | `POST /tourism/check-in`, `GET /tourism/check-in/today` |
| `/tourism/bookings`, `/tourism/bookings/[code]` | admin | Filter status/tanggal/kode, pendapatan lunas, detail peserta & pembayaran, batal/refund | `/tourism/admin/bookings*` |
| `/tourism/payments` | admin | Pratinjau bukti (gambar/PDF), terima → tiket terbit, tolak dengan alasan | `/tourism/admin/payments*` |
| `/tourism/routes` (+ `create`, `[id]/edit`) | admin | CRUD rute, itinerary, waypoint | `/tourism/admin/routes*` |
| `/tourism/guides` | admin | CRUD pemandu + unggah foto | `/tourism/admin/guides*` |
| `/tourism/shifts` | admin | CRUD shift, batalkan shift | `/tourism/admin/shifts*` |
| `/tourism/prices` | admin | Ubah tarif, kelola hari libur nasional | `/tourism/admin/prices`, `/holidays` |
| `/tourism/reviews` | admin | Tampilkan/sembunyikan ulasan | `/tourism/admin/reviews*` |

File baru: `types/tourism.type.ts`, `services/tourism.service.ts` (`TOURISM_CATALOG_SERVICE`, `VISITOR_BOOKING_SERVICE`, `TICKET_CHECK_IN_SERVICE`, `TOURISM_ADMIN_SERVICE`), `hooks/use-tourism.ts`, `hooks/use-register.ts`, `components/tourism/*` (badge status, rating, avatar pemandu, QR, hitung mundur, peta rute). Dependensi baru: `qrcode` (QR dibuat di browser, payload tidak dikirim ke layanan luar).

### Tarif (PP 36/2024, TN Gunung Leuser kelas III)

| Kategori | Senin–Sabtu | Minggu/libur |
|---|---|---|
| WNI | Rp10.000 | Rp15.000 |
| Pelajar/mahasiswa (min. 5 orang) | Rp5.000 | Rp7.500 |
| WNA | Rp150.000 | Rp150.000 |
| Drone | Rp2.000.000/unit/hari | Rp2.000.000/unit/hari |

Tiket masuk dikalikan jumlah hari tur, lalu ditambah jasa pemandu per orang sesuai rute. Frontend hanya menampilkan harga; total selalu dihitung backend.

### Keamanan di sisi frontend

- Token tetap di cookie httpOnly. Semua panggilan lewat server action proxy, termasuk registrasi.
- Role tidak dikirim saat registrasi. Validasi zod di klien hanya untuk UX; aturan sebenarnya ada di backend.
- Bukti bayar dibatasi JPG/PNG/WEBP/PDF maksimal 5 MB, dicek sebelum diunggah. Bukti dibuka sebagai blob privat (`no-store`).
- Ulasan dirender sebagai teks (React escape) dan tag HTML juga dibuang di server. Nama pengulas disingkat oleh backend.
- Profil publik pemandu tidak memuat kontak pribadi.
- E-tiket memakai token HMAC dari backend. Uji end-to-end memastikan QR palsu ditolak dan tiket tidak bisa dipakai dua kali.

### Hasil uji (lokal, backend `migrate:fresh --seed`)

Alur yang diuji dengan Playwright:

1. Daftar akun pengunjung, lalu lihat katalog, detail rute, dan jadwal pemandu.
2. Pesan 1 WNI + 1 WNA. Harga dari server: Rp10.000 + Rp150.000 + 2 × Rp400.000 = Rp960.000.
3. Unggah bukti bayar.
4. Admin memverifikasi pembayaran, lalu e-tiket QR terbit.
5. Petugas lapangan check-in: QR palsu ditolak, tiket dipakai ulang ditolak.
6. Pengunjung menulis ulasan, dan tag `<script>` terbuang.

Selain itu, pengunjung yang membuka `/dashboard` atau `/tourism/*` mendapat "Akses ditolak", dan backend membalas 403. `tsc`, `eslint` (tanpa error baru) dan `next build` lulus.

### Masih dikembangkan

- **Payment gateway otomatis**: backend sudah punya webhook HMAC, tetapi belum ada integrasi penyedia (Midtrans/Xendit). Saat ini bayar manual lewat transfer/QRIS lalu diverifikasi petugas. Rekening tujuan diisi lewat `.env` backend (`TOURISM_BANK_*`).
- **Refund**: hanya ditandai di sistem; pengembalian dana dilakukan manual.
- **Peta 3D, model 3D satwa, dan POS loket** sesuai "Next Plan": belum dikerjakan. Peta saat ini Leaflet 2D ditambah profil ketinggian dari waypoint.
- **Pemindaian QR kamera** butuh browser dengan `BarcodeDetector` (Chrome/Edge/Android). Di browser lain, ketik isi QR.
- **Data contoh**: rute, pemandu, shift, dan hari libur tanggal tetap. Hari libur bertanggal bergerak (Idul Fitri, Waisak, dsb.) ditambahkan admin di `/tourism/prices`.

---

## Pembaruan 24 November 2026: semua endpoint backend

Seluruh fitur backend (`wildlife-tracking-backend`) kini punya halaman, ditulis mengikuti struktur dan komponen repo ini:

- **Halaman**: logika di `app/(protected)/<modul>/page.tsx`. Bila izin dicek di server, `page.tsx` membaca sesi lalu merender `index.tsx`. Kolom tabel di `column.tsx`, filter di `filter.tsx`, form bersama di `form.tsx`, komponen khusus halaman di folder yang sama.
- **Komponen**: hanya dari barrel `@/components/button`, `/form`, `/data-table`, `/filter`, `/popup-confirmation`, `/status`, `/toast`, dan `@/components/ui/*`.
- **Data**: `services/<domain>.service.ts` → `hooks/use-<domain>.ts` → `types/<domain>.type.ts`; modul baru memakai gaya `X_SERVICE.GET_ALL / CREATE / UPDATE / DELETE` dan `TYPE_X`.
- **Menu**: `lib/navigation.ts` menyaring menu memakai `roleHasPermission` (tabel izin backend di `types/auth.type.ts`); halaman tambah/ubah memakai izin yang lebih ketat.

### Halaman baru dan yang diperluas

| Halaman | Endpoint backend | Izin |
| --- | --- | --- |
| `/ai/vision`: zona, perangkat, waktu pengambilan; hasil diperbarui otomatis saat antre; kotak deteksi, **wajah staf vs "Tidak dikenal"** (klik detik untuk lompat di video), **suara dalam video**, individu satwa, kondisi & perilaku, ancaman, analisis ulang, hapus | `POST /ai/upload`, `GET /ai-predictions/{id}`, `POST .../retry`, `DELETE /ai-predictions/{id}` | `upload_media`; hapus `delete_data` |
| Verifikasi: spesies opsional saat menolak/audio, pilih individu satwa | `POST /ai-predictions/{id}/verify` | `verify_ai` |
| Riwayat & antrean verifikasi: ikon video/audio, ancaman, filter ancaman & jenis | `GET /ai-predictions`, `/pending-verification` | `view_data` |
| `/ai/threats` Ancaman | `GET /ai/threats` | `view_data` |
| `/ai/recap` **Rekap Data AI** + Unduh PDF (cetak A4) | `GET /ai/recap` | `view_data` |
| `/ai/media` Media unggahan | `GET/DELETE /media-uploads`, `POST /media-uploads/{id}/predictions` | lihat semua; hapus `delete_data` |
| `/ai/staff-faces` Galeri wajah staf | `/staff-faces` | `manage_users` |
| Detail satwa: foto referensi re-identifikasi, observasi AI, kunjungan zona, insiden | `/animals/{id}/reference-photos`, `/ai-observations`, `/zone-visits`, `/incidents` | tambah foto `manage_master_data` |
| Detail perangkat: status, kondisi, telemetri, pasang/lepas kalung, titik GPS manual, rekaman kamera/perekam | `PATCH /devices/{id}/...`, `/devices/{id}/captures`, `POST /gps-readings` | `manage_master_data` / `create_data` |
| Ubah insiden: lampiran (+ analisis AI), status sinkron | `/incidents/{id}/media`, `PATCH /incidents/{id}/sync-status` | `create_data`; sinkron `delete_data` |
| Zona: cek koordinat, isi zona (satwa, perangkat, kunjungan) | `/geo-zones/locate`, `/geo-zones/{id}/animals`, `/devices`, `/visits` | `view_data` |
| `/zone-visits` (+ `/create`) Kunjungan zona | `/animal-geo-zone-visits` | catat `create_data` |
| `/weather` Cuaca + sinkron Open-Meteo | `/weather-data`, `POST /weather-data/sync` | sinkron `create_data` |
| `/reports` Laporan agregat | `/aggregate-reports` | `view_reports`; hapus `delete_data` |
| `/exports` Ekspor CSV/GeoJSON | `GET /export/*` | `export_data` |
| `/users` (+ `create`, `[id]/edit`, `[id]/detail`) Pengguna, sesi, aktivitas | `/users`, `/users/{id}/status`, `/tokens`, `/activity` | `manage_users` |
| `/roles` Matriks role × izin | `/roles`, `/permissions` | `manage_roles` |
| `/activity-logs` Log aktivitas | `/activity-logs`, `/export/activity-logs/csv` | `manage_users` |
| `/profile` Profil & ganti password | `/me`, `/me/password` | semua |
| Notifikasi: tandai semua dibaca, hapus yang sudah dibaca | `PATCH /notifications/read-all`, `DELETE /notifications` | semua |

### Perbaikan

| Masalah | Perbaikan |
| --- | --- |
| Foto/video di atas 32 KB tidak pernah tampil (thumbnail riwayat kosong) | `services/backend-actions.ts`: base64 dikodekan sekali dengan `Buffer` (sebelumnya padding `=` muncul di tengah string) |
| Upload di atas 1 MB ditolak (batas default server action) | `next.config.ts`: `experimental.serverActions.bodySizeLimit = "55mb"` |
| Unduhan CSV/GeoJSON/video/audio dibaca sebagai JSON | Proxy meneruskan tipe biner + nama file dari `Content-Disposition` |
| Audio `.wav`/`.m4a` ditolak di beberapa browser (MIME berbeda) | Validasi upload memakai ekstensi berkas |
| Dua menu aktif sekaligus (mis. AI Vision dan Riwayat) | Sidebar menyorot menu paling spesifik |

### Menghubungkan ke backend

`.env.local` (tidak di-commit):

```env
API_URL=http://127.0.0.1:8000/api
# atau server tim lewat Cloudflare Tunnel:
# API_URL=https://<alamat-tunnel>.trycloudflare.com/api
```

Restart `npm run dev` setelah mengubahnya.

### Masih dikembangkan

- Tombol tambah/ubah di daftar master data masih tampil untuk role tanpa `manage_master_data` (halaman tujuannya menolak akses).
- Video/audio diunduh utuh lewat server action; video besar di koneksi lambat terasa berat.
- Endpoint yang dipanggil alat (`POST /gps-readings/bulk`, `POST /weather-data/ingest`) tidak punya halaman.

## 1. Ringkasan aplikasi

### 1.1 Masalah yang diatasi

Pemantauan satwa liar di Taman Nasional Gunung Leuser membutuhkan data yang tersebar: individu satwa, spesies, perangkat GPS, pembacaan posisi, zona risiko atau koridor, insiden lapangan, notifikasi, serta hasil identifikasi gambar. Tanpa antarmuka terpusat, petugas lapangan, peneliti, administrator, dan pengambil kebijakan harus membaca data dari banyak sumber yang tidak terhubung.

Aplikasi ini menyediakan satu antarmuka web untuk:

- melihat dan mengelola data master satwa, spesies, perangkat, dan zona;
- memantau posisi satwa melalui peta;
- mencatat dan memperbarui laporan insiden;
- melihat notifikasi dan ringkasan operasional;
- mengunggah gambar untuk prediksi spesies berbasis AI;
- memverifikasi prediksi AI oleh peneliti;
- menghasilkan ringkasan eksekutif dari data backend.

### 1.2 Peran frontend

Frontend adalah klien web Next.js App Router. Frontend bertanggung jawab atas tampilan, interaksi, validasi UX, state klien, dan komunikasi dengan API Laravel. Frontend **tidak**:

- terhubung langsung ke database;
- memanggil penyedia AI seperti Groq atau OpenAI;
- menyimpan kunci AI;
- menjadi otoritas akhir untuk validasi data atau otorisasi;
- menggunakan mock data sebagai sumber data utama.

Backend Laravel di repository `wildlife-tracking-backend` adalah sumber kebenaran untuk autentikasi, otorisasi, validasi akhir, logika bisnis, integrasi AI, dan penyimpanan data.

### 1.3 Pengguna dan alur kerja

| Peran | Nilai role | Fokus penggunaan |
| --- | --- | --- |
| Konservasionis Lapangan | `konservasionis_lapangan` | Dashboard, peta langsung, notifikasi, satwa, Wildlife Explorer, insiden |
| Peneliti Ekologi | `peneliti_ekologi` | Dashboard, peta, notifikasi, satwa, spesies, perangkat, verifikasi prediksi AI |
| Administrator Sistem | `administrator_sistem` | Menu peneliti ditambah zona geografis dan pengelolaan data master |
| Pengambil Kebijakan | `pengambil_kebijakan` | Dashboard, peta, notifikasi, statistik, laporan AI |

Role dipetakan di `lib/navigation.ts`. Menu dan akses halaman di frontend bersifat **UX**; backend tetap harus menegakkan otorisasi pada endpoint yang sensitif.

### 1.4 Hubungan antarrepository

| Repository | Peran |
| --- | --- |
| `wildlife-tracking-frontend` | Antarmuka web, state klien, dan komunikasi API |
| `wildlife-tracking-backend` | REST API Laravel, Sanctum, validasi, Eloquent, aturan bisnis, modul AI |
| `wildlife-tracking-database` | Dokumentasi ERD, kamus data, dan rancangan skema |

Port pengembangan default: frontend `:3000`, backend `:8000`. Database bawaan backend dapat memakai SQLite; konfigurasi produksi berada di repository backend.

---

## 2. Status implementasi

Status berikut dinilai dari kode yang benar-benar ada dan integrasinya, bukan dari keberadaan halaman saja.

| Modul | Fungsi | Status | Kekurangan / catatan |
| --- | --- | --- | --- |
| Login dan sesi | Login email/password, cookie httpOnly, verifikasi `/me`, logout | Selesai | `rememberMe` ada di form tetapi tidak dikirim; role gate di frontend bersifat UX |
| Dashboard | Ringkasan satwa, spesies, perangkat, insiden, GPS, notifikasi, alert, prediksi AI | Selesai | Agregasi dihitung di klien, bukan endpoint `/dashboard`; kueri daftar dibatasi 100 data |
| Manajemen satwa | Daftar, detail, pencarian, filter, tambah, ubah, hapus | Selesai | Payload frontend sudah sesuai aturan `AnimalController`; filter daftar kebanyakan di klien |
| Manajemen spesies | Daftar, detail, pencarian, filter, tambah, ubah, hapus | Selesai | Status konservasi mengikuti enam nilai yang juga divalidasi backend |
| Manajemen perangkat | Daftar, detail, tambah, ubah, hapus, alert baterai/sinyal | Sebagian | CRUD utama berfungsi; mengosongkan tanggal nullable gagal; tidak ada UI assign animal |
| GPS dan peta langsung | Peta Leaflet, posisi perangkat, zona, lintasan satwa | Sebagian | Data nyata dari API, tetapi tidak ada auto-refresh/write UI; filter perangkat dilakukan dengan mengambil semua data |
| Zona geografis | Daftar, peta, tambah, ubah, hapus, detail via modal | Sebagian | `polygon_geojson` berisiko double-encoded; field nullable tidak bisa dikosongkan pada update |
| Insiden lapangan | Daftar, filter, tambah, ubah | Sebagian | Tidak ada UI hapus/detail; batas koordinat belum divalidasi backend; sinkronisasi status tidak konsisten |
| Notifikasi | Daftar, filter, tandai dibaca | Sebagian | Endpoint backend untuk read-all, hapus, dan unread-count belum dipakai UI |
| Statistik | Ringkasan numerik dari data API | Sebagian | Dihitung di browser dari maksimal 100 baris per resource; state error/loading tidak memakai primitive bersama |
| Wildlife Explorer | Placeholder eksplorasi satwa | Belum tersedia | Hanya teks placeholder; tidak ada hook, service, atau tampilan data |
| AI Vision | Upload gambar, prediksi, riwayat, detail, verifikasi | Sebagian | Alur inti terhubung; retry/edit/delete prediksi, riwayat media, dan otorisasi backend untuk verifikasi belum ada |
| Laporan eksekutif AI | Ringkasan live dari backend dengan fallback template | Sebagian | Tidak disimpan, tanpa ekspor/riwayat; `success:false` masih memicu toast sukses |
| Profil pengguna | Ubah profil dan kata sandi | Belum tersedia | Backend memiliki `PATCH /me` dan `PUT /me/password`, frontend belum memakainya |
| Manajemen user, role, permission | CRUD user/role/permission | Belum tersedia | Endpoint backend ada, tetapi tidak ada halaman/service frontend |
| Booking dan booking item | Tidak ditemukan | Belum tersedia | Tidak ada rute, komponen, service, atau endpoint backend terkait |
| Laporan agregat dan ekspor | Tidak ditemukan | Belum tersedia | Backend menyediakan endpoint aggregate/export, frontend belum mengonsumsinya |
| Weather, activity log, kunjungan zona | Tidak ditemukan | Belum tersedia | Endpoint backend ada, tidak ada UI frontend |
| Loading level rute | Suspense/loading skeleton per rute | Belum tersedia | Tidak ada `loading.tsx`; tiap view menangani loading sendiri |

Legenda:

- **Selesai**: fungsi utama diimplementasikan dan integrasinya dapat diverifikasi dari kode.
- **Sebagian**: sebagian alur berfungsi, tetapi ada operasi, integrasi, atau batasan yang belum lengkap.
- **Belum tersedia**: tidak ditemukan implementasi bermakna.
- **Perlu verifikasi**: kode ada, tetapi perilaku produksi atau kontrak eksternal belum dapat dipastikan hanya dari repository ini.

---

## 3. Tumpukan teknologi

Versi berasal dari `package.json` dan `package-lock.json`.

| Kategori | Teknologi | Versi | Peran dalam aplikasi |
| --- | --- | --- | --- |
| Framework | Next.js | `16.3.8` | App Router, Server Components, Server Actions, build produksi |
| UI | React, React DOM | `19.2.8` | Render antarmuka dan interaksi klien |
| Bahasa | TypeScript | `^5` | `strict: true` melalui `tsconfig.json` |
| Styling | Tailwind CSS, `@tailwindcss/postcss` | `^4` | CSS-first Tailwind di `app/globals.css` dan `postcss.config.mjs` |
| Data async | TanStack Query | `^5.104.4` | Query, mutasi, cache, invalidasi |
| Tabel | TanStack Table | `^8.21.3` | Sorting, filtering, pagination, seleksi baris di `DataTable` |
| Peta | Leaflet, `@types/leaflet` | `^1.9.4`, `^1.9.22` | Peta langsung dan visualisasi zona |
| Ikon | `lucide-react` | `^1.60.0` | Ikon antarmuka |
| Form login | React Hook Form, `@hookform/resolvers` | `^7.90.0`, `^5.9.2` | Form login dengan `zodResolver` |
| Validasi | Zod | `^4.6.5` | Skema login dan validasi UX form domain melalui `safeParse` manual |
| Utilitas kelas | `clsx`, `tailwind-merge` | `^2.1.1`, `^3.7.0` | Helper `cn()` di `lib/utils.ts` |
| Lint | ESLint, `eslint-config-next` | `^9`, `16.3.8` | `core-web-vitals` dan aturan TypeScript Next.js |
| HTTP | Native `fetch` | bawaan platform | Semua request terkonsentrasi di `services/api.ts` |

Hal yang **tidak** dipakai:

- Axios atau HTTP client lain;
- library UI komersial atau component library eksternal;
- library grafik khusus;
- library toast eksternal — toast dibuat sendiri di `components/providers/toast-provider.tsx`;
- runner test otomatis;
- script `typecheck` di `package.json`.

`package.json` tidak mendeklarasikan `engines` atau `packageManager`. Next.js `16.3.8` di `package-lock.json` membutuhkan Node.js `>=20.9.0`, sehingga gunakan Node.js 20.9 atau lebih baru dengan npm.

---

## 4. Arsitektur frontend

### 4.1 Alur data aktual

```text
Halaman / Komponen
        ↓
Hook TanStack Query / state lokal
        ↓
Service domain (services/*.service.ts)
        ↓
API client terpusat (services/api.ts)
        ↓
Server Action (services/backend-actions.ts)
        ↓
Laravel REST API (/api)
        ↓
Database / backend services
```

Untuk autentikasi server-side, ada jalur tambahan:

```text
services/laravel-auth.service.ts
        ↓
createServerApiClient() dari services/api.ts
        ↓
Laravel /api/login dan /api/me
```

`services/api.ts` juga berisi implementasi client `fetch` langsung, tetapi client yang dipakai service operasional adalah `api = createActionApiClient()`, yang meneruskan request melalui Server Action.

### 4.2 Struktur direktori

```text
wildlife-tracking-frontend/
├── app/
│   ├── (protected)/<module>/_components/
│   ├── login/_components/
│   ├── error.tsx
│   ├── not-found.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── layout/
│   ├── providers/
│   ├── shared/
│   └── ui/
├── hooks/
├── lib/
├── services/
├── types/
├── utils/
├── public/
├── .env.example
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
└── tsconfig.json
```

| Direktori | Tanggung jawab |
| --- | --- |
| `app/` | Routing, layout, metadata, error dan not-found. Semua `page.tsx` adalah Server Component dan mendelegasikan interaktivitas ke komponen lain. |
| `components/ui/` | Primitive generik: button, form, panel, modal, confirmation dialog, data table, filter, loading, empty/error state, badge, stat card, breadcrumb. |
| `components/shared/` | Komponen aplikasi generik lintas modul, saat ini `form-page.tsx`. |
| `app/(protected)/<module>/_components/` | View, list, detail, form, kolom tabel, dan filter yang hanya dipakai oleh modul rute tersebut. |
| `components/layout/` | `AppShell`, `Header`, `Sidebar`, `MobileNav`, `NavIcon`. |
| `components/providers/` | `QueryProvider` dan `ToastProvider`. |
| `hooks/` | Custom hook TanStack Query, auth, debounce, dan utilitas klien. |
| `services/` | API client, Server Action, cookie, auth Laravel, dan service per domain. |
| `types/` | Semua tipe domain, payload, respons API, dan kontrak Server Action. |
| `lib/` | Session, navigasi, nama cookie, helper form, dan `cn()`. |
| `utils/` | Formatter tanggal, nilai tampilan, dan GeoJSON. |
| `public/` | Aset statis, termasuk logo BTNGL. |

Alias `@/*` menunjuk ke root frontend. Tidak ada direktori `src/`, `features/`, `schemas/`, atau `constants/`.

### 4.3 Server Component dan Client Component

- `app/layout.tsx` dan seluruh `app/**/page.tsx` adalah Server Component.
- `app/(protected)/layout.tsx` memverifikasi sesi di server dan membungkus halaman dengan `AppShell`.
- Interaktivitas berada di komponen bertanda `"use client"`, terutama `app/**/_components/*`, `components/ui/*`, dan `components/providers/*`.
- Satu-satunya file `"use server"` adalah `services/backend-actions.ts`.
- Tidak ada `app/api/`, route handler, `middleware.ts`, atau `proxy.ts`.
- `next.config.ts` hanya menyediakan rewrite legacy `/master-data/{animals,species,devices,geo-zones}` ke rute tanpa prefiks.

### 4.4 State dan data fetching

`QueryProvider` mengatur:

- `staleTime`: 30 detik;
- `retry`: 1;
- `refetchOnWindowFocus`: false.

Hook mengikuti pola `useX`, `useXById`, `useXCreate`, `useXUpdate`, `useXDelete`, lalu mem invalidate query terkait setelah mutasi. Beberapa hook `useInfinite*` tersedia, tetapi tidak ada UI infinite scroll yang mengonsumsinya. Pagination server belum dipakai; tabel memakai pagination klien di atas data yang sudah diambil.

---

## 5. Routing dan fitur

Grup `(protected)` tidak memengaruhi URL. Jika `getVerifiedSession()` gagal, layout mengalihkan pengguna ke `/login?reason=<alasan>`.

### 5.1 Rute publik

| Rute | Perilaku |
| --- | --- |
| `/` | Memverifikasi sesi, lalu redirect ke rute default role atau `/login` |
| `/login` | Form login; redirect otomatis bila sesi masih valid dan tidak ada parameter `reason` |

### 5.2 Dashboard dan pemantauan

| Rute | Fitur | Implementasi |
| --- | --- | --- |
| `/dashboard` | Ringkasan operasional dan tautan cepat | `DashboardView` memakai `useDashboardSummary`, yang mengagregasi data dari beberapa endpoint nyata |
| `/statistics` | Statistik numerik | `StatisticsView` mengambil satwa, spesies, perangkat, dan insiden lalu menghitung ringkasan di klien |
| `/notifications` | Daftar notifikasi | `NotificationListView` menampilkan filter dan aksi tandai dibaca |
| `/tracking/live-map` | Peta posisi | `LiveMapView` memakai Leaflet, data perangkat, pembacaan GPS, dan zona |
| `/wildlife-explorer` | Placeholder | Tidak ada integrasi data |

Peta langsung memakai tile OpenStreetMap eksternal dan tidak memiliki polling otomatis. Istilah "live" pada rute belum berarti pembaruan realtime.

### 5.3 Manajemen data master

| Modul | Rute | Operasi yang tersedia |
| --- | --- | --- |
| Satwa | `/animals`, `/animals/create`, `/animals/[id]/detail`, `/animals/[id]/update` | List, detail, tambah, ubah, hapus; detail GPS dan insiden terkait |
| Spesies | `/species`, `/species/create`, `/species/[id]/detail`, `/species/[id]/update` | List, detail, tambah, ubah, hapus; daftar satwa per spesies |
| Perangkat | `/devices`, `/devices/create`, `/devices/[id]/detail`, `/devices/[id]/update` | List, detail, tambah, ubah, hapus; alert baterai/sinyal dan pembacaan GPS |
| Zona geografis | `/geo-zones`, `/geo-zones/create`, `/geo-zones/[id]/update` | List, peta, detail via modal, tambah, ubah, hapus |
| Insiden | `/incidents`, `/incidents/create`, `/incidents/[id]/update` | List, filter, tambah, ubah |

Create dan Update untuk setiap modul memakai satu form modul di `app/(protected)/<module>/_components/` yang dibungkus shell generik `components/shared/form-page.tsx`. Halaman update memanggil `notFound()` untuk ID tidak valid. Halaman detail saat ini meneruskan ID invalid menjadi `-1` dan menampilkan empty state, bukan 404.

### 5.4 AI

| Rute | Fitur |
| --- | --- |
| `/ai/vision` | Unggah gambar camera-trap dan lihat prediksi |
| `/ai/vision/history` | Riwayat prediksi dengan filter dan pagination manual |
| `/ai/vision/[id]` | Detail prediksi, gambar media, status, dan verifikasi |
| `/ai/vision/pending` | Antrean verifikasi untuk `peneliti_ekologi` |
| `/ai/reports` | Ringkasan eksekutif AI/template untuk rentang tanggal |

Detail lengkap ada di [bagian 7](#7-integrasi-ai).

---

## 6. Integrasi backend

### 6.1 Konfigurasi URL

Base URL ditentukan di `services/api.ts` dengan prioritas:

1. `API_URL` — hanya server;
2. `NEXT_PUBLIC_API_URL`;
3. `http://127.0.0.1:8000/api`.

Trailing slash dibuang sebelum request. Path resource ditulis di service modul, relatif terhadap base URL tersebut, misalnya `/animals` dan `/ai/upload`.

Variabel environment yang benar-benar dibaca kode:

| Variabel | Penggunaan |
| --- | --- |
| `API_URL` | Base URL prioritas tertinggi untuk server |
| `NEXT_PUBLIC_API_URL` | Fallback base URL |
| `NEXT_PUBLIC_COOKIE_TOKEN` | Nama cookie token; default `wms_token` |
| `NEXT_PUBLIC_COOKIE_EXPIRES_AT` | Nama cookie yang ikut dihapus saat logout; tidak ditulis saat login |
| `NEXT_PUBLIC_COOKIE_TYPE` | Nama cookie yang ikut dihapus saat logout; tidak ditulis saat login |
| `NODE_ENV` | Menentukan atribut `secure` cookie di produksi |

`.env.example` juga berisi `NEXT_PUBLIC_HOST_NAME`, `NEXT_PUBLIC_PORT`, `NEXT_PUBLIC_DOMAIN`, `NEXT_PUBLIC_REQUEST_TIMEOUT_MS`, dan `WILDLIFE_BACKEND_URL`, tetapi Variabel tersebut belum dibaca oleh kode frontend saat ini. Timeout masih konstan 10 detik, kecuali request AI yang menimpa menjadi 30 atau 120 detik.

### 6.2 Autentikasi dan token

Alur login:

1. `LoginForm` memakai validasi Zod dan mengirim `{ email, password }`.
2. `loginAction` memanggil `authenticateWithLaravel()`.
3. `laravel-auth.service.ts` mengirim `POST /api/login`, lalu membaca `data.token`, `data.user`, dan `data.user.role.role_name`.
4. `setAuthCookies()` menulis `wms_session` dan `wms_token` sebagai cookie httpOnly, `sameSite: "lax"`, `path: "/"`, `maxAge` 8 jam, dan `secure` saat produksi.
5. Token bearer tidak pernah dikirim ke JavaScript browser.
6. `getVerifiedSession()` memanggil `GET /api/me` dengan token sebelum halaman protected dirender.
7. `forwardBackendAction()` membaca token di server dan menambahkan header `Authorization: Bearer <token>`.

Logout memanggil `POST /api/logout` dengan token. Jika backend gagal atau token sudah kedaluwarsa, cookie lokal tetap dihapus agar pengguna tidak terjebak di session mati.

Role yang dikenali: `konservasionis_lapangan`, `peneliti_ekologi`, `administrator_sistem`, dan `pengambil_kebijakan`. Route utama hanya memverifikasi autentikasi. `AppShell` membatasi menu/akses berdasarkan role, dan halaman `/ai/vision/pending` melakukan redirect untuk role selain peneliti. Ini tetap bukan pengganti otorisasi backend.

### 6.3 Penanganan request dan respons

`services/api.ts` menyediakan:

- header `Accept: application/json` dan `Content-Type: application/json` untuk request non-multipart;
- `FormData` tanpa `Content-Type` agar boundary multipart dibuat otomatis;
- query builder yang mengabaikan `undefined`, `null`, string kosong, dan `"all"`;
- `AbortController` dan timeout;
- penanganan `204 No Content`;
- `ApiError` dengan `kind`: `unauthorized`, `forbidden`, `validation`, `not_found`, `client`, `server`, `network`, `unknown`;
- `unwrapData()` untuk envelope `{ success, message, data, errors }`;
- `formatApiError()`, `formatApiMessage()`, dan `getApiFieldErrors()` untuk menampilkan pesan backend;
- `getBlob()` untuk respons biner.

Untuk request browser, `forwardBackendAction()` meneruskan method, path, params, body, FormData, token, dan timeout ke server. Respons biner diubah menjadi base64 di Server Action, lalu dikembalikan menjadi `Blob` oleh API client di browser. Ini dipakai untuk gambar media AI.

Keterbatasan: hanya `Content-Type` yang diteruskan dari header caller; header lain diabaikan. Deteksi biner hanya mencakup `image/*` dan `application/octet-stream`.

### 6.4 Endpoint yang dipakai frontend

| Modul | Method dan path |
| --- | --- |
| Auth | `POST /login`, `POST /logout`, `GET /me` |
| Satwa | `GET`, `POST`, `PUT`, `DELETE /animals`; `GET /animals/{id}` |
| Spesies | `GET`, `POST`, `PUT`, `DELETE /species`; `GET /species/{id}` |
| Perangkat | `GET`, `POST`, `PUT`, `DELETE /devices`; `GET /devices/{id}` |
| GPS | `GET /gps-readings`; `GET /animals/{animalId}/track` |
| Zona | `GET`, `POST`, `PUT`, `DELETE /geo-zones`; `GET /geo-zones/{id}` |
| Insiden | `GET /incidents`; `GET /incidents/{id}`; `POST /incidents`; `PUT /incidents/{id}` |
| Notifikasi | `GET /notifications`; `PATCH /notifications/{id}/read` |
| AI | `POST /ai/upload`; `GET /ai-predictions`; `GET /ai-predictions/pending-verification`; `GET /ai-predictions/{id}`; `POST /ai-predictions/{id}/verify`; `GET /media-uploads/{id}/file`; `GET /ai/summary-report` |

Endpoint backend lain seperti dashboard khusus, user/role/permission, weather, aggregate reports, activity logs, export, retry AI, update/delete prediksi AI, dan media uploads list tersedia di `routes/api.php`, tetapi belum dikonsumsi frontend.

### 6.5 Hasil verifikasi kontrak backend

Kontrak berikut diperiksa terhadap controller dan aturan validasi aktif di backend, bukan terhadap FormRequest yang tidak di-inject.

| Modul | Hasil verifikasi |
| --- | --- |
| Species | Field `common_name`, `scientific_name`, `conservation_status` dan aturan backend sesuai frontend |
| Animals | `name`, `species_id`, `birth_date`, `gender`, `is_active` sesuai; frontend menerjemahkan gender ke `male`/`female`/`unknown` |
| Devices | Field utama sesuai; pengosongan `installation_date`/`last_recorded_at` gagal karena frontend menghilangkan key saat nilai kosong dan backend hanya meng-update field yang hadir |
| Geo Zones | Nama dan koordinat sesuai; `polygon_geojson` dikirim sebagai string lalu berisiko double-encoded oleh cast array; field nullable tidak bisa dikosongkan saat update |
| Incidents | Field utama sesuai; backend belum membatasi lat/lon; penghapusan relasi saat update gagal karena key dihilangkan; default DB `pending` tidak sama dengan enum frontend `pending_sync` |
| Login/logout/me | Sesuai dengan `AuthController`; frontend membaca role dari objek relasi dan memetakan `full_name` menjadi `name` |
| AI upload/verify/summary | Sesuai dengan `StoreAiMediaRequest`, controller verifikasi, dan validasi rentang tanggal summary |

Masalah pada Devices, Geo Zones, dan Incidents harus diperbaiki dengan kontrak yang jelas di backend dan/atau pengiriman `null` yang benar di frontend. Frontend tidak boleh menyamarkan kegagalan endpoint ini dengan data palsu.

---

## 7. Integrasi AI

### 7.1 Prinsip integrasi

Frontend tidak memanggil Groq atau penyedia AI lain secara langsung. Tidak ada kunci AI di `.env.example`, tidak ada SDK AI di `package.json`, dan seluruh permintaan AI melewati Laravel API melalui `AI_SERVICE`, `services/api.ts`, dan Server Action.

Hasil prediksi selalu diberi label **"Dihasilkan AI"**. Ringkasan dengan `used_ai=false` diberi label **"Template Backend"** dan dijelaskan sebagai fallback ketika layanan AI tidak tersedia.

### 7.2 Workflow A — AI Vision

| Aspek | Implementasi |
| --- | --- |
| Rute | `/ai/vision`, `/ai/vision/history`, `/ai/vision/[id]`, `/ai/vision/pending` |
| Service | `services/ai.service.ts` → `AI_SERVICE` |
| Hook | `hooks/use-ai.ts` → `useAiPredictionUpload`, `useAiPredictions`, `useAiPendingPredictions`, `useAiPrediction`, `useAiMediaFile`, `useAiPredictionVerification` |
| Upload | `FormData` dengan field `file` dan opsional `report_id`; tipe JPG/JPEG/PNG/WEBP, maksimal 5 MB |
| Riwayat | Filter status proses, status verifikasi, spesies, confidence minimum, tanggal; pagination manual |
| Detail | Informasi media, prediksi, confidence, model, status, spesies terverifikasi, dan gambar dari endpoint blob |
| Verifikasi | `POST /ai-predictions/{id}/verify` dengan `verification_status` dan `verified_species_id` |
| Role | Kontrol verifikasi hanya tampil untuk `peneliti_ekologi`; halaman pending melakukan redirect untuk role lain |
| Label | "Dihasilkan AI" pada hasil; teks advisory bahwa keputusan akhir ada pada petugas |
| State | Loading, error, retry, empty, toast, field error, dan object URL cleanup tersedia |

Yang belum ada pada frontend:

- tombol retry prediksi meskipun backend punya `POST /ai-predictions/{id}/retry`;
- edit dan hapus prediksi meskipun backend punya endpoint admin;
- daftar detail media upload selain pengambilan file gambar;
- total count dari header backend, sehingga halaman berikutnya ditebak dari jumlah data;
- indikator progres unggah, pembatalan request, atau retry otomatis;
- pemeriksaan role di dalam komponen verifikasi — kontrol bergantung pada prop `canVerify` dari halaman.

Backend juga tidak membatasi verifikasi hanya untuk peneliti; pembatasan tersebut saat ini bersifat UX.

### 7.3 Workflow B — Laporan eksekutif AI

| Aspek | Implementasi |
| --- | --- |
| Rute | `/ai/reports` |
| UI | `AiSummaryView`: pilih tanggal mulai/akhir, tombol buat laporan, tampilkan narasi, statistik, distribusi spesies, insiden per jenis, dan rekomendasi |
| Default | 30 hari terakhir sampai tanggal hari ini |
| Service | `AI_SERVICE.getSummaryReport({ start_date, end_date })` |
| Endpoint | `GET /ai/summary-report` dengan timeout 120 detik |
| Hook | `useAiSummaryReport()` berupa mutation |
| Sumber data | Live dari backend; tidak disimpan sebagai riwayat frontend |
| Fallback | `used_ai=false` ditampilkan sebagai "Template Backend" dengan penjelasan bahwa layanan AI tidak tersedia saat pembuatan |
| Error | Validasi tanggal, `FormAlert`, toast, dan penanganan error API tersedia |

Keterbatasan:

- tidak ada riwayat, arsip, atau penyimpanan laporan;
- tidak ada ekspor PDF/CSV;
- `generated_at` ada di tipe tetapi tidak dirender;
- ketika HTTP 2xx tetapi `data.success === false`, UI menampilkan badge "Respons Tidak Berhasil", namun toast tetap menyatakan laporan berhasil — ini perlu diperbaiki;
- halaman tidak punya role gate khusus dan tersedia untuk semua role.

---

## 8. UI, validasi, dan pengalaman pengguna

### 8.1 Primitive dan komponen bersama

`components/ui/` berisi primitive yang dipakai ulang:

- `Button` dengan varian dan state loading;
- `FormField`, `TextInput`, `SelectInput`, `TextArea`, `FormCheckbox`, `FormActions`, `FormAlert`, `FormGrid`, `FormSection`;
- `Panel`, `PageHeader`, `SectionHeader`;
- `Modal`, `ConfirmationDialog`;
- `DataTable`, `DataFilters`;
- `Loading`, `EmptyState`, `ErrorState`;
- `StatusBadge`, `StatCard`, `Breadcrumb`.

`ToastProvider` menyediakan toast dengan maksimal tiga pesan, auto-dismiss, dan dua posisi: tengah sebagai default serta kanan bawah untuk login.

### 8.2 Validasi form

Ada dua pendekatan yang benar-benar dipakai:

1. **Login** memakai React Hook Form + `zodResolver`.
2. **Form domain** (satwa, spesies, perangkat, zona, insiden) memakai Zod `safeParse` manual, state lokal, dan helper `lib/form.ts` untuk memetakan issue ke error per field.

Form domain memakai satu komponen untuk create dan update, mencegah submit ganda, menampilkan error backend per field, dan memetakan nama field backend ke nama field UI bila berbeda, misalnya backend `name` menjadi UI `animal_code`. Validasi Zod hanya untuk UX; backend tetap melakukan validasi akhir.

`AiPredictionVerification` tidak memakai Zod; ia melakukan validasi manual bahwa spesies harus dipilih.

### 8.3 State, error, dan aksesibilitas

Sebagian besar view memakai `Loading`, `EmptyState`, dan `ErrorState` secara konsisten. `ErrorState` mengenal delapan `ApiErrorKind` dan dapat menampilkan daftar error validasi 422. Mutasi menampilkan toast dan mengembalikan error ke field yang sesuai.

Aksesibilitas yang sudah ada:

- skip link ke konten utama;
- `:focus-visible` global;
- label, `aria-invalid`, `aria-describedby`, dan `role="alert"` pada form;
- caption tersembunyi, `aria-sort`, dan baris tabel yang dapat diaktifkan dengan keyboard;
- `role="dialog"`, `aria-modal`, Escape, backdrop, dan fokus awal pada modal;
- `role="status"` pada loading;
- ikon dekoratif dengan `aria-hidden`;
- navigasi aktif dengan `aria-current`.

Kesenjangan yang masih ada:

- tidak ada focus trap atau pengembalian fokus saat modal ditutup;
- `ConfirmationDialog` belum mengisi `aria-describedby` panel;
- tidak ada live region untuk perubahan sorting/pagination tabel;
- tidak ada `prefers-reduced-motion`;
- tidak ada `loading.tsx` level rute;
- Statistik dan notifikasi memiliki loading/empty/error buatan sendiri;
- beberapa warna langsung masih bersaing dengan token `app/globals.css`.

### 8.4 Responsivitas dan sidebar

`AppShell` menampilkan sidebar desktop dan `MobileNav` untuk layar kecil. Sidebar desktop dapat menciut saat tidak di-hover. Header bersifat sticky, memiliki tombol menu pada layar kecil, breadcrumb pada layar `sm` ke atas, lonceng notifikasi, dan menu akun.

Role menentukan menu melalui `NAV_SECTIONS` di `lib/navigation.ts`. Jika role tidak diizinkan mengakses rute, `AppShell` menampilkan panel "Akses ditolak" dan tautan ke rute default, bukan redirect otomatis.

---

## 9. Instalasi dan pengembangan

### 9.1 Prasyarat

- Node.js `>=20.9.0`;
- npm dengan lockfile v3;
- backend Laravel yang berjalan dan dapat diakses dari frontend;
- akses ke variabel environment backend yang diperlukan, tanpa menaruh kunci AI di frontend.

### 9.2 Instalasi

```bash
cd wildlife-tracking-frontend
npm install
```

Jika belum ada file environment lokal:

```bash
cp .env.example .env.local
```

Sesuaikan minimal:

```dotenv
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
NEXT_PUBLIC_COOKIE_TOKEN=wms_token
```

Jangan menyimpan secret di variabel `NEXT_PUBLIC_*`. `API_URL` dapat dipakai untuk konfigurasi server-only.

### 9.3 Menjalankan aplikasi

```bash
npm run dev
```

Frontend tersedia di `http://localhost:3000`. Backend default berada di `http://127.0.0.1:8000/api`.

### 9.4 Build dan validasi

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run start
```

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Server pengembangan |
| `npm run build` | Build produksi Next.js |
| `npm run start` | Menjalankan hasil build |
| `npm run lint` | ESLint 9 |
| `npx tsc --noEmit` | Pemeriksaan tipe manual |
| `npm test` | Tidak tersedia |

Baseline saat audit:

- `npx tsc --noEmit`: 0 error;
- `npm run lint`: 0 error, 11 warning yang sudah ada;
- `npm run build`: berhasil.

Warning ESLint berasal terutama dari `react-hooks/exhaustive-deps`, ref cleanup pada peta langsung, dan satu peringatan `useReactTable` dari React Compiler.

### 9.5 Pemeriksaan manual yang disarankan

1. Login dengan kredensial valid, lalu pastikan redirect sesuai role.
2. Akses rute protected tanpa sesi; pastikan redirect ke `/login`.
3. Matikan backend, lalu buka halaman protected; pastikan muncul alasan `backend`.
4. Uji CRUD satwa, spesies, perangkat, zona, dan insiden dengan data nyata.
5. Uji pengosongan field nullable pada perangkat, zona, dan insiden — area ini memiliki defect yang terdokumentasi.
6. Unggah gambar AI, buka riwayat dan detail, lalu verifikasi sebagai peneliti.
7. Buat laporan AI dengan AI aktif dan dengan fallback template bila memungkinkan.
8. Uji lebar 375 px, 768 px, dan 1280 px, termasuk sidebar mobile, modal, dan tabel.
9. Matikan backend saat mutasi berjalan; pastikan toast/error tampil tanpa crash.

---

## 10. Pemeliharaan dan konvensi

### 10.1 Menambah fitur

1. Pastikan fitur masih sesuai Sprint saat ini; jika tidak, catat sebagai backlog.
2. Periksa dulu route, controller, FormRequest/validasi inline, `$fillable`, cast, relasi, dan migrasi backend.
3. Tambahkan tipe payload/respons di `types/`.
4. Tambahkan method ke service modul yang sudah ada; jangan membuat HTTP client baru.
5. Tambahkan hook TanStack Query jika ada pengambilan data atau mutasi.
6. Bangun atau perbarui komponen modul di `app/(protected)/<module>/_components/`.
7. Pasang dan komposisikan komponen pada `page.tsx` di `app/(protected)/`.
8. Perbarui `lib/navigation.ts` bila menu berubah.
9. Perbarui README ini dalam PR yang sama bila status, endpoint, konfigurasi, atau keterbatasan berubah.
10. Jalankan lint, pemeriksaan tipe, dan build.

### 10.2 Aturan kode

- Gunakan `type`, bukan `interface`.
- Dilarang `any`; gunakan `unknown` lalu lakukan narrowing.
- Pertahankan `strict: true`.
- Tidak ada komentar dalam kode sumber kecuali directive yang benar-benar diperlukan kerangka kerja.
- Page tidak boleh memanggil `fetch`, mengubah cookie, atau membentuk header Authorization sendiri.
- Semua HTTP concern berada di `services/api.ts`.
- Tipe bersama berada di `types/`; service fokus pada komunikasi dan transformasi API.
- Form create/update untuk satu domain memakai satu komponen form yang sama.
- Backend adalah otoritas untuk field, verb, method, dan validasi write.
- Jangan menambah dependensi tanpa pembaruan `package.json`, `package-lock.json`, dan README.

### 10.3 Git dan kolaborasi

Ikuti instruksi di `AGENTS.md` untuk alur Scrum, konvensi branch, PR, dan commit. Jangan commit `.env`, token, kredensial, atau kunci AI. Perubahan yang melibatkan kontrak backend harus diselesaikan di repository backend dan didokumentasikan dalam PR terkait.

---

## 11. Keterbatasan dan pekerjaan berikutnya

### 11.1 Prioritas tinggi

1. Perbaiki pengiriman `null` pada field nullable agar tanggal perangkat, koordinat/radius zona, dan relasi insiden dapat dikosongkan saat update.
2. Perbaiki bentuk `polygon_geojson` agar tidak double-encoded oleh cast array backend.
3. Tambahkan batas koordinat dan batas radius yang sesuai schema di validasi backend.
4. Samakan nilai `sync_status` antara default database dan enum frontend/backend.
5. Terapkan otorisasi backend untuk verifikasi AI jika hanya peneliti yang boleh melakukan verifikasi.
6. Tambahkan penanganan `401` global yang konsisten di lapisan API client.
7. Tambahkan runner test dan pengujian untuk login, sesi, error API, mutation CRUD, dan AI.

### 11.2 Prioritas menengah

1. Konsumsi pagination/server count yang sudah tersedia dari backend, lalu hapus `meta` sintetis dan pagination klien yang menyesatkan.
2. Tambahkan auto-refresh atau kontrol refresh manual pada peta langsung.
3. Lengkapi UI assignment perangkat ke satwa melalui `PATCH /devices/{id}/assign-animal`.
4. Tambahkan retry, edit, dan delete prediksi AI bila sesuai kebutuhan peran.
5. Tambahkan riwayat dan ekspor laporan eksekutif AI.
6. Perbaiki toast ketika `data.success === false` pada summary AI.
7. Seragamkan halaman detail invalid ID agar memakai `notFound()`.
8. Migrasikan Statistik dan Notifikasi ke primitive `Loading`, `EmptyState`, dan `ErrorState`.

### 11.3 Prioritas rendah

1. Tambah focus trap dan focus restore pada modal.
2. Tambah `prefers-reduced-motion` dan live region untuk perubahan tabel.
3. Kurangi warna Tailwind langsung dan gunakan token di `app/globals.css`.
4. Implementasikan Wildlife Explorer atau hapus menu/route bila tidak direncanakan.
5. Gunakan `NEXT_PUBLIC_REQUEST_TIMEOUT_MS` atau hapus dari `.env.example`.
6. Tambahkan `API_URL` ke `.env.example` bila konfigurasi server-only memang diperlukan tim.
7. Evaluasi apakah hook `useInfinite*` perlu dipakai atau dihapus.

---

## 12. Referensi

Dokumen dan konfigurasi yang menjadi acuan langsung:

- `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`
- `.env.example`
- `app/`, `components/`, `hooks/`, `services/`, `types/`, `lib/`, `utils/`
- `../AGENTS.md` untuk aturan operasional lintasrepository
- `../PROJECT-DEVELOPMENT-GUIDELINE.md` untuk panduan pengembangan dan catatan audit lintasproyek
- `../wildlife-tracking-backend/routes/api.php` dan controller terkait untuk verifikasi endpoint
- `../wildlife-tracking-backend/README.md` untuk instalasi dan migrasi backend

Dokumen lain di folder parent seperti SKPL, DPPL, dan laporan perancangan dapat digunakan sebagai konteks persyaratan, tetapi tidak boleh menggantikan kode yang aktual saat menentukan fitur yang sudah berjalan.
