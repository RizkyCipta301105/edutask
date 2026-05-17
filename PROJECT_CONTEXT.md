# EduTask Project Context

## Goal

EduTask helps students manage:
- academic tasks
- schedules
- deadlines
- productivity

through a centralized web platform.

---

## Current Stack

Backend:
- Django
- Django REST Framework
- SimpleJWT
- PostgreSQL

Frontend:
- React
- Vite
- TailwindCSS
- Axios
- dnd-kit

---

## Current Features

Implemented:
- Authentication
- JWT login/refresh/logout
- Role-based users
- Task CRUD
- Kanban board
- Schedule CRUD
- Profile management

Partially implemented:
- Dosen dashboard

Not implemented:
- Interactive calendar
- Reminder scheduler
- Progress analytics
- Google OAuth
- Email verification

---

## Current Technical Debt

- Limited automated testing
- No CI/CD
- Documentation consistency still needs ongoing maintenance
- Schedule model uses string instead of FK
- Some placeholder frontend metrics
- OAuth labeling mismatch
- Authenticated frontend CRUD smoke checks still need manual coverage

---

## Sprint Direction

Sprint 2 priorities:
1. Stabilization
2. Testing
3. Validation
4. Cleanup
5. Documentation consistency

Sprint 3 priorities:
1. Calendar
2. Reminder system
3. Progress tracking

Sprint 4 priorities:
1. Deployment
2. Optimization
3. Final polishing
