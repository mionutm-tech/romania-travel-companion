-- ============================================
-- DESTINATIONS
-- ============================================
INSERT INTO destinations (id, name, slug, description, hero_image_url, lat, lng) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'Bucharest', 'bucharest',
   'Romania''s vibrant capital blends Belle Epoque elegance with communist-era grit and a booming modern culture scene. A city of contrasts that rewards curious travelers.',
   'https://images.unsplash.com/photo-1584646098378-0874589d76b1?w=1200&q=80',
   44.4268, 26.1025),

  ('d1000000-0000-0000-0000-000000000002', 'Brașov', 'brasov',
   'Nestled at the foot of Tampa Mountain, Brașov is a stunning medieval city with pastel-colored baroque buildings, Gothic churches, and easy access to Transylvanian castles.',
   'https://images.unsplash.com/photo-1560418091-88a8b3007de0?w=1200&q=80',
   45.6570, 25.6013),

  ('d1000000-0000-0000-0000-000000000003', 'Sibiu', 'sibiu',
   'A former European Capital of Culture, Sibiu enchants with its cobblestone squares, pastel houses with eye-shaped windows, and one of Romania''s richest cultural calendars.',
   'https://images.unsplash.com/photo-1592502712628-0aa23f4e1c2e?w=1200&q=80',
   45.7983, 24.1256),

  ('d1000000-0000-0000-0000-000000000004', 'Cluj-Napoca', 'cluj-napoca',
   'Romania''s unofficial second capital is a youthful, creative hub known for its festivals, thriving food scene, and mix of Hungarian and Romanian culture.',
   'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=1200&q=80',
   46.7712, 23.6236);

-- ============================================
-- POI CATEGORIES
-- ============================================
INSERT INTO poi_categories (id, name, slug, icon) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Museums & Culture', 'museums-culture', 'Landmark'),
  ('c1000000-0000-0000-0000-000000000002', 'Food & Drink', 'food-drink', 'UtensilsCrossed'),
  ('c1000000-0000-0000-0000-000000000003', 'Nature & Outdoors', 'nature-outdoors', 'Trees'),
  ('c1000000-0000-0000-0000-000000000004', 'Landmarks', 'landmarks', 'Castle'),
  ('c1000000-0000-0000-0000-000000000005', 'Nightlife', 'nightlife', 'Wine');

-- ============================================
-- POI TAGS
-- ============================================
INSERT INTO poi_tags (id, name, slug) VALUES
  ('bb000000-0000-0000-0000-000000000001', 'Historic', 'historic'),
  ('bb000000-0000-0000-0000-000000000002', 'Romantic', 'romantic'),
  ('bb000000-0000-0000-0000-000000000003', 'Family-Friendly', 'family-friendly'),
  ('bb000000-0000-0000-0000-000000000004', 'Budget', 'budget'),
  ('bb000000-0000-0000-0000-000000000005', 'Outdoor', 'outdoor'),
  ('bb000000-0000-0000-0000-000000000006', 'Nightlife', 'nightlife'),
  ('bb000000-0000-0000-0000-000000000007', 'Foodie', 'foodie'),
  ('bb000000-0000-0000-0000-000000000008', 'Instagram-Worthy', 'instagram-worthy');

-- ============================================
-- POIS — BUCHAREST (7)
-- ============================================
INSERT INTO pois (id, destination_id, category_id, name, slug, description, address, lat, lng, hero_image_url, rating, website_url, phone, opening_hours) VALUES
  ('aa000000-0000-0000-0000-000000000001',
   'd1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000004',
   'Palace of the Parliament', 'palace-of-the-parliament',
   'The world''s heaviest building and second-largest administrative structure. A staggering monument to communist-era megalomania, now home to Romania''s parliament.',
   'Strada Izvor 2-4, Bucharest', 44.4275, 26.0877,
   'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=1200&q=80',
   4.6, NULL, NULL,
   '{"mon": "09:00-17:00", "tue": "09:00-17:00", "wed": "09:00-17:00", "thu": "09:00-17:00", "fri": "09:00-17:00", "sat": "09:00-14:00", "sun": "Closed"}'),

  ('aa000000-0000-0000-0000-000000000002',
   'd1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001',
   'Romanian Athenaeum', 'romanian-athenaeum',
   'A stunning neoclassical concert hall and Bucharest''s most elegant landmark. Home to the George Enescu Philharmonic, with breathtaking interior frescoes.',
   'Strada Benjamin Franklin 1-3, Bucharest', 44.4413, 26.0973,
   'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=1200&q=80',
   4.8, NULL, NULL, NULL),

  ('aa000000-0000-0000-0000-000000000003',
   'd1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002',
   'Caru'' cu Bere', 'caru-cu-bere',
   'Bucharest''s most famous beer hall, serving traditional Romanian cuisine since 1879. The neo-Gothic interior is as much a draw as the food.',
   'Strada Stavropoleos 5, Bucharest', 44.4313, 26.1005,
   'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80',
   4.5, NULL, '+40 21 313 7560',
   '{"mon": "11:00-00:00", "tue": "11:00-00:00", "wed": "11:00-00:00", "thu": "11:00-00:00", "fri": "11:00-01:00", "sat": "11:00-01:00", "sun": "11:00-00:00"}'),

  ('aa000000-0000-0000-0000-000000000004',
   'd1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000003',
   'Herăstrău Park', 'herastrau-park',
   'Bucharest''s largest park surrounding Herăstrău Lake. Perfect for cycling, rowing, or simply strolling through its leafy paths. Also home to the Village Museum.',
   'Șoseaua Kiseleff 28, Bucharest', 44.4720, 26.0805,
   'https://images.unsplash.com/photo-1585938389612-a552a28d6914?w=1200&q=80',
   4.4, NULL, NULL, NULL),

  ('aa000000-0000-0000-0000-000000000005',
   'd1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001',
   'National Museum of Art', 'national-museum-of-art-bucharest',
   'Housed in the former Royal Palace, this museum holds Romania''s most important collection of medieval and modern Romanian art alongside European masters.',
   'Calea Victoriei 49-53, Bucharest', 44.4395, 26.0960,
   'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=1200&q=80',
   4.3, NULL, NULL,
   '{"wed": "10:00-18:00", "thu": "10:00-18:00", "fri": "10:00-18:00", "sat": "10:00-18:00", "sun": "10:00-18:00"}'),

  ('aa000000-0000-0000-0000-000000000006',
   'd1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000004',
   'Stavropoleos Monastery', 'stavropoleos-monastery',
   'A tiny, exquisitely carved 18th-century Orthodox church tucked away in the Old Town. One of Bucharest''s most photographed buildings.',
   'Strada Stavropoleos 4, Bucharest', 44.4315, 26.1000,
   'https://images.unsplash.com/photo-1603283611854-7da53a4e6446?w=1200&q=80',
   4.7, NULL, NULL, NULL),

  ('aa000000-0000-0000-0000-000000000007',
   'd1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000005',
   'Control Club', 'control-club',
   'Bucharest''s coolest underground club and cultural space. Three rooms of music spanning techno, indie, and live acts in an industrial basement setting.',
   'Strada Constantin Mille 4, Bucharest', 44.4389, 26.0968,
   'https://images.unsplash.com/photo-1571266028243-3716f02d2d67?w=1200&q=80',
   4.3, NULL, NULL,
   '{"thu": "22:00-06:00", "fri": "22:00-06:00", "sat": "22:00-06:00"}'),

-- ============================================
-- POIS — BRAȘOV (6)
-- ============================================
  ('aa000000-0000-0000-0000-000000000008',
   'd1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000004',
   'Bran Castle', 'bran-castle',
   'Commonly known as "Dracula''s Castle," this medieval fortress perches dramatically on a cliff edge. While the Dracula connection is tenuous, the atmosphere is undeniable.',
   'Strada General Traian Moșoiu 24, Bran', 45.5154, 25.3672,
   'https://images.unsplash.com/photo-1577452679916-45fb2ce08070?w=1200&q=80',
   4.4, NULL, NULL,
   '{"mon": "12:00-18:00", "tue": "09:00-18:00", "wed": "09:00-18:00", "thu": "09:00-18:00", "fri": "09:00-18:00", "sat": "09:00-18:00", "sun": "09:00-18:00"}'),

  ('aa000000-0000-0000-0000-000000000009',
   'd1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000004',
   'The Black Church', 'black-church',
   'The largest Gothic church between Vienna and Istanbul. Its name comes from damage caused by the Great Fire of 1689, which blackened its walls.',
   'Curtea Johannes Honterus 2, Brașov', 45.6411, 25.5883,
   'https://images.unsplash.com/photo-1595874823880-19bbeaba0e1f?w=1200&q=80',
   4.6, NULL, NULL,
   '{"mon": "10:00-17:00", "tue": "10:00-17:00", "wed": "10:00-17:00", "thu": "10:00-17:00", "fri": "10:00-17:00", "sat": "10:00-17:00", "sun": "12:00-17:00"}'),

  ('aa000000-0000-0000-0000-000000000010',
   'd1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000003',
   'Tâmpa Mountain', 'tampa-mountain',
   'Take the cable car or hike to the top of this forested peak overlooking Brașov for panoramic views of the city and the Carpathian Mountains beyond.',
   'Aleea Tiberiu Brediceanu, Brașov', 45.6437, 25.5946,
   'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
   4.5, NULL, NULL, NULL),

  ('aa000000-0000-0000-0000-000000000011',
   'd1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000004',
   'Council Square', 'council-square-brasov',
   'The stunning medieval heart of Brașov, ringed by colorful baroque merchant houses and dominated by the old Council House. One of Romania''s most photogenic squares.',
   'Piața Sfatului, Brașov', 45.6422, 25.5889,
   'https://images.unsplash.com/photo-1574974486893-6b1e4be429b1?w=1200&q=80',
   4.5, NULL, NULL, NULL),

  ('aa000000-0000-0000-0000-000000000012',
   'd1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002',
   'La Ceaun', 'la-ceaun-brasov',
   'Authentic Transylvanian cuisine served in generous portions. Known for hearty stews, polenta dishes, and a warm rustic atmosphere.',
   'Strada Republicii 8, Brașov', 45.6427, 25.5908,
   'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80',
   4.4, NULL, NULL,
   '{"mon": "11:00-22:00", "tue": "11:00-22:00", "wed": "11:00-22:00", "thu": "11:00-22:00", "fri": "11:00-23:00", "sat": "11:00-23:00", "sun": "11:00-22:00"}'),

  ('aa000000-0000-0000-0000-000000000013',
   'd1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000003',
   'Poiana Brașov', 'poiana-brasov',
   'Romania''s premier ski resort, set in a sunny clearing surrounded by fir forests. In summer, it transforms into a hiking and mountain biking paradise.',
   'Poiana Brașov, Brașov County', 45.5925, 25.5574,
   'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=1200&q=80',
   4.3, NULL, NULL, NULL),

-- ============================================
-- POIS — SIBIU (5)
-- ============================================
  ('aa000000-0000-0000-0000-000000000014',
   'd1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001',
   'Brukenthal National Museum', 'brukenthal-national-museum',
   'One of the oldest museums in Europe, housed in a magnificent baroque palace. Features an exceptional collection of European paintings, including Rubens and Van Eyck.',
   'Piața Mare 4-5, Sibiu', 45.7976, 24.1523,
   'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=1200&q=80',
   4.5, NULL, NULL,
   '{"tue": "10:00-18:00", "wed": "10:00-18:00", "thu": "10:00-18:00", "fri": "10:00-18:00", "sat": "10:00-18:00", "sun": "10:00-18:00"}'),

  ('aa000000-0000-0000-0000-000000000015',
   'd1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001',
   'ASTRA Open Air Museum', 'astra-open-air-museum',
   'One of the largest open-air museums in Europe, spread across a forest. Over 300 traditional buildings from across Romania, showcasing rural life through the centuries.',
   'Calea Rășinarilor 16, Sibiu', 45.7589, 24.1130,
   'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=1200&q=80',
   4.7, NULL, NULL,
   '{"mon": "09:00-17:00", "tue": "09:00-17:00", "wed": "09:00-17:00", "thu": "09:00-17:00", "fri": "09:00-17:00", "sat": "09:00-17:00", "sun": "09:00-17:00"}'),

  ('aa000000-0000-0000-0000-000000000016',
   'd1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000004',
   'Piața Mare (Grand Square)', 'piata-mare-sibiu',
   'Sibiu''s magnificent main square, ringed by colorful medieval houses with their distinctive "eyes of Sibiu" rooftop windows. The social heart of the city for 800 years.',
   'Piața Mare, Sibiu', 45.7976, 24.1520,
   'https://images.unsplash.com/photo-1592502712628-0aa23f4e1c2e?w=1200&q=80',
   4.6, NULL, NULL, NULL),

  ('aa000000-0000-0000-0000-000000000017',
   'd1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000004',
   'Bridge of Lies', 'bridge-of-lies-sibiu',
   'A charming cast-iron bridge from 1859, linking the upper and lower old towns. Legend says the bridge will collapse if you tell a lie while standing on it.',
   'Strada Avram Iancu, Sibiu', 45.7969, 24.1504,
   'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&q=80',
   4.2, NULL, NULL, NULL),

  ('aa000000-0000-0000-0000-000000000018',
   'd1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000002',
   'Crama Sibiu Vechi', 'crama-sibiu-vechi',
   'A cozy wine cellar restaurant in Sibiu''s old town serving outstanding traditional Saxon-Romanian cuisine paired with local Transylvanian wines.',
   'Strada Papiu Ilarian 3, Sibiu', 45.7982, 24.1478,
   'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80',
   4.5, NULL, NULL,
   '{"mon": "12:00-23:00", "tue": "12:00-23:00", "wed": "12:00-23:00", "thu": "12:00-23:00", "fri": "12:00-00:00", "sat": "12:00-00:00", "sun": "12:00-22:00"}'),

-- ============================================
-- POIS — CLUJ-NAPOCA (5)
-- ============================================
  ('aa000000-0000-0000-0000-000000000019',
   'd1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000004',
   'St. Michael''s Church', 'st-michaels-church-cluj',
   'The second-largest Gothic church in Transylvania, dominating Union Square. Its 80-meter tower is Cluj''s most recognizable landmark, built over nearly 100 years.',
   'Piața Unirii 20, Cluj-Napoca', 46.7700, 23.5898,
   'https://images.unsplash.com/photo-1572856027469-2d82a1bcf9fb?w=1200&q=80',
   4.5, NULL, NULL, NULL),

  ('aa000000-0000-0000-0000-000000000020',
   'd1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000003',
   'Botanical Garden', 'botanical-garden-cluj',
   'A tranquil 14-hectare oasis with over 10,000 plant species, Japanese gardens, a Roman garden, and beautiful greenhouses. A perfect escape from the city bustle.',
   'Strada Republicii 42, Cluj-Napoca', 46.7585, 23.5873,
   'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1200&q=80',
   4.6, NULL, NULL,
   '{"mon": "09:00-18:00", "tue": "09:00-18:00", "wed": "09:00-18:00", "thu": "09:00-18:00", "fri": "09:00-18:00", "sat": "09:00-18:00", "sun": "09:00-18:00"}'),

  ('aa000000-0000-0000-0000-000000000021',
   'd1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000003',
   'Central Park Cluj', 'central-park-cluj',
   'A lovely park surrounding a lake, perfect for paddle boating in summer. Home to the Cluj-Napoca Casino building and close to the Ethnographic Museum.',
   'Strada Regele Ferdinand, Cluj-Napoca', 46.7710, 23.5820,
   'https://images.unsplash.com/photo-1588714477688-cf28a50e94f7?w=1200&q=80',
   4.3, NULL, NULL, NULL),

  ('aa000000-0000-0000-0000-000000000022',
   'd1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000002',
   'Roata', 'roata-cluj',
   'A beloved Cluj restaurant famous for its traditional Transylvanian dishes — try the sarmale (cabbage rolls) and the papanași (cheese doughnuts).',
   'Strada Alexandru Ciura 6, Cluj-Napoca', 46.7695, 23.5902,
   'https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a?w=1200&q=80',
   4.4, NULL, '+40 264 592 022',
   '{"mon": "12:00-22:00", "tue": "12:00-22:00", "wed": "12:00-22:00", "thu": "12:00-22:00", "fri": "12:00-23:00", "sat": "12:00-23:00", "sun": "12:00-22:00"}'),

  ('aa000000-0000-0000-0000-000000000023',
   'd1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000005',
   'Flying Circus Pub', 'flying-circus-pub-cluj',
   'An iconic Cluj nightlife venue with eclectic decor, a lively terrace on Piata Unirii, and regular live music nights. The heart of Cluj''s social scene.',
   'Piața Unirii 14, Cluj-Napoca', 46.7701, 23.5910,
   'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=1200&q=80',
   4.2, NULL, NULL,
   '{"mon": "10:00-02:00", "tue": "10:00-02:00", "wed": "10:00-02:00", "thu": "10:00-03:00", "fri": "10:00-04:00", "sat": "10:00-04:00", "sun": "10:00-02:00"}');

-- ============================================
-- POI TAG LINKS
-- ============================================
INSERT INTO poi_tag_links (poi_id, tag_id) VALUES
  -- Palace of Parliament
  ('aa000000-0000-0000-0000-000000000001', 'bb000000-0000-0000-0000-000000000001'),
  ('aa000000-0000-0000-0000-000000000001', 'bb000000-0000-0000-0000-000000000008'),
  -- Romanian Athenaeum
  ('aa000000-0000-0000-0000-000000000002', 'bb000000-0000-0000-0000-000000000001'),
  ('aa000000-0000-0000-0000-000000000002', 'bb000000-0000-0000-0000-000000000002'),
  ('aa000000-0000-0000-0000-000000000002', 'bb000000-0000-0000-0000-000000000008'),
  -- Caru' cu Bere
  ('aa000000-0000-0000-0000-000000000003', 'bb000000-0000-0000-0000-000000000001'),
  ('aa000000-0000-0000-0000-000000000003', 'bb000000-0000-0000-0000-000000000007'),
  -- Herăstrău Park
  ('aa000000-0000-0000-0000-000000000004', 'bb000000-0000-0000-0000-000000000003'),
  ('aa000000-0000-0000-0000-000000000004', 'bb000000-0000-0000-0000-000000000005'),
  ('aa000000-0000-0000-0000-000000000004', 'bb000000-0000-0000-0000-000000000004'),
  -- Bran Castle
  ('aa000000-0000-0000-0000-000000000008', 'bb000000-0000-0000-0000-000000000001'),
  ('aa000000-0000-0000-0000-000000000008', 'bb000000-0000-0000-0000-000000000003'),
  ('aa000000-0000-0000-0000-000000000008', 'bb000000-0000-0000-0000-000000000008'),
  -- Black Church
  ('aa000000-0000-0000-0000-000000000009', 'bb000000-0000-0000-0000-000000000001'),
  -- Tâmpa Mountain
  ('aa000000-0000-0000-0000-000000000010', 'bb000000-0000-0000-0000-000000000005'),
  ('aa000000-0000-0000-0000-000000000010', 'bb000000-0000-0000-0000-000000000004'),
  ('aa000000-0000-0000-0000-000000000010', 'bb000000-0000-0000-0000-000000000008'),
  -- Council Square
  ('aa000000-0000-0000-0000-000000000011', 'bb000000-0000-0000-0000-000000000001'),
  ('aa000000-0000-0000-0000-000000000011', 'bb000000-0000-0000-0000-000000000002'),
  ('aa000000-0000-0000-0000-000000000011', 'bb000000-0000-0000-0000-000000000008'),
  -- Brukenthal
  ('aa000000-0000-0000-0000-000000000014', 'bb000000-0000-0000-0000-000000000001'),
  -- ASTRA
  ('aa000000-0000-0000-0000-000000000015', 'bb000000-0000-0000-0000-000000000001'),
  ('aa000000-0000-0000-0000-000000000015', 'bb000000-0000-0000-0000-000000000003'),
  ('aa000000-0000-0000-0000-000000000015', 'bb000000-0000-0000-0000-000000000005'),
  -- Piata Mare
  ('aa000000-0000-0000-0000-000000000016', 'bb000000-0000-0000-0000-000000000001'),
  ('aa000000-0000-0000-0000-000000000016', 'bb000000-0000-0000-0000-000000000002'),
  ('aa000000-0000-0000-0000-000000000016', 'bb000000-0000-0000-0000-000000000008'),
  -- Botanical Garden Cluj
  ('aa000000-0000-0000-0000-000000000020', 'bb000000-0000-0000-0000-000000000003'),
  ('aa000000-0000-0000-0000-000000000020', 'bb000000-0000-0000-0000-000000000005'),
  ('aa000000-0000-0000-0000-000000000020', 'bb000000-0000-0000-0000-000000000002'),
  -- Roata
  ('aa000000-0000-0000-0000-000000000022', 'bb000000-0000-0000-0000-000000000007'),
  ('aa000000-0000-0000-0000-000000000022', 'bb000000-0000-0000-0000-000000000004');

-- ============================================
-- ITINERARIES
-- ============================================
INSERT INTO itineraries (id, title, slug, description, hero_image_url, duration_days, difficulty) VALUES
  ('ee000000-0000-0000-0000-000000000001',
   'Bucharest in 2 Days', 'bucharest-in-2-days',
   'A comprehensive two-day itinerary through Romania''s capital, covering the best of its Belle Epoque grandeur, communist-era monuments, buzzing food scene, and nightlife.',
   'https://images.unsplash.com/photo-1584646098378-0874589d76b1?w=1200&q=80',
   2, 'easy'),

  ('ee000000-0000-0000-0000-000000000002',
   'Transylvania Gothic Trail', 'transylvania-gothic-trail',
   'A 3-day journey through Transylvania''s most dramatic Gothic and medieval sites, from Brașov''s Black Church to Bran Castle and the fortified churches beyond.',
   'https://images.unsplash.com/photo-1577452679916-45fb2ce08070?w=1200&q=80',
   3, 'moderate'),

  ('ee000000-0000-0000-0000-000000000003',
   'Sibiu Cultural Weekend', 'sibiu-cultural-weekend',
   'A perfect weekend exploring Sibiu''s world-class museums, charming medieval squares, and outstanding traditional cuisine. Slow travel at its finest.',
   'https://images.unsplash.com/photo-1592502712628-0aa23f4e1c2e?w=1200&q=80',
   2, 'easy'),

  ('ee000000-0000-0000-0000-000000000004',
   'Cluj-Napoca Food & Culture', 'cluj-napoca-food-and-culture',
   'A 2-day deep dive into Cluj''s vibrant food scene and cultural landmarks, from historic churches to Transylvanian feasts and the city''s legendary nightlife.',
   'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=1200&q=80',
   2, 'easy');

-- ============================================
-- ITINERARY STOPS
-- ============================================
-- Bucharest in 2 Days
INSERT INTO itinerary_stops (itinerary_id, poi_id, stop_order, notes, duration_minutes) VALUES
  ('ee000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000001', 1, 'Start with a guided tour of the massive Parliament building. Book tickets in advance.', 120),
  ('ee000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000006', 2, 'Walk to the Old Town and visit this beautiful tiny monastery.', 30),
  ('ee000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000003', 3, 'Lunch at Bucharest''s most iconic restaurant. Try the sarmale.', 90),
  ('ee000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000002', 4, 'Attend an evening concert or simply admire the stunning interior.', 90),
  ('ee000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000005', 5, 'Day 2: Start at the National Museum of Art in the Royal Palace.', 120),
  ('ee000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000004', 6, 'Afternoon stroll and paddle boat ride on the lake.', 120),
  ('ee000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000007', 7, 'End the trip with a night at Bucharest''s best club.', 180),

-- Transylvania Gothic Trail
  ('ee000000-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000011', 1, 'Begin in Brașov''s stunning medieval square.', 60),
  ('ee000000-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000009', 2, 'Visit the imposing Black Church and its Turkish rug collection.', 60),
  ('ee000000-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000010', 3, 'Take the cable car up for panoramic views.', 90),
  ('ee000000-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000012', 4, 'Hearty Transylvanian lunch to fuel the afternoon.', 75),
  ('ee000000-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000008', 5, 'Day 2: The highlight — explore Bran Castle.', 120),
  ('ee000000-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000013', 6, 'Day 3: Enjoy the mountain scenery at Poiana Brașov.', 180),

-- Sibiu Cultural Weekend
  ('ee000000-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000016', 1, 'Start in the Grand Square to soak in the atmosphere.', 45),
  ('ee000000-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000014', 2, 'Explore the Brukenthal''s impressive European art collection.', 120),
  ('ee000000-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000017', 3, 'Walk to the Bridge of Lies — dare you tell the truth?', 20),
  ('ee000000-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000018', 4, 'Lunch in a wine cellar with excellent Saxon cuisine.', 90),
  ('ee000000-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000015', 5, 'Day 2: Spend the morning at the incredible ASTRA open-air museum.', 180),

-- Cluj-Napoca Food & Culture
  ('ee000000-0000-0000-0000-000000000004', 'aa000000-0000-0000-0000-000000000019', 1, 'Begin at the iconic Gothic church on Union Square.', 45),
  ('ee000000-0000-0000-0000-000000000004', 'aa000000-0000-0000-0000-000000000021', 2, 'Walk through Central Park to the lake.', 60),
  ('ee000000-0000-0000-0000-000000000004', 'aa000000-0000-0000-0000-000000000022', 3, 'Feast on the best Transylvanian food in Cluj.', 90),
  ('ee000000-0000-0000-0000-000000000004', 'aa000000-0000-0000-0000-000000000020', 4, 'Day 2: Morning at the beautiful Botanical Garden.', 90),
  ('ee000000-0000-0000-0000-000000000004', 'aa000000-0000-0000-0000-000000000023', 5, 'End with drinks and live music at Flying Circus.', 120);
