import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

interface DeliveryAddress {
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "upi",
    name: "UPI",
    icon: "📱",
    description: "Google Pay, PhonePe, Paytm",
  },
  {
    id: "card",
    name: "Credit/Debit Card",
    icon: "💳",
    description: "Visa, Mastercard, RuPay",
  },
  {
    id: "netbanking",
    name: "Net Banking",
    icon: "🏦",
    description: "All major Indian banks",
  },
  {
    id: "wallet",
    name: "Wallet",
    icon: "💰",
    description: "PayTM, Amazon Pay",
  },
];

// Sample cart data (in a real app, this would come from global state)
const sampleCart = {
  subtotal: 5748,
  deliveryFee: 0,
  discount: 100,
  appliedCoupon: "FIRST100",
};

export default function Checkout() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [currentStep, setCurrentStep] = useState<
    "address" | "payment" | "confirmation"
  >("address");
  const [isProcessing, setIsProcessing] = useState(false);

  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    fullName: "",
    phone: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    city: "Bangalore",
    postalCode: "",
  });

  const [selectedPayment, setSelectedPayment] = useState<string>("upi");
  const [orderNumber, setOrderNumber] = useState("");
  const { cartItems, cartTotal } = useCart();

  const total = cartTotal ?? 0;

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate address
    if (
      !deliveryAddress.fullName ||
      !deliveryAddress.phone ||
      !deliveryAddress.email ||
      !deliveryAddress.addressLine1 ||
      !deliveryAddress.postalCode
    ) {
      alert("Please fill all required fields");
      return;
    }

    // Move to payment step
    setCurrentStep("payment");
  };

  const handlePayment = async () => {
    if (!selectedPayment) {
      alert("Please select a payment method");
      return;
    }

    setIsProcessing(true);
    try {
      // prefer authenticated user id when available
      const userId = user?.id ?? localStorage.getItem('agrobuild_user_id');
      const createRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!createRes.ok) throw new Error('Failed to create order');
      const createPayload = await createRes.json();
      const order = createPayload?.data?.order ?? createPayload;

      const payRes = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });
      if (!payRes.ok) throw new Error('Failed to initiate payment');
      const payPayload = await payRes.json();
      const payment = payPayload?.data?.payment ?? payPayload;

      // mock verify immediately for demo
      try {
        await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId: payment.id, success: true }),
        });
      } catch (_) {
        // ignore
      }

      setOrderNumber(order.id || `ORD${Math.floor(100000 + Math.random() * 900000)}`);
      setCurrentStep('confirmation');
    } catch (err: any) {
      alert(err.message ?? 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated && currentStep !== "confirmation") {
    return (
      <>
        <Header />
        <main className="min-h-[calc(100vh-4rem)] bg-secondary/20">
          <div className="container max-w-2xl py-16">
            <div className="bg-white border border-border rounded-lg p-8 md:p-12">
              <h1 className="text-3xl font-bold text-foreground mb-4">
                Login Required
              </h1>
              <p className="text-muted-foreground mb-8">
                Please login or create an account to proceed with checkout.
              </p>

              <div className="space-y-4">
                <Button className="w-full" size="lg" asChild>
                  <Link to="/login">Login to Your Account</Link>
                </Button>
                <Button className="w-full" size="lg" variant="outline">
                  Create New Account
                </Button>
                <Button className="w-full" size="lg" variant="ghost" asChild>
                  <Link to="/cart">
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Back to Cart
                  </Link>
                </Button>
              </div>

              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <Shield className="w-4 h-4 inline mr-2" />
                  Your information is secure and encrypted.
                </p>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (currentStep === "confirmation") {
    return (
      <>
        <Header />
        <main className="min-h-[calc(100vh-4rem)] bg-secondary/20">
          <div className="container max-w-2xl py-16">
            <div className="bg-white border border-border rounded-lg p-8 md:p-12 text-center">
              <div className="mb-6 flex justify-center">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Order Confirmed!
              </h1>

              <p className="text-lg text-muted-foreground mb-8">
                Your order has been successfully placed
              </p>

              <div className="bg-secondary/30 rounded-lg p-6 mb-8">
                <div className="text-sm text-muted-foreground mb-2">
                  Order Number
                </div>
                <div className="text-3xl font-bold text-primary mb-4">
                  {orderNumber}
                </div>

                <div className="space-y-3 text-sm border-t border-border pt-4 mt-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">
                      ₹{sampleCart.subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span className="font-semibold">
                      {sampleCart.deliveryFee === 0 ? "FREE" : `₹${sampleCart.deliveryFee}`}
                    </span>
                  </div>
                  {sampleCart.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="font-semibold text-green-600">
                        -₹{sampleCart.discount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-border pt-3 mt-3 flex justify-between">
                    <span className="font-bold text-foreground">Total Paid</span>
                    <span className="text-xl font-bold text-primary">
                      ₹{total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700 mb-2">📧 Confirmation Email</p>
                  <p className="text-xs text-blue-600">
                    A confirmation email with your order details has been sent.
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-700 mb-2">
                    ✓ Vendor Notifications Sent
                  </p>
                  <p className="text-xs text-green-600">
                    Vendors have been notified and will confirm availability.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Button className="w-full" size="lg" asChild>
                  <Link to={`/orders`}>Track Your Order</Link>
                </Button>
                <Button className="w-full" size="lg" variant="outline" asChild>
                  <Link to="/products">Continue Shopping</Link>
                </Button>
              </div>
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
        <div className="container max-w-6xl py-8">
          {/* Progress Indicator */}
          <div className="mb-8 flex items-center justify-between md:mb-12">
            <div
              className={`flex items-center gap-3 pb-4 md:pb-0 ${
                currentStep === "address" ? "border-b-2 border-primary md:border-0" : ""
              }`}
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                  currentStep === "address"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground"
                }`}
              >
                1
              </div>
              <span className="hidden sm:inline font-semibold">Delivery Address</span>
            </div>

            <div className="hidden md:block flex-1 h-1 bg-secondary mx-4" />

            <div
              className={`flex items-center gap-3 pb-4 md:pb-0 ${
                currentStep === "payment" ? "border-b-2 border-primary md:border-0" : ""
              }`}
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                  currentStep === "payment"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground"
                }`}
              >
                2
              </div>
              <span className="hidden sm:inline font-semibold">Payment</span>
            </div>

            <div className="hidden md:block flex-1 h-1 bg-secondary mx-4" />

            <div
              className={`flex items-center gap-3 pb-4 md:pb-0 ${
                currentStep === "confirmation" ? "border-b-2 border-primary md:border-0" : ""
              }`}
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                  currentStep === "confirmation"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground"
                }`}
              >
                3
              </div>
              <span className="hidden sm:inline font-semibold">Confirmation</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Address Step */}
              {currentStep === "address" && (
                <div className="bg-white border border-border rounded-lg p-8">
                  <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-primary" />
                    Delivery Address
                  </h2>

                  <form onSubmit={handleAddressSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={deliveryAddress.fullName}
                          onChange={(e) =>
                            setDeliveryAddress({
                              ...deliveryAddress,
                              fullName: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="John Doe"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={deliveryAddress.phone}
                          onChange={(e) =>
                            setDeliveryAddress({
                              ...deliveryAddress,
                              phone: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="+91 9876543210"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={deliveryAddress.email}
                        onChange={(e) =>
                          setDeliveryAddress({
                            ...deliveryAddress,
                            email: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Address Line 1 *
                      </label>
                      <input
                        type="text"
                        required
                        value={deliveryAddress.addressLine1}
                        onChange={(e) =>
                          setDeliveryAddress({
                            ...deliveryAddress,
                            addressLine1: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Apartment, House, etc"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress.addressLine2}
                        onChange={(e) =>
                          setDeliveryAddress({
                            ...deliveryAddress,
                            addressLine2: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Road, Area, etc"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          disabled
                          value="Bangalore"
                          className="w-full px-4 py-2 border border-border rounded-lg bg-secondary/30 text-muted-foreground"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Currently available only in Bangalore
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          Postal Code *
                        </label>
                        <input
                          type="text"
                          required
                          value={deliveryAddress.postalCode}
                          onChange={(e) =>
                            setDeliveryAddress({
                              ...deliveryAddress,
                              postalCode: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="560001"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 pt-4">
                      <Button type="submit" className="w-full" size="lg">
                        Continue to Payment
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        asChild
                      >
                        <Link to="/cart">
                          <ArrowLeft className="mr-2 w-4 h-4" />
                          Back to Cart
                        </Link>
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Payment Step */}
              {currentStep === "payment" && (
                <div className="bg-white border border-border rounded-lg p-8">
                  <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-primary" />
                    Payment Method
                  </h2>

                  <div className="space-y-4 mb-8">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedPayment === method.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.id}
                          checked={selectedPayment === method.id}
                          onChange={(e) => setSelectedPayment(e.target.value)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl">{method.icon}</span>
                            <h3 className="font-semibold text-foreground">
                              {method.name}
                            </h3>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {method.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
                    <p className="text-sm text-green-700 font-semibold mb-2">
                      ✓ Only Prepaid Orders
                    </p>
                    <p className="text-xs text-green-600">
                      Cash on Delivery (COD) is not available at this time.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={handlePayment}
                      disabled={isProcessing || !selectedPayment}
                      className="w-full"
                      size="lg"
                    >
                      {isProcessing ? "Processing..." : "Proceed to Payment"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => setCurrentStep("address")}
                      disabled={isProcessing}
                    >
                      <ArrowLeft className="mr-2 w-4 h-4" />
                      Back to Address
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div>
              <div className="bg-white border border-border rounded-lg p-6 sticky top-20">
                <h3 className="text-lg font-bold text-foreground mb-6">
                  Order Summary
                </h3>

                <div className="space-y-4 mb-6 border-b border-border pb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">
                      ₹{sampleCart.subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span className="font-semibold">
                      {sampleCart.deliveryFee === 0 ? "FREE" : `₹${sampleCart.deliveryFee}`}
                    </span>
                  </div>

                  {sampleCart.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Discount ({sampleCart.appliedCoupon})
                      </span>
                      <span className="font-semibold text-green-600">
                        -₹{sampleCart.discount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between mb-6">
                  <span className="text-lg font-bold text-foreground">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="space-y-3 text-xs text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                    <span>100% Secure & Encrypted</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <DollarSign className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                    <span>Multiple Payment Options</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                    <span>24/7 Customer Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
