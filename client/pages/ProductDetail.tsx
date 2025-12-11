import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Star,
  Truck,
  Shield,
  MapPin,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { fetchProduct, getProductPrices, type Product } from "@/lib/products";

// Extended product interface to include our custom fields
interface ExtendedProduct {
  id: string;
  name: string;
  category: string;
  price_inr: string;
  url: string;
  brand: string;
  sku: string;
  availability: string;
  description: string;
  rating?: number;
  reviews?: number;
  images?: string[];
}

const ReviewsData = [
  {
    author: "Rajesh Kumar",
    rating: 5,
    text: "Excellent product! Very satisfied with the quality and delivery.",
    verified: true,
  },
  {
    author: "Priya Singh",
    rating: 4,
    text: "Good quality, but delivery took a bit longer than expected.",
    verified: true,
  },
  {
    author: "Amit Patel",
    rating: 5,
    text: "Best agricultural product I have used. Highly recommended!",
    verified: true,
  },
  {
    author: "Neha Verma",
    rating: 4,
    text: "Value for money. Good product overall.",
    verified: false,
  },
];

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, isInCart, getItemQuantity } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedSku, setSelectedSku] = useState<string | null>(null);

  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    fetchProduct(id).then((product) => {
      if (mounted) {
        setProduct(product);
      }
    });
    return () => {
      mounted = false;
    };
  }, [id]);

  if (!product) {
    return (
      <div>
        <Header />
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
            <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
            <p className="text-gray-600 mb-6">
              The product you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate("/products")} className="w-full">
              Back to Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // normalize images - only use actual product images from database
  const images = (product.images && Array.isArray(product.images) && product.images.length)
    ? product.images.map((img: any) => {
        if (!img) return null;
        if (typeof img === 'string') return img;
        return img.url || img.image_url || img.src || img.path || img.file || null;
      }).filter(Boolean)
    : [];

  // Use centralized price calculation that considers SKUs
  const { price, mrp, discount, hasSKUs, lowestSKU } = getProductPrices(product);
  const currentQuantityInCart = getItemQuantity(product.id);
  const rating = 4.2;
  const reviewCount = 1248;
  
  // Calculate actual stock availability from SKUs
  const hasSkus = product.skus && product.skus.length > 0;
  const totalSkuStock = hasSkus 
    ? product.skus.reduce((sum: number, sku: any) => sum + (sku.stock || 0), 0)
    : 0;
  const hasAnySkuInStock = hasSkus 
    ? product.skus.some((sku: any) => sku.stock === undefined || sku.stock > 0)
    : true;
  
  // Use SKU stock if available, otherwise fall back to product availability
  const availabilityIsInStock = hasSkus ? hasAnySkuInStock : (
    typeof product.availability === 'boolean' 
      ? product.availability 
      : product.availability === 'In Stock'
  );
  const availabilityLabel = availabilityIsInStock ? 'In Stock' : 'Out of Stock';
  // compute a safe category label
  const categoryLabel = (() => {
    const catRaw = product.category;
    if (!catRaw) return 'Other';
    if (typeof catRaw === 'string') return catRaw.split(' > ')[0];
    if (catRaw.name) return catRaw.name;
    if (catRaw.title) return catRaw.title;
    return 'Other';
  })();

  const handleAddToCart = () => {
    // Check if SKU selection is required
    if (product.skus && product.skus.length > 0 && !selectedSku) {
      toast.error("Please select a variant", {
        description: "Select a size or variant before adding to cart",
      });
      return;
    }

    setIsAddingToCart(true);
    
    // Find selected SKU details if available
    const selectedSkuData = selectedSku && product.skus
      ? product.skus.find((s: any) => (s.id || s) === selectedSku)
      : null;
    
    const cartItemPrice = selectedSkuData?.unit_price || price;
    
    addToCart({
      id: product.id,
      productId: product.id,
      name: product.name || product.title || 'Unknown',
      price: cartItemPrice,
      image: typeof images[0] === 'string' ? images[0] : '',
      category: typeof product.category === 'string' ? product.category : (product.category?.name || product.category?.title || 'Other'),
      maxQuantity: 999,
      variantId: selectedSku || undefined, // Use variantId for SKU selection
    });

    const productName = product.name || product.title || 'Product';
    const skuSuffix = selectedSkuData ? ` (${selectedSkuData.unit_type} - ${selectedSkuData.quantity})` : '';
    const newQuantity = currentQuantityInCart + 1;
    
    if (currentQuantityInCart > 0) {
      toast.success("Updated cart", {
        description: `${productName}${skuSuffix} quantity updated to ${newQuantity}`,
      });
    } else {
      toast.success("Added to cart", {
        description: `${productName}${skuSuffix} has been added to your cart`,
      });
    }

    setTimeout(() => setIsAddingToCart(false), 500);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setTimeout(() => {
      navigate("/checkout");
    }, 500);
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="container max-w-7xl mx-auto px-4 py-3">
              <div className="text-sm text-gray-600">
                <a href="/products" className="text-blue-600 hover:underline">
                  Products
                </a>
                {" > "}
                {
                  (() => {
                    const catRaw = product.category;
                    let catLabel = "Other";
                    if (catRaw) {
                      if (typeof catRaw === 'string') catLabel = catRaw.split(" > ")[0];
                      else if (catRaw.name) catLabel = catRaw.name;
                      else if (catRaw.title) catLabel = catRaw.title;
                    }
                    return (
                      <>
                        <a href={`/products?category=${encodeURIComponent(catLabel.toLowerCase())}`} className="text-blue-600 hover:underline">
                          {catLabel}
                        </a>
                        {" > "}
                        <span className="text-gray-800">{product.name}</span>
                      </>
                    );
                  })()
                }
              </div>
          </div>
        </div>

        <div className="container max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left - Image Gallery */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-4 sticky top-20">
                <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4">
                  {images.length > 0 ? (
                    <>
                      <img
                        src={images[selectedImageIndex]}
                        alt={product.name}
                        className="w-full h-96 object-cover"
                      />
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-96 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <svg className="w-24 h-24 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p>No image available</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Image Thumbnails - Only show when multiple images */}
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`border-2 rounded-lg overflow-hidden ${
                        selectedImageIndex === idx
                          ? "border-blue-600"
                          : "border-gray-200"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`View ${idx + 1}`}
                        className="w-full h-20 object-cover"
                      />
                    </button>
                  ))}
                </div>
                )}
              </div>
            </div>

            {/* Middle & Right - Product Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Product Info Card */}
              <div className="bg-white rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                      {product.category}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {product.name}
                    </h1>
                  </div>
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className="p-2 hover:bg-gray-100 rounded-full transition"
                  >
                    <Heart
                      className={`w-6 h-6 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400"}`}
                    />
                  </button>
                </div>

                {/* Rating Section */}
                <div className="flex items-center gap-4 pb-4 border-b">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-blue-600 font-medium cursor-pointer hover:underline">
                    {rating} ({reviewCount.toLocaleString()} reviews)
                  </span>
                </div>

                {/* Brand & SKU */}
                <div className="grid grid-cols-2 gap-4 py-4 border-b">
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Brand</div>
                    <div className="font-semibold text-gray-900">
                      {product.brand}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase">SKU</div>
                    <div className="font-mono text-sm text-gray-900">
                      {product.sku}
                    </div>
                  </div>
                </div>

                {/* Price Section */}
                <div className="py-4 border-b">
                  {price > 0 ? (
                    <div>
                      <div className="flex items-baseline gap-3 mb-2">
                        <span className="text-4xl font-bold text-gray-900">
                          ₹{price.toLocaleString("en-IN")}
                        </span>
                        {hasSKUs && (
                          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded font-semibold">
                            Starting from
                          </span>
                        )}
                        {mrp > price && (
                          <>
                            <span className="text-xl text-gray-500 line-through">
                              ₹{mrp.toLocaleString("en-IN")}
                            </span>
                            <span className="text-lg font-semibold text-green-600">
                              {discount}% OFF
                            </span>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        Inclusive of all taxes
                        {hasSKUs && " • Multiple variants available"}
                      </div>
                      {mrp > price && (
                        <div className="mt-1 text-sm text-green-600 font-medium">
                          You save ₹{(mrp - price).toLocaleString("en-IN")}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-lg text-gray-600">
                      Price on request
                    </div>
                  )}
                </div>

                {/* Stock Status */}
                <div className="py-4 border-b">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${availabilityIsInStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`font-semibold ${availabilityIsInStock ? 'text-green-700' : 'text-red-700'}`}>{availabilityLabel}</span>
                    {availabilityIsInStock && (
                      <span className="text-sm text-gray-600 ml-2">
                        {availabilityLabel}
                      </span>
                    )}
                  </div>
                  {availabilityIsInStock && (
                    <div className="text-sm text-gray-600 mt-2">
                      Ships within 2-3 business days
                    </div>
                  )}
                </div>

                {/* Quantity & Actions */}
                <div className="py-4 space-y-4">
                  {/* SKU Variants Selector - Card Style like Screenshot */}
                  {product.skus && product.skus.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="text-base font-semibold text-gray-900">Size</div>
                          <div className="text-sm text-gray-600">{product.skus[0]?.quantity || '100 ml'}</div>
                        </div>
                      </div>
                      
                      <div className="text-sm font-semibold text-gray-900 mb-3">
                        Select Variant
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {product.skus.map((sku: any, idx: number) => {
                          const skuId = sku.id || idx;
                          const skuPrice = sku.unit_price || product.price;
                          const skuMrp = sku.unit_mrp || product.mrp;
                          const discount = skuMrp > skuPrice ? Math.round(((skuMrp - skuPrice) / skuMrp) * 100) : 0;
                          const isSelected = selectedSku === skuId;
                          const isBestSeller = idx === 0; // First variant as best seller
                          // If stock is undefined/null, treat as available (not out of stock)
                          const isOutOfStock = sku.stock !== undefined && sku.stock !== null && sku.stock <= 0;

                          return (
                            <div
                              key={skuId}
                              onClick={() => !isOutOfStock && setSelectedSku(skuId)}
                              className={`relative p-4 border-2 rounded-lg transition-all ${
                                isOutOfStock 
                                  ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                                  : isSelected
                                    ? 'border-blue-500 bg-blue-50 cursor-pointer'
                                    : 'border-gray-200 hover:border-gray-300 bg-white cursor-pointer'
                              }`}
                            >
                              {/* Discount Badge */}
                              {discount > 0 && !isOutOfStock && (
                                <div className="absolute -top-2 -right-2 bg-orange-500 text-white px-2 py-0.5 rounded text-xs font-bold">
                                  {discount}% OFF
                                </div>
                              )}
                              
                              {/* Out of Stock Badge */}
                              {isOutOfStock && (
                                <div className="absolute -top-2 -right-2 bg-red-500 text-white px-2 py-0.5 rounded text-xs font-bold">
                                  OUT OF STOCK
                                </div>
                              )}
                              
                              {/* Variant Info */}
                              <div className="text-center">
                                {/* Variant Name or Unit Type */}
                                {sku.variant_name && (
                                  <div className="text-xs text-gray-500 mb-1 uppercase">
                                    {sku.variant_name}
                                  </div>
                                )}
                                
                                {/* Quantity with Unit Type */}
                                <div className="font-semibold text-gray-900 mb-1">
                                  {sku.quantity}
                                  {sku.unit_type && (
                                    <span className="text-xs text-gray-500 ml-1">
                                      ({sku.unit_type})
                                    </span>
                                  )}
                                </div>
                                
                                {/* Pricing */}
                                <div className="text-lg font-bold text-gray-900">
                                  ₹{skuPrice.toLocaleString()}
                                </div>
                                {skuMrp > skuPrice && (
                                  <div className="text-sm text-gray-400 line-through">
                                    ₹{skuMrp.toLocaleString()}
                                  </div>
                                )}
                                
                                {/* Stock Info */}
                                {!isOutOfStock && sku.stock !== undefined && sku.stock > 0 && sku.stock <= 10 && (
                                  <div className="text-xs text-orange-600 mt-1">
                                    Only {sku.stock} left
                                  </div>
                                )}
                              </div>
                              
                              {/* Best Seller Badge */}
                              {isBestSeller && isSelected && !isOutOfStock && (
                                <div className="mt-2 text-center">
                                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-semibold">
                                    Best Seller
                                  </span>
                                </div>
                              )}
                              
                              {/* Tags */}
                              {sku.tags && Object.keys(sku.tags).length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1 justify-center">
                                  {Object.entries(sku.tags).slice(0, 2).map(([key, value]: [string, any]) => (
                                    <span key={key} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                      {String(value)}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Pack/Box Information & SKU Details */}
                      {selectedSku && (() => {
                        const selectedSkuData = product.skus.find((s: any) => (s.id || product.skus.indexOf(s)) === selectedSku);
                        if (selectedSkuData) {
                          const hasPiecesPerBox = selectedSkuData.pieces_per_box && selectedSkuData.pieces_per_box > 1;
                          const boxPrice = selectedSkuData.box_price || (selectedSkuData.unit_price * (selectedSkuData.pieces_per_box || 1));
                          const boxMrp = selectedSkuData.box_mrp || (selectedSkuData.unit_mrp * (selectedSkuData.pieces_per_box || 1));
                          
                          return (
                            <div className="mt-4 space-y-3">
                              {/* SKU Information */}
                              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600">SKU Code:</span>
                                  <span className="font-mono font-semibold text-gray-900">
                                    {selectedSkuData.sku || 'N/A'}
                                  </span>
                                </div>
                                {selectedSkuData.stock !== undefined && (
                                  <div className="flex items-center justify-between text-sm mt-2">
                                    <span className="text-gray-600">Available Stock:</span>
                                    <span className={`font-semibold ${
                                      selectedSkuData.stock > 10 ? 'text-green-600' : 
                                      selectedSkuData.stock > 0 ? 'text-orange-600' : 'text-red-600'
                                    }`}>
                                      {selectedSkuData.stock > 0 ? `${selectedSkuData.stock} units` : 'Out of Stock'}
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Box Package Information */}
                              {hasPiecesPerBox && (
                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="text-sm text-gray-600 mb-1">
                                        📦 Box Package ({selectedSkuData.pieces_per_box} units)
                                      </div>
                                      <div className="text-lg font-bold text-green-700">
                                        ₹{boxPrice.toFixed(2)}
                                      </div>
                                      {boxMrp > boxPrice && (
                                        <div className="text-sm text-gray-500 line-through">
                                          ₹{boxMrp.toFixed(2)}
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <div className="text-xs text-gray-600">You Save</div>
                                      <div className="text-lg font-bold text-green-600">
                                        ₹{(boxMrp - boxPrice).toFixed(2)}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="mt-2 text-xs text-gray-600">
                                    Price per unit in box: ₹{(boxPrice / selectedSkuData.pieces_per_box).toFixed(2)}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}

                  <div>
                    <div className="text-sm font-semibold text-gray-900 mb-2">
                      Quantity
                    </div>
                    <div className="flex items-center border rounded-lg w-fit">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                      >
                        −
                      </button>
                      <span className="px-6 py-2 border-l border-r">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <Button
                      onClick={handleAddToCart}
                        disabled={
                          isAddingToCart || !availabilityIsInStock
                        }
                      size="lg"
                      variant="outline"
                      className="border-2 text-blue-600 hover:bg-blue-50"
                    >
                      {isAddingToCart ? (
                        <svg
                          className="animate-spin -ml-1 mr-2 h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      ) : null}
                      {currentQuantityInCart > 0 ? (
                        <>
                          In Cart <span className="ml-2 bg-blue-600 text-white rounded-full px-2 py-0 text-sm">{currentQuantityInCart}</span>
                        </>
                      ) : (
                        'Add to Cart'
                      )}
                    </Button>
                    <Button
                      onClick={handleBuyNow}
                        disabled={!availabilityIsInStock}
                      size="lg"
                      className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                    >
                      Buy Now
                    </Button>
                  </div>

                  {currentQuantityInCart > 0 && (
                    <div className="text-sm text-emerald-600">
                      ✓ {currentQuantityInCart} item(s) in your cart
                    </div>
                  )}
                </div>

                {/* Info Section */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t mt-6">
                  <div className="flex gap-3">
                    <Truck className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        Free Shipping
                      </div>
                      <div className="text-xs text-gray-600">
                        On orders above ₹500
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Shield className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        Secure Payment
                      </div>
                      <div className="text-xs text-gray-600">
                        100% secure transactions
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <MapPin className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        Local Brands
                      </div>
                      <div className="text-xs text-gray-600">
                        Support local farmers
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="lg:col-span-2">
              {/* About Product */}
              <div className="bg-white rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  About this product
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {product.description || product.long_description || product.technical_content || 'No description available'}
                </p>
              </div>

              {/* Technical Details Section */}
              {(product.classification || product.toxicity || product.technical_content || product.city) && (
                <div className="bg-white rounded-lg p-6 mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Technical Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.classification && (
                      <div className="flex items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm text-gray-500 mb-1">Classification</div>
                          <div className="font-semibold text-gray-900">{product.classification}</div>
                        </div>
                      </div>
                    )}
                    {product.toxicity && (
                      <div className="flex items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm text-gray-500 mb-1">Toxicity Level</div>
                          <div className="font-semibold text-gray-900">{product.toxicity}</div>
                        </div>
                      </div>
                    )}
                    {product.technical_content && (
                      <div className="flex items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm text-gray-500 mb-1">Technical Content</div>
                          <div className="font-semibold text-gray-900">{product.technical_content}</div>
                        </div>
                      </div>
                    )}
                    {product.city && (
                      <div className="flex items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm text-gray-500 mb-1">Available in City</div>
                          <div className="font-semibold text-gray-900">{product.city}</div>
                        </div>
                      </div>
                    )}
                    {product.country_of_origin && (
                      <div className="flex items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm text-gray-500 mb-1">Country of Origin</div>
                          <div className="font-semibold text-gray-900">{product.country_of_origin}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Product Descriptions - Mode of Action, Chemical Group, etc. */}
              {(product.descriptions || product.mode_of_action || product.chemical_group) && (
                <div className="bg-white rounded-lg p-6 mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Product Details
                  </h2>
                  <div className="space-y-4">
                    {/* If descriptions array exists (from product_descriptions table) */}
                    {product.descriptions && product.descriptions.length > 0 && product.descriptions[0] && (
                      <>
                        {product.descriptions[0].mode_of_entry && (
                          <div>
                            <div className="text-sm font-semibold text-gray-900 mb-1">Mode of Entry</div>
                            <div className="text-gray-700">{product.descriptions[0].mode_of_entry}</div>
                          </div>
                        )}
                        {product.descriptions[0].mode_of_action && (
                          <div>
                            <div className="text-sm font-semibold text-gray-900 mb-1">Mode of Action</div>
                            <div className="text-gray-700">{product.descriptions[0].mode_of_action}</div>
                          </div>
                        )}
                        {product.descriptions[0].chemical_group && (
                          <div>
                            <div className="text-sm font-semibold text-gray-900 mb-1">Chemical Group</div>
                            <div className="text-gray-700">{product.descriptions[0].chemical_group}</div>
                          </div>
                        )}
                        {product.descriptions[0].target_pests && (
                          <div>
                            <div className="text-sm font-semibold text-gray-900 mb-1">Target Pests</div>
                            <div className="text-gray-700">{product.descriptions[0].target_pests}</div>
                          </div>
                        )}
                        {product.descriptions[0].recommended_crops && (
                          <div>
                            <div className="text-sm font-semibold text-gray-900 mb-1">Recommended Crops</div>
                            <div className="text-gray-700">{product.descriptions[0].recommended_crops}</div>
                          </div>
                        )}
                        {product.descriptions[0].dosage_per_acre && (
                          <div>
                            <div className="text-sm font-semibold text-gray-900 mb-1">Dosage Per Acre</div>
                            <div className="text-gray-700">{product.descriptions[0].dosage_per_acre}</div>
                          </div>
                        )}
                        {product.descriptions[0].how_to_apply && (
                          <div>
                            <div className="text-sm font-semibold text-gray-900 mb-1">How to Apply</div>
                            <div className="text-gray-700">{product.descriptions[0].how_to_apply}</div>
                          </div>
                        )}
                      </>
                    )}
                    {/* Fallback to direct product fields */}
                    {!product.descriptions && product.mode_of_action && (
                      <div>
                        <div className="text-sm font-semibold text-gray-900 mb-1">Mode of Action</div>
                        <div className="text-gray-700">{product.mode_of_action}</div>
                      </div>
                    )}
                    {!product.descriptions && product.chemical_group && (
                      <div>
                        <div className="text-sm font-semibold text-gray-900 mb-1">Chemical Group</div>
                        <div className="text-gray-700">{product.chemical_group}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Trust Markers & Delivery Info */}
              {(product.cod_available || product.ready_to_ship || product.trust_markers) && (
                <div className="bg-white rounded-lg p-6 mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Delivery & Trust
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.cod_available && (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-green-600 text-sm">✓</span>
                        </div>
                        <span className="text-gray-700">Cash on Delivery Available</span>
                      </div>
                    )}
                    {product.ready_to_ship && (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-green-600 text-sm">✓</span>
                        </div>
                        <span className="text-gray-700">Ready to Ship</span>
                      </div>
                    )}
                    {product.trust_markers && typeof product.trust_markers === 'object' && (
                      <>
                        {product.trust_markers.original && (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 text-sm">✓</span>
                            </div>
                            <span className="text-gray-700">100% Original Products</span>
                          </div>
                        )}
                        {product.trust_markers.bestPrices && (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center">
                              <span className="text-orange-600 text-sm">✓</span>
                            </div>
                            <span className="text-gray-700">Best Prices</span>
                          </div>
                        )}
                        {product.trust_markers.securePayments && (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                              <span className="text-purple-600 text-sm">✓</span>
                            </div>
                            <span className="text-gray-700">Secure Payments</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Customer Reviews */}
              <div className="bg-white rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Customer Reviews
                </h2>

                <div className="mb-6">
                  <div className="flex items-center gap-4 pb-4 border-b">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-bold text-gray-900">
                        {rating} out of 5
                      </span>
                      <div className="text-xs text-gray-600">
                        {reviewCount.toLocaleString()} verified reviews
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {ReviewsData.map((review, idx) => (
                    <div key={idx} className="border-b pb-4 last:border-b-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {review.author}
                          </div>
                          {review.verified && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              ✓ Verified Purchase
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-gray-700 text-sm">{review.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div>
              <div className="bg-white rounded-lg p-6 sticky top-20">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Key Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-gray-500 uppercase">
                      Category
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {categoryLabel}
                    </div>
                  </div>
                  <div className="border-t pt-3">
                    <div className="text-xs text-gray-500 uppercase">
                      Availability
                    </div>
                    <div className={`text-sm font-semibold ${availabilityIsInStock ? 'text-green-700' : 'text-red-700'}`}>
                      {availabilityLabel}
                    </div>
                    {hasSkus && totalSkuStock > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        Total Stock: {totalSkuStock} units
                      </div>
                    )}
                  </div>
                  {product.brand && (
                    <div className="border-t pt-3">
                      <div className="text-xs text-gray-500 uppercase">
                        Brand
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {product.brand}
                      </div>
                    </div>
                  )}
                  {product.sku && (
                    <div className="border-t pt-3">
                      <div className="text-xs text-gray-500 uppercase">
                        Product SKU
                      </div>
                      <div className="text-sm font-mono text-gray-900">
                        {product.sku}
                      </div>
                    </div>
                  )}
                  {price > 0 && (
                    <div className="border-t pt-3">
                      <div className="text-xs text-gray-500 uppercase">
                        Price
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        ₹{price.toLocaleString("en-IN")}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
