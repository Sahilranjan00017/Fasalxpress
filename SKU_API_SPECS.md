# SKU Variant System - API Specifications

## Overview
Complete API specifications for the SKU variant system backend implementation.

---

## Data Models

### SKUVariant Object
```typescript
interface SKUVariant {
  id: string;                    // UUID v4, auto-generated
  productId: string;             // Foreign key to products table
  unitType: 'Litre' | 'Kg';      // Unit measurement type
  quantity: string;              // e.g., "100 ml", "250 g"
  piecesPerBox: 6 | 8 | 10 | 12; // Packaging quantity
  unitPrice: number;             // Price per unit (₹)
  unitMrp: number;               // MRP per unit (₹)
  boxPrice: number;              // piecesPerBox × unitPrice
  boxMrp: number;                // piecesPerBox × unitMrp
  createdAt: ISO8601Timestamp;
  updatedAt: ISO8601Timestamp;
}
```

### Product with SKU Variants
```typescript
interface ProductWithSkus {
  id: string;
  product_id: string;
  title: string;
  description: string;
  price: number;
  mrp: number;
  category_name: string;
  subcategory_name: string;
  brand: string;
  sku: string;
  pack_size: string;
  gst_percentage: number;
  stock_quantity: number;
  images: string[];
  availability: boolean;
  sku_variants: SKUVariant[];
  created_at: ISO8601Timestamp;
  updated_at: ISO8601Timestamp;
}
```

---

## API Endpoints

### 1. Create Product with SKU Variants

**Endpoint**: `POST /api/admin/products`

**Request Headers**:
```
Content-Type: application/json
Authorization: Bearer <token> (if required)
```

**Request Body**:
```json
{
  "product_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Premium Olive Oil",
  "description": "Extra virgin olive oil from Spain",
  "price": 500,
  "mrp": 750,
  "category_name": "Edible Oils",
  "subcategory_name": "Cooking Oils",
  "brand": "Spanish Harvest",
  "sku": "OLIV-2024-001",
  "pack_size": "500ml - 1L",
  "gst_percentage": 5,
  "stock_quantity": 100,
  "images": [
    "https://storage.url/product-images/img1.jpg",
    "https://storage.url/product-images/img2.jpg"
  ],
  "availability": true,
  "sku_variants": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "unitType": "Litre",
      "quantity": "500ml",
      "piecesPerBox": 6,
      "price": 300,
      "mrp": 450,
      "boxPrice": 1800,
      "boxMrp": 2700
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "unitType": "Litre",
      "quantity": "1 Litre",
      "piecesPerBox": 6,
      "price": 500,
      "mrp": 750,
      "boxPrice": 3000,
      "boxMrp": 4500
    }
  ]
}
```

**Response (Success - 201)**:
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "uuid",
      "product_id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Premium Olive Oil",
      "price": 500,
      "mrp": 750,
      "category_name": "Edible Oils",
      "subcategory_name": "Cooking Oils",
      "brand": "Spanish Harvest",
      "sku": "OLIV-2024-001",
      "stock_quantity": 100,
      "images": ["url1", "url2"],
      "sku_variants": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440001",
          "unitType": "Litre",
          "quantity": "500ml",
          "piecesPerBox": 6,
          "unitPrice": 300,
          "unitMrp": 450,
          "boxPrice": 1800,
          "boxMrp": 2700,
          "createdAt": "2024-12-06T10:30:00Z"
        },
        {
          "id": "550e8400-e29b-41d4-a716-446655440002",
          "unitType": "Litre",
          "quantity": "1 Litre",
          "piecesPerBox": 6,
          "unitPrice": 500,
          "unitMrp": 750,
          "boxPrice": 3000,
          "boxMrp": 4500,
          "createdAt": "2024-12-06T10:30:00Z"
        }
      ],
      "createdAt": "2024-12-06T10:30:00Z",
      "updatedAt": "2024-12-06T10:30:00Z"
    }
  }
}
```

**Response (Error - 400)**:
```json
{
  "success": false,
  "error": "At least one SKU variant is required",
  "details": {
    "field": "sku_variants",
    "issue": "empty_array"
  }
}
```

**Response (Error - 422)**:
```json
{
  "success": false,
  "error": "Invalid SKU variant data",
  "details": [
    {
      "variant_index": 0,
      "field": "unitPrice",
      "issue": "must be positive number"
    }
  ]
}
```

---

### 2. Update Product with SKU Variants

**Endpoint**: `PUT /api/admin/products/:id`

**Path Parameters**:
- `id` (string, UUID): Product ID

**Request Body**:
```json
{
  "title": "Updated Product Name",
  "price": 600,
  "mrp": 900,
  "description": "Updated description",
  "stock_quantity": 150,
  "sku_variants": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "unitType": "Litre",
      "quantity": "500ml",
      "piecesPerBox": 8,
      "price": 320,
      "mrp": 480,
      "boxPrice": 2560,
      "boxMrp": 3840
    },
    {
      "id": "NEW_VARIANT_UUID",
      "unitType": "Kg",
      "quantity": "1 Kg",
      "piecesPerBox": 6,
      "price": 1200,
      "mrp": 1800,
      "boxPrice": 7200,
      "boxMrp": 10800
    }
  ]
}
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "uuid",
      "product_id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Updated Product Name",
      "price": 600,
      "mrp": 900,
      "sku_variants": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440001",
          "unitType": "Litre",
          "quantity": "500ml",
          "piecesPerBox": 8,
          "unitPrice": 320,
          "unitMrp": 480,
          "boxPrice": 2560,
          "boxMrp": 3840,
          "updatedAt": "2024-12-06T11:00:00Z"
        }
      ],
      "updatedAt": "2024-12-06T11:00:00Z"
    }
  }
}
```

---

### 3. Get Products (with SKU Variants)

**Endpoint**: `GET /api/products?page=1&limit=10`

**Query Parameters**:
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Results per page (default: 10, max: 100)
- `category` (string, optional): Filter by category
- `search` (string, optional): Search by title

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid",
        "product_id": "550e8400-e29b-41d4-a716-446655440000",
        "title": "Premium Olive Oil",
        "description": "Extra virgin olive oil",
        "price": 500,
        "mrp": 750,
        "category": "Edible Oils",
        "images": ["url1", "url2"],
        "sku_variants": [
          {
            "id": "uuid",
            "unitType": "Litre",
            "quantity": "500ml",
            "piecesPerBox": 6,
            "unitPrice": 300,
            "unitMrp": 450,
            "boxPrice": 1800,
            "boxMrp": 2700
          }
        ]
      }
    ],
    "total": 45,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

### 4. Get Single Product (with SKU Variants)

**Endpoint**: `GET /api/products/:id`

**Path Parameters**:
- `id` (string, UUID): Product ID

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "uuid",
      "product_id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Premium Olive Oil",
      "description": "Extra virgin olive oil from Spain",
      "price": 500,
      "mrp": 750,
      "category_name": "Edible Oils",
      "subcategory_name": "Cooking Oils",
      "brand": "Spanish Harvest",
      "sku": "OLIV-2024-001",
      "pack_size": "500ml - 1L",
      "gst_percentage": 5,
      "stock_quantity": 100,
      "images": [
        "https://storage.url/product-images/img1.jpg",
        "https://storage.url/product-images/img2.jpg"
      ],
      "availability": true,
      "sku_variants": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440001",
          "unitType": "Litre",
          "quantity": "500ml",
          "piecesPerBox": 6,
          "unitPrice": 300,
          "unitMrp": 450,
          "boxPrice": 1800,
          "boxMrp": 2700,
          "createdAt": "2024-12-06T10:30:00Z",
          "updatedAt": "2024-12-06T10:30:00Z"
        },
        {
          "id": "550e8400-e29b-41d4-a716-446655440002",
          "unitType": "Litre",
          "quantity": "1 Litre",
          "piecesPerBox": 6,
          "unitPrice": 500,
          "unitMrp": 750,
          "boxPrice": 3000,
          "boxMrp": 4500,
          "createdAt": "2024-12-06T10:30:00Z",
          "updatedAt": "2024-12-06T10:30:00Z"
        }
      ],
      "createdAt": "2024-12-06T10:30:00Z",
      "updatedAt": "2024-12-06T10:30:00Z"
    }
  }
}
```

**Response (404)**:
```json
{
  "success": false,
  "error": "Product not found"
}
```

---

### 5. Delete Product (with Cascading SKU Variants)

**Endpoint**: `DELETE /api/admin/products/:id`

**Path Parameters**:
- `id` (string, UUID): Product ID

**Response (200)**:
```json
{
  "success": true,
  "message": "Product and associated SKU variants deleted successfully"
}
```

**Note**: Deleting a product automatically deletes all associated SKU variants (CASCADE DELETE)

---

### 6. Get Product SKU Variants (Optional Endpoint)

**Endpoint**: `GET /api/products/:id/skus`

**Path Parameters**:
- `id` (string, UUID): Product ID

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "productId": "550e8400-e29b-41d4-a716-446655440000",
    "variants": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "unitType": "Litre",
        "quantity": "500ml",
        "piecesPerBox": 6,
        "unitPrice": 300,
        "unitMrp": 450,
        "boxPrice": 1800,
        "boxMrp": 2700,
        "discount": "40%",
        "createdAt": "2024-12-06T10:30:00Z"
      }
    ],
    "count": 2
  }
}
```

---

## Validation Rules

### Product Validation
```typescript
{
  title: { required: true, minLength: 3, maxLength: 255 },
  price: { required: true, type: 'number', min: 0 },
  mrp: { required: true, type: 'number', min: 0, mustBeGreaterThanOrEqualTo: 'price' },
  category_name: { required: true },
  images: { required: true, minItems: 1, maxItems: 10 },
  stock_quantity: { type: 'number', min: 0 },
  gst_percentage: { type: 'number', min: 0, max: 100 }
}
```

### SKU Variant Validation
```typescript
{
  unitType: { 
    required: true, 
    enum: ['Litre', 'Kg']
  },
  quantity: {
    required: true,
    enum_by_unitType: {
      'Litre': ['100 ml', '250 ml', '500 ml', '1 Litre'],
      'Kg': ['100 g', '250 g', '500 g', '1 Kg']
    }
  },
  piecesPerBox: {
    required: true,
    enum: [6, 8, 10, 12]
  },
  unitPrice: {
    required: true,
    type: 'decimal(10,2)',
    min: 0
  },
  unitMrp: {
    required: true,
    type: 'decimal(10,2)',
    min: 0,
    mustBeGreaterThanOrEqualTo: 'unitPrice'
  },
  boxPrice: {
    required: true,
    type: 'decimal(10,2)',
    calculatedAs: 'piecesPerBox * unitPrice'
  },
  boxMrp: {
    required: true,
    type: 'decimal(10,2)',
    calculatedAs: 'piecesPerBox * unitMrp'
  }
}
```

### Business Rules
1. **At least 1 SKU variant** required per product
2. **Maximum 20 SKU variants** per product
3. **MRP >= Price** (for both product and variants)
4. **Prices must be positive** (except 0 is allowed)
5. **Unique quantity per unit type** (can't have two "500ml" variants in same product)
6. **Box calculation** must be exact: `piecesPerBox * unitPrice = boxPrice`

---

## Error Responses

### Standard Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes & Messages

| Code | Status | Message |
|------|--------|---------|
| `PRODUCT_NOT_FOUND` | 404 | Product does not exist |
| `INVALID_SKU_VARIANTS` | 422 | SKU variant data is invalid |
| `MISSING_REQUIRED_FIELD` | 400 | Required field missing |
| `INVALID_UNIT_TYPE` | 400 | Unit type must be 'Litre' or 'Kg' |
| `INVALID_QUANTITY` | 400 | Quantity not valid for selected unit type |
| `INVALID_BOX_QUANTITY` | 400 | Box quantity must be 6, 8, 10, or 12 |
| `DUPLICATE_VARIANT` | 400 | Variant with same unit/quantity already exists |
| `PRICE_MISMATCH` | 422 | Box price calculation doesn't match |
| `MRP_LESS_THAN_PRICE` | 400 | MRP must be >= Price |
| `DATABASE_ERROR` | 500 | Database operation failed |

### Example Error Response
```json
{
  "success": false,
  "error": "Invalid SKU variant data",
  "code": "INVALID_SKU_VARIANTS",
  "details": [
    {
      "variantIndex": 0,
      "field": "unitPrice",
      "value": -100,
      "issue": "must_be_positive",
      "message": "Unit price must be a positive number"
    },
    {
      "variantIndex": 0,
      "field": "quantity",
      "value": "800ml",
      "issue": "invalid_for_unit_type",
      "message": "800ml is not valid for Litre unit type"
    }
  ]
}
```

---

## Implementation Checklist

### Phase 1: Database
- [ ] Create `product_skus` table
- [ ] Add foreign key constraint to products
- [ ] Create indexes
- [ ] Add cascade delete rule
- [ ] Run migrations

### Phase 2: Backend Services
- [ ] Create SKU validation service
- [ ] Create SKU calculation service
- [ ] Update product creation service
- [ ] Update product update service
- [ ] Update product deletion service

### Phase 3: API Endpoints
- [ ] Update POST /api/admin/products
- [ ] Update PUT /api/admin/products/:id
- [ ] Update GET /api/products
- [ ] Update GET /api/products/:id
- [ ] Ensure DELETE cascades to SKUs
- [ ] Optional: Add GET /api/products/:id/skus

### Phase 4: Testing
- [ ] Unit tests for validation
- [ ] Unit tests for calculations
- [ ] Integration tests for endpoints
- [ ] Error case testing
- [ ] Edge case testing

---

## Database Schema

```sql
CREATE TABLE product_skus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  unit_type VARCHAR(50) NOT NULL CHECK (unit_type IN ('Litre', 'Kg')),
  quantity VARCHAR(50) NOT NULL,
  pieces_per_box INTEGER NOT NULL CHECK (pieces_per_box IN (6, 8, 10, 12)),
  unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
  unit_mrp DECIMAL(10, 2) NOT NULL CHECK (unit_mrp >= unit_price),
  box_price DECIMAL(10, 2) NOT NULL,
  box_mrp DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_variant_per_product UNIQUE (product_id, unit_type, quantity),
  CONSTRAINT valid_box_price CHECK (box_price = ROUND(unit_price * pieces_per_box, 2)),
  CONSTRAINT valid_box_mrp CHECK (box_mrp = ROUND(unit_mrp * pieces_per_box, 2))
);

CREATE INDEX idx_product_skus_product_id ON product_skus(product_id);
CREATE INDEX idx_product_skus_created_at ON product_skus(created_at DESC);
```

---

## Example Workflows

### Workflow 1: Create Product with 2 Variants
```
1. POST /api/admin/products
   - title: "Mustard Oil"
   - price: 200
   - mrp: 300
   - sku_variants: [
       { unitType: 'Litre', quantity: '500ml', piecesPerBox: 6, price: 100, mrp: 150 },
       { unitType: 'Litre', quantity: '1 Litre', piecesPerBox: 6, price: 200, mrp: 300 }
     ]

2. Backend:
   - Validates product data
   - Validates all variants
   - Creates product record
   - Creates 2 SKU variant records
   - Returns product with variants

3. Response: 201 Created
```

### Workflow 2: Update Product Price & Add Variant
```
1. PUT /api/admin/products/uuid
   - price: 250 (updated)
   - mrp: 350 (updated)
   - sku_variants: [
       { id: 'existing-uuid-1', ...same data },
       { id: 'existing-uuid-2', ...updated data },
       { id: 'new-uuid', unitType: 'Kg', quantity: '1 Kg', piecesPerBox: 6, price: 1200, mrp: 1800 }
     ]

2. Backend:
   - Validates new data
   - Updates product
   - Deletes variants not in new list
   - Updates changed variants
   - Creates new variants
   - Returns updated product

3. Response: 200 OK
```

---

## Rate Limiting & Quotas

Recommended implementation:
```
- Product creation: 100 requests/hour per user
- Product updates: 500 requests/hour per user
- Product reads: No limit
- SKU variant operations: Included in product limits
```

---

## Performance Considerations

1. **Query Optimization**:
   - Always join product_skus when fetching products
   - Use indexes on product_id
   - Cache frequently accessed products

2. **N+1 Query Prevention**:
   - Load all variants in single query
   - Use database relationships effectively

3. **Calculation Performance**:
   - Pre-calculate box prices in database
   - Don't calculate on every request
   - Use triggers for auto-calculation if needed

---

## Security Considerations

1. **Input Validation**: Validate all variant data
2. **Authorization**: Check user permissions before product operations
3. **SQL Injection**: Use parameterized queries
4. **Rate Limiting**: Implement to prevent abuse
5. **Data Validation**: Ensure data consistency
6. **Error Messages**: Don't expose system details in errors

---

## Monitoring & Logging

Log these events:
- Product creation/update/deletion
- Variant creation/update/deletion
- Validation failures
- API errors
- Performance metrics
