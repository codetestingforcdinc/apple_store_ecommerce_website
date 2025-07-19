import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function OrderHistory() {
  const orders = useQuery(api.orders.list);

  if (!orders) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "shipped": return "bg-purple-100 text-purple-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">No Orders Yet</h2>
        <p className="text-gray-600">Your order history will appear here once you make a purchase.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Order History</h2>
      
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Order #{order._id.slice(-8)}
                  </h3>
                  <p className="text-gray-600">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
                  <p className="text-gray-600 text-sm">
                    {order.shippingAddress.fullName}<br />
                    {order.shippingAddress.address}<br />
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                    {order.shippingAddress.phone}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Payment Method</h4>
                  <p className="text-gray-600 text-sm">{order.paymentMethod}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <h4 className="font-medium text-gray-900 mb-3">Items</h4>
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2">
                  <div>
                    <span className="font-medium">{item.productName}</span>
                    <span className="text-gray-600 ml-2">x{item.quantity}</span>
                  </div>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total:</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
