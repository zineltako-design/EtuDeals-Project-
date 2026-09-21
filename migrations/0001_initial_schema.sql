-- ============================================
-- EtuDeals - Schéma initial D1
-- ============================================

-- Utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user', -- 'user' | 'pro' | 'admin'
  is_pro INTEGER NOT NULL DEFAULT 0, -- badge commerçant pro
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Catégories (fixes, 6 catégories principales + sous-catégories optionnelles)
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  description TEXT
);

-- Annonces
CREATE TABLE IF NOT EXISTS listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  category_slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price REAL, -- NULL si gratuit/don
  is_free INTEGER NOT NULL DEFAULT 0,
  neighborhood TEXT NOT NULL, -- quartier
  contact_phone TEXT NOT NULL,
  contact_whatsapp TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'sold' | 'archived' | 'removed'
  plan TEXT NOT NULL DEFAULT 'free', -- 'free' | 'standard' | 'pro' (préparé pour le futur)
  -- Spécifique Transport & Kilos
  total_kg REAL,
  remaining_kg REAL,
  destination TEXT,
  travel_date TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Images des annonces
CREATE TABLE IF NOT EXISTS listing_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

-- Avis sur les profils vendeurs/prestataires
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  seller_id INTEGER NOT NULL, -- utilisateur noté
  author_id INTEGER NOT NULL, -- utilisateur qui note
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES users(id),
  FOREIGN KEY (author_id) REFERENCES users(id)
);

-- Questions/réponses publiques sous une annonce
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category_slug);
CREATE INDEX IF NOT EXISTS idx_listings_neighborhood ON listings(neighborhood);
CREATE INDEX IF NOT EXISTS idx_listings_user ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listing_images_listing ON listing_images(listing_id);
CREATE INDEX IF NOT EXISTS idx_reviews_seller ON reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_comments_listing ON comments(listing_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Catégories par défaut
INSERT OR IGNORE INTO categories (slug, name, icon, description) VALUES
  ('logement', 'Logement & Colocation', 'fa-house', 'Appartements, colocations, sous-locations, reprises de bail'),
  ('transport', 'Transport, Kilos & Échanges', 'fa-plane', 'Kilos voyage, transport colis, change monétaire'),
  ('marketplace', 'Marketplace Seconde Main', 'fa-tag', 'Vêtements, informatique, téléphones, meubles, livres'),
  ('services', 'Micro-Services & Talents', 'fa-lightbulb', 'Impression, coiffure, cours, graphisme, petits travaux'),
  ('resto', 'Bons Plans & Restauration', 'fa-utensils', 'Crêpes, plats faits maison, snacks, livraison campus'),
  ('evenements', 'Événements & Vie Communautaire', 'fa-champagne-glasses', 'Journées culturelles, soirées, billetterie');
