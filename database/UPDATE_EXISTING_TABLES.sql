-- =====================================================
-- UPDATE EXISTING TABLES FOR NEW PRODUCT CREATION SYSTEM
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. UPDATE PRODUCTS TABLE (Add new columns)
-- =====================================================

-- Add new columns to existing products table
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS classification VARCHAR(50),
  ADD COLUMN IF NOT EXISTS toxicity VARCHAR(20),
  ADD COLUMN IF NOT EXISTS city VARCHAR(100),
  ADD COLUMN IF NOT EXISTS country_of_origin VARCHAR(100) DEFAULT 'India',
  ADD COLUMN IF NOT EXISTS cod_available BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS ready_to_ship BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS trust_markers JSONB DEFAULT '{"original": true, "bestPrices": true, "cod": true, "securePayments": true, "inStock": true}'::jsonb,
  ADD COLUMN IF NOT EXISTS slug VARCHAR(255),
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS publish_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT true;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_city ON public.products(city);
CREATE INDEX IF NOT EXISTS idx_products_classification ON public.products(classification);
CREATE INDEX IF NOT EXISTS idx_products_toxicity ON public.products(toxicity);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_publish_date ON public.products(publish_date);
CREATE INDEX IF NOT EXISTS idx_products_visible ON public.products(visible);

-- Make slug unique but allow NULL (ignore if already exists)
-- Note: NULL slugs are allowed, only non-NULL slugs must be unique
DO $$ 
BEGIN
  -- Drop existing constraint if it exists
  ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_slug_unique;
  
  -- Create unique index that allows NULL values
  CREATE UNIQUE INDEX IF NOT EXISTS products_slug_unique_idx ON public.products(slug) WHERE slug IS NOT NULL;
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- =====================================================
-- 2. UPDATE PRODUCT_SKUS TABLE (Add new columns)
-- =====================================================

-- Add new columns to existing product_skus table
ALTER TABLE public.product_skus
  ADD COLUMN IF NOT EXISTS variant_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS sku VARCHAR(100),
  ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '{}'::jsonb;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_product_skus_sku ON public.product_skus(sku);
CREATE INDEX IF NOT EXISTS idx_product_skus_variant_name ON public.product_skus(variant_name);
CREATE INDEX IF NOT EXISTS idx_product_skus_tags ON public.product_skus USING GIN(tags);

-- Make SKU unique (ignore if already exists)
DO $$ 
BEGIN
  ALTER TABLE public.product_skus ADD CONSTRAINT product_skus_sku_unique UNIQUE (sku);
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- RLS for product_skus (Add policies if not exist)
ALTER TABLE public.product_skus ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view product skus" ON public.product_skus;
CREATE POLICY "Anyone can view product skus"
  ON public.product_skus FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin can manage product skus" ON public.product_skus;
CREATE POLICY "Admin can manage product skus"
  ON public.product_skus FOR ALL
  USING (true)
  WITH CHECK (true);

-- Remove the restrictive check constraint on pieces_per_box (allow any positive integer)
ALTER TABLE public.product_skus DROP CONSTRAINT IF EXISTS product_skus_pieces_per_box_check;

-- Remove the restrictive check constraint on unit_type (allow any unit)
ALTER TABLE public.product_skus DROP CONSTRAINT IF EXISTS product_skus_unit_type_check;

-- =====================================================
-- 3. UPDATE EXISTING product_images TABLE (if exists) OR CREATE NEW
-- =====================================================

-- Check if product_images already exists with different schema
-- If it exists, we'll add missing columns. If not, create it.

DO $$ 
BEGIN
  -- Check if table exists
  IF EXISTS (SELECT FROM information_schema.tables 
             WHERE table_schema = 'public' 
             AND table_name = 'product_images') THEN
    
    -- Add missing columns to existing table
    ALTER TABLE public.product_images 
      ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS alt_text TEXT;
    
    -- Rename 'url' to 'image_url' if needed
    IF EXISTS (SELECT FROM information_schema.columns 
               WHERE table_name = 'product_images' 
               AND column_name = 'url') THEN
      ALTER TABLE public.product_images RENAME COLUMN url TO image_url;
    END IF;
    
  ELSE
    -- Create new table
    CREATE TABLE public.product_images (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      is_primary BOOLEAN DEFAULT false,
      sort_order INTEGER DEFAULT 0,
      alt_text TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  END IF;
END $$;

-- Indexes for product_images
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_primary ON public.product_images(product_id, is_primary);
CREATE INDEX IF NOT EXISTS idx_product_images_sort ON public.product_images(product_id, sort_order);

-- RLS for product_images
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view product images" ON public.product_images;
CREATE POLICY "Anyone can view product images"
  ON public.product_images FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin can manage product images" ON public.product_images;
CREATE POLICY "Admin can manage product images"
  ON public.product_images FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 4. CREATE NEW TABLE: product_descriptions
-- =====================================================

CREATE TABLE IF NOT EXISTS public.product_descriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
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

-- Make product_id unique (one description per product)
DO $$ 
BEGIN
  ALTER TABLE public.product_descriptions ADD CONSTRAINT product_descriptions_product_id_unique UNIQUE (product_id);
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Index
CREATE INDEX IF NOT EXISTS idx_product_descriptions_product_id ON public.product_descriptions(product_id);

-- RLS for product_descriptions
ALTER TABLE public.product_descriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view product descriptions" ON public.product_descriptions;
CREATE POLICY "Anyone can view product descriptions"
  ON public.product_descriptions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin can manage product descriptions" ON public.product_descriptions;
CREATE POLICY "Admin can manage product descriptions"
  ON public.product_descriptions FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 5. CREATE NEW TABLE: alternative_products
-- =====================================================

CREATE TABLE IF NOT EXISTS public.alternative_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  alternative_product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Unique constraint for product pair
DO $$ 
BEGIN
  ALTER TABLE public.alternative_products 
    ADD CONSTRAINT alternative_products_pair_unique 
    UNIQUE (product_id, alternative_product_id);
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Index
CREATE INDEX IF NOT EXISTS idx_alternative_products_product_id ON public.alternative_products(product_id);

-- RLS for alternative_products
ALTER TABLE public.alternative_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view alternative products" ON public.alternative_products;
CREATE POLICY "Anyone can view alternative products"
  ON public.alternative_products FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin can manage alternative products" ON public.alternative_products;
CREATE POLICY "Admin can manage alternative products"
  ON public.alternative_products FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 6. TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- =====================================================

-- Create function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for product_images
DROP TRIGGER IF EXISTS update_product_images_updated_at ON public.product_images;
CREATE TRIGGER update_product_images_updated_at
  BEFORE UPDATE ON public.product_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for product_descriptions
DROP TRIGGER IF EXISTS update_product_descriptions_updated_at ON public.product_descriptions;
CREATE TRIGGER update_product_descriptions_updated_at
  BEFORE UPDATE ON public.product_descriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for product_skus (if not already exists)
DROP TRIGGER IF EXISTS update_product_skus_updated_at ON public.product_skus;
CREATE TRIGGER update_product_skus_updated_at
  BEFORE UPDATE ON public.product_skus
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. VERIFY CHANGES (Optional - Run separately to check)
-- =====================================================

/*
-- Uncomment and run AFTER the migration above completes successfully

-- Check products table columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'products'
  AND column_name IN ('classification', 'toxicity', 'city', 'country_of_origin', 'cod_available', 'ready_to_ship', 'trust_markers', 'slug', 'status')
ORDER BY ordinal_position;

-- Check product_skus table columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'product_skus'
  AND column_name IN ('variant_name', 'sku', 'stock', 'tags')
ORDER BY ordinal_position;

-- Check new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('product_images', 'product_descriptions', 'alternative_products');
*/

-- =====================================================
-- 8. SAMPLE DATA MIGRATION (Optional - if you have existing data)
-- =====================================================

-- Migrate existing images from products.images array to product_images table
-- Uncomment and run if you have existing products with images
/*
INSERT INTO public.product_images (product_id, image_url, is_primary, sort_order, alt_text)
SELECT 
  p.id as product_id,
  unnest(p.images) as image_url,
  row_number() OVER (PARTITION BY p.id ORDER BY ordinality) = 1 as is_primary,
  row_number() OVER (PARTITION BY p.id ORDER BY ordinality) - 1 as sort_order,
  p.title || ' product image ' || row_number() OVER (PARTITION BY p.id ORDER BY ordinality) as alt_text
FROM public.products p
CROSS JOIN LATERAL unnest(p.images) WITH ORDINALITY
WHERE p.images IS NOT NULL AND array_length(p.images, 1) > 0;
*/

-- Update product_skus with variant names from quantity
-- Uncomment and run if you have existing SKUs
/*
UPDATE public.product_skus
SET variant_name = quantity
WHERE variant_name IS NULL AND quantity IS NOT NULL;
*/

-- Generate slugs for existing products
-- Uncomment and run if you have existing products without slugs
/*
UPDATE public.products
SET slug = lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL;
*/

-- =====================================================
-- DONE! Your database is now updated
-- =====================================================

-- Verification query (Optional - run separately)
/*
SELECT 
  'products' as table_name, 
  COUNT(*) as row_count,
  COUNT(CASE WHEN city IS NOT NULL THEN 1 END) as has_city,
  COUNT(CASE WHEN classification IS NOT NULL THEN 1 END) as has_classification
FROM public.products
UNION ALL
SELECT 
  'product_skus' as table_name,
  COUNT(*) as row_count,
  COUNT(CASE WHEN variant_name IS NOT NULL THEN 1 END) as has_variant_name,
  COUNT(CASE WHEN sku IS NOT NULL THEN 1 END) as has_sku
FROM public.product_skus
UNION ALL
SELECT 
  'product_images' as table_name,
  COUNT(*) as row_count,
  COUNT(CASE WHEN is_primary = true THEN 1 END) as primary_count,
  COUNT(*) as total_images
FROM public.product_images
UNION ALL
SELECT 
  'product_descriptions' as table_name,
  COUNT(*) as row_count,
  COUNT(CASE WHEN about IS NOT NULL THEN 1 END) as has_about,
  COUNT(*) as total_descriptions
FROM public.product_descriptions;
*/
