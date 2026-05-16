# EduTask Testing Checklist

## Authentication
- [ ] Register works
- [ ] Login works
- [ ] JWT refresh works
- [ ] Logout works
- [ ] Protected routes work
- [ ] Register rejects blank `nama_lengkap`
- [ ] Register rejects duplicate email (case-insensitive)
- [ ] Register rejects weak password

## Tasks
- [ ] Create task
- [ ] Edit task
- [ ] Delete task
- [ ] Kanban move works
- [ ] Filters work
- [ ] Create task rejects blank `judul`
- [ ] Create task rejects past deadline
- [ ] Create task rejects mata_kuliah belonging to another user

## MataKuliah
- [ ] Create mata kuliah rejects blank `nama`
- [ ] Create mata kuliah rejects duplicate `nama` per user (case-insensitive)
- [ ] Create mata kuliah rejects invalid hex `warna`
- [ ] Update mata kuliah: duplicate check excludes self

## Schedule
- [ ] Create schedule
- [ ] Edit schedule
- [ ] Delete schedule
- [ ] Create schedule rejects invalid `jam` format
- [ ] Create schedule rejects blank `ruangan`/`dosen`/`mata_kuliah`

## Frontend
- [ ] No console errors
- [ ] Responsive mobile layout
- [ ] API loading states work

## Backend
- [ ] No serializer errors
- [ ] No 500 errors
- [ ] Validation works

## Security
- [ ] Password hashing works
- [ ] JWT protection works
- [ ] Unauthorized access blocked