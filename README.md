# EtuDeals

## Aperçu du projet
- **Nom** : EtuDeals — *Étudiants • Communauté • Échanges*
- **Objectif** : Plateforme communautaire de petites annonces et de mise en relation de proximité pour les étudiants et étrangers en Guinée (logement, transport/kilos, marketplace seconde main, micro-services, bons plans/restauration, événements), afin de centraliser les besoins du quotidien dispersés dans les groupes WhatsApp.
- **Stratégie** : 100% gratuit au lancement. L'architecture prévoit déjà (champ `plan` sur les annonces, UI dédiée désactivée) l'intégration future de paliers de publication payants.

## URLs
- **Preview sandbox (dev)** : fournie via GetServiceUrl (temporaire)
- **Production** : à renseigner après déploiement Cloudflare Pages
- **Dépôt GitHub** : à renseigner après push

## Fonctionnalités livrées

### Interface Client / Visiteur
- Accueil avec recherche globale, filtres par catégorie/quartier/gratuit, grille d'annonces responsive
- Page de détail annonce : galerie photos, description, bouton WhatsApp/téléphone pré-rempli, compteur kilos en temps réel (catégorie Transport), avis vendeur (étoiles), Q&A publique
- 6 catégories : Logement & Colocation, Transport/Kilos & Échanges, Marketplace Seconde Main, Micro-Services & Talents, Bons Plans & Restauration, Événements & Vie Communautaire

### Interface Publication (utilisateur connecté)
- Formulaire de publication complet (catégorie, titre, description, prix/gratuit, quartier, contact, upload photos R2, champs spécifiques Transport/Kilos)
- Tableau de bord "Mes annonces" : liste, modification statut, suppression, bouton de décrémentation rapide des kilos restants
- Palier de publication (Gratuit/Standard/Pro) affiché en UI mais désactivé — prêt pour activation future

### Interface Administrateur
- Statistiques globales (utilisateurs, annonces actives, comptes Pro, répartition par catégorie)
- Modération globale des annonces (changement de statut, suppression instantanée)
- Gestion des rôles utilisateurs et du badge "Commerçant Pro"

### Transverse
- Authentification (inscription/connexion) par JWT signé HMAC-SHA256 + mots de passe hachés PBKDF2-SHA256 (Web Crypto API, 100% compatible Cloudflare Workers, sans dépendance Node.js)
- Système d'avis (1-5 étoiles + commentaire) sur les profils vendeurs/prestataires
- Questions/réponses publiques sous chaque annonce
- Footer global : mentions légales, CGU, politique de confidentialité, disclaimer de non-responsabilité (mise en relation uniquement, pas de garantie financière), contact
- Thème "Terre d'Épices & Nuit Urbaine" (sable #FBF9F5, terracotta #E05A36, indigo #1A2B3C, menthe #2E8B57)
- Responsive mobile-first avec bottom nav mobile + header/menu desktop
- PWA : `manifest.json`, service worker (`sw.js`, cache stale-while-revalidate), icônes 192/512

## Entrées fonctionnelles (API)

| Méthode | Route | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Inscription (name, email, phone?, password) | Non |
| POST | `/api/auth/login` | Connexion (email, password) | Non |
| GET | `/api/auth/me` | Profil courant | Oui |
| GET | `/api/categories` | Liste des 6 catégories | Non |
| GET | `/api/listings?category=&neighborhood=&q=&is_free=&page=&limit=` | Liste annonces filtrée + pagination | Non |
| GET | `/api/listings/:id` | Détail annonce (images, commentaires, note vendeur) | Non |
| POST | `/api/listings` | Créer une annonce | Oui |
| GET | `/api/listings/mine/list` | Mes annonces | Oui |
| PUT | `/api/listings/:id` | Modifier (titre, prix, statut, kilos restants...) | Oui (propriétaire/admin) |
| POST | `/api/listings/:id/decrement-kg` | Décrémenter les kilos restants `{amount}` | Oui (propriétaire/admin) |
| DELETE | `/api/listings/:id` | Supprimer | Oui (propriétaire/admin) |
| GET | `/api/reviews/seller/:sellerId` | Avis d'un vendeur | Non |
| POST | `/api/reviews/seller/:sellerId` | Laisser un avis `{rating, comment}` | Oui |
| POST | `/api/comments/listing/:listingId` | Poster une question `{message}` | Oui |
| DELETE | `/api/comments/:id` | Supprimer un commentaire | Oui (auteur/admin) |
| POST | `/api/upload` | Upload image vers R2 (FormData `file`) | Oui |
| GET | `/api/files/*` | Servir un fichier R2 | Non |
| GET | `/api/admin/stats` | Statistiques globales | Admin |
| GET/DELETE/PUT | `/api/admin/listings...` | Modération annonces | Admin |
| GET/PUT | `/api/admin/users...` | Gestion rôles / badge Pro | Admin |

## Comptes de démonstration (seed.sql)
- **Admin** : `admin@etudeals.com` / `admin123`
- **Utilisateurs** : `fatou@example.com`, `ibra@example.com`, `aicha@example.com` (Pro) / `demo1234`

## Architecture des données
- **Stockage** : Cloudflare D1 (SQLite edge) pour toutes les données relationnelles, Cloudflare R2 pour les images uploadées
- **Tables** : `users`, `categories`, `listings`, `listing_images`, `reviews`, `comments`
- **Sécurité** : mots de passe PBKDF2 (100 000 itérations, sel aléatoire), JWT HMAC-SHA256 (expiration 7 jours), aucune dépendance Node.js (100% Web Crypto API, compatible Workers)

## Stack technique
- **Backend** : Hono (TypeScript) sur Cloudflare Workers/Pages
- **Frontend** : SPA vanilla JS (ES modules) + Tailwind CSS (CDN) + Font Awesome, routing client custom
- **Base de données** : Cloudflare D1
- **Stockage fichiers** : Cloudflare R2
- **PWA** : manifest.json + service worker

## Guide utilisateur rapide
1. Parcourir les annonces depuis l'accueil, filtrer par catégorie/quartier/gratuit ou rechercher
2. Créer un compte (inscription) pour publier une annonce, poser des questions ou laisser un avis
3. Publier via le bouton "+" (mobile) ou "Publier" (desktop) — formulaire adapté à chaque catégorie (ex: champs kilos pour Transport)
4. Gérer ses annonces depuis "Mes annonces" (modifier statut, décrémenter kilos, supprimer)
5. Contacter un vendeur directement via WhatsApp ou téléphone depuis la fiche annonce
6. Les administrateurs accèdent à `/admin` pour modérer et gérer les comptes

## Ce qu'il reste à faire / prochaines étapes
- Déploiement en production sur Cloudflare Pages (création base D1/bucket R2 réels, `wrangler d1 create`, `wrangler r2 bucket create`, mise à jour `wrangler.jsonc` avec les vrais IDs)
- Activation des paliers de publication payants (Standard/Pro) — UI déjà préparée, il manque l'intégration paiement (ex: Orange Money, Stripe)
- Notifications (email ou push) lors d'une nouvelle question/réponse sur une annonce
- Modération automatique (mots-clés interdits) en complément de la modération manuelle admin
- Pagination/infinite scroll optimisée et cache CDN des images
- Tests automatisés (actuellement validation manuelle via curl/Playwright)

## Déploiement
- **Plateforme cible** : Cloudflare Pages (Hono + D1 + R2)
- **Statut actuel** : ✅ Fonctionnel en local (sandbox, PM2 + wrangler pages dev + D1/R2 simulés)
- **Dernière mise à jour** : 21 septembre 2026
