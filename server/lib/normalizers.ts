export function normalizeProductRow(raw: any) {
  if (!raw) return raw;

  // Images: handle both direct URL array and product_images relation objects
  let images: string[] = [];
  if (Array.isArray(raw.images)) {
    console.log(`[Normalizer] Product ${raw.title} images:`, JSON.stringify(raw.images, null, 2));
    images = raw.images
      .map((i: any) => {
        // If it's a string (URL), return directly
        if (typeof i === 'string') return i;
        // If it's an object (product_images relation), extract the URL field
        // Check image_url first since that's your actual column name
        const imageUrl = i?.image_url ?? i?.url ?? i?.src ?? null;
        console.log(`[Normalizer] Image object:`, i, `-> extracted URL:`, imageUrl);
        return imageUrl;
      })
      .filter((url: string | null): url is string => Boolean(url));
  }
  console.log(`[Normalizer] Product ${raw.title} final images array:`, images);

  // Category: keep object or string
  const category = raw.category ?? null;

  // Price normalization - use price as selling price
  const price = (() => {
    const p = raw.price ?? null;
    if (p === null || p === undefined) return 0;
    return typeof p === 'number' ? p : parseFloat(String(p)) || 0;
  })();

  // MRP normalization - use mrp as original price, fallback to price if not set
  const mrp = (() => {
    const m = raw.mrp ?? raw.price ?? null;
    if (m === null || m === undefined) return price;
    return typeof m === 'number' ? m : parseFloat(String(m)) || price;
  })();

  // Availability
  const availability = (() => {
    if (typeof raw.availability === 'boolean') return raw.availability;
    if (typeof raw.availability === 'string') {
      const s = raw.availability.toLowerCase();
      return s === 'true' || s === 'in stock' || s === 'available';
    }
    return Boolean(raw.availability);
  })();

  return {
    id: raw.id,
    product_id: raw.product_id,
    title: raw.title ?? raw.name ?? raw.product_id,
    name: raw.title ?? raw.name ?? raw.product_id,
    description: raw.description ?? raw.long_description ?? raw.technical_content ?? null,
    brand: raw.brand ?? null,
    sku: raw.sku ?? null,
    price,
    mrp,
    discount: raw.discount ?? null,
    availability,
    category,
    images,
    skus: raw.skus ?? [], // Include SKU variants
    variants: raw.variants ?? [], // Include old variants for backward compatibility
    descriptions: raw.descriptions ?? [], // Include product descriptions
    // Pass through all product creation fields
    classification: raw.classification ?? null,
    toxicity: raw.toxicity ?? null,
    technical_content: raw.technical_content ?? null,
    city: raw.city ?? null,
    country_of_origin: raw.country_of_origin ?? null,
    cod_available: raw.cod_available ?? null,
    ready_to_ship: raw.ready_to_ship ?? null,
    trust_markers: raw.trust_markers ?? null,
    slug: raw.slug ?? null,
    status: raw.status ?? null,
    publish_date: raw.publish_date ?? null,
    visible: raw.visible ?? null,
    created_at: raw.created_at,
    raw,
  };
}

export function normalizeCartResponse(cartWithItems: any) {
  if (!cartWithItems) return cartWithItems;
  const cart = cartWithItems.cart ?? null;
  const items = (cartWithItems.items ?? []).map((it: any) => {
    return {
      ...it,
      unit_price: it.unit_price ?? it.variant?.unit_price ?? it.product?.price ?? 0,
      total_price: it.total_price ?? (it.unit_price ?? 0) * (it.quantity ?? 1),
      product: normalizeProductRow(it.product),
      variant: it.variant ?? null,
    };
  });
  return { cart, items };
}
