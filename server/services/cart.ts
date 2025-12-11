import { supabaseAdmin } from "../../lib/supabase/server";
import type { Cart, CartItem } from "../../lib/supabase/types";

export interface CartSummary {
  cart: Cart;
  items: (CartItem & { product_name?: string; product_price?: number })[];
  subtotal: number;
  total: number;
  item_count: number;
}

export async function getOrCreateCart(userId: string): Promise<Cart> {
  // Try to get existing cart
  const { data: existingCart } = await supabaseAdmin
    .from("carts")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (existingCart) {
    return existingCart;
  }

  // Create new cart
  const { data: newCart, error } = await supabaseAdmin
    .from("carts")
    .insert({ user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return newCart;
}

export async function addToCart(
  cartId: string,
  productId: string,
  variantId: string,
  quantity: number,
  unitPrice: number,
  boxes: number = 0,
): Promise<CartItem> {
  // Check if item already exists
  const { data: existingItem } = await supabaseAdmin
    .from("cart_items")
    .select("*")
    .eq("cart_id", cartId)
    .eq("product_id", productId)
    .eq("variant_id", variantId)
    .single();

  const totalPrice = quantity * unitPrice;

  if (existingItem) {
    // Update quantity
    const newQuantity = existingItem.quantity! + quantity;
    const newTotalPrice = newQuantity * unitPrice;

    const { data, error } = await supabaseAdmin
      .from("cart_items")
      .update({
        quantity: newQuantity,
        total_price: newTotalPrice,
        boxes: (existingItem.boxes || 0) + boxes,
        unit_price: unitPrice,
      })
      .eq("id", existingItem.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Insert new item
  const { data, error } = await supabaseAdmin
    .from("cart_items")
    .insert({
      cart_id: cartId,
      product_id: productId,
      variant_id: variantId,
      quantity,
      boxes,
      unit_price: unitPrice,
      total_price: totalPrice,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCartItem(
  itemId: string,
  quantity?: number,
  unitPrice?: number,
  boxes?: number,
): Promise<CartItem> {
  const updates: Record<string, unknown> = {};

  if (quantity !== undefined) {
    updates.quantity = quantity;
  }
  if (unitPrice !== undefined) {
    updates.unit_price = unitPrice;
  }
  if (boxes !== undefined) {
    updates.boxes = boxes;
  }

  // Recalculate total_price
  if (quantity !== undefined || unitPrice !== undefined) {
    const { data: currentItem } = await supabaseAdmin
      .from("cart_items")
      .select("quantity, unit_price")
      .eq("id", itemId)
      .single();

    if (currentItem) {
      const finalQuantity = quantity ?? currentItem.quantity;
      const finalPrice = unitPrice ?? currentItem.unit_price;
      updates.total_price = finalQuantity * finalPrice;
    }
  }

  const { data, error } = await supabaseAdmin
    .from("cart_items")
    .update(updates)
    .eq("id", itemId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeCartItem(itemId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("cart_items")
    .delete()
    .eq("id", itemId);

  if (error) throw error;
}

export async function clearCart(cartId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("cart_items")
    .delete()
    .eq("cart_id", cartId);

  if (error) throw error;
}

export async function getCartSummary(cartId: string): Promise<CartSummary> {
  const { data: cart, error: cartError } = await supabaseAdmin
    .from("carts")
    .select("*")
    .eq("id", cartId)
    .single();

  if (cartError) throw cartError;

  const { data: items, error: itemsError } = await supabaseAdmin
    .from("cart_items")
    .select(
      "*, product:products(title, price), variant:product_variants(unit_price)",
    )
    .eq("cart_id", cartId);

  if (itemsError) throw itemsError;

  const enrichedItems = items.map((item) => ({
    ...item,
    product_name: (item.product as any)?.title,
    product_price: item.unit_price,
  }));

  const subtotal = items.reduce(
    (sum, item) => sum + (item.total_price || 0),
    0,
  );
  const itemCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return {
    cart,
    items: enrichedItems,
    subtotal,
    total: subtotal,
    item_count: itemCount,
  };
}

export async function calculateCartTotals(
  items: CartItem[],
): Promise<{ subtotal: number; tax: number; total: number }> {
  const subtotal = items.reduce(
    (sum, item) => sum + (item.total_price || 0),
    0,
  );
  const tax = 0; // Implement tax calculation if needed
  const total = subtotal + tax;

  return { subtotal, tax, total };
}
