import { NextRequest, NextResponse } from 'next/server'

export const SESSION_COOKIE = 'ph_session'
const SESSION_MAX_AGE = 7 * 24 * 3600

/** Set the httpOnly session cookie on a response (7 day lifetime). */
export function setSessionCookie(res: NextResponse, token: string): void {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
}

/** Read the session token from a cookie or Authorization: Bearer header. */
export function getSessionToken(req: NextRequest): string | null {
  const cookie = req.cookies.get(SESSION_COOKIE)?.value
  if (cookie) return cookie
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length)
  }
  return null
}

/** Clear the session cookie (used by logout). */
export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}
