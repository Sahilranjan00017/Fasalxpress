# SKU Variant System Guide

## Overview
The new SKU variant system allows products to have multiple variants with different units, quantities, and box packing options. This enables flexible pricing and inventory management.

## Frontend Implementation

### Unit Types Available
- **Litre (L)**: 100 ml, 250 ml, 500 ml, 1 Litre
- **Kg**: 100 g, 250 g, 500 g, 1 Kg

### Box Quantities
- 6, 8, 10, 12 pieces per box

### SKU Variant Object Structure
```typescript
interface SKUVariant {
  id: string;                    // Unique identifier
  unitType: string;              // "Litre" or "Kg"
  quantity: string;              // e.g., "100 ml", "250 g"
  piecesPerBox: number;          // 6, 8, 10, or 12
  price: number;                 // Unit price (₹)
  mrp: number;                   // Unit MRP (₹)
  boxPrice: number;              // piecesPerBox × price
  boxMrp: number;                // piecesPerBox × mrp
}
```

## Pages Updated

### 1. AdminCreateProduct.tsx
- **Location**: `/client/pages/AdminCreateProduct.tsx`
- **Features**:
  - Add multiple SKU variants while creating a product
  - Live box price calculation
  - Visual preview of variants
  - Delete variants before submission
- **Submission**: Includes `sku_variants` array in payload

### 2. AdminEditProduct.tsx
- **Location**: `/client/pages/AdminEditProduct.tsx`
- **Features**:
  - Same SKU variant management as create page
  - Update existing product variants
  - Load variants when editing

## Backend Integration Required

### API Changes Needed

#### POST /api/admin/products
**Payload Structure:**
```json
{
  "product_id": "uuid",
  "title": "Product Name",
  "price": 100,
  "mrp": 150,
  "category_name": "Category",
  "subcategory_name": "Subcategory",
  "description": "Description",
  "sku": "SKU-001",
  "brand": "Brand",
  "pack_size": "500g",
  "gst_percentage": 18,
  "stock_quantity": 100,
  "images": ["url1", "url2"],
  "sku_variants": [
    {
      "id": "uuid",
      "unitType": "Litre",
      "quantity": "100 ml",
      "piecesPerBox": 6,
      "price": 50,
      "mrp": 75,
      "boxPrice": 300,
      "boxMrp": 450
    }
  ],
  "availability": true
}
```

#### PUT /api/admin/products/:id
Same structure as POST for updates

### Database Schema Updates Needed

```sql
-- Add SKU variants table
CREATE TABLE product_skus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  unit_type VARCHAR(50) NOT NULL,
  quantity VARCHAR(50) NOT NULL,
  pieces_per_box INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  unit_mrp DECIMAL(10, 2) NOT NULL,
  box_price DECIMAL(10, 2) NOT NULL,
  box_mrp DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX idx_product_skus_product_id ON product_skus(product_id);
```

## Frontend Features

### Create Product Flow
1. User fills basic product details (name, description, images)
2. User adds SKU variants:
   - Select unit type (Litre or Kg)
   - Select quantity from predefined options
   - Enter unit price and MRP
   - Select pieces per box (6, 8, 10, or 12)
   - System auto-calculates box prices
3. Multiple variants can be added before submission
4. Submit creates product with all variants

### Edit Product Flow
1. Load existing product
2. Manage variants (add/delete)
3. Update product and variants together

### Display/Selection on Frontend (Not yet implemented)
When customers view products, they should see:
```
Select SKU: 
- 100 ml (6 pack) - ₹300
- 250 ml (6 pack) - ₹700
- 500 ml (6 pack) - ₹1,200
- 1 Litre (6 pack) - ₹2,400

OR

- 100 ml (8 pack) - ₹400
- ... etc
```

## Price Calculation Logic

### Box Price Calculation
```
Box Price = Pieces Per Box × Unit Price
Example: 6 × ₹50 = ₹300
```

### Discount Calculation
```
Discount % = ((MRP - Price) / MRP) × 100
```

## Next Steps

### Backend Tasks
1. [ ] Create `product_skus` table in Supabase
2. [ ] Update `/api/admin/products` POST endpoint to save SKU variants
3. [ ] Update `/api/admin/products/:id` PUT endpoint to update SKU variants
4. [ ] Update product retrieval endpoints to include SKU variants
5. [ ] Create `/api/products/:id/skus` endpoint to fetch variants for a product

### Frontend Tasks (Future)
1. [ ] Update ProductDetail page to show SKU selection dropdown
2. [ ] Update Products list to show "Select Options" button
3. [ ] Update Cart to store selected SKU variant
4. [ ] Update Cart display to show selected variant details
5. [ ] Update Checkout to display SKU-specific pricing

## Testing Checklist

### Create Product
- [ ] Add 1 SKU variant and create product
- [ ] Add 3+ SKU variants and create product
- [ ] Verify all variants save correctly
- [ ] Verify box prices are calculated correctly

### Edit Product
- [ ] Load product and add new SKU variant
- [ ] Delete an existing SKU variant
- [ ] Update variant details
- [ ] Verify changes persist

### API Integration
- [ ] POST request includes all SKU variants
- [ ] PUT request updates SKU variants
- [ ] GET request returns SKU variants
- [ ] Box prices match calculation logic

## Example Usage

### Creating a Milk Product
```
Product: Fresh Milk
Price: ₹50/Litre
MRP: ₹75/Litre

Variants:
1. 100 ml × 6 pack = ₹300 (₹450 MRP)
2. 250 ml × 6 pack = ₹750 (₹1,125 MRP)
3. 500 ml × 6 pack = ₹1,500 (₹2,250 MRP)
4. 1 Litre × 6 pack = ₹3,000 (₹4,500 MRP)

Also with 8-pack, 10-pack, 12-pack options...
```

## Notes
- Unit prices are entered per unit (e.g., ₹50 per 100ml bottle)
- Box prices are auto-calculated (pieces_per_box × unit_price)
- Variants are mandatory (at least one required to create product)
- SKU ID is auto-generated as UUID
- All prices use 2 decimal places
