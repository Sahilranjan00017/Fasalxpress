import { z } from "zod";

// ============ PRODUCT VALIDATIONS ============

export const CreateProductSchema = z.object({
  product_id: z.string().min(1, "Product ID is required"),
  title: z.string().min(1, "Title is required").max(255),
  category_id: z.string().uuid().optional(),
  price: z.number().positive().optional(),
  mrp: z.number().positive().optional(),
  discount: z.number().min(0).max(100).optional(),
  sku: z.string().optional(),
  description: z.string().optional(),
  brand: z.string().optional(),
  pack_size: z.string().optional(),
  features: z.string().optional(),
  technical_content: z.string().optional(),
  usage: z.string().optional(),
  dosage: z.string().optional(),
  crop_usage: z.string().optional(),
  target_pest: z.string().optional(),
  state_availability: z.string().optional(),
  availability: z.boolean().optional(),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;

// ============ PRODUCT VARIANT VALIDATIONS ============

export const CreateProductVariantSchema = z.object({
  product_id: z.string().uuid("Product ID must be a valid UUID"),
  variant_type: z.enum(["weight", "liquid", "other"]),
  sku_label: z.string().min(1, "SKU label is required"),
  unit_price: z.number().positive("Unit price must be positive"),
  is_default: z.boolean().optional(),
});

export const UpdateProductVariantSchema = CreateProductVariantSchema.partial();

export type CreateProductVariantInput = z.infer<
  typeof CreateProductVariantSchema
>;
export type UpdateProductVariantInput = z.infer<
  typeof UpdateProductVariantSchema
>;

// ============ PRODUCT IMAGE VALIDATIONS ============

export const CreateProductImageSchema = z.object({
  product_id: z.string().uuid("Product ID must be a valid UUID"),
  url: z.string().url("URL must be a valid URL"),
  sort_order: z.number().int().optional(),
});

export type CreateProductImageInput = z.infer<typeof CreateProductImageSchema>;

// ============ CATEGORY VALIDATIONS ============

export const CreateCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  slug: z.string().min(1, "Slug is required").max(255),
  description: z.string().optional(),
});

export const UpdateCategorySchema = CreateCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;

// ============ CART VALIDATIONS ============

export const AddToCartSchema = z.object({
  product_id: z.string().uuid("Product ID must be a valid UUID"),
  variant_id: z.string().uuid("Variant ID must be a valid UUID"),
  quantity: z.number().int().positive("Quantity must be positive"),
  boxes: z.number().int().min(0).optional(),
  unit_price: z.number().positive().optional(),
});

export const UpdateCartItemSchema = z.object({
  quantity: z.number().int().positive().optional(),
  boxes: z.number().int().min(0).optional(),
  unit_price: z.number().positive().optional(),
});

export type AddToCartInput = z.infer<typeof AddToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof UpdateCartItemSchema>;

// ============ ORDER VALIDATIONS ============

export const CreateOrderSchema = z.object({
  items: z
    .array(
      z.object({
        product_id: z.string().uuid(),
        variant_id: z.string().uuid(),
        quantity: z.number().int().positive(),
        boxes: z.number().int().min(0).optional(),
        unit_price: z.number().positive(),
        total_price: z.number().positive(),
      }),
    )
    .min(1, "At least one item is required"),
  total_amount: z.number().positive("Total amount must be positive"),
});

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(["pending", "paid", "failed", "cancelled", "completed"]),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;

// ============ PAYMENT VALIDATIONS ============

export const InitiatePaymentSchema = z.object({
  order_id: z.string().uuid("Order ID must be a valid UUID"),
  amount: z.number().positive("Amount must be positive"),
});

export const VerifyPaymentSchema = z.object({
  payment_id: z.string().uuid("Payment ID must be a valid UUID"),
  transaction_id: z.string().optional(),
});

export type InitiatePaymentInput = z.infer<typeof InitiatePaymentSchema>;
export type VerifyPaymentInput = z.infer<typeof VerifyPaymentSchema>;

// ============ VENDOR VALIDATIONS ============

export const CreateVendorSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  state: z.enum(["UP", "Telangana"]),
  city: z.string().optional(),
  upi_qr_url: z.string().url().optional(),
  bank_details: z.record(z.unknown()).optional(),
});

export const UpdateVendorSchema = CreateVendorSchema.partial();

export const CreateVendorPriceSchema = z.object({
  vendor_id: z.string().uuid("Vendor ID must be a valid UUID"),
  product_id: z.string().uuid("Product ID must be a valid UUID"),
  variant_id: z.string().uuid("Variant ID must be a valid UUID"),
  base_price: z.number().positive("Base price must be positive"),
});

export const UpdateVendorPriceSchema = CreateVendorPriceSchema.partial();

export type CreateVendorInput = z.infer<typeof CreateVendorSchema>;
export type UpdateVendorInput = z.infer<typeof UpdateVendorSchema>;
export type CreateVendorPriceInput = z.infer<typeof CreateVendorPriceSchema>;
export type UpdateVendorPriceInput = z.infer<typeof UpdateVendorPriceSchema>;

// ============ PURCHASE ORDER VALIDATIONS ============

export const CreatePurchaseOrderSchema = z.object({
  vendor_id: z.string().uuid("Vendor ID must be a valid UUID"),
  product_id: z.string().uuid("Product ID must be a valid UUID"),
  variant_id: z.string().uuid("Variant ID must be a valid UUID"),
  quantity: z.number().int().positive("Quantity must be positive"),
  base_total: z.number().positive("Base total must be positive"),
  uplift_percent: z.number().min(0).max(100).optional(),
});

export const UpdatePurchaseOrderSchema = CreatePurchaseOrderSchema.partial();

export const UpdatePurchaseOrderStatusSchema = z.object({
  status: z.enum(["draft", "sent", "accepted", "rejected"]),
});

export type CreatePurchaseOrderInput = z.infer<
  typeof CreatePurchaseOrderSchema
>;
export type UpdatePurchaseOrderInput = z.infer<
  typeof UpdatePurchaseOrderSchema
>;
export type UpdatePurchaseOrderStatusInput = z.infer<
  typeof UpdatePurchaseOrderStatusSchema
>;

// ============ BANNER VALIDATIONS ============

export const CreateBannerSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  cta_text: z.string().optional(),
  cta_link: z.string().url().optional(),
  image_url: z.string().url().optional(),
  sort_order: z.number().int().optional(),
  active: z.boolean().optional(),
  starts_at: z.string().datetime().optional(),
  ends_at: z.string().datetime().optional(),
});

export const UpdateBannerSchema = CreateBannerSchema.partial();

export type CreateBannerInput = z.infer<typeof CreateBannerSchema>;
export type UpdateBannerInput = z.infer<typeof UpdateBannerSchema>;

// ============ QUERY VALIDATIONS ============

export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
});

export type PaginationInput = z.infer<typeof PaginationSchema>;
