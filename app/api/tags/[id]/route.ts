import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-response'
import { z } from 'zod'

const updateSchema = z.object({ name: z.string().min(1).optional(), color: z.string().optional() })

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) return errorResponse('VALIDATION_ERROR', parsed.error.issues[0].message, 'abort', 400)
    const existing = await prisma.tag.findUnique({ where: { id: params.id } })
    if (!existing) return errorResponse('TAG_NOT_FOUND', 'Tag not found', 'abort', 404)
    const updated = await prisma.tag.update({ where: { id: params.id }, data: parsed.data })
    return successResponse(updated)
  } catch {
    return errorResponse('INTERNAL_ERROR', 'Failed to update tag', 'report', 500)
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const existing = await prisma.tag.findUnique({ where: { id: params.id } })
    if (!existing) return errorResponse('TAG_NOT_FOUND', 'Tag not found', 'abort', 404)
    await prisma.tag.delete({ where: { id: params.id } })
    return successResponse({ deleted: true })
  } catch {
    return errorResponse('INTERNAL_ERROR', 'Failed to delete tag', 'report', 500)
  }
}
