import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Star, Truck, Shield, Check, ShoppingCart, ArrowLeft, Heart, Share2, ChevronDown, ChevronUp, Plus, Minus } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviews: number;
  inStock: boolean;
  maxQuantity: number;
  images: string[];
  description: string;
  highlights: string[];
  specifications: { name: string; value: string }[];
  vendor: {
    name: string;
    rating: number;
  };
  deliveryOptions: {
    type: string;
    days: string;
    charge: string;
  }[];
  offers: string[];
  emiOptions: string[];
}

const mockProduct: Product = {
  id: 1,
  name: 'Premium Organic Fertilizer 5kg',
  category: 'Crop Nutrition',
  price: 899,
  originalPrice: 1099,
  discount: 18,
  rating: 4.7,
  reviews: 215,
  inStock: true,
  maxQuantity: 10,
  images: [
    'https://images.unsplash.com/photo-1753232451855-4c91e4ec75a2?q=80&w=1796&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8b3JnYW5pYy1mZXJ0aWxpemVyfGVufDB8fDB8fHww',
  ],
  description: 'Premium organic fertilizer for healthy plant growth',
  highlights: [
    '100% organic and natural ingredients',
    'Improves soil structure and fertility',
    'Enhances plant growth and yield',
    'Safe for all plants and vegetables',
    'Eco-friendly and sustainable',
  ],
  specifications: [
    { name: 'Brand', value: 'AgroPro' },
    { name: 'Type', value: 'Organic Granular' },
    { name: 'Weight', value: '5 kg' },
    { name: 'NPK Ratio', value: '5-3-4' },
    { name: 'Coverage', value: 'Up to 100 sq.ft' },
    { name: 'Suitable For', value: 'All plants, vegetables, flowers' },
  ],
  vendor: {
    name: 'Organic Farms Co.',
    rating: 4.8,
  },
  deliveryOptions: [
    { type: 'Standard', days: '3-5 days', charge: 'Free' },
    { type: 'Express', days: '1-2 days', charge: '₹49' },
  ],
  offers: [
    'Bank Offer: 5% Cashback on Axis Bank Card',
    'Special Price: Get extra 5% off (price inclusive of discount)',
    'Partner Offer: Sign up for Pay Later and get GST invoice up to ₹1000',
  ],
  emiOptions: [
    'No cost EMI from ₹300/month',
    'Standard EMI also available',
  ],
};

const ProductDetailFlipkart = () => {
  const navigate = useNavigate();
  const { addToCart, isInCart, getItemQuantity } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showMoreHighlights, setShowMoreHighlights] = useState(false);
  const [showMoreSpecs, setShowMoreSpecs] = useState(false);
  const [showMoreOffers, setShowMoreOffers] = useState(false);
  const [pincode, setPincode] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [showPincodeInput, setShowPincodeInput] = useState(false);

  const product = mockProduct;
  const currentQuantityInCart = getItemQuantity(String(product.id));
  const canAddMore = currentQuantityInCart < product.maxQuantity;
  const isInCartFlag = isInCart(String(product.id));

  // Simulate delivery date calculation
  useEffect(() => {
    if (pincode && pincode.length === 6) {
      // In a real app, this would be an API call
      const estimatedDate = new Date();
      estimatedDate.setDate(estimatedDate.getDate() + 3); // 3 days from now
      setDeliveryDate(estimatedDate.toLocaleDateString('en-IN', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'short' 
      }));
    }
  }, [pincode]);

  const handleAddToCart = () => {
    setIsAddingToCart(true);
    
    addToCart({
      productId: String(product.id),
      name: product.name,
      price: product.price,
      image: product.images[0],
      category: product.category,
      maxQuantity: product.maxQuantity
    });
    
    toast.success('Added to cart', {
      description: `${product.name} has been added to your cart`,
      action: {
        label: 'View Cart',
        onClick: () => navigate('/cart')
      }
    });
    
    setTimeout(() => setIsAddingToCart(false), 1000);
  };
  
  const handleBuyNow = () => {
    if (!isInCartFlag) {
      handleAddToCart();
    }
    setTimeout(() => {
      navigate('/checkout');
    }, 500);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > product.maxQuantity) return;
    setQuantity(newQuantity);
  };

  const togglePincodeInput = () => setShowPincodeInput(!showPincodeInput);

  const renderHighlights = () => (
    <div className="space-y-2">
      <h3 className="text-lg font-medium text-gray-800">Highlights</h3>
      <ul className="space-y-1.5">
        {product.highlights.slice(0, showMoreHighlights ? undefined : 3).map((highlight, i) => (
          <li key={i} className="flex items-start">
            <span className="text-green-600 mr-2">•</span>
            <span className="text-gray-700">{highlight}</span>
          </li>
        ))}
      </ul>
      {product.highlights.length > 3 && (
        <button 
          onClick={() => setShowMoreHighlights(!showMoreHighlights)}
          className="text-blue-600 text-sm font-medium flex items-center mt-1"
        >
          {showMoreHighlights ? 'Show Less' : `+${product.highlights.length - 3} more`}
          {showMoreHighlights ? (
            <ChevronUp className="ml-1 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-1 h-4 w-4" />
          )}
        </button>
      )}
    </div>
  );

  const renderSpecifications = () => (
    <div className="space-y-2">
      <h3 className="text-lg font-medium text-gray-800">Specifications</h3>
      <div className="space-y-2">
        {product.specifications.slice(0, showMoreSpecs ? undefined : 4).map((spec, i) => (
          <div key={i} className="grid grid-cols-3">
            <span className="text-gray-500">{spec.name}</span>
            <span className="col-span-2 text-gray-800">{spec.value}</span>
          </div>
        ))}
      </div>
      {product.specifications.length > 4 && (
        <button 
          onClick={() => setShowMoreSpecs(!showMoreSpecs)}
          className="text-blue-600 text-sm font-medium flex items-center mt-1"
        >
          {showMoreSpecs ? 'Show Less' : `+${product.specifications.length - 4} more`}
          {showMoreSpecs ? (
            <ChevronUp className="ml-1 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-1 h-4 w-4" />
          )}
        </button>
      )}
    </div>
  );

  const renderOffers = () => (
    <div className="space-y-3">
      <h3 className="text-lg font-medium text-gray-800">Available offers</h3>
      <div className="space-y-3">
        {product.offers.slice(0, showMoreOffers ? undefined : 2).map((offer, i) => (
          <div key={i} className="flex items-start">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mr-2">
              {i === 0 ? 'Bank Offer' : i === 1 ? 'Special Price' : 'Partner Offer'}
            </Badge>
            <span className="text-sm text-gray-700">{offer}</span>
          </div>
        ))}
      </div>
      {product.offers.length > 2 && (
        <button 
          onClick={() => setShowMoreOffers(!showMoreOffers)}
          className="text-blue-600 text-sm font-medium flex items-center mt-1"
        >
          {showMoreOffers ? 'Show Less' : `+${product.offers.length - 2} more offers`}
          {showMoreOffers ? (
            <ChevronUp className="ml-1 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-1 h-4 w-4" />
          )}
        </button>
      )}
    </div>
  );

  const renderDeliveryInfo = () => (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <div className="flex items-start">
        <Truck className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
        <div>
          <div className="flex items-center">
            {deliveryDate ? (
              <span className="font-medium">Delivery by {deliveryDate}</span>
            ) : (
              <span className="font-medium">Delivery</span>
            )}
            
            {!showPincodeInput ? (
              <button 
                onClick={togglePincodeInput}
                className="ml-2 text-blue-600 text-sm"
              >
                Change Pincode
              </button>
            ) : (
              <div className="ml-2 flex items-center">
                <Input
                  type="text"
                  placeholder="Enter pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="h-8 w-32 text-sm"
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-2 h-8 px-2"
                  onClick={togglePincodeInput}
                >
                  Done
                </Button>
              </div>
            )}
          </div>
          
          {!showPincodeInput && !deliveryDate && (
            <button 
              onClick={togglePincodeInput}
              className="text-blue-600 text-sm mt-1 inline-block"
            >
              Enter pincode for delivery date
            </button>
          )}
        </div>
      </div>
      
      {deliveryDate && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <h4 className="text-sm font-medium mb-2">Delivery Options</h4>
          <div className="space-y-2">
            {product.deliveryOptions.map((option, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id={`delivery-${i}`} 
                    name="delivery" 
                    defaultChecked={i === 0}
                    className="h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <label htmlFor={`delivery-${i}`} className="ml-2 text-sm">
                    {option.type} Delivery
                    <span className="text-gray-500 ml-1">({option.days})</span>
                  </label>
                </div>
                <span className="text-sm font-medium">
                  {option.charge === 'Free' ? 'FREE' : option.charge}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderEMIOptions = () => (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
      <h4 className="font-medium text-blue-800 mb-2">EMI Options Available</h4>
      <ul className="space-y-1.5">
        {product.emiOptions.map((option, i) => (
          <li key={i} className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span className="text-sm text-blue-700">{option}</span>
          </li>
        ))}
      </ul>
      <button className="text-blue-600 text-sm font-medium mt-2">View all EMI options</button>
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-medium text-gray-800">Product Details</h1>
            <div className="w-8">
              {/* Empty div for flex spacing */}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Product Images */}
        <div className="bg-white rounded-lg mb-6">
          <div className="relative aspect-square w-full bg-gray-50 rounded-lg overflow-hidden">
            <img 
              src={product.images[selectedImage]} 
              alt={product.name}
              className="w-full h-full object-contain"
            />
            <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-2 p-2 bg-gradient-to-t from-black/50 to-transparent">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-2 h-2 rounded-full ${
                    index === selectedImage ? 'bg-white' : 'bg-white/50'
                  }`}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          </div>
          
          <div className="flex space-x-2 mt-2 overflow-x-auto pb-2">
            {product.images.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${
                  index === selectedImage ? 'border-blue-500' : 'border-transparent'
                }`}
              >
                <img 
                  src={img} 
                  alt={`${product.name} - ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-medium text-gray-900">{product.name}</h1>
            <div className="flex items-center mt-1">
              <div className="flex items-center bg-blue-50 px-2 py-0.5 rounded">
                <span className="text-blue-700 font-medium text-sm">{product.rating} ★</span>
                <span className="text-blue-700 text-xs ml-1">({product.reviews})</span>
              </div>
              <span className="text-gray-500 text-sm ml-2">{product.reviews} Ratings & Reviews</span>
            </div>
            
            <div className="mt-3 flex items-baseline">
              <span className="text-2xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
              <span className="ml-2 text-sm text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
              <span className="ml-2 text-sm font-medium text-green-600">{product.discount}% off</span>
            </div>
            
            {product.offers.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-green-600 font-medium">Available offers</p>
                <ul className="mt-1 space-y-1">
                  {product.offers.slice(0, 2).map((offer, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-green-500 mr-1">•</span>
                      <span className="text-xs text-gray-600">{offer}</span>
                    </li>
                  ))}
                </ul>
                {product.offers.length > 2 && (
                  <button 
                    onClick={() => setShowMoreOffers(!showMoreOffers)}
                    className="text-blue-600 text-xs font-medium mt-1"
                  >
                    {showMoreOffers ? 'Show Less' : `+${product.offers.length - 2} more offers`}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Highlights */}
          {renderHighlights()}

          {/* Delivery Info */}
          {renderDeliveryInfo()}

          {/* EMI Options */}
          {renderEMIOptions()}

          {/* Seller Info */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-800 mb-2">Seller</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{product.vendor.name}</p>
                <div className="flex items-center mt-1">
                  <div className="flex items-center bg-green-50 px-1.5 py-0.5 rounded">
                    <span className="text-green-700 font-medium text-xs">{product.vendor.rating} ★</span>
                  </div>
                  <span className="text-xs text-gray-500 ml-1">Seller Rating</span>
                </div>
              </div>
              <button className="text-blue-600 text-sm font-medium">View Profile</button>
            </div>
          </div>

          {/* Specifications */}
          {renderSpecifications()}

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-800">Description</h3>
            <p className="text-gray-700">{product.description}</p>
          </div>
        </div>
      </main>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
              <Heart className="h-6 w-6" />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
              <Share2 className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex space-x-3">
            {isInCartFlag ? (
              <Button 
                variant="outline" 
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
                onClick={() => navigate('/cart')}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Go to Cart
              </Button>
            ) : (
              <Button 
                variant="outline" 
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
                onClick={handleAddToCart}
                disabled={!canAddMore || isAddingToCart}
              >
                {isAddingToCart ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </span>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {canAddMore ? 'Add to Cart' : 'Max Quantity Reached'}
                  </>
                )}
              </Button>
            )}
            
            <Button 
              className="bg-blue-600 hover:bg-blue-700 flex-1 min-w-[120px]"
              onClick={handleBuyNow}
              disabled={!canAddMore && !isInCartFlag}
            >
              {isInCartFlag ? 'Buy Now' : 'Buy Now'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailFlipkart;
