import express from "express";
import createSupabaseServer from "../lib/supabase/server";

const router = express.Router();

router.get("/", async (_req, res) => {
  const supabase = createSupabaseServer();
  try {
    const { data, error } = await supabase.from("categories").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Failed to load categories" });
  }
});

export default router;
