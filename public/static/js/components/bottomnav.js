import { state } from '../state.js'

export function renderBottomNav() {
  const container = document.getElementById('app-bottom-nav')
  const isLogged = !!state.token

  container.innerHTML = `
    <nav class="bottom-nav">
      <a href="/" data-link data-nav-link="/">
        <i class="fa-solid fa-house"></i>
        <span>Accueil</span>
      </a>
      <a href="/recherche" data-link data-nav-link="/recherche">
        <i class="fa-solid fa-magnifying-glass"></i>
        <span>Rechercher</span>
      </a>
      <a href="/publier" data-link data-nav-link="/publier" class="relative">
        <span class="bottom-nav-fab"><i class="fa-solid fa-plus"></i></span>
      </a>
      <a href="${isLogged ? '/mes-annonces' : '/connexion'}" data-link data-nav-link="/mes-annonces">
        <i class="fa-solid fa-list-check"></i>
        <span>Mes annonces</span>
      </a>
      <a href="${isLogged ? '/profil' : '/connexion'}" data-link data-nav-link="${isLogged ? '/profil' : '/connexion'}">
        <i class="fa-solid fa-circle-user"></i>
        <span>Profil</span>
      </a>
    </nav>
  `
}

window.addEventListener('auth-changed', renderBottomNav)
