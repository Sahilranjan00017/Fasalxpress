import createSupabaseServer from "../supabase/server";
import { getCartWithItems } from "./cart";

export async function createOrderFromCart(userId: string) {
  const supabase = createSupabaseServer();
  const { cart, items } = await getCartWithItems(userId);

  if (!items.length) {
    throw new Error("Cart is empty");
  }

  const totalAmount = items.reduce((acc, item) => acc + (item.total_price ?? 0), 0);

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({ user_id: userId, total_amount: totalAmount, status: "pending" })
    .select("*")
    .single();

  if (orderErr) throw orderErr;

  const orderItemsPayload = items.map((item: any) => ({
    order_id: order.id,
    product_id: item.product_id,
    variant_id: item.variant_id,
    quantity: item.quantity ?? 1,
    boxes: item.boxes ?? 0,
    unit_price: item.unit_price ?? 0,
    total_price: item.total_price ?? 0,
  }));

  const { error: itemsErr } = await supabase.from("order_items").insert(orderItemsPayload);
  if (itemsErr) throw itemsErr;

  const { error: clearErr } = await supabase.from("cart_items").delete().eq("cart_id", cart.id);
  if (clearErr) throw clearErr;

  return order;
}

export async function getOrder(id: string, userId?: string) {
  const supabase = createSupabaseServer();
  let query = supabase
    .from("orders")
    .select(
      `
      *,
      items:order_items(
        *,
        product:products(*),
        variant:product_variants(*)
      )
    `
    )
    .eq("id", id);

  if (userId) query = query.eq("user_id", userId);

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data;
}
