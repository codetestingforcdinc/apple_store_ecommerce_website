import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface CartProps {
  onCheckout: () => void;
}

export default function Cart({ onCheckout }: CartProps) {
  const cartItems = useQuery(api.cart.list);
  const updateQuantity = useMutation(api.cart.updateQuantity);
  const removeItem = useMutation(api.cart.remove);

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    try {
      await updateQuantity({ itemId: itemId as any, quantity: newQuantity });
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeItem({ itemId: itemId as any });
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
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

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
        <p className="text-gray-600">Add some products to get started!</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h2>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {cartItems.map((item) => (
          <div key={item._id} className="flex items-center p-6 border-b border-gray-200 last:border-b-0">
            <img
              src={item.product?.imageUrl}
              alt={item.product?.name}
              className="w-20 h-20 object-cover rounded-md"
            />
            <div className="flex-1 ml-4">
              <h3 className="font-semibold text-lg text-gray-900">{item.product?.name}</h3>
              <p className="text-gray-600">${item.product?.price}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                  className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                >
                  -
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                  className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                >
                  +
                </button>
              </div>
              <div className="text-lg font-semibold text-gray-900 w-20 text-right">
                ${((item.product?.price || 0) * item.quantity).toFixed(2)}
              </div>
              <button
                onClick={() => handleRemoveItem(item._id)}
                className="text-red-600 hover:text-red-800 ml-4"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        
        <div className="p-6 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xl font-semibold">Total: ${totalAmount.toFixed(2)}</span>
          </div>
          <button
            onClick={onCheckout}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors font-semibold"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
