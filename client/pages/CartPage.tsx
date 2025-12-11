import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Trash2, ArrowLeft, ShoppingBag, Shield, Truck, RefreshCw } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

const CartPage = () => {
  const navigate = useNavigate();
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    clearCart,
    cartTotal,
    cartCount,
    isInCart 
  } = useCart();

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const product = cartItems.find(item => item.id === productId);
    if (product?.maxQuantity && newQuantity > product.maxQuantity) {
      toast.info(`Maximum quantity of ${product.maxQuantity} reached`);
      return;
    }
    
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId: string, productName: string) => {
    removeFromCart(productId);
    toast.success('Item removed', {
      description: `${productName} has been removed from your cart`,
    });
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-12 text-center">
        <div className="bg-muted/50 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Looks like you haven't added anything to your cart yet</p>
        <Button onClick={() => navigate('/products')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Cart ({cartCount})</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {cartItems.map((item) => (
            <div key={item.id} className="border rounded-lg p-4 flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-32 h-32 bg-gray-100 rounded-md overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                    <p className="text-lg font-medium mt-2">{formatCurrency(item.price)}</p>
                  </div>
                    <button 
                    onClick={() => handleRemoveItem(item.id, item.name)}
                    className="text-destructive hover:text-destructive/80 h-8 w-8 flex items-center justify-center rounded-full hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center border rounded-md">
                    <button
                      onClick={() => handleQuantityChange(item.id, (item.quantity || 1) - 1)}
                      disabled={item.quantity <= 1}
                      className="px-3 py-1 text-lg disabled:opacity-50"
                    >
                      -
                    </button>
                    <span className="w-10 text-center">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, (item.quantity || 1) + 1)}
                      disabled={item.quantity >= (item.maxQuantity || 10)}
                      className="px-3 py-1 text-lg disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                  
                  <p className="font-medium">
                    {formatCurrency(item.price * (item.quantity || 1))}
                  </p>
                </div>
                
                {item.quantity >= (item.maxQuantity || 10) && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Maximum quantity reached
                  </p>
                )}
              </div>
            </div>
          ))}
          
          <div className="flex justify-between items-center pt-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/products')}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping
            </Button>
            
            <Button 
              variant="ghost" 
              className="text-destructive hover:bg-destructive/10"
              onClick={() => {
                clearCart();
                toast.success('Cart cleared');
              }}
            >
              Clear Cart
            </Button>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:sticky lg:top-8 h-fit">
          <div className="border rounded-lg p-6 space-y-6">
            <h2 className="text-xl font-semibold">Order Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({cartCount} items)</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              
              <div className="border-t pt-4 flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
            </div>
            
            <Button 
              size="lg" 
              className="w-full"
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </Button>
            
            <div className="text-sm text-muted-foreground space-y-2">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Secure checkout with SSL encryption</span>
              </div>
              <div className="flex items-start gap-2">
                <Truck className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Free shipping on orders over ₹499</span>
              </div>
              <div className="flex items-start gap-2">
                <RefreshCw className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Easy returns within 30 days</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 border rounded-lg p-6">
            <h3 className="font-medium mb-4">Need help?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Have questions about your order or need assistance? Our customer service team is here to help.
            </p>
            <Button variant="outline" className="w-full">
              Contact Support
            </Button>
          </div>
        </div>
      </div>
      
      {/* Recently Viewed */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Recently Viewed</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-square bg-gray-100">
                <img 
                  src="https://images.unsplash.com/photo-1753232451855-4c91e4ec75a2?q=80&w=1796&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                  alt="Related product"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium">Related Product {item}</h3>
                <p className="text-primary font-medium mt-1">
                  {formatCurrency(899 - (item * 100))}
                </p>
                <Button size="sm" className="mt-2 w-full">Add to Cart</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CartPage;
