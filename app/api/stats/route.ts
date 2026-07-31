import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-response'

export async function GET() {
  try {
    const total = await prisma.project.count({ where: { isArchived: false } })

    const allProjects = await prisma.project.findMany({
      where: { isArchived: false },
      include: { tags: { include: { tag: true } } },
    })

    const byType: Record<string, number> = {}
    const byTech: Record<string, number> = {}

    for (const p of allProjects) {
      byType[p.type] = (byType[p.type] || 0) + 1
      const techStack = JSON.parse(p.techStack || '[]') as string[]
      for (const tech of techStack) {
        const name = tech.toLowerCase()
        byTech[name] = (byTech[name] || 0) + 1
      }
    }

    const topTech = Object.fromEntries(
      Object.entries(byTech).sort((a, b) => b[1] - a[1]).slice(0, 20)
    )

    const recentlyAdded = await prisma.project.findMany({
      where: { isArchived: false },
      orderBy: { firstSeenAt: 'desc' }, take: 6,
      include: { tags: { include: { tag: true } } },
    })

    const recentlyActive = await prisma.project.findMany({
      where: { isArchived: false, lastCommitAt: { not: null } },
      orderBy: { lastCommitAt: 'desc' }, take: 6,
      include: { tags: { include: { tag: true } } },
    })

    const lastScan = await prisma.scanRecord.findFirst({
      orderBy: { scannedAt: 'desc' },
    })

    const mapItem = (p: typeof allProjects[number]) => ({
      id: p.id, name: p.name, path: p.path, type: p.type,
      techStack: JSON.parse(p.techStack || '[]'),
      description: p.description, totalCommits: p.totalCommits,
      lastCommitAt: p.lastCommitAt?.toISOString() || null,
      firstSeenAt: p.firstSeenAt.toISOString(),
      remoteUrl: p.remoteUrl, isArchived: p.isArchived,
      tags: p.tags.map((pt) => ({ id: pt.tag.id, name: pt.tag.name, color: pt.tag.color })),
    })

    return successResponse({
      total, byType, byTech: topTech,
      recentlyAdded: recentlyAdded.map(mapItem),
      recentlyActive: recentlyActive.map(mapItem),
      lastScannedAt: lastScan?.scannedAt.toISOString() || null,
    })
  } catch {
    return errorResponse('INTERNAL_ERROR', 'Failed to get stats', 'report', 500)
  }
}
