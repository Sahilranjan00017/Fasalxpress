import "dotenv/config";
import express from "express";
import cors from "cors";
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
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ============ HEALTH CHECK ============
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

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
