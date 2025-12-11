import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Filter, Star } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { ProductCarousel } from "@/components/ProductCarousel";
import { fetchProducts, getProductPrices, type Product } from "@/lib/products";

const PRODUCTS_PER_PAGE = 20;

export default function Products() {
  const [serverProducts, setServerProducts] = useState<Product[]>([]);
  useEffect(() => {
    fetchProducts({ limit: 100 }).then(({ products }) => {
      setServerProducts(products);
    });
  }, []);

  const categorySet = new Set(
    serverProducts.map((p) => {
      const c = p.category ?? "";
      if (typeof c === "string") return c.split(" > ")[0];
      return (c.name || c.title || "Other");
    }),
  );
  const categories = ["All", ...Array.from(categorySet).sort()];
  // PRODUCTS_PER_PAGE is declared at top
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  
  const selectedCategory = searchParams.get("category") || "all";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const filteredProducts = useMemo(() => {
    return serverProducts.filter((product) => {
      if (selectedCategory === "all") return true;
      const cat = (product.category && (product.category.name || product.category)) || "Other";
      return cat.toLowerCase() === selectedCategory.toLowerCase();
    });
  }, [serverProducts, selectedCategory]);

  const getCategoryLabel = (category: any) => {
    if (!category) return "Other";
    if (typeof category === "string") return category.split(" > ")[0];
    return category.name || category.title || "Other";
  };

// PRODUCTS_PER_PAGE is defined at top

  

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + PRODUCTS_PER_PAGE,
  );

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams);
    if (category === "All") {
      params.delete("category");
    } else {
      params.set("category", category.toLowerCase());
    }
    params.set("page", "1");
    setSearchParams(params);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-secondary/20">
        {/* Page Header */}
        <div className="bg-white border-b border-border">
          <div className="container max-w-7xl py-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Agricultural Products
            </h1>
            <p className="text-muted-foreground">
              Showing {paginatedProducts.length} of {filteredProducts.length} products
            </p>
          </div>
        </div>

        <div className="container max-w-7xl py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Filters */}
            <div
              className={`${
                showFilters ? "block" : "hidden"
              } lg:block bg-white rounded-lg p-6 border border-border h-fit`}
            >
              <button
                onClick={() => setShowFilters(false)}
                className="lg:hidden w-full text-left font-semibold mb-4"
              >
                ← Back
              </button>

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Category
                </h3>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={`w-full text-left px-3 py-2 rounded transition-colors text-sm ${
                        (category === "All" && !selectedCategory) ||
                        selectedCategory === category.toLowerCase()
                          ? "bg-primary text-primary-foreground font-medium"
                          : "hover:bg-secondary text-foreground"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Count */}
              <div className="pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Total:{" "}
                  <span className="font-semibold">
                    {filteredProducts.length}
                  </span>{" "}
                  items
                </p>
              </div>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              <button
                onClick={() => setShowFilters(true)}
                className="lg:hidden mb-6 flex items-center gap-2 text-foreground font-semibold bg-white border border-border rounded px-4 py-2"
              >
                <Filter className="w-4 h-4" />
                Show Filters
              </button>

              {paginatedProducts.length === 0 ? (
                <div className="bg-white rounded-lg border border-border p-12 text-center">
                  <p className="text-muted-foreground text-lg mb-4">
                    No products found
                  </p>
                  <Button asChild>
                    <Link to="/products">Reset Filters</Link>
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {paginatedProducts.map((product) => {
                      // normalize fields from different product schemas
                      const name = product.name || product.title || product.product_id || "Unnamed Product";
                      
                      // Use centralized price calculation that considers SKUs
                      const { price: priceNum, mrp, discount, hasSKUs } = getProductPrices(product);
                      
                      // Handle images array - can be array of strings or objects
                      const rawImages = product.images && Array.isArray(product.images) && product.images.length > 0
                        ? product.images.map((i: any) => {
                            if (typeof i === 'string') return i;
                            return i.url || i.image_url || i.src || i.path || '';
                          }).filter(Boolean)
                        : [];
                      
                      const firstImage = rawImages.length > 0 ? rawImages[0] : null;

                      // availability can be boolean in your DB, or a string in other APIs
                      const availabilityLabel = typeof product.availability === "boolean"
                        ? (product.availability ? "In Stock" : "Out of Stock")
                        : (product.availability || "Unknown");

                      const brand = product.brand || product.manufacturer || "";
                      const sku = product.sku || product.product_id || "";

                      return (
                        <Link key={product.id} to={`/products/${product.id}`} className="group">
                          <div className="bg-white border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all relative">
                            {/* Discount Badge */}
                            {discount > 0 && (
                              <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-tr-xl rounded-bl-xl font-bold text-sm z-10">
                                {discount}% OFF
                              </div>
                            )}

                            {/* Wishlist Heart */}
                            <button
                              className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:bg-gray-50 z-10"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                            >
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                            </button>

                            {/* Product Image or Placeholder */}
                            <div className="relative w-full h-0 pb-[100%] overflow-hidden bg-white">
                              {firstImage ? (
                                <div className="absolute inset-0">
                                  <img 
                                    src={firstImage} 
                                    alt={name}
                                    className="w-full h-full object-contain p-4"
                                  />
                                </div>
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-300 bg-gray-50">
                                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>

                            <div className="p-3">
                              <h3 className="font-semibold text-foreground mb-1.5 line-clamp-2 group-hover:text-primary transition-colors text-sm leading-tight">
                                {name}
                              </h3>

                              <div className="text-xs text-muted-foreground mb-2">
                                {brand}
                              </div>

                              {/* Price Section */}
                              <div className="mb-3">
                                <div className="flex items-baseline gap-1.5">
                                  <span className="text-lg font-bold text-foreground">
                                    ₹{priceNum.toLocaleString("en-IN")}
                                  </span>
                                  {mrp > priceNum && (
                                    <span className="text-xs text-gray-400 line-through">
                                      ₹{mrp.toLocaleString("en-IN")}
                                    </span>
                                  )}
                                </div>
                                {discount > 0 && (
                                  <div className="flex items-center gap-0.5 mt-0.5">
                                    <svg className="w-3.5 h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-xs text-green-600 font-semibold">
                                      Save ₹{(mrp - priceNum).toLocaleString("en-IN")}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Size Dropdown with SKU Variants */}
                              {product.skus && product.skus.length > 0 && (
                                <div className="mb-2">
                                  <label className="text-xs font-semibold text-foreground mb-1.5 block">
                                    Size
                                  </label>
                                  <select
                                    className="w-full border border-gray-300 rounded-md px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                    }}
                                    onChange={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                    }}
                                  >
                                    {product.skus.map((skuItem: any, idx: number) => {
                                      // Format SKU label with quantity and unit
                                      const quantity = skuItem.quantity || '';
                                      const unitType = skuItem.unit_type || '';
                                      const piecesPerBox = skuItem.pieces_per_box;
                                      
                                      let skuLabel = quantity;
                                      if (unitType) {
                                        skuLabel = `${quantity} ${unitType}`;
                                      }
                                      if (piecesPerBox && piecesPerBox > 1) {
                                        skuLabel += ` (Value pack)`;
                                      }
                                      
                                      return (
                                        <option key={skuItem.id || idx} value={skuItem.id}>
                                          {skuLabel}
                                        </option>
                                      );
                                    })}
                                  </select>
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-12 flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handlePageChange(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>

                      <div className="flex gap-1">
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1,
                        ).map((page) => (
                          <Button
                            key={page}
                            variant={
                              page === currentPage ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handlePageChange(
                            Math.min(totalPages, currentPage + 1),
                          )
                        }
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}

                  {/* Pagination Info */}
                  <div className="mt-4 text-center text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages} • Showing{" "}
                    {paginatedProducts.length} products
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
