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

// ─── Dashboard (Phase 4) ───

export interface DashboardStatusEntry {
  status: string
  count: number
}

export interface DashboardPriorityEntry {
  priority: string
  count: number
}

export interface DashboardStats {
  totalProjects: number
  activeProjects: number
  totalTasks: number
  completedTasks: number
  completionRate: number
  totalMembers: number
  statusDistribution: DashboardStatusEntry[]
  priorityDistribution: DashboardPriorityEntry[]
}

export interface DashboardTask {
  id: string
  title: string
  status: string
  priority: string
  dueDate: string | null
  project: { id: string; name: string } | null
  assignee: { id: string; name: string; avatarUrl: string } | null
}

export interface DashboardProjectDeadline {
  id: string
  name: string
  dueDate: string | null
  status: string
  progress: number
  owner: { id: string; name: string } | null
}

export interface DashboardTaskDeadline {
  id: string
  title: string
  status: string
  priority: string
  dueDate: string | null
  project: { id: string; name: string } | null
  assignee: { id: string; name: string; avatarUrl: string } | null
}

export interface DeadlineData {
  projects: DashboardProjectDeadline[]
  tasks: DashboardTaskDeadline[]
}

export interface ActivityItem {
  id: string
  action: string
  targetType: string
  targetId: string
  metadata: string
  createdAt: string
  actor: { id: string; name: string; avatarUrl: string } | null
}
