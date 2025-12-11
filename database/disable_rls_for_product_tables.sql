-- Disable RLS entirely for product-related tables
-- This is safe because these tables don't contain user-specific data
-- Access control is handled at the application level

-- Disable RLS for product_images
ALTER TABLE product_images DISABLE ROW LEVEL SECURITY;

-- Disable RLS for product_skus
ALTER TABLE product_skus DISABLE ROW LEVEL SECURITY;

-- Disable RLS for product_descriptions  
ALTER TABLE product_descriptions DISABLE ROW LEVEL SECURITY;

-- Optional: Also disable for product_variants if it exists
ALTER TABLE product_variants DISABLE ROW LEVEL SECURITY;
