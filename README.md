# Wildlife Tracking – Frontend

Antarmuka web untuk **Wildlife Tracking Monitoring System**. Frontend hanya mengurus **UI** dan **komunikasi dengan API Laravel**. Frontend **tidak boleh** mengakses database atau AI provider langsung.

**Stack:** Next.js (App Router) · React · TypeScript (strict) · Tailwind CSS · Zod · ESLint

Repo terkait: `wildlife-tracking-backend` (API) · `wildlife-tracking-database` (desain DB)

---

## 1. SETUP UNTUK PEMULA (ikuti urut)

### 1.1 Install aplikasi yang dibutuhkan
| Aplikasi | Link | Cek berhasil |
|---|---|---|
| Git | https://git-scm.com | `git --version` |
| Node.js (versi **LTS**) | https://nodejs.org | `node -v` dan `npm -v` |
| VS Code | https://code.visualstudio.com | – |

Ekstensi VS Code yang disarankan: **ESLint**, **Tailwind CSS IntelliSense**, **Prettier**.
Buka Terminal (Windows: *Git Bash* atau *PowerShell*) untuk menjalankan perintah di bawah.

### 1.2 Set identitas Git (sekali saja)
```bash
git config --global user.name "Nama Kamu"
git config --global user.email "email-github-kamu@example.com"
```

### 1.3 Clone & jalankan project
```bash
git clone https://github.com/<org>/wildlife-tracking-frontend.git
cd wildlife-tracking-frontend
git checkout develop
npm install
```
Buat file environment:
```bash
# Mac/Linux/Git Bash
cp .env.example .env.local
# PowerShell
copy .env.example .env.local
```
Isi `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```
Jalankan:
```bash
npm run dev
```
Buka http://localhost:3000. Jika tampil, setup berhasil ✅. (Fitur yang butuh data baru jalan bila backend juga menyala di port 8000.)

### 1.4 Masalah umum
| Masalah | Solusi |
|---|---|
| `npm: command not found` | Node.js belum terinstall / terminal belum di-restart |
| Port 3000 dipakai | Tutup aplikasi lain, atau `npm run dev -- -p 3001` |
| Data tidak muncul / network error | Backend belum jalan, atau `NEXT_PUBLIC_API_URL` salah. Restart `npm run dev` setelah mengubah `.env.local` |
| Error CORS | Minta Backend menambahkan `http://localhost:3000` di konfigurasi CORS |
| `npm run lint` error | Perbaiki error-nya; jangan `eslint-disable` sembarangan |

---

## 2. SETUP PROJECT DARI NOL (HANYA PIC Frontend, sekali saja)
```bash
npx create-next-app@latest . --typescript --eslint --tailwind --app --src-dir --import-alias "@/*"
npm install zod
npm install -D eslint-plugin-unused-imports
```
Buat folder sesuai struktur di bawah, `.env.example`, lalu commit ke `develop`.

Tambahkan aturan ini ke `eslint.config.mjs` yang dihasilkan Next.js (sesuaikan dengan isi file, jangan hapus bawaan):
```js
import unusedImports from "eslint-plugin-unused-imports";

// tambahkan satu objek ini ke array config:
{
  plugins: { "unused-imports": unusedImports },
  rules: {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/consistent-type-definitions": ["error", "type"],
    "@typescript-eslint/no-unused-vars": "off",
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "react-hooks/exhaustive-deps": "error",
  },
},
```
Pastikan `tsconfig.json` memiliki `"strict": true`. Pastikan `.env*` ada di `.gitignore` (kecuali `.env.example`).

---

## 3. STRUKTUR FOLDER
```
src/
├── app/          # routing: page.tsx, layout.tsx, loading.tsx, error.tsx
├── components/   # UI generik dipakai banyak fitur (Button, Modal, Table)
├── features/     # komponen khusus fitur (wildlife/, monitoring/, ai/)
├── hooks/        # custom hook yang memanggil service (useWildlife)
├── services/     # SATU-SATUNYA tempat memanggil API
├── types/        # type global (ApiResponse, User)
├── schemas/      # validasi Zod
├── utils/        # fungsi pembantu murni (formatDate)
├── constants/    # nilai tetap (role, route)
└── lib/          # setup api client
```
Buat folder **saat dibutuhkan**, jangan kosong-kosongan. File `page.tsx` dibuat tipis: rakit komponen saja.

---

## 4. ATURAN WAJIB
### 4.1 TypeScript
1. `strict: true`.
2. **DILARANG `any`** → pakai `unknown` lalu narrowing.
3. **DILARANG `interface`** → pakai `type`.
4. Semua props, state, form, dan response API harus bertipe.

```ts
// ❌ const data: any = res;      interface User { id: number }
// ✅
type User = { id: number; name: string; email: string };
type ApiResponse<T> = { success: boolean; message: string; data: T };
type ValidationErrorResponse = { success: false; message: string; errors: Record<string, string[]> };
const data: unknown = res; // lalu cek tipenya sebelum dipakai
```

### 4.2 Alur komunikasi API
```
Component → Hook → Service → Laravel API
```
Component **tidak boleh** memanggil `fetch` langsung.

```ts
// lib/api-client.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function apiClient<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", Accept: "application/json", ...init?.headers },
  });
  const body: unknown = res.status === 204 ? null : await res.json();
  if (!res.ok) throw new ApiError(res.status, body);
  return body as T;
}
```
```ts
// services/wildlife.service.ts
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

### 4.3 Validasi form (Zod)
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
Validasi FE hanya untuk **UX**. Backend tetap memvalidasi ulang.

### 4.4 State tampilan (wajib ada)
Loading · Success · Empty · Error · Unauthorized (401 → ke login) · Forbidden (403) · Validation error (422, tampil per field) · Server error (500).
```tsx
if (isLoading) return <Spinner />;
if (error) return <ErrorMessage message={error} />;
if (data.length === 0) return <EmptyState text="Belum ada data satwa" />;
return <WildlifeTable data={data} />;
```

### 4.5 Keamanan
- Jangan taruh secret di variabel `NEXT_PUBLIC_*` (terlihat publik).
- Menyembunyikan menu sesuai role hanya untuk UX; keamanan sesungguhnya ada di backend.
- Fitur AI dipanggil lewat endpoint backend (`/api/ai/...`), bukan ke provider AI.

### 4.6 ESLint
`npm run lint` harus **0 error** sebelum PR. `// eslint-disable` hanya dengan alasan tertulis dan persetujuan PIC Frontend:
`// eslint-disable-next-line <rule> -- alasan: ... (disetujui @nama)`

---

## 5. NAMING
| Hal | Aturan | Contoh |
|---|---|---|
| Component | PascalCase | `UserTable.tsx` |
| Function / variable | camelCase | `getUsers()`, `userData` |
| Type | PascalCase | `type User = {}` |
| Service / hook | `x.service.ts` / `useX.ts` | `wildlife.service.ts`, `useWildlife.ts` |

---

## 6. GIT WORKFLOW (CONTEKAN PEMULA)
Branch: `main` (stabil), `develop` (integrasi), `feature/<nama>`, `fix/<nama>`.

```bash
git checkout develop
git pull origin develop                 # ambil update terbaru
git checkout -b feature/wildlife-list   # buat branch kerja

# ... coding ...
npm run lint                            # wajib bersih
git add .
git commit -m "feat(wildlife): add wildlife list page"
git push -u origin feature/wildlife-list
```
Lalu di GitHub: **Compare & pull request** → target `develop` → minta review.

Commit message: `feat:` `fix:` `refactor:` `docs:` `test:` `chore:`.
Konflik? `git pull origin develop` di branch kamu, selesaikan tanda `<<<<<<<` di VS Code, lalu `git add .` dan `git commit`. Bingung? Tanya PM/PIC jangan di-`force push`.

**Dilarang:** push langsung ke `main`/`develop`, commit `.env.local`.

---

## 7. DEFINITION OF DONE (Frontend)
- [ ] UI selesai & terintegrasi dengan API backend
- [ ] Memakai `type`, tanpa `any`, tanpa `interface`
- [ ] `npm run lint` 0 error
- [ ] Loading, error, empty state ada
- [ ] Validasi form (Zod) bekerja & error 422 dari backend tampil
- [ ] Sudah diuji manual (data valid, kosong, error, role tanpa izin)
- [ ] Tidak ada credential ter-commit
- [ ] PR sudah di-review

## 8. DO & DON'T
| ✅ DO | ❌ DON'T |
|---|---|
| Panggil API lewat service | `fetch` di dalam component |
| `type` dan `unknown` | `any` / `interface` |
| Pecah komponen besar | Satu file ratusan baris |
| PR kecil | PR besar campur banyak fitur |

## 9. Tanggung jawab
Next.js · UI · component · integrasi API · state management · TypeScript · form · UX.
