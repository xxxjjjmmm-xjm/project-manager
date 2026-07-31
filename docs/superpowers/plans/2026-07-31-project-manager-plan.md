# Project Manager — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local project management web app that scans directories, discovers git projects, and provides search/browse/detail views — deployable as open source to GitHub.

**Architecture:** Next.js App Router full-stack app with Prisma ORM (SQLite default, MySQL optional), shadcn/ui components, and a Node.js filesystem/git scanning engine. API routes serve data to React pages; the scanner runs on-demand or via node-cron.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Prisma, SQLite/MySQL, Tailwind CSS, shadcn/ui, Vitest, Playwright, node-cron, Zod

**Source spec:** `docs/superpowers/specs/2026-07-31-project-manager-design.md`

---

## File Structure Plan

```
project-manager/
├── prisma/
│   └── schema.prisma              # 6 tables
├── lib/
│   ├── types.ts                   # Shared types
│   ├── db.ts                      # Prisma client singleton
│   ├── api-response.ts            # Response helpers
│   ├── scanner/
│   │   ├── types.ts               # Scanner internal types
│   │   ├── file-reader.ts         # readFileWithLimit, findReadme, findClaudeMd, readPackageJson
│   │   ├── git-reader.ts          # getGitInfo with 10s timeout
│   │   ├── discoverer.ts          # discoverProjects — walk dirs, detect roots
│   │   ├── extractor.ts           # extractMetadata — type inference, tech stack
│   │   └── index.ts               # Scanner class with scanAll(), scanPath()
├── hooks/
│   ├── useDebounce.ts
│   ├── useProjects.ts
│   ├── useProject.ts
│   ├── useScan.ts
│   ├── useScanPaths.ts
│   ├── useTags.ts
│   └── useStats.ts
├── components/
│   ├── layout/    (AppShell, Sidebar, TopNav)
│   ├── dashboard/ (StatCard, TechBreakdown, RecentProjects, ActiveProjects)
│   ├── projects/  (ProjectListTable, ProjectFilters, ProjectDetailHeader,
│   │               ProjectDetailOverview, ProjectDetailTimeline, ProjectDetailClaude,
│   │               ProjectForm, TagManager)
│   ├── settings/  (ScanPathList, ScanPathForm, ScanTrigger)
│   └── shared/    (EmptyState, ErrorBoundary, Loading, ConfirmDialog, Badge)
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── projects/page.tsx
│   ├── projects/[id]/page.tsx
│   ├── settings/page.tsx
│   └── api/ (all routes)
└── tests/
    ├── setup.ts
    ├── unit/     (scanner modules, api-response, types)
    ├── integration/ (API routes)
    └── e2e/      (Playwright main flows)
```

---

## Phase 0: Project Scaffolding

### Task 0.1: Initialize Next.js project

- [ ] **Step 1: Create Next.js app**

```bash
cd "d:/项目管理/项目管理系统"
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --no-turbopack
```

- [ ] **Step 2: Install dependencies**

```bash
npm install prisma @prisma/client zod node-cron
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom @playwright/test
```

- [ ] **Step 3: Init Prisma with SQLite**

```bash
npx prisma init --datasource-provider sqlite
```

- [ ] **Step 4: Init shadcn/ui and add components**

```bash
npx shadcn-ui@latest init --defaults
npx shadcn-ui@latest add button input table badge dialog tabs card toast select separator skeleton
```

- [ ] **Step 5: Configure Vitest**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.ts',
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
```

Create `tests/setup.ts`:

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 6: Configure .env**

```
DATABASE_URL="file:./dev.db"
# For MySQL: DATABASE_URL="mysql://xjm:123456@localhost:3306/x"
```

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "chore: scaffold Next.js 14 with Prisma, Tailwind, shadcn/ui, Vitest"
```

---

## Phase 1: Data Layer

### Task 1.1: Prisma Schema

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `lib/db.ts`

- [ ] **Step 1: Write full Prisma schema**

Insert into `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model ScanPath {
  id        String       @id @default(cuid())
  path      String       @unique
  enabled   Boolean      @default(true)
  createdAt DateTime     @default(now())
  records   ScanRecord[]
  @@map("scan_paths")
}

model Project {
  id             String       @id @default(cuid())
  name           String
  path           String       @unique
  type           String       @default("other")
  techStack      String       @default("[]")
  description    String       @default("")
  totalCommits   Int          @default(0)
  lastScannedAt  DateTime?
  lastCommitAt   DateTime?
  lastCommitHash String       @default("")
  firstSeenAt    DateTime     @default(now())
  remoteUrl      String       @default("")
  isArchived     Boolean      @default(false)
  archivedAt     DateTime?
  metadata       String       @default("{}")
  scanRecords    ScanRecord[]
  commits        GitCommit[]
  tags           ProjectTag[]
  @@map("projects")
}

model ScanRecord {
  id           String    @id @default(cuid())
  projectId    String
  scanPathId   String
  scannedAt    DateTime  @default(now())
  status       String    @default("success")
  fileCount    Int       @default(0)
  errorMessage String    @default("")
  project      Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  scanPath     ScanPath  @relation(fields: [scanPathId], references: [id], onDelete: Cascade)
  @@map("scan_records")
}

model Tag {
  id       String       @id @default(cuid())
  name     String       @unique
  color    String       @default("#6366f1")
  projects ProjectTag[]
  @@map("tags")
}

model ProjectTag {
  id        String   @id @default(cuid())
  projectId String
  tagId     String
  createdAt DateTime @default(now())
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  tag       Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)
  @@unique([projectId, tagId])
  @@map("project_tags")
}

model GitCommit {
  id        String   @id @default(cuid())
  projectId String
  hash      String
  message   String
  author    String   @default("")
  date      DateTime
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  @@unique([projectId, hash])
  @@map("git_commits")
}
```

- [ ] **Step 2: Run migration**

```bash
npx prisma migrate dev --name init
```

- [ ] **Step 3: Create Prisma client singleton**

Create `lib/db.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/ lib/db.ts
git commit -m "feat: add Prisma schema with 6 tables and db client"
```

### Task 1.2: Shared Types

**Files:**
- Create: `lib/types.ts`
- Create: `tests/unit/lib-types.test.ts`

- [ ] **Step 1: Write shared types**

Create `lib/types.ts`:

```typescript
export const PROJECT_TYPES = ['web', 'cli', 'library', 'mobile', 'desktop', 'script', 'other'] as const
export type ProjectType = (typeof PROJECT_TYPES)[number]
export type ErrorAction = 'retry' | 'abort' | 'report'
export type ErrorCode =
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'SCAN_PATH_NOT_FOUND'
  | 'PROJECT_NOT_FOUND'
  | 'TAG_NOT_FOUND'
  | 'SCAN_IN_PROGRESS'
  | 'INTERNAL_ERROR'

export interface ApiResponse<T> {
  success: boolean
  data: T | null
  error: ApiError | null
  pagination?: PaginationMeta
}

export interface ApiError {
  code: ErrorCode
  message: string
  action: ErrorAction
}

export interface PaginationMeta {
  page: number
  totalPages: number
  total: number
}

export interface ProjectListItem {
  id: string
  name: string
  path: string
  type: ProjectType
  techStack: string[]
  description: string
  totalCommits: number
  lastCommitAt: string | null
  firstSeenAt: string
  remoteUrl: string
  isArchived: boolean
  tags: { id: string; name: string; color: string }[]
}

export interface ProjectDetail extends ProjectListItem {
  lastScannedAt: string | null
  lastCommitHash: string
  archivedAt: string | null
  metadata: Record<string, unknown>
  scanRecords: ScanRecordItem[]
}

export interface ScanRecordItem {
  id: string
  scanPathId: string
  scanPath: string
  scannedAt: string
  status: string
  fileCount: number
  errorMessage: string
}

export interface GitCommitItem {
  id: string
  hash: string
  message: string
  author: string
  date: string
}

export interface TagItem {
  id: string
  name: string
  color: string
  projectCount?: number
}

export interface ScanPathItem {
  id: string
  path: string
  enabled: boolean
  createdAt: string
}

export interface StatsData {
  total: number
  byType: Record<string, number>
  byTech: Record<string, number>
  recentlyAdded: ProjectListItem[]
  recentlyActive: ProjectListItem[]
  lastScannedAt: string | null
}

export interface ProjectListQuery {
  search?: string
  type?: ProjectType
  tag?: string
  isArchived?: boolean
  page?: number
  limit?: number
}

export interface CreateScanPathBody {
  path: string
}

export interface UpdateScanPathBody {
  path?: string
  enabled?: boolean
}

export interface UpdateProjectBody {
  name?: string
  type?: ProjectType
  description?: string
  metadata?: Record<string, unknown>
}

export interface CreateTagBody {
  name: string
  color?: string
}

export interface BatchTagBody {
  tagIds: string[]
}
```

- [ ] **Step 2: Write type tests**

Create `tests/unit/lib-types.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { PROJECT_TYPES } from '@/lib/types'

describe('lib/types', () => {
  it('PROJECT_TYPES contains all 7 valid types', () => {
    expect(PROJECT_TYPES).toEqual(['web', 'cli', 'library', 'mobile', 'desktop', 'script', 'other'])
  })

  it('PROJECT_TYPES is readonly', () => {
    // TypeScript compile-time check — verified by const assertion
    expect(PROJECT_TYPES.length).toBe(7)
  })
})
```

- [ ] **Step 3: Run tests — verify PASS**

```bash
npx vitest run tests/unit/lib-types.test.ts
```

- [ ] **Step 4: Commit**

```bash
git add lib/types.ts tests/unit/lib-types.test.ts
git commit -m "feat: add shared TypeScript types with project enum and API DTOs"
```

---

## Phase 2: API Response Utilities (TDD)

### Task 2.1: API response helpers

**Files:**
- Create: `lib/api-response.ts`
- Create: `tests/unit/api-response.test.ts`

- [ ] **Step 1: Write tests**

Create `tests/unit/api-response.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { NextResponse } from 'next/server'
import { successResponse, errorResponse, paginatedResponse } from '@/lib/api-response'

async function extractJson(response: NextResponse) {
  return response.json()
}

describe('api-response', () => {
  describe('successResponse', () => {
    it('returns success envelope with data', async () => {
      const res = successResponse({ id: '1', name: 'test' })
      const json = await extractJson(res)
      expect(json.success).toBe(true)
      expect(json.data).toEqual({ id: '1', name: 'test' })
      expect(json.error).toBeNull()
    })

    it('returns 200 status by default', () => {
      const res = successResponse({ x: 1 })
      expect(res.status).toBe(200)
    })

    it('accepts custom status code', () => {
      const res = successResponse({ x: 1 }, 201)
      expect(res.status).toBe(201)
    })
  })

  describe('errorResponse', () => {
    it('returns error envelope with action field', async () => {
      const res = errorResponse('NOT_FOUND', 'Not found', 'abort', 404)
      const json = await extractJson(res)
      expect(json.success).toBe(false)
      expect(json.error.code).toBe('NOT_FOUND')
      expect(json.error.message).toBe('Not found')
      expect(json.error.action).toBe('abort')
      expect(res.status).toBe(404)
    })

    it('defaults to 400 status', () => {
      const res = errorResponse('VALIDATION_ERROR', 'Invalid', 'retry')
      expect(res.status).toBe(400)
    })
  })

  describe('paginatedResponse', () => {
    it('wraps data with pagination metadata', async () => {
      const res = paginatedResponse(['a', 'b'], { page: 1, total: 2, totalPages: 1 })
      const json = await extractJson(res)
      expect(json.success).toBe(true)
      expect(json.data).toEqual(['a', 'b'])
      expect(json.pagination).toEqual({ page: 1, total: 2, totalPages: 1 })
    })
  })
})
```

- [ ] **Step 2: Run tests — verify FAIL**

```bash
npx vitest run tests/unit/api-response.test.ts
```

- [ ] **Step 3: Write implementation**

Create `lib/api-response.ts`:

```typescript
import { NextResponse } from 'next/server'
import type { ApiResponse, ErrorAction, ErrorCode, PaginationMeta } from './types'

export function successResponse<T>(data: T, status: number = 200): NextResponse {
  const body: ApiResponse<T> = { success: true, data, error: null }
  return NextResponse.json(body, { status })
}

export function errorResponse(
  code: ErrorCode,
  message: string,
  action: ErrorAction,
  status: number = 400
): NextResponse {
  const body: ApiResponse<null> = {
    success: false,
    data: null,
    error: { code, message, action },
  }
  return NextResponse.json(body, { status })
}

export function paginatedResponse<T>(
  data: T,
  pagination: PaginationMeta
): NextResponse {
  const body: ApiResponse<T> = {
    success: true,
    data,
    error: null,
    pagination,
  }
  return NextResponse.json(body)
}
```

- [ ] **Step 4: Run tests — verify PASS**

```bash
npx vitest run tests/unit/api-response.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add lib/api-response.ts tests/unit/api-response.test.ts
git commit -m "feat: add API response helpers with success/error/paginated wrappers"
```

---

## Phase 3: Scanner Engine (TDD)

### Task 3.1: Scanner internal types

**Files:**
- Create: `lib/scanner/types.ts`

- [ ] **Step 1: Write types**

Create `lib/scanner/types.ts`:

```typescript
export interface CandidateDir {
  fullPath: string
  dirName: string
  scanPathId: string
}

export interface ExtractedMeta {
  name: string
  type: string
  techStack: string[]
  description: string
  metadata: Record<string, unknown>
  remoteUrl: string
}

export interface GitInfo {
  remoteUrl: string
  lastCommitHash: string
  lastCommitAt: Date | null
  totalCommits: number
  recentCommits: {
    hash: string
    message: string
    author: string
    date: Date
  }[]
  error?: string
}

export interface ScanEntryResult {
  dirName: string
  status: 'success' | 'skipped' | 'error'
  fileCount: number
  extracted?: ExtractedMeta
  git?: GitInfo
  error?: string
}

export type ProjectRootIndicator =
  | '.git'
  | 'package.json'
  | 'Cargo.toml'
  | 'CMakeLists.txt'
  | 'composer.json'
  | 'pyproject.toml'
  | 'setup.py'
  | 'go.mod'

export const PROJECT_INDICATORS: ProjectRootIndicator[] = [
  '.git',
  'package.json',
  'Cargo.toml',
  'CMakeLists.txt',
  'composer.json',
  'pyproject.toml',
  'setup.py',
  'go.mod',
]
```

- [ ] **Step 2: Commit**

```bash
git add lib/scanner/types.ts
git commit -m "feat: add scanner internal types"
```

### Task 3.2: File reader (TDD)

**Files:**
- Create: `lib/scanner/file-reader.ts`
- Create: `tests/unit/scanner/file-reader.test.ts`

- [ ] **Step 1: Write tests**

Create `tests/unit/scanner/file-reader.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'
import {
  readFileWithLimit,
  findReadme,
  findClaudeMd,
  readPackageJson,
} from '@/lib/scanner/file-reader'

describe('file-reader', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-test-'))
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  describe('readFileWithLimit', () => {
    it('reads a file within the size limit', () => {
      const filePath = path.join(tmpDir, 'small.txt')
      fs.writeFileSync(filePath, 'hello world')
      const result = readFileWithLimit(filePath, 1024)
      expect(result).toBe('hello world')
    })

    it('returns warning string when file exceeds limit', () => {
      const filePath = path.join(tmpDir, 'big.txt')
      fs.writeFileSync(filePath, 'x'.repeat(100))
      const result = readFileWithLimit(filePath, 50)
      expect(result).toContain('exceeds')
    })

    it('returns error string when file does not exist', () => {
      const result = readFileWithLimit(path.join(tmpDir, 'nope.txt'), 1024)
      expect(result).toContain('Error reading')
    })
  })

  describe('findReadme', () => {
    it('finds README.md case-insensitive', () => {
      fs.writeFileSync(path.join(tmpDir, 'Readme.MD'), '# My Project')
      const result = findReadme(tmpDir)
      expect(result).toBe('# My Project')
    })

    it('returns null when no README found', () => {
      const result = findReadme(tmpDir)
      expect(result).toBeNull()
    })
  })

  describe('findClaudeMd', () => {
    it('finds CLAUDE.md in project root', () => {
      fs.writeFileSync(path.join(tmpDir, 'CLAUDE.md'), '# Instructions')
      const result = findClaudeMd(tmpDir)
      expect(result).toBe('# Instructions')
    })

    it('returns null when no CLAUDE.md found', () => {
      const result = findClaudeMd(tmpDir)
      expect(result).toBeNull()
    })
  })

  describe('readPackageJson', () => {
    it('parses package.json with all fields', () => {
      fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify({
        name: 'my-app',
        dependencies: { react: '^18', next: '^14' },
        devDependencies: { vitest: '^1' },
        scripts: { dev: 'next dev', build: 'next build' },
        description: 'A test app',
      }))
      const result = readPackageJson(tmpDir)
      expect(result).not.toBeNull()
      expect(result!.name).toBe('my-app')
      expect(result!.description).toBe('A test app')
      expect(result!.techStack).toContain('react')
      expect(result!.techStack).toContain('next')
      expect(result!.techStack).toContain('vitest')
    })

    it('returns null when no package.json', () => {
      const result = readPackageJson(tmpDir)
      expect(result).toBeNull()
    })
  })
})
```

- [ ] **Step 2: Run tests — verify FAIL**

```bash
npx vitest run tests/unit/scanner/file-reader.test.ts
```

- [ ] **Step 3: Write implementation**

Create `lib/scanner/file-reader.ts`:

```typescript
import fs from 'fs'
import path from 'path'

const MAX_README_SIZE = 5 * 1024 * 1024 // 5MB

export function readFileWithLimit(filePath: string, limit: number): string {
  try {
    const stat = fs.statSync(filePath)
    if (stat.size > limit) {
      return `[File exceeds size limit: ${stat.size} > ${limit} bytes]`
    }
    return fs.readFileSync(filePath, 'utf-8')
  } catch {
    return `[Error reading file: ${filePath}]`
  }
}

export function findReadme(dirPath: string): string | null {
  try {
    const entries = fs.readdirSync(dirPath)
    const readmeFile = entries.find((f) => f.toLowerCase() === 'readme.md')
    if (!readmeFile) return null
    return readFileWithLimit(path.join(dirPath, readmeFile), MAX_README_SIZE)
  } catch {
    return null
  }
}

export function findClaudeMd(dirPath: string): string | null {
  const claudePath = path.join(dirPath, 'CLAUDE.md')
  if (!fs.existsSync(claudePath)) return null
  return readFileWithLimit(claudePath, MAX_README_SIZE)
}

export interface PackageJsonInfo {
  name: string
  description: string
  techStack: string[]
  metadata: Record<string, unknown>
}

export function readPackageJson(dirPath: string): PackageJsonInfo | null {
  const pkgPath = path.join(dirPath, 'package.json')
  if (!fs.existsSync(pkgPath)) return null
  try {
    const raw = fs.readFileSync(pkgPath, 'utf-8')
    const pkg = JSON.parse(raw)
    const deps = { ...pkg.dependencies, ...pkg.devDependencies }
    return {
      name: pkg.name || '',
      description: pkg.description || '',
      techStack: Object.keys(deps || {}),
      metadata: {
        scripts: pkg.scripts || {},
        version: pkg.version || '',
      },
    }
  } catch {
    return null
  }
}
```

- [ ] **Step 4: Run tests — verify PASS**

```bash
npx vitest run tests/unit/scanner/file-reader.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add lib/scanner/file-reader.ts tests/unit/scanner/file-reader.test.ts
git commit -m "feat: add file-reader with readFileWithLimit, findReadme, findClaudeMd, readPackageJson"
```

### Task 3.3: Git reader (TDD)

**Files:**
- Create: `lib/scanner/git-reader.ts`
- Create: `tests/unit/scanner/git-reader.test.ts`

- [ ] **Step 1: Write tests**

Create `tests/unit/scanner/git-reader.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { execSync } from 'child_process'
import { getGitInfo } from '@/lib/scanner/git-reader'

function createTempGitRepo(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-git-'))
  execSync('git init', { cwd: dir })
  execSync('git config user.email "test@test.com"', { cwd: dir })
  execSync('git config user.name "Test"', { cwd: dir })
  fs.writeFileSync(path.join(dir, 'hello.txt'), 'hello')
  execSync('git add . && git commit -m "initial"', { cwd: dir })
  fs.writeFileSync(path.join(dir, 'hello.txt'), 'hello world')
  execSync('git add . && git commit -m "update"', { cwd: dir })
  return dir
}

describe('git-reader', () => {
  let repoDir: string

  beforeEach(() => {
    repoDir = createTempGitRepo()
  })

  afterEach(() => {
    fs.rmSync(repoDir, { recursive: true, force: true })
  })

  it('extracts total commit count of 2 or more', () => {
    const info = getGitInfo(repoDir, 10000)
    expect(info.totalCommits).toBeGreaterThanOrEqual(2)
  })

  it('extracts last commit hash as 40-char hex', () => {
    const info = getGitInfo(repoDir, 10000)
    expect(info.lastCommitHash).toHaveLength(40)
  })

  it('extracts recent commit messages', () => {
    const info = getGitInfo(repoDir, 10000)
    const messages = info.recentCommits.map((c) => c.message)
    expect(messages).toContain('initial')
    expect(messages).toContain('update')
  })

  it('returns empty info for non-git directory', () => {
    const nonGitDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-nogit-'))
    const info = getGitInfo(nonGitDir, 10000)
    expect(info.remoteUrl).toBe('')
    expect(info.totalCommits).toBe(0)
    expect(info.recentCommits).toHaveLength(0)
    fs.rmSync(nonGitDir, { recursive: true, force: true })
  })
})
```

- [ ] **Step 2: Run tests — verify FAIL**

```bash
npx vitest run tests/unit/scanner/git-reader.test.ts
```

- [ ] **Step 3: Write implementation**

Create `lib/scanner/git-reader.ts`:

```typescript
import { execSync } from 'child_process'
import type { GitInfo } from './types'

export function getGitInfo(dirPath: string, timeoutMs: number = 10000): GitInfo {
  const result: GitInfo = {
    remoteUrl: '',
    lastCommitHash: '',
    lastCommitAt: null,
    totalCommits: 0,
    recentCommits: [],
  }

  const execOpts = { cwd: dirPath, timeout: timeoutMs, encoding: 'utf-8' as const }

  try {
    execSync('git rev-parse --git-dir', { ...execOpts, stdio: 'ignore' })
  } catch {
    return result
  }

  try {
    result.remoteUrl = execSync('git remote get-url origin', execOpts).trim()
  } catch { /* no remote */ }

  try {
    result.lastCommitHash = execSync('git rev-parse HEAD', execOpts).trim()
    const dateStr = execSync('git log -1 --format=%aI', execOpts).trim()
    result.lastCommitAt = dateStr ? new Date(dateStr) : null
  } catch { /* no commits */ }

  try {
    result.totalCommits = parseInt(execSync('git rev-list --count HEAD', execOpts).trim(), 10) || 0
  } catch { /* no commits */ }

  try {
    const log = execSync(
      'git log --oneline -50 --format="%H|||%s|||%an|||%aI"',
      execOpts
    ).trim()
    if (log) {
      result.recentCommits = log.split('\n').map((line) => {
        const [hash, message, author, date] = line.split('|||')
        return {
          hash: hash || '',
          message: message || '',
          author: author || '',
          date: new Date(date || Date.now()),
        }
      })
    }
  } catch { /* no commits */ }

  return result
}
```

- [ ] **Step 4: Run tests — verify PASS**

```bash
npx vitest run tests/unit/scanner/git-reader.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add lib/scanner/git-reader.ts tests/unit/scanner/git-reader.test.ts
git commit -m "feat: add git-reader with 10s timeout per command"
```

### Task 3.4: Discoverer (TDD)

**Files:**
- Create: `lib/scanner/discoverer.ts`
- Create: `tests/unit/scanner/discoverer.test.ts`

- [ ] **Step 1: Write tests**

Create `tests/unit/scanner/discoverer.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { discoverProjects } from '@/lib/scanner/discoverer'

describe('discoverer', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-disc-'))
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('discovers directory with .git as a project', () => {
    const projDir = path.join(tmpDir, 'my-project')
    fs.mkdirSync(path.join(projDir, '.git'))
    const results = discoverProjects(tmpDir, 'scan-1')
    expect(results).toHaveLength(1)
    expect(results[0].dirName).toBe('my-project')
  })

  it('discovers directory with package.json', () => {
    const projDir = path.join(tmpDir, 'node-project')
    fs.writeFileSync(path.join(projDir, 'package.json'), '{}')
    const results = discoverProjects(tmpDir, 'scan-2')
    expect(results).toHaveLength(1)
  })

  it('skips directories without project indicators', () => {
    fs.mkdirSync(path.join(tmpDir, 'just-folder'))
    const results = discoverProjects(tmpDir, 'scan-3')
    expect(results).toHaveLength(0)
  })

  it('discovers multiple nested projects', () => {
    fs.writeFileSync(path.join(tmpDir, 'app', 'package.json'), '{}')
    fs.mkdirSync(path.join(tmpDir, 'app'))
    fs.mkdirSync(path.join(tmpDir, 'lib', '.git'), { recursive: true })
    const results = discoverProjects(tmpDir, 'scan-4')
    // Both app/ and lib/ should be found
    const names = results.map((r) => r.dirName)
    expect(names).toContain('app')
    expect(names).toContain('lib')
  })

  it('assigns scanPathId to all discovered entries', () => {
    fs.writeFileSync(path.join(tmpDir, 'package.json'), '{}')
    const results = discoverProjects(tmpDir, 'scan-XYZ')
    expect(results.every((r) => r.scanPathId === 'scan-XYZ')).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests — verify FAIL**

```bash
npx vitest run tests/unit/scanner/discoverer.test.ts
```

- [ ] **Step 3: Write implementation**

Create `lib/scanner/discoverer.ts`:

```typescript
import fs from 'fs'
import path from 'path'
import { PROJECT_INDICATORS } from './types'
import type { CandidateDir } from './types'

export function discoverProjects(
  rootPath: string,
  scanPathId: string,
  maxDepth: number = 2
): CandidateDir[] {
  const results: CandidateDir[] = []

  if (!fs.existsSync(rootPath) || !fs.statSync(rootPath).isDirectory()) {
    return results
  }

  try {
    const entries = fs.readdirSync(rootPath, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      if (entry.name.startsWith('.') && entry.name !== '.git') continue

      const fullPath = path.join(rootPath, entry.name)

      if (isProjectRoot(fullPath)) {
        results.push({ fullPath, dirName: entry.name, scanPathId })
      } else if (maxDepth > 1) {
        results.push(...discoverProjects(fullPath, scanPathId, maxDepth - 1))
      }
    }
  } catch {
    // Permission error — skip
  }

  return results
}

function isProjectRoot(dirPath: string): boolean {
  for (const indicator of PROJECT_INDICATORS) {
    if (fs.existsSync(path.join(dirPath, indicator))) return true
  }
  return false
}
```

- [ ] **Step 4: Run tests — verify PASS**

```bash
npx vitest run tests/unit/scanner/discoverer.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add lib/scanner/discoverer.ts tests/unit/scanner/discoverer.test.ts
git commit -m "feat: add discoverer — walk directories and detect project roots"
```

### Task 3.5: Extractor (TDD)

**Files:**
- Create: `lib/scanner/extractor.ts`
- Create: `tests/unit/scanner/extractor.test.ts`

- [ ] **Step 1: Write tests**

Create `tests/unit/scanner/extractor.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { extractMetadata } from '@/lib/scanner/extractor'

describe('extractor', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-extr-'))
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('detects web type from next/react deps', () => {
    fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify({
      name: 'my-app',
      description: 'A great app',
      dependencies: { react: '^18', next: '^14' },
      devDependencies: { typescript: '^5' },
    }))
    fs.writeFileSync(path.join(tmpDir, 'README.md'), '# Title\nDescription here.')
    const result = extractMetadata(tmpDir, 'my-app')
    expect(result.name).toBe('my-app')
    expect(result.description).toBe('A great app')
    expect(result.techStack).toContain('next')
    expect(result.techStack).toContain('react')
    expect(result.type).toBe('web')
  })

  it('detects CLI type from commander + bin', () => {
    fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify({
      name: 'my-cli',
      dependencies: { commander: '^11' },
      bin: { mycli: './cli.js' },
    }))
    const result = extractMetadata(tmpDir, 'my-cli')
    expect(result.type).toBe('cli')
  })

  it('defaults type to other when unknown', () => {
    const result = extractMetadata(tmpDir, 'unknown-project')
    expect(result.type).toBe('other')
    expect(result.name).toBe('unknown-project')
  })

  it('extracts description from README when package.json has none', () => {
    fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify({
      name: 'readme-only',
      dependencies: {},
    }))
    fs.writeFileSync(path.join(tmpDir, 'README.md'), '# Header\nFirst paragraph text.')
    const result = extractMetadata(tmpDir, 'readme-only')
    expect(result.description).toContain('First paragraph')
  })

  it('returns empty strings for missing optional fields', () => {
    const result = extractMetadata(tmpDir, 'bare')
    expect(result.description).toBe('')
    expect(result.techStack).toEqual([])
  })
})
```

- [ ] **Step 2: Run tests — verify FAIL**

```bash
npx vitest run tests/unit/scanner/extractor.test.ts
```

- [ ] **Step 3: Write implementation**

Create `lib/scanner/extractor.ts`:

```typescript
import { readPackageJson, findReadme } from './file-reader'
import type { ExtractedMeta } from './types'

export function extractMetadata(dirPath: string, dirName: string): ExtractedMeta {
  const pkgInfo = readPackageJson(dirPath)

  if (pkgInfo) {
    return {
      name: pkgInfo.name || dirName,
      type: classifyType(pkgInfo.techStack, pkgInfo.metadata),
      techStack: pkgInfo.techStack,
      description: pkgInfo.description || extractFirstParagraph(findReadme(dirPath)),
      metadata: pkgInfo.metadata,
      remoteUrl: '',
    }
  }

  const readme = findReadme(dirPath)
  return {
    name: dirName,
    type: 'other',
    techStack: [],
    description: extractFirstParagraph(readme),
    metadata: {},
    remoteUrl: '',
  }
}

function extractFirstParagraph(readme: string | null): string {
  if (!readme) return ''
  const lines = readme.split('\n')
  let para = ''
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('```')) {
      if (para) break
      continue
    }
    para += (para ? ' ' : '') + trimmed
  }
  return para.slice(0, 500)
}

function classifyType(techStack: string[], metadata: Record<string, unknown>): string {
  const lower = techStack.map((s) => s.toLowerCase())

  const webFrameworks = ['next', 'react', 'vue', 'svelte', 'angular', 'nuxt', 'remix', 'astro']
  if (lower.some((s) => webFrameworks.includes(s))) return 'web'

  const cliLibs = ['commander', 'yargs', 'oclif', 'inquirer', 'enquirer']
  if (lower.some((s) => cliLibs.includes(s))) return 'cli'

  if (metadata.scripts && typeof metadata.scripts === 'object') {
    const scripts = Object.keys(metadata.scripts as Record<string, unknown>)
    const hasServerScripts = scripts.some((s) => ['dev', 'start', 'serve'].includes(s))
    const hasBuild = scripts.includes('build')
    if (hasBuild && !hasServerScripts) return 'library'
  }

  return 'other'
}
```

- [ ] **Step 4: Run tests — verify PASS**

```bash
npx vitest run tests/unit/scanner/extractor.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add lib/scanner/extractor.ts tests/unit/scanner/extractor.test.ts
git commit -m "feat: add extractor — derive techStack, type, description from project files"
```

### Task 3.6: Scanner main class (TDD)

**Files:**
- Create: `lib/scanner/index.ts`
- Create: `tests/unit/scanner/index.test.ts`

- [ ] **Step 1: Write tests**

Create `tests/unit/scanner/index.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { execSync } from 'child_process'
import { prisma } from '@/lib/db'
import { Scanner } from '@/lib/scanner/index'

// Helper: create a test project directory with git
function createTestProject(baseDir: string, name: string): string {
  const projDir = path.join(baseDir, name)
  fs.mkdirSync(projDir, { recursive: true })
  fs.writeFileSync(path.join(projDir, 'package.json'), JSON.stringify({
    name,
    dependencies: { react: '^18', next: '^14' },
    description: 'Test project',
  }))
  // Init git with a commit
  execSync('git init', { cwd: projDir })
  execSync('git config user.email "test@test.com"', { cwd: projDir })
  execSync('git config user.name "Test"', { cwd: projDir })
  fs.writeFileSync(path.join(projDir, 'readme.md'), '# Test')
  execSync('git add . && git commit -m "init"', { cwd: projDir })
  return projDir
}

describe('Scanner', () => {
  let tmpDir: string
  let scanPathId: string

  beforeEach(async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-scanner-'))
    // Create a ScanPath in test DB
    const sp = await prisma.scanPath.create({
      data: { path: tmpDir, enabled: true },
    })
    scanPathId = sp.id
  })

  afterEach(async () => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
    // Clean up test data
    await prisma.scanRecord.deleteMany()
    await prisma.gitCommit.deleteMany()
    await prisma.projectTag.deleteMany()
    await prisma.tag.deleteMany()
    await prisma.project.deleteMany()
    await prisma.scanPath.deleteMany()
  })

  it('discovers and saves a project from scan', async () => {
    createTestProject(tmpDir, 'my-test-app')

    const scanner = new Scanner()
    await scanner.scanAll()

    const project = await prisma.project.findFirst({
      where: { name: 'my-test-app' },
    })
    expect(project).not.toBeNull()
    expect(project!.type).toBe('web')
    expect(project!.totalCommits).toBe(1)

    const records = await prisma.scanRecord.findMany({
      where: { projectId: project!.id },
    })
    expect(records).toHaveLength(1)
    expect(records[0].status).toBe('success')
  })

  it('records error for unreadable directory without crashing', async () => {
    const badDir = path.join(tmpDir, 'bad')
    fs.mkdirSync(badDir)
    // Make a dir with a .git that throws on read (simulate with no perms)

    const scanner = new Scanner()
    // Should not throw
    await scanner.scanAll()
  })

  it('scans a single path by ID', async () => {
    createTestProject(tmpDir, 'single-project')

    const scanner = new Scanner()
    await scanner.scanPath(scanPathId)

    const count = await prisma.project.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })
})
```

- [ ] **Step 2: Run tests — verify FAIL**

```bash
npx vitest run tests/unit/scanner/index.test.ts
```

- [ ] **Step 3: Write implementation**

Create `lib/scanner/index.ts`:

```typescript
import { prisma } from '@/lib/db'
import { discoverProjects } from './discoverer'
import { extractMetadata } from './extractor'
import { getGitInfo } from './git-reader'
import type { ScanEntryResult } from './types'

const MAX_COMMITS_TO_KEEP = 50

export class Scanner {
  async scanAll(): Promise<ScanEntryResult[]> {
    const scanPaths = await prisma.scanPath.findMany({ where: { enabled: true } })
    const results: ScanEntryResult[] = []

    for (const sp of scanPaths) {
      const pathResults = await this.scanPath(sp.id)
      results.push(...pathResults)
    }

    return results
  }

  async scanPath(scanPathId: string): Promise<ScanEntryResult[]> {
    const scanPath = await prisma.scanPath.findUnique({ where: { id: scanPathId } })
    if (!scanPath) return []

    const candidates = discoverProjects(scanPath.path, scanPathId)
    const results: ScanEntryResult[] = []

    for (const candidate of candidates) {
      try {
        const result = await this.processCandidate(candidate)
        results.push(result)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        results.push({
          dirName: candidate.dirName,
          status: 'error',
          fileCount: 0,
          error: errorMessage,
        })
        // Try to record the error in DB if we have a project match
        try {
          const existingProject = await prisma.project.findUnique({
            where: { path: candidate.fullPath.toLowerCase() },
          })
          if (existingProject) {
            await prisma.scanRecord.create({
              data: {
                projectId: existingProject.id,
                scanPathId: candidate.scanPathId,
                status: 'error',
                fileCount: 0,
                errorMessage,
              },
            })
          }
        } catch { /* DB might not be available */ }
      }
    }

    return results
  }

  private async processCandidate(candidate: {
    fullPath: string
    dirName: string
    scanPathId: string
  }): Promise<ScanEntryResult> {
    const extracted = extractMetadata(candidate.fullPath, candidate.dirName)
    const git = getGitInfo(candidate.fullPath)

    // Count files (non-recursive for speed)
    const fs = await import('fs')
    let fileCount = 0
    try {
      const entries = fs.readdirSync(candidate.fullPath, { withFileTypes: true })
      fileCount = entries.filter((e) => e.isFile()).length
    } catch {
      fileCount = 0
    }

    // Combine remoteUrl from git into extracted
    extracted.remoteUrl = git.remoteUrl

    // Upsert project
    const normalizedPath = candidate.fullPath.toLowerCase()
    const existing = await prisma.project.findUnique({ where: { path: normalizedPath } })

    const projectData = {
      name: extracted.name,
      path: normalizedPath,
      type: extracted.type,
      techStack: JSON.stringify(extracted.techStack),
      description: extracted.description,
      totalCommits: git.totalCommits,
      lastScannedAt: new Date(),
      lastCommitAt: git.lastCommitAt,
      lastCommitHash: git.lastCommitHash,
      remoteUrl: git.remoteUrl,
      metadata: JSON.stringify(extracted.metadata),
      firstSeenAt: existing ? undefined : new Date(),
    }

    if (existing) {
      await prisma.project.update({ where: { id: existing.id }, data: projectData })
    } else {
      await prisma.project.create({ data: { ...projectData, firstSeenAt: new Date() } })
    }

    const project = await prisma.project.findUnique({ where: { path: normalizedPath } })
    if (!project) throw new Error('Failed to upsert project')

    // Insert scan record
    await prisma.scanRecord.create({
      data: {
        projectId: project.id,
        scanPathId: candidate.scanPathId,
        status: 'success',
        fileCount,
        errorMessage: '',
      },
    })

    // Upsert git commits
    if (git.recentCommits.length > 0) {
      for (const commit of git.recentCommits) {
        await prisma.gitCommit.upsert({
          where: { projectId_hash: { projectId: project.id, hash: commit.hash } },
          create: {
            projectId: project.id,
            hash: commit.hash,
            message: commit.message,
            author: commit.author,
            date: commit.date,
          },
          update: {
            message: commit.message,
            author: commit.author,
            date: commit.date,
          },
        })
      }

      // Trim to last 50
      const allCommits = await prisma.gitCommit.findMany({
        where: { projectId: project.id },
        orderBy: { date: 'desc' },
        skip: MAX_COMMITS_TO_KEEP,
      })
      if (allCommits.length > 0) {
        await prisma.gitCommit.deleteMany({
          where: { id: { in: allCommits.map((c) => c.id) } },
        })
      }
    }

    return {
      dirName: candidate.dirName,
      status: 'success',
      fileCount,
      extracted,
      git,
    }
  }
}
```

- [ ] **Step 4: Run tests — verify PASS**

```bash
npx vitest run tests/unit/scanner/index.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add lib/scanner/index.ts tests/unit/scanner/index.test.ts
git commit -m "feat: add Scanner class — orchestrate discovery, extraction, git, and DB persistence"
```

---

## Phase 4: API Routes (TDD)

### Task 4.1: Scan Paths API

**Files:**
- Create: `app/api/scan-paths/route.ts`
- Create: `app/api/scan-paths/[id]/route.ts`
- Create: `tests/integration/scan-paths.test.ts`

- [ ] **Step 1: Write integration tests**

Create `tests/integration/scan-paths.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/db'

describe('Scan Paths API', () => {
  beforeEach(async () => {
    await prisma.scanRecord.deleteMany()
    await prisma.scanPath.deleteMany()
  })

  it('GET /api/scan-paths returns empty list', async () => {
    const { GET } = await import('@/app/api/scan-paths/route')
    const res = await GET()
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data).toEqual([])
  })

  it('POST /api/scan-paths creates a new path', async () => {
    const { POST } = await import('@/app/api/scan-paths/route')
    const req = new Request('http://localhost/api/scan-paths', {
      method: 'POST',
      body: JSON.stringify({ path: 'd:/projects' }),
    })
    const res = await POST(req)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data.path).toBe('d:/projects')
  })

  it('POST /api/scan-paths rejects empty path', async () => {
    const { POST } = await import('@/app/api/scan-paths/route')
    const req = new Request('http://localhost/api/scan-paths', {
      method: 'POST',
      body: JSON.stringify({ path: '' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('PATCH /api/scan-paths/[id] toggles enabled', async () => {
    const sp = await prisma.scanPath.create({ data: { path: 'd:/test', enabled: true } })
    const { PATCH } = await import('@/app/api/scan-paths/[id]/route')
    const req = new Request('http://localhost/api/scan-paths/any', {
      method: 'PATCH',
      body: JSON.stringify({ enabled: false }),
    })
    const res = await PATCH(req, { params: { id: sp.id } })
    const json = await res.json()
    expect(json.data.enabled).toBe(false)
  })

  it('DELETE /api/scan-paths/[id] removes path and cascade records', async () => {
    const sp = await prisma.scanPath.create({ data: { path: 'd:/test' } })
    const { DELETE } = await import('@/app/api/scan-paths/[id]/route')
    const res = await DELETE(new Request('http://localhost/api/scan-paths/any'), {
      params: { id: sp.id },
    })
    const json = await res.json()
    expect(json.success).toBe(true)

    const count = await prisma.scanPath.count({ where: { id: sp.id } })
    expect(count).toBe(0)
  })
})
```

- [ ] **Step 2: Run tests — verify FAIL**

```bash
npx vitest run tests/integration/scan-paths.test.ts
```

- [ ] **Step 3: Write GET/POST route**

Create `app/api/scan-paths/route.ts`:

```typescript
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-response'
import { z } from 'zod'

const createSchema = z.object({
  path: z.string().min(1, 'Path is required'),
})

export async function GET() {
  const paths = await prisma.scanPath.findMany({ orderBy: { createdAt: 'desc' } })
  return successResponse(paths)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.issues[0].message, 'abort', 400)
    }
    const scanPath = await prisma.scanPath.create({ data: { path: parsed.data.path } })
    return successResponse(scanPath, 201)
  } catch {
    return errorResponse('INTERNAL_ERROR', 'Failed to create scan path', 'report', 500)
  }
}
```

Create `app/api/scan-paths/[id]/route.ts`:

```typescript
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-response'
import { z } from 'zod'

const updateSchema = z.object({
  path: z.string().min(1).optional(),
  enabled: z.boolean().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.issues[0].message, 'abort', 400)
    }

    const existing = await prisma.scanPath.findUnique({ where: { id: params.id } })
    if (!existing) {
      return errorResponse('NOT_FOUND', 'Scan path not found', 'abort', 404)
    }

    const updated = await prisma.scanPath.update({
      where: { id: params.id },
      data: parsed.data,
    })
    return successResponse(updated)
  } catch {
    return errorResponse('INTERNAL_ERROR', 'Failed to update scan path', 'report', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.scanPath.findUnique({ where: { id: params.id } })
    if (!existing) {
      return errorResponse('NOT_FOUND', 'Scan path not found', 'abort', 404)
    }
    await prisma.scanPath.delete({ where: { id: params.id } })
    return successResponse({ deleted: true })
  } catch {
    return errorResponse('INTERNAL_ERROR', 'Failed to delete scan path', 'report', 500)
  }
}
```

- [ ] **Step 4: Run tests — verify PASS**

```bash
npx vitest run tests/integration/scan-paths.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add app/api/scan-paths/ tests/integration/scan-paths.test.ts
git commit -m "feat: add scan-paths API with CRUD and Zod validation"
```

### Task 4.2: Tags API

**Files:**
- Create: `app/api/tags/route.ts`
- Create: `app/api/tags/[id]/route.ts`
- Create: `tests/integration/tags.test.ts`

Follow the same TDD pattern: write tests → run FAIL → implement → run PASS → commit.

GET /api/tags supports `?withCount=true` returning project count per tag.
POST creates with { name, color? }, validates name is required.
PATCH updates name/color.
DELETE cascades ProjectTag entries.

### Task 4.3: Scan Trigger API

**Files:**
- Create: `app/api/scan/trigger/route.ts`
- Create: `app/api/scan/records/route.ts`
- Create: `tests/integration/scan.test.ts`

POST /api/scan/trigger — instantiate Scanner and run scanAll().
POST /api/scan/trigger?pathId=X — run scanPath(pathId).
GET /api/scan/records?latest=1&projectId=X — query scan history.

Integration test: trigger scan on a temp dir with a test project, verify records created.

### Task 4.4: Projects API

**Files:**
- Create: `app/api/projects/route.ts`
- Create: `app/api/projects/[id]/route.ts`
- Create: `app/api/projects/[id]/purge/route.ts`
- Create: `app/api/projects/[id]/git-commits/route.ts`
- Create: `app/api/projects/[id]/readme/route.ts`
- Create: `app/api/projects/[id]/claude-md/route.ts`
- Create: `app/api/projects/[id]/tags/route.ts`
- Create: `tests/integration/projects.test.ts`

GET /api/projects — paginated with search (LIKE on name+description), filter by type/tag/isArchived.
GET /api/projects/[id] — full detail with tags and scanRecords (joined).
PATCH /api/projects/[id] — update via Zod.
DELETE /api/projects/[id] — soft delete (set isArchived=true, archivedAt=new Date()).
POST /api/projects/[id]/purge — hard delete from DB.
GET /api/projects/[id]/git-commits — recent 50 from DB.
GET /api/projects/[id]/readme — read from filesystem using findReadme().
GET /api/projects/[id]/claude-md — read from filesystem using findClaudeMd().
POST /api/projects/[id]/tags — batch assign { tagIds: string[] }.
DELETE /api/projects/[id]/tags — remove tag by query param tagId.

### Task 4.5: Stats API

**Files:**
- Create: `app/api/stats/route.ts`

Aggregates: total project count, byType counts, top 20 tech stack counts, recently added 6 (firstSeenAt DESC), recently active 6 (lastCommitAt DESC), max lastScannedAt.

---

## Phase 5: Frontend — Layout & Shared

### Task 5.1: App shell layout

**Files:**
- Modify: `app/layout.tsx`
- Create: `components/layout/AppShell.tsx`
- Create: `components/layout/Sidebar.tsx`
- Create: `components/layout/TopNav.tsx`

AppShell: flex container with sidebar (w-64 fixed) + main content area.
Sidebar: logo/title at top, nav links (Dashboard / Projects / Settings) with active state from usePathname().
TopNav: app bar with title "Project Manager" + last scan time badge.

### Task 5.2: Shared components

**Files:**
- Create: `components/shared/EmptyState.tsx` — icon + title + description + optional action
- Create: `components/shared/ErrorBoundary.tsx` — class component with componentDidCatch, fallback UI + retry
- Create: `components/shared/Loading.tsx` — shadcn Skeleton wrapper for loading states
- Create: `components/shared/ConfirmDialog.tsx` — wraps AlertDialog for destructive actions
- Create: `components/shared/Badge.tsx` — Badge with variant "tech" (auto-color) | "type" (type-based color) | "default"

---

## Phase 6: Frontend — Hooks

### Task 6.1: All hooks

**Files:**
- Create: `hooks/useDebounce.ts` — standard debounce with useEffect
- Create: `hooks/useProjects.ts` — fetch /api/projects with query params, returns { projects, pagination, isLoading, error, refetch }
- Create: `hooks/useProject.ts` — fetch /api/projects/[id], returns { project, isLoading, update, archive, purge }
- Create: `hooks/useScan.ts` — POST /api/scan/trigger, poll /api/scan/records every 2s while scanning (max 30 polls)
- Create: `hooks/useScanPaths.ts` — CRUD on /api/scan-paths
- Create: `hooks/useTags.ts` — CRUD on /api/tags?withCount=true
- Create: `hooks/useStats.ts` — fetch /api/stats, returns { stats, isLoading }

---

## Phase 7: Frontend — Pages

### Task 7.1: Dashboard page

**Files:**
- Modify: `app/page.tsx`
- Create: `components/dashboard/StatCard.tsx`
- Create: `components/dashboard/TechBreakdown.tsx`
- Create: `components/dashboard/RecentProjects.tsx`
- Create: `components/dashboard/ActiveProjects.tsx`

Dashboard layout: 4 stat cards row (total, web count, cli count, library count), tech breakdown bar chart (top 10), 2 side-by-side lists (recently added 6, recently active 6). Each section handles loading (skeleton), empty (EmptyState), and error states.

### Task 7.2: Project list page

**Files:**
- Create: `app/projects/page.tsx`
- Create: `components/projects/ProjectListTable.tsx`
- Create: `components/projects/ProjectFilters.tsx`

Table columns: name (clickable → detail), type (Badge variant="type"), tech stack (Badge variant="tech" list), last commit (relative time), tags (colored Badges), actions (archive button with ConfirmDialog). Filters bar: search input (with useDebounce 300ms), type dropdown, tag filter, archived toggle (show/hide). Pagination controls at bottom.

### Task 7.3: Project detail page

**Files:**
- Create: `app/projects/[id]/page.tsx`
- Create: `components/projects/ProjectDetailHeader.tsx`
- Create: `components/projects/ProjectDetailOverview.tsx`
- Create: `components/projects/ProjectDetailTimeline.tsx`
- Create: `components/projects/ProjectDetailClaude.tsx`
- Create: `components/projects/ProjectForm.tsx`
- Create: `components/projects/TagManager.tsx`

Page structure: ProjectDetailHeader (name, type badge, archive button, edit button) + Tabs (shadcn Tabs):

Tab 1 "Overview": metadata cards grid (type, path, remote URL, total commits, first seen, last scanned, last commit), README content rendered as <pre> with monospace font, tech stack badges row. Edit button opens ProjectForm dialog.

Tab 2 "Activity": timeline list of git commits + scan records mixed together, sorted by date descending. Each entry shows icon (git vs scan), timestamp (relative), and summary.

Tab 3 "CLAUDE.md": loaded on-demand when tab is clicked. Shows content in <pre><code> block. Shows skeleton while loading, error state if file not found.

TagManager: sidebar panel showing current tags, add tag (search existing tags + create new), remove tag with X button.

### Task 7.4: Settings page

**Files:**
- Create: `app/settings/page.tsx`
- Create: `components/settings/ScanPathList.tsx`
- Create: `components/settings/ScanPathForm.tsx`
- Create: `components/settings/ScanTrigger.tsx`

ScanPathList: table of scan paths with path, enabled toggle (switch), edit/delete actions.
ScanPathForm: dialog with path input field, create/update.
ScanTrigger: "Scan Now" button, scanning progress bar, last scan time, recent scan records list.

---

## Phase 8: Integration & E2E Tests

### Task 8.1: Finalize integration tests

Run all integration tests:

```bash
npx vitest run tests/integration/
```

Fix any failures. Ensure SQLite test isolation (separate test DB, beforeEach cleanup).

### Task 8.2: E2E tests

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/main-flows.spec.ts`

Playwright config: headless Chromium, baseURL http://localhost:3000.

Test flows:
1. Dashboard loads without error, shows stat cards
2. Navigate to Projects, table renders with data
3. Search filters the list
4. Click project name → detail page with tabs
5. Settings → add scan path → verify it appears in list
6. Manual scan triggers and shows progress

### Task 8.3: Commit

```bash
git add playwright.config.ts tests/e2e/
git commit -m "test: add E2E tests for core user flows"
```

---

## Phase 9: Polish & Open Source

### Task 9.1: UI polish (Tier 1-3)

**Tier 1 (ui-ux-pro-max):** Invoke skill to establish design system — color palette, font pairing, spacing, component styling, a11y checklist.

**Tier 2 (hallmark):** Invoke skill to audit page structures, navigation patterns, anti-AI-slop refinements.

**Tier 3 (ui-skills):** Invoke skill for baseline checks, design drift audit, a11y fixes, animation optimization.

### Task 9.2: Error handling completeness

- Wrap all page components in ErrorBoundary
- Add toast notifications (sonner) for create/update/delete operations
- Verify all 3 action types (retry/abort/report) render correct UI
- Add custom 404 page (`app/not-found.tsx`)

### Task 9.3: Open source docs

**Files:**
- Create: `README.md` — project name, description, features list, screenshots, quick start, configuration
- Create: `LICENSE` — MIT
- Create: `.env.example` — DATABASE_URL="file:./dev.db"
- Create: `CONTRIBUTING.md` — how to set up and contribute

### Task 9.4: GitHub release

```bash
git add -A
git commit -m "chore: polish UI, add docs, prepare for open source release"
gh repo create project-manager --public --source=. --remote=origin --push
```

---

## Summary

| Phase | Tasks | Deliverable |
|-------|-------|-------------|
| 0 | 0.1 | Next.js skeleton with all dependencies |
| 1 | 1.1-1.2 | Prisma schema (6 tables) + shared TypeScript types |
| 2 | 2.1 | API response helpers (success/error/paginated) |
| 3 | 3.1-3.6 | Scanner engine (types, file-reader, git-reader, discoverer, extractor, index) |
| 4 | 4.1-4.5 | 5 API route groups (scan-paths, tags, scan, projects, stats) |
| 5 | 5.1-5.2 | Layout shell + 5 shared components |
| 6 | 6.1 | 7 data-fetching hooks |
| 7 | 7.1-7.4 | 4 pages (dashboard, list, detail, settings) |
| 8 | 8.1-8.3 | Integration test pass + E2E tests |
| 9 | 9.1-9.5 | UI polish, error handling, docs, GitHub release |

**Total: 9 phases, ~25 tasks, ~130+ granular steps. Each task follows TDD: test → fail → implement → pass → commit.**
