import { X, ShoppingCart, Plus, Minus } from 'lucide-react';
import { Button } from './ui/button';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

export const Cart = ({ isDrawer = false, onClose }: { isDrawer?: boolean; onClose?: () => void }) => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    cartCount,
    cartTotal,
  } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (onClose) onClose();
    navigate('/checkout');
  };

  if (cartCount === 0) {
    return (
      <div className="p-4 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <ShoppingCart className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
        <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Button onClick={() => navigate('/products')} className="w-full">
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4">
          {cartItems.map(item => (
            <div
              key={`${item.id}-${item.quantity}`}
              className="flex items-start p-4 border-b"
            >
              <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                {item.image.startsWith('http') ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiAjd2VhZ2xlX3N0cm9rZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWltYWdlIj48cmVjdCB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHg9IjMiIHk9IjMiIHJ4PSIyIiByeT0iMiIvPjxjaXJjbGUgY3g9IjguNSIgY3k9IjguNSIgcj0iMi41Ii8+PHBvbHlsaW5lIHBvaW50cz0iMjEgMTUgMTYgMTAgNSAyMSIvPjwvc3ZnPg=='
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">
                    {item.image}
                  </div>
                )}
              </div>
              
              <div className="ml-4 flex-1">
                <div className="flex justify-between">
                  <Link 
                    to={`/products/${item.productId ?? item.id}`}
                    className="text-sm font-medium text-gray-900 hover:text-primary"
                    onClick={onClose}
                  >
                    {item.name}
                  </Link>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-500">{item.category}</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  ₹{item.price.toLocaleString()}
                </p>
                
                <div className="mt-2 flex items-center">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="text-gray-500 hover:text-gray-700 p-1"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="mx-2 text-sm w-6 text-center">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.maxQuantity}
                    className="text-gray-500 hover:text-gray-700 p-1 disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 p-4">
        <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
          <p>Subtotal</p>
          <p>₹{cartTotal.toLocaleString()}</p>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Shipping and taxes calculated at checkout.
        </p>
        <div className="space-y-2">
          <Button 
            onClick={handleCheckout} 
            className="w-full"
            size="lg"
          >
            Checkout
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              if (onClose) onClose();
              navigate('/cart');
            }}
          >
            View Cart ({cartCount} {cartCount === 1 ? 'item' : 'items'})
          </Button>
        </div>
      </div>
    </div>
  );
};
