import express from "express";
import createSupabaseServer from "../../lib/supabase/server";
import bcrypt from "bcryptjs";

const router = express.Router();

// POST /api/admin/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: "Missing email or password" });

    const supabase = createSupabaseServer();
    const { data: user, error } = await supabase.from("users").select("id, name, email, phone, role, password_hash").eq("email", email).single();

    if (error || !user) {
      return res.status(400).json({ success: false, error: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password_hash || "");
    if (!match) return res.status(400).json({ success: false, error: "Wrong password" });

    // Do not return password_hash
    const { password_hash, ...safeUser } = user;

    return res.json({ success: true, data: { user: safeUser } });
  } catch (err: any) {
    console.error("Admin login error:", err);
    return res.status(500).json({ success: false, error: err.message ?? "Server error" });
  }
});

export default router;
