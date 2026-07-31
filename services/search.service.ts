import { prisma } from '@/lib/db'

export async function globalSearch(
  workspaceId: string,
  q: string,
  limit: number = 10
) {
  if (!q.trim()) {
    return { projects: [], tasks: [], files: [] }
  }

  const query = q.trim()

  const [projects, tasks, files] = await Promise.all([
    prisma.project.findMany({
      where: {
        workspaceId,
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
        ],
      },
      take: limit,
      select: {
        id: true,
        name: true,
        status: true,
        dueDate: true,
      },
    }),
    prisma.task.findMany({
      where: {
        project: { workspaceId },
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
        ],
      },
      take: limit,
      select: {
        id: true,
        projectId: true,
        title: true,
        status: true,
        dueDate: true,
      },
    }),
    prisma.asset.findMany({
      where: {
        workspaceId,
        filename: { contains: query },
      },
      take: limit,
      select: {
        id: true,
        filename: true,
        mimeType: true,
        sizeBytes: true,
        createdAt: true,
      },
    }),
  ])

  return { projects, tasks, files }
}
