/**
 * Centralized Product Fetching Service
 * All pages should use these functions to ensure consistent data fetching
 */

export interface Product {
  id: string;
  product_id?: string;
  title: string;
  description?: string;
  price: number;
  mrp?: number;
  images: string[];
  category?: any;
  brand?: string;
  availability?: boolean;
  variants?: any[];
  skus?: any[];
  [key: string]: any;
}

/**
 * Calculate the lowest price from product SKUs
 * If SKUs exist, return the minimum unit_price, otherwise return product.price
 */
export function getLowestPrice(product: Product): number {
  if (!product) return 0;
  
  const skus = product.skus || [];
  
  if (skus.length > 0) {
    const skuPrices = skus
      .map((sku: any) => parseFloat(sku.unit_price || sku.price || 0))
      .filter((p: number) => p > 0);
    
    if (skuPrices.length > 0) {
      return Math.min(...skuPrices);
    }
  }
  
  // Fallback to product price
  return parseFloat((product.price ?? 0).toString()) || 0;
}

/**
 * Calculate the highest MRP from product SKUs
 * Used to show the original price for discount calculation
 */
export function getHighestMRP(product: Product): number {
  if (!product) return 0;
  
  const skus = product.skus || [];
  
  if (skus.length > 0) {
    const skuMrps = skus
      .map((sku: any) => parseFloat(sku.unit_mrp || sku.mrp || sku.unit_price || sku.price || 0))
      .filter((p: number) => p > 0);
    
    if (skuMrps.length > 0) {
      return Math.max(...skuMrps);
    }
  }
  
  // Fallback to product MRP or price
  const mrp = product.mrp || product.price;
  return parseFloat((mrp ?? 0).toString()) || 0;
}

/**
 * Calculate discount percentage based on MRP and selling price
 */
export function getDiscountPercentage(product: Product): number {
  const price = getLowestPrice(product);
  const mrp = getHighestMRP(product);
  
  if (mrp > price && price > 0) {
    return Math.round(((mrp - price) / mrp) * 100);
  }
  
  return 0;
}

/**
 * Get display prices for a product (considers SKUs)
 */
export function getProductPrices(product: Product): {
  price: number;
  mrp: number;
  discount: number;
  hasSKUs: boolean;
  lowestSKU?: any;
} {
  const price = getLowestPrice(product);
  const mrp = getHighestMRP(product);
  const discount = getDiscountPercentage(product);
  const skus = product.skus || [];
  
  let lowestSKU = undefined;
  if (skus.length > 0) {
    lowestSKU = skus.reduce((lowest: any, current: any) => {
      const currentPrice = parseFloat(current.unit_price || current.price || 0);
      const lowestPrice = parseFloat(lowest?.unit_price || lowest?.price || Infinity);
      return currentPrice < lowestPrice ? current : lowest;
    }, skus[0]);
  }
  
  return {
    price,
    mrp,
    discount,
    hasSKUs: skus.length > 0,
    lowestSKU,
  };
}

export interface ProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    total?: number;
  };
}

export interface ProductResponse {
  success: boolean;
  data: {
    product: Product;
  };
}

/**
 * Fetch all products with optional pagination
 * @param options - Pagination and filter options
 * @returns Promise with products array and total count
 */
export async function fetchProducts(options?: {
  page?: number;
  limit?: number;
  category?: string;
}): Promise<{ products: Product[]; total: number }> {
  const { page = 1, limit = 100 } = options || {};
  
  const params = new URLSearchParams();
  if (page) params.set('page', page.toString());
  if (limit) params.set('limit', limit.toString());
  
  const url = `/api/products${params.toString() ? `?${params.toString()}` : ''}`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch products: ${res.statusText}`);
    }
    
    const data = await res.json();
    
    // Handle different response formats
    let products: Product[] = [];
    let total = 0;
    
    if (data.success && data.data) {
      // Standard API response format
      products = data.data.products || [];
      total = data.data.total || products.length;
    } else if (Array.isArray(data)) {
      // Direct array response
      products = data;
      total = data.length;
    } else if (data.products) {
      // Legacy format
      products = data.products;
      total = data.total || products.length;
    }
    
    return { products, total };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { products: [], total: 0 };
  }
}

/**
 * Fetch a single product by ID
 * @param id - Product UUID or product_id
 * @returns Promise with product data
 */
export async function fetchProduct(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`/api/products/${id}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch product: ${res.statusText}`);
    }
    
    const data = await res.json();
    
    // Handle different response formats
    if (data.success && data.data && data.data.product) {
      return data.data.product;
    } else if (data.product) {
      return data.product;
    } else if (data.id) {
      // Direct product object
      return data;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

/**
 * Fetch featured/limited products for homepage
 * @param limit - Number of products to fetch
 * @returns Promise with products array
 */
export async function fetchFeaturedProducts(limit: number = 6): Promise<Product[]> {
  const { products } = await fetchProducts({ limit });
  return products;
}

/**
 * React hook for fetching products
 */
export function useProducts(options?: {
  page?: number;
  limit?: number;
  category?: string;
}) {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let mounted = true;
    
    setLoading(true);
    fetchProducts(options)
      .then(({ products, total }) => {
        if (mounted) {
          setProducts(products);
          setTotal(total);
          setError(null);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err);
          setProducts([]);
          setTotal(0);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [JSON.stringify(options)]);

  return { products, total, loading, error };
}

/**
 * React hook for fetching a single product
 */
export function useProduct(id: string | undefined) {
  const [product, setProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (!id) {
      setProduct(null);
      setLoading(false);
      return;
    }

    let mounted = true;
    
    setLoading(true);
    fetchProduct(id)
      .then((product) => {
        if (mounted) {
          setProduct(product);
          setError(null);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err);
          setProduct(null);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  return { product, loading, error };
}

// For React import
import * as React from 'react';
