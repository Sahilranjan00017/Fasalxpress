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
} from "./types";

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || "";
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

// Warn if keys not configured, but don't throw error during setup
const isConfigured = Boolean(
  supabaseUrl && (supabaseServiceKey || supabaseAnonKey),
);
if (!isConfigured && typeof window === "undefined") {
  console.warn(
    "Supabase configuration incomplete. Set SUPABASE_URL and either SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY",
  );
}

// Server client with service key (admin access)
// Falls back to anon key if service key not available
const clientKey = supabaseServiceKey || supabaseAnonKey;
export const supabaseAdmin = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  clientKey || "placeholder",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

// Server client with user token (RLS-aware)
export function createUserSupabaseClient(authToken: string) {
  return createClient(supabaseUrl, supabaseAnonKey || "", {
    global: {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Products queries
export async function getProducts(limit = 50, offset = 0) {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select(
      "*, category:categories(*), images:product_images(*), variants:product_variants(*)",
    )
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data;
}

export async function getProductById(id: string) {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select(
      "*, category:categories(*), images:product_images(*), variants:product_variants(*)",
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getProductByProductId(productId: string) {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select(
      "*, category:categories(*), images:product_images(*), variants:product_variants(*)",
    )
    .eq("product_id", productId)
    .single();

  if (error) throw error;
  return data;
}

// Categories queries
export async function getCategories() {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("*")
    .order("name");

  if (error) throw error;
  return data;
}

export async function getCategoryById(id: string) {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// Banners queries
export async function getActiveBanners() {
  const { data, error } = await supabaseAdmin
    .from("banners")
    .select("*")
    .eq("active", true)
    .order("sort_order");

  if (error) throw error;
  return data;
}

// Vendors queries
export async function getVendors() {
  const { data, error } = await supabaseAdmin
    .from("vendors")
    .select("*, prices:vendor_prices(*)")
    .order("name");

  if (error) throw error;
  return data;
}

export async function getVendorById(id: string) {
  const { data, error } = await supabaseAdmin
    .from("vendors")
    .select("*, prices:vendor_prices(*)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// Cart queries
export async function getCartByUserId(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("carts")
    .select("*, items:cart_items(*)")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data || null;
}

export async function getCartItems(cartId: string) {
  const { data, error } = await supabaseAdmin
    .from("cart_items")
    .select("*, product:products(*), variant:product_variants(*)")
    .eq("cart_id", cartId);

  if (error) throw error;
  return data;
}

// Order queries
export async function getOrderById(id: string) {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*, items:order_items(*), payment:payments(*)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getUserOrders(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*, items:order_items(*), payment:payments(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// Payment queries
export async function getPaymentByOrderId(orderId: string) {
  const { data, error } = await supabaseAdmin
    .from("payments")
    .select("*")
    .eq("order_id", orderId)
    .single();

  if (error && error.code !== "PGRST116") return null;
  if (error) throw error;
  return data;
}

// Purchase orders queries
export async function getPurchaseOrders() {
  const { data, error } = await supabaseAdmin
    .from("purchase_orders")
    .select(
      "*, vendor:vendors(*), product:products(*), variant:product_variants(*)",
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getPurchaseOrderById(id: string) {
  const { data, error } = await supabaseAdmin
    .from("purchase_orders")
    .select(
      "*, vendor:vendors(*), product:products(*), variant:product_variants(*)",
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// User queries
export async function getUserById(id: string) {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getUserByEmail(email: string) {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error && error.code !== "PGRST116") return null;
  if (error) throw error;
  return data;
}
