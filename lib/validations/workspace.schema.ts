import { z } from 'zod'

export const workspaceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).optional(),
  avatarUrl: z.union([z.string().url('Invalid URL'), z.literal('')]).optional(),
})
