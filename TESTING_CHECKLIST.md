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
- [ ] Validation works (manual smoke on all forms)

## Security
- [ ] Password hashing works
- [ ] JWT protection works
- [ ] Unauthorized access blocked