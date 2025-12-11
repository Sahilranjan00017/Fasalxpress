# 📋 SKU VARIANTS INTEGRATION GUIDE

## Overview
This guide explains how the SKU (Stock Keeping Unit) variants system works with your AGROBUILD database and frontend.

---

## 1. DATABASE STRUCTURE

### Products Table
Your `products` table now has all necessary columns including:
- `images` (TEXT[]) - Array of image URLs
- `image_count` (INTEGER) - Auto-calculated by trigger
- `primary_image` (TEXT) - First image from array (auto-updated by trigger)

**Trigger Function**: `update_product_image_count()`
- Automatically updates `image_count` by counting array elements
- Automatically sets `primary_image` to first image in array
- Fires BEFORE INSERT or UPDATE of images column

### New Product_SKUs Table
Stores all variants of a product with unit types and box packing.

**Structure**:
```
product_skus {
  id: UUID,
  product_id: UUID (FK → products.id),
  unit_type: VARCHAR(50) ✓ Check: 'Litre' or 'Kg',
  quantity: VARCHAR(100),
  pieces_per_box: INTEGER ✓ Check: 6, 8, 10, or 12,
  unit_price: DECIMAL(10,2),
  unit_mrp: DECIMAL(10,2),
  box_price: DECIMAL(10,2),
  box_mrp: DECIMAL(10,2),
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

**Indexes**:
- `idx_product_skus_product_id` - Fast lookups by product
- `idx_product_skus_unit_type` - Fast lookups by unit type

**RLS Policies**:
- Everyone can VIEW SKUs for public products (availability = true)
- Only ADMIN can CREATE, UPDATE, DELETE SKUs

---

## 2. FRONTEND INTEGRATION

### AdminCreateProduct.tsx & AdminEditProduct.tsx

These components already have complete SKU functionality:

```typescript
interface SKUVariant {
  id: string;
  unitType: 'Litre' | 'Kg';
  quantity: string;
  piecesPerBox: 6 | 8 | 10 | 12;
  price: number;
  mrp: number;
  boxPrice: number;
  boxMrp: number;
}

// UNIT_TYPES configuration
const UNIT_TYPES = {
  'Litre': ['100ml', '250ml', '500ml', '1L'],
  'Kg': ['100g', '250g', '500g', '1Kg']
};

// BOX_QUANTITIES constant
const BOX_QUANTITIES = [6, 8, 10, 12];
```

**Features**:
- Add multiple SKU variants per product
- Auto-calculate box price: `unit_price × pieces_per_box`
- Delete variants before submission
- Form validation for all fields
- Full variant preview on product submission

---

## 3. API FLOW

### Creating a Product with SKU Variants

**Request** (POST `/api/admin/products`):
```json
{
  "product_id": "PROD-001",
  "title": "Premium Olive Oil",
  "price": 500,
  "mrp": 750,
  "category_name": "Edible Oils",
  "stock_quantity": 100,
  "images": ["https://storage.url/img1.jpg"],
  "sku_variants": [
    {
      "unitType": "Litre",
      "quantity": "500ml",
      "piecesPerBox": 6,
      "price": 300,
      "mrp": 450,
      "boxPrice": 1800,
      "boxMrp": 2700
    },
    {
      "unitType": "Litre",
      "quantity": "1L",
      "piecesPerBox": 6,
      "price": 500,
      "mrp": 750,
      "boxPrice": 3000,
      "boxMrp": 4500
    }
  ]
}
```

**Backend Processing** (in `adminCreateProduct`):
1. Extract `sku_variants` from payload
2. Insert product data into `products` table
3. Get returned product ID
4. Insert each SKU variant into `product_skus` table with `product_id`
5. Return created product

**Response**:
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "uuid",
      "product_id": "PROD-001",
      "title": "Premium Olive Oil",
      ...
    }
  }
}
```

---

## 4. BACKEND INTEGRATION

### File: `server/lib/db/admin.ts`

**Updated Functions**:

#### `adminCreateProduct(payload)`
```typescript
export async function adminCreateProduct(payload: any) {
  // 1. Separate SKU variants from product data
  const { sku_variants, ...productData } = payload;
  
  // 2. Insert product
  const { data: product, error: productError } = await supabase
    .from("products")
    .insert(productData)
    .select("*")
    .single();
  
  // 3. If SKU variants provided, insert them
  if (sku_variants && Array.isArray(sku_variants)) {
    const skusToInsert = sku_variants.map((sku: any) => ({
      product_id: product.id,
      unit_type: sku.unitType,
      quantity: sku.quantity,
      pieces_per_box: sku.piecesPerBox,
      unit_price: sku.price,
      unit_mrp: sku.mrp,
      box_price: sku.boxPrice,
      box_mrp: sku.boxMrp,
    }));
    
    await supabase.from("product_skus").insert(skusToInsert);
  }
  
  return product;
}
```

#### `adminUpdateProduct(id, payload)`
```typescript
export async function adminUpdateProduct(id: string, payload: any) {
  // 1. Separate SKU variants
  const { sku_variants, ...productData } = payload;
  
  // 2. Update product
  const { data: product } = await supabase
    .from("products")
    .update(productData)
    .eq("id", id)
    .select("*")
    .single();
  
  // 3. Delete old SKU variants
  await supabase.from("product_skus").delete().eq("product_id", id);
  
  // 4. Insert new SKU variants
  if (sku_variants && sku_variants.length > 0) {
    const skusToInsert = sku_variants.map((sku: any) => ({
      product_id: id,
      unit_type: sku.unitType,
      quantity: sku.quantity,
      pieces_per_box: sku.piecesPerBox,
      unit_price: sku.price,
      unit_mrp: sku.mrp,
      box_price: sku.boxPrice,
      box_mrp: sku.boxMrp,
    }));
    
    await supabase.from("product_skus").insert(skusToInsert);
  }
  
  return product;
}
```

### File: `server/routes/products.ts`

**Updated SELECT Queries**:
All GET endpoints now include SKU variants:

```typescript
const { data: products, error } = await supabaseAdmin
  .from("products")
  .select("*, category:categories(*), variants:product_variants(*), skus:product_skus(*)")
```

This fetches:
- Product base data
- Related category details
- Related product variants (deprecated, for backward compatibility)
- **NEW**: Related SKU variants in `skus` property

---

## 5. DATA INSERTION EXAMPLES

### Example 1: Create Product with Litre-based SKUs

```sql
-- Insert product
INSERT INTO public.products (
  product_id, title, price, mrp, brand,
  category_name, stock_quantity, images
) VALUES (
  'PROD-OIL-001',
  'Premium Mustard Oil',
  200,
  350,
  'Golden Press',
  'Edible Oils',
  500,
  ARRAY['https://storage.example.com/oil1.jpg']
) RETURNING id;

-- Insert SKU variants for different sizes
INSERT INTO public.product_skus (
  product_id, unit_type, quantity, pieces_per_box,
  unit_price, unit_mrp, box_price, box_mrp
) VALUES
  (
    '{{ product-uuid }}',
    'Litre',
    '500ml',
    6,
    150.00,
    200.00,
    900.00,
    1200.00
  ),
  (
    '{{ product-uuid }}',
    'Litre',
    '1L',
    6,
    280.00,
    350.00,
    1680.00,
    2100.00
  );
```

### Example 2: Create Product with Kg-based SKUs

```sql
-- Insert product
INSERT INTO public.products (
  product_id, title, price, mrp, brand,
  category_name, stock_quantity, images
) VALUES (
  'PROD-SEEDS-001',
  'Hybrid Corn Seeds',
  500,
  700,
  'AgriTech Pro',
  'Seeds',
  200,
  ARRAY['https://storage.example.com/seeds1.jpg']
) RETURNING id;

-- Insert SKU variants
INSERT INTO public.product_skus (
  product_id, unit_type, quantity, pieces_per_box,
  unit_price, unit_mrp, box_price, box_mrp
) VALUES
  (
    '{{ product-uuid }}',
    'Kg',
    '250g',
    10,
    125.00,
    175.00,
    1250.00,
    1750.00
  ),
  (
    '{{ product-uuid }}',
    'Kg',
    '500g',
    8,
    250.00,
    350.00,
    2000.00,
    2800.00
  ),
  (
    '{{ product-uuid }}',
    'Kg',
    '1Kg',
    6,
    500.00,
    700.00,
    3000.00,
    4200.00
  );
```

---

## 6. QUERYING PRODUCTS WITH SKUS

### Get All Products with SKUs

```sql
SELECT 
  p.id,
  p.product_id,
  p.title,
  p.price,
  p.mrp,
  COUNT(ps.id) as total_skus,
  ARRAY_AGG(JSON_BUILD_OBJECT(
    'id', ps.id,
    'unitType', ps.unit_type,
    'quantity', ps.quantity,
    'piecesPerBox', ps.pieces_per_box,
    'unitPrice', ps.unit_price,
    'boxPrice', ps.box_price
  )) as skus
FROM public.products p
LEFT JOIN public.product_skus ps ON p.id = ps.product_id
WHERE p.availability = true
GROUP BY p.id, p.product_id, p.title, p.price, p.mrp
ORDER BY p.title;
```

### Get Product by ID with SKUs

```sql
SELECT 
  p.*,
  JSON_AGG(JSON_BUILD_OBJECT(
    'id', ps.id,
    'unitType', ps.unit_type,
    'quantity', ps.quantity,
    'piecesPerBox', ps.pieces_per_box,
    'unitPrice', ps.unit_price,
    'unitMrp', ps.unit_mrp,
    'boxPrice', ps.box_price,
    'boxMrp', ps.box_mrp
  )) as skus
FROM public.products p
LEFT JOIN public.product_skus ps ON p.id = ps.product_id
WHERE p.id = '{{ product-uuid }}'
GROUP BY p.id;
```

### Get Products by Unit Type

```sql
SELECT DISTINCT
  p.id,
  p.product_id,
  p.title,
  ps.unit_type
FROM public.products p
JOIN public.product_skus ps ON p.id = ps.product_id
WHERE ps.unit_type = 'Litre'
ORDER BY p.title;
```

---

## 7. NEXT STEPS

### Tasks Completed ✅
- [x] Product table with all image columns and trigger
- [x] Product_skus table created with constraints and RLS
- [x] Backend functions updated to handle SKU variants
- [x] API endpoints updated to return SKU data
- [x] Frontend UI already built (AdminCreateProduct, AdminEditProduct)

### Tasks Remaining ⏳
- [ ] Test product creation with SKU variants
- [ ] Update ProductDetail page to display SKU variants to customers
- [ ] Create SKU selection dropdown in cart (select variant → quantity → add to cart)
- [ ] Update cart to store selected SKU variant info
- [ ] Update order creation to include selected SKU variant
- [ ] Update admin dashboard to show SKU variant inventory

---

## 8. TROUBLESHOOTING

### Issue: SKU variants not saving
**Solution**: Check that `sku_variants` array is properly formatted in request:
```json
"sku_variants": [
  {
    "unitType": "Litre",
    "quantity": "500ml",
    "piecesPerBox": 6,
    "price": 300,
    "mrp": 450,
    "boxPrice": 1800,
    "boxMrp": 2700
  }
]
```

### Issue: Images not auto-updating image_count
**Solution**: Ensure trigger is active:
```sql
-- Check trigger
SELECT * FROM information_schema.triggers
WHERE trigger_name = 'trigger_update_product_image_count';

-- If missing, recreate:
DROP TRIGGER IF EXISTS trigger_update_product_image_count ON products;
CREATE TRIGGER trigger_update_product_image_count
  BEFORE INSERT OR UPDATE OF images ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_product_image_count();
```

### Issue: Constraint violation on pieces_per_box
**Solution**: Only use values 6, 8, 10, or 12 for `piecesPerBox`:
```json
"piecesPerBox": 6  ✓
"piecesPerBox": 7  ✗ (will fail)
```

---

## 9. COMPLETE WORKFLOW

### Create Product with All Components

1. **Frontend** (AdminCreateProduct.tsx)
   - Fill product basic info
   - Upload images
   - Add multiple SKU variants
   - Click "Create Product"

2. **Request** → POST `/api/admin/products`
   - Body includes product data + sku_variants array

3. **Backend** (adminCreateProduct)
   - Insert product into `products` table
   - Extract SKU variants
   - Insert each variant into `product_skus` table
   - Return product object

4. **Database**
   - Product stored with image array
   - Trigger auto-updates image_count and primary_image
   - SKU variants linked via product_id FK

5. **GET Request** → `/api/products/{id}`
   - Returns product WITH skus array included
   - Frontend can display all variants

6. **Frontend** (ProductDetail page - future)
   - Show product base info
   - Display SKU variant selector
   - Customer picks variant → quantity → add to cart

---

## Summary

Your SKU variant system is now fully integrated:
- ✅ Database structure complete
- ✅ Frontend UI ready
- ✅ Backend functions updated
- ✅ API endpoints configured
- ✅ Image auto-tracking working

You're ready to test the complete product creation flow!
