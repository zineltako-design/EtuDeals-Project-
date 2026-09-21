import type { Context, Next } from 'hono'
import type { AppContext } from '../types'
import { verifyJwt } from '../utils/crypto'

/**
 * Middleware qui extrait l'utilisateur du token JWT (Authorization: Bearer xxx)
 * s'il est présent, sans bloquer la requête si absent (authOptional).
 */
export async function authOptional(c: Context<AppContext>, next: Next) {
  const authHeader = c.req.header('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const payload = await verifyJwt(token, c.env.JWT_SECRET)
    if (payload) {
      c.set('user', { id: payload.sub, email: payload.email, role: payload.role as string })
    }
  }
  await next()
}

/**
 * Middleware qui exige une authentification valide.
 */
export async function authRequired(c: Context<AppContext>, next: Next) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Authentification requise' }, 401)
  }
  const token = authHeader.slice(7)
  const payload = await verifyJwt(token, c.env.JWT_SECRET)
  if (!payload) {
    return c.json({ error: 'Session invalide ou expirée' }, 401)
  }
  c.set('user', { id: payload.sub, email: payload.email, role: payload.role as string })
  await next()
}

/**
 * Middleware qui exige le rôle admin.
 */
export async function adminRequired(c: Context<AppContext>, next: Next) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Authentification requise' }, 401)
  }
  const token = authHeader.slice(7)
  const payload = await verifyJwt(token, c.env.JWT_SECRET)
  if (!payload || payload.role !== 'admin') {
    return c.json({ error: 'Accès réservé aux administrateurs' }, 403)
  }
  c.set('user', { id: payload.sub, email: payload.email, role: payload.role as string })
  await next()
}
