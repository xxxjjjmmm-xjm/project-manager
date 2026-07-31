import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api-response'
import { clearSessionCookie } from '@/lib/auth/session'

export async function POST(_request: NextRequest) {
  const res = successResponse({ ok: true })
  clearSessionCookie(res)
  return res
}
