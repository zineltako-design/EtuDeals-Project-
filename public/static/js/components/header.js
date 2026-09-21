import { state, clearAuth } from '../state.js'
import { navigate } from '../router.js'
import { toast } from '../utils.js'

export function renderHeader() {
  const container = document.getElementById('app-header')
  const isLogged = !!state.token
  const user = state.user

  container.innerHTML = `
    <header class="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-[var(--color-border)]">
      <div class="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-4">
        <a href="/" data-link class="flex items-center gap-2 shrink-0">
          <img src="/static/images/logo.png" alt="EtuDeals" class="h-10 w-10 rounded-xl object-cover">
          <span class="hidden sm:block font-extrabold text-lg leading-none">
            <span class="text-indigo">Etu</span><span class="text-terracotta">Deals</span>
          </span>
        </a>

        <!-- Recherche desktop -->
        <div class="hidden lg:flex flex-1 max-w-xl">
          <form id="header-search-form" class="w-full relative">
            <input id="header-search-input" type="search" placeholder="Rechercher une annonce, un quartier..."
              class="input-field pl-10" />
            <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </form>
        </div>

        <nav class="hidden lg:flex items-center gap-5 text-sm font-semibold shrink-0">
          <a href="/" data-link data-nav-link="/" class="hover:text-terracotta transition-colors">Accueil</a>
          <a href="/publier" data-link data-nav-link="/publier" class="hover:text-terracotta transition-colors">Publier</a>
          ${isLogged ? `<a href="/mes-annonces" data-link data-nav-link="/mes-annonces" class="hover:text-terracotta transition-colors">Mes annonces</a>` : ''}
          ${user?.role === 'admin' ? `<a href="/admin" data-link data-nav-link="/admin" class="hover:text-terracotta transition-colors">Admin</a>` : ''}
        </nav>

        <div class="flex items-center gap-2 shrink-0">
          <a href="/publier" data-link class="lg:hidden btn-primary w-10 h-10 flex items-center justify-center rounded-full">
            <i class="fa-solid fa-plus"></i>
          </a>
          ${isLogged ? `
            <div class="relative">
              <button id="user-menu-btn" class="flex items-center gap-2 btn-secondary px-3 py-2 text-sm">
                <i class="fa-solid fa-circle-user text-terracotta"></i>
                <span class="hidden md:inline max-w-[100px] truncate">${escapeHtmlSimple(user?.name || 'Compte')}</span>
                <i class="fa-solid fa-chevron-down text-xs"></i>
              </button>
              <div id="user-menu-dropdown" class="hidden absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[var(--color-border)] py-2 z-50">
                <a href="/mes-annonces" data-link class="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-cream"><i class="fa-solid fa-list w-4 text-terracotta"></i> Mes annonces</a>
                <a href="/profil" data-link class="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-cream"><i class="fa-solid fa-user w-4 text-terracotta"></i> Mon profil</a>
                ${user?.role === 'admin' ? `<a href="/admin" data-link class="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-cream"><i class="fa-solid fa-shield-halved w-4 text-terracotta"></i> Espace Admin</a>` : ''}
                <hr class="my-1 border-[var(--color-border)]">
                <button id="logout-btn" class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"><i class="fa-solid fa-right-from-bracket w-4"></i> Déconnexion</button>
              </div>
            </div>
          ` : `
            <a href="/connexion" data-link class="btn-secondary px-4 py-2 text-sm">Connexion</a>
            <a href="/inscription" data-link class="btn-primary px-4 py-2 text-sm hidden sm:inline-block">Inscription</a>
          `}
        </div>
      </div>
    </header>
  `

  const searchForm = document.getElementById('header-search-form')
  searchForm?.addEventListener('submit', (e) => {
    e.preventDefault()
    const q = document.getElementById('header-search-input').value.trim()
    navigate(q ? `/?q=${encodeURIComponent(q)}` : '/')
  })

  const menuBtn = document.getElementById('user-menu-btn')
  const dropdown = document.getElementById('user-menu-dropdown')
  menuBtn?.addEventListener('click', (e) => {
    e.stopPropagation()
    dropdown.classList.toggle('hidden')
  })
  document.addEventListener('click', () => dropdown?.classList.add('hidden'))

  document.getElementById('logout-btn')?.addEventListener('click', () => {
    clearAuth()
    toast('Déconnexion réussie', 'success')
    navigate('/')
  })
}

function escapeHtmlSimple(str) {
  return String(str || '').replace(/[<>&"]/g, '')
}

window.addEventListener('auth-changed', renderHeader)
