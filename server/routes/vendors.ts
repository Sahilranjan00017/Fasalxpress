import { RequestHandler } from "express";
import {
  CreateVendorSchema,
  UpdateVendorSchema,
  CreateVendorPriceSchema,
  UpdateVendorPriceSchema,
} from "../../lib/validations";
import * as vendorService from "../services/vendor";
import type {
  GetVendorsResponse,
  GetVendorResponse,
  ApiResponse,
} from "../../shared/api-types";

// GET /api/vendors - Get all vendors
export const getVendors: RequestHandler = async (req, res) => {
  try {
    const vendors = await vendorService.getVendors();

    const response: ApiResponse<GetVendorsResponse> = {
      success: true,
      data: {
        vendors: vendors as any,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch vendors",
    });
  }
};

// GET /api/vendors/:vendorId - Get single vendor
export const getVendor: RequestHandler = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await vendorService.getVendorById(vendorId);

    const response: ApiResponse<GetVendorResponse> = {
      success: true,
      data: { vendor: vendor as any },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching vendor:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch vendor",
    });
  }
};

// POST /api/vendors - Create vendor (admin only)
export const createVendor: RequestHandler = async (req, res) => {
  try {
    const validation = CreateVendorSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
      });
    }

    const { name, state, city, upi_qr_url, bank_details } = validation.data;

    const vendor = await vendorService.createVendor(
      name,
      state,
      city,
      upi_qr_url,
      bank_details,
    );

    res.status(201).json({
      success: true,
      data: { vendor },
    });
  } catch (error) {
    console.error("Error creating vendor:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create vendor",
    });
  }
};

// PUT /api/vendors/:vendorId - Update vendor (admin only)
export const updateVendor: RequestHandler = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const validation = UpdateVendorSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
      });
    }

    const vendor = await vendorService.updateVendor(vendorId, validation.data);

    res.json({
      success: true,
      data: { vendor },
    });
  } catch (error) {
    console.error("Error updating vendor:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update vendor",
    });
  }
};

// GET /api/vendors/:vendorId/prices - Get vendor prices
export const getVendorPrices: RequestHandler = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const prices = await vendorService.getVendorPrices(vendorId);

    res.json({
      success: true,
      data: { prices },
    });
  } catch (error) {
    console.error("Error fetching vendor prices:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch vendor prices",
    });
  }
};

// POST /api/vendors/:vendorId/prices - Add price for vendor
export const createVendorPrice: RequestHandler = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const validation = CreateVendorPriceSchema.safeParse({
      ...req.body,
      vendor_id: vendorId,
    });

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
      });
    }

    const { product_id, variant_id, base_price } = validation.data;

    const price = await vendorService.createVendorPrice(
      vendorId,
      product_id,
      variant_id,
      base_price,
    );

    res.status(201).json({
      success: true,
      data: { price },
    });
  } catch (error) {
    console.error("Error creating vendor price:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create vendor price",
    });
  }
};

// PUT /api/vendors/prices/:priceId - Update vendor price
export const updateVendorPrice: RequestHandler = async (req, res) => {
  try {
    const { priceId } = req.params;
    const { base_price } = req.body;

    if (!base_price) {
      return res.status(400).json({
        success: false,
        error: "Base price is required",
      });
    }

    const price = await vendorService.updateVendorPrice(priceId, base_price);

    res.json({
      success: true,
      data: { price },
    });
  } catch (error) {
    console.error("Error updating vendor price:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update vendor price",
    });
  }
};

// DELETE /api/vendors/prices/:priceId - Delete vendor price
export const deleteVendorPrice: RequestHandler = async (req, res) => {
  try {
    const { priceId } = req.params;

    await vendorService.deleteVendorPrice(priceId);

    res.json({
      success: true,
      data: { priceId },
    });
  } catch (error) {
    console.error("Error deleting vendor price:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete vendor price",
    });
  }
};
