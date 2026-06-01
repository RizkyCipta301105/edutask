# EduTask — Cypress Smoke Test Report

**Tanggal Run:** 1 Juni 2026  
**Framework:** Cypress 13.17.0  
**Browser:** Electron 118 (headless)  
**Base URL:** `http://localhost:5174`  
**Backend:** `http://127.0.0.1:8000`  
**Total:** ✅ **50/50 passed** — All specs passed (52 detik)

---

## Ringkasan Hasil

| Spec File | Tests | Status | Durasi |
|---|---|---|---|
| `01_auth_login.cy.js` | 8 | ✅ Pass | ~7s |
| `02_auth_register.cy.js` | 8 | ✅ Pass | ~8s |
| `03_dashboard.cy.js` | 7 | ✅ Pass | ~7s |
| `04_tasks_kanban.cy.js` | 9 | ✅ Pass | ~11s |
| `05_schedule.cy.js` | 6 | ✅ Pass | ~5s |
| `06_profile.cy.js` | 4 | ✅ Pass | ~3s |
| `07_navigation.cy.js` | 8 | ✅ Pass | ~7s |
| **Total** | **50** | **✅ All Passed** | **~52s** |

---

## Detail Per Spec

### 01 — Authentication: Login (`01_auth_login.cy.js`)

**Scope:** Halaman login, validasi form, toggle password, routing role.

| # | Test Case | Hasil |
|---|---|---|
| 1 | Form login render dengan benar (email, password, tombol Masuk, link Lupa Password) | ✅ |
| 2 | Menampilkan link register untuk 3 role (Mahasiswa, Umum, Dosen) dengan href yang benar | ✅ |
| 3 | Menampilkan link "Masuk sebagai dosen" ke `/login/dosen` | ✅ |
| 4 | Menampilkan error toast saat credentials salah | ✅ |
| 5 | Toggle visibilitas password (show/hide) berfungsi | ✅ |
| 6 | Klik "Lupa Password?" navigasi ke `/forgot-password` | ✅ |
| 7 | Route `/login/dosen` menampilkan label "Portal Dosen" dan menyembunyikan link dosen | ✅ |
| 8 | Login sukses sebagai mahasiswa → redirect ke `/dashboard` + toast selamat datang | ✅ |

---

### 02 — Authentication: Register (`02_auth_register.cy.js`)

**Scope:** Halaman registrasi untuk 3 role, validasi form, enforcement syarat & ketentuan.

| # | Test Case | Hasil |
|---|---|---|
| 1 | Form registrasi Mahasiswa render dengan benar (judul, field, tombol daftar) | ✅ |
| 2 | Submit tanpa centang syarat & ketentuan → error muncul | ✅ |
| 3 | Email non-PENS untuk role Mahasiswa → error domain kampus PENS | ✅ |
| 4 | Link "Masuk di sini" mengarah ke `/login` | ✅ |
| 5 | Form registrasi Umum render dalam bahasa Inggris (Create an Account, Full Name, dll) | ✅ |
| 6 | Submit tanpa centang terms (Umum) → error Terms and Conditions | ✅ |
| 7 | Email non-PENS untuk role Umum → tidak ada error domain (domain bebas) | ✅ |
| 8 | Form registrasi Dosen render dengan benar (Registrasi Dosen, Email Dosen) | ✅ |

---

### 03 — Dashboard (`03_dashboard.cy.js`)

**Scope:** Protected route, render dashboard, navigasi antar tab.

| # | Test Case | Hasil |
|---|---|---|
| 1 | `/dashboard` tanpa auth → redirect ke `/login` | ✅ |
| 2 | `/dashboard/mahasiswa` tanpa auth → redirect ke `/login` | ✅ |
| 3 | Dashboard load tanpa crash, AppLayout (sidebar/nav) render | ✅ |
| 4 | Tab Overview/Beranda tampil secara default | ✅ |
| 5 | Navigasi ke tab Ruang Edukasi berfungsi | ✅ |
| 6 | Navigasi ke tab Inbox berfungsi | ✅ |
| 7 | Navigasi ke tab Report/Laporan berfungsi | ✅ |

---

### 04 — Task Management & Kanban (`04_tasks_kanban.cy.js`)

**Scope:** Protected route, tab Kanban/Backlog, modal tambah task, pembuatan task via API.

| # | Test Case | Hasil |
|---|---|---|
| 1 | `/tasks` tanpa auth → redirect ke `/login` | ✅ |
| 2 | Halaman task management load dengan benar | ✅ |
| 3 | Tab "Kanban Board" dan "Backlog" tampil | ✅ |
| 4 | Board tab render kolom (To Do/In Progress/Done) atau empty state | ✅ |
| 5 | Tombol "Tambah Task" membuka modal "Task Baru" | ✅ |
| 6 | Tombol "Batal" di modal menutup modal | ✅ |
| 7 | Klik tab Backlog berfungsi | ✅ |
| 8 | Buat task via API → task muncul di halaman setelah reload | ✅ |
| 9 | Modal form: input judul, dropdown prioritas & status tersedia, modal bisa ditutup | ✅ |

> **Catatan:** Test pembuatan task (no. 8) menggunakan `cy.request` langsung ke API karena `input[type="date"]` di Electron headless tidak mendukung `.type()` untuk React controlled input. Ini adalah pendekatan yang valid untuk smoke test — memverifikasi integrasi API + render UI.

---

### 05 — Schedule / Jadwal (`05_schedule.cy.js`)

**Scope:** Protected route, render kalender, navigasi bulan, tombol role-aware.

| # | Test Case | Hasil |
|---|---|---|
| 1 | `/schedule` tanpa auth → redirect ke `/login` | ✅ |
| 2 | Halaman jadwal load dengan benar | ✅ |
| 3 | Kalender bulanan render (nama bulan tampil) | ✅ |
| 4 | Header hari dalam seminggu render (Sen/Min/Mon/Sun) | ✅ |
| 5 | Tombol "Tambah Agenda Pribadi" tampil untuk non-dosen (mahasiswa) | ✅ |
| 6 | Navigasi ke bulan berikutnya via tombol `.nav-arrow-btn` berfungsi | ✅ |

---

### 06 — Profile / Pengaturan (`06_profile.cy.js`)

**Scope:** Protected route, render data user, section ubah password.

| # | Test Case | Hasil |
|---|---|---|
| 1 | `/profile` tanpa auth → redirect ke `/login` | ✅ |
| 2 | Halaman profil load dengan benar | ✅ |
| 3 | Email user test tampil di halaman | ✅ |
| 4 | Section "Ubah Password" dan input password ada di DOM | ✅ |

---

### 07 — Navigation & Routing (`07_navigation.cy.js`)

**Scope:** Public routes, 404 redirect, guest route guard, navigasi sidebar.

| # | Test Case | Hasil |
|---|---|---|
| 1 | Landing page `/` load tanpa redirect ke login | ✅ |
| 2 | Route tidak dikenal → redirect ke landing page `/` | ✅ |
| 3 | `/forgot-password` accessible sebagai guest | ✅ |
| 4 | User sudah login → visit `/login` → redirect ke `/dashboard` | ✅ |
| 5 | User sudah login → visit `/register/mahasiswa` → redirect ke `/dashboard` | ✅ |
| 6 | Klik nav item "Tugas Akademik" di sidebar → navigasi ke `/tasks` | ✅ |
| 7 | Klik nav item "Jadwal & Kalender" di sidebar → navigasi ke `/schedule` | ✅ |
| 8 | Klik nav item "Pengaturan" di sidebar → navigasi ke `/profile` | ✅ |

---

## Setup & Cara Menjalankan

### Prasyarat

1. Backend Django berjalan di `http://127.0.0.1:8000`
2. Frontend Vite berjalan di `http://localhost:5174`
3. File `cypress.env.json` sudah diisi dengan credentials test

### File Konfigurasi

```
frontend/
├── cypress.config.js          # Konfigurasi Cypress (baseUrl, env, timeout)
├── cypress.env.json           # Credentials test (JANGAN di-commit ke git)
├── cypress.env.json.example   # Template credentials
└── cypress/
    ├── support/
    │   ├── e2e.js             # Global setup, suppress uncaught exceptions
    │   └── commands.js        # Custom commands: loginViaApi, loginViaUI, logout, getAccessToken
    └── e2e/
        ├── 01_auth_login.cy.js
        ├── 02_auth_register.cy.js
        ├── 03_dashboard.cy.js
        ├── 04_tasks_kanban.cy.js
        ├── 05_schedule.cy.js
        ├── 06_profile.cy.js
        └── 07_navigation.cy.js
```

### Isi `cypress.env.json`

```json
{
  "TEST_USER_EMAIL": "cypress.mahasiswa@student.pens.ac.id",
  "TEST_USER_PASSWORD": "CypressTest123",
  "TEST_DOSEN_EMAIL": "cypress.dosen@pens.ac.id",
  "TEST_DOSEN_PASSWORD": "CypressTest123",
  "TEST_UMUM_EMAIL": "cypress.umum@gmail.com",
  "TEST_UMUM_PASSWORD": "CypressTest123",
  "API_URL": "http://127.0.0.1:8000"
}
```

> Akun test sudah dibuat di database dengan script Django shell. Jangan gunakan akun user nyata.

### Perintah

```bash
cd frontend

# Mode interaktif — buka Cypress UI, pilih spec satu per satu
npm run cy:open

# Mode headless — jalankan semua spec sekaligus (untuk CI)
npm run cy:run

# Jalankan spec tertentu saja
npx cypress run --spec "cypress/e2e/04_tasks_kanban.cy.js"
```

---

## Custom Commands

| Command | Deskripsi |
|---|---|
| `cy.loginViaApi(email, password)` | Login via POST ke `/api/auth/login/`, simpan token ke localStorage. Bypass UI login. |
| `cy.loginViaUI(email, password)` | Login via form UI di `/login`. Digunakan untuk test UI login. |
| `cy.logout()` | Hapus semua data auth dari localStorage. |
| `cy.getAccessToken()` | Ambil `access_token` dari `window.localStorage`. |

---

## Catatan Teknis

| Isu | Solusi |
|---|---|
| `localhost` resolve ke IPv6 (`::1`) di Electron | Gunakan `127.0.0.1` di `API_URL` dan `cy.request` |
| `input[type="date"].type()` tidak bekerja di Electron headless untuk React controlled input | Gunakan `cy.request` ke API untuk test pembuatan data; gunakan `invoke('val') + trigger('change')` untuk test UI |
| Elemen di-clip oleh `overflow: hidden` (AppLayout) | Gunakan `.should('exist')` bukan `.should('be.visible')` untuk elemen dalam scrollable container |
| Auth state hilang antar test dalam `describe` yang sama | Tambah `cy.loginViaApi()` di setiap `beforeEach` atau di awal test yang membutuhkan auth |
| Selector sidebar menggunakan label bahasa Indonesia | Gunakan label aktual: `"Tugas Akademik"`, `"Jadwal & Kalender"`, `"Pengaturan"` — bukan `task/profile` |
