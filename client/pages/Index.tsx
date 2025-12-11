import React, { useEffect, useState, useRef } from "react";
import { Header } from "@/components/layout/Header";
import BannerCarousel from "@/components/BannerCarousel";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Zap,
  TrendingUp,
  Package,
  Truck,
  Shield,
  Star,
  ArrowRight,
} from "lucide-react";
import { fetchFeaturedProducts, fetchProducts, getProductPrices, type Product } from "@/lib/products";

const categories = [
  { id: 1, name: "Animal Husbandry", icon: "🐄", count: 1250 },
  { id: 2, name: "Aquaculture", icon: "🐟", count: 850 },
  { id: 3, name: "Crop Care", icon: "🌱", count: 2300 },
  { id: 4, name: "Crop Nutrition", icon: "🌾", count: 1800 },
  { id: 5, name: "Crop Protection", icon: "🛡️", count: 1950 },
  { id: 6, name: "Equipment", icon: "🚜", count: 3200 },
];

export default function Index() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    fetchFeaturedProducts(6).then((products) => {
      if (mounted) {
        setProducts(products);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    // Fetch all products for search
    fetchProducts({ limit: 100 }).then(({ products }) => {
      const query = searchQuery.toLowerCase();
      const filtered = products.filter((product) => {
        const title = (product.title || product.name || "").toLowerCase();
        const brand = (product.brand || "").toLowerCase();
        const category = typeof product.category === "string" 
          ? product.category.toLowerCase()
          : (product.category?.name || "").toLowerCase();
        
        return title.includes(query) || brand.includes(query) || category.includes(query);
      });
      
      setSearchResults(filtered.slice(0, 10)); // Limit to 10 results
      setShowSearchResults(true);
    });
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to products page with search query
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <>
      <Header />
      <main className="w-full">
        {/* Search + Banner Area */}
        <section className="py-8 bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 border-b border-emerald-100">
          <div className="container max-w-7xl">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 w-full relative" ref={searchRef}>
                <form onSubmit={handleSearchSubmit} className="w-full bg-white p-1 rounded-full shadow-lg border border-emerald-200 hover:shadow-xl transition-shadow">
                  <div className="flex gap-2 items-center px-2 py-1">
                    <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input
                      id="site-search"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => searchQuery.trim().length >= 2 && setShowSearchResults(true)}
                      placeholder="Search for Products, Brands & Categories..."
                      className="w-full px-4 py-3 rounded-full bg-white border-0 focus:outline-none text-gray-800 placeholder-gray-400"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setShowSearchResults(false);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                    <button type="submit" className="px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:from-emerald-600 hover:to-teal-600 transition whitespace-nowrap shadow-md">Search</button>
                  </div>
                </form>

                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
                    <div className="p-2">
                      <div className="text-xs text-gray-500 px-3 py-2 font-semibold">
                        Found {searchResults.length} product{searchResults.length !== 1 ? 's' : ''}
                      </div>
                      {searchResults.map((product) => {
                        const { price, mrp, discount } = getProductPrices(product);
                        const image = product.images?.[0] || product.image;
                        
                        return (
                          <Link
                            key={product.id}
                            to={`/products/${product.id}`}
                            onClick={() => {
                              setShowSearchResults(false);
                              setSearchQuery("");
                            }}
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition"
                          >
                            <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                              {image ? (
                                <img src={image} alt={product.title || product.name} className="w-full h-full object-contain" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm text-gray-900 truncate">{product.title || product.name}</h4>
                              <p className="text-xs text-gray-500 truncate">{product.brand}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm font-bold text-green-600">₹{price.toLocaleString('en-IN')}</span>
                                {discount > 0 && (
                                  <>
                                    <span className="text-xs text-gray-400 line-through">₹{mrp.toLocaleString('en-IN')}</span>
                                    <span className="text-xs text-orange-600 font-semibold">{discount}% OFF</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        );
                      })}
                    </div>
                    <div className="border-t p-3">
                      <Link
                        to={`/products?search=${encodeURIComponent(searchQuery)}`}
                        onClick={() => {
                          setShowSearchResults(false);
                          setSearchQuery("");
                        }}
                        className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold flex items-center justify-center gap-2"
                      >
                        View all results
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                )}
                
                {showSearchResults && searchResults.length === 0 && searchQuery.trim().length >= 2 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-6 text-center z-50">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-600 font-medium mb-1">No products found</p>
                    <p className="text-sm text-gray-500">Try searching with different keywords</p>
                  </div>
                )}
              </div>

              <div className="w-full md:w-2/3">
                <BannerCarousel />
              </div>
            </div>
          </div>
        </section>

        {/* Featured Categories with Images & Hover Reveal */}
        <section className="py-12 bg-gradient-to-b from-emerald-50 via-green-50 to-white">
          <div className="container max-w-7xl">
            <div className="mb-10 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Shop by Category</h2>
              <p className="text-lg text-gray-600">Explore our premium agricultural products</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Crop Protection Card */}
              <div className="group relative h-72 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
                <img src="https://imgs.search.brave.com/JTqjMeUNfFiFB8-VMlMXtTxPEGQSFrRuOYIG-3QpLs4/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wNDgv/ODEwLzgyMS9zbWFs/bC9hZ3Jvbm9taXN0/LWluc3BlY3RzLXNv/eWJlYW4tY3JvcC1p/bi1hZ3JpY3VsdHVy/YWwtZmllbGQtYWdy/by1jb25jZXB0LWZh/cm1lci1pbi1zb3li/ZWFuLXBsYW50YXRp/b24tb24tZmFybS1w/aG90by5qcGc" alt="Crop Protection" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <h3 className="text-2xl font-bold text-white mb-3">Crop Protection</h3>
                  <p className="text-emerald-100 text-sm mb-4">Insecticide, Fungicides, Herbicides</p>
                  <div className="flex gap-2 flex-wrap opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-sm font-semibold transition">Insecticide</button>
                    <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-sm font-semibold transition">Fungicides</button>
                    <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-sm font-semibold transition">Herbicides</button>
                  </div>
                </div>
              </div>

              {/* Equipments Card */}
              <div className="group relative h-72 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
                <img src="https://plus.unsplash.com/premium_photo-1661963729315-3680786a256b?q=80&w=1816&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Equipments" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <h3 className="text-2xl font-bold text-white mb-3">Equipments</h3>
                  <p className="text-emerald-100 text-sm mb-4">Sprayer & more</p>
                  <div className="flex gap-2 flex-wrap opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-sm font-semibold transition">Sprayer</button>
                  </div>
                </div>
              </div>

              {/* Animal Husbandry Card */}
              <div className="group relative h-72 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
                <img src="https://images.unsplash.com/photo-1484557985045-edf25e08da73?q=80&w=1373&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Animal Husbandry" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <h3 className="text-2xl font-bold text-white mb-3">Animal Husbandry</h3>
                  <p className="text-emerald-100 text-sm mb-4">Cattle, Poultry & more</p>
                  <div className="flex gap-2 flex-wrap opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-sm font-semibold transition">Cattle Feed</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-green-500 to-teal-400 py-20 md:py-32">
          <div className="container max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="animate-fade-in">
                <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
                  Best Deals in Bangalore
                </h1>
                <p className="text-lg text-primary-foreground/90 mb-8 leading-relaxed">
                  Shop from multiple vendors, always get the lowest price.
                  Compare, save, and enjoy fast delivery.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="bg-accent hover:bg-accent/90" asChild>
                    <Link to="/products">
                      Start Shopping <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-primary-foreground text-primary-foreground bg-primary-foreground/10"
                  >
                    Learn More
                  </Button>
                </div>
              </div>

              {/* Hero Illustration */}
              <div className="flex justify-center items-center animate-fade-in" style={{ animationDelay: "0.1s" }}>
                <div className="text-7xl md:text-9xl opacity-80">🛍️</div>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/10 to-transparent">
            <div className="container max-w-7xl py-8">
              <div className="grid grid-cols-3 gap-8 text-primary-foreground">
                <div>
                  <div className="text-2xl md:text-3xl font-bold">5000+</div>
                  <div className="text-sm opacity-90">Products</div>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-bold">50+</div>
                  <div className="text-sm opacity-90">Vendors</div>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-bold">24/7</div>
                  <div className="text-sm opacity-90">Support</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-background to-secondary/20">
          <div className="container max-w-7xl">
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Shop by Category
              </h2>
              <p className="text-muted-foreground">
                Explore our wide range of products across different categories
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/products?category=${category.name.toLowerCase()}`}
                  className="group"
                >
                  <div className="bg-white border border-border rounded-lg p-6 text-center hover:shadow-lg hover:border-primary transition-all cursor-pointer">
                    <div className="text-4xl mb-3">{category.icon}</div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {category.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {category.count} items
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Zap className="w-7 h-7 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  Best Prices
                </h3>
                <p className="text-sm text-muted-foreground">
                  Compare vendors and get the lowest price guaranteed
                </p>
              </div>

              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="w-14 h-14 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Truck className="w-7 h-7 text-accent" />
                  </div>
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  Fast Delivery
                </h3>
                <p className="text-sm text-muted-foreground">
                  Free delivery on orders over ₹500
                </p>
              </div>

              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Shield className="w-7 h-7 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  Secure Payment
                </h3>
                <p className="text-sm text-muted-foreground">
                  Multiple payment options with complete security
                </p>
              </div>

              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="w-14 h-14 bg-accent/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-7 h-7 text-accent" />
                  </div>
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  Real-time Updates
                </h3>
                <p className="text-sm text-muted-foreground">
                  Live vendor stock and price updates
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-16 md:py-24 bg-secondary/10">
          <div className="container max-w-7xl">
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Featured Products
              </h2>
              <p className="text-muted-foreground">
                Check out our best-selling and most-rated items
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => {
                const id = product.id || product.product_id || product._id;
                const name = product.name || product.title || "Product";
                const category = product.category || product.category_name || "";
                const { price, mrp, discount, hasSKUs } = getProductPrices(product);
                const image = product.image || (product.images && product.images[0]) || "🛒";
                const rating = product.rating || product.avg_rating || 4.5;
                const reviews = product.reviews || product.review_count || 0;
                const brand = product.brand || "";
                const productSkus = product.skus || [];

                return (
                  <Link key={id} to={`/products/${id}`} className="group">
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

                      <div className="bg-gradient-to-br from-primary/5 to-accent/5 h-48 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform overflow-hidden">
                        {typeof image === "string" && image.startsWith("http") ? (
                          <img src={image} alt={name} className="w-full h-full object-cover" />
                        ) : (
                          image
                        )}
                      </div>

                      <div className="p-5">
                        <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors text-base min-h-12">
                          {name}
                        </h3>

                        <div className="text-sm text-muted-foreground mb-3">
                          {brand}
                        </div>

                        {/* Price Section */}
                        <div className="mb-4">
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-foreground">
                              ₹{Number(price).toLocaleString("en-IN")}
                            </span>
                            {mrp > price && (
                              <span className="text-sm text-gray-400 line-through">
                                ₹{Number(mrp).toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                          {discount > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm text-green-600 font-semibold">
                                Save ₹{(mrp - price).toLocaleString("en-IN")}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Size Dropdown with SKU Variants */}
                        {productSkus.length > 0 && (
                          <div className="mb-4">
                            <label className="text-sm font-medium text-foreground mb-2 block">
                              Size
                            </label>
                            <select
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              onChange={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                            >
                              {productSkus.map((skuItem: any, idx: number) => {
                                const skuLabel = `${skuItem.quantity}${skuItem.pieces_per_box ? ` (${skuItem.pieces_per_box} pcs/box)` : ''}`;
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

            <div className="mt-12 text-center">
              <Button size="lg" variant="outline" asChild>
                <Link to="/products">
                  View All Products <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Promo Section */}
        <section className="py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="container max-w-7xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Limited Time Offer
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Use coupon code <span className="font-bold text-accent">FIRST100</span> on your first order above ₹3000 to get ₹100 OFF + FREE delivery!
            </p>
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
              <Link to="/products">Shop Now</Link>
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-foreground/5 border-t border-border py-12">
          <div className="container max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h4 className="font-semibold text-foreground mb-4">About</h4>
                <p className="text-sm text-muted-foreground">
                  The best multi-vendor marketplace for Bangalore
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>
                    <a href="#" className="hover:text-foreground transition-colors">
                      Products
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-foreground transition-colors">
                      About Us
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-foreground transition-colors">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-4">Support</h4>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>
                    <a href="#" className="hover:text-foreground transition-colors">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-foreground transition-colors">
                      Delivery Info
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-foreground transition-colors">
                      Returns
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-4">Legal</h4>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>
                    <a href="#" className="hover:text-foreground transition-colors">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-foreground transition-colors">
                      Terms of Service
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
              <p>© 2025 Fasalxpress. All rights reserved. Based in Bangalore, India.</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
