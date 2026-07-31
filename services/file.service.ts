import { prisma } from '@/lib/db'
import { AppError } from '@/lib/errors/AppError'

interface ListFilesParams {
  workspaceId: string
  projectId?: string
  taskId?: string
  page?: number
  limit?: number
}

export async function listFiles(params: ListFilesParams) {
  const { workspaceId, projectId, taskId, page = 1, limit = 20 } = params
  const where: Record<string, unknown> = { workspaceId }
  if (projectId) where.projectId = projectId
  if (taskId) where.taskId = taskId

  const [items, total] = await Promise.all([
    prisma.asset.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        uploader: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.asset.count({ where }),
  ])

  return { items, total, page, totalPages: Math.ceil(total / limit) }
}

export async function getFile(id: string) {
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: {
      uploader: { select: { id: true, name: true, avatarUrl: true } },
      project: { select: { id: true, name: true } },
      task: { select: { id: true, title: true } },
    },
  })
  if (!asset) {
    throw new AppError('NOT_FOUND', 'File not found', 'abort', 404)
  }
  return asset
}

export async function deleteFile(id: string) {
  const existing = await prisma.asset.findUnique({ where: { id } })
  if (!existing) {
    throw new AppError('NOT_FOUND', 'File not found', 'abort', 404)
  }

  return prisma.asset.delete({ where: { id } })
}
