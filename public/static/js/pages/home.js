import { api } from '../api.js'
import { CATEGORIES, NEIGHBORHOODS } from '../utils.js'
import { listingCardHtml, listingCardSkeletonHtml } from '../components/listing-card.js'
import { navigate } from '../router.js'

export async function renderHome(params, query) {
  const root = document.getElementById('app-root')
  const activeCategory = query.get('category') || ''
  const activeNeighborhood = query.get('neighborhood') || ''
  const activeQuery = query.get('q') || ''
  const activeFree = query.get('is_free') || ''

  root.innerHTML = `
    <!-- Hero -->
    <section class="bg-gradient-to-br from-terracotta to-terracotta-dark text-white">
      <div class="max-w-7xl mx-auto px-4 lg:px-8 py-10 lg:py-16 text-center lg:text-left">
        <div class="lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div class="lg:flex-1">
            <h1 class="text-2xl lg:text-4xl font-extrabold mb-3 leading-tight">
              Tout ce dont vous avez besoin,<br class="hidden lg:block"> à portée de main 🇬🇳
            </h1>
            <p class="text-white/90 mb-6 text-sm lg:text-base max-w-xl mx-auto lg:mx-0">
              Logement, transport, marketplace, services, bons plans et événements —
              la communauté étudiante et internationale de Guinée centralisée en un seul endroit.
            </p>
          </div>
          <div class="hidden lg:block">
            <img src="/static/images/logo.png" class="h-32 w-32 rounded-2xl shadow-2xl" alt="EtuDeals">
          </div>
        </div>

        <form id="home-search-form" class="mt-2 lg:mt-0 relative max-w-2xl lg:mx-0 mx-auto">
          <input id="home-search-input" type="search" value="${activeQuery.replace(/"/g, '&quot;')}"
            placeholder="Rechercher : chambre, MacBook, crêpes, kilos vers..."
            class="w-full rounded-2xl border-0 px-5 py-4 pl-12 text-indigo shadow-lg focus:outline-none focus:ring-4 focus:ring-white/30" />
          <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <button class="btn-primary absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 text-sm hidden sm:block">Rechercher</button>
        </form>
      </div>
    </section>

    <!-- Catégories -->
    <section class="max-w-7xl mx-auto px-4 lg:px-8 py-6">
      <div class="flex gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-6 lg:gap-4" id="category-pills">
        ${CATEGORIES.map((cat) => `
          <button data-cat="${cat.slug}" class="cat-pill shrink-0 flex flex-col lg:flex-row items-center gap-2 px-4 py-3 rounded-2xl border-2 transition-all min-w-[92px] lg:min-w-0
            ${activeCategory === cat.slug ? 'border-terracotta bg-terracotta/10' : 'border-[var(--color-border)] bg-white hover:border-terracotta/50'}">
            <i class="fa-solid ${cat.icon} text-terracotta text-lg"></i>
            <span class="text-xs font-semibold text-center lg:text-left leading-tight">${cat.name}</span>
          </button>
        `).join('')}
      </div>
    </section>

    <!-- Filtres -->
    <section class="max-w-7xl mx-auto px-4 lg:px-8 flex flex-wrap gap-3 items-center mb-4">
      <select id="filter-neighborhood" class="input-field !w-auto text-sm py-2.5">
        <option value="">Tous les quartiers</option>
        ${NEIGHBORHOODS.map((n) => `<option value="${n}" ${activeNeighborhood === n ? 'selected' : ''}>${n}</option>`).join('')}
      </select>
      <label class="flex items-center gap-2 text-sm font-semibold cursor-pointer bg-white border border-[var(--color-border)] rounded-xl px-4 py-2.5">
        <input type="checkbox" id="filter-free" class="accent-terracotta" ${activeFree === '1' ? 'checked' : ''}>
        Gratuit / Don uniquement
      </label>
      ${(activeCategory || activeNeighborhood || activeQuery || activeFree) ? `<a href="/" data-link class="text-sm text-terracotta font-semibold underline">Réinitialiser</a>` : ''}
    </section>

    <!-- Résultats -->
    <section class="max-w-7xl mx-auto px-4 lg:px-8 pb-16">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-bold text-lg" id="results-title">Annonces récentes</h2>
      </div>
      <div id="listings-grid" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        ${Array(8).fill(listingCardSkeletonHtml()).join('')}
      </div>
      <div id="load-more-container" class="text-center mt-8 hidden">
        <button id="load-more-btn" class="btn-secondary px-6 py-3">Voir plus d'annonces</button>
      </div>
      <div id="empty-state" class="hidden text-center py-16">
        <i class="fa-solid fa-inbox text-5xl text-gray-300 mb-4"></i>
        <p class="text-gray-500 font-medium">Aucune annonce trouvée pour ces critères.</p>
      </div>
    </section>
  `

  // Handlers filtres -> navigation avec query params
  function applyFilters() {
    const p = new URLSearchParams()
    if (activeCategory) p.set('category', activeCategory)
    const nb = document.getElementById('filter-neighborhood').value
    if (nb) p.set('neighborhood', nb)
    const search = document.getElementById('home-search-input').value.trim()
    if (search) p.set('q', search)
    if (document.getElementById('filter-free').checked) p.set('is_free', '1')
    navigate(`/?${p.toString()}`)
  }

  document.getElementById('home-search-form').addEventListener('submit', (e) => {
    e.preventDefault(); applyFilters()
  })
  document.getElementById('filter-neighborhood').addEventListener('change', applyFilters)
  document.getElementById('filter-free').addEventListener('change', applyFilters)
  document.querySelectorAll('.cat-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      const slug = btn.getAttribute('data-cat')
      const p = new URLSearchParams(window.location.search)
      if (activeCategory === slug) { p.delete('category') } else { p.set('category', slug) }
      navigate(`/?${p.toString()}`)
    })
  })

  // Chargement des annonces
  let page = 1
  const apiParams = new URLSearchParams()
  if (activeCategory) apiParams.set('category', activeCategory)
  if (activeNeighborhood) apiParams.set('neighborhood', activeNeighborhood)
  if (activeQuery) apiParams.set('q', activeQuery)
  if (activeFree) apiParams.set('is_free', activeFree)

  async function loadListings(append = false) {
    try {
      const p = new URLSearchParams(apiParams)
      p.set('page', page)
      const data = await api.get(`/listings?${p.toString()}`)
      const grid = document.getElementById('listings-grid')
      const html = data.listings.map(listingCardHtml).join('')

      if (append) {
        grid.insertAdjacentHTML('beforeend', html)
      } else {
        grid.innerHTML = html
      }

      const empty = document.getElementById('empty-state')
      const loadMoreContainer = document.getElementById('load-more-container')
      if (data.listings.length === 0 && page === 1) {
        empty.classList.remove('hidden')
        grid.classList.add('hidden')
      } else {
        empty.classList.add('hidden')
        grid.classList.remove('hidden')
      }

      const totalLoaded = page * 20
      if (totalLoaded < data.pagination.total) {
        loadMoreContainer.classList.remove('hidden')
      } else {
        loadMoreContainer.classList.add('hidden')
      }

      document.getElementById('results-title').textContent = `${data.pagination.total} annonce${data.pagination.total > 1 ? 's' : ''} trouvée${data.pagination.total > 1 ? 's' : ''}`
    } catch (err) {
      document.getElementById('listings-grid').innerHTML = `<p class="col-span-full text-center text-red-500 py-8">${err.message}</p>`
    }
  }

  document.getElementById('load-more-btn')?.addEventListener('click', () => {
    page++
    loadListings(true)
  })

  loadListings()
}
