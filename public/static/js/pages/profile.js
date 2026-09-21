import { api } from '../api.js'
import { isAuthenticated, state } from '../state.js'
import { starRatingHtml, escapeHtml, formatDate } from '../utils.js'
import { navigate } from '../router.js'

export async function renderProfile() {
  const root = document.getElementById('app-root')

  if (!isAuthenticated()) {
    navigate('/connexion?redirect=/profil')
    return
  }

  root.innerHTML = `<div class="max-w-2xl mx-auto px-4 py-10"><div class="h-64 skeleton rounded-2xl"></div></div>`

  try {
    const { user } = await api.get('/auth/me')
    const { reviews, average, total } = await api.get(`/reviews/seller/${user.id}`)

    root.innerHTML = `
      <div class="max-w-2xl mx-auto px-4 lg:px-8 py-8 pb-24">
        <div class="card p-6 mb-6 text-center">
          <div class="w-20 h-20 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta font-extrabold text-2xl mx-auto mb-3">
            ${escapeHtml((user.name || '?')[0].toUpperCase())}
          </div>
          <h1 class="text-xl font-extrabold flex items-center justify-center gap-2">
            ${escapeHtml(user.name)}
            ${user.is_pro ? '<span class="badge-pro">PRO</span>' : ''}
            ${user.role === 'admin' ? '<span class="badge-category">Admin</span>' : ''}
          </h1>
          <p class="text-gray-500 text-sm">${escapeHtml(user.email)}</p>
          ${user.phone ? `<p class="text-gray-500 text-sm">${escapeHtml(user.phone)}</p>` : ''}
          <div class="flex items-center justify-center gap-2 mt-3">
            ${starRatingHtml(average)}
            <span class="text-sm text-gray-500">${average ? average : 'Pas encore noté'} ${total ? `(${total} avis)` : ''}</span>
          </div>
          <p class="text-xs text-gray-400 mt-2">Membre depuis ${formatDate(user.created_at)}</p>
        </div>

        <div class="card p-6">
          <h2 class="font-bold mb-4">Avis reçus (${reviews.length})</h2>
          <div class="space-y-4">
            ${reviews.length ? reviews.map((r) => `
              <div class="border-b border-[var(--color-border)] pb-3 last:border-0">
                <div class="flex items-center justify-between mb-1">
                  <span class="font-semibold text-sm">${escapeHtml(r.author_name)}</span>
                  ${starRatingHtml(r.rating, 'text-xs')}
                </div>
                ${r.comment ? `<p class="text-sm text-gray-600">${escapeHtml(r.comment)}</p>` : ''}
              </div>
            `).join('') : '<p class="text-sm text-gray-400">Aucun avis pour le moment.</p>'}
          </div>
        </div>
      </div>
    `
  } catch (err) {
    root.innerHTML = `<p class="text-center text-red-500 py-10">${err.message}</p>`
  }
}
