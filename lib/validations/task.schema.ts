import { z } from 'zod'

const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] as const
const PRIORITIES = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'] as const

export const createTaskSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string().max(5000).optional(),
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(PRIORITIES).optional(),
  assigneeId: z.string().optional().nullable(),
  position: z.number().int().min(0).optional(),
  dueDate: z.string().datetime().optional(),
})

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).optional(),
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(PRIORITIES).optional(),
  assigneeId: z.string().optional().nullable(),
  position: z.number().int().min(0).optional(),
  dueDate: z.string().datetime().optional(),
})

export const taskQuerySchema = z.object({
  projectId: z.string().optional(),
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(PRIORITIES).optional(),
  myTasks: z.coerce.boolean().optional(),
  assigneeId: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
})
