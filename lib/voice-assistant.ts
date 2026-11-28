import { getNavLabel, type AppLocale } from "@/lib/i18n";
import { canAccessRoute, NAV_SECTIONS } from "@/lib/navigation";
import type { TYPE_USER_ROLE } from "@/types/auth.type";

export type VoiceRouteEntry = {
  href: string;
  label: Record<AppLocale, string>;
  keywords: string[];
  isPublic?: boolean;
};

export const VOICE_ROUTES: VoiceRouteEntry[] = [
  {
    href: "/dashboard",
    label: { id: "Dashboard", en: "Dashboard" },
    keywords: ["dashboard", "dasbor", "beranda", "halaman utama", "home", "ringkasan", "utama"],
  },
  {
    href: "/tracking/live-map",
    label: { id: "Live Map", en: "Live Map" },
    keywords: [
      "live map",
      "peta langsung",
      "pelacakan langsung",
      "peta satwa",
      "tracking map",
      "gps langsung",
      "posisi satwa",
      "satwa 3d",
      "ensiklopedia",
      "3d wildlife",
      "model 3d",
      "wildlife 3d",
      "wildlife explorer",
      "gunung 3d",
      "gunung leuser 3d",
    ],
  },
  {
    href: "/ai/staff-faces",
    label: { id: "Wajah Staf", en: "Staff Faces" },
    keywords: ["wajah staf", "data wajah staf", "muka staf", "foto staf", "biometrik staf", "face gallery", "staff faces", "pengenalan wajah", "pegawai"],
  },
  {
    href: "/ai/vision",
    label: { id: "AI Vision", en: "AI Vision" },
    keywords: ["ai vision", "unggah media", "deteksi ai", "analisis ai", "unggah foto ai", "unggah audio", "upload media"],
  },
  {
    href: "/ai/vision/history",
    label: { id: "Riwayat Prediksi AI", en: "AI Prediction History" },
    keywords: ["riwayat prediksi", "history ai", "hasil prediksi", "prediksi ai", "prediction history"],
  },
  {
    href: "/ai/vision/pending",
    label: { id: "Verifikasi AI", en: "AI Verification" },
    keywords: ["verifikasi ai", "antrean ai", "pending ai", "validasi ai", "ai verification"],
  },
  {
    href: "/ai/threats",
    label: { id: "Ancaman AI", en: "AI Threats" },
    keywords: ["ancaman", "threats", "peringatan ancaman", "bahaya", "suara tembakan", "gergaji", "pembalakan"],
  },
  {
    href: "/ai/recap",
    label: { id: "Rekap Data AI", en: "AI Data Recap" },
    keywords: ["rekap ai", "rekap data", "ringkasan ai", "pdf ai", "ai recap"],
  },
  {
    href: "/ai/reports",
    label: { id: "Laporan AI", en: "AI Reports" },
    keywords: ["laporan ai", "ai reports", "narasi ai"],
  },
  {
    href: "/ai/media",
    label: { id: "Media Unggahan AI", en: "Uploaded Media" },
    keywords: ["media unggahan", "galeri media", "file ai", "uploaded media", "rekaman"],
  },
  {
    href: "/animals",
    label: { id: "Data Satwa", en: "Animals" },
    keywords: ["data satwa", "daftar satwa", "satwa", "animals", "individu satwa", "hewan"],
  },
  {
    href: "/incidents",
    label: { id: "Insiden", en: "Incidents" },
    keywords: ["insiden", "laporan insiden", "incidents", "kejadian lapangan", "konflik satwa"],
  },
  {
    href: "/zone-visits",
    label: { id: "Kunjungan Zona", en: "Zone Visits" },
    keywords: ["kunjungan zona", "zone visits", "keluar masuk zona", "perlintasan zona"],
  },
  {
    href: "/weather",
    label: { id: "Cuaca", en: "Weather" },
    keywords: ["cuaca", "weather", "iklim", "suhu", "hujan", "kelembapan"],
  },
  {
    href: "/species",
    label: { id: "Spesies", en: "Species" },
    keywords: ["spesies", "species", "jenis satwa", "taksonomi"],
  },
  {
    href: "/devices",
    label: { id: "Perangkat", en: "Devices" },
    keywords: ["perangkat", "devices", "sensor", "kalung gps", "kamera jebak", "camera trap", "baterai"],
  },
  {
    href: "/geo-zones",
    label: { id: "Zona Geografis", en: "Geo Zones" },
    keywords: ["zona", "geo zone", "zona geografis", "wilayah", "poligon", "kawasan"],
  },
  {
    href: "/statistics",
    label: { id: "Statistik", en: "Statistics" },
    keywords: ["statistik", "statistics", "grafik", "analitik"],
  },
  {
    href: "/reports",
    label: { id: "Laporan Agregat", en: "Aggregate Reports" },
    keywords: ["laporan agregat", "laporan", "reports", "aggregate"],
  },
  {
    href: "/exports",
    label: { id: "Ekspor Data", en: "Data Export" },
    keywords: ["ekspor", "export", "unduh data", "csv", "geojson"],
  },
  {
    href: "/users",
    label: { id: "Pengguna", en: "Users" },
    keywords: ["pengguna", "users", "manajemen user", "daftar akun", "kelola user"],
  },
  {
    href: "/roles",
    label: { id: "Role & Izin", en: "Roles & Permissions" },
    keywords: ["role", "peran", "izin", "hak akses", "permissions"],
  },
  {
    href: "/activity-logs",
    label: { id: "Log Aktivitas", en: "Activity Logs" },
    keywords: ["log aktivitas", "riwayat aktivitas", "audit log", "activity logs"],
  },
  {
    href: "/tours",
    label: { id: "Jelajah Tur", en: "Explore Tours" },
    keywords: ["jelajah tur", "tur wisata", "wisata", "explore tours", "paket wisata", "pesan tiket"],
  },
  {
    href: "/tours/map-3d",
    label: { id: "Peta Wisata 3D", en: "3D Tour Map" },
    keywords: ["peta 3d", "peta wisata", "3d map", "gunung leuser"],
  },
  {
    href: "/guides",
    label: { id: "Jadwal Pemandu", en: "Guide Schedule" },
    keywords: ["jadwal pemandu", "pemandu wisata", "guide schedule", "ranger wisata"],
  },
  {
    href: "/bookings",
    label: { id: "Pesanan Saya", en: "My Bookings" },
    keywords: ["pesanan saya", "tiket saya", "booking saya", "my bookings", "e-tiket"],
  },
  {
    href: "/pos",
    label: { id: "Kasir POS", en: "Cashier POS" },
    keywords: ["kasir", "pos", "loket", "cashier", "penjualan langsung"],
  },
  {
    href: "/tourism/check-in",
    label: { id: "Check-in Tiket", en: "Ticket Check-in" },
    keywords: ["check-in", "check in", "validasi tiket", "scan tiket", "pintu masuk"],
  },
  {
    href: "/pos/sessions",
    label: { id: "Riwayat Sesi Kas", en: "Cashier Sessions" },
    keywords: ["sesi kas", "riwayat kasir", "cashier sessions", "buka tutup kas"],
  },
  {
    href: "/pos/report",
    label: { id: "Laporan Harian Loket", en: "Daily Counter Report" },
    keywords: ["laporan harian", "laporan loket", "rekap kasir", "daily report"],
  },
  {
    href: "/tourism/bookings",
    label: { id: "Kelola Pemesanan", en: "Bookings Admin" },
    keywords: ["kelola pemesanan", "daftar pemesanan", "pemesanan wisata", "tourism bookings"],
  },
  {
    href: "/tourism/payments",
    label: { id: "Verifikasi Pembayaran", en: "Payment Verification" },
    keywords: ["verifikasi pembayaran", "bukti bayar", "pembayaran wisata", "payment verification"],
  },
  {
    href: "/tourism/routes",
    label: { id: "Kelola Rute Tur", en: "Manage Tour Routes" },
    keywords: ["kelola rute", "rute tur", "tour routes", "edit rute"],
  },
  {
    href: "/tourism/guides",
    label: { id: "Kelola Pemandu", en: "Manage Guides" },
    keywords: ["kelola pemandu", "daftar pemandu", "manage guides"],
  },
  {
    href: "/tourism/shifts",
    label: { id: "Shift Pemandu", en: "Guide Shifts" },
    keywords: ["shift pemandu", "jadwal shift", "guide shifts"],
  },
  {
    href: "/tourism/prices",
    label: { id: "Tarif & Libur", en: "Prices & Holidays" },
    keywords: ["tarif", "harga tiket", "hari libur", "pnbp", "prices", "holidays"],
  },
  {
    href: "/tourism/reviews",
    label: { id: "Ulasan Wisata", en: "Tour Reviews" },
    keywords: ["ulasan", "review wisata", "rating", "komentar pengunjung"],
  },
  {
    href: "/notifications",
    label: { id: "Notifikasi", en: "Notifications" },
    keywords: ["notifikasi", "pemberitahuan", "notif", "notifications", "alerts"],
  },
  {
    href: "/emergency-contacts",
    label: { id: "Kontak Darurat", en: "Emergency Contacts" },
    keywords: ["kontak darurat", "darurat", "sos", "emergency", "posko", "evakuasi", "sar"],
  },
  {
    href: "/manual",
    label: { id: "Panduan Pengguna", en: "User Manual" },
    keywords: ["panduan", "manual", "panduan pengguna", "user manual", "cara pakai"],
  },
  {
    href: "/profile",
    label: { id: "Profil Saya", en: "My Profile" },
    keywords: ["profil", "akun saya", "profile", "my profile", "ganti password"],
  },
  {
    href: "/login",
    label: { id: "Halaman Masuk", en: "Login Page" },
    keywords: ["login", "masuk", "halaman masuk", "sign in"],
    isPublic: true,
  },
  {
    href: "/register",
    label: { id: "Pendaftaran", en: "Registration" },
    keywords: ["daftar", "register", "registrasi", "buat akun", "sign up"],
    isPublic: true,
  },
];

const FILLER_WORDS = new Set([
  "saya", "aku", "kami", "ingin", "mau", "tolong", "coba", "bisa", "boleh", "mohon",
  "lihat", "melihat", "buka", "membuka", "pergi", "ke", "menuju", "arahkan", "tampilkan",
  "tunjukkan", "cari", "carikan", "halaman", "menu", "bagian", "fitur", "data", "daftar",
  "yang", "di", "dan", "atau", "untuk", "ini", "itu", "ya", "dong", "please", "i", "want",
  "to", "see", "open", "go", "show", "me", "the", "page", "view", "navigate", "take",
  "can", "you", "my", "check", "open", "look", "at", "about", "of", "in", "on",
]);

const SYNONYM_MAP: Record<string, string[]> = {
  staff: ["staf", "pegawai", "karyawan"],
  staf: ["staff", "pegawai", "karyawan"],
  pegawai: ["staf", "staff"],
  karyawan: ["staf", "staff"],
  face: ["wajah", "muka"],
  faces: ["wajah", "muka"],
  wajah: ["face", "faces", "muka"],
  muka: ["wajah", "face"],
  biometrik: ["wajah", "staf", "face"],
  animal: ["satwa", "hewan"],
  animals: ["satwa", "hewan"],
  wildlife: ["satwa", "hewan"],
  satwa: ["animal", "animals", "wildlife"],
  hewan: ["satwa", "animal"],
  binatang: ["satwa", "animal"],
  user: ["pengguna", "users"],
  users: ["pengguna", "user"],
  pengguna: ["user", "users"],
  threat: ["ancaman", "threats"],
  threats: ["ancaman", "threat"],
  ancaman: ["threat", "threats"],
  bahaya: ["ancaman", "darurat", "threat"],
  notification: ["notifikasi", "notifications"],
  notifications: ["notifikasi", "notification"],
  notifikasi: ["notification", "notifications", "alerts"],
  alerts: ["notifikasi", "ancaman"],
  emergency: ["darurat", "sos", "kontak"],
  darurat: ["emergency", "sos", "posko", "kontak"],
  telepon: ["kontak", "darurat", "phone"],
  hubungi: ["kontak", "darurat"],
  manual: ["panduan", "guide"],
  panduan: ["manual"],
  tour: ["tur", "wisata", "tours"],
  tours: ["tur", "wisata", "tour"],
  wisata: ["tour", "tours"],
  booking: ["pesanan", "bookings"],
  bookings: ["pesanan", "booking"],
  pesanan: ["booking", "bookings"],
  tiket: ["pesanan", "check-in", "wisata", "ticket"],
  ticket: ["pesanan", "tiket", "check-in"],
  payment: ["pembayaran", "payments"],
  payments: ["pembayaran", "payment"],
  pembayaran: ["payment", "payments"],
  bayar: ["pembayaran", "payment", "kasir"],
  transfer: ["pembayaran", "verifikasi"],
  bukti: ["pembayaran", "verifikasi"],
  cashier: ["kasir", "pos"],
  kasir: ["cashier", "pos"],
  device: ["perangkat", "devices"],
  devices: ["perangkat", "device"],
  perangkat: ["device", "devices", "sensor"],
  zone: ["zona", "zones"],
  zones: ["zona", "zone"],
  zona: ["zone", "zones"],
  incident: ["insiden", "incidents"],
  incidents: ["insiden", "incident"],
  insiden: ["incident", "incidents"],
  weather: ["cuaca"],
  cuaca: ["weather"],
  species: ["spesies"],
  spesies: ["species"],
  profile: ["profil", "akun"],
  profil: ["profile", "akun"],
  akun: ["profil", "profile", "pengguna"],
  sandi: ["password", "profil"],
  activity: ["aktivitas", "log"],
  aktivitas: ["activity", "log"],
  role: ["peran", "roles", "izin"],
  roles: ["role", "izin"],
  permission: ["izin", "roles"],
  permissions: ["izin", "roles"],
  price: ["tarif", "harga", "prices"],
  prices: ["tarif", "harga", "price"],
  harga: ["tarif", "price"],
  review: ["ulasan", "reviews"],
  reviews: ["ulasan", "review"],
  ulasan: ["review", "reviews"],
  shift: ["jadwal", "shifts"],
  shifts: ["jadwal", "shift"],
  schedule: ["jadwal"],
  jadwal: ["schedule", "shift"],
  map: ["peta", "3d"],
  peta: ["map", "3d", "zona"],
  history: ["riwayat"],
  riwayat: ["history"],
  verify: ["verifikasi", "pending"],
  pending: ["verifikasi", "antrean"],
  verifikasi: ["verify", "pending"],
  recap: ["rekap", "rekapan"],
  rekap: ["recap", "ringkasan"],
  rekapan: ["rekap", "recap"],
  ringkasan: ["rekap", "laporan", "summary"],
  export: ["ekspor", "unduh", "download"],
  ekspor: ["export", "unduh"],
  download: ["ekspor", "export"],
  report: ["laporan", "reports"],
  reports: ["laporan", "report"],
  laporan: ["report", "reports"],
  statistic: ["statistik", "statistics"],
  statistics: ["statistik", "statistic"],
  statistik: ["statistics", "statistic"],
  kamera: ["media", "vision", "perangkat"],
  foto: ["media", "wajah", "vision"],
  audio: ["suara", "vision"],
};

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 0 && !FILLER_WORDS.has(w));
}

function expandTokens(tokens: string[]): string[] {
  const expanded = new Set<string>(tokens);
  for (const t of tokens) {
    const syns = SYNONYM_MAP[t];
    if (syns) {
      for (const s of syns) expanded.add(s);
    }
  }
  return Array.from(expanded);
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > 2) return 99;
  const dp: number[] = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i - 1;
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = dp[j];
      dp[j] =
        a[i - 1] === b[j - 1]
          ? prev
          : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = temp;
    }
  }
  return dp[b.length];
}

function scoreRoute(
  normalizedText: string,
  userTokens: string[],
  route: VoiceRouteEntry,
): number {
  let score = 0;

  for (const kw of route.keywords) {
    if (normalizedText.includes(kw)) {
      score += 40 + kw.length * 2;
    }
  }

  const labelTokens = tokenize(`${route.label.id} ${route.label.en}`);
  const kwTokens = new Set<string>([
    ...labelTokens,
    ...route.keywords.flatMap((kw) => tokenize(kw)),
  ]);

  for (const ut of userTokens) {
    if (kwTokens.has(ut)) {
      score += 18;
      continue;
    }
    if (ut.length >= 4) {
      for (const kt of kwTokens) {
        if (kt.length >= 4 && levenshtein(ut, kt) <= 1) {
          score += 11;
          break;
        }
      }
    }
  }

  return score;
}

function findClickableMatch(query: string): HTMLElement | null {
  if (typeof document === "undefined") return null;
  const target = query.trim().toLowerCase();
  if (!target) return null;

  const candidates = Array.from(
    document.querySelectorAll<HTMLElement>("button, a[href], [role='button'], [role='menuitem']"),
  );

  for (const el of candidates) {
    if (el.closest("#a11y-voice-dialog")) continue;
    if (el.hasAttribute("disabled") || el.getAttribute("aria-disabled") === "true") continue;

    const label = (
      el.getAttribute("aria-label") ||
      el.getAttribute("title") ||
      el.textContent ||
      ""
    )
      .trim()
      .toLowerCase();

    if (label && (label === target || label.includes(target))) {
      return el;
    }
  }
  return null;
}

export type VoiceAction =
  | { type: "navigate"; href: string; label: string }
  | { type: "access_denied"; href: string; label: string }
  | { type: "auth_required"; label: string }
  | { type: "logout" }
  | {
      type: "emergency_distress";
      emergencyType: "cedera" | "kebakaran" | "satwa_agresif" | "tersesat" | "pemburu" | "lainnya";
      transcript: string;
    }
  | { type: "history"; direction: "back" | "forward" }
  | { type: "read_page" }
  | { type: "list_commands" }
  | { type: "scroll"; direction: "up" | "down" | "top" | "bottom" }
  | { type: "set_theme"; scheme: "light" | "dark" }
  | { type: "set_locale"; locale: AppLocale }
  | { type: "set_rate"; delta?: number; exact?: number }
  | { type: "stop_speech" }
  | { type: "set_contrast"; high: boolean }
  | { type: "set_font_scale"; scale: "md" | "lg" | "xl" }
  | { type: "reset_a11y" }
  | { type: "click_element"; query: string }
  | { type: "fill_input"; field: string; value: string }
  | { type: "unknown"; transcript: string };

export function interpretConfirmation(raw: string): "yes" | "no" | "unknown" {
  const text = raw.trim().toLowerCase();
  if (!text) return "unknown";
  if (
    /\b(ya|iya|yes|yeah|yep|ok|oke|okay|betul|benar|setuju|tolong|panggil|hubungi|telepon|call|confirm|konfirmasi|lanjut|cepat)\b/.test(
      text,
    )
  ) {
    return "yes";
  }
  if (/\b(tidak|nggak|enggak|gak|bukan|jangan|no|nope|cancel|batal|batalkan|stop)\b/.test(text)) {
    return "no";
  }
  return "unknown";
}

function detectEmergencyDistress(
  text: string,
): "cedera" | "kebakaran" | "satwa_agresif" | "tersesat" | "pemburu" | "lainnya" | null {
  if (
    /^(?:tolong\s+)?(?:buka|lihat|tampilkan|arahkan\s+ke|pergi\s+ke|open|show|go\s+to)\s+(?:halaman\s+|menu\s+)?(?:kontak\s+darurat|emergency\s+contacts|ancaman|ai\s+threats)/.test(
      text,
    )
  ) {
    return null;
  }

  if (/(ada\s+pemburu|\bpemburu\b|\bpoacher\b|pembalak|suara\s+tembakan|orang\s+bersenjata)/.test(text)) {
    return "pemburu";
  }
  if (/(ada\s+kebakaran|\bkebakaran\b|\bterbakar\b|hutan\s+terbakar|api\s+besar|\bwildfire\b|\bfire\b)/.test(text)) {
    return "kebakaran";
  }
  if (
    /(terluka|\bluka\b|patah\s+tulang|pingsan|berdarah|cedera|sakit\s+parah|sesak\s+napas|\binjured\b|\bbleeding\b|\bhurt\b|kecelakaan)/.test(
      text,
    )
  ) {
    return "cedera";
  }
  if (/(tersesat|nyasar|hilang\s+arah|tidak\s+tahu\s+jalan|got\s+lost|\bi\s+am\s+lost\b)/.test(text)) {
    return "tersesat";
  }
  if (
    /(diserang\s+satwa|dikejar\s+(?:harimau|beruang|gajah|badak)|satwa\s+agresif|animal\s+attack|wild\s+animal)/.test(
      text,
    )
  ) {
    return "satwa_agresif";
  }
  if (
    /(tolong\s+saya|selamatkan\s+saya|butuh\s+pertolongan|butuh\s+bantuan\s+(?:segera|darurat|medis|evakuasi)|keadaan\s+darurat|kondisi\s+darurat|\bhelp\s+me\b|\bsave\s+me\b|\bemergency\b|\bsos\b)/.test(
      text,
    )
  ) {
    return "lainnya";
  }

  return null;
}

export function interpretVoiceCommand(
  raw: string,
  locale: AppLocale,
  userRole: TYPE_USER_ROLE | null = null,
): VoiceAction {
  const text = raw.trim().toLowerCase();
  if (!text) return { type: "unknown", transcript: raw };

  if (/^(diam|berhenti bicara|stop|hening|tutup suara|stop talking|be quiet)$/.test(text)) {
    return { type: "stop_speech" };
  }

  const emergencyType = detectEmergencyDistress(text);
  if (emergencyType) {
    return { type: "emergency_distress", emergencyType, transcript: raw };
  }

  if (
    /(logout|log out|sign out|signout|keluar akun|keluar dari akun|mau keluar|ingin keluar|tolong keluar|cabut sesi|\bkeluar\b)/.test(
      text,
    )
  ) {
    return { type: "logout" };
  }

  if (/(bantuan|perintah|menu apa saja|bisa apa|akses apa|help|commands|what can you do)/.test(text)) {
    return { type: "list_commands" };
  }

  if (
    /(bacakan|baca\s+(?:isi|semua|halaman|layar|konten|apa)|jelaskan|terangkan|deskripsikan|ceritakan|rangkum|ringkas|di mana saya|ini halaman apa|sedang di mana|read\s+(?:this\s+)?(?:page|screen|content|all|everything)|explain|describe|what\s+is\s+on\s+this\s+page|where\s+am\s+i|summarize)/.test(
      text,
    ) ||
    /^(baca|read)$/.test(text)
  ) {
    return { type: "read_page" };
  }

  if (/(halaman sebelumnya|go back|previous page|\bkembali\b|\bback\b)/.test(text)) {
    return { type: "history", direction: "back" };
  }
  if (/(halaman berikutnya|go forward|next page|\bmaju\b|\bforward\b)/.test(text)) {
    return { type: "history", direction: "forward" };
  }

  if (/(paling atas|scroll top|back to top|go to top)/.test(text)) {
    return { type: "scroll", direction: "top" };
  }
  if (/(paling bawah|scroll bottom|go to bottom)/.test(text)) {
    return { type: "scroll", direction: "bottom" };
  }
  if (/(gulir ke bawah|scroll ke bawah|scroll down|turun ke bawah|\bturun\b)/.test(text)) {
    return { type: "scroll", direction: "down" };
  }
  if (/(gulir ke atas|scroll ke atas|scroll up|naik ke atas|\bnaik\b)/.test(text)) {
    return { type: "scroll", direction: "up" };
  }

  if (/(mode gelap|tema gelap|terlalu terang|silau|dark mode|switch to dark)/.test(text)) {
    return { type: "set_theme", scheme: "dark" };
  }
  if (/(mode terang|tema terang|terlalu gelap|light mode|switch to light)/.test(text)) {
    return { type: "set_theme", scheme: "light" };
  }
  if (/(bahasa inggris|ganti inggris|use english|switch to english|\benglish\b)/.test(text)) {
    return { type: "set_locale", locale: "en" };
  }
  if (/(bahasa indonesia|ganti indonesia|use indonesian|switch to indonesian|\bindonesian\b)/.test(text)) {
    return { type: "set_locale", locale: "id" };
  }

  if (/(lebih cepat|percepat suara|kecepatan naik|faster|speak faster|speed up)/.test(text)) {
    return { type: "set_rate", delta: 0.2 };
  }
  if (/(lebih lambat|perlambat suara|pelan-pelan|terlalu cepat|slower|speak slower|slow down)/.test(text)) {
    return { type: "set_rate", delta: -0.2 };
  }
  if (/(kecepatan normal|suara normal|normal speed)/.test(text)) {
    return { type: "set_rate", exact: 1.0 };
  }

  if (/(kontras tinggi|high contrast|mode kontras|kurang jelas)/.test(text)) {
    return { type: "set_contrast", high: true };
  }
  if (/(kontras normal|normal contrast|matikan kontras)/.test(text)) {
    return { type: "set_contrast", high: false };
  }
  if (/(sangat besar|tulisan ekstra besar|extra large text)/.test(text)) {
    return { type: "set_font_scale", scale: "xl" };
  }
  if (/(perbesar tulisan|tulisan besar|besarkan teks|tulisan kekecilan|huruf kecil|larger text|increase font|bigger text)/.test(text)) {
    return { type: "set_font_scale", scale: "lg" };
  }
  if (/(perkecil tulisan|ukuran normal|tulisan normal|normal text|default font|smaller text)/.test(text)) {
    return { type: "set_font_scale", scale: "md" };
  }
  if (/(reset tampilan|reset aksesibilitas|reset accessibility)/.test(text)) {
    return { type: "reset_a11y" };
  }

  const fillMatch = text.match(
    /(?:isi|ketik|masukkan|fill|type|enter)\s+(?:kolom|field|input)?\s*(.+?)\s+(?:dengan|with|ke|as)\s+(.+)$/,
  );
  if (fillMatch) {
    return { type: "fill_input", field: fillMatch[1].trim(), value: fillMatch[2].trim() };
  }

  const clickMatch = text.match(
    /(?:klik|tekan|pencet|pilih|click|press|tap)\s+(?:tombol|button|menu|link|tautan)?\s*(.+)$/,
  );
  if (clickMatch) {
    const cleaned = clickMatch[1].replace(/\b(dong|ya|please|now|sekarang)\b/g, "").trim();
    if (cleaned) {
      return { type: "click_element", query: cleaned };
    }
  }

  const rawTokens = tokenize(text);
  const userTokens = expandTokens(rawTokens);
  if (userTokens.length > 0) {
    const scored = VOICE_ROUTES.map((route) => {
      const baseScore = scoreRoute(text, userTokens, route);
      const allowed = route.isPublic || (userRole !== null && canAccessRoute(userRole, route.href));
      return { route, baseScore, allowed };
    })
      .filter((item) => item.baseScore >= 18)
      .sort((a, b) => {
        if (Math.abs(a.baseScore - b.baseScore) <= 8 && a.allowed !== b.allowed) {
          return a.allowed ? -1 : 1;
        }
        return b.baseScore - a.baseScore;
      });

    if (scored.length > 0) {
      const best = scored[0];
      const label = best.route.label[locale];

      if (!best.route.isPublic) {
        if (userRole === null) {
          return { type: "auth_required", label };
        }
        if (!canAccessRoute(userRole, best.route.href)) {
          return { type: "access_denied", href: best.route.href, label };
        }
      }

      return { type: "navigate", href: best.route.href, label };
    }
  }

  const cleanedPhrase = rawTokens.join(" ");
  if (cleanedPhrase && findClickableMatch(cleanedPhrase)) {
    return { type: "click_element", query: cleanedPhrase };
  }

  return { type: "unknown", transcript: raw };
}

export function summarizeAllowedRoutesForRole(
  role: TYPE_USER_ROLE | null,
  locale: AppLocale,
): string {
  if (!role) {
    return locale === "en"
      ? "You are not signed in yet. You can say: login, register, read this page, high contrast, or larger text."
      : "Anda belum masuk akun. Anda bisa mengucapkan: login, daftar, bacakan isi halaman, kontras tinggi, atau perbesar tulisan.";
  }

  const labels = NAV_SECTIONS[role]
    .flatMap((section) => section.items)
    .map((item) => getNavLabel(locale, item.href, item.label));

  const listed = labels.slice(0, 10).join(", ");
  return locale === "en"
    ? `Available menus for your role include: ${listed}. You can also say read page content, log out, dark mode, high contrast, larger text, or click a button name.`
    : `Menu yang tersedia untuk role Anda antara lain: ${listed}. Anda juga bisa mengucapkan bacakan isi halaman, logout, mode gelap, kontras tinggi, perbesar tulisan, atau klik nama tombol.`;
}

export function extractPageSummary(locale: AppLocale): string {
  if (typeof document === "undefined") return "";

  const root = document.getElementById("main-content") ?? document.querySelector("main") ?? document.body;
  const seen = new Set<string>();
  const parts: string[] = [];

  const pushUnique = (text: string | null | undefined) => {
    const clean = (text ?? "").replace(/\s+/g, " ").trim();
    if (!clean || clean.length < 2 || seen.has(clean)) return;
    seen.add(clean);
    parts.push(clean);
  };

  const mainHeading = root.querySelector("h1")?.textContent?.trim() || document.title;
  if (mainHeading) {
    pushUnique(
      locale === "en" ? `You are on ${mainHeading}.` : `Anda berada di halaman ${mainHeading}.`,
    );
  }

  root.querySelectorAll("[role='alert'], .ui-alert").forEach((el) => {
    pushUnique(el.textContent);
  });

  const dts = Array.from(root.querySelectorAll("dt"));
  const statPairs: string[] = [];
  for (const dt of dts.slice(0, 8)) {
    const dd = dt.parentElement?.querySelector("dd");
    const label = dt.textContent?.replace(/\s+/g, " ").trim();
    const val = dd?.textContent?.replace(/\s+/g, " ").trim();
    if (label && val) {
      statPairs.push(`${label}: ${val}`);
    }
  }
  if (statPairs.length > 0) {
    pushUnique(
      locale === "en"
        ? `Summary metrics: ${statPairs.join(", ")}.`
        : `Ringkasan data: ${statPairs.join(", ")}.`,
    );
  }

  root.querySelectorAll("h2, h3, p, li").forEach((el) => {
    if (el.closest("#a11y-voice-dialog, nav, [aria-hidden='true']")) return;
    const text = el.textContent?.replace(/\s+/g, " ").trim() ?? "";
    if (text.length >= 6 && text.length <= 260) {
      pushUnique(text);
    }
  });

  const tables = Array.from(root.querySelectorAll("table"));
  tables.slice(0, 2).forEach((table) => {
    const rows = Array.from(table.querySelectorAll("tbody tr"));
    if (rows.length === 0) return;
    const headers = Array.from(table.querySelectorAll("thead th"))
      .map((th) => th.textContent?.replace(/\s+/g, " ").trim() ?? "")
      .filter(Boolean);
    const sampleRows = rows.slice(0, 3).map((row) =>
      Array.from(row.querySelectorAll("td"))
        .map((td) => td.textContent?.replace(/\s+/g, " ").trim() ?? "")
        .filter(Boolean)
        .slice(0, 4)
        .join(", "),
    );
    pushUnique(
      locale === "en"
        ? `Table with ${rows.length} rows${headers.length ? ` (${headers.slice(0, 4).join(", ")})` : ""}. Top entries: ${sampleRows.join("; ")}.`
        : `Tabel berisi ${rows.length} baris${headers.length ? ` (${headers.slice(0, 4).join(", ")})` : ""}. Data teratas: ${sampleRows.join("; ")}.`,
    );
  });

  const combined = parts.join(" ");
  if (combined.length <= 1400) return combined;
  return `${combined.slice(0, 1390).trim()}...`;
}

export function clickMatchingElement(query: string): string | null {
  const matched = findClickableMatch(query);
  if (!matched) return null;

  const label = (
    matched.getAttribute("aria-label") ||
    matched.getAttribute("title") ||
    matched.textContent ||
    query
  ).trim();
  matched.focus();
  matched.click();
  return label;
}

export function fillMatchingInput(fieldQuery: string, value: string): string | null {
  if (typeof document === "undefined") return null;
  const target = fieldQuery.trim().toLowerCase();
  if (!target) return null;

  const inputs = Array.from(
    document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea"),
  );

  for (const input of inputs) {
    if (input.closest("#a11y-voice-dialog")) continue;
    if (input.disabled || input.readOnly) continue;

    const id = input.id;
    const labelText = id
      ? document.querySelector(`label[for="${CSS.escape(id)}"]`)?.textContent ?? ""
      : "";
    const candidateText = [
      labelText,
      input.getAttribute("aria-label") ?? "",
      input.getAttribute("placeholder") ?? "",
      input.name ?? "",
    ]
      .join(" ")
      .toLowerCase();

    if (candidateText.includes(target)) {
      const proto =
        input instanceof HTMLTextAreaElement
          ? HTMLTextAreaElement.prototype
          : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
      if (setter) {
        setter.call(input, value);
      } else {
        input.value = value;
      }
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      input.focus();
      return labelText.trim() || input.getAttribute("placeholder") || input.name || target;
    }
  }
  return null;
}

export function getAllowedVoiceRoutes(
  role: TYPE_USER_ROLE | null,
  locale: AppLocale,
): Array<{ href: string; label: string }> {
  const seen = new Set<string>();
  const routes: Array<{ href: string; label: string }> = [];

  for (const entry of VOICE_ROUTES) {
    if (seen.has(entry.href)) continue;
    const allowed = entry.isPublic || (role !== null && canAccessRoute(role, entry.href));
    if (!allowed) continue;

    seen.add(entry.href);
    routes.push({
      href: entry.href,
      label: getNavLabel(locale, entry.href, entry.label[locale]),
    });
  }

  return routes;
}
