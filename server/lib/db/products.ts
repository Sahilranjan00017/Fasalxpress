import createSupabaseServer from "../supabase/server";

export async function listProducts(opts?: { categoryId?: string; search?: string }) {
  const supabase = createSupabaseServer();
  let query = supabase
    .from("products")
    .select(
      `
      *,
      category:categories(*),
      variants:product_variants(*),
      images:product_images(*)
    `
    )
    .eq("availability", true)
    .is("deleted_at", null);

  if (opts?.categoryId) query = query.eq("category_id", opts.categoryId);
  if (opts?.search) query = query.ilike("title", `%${opts.search}%`);

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getProduct(id: string) {
  const supabase = createSupabaseServer();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories(*),
      variants:product_variants(*),
      images:product_images(*)
    `
    )
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw error;
  return data;
}
