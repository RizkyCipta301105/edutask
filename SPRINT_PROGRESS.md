# Sprint Progress

## Sprint 1
Status: Completed

Completed:
- Authentication system
- JWT flow
- Profile management
- Task CRUD
- Kanban board
- Schedule CRUD
- Role system
- Frontend integration

Testing Progress:
- Authentication API tests added
- JWT flow tests added
- Protected route tests added

Known Issues:
- README outdated
- No automated tests
- Dosen dashboard incomplete
- OAuth not implemented
- No calendar feature
- No reminder scheduler

---

## Sprint 2
Status: In Progress

Goals:
- Stabilize existing features
- Improve validation
- Add testing
- Improve responsive UI
- Fix documentation
- Reduce technical debt

Completed:
- Task 1: Improve backend serializer validation
  - Removed duplicate `success_response`/`error_response` from `authentication/views.py` → now imported from `apps.common.utils`
  - Added `MataKuliahSerializer` validation: non-blank `nama`, unique per user, valid hex `warna`
  - Added `TaskSerializer` + `TaskCreateSerializer` validation: strip/non-blank `judul`, sanitize `deskripsi`
  - Added `JadwalKuliahSerializer` validation: `jam` format (HH:MM-HH:MM), non-blank `ruangan`/`dosen`/`mata_kuliah`
  - Added `validate_nama_lengkap` in auth serializers: sanitize whitespace, non-blank check

Pending:
- Interactive calendar
- Reminder system
- Progress tracker
- Testing (automated)
- Responsive UI improvements