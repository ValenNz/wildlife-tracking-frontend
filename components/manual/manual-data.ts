import type { AppLocale } from "@/lib/i18n";

export type PeakKind =
  | "typography3d"
  | "rotatablePage"
  | "neuralConsole"
  | "livingWorld"
  | "tactileDeck"
  | "orbitalAtlas";

export type LocalizedText = Record<AppLocale, string>;

export type ManualStep = {
  id: string;
  heading: LocalizedText;
  body: LocalizedText;
  badge?: LocalizedText;
  details: LocalizedText[];
};

export type ManualLink = {
  href: string;
  label: LocalizedText;
};

export type ManualChapter = {
  id: string;
  number: string;
  peakKind: PeakKind;
  peakBadge: LocalizedText;
  title: LocalizedText;
  subtitle: LocalizedText;
  summary: LocalizedText;
  readMinutes: number;
  roles: LocalizedText[];
  steps: ManualStep[];
  tips: LocalizedText[];
  links: ManualLink[];
};

export const MANUAL_CHAPTERS: ManualChapter[] = [
  {
    id: "overview-roles",
    number: "01",
    peakKind: "typography3d",
    peakBadge: { id: "Halaman 3D Penuh", en: "Full-Page 3D Stage" },
    title: {
      id: "Pengenalan Sistem & 6 Role Pengguna",
      en: "System Overview & 6 User Roles",
    },
    subtitle: {
      id: "Memahami arsitektur, hak akses RBAC, keamanan sesi httpOnly, dan notifikasi berbasis role.",
      en: "Understand architecture, RBAC permissions, httpOnly session security, and role-scoped notifications.",
    },
    summary: {
      id: "Sistem Pemantauan Satwa Liar TNGL menggabungkan pelacakan GPS, analisis AI kamera jebak & audio, modul wisata & POS loket, serta ensiklopedia satwa 3D dalam satu portal terpadu.",
      en: "The TNGL Wildlife Monitoring System unifies GPS tracking, camera-trap & audio AI analysis, tourism & POS ticketing, and a 3D wildlife encyclopedia in one portal.",
    },
    readMinutes: 5,
    roles: [
      { id: "Semua 6 Role", en: "All 6 Roles" },
      { id: "RBAC Terpusat", en: "Centralized RBAC" },
    ],
    steps: [
      {
        id: "roles-matrix",
        badge: { id: "Hak Akses", en: "Access Control" },
        heading: {
          id: "Kenali 6 role & halaman awal masing-masing",
          en: "Know the 6 roles & their landing pages",
        },
        body: {
          id: "Setiap pengguna memiliki hak akses terpisah dari tabel role_permissions di backend sehingga menu dan endpoint API selalu sinkron.",
          en: "Every user receives granular permissions from the backend role_permissions table so sidebar menus and API endpoints stay strictly aligned.",
        },
        details: [
          {
            id: "Administrator Sistem: akses penuh seluruh modul konservasi, pengguna, role, wisata, dan POS.",
            en: "System Administrator: full access across conservation, users, roles, tourism, and POS.",
          },
          {
            id: "Peneliti Ekologi & Konservasionis Lapangan: masuk ke Dashboard; mengelola/memantau satwa, perangkat, insiden, dan verifikasi AI.",
            en: "Ecologist & Field Conservationist: land on Dashboard; manage/monitor wildlife, devices, incidents, and AI verification.",
          },
          {
            id: "Pengambil Kebijakan: akses baca Dashboard, Statistik, Laporan Agregat, dan Ekspor Data.",
            en: "Policymaker: read-only access to Dashboard, Statistics, Aggregate Reports, and Data Export.",
          },
          {
            id: "Petugas Loket masuk ke Kasir (POS) + Check-in; Pengunjung masuk ke Jelajah Tur tanpa akses data konservasi.",
            en: "Counter Staff land on Cashier (POS) + Check-in; Visitors land on Explore Tours with zero access to conservation data.",
          },
        ],
      },
      {
        id: "session-security",
        badge: { id: "Keamanan", en: "Security" },
        heading: {
          id: "Arsitektur proxy httpOnly & batas idle 2 jam",
          en: "httpOnly proxy architecture & 2-hour idle timeout",
        },
        body: {
          id: "Browser tidak pernah memanggil API Laravel secara langsung; seluruh panggilan melewati server action Next.js (backend-actions.ts).",
          en: "The browser never calls Laravel directly; every request proxies through Next.js server actions (backend-actions.ts).",
        },
        details: [
          {
            id: "Token Sanctum disimpan di cookie httpOnly sehingga tidak bisa dibaca skrip sisi klien (aman dari XSS).",
            en: "Sanctum tokens live in httpOnly cookies unreadable by client scripts (XSS protection).",
          },
          {
            id: "Jika tidak ada aktivitas selama 120 menit (2 jam), token dicabut otomatis dan layar diarahkan ke /login?reason=expired.",
            en: "After 120 minutes (2 hours) of inactivity, tokens revoke automatically and redirect to /login?reason=expired.",
          },
          {
            id: "Pendaftaran pengunjung di /register dilindungi CAPTCHA hitungan bertanda tangan HMAC (sekali pakai, minimal 2 detik) + honeypot.",
            en: "Visitor registration at /register is guarded by single-use HMAC math CAPTCHA (min 2s) + hidden honeypot.",
          },
        ],
      },
      {
        id: "scoped-notifications",
        badge: { id: "No-Show", en: "No-Show" },
        heading: {
          id: "Notifikasi semua role dengan isolasi ketat (no-show)",
          en: "All-role notifications with strict no-show isolation",
        },
        body: {
          id: "Seluruh 6 role dapat membuka menu Notifikasi di bagian Akun, namun jenis informasi disaring ketat di server maupun UI.",
          en: "All 6 roles can open Notifications under Account, while notification types are strictly filtered on both server and UI.",
        },
        details: [
          {
            id: "Admin, Peneliti, dan Konservasionis melihat Zona Risiko, Peringatan Perangkat, dan Sistem (+ relasi satwa/zona/perangkat).",
            en: "Admin, Ecologist, and Conservationist see Risk Zone, Device Alert, and System (+ animal/zone/device references).",
          },
          {
            id: "Pengambil Kebijakan hanya menerima Zona Risiko dan Sistem.",
            en: "Policymakers receive Risk Zone and System notifications only.",
          },
          {
            id: "Petugas Loket & Pengunjung hanya menerima notifikasi Sistem (pemesanan, e-tiket, kasir); log ancaman disembunyikan (404 no-show).",
            en: "Counter Staff & Visitors receive System notices only (bookings, e-tickets, cashier); threat logs are hidden (404 no-show).",
          },
        ],
      },
      {
        id: "theme-lang",
        badge: { id: "Preferensi", en: "Preferences" },
        heading: {
          id: "Mode Gelap/Terang & Pilihan Bahasa ID / EN",
          en: "Dark/Light Mode & ID / EN Language Switcher",
        },
        body: {
          id: "Tombol tema dan bahasa tersedia di header kanan atas serta halaman login, tersimpan di localStorage.",
          en: "Theme and language controls sit in the top-right header and login page, persisted in localStorage.",
        },
        details: [
          {
            id: "Mode Gelap/Terang mengikuti preferensi sistem secara bawaan dan dapat di-override manual tanpa kedipan awal (anti-FOUC).",
            en: "Dark/Light mode follows OS preference by default and can be manually overridden without initial flash (anti-FOUC).",
          },
          {
            id: "Mode EN menerjemahkan navigasi, tabel, label status, peta 3D, notifikasi, dan panduan; mode ID mengembalikan Bahasa Indonesia 100%.",
            en: "EN mode translates navigation, tables, status badges, 3D map, notifications, and manual; ID mode restores 100% Indonesian.",
          },
        ],
      },
    ],
    tips: [
      {
        id: "Gunakan menu Profil Saya untuk mengganti kata sandi secara berkala; token lama otomatis dicabut saat password diubah.",
        en: "Use My Profile to update your password regularly; old tokens revoke automatically on password change.",
      },
      {
        id: "Di server tim, selalu jalankan php artisan users:reset-default-passwords sebelum URL dibagikan.",
        en: "On team servers, always run php artisan users:reset-default-passwords before sharing the URL.",
      },
      {
        id: "Simbol Aksesibilitas & Asisten Suara AI di sisi kanan layar (Alt+A / Alt+V) membantu pengguna tunanetra bernavigasi, membacakan layar, dan menjalankan perintah suara dengan pilihan model suara serta kecepatan bicara.",
        en: "The Accessibility & Voice AI symbol on the right edge (Alt+A / Alt+V) helps visually impaired users navigate, hear page summaries, and run voice commands with selectable voice models and speech speed.",
      },
    ],
    links: [
      { href: "/notifications", label: { id: "Buka Notifikasi", en: "Open Notifications" } },
      { href: "/profile", label: { id: "Profil Saya", en: "My Profile" } },
    ],
  },
  {
    id: "tracking-incidents",
    number: "02",
    peakKind: "rotatablePage",
    peakBadge: { id: "Halaman 3D Dapat Diputar 360°", en: "360° Rotatable 3D Page" },
    title: {
      id: "Pelacakan Satwa, Perangkat & Laporan Insiden",
      en: "Wildlife Tracking, Devices & Incident Reports",
    },
    subtitle: {
      id: "Pantau pergerakan GPS real-time, kelola token perangkat lapangan, dan proses insiden baku.",
      en: "Monitor real-time GPS movement, manage field device tokens, and process standardized incidents.",
    },
    summary: {
      id: "Modul lapangan menghubungkan data master (spesies, individu satwa, perangkat, zona geografis) dengan pembacaan GPS anti-duplikat, kunjungan zona otomatis, dan pelaporan insiden.",
      en: "Field operations link master data (species, individual animals, devices, geo-zones) with deduplicated GPS ingestion, automated zone visits, and incident reporting.",
    },
    readMinutes: 6,
    roles: [
      { id: "Konservasionis", en: "Conservationist" },
      { id: "Peneliti", en: "Ecologist" },
      { id: "Admin", en: "Admin" },
    ],
    steps: [
      {
        id: "live-map",
        badge: { id: "Peta", en: "Map" },
        heading: {
          id: "Pantau posisi terbaru di Live Map & Wildlife Explorer",
          en: "Monitor latest positions on Live Map & Wildlife Explorer",
        },
        body: {
          id: "Buka Live Map untuk melihat titik GPS terbaru tiap satwa di atas poligon zona geografis, lalu telusuri jejak historis di Wildlife Explorer.",
          en: "Open Live Map to view latest GPS points over geo-zone polygons, then inspect historical tracks in Wildlife Explorer.",
        },
        details: [
          {
            id: "6 tipe zona: Zona Inti, Hutan Lindung, Koridor Ekologis, Jalan Raya, Perkebunan, dan Permukiman.",
            en: "6 zone types: Core Zone, Protected Forest, Ecological Corridor, Highway, Plantation, and Settlement.",
          },
          {
            id: "Titik GPS tunggal/bulk otomatis melewatkan duplikat (device + timestamp) dan memicu kunjungan zona serta cuaca.",
            en: "Single/bulk GPS ingestion skips duplicates (device + timestamp) and triggers zone visits and weather sync.",
          },
        ],
      },
      {
        id: "device-tokens",
        badge: { id: "Perangkat", en: "Devices" },
        heading: {
          id: "Kelola perangkat lapangan & token API khusus perangkat",
          en: "Manage field devices & dedicated device API tokens",
        },
        body: {
          id: "Tersedia 3 tipe perangkat: Kalung GPS (gps), Kamera Jebak (camera), dan Perekam Audio (audio) dengan pemantauan baterai & sinyal.",
          en: "Supports 3 device types: GPS Collar (gps), Camera Trap (camera), and Audio Recorder (audio) with battery & signal alerts.",
        },
        details: [
          {
            id: "Di /devices/[id]/detail, Peneliti/Admin dapat membuat token API khusus perangkat (ditampilkan 1 kali; token lama dicabut).",
            en: "At /devices/[id]/detail, Ecologists/Admins can issue device-scoped API tokens (shown once; revokes prior token).",
          },
          {
            id: "Token perangkat tidak kedaluwarsa karena idle dan hanya boleh mengirim telemetri, capture, atau GPS perangkat itu sendiri.",
            en: "Device tokens never idle-expire and are restricted to telemetry, captures, or GPS readings for that specific device.",
          },
        ],
      },
      {
        id: "incident-workflow",
        badge: { id: "Insiden", en: "Incidents" },
        heading: {
          id: "Alur status baku laporan insiden lapangan",
          en: "Standardized field incident status workflow",
        },
        body: {
          id: "Petugas lapangan mencatat konflik satwa, perambahan, perburuan, atau observasi lengkap dengan koordinat dan lampiran media bukti.",
          en: "Field officers log wildlife conflicts, encroachment, poaching, or observations with coordinates and media evidence.",
        },
        details: [
          {
            id: "Status baku divalidasi backend: Menunggu -> Diselidiki -> Selesai atau Ditolak.",
            en: "Backend-validated statuses: Pending -> Investigating -> Completed or Rejected.",
          },
          {
            id: "Satwa individu harus cocok dengan spesiesnya, zona dihitung ulang saat koordinat diubah, dan media dapat langsung dianalisis AI.",
            en: "Individual animals must match their species, zones recalculate on coordinate edits, and media can trigger AI analysis.",
          },
        ],
      },
      {
        id: "exports",
        badge: { id: "Ekspor", en: "Export" },
        heading: {
          id: "Ekspor CSV & GeoJSON aman untuk analisis GIS",
          en: "Safe CSV & GeoJSON exports for GIS analysis",
        },
        body: {
          id: "Menu Ekspor Data menyediakan unduhan CSV UTF-8 (dengan BOM) dan GeoJSON untuk GPS, zona, kunjungan zona, insiden, cuaca, dan AI.",
          en: "Data Export provides UTF-8 CSV (with BOM) and GeoJSON downloads for GPS, zones, zone visits, incidents, weather, and AI.",
        },
        details: [
          {
            id: "Semua sel teks yang diawali =, +, -, @ diberi awalan apostrof (') agar aman dari formula injection di Excel.",
            en: "Cells starting with =, +, -, @ are prefixed with an apostrophe (') to prevent Excel formula injection.",
          },
        ],
      },
    ],
    tips: [
      {
        id: "Perangkat berstatus nonaktif atau hilang otomatis ditolak (409/422) saat mencoba mengirim data.",
        en: "Devices marked inactive or lost are automatically rejected (409/422) when attempting to ingest data.",
      },
      {
        id: "Gunakan filter ?device_type=gps saat hanya ingin menampilkan kalung GPS satwa.",
        en: "Use ?device_type=gps when filtering specifically for animal GPS collars.",
      },
    ],
    links: [
      { href: "/tracking/live-map", label: { id: "Buka Live Map", en: "Open Live Map" } },
      { href: "/incidents", label: { id: "Daftar Insiden", en: "Incident List" } },
    ],
  },
  {
    id: "ai-pipeline",
    number: "03",
    peakKind: "neuralConsole",
    peakBadge: { id: "Karusel Silinder 3D AI", en: "3D Cylindrical AI Carousel" },
    title: {
      id: "Analisis AI Kamera Jebak, Audio & Wajah Staf",
      en: "AI Camera Trap, Audio & Staff Face Analysis",
    },
    subtitle: {
      id: "Mengunggah media lapangan, memahami 5 model AI lokal, fallback Groq, dan verifikasi petugas.",
      en: "Upload field media, understand the 5 local AI models, Groq fallback, and officer verification.",
    },
    summary: {
      id: "Layanan ai-service Python (port 8001) menjalankan YAMNet, MegaDetector, SpeciesNet, MegaDescriptor, dan YuNet/SFace gratis di CPU, dengan fallback otomatis ke Groq LLM bila ai-service mati.",
      en: "The Python ai-service (port 8001) runs YAMNet, MegaDetector, SpeciesNet, MegaDescriptor, and YuNet/SFace for free on CPU, falling back automatically to Groq LLM if offline.",
    },
    readMinutes: 6,
    roles: [
      { id: "Konservasionis", en: "Conservationist" },
      { id: "Peneliti", en: "Ecologist" },
      { id: "Admin", en: "Admin" },
    ],
    steps: [
      {
        id: "ai-upload",
        badge: { id: "Unggah Media", en: "Media Upload" },
        heading: {
          id: "Unggah gambar, video, atau audio di AI Vision",
          en: "Upload images, video, or audio in AI Vision",
        },
        body: {
          id: "Mendukung JPG/PNG/WEBP, video MP4/MOV/WEBM, dan audio WAV/MP3/M4A/OGG/FLAC hingga 50 MB (disimpan di storage privat).",
          en: "Supports JPG/PNG/WEBP, MP4/MOV/WEBM video, and WAV/MP3/M4A/OGG/FLAC audio up to 50 MB (stored in private storage).",
        },
        details: [
          {
            id: "Video diambil sampelnya 1 frame setiap 2 detik (maksimal 8 frame) sekaligus mengekstrak trek audio untuk analisis suara.",
            en: "Videos are sampled at 1 frame every 2 seconds (max 8 frames) while extracting the audio track for acoustic classification.",
          },
          {
            id: "Audio mendeteksi 10 kategori: suara satwa, tembakan, gergaji mesin, pohon tumbang, kebakaran, mesin, kendaraan, suara manusia, anjing, lingkungan.",
            en: "Audio classifies 10 categories: animal call, gunshot, chainsaw, tree falling, fire, engine, vehicle, human voice, dog bark, environment.",
          },
        ],
      },
      {
        id: "reid-faces",
        badge: { id: "Re-ID & Wajah", en: "Re-ID & Faces" },
        heading: {
          id: "Re-identifikasi individu satwa & pengenalan wajah staf",
          en: "Individual animal re-ID & staff face recognition",
        },
        body: {
          id: "MegaDescriptor mencocokkan individu satwa, sementara YuNet + SFace membedakan wajah staf TNGL dari orang tak dikenal.",
          en: "MegaDescriptor matches individual animals, while YuNet + SFace separates registered TNGL staff from unknown visitors.",
        },
        details: [
          {
            id: "Skor re-ID memadukan kemiripan visual (ambang 0.60), kedekatan kalung GPS (±6 jam), zona sama, dan ciri pembeda (distinctive_marks).",
            en: "Re-ID combines visual similarity (0.60 threshold), GPS collar proximity (±6h), zone presence, and distinctive_marks.",
          },
          {
            id: "Ambang wajah SFace: >= 0.40 staf terdaftar, 0.30–0.40 perlu verifikasi, di bawah 0.30 tidak dikenal.",
            en: "SFace face thresholds: >= 0.40 registered staff, 0.30–0.40 needs verification, below 0.30 unknown.",
          },
        ],
      },
      {
        id: "ai-verify",
        badge: { id: "Verifikasi", en: "Verification" },
        heading: {
          id: "Wajib verifikasi petugas untuk hasil AI & ancaman",
          en: "Mandatory officer verification for AI & threat alerts",
        },
        body: {
          id: "Deteksi ancaman tinggi otomatis membuat laporan insiden dan notifikasi risk_zone ke petugas lapangan serta admin.",
          en: "High-threat detections automatically generate incident reports and risk_zone notifications to field officers and admins.",
        },
        details: [
          {
            id: "Kondisi fisik, perilaku, dan ancaman visual dinilai Groq LLM sehingga wajib diverifikasi petugas di menu Verifikasi AI.",
            en: "Physical condition, behavior, and visual threats are estimated by Groq LLM and require officer verification in AI Verification.",
          },
          {
            id: "Jika prediksi berstatus gagal atau memakai model groq:..., klik Analisis Ulang setelah ai-service aktif.",
            en: "If a prediction failed or used groq:... fallback, click Retry Analysis once ai-service is running.",
          },
        ],
      },
      {
        id: "ai-recap",
        badge: { id: "Rekap & PDF", en: "Recap & PDF" },
        heading: {
          id: "Rekap Data AI, Wajah Staf & ekspor PDF",
          en: "AI Data Recap, Staff Faces & PDF export",
        },
        body: {
          id: "Admin dapat mendaftarkan foto wajah staf di menu Wajah Staf, lalu memantau tren ancaman dan mencetak Rekap Data AI ke PDF.",
          en: "Admins register staff face photos in Staff Faces, then monitor threat trends and print AI Data Recap to PDF.",
        },
        details: [
          {
            id: "Daftarkan 10+ foto wajah staf dari berbagai sudut dan pencahayaan (termasuk kamera lapangan) untuk akurasi terbaik.",
            en: "Register 10+ staff face photos across angles and lighting (including field cameras) for best recognition accuracy.",
          },
          {
            id: "Foto & embedding wajah staf adalah data biometrik; hapus segera data staf yang sudah keluar.",
            en: "Staff face photos & embeddings are biometric data; delete records immediately when staff depart.",
          },
        ],
      },
    ],
    tips: [
      {
        id: "Pastikan ai-service berjalan di http://127.0.0.1:8001/health dengan keempat model berstatus loaded: true.",
        en: "Ensure ai-service is running at http://127.0.0.1:8001/health with all 4 models showing loaded: true.",
      },
      {
        id: "Aktifkan AI_QUEUE=true di backend jika banyak unggahan berjalan bersamaan agar request HTTP tidak menunggu.",
        en: "Set AI_QUEUE=true in backend when handling concurrent uploads so HTTP requests do not block.",
      },
    ],
    links: [
      { href: "/ai/vision", label: { id: "Buka AI Vision", en: "Open AI Vision" } },
      { href: "/ai/vision/pending", label: { id: "Verifikasi AI", en: "AI Verification" } },
      { href: "/ai/staff-faces", label: { id: "Wajah Staf", en: "Staff Faces" } },
    ],
  },
  {
    id: "tourism-3d-world",
    number: "04",
    peakKind: "livingWorld",
    peakBadge: { id: "Gunung Leuser 3D + POI", en: "3D Leuser Mountain + POIs" },
    title: {
      id: "Wisata TNGL, Peta 3D & Pembayaran Otomatis",
      en: "TNGL Tourism, 3D Map & Automated Payment",
    },
    subtitle: {
      id: "Putar gunung 3D atau pilih titik POI untuk zoom ke sisi gunung: jelajah rute, tarif PNBP, bayar instan, & e-tiket.",
      en: "Orbit the 3D mountain or select a POI to zoom into that mountain side: trails, PNBP tariffs, instant pay & e-tickets.",
    },
    summary: {
      id: "Pengunjung dapat menjelajahi rute wisata dalam 3D, melihat profil ketinggian dan jadwal pemandu, memesan tiket dengan tarif PP 36/2024 yang dihitung server, dan membayar otomatis via Simulator Gateway atau Midtrans.",
      en: "Visitors can explore tour routes in 3D, inspect elevation profiles and guide shifts, book tickets with server-calculated PP 36/2024 tariffs, and pay automatically via the Gateway Simulator or Midtrans.",
    },
    readMinutes: 6,
    roles: [
      { id: "Pengunjung", en: "Visitor" },
      { id: "Pengelola Wisata", en: "Tourism Admin" },
    ],
    steps: [
      {
        id: "map-3d-explore",
        badge: { id: "Peta 3D", en: "3D Map" },
        heading: {
          id: "Jelajahi rute dengan Satelit, Topografi, Peta & Fly-Through",
          en: "Explore trails with Satellite, Topography, Map & Fly-Through",
        },
        body: {
          id: "Peta 3D menampilkan relief Bukit Barisan secara gratis tanpa API key berbayar, lengkap dengan HUD koordinat & ketinggian (mdpl).",
          en: "The 3D Map renders Bukit Barisan terrain using free no-API-key tile sources, complete with a live coordinates & elevation (masl) HUD.",
        },
        details: [
          {
            id: "3 mode basemap: Satelit (Esri Imagery + overlay Label & Jalan), Topografi (OpenTopoMap), dan Peta (Esri World Street).",
            en: "3 basemap modes: Satellite (Esri Imagery + Labels & Roads overlay), Topography (OpenTopoMap), and Map (Esri World Street).",
          },
          {
            id: "Atur skala relief (1x, 1.8x, 2.5x), lihat penanda titik Mulai & Puncak, lalu tekan Fly-through (kecepatan 1x/2x + Jeda/Lanjut).",
            en: "Adjust relief scale (1x, 1.8x, 2.5x), inspect Start & Peak markers, and launch Fly-through (1x/2x speed + Pause/Resume).",
          },
        ],
      },
      {
        id: "booking-pnbp",
        badge: { id: "Tarif PNBP", en: "PNBP Tariffs" },
        heading: {
          id: "Pilih shift & hitung tarif PNBP PP 36/2024 di server",
          en: "Pick a shift & compute PP 36/2024 PNBP tariffs server-side",
        },
        body: {
          id: "Kuota shift dikunci dengan transaksi lockForUpdate agar pemesanan bersamaan tidak pernah melebihi kapasitas pemandu.",
          en: "Shift quotas lock via lockForUpdate transactions so concurrent bookings never overbook guide capacity.",
        },
        details: [
          {
            id: "WNI: Rp10.000 (Senin–Sabtu) / Rp15.000 (Minggu & libur nasional).",
            en: "WNI (Indonesian citizen): Rp10,000 (Mon–Sat) / Rp15,000 (Sunday & national holidays).",
          },
          {
            id: "Pelajar/Mahasiswa (min. 5 orang): Rp5.000 / Rp7.500; WNA: Rp150.000; Drone: Rp2.000.000/unit/hari.",
            en: "Students (min. 5 people): Rp5,000 / Rp7,500; WNA (Foreign): Rp150,000; Drone: Rp2,000,000/unit/day.",
          },
          {
            id: "Pemesanan ditutup 2 jam sebelum jam mulai shift; isi nama setiap peserta sesuai kategori.",
            en: "Bookings close 2 hours before shift start; enter each participant's name matching their ticket category.",
          },
        ],
      },
      {
        id: "auto-payment",
        badge: { id: "Bayar Instan", en: "Instant Pay" },
        heading: {
          id: "Bayar via Simulator Gateway Otomatis (QRIS / VA / E-Wallet)",
          en: "Pay via Automated Gateway Simulator (QRIS / VA / E-Wallet)",
        },
        body: {
          id: "Menghilangkan antrean verifikasi manual petugas: sekali bayar di gateway, status langsung lunas dan tiket terbit otomatis.",
          en: "Eliminates manual staff verification queues: once paid at the gateway, status updates to paid and tickets issue automatically.",
        },
        details: [
          {
            id: "Mode Simulator (PAYMENT_SIMULATOR_ENABLED=true): pilih QRIS Instan (QR ter-generate di browser), VA (BCA/BNI/BRI/Mandiri), atau E-Wallet (GoPay/OVO/DANA/ShopeePay).",
            en: "Simulator Mode (PAYMENT_SIMULATOR_ENABLED=true): choose Instant QRIS (browser QR), VA (BCA/BNI/BRI/Mandiri), or E-Wallet (GoPay/OVO/DANA/ShopeePay).",
          },
          {
            id: "Juga mendukung Midtrans Snap (jika MIDTRANS_SERVER_KEY diisi) dan unggah bukti transfer manual (JPG/PNG/WEBP/PDF maks. 5 MB).",
            en: "Also supports Midtrans Snap (when MIDTRANS_SERVER_KEY is set) and manual proof upload (JPG/PNG/WEBP/PDF max 5 MB).",
          },
        ],
      },
      {
        id: "eticket-review",
        badge: { id: "E-Tiket", en: "E-Ticket" },
        heading: {
          id: "Tunjukkan E-Tiket QR saat check-in & tulis ulasan",
          en: "Show your QR E-Ticket at check-in & leave a review",
        },
        body: {
          id: "Tiket QR memakai token bertanda tangan HMAC dari APP_KEY sehingga tidak dapat dipalsukan dan hanya berlaku 1 kali.",
          en: "QR tickets use HMAC tokens signed with APP_KEY so they cannot be forged and are valid for a single check-in.",
        },
        details: [
          {
            id: "Check-in hanya valid pada tanggal kunjungan (zona waktu Asia/Jakarta / WIB). Datang 30 menit lebih awal di titik kumpul.",
            en: "Check-in is valid only on the visit date (Asia/Jakarta / WIB). Arrive 30 minutes early at the meeting point.",
          },
          {
            id: "Setelah check-in, pengunjung dapat menulis 1 ulasan untuk rute dan pemandu (nama pengulas disingkat untuk privasi).",
            en: "After check-in, visitors can submit 1 review for the route and guide (reviewer name is abbreviated for privacy).",
          },
        ],
      },
    ],
    tips: [
      {
        id: "Batas waktu pembayaran 60 menit; tagihan kedaluwarsa otomatis melepas kuota shift setiap 5 menit.",
        en: "Payment window is 60 minutes; expired bookings release shift quota automatically every 5 minutes.",
      },
      {
        id: "Pesanan berstatus lunas hanya dapat dibatalkan/di-refund melalui petugas pengelola wisata.",
        en: "Paid bookings can only be cancelled/refunded by tourism admin staff.",
      },
    ],
    links: [
      { href: "/tours", label: { id: "Jelajah Tur", en: "Explore Tours" } },
      { href: "/tours/map-3d", label: { id: "Buka Peta 3D", en: "Open 3D Map" } },
      { href: "/bookings", label: { id: "Pesanan Saya", en: "My Bookings" } },
    ],
  },
  {
    id: "pos-checkin",
    number: "05",
    peakKind: "tactileDeck",
    peakBadge: { id: "Dek Kartu Taktil 3D", en: "3D Tactile Card Deck" },
    title: {
      id: "POS Loket (Walk-In) & Check-In Tiket",
      en: "Ticket Counter POS (Walk-In) & Check-In",
    },
    subtitle: {
      id: "Prosedur buka/tutup sesi kasir, penjualan tiket walk-in, struk thermal 58/80 mm, void & laporan PNBP.",
      en: "Cashier session workflow, walk-in ticket sales, 58/80 mm thermal receipts, void & PNBP reports.",
    },
    summary: {
      id: "Petugas Loket melayani pengunjung datang langsung (walk-in) dengan kuota bersama pemesanan online, kembalian tunai otomatis, cetak struk thermal, dan validasi QR gerbang masuk.",
      en: "Counter staff serve walk-in visitors using shared quotas synced with online bookings, auto cash change, thermal receipt printing, and gate QR validation.",
    },
    readMinutes: 5,
    roles: [
      { id: "Petugas Loket", en: "Counter Staff" },
      { id: "Admin", en: "Admin" },
    ],
    steps: [
      {
        id: "open-cashier",
        badge: { id: "Buka Kas", en: "Open Shift" },
        heading: {
          id: "Buka sesi kas dengan modal awal uang kembalian",
          en: "Open a cashier session with starting change",
        },
        body: {
          id: "Sebelum transaksi pertama, kasir wajib membuka sesi kas dengan nama loket dan nominal modal awal.",
          en: "Before the first sale, the cashier must open a session with a counter name and opening cash float.",
        },
        details: [
          {
            id: "Satu kasir hanya boleh memiliki 1 sesi kas terbuka; transaksi dan riwayat kasir lain terisolasi.",
            en: "One cashier may have only 1 open session at a time; other cashiers' sessions and sales are isolated.",
          },
        ],
      },
      {
        id: "walkin-sale",
        badge: { id: "Jual Tiket", en: "Sell Ticket" },
        heading: {
          id: "Pilih rute, shift, & metode bayar (Tunai / QRIS / EDC)",
          en: "Select route, shift, & payment method (Cash / QRIS / EDC)",
        },
        body: {
          id: "Shift di loket masih dapat dijual hingga 30 menit setelah jam mulai dengan kuota real-time bersama booking online.",
          en: "Shifts remain sellable at the counter up to 30 minutes past start time, sharing real-time quota with online bookings.",
        },
        details: [
          {
            id: "Pembayaran Tunai menyediakan tombol pecahan cepat dan menghitung kembalian otomatis; QRIS/EDC mencatat nomor referensi.",
            en: "Cash payments provide quick denomination buttons and auto-calculate change; QRIS/EDC record reference numbers.",
          },
          {
            id: "Struk thermal 58 mm atau 80 mm tercetak lewat iframe terisolasi lengkap dengan porsi PNBP dan QR tiket.",
            en: "58 mm or 80 mm thermal receipts print via an isolated iframe with PNBP breakdown and ticket QR.",
          },
        ],
      },
      {
        id: "void-close",
        badge: { id: "Tutup Kas", en: "Close Shift" },
        heading: {
          id: "Void transaksi bermasalah & tutup kas dengan hitung fisik",
          en: "Void erroneous sales & close session with physical count",
        },
        body: {
          id: "Kontrol anti-kecurangan memastikan setiap pembatalan transaksi dan selisih kas terekam permanen.",
          en: "Anti-fraud controls ensure every voided transaction and cash variance is permanently audited.",
        },
        details: [
          {
            id: "Void hanya bisa dilakukan oleh kasir penjual selama sesi terbuka dengan alasan minimal 5 karakter; tiket void langsung hangus.",
            en: "Only the selling cashier can void during an open session with a >=5-char reason; voided tickets invalidate immediately.",
          },
          {
            id: "Saat Tutup Kas, sistem membandingkan kas seharusnya (modal + tunai sah) dengan hitungan fisik dan mencetak laporan X/Z.",
            en: "On Close Shift, the system compares expected cash (float + valid cash sales) with physical count and prints X/Z reports.",
          },
        ],
      },
      {
        id: "qr-checkin",
        badge: { id: "Check-In", en: "Check-In" },
        heading: {
          id: "Validasi E-Tiket QR pengunjung & Laporan Harian",
          en: "Validate visitor QR E-Tickets & Daily Report",
        },
        body: {
          id: "Petugas loket memindai QR pengunjung di gerbang masuk; admin memantau Laporan Harian gabungan online + loket.",
          en: "Counter staff scan visitor QRs at the entrance; admins monitor the combined online + counter Daily Report.",
        },
        details: [
          {
            id: "Laporan Harian (/pos/report) memisahkan pendapatan PNBP (untuk setoran kas negara) dan jasa pemandu per tanggal bayar WIB.",
            en: "Daily Report (/pos/report) separates PNBP revenue (for state treasury) from guide fees by WIB payment date.",
          },
        ],
      },
    ],
    tips: [
      {
        id: "Aktifkan Chrome --kiosk-printing di komputer loket agar struk thermal tercetak sekali klik.",
        en: "Enable Chrome --kiosk-printing on counter PCs for one-click thermal receipt printing.",
      },
      {
        id: "Lebar kertas struk (58 mm / 80 mm) disimpan per komputer di localStorage.",
        en: "Receipt paper width (58 mm / 80 mm) is saved per computer in localStorage.",
      },
    ],
    links: [
      { href: "/pos", label: { id: "Buka Kasir (POS)", en: "Open Cashier (POS)" } },
      { href: "/tourism/check-in", label: { id: "Check-in Tiket", en: "Ticket Check-in" } },
      { href: "/pos/sessions", label: { id: "Riwayat Sesi Kas", en: "Cashier Sessions" } },
    ],
  },
  {
    id: "wildlife-3d-help",
    number: "06",
    peakKind: "orbitalAtlas",
    peakBadge: { id: "Tata Surya 3D Satwa & Bantuan", en: "3D Wildlife Solar System" },
    title: {
      id: "Ensiklopedia Satwa 3D & Bantuan Cepat",
      en: "3D Wildlife Encyclopedia & Quick Help",
    },
    subtitle: {
      id: "Pilih salah satu planet untuk zoom ke sub-bab: 8 satwa 3D, unggah GLB, privasi anti-perburuan & troubleshooting.",
      en: "Click any planet to zoom into its sub-chapter: 8 3D species, GLB upload, anti-poaching privacy & troubleshooting.",
    },
    summary: {
      id: "Ensiklopedia Satwa 3D menyajikan profil ekologi dan model 3D/AR interaktif dengan titik keterangan bernomor tanpa membocorkan lokasi individu satwa demi mencegah perburuan liar.",
      en: "The 3D Wildlife Encyclopedia presents ecological profiles and interactive 3D/AR models with numbered annotations while hiding individual animal locations to prevent poaching.",
    },
    readMinutes: 5,
    roles: [
      { id: "Semua 6 Role", en: "All 6 Roles" },
    ],
    steps: [
      {
        id: "explore-3d",
        badge: { id: "8 Satwa 3D", en: "8 3D Species" },
        heading: {
          id: "Putar, perbesar, AR & klik titik keterangan di model 3D",
          en: "Rotate, zoom, AR & click annotation hotspots on 3D models",
        },
        body: {
          id: "Tersedia 8 satwa prioritas TNGL lengkap dengan status IUCN, Permen LHK P.106/2018, dan CITES.",
          en: "Explore 8 priority TNGL species complete with IUCN, Permen LHK P.106/2018, and CITES protection statuses.",
        },
        details: [
          {
            id: "8 satwa: Orangutan Sumatra, Harimau Sumatra, Badak Sumatra, Gajah Sumatra, Rusa Sambar, Siamang, Rangkong Badak, dan Beruang Madu.",
            en: "8 species: Sumatran Orangutan, Tiger, Rhino, Elephant, Sambar Deer, Siamang, Rhinoceros Hornbill, and Sun Bear.",
          },
          {
            id: "Klik titik keterangan bernomor pada tubuh satwa untuk mengarahkan kamera ke ciri anatomi, atau buka AR (WebXR) di ponsel.",
            en: "Click numbered hotspots on the body to focus the camera on key traits, or launch AR (WebXR) on supported mobile devices.",
          },
        ],
      },
      {
        id: "manage-glb",
        badge: { id: "Kelola GLB", en: "Manage GLB" },
        heading: {
          id: "Unggah model .glb & pasang hotspot baru (Peneliti / Admin)",
          en: "Upload .glb models & place new hotspots (Ecologist / Admin)",
        },
        body: {
          id: "Pemilik izin manage_master_data dapat memperbarui profil ekologi, menyembunyikan spesies, dan mengganti model 3D bawaan.",
          en: "Users with manage_master_data can edit ecological profiles, hide species from public view, and replace built-in 3D models.",
        },
        details: [
          {
            id: "Berkas .glb divalidasi ketat di backend: header glTF 2.0 valid, ukuran maks. 30 MB, dan ditolak jika memuat URL eksternal.",
            en: ".glb uploads are strictly validated server-side: valid glTF 2.0 header, max 30 MB, and rejected if containing external URLs.",
          },
          {
            id: "Untuk menambah titik keterangan, cukup klik langsung permukaan model 3D lalu isi label dan deskripsinya.",
            en: "To add an annotation hotspot, click directly on the 3D model surface and enter its label and description.",
          },
        ],
      },
      {
        id: "privacy-anti-poach",
        badge: { id: "Privasi", en: "Privacy" },
        heading: {
          id: "Keamanan lokasi individu satwa & pencegahan perburuan",
          en: "Individual wildlife location security & anti-poaching",
        },
        body: {
          id: "Katalog publik /wildlife-3d memisahkan data edukasi spesies dari koordinat GPS lapangan.",
          en: "The public /wildlife-3d catalog strictly separates species education from live field GPS coordinates.",
        },
        details: [
          {
            id: "Endpoint publik tidak pernah mengirim titik koordinat GPS, daftar individu satwa, atau zona kemunculan spesifik.",
            en: "Public endpoints never expose GPS coordinates, individual animal records, or specific sighting zones.",
          },
          {
            id: "Model .glb dimuat melalui proxy sebagai blob agar URL penyimpanan backend tetap privat.",
            en: ".glb models load through a proxy as blobs so backend storage paths remain private.",
          },
        ],
      },
      {
        id: "troubleshooting",
        badge: { id: "Bantuan Cepat", en: "Quick Help" },
        heading: {
          id: "Solusi cepat kendala login, AI service & server lokal",
          en: "Quick fixes for login, AI service & local server issues",
        },
        body: {
          id: "Panduan ringkas mengatasi pesan error umum saat menjalankan aplikasi di laptop atau server tim.",
          en: "Quick checklist to resolve common errors when running the app locally or on a team server.",
        },
        details: [
          {
            id: "HTTP 500 saat login: pastikan APP_KEY sudah dibuat (php artisan key:generate) dan migrasi+seeder sudah dijalankan.",
            en: "HTTP 500 on login: ensure APP_KEY is generated (php artisan key:generate) and migrations+seeders have run.",
          },
          {
            id: "cURL error 7 ke 127.0.0.1:8001 di AI / Wajah Staf: jalankan ai-service (uvicorn app:app --host 127.0.0.1 --port 8001).",
            en: "cURL error 7 to 127.0.0.1:8001 in AI / Staff Faces: start ai-service (uvicorn app:app --host 127.0.0.1 --port 8001).",
          },
          {
            id: "Sesi tiba-tiba keluar: batas idle 2 jam tercapai atau password akun direset oleh admin.",
            en: "Unexpected logout: 2-hour idle timeout elapsed or account password was reset by an admin.",
          },
        ],
      },
    ],
    tips: [
      {
        id: "Model bawaan saat ini berlabel ilustratif; ganti dengan hasil pemindaian fotogrametri atau model berlisensi kapan saja.",
        en: "Built-in models are labeled illustrative; replace them with photogrammetry scans or licensed models anytime.",
      },
      {
        id: "Selalu jalankan php artisan security:check sebelum membuka server ke jaringan publik/tim.",
        en: "Always run php artisan security:check before exposing the server to a team or public network.",
      },
    ],
    links: [
      { href: "/tracking/live-map", label: { id: "Buka Live Map & Gunung 3D", en: "Open Live Map & 3D Mountain" } },
      { href: "/dashboard", label: { id: "Kembali ke Dashboard", en: "Back to Dashboard" } },
    ],
  },
];
