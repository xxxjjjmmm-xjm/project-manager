import { prisma } from '@/lib/db'
import { AppError } from '@/lib/errors/AppError'
import type { Prisma } from '@prisma/client'

interface CreateProjectInput {
  workspaceId: string
  ownerId: string
  name: string
  description?: string
  status?: string
  priority?: string
  dueDate?: string
}

interface UpdateProjectInput {
  name?: string
  description?: string
  status?: string
  priority?: string
  progress?: number
  startDate?: string
  dueDate?: string
}

interface ListProjectsParams {
  workspaceId: string
  search?: string
  status?: string
  page?: number
  limit?: number
}

export async function listProjects(params: ListProjectsParams) {
  const { workspaceId, search, status, page = 1, limit = 20 } = params
  const where: Prisma.ProjectWhereInput = { workspaceId, isArchived: false }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ]
  }
  if (status) where.status = status

  const [items, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true } },
        tags: { include: { tag: true } },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.project.count({ where }),
  ])

  return { items, total, page, totalPages: Math.ceil(total / limit) }
}

export async function getProject(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, avatarUrl: true } },
      members: {
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
      tasks: { take: 20, orderBy: { position: 'asc' } },
      tags: { include: { tag: true } },
      assets: { take: 20, orderBy: { createdAt: 'desc' } },
    },
  })
  if (!project) {
    throw new AppError('NOT_FOUND', 'Project not found', 'abort', 404)
  }
  return project
}

export async function createProject(input: CreateProjectInput) {
  const { workspaceId, ownerId, name, description, status, priority, dueDate } =
    input

  // Verify workspace exists
  const ws = await prisma.workspace.findUnique({ where: { id: workspaceId } })
  if (!ws) {
    throw new AppError('NOT_FOUND', 'Workspace not found', 'abort', 404)
  }

  return prisma.project.create({
    data: {
      workspaceId,
      ownerId,
      name,
      path: `manual://${workspaceId}/${Date.now()}`,
      description: description || '',
      status: status || 'PLANNING',
      priority: priority || 'MEDIUM',
      progress: 0,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    },
    include: { owner: { select: { id: true, name: true } } },
  })
}

export async function updateProject(id: string, input: UpdateProjectInput) {
  const existing = await prisma.project.findUnique({ where: { id } })
  if (!existing) {
    throw new AppError('NOT_FOUND', 'Project not found', 'abort', 404)
  }

  const data: Prisma.ProjectUpdateInput = {}
  if (input.name !== undefined) data.name = input.name
  if (input.description !== undefined) data.description = input.description
  if (input.status !== undefined) data.status = input.status
  if (input.priority !== undefined) data.priority = input.priority
  if (input.progress !== undefined) data.progress = input.progress
  if (input.startDate !== undefined)
    data.startDate = new Date(input.startDate)
  if (input.dueDate !== undefined) data.dueDate = new Date(input.dueDate)

  return prisma.project.update({
    where: { id },
    data,
    include: { owner: { select: { id: true, name: true } } },
  })
}

export async function archiveProject(id: string) {
  const existing = await prisma.project.findUnique({ where: { id } })
  if (!existing) {
    throw new AppError('NOT_FOUND', 'Project not found', 'abort', 404)
  }

  return prisma.project.update({
    where: { id },
    data: { isArchived: true, archivedAt: new Date() },
  })
}

export async function deleteProject(id: string) {
  const existing = await prisma.project.findUnique({ where: { id } })
  if (!existing) {
    throw new AppError('NOT_FOUND', 'Project not found', 'abort', 404)
  }

  return prisma.project.delete({ where: { id } })
}
