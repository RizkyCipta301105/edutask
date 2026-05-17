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
- Centralized backend validation and response envelopes
- Role-based dashboard routing

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
- Task ordering logic should be reviewed before scale
- No frontend error boundary yet

---

## Sprint Direction

Sprint 2 status:
- Completed stabilization, validation, testing, frontend cleanup, and documentation alignment pass

Sprint 3 priorities:
1. Calendar
2. Reminder system
3. Progress tracking

Sprint 4 priorities:
1. Deployment
2. Optimization
3. Final polishing
