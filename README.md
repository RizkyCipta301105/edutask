# EduTask

> Aplikasi Web Manajemen Tugas & Jadwal Akademik  
> Tim Sumber Rejeki | Teknologi Rekayasa Internet | PENS 2026

---

## Deskripsi

EduTask adalah platform manajemen tugas akademik berbasis web yang dirancang untuk mahasiswa, dosen, dan pengguna umum. Aplikasi ini menyediakan Kanban board, kalender jadwal, ruang kolaborasi, sistem notifikasi, inbox chat, dan payment gateway terintegrasi untuk fitur premium.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Backend | Django 5 + Django REST Framework |
| Auth | JWT (SimpleJWT) + Google OAuth 2.0 |
| Database | PostgreSQL |
| Frontend | React 18 + Vite + TailwindCSS |
| Animasi | Framer Motion |
| Chart | Recharts |
| Payment | KlikQRIS (QRIS Dinamis) |
| Scheduler | APScheduler + django-apscheduler |
| Testing | Cypress 13 (E2E) + Django TestCase |

---

## Quick Start

```bash
# Terminal 1 — Backend
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux
pip install -r requirements.txt
cp .env.example .env         # isi konfigurasi
python manage.py migrate
python manage.py runserver
# → http://localhost:8000

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## Struktur Proyek

```
edutask/
├── backend/
│   ├── apps/
│   │   ├── authentication/     # User, Kelas, RuangEdukasi, VerificationToken
│   │   ├── tasks/              # Task, MataKuliah, PenugasanDosen, Notification
│   │   ├── schedules/          # JadwalKuliah
│   │   ├── inbox/              # ChatThread, Message
│   │   ├── payment/            # Subscription, PaymentProof (KlikQRIS)
│   │   └── common/             # utils, permissions, serializers
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── pages/              # LoginPage, RegisterPage, DashboardPage, dll.
    │   ├── components/         # dashboard/, tasks/, kanban/, common/, landing/
    │   ├── services/           # api.js, authService, taskService, paymentService, dll.
    │   ├── context/            # AuthContext
    │   ├── hooks/              # useTasks, useSubscription
    │   └── utils/              # authHelpers, taskHelpers, apiErrors
    ├── cypress/
    │   ├── e2e/                # 7 spec files, 50 tests
    │   └── support/            # commands.js, e2e.js
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

---

## Setup Backend

### 1. Virtual environment & dependencies

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS / Linux
pip install -r requirements.txt
```

### 2. Buat database PostgreSQL

```sql
CREATE DATABASE edutask_db;
CREATE USER edutask_user WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE edutask_db TO edutask_user;
```

### 3. Konfigurasi `.env`

```bash
cp .env.example .env
```

Isi `.env`:

```env
SECRET_KEY=ganti-dengan-secret-key-panjang
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=edutask_db
DB_USER=edutask_user
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

KLIKQRIS_API_KEY=your-klikqris-api-key
KLIKQRIS_MERCHANT=your-merchant-id

EDUTASK_FRONTEND_URL=http://localhost:5173
```

### 4. Migrasi & superuser

```bash
python manage.py migrate
python manage.py createsuperuser
```

### 5. Jalankan server

```bash
python manage.py runserver
# → http://localhost:8000
```

---

## Setup Frontend

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Konfigurasi `.env`

```bash
cp .env.example .env
```

Isi `.env`:

```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 3. Jalankan dev server

```bash
npm run dev
# → http://localhost:5173
```

---

## API Endpoints

Base URL: `http://localhost:8000`

### Authentication

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/api/auth/register/mahasiswa/` | ❌ | Registrasi mahasiswa |
| POST | `/api/auth/register/dosen/` | ❌ | Registrasi dosen |
| POST | `/api/auth/register/umum/` | ❌ | Registrasi umum |
| POST | `/api/auth/login/` | ❌ | Login, mendapatkan JWT |
| POST | `/api/auth/logout/` | ✅ | Logout, blacklist refresh token |
| POST | `/api/auth/token/refresh/` | ❌ | Perbarui access token |
| GET/PATCH | `/api/auth/profile/` | ✅ | Ambil / update profil |
| POST | `/api/auth/change-password/` | ✅ | Ganti password |
| POST | `/api/auth/google/` | ❌ | Login via Google OAuth |
| POST | `/api/auth/send-verification-email/` | ✅ | Kirim email verifikasi |
| POST | `/api/auth/verify-email/` | ❌ | Verifikasi email |
| POST | `/api/auth/forgot-password/` | ❌ | Kirim link reset password |
| POST | `/api/auth/reset-password/` | ❌ | Konfirmasi reset password |
| GET | `/api/auth/kelas/` | ❌ | List kelas |
| GET/POST | `/api/auth/ruang/` | ✅ | List / buat Ruang Edukasi |
| DELETE | `/api/auth/ruang/<id>/` | ✅ | Hapus Ruang Edukasi |
| GET | `/api/auth/ruang/<id>/members/` | ✅ | List anggota ruang |
| POST | `/api/auth/ruang/join/` | ✅ | Gabung via kode join |

### Tasks

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET/POST | `/api/tasks/` | ✅ | List / tambah task |
| GET/PUT/DELETE | `/api/tasks/<id>/` | ✅ | Detail / edit / hapus task |
| GET | `/api/tasks/kanban/` | ✅ | Data board Kanban per status |
| PATCH | `/api/tasks/<id>/move/` | ✅ | Pindah task antar kolom |
| GET/POST | `/api/tasks/mata-kuliah/` | ✅ | List / tambah mata kuliah |
| PUT/DELETE | `/api/tasks/mata-kuliah/<id>/` | ✅ | Edit / hapus mata kuliah |
| GET/POST | `/api/tasks/<id>/comments/` | ✅ | Komentar task |
| GET/POST | `/api/tasks/penugasan/` | ✅ | List / broadcast tugas (Dosen) |
| GET | `/api/tasks/penugasan/report/` | ✅ | Rekap progress mahasiswa |
| GET | `/api/tasks/penugasan/export/` | ✅ | Export CSV progress |
| GET | `/api/tasks/notifications/` | ✅ | List notifikasi |
| PATCH | `/api/tasks/notifications/read/` | ✅ | Mark semua notifikasi terbaca |

### Inbox

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET/POST | `/api/inbox/threads/` | ✅ | List / buat thread chat |
| GET | `/api/inbox/threads/<id>/` | ✅ | Detail thread |
| GET/POST | `/api/inbox/threads/<id>/messages/` | ✅ | List / kirim pesan |

### Payment

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/payment/subscription/` | ✅ | Data subscription aktif |
| POST | `/api/payment/create-invoice/` | ✅ | Buat transaksi QRIS (KlikQRIS) |
| GET | `/api/payment/check-invoice/` | ✅ | Cek status transaksi |
| POST | `/api/payment/webhook/` | ❌ | Webhook KlikQRIS (signature verified) |
| POST | `/api/payment/submit-proof/` | ✅ | Upload bukti bayar manual (fallback) |
| GET | `/api/payment/proofs/` | ✅ | Riwayat transaksi user |

---

## Data Models

### User
- UUID primary key
- Role: `mahasiswa` | `dosen` | `umum`
- TipeAkun: `gmail` | `pens` | `umum`
- Fields: email, nama_lengkap, foto_profil, prodi, kelas, is_email_verified

### RuangEdukasi
- Fields: nama_ruang, deskripsi, kode_join (auto-generated), is_workspace
- Schedule: hari, jam_mulai, jam_selesai, ruangan, warna
- Relations: kreator (FK User), anggota (M2M User)

### Task
- Fields: judul, deskripsi, deadline, prioritas, status, attachment, urutan
- Status: `todo` | `in_progress` | `done`
- Relations: user, mata_kuliah (opsional), source_assignment (opsional)

### PenugasanDosen
- Dibuat oleh Dosen, di-broadcast ke RuangEdukasi (M2M)
- Auto-create Task untuk setiap Mahasiswa di ruang yang dituju

### ChatThread / Message
- ChatThread: mendukung 1:1 dan group chat, participants (M2M)
- Message: text, attachment, reactions (JSON), is_read, is_edited

### Subscription / PaymentProof
- Subscription: OneToOne ke User, plan (`free`|`pro`|`team`), start_date, end_date
- PaymentProof: order_id, plan, amount, status, proof_image (opsional)

---

## Fitur & Subscription Plan

| Fitur | Free | Pro | Team |
|-------|------|-----|------|
| Kanban board pribadi | ✅ | ✅ | ✅ |
| Kalender & jadwal | ✅ | ✅ | ✅ |
| Notifikasi in-app | ✅ | ✅ | ✅ |
| Ruang Edukasi (mahasiswa & dosen) | ✅ | ✅ | ✅ |
| Workspace Proyek | 1 (maks. 3 anggota) | 5 (maks. 7 anggota) | Unlimited (maks. 30) |
| Inbox & chat kolaborasi | ❌ | ✅ | ✅ |
| Broadcast tugas (Dosen) | ❌ | ✅ | ✅ |
| Laporan & analitik | ❌ | ✅ | ✅ |
| Export laporan CSV | ❌ | ❌ | ✅ |
| Harga / bulan | Rp 0 | Rp 4.999 | Rp 9.999 |

---

## Keamanan

| Fitur | Implementasi |
|-------|-------------|
| Password hashing | `BCryptSHA256PasswordHasher` |
| JWT Authentication | `djangorestframework-simplejwt` |
| Token blacklist saat logout | `rest_framework_simplejwt.token_blacklist` |
| Auto token refresh | Axios interceptor di frontend |
| Rate limiting | `LoginRateThrottle`, `RegisterRateThrottle`, dll. |
| CORS | `django-cors-headers` + validasi `.env` |
| Input validation | DRF Serializers + Django password validators |
| Data isolation | Queryset difilter per `request.user` |
| Role-based access | `IsRole` permission class + `RoleRoute` di frontend |

---

## Google OAuth Setup

1. Buka [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
2. Buat OAuth 2.0 Client ID → Web application
3. Isi **Authorized JavaScript origins**: `http://localhost:5173`
4. Isi **Authorized redirect URIs**: `http://localhost:8000/api/auth/google/callback/`
5. Copy Client ID & Secret → isi di `.env` backend dan frontend

---

## Automated Tests

### E2E — Cypress

```
✅ 01_auth_login.cy.js        8/8  pass
✅ 02_auth_register.cy.js     8/8  pass
✅ 03_dashboard.cy.js         7/7  pass
✅ 04_tasks_kanban.cy.js      9/9  pass
✅ 05_schedule.cy.js          6/6  pass
✅ 06_profile.cy.js           4/4  pass
✅ 07_navigation.cy.js        8/8  pass
─────────────────────────────────────
   All specs passed!         50/50  (~52 detik)
```

Menjalankan Cypress:

```bash
# Pastikan backend (8000) dan frontend (5173) sudah running

cd frontend

# Mode interaktif
npm run cy:open

# Mode headless
npm run cy:run
```

Salin `cypress.env.json.example` → `cypress.env.json` dan isi dengan credentials akun test.

### Unit & Integration — Django

```bash
cd backend
python manage.py test apps
```

---

## Functional Requirements

| Kode | Fitur | Status |
|------|-------|--------|
| FR-01 | Registrasi Akun Multi-Role | ✅ |
| FR-02 | Login & Logout dengan JWT | ✅ |
| FR-03 | Manajemen Profil Pengguna | ✅ |
| FR-04 | Pembuatan Task Pribadi & Broadcast | ✅ |
| FR-05 | Ruang Edukasi & Join Code | ✅ |
| FR-06 | Jadwal Kuliah Terintegrasi Ruang Edukasi | ✅ |
| FR-07 | Kanban Board Visual | ✅ |
| FR-08 | Visualisasi Analitik (Recharts) | ✅ |
| FR-09 | Kalender Interaktif | ✅ |
| FR-10 | Sistem Pengingat Otomatis (H-3, H-1, Overdue) | ✅ |
| FR-11 | Progress Tracker Mahasiswa (Dosen Dashboard) | ✅ |
| FR-12 | Inbox Kolaborasi (Chat) | ✅ |
| FR-13 | Export Laporan Dosen (CSV) | ✅ |
| FR-14 | Notifikasi In-App | ✅ |
| FR-15 | Email Verification | ✅ |
| FR-16 | OAuth Google Login | ✅ |
| FR-17 | Payment Gateway (KlikQRIS) & Subscription | ✅ |
| FR-18 | Automated E2E Smoke Tests (Cypress) | ✅ |

---

## Tim

**Sumber Rejeki** — Teknologi Rekayasa Internet, PENS 2026
