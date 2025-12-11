-- =====================================================
-- DATABASE SCHEMA UPDATES FOR PRODUCT IMAGES
-- =====================================================

-- 1. Ensure products table has images column
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Add comment to document the column
COMMENT ON COLUMN products.images IS 'Array of public image URLs from Supabase Storage';

-- 2. Create index for faster image queries (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_products_images ON products USING GIN (images);

-- 3. Update existing products to have empty array if NULL
UPDATE products 
SET images = '{}' 
WHERE images IS NULL;

-- =====================================================
-- ADDITIONAL RECOMMENDED COLUMNS (if not already present)
-- =====================================================

-- Add image-related metadata columns (optional)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS primary_image TEXT;

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS image_count INTEGER DEFAULT 0;

-- Create trigger to auto-update image_count
CREATE OR REPLACE FUNCTION update_product_image_count()
RETURNS TRIGGER AS $$
BEGIN
  NEW.image_count := COALESCE(array_length(NEW.images, 1), 0);
  NEW.primary_image := COALESCE(NEW.images[1], NULL);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_product_image_count ON products;
CREATE TRIGGER trigger_update_product_image_count
  BEFORE INSERT OR UPDATE OF images ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_product_image_count();

-- =====================================================
-- VERIFY SCHEMA
-- =====================================================

-- Check if images column exists and its structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
  AND column_name IN ('images', 'primary_image', 'image_count')
ORDER BY column_name;

-- Sample query to test
-- SELECT id, title, images, primary_image, image_count 
-- FROM products 
-- LIMIT 5;
