import express from "express";
import { adminCreateProduct, adminUpdateProduct, adminDeleteProduct } from "../../lib/db/admin";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const product = await adminCreateProduct(req.body);
    res.status(201).json({ success: true, data: { product } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message ?? "Failed to create product" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updated = await adminUpdateProduct(req.params.id, req.body);
    res.json({ success: true, data: { product: updated } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message ?? "Failed to update product" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await adminDeleteProduct(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message ?? "Failed to delete product" });
  }
});

export default router;
