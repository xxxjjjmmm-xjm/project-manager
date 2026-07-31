import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-response'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(['web', 'cli', 'library', 'mobile', 'desktop', 'script', 'other']).optional(),
  description: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
})

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      tags: { include: { tag: true } },
      scanRecords: { include: { scanPath: true }, orderBy: { scannedAt: 'desc' }, take: 10 },
    },
  })
  if (!project) return errorResponse('PROJECT_NOT_FOUND', 'Project not found', 'abort', 404)

  const detail = {
    id: project.id, name: project.name, path: project.path, type: project.type,
    techStack: JSON.parse(project.techStack || '[]'),
    description: project.description, totalCommits: project.totalCommits,
    lastScannedAt: project.lastScannedAt?.toISOString() || null,
    lastCommitAt: project.lastCommitAt?.toISOString() || null,
    firstSeenAt: project.firstSeenAt.toISOString(),
    remoteUrl: project.remoteUrl, isArchived: project.isArchived,
    archivedAt: project.archivedAt?.toISOString() || null,
    lastCommitHash: project.lastCommitHash,
    metadata: JSON.parse(project.metadata || '{}'),
    tags: project.tags.map((pt) => ({ id: pt.tag.id, name: pt.tag.name, color: pt.tag.color })),
    scanRecords: project.scanRecords.map((sr) => ({
      id: sr.id, scanPathId: sr.scanPathId, scanPath: sr.scanPath.path,
      scannedAt: sr.scannedAt.toISOString(), status: sr.status,
      fileCount: sr.fileCount, errorMessage: sr.errorMessage,
    })),
  }
  return successResponse(detail)
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) return errorResponse('VALIDATION_ERROR', parsed.error.issues[0].message, 'abort', 400)
    const existing = await prisma.project.findUnique({ where: { id: params.id } })
    if (!existing) return errorResponse('PROJECT_NOT_FOUND', 'Project not found', 'abort', 404)

    const data: Record<string, unknown> = { ...parsed.data }
    if (data.metadata) data.metadata = JSON.stringify(data.metadata)

    const updated = await prisma.project.update({ where: { id: params.id }, data })
    return successResponse(updated)
  } catch {
    return errorResponse('INTERNAL_ERROR', 'Failed to update project', 'report', 500)
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const existing = await prisma.project.findUnique({ where: { id: params.id } })
    if (!existing) return errorResponse('PROJECT_NOT_FOUND', 'Project not found', 'abort', 404)
    await prisma.project.update({
      where: { id: params.id },
      data: { isArchived: true, archivedAt: new Date() },
    })
    return successResponse({ archived: true })
  } catch {
    return errorResponse('INTERNAL_ERROR', 'Failed to archive project', 'report', 500)
  }
}
