# Supabase Storage Setup for Product Images

## 1. Create Storage Bucket

Go to Supabase Dashboard → Storage → Create a new bucket:

- **Bucket name**: `products`
- **Public bucket**: Yes (so images are publicly accessible)
- **File size limit**: 10 MB (or as needed)
- **Allowed MIME types**: image/jpeg, image/png, image/webp, image/gif

## 2. Storage Policies

After creating the bucket, add these policies:

### Allow Public Read Access
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'products' );
```

### Allow Authenticated Upload
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products'
  AND auth.role() = 'authenticated'
);
```

### Allow Authenticated Delete (for admin)
```sql
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'products'
  AND auth.role() = 'authenticated'
);
```

## 3. Database Schema

Ensure your `products` table has an `images` column:

```sql
-- Check if images column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'images';

-- If not exists, add it
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS images TEXT[];
```

## 4. How It Works

1. **Upload Flow**:
   - User selects images in admin panel
   - Files are uploaded to Supabase Storage bucket `products/product-images/`
   - Public URLs are generated automatically
   - URLs are saved in `products.images` array column

2. **Display Flow**:
   - Product list fetches products with `images` array
   - First image in array is used as primary product image
   - All images can be shown in product gallery

3. **File Naming**:
   - Files are named with UUID + original extension
   - Example: `550e8400-e29b-41d4-a716-446655440000.jpg`
   - Stored in: `products/product-images/[filename]`

## 5. Testing

After setup:
1. Go to `/admin/products/create`
2. Upload 1-3 images
3. Fill in product details
4. Click "Create Product"
5. Verify images show in product list at `/admin/products`
6. Check product detail page shows images correctly
