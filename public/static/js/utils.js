export const CATEGORIES = [
  { slug: 'logement', name: 'Logement & Colocation', icon: 'fa-house', color: '#E05A36' },
  { slug: 'transport', name: 'Transport, Kilos & Échanges', icon: 'fa-plane', color: '#2E8B57' },
  { slug: 'marketplace', name: 'Marketplace Seconde Main', icon: 'fa-tag', color: '#1A2B3C' },
  { slug: 'services', name: 'Micro-Services & Talents', icon: 'fa-lightbulb', color: '#E05A36' },
  { slug: 'resto', name: 'Bons Plans & Restauration', icon: 'fa-utensils', color: '#2E8B57' },
  { slug: 'evenements', name: 'Événements & Vie Communautaire', icon: 'fa-champagne-glasses', color: '#1A2B3C' }
]

export const NEIGHBORHOODS = [
  'Kipé', 'Sonfonia', 'Lambanyi', 'Donka', 'Dixinn', 'Cosa', 'Hamdallaye',
  'Kaloum', 'Matam', 'Ratoma', 'Simbaya', 'Nongo', 'Kobaya', 'Bambeto'
]

export function getCategory(slug) {
  return CATEGORIES.find((c) => c.slug === slug) || CATEGORIES[0]
}

export function formatPrice(price, isFree) {
  if (isFree) return 'Gratuit / Don'
  if (price == null) return 'Prix à négocier'
  return `${Number(price).toLocaleString('fr-FR')} GNF`
}

export function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return "à l'instant"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `il y a ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `il y a ${days}j`
  return formatDate(dateStr)
}

export function whatsappLink(phone, message) {
  const cleaned = (phone || '').replace(/[^0-9]/g, '')
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`
}

export function telLink(phone) {
  return `tel:${(phone || '').replace(/[^0-9+]/g, '')}`
}

export function escapeHtml(str) {
  if (str == null) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function toast(message, type = 'info') {
  const container = document.getElementById('toast-container')
  if (!container) return
  const el = document.createElement('div')
  el.className = `toast ${type}`
  el.textContent = message
  container.appendChild(el)
  setTimeout(() => {
    el.style.opacity = '0'
    el.style.transition = 'opacity 0.3s'
    setTimeout(() => el.remove(), 300)
  }, 3200)
}

export function starRatingHtml(rating, size = 'text-sm') {
  const full = Math.round(rating || 0)
  let html = `<span class="star-rating ${size}">`
  for (let i = 1; i <= 5; i++) {
    html += `<i class="fa-solid fa-star ${i <= full ? 'filled' : ''}"></i>`
  }
  html += '</span>'
  return html
}

export function qs(selector, root = document) {
  return root.querySelector(selector)
}
export function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector))
}
