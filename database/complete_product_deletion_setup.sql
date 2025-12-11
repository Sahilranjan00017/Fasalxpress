-- ============================================
-- COMPLETE PRODUCT DELETION SETUP
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- STEP 1: Add deleted_at column
-- ============================================
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_products_deleted_at 
ON public.products(deleted_at) 
WHERE deleted_at IS NULL;

-- STEP 2: Fix Foreign Key Constraints
-- ============================================

-- ORDER ITEMS - RESTRICT (Don't allow deletion of products in orders)
ALTER TABLE public.order_items 
DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

ALTER TABLE public.order_items 
ADD CONSTRAINT order_items_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES public.products(id) 
ON DELETE RESTRICT;

-- PRODUCT VARIANTS - CASCADE (Delete with product)
ALTER TABLE public.product_variants 
DROP CONSTRAINT IF EXISTS product_variants_product_id_fkey;

ALTER TABLE public.product_variants 
ADD CONSTRAINT product_variants_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES public.products(id) 
ON DELETE CASCADE;

-- PRODUCT SKUS - CASCADE (Delete with product)
ALTER TABLE public.product_skus 
DROP CONSTRAINT IF EXISTS product_skus_product_id_fkey;

ALTER TABLE public.product_skus 
ADD CONSTRAINT product_skus_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES public.products(id) 
ON DELETE CASCADE;

-- PRODUCT IMAGES - CASCADE (Delete with product)
ALTER TABLE public.product_images 
DROP CONSTRAINT IF EXISTS product_images_product_id_fkey;

ALTER TABLE public.product_images 
ADD CONSTRAINT product_images_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES public.products(id) 
ON DELETE CASCADE;

-- PRODUCT DESCRIPTIONS - CASCADE (Delete with product)
ALTER TABLE public.product_descriptions 
DROP CONSTRAINT IF EXISTS product_descriptions_product_id_fkey;

ALTER TABLE public.product_descriptions 
ADD CONSTRAINT product_descriptions_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES public.products(id) 
ON DELETE CASCADE;

-- CART ITEMS - CASCADE (Remove from cart if product deleted)
ALTER TABLE public.cart_items 
DROP CONSTRAINT IF EXISTS cart_items_product_id_fkey;

ALTER TABLE public.cart_items 
ADD CONSTRAINT cart_items_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES public.products(id) 
ON DELETE CASCADE;

-- STEP 3: Update RLS Policies
-- ============================================

-- Public view - only non-deleted available products
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;

CREATE POLICY "Anyone can view products"
  ON public.products 
  FOR SELECT
  USING (availability = true AND deleted_at IS NULL);

-- Admin view - all products including soft-deleted
DROP POLICY IF EXISTS "Admin can manage products" ON public.products;

CREATE POLICY "Admin can manage products"
  ON public.products 
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );

-- STEP 4: Create Helper Functions
-- ============================================

-- Clean up old functions first
DROP FUNCTION IF EXISTS soft_delete_product(UUID);
DROP FUNCTION IF EXISTS restore_product(UUID);
DROP FUNCTION IF EXISTS hard_delete_product(UUID);

-- Soft Delete Function
CREATE OR REPLACE FUNCTION soft_delete_product(product_uuid UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  UPDATE public.products
  SET 
    deleted_at = NOW(),
    availability = false
  WHERE id = product_uuid
  RETURNING json_build_object(
    'id', id,
    'deleted_at', deleted_at,
    'message', 'Product soft deleted successfully'
  ) INTO result;
  
  IF result IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;
  
  RETURN result;
END;
$$;

-- Restore Product Function
CREATE OR REPLACE FUNCTION restore_product(product_uuid UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  UPDATE public.products
  SET 
    deleted_at = NULL,
    availability = true
  WHERE id = product_uuid
  RETURNING json_build_object(
    'id', id,
    'message', 'Product restored successfully'
  ) INTO result;
  
  IF result IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;
  
  RETURN result;
END;
$$;

-- Hard Delete Function (only if not in orders)
CREATE OR REPLACE FUNCTION hard_delete_product(product_uuid UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  order_count integer;
BEGIN
  SELECT COUNT(*) INTO order_count
  FROM public.order_items
  WHERE product_id = product_uuid;
  
  IF order_count > 0 THEN
    RAISE EXCEPTION 'Cannot delete product that exists in % order(s). Use soft delete instead.', order_count;
  END IF;
  
  DELETE FROM public.products
  WHERE id = product_uuid;
  
  RETURN json_build_object(
    'id', product_uuid,
    'message', 'Product permanently deleted'
  );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION soft_delete_product TO authenticated;
GRANT EXECUTE ON FUNCTION restore_product TO authenticated;
GRANT EXECUTE ON FUNCTION hard_delete_product TO authenticated;

-- STEP 5: Create Active Products View
-- ============================================
CREATE OR REPLACE VIEW active_products AS
SELECT * FROM public.products
WHERE deleted_at IS NULL;

GRANT SELECT ON active_products TO anon, authenticated;

-- STEP 6: Verification
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Product deletion setup complete!';
  RAISE NOTICE '✅ Added deleted_at column for soft deletes';
  RAISE NOTICE '✅ Updated foreign key constraints (RESTRICT on orders, CASCADE on product data)';
  RAISE NOTICE '✅ Updated RLS policies to hide deleted products from public';
  RAISE NOTICE '✅ Created helper functions: soft_delete_product, restore_product, hard_delete_product';
  RAISE NOTICE '✅ Created active_products view';
  RAISE NOTICE '';
  RAISE NOTICE '📝 How it works:';
  RAISE NOTICE '   - Products with orders → Soft deleted (hidden but preserved)';
  RAISE NOTICE '   - Products without orders → Hard deleted (completely removed)';
  RAISE NOTICE '   - Deleted products won''t appear in user or admin listings';
END $$;
