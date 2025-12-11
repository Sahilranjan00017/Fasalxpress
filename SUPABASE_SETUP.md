# E-Commerce Supabase Integration Guide

## Overview

This project integrates with Supabase for database management, authentication, and real-time features. Below is a comprehensive guide to set up and use the Supabase integration.

## 1. Initial Setup

### Step 1: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or select an existing one
3. Go to **Settings → API**
4. Copy:
  - **Project URL** (for `SUPABASE_URL` and `VITE_SUPABASE_URL`)
  - **Anon Key** (for `VITE_SUPABASE_ANON_KEY`) — safe for client usage
  - **Service Role Key** (for `SUPABASE_SERVICE_ROLE_KEY`) — server-only, grants elevated privileges

### Step 2: Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Update with your Supabase credentials (do NOT expose the service role key to the frontend):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Step 3: Apply Database Schema

1. Go to Supabase Dashboard → **SQL Editor**
2. Create a new query
3. Paste your PostgreSQL schema (the tables you provided)
4. Execute the query

### Step 4: Apply RLS Policies

1. In **SQL Editor**, create a new query
2. Copy the contents of `database/rls-policies.sql`
3. Execute the query

This sets up:

- Row Level Security (RLS) for all tables
- Triggers for automatic calculations
- Performance indexes

## 2. API Endpoints

All endpoints require proper authentication (except product/category/banner endpoints which are public for reads).

### Authentication

For user-specific operations, pass `user_id` as a query parameter:

```
GET /api/cart?user_id=<user-uuid>
```

### Product Endpoints

```
GET    /api/products                          # Get all products (paginated)
GET    /api/products/:id                      # Get single product
GET    /api/products/by-product-id/:productId # Get product by product_id field
POST   /api/products                          # Create product (admin)
PUT    /api/products/:id                      # Update product (admin)
DELETE /api/products/:id                      # Delete product (admin)
GET    /api/products/:id/variants             # Get product variants
GET    /api/products/:id/images               # Get product images
```

### Product Variants

```
GET    /api/variants                   # Get variants
GET    /api/variants/:variantId        # Get single variant
POST   /api/variants                   # Create variant
PUT    /api/variants/:variantId        # Update variant
DELETE /api/variants/:variantId        # Delete variant
```

### Product Images

```
GET    /api/images                     # Get images
GET    /api/images/:imageId            # Get single image
POST   /api/images                     # Create image
PUT    /api/images/:imageId            # Update image
DELETE /api/images/:imageId            # Delete image
```

### Categories

```
GET    /api/categories                 # Get all categories
GET    /api/categories/:categoryId      # Get single category
POST   /api/categories                 # Create category (admin)
PUT    /api/categories/:categoryId      # Update category (admin)
DELETE /api/categories/:categoryId      # Delete category (admin)
```

### Banners

```
GET    /api/banners                    # Get active banners
GET    /api/banners/all                # Get all banners (admin)
GET    /api/banners/:bannerId          # Get single banner
POST   /api/banners                    # Create banner (admin)
PUT    /api/banners/:bannerId          # Update banner (admin)
DELETE /api/banners/:bannerId          # Delete banner (admin)
```

### Cart Operations

```
GET    /api/cart?user_id=<uuid>        # Get user's cart
POST   /api/cart/add?user_id=<uuid>    # Add item to cart
PUT    /api/cart/items/:itemId         # Update cart item
DELETE /api/cart/items/:itemId         # Remove cart item
DELETE /api/cart/clear?user_id=<uuid>  # Clear entire cart
```

**Example Request - Add to Cart:**

```javascript
const response = await fetch("/api/cart/add?user_id=user-uuid", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    product_id: "product-uuid",
    variant_id: "variant-uuid",
    quantity: 2,
    boxes: 1,
    unit_price: 100,
  }),
});
```

### Orders

```
GET    /api/orders?user_id=<uuid>      # Get user's orders
GET    /api/orders/:orderId             # Get single order
POST   /api/orders?user_id=<uuid>      # Create order
PUT    /api/orders/:orderId/status      # Update order status
GET    /api/orders/stats                # Get order statistics (admin)
```

**Example Request - Create Order:**

```javascript
const response = await fetch("/api/orders?user_id=user-uuid", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    items: [
      {
        product_id: "product-uuid",
        variant_id: "variant-uuid",
        quantity: 2,
        unit_price: 100,
        total_price: 200,
      },
    ],
    total_amount: 200,
  }),
});
```

### Payments

```
POST   /api/payments/initiate           # Initiate payment (generates UPI/QR)
POST   /api/payments/verify             # Verify payment
POST   /api/payments/confirm            # Confirm successful payment
POST   /api/payments/fail               # Mark payment as failed
GET    /api/payments/stats              # Get payment statistics (admin)
```

**Example Request - Initiate Payment:**

```javascript
const response = await fetch("/api/payments/initiate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    order_id: "order-uuid",
    amount: 500,
  }),
});

# .env.local
NODEMAILER_EMAIL=your-email@gmail.com
NODEMAILER_PASSWORD=your-app-password  # Gmail App Password
NODEMAILER_FROM=noreply@agrobuild.comconst data = await response.json();
// data.data.qr_code - QR code image
// data.data.upi_url - UPI deep link
```

### Vendors

```
GET    /api/vendors                    # Get all vendors
GET    /api/vendors/:vendorId          # Get single vendor
POST   /api/vendors                    # Create vendor (admin)
PUT    /api/vendors/:vendorId          # Update vendor (admin)
GET    /api/vendors/:vendorId/prices   # Get vendor prices
POST   /api/vendors/:vendorId/prices   # Add price for vendor
PUT    /api/vendors/prices/:priceId    # Update vendor price
DELETE /api/vendors/prices/:priceId    # Delete vendor price
```

### Purchase Orders

```
GET    /api/purchase-orders                    # Get all purchase orders
GET    /api/purchase-orders/:orderId           # Get single purchase order
POST   /api/purchase-orders                    # Create purchase order
PUT    /api/purchase-orders/:orderId           # Update purchase order
PUT    /api/purchase-orders/:orderId/status    # Update purchase order status
DELETE /api/purchase-orders/:orderId           # Delete purchase order
```

## 3. Using Supabase Client in Frontend

### Initialize Client

```typescript
import { supabase } from "@/lib/supabase/client";

// Get current session
const session = await supabase.auth.getSession();

// Get current user
const {
  data: { user },
} = await supabase.auth.getUser();
```

### Query Data

```typescript
// Get products
const { data: products, error } = await supabase
  .from("products")
  .select("*, category:categories(*), images:product_images(*)")
  .eq("availability", true)
  .limit(10);

// Get user's cart
const { data: cart, error } = await supabase
  .from("carts")
  .select("*, items:cart_items(*)")
  .eq("user_id", userId)
  .single();
```

## 4. Business Logic Services

### Cart Service

```typescript
import * as cartService from "@/server/services/cart";

// Get or create cart
const cart = await cartService.getOrCreateCart(userId);

// Add to cart
const item = await cartService.addToCart(
  cartId,
  productId,
  variantId,
  quantity,
  unitPrice,
);

// Get cart summary
const summary = await cartService.getCartSummary(cartId);
// summary.subtotal
// summary.total
// summary.items
```

### Order Service

```typescript
import * as orderService from '@/server/services/order';

// Create order
const order = await orderService.createOrder({
  userId,
  items: [...],
  totalAmount: 500
});

// Update order status
const updated = await orderService.updateOrderStatus(orderId, 'paid');

// Get order statistics
const stats = await orderService.getOrderStats();
```

### Payment Service

```typescript
import * as paymentService from "@/server/services/payment";

// Initiate payment
const payment = await paymentService.initiatePayment({
  orderId,
  amount: 500,
});

// Confirm payment
const result = await paymentService.confirmPayment(paymentId, orderId);

// Fail payment
const failed = await paymentService.failPayment(paymentId, orderId);
```

### Vendor Service

```typescript
import * as vendorService from "@/server/services/vendor";

// Create vendor
const vendor = await vendorService.createVendor(
  "Vendor Name",
  "UP",
  "New Delhi",
);

// Create purchase order
const po = await vendorService.createPurchaseOrder(
  vendorId,
  productId,
  variantId,
  quantity,
  baseTotal,
  upliftPercent,
);
```

## 5. Validation Schemas (Zod)

All inputs are validated using Zod schemas:

```typescript
import { CreateProductSchema, AddToCartSchema } from "@/lib/validations";

// Validate product input
const result = CreateProductSchema.safeParse(productData);
if (!result.success) {
  console.error(result.error);
  return;
}
```

Available schemas:

- `CreateProductSchema` / `UpdateProductSchema`
- `CreateProductVariantSchema` / `UpdateProductVariantSchema`
- `CreateProductImageSchema`
- `CreateCategorySchema` / `UpdateCategorySchema`
- `CreateBannerSchema` / `UpdateBannerSchema`
- `AddToCartSchema` / `UpdateCartItemSchema`
- `CreateOrderSchema` / `UpdateOrderStatusSchema`
- `InitiatePaymentSchema` / `VerifyPaymentSchema`
- `CreateVendorSchema` / `UpdateVendorSchema`
- `CreatePurchaseOrderSchema` / `UpdatePurchaseOrderSchema`

## 6. RLS Policies Overview

### Public Access (No Authentication)

- View active products
- View categories
- View active banners
- View product variants and images

### User Access (Must be authenticated)

- View own cart and cart items
- Create/update/delete own cart items
- Create orders
- View own orders
- View own payments
- Create payments for own orders

### Admin Access (User with admin role)

- Manage all products, variants, images, categories, banners
- View all users
- View/update all orders and order items
- View/update all payments
- Manage vendors and vendor prices
- Manage purchase orders

## 7. Type Safety

All API responses are typed. Use the shared types:

```typescript
import type {
  GetProductsResponse,
  CartResponse,
  GetOrderResponse,
} from "@/shared/api-types";

const response = await fetch("/api/products");
const data: GetProductsResponse = await response.json();
```

## 8. Error Handling

All endpoints return consistent error responses:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

Example:

```typescript
const response = await fetch("/api/products");
const json = await response.json();

if (json.success) {
  console.log(json.data);
} else {
  console.error(json.error);
}
```

## 9. Important Notes

### Security

- **Never commit `.env.local`** - it contains sensitive credentials
- **Rotate your anon key** if it's exposed in version control
- **Use RLS policies** - they enforce data access rules at the database level
- **Service Key** should only be used on the server, never in frontend code

### Performance

- All tables have indexes for frequently queried columns
- Pagination is implemented for large datasets
- Use query parameters to filter data efficiently

### Testing the APIs

```bash
# Get products
curl http://localhost:3000/api/products

# Get cart (requires user_id)
curl http://localhost:3000/api/cart?user_id=<user-uuid>

# Create order (requires user_id and body)
curl -X POST http://localhost:3000/api/orders?user_id=<user-uuid> \
  -H "Content-Type: application/json" \
  -d '{"items": [...], "total_amount": 500}'
```

## 10. Troubleshooting

### "RLS policy not found"

- Apply the RLS policies from `database/rls-policies.sql`
- Ensure RLS is enabled on the table

### "User unauthorized"

- Check if the user is authenticated
- Verify the `auth.uid()` is not null in the RLS policy

### "Connection refused"

- Verify Supabase URL and keys are correct
- Ensure environment variables are loaded

### "Validation failed"

- Check request body matches the Zod schema
- Review error message for specific field

## Next Steps

1. Set up authentication (Supabase Auth)
2. Integrate with payment gateway (Razorpay, PhonePe, etc.)
3. Add email notifications for orders
4. Set up webhooks for payment confirmations
5. Create admin dashboard with analytics

## Support

For issues with Supabase, visit:

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
