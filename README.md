# 🐾 Sistem Pelacakan Pergerakan Satwa Liar Berbasis Sensor GPS — Frontend

> **Klien:** Balai Taman Nasional Gunung Leuser (BTNGL)
> **Repo ini:** antarmuka web (Next.js App Router) untuk *Wildlife Monitoring System*
> **PIC Frontend:** **Yohana Sinaga**

Dokumen ini adalah **sumber kebenaran tunggal** untuk mengerjakan bagian frontend.
Semua penjelasan ditulis dalam Bahasa Indonesia; nama file, kode, dan istilah teknis
tetap dalam Bahasa Inggris.

---

## 👥 Tim Proyek

| Nama                          | Peran                           |
| ----------------------------- | ------------------------------- |
| Farrellino Ulung Satya Amando | PIC AI & Integration            |
| Nuevalen Refitra Alswando     | PIC Database                    |
| **Yohana Sinaga**       | **PIC Frontend** ⭐       |
| Laura Chyndearni Saragih      | PIC Database                    |
| Yohanna Purnomo               | PIC Backend & PIC Documentation |

Repo terkait: `wildlife-tracking-backend` (REST API Laravel) · `wildlife-tracking-database` (desain skema)

---

## 📑 Daftar Isi

1. [Gambaran Umum](#1-gambaran-umum)
2. [Tech Stack](#2-tech-stack)
3. [Struktur Proyek](#3-struktur-proyek)
4. [Alur Data &amp; Autentikasi](#4-alur-data--autentikasi)
5. [Konvensi Coding](#5-konvensi-coding-wajib-dihafal-)
6. [Endpoint API](#6-endpoint-api-yang-tersedia)
7. [Cara Menjalankan](#7-cara-menjalankan)
8. [Kredensial Uji](#8-kredensial-uji)
9. [Matriks Akses Berbasis Role](#9-matriks-akses-berbasis-role)
10. [Status Sprint](#10-status-sprint)
11. [Panduan Cepat untuk Frontend PIC](#11-panduan-cepat-untuk-frontend-pic-yohana-)
12. [Masalah Umum &amp; Solusi](#12-masalah-umum--solusi)
13. [Referensi](#13-referensi)
14. [Kontak](#14-kontak)

---

## ⚠️ Catatan Penting Sebelum Mulai

Brief sprint awal menyebut **Next.js 14 / React 18**. Manifest di `package.json` yang
terpasang saat ini adalah **Next.js 16.3.8 / React 19.2.8**. Yang dipakai dalam kode dan
dokumen ini adalah **hasil baca langsung dari repository**, bukan brief lama.
Daftar selisih yang sering menjadi sumber confusion:

| Brief lama                                 | Kenyataan di repo                                                                   | Ikuti yang mana                |
| ------------------------------------------ | ----------------------------------------------------------------------------------- | ------------------------------ |
| Next.js 14, React 18                       | **Next.js 16.3.8, React 19.2.8**                                              | ✅ Manifest                    |
| `services/api.ts`                        | **`services/api-client.ts`** (mengekspor `api`, bukan default export)     | ✅ Repo                        |
| `types/export.type.ts`                   | **belum ada**                                                                 | Jangan di-import sampai dibuat |
| `app/auth/login/`                        | **`app/login/page.tsx`**                                                    | ✅ Repo                        |
| `next.config.js`, `tailwind.config.ts` | **`next.config.ts`**, Tailwind 4 **tanpa** file config                | ✅ Repo                        |
| `NEXT_PUBLIC_COOKIE_SESSION`             | Nama cookie sesi `wms_session` **hardcoded** di `lib/session.ts:4`        | ✅ Repo                        |
| `.env.local`                             | Repo memakai **`.env`** (`.env*` sudah di-gitignore)                      | Keduanya bisa                  |
| `GET /api/export/gps`                    | Rutenya **`/api/export/gps/csv`** dan **`/api/export/gps/geojson`** | ✅ Repo                        |
| `GET /api/animals/{id}`                  | **Belum ada** di backend                                                      | Jangan dipanggil               |

Alias import `@/` menunjuk ke **root frontend** (`tsconfig.json` → `"@/*": ["./*"]`).
**Tidak ada folder `src/`.** Path bertuliskan `src/...` di dokumen lama itu salah.

---

## 1. Gambaran Umum

**Sistem Pelacakan Pergerakan Satwa Liar Berbasis Sensor GPS** adalah aplikasi web untuk
memantau pergerakan satwa endemik yang terancam punah di kawasan Taman Nasional Gunung
Leuser, Sumatera Utara — **Orangutan Sumatra**, **Harimau Sumatra**, **Badak Sumatra**, dan
**Gajah Sumatra** — melalui perangkat pelacak GPS yang dipasang pada leher satwa.

Fitur utama:

- 📍 **Pemantauan GPS real-time** — posisi satwa dari GPS collar, dipetakan pada live map.
- 📝 **Pelaporan insiden lapangan** — konflik satwa–manusia, penjarahan, dan hotspot kebakaran hutan.
- 🗺️ **Manajemen zona berisiko** — permukiman, jalan nasional, perkebunan, koridor ekologi.
- 🤖 **Deteksi spesies berbasis AI** — assisted identification dari foto/video lapangan.
- 📊 **Dashboard per peran** — ringkasan statistik untuk konservasionis, peneliti,
  administrator, dan pengambil kebijakan.

Frontend **hanya** mengurus UI dan komunikasi HTTP. Frontend **tidak pernah** menyentuh
database atau provider AI secara langsung — semuanya lewat backend Laravel.

### Peran pengguna

| Nilai role (enum `users.role`) | Label di UI             |
| -------------------------------- | ----------------------- |
| `konservasionis_lapangan`      | Konservasionis Lapangan |
| `peneliti_ekologi`             | Peneliti Ekologi        |
| `administrator_sistem`         | Administrator Sistem    |
| `pengambil_kebijakan`          | Pengambil Kebijakan     |

🔐 Role yang ditampilkan di sidebar hanya untuk **UX**. Otorisasi sesungguhnya ditegakkan backend
(`auth:sanctum` + Policy).

---

## 2. Tech Stack

| Lapisan               | Teknologi                                                                      | Versi terpasang                                        |
| --------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------ |
| Framework             | Next.js (**App Router**)                                                 | `16.3.8`                                             |
| UI Library            | React / React DOM                                                              | `19.2.8`                                             |
| Bahasa                | TypeScript (`strict: true`)                                                  | `^5`                                                 |
| Styling               | Tailwind CSS (CSS-first config)                                                | `^4`                                                 |
| Data fetching & cache | `@tanstack/react-query`                                                      | `^5.104.4`                                           |
| Tabel                 | `@tanstack/react-table`                                                      | `^8.21.3`                                            |
| Form                  | `react-hook-form` + `@hookform/resolvers`                                  | `^7.90.0` / `^5.9.2`                               |
| Validasi              | Zod                                                                            | `^4.6.5`                                             |
| Utility class         | `clsx` + `tailwind-merge`                                                  | `^2.1.1` / `^3.7.0`                                |
| HTTP client           | **Fetch API bawaan browser** (`services/api-client.ts`) — tanpa Axios | —                                                     |
| Linter                | ESLint (flat config)                                                           | `^9`                                                 |
| **Backend**     | Laravel                                                                        | `^13.17` (PHP `^8.3`) — `http://localhost:8000` |
| **Database**    | MySQL                                                                          | `8.0` — `127.0.0.1:3306`                          |
| **Auth**        | Laravel Sanctum (Bearer token disimpan di cookie httpOnly)                     | —                                                     |

> **Tidak ada Axios.** Semua request memakai `fetch` bawaan browser melalui
> `services/api-client.ts`.
> **Tailwind 4 tidak punya `tailwind.config.ts`.** Token desain ditulis di
> `app/globals.css` memakai `@import "tailwindcss"` dan blok `@theme`.

---

## 3. Struktur Proyek

```
wildlife-tracking-frontend/
├── app/                                  # Next.js App Router (routing + route handlers)
│   ├── (protected)/                      # Route group: halaman wajib login
│   │   ├── layout.tsx                    # Baca cookie sesi; redirect /login bila kosong
│   │   ├── dashboard/
│   │   │   └── page.tsx                  # Dashboard (ringkasan per role)
│   │   ├── master-data/                  # Modul master data
│   │   │   ├── animals/
│   │   │   │   ├── page.tsx              # Tipis: hanya render <AnimalListView />
│   │   │   │   ├── animal-list-view.tsx  # Client view: tabel + filter + state UI
│   │   │   │   ├── columns.tsx           # Definisi kolom TanStack Table
│   │   │   │   ├── filter.ts             # State filter + opsi dropdown
│   │   │   │   └── [id]/detail/
│   │   │   │       ├── page.tsx          # Server micomponent pembungkus
│   │   │   │       └── animal-detail-view.tsx
│   │   │   ├── species/                  # Pola identik dengan animals
│   │   │   └── devices/                  # Pola identik dengan animals
│   │   ├── incidents/
│   │   │   ├── page.tsx
│   │   │   └── incident-list-view.tsx
│   │   ├── notifications/
│   │   │   ├── page.tsx
│   │   │   └── notification-list-view.tsx
│   │   └── tracking/
│   │       └── live-map/
│   │           ├── page.tsx
│   │           └── live-map-view.tsx     # Placeholder; map provider belum diintegrasikan
│   ├── api/                              # Route handler Next.js = lapisan proxy server
│   │   ├── auth/
│   │   │   ├── login/route.ts            # POST → Laravel /api/login, tulis cookie
│   │   │   └── logout/route.ts           # POST → hapus semua cookie auth
│   │   └── wildlife/[...path]/route.ts   # Proxy GET → Laravel (allow-list resource)
│   ├── login/
│   │   └── page.tsx                      # Halaman login (Sprint 1 ✅)
│   ├── globals.css                       # @import "tailwindcss" + blok @theme
│   ├── layout.tsx                        # Root layout + <QueryProvider>
│   └── page.tsx                          # Redirect → /dashboard atau /login
│
├── components/                           # Komponen UI reusable
│   ├── dashboard/
│   │   └── dashboard-view.tsx
│   ├── layout/                           # Chrome aplikasi
│   │   ├── app-shell.tsx                 # Wrapper: sidebar + header + <main>
│   │   ├── header.tsx                    # Top bar (user, notifikasi, logout)
│   │   └── sidebar.tsx                   # Navigasi berdasarkan role
│   ├── providers/
│   │   └── query-provider.tsx            # QueryClientProvider global (sudah terpasang)
│   ├── ui/                               # Komponen atomik
│   │   ├── data-table.tsx                # Wrapper TanStack Table
│   │   ├── data-filters.tsx              # Filter bar (search, select, date range)
│   │   ├── loading.tsx                   # Spinner / skeleton
│   │   ├── error-state.tsx               # Error boundary + pesan ApiError
│   │   ├── status-badge.tsx              # Badge status (success/warning/danger/info/neutral)
│   │   ├── empty-state.tsx               # Keadaan data kosong
│   │   └── stat-card.tsx                 # Kartu statistik dashboard
│   └── wildlife/
│       └── device-alerts.tsx
│
├── hooks/                                # Hook React Query (SATU-SATUNYA akses data)
│   ├── animal.hook.ts                    # useAnimal, useInfiniteAnimal, useAnimalById,
│   │                                     # useAnimalCreate, useAnimalUpdate, useAnimalDelete
│   ├── species.hook.ts                   # Pola sama untuk spesies
│   ├── user.hook.ts                      # Pola sama untuk user
│   ├── index.ts                          # Barrel export
│   ├── useAsyncResource.ts               # ⚠️ LEGACY — jangan tiru untuk kode baru
│   ├── use-debounce.ts                   # Helper umum
│   ├── useDashboardSummary.ts            # ⚠️ LEGACY
│   ├── useGeoZones.ts                    # ⚠️ LEGACY
│   ├── useGPSReadings.ts                 # ⚠️ LEGACY
│   ├── useIncidentReports.ts            # ⚠️ LEGACY
│   ├── useNotifications.ts               # ⚠️ LEGACY
│   └── useTrackingDevices.ts             # ⚠️ LEGACY
│
├── lib/                                  # Utilitas lintas fitur (server + client)
│   ├── cookie-names.ts                   # Resolver nama cookie dari env + fallback
│   ├── laravel-proxy.ts                  # fetch server-side ke Laravel, normalisasi payload
│   ├── navigation.ts                     # Peta role → menu (NAV_SECTIONS)
│   ├── session.ts                        # getSessionUser(), nama cookie wms_session
│   └── utils.ts                          # cn() dan pembantu umum
│
├── services/                             # Service layer — HANYA lapisan yang memanggil API
│   ├── api-client.ts                     # api.get/post/put/patch/delete + ApiError + timeout
│   ├── endpoint.ts                       # API_ENDPOINT + WILDLIFE_BASE_PATH
│   ├── cookieToken.ts                    # Server-only: baca/tulis cookie token
│   ├── animal.service.ts                 # ANIMAL_SERVICE
│   ├── species.service.ts                # SPECIES_SERVICE
│   ├── user.service.ts                   # USER_SERVICE
│   ├── tracking-device.service.ts        # ⚠️ LEGACY (getTrackingDevices, dll.)
│   ├── gps-reading.service.ts            # ⚠️ LEGACY
│   ├── geo-zone.service.ts               # ⚠️ LEGACY
│   ├── incident-report.service.ts        # ⚠️ LEGACY
│   ├── notification.service.ts           # ⚠️ LEGACY
│   ├── dashboard.service.ts              # ⚠️ LEGACY
│   └── index.ts                          # Barrel export
│
├── types/                                # Semua type TypeScript
│   ├── api.type.ts                       # ApiResponse, ApiErrorKind, ApiErrorState
│   ├── endpoint.type.ts                  # QUERY_PARAMS_API_GET_ALL, TYPE_MUTATION_RESULT
│   ├── meta.type.ts                      # TYPE_META_PAGGINATION
│   ├── user.type.ts                      # TYPE_USER, TYPE_USER_ROLE, TYPE_LOGIN_*
│   ├── species.type.ts                   # TYPE_SPECIES, TYPE_CONSERVATION_STATUS
│   ├── animal.type.ts                    # TYPE_ANIMAL, TYPE_ANIMAL_GENDER
│   ├── tracking-device.type.ts           # ⚠️ LEGACY (belum .type.ts)
│   ├── dashboard.ts                      # ⚠️ LEGACY
│   ├── gps-reading.ts                    # ⚠️ LEGACY
│   ├── geo-zone.ts                       # ⚠️ LEGACY
│   ├── incident-report.ts                # ⚠️ LEGACY
│   ├── notification.ts                   # ⚠️ LEGACY
│   └── index.ts                          # Barrel export
│
├── schemas/                              # Skema Zod per entity (folder masih kosong)
├── utils/
│   └── format.ts                         # formatDate, formatShortDate, formatNumber, dll.
├── public/                               # Aset statis
├── .env                                  # Environment lokal (gitignored)
├── .gitignore
├── eslint.config.mjs                     # ESLint 9 flat config
├── next.config.ts                        # Konfigurasi Next.js
├── package.json
├── postcss.config.mjs                    # Plugin @tailwindcss/postcss
└── tsconfig.json                         # strict: true, alias "@/*"
```

> 📌 **Dua pola hidup berdampingan.** File `*.type.ts` + `[entity].service.ts` +
> `[entity].hook.ts` adalah **pola terkini**. File `useXxx.ts` dan `types/xxx.ts`
> (tanpa suffix `.type`) adalah **pola lama** yang belum dimigrasi. **Jangan menyalin
> gaya kode legacy ke file baru.**

### Route yang tersedia

| URL                         | Keterangan                                 |
| --------------------------- | ------------------------------------------ |
| `/`                       | Redirect ke `/dashboard` atau `/login` |
| `/login`                  | Form login (publik)                        |
| `/dashboard`              | Ringkasan per role                         |
| `/master-data/animals`    | Daftar satwa (+ `/[id]/detail`)          |
| `/master-data/species`    | Daftar spesies (+ `/[id]/detail`)        |
| `/master-data/devices`    | Daftar perangkat (+ `/[id]/detail`)      |
| `/incidents`              | Daftar laporan insiden                     |
| `/notifications`          | Daftar notifikasi                          |
| `/tracking/live-map`      | Live map (provider map belum terintegrasi) |
| `/api/wildlife/[...path]` | Proxy ke Laravel (**GET saja**)      |
| `/api/auth/login`         | `POST` → Laravel `/api/login`         |
| `/api/auth/logout`        | `POST` → hapus cookie auth              |

Route group `(protected)` **tidak mengubah URL**, hanya menambah proteksi.

---

## 4. Alur Data & Autentikasi

```
Component (client)
   ↓ panggil hook
Hook (useAnimal, useSpecies, …)  ← @tanstack/react-query
   ↓ panggil service
Service (ANIMAL_SERVICE, SPECIES_SERVICE, …)
   ↓ panggil api-client
services/api-client.ts  → fetch same-origin "/api/wildlife/..."
   ↓ Next.js route handler
app/api/wildlife/[...path]/route.ts   ← GET only, allow-list resource
   ↓ lib/laravel-proxy.ts (server-side, HEADER Authorization: Bearer)
Laravel http://localhost:8000/api
```

**Kenapa harus lewat proxy?** Backend **tidak** mengirim header CORS. Panggilan langsung
dari browser ke `:8000` akan diblokir. Karena itu semua request data harus **same-origin**
(`/api/...`) lalu diteruskan server-side oleh Next.js.

**Token tidak pernah menyentuh JavaScript client.** Setelah login berhasil,
`app/api/auth/login/route.ts` menulis dua cookie **httpOnly**:

| Cookie          | Isi                                   | Dibaca oleh                                             |
| --------------- | ------------------------------------- | ------------------------------------------------------- |
| `wms_session` | Payload user (JSON) untuk gating role | `lib/session.ts`                                      |
| `wms_token`   | Bearer token Sanctum                  | `services/cookieToken.ts` → `lib/laravel-proxy.ts` |

> ⚠️ **Aturan keras:** hanya `lib/laravel-proxy.ts` yang boleh meng-import
> `services/cookieToken.ts`. Jangan pernah meng-import `next/headers` di file yang akan
> dieksekusi di browser.

### Normalisasi envelope

Backend belum seragam: `/api/animals` dan `/api/species` mengirim `{ data: [...] }`,
`/api/devices` mengirim `{ success, data }`, `/api/gps-readings` mengirim
`{ success, data, total }`. `lib/laravel-proxy.ts` menormalkan semuanya menjadi
`{ success, message, data }`. `meta` (pagination) **disintesis di service layer**
sampai backend benar-benar mengimplementasikan pagination.

---

## 5. Konvensi Coding (WAJIB DIHAFAL) 🔑

Tiga pola ini adalah inti dari seluruh codebase. Hafalkan, terapkan konsisten:

| Lapisan | Pola                                                                                                                               | Contoh                                   |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Type    | `TYPE_[ENTITY]`, `TYPE_[ENTITY]_PAYLOAD`, `TYPE_[ENTITY]_GET_ALL_RESPONSE`, `TYPE_[ENTITY]_GET_BY_ID_RESPONSE`             | `TYPE_ANIMAL`, `TYPE_ANIMAL_PAYLOAD` |
| Service | konstanta `[ENTITY]_SERVICE` dengan method `GET_ALL` / `GET_BY_ID` / `CREATE` / `UPDATE` / `DELETE`                    | `ANIMAL_SERVICE`                       |
| Hook    | `use[Entity]`, `useInfinite[Entity]`, `use[Entity]ById`, `use[Entity]Create`, `use[Entity]Update`, `use[Entity]Delete` | `useAnimalById`                        |

> File name → nama symbol: `animal.type.ts` → `TYPE_ANIMAL`;
> `animal.service.ts` → `ANIMAL_SERVICE`; `animal.hook.ts` → `useAnimal`.
> **Tiga nama itu selalu berjalan beriringan.**

### 5.1 Konvensi nama file

| Jenis            | Format                                               | Contoh                                                                 |
| ---------------- | ---------------------------------------------------- | ---------------------------------------------------------------------- |
| Types            | `[entity].type.ts` (kecil, boleh hyphen)           | `user.type.ts`, `tracking-device.type.ts`, `gps-reading.type.ts` |
| Service          | `[entity].service.ts`                              | `species.service.ts`, `tracking-device.service.ts`                 |
| Hook             | `[entity].hook.ts`                                 | `animal.hook.ts`, `gps-reading.hook.ts`                            |
| Komponen         | `PascalCase.tsx`                                   | `AnimalListView` di `animal-list-view.tsx`                         |
| Kolom tabel      | `columns.tsx` di dalam folder modul                | `app/(protected)/master-data/animals/columns.tsx`                    |
| Filter           | `filter.ts` di dalam folder modul                  | `.../animals/filter.ts`                                              |
| View per halaman | `[nama]-list-view.tsx`, `[nama]-detail-view.tsx` | `incident-list-view.tsx`                                             |
| Server component | `page.tsx`, `layout.tsx`                         | selalu                                                                 |

> Teks UI, comment, dan pesan error **Bahasa Indonesia**.
> Nama identifier, nama file, dan istilah teknis **Bahasa Inggris**.

### 5.2 Konvensi nama type

Semua type memakai awalan `TYPE_` dan HURUF BESAR. Empat type wajib per entity:

| Type                                 | Isi                                                                           |
| ------------------------------------ | ----------------------------------------------------------------------------- |
| `TYPE_[ENTITY]`                    | Entitas tunggal                                                               |
| `TYPE_[ENTITY]_PAYLOAD`            | Body untuk create/update                                                      |
| `TYPE_[ENTITY]_GET_ALL_RESPONSE`   | `{ items: TYPE_X[]; meta: TYPE_META_PAGGINATION }`                          |
| `TYPE_[ENTITY]_GET_BY_ID_RESPONSE` | `{ items: TYPE_X; meta: null }` — `items` **tunggal**, bukan array |

📄 **`types/animal.type.ts` — contoh lengkap (file ini sudah ada, tiru persis):**

```typescript
import { TYPE_META_PAGGINATION } from "@/types/meta.type";
import type { TYPE_SPECIES } from "@/types/species.type";

export type TYPE_ANIMAL_GENDER = "Jantan" | "Betina" | "Tidak Diketahui";

export type TYPE_ANIMAL = {
  animal_id: number;
  species_id: number;
  animal_code: string;
  birth_date: string | null;
  gender: TYPE_ANIMAL_GENDER;
  birth_date_label?: string;
  is_active: boolean;
  species?: TYPE_SPECIES | null;
  created_at: string;
  updated_at: string;
};

export type TYPE_ANIMAL_PAYLOAD = {
  species_id: number;
  animal_code: string;
  birth_date: string | null;
  gender: TYPE_ANIMAL_GENDER;
  is_active: boolean;
};

export type TYPE_ANIMAL_GET_ALL_RESPONSE = {
  items: TYPE_ANIMAL[];
  meta: TYPE_META_PAGGINATION;
};

export type TYPE_ANIMAL_GET_BY_ID_RESPONSE = {
  items: TYPE_ANIMAL;
  meta: null;
};

export const TYPE_ANIMAL_GENDER_LABELS: Record<TYPE_ANIMAL_GENDER, string> = {
  Jantan: "Jantan",
  Betina: "Betina",
  "Tidak Diketahui": "Tidak Diketahui",
};

export const TYPE_ANIMAL_GENDER_GLYPHS: Record<TYPE_ANIMAL_GENDER, string> = {
  Jantan: "♂",
  Betina: "♀",
  "Tidak Diketahui": "?",
};
```

📄 **`types/meta.type.ts`:**

```typescript
export type TYPE_META_PAGGINATION = {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  total_items: number;
};
```

📄 **`types/endpoint.type.ts`:**

```typescript
export type TYPE_ORDER_DIRECTION = "asc" | "desc";

export type QUERY_PARAMS_API_GET_ALL = {
  page: number;
  per_page: number;
  order?: TYPE_ORDER_DIRECTION;
  orderBy?: string;
  search?: string;
};

export type TYPE_MUTATION_RESULT<T> = {
  data: T;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: unknown;
  reset: () => void;
};
```

📄 **`types/api.type.ts` (kontrak response API):**

```typescript
export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]> | null;
};

export type ApiErrorKind =
  | "unauthorized"
  | "forbidden"
  | "validation"
  | "not_found"
  | "server"
  | "network"
  | "unknown";

export type ApiErrorState = {
  kind: ApiErrorKind;
  status: number;
  message: string;
  errors: Record<string, string[]> | null;
};
```

Aturan tambahan:

- Gunakan `import type { … }` untuk type-only import.
- **DILARANG** `interface` → selalu `type`.
- **DILARANG** `any` → gunakan `unknown` lalu narrow.
- Ekspor lewat `types/index.ts` (barrel) bila memang dipakai luas.
- Enum domain (gender, status konservasi) diubah jadi **string union**, bukan `enum`.

### 5.3 Konvensi service

Satu konstanta **HURUF BESAR** per entity. Semua method mengembalikan
`Promise<ApiResponse<T>>` yang sudah diberi tipe secara eksplisit. Body write dikirim sebagai
**`{ body: payload }`**, bukan sebagai argumen kedua.

📄 **`services/animal.service.ts` — contoh lengkap (sudah ada, tiru persis):**

```typescript
import { api } from "@/services/api-client";
import { API_ENDPOINT, WILDLIFE_BASE_PATH } from "@/services/endpoint";
import type { ApiResponse } from "@/types/api.type";
import type { QUERY_PARAMS_API_GET_ALL } from "@/types/endpoint.type";
import type {
  TYPE_ANIMAL,
  TYPE_ANIMAL_GET_ALL_RESPONSE,
  TYPE_ANIMAL_GET_BY_ID_RESPONSE,
  TYPE_ANIMAL_PAYLOAD,
} from "@/types/animal.type";

export const ANIMAL_SERVICE = {
  GET_ALL: async (
    params?: Partial<QUERY_PARAMS_API_GET_ALL>,
  ): Promise<ApiResponse<TYPE_ANIMAL_GET_ALL_RESPONSE>> => {
    return api.get<ApiResponse<TYPE_ANIMAL_GET_ALL_RESPONSE>>(
      `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.ANIMALS.GET_ALL(params)}`,
    );
  },

  GET_BY_ID: async (
    id: number,
  ): Promise<ApiResponse<TYPE_ANIMAL_GET_BY_ID_RESPONSE>> => {
    return api.get<ApiResponse<TYPE_ANIMAL_GET_BY_ID_RESPONSE>>(
      `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.ANIMALS.GET_BY_ID(id)}`,
    );
  },

  CREATE: async (
    payload: TYPE_ANIMAL_PAYLOAD,
  ): Promise<ApiResponse<TYPE_ANIMAL>> => {
    return api.post<ApiResponse<TYPE_ANIMAL>>(
      `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.ANIMALS.CREATE}`,
      { body: payload },
    );
  },

  UPDATE: async (
    id: number,
    payload: TYPE_ANIMAL_PAYLOAD,
  ): Promise<ApiResponse<TYPE_ANIMAL>> => {
    return api.put<ApiResponse<TYPE_ANIMAL>>(
      `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.ANIMALS.UPDATE(id)}`,
      { body: payload },
    );
  },

  DELETE: async (id: number): Promise<ApiResponse<null>> => {
    return api.delete<ApiResponse<null>>(
      `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.ANIMALS.DELETE(id)}`,
    );
  },
} as const;
```

📄 **`services/endpoint.ts` — semua path dikumpulkan di satu tempat:**

```typescript
export const WILDLIFE_BASE_PATH = "/api/wildlife";

export const API_ENDPOINT = {
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    ME: "/me",
  },
  WILDLIFE: {
    USER: {
      GET_ALL: (params?: Partial<QUERY_PARAMS_API_GET_ALL>) => listPath("users", params),
      GET_BY_ID: (id: number) => `/users/${id}`,
      CREATE: "/users",
      UPDATE: (id: number) => `/users/${id}`,
      DELETE: (id: number) => `/users/${id}`,
    },
    SPECIES: {
      GET_ALL: (params?: Partial<QUERY_PARAMS_API_GET_ALL>) =>
        listPath("species", params),
      GET_BY_ID: (id: number) => `/species/${id}`,
      CREATE: "/species",
      UPDATE: (id: number) => `/species/${id}`,
      DELETE: (id: number) => `/species/${id}`,
    },
    ANIMALS: {
      GET_ALL: (params?: Partial<QUERY_PARAMS_API_GET_ALL>) =>
        listPath("animals", params),
      GET_BY_ID: (id: number) => `/animals/${id}`,
      CREATE: "/animals",
      UPDATE: (id: number) => `/animals/${id}`,
      DELETE: (id: number) => `/animals/${id}`,
    },
  },
} as const;
```

⚠️ `CREATE` / `UPDATE` / `DELETE` **sudah dikontrak di kode, tapi belum bisa dipakai** —
backend belum mendaftarkan route write dan proxy baru mengekspor `GET`. Lihat §6.

### 5.4 Konvensi hook

Semua hook dibangun di atas `@tanstack/react-query`. `QueryProvider` sudah terpasang
global di `app/layout.tsx` — **tidak perlu** setup lagi di halaman baru.

📄 **`hooks/animal.hook.ts` — contoh lengkap (sudah ada, tiru persis):**

```typescript
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ANIMAL_SERVICE } from "@/services/animal.service";
import type { QUERY_PARAMS_API_GET_ALL } from "@/types/endpoint.type";
import type { TYPE_ANIMAL_PAYLOAD } from "@/types/animal.type";

export const useAnimal = (params?: QUERY_PARAMS_API_GET_ALL) => {
  return useQuery({
    queryKey: ["animals", params],
    queryFn: () => ANIMAL_SERVICE.GET_ALL(params),
  });
};

export const useInfiniteAnimal = (
  params: Omit<QUERY_PARAMS_API_GET_ALL, "page">,
) => {
  return useInfiniteQuery({
    queryKey: ["animals-infinite", params],
    queryFn: ({ pageParam = 1 }) =>
      ANIMAL_SERVICE.GET_ALL({ ...params, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage?.data?.meta;

      if (!meta) return undefined;

      return meta.page < meta.total_pages ? meta.page + 1 : undefined;
    },
  });
};

export const useAnimalById = (id: number) => {
  return useQuery({
    queryKey: ["animals", id],
    queryFn: () => ANIMAL_SERVICE.GET_BY_ID(id),
    enabled: Number.isFinite(id) && id > 0,
  });
};

export const useAnimalCreate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TYPE_ANIMAL_PAYLOAD) => ANIMAL_SERVICE.CREATE(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["animals"] });
    },
  });
};

export const useAnimalUpdate = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TYPE_ANIMAL_PAYLOAD) =>
      ANIMAL_SERVICE.UPDATE(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["animals"] });
      queryClient.invalidateQueries({ queryKey: ["animals", id] });
    },
  });
};

export const useAnimalDelete = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => ANIMAL_SERVICE.DELETE(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["animals"] });
      queryClient.invalidateQueries({ queryKey: ["animals", id] });
    },
  });
};
```

📋 **Aturan query key** (jangan diacak):

| Hook                          | `queryKey`                     |
| ----------------------------- | -------------------------------- |
| `useAnimal(params)`         | `["animals", params]`          |
| `useInfiniteAnimal(params)` | `["animals-infinite", params]` |
| `useAnimalById(id)`         | `["animals", id]`              |

Suffix **jamak** untuk list (`"animals"`), **tunggal** untuk detail (`id` sebagai elemen
kedua). Setelah mutasi sukses, selalu `invalidateQueries` dengan prefix yang sama.

### 5.5 Kontrak response API

Semua respons backend dinormalisasi menjadi:

```typescript
export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]> | null;
};
```

Sukses:

```json
{ "success": true, "message": "Data berhasil diambil.", "data": { "items": [], "meta": null } }
```

Gagal:

```json
{ "success": false, "message": "Validasi gagal.", "data": null, "errors": { "animal_code": ["Kode satwa wajib diisi."] } }
```

Pemetaan status HTTP → `ApiErrorKind` (dihandle `resolveErrorKind` di `types/api.type.ts`
dan dipakai `services/api-client.ts`):

| Status      | `kind`         | Perlakuan di UI                                 |
| ----------- | ---------------- | ----------------------------------------------- |
| 401         | `unauthorized` | Redirect `/login` / tampilkan "sesi berakhir" |
| 403         | `forbidden`    | "Anda tidak memiliki akses ke modul ini"        |
| 404         | `not_found`    | `EmptyState` dengan pesan ramah               |
| 422         | `validation`   | Tampilkan `errors` per field di form          |
| 5xx         | `server`       | `ErrorState` + tombol coba lagi               |
| 0 / timeout | `network`      | "Pastikan backend berjalan di port 8000"        |

`services/api-client.ts` melempar `ApiError` yang selalu punya `.status`, `.kind`,
`.message`, dan `.errors`. Gunakan `toApiErrorState(error)` untuk mengubahnya jadi objek
yang aman di-render.

### 5.6 Pola struktur halaman modul

Setiap modul CRUD mengikuti struktur ini. Yang **sudah ada** ditandai ✅, yang
**menunggu route write backend** ditandai ⏳.

```
app/(protected)/master-data/[entity]/
├── page.tsx                       ✅  Server component tipis, hanya render *-list-view
├── [entity]-list-view.tsx         ✅  Client component: tabel + filter + state
├── columns.tsx                    ✅  get<Entity>Columns(): ColumnDef<TYPE_X, unknown>[]
├── filter.ts                      ✅  Tipe filter, DEFAULT_*_FILTERS, opsi dropdown
├── create/
│   └── page.tsx                   ⏳  Menunggu POST di backend + proxy
└── [id]/
    ├── detail/
    │   ├── page.tsx               ✅
    │   └── [entity]-detail-view.tsx ✅
    └── edit/
        └── page.tsx               ⏳  Menunggu PUT di backend + proxy
```

📄 **`page.tsx` harus tipis:**

```typescript
import { AnimalListView } from "@/app/(protected)/master-data/animals/animal-list-view";

export default function AnimalListPage() {
  return <AnimalListView />;
}
```

📄 **`columns.tsx` mengembalikan array `ColumnDef`:**

```typescript
import type { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/utils/format";
import type { TYPE_ANIMAL, TYPE_ANIMAL_GENDER } from "@/types/animal.type";

const GENDER_GLYPH: Record<TYPE_ANIMAL_GENDER, string> = {
  Jantan: "♂",
  Betina: "♀",
  "Tidak Diketahui": "?",
};

export const getAnimalColumns = (): ColumnDef<TYPE_ANIMAL, unknown>[] => [
  {
    accessorKey: "animal_code",
    header: "Kode Satwa",
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-zinc-900">{row.original.animal_code}</p>
        <p className="text-xs text-zinc-500">#{row.original.animal_id}</p>
      </div>
    ),
  },
  {
    id: "species",
    accessorFn: (row) => row.species?.common_name ?? "",
    header: "Spesies",
    cell: ({ row }) =>
      row.original.species?.common_name ? (
        <div>
          <p className="text-zinc-800">{row.original.species?.common_name}</p>
          <p className="text-xs italic text-zinc-500">
            {row.original.species?.scientific_name}
          </p>
        </div>
      ) : (
        <span className="text-xs text-zinc-400">Spesies #{row.original.species_id}</span>
      ),
  },
  {
    accessorKey: "birth_date",
    header: "Tanggal Lahir",
    cell: ({ row }) =>
      row.original.birth_date ? (
        formatDate(row.original.birth_date)
      ) : (
        <span className="text-zinc-400">-</span>
      ),
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        label={row.original.is_active ? "Aktif" : "Tidak Aktif"}
        variant={row.original.is_active ? "success" : "danger"}
      />
    ),
  },
];
```

📄 **`filter.ts` memisahkan state filter dari komponen:**

```typescript
import type { FilterOption, FilterValues } from "@/components/ui/data-filters";

export type AnimalStatusFilter = "all" | "active" | "inactive";

export type AnimalFilterValues = FilterValues & {
  search: string;
  species_id: string;
  status: AnimalStatusFilter;
};

export const DEFAULT_ANIMAL_FILTERS: AnimalFilterValues = {
  search: "",
  species_id: "all",
  status: "all",
};

export const STATUS_OPTIONS: FilterOption[] = [
  { label: "Semua status", value: "all" },
  { label: "Aktif", value: "active" },
  { label: "Tidak Aktif", value: "inactive" },
];
```

### 5.7 Aturan tambahan yang tidak boleh dilanggar

| #  | Aturan                                                                                                                                                                                                                          |
| -- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1  | **Tidak boleh** memanggil `fetch` langsung di dalam component. Selalu lewat hook.                                                                                                                                       |
| 2  | **Tidak boleh** ada `any`. Gunakan `unknown` + narrowing.                                                                                                                                                             |
| 3  | **Tidak boleh** ada `interface`. Selalu `type`.                                                                                                                                                                       |
| 4  | Client component yang memakai `react-hook-form`, state, event handler, atau komponen browser **wajib** diawali `"use client"`. Build akan gagal dengan *"Export useForm doesn't exist in target module"* bila lupa. |
| 5  | Server component tidak boleh memakai `useState`/`useEffect`. Ambil data lewat hook client.                                                                                                                                  |
| 6  | Validasi Zod hanya untuk **UX**. Backend tetap memvalidasi authoritative.                                                                                                                                                 |
| 7  | Setiap halaman wajib menangani: loading, empty, error, 401, 403, 422.                                                                                                                                                           |
| 8  | Jangan pernah menaruh secret di `NEXT_PUBLIC_*` — semuanya terlihat publik.                                                                                                                                                  |
| 9  | Provider AI hanya dipanggil lewat endpoint backend, tidak pernah langsung dari browser.                                                                                                                                         |
| 10 | `eslint-disable` hanya dengan alasan tertulis dan persetujuan PIC Frontend.                                                                                                                                                   |
| 11 | **Nol komentar di kode.** Kode harus dijelaskan lewat arsitektur, alur, dan penamaan.                                                                                                                                     |
| 12 | Data domain harus realistis untuk Gunung Leuser (kode collar `ORN-01`, `HRM-01`, `BDK-01`, `GJS-01`, `RSA-01`; lat `3.5`–`3.7`, long `97.9`–`98.2`).                                                        |

### 5.8 Mutasi (create / update / delete)

⚠️ **Saat ini belum bisa dipakai.** Backend belum memiliki route `POST`/`PUT`/`DELETE`
untuk entity apa pun, dan `app/api/wildlife/[...path]/route.ts` hanya mengekspor `GET`.
Method `CREATE`/`UPDATE`/`DELETE` di service dan hook sudah tersedia sebagai **kontrak**
dan akan otomatis aktif setelah dua sisi siap:

1. Backend mendaftarkan route write + validasi.
2. `app/api/wildlife/[...path]/route.ts` menambahkan handler `POST`/`PUT`/`DELETE`
   (perluasan proxy yang disengaja — bahas dengan PIC Backend dulu).

Jangan membuat halaman form atau tombol "Tambah" sebelum kedua sisi siap; hasilnya
pasti 405/404.

---

## 6. Endpoint API yang Tersedia

Base URL backend: `http://localhost:8000/api` (`NEXT_PUBLIC_API_URL`).
Semua endpoint data memerlukan `Authorization: Bearer <token>` (disediakan otomatis oleh
proxy).

### Auth (publik)

| Method   | Path           | Keterangan                                                       |
| -------- | -------------- | ---------------------------------------------------------------- |
| `POST` | `/api/login` | Login dengan `username` + `password`. **Bukan email.** |

Response sukses:

```json
{
  "success": true,
  "message": "Login berhasil.",
  "data": {
    "token": "<sanctum-token>",
    "user": {
      "user_id": 1,
      "username": "admin_btnl",
      "full_name": "...",
      "email": "...",
      "role": "administrator_sistem"
    }
  },
  "errors": null
}
```

Kredensial salah → **401** dengan `errors.credentials`. Field kosong → **422**.

### Terlindungi (butuh bearer token)

| Method   | Path                              | Status                          | Dipakai oleh                               |
| -------- | --------------------------------- | ------------------------------- | ------------------------------------------ |
| `GET`  | `/api/me`                       | ✅ jalan                        | Pemeriksaan sesi                           |
| `POST` | `/api/logout`                   | ✅ jalan                        | Tombol logout                              |
| `GET`  | `/api/dashboard`                | ✅ jalan                        | Dashboard                                  |
| `GET`  | `/api/animals`                  | ✅ jalan                        | Daftar satwa                               |
| `GET`  | `/api/species`                  | ✅ jalan                        | Daftar spesies                             |
| `GET`  | `/api/devices`                  | ✅ jalan                        | Daftar perangkat                           |
| `GET`  | `/api/devices/{id}`             | ✅ jalan                        | Detail perangkat                           |
| `GET`  | `/api/gps-readings`             | ✅ jalan                        | Peta & grafik (dibatasi 100 baris terbaru) |
| `GET`  | `/api/gps-readings/{animal_id}` | ✅ jalan                        | Riwayat satwa                              |
| `GET`  | `/api/incidents`                | ✅ jalan                        | Daftar insiden                             |
| `GET`  | `/api/notifications`            | ✅ jalan                        | Daftar notifikasi                          |
| `GET`  | `/api/export/gps/csv`           | ✅ jalan                        | Export CSV                                 |
| `GET`  | `/api/export/gps/geojson`       | ✅ jalan                        | Export GeoJSON                             |
| `GET`  | `/api/geo-zones`                | ⚠️ **rusak di backend** | Lihat catatan di bawah                     |

### 🚫 Endpoint yang TIDAK boleh dipanggil

| Endpoint                              | Alasan                                                                                                                                                                                                                          |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/animals/{id}`             | Belum terdaftar di `routes/api.php`. `GET_BY_ID` akan 404.                                                                                                                                                                  |
| `GET /api/export/gps`               | Rutenya `/csv` dan `/geojson`, bukan polos.                                                                                                                                                                                 |
| `GET /api/geo-zones`                | `routes/api.php` meng-impor `GeoZonesController`, sedangkan file & class-nya bernama `GeozonesController` (perbedaan huruf besar). Gagal autoload pada filesystem case-sensitive. **Diberitahukan ke PIC Backend.** |
| `GET /api/users`                    | Backend tidak punya endpoint user sama sekali. `USER_SERVICE` murni kontrak.                                                                                                                                                  |
| Semua `POST` / `PUT` / `DELETE` | Hanya `/login` dan `/logout` yang ada.                                                                                                                                                                                      |

### Allow-list proxy frontend

`lib/laravel-proxy.ts` hanya meneruskan resource berikut (maksimal 2 segmen path):

`animals` · `species` · `devices` · `gps-readings` · `incidents` · `notifications` · `geo-zones`

Resource lain otomatis **404** dari proxy, sebelum menyentuh backend. Kalau nanti butuh
resource baru, tambahkan ke `ALLOWED_RESOURCES` **dan** pastikan backend mendukungnya.

---

## 7. Cara Menjalankan

### Prasyarat

| Kebutuhan       | Keterangan                                                         |
| --------------- | ------------------------------------------------------------------ |
| Node.js         | **20.9+** (Next.js 16). Terpasang di mesin ini: `v24.18.0` |
| npm             | 10+ (terpasang: `11.16.0`)                                       |
| Backend Laravel | harus hidup di `http://localhost:8000`                           |
| MySQL           | `127.0.0.1:3306` (diatur di backend, bukan di frontend)          |

### Instalasi

```bash
cd wildlife-tracking-frontend
npm install
```

### Environment

Buat file `.env.local` (disarankan) atau `.env`. Keduanya sudah tercakup `.gitignore`
(`.env*`) sehingga aman tidak ikut ter-commit. Isi dengan:

```bash
NEXT_PUBLIC_HOST_NAME=http://localhost
NEXT_PUBLIC_PORT=3000
NEXT_PUBLIC_DOMAIN=localhost
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_REQUEST_TIMEOUT_MS=10000

NEXT_PUBLIC_COOKIE_TOKEN=wms_token
NEXT_PUBLIC_COOKIE_EXPIRES_AT=wms_expires_at
NEXT_PUBLIC_COOKIE_TYPE=wms_type
```

| Variabel                                                                            | Dipakai oleh                                              | Catatan                                                        |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`                                                             | `lib/laravel-proxy.ts`, `app/api/auth/login/route.ts` | Wajib. Base URL API Laravel.                                   |
| `NEXT_PUBLIC_DOMAIN`                                                              | `services/cookieToken.ts`                               | `localhost` untuk dev.                                       |
| `NEXT_PUBLIC_COOKIE_TOKEN`                                                        | `lib/cookie-names.ts`                                   | **Jangan dikosongkan.**                                  |
| `NEXT_PUBLIC_COOKIE_EXPIRES_AT`                                                   | `lib/cookie-names.ts`                                   | Default `wms_expires_at`.                                    |
| `NEXT_PUBLIC_COOKIE_TYPE`                                                         | `lib/cookie-names.ts`                                   | Default `wms_type`.                                          |
| `NEXT_PUBLIC_PORT`, `NEXT_PUBLIC_HOST_NAME`, `NEXT_PUBLIC_REQUEST_TIMEOUT_MS` | —                                                        | ⚠️ Dideklarasikan tapi **belum** dibaca kode mana pun. |

> ⚠️ **Gotcha penting.** `lib/cookie-names.ts` memperlakukan variabel env yang **kosong**
> sebagai tidak ter-set, lalu jatuh ke fallback `wms_token`. Jika `NEXT_PUBLIC_COOKIE_TOKEN=`
> pernah dikosongkan, nama cookie jadi kosong dan bearer token **tidak pernah terkirim** ke
> Laravel — gejalanya semua request_data 401 tanpa pesan jelas. Jaga nilai `wms_*` tetap terisi.
>
> Nama cookie sesi `wms_session` di-hardcode di `lib/session.ts:4` (tidak datang dari env).
> Setelah mengubah `.env*`, **restart** `npm run dev`.

### Development

```bash
npm run dev
# buka http://localhost:3000
```

### Build produksi

```bash
npm run build
npm run start
```

Build berjalan **offline** — tidak ada fetch ke jaringan saat build (font memakai
system stack Tailwind).

### Lint & type check

```bash
npm run lint        # ESLint 9
npx tsc --noEmit   # tidak ada script "typecheck"
```

Baseline yang harus dijaga:

* `npm run lint` → **0 error**. Ada **1 warning yang sudah diketahui**:
  `react-hooks/incompatible-library` pada `useReactTable()` di `components/ui/data-table.tsx`.
  Itu advisory React Compiler yang memang tidak bisa dipenuhi TanStack Table dan tidak
  memengaruhi perilaku. **Warning lain berarti ada bug.**
* `npx tsc --noEmit` → **0 error**.

> 📌 `eslint.config.mjs` saat ini hanya memakai preset `eslint-config-next`
> (core-web-vitals + typescript). `eslint-plugin-unused-imports` sudah ada di
> `devDependencies` tetapi belum dipasang. Aturan tim `no-explicit-any`,
> `consistent-type-definitions: ["error", "type"]`, dan `unused-imports/*` **belum
> ditegakkan otomatis** — jalankan `npx tsc --noEmit` dan disiplin manual sebagai
> gantinya. Bila tim sepakat mengaktifkan blok aturan itu, tambahkan ke
> `eslint.config.mjs` dalam PR terpisah.

---

## 8. Kredensial Uji

Dari `UserSeeder` backend. **Hanya untuk pengembangan lokal.**

| Username                    | Password     | Role                        |
| --------------------------- | ------------ | --------------------------- |
| `admin_btnl`              | `admin123` | `administrator_sistem`    |
| `konservasis_bukitlawang` | `password` | `konservasionis_lapangan` |
| `konservasis_kualabatang` | `password` | `konservasionis_lapangan` |
| `peneliti_leuser`         | `password` | `peneliti_ekologi`        |
| `kepala_balai`            | `password` | `pengambil_kebijakan`     |

⚠️ Login memakai **`username`**, bukan email. `password` di-hash dengan `bcrypt`
lewat cast `hashed` pada `User::$casts`. Second login akan **membatalkan** token pertama
karena `AuthController::login()` memanggil `$user->tokens()->delete()`.

---

## 9. Matriks Akses Berbasis Role

Target desain per SKPL. Sidebar sudah memakai matriks ini lewat `lib/navigation.ts`
(`NAV_SECTIONS`). Kolom ✅/❌ di bawah menggambarkan **gating UI**; endpoint yang belum
ada di backend ditandai terpisah di §6.

| Modul            | Konservasionis | Peneliti | Admin | Pengambil Kebijakan |
| ---------------- | :------------: | :------: | :---: | :-----------------: |
| Dashboard        |       ✅       |    ✅    |  ✅  |         ✅         |
| Live Map         |       ✅       |    ✅    |  ✅  |         ✅         |
| Satwa (lihat)    |       ✅       |    ✅    |  ✅  |         ✅         |
| Satwa (CRUD)     |       ❌       |    ❌    |  ✅  |         ❌         |
| Spesies (CRUD)   |       ❌       |    ❌    |  ✅  |         ❌         |
| Perangkat (CRUD) |       ❌       |    ❌    |  ✅  |         ❌         |
| Insiden          |       ✅       |    ✅    |  ✅  |         ❌         |
| Notifikasi       |       ✅       |    ✅    |  ✅  |         ✅         |
| Zona Geografis   |       ❌       |    ❌    |  ✅  |         ❌         |
| Activity Log     |       ❌       |    ❌    |  ✅  |         ❌         |
| Reports          |       ❌       |    ✅    |  ✅  |         ✅         |
| Backup / Restore |       ❌       |    ❌    |  ✅  |         ❌         |

> 🔐 Menyembunyikan menu **hanya untuk UX**. Backend tetap wajib menolak request
> yang tidak sesuai role. Jangan pernah menganggap gating client cukup.

Menambah role atau menu cukup di `lib/navigation.ts` — tidak ada tempat lain yang
menyimpan daftar menu.

---

## 10. Status Sprint

### ✅ Sprint 1 — Login Use Case (selesai)

- Halaman & flow login (`app/login/page.tsx`)
- Route handler login/logout + cookie httpOnly
- Proteksi route lewat `app/(protected)/layout.tsx`
- Sidebar & header berbasis role
- Skeleton dashboard, master data animals/species/devices, insiden, notifikasi
- Proxy server-side + normalisasi envelope

### 🚧 Sprint 2 — Master Data (sedang berjalan)

- Migrasi `useGPSReadings`, `useIncidentReports`, `useNotifications`, `useGeoZones`,
  `useTrackingDevices`, `useDashboardSummary` ke pola react-query
- Animals, Species, Devices: list + detail sudah tampil
- **Menunggu backend:** route write (`POST`/`PUT`/`DELETE`) → form create/edit
- **Menunggu backend:** `GET /api/animals/{id}` → `GET_BY_ID`
- Dashboard dengan data nyata
- Halaman notifikasi yang lengkap

### 📋 Sprint 3 — Monitoring & AI (rencana)

- Live map dengan titik GPS (pilih map provider)
- Laporan insiden lengkap
- Manajemen zona geografis
- Riwayat pergerakan + export (CSV / GeoJSON / PDF)
- Integrasi AI (deteksi spesies)

---

## 11. Panduan Cepat untuk Frontend PIC (Yohana) 🚀

### Langkah 1 — Pahami polanya dulu

Baca §5 sampai habis, lalu **baca file-file ini secara utuh**. Semuanya adalah templat
untuk setiap modul yang akan kamu buat:

| File                                                 | Pelajari apa                                          |
| ---------------------------------------------------- | ----------------------------------------------------- |
| `types/user.type.ts` atau `types/animal.type.ts` | Bentuk 4 type wajib + enum string union               |
| `services/animal.service.ts`                       | Bentuk `ANIMAL_SERVICE` + `API_ENDPOINT`          |
| `hooks/animal.hook.ts`                             | Bentuk query key, mutation, dan `invalidateQueries` |
| `app/(protected)/master-data/animals/`             | Struktur folder modul CRUD                            |

Baru setelah itu sentuh file lain. 30 menit membaca 4 file ini menghemat berjam-jam.

### Langkah 2 — Buat modul baru (contoh: Animal)

**1️⃣ Type** — `types/animal.type.ts`

```
TYPE_ANIMAL, TYPE_ANIMAL_PAYLOAD,
TYPE_ANIMAL_GET_ALL_RESPONSE, TYPE_ANIMAL_GET_BY_ID_RESPONSE
```

Isi persis mengikuti §5.2. Tambahkan export ke `types/index.ts`.

**2️⃣ Endpoint** — `services/endpoint.ts`

Tambahkan blok `API_ENDPOINT.WILDLIFE.ANIMALS` dengan `GET_ALL` / `GET_BY_ID` / `CREATE`
/ `UPDATE` / `DELETE`.

**3️⃣ Service** — `services/animal.service.ts`

Buat `ANIMAL_SERVICE`. Semua method mengembalikan `Promise<ApiResponse<T>>`, body write
dalam bentuk `{ body: payload }`. Tambahkan export ke `services/index.ts`.

**4️⃣ Hook** — `hooks/animal.hook.ts`

Buat `useAnimal`, `useInfiniteAnimal`, `useAnimalById`, `useAnimalCreate`,
`useAnimalUpdate`, `useAnimalDelete`. Tambahkan export ke `hooks/index.ts`.

**5️⃣ Halaman** — `app/(protected)/master-data/animals/`

| File                                                  | Isi                                                                                                                                   |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `page.tsx`                                          | Tipis, hanya `<AnimalListView />`                                                                                                   |
| `animal-list-view.tsx`                              | `"use client"`; `useAnimal(params)`; render `<DataFilters>`, `<DataTable>`, `<Loading>`, `<EmptyState>`, `<ErrorState>` |
| `columns.tsx`                                       | `getAnimalColumns(): ColumnDef<TYPE_ANIMAL, unknown>[]`                                                                             |
| `filter.ts`                                         | `AnimalFilterValues`, `DEFAULT_ANIMAL_FILTERS`, opsi dropdown                                                                     |
| `[id]/detail/page.tsx` + `animal-detail-view.tsx` | Detail read-only via `useAnimalById(id)`                                                                                            |

**6️⃣ Form create/edit** — ⏳ **tunda dulu**

```
create/page.tsx     dan     [id]/edit/page.tsx
```

Halaman-halaman ini hanya masuk akal setelah backend punya `POST`/`PUT` **dan** proxy
punya handler write. Membangunnya sebelum itu hanya menghasilkan form yang pasti 405.

**7️⃣ Daftarkan menu** — `lib/navigation.ts`

Tambahkan `href` modul ke `NAV_SECTIONS` untuk role yang berhak. Tanpa ini, halaman jalan
tetapi tidak muncul di sidebar.

**8️⃣ Validasi** — wajib lolos semua

```bash
npm run lint        # 0 error
npx tsc --noEmit   # 0 error
npm run build      # sukses
```

### Langkah 3 — Ikuti alur data, jangan berimprovisasi

```
Component → Hook → Service → api-client → proxy → Laravel
```

* ❌ `fetch("/api/wildlife/animals")` di dalam component — **dilarang**.
* ✅ `const { data, isPending, error } = useAnimal();`
* ✅ `const { data, error, isLoading, isEmpty } = useAsyncResource(load, []);` — hanya untuk
  kasus yang belum termigrasi, dan **jangan tiru gaya ini di kode baru**.

### Langkah 4 — Tangani semua state

Setiap halaman **wajib** menangani empat kondisi berikut:

```typescript
if (isPending) return <Loading />;
if (error) return <ErrorState message={toApiErrorState(error).message} />;
if (items.length === 0) return <EmptyState text="Belum ada data satwa" />;
return <DataTable data={items} columns={getAnimalColumns()} />;
```

Dan pastikan 401 / 403 / 422 punya perilakunya masing-masing (lihat tabel §5.5).

### Langkah 5 — Definition of Done

- [ ] Mengikuti `TYPE_*` / `*_SERVICE` / `use*` tanpa pengecualian
- [ ] Kontrak bertipe lengkap di service & hook, nol `any`, nol `interface`
- [ ] `npm run lint` 0 error, `npx tsc --noEmit` 0 error, `npm run build` sukses
- [ ] Loading / empty / error / 401 / 403 / 422 semuanya ada
- [ ] Sudah diuji manual dengan keempat role
- [ ] Tidak ada kredensial yang ter-commit
- [ ] Tidak membuat halaman form sebelum backend siap
- [ ] PR sudah direview, dokumentasi diperbarui dalam PR yang sama

### 📌 Kalau Bingung

Tegas: **jangan menebak-nebak-integrasi ke backend.** Buka issue ke PIC Backend
(`routes/api.php` adalah sumber kebenaran), catat endpoint mana yang belum ada, lalu
kerjakan bagian UI yang bisa diselesaikan tanpa itu. Integrasi yang tidak bisa diuji
adalah Technical Debt dengan nama baik.

---

## 12. Masalah Umum & Solusi

| Gejala                                                                          | Penyebab                                                            | Solusi                                                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CORS error** di console                                                 | Backend tidak mengizinkan origin frontend                           | Backend PIC menambahkan `http://localhost:3000` di `config/cors.php`. Ingat: arsitektur kita memang **tidak** memanggil backend langsung dari browser, jadi CORS hanya relevan bila ada kode yang menyebut `localhost:8000` langsung. |
| **401 Unauthorized** di semua halaman data                                | Cookie `wms_token` kosong / tidak terkirim                        | DevTools → Application → Cookies, cek `wms_session` dan `wms_token` ada. Jangan kosongkan `NEXT_PUBLIC_COOKIE_TOKEN`.                                                                                                                     |
| **401 terus-menerus setelah login**                                       | Login kedua membatalkan token pertama                               | `AuthController::login()` menghapus token lama. Logout dulu dari akun lain, atau jalankan ulang seeder.                                                                                                                                         |
| **Error "Route [login] not defined"** (500)                               | `redirectGuestsTo` belum disetel di backend                       | Backend PIC menambahkan `$middleware->redirectGuestsTo(fn () => null)` di `bootstrap/app.php`.                                                                                                                                                |
| **`TypeError: Cannot read properties of undefined`** saat baca `meta` | Backend belum mengirim pagination                                   | `meta` disintesis di service/hook. Selalu gunakan optional chaining (`lastPage?.data?.meta`).                                                                                                                                                 |
| **`GET_BY_ID` 404**                                                     | Backend belum punya `GET /api/animals/{id}`                       | Gunakan data dari list, atau tunggu route backend. Jangan bypass proxy.                                                                                                                                                                           |
| **`405 Method Not Allowed`** saat create/update/delete                  | Proxy hanya mengekspor `GET`                                      | Tunggu backend route write + penambahan handler `POST`/`PUT`/`DELETE` di proxy.                                                                                                                                                             |
| **Resource 404 dari proxy**                                               | Nama resource tidak ada di `ALLOWED_RESOURCES`                    | Tambahkan ke allow-list **dan** pastikan backend mendukungnya.                                                                                                                                                                              |
| **Error TypeScript**                                                      | Typing tidak sinkron                                                | `npx tsc --noEmit` untuk melihat semua error sekaligus.                                                                                                                                                                                         |
| **`Export useForm doesn't exist in target module`**                     | Client component tidak diawali `"use client"`                     | Tambahkan `"use client"` di baris pertama file.                                                                                                                                                                                                 |
| **`Port 3000 already in use`**                                          | Proses lain memakai port                                            | `npm run dev -- -p 3001`, atau hentikan prosesnya.                                                                                                                                                                                              |
| **`Port 8000 already in use`**                                          | `php artisan serve` lama masih jalan                              | Hentikan, lalu jalankan ulang backend.                                                                                                                                                                                                            |
| **Data tidak berubah padahal create sukses**                              | Query key tidak di-invalidate                                       | `queryClient.invalidateQueries({ queryKey: ["animals"] })` di `onSuccess`.                                                                                                                                                                    |
| **Perubahan `.env` tidak terbaca**                                      | Dev server perlu restart                                            | Hentikan dan jalankan ulang `npm run dev`.                                                                                                                                                                                                      |
| **`npm run lint` warning baru muncul**                                  | Warning selain `react-hooks/incompatible-library` berarti ada bug | Perbaiki. Warning yang diizinkan hanya satu itu.                                                                                                                                                                                                  |
| **Halaman muncul tapi tidak ada di sidebar**                              | `href` belum didaftarkan di `NAV_SECTIONS`                      | Tambahkan ke `lib/navigation.ts` pada role yang berhak.                                                                                                                                                                                         |

---

## 13. Referensi

| Dokumen                                                                    | Isi                                                             |
| -------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `00-PM-OVERVIEW.md`                                                      | Ringkasan proyek dari Product Manager                           |
| `Project Development Guideline - Wildlife Tracking Monitoring System.md` | Panduan pengembangan proyek                                     |
| **SKPL**                                                             | Spesifikasi Kebutuhan Perangkat Lunak                           |
| **DPPL**                                                             | Desain Perancangan Perangkat Lunak                              |
| **Laporan Week 5**                                                   | Implementasi Basis Data — 14 tabel + ERD                       |
| `../wildlife-tracking-backend/routes/api.php`                            | **Sumber kebenaran** daftar endpoint yang benar-benar ada |
| `../wildlife-tracking-backend/AGENTS.md`                                 | Catatan kondisi repo backend                                    |
| `AGENTS.md` (root)                                                       | Konvensi lintas repo tim                                        |
| Figma                                                                      | Desain UI/UX — tautan dapat diminta ke PIC Frontend            |

---

## 14. Kontak

| Kewenangan                            | PIC                                                   |
| ------------------------------------- | ----------------------------------------------------- |
| Frontend (Next.js, UI, integrasi API) | **Yohana Sinaga**                               |
| Backend (Laravel, API, autentikasi)   | Yohanna Purnomo                                       |
| Database (skema, migration, seeder)   | Nuevalen Refitra Alswando · Laura Chyndearni Saragih |
| AI & Integration                      | Farrellino Ulung Satya Amando                         |
| Dokumentasi (SKPL, DPPL, laporan)     | Yohanna Purnomo                                       |

---

<div align="center">
