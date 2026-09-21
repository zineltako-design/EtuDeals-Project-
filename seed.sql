-- Données de démonstration EtuDeals

-- Mots de passe de démo : admin@etudeals.com / admin123, les autres / demo1234
INSERT OR IGNORE INTO users (id, name, email, phone, password_hash, role, is_pro) VALUES
  (1, 'Admin EtuDeals', 'admin@etudeals.com', '+224600000000', 'pbkdf2$100000$78d575f8f6b90109c9a12258042c7823$7be1266bbe556e533829b4997cbcf81d8767fccbf8bdb7c24067a8940c005a6d', 'admin', 0),
  (2, 'Fatoumata Camara', 'fatou@example.com', '+224622111222', 'pbkdf2$100000$97fb122cc6ce9879490f2b6f3908327d$24be6bda0397362067cb49b9f8d4ffd6864ddc4285edf8797e544008dd40ac06', 'user', 0),
  (3, 'Ibrahima Diallo', 'ibra@example.com', '+224655333444', 'pbkdf2$100000$97fb122cc6ce9879490f2b6f3908327d$24be6bda0397362067cb49b9f8d4ffd6864ddc4285edf8797e544008dd40ac06', 'user', 0),
  (4, 'Aïcha Bah', 'aicha@example.com', '+224666555777', 'pbkdf2$100000$97fb122cc6ce9879490f2b6f3908327d$24be6bda0397362067cb49b9f8d4ffd6864ddc4285edf8797e544008dd40ac06', 'pro', 1);

INSERT OR IGNORE INTO listings (id, user_id, category_slug, title, description, price, is_free, neighborhood, contact_phone, contact_whatsapp, total_kg, remaining_kg, destination, travel_date) VALUES
  (1, 2, 'logement', 'Chambre en colocation à Kipé', 'Belle chambre meublée dans une colocation calme, proche de l''université. Wifi inclus, eau et électricité stables.', 350000, 0, 'Kipé', '+224622111222', '224622111222', NULL, NULL, NULL, NULL),
  (2, 3, 'transport', 'Kilos disponibles vers Douala Cameroun', 'Je voyage le 15 octobre vers Douala. J''ai encore de la place pour vos colis/bagages. Tarif raisonnable.', 15000, 0, 'Dixinn', '+224655333444', '224655333444', 20, 12, 'Douala, Cameroun', '2026-10-15'),
  (3, 4, 'marketplace', 'MacBook Air 2020 - Très bon état', 'MacBook Air 13 pouces, 8Go RAM, 256Go SSD. Utilisé 1 an, aucun problème. Chargeur inclus.', 2800000, 0, 'Lambanyi', '+224666555777', '224666555777', NULL, NULL, NULL, NULL),
  (4, 2, 'services', 'Impression & Reliure de mémoires', 'Impression rapide et reliure professionnelle de mémoires, rapports de stage. Livraison possible sur le campus.', 5000, 0, 'Sonfonia', '+224622111222', '224622111222', NULL, NULL, NULL, NULL),
  (5, 3, 'resto', 'Crêpes maison faites sur commande', 'Crêpes sucrées ou salées, préparées le jour même. Livraison sur le campus de Sonfonia.', 3000, 0, 'Sonfonia', '+224655333444', '224655333444', NULL, NULL, NULL, NULL),
  (6, 4, 'evenements', 'Soirée Journée des Camerounais 2026', 'Grande soirée culturelle avec musique live, plats traditionnels et animations. Billets en prévente.', 25000, 0, 'Donka', '+224666555777', '224666555777', NULL, NULL, NULL, NULL),
  (7, 2, 'marketplace', 'Livres de médecine 2ème année', 'Lot de livres de médecine en bon état, à donner à un étudiant motivé.', NULL, 1, 'Kipé', '+224622111222', '224622111222', NULL, NULL, NULL, NULL);

INSERT OR IGNORE INTO listing_images (listing_id, image_url, sort_order) VALUES
  (1, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 0),
  (2, 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800', 0),
  (3, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', 0),
  (4, 'https://images.unsplash.com/photo-1568667256549-094345857637?w=800', 0),
  (5, 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=800', 0),
  (6, 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800', 0);

INSERT OR IGNORE INTO reviews (seller_id, author_id, rating, comment) VALUES
  (2, 3, 5, 'Très sérieuse, chambre exactement comme décrite !'),
  (3, 2, 4, 'Bon transporteur, colis livré à temps.'),
  (4, 2, 5, 'MacBook impeccable, transaction rapide et fiable.');

INSERT OR IGNORE INTO comments (listing_id, user_id, message) VALUES
  (1, 3, 'Est-ce que la chambre est toujours disponible ?'),
  (2, 4, 'Tu peux prendre 5kg de plus ?'),
  (3, 2, 'Le clavier est en AZERTY ou QWERTY ?');
