# Struktur Database PostgreSQL - Sprint 1

## `auth_user_edutask`

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | UUID PK | ID pengguna |
| `email` | varchar unique | Email login |
| `nama_lengkap` | varchar | Nama pengguna |
| `foto_profil` | image path | Foto profil opsional |
| `tipe_akun` | varchar | `umum`, `pens`, `gmail` |
| `role` | varchar | `mahasiswa`, `dosen`, `umum` |
| `nrp` | varchar unique nullable | NRP/NIM mahasiswa |
| `prodi` | varchar | Program studi mahasiswa |
| `nip` | varchar unique nullable | NIP dosen |
| `mata_kuliah` | varchar | Mata kuliah utama dosen |
| `is_active` | boolean | Status aktif |
| `is_staff` | boolean | Akses admin |
| `is_email_verified` | boolean | Status verifikasi email |
| `tanggal_daftar` | datetime | Waktu registrasi |
| `last_login` | datetime | Login terakhir |

Password disimpan oleh Django auth memakai hasher `BCryptSHA256PasswordHasher`.

## `mata_kuliah`

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | UUID PK | ID mata kuliah |
| `user_id` | FK | Pemilik data |
| `nama` | varchar | Nama mata kuliah |
| `nama_dosen` | varchar | Nama dosen opsional |
| `warna` | varchar | Warna label hex |
| `created_at` | datetime | Waktu dibuat |

## `task`

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | UUID PK | ID task |
| `user_id` | FK | Pemilik task |
| `mata_kuliah_id` | FK nullable | Relasi mata kuliah |
| `judul` | varchar | Judul tugas |
| `deskripsi` | text | Deskripsi |
| `deadline` | date | Deadline |
| `prioritas` | varchar | `tinggi`, `sedang`, `rendah` |
| `status` | varchar | `todo`, `in_progress`, `done` |
| `urutan` | integer | Urutan di kanban |
| `created_at` | datetime | Waktu dibuat |
| `updated_at` | datetime | Waktu update |

## `jadwal_kuliah`

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | UUID PK | ID jadwal |
| `user_id` | FK | Pemilik jadwal |
| `hari` | varchar | Hari dalam minggu |
| `jam` | varchar | Rentang jam kuliah |
| `ruangan` | varchar | Ruangan kelas |
| `dosen` | varchar | Nama dosen |
| `mata_kuliah` | varchar | Nama mata kuliah |
| `created_at` | datetime | Waktu dibuat |
| `updated_at` | datetime | Waktu update |
