import createSupabaseServer from "../supabase/server";

export async function initiatePayment(params: {
  orderId: string;
  amount: number;
  upiUrl?: string;
  qrSvg?: string;
}) {
  const { orderId, amount, upiUrl, qrSvg } = params;
  const supabase = createSupabaseServer();

  const { data: payment, error } = await supabase
    .from("payments")
    .insert({ order_id: orderId, amount, upi_url: upiUrl ?? null, qr_svg: qrSvg ?? null, status: "pending" })
    .select("*")
    .single();

  if (error) throw error;
  return payment;
}

export async function markPaymentSuccess(paymentId: string) {
  const supabase = createSupabaseServer();

  const { data: payment, error } = await supabase
    .from("payments")
    .update({ status: "success" })
    .eq("id", paymentId)
    .select("*")
    .single();

  if (error) throw error;

  if (payment.order_id) {
    await supabase.from("orders").update({ status: "paid" }).eq("id", payment.order_id);
  }

  return payment;
}

export async function markPaymentFailed(paymentId: string) {
  const supabase = createSupabaseServer();

  const { data: payment, error } = await supabase
    .from("payments")
    .update({ status: "failed" })
    .eq("id", paymentId)
    .select("*")
    .single();

  if (error) throw error;

  if (payment.order_id) {
    await supabase.from("orders").update({ status: "failed" }).eq("id", payment.order_id);
  }

  return payment;
}
