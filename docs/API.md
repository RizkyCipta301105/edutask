# EduTask REST API - Sprint 6

Base URL lokal: `http://localhost:8000`

Semua endpoint privat memakai header:

```http
Authorization: Bearer <access_token>
```

Response format konsisten:
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

---

## Authentication `/api/auth/`

| Method | Endpoint                          | Auth    | Keterangan                     |
|--------|-----------------------------------|---------|--------------------------------|
| POST   | `/api/auth/register/`             | Public  | Registrasi akun umum           |
| POST   | `/api/auth/register/mahasiswa/`   | Public  | Registrasi role mahasiswa      |
| POST   | `/api/auth/register/dosen/`       | Public  | Registrasi role dosen          |
| POST   | `/api/auth/register/umum/`        | Public  | Registrasi role umum           |
| POST   | `/api/auth/login/`                | Public  | Login dan menerima JWT         |
| POST   | `/api/auth/logout/`               | Bearer  | Blacklist refresh token        |
| POST   | `/api/auth/token/refresh/`        | Public  | Refresh access token           |
| GET    | `/api/auth/profile/`              | Bearer  | Ambil profil pengguna          |
| PATCH  | `/api/auth/profile/`              | Bearer  | Edit nama/foto profil          |
| POST   | `/api/auth/change-password/`      | Bearer  | Ganti password                 |
| GET    | `/api/auth/kelas/`                | Bearer  | List kelas (untuk dropdown)    |
| GET    | `/api/auth/ruang/`                | Bearer  | List Ruang Edukasi user        |
| POST   | `/api/auth/ruang/`                | Bearer  | Buat Ruang Edukasi (Dosen)     |
| GET    | `/api/auth/ruang/<uuid>/`         | Bearer  | Detail Ruang Edukasi           |
| DELETE | `/api/auth/ruang/<uuid>/`         | Bearer  | Hapus Ruang Edukasi (Dosen)    |
| GET    | `/api/auth/ruang/<uuid>/members/` | Bearer  | List anggota ruang             |
| POST   | `/api/auth/ruang/join/`           | Bearer  | Bergabung dengan kode join     |
| POST   | `/api/auth/forgot-password/`      | Public  | Kirim link reset password      |
| POST   | `/api/auth/reset-password/`       | Public  | Konfirmasi reset password      |
| POST   | `/api/auth/google/`               | Public  | Google OAuth login (stub)      |

---

## Tasks `/api/tasks/`

JWT access token menyimpan claim `user_id`, `email`, dan `role`.

| Method | Endpoint                              | Keterangan                            |
|--------|---------------------------------------|---------------------------------------|
| GET    | `/api/tasks/mata-kuliah/`             | List MataKuliah + jadwal RuangEdukasi |
| POST   | `/api/tasks/mata-kuliah/`             | Tambah MataKuliah pribadi             |
| PUT    | `/api/tasks/mata-kuliah/<uuid>/`      | Edit MataKuliah                       |
| DELETE | `/api/tasks/mata-kuliah/<uuid>/`      | Hapus MataKuliah                      |
| GET    | `/api/tasks/`                         | List task milik user                  |
| POST   | `/api/tasks/`                         | Tambah task                           |
| GET    | `/api/tasks/<uuid>/`                  | Detail task                           |
| PUT    | `/api/tasks/<uuid>/`                  | Edit task                             |
| DELETE | `/api/tasks/<uuid>/`                  | Hapus task                            |
| GET    | `/api/tasks/kanban/`                  | Task dikelompokkan per status         |
| PATCH  | `/api/tasks/<uuid>/move/`             | Pindah status/urutan kanban           |
| GET    | `/api/tasks/<uuid>/comments/`         | List komentar task                    |
| POST   | `/api/tasks/<uuid>/comments/`         | Tambah komentar                       |
| GET    | `/api/tasks/penugasan/`               | List penugasan dosen (Dosen only)     |
| POST   | `/api/tasks/penugasan/`               | Broadcast tugas ke Ruang (Dosen only) |
| DELETE | `/api/tasks/penugasan/<uuid>/`        | Hapus penugasan (Dosen only)          |
| GET    | `/api/tasks/penugasan/report/`        | Rekap progress mahasiswa (Dosen only) |
| GET    | `/api/tasks/penugasan/export/`        | Export CSV (Dosen only)               |
| GET    | `/api/tasks/penugasan/<uuid>/progress/` | Progress per penugasan              |
| GET    | `/api/tasks/notifications/`           | List notifikasi user                  |
| PATCH  | `/api/tasks/notifications/read/`      | Mark all notifikasi as read           |
| PATCH  | `/api/tasks/notifications/<uuid>/read/` | Mark satu notifikasi as read        |

### Query filter `GET /api/tasks/`

| Query       | Nilai                         |
|-------------|-------------------------------|
| `search`    | judul task                    |
| `prioritas` | `tinggi`, `sedang`, `rendah`  |
| `status`    | `todo`, `in_progress`, `done` |
| `mata_kuliah` | UUID mata kuliah             |

### Catatan: `GET /api/tasks/mata-kuliah/`

Endpoint ini mengembalikan **gabungan** data:
1. `MataKuliah` milik user (created personally) — `is_academic` tidak ada / `false`
2. Schedule dari `RuangEdukasi` yang diikuti/dibuat user — `is_academic: true`

Field tambahan untuk item dari RuangEdukasi: `is_academic: true`, `nama_dosen` (dari kreator), `hari`, `jam_mulai`, `jam_selesai`, `ruangan`, `warna`

---

## Inbox `/api/inbox/`

| Method | Endpoint                               | Keterangan                     |
|--------|----------------------------------------|--------------------------------|
| GET    | `/api/inbox/threads/`                  | List thread chat user          |
| POST   | `/api/inbox/threads/`                  | Buat thread baru               |
| GET    | `/api/inbox/threads/<uuid>/`           | Detail thread                  |
| GET    | `/api/inbox/threads/<uuid>/messages/`  | List pesan dalam thread        |
| POST   | `/api/inbox/threads/<uuid>/messages/`  | Kirim pesan                    |

---

## Schedules `/api/schedules/` *(Legacy)*

> ⚠️ Endpoint ini menggunakan model `JadwalKuliah` lama (standalone, tidak terintegrasi dengan Ruang Edukasi).
> Untuk jadwal kuliah yang terintegrasi, gunakan `/api/tasks/mata-kuliah/` (dengan `is_academic: true`).

| Method | Endpoint              | Keterangan           |
|--------|-----------------------|----------------------|
| GET    | `/api/schedules/`     | List jadwal mingguan |
| POST   | `/api/schedules/`     | Tambah jadwal        |
| PUT    | `/api/schedules/<id>/` | Edit jadwal         |
| DELETE | `/api/schedules/<id>/` | Hapus jadwal        |
