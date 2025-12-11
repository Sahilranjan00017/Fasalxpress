# Quick Setup Guide for Product Images

## Step 1: Create Supabase Storage Bucket

### Option A: Via Supabase Dashboard (Recommended - Easiest)
1. Go to https://supabase.com/dashboard/project/tdwpvljcpqkmushtausd
2. Click **Storage** in left sidebar
3. Click **New bucket**
4. Fill in:
   - **Name**: `products`
   - **Public bucket**: ✅ **YES** (check this!)
   - **File size limit**: `10 MB`
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp, image/gif`
5. Click **Create bucket**

### Option B: Via SQL (Alternative)
1. Go to **SQL Editor** in Supabase Dashboard
2. Copy and run the contents of `database/storage-setup.sql`

## Step 2: Set Storage Policies

After creating the bucket, run this in **SQL Editor**:

```sql
-- Allow public read access
CREATE POLICY "Public Access to Products Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'products');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'products');
```

## Step 3: Update Database Schema

Run this in **SQL Editor**:

```sql
-- Add images column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Update existing products
UPDATE products 
SET images = '{}' 
WHERE images IS NULL;
```

Or run the full script: `database/product-images-schema.sql`

## Step 4: Verify Setup

1. Go to Supabase Dashboard → Storage
2. You should see **products** bucket listed
3. Click on it → it should be empty (ready for uploads)

## Step 5: Test Upload

1. Login to your admin panel: http://localhost:8080/login
2. Go to: http://localhost:8080/admin/products/create
3. Click **"Click to upload images"**
4. Select 1-3 images
5. You should see:
   - "X image(s) uploaded successfully" toast
   - Image previews below upload area
6. Fill other details and click **"Create Product"**
7. Go back to `/admin/products` → your product should show with images!

## Troubleshooting

### "Bucket not found" error
- Make sure you created the `products` bucket in Supabase Storage
- Verify it's set to **public**
- Check the bucket name is exactly `products` (lowercase, no spaces)

### Images not showing
- Verify the bucket is **public**
- Check storage policies are created
- Open browser console and check the image URL - it should be accessible

### Upload fails silently
- Check browser console for errors
- Verify you're logged in as admin
- Check Supabase Dashboard → Storage → Policies

## Quick Test Query

Run in SQL Editor to verify schema:

```sql
-- Check if images column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'images';

-- Check products with images
SELECT id, title, images 
FROM products 
WHERE images IS NOT NULL AND images != '{}' 
LIMIT 5;
```

## Storage URL Structure

Your images will be stored at:
```
https://tdwpvljcpqkmushtausd.supabase.co/storage/v1/object/public/products/product-images/{uuid}.jpg
```

Example:
```
https://tdwpvljcpqkmushtausd.supabase.co/storage/v1/object/public/products/product-images/550e8400-e29b-41d4-a716-446655440000.jpg
```
