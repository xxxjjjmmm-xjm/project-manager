import { prisma } from '@/lib/db'

export async function getDashboardStats(workspaceId: string) {
  const [
    totalProjects,
    activeProjects,
    totalTasks,
    completedTasks,
    totalMembers,
  ] = await Promise.all([
    prisma.project.count({
      where: { workspaceId, isArchived: false },
    }),
    prisma.project.count({
      where: {
        workspaceId,
        isArchived: false,
        status: { in: ['IN_PROGRESS', 'REVIEW'] },
      },
    }),
    prisma.task.count({
      where: { project: { workspaceId, isArchived: false } },
    }),
    prisma.task.count({
      where: {
        project: { workspaceId, isArchived: false },
        status: 'DONE',
      },
    }),
    prisma.workspaceMember.count({
      where: { workspaceId },
    }),
  ])

  // Project status distribution
  const statusDistribution = await prisma.project.groupBy({
    by: ['status'],
    where: { workspaceId, isArchived: false },
    _count: { id: true },
  })

  // Task priority distribution
  const priorityDistribution = await prisma.task.groupBy({
    by: ['priority'],
    where: { project: { workspaceId, isArchived: false } },
    _count: { id: true },
  })

  return {
    totalProjects,
    activeProjects,
    totalTasks,
    completedTasks,
    completionRate:
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    totalMembers,
    statusDistribution: statusDistribution.map((s) => ({
      status: s.status,
      count: s._count.id,
    })),
    priorityDistribution: priorityDistribution.map((p) => ({
      priority: p.priority,
      count: p._count.id,
    })),
  }
}

export async function getTodayTasks(workspaceId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return prisma.task.findMany({
    where: {
      project: { workspaceId, isArchived: false },
      dueDate: {
        gte: today,
        lt: tomorrow,
      },
      status: { not: 'DONE' },
    },
    include: {
      project: { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { priority: 'asc' },
  })
}

export async function getUpcomingDeadlines(
  workspaceId: string,
  daysAhead: number = 7
) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const deadline = new Date(today)
  deadline.setDate(deadline.getDate() + daysAhead)

  const [projects, tasks] = await Promise.all([
    prisma.project.findMany({
      where: {
        workspaceId,
        isArchived: false,
        dueDate: { gte: today, lte: deadline },
      },
      select: {
        id: true,
        name: true,
        dueDate: true,
        status: true,
        progress: true,
        owner: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: 'asc' },
    }),
    prisma.task.findMany({
      where: {
        project: { workspaceId, isArchived: false },
        dueDate: { gte: today, lte: deadline },
        status: { not: 'DONE' },
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { dueDate: 'asc' },
    }),
  ])

  return { projects, tasks }
}
