/**
 * Edge-runtime-safe HS256 JWT verification for middleware.
 * The Edge runtime does not expose `node:crypto`, so this uses the
 * Web Crypto API (`crypto.subtle`), which is available both on Edge
 * and in Node 18+.
 */
const SECRET = process.env.JWT_SECRET ?? 'project-hub-dev-secret-2026'

function base64urlDecode(input: string): string {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
  return atob(padded)
}

async function hmacSha256Base64Url(message: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(message))
  const bytes = new Uint8Array(sig)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

/** Verify an HS256 JWT signature and expiry on the Edge runtime. */
export async function verifyJwtEdge(
  token: string
): Promise<Record<string, unknown> | null> {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [headerPart, payloadPart, signature] = parts
  if (!headerPart || !payloadPart || !signature) return null

  const expected = await hmacSha256Base64Url(`${headerPart}.${payloadPart}`)
  if (signature !== expected) return null

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
