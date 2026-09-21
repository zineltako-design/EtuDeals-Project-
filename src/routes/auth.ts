import { Hono } from 'hono'
import type { AppContext } from '../types'
import { hashPassword, verifyPassword, signJwt } from '../utils/crypto'
import { authRequired } from '../middleware/auth'

const auth = new Hono<AppContext>()

// Inscription
auth.post('/register', async (c) => {
  const { name, email, phone, password } = await c.req.json<{
    name: string; email: string; phone?: string; password: string
  }>()

  if (!name || !email || !password) {
    return c.json({ error: 'Nom, email et mot de passe sont requis' }, 400)
  }
  if (password.length < 6) {
    return c.json({ error: 'Le mot de passe doit contenir au moins 6 caractères' }, 400)
  }

  const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email.toLowerCase()).first()
  if (existing) {
    return c.json({ error: 'Un compte existe déjà avec cet email' }, 409)
  }

  const passwordHash = await hashPassword(password)
  const result = await c.env.DB.prepare(
    'INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)'
  ).bind(name, email.toLowerCase(), phone || null, passwordHash, 'user').run()

  const userId = result.meta.last_row_id as number
  const token = await signJwt({ sub: userId, email: email.toLowerCase(), role: 'user' }, c.env.JWT_SECRET)

  return c.json({
    token,
    user: { id: userId, name, email: email.toLowerCase(), role: 'user', is_pro: 0 }
  }, 201)
})

// Connexion
auth.post('/login', async (c) => {
  const { email, password } = await c.req.json<{ email: string; password: string }>()
  if (!email || !password) {
    return c.json({ error: 'Email et mot de passe requis' }, 400)
  }

  const user = await c.env.DB.prepare(
    'SELECT id, name, email, phone, password_hash, role, is_pro, avatar_url FROM users WHERE email = ?'
  ).bind(email.toLowerCase()).first<{
    id: number; name: string; email: string; phone: string; password_hash: string; role: string; is_pro: number; avatar_url: string | null
  }>()

  if (!user) {
    return c.json({ error: 'Email ou mot de passe incorrect' }, 401)
  }

  const valid = await verifyPassword(password, user.password_hash)
  if (!valid) {
    return c.json({ error: 'Email ou mot de passe incorrect' }, 401)
  }

  const token = await signJwt({ sub: user.id, email: user.email, role: user.role }, c.env.JWT_SECRET)

  return c.json({
    token,
    user: {
      id: user.id, name: user.name, email: user.email, phone: user.phone,
      role: user.role, is_pro: user.is_pro, avatar_url: user.avatar_url
    }
  })
})

// Profil courant
auth.get('/me', authRequired, async (c) => {
  const authUser = c.get('user')!
  const user = await c.env.DB.prepare(
    'SELECT id, name, email, phone, role, is_pro, avatar_url, created_at FROM users WHERE id = ?'
  ).bind(authUser.id).first()

  if (!user) return c.json({ error: 'Utilisateur introuvable' }, 404)
  return c.json({ user })
})

export default auth
