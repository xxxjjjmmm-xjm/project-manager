import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-response'

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const existing = await prisma.project.findUnique({ where: { id: params.id } })
    if (!existing) return errorResponse('PROJECT_NOT_FOUND', 'Project not found', 'abort', 404)
    await prisma.project.delete({ where: { id: params.id } })
    return successResponse({ purged: true })
  } catch {
    return errorResponse('INTERNAL_ERROR', 'Failed to purge project', 'report', 500)
  }
}
