import express from "express";
import { initiatePayment, markPaymentSuccess, markPaymentFailed } from "../lib/db/payments";
import { getOrder } from "../lib/db/orders";

const router = express.Router();

router.post("/initiate", async (req, res) => {
  const { orderId, upiUrl, qrSvg } = req.body;
  if (!orderId) return res.status(400).json({ error: "orderId is required" });
  try {
    const order = await getOrder(orderId);
    if (!order) return res.status(404).json({ success: false, error: "Order not found" });
    const payment = await initiatePayment({ orderId, amount: order.total_amount, upiUrl, qrSvg });
    res.status(201).json({ success: true, data: { payment } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message ?? "Failed to initiate payment" });
  }
});

router.post("/verify", async (req, res) => {
  const { paymentId, success } = req.body;
  if (!paymentId) return res.status(400).json({ error: "paymentId is required" });
  try {
    const payment = success ? await markPaymentSuccess(paymentId) : await markPaymentFailed(paymentId);
    res.json({ success: true, data: { payment } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message ?? "Failed to verify payment" });
  }
});

export default router;
