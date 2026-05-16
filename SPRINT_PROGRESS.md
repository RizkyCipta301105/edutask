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
- Backend serializer validation centralized in `apps/common/serializers.py`
  - Shared mixins: deadline, ownership, nama lengkap, password, task input, mata kuliah, schedule input
  - Reusable helpers: text sanitization, hex color, schedule time slot format
  - Applied across authentication, tasks, and schedules serializers
  - Removed duplicate `validate_mata_kuliah` / judul rules between task serializers

In Progress:
- Responsive UI improvements
- Additional API test coverage (schedules)
- Documentation alignment

Pending:
- Interactive calendar
- Reminder system
- Progress tracker