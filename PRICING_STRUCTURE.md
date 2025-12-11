# Pricing Structure - Complete Guide

## Overview
This document explains the consistent pricing structure implemented across the entire AGROBUILD e-commerce platform.

## Database Schema

### Products Table
- **`price`**: The selling price (what customers pay)
- **`mrp`**: Maximum Retail Price (original/strike-through price)
- **`discount`**: Optional discount percentage

### Product SKUs Table
- **`unit_price`**: Selling price for the specific SKU variant
- **`mrp`**: MRP for the specific SKU variant
- **`box_price`**: Calculated price for a box (unit_price × pieces_per_box)
- **`box_mrp`**: Calculated MRP for a box (mrp × pieces_per_box)

## Pricing Logic

### Standard Pricing Display
```typescript
const price = product.price || 0;  // Selling price
const mrp = product.mrp || price;  // Original price (fallback to price)
const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
```

### Display Format
- **Selling Price**: Bold, large font - `₹{price}`
- **MRP**: Strike-through, smaller font - `₹{mrp}` (only if mrp > price)
- **Discount Badge**: `{discount}% OFF` (only if discount > 0)
- **Savings**: `Save ₹{mrp - price}` (only if there's a discount)

## Implementation Across Pages

### 1. Landing Page (Index.tsx)
- **Location**: Featured Products Section
- **Fields Used**: `product.price`, `product.mrp`
- **Display**: Card with price, MRP strike-through, discount badge, and savings amount

### 2. Products Listing (Products.tsx)
- **Location**: Product Grid
- **Fields Used**: `product.price`, `product.mrp`
- **SKU Support**: If SKUs exist, uses lowest SKU price
- **Display**: Card with price, MRP, discount badge

### 3. Product Detail (ProductDetail.tsx)
- **Location**: Main product page
- **Fields Used**: `product.price`, `product.mrp`
- **Display**: Large price, MRP strike-through, discount percentage, savings amount
- **Cart Integration**: Uses `price` field when adding to cart

### 4. Admin Products (AdminProducts.tsx)
- **Location**: Admin product list
- **Fields Used**: `product.price`, `product.mrp`
- **Display**: Price (primary) and MRP (strike-through if different)

### 5. Cart & Checkout
- **Context**: `CartContext.tsx`
- **Field Used**: `price` field for calculations
- **Display**: Unit price and total price calculations

## Server-Side Normalization

### Normalizer Function (`server/lib/normalizers.ts`)
```typescript
// Price normalization - use price as selling price
const price = raw.price ?? 0;

// MRP normalization - use mrp as original price, fallback to price
const mrp = raw.mrp ?? price;
```

### API Responses
All product APIs return normalized data with:
- `price`: Selling price
- `mrp`: Original/MRP price
- Discount calculated on frontend based on these values

## Best Practices

### When Creating Products
1. **Always set `price`**: This is the selling price customers will pay
2. **Set `mrp` if higher**: Only set MRP if it's different from price
3. **Let discount calculate automatically**: Frontend calculates discount percentage

### When Displaying Prices
1. **Always show price prominently**: This is what customers pay
2. **Show MRP only if different**: Use strike-through styling
3. **Show discount badge if applicable**: Attracts customer attention
4. **Show savings amount**: Helps customers understand value

### When Working with SKUs
1. **Use `unit_price` for individual unit pricing**
2. **Calculate box prices automatically**: `box_price = unit_price × pieces_per_box`
3. **Display both unit and box prices** when relevant

## Common Issues & Solutions

### Issue: Different prices showing on different pages
**Solution**: Check that all pages use `product.price` (not `price_inr`, `websitePrice`, etc.)

### Issue: MRP not displaying
**Solution**: Ensure `product.mrp` is set in database and is greater than `product.price`

### Issue: Discount percentage incorrect
**Solution**: Verify calculation: `((mrp - price) / mrp) * 100`

### Issue: Cart shows wrong price
**Solution**: Check `CartContext` uses `price` field from product data

## Testing Checklist

- [ ] Landing page shows consistent prices
- [ ] Products listing shows correct prices
- [ ] Product detail page shows price with MRP and discount
- [ ] Admin products page shows both price and MRP
- [ ] Cart uses correct prices
- [ ] Checkout calculates totals correctly
- [ ] All prices formatted consistently with ₹ symbol
- [ ] All prices use Indian number format (toLocaleString("en-IN"))

## Future Enhancements

1. **Dynamic Pricing**: Support for user-specific or region-specific pricing
2. **Bulk Discounts**: Quantity-based pricing tiers
3. **Time-based Offers**: Flash sales, seasonal discounts
4. **Vendor Pricing**: Multiple vendor prices for price comparison
5. **Currency Support**: Multi-currency display (currently INR only)

## Contact

For questions or issues with pricing implementation, refer to:
- Database schema: `/database/002_create_users_categories_products.sql`
- API types: `/shared/api-types.ts`
- Product normalizer: `/server/lib/normalizers.ts`
