import { RequestHandler } from "express";
import { supabaseAdmin } from "../../lib/supabase/server";
import {
  CreateProductVariantSchema,
  UpdateProductVariantSchema,
} from "../../lib/validations";
import type { ApiResponse } from "../../shared/api-types";

// GET /api/variants - Get all variants
export const getVariants: RequestHandler = async (req, res) => {
  try {
    const { product_id } = req.query;

    let query = supabaseAdmin.from("product_variants").select("*");

    if (product_id) {
      query = query.eq("product_id", product_id);
    }

    const { data: variants, error } = await query;

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
};

// GET /api/variants/:variantId - Get single variant
export const getVariant: RequestHandler = async (req, res) => {
  try {
    const { variantId } = req.params;

    const { data: variant, error } = await supabaseAdmin
      .from("product_variants")
      .select("*")
      .eq("id", variantId)
      .single();

    if (error && error.code === "PGRST116") {
      return res.status(404).json({
        success: false,
        error: "Variant not found",
      });
    }

    if (error) throw error;

    res.json({
      success: true,
      data: { variant },
    });
  } catch (error) {
    console.error("Error fetching variant:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch variant",
    });
  }
};

// POST /api/variants - Create variant
export const createVariant: RequestHandler = async (req, res) => {
  try {
    const validation = CreateProductVariantSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
      });
    }

    const { data: variant, error } = await supabaseAdmin
      .from("product_variants")
      .insert(validation.data)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: { variant },
    });
  } catch (error) {
    console.error("Error creating variant:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create variant",
    });
  }
};

// PUT /api/variants/:variantId - Update variant
export const updateVariant: RequestHandler = async (req, res) => {
  try {
    const { variantId } = req.params;
    const validation = UpdateProductVariantSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
      });
    }

    const { data: variant, error } = await supabaseAdmin
      .from("product_variants")
      .update(validation.data)
      .eq("id", variantId)
      .select()
      .single();

    if (error && error.code === "PGRST116") {
      return res.status(404).json({
        success: false,
        error: "Variant not found",
      });
    }

    if (error) throw error;

    res.json({
      success: true,
      data: { variant },
    });
  } catch (error) {
    console.error("Error updating variant:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update variant",
    });
  }
};

// DELETE /api/variants/:variantId - Delete variant
export const deleteVariant: RequestHandler = async (req, res) => {
  try {
    const { variantId } = req.params;

    const { error } = await supabaseAdmin
      .from("product_variants")
      .delete()
      .eq("id", variantId);

    if (error) throw error;

    res.json({
      success: true,
      data: { variantId },
    });
  } catch (error) {
    console.error("Error deleting variant:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete variant",
    });
  }
};
