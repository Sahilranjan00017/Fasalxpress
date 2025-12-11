import express from "express";
import { getCartWithItems, addToCart, updateCartItem, removeCartItem, mergeCarts } from "../lib/db/cart";
import { normalizeCartResponse } from "../lib/normalizers";

const router = express.Router();

router.get("/", async (req, res) => {
  const userId = String(req.query.userId ?? "");
  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }
  try {
    const cart = await getCartWithItems(userId);
    const normalized = normalizeCartResponse(cart);
    res.json({ success: true, data: { cart: normalized.cart, items: normalized.items } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message ?? "Failed to load cart" });
  }
});

router.post("/add", async (req, res) => {
  const { userId, productId, variantId, quantity, boxes } = req.body;
  if (!userId || !productId) {
    return res.status(400).json({ error: "userId and productId are required" });
  }
  try {
    const cart = await addToCart({ userId, productId, variantId, quantity, boxes });
    const normalized = normalizeCartResponse(cart);
    res.status(201).json({ success: true, data: { cart: normalized.cart, items: normalized.items } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message ?? "Failed to add to cart" });
  }
});

router.post('/merge', async (req, res) => {
  const { fromUserId, toUserId } = req.body;
  if (!fromUserId || !toUserId) {
    return res.status(400).json({ success: false, error: 'fromUserId and toUserId are required' });
  }
  try {
    const cart = await mergeCarts(fromUserId, toUserId);
    const normalized = normalizeCartResponse(cart);
    res.json({ success: true, data: { cart: normalized.cart, items: normalized.items } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message ?? 'Failed to merge carts' });
  }
});

router.patch("/item", async (req, res) => {
  const { userId, cartItemId, quantity, boxes } = req.body;
  if (!userId || !cartItemId) {
    return res.status(400).json({ error: "userId and cartItemId are required" });
  }
  try {
    const cart = await updateCartItem({ userId, cartItemId, quantity, boxes });
    const normalized = normalizeCartResponse(cart);
    res.json({ success: true, data: { cart: normalized.cart, items: normalized.items } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message ?? "Failed to update cart item" });
  }
});

router.delete("/item", async (req, res) => {
  const { userId, cartItemId } = req.body;
  if (!userId || !cartItemId) {
    return res.status(400).json({ error: "userId and cartItemId are required" });
  }
  try {
    const cart = await removeCartItem({ userId, cartItemId });
    const normalized = normalizeCartResponse(cart);
    res.json({ success: true, data: { cart: normalized.cart, items: normalized.items } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message ?? "Failed to remove cart item" });
  }
});

export default router;
