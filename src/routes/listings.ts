import { Hono } from 'hono'
import type { AppContext } from '../types'
import { authRequired, authOptional } from '../middleware/auth'

const listings = new Hono<AppContext>()

// Liste des annonces avec filtres (public)
listings.get('/', authOptional, async (c) => {
  const { category, neighborhood, q, is_free, page = '1', limit = '20' } = c.req.query()

  const conditions: string[] = ["l.status = 'active'"]
  const params: unknown[] = []

  if (category) {
    conditions.push('l.category_slug = ?')
    params.push(category)
  }
  if (neighborhood) {
    conditions.push('l.neighborhood = ?')
    params.push(neighborhood)
  }
  if (q) {
    conditions.push('(l.title LIKE ? OR l.description LIKE ?)')
    params.push(`%${q}%`, `%${q}%`)
  }
  if (is_free === '1') {
    conditions.push('l.is_free = 1')
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1)
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20))
  const offset = (pageNum - 1) * limitNum

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const query = `
    SELECT l.*, u.name as seller_name, u.is_pro as seller_is_pro,
      (SELECT image_url FROM listing_images WHERE listing_id = l.id ORDER BY sort_order ASC LIMIT 1) as cover_image
    FROM listings l
    JOIN users u ON u.id = l.user_id
    ${whereClause}
    ORDER BY l.created_at DESC
    LIMIT ? OFFSET ?
  `
  const { results } = await c.env.DB.prepare(query).bind(...params, limitNum, offset).all()

  const countQuery = `SELECT COUNT(*) as total FROM listings l ${whereClause}`
  const countResult = await c.env.DB.prepare(countQuery).bind(...params).first<{ total: number }>()

  return c.json({
    listings: results,
    pagination: { page: pageNum, limit: limitNum, total: countResult?.total ?? 0 }
  })
})

// Détail d'une annonce (public)
listings.get('/:id', async (c) => {
  const id = c.req.param('id')

  const listing = await c.env.DB.prepare(`
    SELECT l.*, u.name as seller_name, u.phone as seller_phone, u.is_pro as seller_is_pro, u.avatar_url as seller_avatar
    FROM listings l
    JOIN users u ON u.id = l.user_id
    WHERE l.id = ?
  `).bind(id).first()

  if (!listing) {
    return c.json({ error: 'Annonce introuvable' }, 404)
  }

  const { results: images } = await c.env.DB.prepare(
    'SELECT image_url FROM listing_images WHERE listing_id = ? ORDER BY sort_order ASC'
  ).bind(id).all()

  const { results: comments } = await c.env.DB.prepare(`
    SELECT c.*, u.name as user_name, u.avatar_url as user_avatar
    FROM comments c JOIN users u ON u.id = c.user_id
    WHERE c.listing_id = ? ORDER BY c.created_at ASC
  `).bind(id).all()

  const ratingStats = await c.env.DB.prepare(
    'SELECT AVG(rating) as avg_rating, COUNT(*) as review_count FROM reviews WHERE seller_id = ?'
  ).bind((listing as any).user_id).first<{ avg_rating: number | null; review_count: number }>()

  return c.json({
    listing,
    images: images.map((i: any) => i.image_url),
    comments,
    seller_rating: {
      average: ratingStats?.avg_rating ? Math.round(ratingStats.avg_rating * 10) / 10 : null,
      count: ratingStats?.review_count ?? 0
    }
  })
})

// Créer une annonce (auth requis)
listings.post('/', authRequired, async (c) => {
  const user = c.get('user')!
  const body = await c.req.json<{
    category_slug: string
    title: string
    description: string
    price?: number | null
    is_free?: boolean
    neighborhood: string
    contact_phone: string
    contact_whatsapp?: string
    total_kg?: number
    destination?: string
    travel_date?: string
    images?: string[]
  }>()

  if (!body.category_slug || !body.title || !body.description || !body.neighborhood || !body.contact_phone) {
    return c.json({ error: 'Champs obligatoires manquants' }, 400)
  }

  const isFree = body.is_free ? 1 : 0
  const price = isFree ? null : (body.price ?? null)

  const result = await c.env.DB.prepare(`
    INSERT INTO listings (
      user_id, category_slug, title, description, price, is_free, neighborhood,
      contact_phone, contact_whatsapp, total_kg, remaining_kg, destination, travel_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    user.id, body.category_slug, body.title, body.description, price, isFree, body.neighborhood,
    body.contact_phone, body.contact_whatsapp || body.contact_phone,
    body.total_kg ?? null, body.total_kg ?? null, body.destination ?? null, body.travel_date ?? null
  ).run()

  const listingId = result.meta.last_row_id as number

  if (body.images && body.images.length > 0) {
    for (let i = 0; i < body.images.length; i++) {
      await c.env.DB.prepare(
        'INSERT INTO listing_images (listing_id, image_url, sort_order) VALUES (?, ?, ?)'
      ).bind(listingId, body.images[i], i).run()
    }
  }

  return c.json({ id: listingId, message: 'Annonce publiée avec succès' }, 201)
})

// Mes annonces (auth requis)
listings.get('/mine/list', authRequired, async (c) => {
  const user = c.get('user')!
  const { results } = await c.env.DB.prepare(`
    SELECT l.*,
      (SELECT image_url FROM listing_images WHERE listing_id = l.id ORDER BY sort_order ASC LIMIT 1) as cover_image
    FROM listings l WHERE l.user_id = ? ORDER BY l.created_at DESC
  `).bind(user.id).all()

  return c.json({ listings: results })
})

// Modifier une annonce (propriétaire uniquement)
listings.put('/:id', authRequired, async (c) => {
  const user = c.get('user')!
  const id = c.req.param('id')

  const existing = await c.env.DB.prepare('SELECT user_id FROM listings WHERE id = ?').bind(id).first<{ user_id: number }>()
  if (!existing) return c.json({ error: 'Annonce introuvable' }, 404)
  if (existing.user_id !== user.id && user.role !== 'admin') {
    return c.json({ error: 'Non autorisé' }, 403)
  }

  const body = await c.req.json<Record<string, unknown>>()
  const allowedFields = ['title', 'description', 'price', 'is_free', 'neighborhood', 'contact_phone', 'contact_whatsapp', 'status', 'remaining_kg', 'destination', 'travel_date']
  const updates: string[] = []
  const params: unknown[] = []

  for (const field of allowedFields) {
    if (field in body) {
      updates.push(`${field} = ?`)
      params.push(body[field])
    }
  }

  if (updates.length === 0) {
    return c.json({ error: 'Aucune donnée à mettre à jour' }, 400)
  }

  updates.push('updated_at = CURRENT_TIMESTAMP')
  await c.env.DB.prepare(`UPDATE listings SET ${updates.join(', ')} WHERE id = ?`).bind(...params, id).run()

  return c.json({ message: 'Annonce mise à jour' })
})

// Décrémenter les kilos restants (fonction spécifique Transport)
listings.post('/:id/decrement-kg', authRequired, async (c) => {
  const user = c.get('user')!
  const id = c.req.param('id')
  const { amount } = await c.req.json<{ amount: number }>()

  const listing = await c.env.DB.prepare('SELECT user_id, remaining_kg FROM listings WHERE id = ?').bind(id).first<{ user_id: number; remaining_kg: number | null }>()
  if (!listing) return c.json({ error: 'Annonce introuvable' }, 404)
  if (listing.user_id !== user.id && user.role !== 'admin') {
    return c.json({ error: 'Non autorisé' }, 403)
  }
  if (listing.remaining_kg === null) {
    return c.json({ error: "Cette annonce n'a pas de gestion de kilos" }, 400)
  }

  const newRemaining = Math.max(0, listing.remaining_kg - (amount || 0))
  await c.env.DB.prepare('UPDATE listings SET remaining_kg = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(newRemaining, id).run()

  return c.json({ remaining_kg: newRemaining })
})

// Supprimer une annonce (propriétaire ou admin)
listings.delete('/:id', authRequired, async (c) => {
  const user = c.get('user')!
  const id = c.req.param('id')

  const existing = await c.env.DB.prepare('SELECT user_id FROM listings WHERE id = ?').bind(id).first<{ user_id: number }>()
  if (!existing) return c.json({ error: 'Annonce introuvable' }, 404)
  if (existing.user_id !== user.id && user.role !== 'admin') {
    return c.json({ error: 'Non autorisé' }, 403)
  }

  await c.env.DB.prepare('DELETE FROM listings WHERE id = ?').bind(id).run()
  return c.json({ message: 'Annonce supprimée' })
})

export default listings
