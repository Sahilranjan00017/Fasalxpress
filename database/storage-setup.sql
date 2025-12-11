-- =====================================================
-- SUPABASE STORAGE BUCKET SETUP FOR PRODUCT IMAGES
-- =====================================================

-- 1. Create the storage bucket (run this in Supabase SQL Editor or via Dashboard)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products',
  'products',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Set up storage policies for public access

-- Drop all existing policies first
DROP POLICY IF EXISTS "Public Access to Products Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon uploads to products" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon delete from products" ON storage.objects;

-- Allow public read access to all files in products bucket
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'products');

-- Allow public INSERT (anon + authenticated)
CREATE POLICY "Public upload access"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'products');

-- Allow public UPDATE
CREATE POLICY "Public update access"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'products')
WITH CHECK (bucket_id = 'products');

-- Allow public DELETE
CREATE POLICY "Public delete access"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'products');
