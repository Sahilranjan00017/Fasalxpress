import { createClient } from "@supabase/supabase-js";
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
  ScraperLog,
  SyncLog,
} from "./types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL or Anon Key not configured");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseClient = supabase; // alias for consistency

// Database types for queries
export interface Database {
  public: {
    Tables: {
      banners: { Row: Banner; Insert: Omit<Banner, "id"> };
      users: { Row: User; Insert: Omit<User, "id"> };
      categories: { Row: Category; Insert: Omit<Category, "id"> };
      products: { Row: Product; Insert: Omit<Product, "id"> };
      product_images: { Row: ProductImage; Insert: Omit<ProductImage, "id"> };
      product_variants: {
        Row: ProductVariant;
        Insert: Omit<ProductVariant, "id">;
      };
      vendors: { Row: Vendor; Insert: Omit<Vendor, "id"> };
      vendor_prices: { Row: VendorPrice; Insert: Omit<VendorPrice, "id"> };
      purchase_orders: {
        Row: PurchaseOrder;
        Insert: Omit<PurchaseOrder, "id">;
      };
      carts: { Row: Cart; Insert: Omit<Cart, "id"> };
      cart_items: { Row: CartItem; Insert: Omit<CartItem, "id"> };
      orders: { Row: Order; Insert: Omit<Order, "id"> };
      order_items: { Row: OrderItem; Insert: Omit<OrderItem, "id"> };
      payments: { Row: Payment; Insert: Omit<Payment, "id"> };
      scraper_logs: { Row: ScraperLog; Insert: Omit<ScraperLog, "id"> };
      sync_logs: { Row: SyncLog; Insert: Omit<SyncLog, "id"> };
    };
  };
}

// Helper to get current session
export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

// Helper to get current user
export async function getCurrentUser() {
  const session = await getCurrentSession();
  return session?.user || null;
}
