import { prisma } from '@/lib/db'

export async function createActivity(input: {
  workspaceId: string
  actorId: string
  action: string
  targetType: string
  targetId: string
  metadata?: Record<string, unknown>
}) {
  return prisma.activity.create({
    data: {
      ...input,
      metadata: input.metadata ? JSON.stringify(input.metadata) : '{}',
    },
  })
}

export async function getRecentActivity(
  workspaceId: string,
  limit: number = 20,
  projectId?: string
) {
  return prisma.activity.findMany({
    where: {
      workspaceId,
      ...(projectId ? { targetType: 'project', targetId: projectId } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      actor: { select: { id: true, name: true, avatarUrl: true } },
    },
  })
}
