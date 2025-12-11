import createSupabaseServer from "../supabase/server";

export async function getOrCreateCart(userId: string) {
  const supabase = createSupabaseServer();

  const { data: existing, error: existingError } = await supabase
    .from("carts")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) return existing;

  const { data: created, error: createError } = await supabase
    .from("carts")
    .insert({ user_id: userId })
    .select("*")
    .single();

  if (createError) throw createError;
  return created;
}

export async function getCartWithItems(userId: string) {
  const supabase = createSupabaseServer();
  const cart = await getOrCreateCart(userId);

  const { data: items, error } = await supabase
    .from("cart_items")
    .select(
      `
      *,
      product:products(*),
      variant:product_variants(*)
    `
    )
    .eq("cart_id", cart.id);

  if (error) throw error;

  const enriched = (items ?? []).map((item: any) => {
    const unit_price =
      item.unit_price ?? item.variant?.unit_price ?? item.product?.price ?? 0;
    const quantity = item.quantity ?? 1;
    const total_price = unit_price * quantity;
    return { ...item, unit_price, total_price };
  });

  return { cart, items: enriched };
}

export async function addToCart(params: {
  userId: string;
  productId: string;
  variantId?: string | null;
  quantity?: number;
  boxes?: number;
}) {
  const { userId, productId, variantId, quantity = 1, boxes = 0 } = params;
  const supabase = createSupabaseServer();

  const cart = await getOrCreateCart(userId);

  let unitPrice: number | null = null;
  if (variantId) {
    const { data: variant, error: vErr } = await supabase
      .from("product_variants")
      .select("unit_price")
      .eq("id", variantId)
      .maybeSingle();
    if (vErr) throw vErr;
    unitPrice = variant?.unit_price ?? null;
  } else {
    const { data: product, error: pErr } = await supabase
      .from("products")
      .select("price")
      .eq("id", productId)
      .is("deleted_at", null)
      .maybeSingle();
    if (pErr) throw pErr;
    unitPrice = product?.price ?? null;
  }

  const totalPrice = unitPrice ? unitPrice * quantity : null;

  const { error } = await supabase.from("cart_items").insert({
    cart_id: cart.id,
    product_id: productId,
    variant_id: variantId ?? null,
    quantity,
    boxes,
    unit_price: unitPrice,
    total_price: totalPrice,
  });

  if (error) throw error;
  return await getCartWithItems(userId);
}

export async function updateCartItem(params: {
  userId: string;
  cartItemId: string;
  quantity?: number;
  boxes?: number;
}) {
  const { userId, cartItemId, quantity, boxes } = params;
  const supabase = createSupabaseServer();
  const { cart } = await getCartWithItems(userId);

  const { data: item, error: itemErr } = await supabase
    .from("cart_items")
    .select("*")
    .eq("id", cartItemId)
    .eq("cart_id", cart.id)
    .maybeSingle();

  if (itemErr) throw itemErr;
  if (!item) throw new Error("Cart item not found");

  const newQuantity = quantity ?? item.quantity ?? 1;
  const unitPrice = item.unit_price ?? 0;
  const totalPrice = unitPrice * newQuantity;

  const { error } = await supabase
    .from("cart_items")
    .update({
      quantity: newQuantity,
      boxes: boxes ?? item.boxes ?? 0,
      total_price: totalPrice,
    })
    .eq("id", cartItemId);

  if (error) throw error;
  return await getCartWithItems(userId);
}

export async function removeCartItem(params: { userId: string; cartItemId: string }) {
  const { userId, cartItemId } = params;
  const supabase = createSupabaseServer();
  const { cart } = await getCartWithItems(userId);

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", cartItemId)
    .eq("cart_id", cart.id);

  if (error) throw error;
  return await getCartWithItems(userId);
}

export async function mergeCarts(fromUserId: string, toUserId: string) {
  const supabase = createSupabaseServer();

  // Ensure both carts exist
  const fromCart = await getOrCreateCart(fromUserId);
  const toCart = await getOrCreateCart(toUserId);

  // Load items from source cart
  const { data: fromItems, error: itemsErr } = await supabase
    .from('cart_items')
    .select('*')
    .eq('cart_id', fromCart.id);

  if (itemsErr) throw itemsErr;

  for (const item of (fromItems ?? [])) {
    // Try to find an existing matching item in destination cart (by product + variant)
    const { data: existing, error: existingErr } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', toCart.id)
      .eq('product_id', item.product_id)
      .eq('variant_id', item.variant_id)
      .maybeSingle();

    if (existingErr) throw existingErr;

    if (existing) {
      // Update quantity
      const newQty = (existing.quantity ?? 0) + (item.quantity ?? 0);
      const { error: updErr } = await supabase
        .from('cart_items')
        .update({ quantity: newQty })
        .eq('id', existing.id);
      if (updErr) throw updErr;
    } else {
      // Insert into destination cart
      const { error: insErr } = await supabase.from('cart_items').insert({
        cart_id: toCart.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        boxes: item.boxes ?? 0,
        unit_price: item.unit_price,
        total_price: item.total_price,
      });
      if (insErr) throw insErr;
    }
  }

  // Remove items from source cart
  if ((fromItems ?? []).length > 0) {
    const { error: delErr } = await supabase.from('cart_items').delete().eq('cart_id', fromCart.id);
    if (delErr) throw delErr;
  }

  return await getCartWithItems(toUserId);
}
