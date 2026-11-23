CREATE TABLE products (
  id CHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  category VARCHAR(60) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  old_price DECIMAL(10,2),
  rating DECIMAL(2,1),
  image VARCHAR(500) NOT NULL,
  tag VARCHAR(40),
  description VARCHAR(1000) NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
);
INSERT INTO products (id, name, category, price, old_price, rating, image, tag, description) VALUES
('d26cb269-0936-45a4-ae5d-5bade1802501','Cloud Cleanser','Cleansers',28.00,36.00,4.9,'photo-1556228720-195a672e8a03','BESTSELLER','A soft, milky daily cleanser that leaves skin calm, comfortable, and never stripped.'),
('d26cb269-0936-45a4-ae5d-5bade1802502','Dew Drops Serum','Serums',42.00,54.00,4.8,'photo-1608248543803-ba4f8c70ae0b','NEW','A daily dose of hydration with hyaluronic acid and a dewy, weightless finish.'),
('d26cb269-0936-45a4-ae5d-5bade1802503','Daily Veil SPF 30','Moisturizers',36.00,45.00,4.9,'photo-1601049541289-9b1b7bbbfe19','EVERYDAY','A sheer, breathable mineral sunscreen made to layer beautifully under everything.'),
('d26cb269-0936-45a4-ae5d-5bade1802504','Night Shift Cream','Moisturizers',48.00,60.00,4.7,'photo-1608248543803-ba4f8c70ae0b','NIGHT RITUAL','A rich butters-and-peptides night cream for skin that wakes up feeling restored.'),
('d26cb269-0936-45a4-ae5d-5bade1802505','Soft Reset Balm','Cleansers',32.00,40.00,4.8,'photo-1600428853876-fb5a850b444f','CLEAN BEAUTY','A balm-to-milk makeup remover powered by oat and nourishing botanical oils.'),
('d26cb269-0936-45a4-ae5d-5bade1802506','Petal Polish','Treatments',34.00,42.00,4.6,'photo-1570172619644-dfd03ed5d881','GENTLE EXFOLIATION','A gentle weekly resurfacing treatment for a smooth, fresh-looking glow.'),
('d26cb269-0936-45a4-ae5d-5bade1802507','Barrier Butter','Moisturizers',44.00,55.00,4.9,'photo-1556229010-6c3f2c9ca5f8','SKIN FAVORITE','A cushiony ceramide cream that helps support your skin barrier all day long.'),
('d26cb269-0936-45a4-ae5d-5bade1802508','Calm Water Mist','Treatments',24.00,30.00,4.7,'photo-1601049541289-9b1b7bbbfe19','ON-THE-GO','A fine, refreshing facial mist with aloe and rosewater for an anytime reset.');
