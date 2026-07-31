import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'

const KEY_LENGTH = 64

function scryptAsync(password: string, salt: string, keylen: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keylen, (err, derivedKey) => {
      if (err) reject(err)
      else resolve(derivedKey)
    })
  })
}

/** Hash a password with a random 16-byte salt, stored as `salt:derivedKeyHex`. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = await scryptAsync(password, salt, KEY_LENGTH)
  return `${salt}:${derivedKey.toString('hex')}`
}

/** Verify a password against a `salt:derivedKeyHex` string using a timing-safe comparison. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, keyHex] = stored.split(':')
  if (!salt || !keyHex) return false
  const storedKey = Buffer.from(keyHex, 'hex')
  if (storedKey.length !== KEY_LENGTH) return false
  const derivedKey = await scryptAsync(password, salt, KEY_LENGTH)
  return timingSafeEqual(derivedKey, storedKey)
}
