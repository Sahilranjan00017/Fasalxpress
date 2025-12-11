import express from "express";
import { adminListBanners, adminUpsertBanner } from "../lib/db/admin";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const banners = await adminListBanners();
    res.json({ success: true, data: { banners } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message ?? "Failed to load banners" });
  }
});

router.post("/", async (req, res) => {
  try {
    const banner = await adminUpsertBanner(req.body);
    res.status(201).json({ success: true, data: { banner } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message ?? "Failed to upsert banner" });
  }
});

export default router;
