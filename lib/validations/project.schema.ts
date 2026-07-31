import { z } from 'zod'

const PROJECT_STATUSES = ['PLANNING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'DELAYED', 'AT_RISK'] as const
const PRIORITIES = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'] as const

export const createProjectSchema = z.object({
  // Auth lands in Phase 8 — server defaults until then
  workspaceId: z.string().min(1).optional().default('default-workspace'),
  ownerId: z.string().min(1).optional().default('default-user'),
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(PROJECT_STATUSES).optional(),
  priority: z.enum(PRIORITIES).optional(),
  dueDate: z.string().datetime().optional(),
})

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(PROJECT_STATUSES).optional(),
  priority: z.enum(PRIORITIES).optional(),
  progress: z.number().int().min(0).max(100).optional(),
  startDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
})

export const projectQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(PROJECT_STATUSES).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
})
