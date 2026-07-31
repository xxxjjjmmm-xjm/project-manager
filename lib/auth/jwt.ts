import { createHmac, timingSafeEqual } from 'node:crypto'

const SECRET = process.env.JWT_SECRET ?? 'project-hub-dev-secret-2026'
const ALGORITHM = 'HS256'

function base64url(input: string): string {
  return Buffer.from(input, 'utf-8').toString('base64url')
}

function base64urlDecode(input: string): string {
  return Buffer.from(input, 'base64url').toString('utf-8')
}

function sign(input: string): string {
  return createHmac('sha256', SECRET).update(input).digest('base64url')
}

/** Sign an HS256 JWT with an exp claim (default 7 days). */
export function signJwt(
  payload: Record<string, unknown>,
  expiresInSec: number = 7 * 24 * 3600
): string {
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: ALGORITHM, typ: 'JWT' }
  const body = { ...payload, iat: now, exp: now + expiresInSec }
  const headerPart = base64url(JSON.stringify(header))
  const payloadPart = base64url(JSON.stringify(body))
  const signature = sign(`${headerPart}.${payloadPart}`)
  return `${headerPart}.${payloadPart}.${signature}`
}

/** Verify an HS256 JWT signature and expiry. Returns the payload or null. */
export function verifyJwt(token: string): Record<string, unknown> | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [headerPart, payloadPart, signature] = parts
  if (!headerPart || !payloadPart || !signature) return null

  const expected = Buffer.from(sign(`${headerPart}.${payloadPart}`))
  const actual = Buffer.from(signature)
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return null
  }

  try {
    const payload = JSON.parse(base64urlDecode(payloadPart)) as Record<string, unknown>
    const exp = payload.exp
    if (typeof exp === 'number' && exp < Math.floor(Date.now() / 1000)) {
      return null
    }
    return payload
  } catch {
    return null
  }
}
