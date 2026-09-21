import { api } from '../api.js'
import { isAuthenticated } from '../state.js'
import { CATEGORIES, NEIGHBORHOODS, toast } from '../utils.js'
import { navigate } from '../router.js'

export function renderPublish() {
  const root = document.getElementById('app-root')

  if (!isAuthenticated()) {
    root.innerHTML = `
      <div class="max-w-md mx-auto text-center py-20 px-6">
        <i class="fa-solid fa-lock text-5xl text-terracotta mb-4"></i>
        <h1 class="text-xl font-bold mb-2">Connexion requise</h1>
        <p class="text-gray-500 mb-6">Vous devez être connecté pour publier une annonce.</p>
        <a href="/connexion?redirect=/publier" data-link class="btn-primary px-6 py-3 inline-block">Se connecter</a>
      </div>
    `
    return
  }

  root.innerHTML = `
    <div class="max-w-3xl mx-auto px-4 lg:px-8 py-8 pb-24">
      <h1 class="text-2xl font-extrabold mb-1">Publier une annonce</h1>
      <p class="text-gray-500 text-sm mb-6">Gratuit pour le moment — remplissez le formulaire ci-dessous.</p>

      <form id="publish-form" class="space-y-5">
        <!-- Catégorie -->
        <div>
          <label class="block text-sm font-bold mb-2">Catégorie *</label>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2" id="category-select">
            ${CATEGORIES.map((cat) => `
              <button type="button" data-cat="${cat.slug}" class="cat-option flex items-center gap-2 px-3 py-3 rounded-xl border-2 border-[var(--color-border)] text-left text-xs font-semibold hover:border-terracotta/50 transition-colors">
                <i class="fa-solid ${cat.icon} text-terracotta"></i>
                <span>${cat.name}</span>
              </button>
            `).join('')}
          </div>
          <input type="hidden" id="category_slug" required>
        </div>

        <div>
          <label class="block text-sm font-bold mb-2">Titre de l'annonce *</label>
          <input id="title" type="text" required maxlength="120" placeholder="Ex : Chambre en colocation à Kipé" class="input-field">
        </div>

        <div>
          <label class="block text-sm font-bold mb-2">Description *</label>
          <textarea id="description" rows="5" required placeholder="Décrivez votre annonce en détail..." class="input-field"></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-bold mb-2">Prix (GNF)</label>
            <input id="price" type="number" min="0" placeholder="0" class="input-field" ${''}>
          </div>
          <div class="flex items-end pb-3">
            <label class="flex items-center gap-2 text-sm font-semibold cursor-pointer">
              <input type="checkbox" id="is_free" class="accent-terracotta w-4 h-4">
              Gratuit / Don
            </label>
          </div>
        </div>

        <div>
          <label class="block text-sm font-bold mb-2">Quartier / Localisation *</label>
          <select id="neighborhood" required class="input-field">
            <option value="">Sélectionnez un quartier</option>
            ${NEIGHBORHOODS.map((n) => `<option value="${n}">${n}</option>`).join('')}
          </select>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-bold mb-2">Téléphone de contact *</label>
            <input id="contact_phone" type="tel" required placeholder="+224 6XX XXX XXX" class="input-field">
          </div>
          <div>
            <label class="block text-sm font-bold mb-2">WhatsApp (si différent)</label>
            <input id="contact_whatsapp" type="tel" placeholder="+224 6XX XXX XXX" class="input-field">
          </div>
        </div>

        <!-- Section Transport & Kilos (conditionnelle) -->
        <div id="transport-fields" class="hidden space-y-4 p-4 bg-mint-soft/30 rounded-xl border border-mint/30">
          <p class="text-sm font-bold text-mint"><i class="fa-solid fa-plane mr-1"></i> Informations Transport & Kilos</p>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold mb-2">Kilos disponibles</label>
              <input id="total_kg" type="number" min="0" step="0.5" placeholder="Ex : 20" class="input-field">
            </div>
            <div>
              <label class="block text-sm font-semibold mb-2">Date de départ</label>
              <input id="travel_date" type="date" class="input-field">
            </div>
          </div>
          <div>
            <label class="block text-sm font-semibold mb-2">Destination</label>
            <input id="destination" type="text" placeholder="Ex : Douala, Cameroun" class="input-field">
          </div>
          <div class="disclaimer-box p-3 text-xs flex gap-2">
            <i class="fa-solid fa-circle-info text-terracotta mt-0.5"></i>
            <span>Pour les annonces de change ou transport financier, rappelez-vous qu'EtuDeals ne garantit aucune transaction entre particuliers.</span>
          </div>
        </div>

        <!-- Upload images -->
        <div>
          <label class="block text-sm font-bold mb-2">Photos (jusqu'à 5)</label>
          <input id="image-input" type="file" accept="image/*" multiple class="hidden">
          <div id="image-drop-zone" class="border-2 border-dashed border-[var(--color-border)] rounded-xl p-6 text-center cursor-pointer hover:border-terracotta/50 transition-colors">
            <i class="fa-solid fa-cloud-arrow-up text-3xl text-terracotta mb-2"></i>
            <p class="text-sm font-semibold">Cliquez pour ajouter des photos</p>
            <p class="text-xs text-gray-400">JPG, PNG, WEBP — 5MB max par image</p>
          </div>
          <div id="image-preview-grid" class="grid grid-cols-4 sm:grid-cols-5 gap-2 mt-3"></div>
        </div>

        <!-- Palier (préparé, inactif) -->
        <div class="p-4 bg-gray-50 rounded-xl border border-[var(--color-border)] opacity-60">
          <p class="text-sm font-bold mb-2"><i class="fa-solid fa-star text-terracotta mr-1"></i> Palier de publication</p>
          <p class="text-xs text-gray-500 mb-3">Fonctionnalité à venir — pour le moment, toutes les annonces sont publiées gratuitement.</p>
          <div class="grid grid-cols-3 gap-2 text-xs">
            <div class="border rounded-lg p-2 text-center bg-white border-terracotta font-bold">Gratuit<br><span class="text-gray-400">Actif</span></div>
            <div class="border rounded-lg p-2 text-center bg-white cursor-not-allowed">Standard<br><span class="text-gray-400">Bientôt</span></div>
            <div class="border rounded-lg p-2 text-center bg-white cursor-not-allowed">Pro<br><span class="text-gray-400">Bientôt</span></div>
          </div>
        </div>

        <button type="submit" id="submit-btn" class="btn-primary w-full py-4 text-base font-bold">
          Publier mon annonce
        </button>
      </form>
    </div>
  `

  let selectedCategory = ''
  const uploadedImageUrls = []

  document.querySelectorAll('.cat-option').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedCategory = btn.getAttribute('data-cat')
      document.getElementById('category_slug').value = selectedCategory
      document.querySelectorAll('.cat-option').forEach((b) => b.classList.remove('border-terracotta', 'bg-terracotta/10'))
      btn.classList.add('border-terracotta', 'bg-terracotta/10')
      document.getElementById('transport-fields').classList.toggle('hidden', selectedCategory !== 'transport')
    })
  })

  document.getElementById('is_free').addEventListener('change', (e) => {
    document.getElementById('price').disabled = e.target.checked
    if (e.target.checked) document.getElementById('price').value = ''
  })

  // Upload images
  const dropZone = document.getElementById('image-drop-zone')
  const imageInput = document.getElementById('image-input')
  const previewGrid = document.getElementById('image-preview-grid')

  dropZone.addEventListener('click', () => imageInput.click())
  imageInput.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files).slice(0, 5 - uploadedImageUrls.length)
    for (const file of files) {
      const previewId = `preview-${Date.now()}-${Math.random().toString(36).slice(2)}`
      const localUrl = URL.createObjectURL(file)
      previewGrid.insertAdjacentHTML('beforeend', `
        <div id="${previewId}" class="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
          <img src="${localUrl}" class="w-full h-full object-cover">
          <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
            <i class="fa-solid fa-spinner fa-spin text-white"></i>
          </div>
        </div>
      `)

      try {
        const formData = new FormData()
        formData.append('file', file)
        const res = await api.post('/upload', formData)
        uploadedImageUrls.push(res.url)
        document.getElementById(previewId).querySelector('.absolute').remove()
      } catch (err) {
        document.getElementById(previewId).remove()
        toast(`Erreur upload : ${err.message}`, 'error')
      }
    }
    imageInput.value = ''
  })

  document.getElementById('publish-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    if (!selectedCategory) { toast('Veuillez sélectionner une catégorie', 'error'); return }

    const isFree = document.getElementById('is_free').checked
    const payload = {
      category_slug: selectedCategory,
      title: document.getElementById('title').value.trim(),
      description: document.getElementById('description').value.trim(),
      price: isFree ? null : (parseFloat(document.getElementById('price').value) || null),
      is_free: isFree,
      neighborhood: document.getElementById('neighborhood').value,
      contact_phone: document.getElementById('contact_phone').value.trim(),
      contact_whatsapp: document.getElementById('contact_whatsapp').value.trim(),
      images: uploadedImageUrls
    }

    if (selectedCategory === 'transport') {
      payload.total_kg = parseFloat(document.getElementById('total_kg').value) || null
      payload.destination = document.getElementById('destination').value.trim()
      payload.travel_date = document.getElementById('travel_date').value || null
    }

    const submitBtn = document.getElementById('submit-btn')
    submitBtn.disabled = true
    submitBtn.textContent = 'Publication en cours...'

    try {
      const res = await api.post('/listings', payload)
      toast('Annonce publiée avec succès !', 'success')
      navigate(`/annonce/${res.id}`)
    } catch (err) {
      toast(err.message, 'error')
      submitBtn.disabled = false
      submitBtn.textContent = 'Publier mon annonce'
    }
  })
}
