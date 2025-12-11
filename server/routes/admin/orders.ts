import express from "express";
import { supabaseAdmin } from "../../../lib/supabase/server";

const router = express.Router();

// GET /api/admin/orders - list recent orders (admin)
router.get("/", async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("*, user:users(id, email)")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err: any) {
    console.error("Failed to fetch admin orders", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to fetch orders" });
  }
});

// GET /api/admin/orders/stats - order metrics
router.get("/stats", async (_req, res) => {
  try {
    const { getOrderStats } = await import("../../services/order");
    const stats = await getOrderStats();
    res.json({ success: true, data: stats });
  } catch (err: any) {
    console.error("Failed to fetch order stats", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to fetch stats" });
  }
});

export default router;
