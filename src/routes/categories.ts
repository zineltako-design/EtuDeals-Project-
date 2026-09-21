import { Hono } from 'hono'
import type { AppContext } from '../types'

const categories = new Hono<AppContext>()

categories.get('/', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM categories ORDER BY id ASC').all()
  return c.json({ categories: results })
})

export default categories
