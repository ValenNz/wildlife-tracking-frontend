import {
  roleHasPermission,
  type AppPermission,
  type TYPE_USER_ROLE,
} from "@/types/auth.type";

export type NavIcon =
  | "grid"
  | "map"
  | "bell"
  | "paw"
  | "alert"
  | "species"
  | "device"
  | "zone"
  | "chart"
  | "ai"
  | "report"
  | "face"
  | "threat"
  | "recap"
  | "media"
  | "visit"
  | "weather"
  | "export"
  | "users"
  | "shield"
  | "log"
  | "profile"
  | "check"
  | "history"
  | "route"
  | "ticket"
  | "guide"
  | "wallet"
  | "star"
  | "scan"
  | "price"
  | "calendar"
  | "cashier"
  | "species3d"
  | "globe"
  | "book"
  | "phone";

export type NavSubItem = {
  label: string;
  href: string;
  permission: AppPermission | AppPermission[];
};

export type NavItem = {
  label: string;
  href: string;
  icon: NavIcon;
  /** Izin backend (tabel role_permissions) yang dibutuhkan; jika array, cukup salah satu. */
  permission: AppPermission | AppPermission[];
  /** Sub-halaman yang digabung di bawah 1 menu sidebar (tampil sebagai tab modul di bagian atas halaman). */
  subItems?: NavSubItem[];
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

const PRIMARY_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "grid", permission: "view_data" },
  { label: "Live Map & 3D", href: "/tracking/live-map", icon: "map", permission: "view_data" },
];

const CONSERVATION_ITEMS: NavItem[] = [
  {
    label: "Analisis AI",
    href: "/ai/vision",
    icon: "ai",
    permission: ["upload_media", "view_data", "verify_ai", "manage_users"],
    subItems: [
      { label: "AI Vision", href: "/ai/vision", permission: "upload_media" },
      { label: "Riwayat Prediksi", href: "/ai/vision/history", permission: "view_data" },
      { label: "Verifikasi AI", href: "/ai/vision/pending", permission: "verify_ai" },
      { label: "Ancaman", href: "/ai/threats", permission: "view_data" },
      { label: "Rekap Data AI", href: "/ai/recap", permission: "view_data" },
      { label: "Laporan AI", href: "/ai/reports", permission: "view_data" },
      { label: "Media Unggahan", href: "/ai/media", permission: "view_data" },
      { label: "Wajah Staf", href: "/ai/staff-faces", permission: "manage_users" },
    ],
  },
  {
    label: "Lapangan",
    href: "/animals",
    icon: "paw",
    permission: "view_data",
    subItems: [
      { label: "Satwa", href: "/animals", permission: "view_data" },
      { label: "Insiden", href: "/incidents", permission: "view_data" },
      { label: "Kunjungan Zona", href: "/zone-visits", permission: "view_data" },
      { label: "Cuaca", href: "/weather", permission: "view_data" },
    ],
  },
  {
    label: "Master Data",
    href: "/species",
    icon: "species",
    permission: "view_data",
    subItems: [
      { label: "Spesies", href: "/species", permission: "view_data" },
      { label: "Perangkat", href: "/devices", permission: "view_data" },
      { label: "Zona Geografis", href: "/geo-zones", permission: "view_data" },
    ],
  },
  {
    label: "Laporan",
    href: "/statistics",
    icon: "chart",
    permission: "view_data",
    subItems: [
      { label: "Statistik", href: "/statistics", permission: "view_data" },
      { label: "Laporan Agregat", href: "/reports", permission: "view_reports" },
      { label: "Ekspor Data", href: "/exports", permission: "export_data" },
    ],
  },
];

const TOURISM_AND_COUNTER_ITEMS: NavItem[] = [
  {
    label: "Jelajah Tur",
    href: "/tours",
    icon: "route",
    permission: "book_tickets",
    subItems: [
      { label: "Jelajah Tur", href: "/tours", permission: "book_tickets" },
      { label: "Peta 3D", href: "/tours/map-3d", permission: "book_tickets" },
      { label: "Jadwal Pemandu", href: "/guides", permission: "book_tickets" },
      { label: "Pesanan Saya", href: "/bookings", permission: "book_tickets" },
    ],
  },
  {
    label: "Kasir (POS)",
    href: "/pos",
    icon: "cashier",
    permission: ["sell_tickets", "validate_tickets", "manage_tourism"],
    subItems: [
      { label: "Kasir (POS)", href: "/pos", permission: "sell_tickets" },
      { label: "Check-in Tiket", href: "/tourism/check-in", permission: "validate_tickets" },
      { label: "Riwayat Sesi Kas", href: "/pos/sessions", permission: "sell_tickets" },
      { label: "Laporan Harian", href: "/pos/report", permission: "manage_tourism" },
    ],
  },
  {
    label: "Kelola Wisata",
    href: "/tourism/bookings",
    icon: "ticket",
    permission: "manage_tourism",
    subItems: [
      { label: "Pemesanan", href: "/tourism/bookings", permission: "manage_tourism" },
      { label: "Verifikasi Pembayaran", href: "/tourism/payments", permission: "manage_tourism" },
      { label: "Rute Tur", href: "/tourism/routes", permission: "manage_tourism" },
      { label: "Pemandu", href: "/tourism/guides", permission: "manage_tourism" },
      { label: "Shift Pemandu", href: "/tourism/shifts", permission: "manage_tourism" },
      { label: "Tarif & Libur", href: "/tourism/prices", permission: "manage_tourism" },
      { label: "Ulasan", href: "/tourism/reviews", permission: "manage_tourism" },
    ],
  },
];

const SYSTEM_AND_ACCOUNT_ITEMS: NavItem[] = [
  {
    label: "Sistem",
    href: "/users",
    icon: "users",
    permission: ["manage_users", "manage_roles"],
    subItems: [
      { label: "Pengguna", href: "/users", permission: "manage_users" },
      { label: "Role & Izin", href: "/roles", permission: "manage_roles" },
      { label: "Log Aktivitas", href: "/activity-logs", permission: "manage_users" },
    ],
  },
  { label: "Kontak Darurat", href: "/emergency-contacts", icon: "phone", permission: ["view_data", "book_tickets", "sell_tickets"] },
  { label: "Panduan Pengguna", href: "/manual", icon: "book", permission: ["view_data", "book_tickets", "sell_tickets"] },
  { label: "Profil Saya", href: "/profile", icon: "profile", permission: ["view_data", "book_tickets", "sell_tickets"] },
];

/** Halaman tambahan yang dapat diakses tanpa perlu duplikat di sidebar (mis. tombol lonceng Notifikasi di header). */
const UTILITY_ROUTES: NavSubItem[] = [
  { label: "Notifikasi", href: "/notifications", permission: ["view_data", "book_tickets", "sell_tickets"] },
];

const ALL_SECTIONS: NavSection[] = [
  { title: "Utama", items: PRIMARY_ITEMS },
  { title: "Operasional", items: CONSERVATION_ITEMS },
  { title: "Wisata & Loket", items: TOURISM_AND_COUNTER_ITEMS },
  { title: "Akun & Sistem", items: SYSTEM_AND_ACCOUNT_ITEMS },
];

const hasPermission = (role: TYPE_USER_ROLE, permission: AppPermission | AppPermission[]): boolean =>
  (Array.isArray(permission) ? permission : [permission]).some((perm) =>
    roleHasPermission(role, perm),
  );

const filterItemForRole = (role: TYPE_USER_ROLE, item: NavItem): NavItem | null => {
  if (!hasPermission(role, item.permission)) return null;
  if (!item.subItems) return item;
  const allowedSubs = item.subItems.filter((sub) => hasPermission(role, sub.permission));
  if (allowedSubs.length === 0) return null;
  return {
    ...item,
    href: allowedSubs[0].href,
    subItems: allowedSubs,
  };
};

const sectionsForRole = (role: TYPE_USER_ROLE): NavSection[] =>
  ALL_SECTIONS.map((section) => ({
    ...section,
    items: section.items
      .map((item) => filterItemForRole(role, item))
      .filter((item): item is NavItem => item !== null),
  })).filter((section) => section.items.length > 0);

export const NAV_SECTIONS: Record<TYPE_USER_ROLE, NavSection[]> = {
  konservasionis_lapangan: sectionsForRole("konservasionis_lapangan"),
  peneliti_ekologi: sectionsForRole("peneliti_ekologi"),
  administrator_sistem: sectionsForRole("administrator_sistem"),
  pengambil_kebijakan: sectionsForRole("pengambil_kebijakan"),
  petugas_loket: sectionsForRole("petugas_loket"),
  pengunjung: sectionsForRole("pengunjung"),
};

/** Halaman tambah/ubah memakai izin backend yang lebih ketat daripada menu daftarnya. */
const WRITE_ROUTES: { pattern: RegExp; permission: AppPermission }[] = [
  {
    pattern: /^\/(animals|species|devices|geo-zones)\/(create|[^/]+\/(edit|update))$/,
    permission: "manage_master_data",
  },
  { pattern: /^\/incidents\/create$/, permission: "create_data" },
  { pattern: /^\/incidents\/[^/]+\/(edit|update)$/, permission: "update_data" },
  { pattern: /^\/zone-visits\/create$/, permission: "create_data" },
  { pattern: /^\/tours\/[^/]+\/create$/, permission: "book_tickets" },
  { pattern: /^\/pos\/report/, permission: "manage_tourism" },
];

export const DEFAULT_ROLE: TYPE_USER_ROLE = "konservasionis_lapangan";

export const getDefaultRouteForRole = (role: TYPE_USER_ROLE): string =>
  NAV_SECTIONS[role][0]?.items[0]?.href ?? "/dashboard";

export const isRouteActive = (pathname: string, href: string): boolean =>
  pathname === href || pathname.startsWith(`${href}/`);

const allEntriesForRole = (role: TYPE_USER_ROLE): { label: string; href: string; parentHref: string; subItems?: NavSubItem[] }[] => {
  const entries: { label: string; href: string; parentHref: string; subItems?: NavSubItem[] }[] = [];
  for (const section of NAV_SECTIONS[role]) {
    for (const item of section.items) {
      if (item.subItems && item.subItems.length > 0) {
        for (const sub of item.subItems) {
          entries.push({
            label: sub.label,
            href: sub.href,
            parentHref: item.href,
            subItems: item.subItems,
          });
        }
      } else {
        entries.push({
          label: item.label,
          href: item.href,
          parentHref: item.href,
        });
      }
    }
  }
  for (const util of UTILITY_ROUTES) {
    if (hasPermission(role, util.permission)) {
      entries.push({
        label: util.label,
        href: util.href,
        parentHref: util.href,
      });
    }
  }
  return entries;
};

export const canAccessRoute = (role: TYPE_USER_ROLE, pathname: string): boolean => {
  const writeRoute = WRITE_ROUTES.find((route) => route.pattern.test(pathname));
  if (writeRoute && !roleHasPermission(role, writeRoute.permission)) return false;

  return allEntriesForRole(role).some((entry) => isRouteActive(pathname, entry.href));
};

const findActiveEntry = (role: TYPE_USER_ROLE, pathname: string) =>
  allEntriesForRole(role)
    .filter((entry) => isRouteActive(pathname, entry.href))
    .sort((left, right) => right.href.length - left.href.length)[0];

/** Sidebar item href yang aktif untuk path ini (termasuk ketika berada di sub-halaman). */
export const findActiveHref = (role: TYPE_USER_ROLE, pathname: string): string | null =>
  findActiveEntry(role, pathname)?.parentHref ?? null;

/** Sub-tab modul untuk path saat ini (tampil di atas halaman ketika menu memiliki beberapa sub-halaman). */
export const findModuleSubItems = (role: TYPE_USER_ROLE, pathname: string): NavSubItem[] => {
  const subs = findActiveEntry(role, pathname)?.subItems ?? [];
  return subs.length > 1 ? subs : [];
};

export const findNavTitle = (role: TYPE_USER_ROLE, pathname: string): string =>
  findActiveEntry(role, pathname)?.label ?? "Wildlife Monitoring System";
