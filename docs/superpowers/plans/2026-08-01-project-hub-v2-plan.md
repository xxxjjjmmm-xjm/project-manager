# Project Hub v2 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade from local Project Manager to general-purpose SaaS project management platform (Project Hub) with multi-user, tasks, Kanban, calendar, files, and team collaboration.

**Architecture:** Incremental refactor — extend Next.js 14 codebase with 8 new DB tables, Service Layer pattern, dark-tech SaaS design system, 4 new pages + 4 upgraded pages.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Prisma (SQLite→PostgreSQL), Tailwind CSS, shadcn/ui, SWR, Zod, JWT Auth

**Source spec:** `docs/superpowers/specs/2026-08-01-project-hub-v2-design.md`

---

## Pre-Phase 0: Schema Migration Safeguards

- [ ] **Backup database:** `cp prisma/dev.db prisma/dev.db.backup`
- [ ] **Table audit:** Keep `scan_paths`, `scan_records`, `projects`, `tags`, `project_tags`. Drop `git_commits`. Extend `projects` with new columns.
- [ ] **Commit:** `git commit -m "chore: backup dev.db before v2 migration"`

---

## Phase 1: Prisma Schema v2 + Seed + Service Layer

**Database changes:** Add 8 tables (`User`, `Workspace`, `WorkspaceMember`, `ProjectMember`, `Task`, `Comment`, `Activity`, `Asset`, `TaskTag`). Extend `Project`. All status/priority/role fields use Prisma enums. Drop `GitCommit`.

### Task 1.1: Write new Prisma schema

**Files:**
- Modify: `prisma/schema.prisma`

Write full schema with enums (`ProjectStatus`, `TaskStatus`, `Priority`, `MemberRole`, `ProjectMemberRole`, `AssetStatus`), new models (`User`, `Workspace`, `WorkspaceMember`, `ProjectMember`, `Task`, `Comment`, `Activity`, `Asset`, `TaskTag`), and extended `Project` model with `workspaceId`, `ownerId`, `status`, `priority`, `progress`, `startDate`, `dueDate`.

- [ ] **Step 1: Add enums to schema**

```prisma
enum ProjectStatus { PLANNING IN_PROGRESS REVIEW COMPLETED DELAYED AT_RISK }
enum TaskStatus { TODO IN_PROGRESS REVIEW DONE }
enum Priority { URGENT HIGH MEDIUM LOW }
enum WorkspaceMemberRole { OWNER ADMIN MEMBER VIEWER }
enum ProjectMemberRole { MANAGER MEMBER VIEWER }
enum AssetStatus { UPLOADED PROCESSING AVAILABLE ARCHIVED }
```

- [ ] **Step 2: Add User model**

```prisma
model User {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  passwordHash String
  avatarUrl    String   @default("")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  workspace    WorkspaceMember?
  ownedProjects Project[]  @relation("ProjectOwner")
  assignedTasks Task[]     @relation("TaskAssignee")
  createdTasks  Task[]     @relation("TaskCreator")
  comments      Comment[]
  uploads       Asset[]
  activities    Activity[]
}
```

- [ ] **Step 3: Add Workspace + WorkspaceMember models**

```prisma
model Workspace {
  id        String   @id @default(cuid())
  name      String
  ownerId   String
  owner     User     @relation(fields: [ownerId], references: [id])
  avatarUrl String   @default("")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  members   WorkspaceMember[]
  projects  Project[]
  activities Activity[]
  assets    Asset[]
}

model WorkspaceMember {
  id          String   @id @default(cuid())
  workspaceId String
  userId      String   @unique
  role        WorkspaceMemberRole @default(MEMBER)
  createdAt   DateTime @default(now())
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

- [ ] **Step 4: Extend Project + add ProjectMember**

```prisma
model Project {
  id          String   @id @default(cuid())
  workspaceId String
  ownerId     String
  name        String
  description String   @default("")
  type        String   @default("other")
  techStack   String   @default("[]")
  status      ProjectStatus @default(PLANNING)
  priority    Priority @default(MEDIUM)
  progress    Int      @default(0)
  startDate   DateTime?
  dueDate     DateTime?
  // Keep existing fields for backward compat
  path           String   @unique
  totalCommits   Int      @default(0)
  lastScannedAt  DateTime?
  lastCommitAt   DateTime?
  lastCommitHash String   @default("")
  firstSeenAt    DateTime @default(now())
  remoteUrl      String   @default("")
  isArchived     Boolean  @default(false)
  archivedAt     DateTime?
  metadata       String   @default("{}")
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  workspace Workspace       @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  owner     User            @relation("ProjectOwner", fields: [ownerId], references: [id])
  members   ProjectMember[]
  tasks     Task[]
  comments  Comment[]
  assets    Asset[]
  tags      ProjectTag[]
  scanRecords ScanRecord[]
}

model ProjectMember {
  id        String   @id @default(cuid())
  projectId String
  userId    String
  role      ProjectMemberRole @default(MEMBER)
  createdAt DateTime @default(now())
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([projectId, userId])
}
```

- [ ] **Step 5: Add Task + Comment + Activity + Asset + TaskTag models**

```prisma
model Task {
  id          String   @id @default(cuid())
  projectId   String
  title       String
  description String   @default("")
  status      TaskStatus @default(TODO)
  priority    Priority @default(MEDIUM)
  assigneeId  String?
  creatorId   String
  position    Int      @default(0)
  dueDate     DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  assignee    User?    @relation("TaskAssignee", fields: [assigneeId], references: [id])
  creator     User     @relation("TaskCreator", fields: [creatorId], references: [id])
  comments    Comment[]
  assets      Asset[]
  tags        TaskTag[]
}

model Comment {
  id        String   @id @default(cuid())
  authorId  String
  content   String
  taskId    String?
  projectId String?
  createdAt DateTime @default(now())
  author    User     @relation(fields: [authorId], references: [id])
  task      Task?    @relation(fields: [taskId], references: [id], onDelete: Cascade)
  project   Project? @relation(fields: [projectId], references: [id], onDelete: Cascade)
}

model Activity {
  id          String   @id @default(cuid())
  workspaceId String
  actorId     String
  action      String
  targetType  String
  targetId    String
  metadata    Json     @default("{}")
  createdAt   DateTime @default(now())
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  actor       User      @relation(fields: [actorId], references: [id])
}

model Asset {
  id              String   @id @default(cuid())
  workspaceId     String
  projectId       String?
  taskId          String?
  filename        String
  filePath        String
  storageProvider String   @default("LOCAL")
  storageKey      String   @default("")
  mimeType        String
  sizeBytes       Int
  thumbnailUrl    String   @default("")
  status          AssetStatus @default(UPLOADED)
  uploadedById    String
  createdAt       DateTime @default(now())
  workspace       Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  project         Project?  @relation(fields: [projectId], references: [id], onDelete: SetNull)
  task            Task?     @relation(fields: [taskId], references: [id], onDelete: SetNull)
  uploader        User      @relation(fields: [uploadedById], references: [id])
}

model TaskTag {
  id        String   @id @default(cuid())
  taskId    String
  tagId     String
  createdAt DateTime @default(now())
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  tag       Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)
  @@unique([taskId, tagId])
}
```

- [ ] **Step 6: Run migration**

```bash
npx prisma migrate dev --name v2-saas-upgrade
```

Expected: Creates new tables, extends `projects`. Old data preserved via `@default` values on new required fields.

- [ ] **Step 7: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: Prisma schema v2 — 14 tables with enums for SaaS"
```

### Task 1.2: Seed script

**Files:**
- Create: `prisma/seed.ts`

- [ ] **Step 1: Write seed.ts** — Create 1 workspace "My Workspace", 1 user "Demo User (demo@projecthub.dev / password: demo123)", 3 projects (Website Redesign IN_PROGRESS, Mobile App PLANNING, Internal Tools COMPLETED), 5 tasks across projects, 3 activity entries.

- [ ] **Step 2: Add seed config to package.json** — `"prisma": { "seed": "tsx prisma/seed.ts" }`

- [ ] **Step 3: Run and verify**

```bash
npx prisma db seed
npx prisma studio  # verify all tables have data
```

- [ ] **Step 4: Commit**

```bash
git add prisma/seed.ts package.json
git commit -m "feat: add seed script with demo data"
```

### Task 1.3: Service Layer scaffolding

**Files:**
- Create: `services/project.service.ts`
- Create: `services/task.service.ts`
- Create: `services/activity.service.ts`
- Create: `services/file.service.ts`
- Create: `services/dashboard.service.ts`
- Create: `lib/errors/AppError.ts`
- Create: `lib/errors/error-handler.ts`

Each service exports pure functions taking `prisma` as parameter (DI for testability). The error-handler wraps service calls, catches Prisma/AppError, returns `ApiResponse` format.

- [ ] **Step 1: AppError** — `code: ErrorCode, message: string, action: ErrorAction, status: number`
- [ ] **Step 2: error-handler** — `wrapService(fn)` try-catches, maps errors to `errorResponse()`
- [ ] **Step 3: Service stubs** — `project.service.ts`: `listProjects`, `getProject`, `createProject`, `updateProject`, `deleteProject`
- [ ] **Step 4: Commit**

```bash
git add services/ lib/errors/
git commit -m "feat: Service Layer with AppError, error-handler, stubs"
```

---

## Phase 2: API Routes — Refactored with Service Layer

**Goal:** Rewrite all existing API routes to use Service Layer + Zod. Add new routes for Tasks, Calendar, Team, Files, Search, Workspace.

### Task 2.1: Zod validation schemas

**Files (Create):**
- `lib/validations/project.schema.ts`
- `lib/validations/task.schema.ts`

- [ ] **Step 1: project.schema.ts** — `createProjectSchema` (name required, description/status/priority/dueDate optional), `updateProjectSchema` (all optional), `projectQuerySchema` (search/status/page/limit)
- [ ] **Step 2: task.schema.ts** — `createTaskSchema` (title required, projectId required, etc.), `updateTaskSchema` (all optional except status/position for Kanban), `taskQuerySchema`
- [ ] **Step 3: Commit**

### Task 2.2: Projects API (rewrite)

**Files (Modify):**
- `app/api/projects/route.ts` — GET (Service: listProjects + Zod query params), POST (createProject + Activity log)
- `app/api/projects/[id]/route.ts` — GET/PATCH/DELETE

**Files (Create):**
- `app/api/projects/[id]/tasks/route.ts` — GET list, POST create
- `app/api/projects/[id]/members/route.ts` — GET/POST/DELETE
- `app/api/projects/[id]/activity/route.ts` — GET project-scoped activity

### Task 2.3: New APIs

**Files (Create):**
- `app/api/tasks/route.ts` + `[id]/route.ts` — CRUD, cross-project aggregation (`?myTasks=true&status=TODO`)
- `app/api/calendar/route.ts` — `?month=2026-08` → tasks + projects with dueDate in month
- `app/api/team/route.ts` — GET members with stats, POST invite
- `app/api/files/route.ts` + `upload/route.ts` + `[id]/route.ts` — list/upload/delete
- `app/api/search/route.ts` — `?q=keyword` → projects + tasks + files
- `app/api/dashboard/stats/route.ts` + `tasks/route.ts` + `activity/route.ts` + `deadlines/route.ts`
- `app/api/workspace/route.ts` — GET/PATCH

All routes: Zod parse → Service call → Activity log (on mutations) → successResponse/errorResponse.

- [ ] **Commit after each API group**

---

## Phase 3: Design System — Visual Upgrade

**Goal:** Dark-tech SaaS aesthetic. New CSS, Inter font, restyled components. No page logic changes.

### Task 3.1: CSS + Tailwind

**Files:**
- Modify: `app/globals.css` — new HSL variables (`--background: 222 47% 4%`), Inter import, `@apply bg-[#09090B] text-[#FAFAFA]`
- Modify: `tailwind.config.ts` — `fontFamily.sans: ['Inter', 'PingFang SC', ...]`, keep Fira Code for mono

### Task 3.2: New shared components

**Files (Create):**
- `components/shared/StatusBadge.tsx` — maps ProjectStatus/TaskStatus to color+label
- `components/shared/ProgressBar.tsx` — `progress: number` (0-100), gradient fill, animated width

### Task 3.3: New layout

**Files:**
- Modify: `components/layout/Sidebar.tsx` — 8-item nav, "Project Hub" branding with gradient logo text, keep lang/theme at bottom
- Modify: `components/layout/TopBar.tsx` (rename from TopNav) — date + ⌘K search trigger + user avatar
- Modify: `components/layout/AppShell.tsx` — 2-column: Sidebar + (TopBar + Main), optional right panel

### Task 3.4: Restyle shadcn/ui

- `components/ui/button.tsx` → `rounded-xl`
- `components/ui/input.tsx` → `rounded-xl bg-white/[0.04]`
- `components/ui/card.tsx` → `rounded-2xl bg-[#111113] border-white/[0.06]`

- [ ] **Build:** `npx next build` must pass
- [ ] **Commit**

---

## Phase 4: Dashboard — 首页控制台

**Page:** `app/page.tsx` (rewrite)  
**Hook:** `hooks/useDashboard.ts` — SWR 4 parallel fetches (stats/tasks/activity/deadlines)  
**Components (Create):**
- `components/dashboard/StatCard.tsx` — glass card rewrite
- `components/dashboard/ProjectHealthCard.tsx` — completion bar + status breakdown
- `components/dashboard/TaskTimeline.tsx` — today's tasks vertical timeline
- `components/dashboard/DeadlineList.tsx` — upcoming deadlines with relative dates
- `components/dashboard/ActivityFeed.tsx` — scrollable recent activity

Layout: TopBar row → 2-col grid (left: StatGrid 4-cols + ProjectHealth + TaskTimeline, right: Deadlines + ActivityFeed).

- [ ] **Build + E2E + screenshot**

---

## Phase 5: 项目中心 + 详情

### Task 5.1: /projects (split view)

**Page:** `app/projects/page.tsx` (rewrite)  
**Components (Create):**
- `components/projects/ProjectCard.tsx` — progress bar + status badge
- `components/projects/ProjectList.tsx` — searchable scrollable left list
- `components/projects/ProjectDetailPanel.tsx` — right-side detail showing progress/phase/tasks/members

### Task 5.2: /projects/[id] (full-page with Kanban)

**Page:** `app/projects/[id]/page.tsx` (rewrite)  
**Components (Create):**
- `components/projects/KanbanBoard.tsx` — 4 columns, drag-drop
- `components/projects/KanbanColumn.tsx` — single column
- `components/projects/ProjectSettings.tsx` — members + danger zone

Tabs: Overview | Tasks (Kanban) | Files | Activity | Settings

- [ ] **Build + test**

---

## Phase 6: 任务 + 日历

**Pages (Create):**
- `app/tasks/page.tsx` — FilterSidebar + TaskList
- `app/calendar/page.tsx` — CalendarGrid + day detail

**Components (Create):**
- `components/tasks/TaskCard.tsx` — checkbox quick-complete, priority badge
- `components/tasks/TaskList.tsx`
- `components/tasks/TaskFilters.tsx` — status/priority/project chips
- `components/calendar/CalendarGrid.tsx` — month nav, 7-col grid

**Hooks (Create):** `hooks/useTasks.ts`, `hooks/useCalendar.ts`

---

## Phase 7: 团队 + 文件 + 搜索

**Pages (Create):**
- `app/team/page.tsx` — MemberCard grid + invite button
- `app/files/page.tsx` — FileCard grid + detail panel + upload
- `app/search/page.tsx` — categorized results

**Components (Create):**
- `components/team/MemberCard.tsx`
- `components/files/FileCard.tsx`
- `components/layout/CommandMenu.tsx` — ⌘K global search dialog

---

## Phase 8: Auth + Permission + Import Plugin

### Task 8.1: Auth

**Files (Create):**
- `lib/auth/jwt.ts`, `session.ts`, `password.ts`
- `app/api/auth/login/route.ts`, `register/route.ts`, `me/route.ts`
- `middleware.ts` — JWT check on protected routes

### Task 8.2: Permissions

**Files (Create):**
- `lib/permissions/index.ts` — `canEditProject`, `canManageTask`, `canInviteMembers`, `canDeleteAsset`

Wire into all Service functions.

### Task 8.3: Import Plugin

**Files:**
- Move `lib/scanner/` → `lib/plugins/scanner/`
- Move `app/api/scan-paths/` → `app/api/plugins/scan-paths/`
- Move `app/api/scan/` → `app/api/plugins/scan/`

### Task 8.4: Settings consolidation

**Page:** `app/settings/page.tsx` (modify) — Tabs: Account | Workspace | Appearance | Integrations | Data

---

## Phase 9: E2E + Release

- [ ] Write E2E tests for all 8 pages
- [ ] Run `npx playwright test` — 100% pass
- [ ] Update README.md with v2 branding + screenshots
- [ ] Git tag `v2.0.0`
- [ ] Push + merge PR to master

---

## Summary

| Phase | Content | Files | Key Output |
|-------|---------|-------|-----------|
| Pre-0 | Backup | 1 | dev.db safe |
| 1 | Schema + Seed + Services | 9 | 14 tables, seed data, Service Layer |
| 2 | API Routes | 22 | All endpoints with Zod + Service pattern |
| 3 | Design System | 10 | Dark-tech CSS, Inter, restyled components |
| 4 | Dashboard | 7 | 5-module homepage |
| 5 | Projects | 8 | Split view + Kanban |
| 6 | Tasks + Calendar | 8 | Task aggregation + month calendar |
| 7 | Team + Files + Search | 8 | Member grid, file upload, ⌘K |
| 8 | Auth + Permissions + Plugin | 15 | JWT login, RBAC, scanner isolation |
| 9 | E2E + Release | 8 | Full coverage, GitHub v2.0.0 |

**Total: 9 phases, ~96 files, 6-8 weeks of focused development.**
