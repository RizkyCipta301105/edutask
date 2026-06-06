# EduTask – Sprint 6 Completed

> Aplikasi Web Manajemen Tugas & Jadwal Akademik  
> Tim Sumber Rejeki | Teknologi Rekayasa Internet | PENS 2026

**🎉 NEW: Payment Gateway (BayarIn) terintegrasi — upgrade ke Pro/Team plan langsung dari app!**  
**🧪 NEW: 50 Cypress E2E smoke tests — semua passing!**

---

## 🚀 Quick Start

```bash
# Terminal 1 - Backend EduTask
cd backend
python manage.py runserver
# → http://localhost:8000

# Terminal 2 - Frontend EduTask
cd frontend
npm run dev
# → http://localhost:5174

# (Opsional) Terminal 3 - BayarIn Payment Gateway
# Diperlukan hanya untuk fitur checkout/subscription
cd bayarin-backend   # atau sesuai lokasi instalasi BayarIn
uvicorn main:app --port 8001
```

**Open**: http://localhost:5174/

📖 **Lihat [QUICK_START.md](QUICK_START.md) untuk panduan lengkap**

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
│   │   ├── payment/            # PaymentProof, Subscription (BayarIn integration)
│   │   │   ├── models.py       # PaymentProof, Subscription
│   │   │   ├── serializers.py
│   │   │   ├── views.py        # CreateInvoice, CheckInvoice, Webhook, SubmitProof
│   │   │   └── urls.py         # /api/payment/...
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
    │   │   ├── VerifyEmailPage.jsx
    │   │   └── CheckoutPage.jsx              # Alur checkout & subscription (BayarIn)
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
    │   │   ├── scheduleService.js
    │   │   └── paymentService.js   # BayarIn invoice, polling, riwayat transaksi
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
    ├── cypress.config.js           # Cypress E2E test config
    ├── cypress.env.json.example    # Template credentials test
    ├── cypress/
    │   ├── support/
    │   │   ├── e2e.js              # Global setup
    │   │   └── commands.js         # Custom commands: loginViaApi, logout, getAccessToken
    │   ├── e2e/                    # 7 spec files, 50 tests
    │   └── SMOKE_TEST_REPORT.md    # Laporan hasil test
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

### Payment (BayarIn)

| Method | Endpoint                          | Auth      | Deskripsi                              |
|--------|-----------------------------------|-----------|----------------------------------------|
| POST   | `/api/payment/create-invoice/`    | ✅ Bearer  | Buat invoice di BayarIn                |
| GET    | `/api/payment/check-invoice/`     | ✅ Bearer  | Cek status invoice (polling)           |
| POST   | `/api/payment/webhook/`           | ❌ Public  | Terima webhook BayarIn (HMAC verified) |
| POST   | `/api/payment/submit-proof/`      | ✅ Bearer  | Upload bukti bayar manual (fallback)   |
| GET    | `/api/payment/my-proofs/`         | ✅ Bearer  | Riwayat transaksi user                 |

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

### PaymentProof & Subscription *(Payment app)*
- **PaymentProof**: order_id (BayarIn invoice ID), plan, amount, status, proof_image (optional)
- **Subscription**: user (OneToOne), plan (`free`|`pro`|`team`), start_date, end_date, is_active, features (JSON)
- **Payment Flow**:
  ```
  User klik "Bayar" → POST /api/payment/create-invoice/
    → BayarIn buat invoice → redirect ke halaman bayar BayarIn
    → User bayar → BayarIn POST /api/payment/webhook/ (HMAC-SHA256)
    → Subscription aktif otomatis → frontend polling deteksi → redirect dashboard
  ```

---

## 🛡️ Fitur Keamanan

| Fitur | Implementasi |
|-------|-------------|
| Password hashing | BCrypt SHA256 (`BCryptSHA256PasswordHasher`) |
| JWT Authentication | `djangorestframework-simplejwt` |
| Token blacklist saat logout | `rest_framework_simplejwt.token_blacklist` |
| Auto token refresh | Axios interceptor di frontend |
| CORS | `django-cors-headers` + `.env` validation |
| Input validation | DRF Serializers + Django password validators |
| Data isolation | Semua queryset difilter berdasarkan `request.user` |
| Role-based access | `IsRole` permission class + `RoleRoute` di frontend |
| Production Middlewares | `SECURE_SSL_REDIRECT`, `SECURE_BROWSER_XSS_FILTER`, `SESSION_COOKIE_SECURE`, `SECURE_CONTENT_TYPE_NOSNIFF` |

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
| FR-15 | Email Verification                           | ✅ Done
| FR-16 | OAuth Google Login                           | ✅ Done    |
| FR-17 | Payment Gateway (BayarIn) & Subscription     | ✅ Done    |
| FR-18 | Automated E2E Smoke Tests (Cypress)          | ✅ Done    |

---

## 🔐 Google OAuth Setup

Google OAuth sudah production-ready. Untuk menjalankan di lokal:

### 1. Buat OAuth Client di Google Cloud Console

1. Buka [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
2. Buat project baru → **APIs & Services** → **OAuth consent screen** → External → isi nama app
3. **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID** → Web application
4. Isi **Authorized JavaScript origins**:
   ```
   http://localhost:5173
   http://localhost:5174
   ```
5. Isi **Authorized redirect URIs**:
   ```
   http://localhost:8000/api/auth/google/callback/
   ```
6. Copy **Client ID** dan **Client Secret**

### 2. Isi ke `.env`

**Backend** (`backend/.env`):
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

**Frontend** (`frontend/.env`):
```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### Catatan
- Tidak butuh kartu kredit — Google OAuth gratis
- `clock_skew_in_seconds=120` sudah dikonfigurasi untuk toleransi perbedaan jam server
- Mode mock (`mock-google-token-{email}`) tetap tersedia untuk testing tanpa credentials asli

---


---

## 🧪 Automated Browser Smoke Tests (Cypress)

EduTask dilengkapi dengan **50 automated E2E smoke tests** menggunakan Cypress 13.

### Hasil Terakhir

```
✅ 01_auth_login.cy.js       8/8   pass
✅ 02_auth_register.cy.js    8/8   pass
✅ 03_dashboard.cy.js        7/7   pass
✅ 04_tasks_kanban.cy.js     9/9   pass
✅ 05_schedule.cy.js         6/6   pass
✅ 06_profile.cy.js          4/4   pass
✅ 07_navigation.cy.js       8/8   pass
─────────────────────────────────────
   All specs passed!        50/50  (~52 detik)
```

### Cakupan Test

| Spec | Yang Diuji |
|---|---|
| `01_auth_login` | Form render, validasi, toggle password, login sukses/gagal, route dosen |
| `02_auth_register` | Form 3 role, enforcement syarat & ketentuan, validasi email PENS |
| `03_dashboard` | Protected route, tab Overview/Ruang/Inbox/Report |
| `04_tasks_kanban` | Kanban board, modal tambah task, pembuatan task via API |
| `05_schedule` | Kalender bulanan, navigasi bulan, tombol role-aware |
| `06_profile` | Protected route, tampil email, section ubah password |
| `07_navigation` | Landing page, 404 redirect, guest route guard, navigasi sidebar |

### Cara Menjalankan

```bash
# Pastikan backend (port 8000) dan frontend (port 5174) sudah berjalan

cd frontend

# Mode interaktif — buka Cypress UI
npm run cy:open

# Mode headless — semua spec sekaligus
npm run cy:run
```

Salin `cypress.env.json.example` → `cypress.env.json` dan isi dengan credentials akun test.  
Lihat [`cypress/SMOKE_TEST_REPORT.md`](frontend/cypress/SMOKE_TEST_REPORT.md) untuk laporan lengkap.

---

## 🐛 Bug Fixes (Sprint 6 — Local)

| Bug | Root Cause | Fix |
|---|---|---|
| "Gagal menambahkan task cepat" di Kanban quick add | `onQuickAdd` tidak mengirim field `deadline` yang wajib diisi backend | Tambah `deadline: today` (ISO date hari ini) ke payload quick add di `TaskManagementPage.jsx` |
| Google OAuth 500 Internal Server Error | `error_response()` dipanggil dengan keyword argument `code` yang tidak valid | Ganti `code=` menjadi `status_code=` di `google_views.py` |
| Google OAuth 401 "Token used too early" | Clock komputer maju ~1 menit dari Google server (clock skew) | Tambah `clock_skew_in_seconds=120` ke `id_token.verify_oauth2_token()` |
| `settings.py` membaca `GOOGLE_OAUTH_CLIENT_ID` tapi `.env` pakai `GOOGLE_CLIENT_ID` | Nama env variable tidak konsisten | Seragamkan ke `GOOGLE_CLIENT_ID` di `settings.py` dan `google_views.py` |
| Group Chat member spam | Tidak ada limit jumlah anggota dalam pembuatan chat | Tambah limit maksimum 50 orang per `ChatThread` di backend |
| Fitur Hapus Chat Pihak Tunggal | Kebutuhan untuk membersihkan *inbox* secara lokal tanpa menghapus untuk orang lain | Implementasi model `ThreadClearHistory` untuk *filter* mandiri berdasarkan `cleared_at` |
| Keamanan Server Pra-Deploy | Server kurang tangguh untuk dipublish ke public cloud | Tambah SSL, XSS, dan CSRF Cookie secure configs berbasis `.env` di `settings.py` |


## 🚀 Roadmap Berikutnya

- Email verification full flow (frontend integration) ✅
- Real Google OAuth production setup ✅
- Automated browser smoke tests (Cypress/Playwright) ✅
- Push/email reminders ✅
- Drag-and-drop calendar events ✅
