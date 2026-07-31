export const PROJECT_TYPES = ['web', 'cli', 'library', 'mobile', 'desktop', 'script', 'other'] as const
export type ProjectType = (typeof PROJECT_TYPES)[number]
export type ErrorAction = 'retry' | 'abort' | 'report'
export type ErrorCode =
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'CONFLICT'
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

// ─── Phase 5: Projects split view + detail (Kanban) ───

export interface ProjectOwner {
  id: string
  name: string
  avatarUrl: string
}

export interface ProjectTagRef {
  id: string
  name: string
  color: string
}

export interface ProjectTagLink {
  id: string
  projectId: string
  tagId: string
  createdAt: string
  tag: ProjectTagRef
}

export interface ProjectMemberRef {
  id: string
  role: string
  user: ProjectOwner
}

export interface TaskAssigneeRef {
  id: string
  name: string
  avatarUrl: string
}

export interface TaskItem {
  id: string
  projectId: string
  title: string
  description: string
  status: string
  priority: string
  assigneeId: string | null
  creatorId: string
  position: number
  dueDate: string | null
  createdAt: string
  updatedAt: string
  assignee: TaskAssigneeRef | null
  creator: TaskAssigneeRef | null
}

export interface FileItem {
  id: string
  projectId: string | null
  taskId: string | null
  filename: string
  mimeType: string
  sizeBytes: number
  status: string
  createdAt: string
  uploader: TaskAssigneeRef | null
  /** Present on the full Asset row returned by the files API. */
  storageProvider?: string
  storageKey?: string
  filePath?: string
  uploadedById?: string
  updatedAt?: string
  project?: { id: string; name: string } | null
  task?: { id: string; title: string } | null
}

/** List item returned by GET /api/projects (members are optional — the list endpoint does not include them). */
export interface ProjectSummary {
  id: string
  name: string
  description: string
  type: string
  status: string
  priority: string
  progress: number
  startDate: string | null
  dueDate: string | null
  path: string
  isArchived: boolean
  owner: ProjectOwner | null
  tags: ProjectTagLink[]
  members?: ProjectMemberRef[]
}

/** Full project returned by GET /api/projects/[id]. */
export interface ProjectDetailData extends ProjectSummary {
  workspaceId: string
  ownerId: string
  techStack: string
  totalCommits: number
  lastScannedAt: string | null
  lastCommitAt: string | null
  lastCommitHash: string
  firstSeenAt: string
  remoteUrl: string
  archivedAt: string | null
  metadata: string
  createdAt: string
  updatedAt: string
  members: ProjectMemberRef[]
  tasks: TaskItem[]
  assets: FileItem[]
}

// ─── Phase 7: Team, Files & Search ───

export type TeamRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'

export interface TeamMember {
  id: string
  userId: string
  name: string
  email: string
  avatarUrl: string | null
  role: string
  openTasks: number
}

export interface SearchProjectResult {
  id: string
  name: string
  status: string
  dueDate: string | null
}

export interface SearchTaskResult {
  id: string
  projectId: string
  title: string
  status: string
  dueDate: string | null
}

export interface SearchFileResult {
  id: string
  filename: string
  mimeType: string
  sizeBytes: number
  createdAt: string
}

export interface SearchResults {
  projects: SearchProjectResult[]
  tasks: SearchTaskResult[]
  files: SearchFileResult[]
}
