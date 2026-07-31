import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-response'
import { z } from 'zod'

const batchSchema = z.object({ tagIds: z.array(z.string()).min(1) })

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const parsed = batchSchema.safeParse(body)
    if (!parsed.success) return errorResponse('VALIDATION_ERROR', parsed.error.issues[0].message, 'abort', 400)

    const existing = await prisma.project.findUnique({ where: { id: params.id } })
    if (!existing) return errorResponse('PROJECT_NOT_FOUND', 'Project not found', 'abort', 404)

    await Promise.all(parsed.data.tagIds.map((tagId) =>
      prisma.projectTag.upsert({
        where: { projectId_tagId: { projectId: params.id, tagId } },
        create: { projectId: params.id, tagId },
        update: {},
      })
    ))
    return successResponse({ tagged: true })
  } catch {
    return errorResponse('INTERNAL_ERROR', 'Failed to tag project', 'report', 500)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(request.url)
  const tagId = searchParams.get('tagId')
  if (!tagId) return errorResponse('VALIDATION_ERROR', 'tagId is required', 'abort', 400)

  try {
    await prisma.projectTag.deleteMany({
      where: { projectId: params.id, tagId },
    })
    return successResponse({ untagged: true })
  } catch {
    return errorResponse('INTERNAL_ERROR', 'Failed to remove tag', 'report', 500)
  }
}
