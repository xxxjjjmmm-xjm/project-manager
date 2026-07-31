# Project Hub — 项目管理平台

**影视制作 / 团队项目管理 SaaS.** A full-featured team project management platform built with Next.js 14. Track projects, kanban tasks, calendar deadlines, team members, files, and global search — powered by JWT auth, i18n (中/EN) and a dark tech design system.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](#)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](#)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748)](#)
[![License](https://img.shields.io/badge/License-MIT-green)](#)

> **Demo login:** `demo@projecthub.dev` / `demo1234` — the app also works without logging in (anonymous dev fallback).

## Features

- **看板 Kanban** — Drag-and-drop task board with TODO / IN_PROGRESS / REVIEW / DONE columns per project.
- **月历 Calendar** — Month view with project and task deadline pills; jump to today.
- **团队与文件管理 Team & Files** — Workspace members with roles (OWNER / ADMIN / MEMBER / VIEWER) and file upload/storage.
- **全局搜索 ⌘K** — Instant full-text search across projects, tasks and files from the top bar or `/search`.
- **导入插件扫描 Import Plugin** — Scan local project paths to discover and track projects (lib/plugins/scanner).
- **JWT 认证** — Login/register/logout + `/api/auth/me`, session cookie (7-day) with anonymous dev fallback.
- **i18n 中英** — Chinese (default) and English UI dictionaries.
- **深色科技设计 Dark-tech UI** — Gradient accents, glassmorphism, shadcn/ui design system.

## Tech Stack

| Layer       | Technology                                                                 |
|-------------|----------------------------------------------------------------------------|
| Framework   | Next.js 14 (App Router)                                                    |
| Language    | TypeScript                                                                 |
| Styling     | Tailwind CSS + shadcn/ui                                                   |
| ORM         | Prisma — SQLite (dev) / MySQL via phpstudy / PostgreSQL (v2)               |
| Data        | SWR (client-side fetching)                                                 |
| Validation  | Zod                                                                        |
| E2E Tests   | Playwright (auto-boots `next dev` on :3456)                                |
| Unit Tests  | Vitest                                                                     |

## Quick Start

```bash
npm install --registry=https://registry.npmmirror.com --ignore-scripts
./node_modules/.bin/prisma migrate deploy
./node_modules/.bin/prisma generate
node_modules/.bin/tsx prisma/seed.ts
npm run dev
```

Open http://localhost:3000 (or the port printed by `next dev`). Log in with `demo@projecthub.dev` / `demo1234`, or browse anonymously.

Seed data (deterministic): 1 user, 1 workspace, 3 projects (**Website Redesign** / **Mobile App** / **Internal Tools**), 5 tasks, 2 tags.

### Database

- **SQLite (default):** `DATABASE_URL="file:./dev.db"` in `.env`.
- **MySQL (phpstudy):** `DATABASE_URL="mysql://user:pass@localhost:3306/dbname"`.
- **PostgreSQL:** planned for v2.

## Project Structure

```
app/          Next.js App Router pages + API routes (24 routes)
components/   React components (layout, dashboard, projects, tasks, calendar, team, files, settings, ui)
hooks/        SWR data hooks + custom hooks (useDashboard, useProject, useTasks, ...)
services/     Business logic / data access layer
lib/          Auth, i18n, plugins/scanner, validations, errors, api-response
prisma/       Schema + migrations + deterministic seed
storage/      File uploads (local storage provider)
plugins/      (scanner lives under lib/plugins/scanner)
```

## Scripts

| Command                        | Description                                   |
|--------------------------------|-----------------------------------------------|
| `npm run dev`                  | Start the dev server                          |
| `npm run build`                | Production build (`next build`)               |
| `npm run start`                | Start the production server                   |
| `npm test`                     | Unit tests (Vitest, 19 tests in tests/unit)   |
| `npm run test:e2e`             | E2E tests (Playwright, auto-boots the app)    |

### E2E coverage

`tests/e2e/` covers all 8 pages + settings + auth APIs (18 tests): dashboard, projects, project detail (kanban), tasks, calendar, team, files, search, settings, and `/api/auth/*`. The suite runs `prisma/seed.ts` in `tests/global-setup.ts` and boots `next dev -p 3456` automatically.

## Screenshots

> Screenshots to be added.

| Page                | Path             |
|---------------------|------------------|
| Dashboard           | `/`              |
| Projects            | `/projects`      |
| Project Detail (Kanban) | `/projects/[id]` |
| Tasks               | `/tasks`         |
| Calendar            | `/calendar`      |
| Team                | `/team`          |
| Files               | `/files`         |
| Search              | `/search`        |
| Settings            | `/settings`      |

## License

MIT — see [LICENSE](LICENSE).
