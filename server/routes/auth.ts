import { Router } from "express";
import { sendPin, verifyPin } from "../services/pin";

const router = Router();

router.post("/send-pin", async (req, res) => {
  try {
    const { email } = req.body as { email?: string };
    if (!email) return res.status(400).json({ error: "Email is required" });

    await sendPin(email.trim().toLowerCase());
    return res.json({ message: "PIN sent" });
  } catch (error: any) {
    console.error("[auth/send-pin]", error);
    return res.status(500).json({ error: error?.message || "Failed to send PIN" });
  }
});

router.post("/verify-pin", async (req, res) => {
  try {
    const { email, pin } = req.body as { email?: string; pin?: string };
    if (!email || !pin) return res.status(400).json({ error: "Email and PIN are required" });

    const result = await verifyPin(email.trim().toLowerCase(), pin.trim());
    return res.json(result);
  } catch (error: any) {
    console.error("[auth/verify-pin]", error);
    return res.status(400).json({ error: error?.message || "Invalid or expired PIN" });
  }
});

export default router;
