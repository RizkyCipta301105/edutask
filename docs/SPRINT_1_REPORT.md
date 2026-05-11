# Laporan Sprint 1 - EduTask

## Sprint Goal

Membangun fondasi aplikasi web EduTask agar mahasiswa dapat registrasi, login, mengelola profil, mengelola task, melakukan filter/search task, dan menyimpan jadwal kuliah mingguan.

## Sprint Backlog

| ID | User Story | Status |
| --- | --- | --- |
| US-01 | Sebagai pengguna, saya dapat registrasi akun dengan email dan password. | Done |
| US-02 | Sebagai pengguna, saya dapat login/logout memakai JWT. | Done |
| US-03 | Sebagai pengguna, saya dapat melihat dan mengedit profil. | Done |
| US-04 | Sebagai pengguna, saya dapat membuat task dengan judul, deskripsi, deadline, prioritas, mata kuliah, dan status. | Done |
| US-05 | Sebagai pengguna, saya dapat mengedit dan menghapus task. | Done |
| US-06 | Sebagai pengguna, saya dapat filter task berdasarkan prioritas, status, mata kuliah, dan mencari judul task. | Done |
| US-07 | Sebagai pengguna, saya dapat melihat task dalam board kanban. | Done |
| US-08 | Sebagai pengguna, saya dapat menambah dan melihat jadwal kuliah mingguan. | Done |

## Implementasi

- Frontend React + Tailwind dengan halaman Login, Register, Dashboard/Kanban, Task Management, Profile, dan Jadwal Kuliah.
- Backend Django REST Framework dengan endpoint Authentication, Profile, Task CRUD, Mata Kuliah, dan Jadwal Kuliah.
- JWT memakai `djangorestframework-simplejwt` dengan token refresh dan blacklist saat logout.
- Password hashing memakai bcrypt melalui `BCryptSHA256PasswordHasher`.
- Database ditargetkan ke PostgreSQL melalui konfigurasi `.env`.

## Referensi UI

Implementasi visual mengikuti pola dari PDF referensi:

- Sidebar kiri untuk navigasi utama.
- Top bar dengan search dan ikon akun.
- Board task berbasis kolom.
- Modal task dengan form ringkas.
- Halaman settings/profil berisi pengaturan akun dan password.

## Verifikasi Lokal

| Pemeriksaan | Hasil |
| --- | --- |
| `npm run build` di frontend | Berhasil |
| `DEBUG=True python manage.py check` di backend | Berhasil |
| `python manage.py makemigrations schedules` | Berhasil membuat migrasi `0001_initial.py` |

Catatan: file lokal `backend/.env` saat verifikasi berisi `DEBUG=release`, sehingga command Django perlu nilai boolean seperti `DEBUG=True` atau `DEBUG=False`.
