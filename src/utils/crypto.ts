// Utilitaires crypto basés sur Web Crypto API (compatible Cloudflare Workers)
// Pas de dépendance Node.js (pas de bcrypt) — on utilise PBKDF2 + SHA-256 natif.

const ENCODER = new TextEncoder()

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }
  return bytes
}

/**
 * Hash un mot de passe avec PBKDF2-SHA256 + sel aléatoire.
 * Format de sortie: pbkdf2$<iterations>$<saltHex>$<hashHex>
 */
export async function hashPassword(password: string): Promise<string> {
  const iterations = 100000
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    ENCODER.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    keyMaterial,
    256
  )
  return `pbkdf2$${iterations}$${toHex(salt.buffer as ArrayBuffer)}$${toHex(derivedBits)}`
}

/**
 * Vérifie un mot de passe contre un hash pbkdf2$...
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const parts = stored.split('$')
    if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false
    const iterations = parseInt(parts[1], 10)
    const salt = fromHex(parts[2])
    const expectedHex = parts[3]
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      ENCODER.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    )
    const derivedBits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
      keyMaterial,
      256
    )
    const actualHex = toHex(derivedBits)
    // Comparaison en temps constant approximative
    if (actualHex.length !== expectedHex.length) return false
    let diff = 0
    for (let i = 0; i < actualHex.length; i++) {
      diff |= actualHex.charCodeAt(i) ^ expectedHex.charCodeAt(i)
    }
    return diff === 0
  } catch {
    return false
  }
}

function base64UrlEncode(data: string): string {
  return btoa(data).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlDecode(data: string): string {
  const padded = data.replace(/-/g, '+').replace(/_/g, '/')
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4))
  return atob(padded + pad)
}

async function hmacSha256(key: string, message: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    ENCODER.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, ENCODER.encode(message))
  return toHex(signature)
}

export interface JwtPayload {
  sub: number
  email: string
  role: string
  exp: number
  [key: string]: unknown
}

/**
 * Crée un JWT signé HS256 simplifié (sans dépendance externe).
 */
export async function signJwt(payload: Omit<JwtPayload, 'exp'>, secret: string, expiresInSeconds = 60 * 60 * 24 * 7): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' }
  const fullPayload: JwtPayload = { ...payload, exp: Math.floor(Date.now() / 1000) + expiresInSeconds }
  const headerB64 = base64UrlEncode(JSON.stringify(header))
  const payloadB64 = base64UrlEncode(JSON.stringify(fullPayload))
  const toSign = `${headerB64}.${payloadB64}`
  // On utilise HMAC-SHA256 hex, encodé en base64url pour la partie signature
  const sigHex = await hmacSha256(secret, toSign)
  const sigB64 = base64UrlEncode(sigHex)
  return `${toSign}.${sigB64}`
}

/**
 * Vérifie et décode un JWT. Retourne le payload ou null si invalide/expiré.
 */
export async function verifyJwt(token: string, secret: string): Promise<JwtPayload | null> {
  try {
    const [headerB64, payloadB64, sigB64] = token.split('.')
    if (!headerB64 || !payloadB64 || !sigB64) return null
    const toSign = `${headerB64}.${payloadB64}`
    const expectedSigHex = await hmacSha256(secret, toSign)
    const expectedSigB64 = base64UrlEncode(expectedSigHex)
    if (expectedSigB64 !== sigB64) return null
    const payload: JwtPayload = JSON.parse(base64UrlDecode(payloadB64))
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}
