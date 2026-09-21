import { api } from '../api.js'
import { state, isAuthenticated } from '../state.js'
import { getCategory, formatPrice, timeAgo, escapeHtml, whatsappLink, telLink, starRatingHtml, toast } from '../utils.js'
import { navigate } from '../router.js'

export async function renderListingDetail(params) {
  const root = document.getElementById('app-root')
  root.innerHTML = `<div class="max-w-5xl mx-auto px-4 py-10"><div class="h-96 skeleton rounded-2xl"></div></div>`

  let data
  try {
    data = await api.get(`/listings/${params.id}`)
  } catch (err) {
    root.innerHTML = `<div class="text-center py-20"><p class="text-red-500 font-semibold">${err.message}</p><a href="/" data-link class="text-terracotta underline mt-4 inline-block">Retour à l'accueil</a></div>`
    return
  }

  const { listing, images, comments, seller_rating } = data
  const cat = getCategory(listing.category_slug)
  const isOwner = state.user?.id === listing.user_id
  const gallery = images.length ? images : ['https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800']

  const kgSection = listing.category_slug === 'transport' && listing.remaining_kg != null ? `
    <div class="card p-4 mb-4 bg-mint-soft/40 border-mint">
      <div class="flex items-center justify-between mb-2">
        <span class="font-bold text-sm"><i class="fa-solid fa-weight-hanging text-mint mr-1"></i> Kilos disponibles</span>
        <span class="font-extrabold text-mint text-lg">${listing.remaining_kg} / ${listing.total_kg} kg</span>
      </div>
      <div class="w-full bg-white rounded-full h-2.5 overflow-hidden">
        <div class="bg-mint h-2.5 rounded-full" style="width:${Math.min(100, (listing.remaining_kg / listing.total_kg) * 100)}%"></div>
      </div>
      ${listing.destination ? `<p class="text-xs text-gray-600 mt-2"><i class="fa-solid fa-location-arrow mr-1"></i>Destination : ${escapeHtml(listing.destination)} ${listing.travel_date ? `· Départ le ${new Date(listing.travel_date).toLocaleDateString('fr-FR')}` : ''}</p>` : ''}
    </div>
  ` : ''

  const disclaimerSection = (listing.category_slug === 'transport') ? `
    <div class="disclaimer-box p-4 mb-4 text-xs flex gap-2">
      <i class="fa-solid fa-circle-info text-terracotta mt-0.5"></i>
      <span>Cette annonce concerne un service de transport/change entre particuliers. EtuDeals ne garantit pas la transaction. Vérifiez toujours la marchandise et privilégiez les lieux publics et sûrs.</span>
    </div>
  ` : ''

  root.innerHTML = `
    <div class="max-w-5xl mx-auto px-4 lg:px-8 py-6 pb-24">
      <button onclick="history.back()" class="text-sm font-semibold text-gray-500 mb-4 flex items-center gap-2 hover:text-terracotta">
        <i class="fa-solid fa-arrow-left"></i> Retour
      </button>

      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Colonne principale -->
        <div class="lg:col-span-2">
          <!-- Galerie -->
          <div class="relative rounded-2xl overflow-hidden bg-gray-100 h-72 sm:h-96 mb-2">
            <img id="main-image" src="${gallery[0]}" class="w-full h-full object-cover" alt="${escapeHtml(listing.title)}">
            <span class="badge-category absolute top-3 left-3 bg-white/95"><i class="fa-solid ${cat.icon} mr-1"></i>${cat.name}</span>
            ${listing.is_free ? '<span class="badge-free absolute top-3 right-3">Gratuit / Don</span>' : ''}
          </div>
          ${gallery.length > 1 ? `
            <div class="flex gap-2 mb-6 overflow-x-auto">
              ${gallery.map((img, i) => `<img src="${img}" data-thumb="${img}" class="thumb-img w-16 h-16 rounded-lg object-cover cursor-pointer border-2 ${i === 0 ? 'border-terracotta' : 'border-transparent'}">`).join('')}
            </div>
          ` : '<div class="mb-6"></div>'}

          <h1 class="text-xl lg:text-2xl font-extrabold mb-2">${escapeHtml(listing.title)}</h1>
          <div class="flex items-center gap-3 text-sm text-gray-500 mb-4">
            <span><i class="fa-solid fa-location-dot mr-1"></i>${escapeHtml(listing.neighborhood)}</span>
            <span>·</span>
            <span>${timeAgo(listing.created_at)}</span>
          </div>

          ${kgSection}
          ${disclaimerSection}

          <div class="card p-5 mb-6">
            <h2 class="font-bold mb-2 text-sm uppercase text-gray-400">Description</h2>
            <p class="whitespace-pre-line leading-relaxed text-sm">${escapeHtml(listing.description)}</p>
          </div>

          <!-- Vendeur & avis -->
          <div class="card p-5 mb-6">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3">
                <div class="w-11 h-11 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta font-bold">
                  ${escapeHtml((listing.seller_name || '?')[0].toUpperCase())}
                </div>
                <div>
                  <p class="font-bold text-sm flex items-center gap-1.5">${escapeHtml(listing.seller_name)} ${listing.seller_is_pro ? '<span class="badge-pro">PRO</span>' : ''}</p>
                  <div class="flex items-center gap-1 text-xs text-gray-500">
                    ${starRatingHtml(seller_rating.average, 'text-xs')}
                    <span>${seller_rating.average ? seller_rating.average : 'Pas encore noté'} ${seller_rating.count ? `(${seller_rating.count})` : ''}</span>
                  </div>
                </div>
              </div>
              ${!isOwner ? `<button id="open-review-modal" class="text-xs font-bold text-terracotta underline">Laisser un avis</button>` : ''}
            </div>
          </div>

          <!-- Q&A -->
          <div class="card p-5">
            <h2 class="font-bold mb-4 text-sm uppercase text-gray-400">Questions & Réponses (${comments.length})</h2>
            <div id="comments-list" class="space-y-4 mb-4">
              ${comments.length ? comments.map(commentHtml).join('') : '<p class="text-sm text-gray-400">Aucune question pour le moment. Soyez le premier à en poser une !</p>'}
            </div>
            <form id="comment-form" class="flex gap-2">
              <input id="comment-input" type="text" placeholder="Posez une question sur cette annonce..." class="input-field flex-1 text-sm" required>
              <button class="btn-primary px-4 text-sm shrink-0">Envoyer</button>
            </form>
          </div>
        </div>

        <!-- Sidebar contact -->
        <div class="lg:col-span-1">
          <div class="card p-5 sticky top-20">
            <p class="text-2xl font-extrabold text-terracotta mb-4">${formatPrice(listing.price, listing.is_free)}</p>

            ${isOwner ? `
              <div class="flex flex-col gap-2">
                <a href="/mes-annonces" data-link class="btn-secondary text-center py-3">Gérer dans "Mes annonces"</a>
              </div>
            ` : `
              <div class="flex flex-col gap-3">
                <a href="${whatsappLink(listing.contact_whatsapp || listing.contact_phone, `Bonjour, je suis intéressé(e) par votre annonce "${listing.title}" sur EtuDeals.`)}"
                  target="_blank" class="btn-primary text-center py-3.5 flex items-center justify-center gap-2">
                  <i class="fa-brands fa-whatsapp text-lg"></i> Contacter via WhatsApp
                </a>
                <a href="${telLink(listing.contact_phone)}" class="btn-secondary text-center py-3.5 flex items-center justify-center gap-2">
                  <i class="fa-solid fa-phone"></i> Appeler
                </a>
              </div>
            `}

            <div class="mt-5 pt-5 border-t border-[var(--color-border)] text-xs text-gray-500 flex items-start gap-2">
              <i class="fa-solid fa-shield-halved text-terracotta mt-0.5"></i>
              <span>Rencontrez-vous dans un lieu public et sûr. Vérifiez toujours l'article avant tout paiement.</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal avis -->
    <div id="review-modal" class="modal-backdrop hidden">
      <div class="modal-panel p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-lg">Laisser un avis sur ${escapeHtml(listing.seller_name)}</h3>
          <button id="close-review-modal" class="text-gray-400 hover:text-indigo"><i class="fa-solid fa-xmark text-xl"></i></button>
        </div>
        <form id="review-form">
          <label class="block text-sm font-semibold mb-2">Votre note</label>
          <div id="star-picker" class="flex gap-2 mb-4 text-2xl">
            ${[1, 2, 3, 4, 5].map((n) => `<i class="fa-solid fa-star cursor-pointer text-gray-300" data-star="${n}"></i>`).join('')}
          </div>
          <input type="hidden" id="review-rating" value="0">
          <label class="block text-sm font-semibold mb-2">Commentaire</label>
          <textarea id="review-comment" rows="3" class="input-field mb-4" placeholder="Décrivez votre expérience avec ce vendeur..."></textarea>
          <button class="btn-primary w-full py-3">Publier l'avis</button>
        </form>
      </div>
    </div>
  `

  // Galerie thumbnails
  document.querySelectorAll('.thumb-img').forEach((thumb) => {
    thumb.addEventListener('click', () => {
      document.getElementById('main-image').src = thumb.getAttribute('data-thumb')
      document.querySelectorAll('.thumb-img').forEach((t) => t.classList.remove('border-terracotta'))
      thumb.classList.add('border-terracotta')
    })
  })

  // Commentaires
  document.getElementById('comment-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    if (!isAuthenticated()) { navigate('/connexion'); return }
    const input = document.getElementById('comment-input')
    const message = input.value.trim()
    if (!message) return
    try {
      const res = await api.post(`/comments/listing/${listing.id}`, { message })
      document.getElementById('comments-list').insertAdjacentHTML('beforeend', commentHtml(res.comment))
      const emptyMsg = document.querySelector('#comments-list p')
      if (emptyMsg) emptyMsg.remove()
      input.value = ''
      toast('Question publiée', 'success')
    } catch (err) {
      toast(err.message, 'error')
    }
  })

  // Modal avis
  const modal = document.getElementById('review-modal')
  document.getElementById('open-review-modal')?.addEventListener('click', () => {
    if (!isAuthenticated()) { navigate('/connexion'); return }
    modal.classList.remove('hidden')
  })
  document.getElementById('close-review-modal')?.addEventListener('click', () => modal.classList.add('hidden'))
  modal?.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden') })

  let currentRating = 0
  document.querySelectorAll('#star-picker i').forEach((star) => {
    star.addEventListener('click', () => {
      currentRating = parseInt(star.getAttribute('data-star'), 10)
      document.getElementById('review-rating').value = currentRating
      document.querySelectorAll('#star-picker i').forEach((s) => {
        s.classList.toggle('text-yellow-400', parseInt(s.getAttribute('data-star'), 10) <= currentRating)
        s.classList.toggle('text-gray-300', parseInt(s.getAttribute('data-star'), 10) > currentRating)
      })
    })
  })

  document.getElementById('review-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    if (currentRating === 0) { toast('Veuillez sélectionner une note', 'error'); return }
    try {
      await api.post(`/reviews/seller/${listing.user_id}`, {
        rating: currentRating,
        comment: document.getElementById('review-comment').value.trim()
      })
      toast('Avis publié avec succès', 'success')
      modal.classList.add('hidden')
      renderListingDetail(params)
    } catch (err) {
      toast(err.message, 'error')
    }
  })
}

function commentHtml(comment) {
  return `
    <div class="flex gap-3">
      <div class="w-8 h-8 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta font-bold text-xs shrink-0">
        ${escapeHtml((comment.user_name || '?')[0].toUpperCase())}
      </div>
      <div class="flex-1">
        <p class="text-sm"><span class="font-bold">${escapeHtml(comment.user_name)}</span> <span class="text-gray-400 text-xs">${timeAgo(comment.created_at)}</span></p>
        <p class="text-sm text-gray-700">${escapeHtml(comment.message)}</p>
      </div>
    </div>
  `
}
