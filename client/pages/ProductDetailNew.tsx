import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Star, Truck, Shield, Check, ShoppingCart, Heart, Share2, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { fetchProduct, type Product } from '@/lib/products';

type ProductImageGalleryProps = {
  images: string[];
  productName: string;
};

const ProductImageGallery = ({ images, productName }: ProductImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="space-y-4">
      <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
        <img
          src={images[selectedImage]}
          alt={productName}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            className={`aspect-square overflow-hidden rounded-md ${selectedImage === index ? 'ring-2 ring-primary' : ''}`}
          >
            <img
              src={image}
              alt={`${productName} - ${index + 1}`}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

type ProductDescriptionProps = {
  description: string;
  specifications: { name: string; value: string }[];
  features: string[];
};

const ProductDescription = ({ description, specifications, features }: ProductDescriptionProps) => {
  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList>
        <TabsTrigger value="description">Description</TabsTrigger>
        <TabsTrigger value="specifications">Specifications</TabsTrigger>
        <TabsTrigger value="features">Features</TabsTrigger>
      </TabsList>
      <TabsContent value="description" className="py-4">
        <p>{description}</p>
      </TabsContent>
      <TabsContent value="specifications" className="py-4">
        <div className="space-y-2">
          {specifications.map((spec, index) => (
            <div key={index} className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">{spec.name}</span>
              <span>{spec.value}</span>
            </div>
          ))}
        </div>
      </TabsContent>
      <TabsContent value="features" className="py-4">
        <ul className="list-disc pl-5 space-y-2">
          {features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      </TabsContent>
    </Tabs>
  );
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, isInCart, getItemQuantity } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  
  // Fetch product data from API
  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) throw new Error('No product ID');
      const product = await fetchProduct(id);
      if (!product) throw new Error('Product not found');
      return product;
    },
  });

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Product not found</h2>
          <p className="text-muted-foreground mb-4">The product you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/products')}>Back to Products</Button>
        </div>
      </div>
    );
  }

  const selectedSku = product.skus?.[selectedVariantIndex];
  const inStock = selectedSku ? selectedSku.stock > 0 : false;
  const currentQuantityInCart = getItemQuantity(product.id);
  const canAddMore = inStock && currentQuantityInCart < (selectedSku?.stock || 0);
  
  const handleAddToCart = () => {
    if (!canAddMore || !selectedSku) {
      toast.info(inStock ? 'Maximum quantity reached' : 'Product out of stock');
      return;
    }
    
    setIsAddingToCart(true);
    addToCart({
      productId: product.id,
      name: product.title,
      price: selectedSku.unit_price,
      image: product.images?.[0] || '',
      category: product.category?.name || '',
      maxQuantity: selectedSku.stock
    });
    
    toast.success('Added to cart', {
      description: `${product.title} has been added to your cart`,
      action: {
        label: 'View Cart',
        onClick: () => navigate('/cart')
      }
    });
    
    setTimeout(() => setIsAddingToCart(false), 1000);
  };
  
  const handleBuyNow = () => {
    if (!isInCart(product.id)) {
      handleAddToCart();
    }
    navigate('/checkout');
  };
  
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1 || (selectedSku && newQuantity > selectedSku.stock)) return;
    setQuantity(newQuantity);
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <ProductImageGallery 
            images={product.images && product.images.length > 0 ? product.images : ['/placeholder.svg']} 
            productName={product.title} 
          />
        </div>
        
        {/* Product Info */}
        <div>
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold">{product.title}</h1>
              <div className="flex items-center mt-2">
                <Badge variant="outline">{product.brand}</Badge>
                {product.category && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    {product.category.name}
                  </span>
                )}
              </div>
              {selectedSku?.sku && (
                <div className="mt-2">
                  <span className="text-sm text-muted-foreground">SKU: {selectedSku.sku}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold">
                  ₹{selectedSku?.unit_price.toLocaleString()}
                </span>
                {selectedSku?.unit_mrp && selectedSku.unit_mrp > selectedSku.unit_price && (
                  <span className="text-lg text-muted-foreground line-through">
                    ₹{selectedSku.unit_mrp.toLocaleString()}
                  </span>
                )}
                {selectedSku?.unit_mrp && selectedSku.unit_mrp > selectedSku.unit_price && (
                  <Badge className="text-sm">
                    {Math.round(((selectedSku.unit_mrp - selectedSku.unit_price) / selectedSku.unit_mrp) * 100)}% OFF
                  </Badge>
                )}
              </div>
              
              {inStock ? (
                <div className="flex items-center text-green-600">
                  <Check className="h-4 w-4 mr-1" />
                  <span>In Stock</span>
                </div>
              ) : (
                <div className="text-destructive">Out of Stock</div>
              )}
              
              <div className="flex items-center text-sm text-muted-foreground">
                <Truck className="h-4 w-4 mr-1" />
                <span>Free delivery on orders over ₹499</span>
              </div>
            </div>
            
            {product.skus && product.skus.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Select Variant</h3>
                <div className="grid grid-cols-2 gap-2">
                  {product.skus.map((sku, index) => (
                    <button
                      key={sku.id}
                      onClick={() => setSelectedVariantIndex(index)}
                      className={cn(
                        "border rounded-md p-3 text-left transition-colors",
                        selectedVariantIndex === index 
                          ? "border-primary bg-primary/5" 
                          : "hover:border-gray-400",
                        sku.stock === 0 && "opacity-50"
                      )}
                    >
                      {sku.stock === 0 && (
                        <Badge variant="destructive" className="mb-1 text-xs">OUT OF STOCK</Badge>
                      )}
                      <div className="text-sm font-medium">
                        {sku.quantity} {sku.unit_type}
                      </div>
                      <div className="text-lg font-bold">₹{sku.unit_price}</div>
                      {sku.unit_mrp && sku.unit_mrp > sku.unit_price && (
                        <div className="text-xs text-muted-foreground line-through">
                          ₹{sku.unit_mrp}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Quantity</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border rounded-md">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="px-3 py-1 text-lg disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="w-10 text-center">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={!canAddMore}
                    className="px-3 py-1 text-lg disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
                {selectedSku && selectedSku.stock > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {selectedSku.stock} available
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                size="lg" 
                className="flex-1"
                onClick={handleAddToCart}
                disabled={isAddingToCart || !inStock || !canAddMore}
              >
                {isAddingToCart ? 'Adding...' : inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="flex-1"
                onClick={handleBuyNow}
                disabled={!inStock || !canAddMore}
              >
                Buy Now
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-4 pt-4">
              <button className="flex items-center text-sm text-muted-foreground hover:text-foreground">
                <Heart className="h-4 w-4 mr-1" />
                Add to Wishlist
              </button>
              <button className="flex items-center text-sm text-muted-foreground hover:text-foreground">
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </button>
            </div>
            
            <div className="border rounded-lg p-4 mt-6">
              <div className="flex items-start gap-4">
                <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Secure Payment</h4>
                  <p className="text-sm text-muted-foreground">
                    Your payment information is processed securely. We do not store credit card details.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Product Description Tabs */}
      {product.descriptions && product.descriptions.length > 0 && (
        <div className="mt-12">
          <Tabs defaultValue="about" className="w-full">
            <TabsList>
              <TabsTrigger value="about">About</TabsTrigger>
              {product.descriptions[0].mode_of_action && (
                <TabsTrigger value="action">Mode of Action</TabsTrigger>
              )}
              {product.descriptions[0].how_to_apply && (
                <TabsTrigger value="application">How to Apply</TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="about" className="py-4">
              <p>{product.descriptions[0].about}</p>
              {product.descriptions[0].target_pests && (
                <div className="mt-4">
                  <h4 className="font-semibold">Target Pests:</h4>
                  <p>{product.descriptions[0].target_pests}</p>
                </div>
              )}
              {product.descriptions[0].recommended_crops && (
                <div className="mt-4">
                  <h4 className="font-semibold">Recommended Crops:</h4>
                  <p>{product.descriptions[0].recommended_crops}</p>
                </div>
              )}
            </TabsContent>
            {product.descriptions[0].mode_of_action && (
              <TabsContent value="action" className="py-4">
                <p>{product.descriptions[0].mode_of_action}</p>
                {product.descriptions[0].mode_of_entry && (
                  <div className="mt-4">
                    <h4 className="font-semibold">Mode of Entry:</h4>
                    <p>{product.descriptions[0].mode_of_entry}</p>
                  </div>
                )}
              </TabsContent>
            )}
            {product.descriptions[0].how_to_apply && (
              <TabsContent value="application" className="py-4">
                <p>{product.descriptions[0].how_to_apply}</p>
                {product.descriptions[0].dosage_per_acre && (
                  <div className="mt-4">
                    <h4 className="font-semibold">Dosage per Acre:</h4>
                    <p>{product.descriptions[0].dosage_per_acre}</p>
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
        </div>
      )}
      
    </div>
  );
};

export default ProductDetail;
