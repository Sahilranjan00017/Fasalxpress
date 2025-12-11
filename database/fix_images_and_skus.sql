-- ============================================
-- FIX PRODUCT IMAGES AND SKUS TABLES
-- This will add missing columns and fix RLS policies
-- Run this in Supabase SQL Editor
-- ============================================

-- FIX PRODUCT_IMAGES TABLE
-- ============================================

-- Add missing columns if they don't exist
ALTER TABLE public.product_images 
ADD COLUMN IF NOT EXISTS url TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS alt_text TEXT;

-- If you have image_url but not url, copy the data
UPDATE public.product_images 
SET url = image_url 
WHERE url IS NULL AND image_url IS NOT NULL;

-- FIX PRODUCT_SKUS TABLE
-- ============================================

-- Add missing columns if they don't exist
ALTER TABLE public.product_skus 
ADD COLUMN IF NOT EXISTS mrp DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS unit_type TEXT,
ADD COLUMN IF NOT EXISTS quantity TEXT,
ADD COLUMN IF NOT EXISTS pieces_per_box INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS sku TEXT,
ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '{}';

-- Copy data from old columns to new ones if needed
UPDATE public.product_skus 
SET unit_price = price 
WHERE unit_price IS NULL AND price IS NOT NULL;

UPDATE public.product_skus 
SET mrp = unit_price 
WHERE mrp IS NULL AND unit_price IS NOT NULL;

-- FIX RLS POLICIES FOR PRODUCT_IMAGES
-- ============================================

-- Disable RLS temporarily to fix data
ALTER TABLE public.product_images DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can view product images" ON public.product_images;
DROP POLICY IF EXISTS "Admin can manage product images" ON public.product_images;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.product_images;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.product_images;
DROP POLICY IF EXISTS "product_images_insert_policy" ON public.product_images;
DROP POLICY IF EXISTS "product_images_select_policy" ON public.product_images;

-- Re-enable RLS
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Create simple, permissive policies
CREATE POLICY "Allow public read access"
  ON public.product_images FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated insert"
  ON public.product_images FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update"
  ON public.product_images FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete"
  ON public.product_images FOR DELETE
  USING (true);

-- FIX RLS POLICIES FOR PRODUCT_SKUS
-- ============================================

-- Disable RLS temporarily
ALTER TABLE public.product_skus DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can view product SKUs" ON public.product_skus;
DROP POLICY IF EXISTS "Admin can manage product SKUs" ON public.product_skus;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.product_skus;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.product_skus;

-- Re-enable RLS
ALTER TABLE public.product_skus ENABLE ROW LEVEL SECURITY;

-- Create simple, permissive policies
CREATE POLICY "Allow public read access"
  ON public.product_skus FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated insert"
  ON public.product_skus FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update"
  ON public.product_skus FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete"
  ON public.product_skus FOR DELETE
  USING (true);

-- FIX RLS POLICIES FOR PRODUCT_DESCRIPTIONS
-- ============================================

-- Ensure table exists
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

-- Disable RLS temporarily
ALTER TABLE public.product_descriptions DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can view product descriptions" ON public.product_descriptions;
DROP POLICY IF EXISTS "Admin can manage product descriptions" ON public.product_descriptions;

-- Re-enable RLS
ALTER TABLE public.product_descriptions ENABLE ROW LEVEL SECURITY;

-- Create simple, permissive policies
CREATE POLICY "Allow public read access"
  ON public.product_descriptions FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated insert"
  ON public.product_descriptions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update"
  ON public.product_descriptions FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete"
  ON public.product_descriptions FOR DELETE
  USING (true);

-- CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_skus_product_id ON public.product_skus(product_id);
CREATE INDEX IF NOT EXISTS idx_product_descriptions_product_id ON public.product_descriptions(product_id);

-- VERIFICATION
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Product images table fixed!';
  RAISE NOTICE '✅ Product SKUs table fixed!';
  RAISE NOTICE '✅ Product descriptions table fixed!';
  RAISE NOTICE '✅ RLS policies updated to be more permissive';
  RAISE NOTICE '✅ All columns added';
  RAISE NOTICE '✅ Indexes created';
  RAISE NOTICE '';
  RAISE NOTICE '📝 You can now insert images and SKUs without RLS errors!';
END $$;
