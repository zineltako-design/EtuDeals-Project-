import { Hono } from 'hono'
import type { AppContext } from '../types'
import { authRequired } from '../middleware/auth'

const reviews = new Hono<AppContext>()

// Avis d'un vendeur (public)
reviews.get('/seller/:sellerId', async (c) => {
  const sellerId = c.req.param('sellerId')

  const { results } = await c.env.DB.prepare(`
    SELECT r.*, u.name as author_name, u.avatar_url as author_avatar
    FROM reviews r JOIN users u ON u.id = r.author_id
    WHERE r.seller_id = ? ORDER BY r.created_at DESC
  `).bind(sellerId).all()

  const stats = await c.env.DB.prepare(
    'SELECT AVG(rating) as avg_rating, COUNT(*) as total FROM reviews WHERE seller_id = ?'
  ).bind(sellerId).first<{ avg_rating: number | null; total: number }>()

  return c.json({
    reviews: results,
    average: stats?.avg_rating ? Math.round(stats.avg_rating * 10) / 10 : null,
    total: stats?.total ?? 0
  })
})

// Laisser un avis (auth requis)
reviews.post('/seller/:sellerId', authRequired, async (c) => {
  const user = c.get('user')!
  const sellerId = parseInt(c.req.param('sellerId'), 10)
  const { rating, comment } = await c.req.json<{ rating: number; comment?: string }>()

  if (sellerId === user.id) {
    return c.json({ error: 'Vous ne pouvez pas vous noter vous-même' }, 400)
  }
  if (!rating || rating < 1 || rating > 5) {
    return c.json({ error: 'La note doit être entre 1 et 5' }, 400)
  }

  const sellerExists = await c.env.DB.prepare('SELECT id FROM users WHERE id = ?').bind(sellerId).first()
  if (!sellerExists) {
    return c.json({ error: 'Vendeur introuvable' }, 404)
  }

  await c.env.DB.prepare(
    'INSERT INTO reviews (seller_id, author_id, rating, comment) VALUES (?, ?, ?, ?)'
  ).bind(sellerId, user.id, rating, comment || null).run()

  return c.json({ message: 'Avis publié avec succès' }, 201)
})

export default reviews
