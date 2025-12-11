-- ============================================
-- Fix Product Deletion with Soft Delete Support
-- Run this script in Supabase SQL Editor
-- ============================================

-- Step 1: Add deleted_at column to products table if it doesn't exist
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Step 2: Add index on deleted_at for better query performance
CREATE INDEX IF NOT EXISTS idx_products_deleted_at 
ON public.products(deleted_at) 
WHERE deleted_at IS NULL;

-- Step 3: Update existing foreign key constraints to use RESTRICT
-- This prevents deletion of products that are in orders

-- Drop existing constraint on order_items
ALTER TABLE public.order_items 
DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

-- Recreate with RESTRICT to prevent deletion of ordered products
ALTER TABLE public.order_items 
ADD CONSTRAINT order_items_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES public.products(id) 
ON DELETE RESTRICT;

-- Step 4: Ensure CASCADE on related tables that should be deleted with product
-- These are safe to cascade because they're product-specific data

-- Product variants cascade
ALTER TABLE public.product_variants 
DROP CONSTRAINT IF EXISTS product_variants_product_id_fkey;

ALTER TABLE public.product_variants 
ADD CONSTRAINT product_variants_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES public.products(id) 
ON DELETE CASCADE;

-- Product SKUs cascade
ALTER TABLE public.product_skus 
DROP CONSTRAINT IF EXISTS product_skus_product_id_fkey;

ALTER TABLE public.product_skus 
ADD CONSTRAINT product_skus_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES public.products(id) 
ON DELETE CASCADE;

-- Product images cascade
ALTER TABLE public.product_images 
DROP CONSTRAINT IF EXISTS product_images_product_id_fkey;

ALTER TABLE public.product_images 
ADD CONSTRAINT product_images_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES public.products(id) 
ON DELETE CASCADE;

-- Product descriptions cascade
ALTER TABLE public.product_descriptions 
DROP CONSTRAINT IF EXISTS product_descriptions_product_id_fkey;

ALTER TABLE public.product_descriptions 
ADD CONSTRAINT product_descriptions_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES public.products(id) 
ON DELETE CASCADE;

-- Cart items - allow deletion (remove from cart if product deleted)
ALTER TABLE public.cart_items 
DROP CONSTRAINT IF EXISTS cart_items_product_id_fkey;

ALTER TABLE public.cart_items 
ADD CONSTRAINT cart_items_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES public.products(id) 
ON DELETE CASCADE;

-- Step 5: Update RLS policies to exclude soft-deleted products

-- Drop existing public view policy
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;

-- Recreate with deleted_at filter
CREATE POLICY "Anyone can view products"
  ON public.products 
  FOR SELECT
  USING (availability = true AND deleted_at IS NULL);

-- Admin can see all products including soft-deleted
DROP POLICY IF EXISTS "Admin can manage products" ON public.products;

CREATE POLICY "Admin can manage products"
  ON public.products 
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );

-- Step 6: Create helper functions for soft delete operations

-- Drop existing functions if they exist with different signatures
DROP FUNCTION IF EXISTS soft_delete_product(UUID);
DROP FUNCTION IF EXISTS restore_product(UUID);
DROP FUNCTION IF EXISTS hard_delete_product(UUID);

-- Function to soft delete a product
CREATE OR REPLACE FUNCTION soft_delete_product(product_uuid UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Update the product to mark it as deleted
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

-- Function to restore a soft-deleted product
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

-- Function to permanently delete a product (only if not in orders)
CREATE OR REPLACE FUNCTION hard_delete_product(product_uuid UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  order_count integer;
BEGIN
  -- Check if product is in any orders
  SELECT COUNT(*) INTO order_count
  FROM public.order_items
  WHERE product_id = product_uuid;
  
  IF order_count > 0 THEN
    RAISE EXCEPTION 'Cannot delete product that exists in % order(s). Use soft delete instead.', order_count;
  END IF;
  
  -- Delete the product (cascade will handle related records)
  DELETE FROM public.products
  WHERE id = product_uuid;
  
  RETURN json_build_object(
    'id', product_uuid,
    'message', 'Product permanently deleted'
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION soft_delete_product TO authenticated;
GRANT EXECUTE ON FUNCTION restore_product TO authenticated;
GRANT EXECUTE ON FUNCTION hard_delete_product TO authenticated;

-- Step 7: Create a view for non-deleted products (optional, for convenience)
CREATE OR REPLACE VIEW active_products AS
SELECT * FROM public.products
WHERE deleted_at IS NULL;

-- Grant select on view
GRANT SELECT ON active_products TO anon, authenticated;

-- Step 8: Verify the changes
DO $$
BEGIN
  RAISE NOTICE 'Product deletion setup complete!';
  RAISE NOTICE '- Added deleted_at column for soft deletes';
  RAISE NOTICE '- Updated foreign key constraints';
  RAISE NOTICE '- Created helper functions: soft_delete_product, restore_product, hard_delete_product';
  RAISE NOTICE '- Updated RLS policies to hide deleted products';
  RAISE NOTICE 'Products with orders will be soft-deleted, others can be hard-deleted';
END $$;
