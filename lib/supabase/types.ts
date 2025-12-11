// Generated Supabase types from database schema

export interface Banner {
  id: string;
  title: string | null;
  subtitle: string | null;
  cta_text: string | null;
  cta_link: string | null;
  image_url: string | null;
  sort_order: number | null;
  active: boolean | null;
  starts_at: string | null;
  ends_at: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: "admin" | "intern" | "user" | null;
  password_hash: string | null;
  created_at: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string | null;
}

export interface Product {
  id: string;
  product_id: string;
  title: string;
  category_id: string | null;
  price: number | null;
  mrp: number | null;
  discount: number | null;
  sku: string | null;
  description: string | null;
  internal_order_url: string | null;
  brand: string | null;
  pack_size: string | null;
  features: string | null;
  technical_content: string | null;
  usage: string | null;
  dosage: string | null;
  crop_usage: string | null;
  target_pest: string | null;
  state_availability: string | null;
  availability: boolean | null;
  created_at: string | null;
}

export interface ProductImage {
  id: string;
  product_id: string | null;
  url: string;
  sort_order: number | null;
}

export interface ProductVariant {
  id: string;
  product_id: string | null;
  variant_type: "weight" | "liquid" | "other" | null;
  sku_label: string;
  unit_price: number;
  is_default: boolean | null;
  created_at: string | null;
}

export interface Vendor {
  id: string;
  name: string;
  state: "UP" | "Telangana" | null;
  city: string | null;
  upi_qr_url: string | null;
  bank_details: Record<string, unknown> | null;
  created_at: string | null;
}

export interface VendorPrice {
  id: string;
  vendor_id: string | null;
  product_id: string | null;
  variant_id: string | null;
  base_price: number;
  updated_at: string | null;
}

export interface PurchaseOrder {
  id: string;
  vendor_id: string | null;
  product_id: string | null;
  variant_id: string | null;
  quantity: number | null;
  base_total: number | null;
  uplift_percent: number | null;
  final_total: number | null;
  status: "draft" | "sent" | "accepted" | "rejected" | null;
  created_at: string | null;
}

export interface Cart {
  id: string;
  user_id: string | null;
  created_at: string | null;
}

export interface CartItem {
  id: string;
  cart_id: string | null;
  product_id: string | null;
  variant_id: string | null;
  quantity: number | null;
  boxes: number | null;
  unit_price: number | null;
  total_price: number | null;
  created_at: string | null;
}

export interface Order {
  id: string;
  user_id: string | null;
  total_amount: number;
  status: "pending" | "paid" | "failed" | "cancelled" | "completed" | null;
  payment_ref: string | null;
  created_at: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string | null;
  product_id: string | null;
  variant_id: string | null;
  quantity: number | null;
  boxes: number | null;
  unit_price: number | null;
  total_price: number | null;
  created_at: string | null;
}

export interface Payment {
  id: string;
  order_id: string | null;
  amount: number;
  upi_url: string | null;
  qr_svg: string | null;
  status: "pending" | "success" | "failed";
  created_at: string | null;
  updated_at: string | null;
}

export interface ScraperLog {
  id: string;
  url: string | null;
  status: string | null;
  message: string | null;
  created_at: string | null;
}

export interface SyncLog {
  id: string;
  event_type: string | null;
  reference_id: string | null;
  triggered_by: string | null;
  created_at: string | null;
}

// Union type for all tables
export type Table =
  | Banner
  | User
  | Category
  | Product
  | ProductImage
  | ProductVariant
  | Vendor
  | VendorPrice
  | PurchaseOrder
  | Cart
  | CartItem
  | Order
  | OrderItem
  | Payment
  | ScraperLog
  | SyncLog;
