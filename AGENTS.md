# EduTask AGENTS

## Project Overview

EduTask is a fullstack academic task management web application for multi-role users (Mahasiswa, Dosen, Umum).

Architecture:
- Backend: Django + DRF + JWT + PostgreSQL
- Frontend: React + Vite + TailwindCSS

Main modules:
- Authentication (multi-role: Mahasiswa, Dosen, Umum)
- Tasks & Kanban board
- Ruang Edukasi (integrated class scheduling)
- Schedules & Calendar
- Inbox (real-time collaborative chat)
- Notifications
- Reports & Analytics

---

## Development Rules

- Analyze repository structure before coding
- Preserve current architecture
- Avoid unnecessary rewrites
- Make minimal safe changes
- Reuse existing services and components

---

## Backend Rules

- Keep business logic outside views when possible
- Use serializers for validation
- Maintain DRF response consistency (`success_response`, `validation_error_response`)
- Preserve JWT authentication flow
- Validate all request data
- Use `apps/common/utils.py` helpers for API responses

---

## Frontend Rules

- Keep components reusable
- Avoid duplicated logic
- Use existing API service modules (`taskService`, `authService`, `inboxService`, `scheduleService`)
- Preserve routing structure in `App.jsx`
- Maintain responsive design (desktop sidebar + mobile horizontal nav)
- Use TailwindCSS for styling

---

## Security Rules

- Never hardcode secrets
- Validate user input
- Avoid insecure JWT handling
- Preserve authentication protections
- Queryset must be filtered by `request.user` to prevent data leakage

---

## Testing Rules

Before completing tasks:
- Check frontend console errors
- Verify backend endpoints
- Verify JWT flow
- Check Kanban functionality
- Check API integration
- Run `npm run build` to confirm no build errors
- Run backend tests: `./venv/bin/python manage.py test`

---

## Important Context

### Current Sprint Status
- **Sprint 1**: ✅ Completed — Core Auth, Task CRUD, Kanban, Schedules
- **Sprint 2**: ✅ Completed — Validation, API Standardization, Testing, Responsive UI
- **Sprint 3**: ✅ Completed — Multi-role Dashboard, Ruang Edukasi, Task Broadcast, Analytics
- **Sprint 4**: ✅ Completed — Interactive Calendar, Reminder System, Notifications, Progress Tracker
- **Sprint 5**: ✅ Completed — Inbox Kolaborasi (ChatThread + Message), Dosen Export, UI/UX Polish
- **Sprint 6**: 🔄 In Progress — Integration refinements, Google OAuth & SMTP Email implemented, UI translation (Indonesian), Logout redirect fix, UX improvements, documentation

### Key Architecture Decisions (Sprint 5-6)
- **Ruang Edukasi → Jadwal Kuliah integration**: `GET /api/tasks/mata-kuliah/` now merges personal `MataKuliah` records with schedule data from joined/created `RuangEdukasi`. The `is_academic: True` flag marks official class schedules from Ruang Edukasi. Students no longer need to manually enter class schedules — they inherit them from the rooms they join.
- **Calendar rendering**: `CalendarView.jsx` renders class schedules from `RuangEdukasi.created_at` onward — schedules only appear from the date the room was first created, not retroactively.
- **Schedule page**: "Tambah Jadwal Kuliah" button removed for Dosen (managed via Ruang Edukasi). Non-dosen users see "Tambah Agenda Pribadi" for personal schedules only.
- **Inbox fix**: Dashboard `AppLayout` passes `scrollable={false}` when the Inbox tab is active, preventing auto-scroll-to-bottom issues.
- **Inbox navigation**: Bento card in `DashboardOverview` now uses `setActiveTab('Inbox')` + `navigate(...)` with a valid `roleView` path so clicking the card correctly opens the Inbox tab.
- **Academic schedule badge**: Timetable cards marked `is_academic: True` show a 🔒 Akademik badge and hide edit/delete controls.
- **Task page terminology**: Labels changed from Mahasiswa-specific ("tugas akademik") to role-neutral terms ("tugas", "kegiatan") to support Umum role users.

### Current priorities
1. Stability & Bug fixing
2. Integration testing
3. Documentation consistency
4. Feature completeness for unfinished items

### Major Unfinished Features
- Email verification frontend UI flow (Backend endpoints and SMTP async sending are completed)
- Automated browser smoke tests (Cypress/Playwright)
- Drag-and-drop calendar (basic click-to-add exists)
- MataKuliah cleanup: legacy `MataKuliah` records (manually created before Ruang Edukasi) may coexist with academic schedules — deletion UI exists only for personal `MataKuliah`

---

## Backend App Structure

```
backend/apps/
├── authentication/   # User, Kelas, RuangEdukasi, VerificationToken models
│   ├── models.py     # Custom User (multi-role), RuangEdukasi (with schedule fields)
│   ├── serializers.py
│   ├── views.py      # Auth, Profile, Ruang CRUD, Join Ruang
│   ├── urls.py       # /api/auth/...
│   ├── jwt_utils.py
│   ├── verification_views.py
│   └── google_views.py
├── tasks/            # Task, MataKuliah, PenugasanDosen, TaskComment, Notification
│   ├── models.py
│   ├── serializers.py
│   ├── views.py      # Task CRUD, Kanban, Broadcast, Report, Export, Notifications
│   ├── urls.py       # /api/tasks/...
│   └── signals.py    # Reminder/notification signals
├── schedules/        # JadwalKuliah (legacy - standalone schedule entries)
│   ├── models.py
│   ├── views.py
│   └── urls.py
├── inbox/            # ChatThread, Message
│   ├── models.py
│   ├── views.py
│   └── urls.py       # /api/inbox/...
└── common/
    ├── utils.py      # success_response, validation_error_response, error_response
    ├── serializers.py # Shared validation mixins
    └── permissions.py # IsRole permission classes
```

## Frontend Component Structure

```
frontend/src/
├── pages/
│   ├── DashboardPage.jsx      # Multi-tab: Overview, Ruang, Report, Inbox
│   ├── TaskManagementPage.jsx # Kanban Board + Backlog + Dosen Broadcast view
│   ├── SchedulePage.jsx       # Calendar + Weekly Timetable (role-aware)
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx       # Multi-role: mahasiswa / dosen / umum
│   ├── ProfilePage.jsx
│   ├── ForgotPasswordPage.jsx
│   └── ResetPasswordPage.jsx
├── components/
│   ├── dashboard/
│   │   ├── CalendarView.jsx       # Monthly calendar + day detail panel
│   │   ├── Inbox.jsx              # Full chat UI (threads + messages)
│   │   ├── NotificationDropdown.jsx
│   │   ├── DosenBroadcastView.jsx
│   │   └── SettingsView.jsx
│   ├── tasks/
│   │   ├── Board.jsx              # Kanban board
│   │   ├── Backlog.jsx
│   │   ├── AddTaskModal.jsx
│   │   ├── TaskModal.jsx
│   │   ├── TaskDetailModal.jsx
│   │   ├── MataKuliahModal.jsx    # Modal for personal schedule / agenda
│   │   ├── RuangEdukasiList.jsx   # Classroom management (create/join)
│   │   └── Report.jsx             # Analytics charts
│   ├── auth/
│   └── common/
│       ├── AppLayout.jsx
│       ├── ProtectedRoute.jsx
│       ├── GuestRoute.jsx
│       └── RoleRoute.jsx
├── services/
│   ├── api.js            # Axios instance + JWT interceptor + helpers
│   ├── authService.js    # Auth + Ruang Edukasi API calls
│   ├── taskService.js    # Task, MataKuliah, Kanban, Notifications API
│   ├── inboxService.js   # ChatThread + Message API calls
│   └── scheduleService.js
├── context/
│   └── AuthContext.jsx
├── hooks/
│   └── useTasks.js
└── utils/
    └── authHelpers.js
```

---

## Coding Philosophy

- Prefer maintainability over complexity
- Prefer clarity over cleverness
- Preserve scalable architecture
- Avoid technical debt growth