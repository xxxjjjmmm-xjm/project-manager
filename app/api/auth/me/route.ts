import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-response'
import { getSessionToken } from '@/lib/auth/session'
import { verifyJwt } from '@/lib/auth/jwt'

export async function GET(request: NextRequest) {
  const token = getSessionToken(request)
  if (!token) {
    return errorResponse('UNAUTHORIZED', 'Not authenticated', 'retry', 401)
  }

  const payload = verifyJwt(token)
  if (!payload || typeof payload.sub !== 'string') {
    return errorResponse('UNAUTHORIZED', 'Not authenticated', 'retry', 401)
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } })
  if (!user) {
    return errorResponse('UNAUTHORIZED', 'Not authenticated', 'retry', 401)
  }

  return successResponse({
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
  })
}
