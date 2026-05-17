# EduTask Code Quality Assessment

**Date:** May 17, 2026
**Scope:** Backend (Django REST) + Frontend (React + Vite)  
**Review Depth:** Architecture, organization, patterns, code health

---

## 📊 Executive Summary

**Overall Status:** 🟢 **STABLE WITH MANAGEABLE TECHNICAL DEBT**

The EduTask project demonstrates solid foundational architecture and clean separation of concerns. Sprint 2 resolved several consistency, validation, response-format, and frontend maintainability issues. The codebase is stable enough for Sprint 3 feature work, with remaining debt concentrated around authenticated browser smoke coverage, task ordering internals, and future feature architecture.

**Key Strengths:**
- Clear separation between services, components, and business logic
- Consistent API response format across endpoints
- JWT authentication with proper token refresh mechanism
- Reusable serializers and custom hooks
- Good use of environment-based configuration
- Frontend API envelope extraction and query string construction centralized
- Mobile navigation and core responsive layouts improved

**Areas for Improvement:**
- Authenticated frontend smoke tests are still manual / incomplete
- Test coverage remains focused on backend critical paths
- Task ordering logic still needs a clean owner-aware abstraction before scale
- Missing business logic abstraction layer
- No frontend error boundary yet

---

## 1. CODE ORGANIZATION & STRUCTURE

### ✅ **Backend Organization: WELL-STRUCTURED**

**Strengths:**
- **Clear app-based structure** following Django conventions:
  - `authentication/` - User management & JWT
  - `tasks/` - Task & MataKuliah models with Kanban support
  - `schedules/` - Schedule management
- **Logical file separation:** Models → Serializers → Views → URLs
- **Config isolation:** Settings externalized via environment variables (`decouple`)
- **UUID primary keys** used consistently for better security

**Issues:**
- **No services/managers layer:** Some business logic remains close to models/serializers
  - Example: Task ordering should move behind a clearer task service or manager boundary before scale
- **Limited ownership abstraction:** Detail views still repeat owner-scoped `get_object()` patterns

### ✅ **Frontend Organization: WELL-STRUCTURED**

**Strengths:**
- **Clear directory structure:**
  - `services/` - API layer abstraction
  - `components/` - Reusable UI components
  - `hooks/` - Custom React hooks for logic
  - `context/` - Global state management
  - `pages/` - Route-level components
  - `utils/` - Helper functions
- **Modular components** with single responsibility
- **Good use of custom hooks** (`useForm`, `useTasks`)

**Issues:**
- **No repository or data access layer:** Services directly use axios
- **Limited component composition:** Some components could be split further (e.g., `TaskManagementPage` is ~100 LOC)

---

## 2. SEPARATION OF CONCERNS

### 🟠 **Backend: MOSTLY GOOD, WITH GAPS**

#### Authentication Module
- ✅ Serializers handle validation properly
- ✅ Views separate auth logic from business logic
- ✅ **Resolved (Sprint 2):** JWT claim construction centralized in `authentication/jwt_utils.py`.

#### Task & MataKuliah Modules
- ✅ Serializers separate validation
- ✅ Views separate HTTP handling from business logic
- ✅ **Resolved (Sprint 2):** Task, schedule, auth, and exception flows use centralized helpers from `apps/common/utils.py`.
  
- ✅ **Resolved (Sprint 2):** Task/schedule/auth field validation centralized in `apps/common/serializers.py` via mixins (`TaskInputValidationMixin`, `ScheduleInputValidationMixin`, etc.)

#### Query Optimization
- ⚠️ **Issue:** `TaskListCreateView` uses `.select_related('mata_kuliah')` (good)
- ⚠️ **Issue:** No pagination implemented - could be problematic at scale
- ⚠️ **Issue:** Kanban view needs optimization review (not fully visible)

### ✅ **Frontend: GOOD**

#### API Layer
- ✅ `api.js` handles all HTTP concerns (interceptors, token management)
- ✅ Shared helpers now centralize API envelope extraction and query parameter building
- ✅ `authService.js` pure auth operations
- ✅ `taskService.js` pure task operations
- ✅ `scheduleService.js` pure schedule operations

#### State Management
- ✅ `AuthContext` cleanly manages auth state
- ✅ `useTasks` hook encapsulates task state logic
- ✅ Components receive props from hooks/context

#### Component Concerns
- ✅ Components focus on UI rendering
- ⚠️ **Issue:** `TaskManagementPage` mixes filter logic with UI (moderate complexity)
- ✅ `KanbanBoard` properly separates drag-drop logic from state updates

---

## 3. NAMING CONVENTIONS & PATTERNS

### ✅ **Backend: CONSISTENT**

**Good Patterns:**
- Model names: Singular (`User`, `Task`, `MataKuliah`)
- View names: Clear suffixes (`ListCreateView`, `DetailView`, `MoveView`)
- Serializer names: Clear (`TaskSerializer`, `TaskCreateSerializer`, `KanbanMoveSerializer`)
- Function names: Descriptive (`get_is_overdue()`, `validate_deadline()`)
- Indonesian field names used consistently (aligned with project language preference)

**Inconsistencies Found:**
- ✅ **Resolved (Sprint 2):** Backend view helpers now consistently use `success_response()`, `error_response()`, and `validation_error_response()`.

- Query parameter naming: Mixed snake_case usage:
  - `mata_kuliah` (snake_case) ✅
  - `prioritas` (already joined) ✅
  - Consistent across API ✅

### ✅ **Frontend: CONSISTENT**

**Good Patterns:**
- Component names: PascalCase (`KanbanBoard`, `TaskCard`, `AuthLayout`)
- Hook names: camelCase with `use` prefix (`useForm`, `useTasks`)
- File names: Match exports (`api.js`, `authService.js`)
- Functions: camelCase (`handleDragStart`, `handleDragEnd`, `fetchBoard`)
- Constants: UPPER_CASE (`COLUMNS`, `PRIORITAS_STYLE`, `STATUS_META`)

**Consistent Throughout** ✅

---

## 4. CODE DUPLICATION & REPEATED LOGIC

### 🔴 **HIGH PRIORITY DUPLICATIONS**

#### 1. **Response Helper Functions** (Backend) — ✅ Addressed Sprint 2
**Location:** `tasks/views.py`, `schedules/views.py`
```python
# Duplicated in 2 files
def ok(data=None, message='', code=status.HTTP_200_OK):
    return Response({'success': True, 'message': message, 'data': data}, status=code)

def err(errors=None, message='Terjadi kesalahan.', code=status.HTTP_400_BAD_REQUEST):
    return Response({'success': False, 'message': message, 'errors': errors}, status=code)
```
**Status:** Standardized through `apps/common/utils.py` and used by auth, task, schedule, and exception handling code.

#### 2. **Validation Logic Duplication** (Backend) — ✅ Addressed Sprint 2
**Location:** `apps/common/serializers.py` (mixins + helpers), consumed by task/auth/schedule serializers  
**Status:** Shared deadline, ownership, task input, mata kuliah, schedule, nama lengkap, and password validation; `OwnershipValidationMixin` delegates to `validate_resource_ownership()` in `utils.py`

#### 3. **Token Claims Construction** (Backend) — ✅ Addressed Sprint 2
**Location:** `CustomTokenObtainPairSerializer`, `build_auth_payload()`
```python
# Claims added in 2 places:
token['email'] = user.email
token['role'] = user.role
token['nama_lengkap'] = user.nama_lengkap
token['tipe_akun'] = user.tipe_akun
```
**Status:** `apply_user_claims()` and `build_auth_tokens()` now centralize claim construction.

#### 4. **`get_object()` Pattern** (Backend)
**Location:** All detail views
```python
# Used in MataKuliahDetailView, TaskDetailView, JadwalKuliahDetailView
def get_object(self, pk, user):
    return get_object_or_404(Model, pk=pk, user=user)
```
**Impact:** DRY violation, could be abstracted to base class  
**Recommendation:** Create base `UserOwnershipMixin` or similar

#### 5. **Modal/Form State Management** (Frontend) — Partially Addressed Sprint 2
**Location:** `TaskManagementPage`, `KanbanBoard`
```javascript
// Both use similar patterns:
const [modalOpen, setModalOpen] = useState(false)
const [editingTask, setEditingTask] = useState(null)

const saveTask = async (payload) => { ... }
const deleteTask = async (id) => { ... }
```
**Impact:** Code duplication in logic  
**Status:** Shared presentational form primitives were added for loading buttons, password toggles, select fields, textarea fields, form errors, and loading states. Auth forms, `TaskModal`, and Kanban loading now reuse those pieces.
**Remaining Recommendation:** Extract repeated modal open/edit/save/delete orchestration to a custom hook such as `useTaskModal()` when touching `TaskManagementPage` and `KanbanBoard` together.

#### 6. **Validation/Error Setting** (Frontend)
**Location:** `useForm.js` - Good consolidation here ✅  
Already has `setApiErrors()` to parse DRF errors - good pattern

---

## 5. CODE SMELLS & TECHNICAL DEBT

### 🟠 **REMAINING ISSUES**

#### 1. **Task Ordering Logic Placement** (Medium Priority)
**File:** [tasks/models.py](tasks/models.py)
```python
class TaskManager(models.Manager):
    def get_next_urutan(self, user, status):
        max_urutan = self.filter(
            user=user,
            status=status,
        ).aggregate(Max('urutan'))['urutan__max'] or -1
        return max_urutan + 1
```
**Issues:**
- Ordering logic has moved out of the serializer, which is an improvement.
- It still deserves a service/manager review before Kanban analytics, calendar, or reminders depend on ordering semantics.

**Solution:** Keep current manager for Sprint 2, then introduce a small task service if Sprint 3 adds more task movement rules.

#### 2. **Authenticated Browser Smoke Coverage** (Medium Priority)
- Backend automated tests cover critical auth/task/schedule paths.
- Final browser smoke covered unauthenticated login/register responsive rendering.
- Authenticated dashboard, task CRUD, schedule CRUD, and Kanban drag/drop still need manual or automated browser coverage.

#### 3. **No Request Validation for User Ownership** (Medium Priority)
**Pattern:** Most detail views check `user=request.user` but only at view level
- No permission class for automatic checking
- Could use DRF's `IsOwner` permission class

#### 4. **Missing Pagination** (Medium Priority)
- `TaskListCreateView.get()` returns all tasks
- At scale (1000+ tasks), API response could be huge
- No cursor/offset pagination implemented

#### 5. **Frontend: No Error Boundary** (Medium Priority)
- React app has no error boundary for component crashes
- Unhandled promise rejections not caught globally
- Route-level crashes would currently surface as a blank app

#### 6. **Frontend Token Storage Abstraction** (Low-Medium Priority)
- Token storage is centralized in `frontend/src/services/api.js`
- A dedicated storage helper could make future security changes easier
- Current approach is acceptable for this Vite SPA

---

### 🟡 **MODERATE ISSUES**

#### 7. **Validation Chain** (Backend) — ✅ Improved Sprint 2
- Shared validation mixins cover task, mata kuliah, schedule, password, name, deadline, and ownership checks
- Keep adding validation through `apps/common/serializers.py` rather than duplicating field-level checks

#### 8. **Missing Index Hints** (Backend)
- Models have no `db_index=True` on frequently queried fields
- `Task.objects.filter(user=request.user)` could benefit from index

#### 9. **No API Versioning** (Backend)
- All endpoints at `/api/...` without version prefix
- Makes future breaking changes harder

#### 10. **Frontend: No Loading States on All Operations** — Partially Addressed Sprint 2
- Shared `SubmitButton` standardizes save/login/register loading indicators
- Shared `LoadingState` standardizes component-level loading display
- Filters in `TaskManagementPage` could show loading skeletons

---

## 6. MODULE ORGANIZATION & IMPORTS

### ✅ **Backend: GOOD**

**Strengths:**
- Clear import organization:
  ```python
  # models.py
  import uuid
  from django.db import models
  from django.utils import timezone
  from apps.authentication.models import User
  ```
- Relative imports used correctly (`apps.authentication.models`)
- No circular imports detected

**Issues:**
- ⚠️ Late imports in methods (e.g., `from django.db.models import Max` in `serializer.create()`)
- ⚠️ Mix of absolute imports from same app (`from .models import`, `from apps.tasks.models import`)

### ✅ **Frontend: GOOD**

**Strengths:**
- Consistent import organization:
  ```javascript
  // Grouped by: React, external, internal absolute, local relative
  import { useState, useCallback } from 'react'
  import { Plus, RefreshCw } from 'lucide-react'
  import KanbanColumn from './KanbanColumn'
  ```
- No circular dependencies detected
- Proper use of relative paths

**Missing:**
- No `index.js` re-exports for cleaner imports
  - Could do: `import { useTasks, useForm } from 'hooks'` instead of individual paths

---

## 7. CROSS-CUTTING CONCERNS

### Authentication & Authorization
- ✅ JWT properly implemented with refresh mechanism
- ✅ `IsAuthenticated` permission used correctly
- 🟡 **Missing:** Explicit permission classes for user ownership checks
  - Could standardize with DRF's `IsOwner` permission

### Error Handling
- ✅ Try-catch blocks present in async operations
- ⚠️ **Issue:** Generic "Gagal memuat data task." messages in frontend
  - No specific error type communication to user
- ⚠️ **Issue:** Backend 422 status code used inconsistently

### Validation
- ✅ Serializer validators well-implemented
- ⚠️ **Issue:** Validation duplicated (as noted above)
- 🟡 **Missing:** Client-side form validation in frontend (all validation happens on API)

### Database Queries
- ✅ `.select_related()` used for foreign key optimization
- 🟡 **Missing:** `.prefetch_related()` for reverse relations
- 🟡 **Missing:** Pagination/query limits

---

## 8. SPECIFIC CODE QUALITY PATTERNS

### ✅ **Good Patterns Found**

#### 1. **Response Format Consistency** (Frontend)
All API calls follow pattern:
```javascript
const res = await api.get(...)
return getResponseData(res)  // Consistent envelope extraction
```

#### 2. **Context Usage** (Frontend)
`AuthContext` properly:
- Provides initialization on mount
- Uses `useCallback` to prevent unnecessary re-renders
- Has clear error handling

#### 3. **Task Serializer Composition** (Backend)
`TaskSerializer` includes `mata_kuliah_detail` computed field - good pattern:
```python
mata_kuliah_detail = MataKuliahSerializer(source='mata_kuliah', read_only=True)
```

#### 4. **Kanban State Management** (Frontend)
Good pattern of optimistic updates with rollback:
```javascript
// Optimistic update in component
setBoard(prev => ({ ...prev, [toCol]: [...] }))
// Then persist
await taskService.moveTask(...)
// Or rollback on error
```

---

### 🔴 **Problematic Patterns**

#### 1. **Magic Strings** (Both)
Hard-coded status values scattered throughout:
```javascript
// Frontend
const COLUMNS = ['todo', 'in_progress', 'done']

// Backend
class Status(models.TextChoices):
    TODO = 'todo', 'To Do'
```
**Better:** Centralized constants in both frontend and backend

#### 2. **Mixed Responsibility in Components** (Frontend)
`TaskManagementPage` handles:
- Filtering logic
- Data fetching
- UI rendering
- Modal state

**Status:** Partially improved with shared loading/error handling and `useCallback` data fetching.
**Could split:** Extract remaining filtering/data/modal orchestration to custom hooks.

#### 3. **Implicit Dependencies** (Frontend)
`useTasks` calls `fetchBoard()` on mount with no dependency array awareness

---

## 📋 SUMMARY TABLE

| Category | Status | Priority | Notes |
|----------|--------|----------|-------|
| Organization | ✅ Good | - | Clear structure, good separation |
| Response Helpers | 🔴 Duplication | HIGH | Consolidate to common utils |
| Validation Logic | 🔴 Duplication | HIGH | Extract to base class/mixin |
| Token Claims | 🟡 Minor Duplication | MED | Consolidate function |
| Serializer Logic | 🔴 Bad Smell | HIGH | Move DB queries out |
| Permission Checks | 🟠 Manual | MED | Use DRF permission classes |
| Pagination | ❌ Missing | MED | Implement for scalability |
| Testing | ⚠️ Minimal | HIGH | Need test coverage |
| Error Handling | 🟡 Inconsistent | MED | Standardize error responses |
| Frontend State | ✅ Good | - | Clean hooks/context usage |
| Naming | ✅ Consistent | - | Good conventions throughout |

---

## 🎯 RECOMMENDATIONS (Priority Order)

### **Phase 1: Critical (Next Sprint)**
1. **Extract Response Helpers** → `apps/common/utils/response.py`
   - Impact: DRY, consistency, maintainability
   - Time: 30 min
   
2. **Fix Serializer Validation Duplication**
   - Create base `TaskSerializerMixin` with shared validators
   - Time: 45 min

3. **Move DB Query Logic Out of Serializers**
   - Create `TaskManager` with `get_next_order()` method
   - Update serializer to use manager
   - Time: 1 hour

4. **Consolidate Token Claims Logic**
   - Create `TokenService` with `build_token_claims()` method
   - Time: 30 min

### **Phase 2: Important (Following Sprint)**
5. **Add Pagination**
   - Use DRF's `PageNumberPagination`
   - Default 20 items per page
   - Time: 1 hour

6. **Create Permission Classes**
   - Implement `IsOwner` permission for ownership checks
   - Apply to all detail views
   - Time: 1 hour

7. **Standardize Error Handling**
   - Create custom exception classes
   - Consistent error code/message mapping
   - Time: 1.5 hours

8. **Add Basic Tests**
   - Auth endpoints: 70% coverage
   - Task endpoints: 50% coverage
   - Time: 4-6 hours

### **Phase 3: Nice-to-Have**
9. **Extract Remaining Frontend Modal Logic** → Custom hook
10. **Add Error Boundary** to React app
11. **Implement Request/Response Logging** middleware
12. **Add Field-level Indexes** to models

---

## ✅ POSITIVE FINDINGS

1. **Architecture is sound** - Clear separation, reusable components
2. **Authentication properly implemented** - JWT with refresh, token blacklist ready
3. **Frontend state management clean** - Good use of context + hooks
4. **Database relationships well-modeled** - UUID PKs, proper foreign keys
5. **UI/UX consistent** - Tailwind classes used consistently
6. **Scalability foundation present** - Can be optimized with recommended changes
7. **No security vulnerabilities detected** - Token handling, CORS configured
8. **Code is readable** - Good naming, clear intent, well-commented sections

---

## 🚩 KEY TAKEAWAYS

| What's Working | What Needs Attention |
|---|---|
| Clear project structure | Response helper duplication |
| Good separation of concerns | Validation logic duplication |
| Consistent naming conventions | Missing pagination |
| Proper JWT implementation | DB queries in serializers |
| Reusable components/hooks | Inconsistent error handling |
| Clean authentication flow | Missing comprehensive tests |
| Good state management | Limited permission class usage |
| Readable, maintainable code | No rate limiting/throttling |

---

**Next Steps:**
1. Review this assessment with team
2. Prioritize Phase 1 recommendations
3. Create tickets for each recommendation
4. Establish code review checklist based on findings
5. Consider implementing linting rules to prevent duplication patterns
