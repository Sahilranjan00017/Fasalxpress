import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import QRCode from "react-qr-code";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { ArrowLeft, ShoppingCart, Check } from "lucide-react";

// Sample products data
const sampleProducts = [
  {
    id: 1,
    name: "Organic Fertilizer 5kg",
    price: 899,
    originalPrice: 1099,
    image:
      "https://images.unsplash.com/photo-1586771107445-d3ca888129dc?w=800&auto=format&fit=crop&q=60",
    category: "Crop Nutrition",
    description:
      "Premium organic fertilizer for healthy plant growth and improved soil structure.",
    longDescription: `This organic fertilizer is specially formulated with a balanced NPK ratio to provide all essential nutrients for optimal plant growth. It enhances soil structure and promotes beneficial microbial activity.
    
Key Features:
• 100% organic and natural ingredients
• Improves soil structure and fertility
• Enhances plant growth and yield
• Sustainable farming solution
• Suitable for vegetables, fruits, and cereals

Usage: Apply 5-10 kg per 100 sq.ft depending on soil condition and crop requirement. Mix well with soil before planting.`,
    inStock: true,
    rating: 4.7,
    reviews: 215,
  },
  {
    id: 2,
    name: "Premium Hybrid Tomato Seeds 50g",
    price: 375,
    originalPrice: 450,
    image:
      "https://images.unsplash.com/photo-1592841657303-37ff62805338?w=800&auto=format&fit=crop&q=60",
    category: "Seeds",
    description:
      "High-yield hybrid tomato seeds with disease resistance and superior taste.",
    longDescription: `Saksham is a premium hybrid tomato seed variety offering uniform fruits with excellent taste and moderate disease resistance. 
    
Key Features:
• High-yield hybrid variety
• Uniform fruit size and shape
• Good taste and flavor
• Disease resistant strains
• Suitable for both open field and greenhouse cultivation
• Early maturing variety

Recommended Spacing: 45x45 cm
Yield: 30-40 tons/hectare under proper management`,
    inStock: true,
    rating: 4.6,
    reviews: 189,
  },
  {
    id: 3,
    name: "Vayego Insecticide 500ml",
    price: 657,
    originalPrice: 750,
    image:
      "https://images.unsplash.com/photo-1584622246189-e8c4e6ffc0f1?w=800&auto=format&fit=crop&q=60",
    category: "Crop Protection",
    description:
      "Systemic insecticide for wide-spectrum control of lepidopteran pests.",
    longDescription: `Vayego is a systemic insecticide from Bayer offering wide-spectrum control of lepidopteran pests in vegetables and cereals.
    
Key Features:
• Effective at low doses
• Long-lasting protection
• Systemic action
• Wide-spectrum pest control
• Safe for beneficial insects when used correctly
• Suitable for foliar spray applications

Recommended Dosage: 0.5-1.0 ml per liter of water
Spray Application: Early morning or late evening for best results`,
    inStock: true,
    rating: 4.8,
    reviews: 267,
  },
  {
    id: 4,
    name: "Score Fungicide 250g",
    price: 233,
    originalPrice: 300,
    image:
      "https://images.unsplash.com/photo-1559027615-cd2628902d4a?w=800&auto=format&fit=crop&q=60",
    category: "Crop Protection",
    description:
      "Broad-spectrum fungicide for control of fungal diseases in crops.",
    longDescription: `Score is a broad-spectrum fungicide recommended for control of fungal diseases such as blight and rust in vegetables and fruits.
    
Key Features:
• Broad-spectrum action
• Prevents spore germination
• Protective and curative action
• Long residual activity
• Safe on sensitive crops
• Ideal for disease management rotation

Application Rate: 250-300 gm per acre
Coverage: Uniform spray coverage on all plant parts for maximum efficacy`,
    inStock: true,
    rating: 4.5,
    reviews: 142,
  },
  {
    id: 5,
    name: "Nano Urea Liquid 500ml",
    price: 240,
    originalPrice: 320,
    image:
      "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&auto=format&fit=crop&q=60",
    category: "Crop Nutrition",
    description:
      "Advanced nano urea for precise nitrogen delivery and improved nutrient uptake.",
    longDescription: `Nano Urea offers precise nitrogen delivery via foliar application, enhancing nitrogen use efficiency and reducing conventional urea dependence.
    
Key Features:
• Nano-particle technology
• Enhanced nutrient absorption
• Reduced environmental impact
• Cost-effective solution
• Suitable for all crops
• Easy foliar application

Dosage: 5 ml per liter of water
Application: 2-3 sprays during vegetative growth period
Benefits: Improved yield, quality, and nutrient use efficiency`,
    inStock: true,
    rating: 4.6,
    reviews: 198,
  },
];

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  category: string;
  description: string;
  longDescription: string;
  inStock: boolean;
  rating: number;
  reviews: number;
}

const OrderViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, isInCart, getItemQuantity } = useCart();
  const [showQR, setShowQR] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const [order, setOrder] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        const userId = localStorage.getItem('agrobuild_user_id');
        const res = await fetch(`/api/orders/${id}?userId=${userId}`);
        if (!res.ok) return;
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        console.error('Failed to load order', err);
      }
    })();
  }, [id]);
  
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4 text-center">Order Not Found</h2>
            <p className="text-gray-600 mb-6 text-center">The order you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/orders')} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  // derive a display product from the order items (fallback to sampleProducts[0])
  const displayProduct: Product =
    (order.items && order.items[0] && order.items[0].product) || sampleProducts[0];

  const currentQuantityInCart = getItemQuantity(String(displayProduct.id));
  const discount = Math.round(
    ((displayProduct.originalPrice - displayProduct.price) / displayProduct.originalPrice) * 100,
  );
  const upiLink = `upi://pay?pa=example@okhdfcbank&pn=AgroBuild&am=${displayProduct.price}&tn=Order%20Payment`;

  const handleAddToCart = () => {
    setIsAddingToCart(true);
    addToCart({
      productId: String(displayProduct.id),
      name: displayProduct.name,
      price: displayProduct.price,
      image: displayProduct.image,
      category: displayProduct.category,
      maxQuantity: 100,
    });

    toast.success("Added to cart", {
      description: `${displayProduct.name} has been added to your cart`,
    });

    setTimeout(() => setIsAddingToCart(false), 1000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setShowQR(true);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b z-10">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Image Section */}
          <div className="lg:col-span-1 flex items-start">
            <Card className="w-full sticky top-24">
              <CardContent className="p-0">
                <div className="relative w-full bg-gray-100 rounded-t-lg overflow-hidden">
                  <img
                    src={displayProduct.image}
                    alt={displayProduct.name}
                    className="w-full h-80 object-cover"
                  />
                  {discount > 0 && (
                    <Badge className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white">
                      {discount}% OFF
                    </Badge>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(displayProduct.rating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {displayProduct.rating} ({displayProduct.reviews} reviews)
                    </span>
                  </div>
                  <Badge variant="outline" className="bg-green-50">
                    {displayProduct.inStock ? "In Stock" : "Out of Stock"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Details Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div>
                  <Badge variant="outline" className="mb-2">
                    {displayProduct.category}
                  </Badge>
                  <CardTitle className="text-3xl font-bold">
                    {displayProduct.name}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price Section */}
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl font-bold text-gray-900">
                      ₹{displayProduct.price.toLocaleString()}
                    </span>
                    {displayProduct.originalPrice && (
                      <span className="text-xl text-gray-500 line-through">
                        ₹{displayProduct.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    Inclusive of all taxes
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">About this product</h3>
                  <p className="text-gray-700 whitespace-pre-line">
                    {displayProduct.longDescription}
                  </p>
                </div>

                {/* Quantity Selector */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Quantity</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(quantity - 1)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                      >
                        −
                      </button>
                      <span className="px-6 py-2 border-l border-r text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(quantity + 1)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                    {currentQuantityInCart > 0 && (
                      <span className="text-sm text-emerald-600 flex items-center">
                        <Check className="h-4 w-4 mr-1" />
                        {currentQuantityInCart} in cart
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <Button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || !displayProduct.inStock}
                    size="lg"
                    variant="outline"
                    className="border-2 hover:bg-gray-50"
                  >
                    {isAddingToCart ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                        Adding...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleBuyNow}
                    disabled={!displayProduct.inStock}
                    size="lg"
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Buy Now
                  </Button>
                </div>

                {!displayProduct.inStock && (
                  <p className="text-sm text-red-600 text-center">
                    This product is currently out of stock
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* QR Code Payment Section */}
        {showQR && (
          <Card className="mt-8 border-2 border-emerald-200 bg-emerald-50">
            <CardHeader className="bg-emerald-100 border-b">
              <CardTitle className="text-emerald-900">
                Payment via QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="flex flex-col items-center gap-8 pb-8">
                <div className="space-y-2 text-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Scan to Pay
                  </h3>
                  <p className="text-gray-600">
                    Use any UPI app to complete the payment
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg border-4 border-gray-200">
                  <QRCode
                    value={upiLink}
                    size={256}
                    level="H"
                  />
                </div>

                <div className="bg-white p-4 rounded-lg w-full max-w-md">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b">
                      <span className="text-gray-700">Product Price:</span>
                      <span className="font-semibold">
                        ₹{displayProduct.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b">
                      <span className="text-gray-700">Quantity:</span>
                      <span className="font-semibold">{quantity}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold text-emerald-600">
                      <span>Total Amount:</span>
                      <span>
                        ₹{(displayProduct.price * quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-center text-sm text-gray-600 bg-blue-50 p-4 rounded-lg w-full max-w-md">
                  <p className="font-medium text-blue-900 mb-1">
                    💳 Payment Methods
                  </p>
                  <p>Google Pay • PhonePe • PayTM • BHIM • WhatsApp Pay</p>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                  <Button
                    variant="outline"
                    onClick={() => setShowQR(false)}
                    className="border-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => {
                      toast.success(
                        "Payment initiated! Scan the QR code with your UPI app.",
                        {
                          description: `Amount: ₹${(displayProduct.price * quantity).toLocaleString()}`,
                        },
                      );
                      setShowQR(false);
                    }}
                  >
                    Confirm Payment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OrderViewPage;
