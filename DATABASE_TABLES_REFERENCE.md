# 📊 AGROBUILD Database Tables Reference

## Complete Database Schema with Insert Examples

---

## 1. **USERS Table**

**Purpose**: Store user accounts and authentication data

**Table Definition**:
```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'intern', 'user')),
  password_hash TEXT,
  created_at TIMESTAMP DEFAULT now()
)
```

**Columns**:
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `name` | TEXT | User's full name |
| `email` | TEXT | Unique email address |
| `phone` | TEXT | Unique phone number |
| `role` | TEXT | User role (admin/intern/user) |
| `password_hash` | TEXT | Encrypted password |
| `created_at` | TIMESTAMP | Account creation timestamp |

**Example Insert**:
```sql
INSERT INTO public.users (name, email, phone, role)
VALUES ('John Doe', 'john@example.com', '9876543210', 'user');

INSERT INTO public.users (name, email, phone, role)
VALUES ('Admin User', 'admin@agrobuild.com', '9876543211', 'admin');
```

**Example Query**:
```sql
SELECT * FROM public.users WHERE role = 'admin';
SELECT * FROM public.users WHERE email = 'john@example.com';
```

---

## 2. **CATEGORIES Table**

**Purpose**: Store product categories and subcategories

**Table Definition**:
```sql
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent TEXT
)
```

**Columns**:
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `name` | TEXT | Category name |
| `parent` | TEXT | Parent category (for subcategories) |

**Pre-seeded Data**:
```
Main Categories:
- Crop Protection
- Equipments
- Animal Husbandry

Subcategories:
- Crop Protection → Insecticide
- Crop Protection → Fungicide
- Crop Protection → Herbicide
- Equipments → Sprayer
- Animal Husbandry → Cattle Feed
```

**Example Insert**:
```sql
INSERT INTO public.categories (name, parent)
VALUES ('Crop Protection', NULL);

INSERT INTO public.categories (name, parent)
VALUES ('Insecticide', 'Crop Protection');

INSERT INTO public.categories (name, parent)
VALUES ('Sprayer', 'Equipments');
```

---

## 3. **PRODUCTS Table**

**Purpose**: Store product information and details

**Table Definition**:
```sql
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  price NUMERIC,
  mrp NUMERIC,
  discount NUMERIC,
  sku TEXT,
  description TEXT,
  brand TEXT,
  pack_size TEXT,
  gst_percentage NUMERIC,
  stock_quantity INTEGER DEFAULT 0,
  unit TEXT,
  unit_quantity NUMERIC,
  images TEXT[],
  availability BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  category_name TEXT,
  subcategory_name TEXT,
  features TEXT,
  technical_content TEXT,
  usage TEXT,
  dosage TEXT,
  crop_usage TEXT,
  target_pest TEXT,
  internal_order_url TEXT,
  video_url TEXT,
  manufacture_date DATE,
  expiry_date DATE,
  meta_title TEXT,
  meta_description TEXT
)
```

**Main Columns**:
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `product_id` | TEXT | Unique product identifier |
| `title` | TEXT | Product name |
| `price` | NUMERIC | Selling price (₹) |
| `mrp` | NUMERIC | Maximum Retail Price (₹) |
| `sku` | TEXT | Stock Keeping Unit |
| `description` | TEXT | Product description |
| `brand` | TEXT | Brand name |
| `stock_quantity` | INTEGER | Available quantity |
| `images` | TEXT[] | Array of image URLs |
| `category_name` | TEXT | Category name (text reference) |
| `subcategory_name` | TEXT | Subcategory name |
| `gst_percentage` | NUMERIC | GST percentage |
| `created_at` | TIMESTAMP | Creation date |

**Example Insert**:
```sql
INSERT INTO public.products (
  product_id, title, price, mrp, sku, brand, 
  category_name, subcategory_name, stock_quantity, 
  gst_percentage, availability
)
VALUES (
  'PROD-001', 'Premium Olive Oil', 500, 750, 'OIL-001', 'Spanish Harvest',
  'Crop Protection', 'Insecticide', 100, 5, true
);

INSERT INTO public.products (
  product_id, title, price, mrp, brand, 
  category_name, stock_quantity, images
)
VALUES (
  'PROD-002', 'Mustard Oil', 200, 300, 'Pure Gold',
  'Animal Husbandry', 50,
  ARRAY['https://storage.com/image1.jpg', 'https://storage.com/image2.jpg']
);
```

---

## 4. **PRODUCT_VARIANTS Table**

**Purpose**: Store different variants of products

**Table Definition**:
```sql
CREATE TABLE public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  sku TEXT,
  size TEXT,
  color TEXT,
  stock NUMERIC,
  price NUMERIC,
  created_at TIMESTAMP DEFAULT now()
)
```

**Columns**:
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `product_id` | UUID | Reference to product |
| `sku` | TEXT | Variant SKU |
| `size` | TEXT | Variant size/quantity |
| `color` | TEXT | Variant color |
| `stock` | NUMERIC | Stock for this variant |
| `price` | NUMERIC | Price for this variant |

**Example Insert**:
```sql
INSERT INTO public.product_variants (product_id, size, stock, price, sku)
VALUES ('uuid-of-product', '500ml', 50, 300, 'OIL-500ML');

INSERT INTO public.product_variants (product_id, size, stock, price, sku)
VALUES ('uuid-of-product', '1 Litre', 30, 500, 'OIL-1L');
```

---

## 5. **PRODUCT_IMAGES Table**

**Purpose**: Store product images (for backward compatibility)

**Table Definition**:
```sql
CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  image_url TEXT,
  sort_order INTEGER,
  created_at TIMESTAMP DEFAULT now()
)
```

**Columns**:
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `product_id` | UUID | Reference to product |
| `image_url` | TEXT | Image URL from storage |
| `sort_order` | INTEGER | Display order |

**Note**: Currently using `images TEXT[]` in products table. This table is for reference.

---

## 6. **CARTS Table**

**Purpose**: Store shopping carts for users

**Table Definition**:
```sql
CREATE TABLE public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  total_quantity INTEGER DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
)
```

**Columns**:
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | User reference |
| `total_quantity` | INTEGER | Total items in cart |
| `total_amount` | NUMERIC | Cart total amount (₹) |
| `created_at` | TIMESTAMP | Cart creation time |
| `updated_at` | TIMESTAMP | Last update time |

**Example Insert**:
```sql
INSERT INTO public.carts (user_id, total_quantity, total_amount)
VALUES ('user-uuid', 3, 1500);
```

---

## 7. **CART_ITEMS Table**

**Purpose**: Store individual items in shopping carts

**Table Definition**:
```sql
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID REFERENCES carts(id),
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC,
  boxes INTEGER DEFAULT 0,
  total_price NUMERIC,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
)
```

**Columns**:
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `cart_id` | UUID | Reference to cart |
| `product_id` | UUID | Reference to product |
| `variant_id` | UUID | Reference to variant |
| `quantity` | INTEGER | Item quantity |
| `unit_price` | NUMERIC | Price per unit |
| `boxes` | INTEGER | Number of boxes |
| `total_price` | NUMERIC | Line total (₹) |

**Example Insert**:
```sql
INSERT INTO public.cart_items (
  cart_id, product_id, variant_id, quantity, 
  unit_price, total_price
)
VALUES (
  'cart-uuid', 'product-uuid', 'variant-uuid', 
  2, 300, 600
);
```

---

## 8. **ORDERS Table**

**Purpose**: Store customer orders

**Table Definition**:
```sql
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  total_amount NUMERIC,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
)
```

**Columns**:
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Customer reference |
| `total_amount` | NUMERIC | Order total (₹) |
| `status` | TEXT | Order status (pending/paid/completed) |
| `created_at` | TIMESTAMP | Order creation time |
| `updated_at` | TIMESTAMP | Last update time |

**Example Insert**:
```sql
INSERT INTO public.orders (user_id, total_amount, status)
VALUES ('user-uuid', 2500, 'pending');
```

---

## 9. **ORDER_ITEMS Table**

**Purpose**: Store individual items in orders

**Table Definition**:
```sql
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  quantity INTEGER,
  unit_price NUMERIC,
  boxes INTEGER DEFAULT 0,
  total_price NUMERIC,
  created_at TIMESTAMP DEFAULT now()
)
```

**Columns**:
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `order_id` | UUID | Reference to order |
| `product_id` | UUID | Reference to product |
| `variant_id` | UUID | Reference to variant |
| `quantity` | INTEGER | Quantity ordered |
| `unit_price` | NUMERIC | Price per unit at time of order |
| `boxes` | INTEGER | Number of boxes |
| `total_price` | NUMERIC | Line total |

**Example Insert**:
```sql
INSERT INTO public.order_items (
  order_id, product_id, variant_id, quantity, unit_price, total_price
)
VALUES ('order-uuid', 'product-uuid', 'variant-uuid', 6, 300, 1800);
```

---

## 10. **PAYMENTS Table**

**Purpose**: Store payment information for orders

**Table Definition**:
```sql
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  amount NUMERIC,
  status TEXT DEFAULT 'pending',
  method TEXT,
  transaction_id TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
)
```

**Columns**:
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `order_id` | UUID | Reference to order |
| `amount` | NUMERIC | Payment amount (₹) |
| `status` | TEXT | Payment status (pending/paid/failed) |
| `method` | TEXT | Payment method (upi/card/transfer) |
| `transaction_id` | TEXT | External transaction ID |

**Example Insert**:
```sql
INSERT INTO public.payments (order_id, amount, status, method)
VALUES ('order-uuid', 2500, 'pending', 'upi');
```

---

## 11. **VENDORS Table**

**Purpose**: Store supplier/vendor information

**Table Definition**:
```sql
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  state TEXT,
  city TEXT,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
)
```

**Columns**:
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | Vendor name |
| `state` | TEXT | Operating state |
| `city` | TEXT | Operating city |
| `phone` | TEXT | Contact phone |
| `email` | TEXT | Contact email |
| `address` | TEXT | Full address |

**Example Insert**:
```sql
INSERT INTO public.vendors (name, state, city, phone, email)
VALUES ('Vendor A', 'UP', 'Lucknow', '9876543210', 'vendor@example.com');
```

---

## 12. **VENDOR_PRICES Table**

**Purpose**: Store product prices from different vendors

**Table Definition**:
```sql
CREATE TABLE public.vendor_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id),
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  price NUMERIC,
  mrp NUMERIC,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
)
```

**Columns**:
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `vendor_id` | UUID | Reference to vendor |
| `product_id` | UUID | Reference to product |
| `variant_id` | UUID | Reference to variant |
| `price` | NUMERIC | Vendor's selling price |
| `mrp` | NUMERIC | Vendor's MRP |

**Example Insert**:
```sql
INSERT INTO public.vendor_prices (vendor_id, product_id, price, mrp)
VALUES ('vendor-uuid', 'product-uuid', 450, 700);
```

---

## 13. **PURCHASE_ORDERS Table**

**Purpose**: Store purchase orders from vendors

**Table Definition**:
```sql
CREATE TABLE public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id),
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  quantity NUMERIC,
  base_total NUMERIC,
  uplift_percent NUMERIC DEFAULT 5,
  final_total NUMERIC,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
)
```

**Columns**:
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `vendor_id` | UUID | Reference to vendor |
| `product_id` | UUID | Reference to product |
| `variant_id` | UUID | Reference to variant |
| `quantity` | NUMERIC | Order quantity |
| `base_total` | NUMERIC | Base cost (₹) |
| `uplift_percent` | NUMERIC | Profit margin % |
| `final_total` | NUMERIC | Final cost (₹) |
| `status` | TEXT | PO status (pending/ordered/received) |

**Example Insert**:
```sql
INSERT INTO public.purchase_orders (
  vendor_id, product_id, quantity, base_total, uplift_percent, final_total
)
VALUES ('vendor-uuid', 'product-uuid', 100, 10000, 10, 11000);
```

---

## 14. **BANNERS Table**

**Purpose**: Store promotional banners

**Table Definition**:
```sql
CREATE TABLE public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  active BOOLEAN DEFAULT true,
  sort_order INTEGER,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
)
```

**Columns**:
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `title` | TEXT | Banner title |
| `description` | TEXT | Banner description |
| `image_url` | TEXT | Banner image URL |
| `link_url` | TEXT | Link when clicked |
| `active` | BOOLEAN | Show/hide banner |
| `sort_order` | INTEGER | Display order |

**Example Insert**:
```sql
INSERT INTO public.banners (title, description, image_url, active, sort_order)
VALUES ('Summer Sale', 'Get 50% off on oils', 'https://...', true, 1);
```

---

## Database Relationships Diagram

```
users
  ↓
orders ──→ order_items ──→ products ──→ product_variants
  ↓                           ↓
payments                  product_images
                              ↓
                         categories

carts ──→ cart_items ──→ product_variants

vendors ──→ vendor_prices ──→ products
  ↓
purchase_orders ──→ products

banners (standalone)
```

---

## Quick Insert Commands

### Create a Complete Product Flow:

```sql
-- 1. Create product
INSERT INTO public.products (
  product_id, title, price, mrp, brand, 
  category_name, stock_quantity, description
)
VALUES (
  'PROD-001', 'Cooking Oil', 400, 600, 'Premium Gold',
  'Oils', 100, 'Best quality cooking oil'
) RETURNING id;

-- 2. Add variants
INSERT INTO public.product_variants (
  product_id, size, stock, price
)
VALUES (
  'returned-uuid', '500ml', 50, 300
);

-- 3. Customer orders product
INSERT INTO public.orders (user_id, total_amount, status)
VALUES ('user-uuid', 1800, 'pending') RETURNING id;

-- 4. Add order items
INSERT INTO public.order_items (
  order_id, product_id, variant_id, quantity, unit_price, total_price
)
VALUES (
  'order-uuid', 'product-uuid', 'variant-uuid', 
  6, 300, 1800
);

-- 5. Process payment
INSERT INTO public.payments (order_id, amount, status, method)
VALUES ('order-uuid', 1800, 'pending', 'upi');
```

---

## Useful Queries

### Get Products with Stock:
```sql
SELECT title, price, stock_quantity FROM public.products 
WHERE availability = true AND stock_quantity > 0;
```

### Get User Orders:
```sql
SELECT o.id, o.total_amount, o.status, o.created_at 
FROM public.orders o 
WHERE o.user_id = 'user-uuid'
ORDER BY o.created_at DESC;
```

### Get Cart Total:
```sql
SELECT SUM(total_price) as cart_total 
FROM public.cart_items 
WHERE cart_id = 'cart-uuid';
```

### Get Vendor Prices:
```sql
SELECT p.title, vp.price, vp.mrp, v.name as vendor 
FROM public.vendor_prices vp
JOIN public.products p ON vp.product_id = p.id
JOIN public.vendors v ON vp.vendor_id = v.id;
```

### Get Pending Orders:
```sql
SELECT o.id, u.name, o.total_amount 
FROM public.orders o
JOIN public.users u ON o.user_id = u.id
WHERE o.status = 'pending'
ORDER BY o.created_at DESC;
```

---

## Summary

**Total Tables**: 14
- Core: Users, Categories, Products
- Product Management: Product Variants, Product Images
- Shopping: Carts, Cart Items
- Orders: Orders, Order Items, Payments
- Vendor Management: Vendors, Vendor Prices, Purchase Orders
- Content: Banners

**Total Relationships**: 12+ foreign keys connecting tables

**SKU System**: Ready to integrate with new `product_skus` table (see SKU_API_SPECS.md)
