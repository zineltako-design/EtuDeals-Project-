import { api } from '../api.js'
import { setAuth } from '../state.js'
import { toast } from '../utils.js'
import { navigate } from '../router.js'

export function renderLogin(params, query) {
  const root = document.getElementById('app-root')
  const redirect = query.get('redirect') || '/'

  root.innerHTML = `
    <div class="max-w-md mx-auto px-4 py-12">
      <div class="text-center mb-8">
        <img src="/static/images/logo.png" class="h-16 w-16 rounded-2xl mx-auto mb-3" alt="EtuDeals">
        <h1 class="text-2xl font-extrabold">Connexion</h1>
        <p class="text-gray-500 text-sm mt-1">Accédez à votre compte EtuDeals</p>
      </div>

      <form id="login-form" class="space-y-4 card p-6">
        <div>
          <label class="block text-sm font-bold mb-2">Email</label>
          <input id="email" type="email" required class="input-field" placeholder="votre@email.com">
        </div>
        <div>
          <label class="block text-sm font-bold mb-2">Mot de passe</label>
          <input id="password" type="password" required class="input-field" placeholder="••••••••">
        </div>
        <button id="submit-btn" class="btn-primary w-full py-3.5">Se connecter</button>
      </form>

      <p class="text-center text-sm text-gray-500 mt-6">
        Pas encore de compte ?
        <a href="/inscription?redirect=${encodeURIComponent(redirect)}" data-link class="text-terracotta font-bold">Inscrivez-vous</a>
      </p>
    </div>
  `

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    const btn = document.getElementById('submit-btn')
    btn.disabled = true
    btn.textContent = 'Connexion...'
    try {
      const res = await api.post('/auth/login', {
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value
      })
      setAuth(res.token, res.user)
      toast(`Bienvenue, ${res.user.name} !`, 'success')
      navigate(redirect)
    } catch (err) {
      toast(err.message, 'error')
      btn.disabled = false
      btn.textContent = 'Se connecter'
    }
  })
}

export function renderRegister(params, query) {
  const root = document.getElementById('app-root')
  const redirect = query.get('redirect') || '/'

  root.innerHTML = `
    <div class="max-w-md mx-auto px-4 py-12">
      <div class="text-center mb-8">
        <img src="/static/images/logo.png" class="h-16 w-16 rounded-2xl mx-auto mb-3" alt="EtuDeals">
        <h1 class="text-2xl font-extrabold">Créer un compte</h1>
        <p class="text-gray-500 text-sm mt-1">Rejoignez la communauté EtuDeals</p>
      </div>

      <form id="register-form" class="space-y-4 card p-6">
        <div>
          <label class="block text-sm font-bold mb-2">Nom complet</label>
          <input id="name" type="text" required class="input-field" placeholder="Votre nom">
        </div>
        <div>
          <label class="block text-sm font-bold mb-2">Email</label>
          <input id="email" type="email" required class="input-field" placeholder="votre@email.com">
        </div>
        <div>
          <label class="block text-sm font-bold mb-2">Téléphone</label>
          <input id="phone" type="tel" class="input-field" placeholder="+224 6XX XXX XXX">
        </div>
        <div>
          <label class="block text-sm font-bold mb-2">Mot de passe</label>
          <input id="password" type="password" required minlength="6" class="input-field" placeholder="6 caractères minimum">
        </div>
        <button id="submit-btn" class="btn-primary w-full py-3.5">Créer mon compte</button>
      </form>

      <p class="text-center text-sm text-gray-500 mt-6">
        Déjà un compte ?
        <a href="/connexion?redirect=${encodeURIComponent(redirect)}" data-link class="text-terracotta font-bold">Connectez-vous</a>
      </p>
    </div>
  `

  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    const btn = document.getElementById('submit-btn')
    btn.disabled = true
    btn.textContent = 'Création en cours...'
    try {
      const res = await api.post('/auth/register', {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        password: document.getElementById('password').value
      })
      setAuth(res.token, res.user)
      toast(`Bienvenue sur EtuDeals, ${res.user.name} !`, 'success')
      navigate(redirect)
    } catch (err) {
      toast(err.message, 'error')
      btn.disabled = false
      btn.textContent = 'Créer mon compte'
    }
  })
}
