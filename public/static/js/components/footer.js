export function renderFooter() {
  const container = document.getElementById('app-footer')
  const year = new Date().getFullYear()

  container.innerHTML = `
    <footer class="bg-indigo text-white mt-16">
      <div class="max-w-7xl mx-auto px-4 lg:px-8 py-12">

        <!-- Disclaimer -->
        <div class="disclaimer-box p-5 mb-10 flex gap-3 items-start">
          <i class="fa-solid fa-triangle-exclamation text-terracotta text-xl mt-0.5"></i>
          <div class="text-sm leading-relaxed">
            <strong class="block mb-1">Avertissement de non-responsabilité</strong>
            EtuDeals est une simple plateforme de mise en relation entre particuliers.
            Nous ne gérons aucun transfert financier direct et ne garantissons pas les transactions,
            les échanges monétaires, ni les envois de colis/kilos entre utilisateurs.
            Soyez prudents : privilégiez les remises en main propre dans des lieux sûrs et fréquentés,
            vérifiez toujours la marchandise avant paiement, et ne partagez jamais vos données bancaires.
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div>
            <div class="flex items-center gap-2 mb-4">
              <img src="/static/images/logo.png" class="h-9 w-9 rounded-lg" alt="EtuDeals">
              <span class="font-extrabold text-lg">EtuDeals</span>
            </div>
            <p class="text-white/70 leading-relaxed">
              La plateforme communautaire des étudiants et étrangers en Guinée.
              Étudiants • Communauté • Échanges.
            </p>
          </div>

          <div>
            <h4 class="font-bold mb-3 text-terracotta">Catégories</h4>
            <ul class="space-y-2 text-white/70">
              <li><a href="/?category=logement" data-link class="hover:text-white">Logement & Colocation</a></li>
              <li><a href="/?category=transport" data-link class="hover:text-white">Transport & Kilos</a></li>
              <li><a href="/?category=marketplace" data-link class="hover:text-white">Marketplace</a></li>
              <li><a href="/?category=services" data-link class="hover:text-white">Micro-Services</a></li>
              <li><a href="/?category=resto" data-link class="hover:text-white">Bons Plans & Resto</a></li>
              <li><a href="/?category=evenements" data-link class="hover:text-white">Événements</a></li>
            </ul>
          </div>

          <div>
            <h4 class="font-bold mb-3 text-terracotta">Informations légales</h4>
            <ul class="space-y-2 text-white/70">
              <li><a href="/mentions-legales" data-link class="hover:text-white">Mentions légales</a></li>
              <li><a href="/cgu" data-link class="hover:text-white">Conditions Générales d'Utilisation</a></li>
              <li><a href="/confidentialite" data-link class="hover:text-white">Politique de confidentialité</a></li>
            </ul>
          </div>

          <div>
            <h4 class="font-bold mb-3 text-terracotta">Contact & Support</h4>
            <ul class="space-y-2 text-white/70">
              <li><a href="mailto:contact@etudeals.com" class="hover:text-white"><i class="fa-solid fa-envelope mr-2"></i>contact@etudeals.com</a></li>
              <li><a href="https://wa.me/224600000000" target="_blank" class="hover:text-white"><i class="fa-brands fa-whatsapp mr-2"></i>Groupe WhatsApp officiel</a></li>
              <li><a href="/contact" data-link class="hover:text-white"><i class="fa-solid fa-paper-plane mr-2"></i>Formulaire de contact</a></li>
            </ul>
          </div>
        </div>

        <hr class="border-white/10 my-8">

        <div class="flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-white/60">
          <p>© ${year} EtuDeals — Tous droits réservés.</p>
          <p>Conçu avec ❤️ pour la communauté étudiante en Guinée.</p>
        </div>
      </div>
    </footer>
  `
}
