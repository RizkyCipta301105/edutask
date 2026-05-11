# EduTask REST API - Sprint 1

Base URL lokal: `http://localhost:8000`

Semua endpoint privat memakai header:

```http
Authorization: Bearer <access_token>
```

## Authentication

| Method | Endpoint | Auth | Keterangan |
| --- | --- | --- | --- |
| POST | `/api/auth/register/` | Public | Registrasi email dan password |
| POST | `/api/auth/register/mahasiswa` | Public | Registrasi role mahasiswa |
| POST | `/api/auth/register/dosen` | Public | Registrasi role dosen |
| POST | `/api/auth/register/umum` | Public | Registrasi role umum |
| POST | `/api/auth/login/` | Public | Login dan menerima JWT |
| POST | `/api/auth/logout/` | Bearer | Blacklist refresh token |
| POST | `/api/auth/token/refresh/` | Public | Refresh access token |
| GET | `/api/auth/profile/` | Bearer | Ambil profil pengguna |
| PATCH | `/api/auth/profile/` | Bearer | Edit nama/foto profil |
| POST | `/api/auth/change-password/` | Bearer | Ganti password |

## Tasks

JWT access token menyimpan claim `user_id`, `email`, dan `role`.

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| GET | `/api/tasks/` | List task milik user |
| POST | `/api/tasks/` | Tambah task |
| GET | `/api/tasks/{id}/` | Detail task |
| PUT | `/api/tasks/{id}/` | Edit task |
| DELETE | `/api/tasks/{id}/` | Hapus task |
| GET | `/api/tasks/kanban/` | Task dikelompokkan per status |
| PATCH | `/api/tasks/{id}/move/` | Pindah status/urutan kanban |

Query filter `GET /api/tasks/`:

| Query | Nilai |
| --- | --- |
| `search` | judul task |
| `prioritas` | `tinggi`, `sedang`, `rendah` |
| `status` | `todo`, `in_progress`, `done` |
| `mata_kuliah` | UUID mata kuliah |

## Mata Kuliah

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| GET | `/api/tasks/mata-kuliah/` | List mata kuliah |
| POST | `/api/tasks/mata-kuliah/` | Tambah mata kuliah |
| PUT | `/api/tasks/mata-kuliah/{id}/` | Edit mata kuliah |
| DELETE | `/api/tasks/mata-kuliah/{id}/` | Hapus mata kuliah |

## Jadwal Kuliah

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| GET | `/api/schedules/` | List jadwal mingguan |
| POST | `/api/schedules/` | Tambah jadwal |
| PUT | `/api/schedules/{id}/` | Edit jadwal |
| DELETE | `/api/schedules/{id}/` | Hapus jadwal |

Body jadwal:

```json
{
  "hari": "senin",
  "jam": "08:00-10:00",
  "ruangan": "B301",
  "dosen": "Dr. Andi",
  "mata_kuliah": "Pemrograman Web"
}
```
