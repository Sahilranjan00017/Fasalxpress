import { supabaseAdmin } from "../../lib/supabase/server";
import type { Order, OrderItem } from "../../lib/supabase/types";

export interface CreateOrderData {
  userId: string;
  items: {
    product_id: string;
    variant_id: string;
    quantity: number;
    boxes?: number;
    unit_price: number;
    total_price: number;
  }[];
  totalAmount: number;
}

export async function createOrder(data: CreateOrderData): Promise<Order> {
  const { userId, items, totalAmount } = data;

  // Create order
  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      user_id: userId,
      total_amount: totalAmount,
      status: "pending",
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // Create order items
  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    variant_id: item.variant_id,
    quantity: item.quantity,
    boxes: item.boxes || 0,
    unit_price: item.unit_price,
    total_price: item.total_price,
  }));

  const { error: itemsError } = await supabaseAdmin
    .from("order_items")
    .insert(orderItems);

  if (itemsError) throw itemsError;

  return order;
}

export async function updateOrderStatus(
  orderId: string,
  status: "pending" | "paid" | "failed" | "cancelled" | "completed",
): Promise<Order> {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getOrderWithItems(
  orderId: string,
): Promise<Order & { items: OrderItem[] }> {
  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (orderError) throw orderError;

  const { data: items, error: itemsError } = await supabaseAdmin
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  if (itemsError) throw itemsError;

  return {
    ...order,
    items: items || [],
  };
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getOrderStats(): Promise<{
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Record<string, number>;
}> {
  // Get all orders with totals
  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select("total_amount, status");

  if (error) throw error;

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce(
    (sum, order) => sum + (order.total_amount || 0),
    0,
  );
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const ordersByStatus = orders.reduce(
    (acc, order) => {
      const status = order.status || "unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return {
    totalOrders,
    totalRevenue,
    averageOrderValue,
    ordersByStatus,
  };
}

export async function applyDiscount(
  orderId: string,
  discountAmount: number,
): Promise<Order> {
  const { data: order, error: fetchError } = await supabaseAdmin
    .from("orders")
    .select("total_amount")
    .eq("id", orderId)
    .single();

  if (fetchError) throw fetchError;

  const newTotal = Math.max(0, (order.total_amount || 0) - discountAmount);

  const { data, error } = await supabaseAdmin
    .from("orders")
    .update({ total_amount: newTotal })
    .eq("id", orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getOrderByPaymentRef(
  paymentRef: string,
): Promise<Order | null> {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("payment_ref", paymentRef)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  if (error && error.code === "PGRST116") return null;

  return data;
}

export async function updateOrderPaymentRef(
  orderId: string,
  paymentRef: string,
): Promise<Order> {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .update({ payment_ref: paymentRef })
    .eq("id", orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
