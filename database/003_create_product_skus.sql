-- =====================================================
-- CREATE PRODUCT_SKUS TABLE FOR SKU VARIANTS
-- =====================================================

-- Create product_skus table for managing product variants with unit types and box packing
CREATE TABLE IF NOT EXISTS public.product_skus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  unit_type VARCHAR(50) NOT NULL CHECK (unit_type IN ('Litre', 'Kg')),
  quantity VARCHAR(100) NOT NULL,
  pieces_per_box INTEGER NOT NULL CHECK (pieces_per_box IN (6, 8, 10, 12)),
  unit_price DECIMAL(10, 2) NOT NULL,
  unit_mrp DECIMAL(10, 2) NOT NULL,
  box_price DECIMAL(10, 2) NOT NULL,
  box_mrp DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_product_skus_product_id ON public.product_skus(product_id);

-- Create index for finding by unit type
CREATE INDEX IF NOT EXISTS idx_product_skus_unit_type ON public.product_skus(unit_type);

-- =====================================================
-- ENABLE RLS FOR PRODUCT_SKUS
-- =====================================================

ALTER TABLE public.product_skus ENABLE ROW LEVEL SECURITY;

-- Anyone can view SKUs for public products
CREATE POLICY "Anyone can view product_skus for public products"
  ON public.product_skus FOR SELECT
  USING (
    product_id IN (
      SELECT id FROM public.products WHERE availability = true
    )
  );

-- Admin can manage product_skus
CREATE POLICY "Admin can manage product_skus"
  ON public.product_skus FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );

-- =====================================================
-- EXAMPLE INSERT STATEMENTS
-- =====================================================

-- Example 1: Insert SKU variants for a Litre-based product (e.g., Oil)
-- INSERT INTO public.product_skus (
--   product_id, unit_type, quantity, pieces_per_box,
--   unit_price, unit_mrp, box_price, box_mrp
-- ) VALUES (
--   'YOUR-PRODUCT-UUID-HERE',
--   'Litre',
--   '500ml',
--   6,
--   300.00,
--   450.00,
--   1800.00,
--   2700.00
-- );

-- Example 2: Insert SKU variant for Kg-based product (e.g., Seeds)
-- INSERT INTO public.product_skus (
--   product_id, unit_type, quantity, pieces_per_box,
--   unit_price, unit_mrp, box_price, box_mrp
-- ) VALUES (
--   'YOUR-PRODUCT-UUID-HERE',
--   'Kg',
--   '250g',
--   10,
--   150.00,
--   200.00,
--   1500.00,
--   2000.00
-- );

-- =====================================================
-- USEFUL QUERIES
-- =====================================================

-- Get all SKUs for a specific product
-- SELECT * FROM public.product_skus
-- WHERE product_id = 'product-uuid'
-- ORDER BY unit_type, quantity;

-- Get all Litre-based SKUs
-- SELECT p.title, ps.quantity, ps.pieces_per_box, ps.unit_price, ps.box_price
-- FROM public.product_skus ps
-- JOIN public.products p ON ps.product_id = p.id
-- WHERE ps.unit_type = 'Litre'
-- ORDER BY p.title, ps.quantity;

-- Get all Kg-based SKUs
-- SELECT p.title, ps.quantity, ps.pieces_per_box, ps.unit_price, ps.box_price
-- FROM public.product_skus ps
-- JOIN public.products p ON ps.product_id = p.id
-- WHERE ps.unit_type = 'Kg'
-- ORDER BY p.title, ps.quantity;

-- Count SKUs per product
-- SELECT p.id, p.title, COUNT(ps.id) as sku_count
-- FROM public.products p
-- LEFT JOIN public.product_skus ps ON p.id = ps.product_id
-- GROUP BY p.id, p.title
-- ORDER BY sku_count DESC;
