# Struktur Database PostgreSQL - Sprint 6

## `auth_user_edutask`

| Kolom               | Tipe                | Keterangan                             |
|---------------------|---------------------|----------------------------------------|
| `id`                | UUID PK             | ID pengguna                            |
| `email`             | varchar unique      | Email login                            |
| `nama_lengkap`      | varchar(100)        | Nama pengguna                          |
| `foto_profil`       | image path nullable | Foto profil opsional                   |
| `tipe_akun`         | varchar(10)         | `umum`, `pens`, `gmail`                |
| `role`              | varchar(12)         | `mahasiswa`, `dosen`, `umum`           |
| `nrp`               | varchar unique nullable | NRP/NIM mahasiswa                  |
| `prodi`             | varchar(100)        | Program studi                          |
| `kelas_id`          | FK nullable → kelas | Kelas mahasiswa                        |
| `nip`               | varchar unique nullable | NIP dosen                          |
| `mata_kuliah`       | varchar(120)        | Mata kuliah utama dosen (text field)   |
| `is_active`         | boolean             | Status aktif                           |
| `is_staff`          | boolean             | Akses admin                            |
| `is_email_verified` | boolean             | Status verifikasi email                |
| `tanggal_daftar`    | datetime            | Waktu registrasi                       |
| `last_login`        | datetime nullable   | Login terakhir                         |

Password disimpan oleh Django auth memakai hasher `BCryptSHA256PasswordHasher`.

---

## `kelas`

| Kolom    | Tipe         | Keterangan              |
|----------|--------------|-------------------------|
| `id`     | UUID PK      | ID kelas                |
| `nama`   | varchar(50)  | Nama kelas (unique)     |
| `tingkat`| integer      | Tahun/tingkat kelas     |
| `prodi`  | varchar(100) | Program studi           |

---

## `ruang_edukasi`

| Kolom        | Tipe               | Keterangan                                    |
|--------------|--------------------|-----------------------------------------------|
| `id`         | UUID PK            | ID ruang                                      |
| `kode_join`  | varchar(10) unique | Kode bergabung (auto-generated)               |
| `nama_ruang` | varchar(100)       | Nama ruang edukasi                            |
| `deskripsi`  | text               | Deskripsi ruang                               |
| `kreator_id` | FK → auth_user     | Dosen pembuat                                 |
| `anggota`    | M2M → auth_user    | Anggota (mahasiswa) yang bergabung            |
| `hari`       | integer nullable   | Hari kuliah (0=Minggu, 1=Senin ... 6=Sabtu)  |
| `jam_mulai`  | time nullable      | Jam mulai kuliah                              |
| `jam_selesai`| time nullable      | Jam selesai kuliah                            |
| `ruangan`    | varchar(150) nullable | Ruangan / link Zoom                        |
| `warna`      | varchar(7)         | Warna label hex (default: #8B6914)            |
| `created_at` | datetime           | Waktu dibuat                                  |

---

## `mata_kuliah`

| Kolom        | Tipe               | Keterangan                       |
|--------------|--------------------|----------------------------------|
| `id`         | UUID PK            | ID mata kuliah                   |
| `user_id`    | FK → auth_user     | Pemilik data                     |
| `nama`       | varchar(100)       | Nama mata kuliah / agenda        |
| `nama_dosen` | varchar(100)       | Nama dosen opsional              |
| `warna`      | varchar(7)         | Warna label hex                  |
| `hari`       | integer nullable   | Hari (0=Minggu ... 6=Sabtu)     |
| `jam_mulai`  | time nullable      | Jam mulai                        |
| `jam_selesai`| time nullable      | Jam selesai                      |
| `ruangan`    | varchar(150) nullable | Ruangan / link Zoom           |
| `created_at` | datetime           | Waktu dibuat                     |

> **Catatan**: `GET /api/tasks/mata-kuliah/` mengembalikan gabungan dari `MataKuliah` pribadi dan data schedule dari `RuangEdukasi`. Record dari RuangEdukasi ditandai dengan `is_academic: true` dan tidak dapat diedit/dihapus lewat task endpoint.

---

## `task`

| Kolom               | Tipe               | Keterangan                          |
|---------------------|--------------------|-------------------------------------|
| `id`                | UUID PK            | ID task                             |
| `user_id`           | FK → auth_user     | Pemilik task                        |
| `mata_kuliah_id`    | FK nullable        | Relasi mata kuliah                  |
| `source_assignment_id` | FK nullable    | Sumber dari PenugasanDosen          |
| `judul`             | varchar(200)       | Judul tugas                         |
| `deskripsi`         | text               | Deskripsi                           |
| `deadline`          | date               | Deadline                            |
| `prioritas`         | varchar(10)        | `tinggi`, `sedang`, `rendah`        |
| `status`            | varchar(15)        | `todo`, `in_progress`, `done`       |
| `attachment`        | file nullable      | Lampiran berkas (max 10MB)          |
| `urutan`            | integer            | Urutan di kanban                    |
| `created_at`        | datetime           | Waktu dibuat                        |
| `updated_at`        | datetime           | Waktu update                        |

---

## `penugasan_dosen`

| Kolom          | Tipe              | Keterangan                       |
|----------------|-------------------|----------------------------------|
| `id`           | UUID PK           | ID penugasan                     |
| `dosen_id`     | FK → auth_user    | Dosen pembuat                    |
| `ruang_tujuan` | M2M → ruang_edukasi | Ruang tujuan broadcast          |
| `mata_kuliah`  | varchar(120)      | Nama mata kuliah                 |
| `judul`        | varchar(200)      | Judul tugas                      |
| `deskripsi`    | text              | Deskripsi                        |
| `deadline`     | date nullable     | Deadline                         |
| `prioritas`    | varchar(10)       | Prioritas tugas                  |
| `created_at`   | datetime          | Waktu dibuat                     |
| `updated_at`   | datetime          | Waktu update                     |

---

## `task_comment`

| Kolom      | Tipe           | Keterangan       |
|------------|----------------|------------------|
| `id`       | UUID PK        | ID komentar      |
| `task_id`  | FK → task      | Task terkait     |
| `user_id`  | FK → auth_user | Pengirim komentar|
| `komentar` | text           | Isi komentar     |
| `created_at` | datetime     | Waktu dibuat     |

---

## `task_notification`

| Kolom      | Tipe           | Keterangan                |
|------------|----------------|---------------------------|
| `id`       | UUID PK        | ID notifikasi             |
| `user_id`  | FK → auth_user | Penerima notifikasi       |
| `task_id`  | FK nullable    | Task terkait              |
| `title`    | varchar(255)   | Judul notifikasi          |
| `message`  | text           | Isi notifikasi            |
| `is_read`  | boolean        | Status dibaca             |
| `created_at` | datetime     | Waktu dibuat              |

---

## `inbox_thread`

| Kolom          | Tipe             | Keterangan                     |
|----------------|------------------|--------------------------------|
| `id`           | UUID PK          | ID thread                      |
| `title`        | varchar nullable | Judul grup (opsional)          |
| `is_group`     | boolean          | Thread grup atau 1:1           |
| `participants` | M2M → auth_user  | Peserta thread                 |
| `created_at`   | datetime         | Waktu dibuat                   |
| `updated_at`   | datetime         | Waktu update (sort by latest)  |

---

## `inbox_message`

| Kolom        | Tipe               | Keterangan                  |
|--------------|--------------------|-----------------------------|
| `id`         | UUID PK            | ID pesan                    |
| `thread_id`  | FK → inbox_thread  | Thread terkait              |
| `sender_id`  | FK → auth_user     | Pengirim                    |
| `text`       | text               | Isi pesan                   |
| `attachment` | file nullable      | Lampiran                    |
| `is_read`    | boolean            | Status dibaca               |
| `is_edited`  | boolean            | Apakah sudah diedit         |
| `reactions`  | JSON               | Emoji reactions (dict)      |
| `created_at` | datetime           | Waktu dibuat                |
| `updated_at` | datetime           | Waktu update                |

---

## `verification_tokens`

| Kolom        | Tipe        | Keterangan                          |
|--------------|-------------|-------------------------------------|
| `id`         | integer PK  | ID token                            |
| `user_id`    | FK → user   | Pemilik token                       |
| `token`      | UUID unique | Token unik                          |
| `token_type` | varchar(10) | `email` atau `password`             |
| `created_at` | datetime    | Waktu dibuat                        |
| `expires_at` | datetime    | Waktu kedaluwarsa                   |

---

## `jadwal_kuliah` *(Legacy)*

> ⚠️ Model legacy dari Sprint 1. Tidak lagi digunakan secara aktif — jadwal kuliah kini diintegrasikan melalui `RuangEdukasi`. Data lama mungkin masih ada di database.

| Kolom         | Tipe         | Keterangan        |
|---------------|--------------|-------------------|
| `id`          | UUID PK      | ID jadwal         |
| `user_id`     | FK           | Pemilik jadwal    |
| `hari`        | varchar(10)  | Hari dalam minggu |
| `jam`         | varchar(30)  | Rentang jam       |
| `ruangan`     | varchar(80)  | Ruangan kelas     |
| `dosen`       | varchar(100) | Nama dosen        |
| `mata_kuliah` | varchar(100) | Nama mata kuliah  |
| `created_at`  | datetime     | Waktu dibuat      |
| `updated_at`  | datetime     | Waktu update      |
