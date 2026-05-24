# EduTask AGENTS

## Project Overview

EduTask is a fullstack academic task management web application.

Architecture:
- Backend: Django + DRF + JWT + PostgreSQL
- Frontend: React + Vite + TailwindCSS

Main modules:
- Authentication
- Tasks
- Kanban board
- Schedules

---

## Development Rules

- Analyze repository structure before coding
- Preserve current architecture
- Avoid unnecessary rewrites
- Make minimal safe changes
- Reuse existing services and components

---

## Backend Rules

- Keep business logic outside views when possible
- Use serializers for validation
- Maintain DRF response consistency
- Preserve JWT authentication flow
- Validate all request data

---

## Frontend Rules

- Keep components reusable
- Avoid duplicated logic
- Use existing API service modules
- Preserve routing structure
- Maintain responsive design

---

## Security Rules

- Never hardcode secrets
- Validate user input
- Avoid insecure JWT handling
- Preserve authentication protections

---

## Testing Rules

Before completing tasks:
- Check frontend console errors
- Verify backend endpoints
- Verify JWT flow
- Check Kanban functionality
- Check API integration

---

## Important Context

Current Sprint:
- Sprint 1-5 completed (Core, Auth, Validation, UI/UX, Kanban, Dosen Export)
- Starting Sprint 6 (Gamifikasi & Laporan)

Current priorities:
1. Stability
2. Testing
3. Documentation consistency
4. Validation
5. Bug fixing

Major unfinished features:
- Interactive calendar
- Reminder system
- Progress tracker
- Email verification
- Real OAuth integration

---

## Coding Philosophy

- Prefer maintainability over complexity
- Prefer clarity over cleverness
- Preserve scalable architecture
- Avoid technical debt growth