import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { AppContext } from './types'

import auth from './routes/auth'
import categories from './routes/categories'
import listings from './routes/listings'
import reviews from './routes/reviews'
import comments from './routes/comments'
import upload from './routes/upload'
import admin from './routes/admin'

const app = new Hono<AppContext>()

app.use('/api/*', cors())

// Routes API
app.route('/api/auth', auth)
app.route('/api/categories', categories)
app.route('/api/listings', listings)
app.route('/api/reviews', reviews)
app.route('/api/comments', comments)
app.route('/api/upload', upload)
app.route('/api/admin', admin)

// Servir un fichier uploadé depuis R2
app.get('/api/files/*', async (c) => {
  const key = c.req.path.replace('/api/files/', '')
  const object = await c.env.R2.get(key)
  if (!object) return c.notFound()
  return new Response(object.body as any, {
    headers: {
      'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000'
    }
  })
})

// Favicon (servi depuis le logo)
app.get('/favicon.png', async (c) => {
  const res = await c.env.ASSETS.fetch(new Request(new URL('/static/images/logo.png', c.req.url)))
  return res
})

// SPA : toute autre route applicative (ex: /annonce/1, /mes-annonces) renvoie
// index.html afin que le routing côté client (main.js) prenne le relais.
// (public/static/*, manifest.json et sw.js sont servis directement par
// Cloudflare Pages via _routes.json, sans passer par ce Worker.)
app.get('*', async (c) => {
  const assets = (c.env as any).ASSETS
  const res = await assets.fetch(c.req.raw)
  if (res.status === 404) {
    const indexUrl = new URL('/index.html', c.req.url)
    return assets.fetch(new Request(indexUrl))
  }
  return res
})

export default app
