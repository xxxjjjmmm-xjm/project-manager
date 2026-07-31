import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { paginatedResponse, errorResponse } from '@/lib/api-response'
import type { ProjectListQuery } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query: ProjectListQuery = {
      search: searchParams.get('search') || undefined,
      type: searchParams.get('type') as ProjectListQuery['type'],
      tag: searchParams.get('tag') || undefined,
      isArchived: searchParams.get('isArchived') === 'true' ? true
        : searchParams.get('isArchived') === 'false' ? false : undefined,
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || '20', 10),
    }

    const page = Math.max(1, query.page || 1)
    const limit = Math.min(100, Math.max(1, query.limit || 20))
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { description: { contains: query.search } },
      ]
    }
    if (query.type) where.type = query.type
    if (query.isArchived !== undefined) where.isArchived = query.isArchived
    if (query.tag) {
      where.tags = { some: { tag: { name: query.tag } } }
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where, skip, take: limit,
        orderBy: { lastCommitAt: { sort: 'desc', nulls: 'last' } },
        include: { tags: { include: { tag: true } } },
      }),
      prisma.project.count({ where }),
    ])

    const mapped = projects.map((p) => ({
      id: p.id, name: p.name, path: p.path, type: p.type,
      techStack: JSON.parse(p.techStack || '[]'),
      description: p.description, totalCommits: p.totalCommits,
      lastCommitAt: p.lastCommitAt?.toISOString() || null,
      firstSeenAt: p.firstSeenAt.toISOString(),
      remoteUrl: p.remoteUrl, isArchived: p.isArchived,
      tags: p.tags.map((pt) => ({ id: pt.tag.id, name: pt.tag.name, color: pt.tag.color })),
    }))

    return paginatedResponse(mapped, {
      page, total, totalPages: Math.ceil(total / limit),
    })
  } catch {
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch projects', 'report', 500)
  }
}
