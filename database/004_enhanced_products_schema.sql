-- =====================================================
-- ENHANCED PRODUCTS SCHEMA WITH BIGHAAT-STYLE FEATURES
-- Migration: 004
-- Description: Add comprehensive product fields for BigHaat-style UI
-- =====================================================

-- Add new columns to products table
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS classification VARCHAR(50),
  ADD COLUMN IF NOT EXISTS toxicity VARCHAR(20),
  ADD COLUMN IF NOT EXISTS city VARCHAR(100),
  ADD COLUMN IF NOT EXISTS country_of_origin VARCHAR(100) DEFAULT 'India',
  ADD COLUMN IF NOT EXISTS cod_available BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS ready_to_ship BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS trust_markers JSONB,
  ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_products_city ON public.products(city);
CREATE INDEX IF NOT EXISTS idx_products_classification ON public.products(classification);
CREATE INDEX IF NOT EXISTS idx_products_toxicity ON public.products(toxicity);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);

-- =====================================================
-- TABLE: product_images (New table for multiple images)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  alt_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_primary ON public.product_images(product_id, is_primary);

-- =====================================================
-- UPDATE: product_skus table (Add new fields)
-- =====================================================
ALTER TABLE public.product_skus
  ADD COLUMN IF NOT EXISTS variant_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS sku VARCHAR(100) UNIQUE,
  ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tags JSONB;

CREATE INDEX IF NOT EXISTS idx_product_skus_sku ON public.product_skus(sku);
CREATE INDEX IF NOT EXISTS idx_product_skus_variant_name ON public.product_skus(variant_name);

-- =====================================================
-- TABLE: product_descriptions (Extended description fields)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.product_descriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE UNIQUE,
  about TEXT,
  mode_of_entry VARCHAR(255),
  mode_of_action TEXT,
  chemical_group VARCHAR(255),
  target_pests TEXT,
  recommended_crops TEXT,
  dosage_per_acre VARCHAR(255),
  how_to_apply TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_product_descriptions_product_id ON public.product_descriptions(product_id);

-- =====================================================
-- TABLE: alternative_products (Similar product suggestions)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.alternative_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  alternative_product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, alternative_product_id)
);

CREATE INDEX IF NOT EXISTS idx_alternative_products_product_id ON public.alternative_products(product_id);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- product_images policies
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product images"
  ON public.product_images FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage product images"
  ON public.product_images FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );

-- product_descriptions policies
ALTER TABLE public.product_descriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product descriptions"
  ON public.product_descriptions FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage product descriptions"
  ON public.product_descriptions FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );

-- alternative_products policies
ALTER TABLE public.alternative_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view alternative products"
  ON public.alternative_products FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage alternative products"
  ON public.alternative_products FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_product_images_updated_at ON public.product_images;
CREATE TRIGGER update_product_images_updated_at
  BEFORE UPDATE ON public.product_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_descriptions_updated_at ON public.product_descriptions;
CREATE TRIGGER update_product_descriptions_updated_at
  BEFORE UPDATE ON public.product_descriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- EXAMPLE DATA INSERTS
-- =====================================================

-- Example: Create a complete product with BigHaat structure
/*
-- 1. Insert main product
INSERT INTO public.products (
  id, product_id, title, brand, category_name, 
  classification, technical_content, toxicity, city,
  price, mrp, availability, description,
  country_of_origin, cod_available, ready_to_ship,
  trust_markers, slug, meta_title, meta_description
) VALUES (
  gen_random_uuid(),
  'CORA-INS-001',
  'Coragen Insecticide – Chlorantraniliprole 18.5% SC by FMC',
  'FMC',
  'Insecticides',
  'Chemical',
  'Chlorantraniliprole 18.50% SC',
  'green',
  'Hyderabad',
  129.00,
  220.00,
  true,
  'Premium insecticide for crop protection',
  'India',
  true,
  true,
  '{"original": true, "bestPrices": true, "cod": true, "securePayments": true, "inStock": true}'::jsonb,
  'coragen-insecticide-chlorantraniliprole-fmc',
  'Coragen Insecticide 18.5% SC - Buy Online at Best Price',
  'Buy Coragen Insecticide by FMC with Chlorantraniliprole 18.5% SC. Effective against bollworms. Best price, COD available.'
) RETURNING id;

-- 2. Insert product images (use the returned id from above)
INSERT INTO public.product_images (product_id, image_url, is_primary, sort_order, alt_text)
VALUES 
  ('PRODUCT-UUID-HERE', 'https://example.com/coragen-1.jpg', true, 0, 'Coragen Insecticide product image 1'),
  ('PRODUCT-UUID-HERE', 'https://example.com/coragen-2.jpg', false, 1, 'Coragen Insecticide product image 2');

-- 3. Insert SKU variants
INSERT INTO public.product_skus (
  product_id, variant_name, unit_type, quantity, 
  pieces_per_box, unit_price, unit_mrp, box_price, box_mrp,
  sku, stock, tags
) VALUES 
  ('PRODUCT-UUID-HERE', '10 ml', 'ml', '10ml', 6, 129.00, 220.00, 774.00, 1320.00, 'FMC-CORA-10ML', 400, '{"bestSeller": true}'::jsonb),
  ('PRODUCT-UUID-HERE', '150 ml', 'ml', '150ml', 6, 1124.00, 2792.00, 6744.00, 16752.00, 'FMC-CORA-150ML', 200, '{"valuePack": true}'::jsonb);

-- 4. Insert product description
INSERT INTO public.product_descriptions (
  product_id, about, mode_of_entry, mode_of_action,
  chemical_group, target_pests, recommended_crops,
  dosage_per_acre, how_to_apply
) VALUES (
  'PRODUCT-UUID-HERE',
  'Coragen is a broad-spectrum insecticide effective against lepidopteran pests',
  'Systemic and Contact',
  'Inhibits muscle contraction in insects',
  'Anthranilic Diamide',
  'Bollworm, Fruit borer, Leaf folder',
  'Cotton, Tomato, Chilli, Rice',
  '60 ml per acre',
  'Foliar spray - Mix with water and spray evenly'
);
*/

-- =====================================================
-- USEFUL QUERIES
-- =====================================================

-- Get complete product with all related data
/*
SELECT 
  p.*,
  json_agg(DISTINCT pi.*) FILTER (WHERE pi.id IS NOT NULL) as images,
  json_agg(DISTINCT ps.*) FILTER (WHERE ps.id IS NOT NULL) as variants,
  pd.* as description
FROM public.products p
LEFT JOIN public.product_images pi ON p.id = pi.product_id
LEFT JOIN public.product_skus ps ON p.id = ps.product_id
LEFT JOIN public.product_descriptions pd ON p.id = pd.product_id
WHERE p.city = 'Hyderabad' AND p.availability = true
GROUP BY p.id, pd.id;
*/

-- Get products by city classification
/*
SELECT * FROM public.products
WHERE city = 'Hyderabad' AND status = 'published'
ORDER BY created_at DESC;
*/

-- Get all variants with tags
/*
SELECT 
  p.title,
  ps.variant_name,
  ps.unit_price,
  ps.stock,
  ps.tags->>'bestSeller' as is_best_seller,
  ps.tags->>'valuePack' as is_value_pack
FROM public.product_skus ps
JOIN public.products p ON ps.product_id = p.id
WHERE ps.tags IS NOT NULL;
*/
