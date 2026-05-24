# EduTask – Sprint 6 In Progress

> Aplikasi Web Manajemen Tugas & Jadwal Akademik  
> Tim Sumber Rejeki | Teknologi Rekayasa Internet | PENS 2026

---

## 📁 Struktur Proyek

```
edutask/
├── backend/                    # Django REST Framework
│   ├── apps/
│   │   ├── authentication/     # User, Kelas, RuangEdukasi, VerificationToken
│   │   │   ├── models.py       # Custom User (multi-role), RuangEdukasi (with schedule fields)
│   │   │   ├── serializers.py
│   │   │   ├── views.py        # Auth, Profile, Ruang Edukasi CRUD, Join
│   │   │   ├── urls.py         # /api/auth/...
│   │   │   ├── jwt_utils.py
│   │   │   ├── verification_views.py
│   │   │   └── google_views.py
│   │   ├── tasks/              # Task, MataKuliah, PenugasanDosen, TaskComment, Notification
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py        # Task CRUD, Kanban, Broadcast, Report, Export, Notifications
│   │   │   ├── urls.py         # /api/tasks/...
│   │   │   └── signals.py      # Reminder/deadline notification signals
│   │   ├── schedules/          # JadwalKuliah (legacy standalone schedule model)
│   │   │   ├── models.py
│   │   │   ├── views.py
│   │   │   └── urls.py
│   │   ├── inbox/              # ChatThread, Message
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   └── urls.py         # /api/inbox/...
│   │   └── common/
│   │       ├── utils.py        # success_response, validation_error_response, error_response
│   │       ├── serializers.py  # Shared validation mixins
│   │       └── permissions.py  # IsRole permission classes
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/                   # React + Vite + TailwindCSS
    ├── src/
    │   ├── pages/
    │   │   ├── DashboardPage.jsx         # Multi-tab: Overview, Ruang, Report, Inbox
    │   │   ├── TaskManagementPage.jsx    # Kanban Board + Backlog + Dosen Broadcast
    │   │   ├── SchedulePage.jsx          # Calendar + Weekly Timetable (role-aware)
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx          # Multi-role: mahasiswa / dosen / umum
    │   │   ├── ProfilePage.jsx
    │   │   ├── ForgotPasswordPage.jsx
    │   │   ├── ResetPasswordPage.jsx
    │   │   └── VerifyEmailPage.jsx
    │   ├── components/
    │   │   ├── dashboard/
    │   │   │   ├── CalendarView.jsx         # Monthly calendar + day detail panel
    │   │   │   ├── Inbox.jsx                # Full chat UI (threads + messages)
    │   │   │   ├── NotificationDropdown.jsx
    │   │   │   ├── DosenBroadcastView.jsx
    │   │   │   └── SettingsView.jsx
    │   │   ├── tasks/
    │   │   │   ├── Board.jsx                # Kanban board
    │   │   │   ├── Backlog.jsx
    │   │   │   ├── AddTaskModal.jsx
    │   │   │   ├── TaskModal.jsx
    │   │   │   ├── TaskDetailModal.jsx
    │   │   │   ├── MataKuliahModal.jsx      # Modal for personal schedule / agenda
    │   │   │   ├── RuangEdukasiList.jsx     # Classroom management (create/join)
    │   │   │   └── Report.jsx               # Analytics charts (Recharts)
    │   │   ├── auth/
    │   │   └── common/
    │   │       ├── AppLayout.jsx
    │   │       ├── ProtectedRoute.jsx
    │   │       ├── GuestRoute.jsx
    │   │       └── RoleRoute.jsx
    │   ├── services/
    │   │   ├── api.js              # Axios instance + JWT interceptor + helpers
    │   │   ├── authService.js      # Auth + Ruang Edukasi API calls
    │   │   ├── taskService.js      # Task, MataKuliah, Kanban, Notifications API
    │   │   ├── inboxService.js     # ChatThread + Message API calls
    │   │   └── scheduleService.js
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── hooks/
    │   │   └── useTasks.js
    │   ├── utils/
    │   │   └── authHelpers.js
    │   ├── styles/                 # CSS module files per page
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── .env.example
```

---

## ⚙️ Setup Backend (Django)

### 1. Buat virtual environment & install dependencies

```bash
cd edutask/backend

python -m venv venv

# macOS / Linux
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r requirements.txt
```

### 2. Buat database PostgreSQL

```sql
CREATE DATABASE edutask_db;
CREATE USER edutask_user WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE edutask_db TO edutask_user;
```

### 3. Konfigurasi environment

```bash
cp .env.example .env
# Edit .env sesuai konfigurasi database kamu
```

Isi file `.env`:
```env
SECRET_KEY=ganti-dengan-secret-key-yang-panjang-dan-aman
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=edutask_db
DB_USER=edutask_user
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432
```

### 4. Jalankan migrasi & buat superuser

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### 5. Jalankan server

```bash
python manage.py runserver
# Backend berjalan di http://localhost:8000
```

---

## ⚙️ Setup Frontend (React)

### 1. Install dependencies

```bash
cd edutask/frontend
npm install
```

### 2. Konfigurasi environment

```bash
cp .env.example .env
# Isi VITE_API_URL jika backend tidak di localhost:8000
```

### 3. Jalankan dev server

```bash
npm run dev
# Frontend berjalan di http://localhost:5173
```

---

## 🔌 API Endpoints

Base URL: `http://localhost:8000`

### Authentication

| Method | Endpoint                         | Auth      | Deskripsi                        |
|--------|----------------------------------|-----------|----------------------------------|
| POST   | `/api/auth/register/`            | ❌ Public  | Registrasi akun umum             |
| POST   | `/api/auth/register/mahasiswa/`  | ❌ Public  | Registrasi mahasiswa             |
| POST   | `/api/auth/register/dosen/`      | ❌ Public  | Registrasi dosen                 |
| POST   | `/api/auth/register/umum/`       | ❌ Public  | Registrasi pengguna umum         |
| POST   | `/api/auth/login/`               | ❌ Public  | Login, mendapatkan JWT token     |
| POST   | `/api/auth/logout/`              | ✅ Bearer  | Logout, blacklist refresh token  |
| POST   | `/api/auth/token/refresh/`       | ❌ Public  | Perbarui access token            |
| GET    | `/api/auth/profile/`             | ✅ Bearer  | Ambil profil user                |
| PATCH  | `/api/auth/profile/`             | ✅ Bearer  | Update profil user               |
| POST   | `/api/auth/change-password/`     | ✅ Bearer  | Ganti password                   |
| GET    | `/api/auth/kelas/`               | ✅ Bearer  | List kelas (Mahasiswa)           |
| GET    | `/api/auth/ruang/`               | ✅ Bearer  | List Ruang Edukasi user          |
| POST   | `/api/auth/ruang/`               | ✅ Bearer  | Buat Ruang Edukasi baru (Dosen)  |
| GET    | `/api/auth/ruang/<id>/`          | ✅ Bearer  | Detail Ruang Edukasi             |
| DELETE | `/api/auth/ruang/<id>/`          | ✅ Bearer  | Hapus Ruang Edukasi              |
| GET    | `/api/auth/ruang/<id>/members/`  | ✅ Bearer  | List anggota ruang               |
| POST   | `/api/auth/ruang/join/`          | ✅ Bearer  | Bergabung dengan kode join       |
| POST   | `/api/auth/forgot-password/`     | ❌ Public  | Kirim link reset password        |
| POST   | `/api/auth/reset-password/`      | ❌ Public  | Konfirmasi reset password        |

### Tasks

| Method | Endpoint                              | Auth      | Deskripsi                        |
|--------|---------------------------------------|-----------|----------------------------------|
| GET    | `/api/tasks/mata-kuliah/`             | ✅ Bearer  | List mata kuliah + jadwal ruang  |
| POST   | `/api/tasks/mata-kuliah/`             | ✅ Bearer  | Tambah mata kuliah pribadi       |
| PUT    | `/api/tasks/mata-kuliah/<id>/`        | ✅ Bearer  | Edit mata kuliah                 |
| DELETE | `/api/tasks/mata-kuliah/<id>/`        | ✅ Bearer  | Hapus mata kuliah                |
| GET    | `/api/tasks/`                         | ✅ Bearer  | List task + filter/search        |
| POST   | `/api/tasks/`                         | ✅ Bearer  | Tambah task                      |
| PUT    | `/api/tasks/<id>/`                    | ✅ Bearer  | Edit task                        |
| DELETE | `/api/tasks/<id>/`                    | ✅ Bearer  | Hapus task                       |
| GET    | `/api/tasks/kanban/`                  | ✅ Bearer  | Data board per status            |
| PATCH  | `/api/tasks/<id>/move/`               | ✅ Bearer  | Pindah task antar kolom Kanban   |
| GET    | `/api/tasks/<id>/comments/`           | ✅ Bearer  | Komentar task                    |
| POST   | `/api/tasks/<id>/comments/`           | ✅ Bearer  | Tambah komentar                  |
| GET    | `/api/tasks/penugasan/`               | ✅ Bearer  | List penugasan dosen             |
| POST   | `/api/tasks/penugasan/`               | ✅ Bearer  | Broadcast tugas (Dosen only)     |
| GET    | `/api/tasks/penugasan/report/`        | ✅ Bearer  | Rekap progress mahasiswa         |
| GET    | `/api/tasks/penugasan/export/`        | ✅ Bearer  | Export CSV progress              |
| GET    | `/api/tasks/penugasan/<id>/progress/` | ✅ Bearer  | Progress per penugasan           |
| GET    | `/api/tasks/notifications/`           | ✅ Bearer  | List notifikasi user             |
| PATCH  | `/api/tasks/notifications/read/`      | ✅ Bearer  | Mark all notifikasi read         |
| PATCH  | `/api/tasks/notifications/<id>/read/` | ✅ Bearer  | Mark notifikasi read             |

### Inbox

| Method | Endpoint                          | Auth      | Deskripsi                     |
|--------|-----------------------------------|-----------|-------------------------------|
| GET    | `/api/inbox/threads/`             | ✅ Bearer  | List thread chat user         |
| POST   | `/api/inbox/threads/`             | ✅ Bearer  | Buat thread baru              |
| GET    | `/api/inbox/threads/<id>/`        | ✅ Bearer  | Detail thread                 |
| GET    | `/api/inbox/threads/<id>/messages/` | ✅ Bearer | List pesan dalam thread       |
| POST   | `/api/inbox/threads/<id>/messages/` | ✅ Bearer | Kirim pesan                   |

---

## 🗃️ Data Models Utama

### User
- UUID primary key
- Role: `mahasiswa` | `dosen` | `umum`
- TipeAkun: `gmail` | `pens` | `umum`
- Fields: email, nama_lengkap, foto_profil, nrp, nip, prodi, kelas

### RuangEdukasi *(Authentication app)*
- Fields: nama_ruang, deskripsi, kode_join (auto-generated)
- Schedule fields: hari (IntegerChoices 0-6), jam_mulai, jam_selesai, ruangan, warna
- Relations: kreator (ForeignKey User), anggota (M2M User)
- **Note**: Schedule in RuangEdukasi is the authoritative source for class schedules — replaces manual `JadwalKuliah` input for Mahasiswa.

### MataKuliah *(Tasks app)*
- Belongs to individual user — used as task category AND personal agenda
- Fields: nama, nama_dosen, warna, hari, jam_mulai, jam_selesai, ruangan
- **Note**: `GET /api/tasks/mata-kuliah/` merges personal records with RuangEdukasi schedule data. `is_academic: True` marks the latter.

### Task
- Fields: judul, deskripsi, deadline, prioritas, status, attachment, urutan
- Relations: user, mata_kuliah (optional), source_assignment (optional)
- Statuses: `todo` | `in_progress` | `done`

### PenugasanDosen
- Created by Dosen, broadcast to RuangEdukasi (M2M)
- Auto-creates Tasks for each Mahasiswa in the target rooms

### ChatThread / Message *(Inbox app)*
- ChatThread: supports 1:1 and group chats, has title (group), participants (M2M)
- Message: text, attachment, reactions (JSON), is_read, is_edited

---

## 🛡️ Fitur Keamanan

| Fitur | Implementasi |
|-------|-------------|
| Password hashing | BCrypt SHA256 (`BCryptSHA256PasswordHasher`) |
| JWT Authentication | `djangorestframework-simplejwt` |
| Token blacklist saat logout | `rest_framework_simplejwt.token_blacklist` |
| Auto token refresh | Axios interceptor di frontend |
| CORS | `django-cors-headers` |
| Input validation | DRF Serializers + Django password validators |
| Data isolation | Semua queryset difilter berdasarkan `request.user` |
| Role-based access | `IsRole` permission class + `RoleRoute` di frontend |

---

## ✅ FR yang Diimplementasikan (Sprint 1–6)

| Kode  | Fitur                                        | Status     |
|-------|----------------------------------------------|------------|
| FR-01 | Registrasi Akun Multi-Role                   | ✅ Done    |
| FR-02 | Login & Logout dengan JWT                    | ✅ Done    |
| FR-03 | Manajemen Profil Pengguna                    | ✅ Done    |
| FR-04 | Pembuatan Task Pribadi & Broadcast           | ✅ Done    |
| FR-05 | Ruang Edukasi & Join Code                    | ✅ Done    |
| FR-06 | Jadwal Kuliah Terintegrasi Ruang Edukasi     | ✅ Done    |
| FR-07 | Kanban Board Visual                          | ✅ Done    |
| FR-08 | Visualisasi Analitik (Recharts)              | ✅ Done    |
| FR-09 | Kalender Interaktif                          | ✅ Done    |
| FR-10 | Sistem Pengingat (Reminder) Otomatis H-1     | ✅ Done    |
| FR-11 | Progress Tracker Mahasiswa (Dosen Dashboard) | ✅ Done    |
| FR-12 | Inbox Kolaborasi (Chat Real-Time)            | ✅ Done    |
| FR-13 | Export Laporan Dosen (CSV)                   | ✅ Done    |
| FR-14 | Notifikasi In-App                            | ✅ Done    |
| FR-15 | Email Verification                           | 🔄 Partial |
| FR-16 | OAuth Google Login                           | 🔄 Stub    |

---

## 🚀 Roadmap Berikutnya

- Email verification full flow (frontend integration)
- Real Google OAuth production setup
- Automated browser smoke tests (Cypress/Playwright)
- Push/email reminders
- Drag-and-drop calendar events
