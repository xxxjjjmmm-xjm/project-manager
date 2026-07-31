import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { AppError } from '@/lib/errors/AppError'
import { successResponse, errorResponse } from '@/lib/api-response'
import { handleError } from '@/lib/errors/error-handler'
import { verifyPassword } from '@/lib/auth/password'
import { signJwt } from '@/lib/auth/jwt'
import { setSessionCookie } from '@/lib/auth/session'

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.issues[0].message, 'abort', 400)
    }

    const email = parsed.data.email.toLowerCase()
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      throw new AppError('UNAUTHORIZED', 'Invalid email or password', 'retry', 401)
    }

    const valid = await verifyPassword(parsed.data.password, user.passwordHash)
    if (!valid) {
      throw new AppError('UNAUTHORIZED', 'Invalid email or password', 'retry', 401)
    }

    const token = signJwt({ sub: user.id, email: user.email })
    const res = successResponse({
      user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl },
      token,
    })
    setSessionCookie(res, token)
    return res
  } catch (err) {
    const { code, message, action, status } = handleError(err)
    return errorResponse(code, message, action, status)
  }
}
