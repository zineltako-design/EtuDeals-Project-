import { Hono } from 'hono'
import type { AppContext } from '../types'
import { authRequired } from '../middleware/auth'

const upload = new Hono<AppContext>()

// Upload d'une image vers R2 (auth requis)
upload.post('/', authRequired, async (c) => {
  const body = await c.req.parseBody()
  const file = body['file']

  if (!(file instanceof File)) {
    return c.json({ error: 'Aucun fichier fourni' }, 400)
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return c.json({ error: "Format d'image non supporté (jpg, png, webp, gif uniquement)" }, 400)
  }

  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return c.json({ error: 'Image trop volumineuse (max 5MB)' }, 400)
  }

  const ext = file.type.split('/')[1]
  const key = `listings/${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  await c.env.R2.put(key, arrayBuffer, {
    httpMetadata: { contentType: file.type }
  })

  return c.json({ url: `/api/files/${key}`, key })
})

export default upload
