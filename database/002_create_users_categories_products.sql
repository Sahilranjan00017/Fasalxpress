-- Create users table (if not exists)
create table if not exists public.users (
  id uuid not null default gen_random_uuid (),
  name text not null,
  email text null,
  phone text null,
  role text null default 'user',
  password_hash text null,
  created_at timestamp default now(),
  primary key (id),
  unique(email),
  unique(phone),
  check (role in ('admin', 'intern', 'user'))
);

-- Create categories table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  parent text null
);

-- Seed categories (idempotent)
insert into public.categories (name, parent)
  select * from (values
    ('Crop Protection', null),
    ('Insecticide', 'Crop Protection'),
    ('Fungicide', 'Crop Protection'),
    ('Herbicide', 'Crop Protection'),
    ('Equipments', null),
    ('Sprayer', 'Equipments'),
    ('Animal Husbandry', null),
    ('Cattle Feed', 'Animal Husbandry')
  ) as t(name, parent)
  where not exists (select 1 from public.categories c where c.name = t.name);

-- Create trigger function for auto-updating image metadata
CREATE OR REPLACE FUNCTION update_product_image_count()
RETURNS TRIGGER AS $$
BEGIN
  NEW.image_count := COALESCE(array_length(NEW.images, 1), 0);
  NEW.primary_image := COALESCE(NEW.images[1], NULL);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create products table matching provided schema
create table if not exists public.products (
  id uuid not null default gen_random_uuid (),
  product_id text not null,
  title text not null,
  category_id uuid null,
  price numeric null,
  mrp numeric null,
  discount numeric null,
  sku text null,
  description text null,
  internal_order_url text null,
  brand text null,
  pack_size text null,
  features text null,
  technical_content text null,
  usage text null,
  dosage text null,
  crop_usage text null,
  target_pest text null,
  state_availability text null,
  availability boolean null default true,
  created_at timestamp without time zone null default now(),
  category_name text null,
  subcategory_name text null,
  gst_percentage numeric null,
  stock_quantity integer null default 0,
  unit text null,
  unit_quantity numeric null,
  images text[] null default '{}',
  video_url text null,
  manufacture_date date null,
  expiry_date date null,
  meta_title text null,
  meta_description text null,
  primary_image text null,
  image_count integer null default 0,
  constraint products_pkey primary key (id),
  constraint products_product_id_key unique (product_id),
  constraint products_category_id_fkey foreign KEY (category_id) references categories (id)
) TABLESPACE pg_default;

-- Create index for faster image queries
create index IF not exists idx_products_images on public.products using gin (images) TABLESPACE pg_default;

-- Create trigger to auto-update image metadata
DROP TRIGGER IF EXISTS trigger_update_product_image_count ON public.products;
CREATE TRIGGER trigger_update_product_image_count
  BEFORE INSERT OR UPDATE OF images ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION update_product_image_count();
