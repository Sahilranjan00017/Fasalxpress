-- ============ ENABLE RLS ON ALL TABLES ============
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- ============ USERS TABLE POLICIES ============
-- Users can only see their own profile
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Admin can see all users
CREATE POLICY "Admin can view all users"
  ON public.users FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );

-- ============ PRODUCTS TABLE POLICIES ============
-- Anyone can view public products
CREATE POLICY "Anyone can view products"
  ON public.products FOR SELECT
  USING (availability = true);

-- Admin can insert/update/delete products
CREATE POLICY "Admin can manage products"
  ON public.products FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );

-- ============ PRODUCT VARIANTS TABLE POLICIES ============
-- Anyone can view product variants
CREATE POLICY "Anyone can view variants"
  ON public.product_variants FOR SELECT
  USING (true);

-- Admin can manage variants
CREATE POLICY "Admin can manage variants"
  ON public.product_variants FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );

-- ============ PRODUCT IMAGES TABLE POLICIES ============
-- Anyone can view product images
CREATE POLICY "Anyone can view images"
  ON public.product_images FOR SELECT
  USING (true);

-- Admin can manage images
CREATE POLICY "Admin can manage images"
  ON public.product_images FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );

-- ============ CATEGORIES TABLE POLICIES ============
-- Anyone can view categories
CREATE POLICY "Anyone can view categories"
  ON public.categories FOR SELECT
  USING (true);

-- Admin can manage categories
CREATE POLICY "Admin can manage categories"
  ON public.categories FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );

-- ============ BANNERS TABLE POLICIES ============
-- Anyone can view active banners
CREATE POLICY "Anyone can view active banners"
  ON public.banners FOR SELECT
  USING (active = true OR auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

-- Admin can manage banners
CREATE POLICY "Admin can manage banners"
  ON public.banners FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );

-- ============ VENDORS TABLE POLICIES ============
-- Admin can manage vendors
CREATE POLICY "Admin can view vendors"
  ON public.vendors FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );

CREATE POLICY "Admin can manage vendors"
  ON public.vendors FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );

-- ============ VENDOR PRICES TABLE POLICIES ============
-- Admin can view vendor prices
CREATE POLICY "Admin can view vendor prices"
  ON public.vendor_prices FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );

-- Admin can manage vendor prices
CREATE POLICY "Admin can manage vendor prices"
  ON public.vendor_prices FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );

-- ============ PURCHASE ORDERS TABLE POLICIES ============
-- Admin can view purchase orders
CREATE POLICY "Admin can view purchase orders"
  ON public.purchase_orders FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );

-- Admin can manage purchase orders
CREATE POLICY "Admin can manage purchase orders"
  ON public.purchase_orders FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );

-- ============ CARTS TABLE POLICIES ============
-- Users can view their own cart
CREATE POLICY "Users can view own cart"
  ON public.carts FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own cart
CREATE POLICY "Users can create own cart"
  ON public.carts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own cart
CREATE POLICY "Users can update own cart"
  ON public.carts FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own cart
CREATE POLICY "Users can delete own cart"
  ON public.carts FOR DELETE
  USING (auth.uid() = user_id);

-- ============ CART ITEMS TABLE POLICIES ============
-- Users can view their own cart items
CREATE POLICY "Users can view own cart items"
  ON public.cart_items FOR SELECT
  USING (
    cart_id IN (
      SELECT id FROM public.carts WHERE user_id = auth.uid()
    )
  );

-- Users can insert items to their cart
CREATE POLICY "Users can add to own cart"
  ON public.cart_items FOR INSERT
  WITH CHECK (
    cart_id IN (
      SELECT id FROM public.carts WHERE user_id = auth.uid()
    )
  );

-- Users can update their own cart items
CREATE POLICY "Users can update own cart items"
  ON public.cart_items FOR UPDATE
  USING (
    cart_id IN (
      SELECT id FROM public.carts WHERE user_id = auth.uid()
    )
  );

-- Users can delete their own cart items
CREATE POLICY "Users can delete own cart items"
  ON public.cart_items FOR DELETE
  USING (
    cart_id IN (
      SELECT id FROM public.carts WHERE user_id = auth.uid()
    )
  );

-- ============ ORDERS TABLE POLICIES ============
-- Users can view their own orders
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create orders
CREATE POLICY "Users can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view order status
CREATE POLICY "Users can view order status"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

-- Admin can update order status
CREATE POLICY "Admin can update order status"
  ON public.orders FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );

-- ============ ORDER ITEMS TABLE POLICIES ============
-- Users can view items in their orders
CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM public.orders WHERE user_id = auth.uid()
    )
  );

-- Admin can view all order items
CREATE POLICY "Admin can view all order items"
  ON public.order_items FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );

-- ============ PAYMENTS TABLE POLICIES ============
-- Users can view payments for their orders
CREATE POLICY "Users can view own payment details"
  ON public.payments FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM public.orders WHERE user_id = auth.uid()
    )
  );

-- Users can create payments
CREATE POLICY "Users can create payments"
  ON public.payments FOR INSERT
  WITH CHECK (
    order_id IN (
      SELECT id FROM public.orders WHERE user_id = auth.uid()
    )
  );

-- Admin can view all payments
CREATE POLICY "Admin can view all payments"
  ON public.payments FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );

-- ============ TRIGGER FOR CALCULATING ORDER TOTALS ============
-- This trigger automatically updates order total when order items change
CREATE OR REPLACE FUNCTION update_order_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.orders
  SET total_amount = COALESCE((
    SELECT SUM(total_price) FROM public.order_items WHERE order_id = NEW.order_id
  ), 0)
  WHERE id = NEW.order_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_order_total_trigger ON public.order_items;
CREATE TRIGGER update_order_total_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION update_order_total();

-- ============ TRIGGER FOR CALCULATING CART TOTALS ============
-- This trigger automatically updates cart item total_price
CREATE OR REPLACE FUNCTION calculate_cart_item_total()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quantity IS NOT NULL AND NEW.unit_price IS NOT NULL THEN
    NEW.total_price := NEW.quantity * NEW.unit_price;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS calculate_cart_item_total_trigger ON public.cart_items;
CREATE TRIGGER calculate_cart_item_total_trigger
BEFORE INSERT OR UPDATE ON public.cart_items
FOR EACH ROW
EXECUTE FUNCTION calculate_cart_item_total();

-- ============ TRIGGER FOR CALCULATING ORDER ITEM TOTALS ============
CREATE OR REPLACE FUNCTION calculate_order_item_total()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quantity IS NOT NULL AND NEW.unit_price IS NOT NULL THEN
    NEW.total_price := NEW.quantity * NEW.unit_price;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS calculate_order_item_total_trigger ON public.order_items;
CREATE TRIGGER calculate_order_item_total_trigger
BEFORE INSERT OR UPDATE ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION calculate_order_item_total();

-- ============ TRIGGER FOR CALCULATING PURCHASE ORDER FINAL TOTAL ============
CREATE OR REPLACE FUNCTION calculate_purchase_order_final_total()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.base_total IS NOT NULL AND NEW.uplift_percent IS NOT NULL THEN
    NEW.final_total := NEW.base_total * (1 + (NEW.uplift_percent / 100));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS calculate_purchase_order_final_total_trigger ON public.purchase_orders;
CREATE TRIGGER calculate_purchase_order_final_total_trigger
BEFORE INSERT OR UPDATE ON public.purchase_orders
FOR EACH ROW
EXECUTE FUNCTION calculate_purchase_order_final_total();

-- ============ TRIGGER FOR UPDATING VENDOR_PRICES TIMESTAMP ============
CREATE OR REPLACE FUNCTION update_vendor_prices_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_vendor_prices_timestamp_trigger ON public.vendor_prices;
CREATE TRIGGER update_vendor_prices_timestamp_trigger
BEFORE UPDATE ON public.vendor_prices
FOR EACH ROW
EXECUTE FUNCTION update_vendor_prices_timestamp();

-- ============ TRIGGER FOR UPDATING PAYMENTS TIMESTAMP ============
CREATE OR REPLACE FUNCTION update_payments_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_payments_timestamp_trigger ON public.payments;
CREATE TRIGGER update_payments_timestamp_trigger
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION update_payments_timestamp();

-- ============ INDEXES FOR PERFORMANCE ============
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_product_id ON public.products(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON public.carts(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON public.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_vendor_prices_vendor_id ON public.vendor_prices(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_prices_product_id ON public.vendor_prices(product_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_vendor_id ON public.purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON public.purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
