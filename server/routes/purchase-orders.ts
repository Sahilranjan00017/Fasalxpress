import { RequestHandler } from "express";
import {
  CreatePurchaseOrderSchema,
  UpdatePurchaseOrderSchema,
  UpdatePurchaseOrderStatusSchema,
} from "../../lib/validations";
import * as vendorService from "../services/vendor";
import type {
  GetPurchaseOrdersResponse,
  GetPurchaseOrderResponse,
  ApiResponse,
} from "../../shared/api-types";

// GET /api/purchase-orders - Get all purchase orders
export const getPurchaseOrders: RequestHandler = async (req, res) => {
  try {
    const { vendor_id, status } = req.query;

    const orders = await vendorService.getPurchaseOrders(
      vendor_id as string,
      status as string,
    );

    const response: ApiResponse<GetPurchaseOrdersResponse> = {
      success: true,
      data: { purchase_orders: orders as any },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch purchase orders",
    });
  }
};

// GET /api/purchase-orders/:orderId - Get single purchase order
export const getPurchaseOrder: RequestHandler = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await vendorService.getPurchaseOrder(orderId);

    const response: ApiResponse<GetPurchaseOrderResponse> = {
      success: true,
      data: { purchase_order: order as any },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching purchase order:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch purchase order",
    });
  }
};

// POST /api/purchase-orders - Create purchase order
export const createPurchaseOrder: RequestHandler = async (req, res) => {
  try {
    const validation = CreatePurchaseOrderSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
      });
    }

    const {
      vendor_id,
      product_id,
      variant_id,
      quantity,
      base_total,
      uplift_percent,
    } = validation.data;

    const order = await vendorService.createPurchaseOrder(
      vendor_id,
      product_id,
      variant_id,
      quantity,
      base_total,
      uplift_percent,
    );

    res.status(201).json({
      success: true,
      data: { purchase_order: order },
    });
  } catch (error) {
    console.error("Error creating purchase order:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create purchase order",
    });
  }
};

// PUT /api/purchase-orders/:orderId - Update purchase order
export const updatePurchaseOrder: RequestHandler = async (req, res) => {
  try {
    const { orderId } = req.params;
    const validation = UpdatePurchaseOrderSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
      });
    }

    const { supabaseAdmin } = await import("../../lib/supabase/server");
    const { data: order, error } = await supabaseAdmin
      .from("purchase_orders")
      .update(validation.data)
      .eq("id", orderId)
      .select()
      .single();

    if (error && error.code === "PGRST116") {
      return res.status(404).json({
        success: false,
        error: "Purchase order not found",
      });
    }

    if (error) throw error;

    const response: ApiResponse<GetPurchaseOrderResponse> = {
      success: true,
      data: { purchase_order: order as any },
    };

    res.json(response);
  } catch (error) {
    console.error("Error updating purchase order:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update purchase order",
    });
  }
};

// PUT /api/purchase-orders/:orderId/status - Update purchase order status
export const updatePurchaseOrderStatus: RequestHandler = async (req, res) => {
  try {
    const { orderId } = req.params;
    const validation = UpdatePurchaseOrderStatusSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
      });
    }

    const { status } = validation.data;

    const order = await vendorService.updatePurchaseOrderStatus(
      orderId,
      status,
    );

    const response: ApiResponse<GetPurchaseOrderResponse> = {
      success: true,
      data: { purchase_order: order as any },
    };

    res.json(response);
  } catch (error) {
    console.error("Error updating purchase order status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update purchase order status",
    });
  }
};

// DELETE /api/purchase-orders/:orderId - Delete purchase order
export const deletePurchaseOrder: RequestHandler = async (req, res) => {
  try {
    const { orderId } = req.params;

    const { supabaseAdmin } = await import("../../lib/supabase/server");
    const { error } = await supabaseAdmin
      .from("purchase_orders")
      .delete()
      .eq("id", orderId);

    if (error) throw error;

    res.json({
      success: true,
      data: { orderId },
    });
  } catch (error) {
    console.error("Error deleting purchase order:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete purchase order",
    });
  }
};
