import { NextRequest, NextResponse } from 'next/server'
import { getSessionToken } from '@/lib/auth/session'
import { verifyJwtEdge } from '@/lib/auth/jwt-edge'

const ANONYMOUS_USER_ID = 'default-user'
const DEFAULT_WORKSPACE_ID = 'default-workspace'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Auth routes manage their own session — leave them untouched.
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    return response
  }

  let userId = ANONYMOUS_USER_ID
  const token = getSessionToken(request)
  if (token) {
    const payload = await verifyJwtEdge(token)
    if (payload && typeof payload.sub === 'string') {
      userId = payload.sub
    }
  }

  response.headers.set('x-user-id', userId)
  response.headers.set('x-user-workspace', DEFAULT_WORKSPACE_ID)
  return response
}

export const config = {
  matcher: ['/api/:path*'],
}
