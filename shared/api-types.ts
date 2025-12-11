import type {
  Banner,
  User,
  Category,
  Product,
  ProductImage,
  ProductVariant,
  Vendor,
  VendorPrice,
  PurchaseOrder,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Payment,
} from "../lib/supabase/types";

// ============ PRODUCT ENDPOINTS ============

export interface GetProductsResponse {
  products: (Product & {
    category: Category | null;
    images: ProductImage[];
    variants: ProductVariant[];
  })[];
  total: number;
}

export interface GetProductResponse {
  product: Product & {
    category: Category | null;
    images: ProductImage[];
    variants: ProductVariant[];
  };
}

export interface CreateProductRequest {
  product_id: string;
  title: string;
  category_id?: string;
  price?: number;
  mrp?: number;
  discount?: number;
  sku?: string;
  description?: string;
  brand?: string;
  pack_size?: string;
  features?: string;
  technical_content?: string;
  usage?: string;
  dosage?: string;
  crop_usage?: string;
  target_pest?: string;
  state_availability?: string;
  availability?: boolean;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface CreateProductResponse {
  product: Product;
}

// ============ PRODUCT VARIANT ENDPOINTS ============

export interface CreateProductVariantRequest {
  product_id: string;
  variant_type: "weight" | "liquid" | "other";
  sku_label: string;
  unit_price: number;
  is_default?: boolean;
}

export interface UpdateProductVariantRequest
  extends Partial<CreateProductVariantRequest> {}

export interface GetVariantsResponse {
  variants: ProductVariant[];
}

// ============ PRODUCT IMAGE ENDPOINTS ============

export interface CreateProductImageRequest {
  product_id: string;
  url: string;
  sort_order?: number;
}

export interface GetImagesResponse {
  images: ProductImage[];
}

// ============ CATEGORY ENDPOINTS ============

export interface GetCategoriesResponse {
  categories: Category[];
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  description?: string;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}

// ============ CART ENDPOINTS ============

export interface GetCartResponse {
  cart: Cart & {
    items: (CartItem & {
      product: Product | null;
      variant: ProductVariant | null;
    })[];
  };
}

export interface AddToCartRequest {
  product_id: string;
  variant_id: string;
  quantity: number;
  boxes?: number;
  unit_price?: number;
}

export interface UpdateCartItemRequest {
  quantity?: number;
  boxes?: number;
  unit_price?: number;
}

export interface CartResponse {
  cart: Cart & {
    items: (CartItem & {
      product: Product | null;
      variant: ProductVariant | null;
    })[];
  };
}

// ============ ORDER ENDPOINTS ============

export interface CreateOrderRequest {
  items: {
    product_id: string;
    variant_id: string;
    quantity: number;
    boxes?: number;
    unit_price: number;
    total_price: number;
  }[];
  total_amount: number;
}

export interface GetOrderResponse {
  order: Order & {
    items: (OrderItem & {
      product: Product | null;
      variant: ProductVariant | null;
    })[];
    payment: Payment | null;
  };
}

export interface GetOrdersResponse {
  orders: (Order & {
    items: (OrderItem & {
      product: Product | null;
      variant: ProductVariant | null;
    })[];
    payment: Payment | null;
  })[];
}

export interface UpdateOrderStatusRequest {
  status: "pending" | "paid" | "failed" | "cancelled" | "completed";
}

// ============ PAYMENT ENDPOINTS ============

export interface InitiatePaymentRequest {
  order_id: string;
  amount: number;
}

export interface InitiatePaymentResponse {
  payment: Payment;
  upi_url?: string;
  qr_code?: string;
}

export interface VerifyPaymentRequest {
  payment_id: string;
  transaction_id?: string;
}

export interface VerifyPaymentResponse {
  payment: Payment;
  order: Order;
}

// ============ VENDOR ENDPOINTS ============

export interface GetVendorsResponse {
  vendors: (Vendor & {
    prices: VendorPrice[];
  })[];
}

export interface GetVendorResponse {
  vendor: Vendor & {
    prices: VendorPrice[];
  };
}

export interface CreateVendorRequest {
  name: string;
  state: "UP" | "Telangana";
  city?: string;
  upi_qr_url?: string;
  bank_details?: Record<string, unknown>;
}

export interface UpdateVendorRequest extends Partial<CreateVendorRequest> {}

export interface CreateVendorPriceRequest {
  vendor_id: string;
  product_id: string;
  variant_id: string;
  base_price: number;
}

export interface UpdateVendorPriceRequest
  extends Partial<CreateVendorPriceRequest> {}

// ============ PURCHASE ORDER ENDPOINTS ============

export interface GetPurchaseOrdersResponse {
  purchase_orders: (PurchaseOrder & {
    vendor: Vendor | null;
    product: Product | null;
    variant: ProductVariant | null;
  })[];
}

export interface GetPurchaseOrderResponse {
  purchase_order: PurchaseOrder & {
    vendor: Vendor | null;
    product: Product | null;
    variant: ProductVariant | null;
  };
}

export interface CreatePurchaseOrderRequest {
  vendor_id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  base_total: number;
  uplift_percent?: number;
}

export interface UpdatePurchaseOrderRequest
  extends Partial<CreatePurchaseOrderRequest> {}

export interface UpdatePurchaseOrderStatusRequest {
  status: "draft" | "sent" | "accepted" | "rejected";
}

// ============ BANNER ENDPOINTS ============

export interface GetBannersResponse {
  banners: Banner[];
}

export interface CreateBannerRequest {
  title?: string;
  subtitle?: string;
  cta_text?: string;
  cta_link?: string;
  image_url?: string;
  sort_order?: number;
  active?: boolean;
  starts_at?: string;
  ends_at?: string;
}

export interface UpdateBannerRequest extends Partial<CreateBannerRequest> {}

// ============ RESPONSE WRAPPER ============

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
