// Gestion de l'état global d'authentification (localStorage)

const STORAGE_TOKEN = 'etudeals_token'
const STORAGE_USER = 'etudeals_user'

export const state = {
  token: localStorage.getItem(STORAGE_TOKEN) || null,
  user: JSON.parse(localStorage.getItem(STORAGE_USER) || 'null')
}

export function setAuth(token, user) {
  state.token = token
  state.user = user
  localStorage.setItem(STORAGE_TOKEN, token)
  localStorage.setItem(STORAGE_USER, JSON.stringify(user))
  window.dispatchEvent(new CustomEvent('auth-changed'))
}

export function clearAuth() {
  state.token = null
  state.user = null
  localStorage.removeItem(STORAGE_TOKEN)
  localStorage.removeItem(STORAGE_USER)
  window.dispatchEvent(new CustomEvent('auth-changed'))
}

export function isAuthenticated() {
  return !!state.token
}

export function isAdmin() {
  return state.user?.role === 'admin'
}
