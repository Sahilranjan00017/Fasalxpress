import { supabaseAdmin } from "../../lib/supabase/server";
import type { Payment, Order } from "../../lib/supabase/types";

export interface InitiatePaymentData {
  orderId: string;
  amount: number;
  upiId?: string;
}

export interface PaymentDetails {
  payment: Payment;
  order: Order;
}

export async function initiatePayment(
  data: InitiatePaymentData,
): Promise<Payment> {
  const { orderId, amount } = data;

  // Generate UPI string (this is a template - integrate with actual payment gateway)
  const upiString = generateUPIString(amount);

  // Create payment record
  const { data: payment, error } = await supabaseAdmin
    .from("payments")
    .insert({
      order_id: orderId,
      amount,
      upi_url: upiString,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;
  return payment;
}

export async function updatePaymentStatus(
  paymentId: string,
  status: "pending" | "success" | "failed",
): Promise<Payment> {
  const { data, error } = await supabaseAdmin
    .from("payments")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", paymentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getPaymentByOrderId(
  orderId: string,
): Promise<Payment | null> {
  const { data, error } = await supabaseAdmin
    .from("payments")
    .select("*")
    .eq("order_id", orderId)
    .single();

  if (error && error.code === "PGRST116") return null;
  if (error) throw error;
  return data;
}

export async function verifyPayment(
  paymentId: string,
): Promise<PaymentDetails> {
  // Fetch payment
  const { data: payment, error: paymentError } = await supabaseAdmin
    .from("payments")
    .select("*")
    .eq("id", paymentId)
    .single();

  if (paymentError) throw paymentError;

  // Fetch associated order
  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", payment.order_id)
    .single();

  if (orderError) throw orderError;

  return { payment, order };
}

export async function confirmPayment(
  paymentId: string,
  orderId: string,
): Promise<PaymentDetails> {
  // Update payment status to success
  const updatedPayment = await updatePaymentStatus(paymentId, "success");

  // Update order status to paid
  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .update({ status: "paid" })
    .eq("id", orderId)
    .select()
    .single();

  if (error) throw error;

  return { payment: updatedPayment, order };
}

export async function failPayment(
  paymentId: string,
  orderId: string,
): Promise<PaymentDetails> {
  // Update payment status to failed
  const updatedPayment = await updatePaymentStatus(paymentId, "failed");

  // Update order status to failed
  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .update({ status: "failed" })
    .eq("id", orderId)
    .select()
    .single();

  if (error) throw error;

  return { payment: updatedPayment, order };
}

export async function getPaymentStats(): Promise<{
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  totalAmount: number;
  successRate: number;
}> {
  const { data: payments, error } = await supabaseAdmin
    .from("payments")
    .select("amount, status");

  if (error) throw error;

  const totalPayments = payments.length;
  const successfulPayments = payments.filter(
    (p) => p.status === "success",
  ).length;
  const failedPayments = payments.filter((p) => p.status === "failed").length;
  const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const successRate =
    totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;

  return {
    totalPayments,
    successfulPayments,
    failedPayments,
    totalAmount,
    successRate,
  };
}

// Helper function to generate UPI string
// Format: upi://pay?pa=<UPI-ID>&pn=<Name>&am=<Amount>&tr=<TransactionRef>&tn=<Note>
function generateUPIString(amount: number, vendorId?: string): string {
  const upiId = "merchant@bank"; // Replace with actual merchant UPI ID
  const payeeName = "E-Commerce Store"; // Replace with actual name
  const transactionRef = `TXN${Date.now()}`;
  const note = "Payment for order";

  const params = new URLSearchParams({
    pa: upiId,
    pn: payeeName,
    am: amount.toString(),
    tr: transactionRef,
    tn: note,
  });

  return `upi://pay?${params.toString()}`;
}

export async function generateQRCode(
  amount: number,
  orderId: string,
): Promise<string> {
  // This would integrate with a QR code generation service
  // For now, return the UPI string which can be converted to QR
  const upiString = generateUPIString(amount, orderId);
  return upiString;
}
