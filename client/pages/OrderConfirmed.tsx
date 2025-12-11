import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Truck, Clock, Mail, Phone, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OrderConfirmed() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  // In a real app, you would fetch the order details using the orderId
  const orderDetails = {
    orderNumber: orderId || 'ORD-123456',
    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    items: [
      { id: 1, name: 'Organic Fertilizer 5kg', quantity: 2, price: 1798 },
      { id: 2, name: 'Garden Trowel', quantity: 1, price: 349 },
    ],
    shippingAddress: {
      name: 'John Doe',
      street: '123 Farm Lane',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      phone: '9876543210',
      email: 'john@example.com',
    },
    paymentMethod: 'Cash on Delivery',
    subtotal: 2147,
    shipping: 0,
    total: 2147,
  };

  return (
    <div className="container max-w-4xl py-12">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground">
          Thank you for your order. We've received it and it's being processed.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Order #{orderDetails.orderNumber}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Order Summary */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="space-y-4">
            {orderDetails.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                    <span className="text-2xl">🌱</span>
                  </div>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-medium">₹{item.price.toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="border-t mt-6 pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{orderDetails.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{orderDetails.shipping === 0 ? 'Free' : `₹${orderDetails.shipping}`}</span>
            </div>
            <div className="flex justify-between font-medium text-lg pt-2">
              <span>Total</span>
              <span>₹{orderDetails.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Delivery Information */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Truck className="h-5 w-5 mr-2 text-emerald-600" />
              Delivery Information
            </h2>
            <div className="space-y-2">
              <p className="font-medium">{orderDetails.shippingAddress.name}</p>
              <p className="text-muted-foreground">
                {orderDetails.shippingAddress.street}
                <br />
                {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state}
                <br />
                {orderDetails.shippingAddress.pincode}
              </p>
              <p className="text-muted-foreground flex items-center mt-2">
                <Phone className="h-4 w-4 mr-2" />
                {orderDetails.shippingAddress.phone}
              </p>
              <p className="text-muted-foreground flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                {orderDetails.shippingAddress.email}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-amber-600" />
              Estimated Delivery
            </h2>
            <p className="text-muted-foreground">
              Your order will be delivered by {orderDetails.estimatedDelivery}
            </p>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
            <p className="text-muted-foreground">{orderDetails.paymentMethod}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Button 
          variant="outline" 
          className="w-full sm:w-auto"
          onClick={() => navigate('/products')}
        >
          <Home className="h-4 w-4 mr-2" />
          Continue Shopping
        </Button>
        <Button 
          className="w-full sm:w-auto"
          onClick={() => navigate(`/orders/${orderDetails.orderNumber}`)}
        >
          View Order Details
        </Button>
      </div>
    </div>
  );
}
