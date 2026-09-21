import { api } from '../api.js'
import { isAuthenticated } from '../state.js'
import { getCategory, formatPrice, timeAgo, escapeHtml, toast } from '../utils.js'
import { navigate } from '../router.js'

export async function renderMyListings() {
  const root = document.getElementById('app-root')

  if (!isAuthenticated()) {
    navigate('/connexion?redirect=/mes-annonces')
    return
  }

  root.innerHTML = `
    <div class="max-w-5xl mx-auto px-4 lg:px-8 py-8 pb-24">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-extrabold">Mes annonces</h1>
        <a href="/publier" data-link class="btn-primary px-4 py-2.5 text-sm"><i class="fa-solid fa-plus mr-1"></i> Nouvelle annonce</a>
      </div>
      <div id="my-listings-container" class="space-y-4">
        ${Array(3).fill('<div class="h-28 skeleton rounded-2xl"></div>').join('')}
      </div>
    </div>
  `

  try {
    const { listings } = await api.get('/listings/mine/list')
    const container = document.getElementById('my-listings-container')

    if (listings.length === 0) {
      container.innerHTML = `
        <div class="text-center py-16">
          <i class="fa-solid fa-inbox text-5xl text-gray-300 mb-4"></i>
          <p class="text-gray-500 mb-4">Vous n'avez publié aucune annonce.</p>
          <a href="/publier" data-link class="btn-primary px-6 py-3 inline-block">Publier ma première annonce</a>
        </div>
      `
      return
    }

    container.innerHTML = listings.map((l) => myListingRow(l)).join('')
    attachHandlers()
  } catch (err) {
    document.getElementById('my-listings-container').innerHTML = `<p class="text-red-500 text-center py-8">${err.message}</p>`
  }
}

function myListingRow(listing) {
  const cat = getCategory(listing.category_slug)
  const statusColors = { active: 'bg-mint-soft text-mint', sold: 'bg-gray-200 text-gray-600', archived: 'bg-gray-100 text-gray-400', removed: 'bg-red-100 text-red-500' }
  const statusLabels = { active: 'Active', sold: 'Vendue', archived: 'Archivée', removed: 'Supprimée' }
  const cover = listing.cover_image || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=200'

  const kgControl = listing.category_slug === 'transport' && listing.remaining_kg != null ? `
    <div class="flex items-center gap-2 mt-2">
      <span class="text-xs font-semibold text-mint">${listing.remaining_kg}kg restants</span>
      <button data-decrement-kg="${listing.id}" data-remaining="${listing.remaining_kg}" class="text-xs btn-secondary px-2 py-1">-1kg réservé</button>
    </div>
  ` : ''

  return `
    <div class="card p-4 flex gap-4" data-listing-row="${listing.id}">
      <img src="${cover}" class="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover shrink-0">
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <span class="badge-category">${cat.name.split('&')[0].trim()}</span>
            <h3 class="font-bold text-sm mt-1 line-clamp-1">${escapeHtml(listing.title)}</h3>
          </div>
          <span class="shrink-0 text-xs font-bold px-2 py-1 rounded-full ${statusColors[listing.status] || ''}">${statusLabels[listing.status] || listing.status}</span>
        </div>
        <p class="text-terracotta font-bold text-sm mt-1">${formatPrice(listing.price, listing.is_free)}</p>
        <p class="text-xs text-gray-400">${timeAgo(listing.created_at)} · ${escapeHtml(listing.neighborhood)}</p>
        ${kgControl}
        <div class="flex gap-2 mt-2">
          <a href="/annonce/${listing.id}" data-link class="text-xs font-semibold text-indigo underline">Voir</a>
          <select data-status-select="${listing.id}" class="text-xs border border-[var(--color-border)] rounded-lg px-2 py-1">
            <option value="active" ${listing.status === 'active' ? 'selected' : ''}>Active</option>
            <option value="sold" ${listing.status === 'sold' ? 'selected' : ''}>Vendue</option>
            <option value="archived" ${listing.status === 'archived' ? 'selected' : ''}>Archivée</option>
          </select>
          <button data-delete="${listing.id}" class="text-xs font-semibold text-red-500 underline">Supprimer</button>
        </div>
      </div>
    </div>
  `
}

function attachHandlers() {
  document.querySelectorAll('[data-delete]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-delete')
      if (!confirm('Supprimer définitivement cette annonce ?')) return
      try {
        await api.del(`/listings/${id}`)
        document.querySelector(`[data-listing-row="${id}"]`).remove()
        toast('Annonce supprimée', 'success')
      } catch (err) {
        toast(err.message, 'error')
      }
    })
  })

  document.querySelectorAll('[data-status-select]').forEach((sel) => {
    sel.addEventListener('change', async () => {
      const id = sel.getAttribute('data-status-select')
      try {
        await api.put(`/listings/${id}`, { status: sel.value })
        toast('Statut mis à jour', 'success')
      } catch (err) {
        toast(err.message, 'error')
      }
    })
  })

  document.querySelectorAll('[data-decrement-kg]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-decrement-kg')
      try {
        const res = await api.post(`/listings/${id}/decrement-kg`, { amount: 1 })
        toast(`Kilos restants : ${res.remaining_kg}kg`, 'success')
        renderMyListings()
      } catch (err) {
        toast(err.message, 'error')
      }
    })
  })
}
