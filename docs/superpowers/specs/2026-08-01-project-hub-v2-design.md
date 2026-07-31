# Project Hub — 设计规格说明书 v2

**日期:** 2026-08-01 | **状态:** 已确认 | **作者:** xjm

---

## 1. 产品定位

从本地开发项目追踪器升级为通用项目管理 SaaS。支持手动创建 + 扫描导入双入口、多用户权限、任务 Kanban、日历、文件管理。扫描引擎保留为可选 Import Plugin。

参考: Linear · Notion · Asana · Vercel Dashboard

---

## 2. 视觉设计

| 层级 | 色值 | 用途 |
|------|------|------|
| 主背景 | `#09090B` | 页面、Sidebar |
| 卡片 | `#111113` | Card、Panel |
| 悬浮 | `#18181B` | Hover、Dialog |
| 边框 | `rgba(255,255,255,0.06)` | 全局 |
| Primary | `#3B82F6` | 按钮、链接 |
| Accent | `#8B5CF6` | 渐变、高亮 |
| 渐变 | blue-600→violet-500→cyan-400 | Logo、Hero |

语义色: 成功`#22C55E` 警告`#EAB308` 危险`#EF4444` 进行中`#8B5CF6`

Card: `rounded-2xl bg-[#111113] border-white/[0.06]`, Glass 仅 Dashboard 统计卡。字体: Inter + PingFang SC (UI), Fira Code (code)。

---

## 3. 导航

Sidebar w-60: 首页控制台 / 项目中心 / 我的任务 / 日历 / 团队成员 / 文件管理 / 搜索 / 设置。底部保留语言+主题切换。

---

## 4. 数据模型 (14 表)

**核心:** User, Workspace, WorkspaceMember, Project (status enum: PLANNING|IN_PROGRESS|REVIEW|COMPLETED|DELAYED|AT_RISK), ProjectMember, Task (status: TODO|IN_PROGRESS|REVIEW|DONE, priority: URGENT|HIGH|MEDIUM|LOW), Comment, Activity (metadata JSON), Asset (storageProvider, storageKey)

**标签:** Tag, ProjectTag, TaskTag

**Import Plugin (保留):** ScanPath, ScanRecord

---

## 5. 页面 (8 路由)

| `/` | 首页控制台 | StatGrid + ProjectHealth + TodayTasks + Deadlines + ActivityFeed |
| `/projects` | 项目中心 | 左ProjectList + 右DetailPanel |
| `/projects/[id]` | 详情 | Tab: Overview/Kanban/Files/Activity/Settings |
| `/tasks` | 我的任务 | 跨项目聚合 + FilterSidebar |
| `/calendar` | 日历 | CalendarGrid |
| `/team` | 团队 | MemberCard网格 + invite |
| `/files` | 文件 | 左FileList + 右预览 |
| `/search` | 搜索 | CommandMenu (⌘K) |
| `/settings` | 设置 | Account/Workspace/Members/Appearance/Integrations/Data |

---

## 6. 技术架构

```
app/  components/  hooks/  services/  lib/{auth,permissions,validations,errors,i18n,theme,plugins}/
prisma/{schema.prisma,seed.ts}  storage/{uploads,thumbnails,temp}/

分层: route.ts → Zod → Service Layer → Prisma
      permissions.check() 在每个 Service 调用前

状态: SWR (server) + Context (client)
缓存: keys/*.keys.ts 统一规范
文件: V1 Local, V2 S3/R2
数据库: V1 SQLite, V2 PostgreSQL
```

---

## 7. 实施阶段

| 1 | Prisma Schema v2 + Seed |
| 2 | Service Layer + API |
| 3 | Design System 视觉升级 |
| 4 | Dashboard |
| 5 | 项目中心 + 详情 |
| 6 | 任务 + 日历 |
| 7 | 团队 + 文件 + 搜索 |
| 8 | Auth + Permission + Import Plugin |
| 9 | E2E + GitHub 更新 |
