import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

export default function ProductCatalog() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const products = useQuery(api.products.list, { category: selectedCategory || undefined });
  const categories = useQuery(api.products.getCategories);
  const addToCart = useMutation(api.cart.add);

  const handleAddToCart = async (productId: string, productName: string) => {
    try {
      await addToCart({ productId: productId as any, quantity: 1 });
      toast.success(`${productName} added to cart!`);
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  if (!products || !categories) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Products</h2>
        
        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory("")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === "" 
                ? "bg-blue-600 text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All Products
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
              <div className="flex justify-between items-center mb-3">
                <span className="text-2xl font-bold text-blue-600">${product.price}</span>
                <span className="text-sm text-gray-500">Stock: {product.stock}</span>
              </div>
              <button
                onClick={() => handleAddToCart(product._id, product.name)}
                disabled={product.stock === 0}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found in this category.</p>
        </div>
      )}
    </div>
  );
}
