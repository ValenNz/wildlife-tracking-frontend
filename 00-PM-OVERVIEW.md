# PM OVERVIEW – Wildlife Tracking Monitoring System
(Dokumen ini untuk Project Manager. Tidak perlu dimasukkan ke repo mana pun, atau simpan di repo `backend` pada folder `docs/`.)

## 1. Rekomendasi Nama Repository
| Divisi | Nama Repo | Isi |
|---|---|---|
| Frontend | `wildlife-tracking-frontend` | Next.js + TypeScript |
| Backend | `wildlife-tracking-backend` | Laravel REST API + AI service |
| Database | `wildlife-tracking-database` | Desain DB, ERD, data dictionary, rencana seed |

Buat ketiganya di satu **GitHub Organization** (gratis) supaya rapi, mis. `wtms-team`. Semua repo **Private** (agar tidak ada credential bocor ke publik).

## 2. PENTING: Soal Repo Database
Migration, seeder, dan factory Laravel **harus berada di repo backend** (`backend/database/…`), karena Laravel yang menjalankannya. Jadi pembagian kerjanya:

| Repo | Fungsi |
|---|---|
| `wildlife-tracking-database` | **Desain**: ERD, data dictionary, aturan DB, rencana seed, review skema |
| `wildlife-tracking-backend` | **Implementasi**: file migration/seeder/factory (ditulis PIC Database via PR) |

Alur: PIC Database menulis desain di repo database → setelah disetujui, PIC Database membuat PR berisi migration ke repo backend (folder `database/migrations/`). Di repo backend, folder `database/` **dimiliki PIC Database** (lihat `CODEOWNERS` di README backend).

## 3. Cara Membuat Repo (sekali saja oleh PM)
1. GitHub → **New organization** (atau pakai akun sendiri) → **New repository** ×3 dengan nama di atas, centang *Add README* **tidak perlu** (kita pakai README dari paket ini).
2. Di komputer, untuk tiap repo:
   ```bash
   git clone https://github.com/<org>/wildlife-tracking-frontend.git
   cd wildlife-tracking-frontend
   # salin README.md dari paket ini ke sini
   git add . && git commit -m "docs: add project README" && git push origin main
   git checkout -b develop && git push -u origin develop
   ```
3. Tambahkan anggota: Repo → **Settings → Collaborators** (atau Teams di organization).
4. Proteksi branch: **Settings → Branches → Add rule** untuk `main` dan `develop`: centang *Require a pull request before merging* + *Require approvals (1)*.
5. Di **Settings → General**, pilih default branch `develop`.

## 4. Urutan Pengerjaan yang Disarankan (karena tim masih pemula)
| Minggu | Target |
|---|---|
| 1 | Semua anggota berhasil setup lokal (README masing-masing). Latihan Git: buat branch → commit → PR kecil (ubah README). |
| 2 | Database: ERD + data dictionary. Backend: login + role. Frontend: layout + halaman login. |
| 3 | Fitur inti: CRUD satwa/spesies/lokasi (satu fitur dikerjakan end-to-end dulu). |
| 4 | Monitoring, sighting, laporan, dashboard. |
| 5 | Fitur AI + testing + dokumentasi. |
| 6 | Bug fixing, final review, demo. |

## 5. Kontrak API (jembatan antar repo)
FE dan BE **wajib sepakat** soal endpoint, request, dan response **sebelum** coding. Simpan di repo backend: `docs/api.md`. Frontend membaca file itu. Jangan mengubah response tanpa memberi tahu FE.

Format response (sama di semua endpoint):
```json
{ "success": true,  "message": "Wildlife retrieved successfully", "data": [] }
{ "success": false, "message": "Wildlife not found", "data": null }
{ "success": false, "message": "Validation failed", "errors": { "name": ["The name field is required."] } }
```

## 6. Port Standar (hindari bentrok)
| Layanan | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8000 |
| MySQL | 127.0.0.1:3306 |

## 7. Tanggung Jawab PM
Requirement & prioritas · membagi task (GitHub Projects / Trello) · memastikan FE/BE/DB terintegrasi · koordinasi code review · memeriksa Definition of Done · tracking progress mingguan.

## 8. Aturan Kerja Tim (berlaku di semua repo)
1. Tidak ada push langsung ke `main` / `develop` – selalu lewat Pull Request.
2. Satu PR = satu fitur/perbaikan kecil. Review minimal 1 orang.
3. Tidak ada credential (`.env`, API key) di Git.
4. Bingung > 30 menit → tanya di grup. Jangan diam.
5. Update dokumentasi di PR yang sama dengan perubahan kode.
6. Stand-up singkat 2× seminggu (apa yang selesai, apa yang sedang dikerjakan, apa yang menghambat).
