import { toast } from '../utils.js'

export function renderMentionsLegales() {
  document.getElementById('app-root').innerHTML = legalLayout('Mentions légales', `
    <p><strong>Éditeur du site :</strong> EtuDeals — Plateforme communautaire destinée aux étudiants et étrangers résidant en République de Guinée.</p>
    <p><strong>Objet :</strong> EtuDeals est un service de mise en relation entre particuliers permettant la publication de petites annonces (logement, transport, marketplace, micro-services, restauration, événements) et de vitrines communautaires.</p>
    <p><strong>Contact :</strong> contact@etudeals.com</p>
    <p><strong>Hébergement :</strong> Le site est hébergé sur une infrastructure edge (Cloudflare Pages / Workers), garantissant disponibilité et rapidité d'accès depuis la Guinée et l'international.</p>
    <p><strong>Propriété intellectuelle :</strong> Le nom "EtuDeals", le logo et l'ensemble des éléments graphiques de la plateforme sont protégés. Toute reproduction sans autorisation est interdite.</p>
    <p><strong>Responsabilité :</strong> EtuDeals agit uniquement comme intermédiaire technique de mise en relation. Voir la section « Avertissement » du pied de page et les CGU pour plus de détails.</p>
  `)
}

export function renderCGU() {
  document.getElementById('app-root').innerHTML = legalLayout('Conditions Générales d\'Utilisation', `
    <h3 class="font-bold text-base mt-4 mb-2">1. Objet</h3>
    <p>Les présentes CGU régissent l'utilisation de la plateforme EtuDeals, service de petites annonces et de mise en relation entre étudiants et membres de la communauté en Guinée.</p>

    <h3 class="font-bold text-base mt-4 mb-2">2. Inscription</h3>
    <p>L'utilisation de certaines fonctionnalités (publication d'annonces, commentaires, avis) nécessite la création d'un compte. L'utilisateur s'engage à fournir des informations exactes et à jour.</p>

    <h3 class="font-bold text-base mt-4 mb-2">3. Règles de publication</h3>
    <ul class="list-disc pl-5 space-y-1">
      <li>Les annonces doivent être honnêtes, légales et respecter les catégories proposées.</li>
      <li>Sont interdits : les annonces frauduleuses, les produits illicites, les contenus injurieux ou discriminatoires.</li>
      <li>EtuDeals se réserve le droit de modérer, suspendre ou supprimer toute annonce ou compte ne respectant pas ces règles, sans préavis.</li>
    </ul>

    <h3 class="font-bold text-base mt-4 mb-2">4. Nature du service</h3>
    <p>EtuDeals est un simple service de mise en relation. La plateforme ne participe à aucune transaction financière entre utilisateurs, ne garantit pas la qualité, la conformité ou la livraison des biens et services échangés.</p>

    <h3 class="font-bold text-base mt-4 mb-2">5. Publication payante (future)</h3>
    <p>Le service est actuellement 100% gratuit. Des paliers de publication payants (Standard, Pro) pourront être proposés ultérieurement, sans effet rétroactif sur les annonces déjà publiées gratuitement.</p>

    <h3 class="font-bold text-base mt-4 mb-2">6. Modification des CGU</h3>
    <p>EtuDeals peut modifier les présentes CGU à tout moment. Les utilisateurs seront informés des changements significatifs.</p>
  `)
}

export function renderConfidentialite() {
  document.getElementById('app-root').innerHTML = legalLayout('Politique de confidentialité', `
    <h3 class="font-bold text-base mt-4 mb-2">Données collectées</h3>
    <p>Lors de votre inscription et de l'utilisation d'EtuDeals, nous collectons : nom, adresse email, numéro de téléphone/WhatsApp, et le contenu des annonces/commentaires que vous publiez.</p>

    <h3 class="font-bold text-base mt-4 mb-2">Utilisation des données</h3>
    <p>Ces données sont utilisées exclusivement pour : permettre la mise en relation entre utilisateurs (affichage du contact sur vos annonces), sécuriser votre compte, et améliorer le service.</p>

    <h3 class="font-bold text-base mt-4 mb-2">Partage des données</h3>
    <p>Votre numéro de téléphone/WhatsApp est visible publiquement sur vos annonces afin de permettre le contact direct par les autres utilisateurs — c'est le principe même du service. Aucune donnée n'est vendue à des tiers.</p>

    <h3 class="font-bold text-base mt-4 mb-2">Sécurité</h3>
    <p>Les mots de passe sont stockés de façon chiffrée (hachage sécurisé). Les communications avec la plateforme sont chiffrées via HTTPS.</p>

    <h3 class="font-bold text-base mt-4 mb-2">Vos droits</h3>
    <p>Vous pouvez à tout moment demander la suppression de votre compte et de vos données en nous contactant à contact@etudeals.com.</p>
  `)
}

function legalLayout(title, contentHtml) {
  return `
    <div class="max-w-3xl mx-auto px-4 lg:px-8 py-10 pb-24">
      <a href="/" data-link class="text-sm font-semibold text-gray-500 mb-4 inline-flex items-center gap-2 hover:text-terracotta">
        <i class="fa-solid fa-arrow-left"></i> Retour à l'accueil
      </a>
      <h1 class="text-2xl font-extrabold mb-6">${title}</h1>
      <div class="card p-6 text-sm leading-relaxed text-gray-700 space-y-2">
        ${contentHtml}
      </div>
    </div>
  `
}

export function renderContact() {
  document.getElementById('app-root').innerHTML = `
    <div class="max-w-lg mx-auto px-4 lg:px-8 py-10 pb-24">
      <a href="/" data-link class="text-sm font-semibold text-gray-500 mb-4 inline-flex items-center gap-2 hover:text-terracotta">
        <i class="fa-solid fa-arrow-left"></i> Retour à l'accueil
      </a>
      <h1 class="text-2xl font-extrabold mb-2">Contactez-nous</h1>
      <p class="text-gray-500 text-sm mb-6">Une question, un signalement ou une suggestion ? Écrivez-nous.</p>

      <form id="contact-form" class="card p-6 space-y-4">
        <div>
          <label class="block text-sm font-bold mb-2">Votre nom</label>
          <input id="contact-name" type="text" required class="input-field">
        </div>
        <div>
          <label class="block text-sm font-bold mb-2">Votre email</label>
          <input id="contact-email" type="email" required class="input-field">
        </div>
        <div>
          <label class="block text-sm font-bold mb-2">Message</label>
          <textarea id="contact-message" rows="4" required class="input-field"></textarea>
        </div>
        <button class="btn-primary w-full py-3.5">Envoyer le message</button>
      </form>

      <div class="mt-6 text-center text-sm text-gray-500">
        Vous pouvez aussi nous écrire directement :
        <a href="mailto:contact@etudeals.com" class="text-terracotta font-bold block mt-1">contact@etudeals.com</a>
        <a href="https://wa.me/224600000000" target="_blank" class="text-mint font-bold block mt-1">
          <i class="fa-brands fa-whatsapp"></i> Groupe WhatsApp officiel
        </a>
      </div>
    </div>
  `

  document.getElementById('contact-form').addEventListener('submit', (e) => {
    e.preventDefault()
    toast('Message envoyé ! Nous vous répondrons rapidement.', 'success')
    e.target.reset()
  })
}
