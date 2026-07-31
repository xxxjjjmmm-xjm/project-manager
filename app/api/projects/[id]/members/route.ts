import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-response'
import { handleError } from '@/lib/errors/error-handler'
import { z } from 'zod'

const addMemberSchema = z.object({
  userId: z.string().min(1),
  role: z.string().min(1).optional(),
})

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const members = await prisma.projectMember.findMany({
      where: { projectId: params.id },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'asc' },
    })
    return successResponse(members)
  } catch (err) {
    const { code, message, action, status } = handleError(err)
    return errorResponse(code as any, message, action as any, status)
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const parsed = addMemberSchema.parse(body)
    const member = await prisma.projectMember.upsert({
      where: {
        projectId_userId: { projectId: params.id, userId: parsed.userId },
      },
      create: {
        projectId: params.id,
        userId: parsed.userId,
        role: parsed.role || 'MEMBER',
      },
      update: {
        role: parsed.role || undefined,
      },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    })
    return successResponse(member, 201)
  } catch (err) {
    const { code, message, action, status } = handleError(err)
    return errorResponse(code as any, message, action as any, status)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) {
      return errorResponse('VALIDATION_ERROR' as any, 'userId query param is required', 'abort', 400)
    }
    const result = await prisma.projectMember.deleteMany({
      where: { projectId: params.id, userId },
    })
    return successResponse({ removed: result.count > 0 })
  } catch (err) {
    const { code, message, action, status } = handleError(err)
    return errorResponse(code as any, message, action as any, status)
  }
}
