import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders" | "admins">("overview");
  const stats = useQuery(api.admin.getDashboardStats);

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h2>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {[
            { id: "overview", label: "Overview" },
            { id: "products", label: "Products" },
            { id: "orders", label: "Orders" },
            { id: "admins", label: "Admins" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && <OverviewTab stats={stats} />}
      {activeTab === "products" && <ProductsTab />}
      {activeTab === "orders" && <OrdersTab />}
      {activeTab === "admins" && <AdminsTab />}
    </div>
  );
}

function OverviewTab({ stats }: { stats: any }) {
  if (!stats) {
    return <div className="animate-pulse">Loading stats...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Products</h3>
        <p className="text-3xl font-bold text-blue-600">{stats.totalProducts}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Orders</h3>
        <p className="text-3xl font-bold text-green-600">{stats.totalOrders}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Revenue</h3>
        <p className="text-3xl font-bold text-purple-600">${stats.totalRevenue.toFixed(2)}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Orders</h3>
        <p className="text-3xl font-bold text-yellow-600">{stats.pendingOrders}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Users</h3>
        <p className="text-3xl font-bold text-indigo-600">{stats.totalUsers}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Admins</h3>
        <p className="text-3xl font-bold text-red-600">{stats.totalAdmins}</p>
      </div>
    </div>
  );
}

function ProductsTab() {
  const products = useQuery(api.products.listAll);
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const removeProduct = useMutation(api.products.remove);
  
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "",
    imageUrl: "",
    stock: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateProduct({
          id: editingProduct._id,
          ...formData,
          isActive: editingProduct.isActive,
        });
        toast.success("Product updated successfully!");
      } else {
        await createProduct(formData);
        toast.success("Product created successfully!");
      }
      setShowForm(false);
      setEditingProduct(null);
      setFormData({ name: "", description: "", price: 0, category: "", imageUrl: "", stock: 0 });
    } catch (error) {
      toast.error("Failed to save product");
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl,
      stock: product.stock,
    });
    setShowForm(true);
  };

  const handleDelete = async (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await removeProduct({ id: productId as any });
        toast.success("Product deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete product");
      }
    }
  };

  if (!products) {
    return <div className="animate-pulse">Loading products...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Products Management</h3>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Product
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h4 className="text-lg font-semibold mb-4">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Product Name"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <textarea
                placeholder="Description"
                required
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
              />
              <input
                type="number"
                placeholder="Price"
                required
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="Category"
                required
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="url"
                placeholder="Image URL"
                required
                value={formData.imageUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="number"
                placeholder="Stock"
                required
                value={formData.stock}
                onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  {editingProduct ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProduct(null);
                    setFormData({ name: "", description: "", price: 0, category: "", imageUrl: "", stock: 0 });
                  }}
                  className="flex-1 bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product._id}>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-md object-cover mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-gray-500 text-sm truncate max-w-xs">{product.description}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{product.category}</td>
                <td className="px-6 py-4 text-sm text-gray-900">${product.price}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{product.stock}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    product.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {product.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrdersTab() {
  const orders = useQuery(api.orders.listAll, {});
  const updateOrderStatus = useMutation(api.orders.updateStatus);
  const [statusFilter, setStatusFilter] = useState("");

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus({ orderId: orderId as any, status: newStatus });
      toast.success("Order status updated!");
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

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

  if (!orders) {
    return <div className="animate-pulse">Loading orders...</div>;
  }

  const filteredOrders = statusFilter ? orders.filter(order => order.status === statusFilter) : orders;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Orders Management</h3>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">All Orders</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-semibold text-lg">Order #{order._id.slice(-8)}</h4>
                <p className="text-gray-600">Customer: {order.user?.email}</p>
                <p className="text-gray-600">{new Date(order.orderDate).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h5 className="font-medium mb-2">Items:</h5>
                {order.items.map((item, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    {item.productName} x{item.quantity} - ${(item.price * item.quantity).toFixed(2)}
                  </div>
                ))}
              </div>
              <div>
                <h5 className="font-medium mb-2">Shipping Address:</h5>
                <div className="text-sm text-gray-600">
                  {order.shippingAddress.fullName}<br />
                  {order.shippingAddress.address}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                  {order.shippingAddress.phone}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <span className="font-semibold">Total: ${order.totalAmount.toFixed(2)}</span>
              <span className="text-sm text-gray-600">{order.paymentMethod}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminsTab() {
  const admins = useQuery(api.admin.listAdmins);
  const addAdmin = useMutation(api.admin.addAdmin);
  const removeAdmin = useMutation(api.admin.removeAdmin);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ email: "", role: "admin" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addAdmin(formData);
      toast.success("Admin added successfully!");
      setShowForm(false);
      setFormData({ email: "", role: "admin" });
    } catch (error: any) {
      toast.error(error.message || "Failed to add admin");
    }
  };

  const handleRemove = async (adminId: string) => {
    if (confirm("Are you sure you want to remove this admin?")) {
      try {
        await removeAdmin({ adminId: adminId as any });
        toast.success("Admin removed successfully!");
      } catch (error: any) {
        toast.error(error.message || "Failed to remove admin");
      }
    }
  };

  if (!admins) {
    return <div className="animate-pulse">Loading admins...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Admin Management</h3>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Admin
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h4 className="text-lg font-semibold mb-4">Add New Admin</h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Email Address"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  Add Admin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ email: "", role: "admin" });
                  }}
                  className="flex-1 bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {admins.map((admin) => (
              <tr key={admin._id}>
                <td className="px-6 py-4 text-sm text-gray-900">{admin.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    admin.role === "super_admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                  }`}>
                    {admin.role === "super_admin" ? "Super Admin" : "Admin"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  {admin.email !== "exploretutorialsofficial@gmail.com" && (
                    <button
                      onClick={() => handleRemove(admin._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
