# 📸 IMAGE HANDLING WITH TRIGGER - COMPLETE GUIDE

## How the Image Trigger Works

When you upload images to a product, the PostgreSQL trigger automatically:

1. **Counts the images** → sets `image_count`
2. **Picks first image** → sets `primary_image`
3. **Fires before INSERT/UPDATE** → no extra queries needed

---

## Frontend Integration

### Current Setup (AdminCreateProduct.tsx)

Your form already collects images in this format:

```typescript
// After image upload to Supabase Storage
images: [
  "https://storage.supabase.co/object/public/products/img1.jpg",
  "https://storage.supabase.co/object/public/products/img2.jpg",
  "https://storage.supabase.co/object/public/products/img3.jpg"
]
```

When you POST this data:

```typescript
const response = await fetch('/api/admin/products', {
  method: 'POST',
  body: JSON.stringify({
    product_id: 'PROD-001',
    title: 'My Product',
    images: imageArray, // ← This array
    sku_variants: [...],
    // ... other fields
  })
});
```

---

## Backend Processing

### 1. Product Creation Request

```typescript
// server/lib/db/admin.ts
export async function adminCreateProduct(payload: any) {
  const { sku_variants, ...productData } = payload;
  
  // Images array included in productData
  // productData.images = [url1, url2, url3, ...]
  
  const { data: product } = await supabase
    .from("products")
    .insert(productData)  // ← Trigger fires here
    .select("*")
    .single();
  
  return product;
}
```

### 2. Trigger Execution (PostgreSQL)

```sql
-- Trigger fires BEFORE INSERT
CREATE TRIGGER trigger_update_product_image_count
  BEFORE INSERT OR UPDATE OF images ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_product_image_count();

-- Function calculates values
CREATE OR REPLACE FUNCTION update_product_image_count()
RETURNS TRIGGER AS $$
BEGIN
  NEW.image_count := COALESCE(array_length(NEW.images, 1), 0);
  -- NEW.image_count = 3 (if 3 images provided)
  
  NEW.primary_image := COALESCE(NEW.images[1], NULL);
  -- NEW.primary_image = "https://storage.../img1.jpg" (first image)
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 3. Row Stored

```
Column          | Value
----------------|----------------------------------------------------
id              | uuid
product_id      | PROD-001
title           | My Product
images          | {url1, url2, url3}  ← Array as stored
image_count     | 3                   ← Auto-calculated by trigger
primary_image   | url1                ← Auto-set by trigger
```

---

## Displaying Images

### Get Product with Images

**Request**:
```typescript
const response = await fetch('/api/products/PROD-001');
const { data } = await response.json();
const product = data.product;

// product.images = [url1, url2, url3, ...]
// product.image_count = 3
// product.primary_image = url1
```

**Use in Component**:

```typescript
// ProductGallery.tsx
import { useState } from 'react';

export function ProductGallery({ product }) {
  const [selectedImage, setSelectedImage] = useState(product.primary_image);
  
  return (
    <div>
      {/* Main image - use primary_image */}
      <img 
        src={selectedImage || product.primary_image} 
        alt={product.title} 
        className="w-full h-96 object-cover"
      />
      
      {/* Thumbnails - use images array */}
      <div className="flex gap-2 mt-4">
        {product.images.map((img, idx) => (
          <img 
            key={idx}
            src={img}
            alt={`${product.title} ${idx + 1}`}
            className="w-20 h-20 object-cover cursor-pointer"
            onClick={() => setSelectedImage(img)}
          />
        ))}
      </div>
      
      {/* Show count */}
      <p className="text-sm text-gray-600 mt-2">
        {product.image_count} images
      </p>
    </div>
  );
}
```

---

## Image Update Workflow

### Updating Product Images

**Case 1: Replace some images**

```typescript
// Current product has 3 images
product.images = [url1, url2, url3];

// User replaces with 2 new images
const updatedImages = [newUrl1, newUrl2];

// Send update
const response = await fetch('/api/products/PROD-001', {
  method: 'PUT',
  body: JSON.stringify({
    images: updatedImages  // ← Only 2 images now
  })
});

// Database update:
// Step 1: Trigger fires BEFORE UPDATE OF images
// Step 2: Calculates new image_count = 2
// Step 3: Sets primary_image = newUrl1
// Step 4: Row updates with new values
```

**Case 2: Add more images**

```typescript
// Current: [url1, url2]
// User adds: url3, url4
const updatedImages = [...product.images, newUrl3, newUrl4];
// Result: [url1, url2, url3, url4]

// Send update
await fetch(`/api/products/${product.id}`, {
  method: 'PUT',
  body: JSON.stringify({ images: updatedImages })
});

// Trigger: image_count becomes 4, primary_image stays url1
```

**Case 3: Remove an image**

```typescript
// Current: [url1, url2, url3]
// User removes url2
const updatedImages = product.images.filter(
  (img) => img !== urlToRemove
);
// Result: [url1, url3]

// Send update
await fetch(`/api/products/${product.id}`, {
  method: 'PUT',
  body: JSON.stringify({ images: updatedImages })
});

// Trigger: image_count becomes 2, primary_image = url1
```

---

## Example: Complete Image Management Component

```typescript
// ImageManager.tsx
import { useState } from 'react';

interface ImageManagerProps {
  product: {
    id: string;
    images: string[];
    image_count: number;
    primary_image: string;
  };
  onUpdate: (images: string[]) => void;
}

export function ImageManager({ product, onUpdate }: ImageManagerProps) {
  const [images, setImages] = useState(product.images || []);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('products')
        .upload(`${product.id}/${Date.now()}`, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(data.path);

      // Add to images array
      const newImages = [...images, publicUrl];
      setImages(newImages);
      onUpdate(newImages);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (urlToRemove: string) => {
    const newImages = images.filter(img => img !== urlToRemove);
    setImages(newImages);
    onUpdate(newImages);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        Images ({images.length})
      </h3>

      {/* Main image */}
      {images.length > 0 && (
        <div className="w-full h-48 bg-gray-200 rounded">
          <img 
            src={images[0]} 
            alt="Primary" 
            className="w-full h-full object-cover rounded"
          />
        </div>
      )}

      {/* Thumbnails */}
      <div className="grid grid-cols-4 gap-2">
        {images.map((img, idx) => (
          <div key={idx} className="relative group">
            <img 
              src={img}
              alt={`Image ${idx + 1}`}
              className="w-full h-20 object-cover rounded"
            />
            
            {/* Remove button on hover */}
            <button
              onClick={() => handleRemoveImage(img)}
              className="absolute inset-0 bg-black/50 text-white rounded 
                         flex items-center justify-center opacity-0 
                         group-hover:opacity-100 transition"
            >
              Remove
            </button>
            
            {/* Primary badge */}
            {idx === 0 && (
              <span className="absolute top-1 left-1 bg-blue-500 
                             text-white text-xs px-2 py-1 rounded">
                Primary
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Upload area */}
      <label className="block border-2 border-dashed border-gray-300 
                        rounded p-4 text-center cursor-pointer 
                        hover:border-gray-400">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => {
            Array.from(e.target.files || []).forEach(file => {
              handleImageUpload(file);
            });
          }}
          disabled={uploading}
          className="hidden"
        />
        {uploading ? 'Uploading...' : 'Click to upload images'}
      </label>

      {/* Info */}
      <p className="text-xs text-gray-500">
        First image is set as primary automatically
      </p>
    </div>
  );
}
```

---

## SQL Queries for Image Management

### Get Products by Image Count

```sql
-- Products with most images
SELECT id, title, image_count, images
FROM public.products
WHERE image_count > 0
ORDER BY image_count DESC
LIMIT 10;
```

### Get Products without Images

```sql
-- Find products missing images
SELECT id, title, image_count
FROM public.products
WHERE image_count = 0 OR images IS NULL
ORDER BY created_at DESC;
```

### Update Primary Image for a Product

```sql
-- Database automatically handles this - just update images array
UPDATE public.products
SET images = array_prepend('new-primary-url', array_remove(images, 'new-primary-url'))
WHERE id = 'product-uuid';

-- Trigger fires and updates:
-- - primary_image = new primary URL
-- - image_count stays same
```

### Validate Image URLs

```sql
-- Find products with invalid image URLs
SELECT id, title, 
  (SELECT COUNT(*) FROM unnest(images) AS url) as url_count
FROM public.products
WHERE images IS NOT NULL 
  AND array_length(images, 1) > 0
ORDER BY url_count DESC;
```

---

## Best Practices

### ✅ Do This

```typescript
// ✅ Store as simple array of URLs
const images = [
  'https://storage.../image1.jpg',
  'https://storage.../image2.jpg'
];

// ✅ Let trigger handle image_count and primary_image
const product = await createProduct({ 
  title: 'My Product',
  images: imageArray  // Don't calculate count/primary manually
});

// ✅ Use primary_image when you need a single image
<img src={product.primary_image} alt={product.title} />

// ✅ Use images array for gallery
{product.images.map(img => <img src={img} />)}

// ✅ Use image_count to show count
<span>{product.image_count} images</span>
```

### ❌ Don't Do This

```typescript
// ❌ Don't manually set image_count
const product = {
  images: imageArray,
  image_count: imageArray.length  // Trigger will override this
};

// ❌ Don't assume primary_image is set
// Always check if exists
<img src={product.primary_image || product.images?.[0]} />

// ❌ Don't store image data as objects
const images = [
  { url: 'https://...', alt: 'Image 1' }  // ❌ Use array of URLs only
];

// ❌ Don't send huge image arrays (too much data)
// Limit to reasonable number of images per product
```

---

## Performance Tips

### Image Array Size Limits

- **Reasonable**: 1-20 images per product
- **Warning**: 20-50 images (still okay, but getting large)
- **Too Large**: 100+ images (consider separate images table)

### GIN Index

Your GIN index on images column enables fast queries:

```sql
-- Fast: Uses GIN index
SELECT * FROM products 
WHERE images @> ARRAY['https://storage.../specific.jpg'];

-- Slower: Doesn't use GIN
SELECT * FROM products
WHERE images::text LIKE '%specific.jpg%';
```

### Query Optimization

```typescript
// ✅ Efficient: Get only needed columns
const { data } = await supabase
  .from('products')
  .select('id, title, primary_image')  // Just primary, not full array
  .eq('availability', true);

// ❌ Less efficient: Get everything
const { data } = await supabase
  .from('products')
  .select('*');  // Includes full images array for all products
```

---

## Testing

### Test Image Operations

```sql
-- Test 1: Insert product with images
INSERT INTO products (title, images)
VALUES ('Test Product', ARRAY[
  'https://example.com/img1.jpg',
  'https://example.com/img2.jpg',
  'https://example.com/img3.jpg'
]);

-- Check trigger fired
SELECT id, image_count, primary_image FROM products 
WHERE title = 'Test Product';
-- Expected: image_count = 3, primary_image = 'https://example.com/img1.jpg'

-- Test 2: Update images
UPDATE products
SET images = ARRAY['https://example.com/new1.jpg']
WHERE title = 'Test Product';

-- Check trigger fired
SELECT image_count, primary_image FROM products 
WHERE title = 'Test Product';
-- Expected: image_count = 1, primary_image = 'https://example.com/new1.jpg'

-- Test 3: Empty images
UPDATE products
SET images = ARRAY[]::text[]
WHERE title = 'Test Product';

-- Check
SELECT image_count, primary_image FROM products 
WHERE title = 'Test Product';
-- Expected: image_count = 0, primary_image = NULL
```

---

## Summary

| Feature | Handled By | Notes |
|---------|-----------|-------|
| Store images | Your code (POST) | Send array of URLs |
| Count images | Trigger | Auto-calculated, don't send |
| Set primary | Trigger | Auto-set to first, don't send |
| Display images | Your code (GET) | Use images array in gallery |
| Display primary | Your code | Use primary_image for thumbnail |
| Update images | Your code + trigger | Send new array, trigger updates metadata |

The trigger is **transparent** - it works automatically without any extra code needed!
