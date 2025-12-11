import express from "express";
import { adminCreatePurchaseOrder } from "../../lib/db/admin";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const po = await adminCreatePurchaseOrder(req.body);
    res.status(201).json({ success: true, data: { purchaseOrder: po } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message ?? "Failed to create purchase order" });
  }
});

export default router;
