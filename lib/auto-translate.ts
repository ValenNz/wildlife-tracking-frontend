/**
 * Mesin penerjemah Bahasa Indonesia -> Bahasa Inggris untuk seluruh antarmuka frontend.
 * Menjaga istilah/kode teknis (TNGL, BBTNGL, QRIS, PNBP, WIB, WNI, WNA, kode booking, URL, email) tetap utuh,
 * dan hanya aktif saat mode bahasa = "en". Mode "id" mengembalikan teks asli 100%.
 */

const EXACT_MAP: Record<string, string> = {
  // --- Auth & Login/Register ---
  "SELAMAT DATANG": "WELCOME",
  "Selamat datang": "Welcome",
  "Masuk ke akun": "Sign in to your account",
  "Masukkan email dan kata sandi untuk mengakses sistem pemantauan satwa liar.":
    "Enter your email and password to access the wildlife monitoring system.",
  "Menjaga Satwa,": "Protecting Wildlife,",
  "Melindungi Alam.": "Preserving Nature.",
  "Pantau pergerakan satwa liar dan dukung upaya konservasi melalui sistem pemantauan berbasis GPS.":
    "Monitor wildlife movements and support conservation efforts through a GPS-based tracking system.",
  "Balai Taman Nasional": "National Park Office",
  "Taman Nasional Gunung Leuser": "Gunung Leuser National Park",
  "Balai Taman Nasional Gunung Leuser": "Gunung Leuser National Park Office",
  "Logo Taman Nasional Gunung Leuser": "Gunung Leuser National Park Logo",
  "Navigasi utama": "Main navigation",
  "Daftar halaman": "Page list",
  "Skala relief": "Relief scale",
  "Kata sandi": "Password",
  "Ingat saya": "Remember me",
  "Masuk": "Sign in",
  "Memproses...": "Processing...",
  "Belum punya akun?": "Don't have an account?",
  "Daftar sebagai pengunjung": "Register as visitor",
  "Buat akun pengunjung": "Create visitor account",
  "Sudah punya akun?": "Already have an account?",
  "Masuk di sini": "Sign in here",
  "Sesi Anda telah berakhir. Silakan login kembali.":
    "Your session has expired. Please sign in again.",
  "Data pengguna tidak valid. Silakan login kembali.":
    "Invalid user data. Please sign in again.",
  "Tidak dapat memverifikasi sesi dengan backend. Silakan coba lagi.":
    "Unable to verify session with backend. Please try again.",
  "Anda tidak memiliki akses ke halaman tersebut.":
    "You do not have access to that page.",
  "Email atau password salah.": "Invalid email or password.",
  "Login berhasil": "Login successful",
  "Logout berhasil.": "Logged out successfully.",
  "Pilih rute & jadwal": "Choose route & schedule",
  "Tiket QR resmi": "Official QR ticket",
  "Tarif PNBP PP 36/2024 dihitung otomatis oleh sistem.":
    "PNBP PP 36/2024 tariffs are calculated automatically by the system.",
  "Pemandu bersertifikat": "Certified guides",
  "Lihat profil dan shift pemandu sebelum memesan.":
    "View guide profiles and shifts before booking.",
  "Ganti soal": "New challenge",
  "Setujui ketentuan kunjungan terlebih dahulu.":
    "Please agree to the visitor terms first.",

  // --- Dashboard ---
  "Dashboard Pemantauan Satwa": "Wildlife Monitoring Dashboard",
  "Pantau aktivitas satwa liar, kondisi perangkat GPS, dan laporan lapangan dalam satu tempat.":
    "Monitor wildlife activity, GPS device health, and field reports in one place.",
  "Masuk sebagai": "Signed in as",
  "Lihat Peta Pelacakan": "View Tracking Map",
  "Ringkasan Pemantauan": "Monitoring Summary",
  "Gambaran umum aktivitas pemantauan satwa.":
    "Overview of wildlife monitoring activities.",
  "Total Satwa": "Total Wildlife",
  "Spesies terpantau": "Monitored species",
  "Perangkat Aktif": "Active Devices",
  "Pembacaan GPS": "GPS readings",
  "Data pemantauan": "Monitoring data",
  "Akses Cepat": "Quick Access",
  "Buka fitur pemantauan yang sering digunakan.":
    "Open frequently used monitoring features.",
  "Peta Pelacakan": "Tracking Map",
  "Lihat lokasi satwa pada peta": "View wildlife locations on the map",
  "Data Satwa": "Wildlife Data",
  "Lihat satwa yang terdaftar": "View registered wildlife",
  "Perangkat GPS": "GPS Devices",
  "Periksa status perangkat": "Check device status",
  "Laporan Insiden": "Incident Reports",
  "Lihat laporan dari lapangan": "View field reports",
  "Perangkat yang perlu diperiksa.": "Devices requiring attention.",
  "Lihat semua": "View all",
  "Lokasi Terbaru": "Latest Locations",
  "Aktivitas pembacaan GPS terbaru.": "Recent GPS reading activity.",
  "Buka peta": "Open map",
  "Terpantau": "Monitored",
  "Laporan Insiden Terbaru": "Latest Incident Reports",
  "Laporan yang membutuhkan perhatian.": "Reports requiring attention.",
  "Menunggu Sinkron": "Pending Sync",
  "Gagal Sinkron": "Sync Failed",
  "Tersinkron": "Synced",
  "Satwa terlihat sehat, bergerak normal":
    "Wildlife appears healthy, moving normally",
  "Satwa masuk area perkebunan warga":
    "Wildlife entered local plantation area",
  "Perangkat GPS sinyal lemah": "GPS device weak signal",
  "Satwa melintasi jalan raya": "Wildlife crossing highway",
  "Ditemukan aktivitas ilegal di zona lindung":
    "Illegal activity detected in protected zone",

  // --- Common UI / Table / Actions ---
  "Memuat data...": "Loading data...",
  "Memuat...": "Loading...",
  "Tidak ada data": "No data available",
  "Data tidak ditemukan": "Data not found",
  "Aksi": "Actions",
  "Tindakan": "Actions",
  "Detail": "Detail",
  "Lihat": "View",
  "Ubah": "Edit",
  "Edit": "Edit",
  "Hapus": "Delete",
  "Tambah": "Add",
  "Buat": "Create",
  "Simpan": "Save",
  "Simpan Perubahan": "Save Changes",
  "Batal": "Cancel",
  "Kembali": "Back",
  "Tutup": "Close",
  "Cari": "Search",
  "Filter": "Filter",
  "Reset": "Reset",
  "Terapkan": "Apply",
  "Cetak": "Print",
  "Unduh": "Download",
  "Unggah": "Upload",
  "Segarkan": "Refresh",
  "Muat ulang": "Reload",
  "Coba Lagi": "Try Again",
  "Ya": "Yes",
  "Tidak": "No",
  "Semua": "All",
  "Aktif": "Active",
  "Nonaktif": "Inactive",
  "Status": "Status",
  "Tanggal": "Date",
  "Waktu": "Time",
  "Catatan": "Notes",
  "Deskripsi": "Description",
  "Keterangan": "Description",
  "Lokasi": "Location",
  "Koordinat": "Coordinates",
  "Nama": "Name",
  "Nama Lengkap": "Full Name",
  "Email": "Email",
  "Telepon": "Phone",
  "Nomor Telepon": "Phone Number",
  "Alamat": "Address",
  "Role": "Role",
  "Dibuat": "Created",
  "Diperbarui": "Updated",
  "Sebelumnya": "Previous",
  "Berikutnya": "Next",
  "Total": "Total",

  // --- Role Labels ---
  "Administrator Sistem": "System Administrator",
  "Peneliti Ekologi": "Ecologist",
  "Konservasionis Lapangan": "Field Conservationist",
  "Pengambil Kebijakan": "Policymaker",
  "Petugas Loket": "Ticket Counter Staff",
  "Pengunjung": "Visitor",

  // --- Conservation / Species / Animal / Device / Zone ---
  "Risiko Rendah (Least Concern)": "Least Concern",
  "Hampir Terancam (Near Threatened)": "Near Threatened",
  "Rentan (Vulnerable)": "Vulnerable",
  "Terancam (Endangered)": "Endangered",
  "Kritis (Critically Endangered)": "Critically Endangered",
  "Punah di Alam Liar (Extinct in the Wild)": "Extinct in the Wild",
  "Punah (Extinct)": "Extinct",
  "Data Tidak Memadai (Data Deficient)": "Data Deficient",
  "Kritis": "Critically Endangered",
  "Genting": "Endangered",
  "Rentan": "Vulnerable",
  "Hampir Terancam": "Near Threatened",
  "Risiko Rendah": "Least Concern",
  "Kurang Data": "Data Deficient",
  "Punah di Alam": "Extinct in the Wild",
  "Punah": "Extinct",
  "Model ilustratif": "Illustrative model",
  "Hasil pemindaian 3D": "3D scan model",
  "Model berlisensi": "Licensed model",
  "Kalung GPS": "GPS Collar",
  "Kamera Jebak": "Camera Trap",
  "Perekam Audio": "Audio Recorder",
  "Normal": "Normal",
  "Rusak": "Damaged",
  "Hilang": "Lost",
  "Permukiman": "Settlement",
  "Perkebunan": "Plantation",
  "Jalan Raya": "Highway",
  "Koridor Ekologis": "Ecological Corridor",
  "Hutan Lindung": "Protected Forest",
  "Zona Inti": "Core Zone",
  "Jantan": "Male",
  "Betina": "Female",
  "Konflik Satwa": "Wildlife Conflict",
  "Perambahan": "Encroachment",
  "Perburuan": "Poaching",
  "Observasi": "Observation",
  "Alert Perangkat": "Device Alert",
  "Menunggu": "Pending",
  "Diselidiki": "Investigating",
  "Selesai": "Completed",
  "Ditolak": "Rejected",

  // --- AI Labels ---
  "Antrean": "Queued",
  "Diproses": "Processing",
  "Gagal": "Failed",
  "Tidak Dikenali": "Unrecognized",
  "Menunggu Verifikasi": "Awaiting Verification",
  "Terkonfirmasi": "Confirmed",
  "Tidak Ada": "None",
  "Rendah": "Low",
  "Sedang": "Medium",
  "Tinggi": "High",
  "Sehat": "Healthy",
  "Terluka": "Injured",
  "Sakit": "Sick",
  "Kurus": "Emaciated",
  "Tidak Diketahui": "Unknown",
  "Mencari Makan": "Foraging",
  "Istirahat": "Resting",
  "Bergerak": "Moving",
  "Berlari": "Running",
  "Minum": "Drinking",
  "Sosial": "Social",
  "Merawat Anak": "Parenting",
  "Kawin": "Mating",
  "Waspada": "Alert",
  "Agresif": "Aggressive",
  "Suara Satwa": "Animal Call",
  "Tembakan": "Gunshot",
  "Gergaji Mesin": "Chainsaw",
  "Pohon Tumbang": "Tree Falling",
  "Kebakaran": "Fire",
  "Mesin": "Engine",
  "Kendaraan": "Vehicle",
  "Suara Manusia": "Human Voice",
  "Gonggongan Anjing": "Dog Bark",
  "Lingkungan": "Environment",
  "Staf terdaftar": "Registered staff",
  "Perlu verifikasi": "Needs verification",
  "Tidak dikenal": "Unknown",
  "Kemiripan penampilan": "Appearance similarity",
  "Kedekatan kalung GPS": "GPS collar proximity",
  "Berada di zona yang sama": "Same zone presence",
  "Ciri fisik": "Distinctive marks",
  "Kandidat tunggal": "Single candidate",

  // --- Tourism / Booking / Payment / POS ---
  "Wisata TN Gunung Leuser": "Gunung Leuser NP Tourism",
  "Jelajah Tur & Rute": "Explore Tours & Routes",
  "Pilih rute, cek jadwal pemandu per shift, lalu pesan tiket. Semua tur wajib didampingi pemandu berlisensi.":
    "Select a route, check guide shift schedules, and book tickets. All tours require a licensed guide.",
  "Semua rute": "All routes",
  "Belum ada ulasan": "No reviews yet",
  "Jasa pemandu mulai": "Guide fee from",
  "Lihat detail →": "View details →",
  "Tarif Masuk Kawasan (PNBP)": "Park Entry Tariffs (PNBP)",
  "Kategori": "Category",
  "Hari": "Day",
  "Tarif": "Tariff",
  "Semua hari": "Every day",
  "Perlu diketahui": "Good to know",
  "Penggunaan drone:": "Drone usage:",
  "Minggu/Libur": "Sunday/Holiday",
  "Senin–Sabtu": "Monday–Saturday",
  "Menunggu Pembayaran": "Awaiting Payment",
  "Lunas · Tiket Terbit": "Paid · Ticket Issued",
  "Sudah Check-in": "Checked In",
  "Dibatalkan": "Cancelled",
  "Kedaluwarsa": "Expired",
  "Belum Dibayar": "Unpaid",
  "Diterima": "Paid",
  "Dikembalikan": "Refunded",
  "Transfer Bank": "Bank Transfer",
  "Payment Gateway": "Payment Gateway",
  "Tunai": "Cash",
  "Kartu (EDC)": "Card (EDC)",
  "Mudah": "Easy",
  "Menantang": "Challenging",
  "Shift Pagi": "Morning Shift",
  "Shift Siang": "Afternoon Shift",
  "Shift Malam": "Night Shift",
  "Pelajar/Mahasiswa": "Student",
  "Hari Biasa": "Weekday",
  "Akhir Pekan & Libur": "Weekend & Holiday",
  "Pesanan saya": "My bookings",
  "Belum ada pemesanan": "No bookings yet",
  "Selesaikan pembayaran": "Complete payment",
  "Sisa waktu": "Time remaining",
  "Bayar Instan & Verifikasi Otomatis (QRIS, Virtual Account, E-Wallet)":
    "Instant Payment & Auto-Verification (QRIS, Virtual Account, E-Wallet)",
  "Gratis · Simulasi": "Free · Simulation",
  "Pembayaran langsung terverifikasi oleh sistem tanpa antrean petugas, dan e-tiket QR langsung terbit.":
    "Payment is verified automatically by the system without staff queue, and the QR e-ticket is issued immediately.",
  "Bayar Sekarang": "Pay Now",
  "Bayar online sekarang": "Pay online now",
  "atau bayar manual & unggah bukti di bawah":
    "or pay manually & upload proof below",
  "Unggah bukti pembayaran": "Upload payment proof",
  "JPG/PNG/WEBP/PDF maks. 5 MB. Pemesanan otomatis kedaluwarsa jika melewati batas waktu.":
    "JPG/PNG/WEBP/PDF max 5 MB. Booking expires automatically after the deadline.",
  "Bukti pembayaran sudah diterima dan sedang diverifikasi petugas. Halaman ini diperbarui otomatis.":
    "Payment proof has been received and is under staff verification. This page refreshes automatically.",
  "E-Tiket": "E-Ticket",
  "Titik kumpul": "Meeting point",
  "Jam kumpul": "Assembly time",
  "Pemandu": "Guide",
  "Tunjukkan QR ini di loket. QR hanya berlaku sekali pada tanggal kunjungan. Jangan bagikan ke orang lain.":
    "Show this QR at the gate. Valid once on the visit date only. Do not share with others.",
  "Bagaimana pengalaman Anda?": "How was your experience?",
  "Ulasan tampil publik dengan nama disingkat.":
    "Reviews are shown publicly with abbreviated names.",
  "Ceritakan pengalaman Anda (opsional)": "Share your experience (optional)",
  "Kirim ulasan": "Submit review",
  "Peserta": "Participants",
  "Rincian biaya": "Cost breakdown",
  "Riwayat pembayaran": "Payment history",
  "Terverifikasi otomatis": "Verified automatically",
  "Checklist bawaan": "Packing checklist",
  "Batalkan pemesanan": "Cancel booking",
  "Batalkan pemesanan?": "Cancel booking?",
  "Kuota shift akan dilepas untuk pengunjung lain. Tindakan ini tidak dapat dibatalkan.":
    "Shift quota will be released for other visitors. This action cannot be undone.",
  "Ya, batalkan": "Yes, cancel",
  "Pemesanan yang sudah lunas hanya dapat dibatalkan/di-refund melalui petugas TNGL.":
    "Paid bookings can only be cancelled/refunded through TNGL staff.",
  "Jelajahi Leuser dalam 3D": "Explore Leuser in 3D",
  "Peta & Rute 3D": "3D Map & Routes",
  "Relief Bukit Barisan dari data elevasi, citra satelit, dan jalur tiap tur. Pilih rute lalu tekan “Jelajahi jalur” untuk terbang mengikuti jalurnya. Geser dengan klik kanan / dua jari untuk memiringkan peta.":
    "Bukit Barisan terrain relief from elevation data, satellite imagery, and tour trails. Select a route and click “Explore trail” to fly along it. Right-click or use two fingers to tilt the map.",
  "Klik rute di peta atau di daftar untuk melihat detail dan profil ketinggiannya.":
    "Click a route on the map or list to view details and elevation profile.",
  "Jalur di peta adalah gambaran rute wisata, bukan panduan navigasi. Selalu ikuti pemandu; elevasi dari data global (resolusi ±30–90 m).":
    "Map trails are visual overviews, not navigation guides. Always follow your guide; elevation comes from global DEM data (±30–90 m resolution).",
  "Daftar rute": "Route list",
  "Durasi": "Duration",
  "Jarak": "Distance",
  "Puncak": "Peak",
  "Memuat rute...": "Loading routes...",
  "Memuat pemesanan...": "Loading booking...",

  // --- 3D Wildlife Encyclopedia ---
  "Ensiklopedia": "Encyclopedia",
  "Satwa Leuser dalam 3D": "Leuser Wildlife in 3D",
  "Putar dan perbesar model 3D satwa, lalu pelajari ciri, perilaku, makanan, habitat, dan status konservasinya. Lokasi individu satwa sengaja tidak ditampilkan demi keamanan dari perburuan.":
    "Rotate and zoom 3D wildlife models to learn their traits, behavior, diet, habitat, and conservation status. Individual locations are intentionally hidden to prevent poaching.",
  "Cari nama, nama ilmiah, atau nama daerah…":
    "Search name, scientific name, or local name…",
  "Mamalia": "Mammals",
  "Burung": "Birds",
  "Reptil": "Reptiles",
  "Amfibi": "Amphibians",
  "Memuat satwa…": "Loading wildlife…",
  "Memuat model 3D…": "Loading 3D model…",
  "Model 3D belum tersedia": "3D model not available yet",

  // --- Notifications ---
  "Zona Risiko": "Risk Zone",
  "Peringatan Perangkat": "Device Alert",
  "Sistem": "System",
  "Belum ada staf terdaftar": "No staff registered yet",
  "Tambah foto staf": "Add staff photo",
  "Daftarkan": "Register",
  "Laporan harian siap diunduh.": "Daily report is ready to download.",
  "Loket POS siap digunakan. Periksa shift hari ini sebelum membuka sesi kasir.":
    "POS counter is ready. Check today's shifts before opening a cashier session.",
  "Selamat datang di TNGL E-Ticketing. Pantau status pemesanan dan e-tiket Anda di halaman Notifikasi.":
    "Welcome to TNGL E-Ticketing. Track your booking status and e-tickets on the Notifications page.",
};

const PHRASE_MAP: [string, string][] = ([
  ["Belum ada ulasan", "No reviews yet"],
  ["Tidak ada data yang cocok", "No matching data found"],
  ["Tidak ada data", "No data available"],
  ["Belum ada data", "No data yet"],
  ["Menunggu pembayaran", "Awaiting payment"],
  ["Menunggu verifikasi", "Awaiting verification"],
  ["Bukti pembayaran", "Payment proof"],
  ["Verifikasi pembayaran", "Payment verification"],
  ["Terverifikasi otomatis", "Verified automatically"],
  ["Tanggal kunjungan", "Visit date"],
  ["Titik kumpul", "Meeting point"],
  ["Jam kumpul", "Assembly time"],
  ["Rincian biaya", "Cost breakdown"],
  ["Riwayat pembayaran", "Payment history"],
  ["Riwayat sesi kas", "Cashier session history"],
  ["Buka sesi kas", "Open cashier session"],
  ["Tutup sesi kas", "Close cashier session"],
  ["Modal awal", "Opening cash"],
  ["Laporan harian", "Daily report"],
  ["Laporan agregat", "Aggregate reports"],
  ["Ekspor data", "Data export"],
  ["Log aktivitas", "Activity logs"],
  ["Role & izin", "Roles & permissions"],
  ["Wajah staf", "Staff faces"],
  ["Media unggahan", "Uploaded media"],
  ["Rekap data AI", "AI data recap"],
  ["Laporan AI", "AI reports"],
  ["Verifikasi AI", "AI verification"],
  ["Riwayat prediksi", "Prediction history"],
  ["Kunjungan zona", "Zone visits"],
  ["Zona geografis", "Geo zones"],
  ["Satwa yang mungkin dijumpai", "Wildlife you may encounter"],
  ["Barang bawaan", "Items to bring"],
  ["Aturan kunjungan", "Visitor rules"],
  ["Jadwal pemandu", "Guide schedule"],
  ["Shift pemandu", "Guide shifts"],
  ["Tarif & libur", "Prices & holidays"],
  ["Rute tur", "Tour routes"],
  ["Jelajah tur", "Explore tours"],
  ["Pesanan saya", "My bookings"],
  ["Profil saya", "My profile"],
  ["Ganti password", "Change password"],
  ["Kata sandi lama", "Current password"],
  ["Kata sandi baru", "New password"],
  ["Konfirmasi kata sandi", "Confirm password"],
  ["Simpan perubahan", "Save changes"],
  ["Tandai semua dibaca", "Mark all as read"],
  ["Hapus yang sudah dibaca", "Delete read"],
  ["Tandai dibaca", "Mark read"],
  ["belum dibaca", "unread"],
  ["datang 30 menit lebih awal", "arrive 30 minutes early"],
  ["Perangkat", "Device"],
  ["Spesies", "Species"],
  ["Insiden", "Incidents"],
  ["Cuaca", "Weather"],
  ["Pengguna", "Users"],
  ["Pemandu", "Guide"],
  ["Ulasan", "Reviews"],
  ["Pemesanan", "Bookings"],
  ["Pengunjung", "Visitor"],
  ["Kasir", "Cashier"],
  ["Loket", "Counter"],
  ["Ancaman", "Threats"],
  ["Statistik", "Statistics"],
  ["Notifikasi", "Notifications"],
  ["Peringatan", "Alert"],
  ["Ketinggian", "Elevation"],
  ["Estimasi populasi", "Population estimate"],
  ["Status perlindungan", "Protection status"],
  ["Fakta menarik", "Fun facts"],
  ["Habitat & sebaran", "Habitat & distribution"],
  ["Ciri-ciri", "Characteristics"],
  ["Perilaku", "Behavior"],
  ["Makanan", "Diet"],
  ["Ukuran", "Size"],
  ["Umur", "Lifespan"],
  ["Pola aktivitas", "Activity pattern"],
  ["Taksonomi", "Taxonomy"],
  ["Nama ilmiah", "Scientific name"],
  ["Nama daerah", "Local names"],
  ["Titik keterangan", "Annotations"],
  ["Model 3D", "3D Model"],
  ["Tambah", "Add"],
  ["Ubah", "Edit"],
  ["Hapus", "Delete"],
  ["Simpan", "Save"],
  ["Batal", "Cancel"],
  ["Kembali", "Back"],
  ["Tutup", "Close"],
  ["Cetak", "Print"],
  ["Unduh", "Download"],
  ["Unggah", "Upload"],
  ["Cari", "Search"],
  ["Pilih", "Select"],
  ["Aktif", "Active"],
  ["Nonaktif", "Inactive"],
  ["Tanggal", "Date"],
  ["Waktu", "Time"],
  ["Catatan", "Notes"],
  ["Deskripsi", "Description"],
  ["Lokasi", "Location"],
  ["Total", "Total"],
] as [string, string][]).sort((a, b) => b[0].length - a[0].length);

const MONTHS_ID_TO_EN: Record<string, string> = {
  Januari: "January",
  Februari: "February",
  Maret: "March",
  April: "April",
  Mei: "May",
  Juni: "June",
  Juli: "July",
  Agustus: "August",
  September: "September",
  Oktober: "October",
  November: "November",
  Desember: "December",
};

const WEEKDAYS_ID_TO_EN: Record<string, string> = {
  Senin: "Monday",
  Selasa: "Tuesday",
  Rabu: "Wednesday",
  Kamis: "Thursday",
  Jumat: "Friday",
  Sabtu: "Saturday",
  Minggu: "Sunday",
};

const ESCAPE_RE = /[.*+?^${}()|[\]\\]/g;
const escapeRegex = (s: string) => s.replace(ESCAPE_RE, "\\$&");

const PHRASE_REGEXES = PHRASE_MAP.map(([id, en]) => ({
  regex: new RegExp(`(?<![A-Za-z0-9_])${escapeRegex(id)}(?![A-Za-z0-9_])`, "gi"),
  en,
}));

const PRESERVE_ACRONYMS = new Set([
  "TNGL", "BBTNGL", "BTNGL", "QRIS", "PNBP", "WIB", "WNI", "WNA", "GPS", "AI", "POS", "EDC", "QR", "ID", "EN",
]);

function applyCase(source: string, target: string): string {
  if (source === source.toUpperCase() && source.length > 1) return target.toUpperCase();
  if (source[0] === source[0].toUpperCase()) return target[0].toUpperCase() + target.slice(1);
  return target.toLowerCase();
}

export function translateIdToEn(raw: string): string {
  if (!raw || !raw.trim()) return raw;

  const trimmed = raw.trim();
  // Lewati angka murni, kode booking/payment, email, URL, dan koordinat.
  if (
    /^[\d\s.,:/+\-°%×]+$/.test(trimmed) ||
    /^(TNGL|PAY|SIM)-[A-Z0-9-]+$/i.test(trimmed) ||
    /^https?:\/\//i.test(trimmed) ||
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
  ) {
    return raw;
  }

  const leading = raw.slice(0, raw.indexOf(trimmed));
  const trailing = raw.slice(raw.indexOf(trimmed) + trimmed.length);

  // 1. Exact match
  if (EXACT_MAP[trimmed]) {
    return `${leading}${EXACT_MAP[trimmed]}${trailing}`;
  }

  let text = trimmed;

  // 2. Dynamic templates (notifications, tourism cards, pagination, elevation)
  text = text
    .replace(
      /^Perangkat\s+#(\d+)\s+\(([^)]+)\):\s+baterai rendah\s+\(([^)]+)\)\.?$/i,
      "Device #$1 ($2): low battery ($3).",
    )
    .replace(
      /^Perangkat\s+#(\d+)\s+\(([^)]+)\):\s+sinyal lemah\s+\(([^)]+)\)\.?$/i,
      "Device #$1 ($2): weak signal ($3).",
    )
    .replace(
      /^Perangkat\s+#(\d+)\s+\(([^)]+)\)\s+dilaporkan\s+(hilang|rusak)\.?$/i,
      (_m, id, model, state) =>
        `Device #$1 ($2) reported ${String(state).toLowerCase() === "hilang" ? "lost" : "damaged"}.`
          .replace("$1", id)
          .replace("$2", model),
    )
    .replace(
      /^Satwa\s+(\S+)\s+memasuki\s+([^(]+)\s*\(([^)]+)\)\.\s*Potensi konflik dengan manusia\.?$/i,
      "Wildlife $1 entered $2($3). Potential human-wildlife conflict.",
    )
    .replace(
      /^Pembayaran\s+([A-Z0-9-]+)\s+diterima\.\s+Tiket elektronik sudah bisa dibuka di menu Pesanan Saya\.?$/i,
      "Payment $1 received. Your e-ticket is now available in My Bookings.",
    )
    .replace(
      /^Menampilkan\s+(\d+)\s*[–-]\s*(\d+)\s+dari\s+(\d+)\s*(.*)$/i,
      (_m, a, b, c, rest) =>
        `Showing ${a}–${b} of ${c}${rest ? ` ${translateIdToEn(rest)}` : ""}`,
    )
    .replace(/^Halaman\s+(\d+)\s+dari\s+(\d+)$/i, "Page $1 of $2")
    .replace(/^(\d+)\s+belum dibaca$/i, "$1 unread")
    .replace(/^Sisa\s+(\d+\/\d+)$/i, "$1 left")
    .replace(/^Maks\.?\s+(\d+)\s+orang$/i, "Max $1 people")
    .replace(/^Mulai\s+(\d{2}:\d{2})$/i, "Starts $1")
    .replace(/^Mulai\s*·\s*(\d+)\s*mdpl$/i, "Start · $1 masl")
    .replace(/^Puncak\s*·\s*(\d+)\s*mdpl$/i, "Peak · $1 masl")
    .replace(/\b(\d+)\s+Hari\s+(\d+)\s+Malam\b/gi, "$1D/$2N")
    .replace(/\b(\d+)\s*(?:mdpl|m\s*dpl)\b/gi, "$1 masl")
    .replace(/\b(\d+)\s+jam\b/gi, "$1 hours")
    .replace(/\b(\d+)\s+hari\b/gi, "$1 days")
    .replace(/\b(\d+)\s+th\b/gi, "$1 yrs")
    .replace(/\b(\d+)\s+orang\b/gi, "$1 people")
    .replace(/\bmaks\.\s*(\d+\s*MB)\b/gi, "max $1")
    .replace(/\bmaksimal\s+(\d+\s*MB)\b/gi, "max $1")
    .replace(/\bShift\s+Pagi\b/gi, "Morning Shift")
    .replace(/\bShift\s+Siang\b/gi, "Afternoon Shift")
    .replace(/\bShift\s+Malam\b/gi, "Night Shift");

  // 3. Hari & bulan Indonesia
  for (const [idDay, enDay] of Object.entries(WEEKDAYS_ID_TO_EN)) {
    text = text.replace(new RegExp(`\\b${idDay}\\b`, "g"), enDay);
  }
  for (const [idMonth, enMonth] of Object.entries(MONTHS_ID_TO_EN)) {
    text = text.replace(new RegExp(`\\b${idMonth}\\b`, "g"), enMonth);
  }

  // 4. Longest-match phrase replacement
  for (const { regex, en } of PHRASE_REGEXES) {
    text = text.replace(regex, (matched) => {
      if (PRESERVE_ACRONYMS.has(matched)) return matched;
      return applyCase(matched, en);
    });
  }

  return `${leading}${text}${trailing}`;
}
