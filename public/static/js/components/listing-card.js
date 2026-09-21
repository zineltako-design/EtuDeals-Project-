import { getCategory, formatPrice, timeAgo, escapeHtml } from '../utils.js'

export function listingCardHtml(listing) {
  const cat = getCategory(listing.category_slug)
  const cover = listing.cover_image || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600'
  const kgInfo = listing.category_slug === 'transport' && listing.remaining_kg != null
    ? `<div class="absolute bottom-2 left-2 bg-white/95 rounded-full px-2.5 py-1 text-xs font-bold text-indigo shadow"><i class="fa-solid fa-weight-hanging text-terracotta mr-1"></i>${listing.remaining_kg}kg restants</div>`
    : ''

  return `
    <a href="/annonce/${listing.id}" data-link class="card overflow-hidden flex flex-col group">
      <div class="relative h-40 sm:h-44 overflow-hidden bg-gray-100">
        <img src="${cover}" alt="${escapeHtml(listing.title)}" loading="lazy"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <span class="badge-category absolute top-2 left-2 bg-white/95"><i class="fa-solid ${cat.icon} mr-1"></i>${cat.name.split('&')[0].trim()}</span>
        ${listing.is_free ? '<span class="badge-free absolute top-2 right-2">Gratuit / Don</span>' : ''}
        ${listing.seller_is_pro ? '<span class="badge-pro absolute top-9 right-2">PRO</span>' : ''}
        ${kgInfo}
      </div>
      <div class="p-3.5 flex flex-col gap-1.5 flex-1">
        <h3 class="font-bold text-sm leading-snug line-clamp-2">${escapeHtml(listing.title)}</h3>
        <p class="text-terracotta font-extrabold text-base">${formatPrice(listing.price, listing.is_free)}</p>
        <div class="flex items-center justify-between text-xs text-gray-500 mt-auto pt-1">
          <span><i class="fa-solid fa-location-dot mr-1"></i>${escapeHtml(listing.neighborhood)}</span>
          <span>${timeAgo(listing.created_at)}</span>
        </div>
      </div>
    </a>
  `
}

export function listingCardSkeletonHtml() {
  return `
    <div class="card overflow-hidden flex flex-col">
      <div class="h-40 sm:h-44 skeleton"></div>
      <div class="p-3.5 flex flex-col gap-2">
        <div class="h-4 skeleton w-4/5"></div>
        <div class="h-4 skeleton w-2/5"></div>
        <div class="h-3 skeleton w-3/5 mt-2"></div>
      </div>
    </div>
  `
}
