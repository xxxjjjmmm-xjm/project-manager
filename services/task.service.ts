import { prisma } from '@/lib/db'
import { AppError } from '@/lib/errors/AppError'
import type { Prisma } from '@prisma/client'

interface CreateTaskInput {
  projectId: string
  title: string
  description?: string
  status?: string
  priority?: string
  assigneeId?: string
  creatorId: string
  dueDate?: string
  position?: number
}

interface UpdateTaskInput {
  title?: string
  description?: string
  status?: string
  priority?: string
  assigneeId?: string | null
  dueDate?: string | null
}

interface ListTasksParams {
  projectId: string
  status?: string
  priority?: string
  assigneeId?: string
  search?: string
  page?: number
  limit?: number
}

export async function listTasks(params: ListTasksParams) {
  const {
    projectId,
    status,
    priority,
    assigneeId,
    search,
    page = 1,
    limit = 50,
  } = params
  const where: Prisma.TaskWhereInput = { projectId }

  if (status) where.status = status
  if (priority) where.priority = priority
  if (assigneeId) where.assigneeId = assigneeId
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ]
  }

  const [items, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        creator: { select: { id: true, name: true, avatarUrl: true } },
        tags: { include: { tag: true } },
      },
      orderBy: { position: 'asc' },
    }),
    prisma.task.count({ where }),
  ])

  return { items, total, page, totalPages: Math.ceil(total / limit) }
}

export async function getTask(id: string) {
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      creator: { select: { id: true, name: true, avatarUrl: true } },
      comments: {
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
      tags: { include: { tag: true } },
      assets: { orderBy: { createdAt: 'desc' } },
    },
  })
  if (!task) {
    throw new AppError('NOT_FOUND', 'Task not found', 'abort', 404)
  }
  return task
}

export async function createTask(input: CreateTaskInput) {
  const { projectId, title, description, priority, assigneeId, creatorId, dueDate } =
    input

  // Verify project exists
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) {
    throw new AppError('NOT_FOUND', 'Project not found', 'abort', 404)
  }

  // Determine position (place at end)
  const maxPosition = await prisma.task.findFirst({
    where: { projectId },
    orderBy: { position: 'desc' },
    select: { position: true },
  })
  const position =
    input.position ?? (maxPosition ? maxPosition.position + 1 : 0)

  return prisma.task.create({
    data: {
      projectId,
      title,
      description: description || '',
      status: input.status || 'TODO',
      priority: priority || 'MEDIUM',
      assigneeId: assigneeId || null,
      creatorId,
      position,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    },
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      creator: { select: { id: true, name: true, avatarUrl: true } },
      tags: { include: { tag: true } },
    },
  })
}

export async function updateTask(id: string, input: UpdateTaskInput) {
  const existing = await prisma.task.findUnique({ where: { id } })
  if (!existing) {
    throw new AppError('NOT_FOUND', 'Task not found', 'abort', 404)
  }

  const data: Prisma.TaskUncheckedUpdateInput = {}
  if (input.title !== undefined) data.title = input.title
  if (input.description !== undefined) data.description = input.description
  if (input.status !== undefined) data.status = input.status
  if (input.priority !== undefined) data.priority = input.priority
  if (input.assigneeId !== undefined) data.assigneeId = input.assigneeId
  if (input.dueDate !== undefined)
    data.dueDate = input.dueDate ? new Date(input.dueDate) : null

  return prisma.task.update({
    where: { id },
    data,
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      creator: { select: { id: true, name: true, avatarUrl: true } },
      tags: { include: { tag: true } },
    },
  })
}

export async function deleteTask(id: string) {
  const existing = await prisma.task.findUnique({ where: { id } })
  if (!existing) {
    throw new AppError('NOT_FOUND', 'Task not found', 'abort', 404)
  }

  return prisma.task.delete({ where: { id } })
}

export async function reorderTask(id: string, position: number) {
  const existing = await prisma.task.findUnique({ where: { id } })
  if (!existing) {
    throw new AppError('NOT_FOUND', 'Task not found', 'abort', 404)
  }

  return prisma.task.update({
    where: { id },
    data: { position },
  })
}
