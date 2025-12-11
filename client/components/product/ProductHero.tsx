import { Star, Check, Truck, Shield, Leaf } from 'lucide-react';

interface ProductHeroProps {
  name: string;
  rating: number;
  reviews: number;
  price: number;
  originalPrice?: number;
  discount?: number;
  inStock: boolean;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

export const ProductHero = ({
  name,
  rating,
  reviews,
  price,
  originalPrice,
  discount,
  inStock,
  onAddToCart,
  onBuyNow
}: ProductHeroProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{name}</h1>
      
      {/* Rating and Reviews */}
      <div className="flex items-center mb-4">
        <div className="flex items-center bg-emerald-50 px-2.5 py-0.5 rounded-md">
          <span className="text-amber-500 font-medium mr-1">{rating}</span>
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
        </div>
        <span className="text-sm text-gray-500 ml-2">({reviews} Reviews)</span>
      </div>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-gray-900">₹{price.toLocaleString()}</span>
          {originalPrice && (
            <>
              <span className="ml-2 text-lg text-gray-500 line-through">₹{originalPrice.toLocaleString()}</span>
              {discount && (
                <span className="ml-2 text-sm bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  {discount}% OFF
                </span>
              )}
            </>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">Inclusive of all taxes</p>
      </div>

      {/* Stock Status */}
      <div className="mb-6">
        {inStock ? (
          <div className="flex items-center text-emerald-600">
            <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
            <span>In Stock</span>
          </div>
        ) : (
          <div className="text-rose-600">Out of Stock</div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 mb-6">
        <button
          onClick={onAddToCart}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          Add to Cart
        </button>
        <button
          onClick={onBuyNow}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
        >
          Buy Now
        </button>
      </div>

      {/* Features */}
      <div className="space-y-3 text-sm text-gray-600">
        <div className="flex items-center">
          <Truck className="w-5 h-5 text-gray-400 mr-2" />
          <span>Free & Fast Delivery</span>
        </div>
        <div className="flex items-center">
          <Shield className="w-5 h-5 text-gray-400 mr-2" />
          <span>100% Authentic Products</span>
        </div>
        <div className="flex items-center">
          <Leaf className="w-5 h-5 text-gray-400 mr-2" />
          <span>Organic & Safe</span>
        </div>
      </div>
    </div>
  );
};
