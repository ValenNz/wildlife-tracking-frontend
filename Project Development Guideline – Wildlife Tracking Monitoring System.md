# PROJECT DEVELOPMENT GUIDELINE

## WILDLIFE TRACKING MONITORING SYSTEM

> Aturan resmi development tim. Prinsip: **Simple but Professional · Type Safe · Maintainable · Secure · Consistent · Easy to Collaborate**.

---

## 1. Project Overview

Sistem monitoring dan tracking satwa liar (tugas besar kuliah).

**Fitur utama:** autentikasi & role, CRUD satwa/spesies/lokasi, pencatatan monitoring & sighting, laporan, dashboard, **fitur AI** (ringkasan monitoring, summary laporan, insight, klasifikasi sederhana).

## 2. Project Architecture

```
Frontend (Next.js) → Laravel API → Database
Frontend (Next.js) → Laravel API → AI Service/API
                                 ↘ Database
```

- FE **tidak boleh** akses database atau AI provider langsung.
- Semua secret (DB, AI key) hanya ada di backend `.env`.
- Semua data lewat REST API JSON dengan format response yang seragam.

## 3. Technology Stack

| Layer | Teknologi |
| --- | --- |
| Frontend | Next.js (App Router), React, TypeScript strict, Tailwind CSS, Zod, ESLint |
| Backend | Laravel, PHP, MVC, Eloquent, Sanctum (token auth), PHPUnit/Pest |
| Database | MySQL/PostgreSQL, Laravel migration/seeder/factory |
| AI | Provider LLM via HTTP dari Laravel Service |
| Tools | Git + GitHub, Postman/Scribe (API docs) |

## 4. Repository Structure

```
wildlife-tracking-monitoring-system/
├── frontend/   → UI & komunikasi API saja
├── backend/    → Laravel: business logic, auth, validation, API, AI
├── database/   → dokumentasi skema, ERD, SQL referensi, catatan seed
├── docs/       → dokumentasi proyek
└── README.md
```

**Catatan realistis:** secara teknis migration/seeder/factory Laravel tetap berada di `backend/database/` (Laravel mewajibkan itu). Folder `database/` di root dipakai untuk **ERD, data dictionary, dan dokumentasi**. PIC Database yang memiliki dan me-review isi `backend/database/`.

## 5. Frontend Structure

```
frontend/
├── src/
│   ├── app/          # routing (page.tsx, layout.tsx, loading.tsx, error.tsx)
│   ├── components/   # UI reusable lintas fitur (Button, Modal, Table)
│   ├── features/     # komponen/logic spesifik fitur (wildlife/, monitoring/, ai/)
│   ├── hooks/        # custom hook (useWildlife, useAuth)
│   ├── services/     # pemanggilan API (wildlife.service.ts)
│   ├── types/        # type global (ApiResponse, User)
│   ├── schemas/      # Zod schema
│   ├── utils/        # fungsi murni (formatDate)
│   ├── constants/    # konstanta (role, route, status)
│   └── lib/          # konfigurasi library (api client / fetch wrapper)
├── public/
├── .env.example
├── eslint.config.mjs
├── package.json
└── README.md
```

| Folder | Pakai ketika |
| --- | --- |
| `app/` | Mendefinisikan halaman/route. Isi halaman tipis: rakit komponen saja. |
| `components/` | Dipakai ≥2 fitur, tidak tahu soal domain (generic UI). |
| `features/` | Spesifik satu domain, misal `features/wildlife/WildlifeTable.tsx`. |
| `hooks/` | State + efek yang memanggil service (loading, error, data). |
| `services/` | Satu-satunya tempat memanggil API. |
| `types/` | Type yang dipakai banyak tempat. Type lokal tetap di dekat file-nya. |
| `schemas/` | Validasi form (Zod). Dipisah dari component. |
| `utils/` | Fungsi pembantu tanpa side effect. |
| `constants/` | Nilai tetap (jangan hard-code string berulang). |
| `lib/` | Setup `apiClient`, konfigurasi library. |

> Jangan buat folder kosong "biar lengkap". Buat saat dibutuhkan.

## 6. Frontend Coding Rules

**Alur wajib:**

```
Component → Hook → Service → Laravel API
```

Component dilarang memanggil `fetch` langsung.

```ts
// lib/api-client.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function apiClient<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", Accept: "application/json", ...init?.headers },
  });
  const body: unknown = await res.json();
  if (!res.ok) throw new ApiError(res.status, body);
  return body as T;
}
```

```ts
// services/wildlife.service.ts
import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type { Wildlife, CreateWildlifeForm } from "@/types/wildlife";

export const getWildlife = () => apiClient<ApiResponse<Wildlife[]>>("/api/wildlife");
export const getWildlifeById = (id: number) => apiClient<ApiResponse<Wildlife>>(`/api/wildlife/${id}`);
export const createWildlife = (p: CreateWildlifeForm) =>
  apiClient<ApiResponse<Wildlife>>("/api/wildlife", { method: "POST", body: JSON.stringify(p) });
export const updateWildlife = (id: number, p: CreateWildlifeForm) =>
  apiClient<ApiResponse<Wildlife>>(`/api/wildlife/${id}`, { method: "PUT", body: JSON.stringify(p) });
export const deleteWildlife = (id: number) =>
  apiClient<ApiResponse<null>>(`/api/wildlife/${id}`, { method: "DELETE" });
```

```ts
// hooks/useWildlife.ts
export function useWildlife() {
  const [data, setData] = useState<Wildlife[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getWildlife()
      .then((res) => setData(res.data))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Terjadi kesalahan"))
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading, error };
}
```

**Validasi frontend (Zod)** hanya untuk UX; backend tetap wajib validasi ulang.

```ts
// schemas/wildlife.schema.ts
import { z } from "zod";
export const createWildlifeSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  species: z.string().min(1, "Spesies wajib diisi"),
  location: z.string().min(1, "Lokasi wajib diisi"),
});
export type CreateWildlifeForm = z.infer<typeof createWildlifeSchema>;
```

## 7. TypeScript Rules (WAJIB)

1. `strict: true` di `tsconfig.json`.
2. **DILARANG `any`.** Data tak dikenal → `unknown` lalu narrowing/validasi.
3. **DILARANG `interface`.** Semua definisi memakai `type`.
4. Semua API response, props, form, dan state harus bertipe.

```ts
// ❌ const data: any = response;     interface User { id: number }
// ✅
type User = { id: number; name: string; email: string };
type ApiResponse<T> = { success: boolean; message: string; data: T };
type ValidationErrorResponse = { success: false; message: string; errors: Record<string, string[]> };

const data: unknown = response;
if (typeof data === "object" && data !== null && "id" in data) { /* narrowing */ }
```

## 8. ESLint Rules

```js
// eslint.config.mjs
import { FlatCompat } from "@eslint/eslintrc";
import tseslint from "typescript-eslint";
import unusedImports from "eslint-plugin-unused-imports";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

export default tseslint.config(
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  ...tseslint.configs.strict,
  {
    plugins: { "unused-imports": unusedImports },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-definitions": ["error", "type"], // melarang interface
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
    },
  },
);
```

- `npm run lint` **harus 0 error** sebelum PR dibuka.
- Warning hanya boleh jika tidak terhindarkan dan alasannya ditulis di PR.
- `// eslint-disable` dilarang kecuali ada komentar alasan **dan** disetujui PIC Frontend: `// eslint-disable-next-line <rule> -- alasan: ... (disetujui @pic-fe)`

## 9. Backend Structure

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/   # terima request → panggil service/model → return response
│   │   ├── Requests/      # validasi (StoreWildlifeRequest)
│   │   └── Resources/     # format output JSON (WildlifeResource)
│   ├── Models/            # Eloquent, relasi
│   ├── Policies/          # otorisasi per model (tambah saat dibutuhkan)
│   └── Services/          # business logic kompleks
│       └── Ai/            # WildlifeSummaryService.php
├── database/{migrations,seeders,factories}/
├── routes/api.php
├── tests/{Feature,Unit}/
├── config/
├── .env.example
├── composer.json
└── README.md
```

## 10. Laravel MVC Rules

| Komponen | Tugas | Dilarang |
| --- | --- | --- |
| Model | Data, relasi, scope | Logic request/response |
| Controller | Terima request, panggil service, return | Query panjang, validasi manual, logic AI |
| Request | Validasi input | Query database kompleks |
| Resource | Format response | Business logic |
| Service | Logic kompleks (hitung, AI, multi-model) | Mengakses `request()` langsung |

Gunakan Service **hanya jika logic lebih dari CRUD sederhana**. CRUD biasa boleh langsung Controller + Model.

```php
class WildlifeController extends Controller
{
    public function __construct(private WildlifeService $service) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Wildlife retrieved successfully',
            'data' => WildlifeResource::collection($this->service->paginate()),
        ]);
    }

    public function store(StoreWildlifeRequest $request): JsonResponse
    {
        $wildlife = $this->service->create($request->validated());
        return response()->json([
            'success' => true,
            'message' => 'Wildlife created successfully',
            'data' => new WildlifeResource($wildlife),
        ], 201);
    }
}
```

```php
class StoreWildlifeRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()->can('create', Wildlife::class); }
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'species_id' => ['required', 'exists:species,id'],
            'status' => ['required', 'in:active,inactive,deceased,unknown'],
        ];
    }
}
```

## 11. REST API Rules

```
GET    /api/wildlife          POST   /api/wildlife
GET    /api/wildlife/{id}     PUT    /api/wildlife/{id}     DELETE /api/wildlife/{id}
```

Resource memakai **bentuk jamak/nama benda, huruf kecil, kebab-case**; prefix `/api`.

| Code | Kapan |
| --- | --- |
| 200 | GET/PUT berhasil |
| 201 | POST berhasil membuat data |
| 204 | DELETE berhasil tanpa body (jika memakai ini, FE jangan parse JSON) |
| 400 | Request salah/tidak bisa diproses (format rusak) |
| 401 | Belum login / token tidak valid |
| 403 | Sudah login tapi tidak punya izin |
| 404 | Data tidak ditemukan |
| 422 | Validasi gagal |
| 500 | Error server tak terduga |

**Format response (WAJIB sama di FE & BE):**

```json
{ "success": true,  "message": "Wildlife retrieved successfully", "data": [] }
{ "success": false, "message": "Wildlife not found", "data": null }
{ "success": false, "message": "Validation failed", "errors": { "name": ["The name field is required."] } }
```

Pagination: `data` berisi list, `meta` berisi `current_page`, `last_page`, `per_page`, `total`.

## 12. Database Structure

Hanya tabel yang diperlukan (tanpa tabel berlebihan):

| Tabel | Isi penting |
| --- | --- |
| `users` | id, name, email (unique), password, role (enum) |
| `species` | id, common_name, scientific_name (unique), conservation_status |
| `locations` | id, name, latitude, longitude, region |
| `wildlife` | id, species_id (FK), name/tag_code (unique), sex, status, nullable birth_date |
| `monitoring_records` | id, wildlife_id (FK), location_id (FK), recorded_by (FK users), health_condition, notes, recorded_at |
| `sightings` | id, wildlife_id (FK, nullable), species_id (FK), location_id (FK), reported_by (FK), sighted_at, count |
| `reports` | id, created_by (FK), title, content, period_start, period_end |
| `ai_summaries` | id, requested_by (FK), subject_type, subject_id, content, model, created_at |

> `sightings` dan `monitoring_records` bisa digabung jika tim merasa terlalu rumit: sighting = laporan melihat satwa (bisa tanpa individu terdaftar), monitoring = pencatatan rutin individu terdaftar.

**ERD sederhana**

```
users 1───* monitoring_records *───1 wildlife *───1 species
users 1───* sightings          *───1 species
users 1───* reports
users 1───* ai_summaries
locations 1───* monitoring_records
locations 1───* sightings
wildlife 1───* sightings (opsional)
```

**Konsep:** *Primary key* = id unik tiap baris · *Foreign key* = relasi antar tabel (pakai `constrained()`) · *Index* = kolom yang sering dicari/filter · *Unique* = tidak boleh duplikat (email, tag_code) · *Nullable* = boleh kosong (hanya bila memang opsional) · *Enum/status* = nilai terbatas · *Timestamp* = `created_at`, `updated_at`.

```php
Schema::create('monitoring_records', function (Blueprint $t) {
    $t->id();
    $t->foreignId('wildlife_id')->constrained()->cascadeOnDelete();
    $t->foreignId('location_id')->constrained();
    $t->foreignId('recorded_by')->constrained('users');
    $t->enum('health_condition', ['healthy', 'injured', 'sick', 'unknown']);
    $t->text('notes')->nullable();
    $t->timestamp('recorded_at')->index();
    $t->timestamps();
});
```

## 13. Database Rules

1. Semua perubahan skema **wajib migration** (jangan ubah lewat phpMyAdmin/GUI).
2. Jangan edit migration yang sudah di-merge ke `develop`; buat migration baru.
3. Foreign key & constraint harus jelas.
4. Tidak ada data duplikat yang tidak perlu (normalisasi wajar).
5. Index untuk kolom yang sering dicari/filter/join.
6. Seeder + Factory untuk data development (`php artisan migrate:fresh --seed`).
7. Update `database/README.md` & ERD saat skema berubah.

## 14. Authentication & Authorization

- **Authentication** = "Siapa pengguna?" → Laravel Sanctum (login → token, dikirim `Authorization: Bearer <token>`).
- **Authorization** = "Apa yang boleh dilakukan?" → Policy/Gate di backend.

| Role | Hak akses |
| --- | --- |
| Admin | Semua, termasuk kelola user |
| Researcher | CRUD satwa/monitoring/laporan, pakai fitur AI |
| Observer | Input sighting & monitoring, lihat data |
| User | Hanya baca data publik |

```php
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('wildlife', WildlifeController::class);
});
```

FE boleh menyembunyikan menu/tombol sesuai role **hanya untuk UX**. Keamanan sebenarnya di backend (cek 401/403 di setiap endpoint).

## 15. AI Integration Architecture

```
Next.js → POST /api/ai/monitoring-summary → Laravel
        → AiController → WildlifeSummaryService → AI API
        → simpan ke ai_summaries → Resource → Next.js
```

```
app/Services/
├── WildlifeService.php
└── Ai/WildlifeSummaryService.php
```

```php
class WildlifeSummaryService
{
    public function summarize(Wildlife $wildlife): string
    {
        $records = $wildlife->monitoringRecords()->latest('recorded_at')->limit(20)->get();
        $prompt = "Ringkas kondisi satwa berikut dalam Bahasa Indonesia:\n" . $records->toJson();

        $res = Http::withToken(config('services.ai.key'))->timeout(30)
            ->post(config('services.ai.url'), ['prompt' => $prompt]);

        if ($res->failed()) {
            throw new AiServiceException('AI service unavailable');
        }
        return $res->json('text');
    }
}
```

Aturan: API key hanya di `.env` · kirim hanya data yang perlu ke AI (jangan data user/credential) · beri timeout dan tangani gagal · simpan hasil di `ai_summaries` · jadikan fitur tambahan: aplikasi tetap jalan jika AI gagal · tampilkan label "dihasilkan oleh AI" di UI.

Fitur AI: ringkasan monitoring, summary laporan, analisis aktivitas, insight, klasifikasi sederhana.

## 16. Environment Configuration

```
# frontend/.env.example
NEXT_PUBLIC_API_URL=http://localhost:8000

# backend/.env.example
APP_URL=http://localhost:8000
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=wildlife_tracking
DB_USERNAME=
DB_PASSWORD=
AI_API_URL=
AI_API_KEY=
```

`.env` asli masuk `.gitignore`. Jangan hard-code key, jangan commit, jangan kirim ke frontend. Variabel `NEXT_PUBLIC_*` terlihat publik, **jangan taruh secret di sana**. Aktifkan CORS di Laravel hanya untuk origin frontend.

## 17. Git Workflow

```
main      → stabil / siap demo (protected)
develop   → integrasi harian (protected)
feature/* → fitur baru   (feature/login, feature/ai-summary)
fix/*     → perbaikan    (fix/api-validation)
```

- **Commit (Conventional Commits):** `feat:` `fix:` `refactor:` `docs:` `test:` `chore:` Contoh: `feat(wildlife): add create wildlife endpoint`
- **Pull Request:** branch → `develop`; judul jelas, deskripsi + screenshot/hasil test, centang Definition of Done, tautkan task.
- **Review:** minimal 1 reviewer (FE di-review FE/PM, BE di-review BE, migration di-review PIC Database). Dilarang merge PR sendiri tanpa review.
- **Merge:** gunakan Squash/Merge via GitHub; `develop` → `main` hanya saat milestone, dikoordinasi PM.
- **Konflik:** `git pull origin develop` ke branch kamu → selesaikan konflik lokal → test → push. Konflik migration: koordinasi dengan PIC Database, jangan asal timpa.
- Branch pendek (maks beberapa hari), pull `develop` setiap hari.

## 18. Naming Convention

| Area | Aturan | Contoh |
| --- | --- | --- |
| FE component | PascalCase | `UserTable.tsx` |
| FE function/variable | camelCase | `getUsers()`, `userData` |
| FE type | PascalCase | `type User = {}` |
| FE file service/hook | `x.service.ts`, `useX.ts` | `wildlife.service.ts` |
| FE folder | kebab-case/lowercase | `features/wildlife` |
| Controller | `<Nama>Controller` | `WildlifeController` |
| Model | Singular PascalCase | `Wildlife` |
| Request | `Store/Update<Nama>Request` | `StoreWildlifeRequest` |
| Resource | `<Nama>Resource` | `WildlifeResource` |
| Service | `<Nama>Service` | `WildlifeService` |
| Tabel & kolom DB | snake_case, tabel jamak | `monitoring_records` |
| Route API | kebab-case | `/api/monitoring-records` |

## 19. Error Handling

**Frontend wajib menangani:** Loading · Success · Empty · Error · Unauthorized (401 → ke login) · Forbidden (403 → pesan akses ditolak) · Validation error (422 → tampilkan per field) · Server error (500 → pesan ramah).

```tsx
if (isLoading) return <Spinner />;
if (error) return <ErrorMessage message={error} />;
if (data.length === 0) return <EmptyState text="Belum ada data satwa" />;
return <WildlifeTable data={data} />;
```

**Backend:** gunakan format response error yang konsisten (lihat bagian 11), tangani `ModelNotFoundException`, `AuthenticationException`, `AuthorizationException`, `ValidationException` di `bootstrap/app.php`/`Handler`. Di production set `APP_DEBUG=false`. **Jangan** tampilkan stack trace, kredensial DB, API key, atau info internal server ke user; catat detailnya di log (`storage/logs`).

## 20. Testing

| Area | Minimum |
| --- | --- |
| Backend | Feature test tiap endpoint utama (sukses, 401, 403, 404), validation test (422) |
| Frontend | Manual integration test, uji validasi form; component test jika perlu |
| AI | Test dengan `Http::fake()` agar tidak memakai API sungguhan |

```php
public function test_researcher_can_create_wildlife(): void
{
    Sanctum::actingAs(User::factory()->create(['role' => 'researcher']));
    $this->postJson('/api/wildlife', ['name' => 'Rimba', 'species_id' => Species::factory()->create()->id, 'status' => 'active'])
         ->assertCreated()->assertJsonPath('success', true);
}
public function test_name_is_required(): void
{
    Sanctum::actingAs(User::factory()->create(['role' => 'admin']));
    $this->postJson('/api/wildlife', [])->assertStatus(422)->assertJsonValidationErrors('name');
}
```

Jalankan `php artisan test` dan `npm run lint` sebelum PR.

## 21. Documentation

```
docs/
├── architecture.md        # arsitektur & diagram
├── api.md                 # daftar endpoint, request/response contoh
├── database.md            # ERD, data dictionary
├── development-guide.md   # setup, aturan kerja
└── ai-integration.md      # alur AI, prompt, batasan
```

**README utama** memuat: overview, fitur, tech stack, instalasi, setup env, cara menjalankan, struktur folder, ringkasan API, database, AI, Git workflow, pembagian tim. Dokumentasi diperbarui **dalam PR yang sama** dengan perubahan kode.

## 22. Team Responsibilities

| Peran | Tanggung jawab |
| --- | --- |
| Frontend | Next.js, UI, component, integrasi API, state, TypeScript, form, UX |
| Backend | Laravel, REST API, MVC, business logic, auth, authorization, validasi, integrasi AI |
| Database | Skema, ERD, migration, relasi, seeder, index, constraint |
| Project Manager | Requirement, pembagian task, prioritas, integrasi FE/BE/DB, koordinasi review, dokumentasi, tracking progress |

## 23. Feature Development Workflow

1. **PM** menulis requirement/user story + acceptance criteria di issue/board.
2. **Database** merancang tabel & migration → PR.
3. **Backend & Frontend sepakati kontrak API** (endpoint, request, response) di `docs/api.md` **sebelum** coding.
4. **Backend** membuat Model, Request, Controller, Resource, Policy, test.
5. **Frontend** membuat type, schema, service, hook, UI (bisa pakai mock sesuai kontrak sambil menunggu BE).
6. **Integrasi** FE ↔ BE di `develop`, uji manual.
7. **Review** → perbaiki → merge → PM mengecek Definition of Done.

## 24. Definition of Done

Fitur dianggap selesai jika:

- [ ] Database & migration tersedia
- [ ] Backend API tersedia + validasi backend
- [ ] Authorization tersedia (jika perlu)
- [ ] Dokumentasi API diperbarui
- [ ] Frontend UI selesai & terintegrasi dengan API
- [ ] Menggunakan `type`, tanpa `any`, tanpa `interface`
- [ ] ESLint 0 error
- [ ] Loading, error, dan empty state tersedia
- [ ] Testing sudah dilakukan
- [ ] Tidak ada credential ter-commit
- [ ] Sudah di-review
- [ ] Dokumentasi diperbarui

## 25. Do & Don't

| ✅ DO | ❌ DON'T |
| --- | --- |
| Gunakan `type` dan `unknown` | Pakai `any` / `interface` |
| Panggil API lewat service | `fetch` di dalam component |
| Validasi di FE **dan** BE | Percaya validasi FE saja |
| Cek otorisasi di backend | Mengandalkan UI yang disembunyikan |
| Simpan secret di `.env` | Hard-code / commit API key |
| Migration untuk semua perubahan skema | Ubah DB manual |
| PR kecil + review | Push langsung ke `main`/`develop` |
| Controller tipis | Query panjang & logic AI di controller |
| Format response seragam | Response berbeda-beda tiap endpoint |
| Buat folder saat dibutuhkan | Over-engineering |

## 26. Example Feature Flow: "Tambah Data Satwa"

1. **PM:** buat issue "Create Wildlife" + acceptance criteria.
2. **Database:** migration `wildlife` (FK `species_id`, unique `tag_code`), seeder & factory.
3. **Kontrak API:** `POST /api/wildlife` → 201 sukses / 422 validasi / 401 / 403 (tercatat di `docs/api.md`).
4. **Backend:** `Wildlife` model, `StoreWildlifeRequest`, `WildlifeController@store`, `WildlifeResource`, `WildlifePolicy`, feature test.
5. **Frontend:** `types/wildlife.ts` → `schemas/wildlife.schema.ts` → `services/wildlife.service.ts` (`createWildlife`) → `hooks/useCreateWildlife.ts` → `features/wildlife/WildlifeForm.tsx` → halaman `app/wildlife/new/page.tsx` (loading, error per field, success redirect).
6. **Test:** `php artisan test`, `npm run lint`, uji manual form kosong / data valid / role tanpa izin.
7. **PR:** `feature/wildlife-create` → `develop`, centang Definition of Done, review, merge.