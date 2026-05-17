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

In Progress:
- Documentation alignment
- Authenticated browser smoke checks for dashboard, task, and schedule CRUD flows

Pending:
- Interactive calendar
- Reminder system
- Progress tracker
