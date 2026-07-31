import { prisma } from '@/lib/db'
import { AppError } from '@/lib/errors/AppError'
import { canDeleteAsset } from '@/lib/permissions'

interface ListFilesParams {
  workspaceId: string
  search?: string
  projectId?: string
  taskId?: string
  page?: number
  limit?: number
}

interface CreateFileParams {
  workspaceId: string
  projectId?: string
  taskId?: string
  filename: string
  filePath: string
  storageKey: string
  mimeType: string
  sizeBytes: number
  uploadedById?: string
}

export async function listFiles(params: ListFilesParams) {
  const { workspaceId, search, projectId, taskId, page = 1, limit = 20 } = params
  const where: Record<string, unknown> = { workspaceId }
  if (search) where.filename = { contains: search }
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

export async function deleteFile(id: string, actorId?: string) {
  const existing = await prisma.asset.findUnique({ where: { id } })
  if (!existing) {
    throw new AppError('NOT_FOUND', 'File not found', 'abort', 404)
  }

  if (actorId) {
    const allowed = await canDeleteAsset(
      existing.workspaceId,
      actorId,
      existing.uploadedById
    )
    if (!allowed) {
      throw new AppError(
        'FORBIDDEN',
        'Only admins or the uploader can delete this file',
        'report',
        403
      )
    }
  }

  return prisma.asset.delete({ where: { id } })
}

export async function createFile(params: CreateFileParams) {
  const {
    workspaceId,
    projectId,
    taskId,
    filename,
    filePath,
    storageKey,
    mimeType,
    sizeBytes,
    uploadedById,
  } = params

  return prisma.asset.create({
    data: {
      workspaceId,
      projectId: projectId || null,
      taskId: taskId || null,
      filename,
      filePath,
      storageProvider: 'LOCAL',
      storageKey,
      mimeType,
      sizeBytes,
      uploadedById: uploadedById || 'default-user',
    },
    include: {
      uploader: { select: { id: true, name: true, avatarUrl: true } },
    },
  })
}
