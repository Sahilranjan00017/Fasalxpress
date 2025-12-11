import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Trash2, Minus, Plus, Tag, ArrowRight } from "lucide-react";
import { useState, useMemo } from "react";
import { useCart } from "@/contexts/CartContext";

// Cart is sourced from CartContext (server-backed when available)

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    freeDelivery: boolean;
  } | null>(null);

  const items = cartItems;
  
  // Debug log
  console.log('[Cart Page] Rendering with items:', items);

  function DebugPanel() {
    const { userId, lastSync, refreshCart } = useCart();
    return (
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div>
          <div><strong>User:</strong> <span className="font-mono">{userId ?? '—'}</span></div>
          <div>
            <strong>Last sync:</strong>{' '}
            {lastSync?.time ? new Date(lastSync.time).toLocaleTimeString() : 'never'}
            {lastSync?.status ? ` (${lastSync.status})` : ''}
          </div>
        </div>
        <div>
          <Button size="sm" variant="outline" onClick={() => refreshCart && refreshCart()}>
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 0), 0);
  }, [items]);

  // Delivery fee logic
  const deliveryFee = useMemo(() => {
    if (appliedCoupon?.freeDelivery) return 0;
    return subtotal < 500 ? 70 : 0;
  }, [subtotal, appliedCoupon]);

  // Discount calculation
  const discount = appliedCoupon?.discount || 0;

  const total = useMemo(() => {
    return subtotal + deliveryFee - discount;
  }, [subtotal, deliveryFee, discount]);

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === "FIRST100") {
      if (subtotal >= 3000) {
        setAppliedCoupon({
          code: "FIRST100",
          discount: 100,
          freeDelivery: true,
        });
      } else {
        alert("Coupon FIRST100 requires minimum order of ₹3000");
      }
    } else {
      alert("Invalid coupon code");
    }
  };

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
  };

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(id);
      return;
    }
    updateQuantity(id, newQuantity);
  };

  if (!items || items.length === 0) {
    return (
      <>
        <Header />
        <main className="min-h-[calc(100vh-4rem)] bg-secondary/20 flex items-center justify-center">
          <div className="container max-w-2xl py-16">
            <div className="bg-white border border-border rounded-lg p-8 md:p-12 text-center">
              <div className="text-6xl mb-6">🛒</div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Your cart is empty
              </h1>
              <p className="text-muted-foreground text-lg mb-8">
                Start shopping and add items to your cart
              </p>
              <Button asChild>
                <Link to="/products">
                  Continue Shopping <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-secondary/20">
        {/* Page Header */}
        <div className="bg-white border-b border-border">
          <div className="container max-w-7xl py-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Shopping Cart
            </h1>
            <p className="text-muted-foreground">
              {items?.length ?? 0} item{(items?.length ?? 0) !== 1 ? "s" : ""} in your cart
            </p>
            {/* Debug panel: show cart user id and last sync status */}
            <div className="mt-3 text-xs text-muted-foreground">
              <DebugPanel />
            </div>
          </div>
        </div>

        <div className="container max-w-7xl py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-border rounded-lg p-6 flex gap-6"
                >
                  <div className="w-28 h-28 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                    {item.image ? (
                      typeof item.image === 'string' && item.image.startsWith('http') ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-4xl">{item.image}</div>
                      )
                    ) : (
                      <div className="text-4xl">🛒</div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="mb-2">
                      <div className="text-xs font-semibold text-primary uppercase tracking-wide">
                        {item.category}
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {item.name}
                      </h3>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">
                      Available from {item.vendors} vendor{item.vendors !== 1 ? "s" : ""}
                    </p>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">
                          Unit Price
                        </div>
                        <div className="text-2xl font-bold text-primary">
                          ₹{(item.price ?? 0).toLocaleString("en-IN")}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-border rounded-lg">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(String(item.id), item.quantity - 1)
                            }
                            className="p-2 hover:bg-secondary transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <div className="w-10 text-center font-semibold">
                            {item.quantity}
                          </div>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(String(item.id), item.quantity + 1)
                            }
                            className="p-2 hover:bg-secondary transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(String(item.id))}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border text-right">
                      <div className="text-xs text-muted-foreground mb-1">
                        Subtotal
                      </div>
                        <div className="text-xl font-bold text-primary">
                          ₹{(((item.price ?? 0) * item.quantity) || 0).toLocaleString("en-IN")}
                        </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Continue Shopping */}
              <Button variant="outline" className="w-full" asChild>
                <Link to="/products">
                  Continue Shopping <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-white border border-border rounded-lg p-6 sticky top-20 space-y-6">
                <h2 className="text-xl font-bold text-foreground">
                  Order Summary
                </h2>

                {/* Coupon Section */}
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleApplyCoupon}
                      className="gap-2"
                    >
                      <Tag className="w-4 h-4" />
                      Apply
                    </Button>
                  </div>

                  {appliedCoupon && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                      <p className="font-semibold text-green-700 mb-1">
                        ✓ {appliedCoupon.code} applied
                      </p>
                      <p className="text-green-600">
                        ₹{appliedCoupon.discount} OFF
                        {appliedCoupon.freeDelivery && " + FREE Delivery"}
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    💡 Tip: Use FIRST100 on orders over ₹3000
                  </p>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 border-t border-border pt-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold text-foreground">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Delivery Fee
                      {deliveryFee === 0 && (
                        <span className="text-green-600 ml-1">(FREE)</span>
                      )}
                    </span>
                    <span className="font-semibold text-foreground">
                      {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="font-semibold text-green-600">
                        -₹{discount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="border-t border-border pt-6 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-foreground">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      ₹{total.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <Button className="w-full" size="lg" asChild>
                    <Link to="/checkout">
                      Proceed to Checkout <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
                  <p className="font-semibold mb-2">ℹ Delivery Information</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Free delivery on orders ≥ ₹500</li>
                    <li>• ₹70 delivery charge for orders &lt; ₹500</li>
                    <li>• FIRST100 coupon: ₹100 OFF + FREE delivery</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
