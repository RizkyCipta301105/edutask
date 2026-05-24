# Sprint Progress

## Sprint 1
Status: ✅ Completed

Completed:
- Authentication system (multi-role: Mahasiswa, Dosen, Umum)
- JWT flow (access + refresh tokens, blacklist on logout)
- Profile management
- Task CRUD
- Kanban board
- Schedule CRUD
- Role system (RoleRoute, AuthContext)
- Frontend integration

Known Issues Resolved in Later Sprints:
- README outdated → updated in Sprint 3
- No automated tests → added in Sprint 2
- Dosen dashboard incomplete → completed in Sprint 3
- OAuth not implemented → stub created in Sprint 3

---

## Sprint 2
Status: ✅ Completed

Goals:
- Stabilize existing features
- Improve validation
- Add testing
- Improve responsive UI
- Fix documentation
- Reduce technical debt

Completed:
- Backend serializer validation centralized in `apps/common/serializers.py`
  - Shared mixins: deadline, ownership, nama lengkap, password, task input, mata kuliah, schedule input
  - Reusable helpers: text sanitization, hex color, schedule time slot format
  - Applied across authentication, tasks, and schedules serializers
  - Removed duplicate `validate_mata_kuliah` / judul rules between task serializers
- Task 2: Standardized API response structure
  - `validation_error_response()` helper (HTTP 422) for serializer failures
  - DRF `EXCEPTION_HANDLER` wraps 401/403/404 and other DRF errors into `{ success, message, errors }`
  - All task/schedule/auth views use keyword args with `success_response` / `validation_error_response`
  - Consistent Indonesian user-facing messages on list/detail endpoints
- Task 3: Authentication and permission flow
  - Centralized JWT claims in `authentication/jwt_utils.py`
  - `IsRole` permission classes in `apps/common/permissions.py`
  - Frontend: `RoleRoute`, return-path on login redirect, `userRole` in AuthContext
- Task 4: Essential backend tests
  - Role registration and JWT claim tests
  - Permission / 401 envelope tests
  - Schedule CRUD and ownership tests
  - Task and mata kuliah validation tests
- Task 5: Reusable frontend component cleanup
  - Added shared form primitives for submit loading, select fields, textarea fields, password toggles, form errors, and loading states
  - Refactored auth forms and task modal to reuse common form components while preserving existing styling
  - Reused the shared loading state in the Kanban board
  - Verified frontend production build and auth-route browser smoke check with no console errors
- Frontend responsive and service cleanup
  - Added mobile horizontal navigation while preserving the desktop sidebar layout
  - Improved responsive spacing, headings, grids, and form controls across dashboard, login/register, profile, task management, and schedule pages
  - Centralized frontend API response extraction and query parameter building in `frontend/src/services/api.js`
  - Reduced duplicated task/schedule/auth service response and registration logic
  - Improved shared API error message parsing for nested validation errors
- Final Sprint 2 audit and stabilization review
  - Removed placeholder `href="#"` behavior from the login forgot-password control
  - Verified frontend production build: `npm run build`
  - Verified backend test suite: 44 tests passing
  - Confirmed API response helpers, JWT claims, validation mixins, and frontend service helpers are centralized

---

## Sprint 3
Status: ✅ Completed

Goals:
- Implement Multi-role Dashboard (Umum, Mahasiswa, Dosen)
- Ruang Edukasi (Classrooms)
- Task Broadcast (Penugasan)
- Advanced Analytics & Reporting

Completed:
- Adjusted Registration for specific roles (NIP/NRP replaced by email-based validation)
- Dosen can create "Ruang Edukasi" and generate unique Join Codes
- Mahasiswa can join "Ruang Edukasi" using the Join Code
- Dosen can broadcast tasks (Penugasan) to all students in a Ruang Edukasi
- Separated Dosen Dashboard into "Penugasan" (Broadcast) and "Tugas Pribadi" (Personal Kanban Board)
- Integrated `recharts` for advanced visualization (PieChart for Completion Rate, BarChart for Task Distribution)
- Security Audit Passed (Zero Data Leakage confirmed via JWT and Queryset filtering)

---

## Sprint 4
Status: ✅ Completed

Goals:
- Finalize Advanced Features
- UX/UI Polish & Gamification Elements
- Progress Tracking & Notifications

Completed:
- **Interactive Calendar**: Custom-built CSS grid calendar without external heavy libraries. Features responsive hover effects, date detection, and auto-filling deadline input when a cell is clicked.
- **Automated Reminder System**: Django background job (`check_deadlines`) that creates in-app notifications for tasks with H-1 or Overdue deadlines. Does not require heavy message brokers like Celery/Redis.
- **In-App Notification Center**: Frontend `NotificationDropdown` that fetches and polls unread notifications securely via API, complete with "Mark all as read" functionality and visual indicator.
- **Progress Tracker Mahasiswa (Dosen Dashboard)**: Dynamically calculates and displays progress bars for Broadcasted Tasks. Dosen can immediately see percentages and counts for (Selesai, Proses, To Do) directly on the task card using efficient backend `SerializerMethodField` aggregation.
- Codebase audited via `npm run build` with zero critical warnings.

---

## Sprint 5
Status: ✅ Completed

Goals:
- Inbox Kolaborasi (real-time collaborative messaging)
- Dosen Report Export (CSV/PDF)
- UI/UX Polish
- Bug Fixes

Completed:
- **Inbox Kolaborasi**: Full chat UI (`Inbox.jsx`) with `ChatThread` and `Message` models. Supports 1:1 and group threads, message reactions, attachments, and edit/read indicators.
- **Dosen Report Export**: `PenugasanExportView` backend endpoint + frontend trigger for CSV export of student progress data.
- **Dashboard Bento Grid**: Overview tab redesigned as a premium bento-style grid with:
  - Radial progress ring (SVG) for task completion rate
  - Today's agenda card showing classes from current user's mata kuliah
  - Inbox bento card (clickable → navigates to Inbox tab)
  - Quick action buttons (Buat Tugas, Tambah Agenda)
- **Inbox scroll fix**: `AppLayout` receives `scrollable` prop; when Inbox tab is active, overflow is set to `hidden` to prevent automatic scroll-to-bottom.
- **Inbox redirect fix**: Bento inbox card now correctly calls `setActiveTab('Inbox')` + `navigate(/dashboard/${roleView}?tab=Inbox)` ensuring tab state syncs.
- UI terminology adjusted: "Tugas Akademik" → role-neutral labels for Umum users; Schedule page uses role-appropriate headings.

---

## Sprint 6
Status: 🔄 In Progress

Goals:
- Integration refinements
- Ruang Edukasi → Jadwal Kuliah integration
- UX consistency improvements
- Documentation update

Completed:
- **Ruang Edukasi ↔ Schedule Integration**: `GET /api/tasks/mata-kuliah/` now returns both personal `MataKuliah` entries AND schedule data derived from `RuangEdukasi` records (rooms the user joined or created). The `is_academic: True` flag distinguishes official class schedules from personal agendas.
- **Academic schedule badge**: Timetable cards with `is_academic: True` display a 🔒 Akademik badge; edit/delete controls are hidden for these cards (only personal schedules can be edited).
- **Calendar academic rendering**: `CalendarView.jsx` filters `RuangEdukasi`-derived schedules to only appear from `ruang.created_at` onward, so students don't see retroactive phantom class entries.
- **Schedule page UX**: Removed "Tambah Jadwal Kuliah" button for Dosen role (schedule now managed via Ruang Edukasi form). Non-dosen roles see "Tambah Agenda Pribadi" for personal schedules.
- **MataKuliah cleanup**: Legacy orphan `MataKuliah` entries (e.g., old subject records) can be deleted via the edit/delete UI on the timetable page; `is_academic` cards are protected.
- **Documentation**: AGENTS.md, SPRINT_PROGRESS.md, README.md updated to reflect Sprint 5–6 changes.

Pending / Backlog:
- Email verification full flow (backend endpoint exists, frontend integration incomplete)
- Real Google OAuth (stub exists in `google_views.py`)
- Automated browser smoke tests (Cypress/Playwright)
- Drag-and-drop calendar events
- Push/email reminders (currently only in-app)
- Fully interactive progress tracker per individual student
