// Minimal supabase types for local development

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      products: { Row: any; Insert: any; Update: any };
      product_variants: { Row: any; Insert: any; Update: any };
      product_images: { Row: any; Insert: any; Update: any };
      categories: { Row: any; Insert: any; Update: any };
      carts: { Row: any; Insert: any; Update: any };
      cart_items: { Row: any; Insert: any; Update: any };
      orders: { Row: any; Insert: any; Update: any };
      order_items: { Row: any; Insert: any; Update: any };
      payments: { Row: any; Insert: any; Update: any };
      vendors: { Row: any; Insert: any; Update: any };
      banners: { Row: any; Insert: any; Update: any };
      purchase_orders: { Row: any; Insert: any; Update: any };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
};

export default Database;
