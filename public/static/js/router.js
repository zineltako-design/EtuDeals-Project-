const routes = []

export function addRoute(pattern, handler) {
  // Transforme /listing/:id en regex
  const paramNames = []
  const regexStr = pattern.replace(/:([^/]+)/g, (_, name) => {
    paramNames.push(name)
    return '([^/]+)'
  })
  const regex = new RegExp(`^${regexStr}$`)
  routes.push({ regex, paramNames, handler })
}

export function navigate(path, replace = false) {
  if (replace) {
    history.replaceState({}, '', path)
  } else {
    history.pushState({}, '', path)
  }
  handleRoute()
  window.scrollTo(0, 0)
}

export function handleRoute() {
  const path = window.location.pathname
  for (const route of routes) {
    const match = path.match(route.regex)
    if (match) {
      const params = {}
      route.paramNames.forEach((name, i) => { params[name] = match[i + 1] })
      const query = new URLSearchParams(window.location.search)
      route.handler(params, query)
      updateActiveNav(path)
      return
    }
  }
  // 404
  document.getElementById('app-root').innerHTML = `
    <div class="flex flex-col items-center justify-center py-24 text-center px-6">
      <i class="fa-solid fa-circle-exclamation text-5xl text-terracotta mb-4"></i>
      <h1 class="text-2xl font-bold mb-2">Page introuvable</h1>
      <p class="text-gray-500 mb-6">Cette page n'existe pas ou plus.</p>
      <a href="/" data-link class="btn-primary px-6 py-3 inline-block">Retour à l'accueil</a>
    </div>
  `
}

function updateActiveNav(path) {
  document.querySelectorAll('[data-nav-link]').forEach((el) => {
    const target = el.getAttribute('data-nav-link')
    el.classList.toggle('active', target === path || (target !== '/' && path.startsWith(target)))
  })
}

// Intercepte les clics sur les liens internes (data-link)
document.addEventListener('click', (e) => {
  const link = e.target.closest('[data-link]')
  if (link) {
    e.preventDefault()
    navigate(link.getAttribute('href'))
  }
})

window.addEventListener('popstate', handleRoute)
