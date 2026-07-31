# Project Manager

A local development project tracker that scans directories, discovers git projects, and provides search/browse/detail views. Built with Next.js 14.

## Features

- **Auto-Discovery** — Scan directories for projects by `.git`, `package.json`, `Cargo.toml`, etc.
- **Rich Metadata** — Auto-extracts tech stack, project type, description, and git history
- **Search & Filter** — Full-text search across name/description, filter by type, tags, archive status
- **Project Detail** — View README, git history, scan records, and CLAUDE.md on demand
- **Tag System** — Organize projects with custom colored tags
- **Dual Database** — SQLite (zero-config) or MySQL

## Quick Start

```bash
git clone https://github.com/xxxjjjmmm-xjm/project-manager.git
cd project-manager
npm install --ignore-scripts
npx prisma generate
npx prisma db push
npm run dev
```

Open http://localhost:3000. Add a scan path in Settings, trigger a scan, and browse.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| ORM | Prisma (SQLite / MySQL) |
| UI | React + Tailwind CSS + shadcn/ui |
| Testing | Vitest + Playwright |
| Validation | Zod |

## Configuration

Default uses SQLite (zero config). To use MySQL:

```
DATABASE_URL="mysql://user:password@localhost:3306/dbname"
```

### Scan Paths

Add directories via the Settings page or API:

```bash
curl -X POST http://localhost:3000/api/scan-paths \
  -H "Content-Type: application/json" \
  -d '{"path":"/home/user/projects"}'
```

### Scheduled Scanning

```bash
# External cron (every 6 hours)
0 */6 * * * curl -X POST http://localhost:3000/api/scan/trigger
```

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stats` | GET | Dashboard aggregations |
| `/api/scan-paths` | CRUD | Manage scan directories |
| `/api/scan/trigger` | POST | Trigger manual scan |
| `/api/scan/records` | GET | Query scan history |
| `/api/projects` | GET | Paginated list with search/filter |
| `/api/projects/[id]` | CRUD | Detail, update, archive |
| `/api/projects/[id]/readme` | GET | Live README from filesystem |
| `/api/projects/[id]/claude-md` | GET | Live CLAUDE.md from filesystem |
| `/api/projects/[id]/git-commits` | GET | Recent 50 git commits |
| `/api/tags` | CRUD | Manage project tags |

Response format:

```json
{ "success": true, "data": {...}, "error": null, "pagination": {...} }
```

## Development

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm test           # Unit tests (Vitest)
npm run test:e2e   # E2E tests (Playwright)
```

## License

MIT — see [LICENSE](LICENSE)
