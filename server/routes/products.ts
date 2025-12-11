import express from "express";
import { supabaseAdmin } from "../../lib/supabase/server";
import { normalizeProductRow } from "../lib/normalizers";
import {
  CreateProductSchema,
  UpdateProductSchema,
} from "../../lib/validations";
import type {
  GetProductsResponse,
  GetProductResponse,
  CreateProductResponse,
  ApiResponse,
} from "../../shared/api-types";

const router = express.Router();

// GET /api/products - Get all products with pagination
router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 10);
    const offset = (page - 1) * limit;

    const { data: products, error } = await supabaseAdmin
      .from("products")
      .select(
        "*, category:categories(*), variants:product_variants(*), skus:product_skus(*), images:product_images(*)"
      )
      .is("deleted_at", null)
      .range(offset, offset + limit - 1);

    const { count } = await supabaseAdmin
      .from("products")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null);

    if (error) throw error;

    const normalized = (products || []).map((p: any) => normalizeProductRow(p));
    const response: ApiResponse<GetProductsResponse> = {
      success: true,
      data: {
        products: normalized,
        total: count || 0,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch products",
    });
  }
});

// GET /api/products/by-product-id/:productId - Get product by product_id (text)
router.get("/by-product-id/:productId", async (req, res) => {
  try {
    const { productId } = req.params;

    const { data: product, error } = await supabaseAdmin
      .from("products")
      .select(
        "*, category:categories(*), variants:product_variants(*), skus:product_skus(*), images:product_images(*)"
      )
      .eq("product_id", productId)
      .is("deleted_at", null)
      .single();

    if (error && error.code === "PGRST116") {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    if (error) throw error;

    const response: ApiResponse<GetProductResponse> = {
      success: true,
      data: { product: normalizeProductRow(product) },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch product",
    });
  }
});

// GET /api/products/:id - Get single product by UUID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data: product, error } = await supabaseAdmin
      .from("products")
      .select(
        "*, category:categories(*), variants:product_variants(*), skus:product_skus(*), descriptions:product_descriptions(*), images:product_images(*)"
      )
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (error && error.code === "PGRST116") {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    if (error) throw error;

    const response: ApiResponse<GetProductResponse> = {
      success: true,
      data: { product: normalizeProductRow(product) },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch product",
    });
  }
});

// POST /api/products - Create product (admin only)
router.post("/", async (req, res) => {
  try {
    const validation = CreateProductSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
      });
    }

    const { data: product, error } = await supabaseAdmin
      .from("products")
      .insert(validation.data)
      .select()
      .single();

    if (error) throw error;

    const response: ApiResponse<CreateProductResponse> = {
      success: true,
      data: { product },
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create product",
    });
  }
});

// PUT /api/products/:id - Update product (admin only)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const validation = UpdateProductSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
      });
    }

    const { data: product, error } = await supabaseAdmin
      .from("products")
      .update(validation.data)
      .eq("id", id)
      .select()
      .single();

    if (error && error.code === "PGRST116") {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    if (error) throw error;

    const response: ApiResponse<CreateProductResponse> = {
      success: true,
      data: { product },
    };

    res.json(response);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update product",
    });
  }
});

// DELETE /api/products/:id - Delete product (admin only)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.json({
      success: true,
      data: { id },
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete product",
    });
  }
});

// GET /api/products/:id/variants - Get product variants
router.get("/:id/variants", async (req, res) => {
  try {
    const { id } = req.params;

    const { data: variants, error } = await supabaseAdmin
      .from("product_variants")
      .select("*")
      .eq("product_id", id);

    if (error) throw error;

    res.json({
      success: true,
      data: { variants },
    });
  } catch (error) {
    console.error("Error fetching variants:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch variants",
    });
  }
});

// GET /api/products/:id/images - Get product images
router.get("/:id/images", async (req, res) => {
  try {
    const { id } = req.params;

    const { data: product, error } = await supabaseAdmin
      .from("products")
      .select("images")
      .eq("id", id)
      .single();

    if (error) throw error;

    const images = (Array.isArray(product?.images) ? product.images : []).map((url: any, index: number) => ({
      sort_order: index,
      image_url: url,
      url: url,
    }));

    res.json({
      success: true,
      data: { images },
    });
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch images",
    });
  }
});

export default router;
