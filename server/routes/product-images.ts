import { RequestHandler } from "express";
import { supabaseAdmin } from "../../lib/supabase/server";
import { CreateProductImageSchema } from "../../lib/validations";
import type { ApiResponse } from "../../shared/api-types";

// GET /api/images - Get all images
export const getImages: RequestHandler = async (req, res) => {
  try {
    const { product_id } = req.query;

    let query = supabaseAdmin.from("product_images").select("*");

    if (product_id) {
      query = query.eq("product_id", product_id);
    }

    const { data: images, error } = await query.order("sort_order");

    if (error) throw error;

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
};

// GET /api/images/:imageId - Get single image
export const getImage: RequestHandler = async (req, res) => {
  try {
    const { imageId } = req.params;

    const { data: image, error } = await supabaseAdmin
      .from("product_images")
      .select("*")
      .eq("id", imageId)
      .single();

    if (error && error.code === "PGRST116") {
      return res.status(404).json({
        success: false,
        error: "Image not found",
      });
    }

    if (error) throw error;

    res.json({
      success: true,
      data: { image },
    });
  } catch (error) {
    console.error("Error fetching image:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch image",
    });
  }
};

// POST /api/images - Create image
export const createImage: RequestHandler = async (req, res) => {
  try {
    const validation = CreateProductImageSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
      });
    }

    const { data: image, error } = await supabaseAdmin
      .from("product_images")
      .insert(validation.data)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: { image },
    });
  } catch (error) {
    console.error("Error creating image:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create image",
    });
  }
};

// PUT /api/images/:imageId - Update image
export const updateImage: RequestHandler = async (req, res) => {
  try {
    const { imageId } = req.params;
    const { url, sort_order } = req.body;

    const updates: Record<string, unknown> = {};
    if (url) updates.url = url;
    if (sort_order !== undefined) updates.sort_order = sort_order;

    const { data: image, error } = await supabaseAdmin
      .from("product_images")
      .update(updates)
      .eq("id", imageId)
      .select()
      .single();

    if (error && error.code === "PGRST116") {
      return res.status(404).json({
        success: false,
        error: "Image not found",
      });
    }

    if (error) throw error;

    res.json({
      success: true,
      data: { image },
    });
  } catch (error) {
    console.error("Error updating image:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update image",
    });
  }
};

// DELETE /api/images/:imageId - Delete image
export const deleteImage: RequestHandler = async (req, res) => {
  try {
    const { imageId } = req.params;

    const { error } = await supabaseAdmin
      .from("product_images")
      .delete()
      .eq("id", imageId);

    if (error) throw error;

    res.json({
      success: true,
      data: { imageId },
    });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete image",
    });
  }
};
