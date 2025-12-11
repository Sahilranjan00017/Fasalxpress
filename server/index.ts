import "dotenv/config";
import express from "express";
import cors from "cors";
import { supabase } from "../api/supabaseClient";
import { handleDemo } from "./routes/demo";
import productsRouter from "./routes/products";
import cartRouter from "./routes/cart";
import ordersRouter from "./routes/orders";
import paymentsRouter from "./routes/payments";
import categoriesRouter from "./routes/categories";
import bannersRouter from "./routes/banners";
import adminProductsRouter from "./routes/admin/products";
import adminVendorsRouter from "./routes/admin/vendors";
import adminPOsRouter from "./routes/admin/purchaseOrders";
import adminOrdersRouter from "./routes/admin/orders";
import authRouter from "./routes/auth";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors({ origin: "*", credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ============ HEALTH CHECK ============
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  app.get("/api/demo", handleDemo);

  // Simple DB test to validate Supabase connectivity
  app.get("/api/db-test", async (_req, res) => {
    try {
      const { data, error } = await supabase.from("products").select("id").limit(1);
      if (error) return res.status(500).json({ ok: false, error: error.message });
      res.json({ ok: true, sample: data && data.length ? data[0] : null });
    } catch (e: any) {
      res.status(500).json({ ok: false, error: String(e) });
    }
  });

  // API routes
  app.use("/api/products", productsRouter);
  app.use("/api/cart", cartRouter);
  app.use("/api/orders", ordersRouter);
  app.use("/api/payments", paymentsRouter);
  app.use("/api/categories", categoriesRouter);
  app.use("/api/banners", bannersRouter);
    // Auth routes (custom PIN-based)
    app.use("/api/auth", authRouter);
  app.use("/api/admin/products", adminProductsRouter);
  app.use("/api/admin/vendors", adminVendorsRouter);
  app.use("/api/admin/purchase-orders", adminPOsRouter);
  app.use("/api/admin/orders", adminOrdersRouter);

  return app;
}
