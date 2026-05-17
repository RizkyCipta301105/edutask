# EduTask Testing Checklist

## Authentication
- [ ] Register works (umum, mahasiswa, dosen)
- [ ] Login works
- [ ] JWT refresh works
- [ ] Logout works
- [ ] Protected routes work
- [x] Automated suite passes: 44 backend tests
- [x] Automated: role assignment on register (`test_auth_roles.py`)
- [x] Automated: JWT access token includes `role` claim
- [x] Automated: 401 uses API envelope (`test_permissions.py`)
- [ ] Role-based dashboard redirect (mahasiswa / dosen / umum)
- [ ] Session expiry redirects to login with return path

## Tasks
- [ ] Create task
- [ ] Edit task
- [ ] Delete task
- [ ] Kanban move works
- [ ] Filters work
- [x] Automated: CRUD ownership and JWT boundary (`test_task_crud.py`)
- [x] Automated: blank judul, invalid warna, duplicate mata kuliah (`test_validation.py`)

## Schedule
- [ ] Create schedule
- [ ] Edit schedule
- [ ] Delete schedule
- [x] Automated: CRUD, ownership, invalid jam (`test_schedule_crud.py`)

## Frontend
- [x] No console errors on final unauthenticated login/register smoke check
- [x] Manual smoke: login/register routes had no console errors after component refactor
- [x] Manual smoke: login/register responsive routes render on mobile and desktop widths after responsive cleanup
- [x] Responsive mobile layout smoke checked for login/register
- [x] Shared API loading states implemented for key forms and task/schedule loading areas
- [x] Production build passes: `npm run build`
- [ ] Wrong-role dashboard URL redirects to correct role dashboard
- [ ] Authenticated dashboard/task/schedule/Kanban browser smoke

## Backend
- [x] No serializer errors in automated backend suite
- [x] No 500 errors in automated backend suite
- [x] Serializer validation (shared mixins in `apps/common/serializers.py`)
- [x] API response envelope (`success`, `message`, `data` | `errors`)
- [x] Automated test suite: `./venv/bin/python manage.py test apps.authentication.tests apps.tasks.tests apps.schedules.tests --settings=config.settings_test`
- [ ] Validation works (manual smoke on all forms)

## Security
- [ ] Password hashing works
- [x] Automated: JWT protection on protected endpoints
- [x] Automated: cross-user resource access blocked (404 envelope)
- [ ] Unauthorized access blocked (manual)
