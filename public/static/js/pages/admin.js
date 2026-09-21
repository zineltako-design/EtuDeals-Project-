import { api } from '../api.js'
import { state, isAdmin } from '../state.js'
import { getCategory, formatPrice, timeAgo, escapeHtml, toast } from '../utils.js'
import { navigate } from '../router.js'

export async function renderAdmin() {
  const root = document.getElementById('app-root')

  if (!state.token || !isAdmin()) {
    root.innerHTML = `
      <div class="max-w-md mx-auto text-center py-20 px-6">
        <i class="fa-solid fa-lock text-5xl text-terracotta mb-4"></i>
        <h1 class="text-xl font-bold mb-2">Accès réservé</h1>
        <p class="text-gray-500 mb-6">Cette section est réservée aux administrateurs.</p>
        <a href="/" data-link class="btn-primary px-6 py-3 inline-block">Retour à l'accueil</a>
      </div>
    `
    return
  }

  root.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 lg:px-8 py-8 pb-24">
      <h1 class="text-2xl font-extrabold mb-6"><i class="fa-solid fa-shield-halved text-terracotta mr-2"></i>Tableau de bord Admin</h1>

      <div id="admin-stats" class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        ${Array(4).fill('<div class="h-24 skeleton rounded-2xl"></div>').join('')}
      </div>

      <div class="flex gap-2 mb-4 border-b border-[var(--color-border)]">
        <button data-tab="listings" class="admin-tab px-4 py-2.5 font-semibold text-sm border-b-2 border-terracotta text-terracotta">Annonces</button>
        <button data-tab="users" class="admin-tab px-4 py-2.5 font-semibold text-sm border-b-2 border-transparent text-gray-500">Utilisateurs</button>
      </div>

      <div id="admin-content">
        <div class="h-64 skeleton rounded-2xl"></div>
      </div>
    </div>
  `

  loadStats()
  loadListingsTab()

  document.querySelectorAll('.admin-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach((b) => {
        b.classList.remove('border-terracotta', 'text-terracotta')
        b.classList.add('border-transparent', 'text-gray-500')
      })
      btn.classList.add('border-terracotta', 'text-terracotta')
      btn.classList.remove('border-transparent', 'text-gray-500')
      if (btn.getAttribute('data-tab') === 'listings') loadListingsTab()
      else loadUsersTab()
    })
  })
}

async function loadStats() {
  try {
    const stats = await api.get('/admin/stats')
    document.getElementById('admin-stats').innerHTML = `
      <div class="card p-5 text-center">
        <p class="text-3xl font-extrabold text-terracotta">${stats.listings}</p>
        <p class="text-xs text-gray-500 font-semibold mt-1">Annonces totales</p>
      </div>
      <div class="card p-5 text-center">
        <p class="text-3xl font-extrabold text-mint">${stats.active_listings}</p>
        <p class="text-xs text-gray-500 font-semibold mt-1">Annonces actives</p>
      </div>
      <div class="card p-5 text-center">
        <p class="text-3xl font-extrabold text-indigo">${stats.users}</p>
        <p class="text-xs text-gray-500 font-semibold mt-1">Utilisateurs</p>
      </div>
      <div class="card p-5 text-center">
        <p class="text-3xl font-extrabold text-indigo">${stats.pro_users}</p>
        <p class="text-xs text-gray-500 font-semibold mt-1">Comptes Pro</p>
      </div>
    `
  } catch (err) {
    toast(err.message, 'error')
  }
}

async function loadListingsTab() {
  const content = document.getElementById('admin-content')
  content.innerHTML = '<div class="h-64 skeleton rounded-2xl"></div>'
  try {
    const { listings } = await api.get('/admin/listings')
    content.innerHTML = `
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-cream text-left">
              <tr>
                <th class="p-3 font-bold">Annonce</th>
                <th class="p-3 font-bold">Catégorie</th>
                <th class="p-3 font-bold">Vendeur</th>
                <th class="p-3 font-bold">Statut</th>
                <th class="p-3 font-bold">Date</th>
                <th class="p-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody id="admin-listings-body">
              ${listings.map((l) => `
                <tr class="border-t border-[var(--color-border)]" data-row="${l.id}">
                  <td class="p-3 font-semibold max-w-[200px] truncate">${escapeHtml(l.title)}</td>
                  <td class="p-3"><span class="badge-category">${getCategory(l.category_slug).name.split('&')[0].trim()}</span></td>
                  <td class="p-3 text-xs">${escapeHtml(l.seller_name)}<br><span class="text-gray-400">${escapeHtml(l.seller_email)}</span></td>
                  <td class="p-3">
                    <select data-admin-status="${l.id}" class="text-xs border border-[var(--color-border)] rounded-lg px-2 py-1">
                      <option value="active" ${l.status === 'active' ? 'selected' : ''}>Active</option>
                      <option value="sold" ${l.status === 'sold' ? 'selected' : ''}>Vendue</option>
                      <option value="archived" ${l.status === 'archived' ? 'selected' : ''}>Archivée</option>
                      <option value="removed" ${l.status === 'removed' ? 'selected' : ''}>Retirée</option>
                    </select>
                  </td>
                  <td class="p-3 text-xs text-gray-400">${timeAgo(l.created_at)}</td>
                  <td class="p-3">
                    <a href="/annonce/${l.id}" data-link class="text-indigo underline text-xs mr-2">Voir</a>
                    <button data-admin-delete="${l.id}" class="text-red-500 underline text-xs">Supprimer</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `

    document.querySelectorAll('[data-admin-delete]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-admin-delete')
        if (!confirm('Supprimer cette annonce (modération) ?')) return
        try {
          await api.del(`/admin/listings/${id}`)
          document.querySelector(`[data-row="${id}"]`).remove()
          toast('Annonce supprimée', 'success')
        } catch (err) { toast(err.message, 'error') }
      })
    })
    document.querySelectorAll('[data-admin-status]').forEach((sel) => {
      sel.addEventListener('change', async () => {
        const id = sel.getAttribute('data-admin-status')
        try {
          await api.put(`/admin/listings/${id}/status`, { status: sel.value })
          toast('Statut mis à jour', 'success')
        } catch (err) { toast(err.message, 'error') }
      })
    })
  } catch (err) {
    content.innerHTML = `<p class="text-red-500 text-center py-8">${err.message}</p>`
  }
}

async function loadUsersTab() {
  const content = document.getElementById('admin-content')
  content.innerHTML = '<div class="h-64 skeleton rounded-2xl"></div>'
  try {
    const { users } = await api.get('/admin/users')
    content.innerHTML = `
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-cream text-left">
              <tr>
                <th class="p-3 font-bold">Nom</th>
                <th class="p-3 font-bold">Email</th>
                <th class="p-3 font-bold">Rôle</th>
                <th class="p-3 font-bold">Commerçant Pro</th>
                <th class="p-3 font-bold">Inscrit le</th>
              </tr>
            </thead>
            <tbody>
              ${users.map((u) => `
                <tr class="border-t border-[var(--color-border)]" data-user-row="${u.id}">
                  <td class="p-3 font-semibold">${escapeHtml(u.name)}</td>
                  <td class="p-3 text-xs">${escapeHtml(u.email)}</td>
                  <td class="p-3">
                    <select data-role-select="${u.id}" class="text-xs border border-[var(--color-border)] rounded-lg px-2 py-1">
                      <option value="user" ${u.role === 'user' ? 'selected' : ''}>Utilisateur</option>
                      <option value="pro" ${u.role === 'pro' ? 'selected' : ''}>Pro</option>
                      <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                  </td>
                  <td class="p-3">
                    <label class="flex items-center gap-1.5">
                      <input type="checkbox" data-pro-toggle="${u.id}" class="accent-terracotta" ${u.is_pro ? 'checked' : ''}>
                      <span class="text-xs">Badge PRO</span>
                    </label>
                  </td>
                  <td class="p-3 text-xs text-gray-400">${timeAgo(u.created_at)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `

    document.querySelectorAll('[data-role-select]').forEach((sel) => {
      sel.addEventListener('change', async () => {
        const id = sel.getAttribute('data-role-select')
        try {
          await api.put(`/admin/users/${id}/role`, { role: sel.value })
          toast('Rôle mis à jour', 'success')
        } catch (err) { toast(err.message, 'error') }
      })
    })
    document.querySelectorAll('[data-pro-toggle]').forEach((chk) => {
      chk.addEventListener('change', async () => {
        const id = chk.getAttribute('data-pro-toggle')
        try {
          await api.put(`/admin/users/${id}/pro`, { is_pro: chk.checked })
          toast('Statut Pro mis à jour', 'success')
        } catch (err) { toast(err.message, 'error') }
      })
    })
  } catch (err) {
    content.innerHTML = `<p class="text-red-500 text-center py-8">${err.message}</p>`
  }
}
