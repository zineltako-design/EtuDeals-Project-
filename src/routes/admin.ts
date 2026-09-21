import { Hono } from 'hono'
import type { AppContext } from '../types'
import { adminRequired } from '../middleware/auth'

const admin = new Hono<AppContext>()
admin.use('*', adminRequired)

// Statistiques globales
admin.get('/stats', async (c) => {
  const usersCount = await c.env.DB.prepare('SELECT COUNT(*) as n FROM users').first<{ n: number }>()
  const listingsCount = await c.env.DB.prepare('SELECT COUNT(*) as n FROM listings').first<{ n: number }>()
  const activeCount = await c.env.DB.prepare("SELECT COUNT(*) as n FROM listings WHERE status = 'active'").first<{ n: number }>()
  const proCount = await c.env.DB.prepare('SELECT COUNT(*) as n FROM users WHERE is_pro = 1').first<{ n: number }>()

  const { results: byCategory } = await c.env.DB.prepare(`
    SELECT category_slug, COUNT(*) as count FROM listings GROUP BY category_slug
  `).all()

  return c.json({
    users: usersCount?.n ?? 0,
    listings: listingsCount?.n ?? 0,
    active_listings: activeCount?.n ?? 0,
    pro_users: proCount?.n ?? 0,
    by_category: byCategory
  })
})

// Toutes les annonces (avec infos vendeur)
admin.get('/listings', async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT l.*, u.name as seller_name, u.email as seller_email
    FROM listings l JOIN users u ON u.id = l.user_id
    ORDER BY l.created_at DESC
  `).all()
  return c.json({ listings: results })
})

// Supprimer/modérer une annonce
admin.delete('/listings/:id', async (c) => {
  const id = c.req.param('id')
  await c.env.DB.prepare('DELETE FROM listings WHERE id = ?').bind(id).run()
  return c.json({ message: 'Annonce supprimée par la modération' })
})

// Changer le statut d'une annonce
admin.put('/listings/:id/status', async (c) => {
  const id = c.req.param('id')
  const { status } = await c.req.json<{ status: string }>()
  const validStatuses = ['active', 'sold', 'archived', 'removed']
  if (!validStatuses.includes(status)) {
    return c.json({ error: 'Statut invalide' }, 400)
  }
  await c.env.DB.prepare('UPDATE listings SET status = ? WHERE id = ?').bind(status, id).run()
  return c.json({ message: 'Statut mis à jour' })
})

// Tous les utilisateurs
admin.get('/users', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT id, name, email, phone, role, is_pro, created_at FROM users ORDER BY created_at DESC'
  ).all()
  return c.json({ users: results })
})

// Marquer/démarquer un utilisateur comme "Commerçant Pro"
admin.put('/users/:id/pro', async (c) => {
  const id = c.req.param('id')
  const { is_pro } = await c.req.json<{ is_pro: boolean }>()
  await c.env.DB.prepare('UPDATE users SET is_pro = ? WHERE id = ?').bind(is_pro ? 1 : 0, id).run()
  return c.json({ message: 'Statut Pro mis à jour' })
})

// Changer le rôle d'un utilisateur
admin.put('/users/:id/role', async (c) => {
  const id = c.req.param('id')
  const { role } = await c.req.json<{ role: string }>()
  if (!['user', 'pro', 'admin'].includes(role)) {
    return c.json({ error: 'Rôle invalide' }, 400)
  }
  await c.env.DB.prepare('UPDATE users SET role = ? WHERE id = ?').bind(role, id).run()
  return c.json({ message: 'Rôle mis à jour' })
})

export default admin
