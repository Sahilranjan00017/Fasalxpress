import express from "express";
import { adminListVendors, adminCreateVendor } from "../../lib/db/admin";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const vendors = await adminListVendors();
    res.json({ success: true, data: { vendors } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message ?? "Failed to list vendors" });
  }
});

router.post("/", async (req, res) => {
  try {
    const vendor = await adminCreateVendor(req.body);
    res.status(201).json({ success: true, data: { vendor } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message ?? "Failed to create vendor" });
  }
});

export default router;
