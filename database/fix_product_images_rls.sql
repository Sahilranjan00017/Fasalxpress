-- Fix RLS policies for product_images table to allow inserts

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow public read access to product images" ON product_images;
DROP POLICY IF EXISTS "Allow authenticated users to insert product images" ON product_images;
DROP POLICY IF EXISTS "Allow authenticated users to update product images" ON product_images;
DROP POLICY IF EXISTS "Allow authenticated users to delete product images" ON product_images;

-- Enable RLS
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Create permissive policies
CREATE POLICY "Allow public read access to product images"
ON product_images FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow service role to insert product images"
ON product_images FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert product images"
ON product_images FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow service role to update product images"
ON product_images FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update product images"
ON product_images FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow service role to delete product images"
ON product_images FOR DELETE
TO service_role
USING (true);

CREATE POLICY "Allow authenticated users to delete product images"
ON product_images FOR DELETE
TO authenticated
USING (true);

-- Also fix product_skus table RLS policies
DROP POLICY IF EXISTS "Allow public read access to product skus" ON product_skus;
DROP POLICY IF EXISTS "Allow authenticated users to insert product skus" ON product_skus;
DROP POLICY IF EXISTS "Allow authenticated users to update product skus" ON product_skus;
DROP POLICY IF EXISTS "Allow authenticated users to delete product skus" ON product_skus;

ALTER TABLE product_skus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to product skus"
ON product_skus FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow service role to insert product skus"
ON product_skus FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert product skus"
ON product_skus FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow service role to update product skus"
ON product_skus FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update product skus"
ON product_skus FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow service role to delete product skus"
ON product_skus FOR DELETE
TO service_role
USING (true);

CREATE POLICY "Allow authenticated users to delete product skus"
ON product_skus FOR DELETE
TO authenticated
USING (true);

-- Fix product_descriptions table RLS policies
DROP POLICY IF EXISTS "Allow public read access to product descriptions" ON product_descriptions;
DROP POLICY IF EXISTS "Allow authenticated users to insert product descriptions" ON product_descriptions;
DROP POLICY IF EXISTS "Allow authenticated users to update product descriptions" ON product_descriptions;
DROP POLICY IF EXISTS "Allow authenticated users to delete product descriptions" ON product_descriptions;

ALTER TABLE product_descriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to product descriptions"
ON product_descriptions FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow service role to insert product descriptions"
ON product_descriptions FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert product descriptions"
ON product_descriptions FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow service role to update product descriptions"
ON product_descriptions FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update product descriptions"
ON product_descriptions FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow service role to delete product descriptions"
ON product_descriptions FOR DELETE
TO service_role
USING (true);

CREATE POLICY "Allow authenticated users to delete product descriptions"
ON product_descriptions FOR DELETE
TO authenticated
USING (true);
