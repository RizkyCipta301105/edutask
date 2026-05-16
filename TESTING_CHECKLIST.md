# EduTask Testing Checklist

## Authentication
- [ ] Register works
- [ ] Login works
- [ ] JWT refresh works
- [ ] Logout works
- [ ] Protected routes work

## Tasks
- [ ] Create task
- [ ] Edit task
- [ ] Delete task
- [ ] Kanban move works
- [ ] Filters work

## Schedule
- [ ] Create schedule
- [ ] Edit schedule
- [ ] Delete schedule

## Frontend
- [ ] No console errors
- [ ] Responsive mobile layout
- [ ] API loading states work

## Backend
- [ ] No serializer errors
- [ ] No 500 errors
- [x] Serializer validation (shared mixins in `apps/common/serializers.py`)
  - [ ] Register: empty/whitespace `nama_lengkap` rejected
  - [ ] Task: empty `judul`, invalid `warna`, duplicate mata kuliah per user
  - [ ] Schedule: invalid `jam` format, empty `ruangan`/`dosen`/`mata_kuliah`
- [x] API response envelope (`success`, `message`, `data` | `errors`)
  - [ ] 404 on foreign resource returns `{ success: false, message, errors: null }`
  - [ ] 401 without token returns standardized envelope
  - [ ] Validation errors return HTTP 422 with `errors` object
- [ ] Validation works (manual smoke on all forms)

## Security
- [ ] Password hashing works
- [ ] JWT protection works
- [ ] Unauthorized access blocked