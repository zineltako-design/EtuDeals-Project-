import { addRoute, handleRoute } from './router.js'
import { renderHeader } from './components/header.js'
import { renderFooter } from './components/footer.js'
import { renderBottomNav } from './components/bottomnav.js'
import { renderHome } from './pages/home.js'
import { renderListingDetail } from './pages/listing-detail.js'
import { renderPublish } from './pages/publish.js'
import { renderLogin, renderRegister } from './pages/auth.js'
import { renderMyListings } from './pages/my-listings.js'
import { renderProfile } from './pages/profile.js'
import { renderAdmin } from './pages/admin.js'
import { renderMentionsLegales, renderCGU, renderConfidentialite, renderContact } from './pages/legal.js'

// Layout global (persistant)
renderHeader()
renderFooter()
renderBottomNav()

// Déclaration des routes
addRoute('/', renderHome)
addRoute('/recherche', renderHome)
addRoute('/annonce/:id', renderListingDetail)
addRoute('/publier', renderPublish)
addRoute('/connexion', renderLogin)
addRoute('/inscription', renderRegister)
addRoute('/mes-annonces', renderMyListings)
addRoute('/profil', renderProfile)
addRoute('/admin', renderAdmin)
addRoute('/mentions-legales', renderMentionsLegales)
addRoute('/cgu', renderCGU)
addRoute('/confidentialite', renderConfidentialite)
addRoute('/contact', renderContact)

handleRoute()

// Enregistrement du Service Worker (PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}
