import { z } from 'zod'

export const fileQuerySchema = z.object({
  search: z.string().optional(),
  projectId: z.string().optional(),
  taskId: z.string().optional(),
  status: z.enum(['UPLOADED', 'PROCESSING', 'AVAILABLE', 'ARCHIVED']).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
})
