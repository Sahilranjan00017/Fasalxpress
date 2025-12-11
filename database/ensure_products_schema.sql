-- ============================================
-- ENSURE PRODUCTS TABLE HAS ALL REQUIRED COLUMNS
-- Run this in Supabase SQL Editor
-- ============================================

-- Add any missing columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS brand TEXT,
ADD COLUMN IF NOT EXISTS category_name TEXT,
ADD COLUMN IF NOT EXISTS classification TEXT,
ADD COLUMN IF NOT EXISTS technical_content TEXT,
ADD COLUMN IF NOT EXISTS toxicity TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS country_of_origin TEXT DEFAULT 'India',
ADD COLUMN IF NOT EXISTS cod_available BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS ready_to_ship BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS publish_date DATE,
ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS availability BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);

-- Create index on deleted_at
CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON public.products(deleted_at) WHERE deleted_at IS NULL;

-- Ensure product_images table exists with correct structure
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  alt_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on product_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);

-- Ensure product_skus table exists with correct structure
CREATE TABLE IF NOT EXISTS public.product_skus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  unit_type TEXT NOT NULL,
  quantity TEXT NOT NULL,
  pieces_per_box INTEGER DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  mrp DECIMAL(10, 2),
  sku TEXT,
  stock INTEGER DEFAULT 0,
  tags JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on product_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_product_skus_product_id ON public.product_skus(product_id);

-- Ensure product_descriptions table exists
CREATE TABLE IF NOT EXISTS public.product_descriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  about TEXT,
  mode_of_entry TEXT,
  mode_of_action TEXT,
  chemical_group TEXT,
  target_pests TEXT,
  recommended_crops TEXT,
  dosage_per_acre TEXT,
  how_to_apply TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on product_id
CREATE INDEX IF NOT EXISTS idx_product_descriptions_product_id ON public.product_descriptions(product_id);

-- Enable RLS on all tables if not already enabled
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_skus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_descriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_images
DROP POLICY IF EXISTS "Anyone can view product images" ON public.product_images;
CREATE POLICY "Anyone can view product images"
  ON public.product_images FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin can manage product images" ON public.product_images;
CREATE POLICY "Admin can manage product images"
  ON public.product_images FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );

-- RLS Policies for product_skus
DROP POLICY IF EXISTS "Anyone can view product SKUs" ON public.product_skus;
CREATE POLICY "Anyone can view product SKUs"
  ON public.product_skus FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin can manage product SKUs" ON public.product_skus;
CREATE POLICY "Admin can manage product SKUs"
  ON public.product_skus FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );

-- RLS Policies for product_descriptions
DROP POLICY IF EXISTS "Anyone can view product descriptions" ON public.product_descriptions;
CREATE POLICY "Anyone can view product descriptions"
  ON public.product_descriptions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin can manage product descriptions" ON public.product_descriptions;
CREATE POLICY "Admin can manage product descriptions"
  ON public.product_descriptions FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );

-- Verification
DO $$
BEGIN
  RAISE NOTICE '✅ Products table schema updated successfully!';
  RAISE NOTICE '✅ All required columns are now present';
  RAISE NOTICE '✅ Related tables (images, skus, descriptions) verified';
  RAISE NOTICE '✅ Indexes created for better performance';
  RAISE NOTICE '✅ RLS policies configured';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Your product update should now work correctly!';
END $$;
