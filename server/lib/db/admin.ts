import createSupabaseServer from "../supabase/server";

export async function adminCreateProduct(payload: any) {
  const supabase = createSupabaseServer();
  const { sku_variants, variants, images, description, ...productData } = payload;
  
  // Generate a unique product_id if not provided
  if (!productData.product_id) {
    productData.product_id = `PROD-${Date.now()}`;
  }
  
  // Ensure slug is unique - always add timestamp + random to prevent any duplicates
  const baseSlug = productData.slug || 'product';
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  productData.slug = `${baseSlug.split('-')[0]}-${timestamp}${random}`;
  
  // Insert product
  const { data: product, error: productError } = await supabase
    .from("products")
    .insert(productData)
    .select("*")
    .single();
  
  if (productError) throw productError;
  
  // Insert images if provided
  if (images && Array.isArray(images) && images.length > 0) {
    console.log(`[Admin] Inserting ${images.length} images for product ${product.id}:`, images);
    const imagesToInsert = images.map((img: any) => ({
      product_id: product.id,
      image_url: img.url,
      is_primary: img.is_primary || false,
      sort_order: img.sort_order || 0,
      alt_text: img.alt_text || '',
    }));
    
    console.log(`[Admin] Images to insert:`, JSON.stringify(imagesToInsert, null, 2));
    
    const { error: imagesError } = await supabase
      .from("product_images")
      .insert(imagesToInsert);
    
    if (imagesError) {
      console.error("[Admin] ERROR inserting images:", imagesError);
      throw imagesError; // Make it fail loudly
    } else {
      console.log(`[Admin] SUCCESS: Inserted ${images.length} images`);
    }
  } else {
    console.log(`[Admin] WARNING: No images provided for product ${product.id}`);
  }
  
  // Insert product description if provided
  if (description && typeof description === 'object') {
    const descData = typeof description === 'string' ? JSON.parse(description) : description;
    const { error: descError } = await supabase
      .from("product_descriptions")
      .insert({
        product_id: product.id,
        about: descData.about || '',
        mode_of_entry: descData.modeOfEntry || '',
        mode_of_action: descData.modeOfAction || '',
        chemical_group: descData.chemicalGroup || '',
        target_pests: descData.targetPests || '',
        recommended_crops: descData.recommendedCrops || '',
        dosage_per_acre: descData.dosagePerAcre || '',
        how_to_apply: descData.howToApply || '',
      });
    
    if (descError) {
      console.error("Error inserting description:", descError);
    }
  }
  
  // Insert SKU variants (new format)
  const variantsToInsert = variants || sku_variants;
  if (variantsToInsert && Array.isArray(variantsToInsert) && variantsToInsert.length > 0) {
    const skusToInsert = variantsToInsert.map((sku: any) => ({
      product_id: product.id,
      variant_name: sku.variant_name || sku.variantName || '',
      unit_type: sku.unit_type || sku.unitType || 'ml',
      quantity: sku.quantity || '',
      pieces_per_box: sku.box_pieces || sku.piecesPerBox || 1,
      unit_price: sku.price || sku.unit_price || 0,
      unit_mrp: sku.mrp || sku.unit_mrp || 0,
      box_price: sku.boxPrice || sku.box_price || 0,
      box_mrp: sku.boxMrp || sku.box_mrp || 0,
      sku: sku.sku || '',
      stock: sku.stock || 0,
      tags: typeof sku.tags === 'string' ? sku.tags : JSON.stringify(sku.tags || {}),
    }));
    
    const { error: skuError } = await supabase
      .from("product_skus")
      .insert(skusToInsert);
    
    if (skuError) {
      console.error("Error inserting SKU variants:", skuError);
      throw skuError;
    }
  }
  
  return product;
}

export async function adminUpdateProduct(id: string, payload: any) {
  const supabase = createSupabaseServer();
  const { variants, images, description, sku_variants, ...productData } = payload;
  
  // Clean up product data - remove any fields that aren't in the products table
  const cleanProductData = {
    title: productData.title,
    brand: productData.brand,
    category_name: productData.category_name,
    classification: productData.classification,
    technical_content: productData.technical_content,
    toxicity: productData.toxicity,
    city: productData.city,
    country_of_origin: productData.country_of_origin,
    cod_available: productData.cod_available,
    ready_to_ship: productData.ready_to_ship,
    meta_title: productData.meta_title,
    meta_description: productData.meta_description,
    slug: productData.slug,
    status: productData.status,
    publish_date: productData.publish_date,
    visible: productData.visible,
    availability: productData.availability !== undefined ? productData.availability : productData.visible,
    description: typeof productData.description === 'string' ? productData.description : JSON.stringify(productData.description || {}),
  };
  
  // Update product
  const { data: product, error: productError } = await supabase
    .from("products")
    .update(cleanProductData)
    .eq("id", id)
    .select("*")
    .single();
  
  if (productError) {
    console.error("Error updating product:", productError);
    throw productError;
  }
  
  // Handle images if provided
  if (images && Array.isArray(images)) {
    // Delete existing images
    await supabase.from("product_images").delete().eq("product_id", id);
    
    // Insert new images
    if (images.length > 0) {
      const imagesToInsert = images.map((img: any, index: number) => ({
        product_id: id,
        image_url: img.url,  // Using image_url to match your schema
        is_primary: img.is_primary || img.isPrimary || index === 0,
        sort_order: img.sort_order || img.sortOrder || index,
        alt_text: img.alt_text || img.altText || productData.title || '',
      }));
      
      const { error: imageError } = await supabase
        .from("product_images")
        .insert(imagesToInsert);
      
      if (imageError) {
        console.error("Error inserting images:", imageError);
      }
    }
  }
  
  // Handle variants/SKUs if provided
  const variantsToProcess = variants || sku_variants;
  if (variantsToProcess && Array.isArray(variantsToProcess)) {
    // Delete existing SKUs
    await supabase.from("product_skus").delete().eq("product_id", id);
    
    // Insert new SKUs
    if (variantsToProcess.length > 0) {
      const skusToInsert = variantsToProcess.map((sku: any) => ({
        product_id: id,
        variant_name: sku.variant_name || sku.variantName || '',
        unit_type: sku.unit_type || sku.unitType || 'ml',
        quantity: sku.variant_name || sku.variantName || sku.quantity || '',
        pieces_per_box: sku.box_pieces || sku.boxPieces || sku.pieces_per_box || 1,
        unit_price: parseFloat(sku.price || sku.unit_price || 0),
        unit_mrp: parseFloat(sku.mrp || sku.unit_mrp || sku.price || 0),  // Using unit_mrp to match schema
        box_price: parseFloat(sku.boxPrice || sku.box_price || 0),
        box_mrp: parseFloat(sku.boxMrp || sku.box_mrp || 0),
        sku: sku.sku || '',
        stock: parseInt(sku.stock || 0),
        tags: typeof sku.tags === 'string' ? sku.tags : JSON.stringify(sku.tags || {}),
      }));
      
      const { error: skuError } = await supabase
        .from("product_skus")
        .insert(skusToInsert);
      
      if (skuError) {
        console.error("Error inserting SKUs:", skuError);
      }
    }
  }
  
  return product;
}

export async function adminDeleteProduct(id: string) {
  const supabase = createSupabaseServer();
  
  // Check if product exists in any orders
  const { data: orderItems, error: orderCheckError } = await supabase
    .from("order_items")
    .select("id")
    .eq("product_id", id)
    .limit(1);
  
  if (orderCheckError) {
    console.error("Error checking orders:", orderCheckError);
    throw new Error("Failed to check product orders");
  }
  
  if (orderItems && orderItems.length > 0) {
    // Product has been ordered - do soft delete instead
    const { error: softDeleteError } = await supabase
      .from("products")
      .update({ 
        deleted_at: new Date().toISOString(),
        availability: false 
      })
      .eq("id", id);
    
    if (softDeleteError) {
      console.error("Error soft deleting product:", softDeleteError);
      throw new Error("Product has been ordered. Failed to mark as deleted.");
    }
    
    return true;
  }
  
  // Product has never been ordered - safe to hard delete
  // Delete related data first (in case CASCADE isn't working properly)
  await supabase.from("product_variants").delete().eq("product_id", id);
  await supabase.from("product_skus").delete().eq("product_id", id);
  await supabase.from("product_images").delete().eq("product_id", id);
  await supabase.from("cart_items").delete().eq("product_id", id);
  
  // Now delete the product
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
  
  return true;
}

export async function adminListVendors() {
  const supabase = createSupabaseServer();
  const { data, error } = await supabase.from("vendors").select("*");
  if (error) throw error;
  return data;
}

export async function adminCreateVendor(payload: any) {
  const supabase = createSupabaseServer();
  const { data, error } = await supabase.from("vendors").insert(payload).select("*").single();
  if (error) throw error;
  return data;
}

export async function adminCreatePurchaseOrder(payload: any) {
  const supabase = createSupabaseServer();
  const uplift = payload.uplift_percent ?? 5;
  const finalTotal = payload.final_total ?? payload.base_total * (1 + (uplift ?? 0) / 100);
  const { data, error } = await supabase
    .from("purchase_orders")
    .insert({ ...payload, uplift_percent: uplift, final_total: finalTotal })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function adminListBanners() {
  const supabase = createSupabaseServer();
  const { data, error } = await supabase.from("banners").select("*").order("sort_order", { ascending: true });
  if (error) throw error;
  return data;
}

export async function adminUpsertBanner(payload: any) {
  const supabase = createSupabaseServer();
  if (payload.id) {
    const { data, error } = await supabase.from("banners").update(payload).eq("id", payload.id).select("*").single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase.from("banners").insert(payload).select("*").single();
    if (error) throw error;
    return data;
  }
}
