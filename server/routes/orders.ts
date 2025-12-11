import express from "express";
import { createOrderFromCart, getOrder } from "../lib/db/orders";

const router = express.Router();

router.post("/", async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "userId is required" });
  try {
    const order = await createOrderFromCart(userId);
    res.status(201).json({ success: true, data: { order } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message ?? "Failed to create order" });
  }
});

// GET /api/orders?userId=<uuid> - list orders for a user
router.get("/", async (req, res) => {
  const userId = String(req.query.userId ?? "");
  try {
    if (!userId) return res.status(400).json({ error: "userId query is required" });
    const { getUserOrders } = await import("../services/order");
    const orders = await getUserOrders(userId);
    res.json({ success: true, data: { orders } });
    return;
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message ?? "Failed to fetch orders" });
    return;
  }
});

// GET /api/orders/:id - get single order (keeps previous behavior)
router.get("/:id", async (req, res) => {
  const userId = String(req.query.userId ?? "");
  try {
    const order = await getOrder(req.params.id, userId || undefined);
    if (!order) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: { order } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message ?? "Failed to fetch order" });
  }
});

export default router;
