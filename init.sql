-- ============================================
-- WorldOfLamps — Database Initialization
-- ============================================

-- ----------------------------
-- Users (admin accounts)
-- ----------------------------
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(64) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ----------------------------
-- Categories
-- ----------------------------
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ----------------------------
-- Products
-- ----------------------------
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK(price > 0),
    image_url VARCHAR(500),
    stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

-- ----------------------------
-- Orders
-- ----------------------------
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(20) NOT NULL UNIQUE,
    customer_name VARCHAR(200) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_address TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'new',
    total DECIMAL(10,2) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);

-- ----------------------------
-- Order Items
-- ----------------------------
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity > 0)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ============================================
-- Seed Data
-- ============================================

-- Admin user (login: admin / password: admin123)
INSERT INTO users (username, password_hash, role) VALUES
    ('admin', '$2b$12$XlQBv.JanhzieUBc8SyMteXW65yt9Q/EOfimA/ZChca2ozpxrYUfe', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Categories
INSERT INTO categories (name, slug) VALUES
    ('Светодиодные (LED)', 'led'),
    ('Лампы накаливания', 'incandescent'),
    ('Галогенные', 'halogen'),
    ('Люминесцентные', 'fluorescent')
ON CONFLICT (slug) DO NOTHING;

-- Products: LED (category_id = 1)
INSERT INTO products (category_id, name, slug, description, price, stock) VALUES
    (1, 'LED A60 10W E27 4000K', 'led-a60-10w-e27-4000k', 'Светодиодная лампа нейтрального света. Цоколь E27, мощность 10W, цветовая температура 4000K. Срок службы 25 000 часов.', 89.00, 150),
    (1, 'LED A60 15W E27 6500K', 'led-a60-15w-e27-6500k', 'Светодиодная лампа холодного света. Цоколь E27, мощность 15W, цветовая температура 6500K.', 119.00, 80),
    (1, 'LED C37 5W E14 3000K', 'led-c37-5w-e14-3000k', 'Светодиодная лампа-свеча тёплого света. Цоколь E14, мощность 5W.', 69.00, 200),
    (1, 'LED GU10 7W 4000K', 'led-gu10-7w-4000k', 'Светодиодная лампа для точечных светильников. Цоколь GU10, мощность 7W.', 99.00, 120),
    (1, 'LED G45 5W E27 3000K', 'led-g45-5w-e27-3000k', 'Светодиодная лампа-шар тёплого света. Цоколь E27, мощность 5W.', 59.00, 180)
ON CONFLICT (slug) DO NOTHING;

-- Products: Incandescent (category_id = 2)
INSERT INTO products (category_id, name, slug, description, price, stock) VALUES
    (2, 'Лампа накаливания 60W E27', 'incandescent-60w-e27', 'Классическая лампа накаливания. Цоколь E27, мощность 60W. Тёплый свет.', 25.00, 300),
    (2, 'Лампа накаливания 75W E27', 'incandescent-75w-e27', 'Классическая лампа накаливания. Цоколь E27, мощность 75W.', 30.00, 250),
    (2, 'Лампа накаливания 100W E27', 'incandescent-100w-e27', 'Классическая лампа накаливания повышенной мощности. Цоколь E27, мощность 100W.', 35.00, 200),
    (2, 'Лампа накаливания 40W E14', 'incandescent-40w-e14', 'Лампа накаливания для декоративных светильников. Цоколь E14, мощность 40W.', 22.00, 150),
    (2, 'Лампа накаливания 60W E14 свеча', 'incandescent-60w-e14-candle', 'Лампа-свеча накаливания. Цоколь E14, мощность 60W.', 28.00, 180)
ON CONFLICT (slug) DO NOTHING;

-- Products: Halogen (category_id = 3)
INSERT INTO products (category_id, name, slug, description, price, stock) VALUES
    (3, 'Галогенная GU10 50W', 'halogen-gu10-50w', 'Галогенная лампа для точечных светильников. Цоколь GU10, мощность 50W.', 79.00, 100),
    (3, 'Галогенная G9 40W', 'halogen-g9-40w', 'Компактная галогенная капсульная лампа. Цоколь G9, мощность 40W.', 65.00, 90),
    (3, 'Галогенная G4 20W 12V', 'halogen-g4-20w-12v', 'Миниатюрная галогенная лампа. Цоколь G4, мощность 20W, напряжение 12V.', 45.00, 200),
    (3, 'Галогенная E27 70W', 'halogen-e27-70w', 'Галогенная лампа с классическим цоколем. E27, мощность 70W.', 85.00, 60),
    (3, 'Галогенная R7s 150W', 'halogen-r7s-150w', 'Линейная галогенная лампа для прожекторов. Цоколь R7s, мощность 150W.', 120.00, 40)
ON CONFLICT (slug) DO NOTHING;

-- Products: Fluorescent (category_id = 4)
INSERT INTO products (category_id, name, slug, description, price, stock) VALUES
    (4, 'Люминесцентная T8 18W 600мм', 'fluorescent-t8-18w-600', 'Трубчатая люминесцентная лампа. Тип T8, мощность 18W, длина 600мм.', 45.00, 120),
    (4, 'Люминесцентная T8 36W 1200мм', 'fluorescent-t8-36w-1200', 'Трубчатая люминесцентная лампа. Тип T8, мощность 36W, длина 1200мм.', 65.00, 80),
    (4, 'КЛЛ спираль 15W E27', 'cfl-spiral-15w-e27', 'Компактная люминесцентная лампа спиральная. Цоколь E27, мощность 15W.', 55.00, 150),
    (4, 'КЛЛ спираль 23W E27', 'cfl-spiral-23w-e27', 'Компактная люминесцентная лампа спиральная. Цоколь E27, мощность 23W.', 70.00, 100),
    (4, 'КЛЛ U-образная 11W E14', 'cfl-u-11w-e14', 'Компактная люминесцентная лампа U-образная. Цоколь E14, мощность 11W.', 50.00, 90)
ON CONFLICT (slug) DO NOTHING;
