import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

interface CheckoutProps {
  onSuccess: () => void;
}

export default function Checkout({ onSuccess }: CheckoutProps) {
  const cartItems = useQuery(api.cart.list);
  const createOrder = useMutation(api.orders.create);
  
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cartItems || cartItems.length === 0) return;

    setIsSubmitting(true);
    try {
      const items = cartItems.map(item => ({
        productId: item.productId,
        productName: item.product?.name || "",
        price: item.product?.price || 0,
        quantity: item.quantity,
      }));

      const totalAmount = cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

      await createOrder({
        items,
        totalAmount,
        shippingAddress,
      });

      toast.success("Order placed successfully!");
      onSuccess();
    } catch (error) {
      toast.error("Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!cartItems) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
          {cartItems.map((item) => (
            <div key={item._id} className="flex justify-between items-center py-2 border-b border-gray-200">
              <div>
                <span className="font-medium">{item.product?.name}</span>
                <span className="text-gray-600 ml-2">x{item.quantity}</span>
              </div>
              <span>${((item.product?.price || 0) * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-4 text-xl font-semibold">
            <span>Total:</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
          <div className="mt-4 p-3 bg-green-50 rounded-md">
            <p className="text-green-800 font-medium">Payment Method: Cash on Delivery</p>
            <p className="text-green-600 text-sm">Pay when your order arrives</p>
          </div>
        </div>

        {/* Shipping Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Shipping Address</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={shippingAddress.fullName}
                onChange={(e) => setShippingAddress(prev => ({ ...prev, fullName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                required
                value={shippingAddress.address}
                onChange={(e) => setShippingAddress(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.zipCode}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors font-semibold disabled:bg-gray-400"
            >
              {isSubmitting ? "Placing Order..." : "Place Order"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
