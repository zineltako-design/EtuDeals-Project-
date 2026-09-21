import { Hono } from 'hono'
import type { AppContext } from '../types'
import { authRequired } from '../middleware/auth'

const comments = new Hono<AppContext>()

// Ajouter un commentaire/question sous une annonce (auth requis)
comments.post('/listing/:listingId', authRequired, async (c) => {
  const user = c.get('user')!
  const listingId = c.req.param('listingId')
  const { message } = await c.req.json<{ message: string }>()

  if (!message || message.trim().length === 0) {
    return c.json({ error: 'Le message ne peut pas être vide' }, 400)
  }

  const listing = await c.env.DB.prepare('SELECT id FROM listings WHERE id = ?').bind(listingId).first()
  if (!listing) return c.json({ error: 'Annonce introuvable' }, 404)

  const result = await c.env.DB.prepare(
    'INSERT INTO comments (listing_id, user_id, message) VALUES (?, ?, ?)'
  ).bind(listingId, user.id, message.trim()).run()

  const newComment = await c.env.DB.prepare(`
    SELECT c.*, u.name as user_name, u.avatar_url as user_avatar
    FROM comments c JOIN users u ON u.id = c.user_id WHERE c.id = ?
  `).bind(result.meta.last_row_id).first()

  return c.json({ comment: newComment }, 201)
})

// Supprimer un commentaire (auteur ou admin)
comments.delete('/:id', authRequired, async (c) => {
  const user = c.get('user')!
  const id = c.req.param('id')

  const existing = await c.env.DB.prepare('SELECT user_id FROM comments WHERE id = ?').bind(id).first<{ user_id: number }>()
  if (!existing) return c.json({ error: 'Commentaire introuvable' }, 404)
  if (existing.user_id !== user.id && user.role !== 'admin') {
    return c.json({ error: 'Non autorisé' }, 403)
  }

  await c.env.DB.prepare('DELETE FROM comments WHERE id = ?').bind(id).run()
  return c.json({ message: 'Commentaire supprimé' })
})

export default comments
