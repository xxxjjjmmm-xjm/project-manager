import { prisma } from '@/lib/db'
import { AppError } from '@/lib/errors/AppError'
import type { Prisma } from '@prisma/client'

interface UpdateWorkspaceInput {
  name?: string
  avatarUrl?: string
}

export async function getWorkspace(id: string) {
  const workspace = await prisma.workspace.findUnique({ where: { id } })
  if (!workspace) {
    throw new AppError('NOT_FOUND', 'Workspace not found', 'abort', 404)
  }
  return workspace
}

export async function updateWorkspace(id: string, input: UpdateWorkspaceInput) {
  const existing = await prisma.workspace.findUnique({ where: { id } })
  if (!existing) {
    throw new AppError('NOT_FOUND', 'Workspace not found', 'abort', 404)
  }

  const data: Prisma.WorkspaceUpdateInput = {}
  if (input.name !== undefined) data.name = input.name
  if (input.avatarUrl !== undefined) data.avatarUrl = input.avatarUrl

  return prisma.workspace.update({ where: { id }, data })
}
