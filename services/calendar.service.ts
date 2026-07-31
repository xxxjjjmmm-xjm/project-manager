import { prisma } from '@/lib/db'
import { AppError } from '@/lib/errors/AppError'

const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/

export async function getCalendarEvents(workspaceId: string, month: string) {
  // month format: "YYYY-MM"
  if (!MONTH_REGEX.test(month)) {
    throw new AppError(
      'VALIDATION_ERROR',
      'Invalid month format, expected YYYY-MM',
      'abort',
      400
    )
  }

  const [year, monthIndex] = month.split('-').map(Number)
  const startOfMonth = new Date(year, monthIndex - 1, 1)
  const endOfMonth = new Date(year, monthIndex, 0, 23, 59, 59, 999)

  const [tasks, projects] = await Promise.all([
    prisma.task.findMany({
      where: {
        project: { workspaceId, isArchived: false },
        dueDate: { gte: startOfMonth, lte: endOfMonth },
      },
      select: {
        id: true,
        projectId: true,
        title: true,
        status: true,
        priority: true,
        dueDate: true,
        assigneeId: true,
      },
      orderBy: { dueDate: 'asc' },
    }),
    prisma.project.findMany({
      where: {
        workspaceId,
        isArchived: false,
        dueDate: { gte: startOfMonth, lte: endOfMonth },
      },
      select: {
        id: true,
        name: true,
        status: true,
        dueDate: true,
      },
      orderBy: { dueDate: 'asc' },
    }),
  ])

  return { tasks, projects }
}
