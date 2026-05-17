# EduTask – Sprint 2 Stabilization

> Aplikasi Web Manajemen Tugas & Jadwal Kuliah  
> Tim Sumber Rejeki | Teknologi Rekayasa Internet | PENS 2026

---

## 📁 Struktur Proyek

```
edutask/
├── backend/                  # Django REST Framework
│   ├── apps/
│   │   └── authentication/   # App autentikasi
│   │       ├── models.py     # Custom User model
│   │       ├── serializers.py
│   │       ├── views.py
│   │       ├── urls.py
│   │       └── admin.py
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/                 # React + Vite + Tailwind
    ├── src/
    │   ├── components/
    │   │   ├── auth/         # AuthLayout, LoginForm, RegisterForm
    │   │   └── common/       # InputField, ProtectedRoute, GuestRoute
    │   ├── context/          # AuthContext (global state)
    │   ├── hooks/            # useForm (custom hook)
    │   ├── pages/            # LoginPage, RegisterPage, Dashboard, Profile
    │   ├── services/         # api.js (axios+JWT), authService.js
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

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Buat database PostgreSQL

```sql
-- Jalankan di psql atau pgAdmin
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

| Method | Endpoint                    | Auth      | Deskripsi                        |
|--------|-----------------------------|-----------|----------------------------------|
| POST   | `/api/auth/register/`       | ❌ Public  | Registrasi akun baru             |
| POST   | `/api/auth/login/`          | ❌ Public  | Login, mendapatkan JWT token     |
| POST   | `/api/auth/logout/`         | ✅ Bearer  | Logout, blacklist refresh token  |
| POST   | `/api/auth/token/refresh/`  | ❌ Public  | Perbarui access token            |
| GET    | `/api/auth/profile/`        | ✅ Bearer  | Ambil profil user                |
| PATCH  | `/api/auth/profile/`        | ✅ Bearer  | Update profil user               |
| POST   | `/api/auth/change-password/`| ✅ Bearer  | Ganti password                   |
| GET    | `/api/tasks/`               | ✅ Bearer  | List task + filter/search        |
| POST   | `/api/tasks/`               | ✅ Bearer  | Tambah task                      |
| PUT    | `/api/tasks/{id}/`          | ✅ Bearer  | Edit task                        |
| DELETE | `/api/tasks/{id}/`          | ✅ Bearer  | Hapus task                       |
| GET    | `/api/tasks/kanban/`        | ✅ Bearer  | Data board per status            |
| GET    | `/api/tasks/mata-kuliah/`   | ✅ Bearer  | List mata kuliah                 |
| POST   | `/api/tasks/mata-kuliah/`   | ✅ Bearer  | Tambah mata kuliah               |
| GET    | `/api/schedules/`           | ✅ Bearer  | List jadwal kuliah mingguan      |
| POST   | `/api/schedules/`           | ✅ Bearer  | Tambah jadwal kuliah             |
| PUT    | `/api/schedules/{id}/`      | ✅ Bearer  | Edit jadwal kuliah               |
| DELETE | `/api/schedules/{id}/`      | ✅ Bearer  | Hapus jadwal kuliah              |

---

## ✅ Sprint 2 Stabilization Summary

Sprint 2 focused on stabilizing existing behavior instead of adding major features.

Completed:
- Centralized serializer validation mixins for auth, tasks, and schedules
- Standardized API response envelopes and validation error responses
- Improved JWT claim consistency and role-based route protection
- Added essential backend tests for auth, permissions, tasks, schedules, ownership, and validation
- Improved frontend responsive behavior for auth, dashboard, profile, task, schedule, and navigation surfaces
- Refactored frontend service helpers for response extraction and query parameters

Verification:
- Frontend production build: `npm run build`
- Backend automated suite: `./venv/bin/python manage.py test apps.authentication.tests apps.tasks.tests apps.schedules.tests --settings=config.settings_test`

### Contoh Request: Register

```json
POST /api/auth/register/
{
  "nama_lengkap": "Muhammad Rizky Cipta Saputra",
  "email": "rizky@example.com",
  "tipe_akun": "umum",
  "password": "Password123!",
  "password_confirm": "Password123!"
}
```

### Contoh Response: Register (201)

```json
{
  "success": true,
  "message": "Registrasi berhasil! Selamat datang di EduTask.",
  "data": {
    "user": {
      "id": "uuid-...",
      "email": "rizky@example.com",
      "nama_lengkap": "Muhammad Rizky Cipta Saputra",
      "tipe_akun": "umum",
      "is_email_verified": false,
      "tanggal_daftar": "2026-04-25T10:00:00Z"
    },
    "tokens": {
      "access": "eyJ...",
      "refresh": "eyJ..."
    }
  }
}
```

### Contoh Request: Login

```json
POST /api/auth/login/
{
  "email": "rizky@example.com",
  "password": "Password123!"
}
```

### Contoh Request: Logout

```json
POST /api/auth/logout/
Authorization: Bearer eyJ...

{
  "refresh": "eyJ..."
}
```

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

---

## 🗂️ FR yang Diimplementasikan (Sprint 1)

| Kode | Fitur | Status |
|------|-------|--------|
| FR-01 | Registrasi Akun (email/Gmail/PENS) | ✅ Done |
| FR-02 | Login & Logout dengan JWT | ✅ Done |
| FR-03 | Manajemen Profil Pengguna | ✅ Done |

---

## 🚀 Sprint Berikutnya

- FR-04 – FR-07: Pembuatan Task + Kanban Board
- FR-08: Progress Tracker per Mata Kuliah  
- FR-09: Kalender Interaktif
- FR-10: Manajemen Jadwal Kuliah
- FR-11: Custom Reminder Email (SMTP)
