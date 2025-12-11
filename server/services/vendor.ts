import { supabaseAdmin } from "../../lib/supabase/server";
import type {
  Vendor,
  VendorPrice,
  PurchaseOrder,
} from "../../lib/supabase/types";

export async function createVendor(
  name: string,
  state: "UP" | "Telangana",
  city?: string,
  upiQrUrl?: string,
  bankDetails?: Record<string, unknown>,
): Promise<Vendor> {
  const { data, error } = await supabaseAdmin
    .from("vendors")
    .insert({
      name,
      state,
      city,
      upi_qr_url: upiQrUrl,
      bank_details: bankDetails,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateVendor(
  vendorId: string,
  updates: Partial<{
    name: string;
    state: "UP" | "Telangana";
    city: string;
    upi_qr_url: string;
    bank_details: Record<string, unknown>;
  }>,
): Promise<Vendor> {
  const { data, error } = await supabaseAdmin
    .from("vendors")
    .update(updates)
    .eq("id", vendorId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getVendors(): Promise<Vendor[]> {
  const { data, error } = await supabaseAdmin
    .from("vendors")
    .select("*")
    .order("name");

  if (error) throw error;
  return data;
}

export async function getVendorById(vendorId: string): Promise<Vendor> {
  const { data, error } = await supabaseAdmin
    .from("vendors")
    .select("*")
    .eq("id", vendorId)
    .single();

  if (error) throw error;
  return data;
}

export async function createVendorPrice(
  vendorId: string,
  productId: string,
  variantId: string,
  basePrice: number,
): Promise<VendorPrice> {
  const { data, error } = await supabaseAdmin
    .from("vendor_prices")
    .insert({
      vendor_id: vendorId,
      product_id: productId,
      variant_id: variantId,
      base_price: basePrice,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateVendorPrice(
  vendorPriceId: string,
  basePrice: number,
): Promise<VendorPrice> {
  const { data, error } = await supabaseAdmin
    .from("vendor_prices")
    .update({
      base_price: basePrice,
      updated_at: new Date().toISOString(),
    })
    .eq("id", vendorPriceId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getVendorPrices(
  vendorId: string,
): Promise<VendorPrice[]> {
  const { data, error } = await supabaseAdmin
    .from("vendor_prices")
    .select("*")
    .eq("vendor_id", vendorId);

  if (error) throw error;
  return data;
}

export async function getVendorPriceForProduct(
  vendorId: string,
  productId: string,
  variantId: string,
): Promise<VendorPrice | null> {
  const { data, error } = await supabaseAdmin
    .from("vendor_prices")
    .select("*")
    .eq("vendor_id", vendorId)
    .eq("product_id", productId)
    .eq("variant_id", variantId)
    .single();

  if (error && error.code === "PGRST116") return null;
  if (error) throw error;
  return data;
}

export async function deleteVendorPrice(vendorPriceId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("vendor_prices")
    .delete()
    .eq("id", vendorPriceId);

  if (error) throw error;
}

export async function createPurchaseOrder(
  vendorId: string,
  productId: string,
  variantId: string,
  quantity: number,
  baseTotal: number,
  upliftPercent: number = 5,
): Promise<PurchaseOrder> {
  const finalTotal = baseTotal * (1 + upliftPercent / 100);

  const { data, error } = await supabaseAdmin
    .from("purchase_orders")
    .insert({
      vendor_id: vendorId,
      product_id: productId,
      variant_id: variantId,
      quantity,
      base_total: baseTotal,
      uplift_percent: upliftPercent,
      final_total: finalTotal,
      status: "draft",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePurchaseOrderStatus(
  purchaseOrderId: string,
  status: "draft" | "sent" | "accepted" | "rejected",
): Promise<PurchaseOrder> {
  const { data, error } = await supabaseAdmin
    .from("purchase_orders")
    .update({ status })
    .eq("id", purchaseOrderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getPurchaseOrder(
  purchaseOrderId: string,
): Promise<PurchaseOrder> {
  const { data, error } = await supabaseAdmin
    .from("purchase_orders")
    .select("*")
    .eq("id", purchaseOrderId)
    .single();

  if (error) throw error;
  return data;
}

export async function getPurchaseOrders(
  vendorId?: string,
  status?: string,
): Promise<PurchaseOrder[]> {
  let query = supabaseAdmin.from("purchase_orders").select("*");

  if (vendorId) {
    query = query.eq("vendor_id", vendorId);
  }
  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function calculatePurchaseOrderTotal(
  quantity: number,
  unitPrice: number,
  upliftPercent: number = 5,
): Promise<{ baseTotal: number; finalTotal: number }> {
  const baseTotal = quantity * unitPrice;
  const finalTotal = baseTotal * (1 + upliftPercent / 100);

  return { baseTotal, finalTotal };
}
