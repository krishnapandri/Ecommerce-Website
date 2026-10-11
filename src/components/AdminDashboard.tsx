import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Product, Order, Coupon, Category, OrderStatus, AdminStats } from '../types';
import {
  DollarSign,
  Package,
  ShoppingBag,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Tag,
  FolderPlus,
  RefreshCw,
  Search,
  Filter,
  ArrowUpRight,
  Eye,
  X
} from 'lucide-react';
import { getProductPlaceholder } from '../utils/productImages';

interface AdminDashboardProps {
  onBackToStorefront: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToStorefront }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'coupons' | 'categories'>('overview');
  const [stats, setStats] = useState<AdminStats>(() => api.getAdminStats());
  const [products, setProducts] = useState<Product[]>(() => api.getAllProductsAdmin());
  const [orders, setOrders] = useState<Order[]>(() => api.getOrders());
  const [coupons, setCoupons] = useState<Coupon[]>(() => api.getCoupons());
  const [categories, setCategories] = useState<Category[]>(() => api.getCategories());

  // Search & Filters
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({
    code: '',
    discountType: 'percentage',
    discountValue: 15,
    minOrderAmount: 50,
    validUntil: '2027-12-31',
    description: '',
  });

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: '',
    description: '',
    iconName: 'ShoppingBag',
  });

  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [adminNotification, setAdminNotification] = useState<string | null>(null);

  const notify = (msg: string) => {
    setAdminNotification(msg);
    setTimeout(() => setAdminNotification(null), 3000);
  };

  const refreshAll = () => {
    setStats(api.getAdminStats());
    setProducts(api.getAllProductsAdmin());
    setOrders(api.getOrders());
    setCoupons(api.getCoupons());
    setCategories(api.getCategories());
  };

  // ---------------- PRODUCT HANDLERS ----------------
  const handleToggleProductStatus = (id: string) => {
    try {
      const updated = api.toggleProductStatus(id);
      notify(`Product "${updated.name}" is now ${updated.isActive ? 'Active' : 'Inactive'}.`);
      refreshAll();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleQuickStockUpdate = (id: string, newStock: number) => {
    api.updateProductStock(id, newStock);
    refreshAll();
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.price) {
      alert('Product name and price are required');
      return;
    }

    try {
      const saved = api.saveProduct({
        ...editingProduct,
        images: editingProduct.images && editingProduct.images.length > 0 && editingProduct.images[0]
          ? editingProduct.images
          : [getProductPlaceholder(editingProduct.categoryName || 'accessories', editingProduct.name)],
      });
      notify(`Product "${saved.name}" saved successfully.`);
      setIsProductModalOpen(false);
      setEditingProduct(null);
      refreshAll();
    } catch (e: any) {
      alert(e.message);
    }
  };

  // ---------------- ORDER HANDLERS ----------------
  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    try {
      const updated = api.updateOrderStatus(orderId, status);
      notify(`Order ${updated.orderNumber} status changed to ${status.toUpperCase()}.`);
      refreshAll();
    } catch (e: any) {
      alert(e.message);
    }
  };

  // ---------------- COUPON HANDLERS ----------------
  const handleToggleCoupon = (id: string) => {
    api.toggleCouponStatus(id);
    refreshAll();
  };

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code) return;
    api.saveCoupon(newCoupon);
    notify(`Coupon "${newCoupon.code}" created.`);
    setIsCouponModalOpen(false);
    setNewCoupon({
      code: '',
      discountType: 'percentage',
      discountValue: 15,
      minOrderAmount: 50,
      validUntil: '2027-12-31',
      description: '',
    });
    refreshAll();
  };

  // ---------------- CATEGORY HANDLERS ----------------
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name) return;
    api.saveCategory(newCategory);
    notify(`Category "${newCategory.name}" created.`);
    setIsCategoryModalOpen(false);
    setNewCategory({ name: '', description: '', iconName: 'ShoppingBag' });
    refreshAll();
  };

  // Filtered lists
  const filteredProducts = products.filter((p) => {
    if (showLowStockOnly && p.stock > 5) return false;
    if (productCatFilter !== 'all' && p.categoryId !== productCatFilter) return false;
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    }
    return true;
  });

  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter !== 'all' && o.orderStatus !== orderStatusFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F5F5F4] text-[#1C1917] pb-16">
      {/* Admin Top Header */}
      <div className="bg-[#1C1917] text-white border-b border-[#292524] px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-serif-display text-xl font-bold tracking-tight">
              LuxeLane
            </span>
            <span className="text-xs bg-[#78350F] text-amber-200 px-2 py-0.5 rounded font-medium">
              Administrator Operations
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={refreshAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-300 transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync</span>
            </button>
            <button
              onClick={onBackToStorefront}
              className="px-3.5 py-1.5 bg-white text-[#1C1917] font-semibold rounded-lg hover:bg-neutral-100 transition-colors shadow-xs"
            >
              Back to Storefront
            </button>
          </div>
        </div>
      </div>

      {/* Admin Notification Toast */}
      {adminNotification && (
        <div className="fixed top-20 right-6 z-50 bg-[#1C1917] text-white text-xs px-4 py-2.5 rounded-lg shadow-xl border border-neutral-700 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{adminNotification}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap border-b border-[#D6D3D1] gap-6 text-xs font-medium text-[#78716C]">
          {[
            { id: 'overview', label: 'Dashboard Overview' },
            { id: 'products', label: `Products (${products.length})` },
            { id: 'orders', label: `Orders (${orders.length})` },
            { id: 'coupons', label: `Coupons (${coupons.length})` },
            { id: 'categories', label: `Categories (${categories.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 relative font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'text-[#78350F] border-b-2 border-[#78350F]'
                  : 'hover:text-[#1C1917]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ---------------- 1. DASHBOARD OVERVIEW ---------------- */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Metrics Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Gross Revenue */}
              <div className="p-5 bg-white rounded-xl border border-[#E7E5E4] shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#78716C]">
                  <span>Gross Sales</span>
                  <DollarSign className="w-4 h-4 text-[#78350F]" />
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-[#1C1917] mt-2">
                  ${stats.totalRevenue.toFixed(2)}
                </div>
                <div className="text-[11px] text-emerald-700 mt-1 font-medium">
                  Active confirmed orders
                </div>
              </div>

              {/* Total Orders */}
              <div className="p-5 bg-white rounded-xl border border-[#E7E5E4] shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#78716C]">
                  <span>Total Orders</span>
                  <ShoppingBag className="w-4 h-4 text-[#78350F]" />
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-[#1C1917] mt-2">
                  {stats.totalOrders}
                </div>
                <div className="text-[11px] text-[#78716C] mt-1">
                  {stats.pendingOrdersCount} awaiting dispatch
                </div>
              </div>

              {/* Catalog Size */}
              <div className="p-5 bg-white rounded-xl border border-[#E7E5E4] shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#78716C]">
                  <span>Live Products</span>
                  <Package className="w-4 h-4 text-[#78350F]" />
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-[#1C1917] mt-2">
                  {stats.totalProducts}
                </div>
                <div className="text-[11px] text-[#78716C] mt-1">
                  Across {categories.length} categories
                </div>
              </div>

              {/* Low Stock Alert */}
              <div
                onClick={() => {
                  setShowLowStockOnly(true);
                  setActiveTab('products');
                }}
                className={`p-5 rounded-xl border shadow-xs cursor-pointer transition-all ${
                  stats.lowStockCount > 0
                    ? 'bg-amber-50/60 border-amber-300 hover:bg-amber-100/50'
                    : 'bg-white border-[#E7E5E4]'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-amber-900 font-medium">
                  <span>Low-Stock Warning</span>
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-amber-900 mt-2">
                  {stats.lowStockCount} items
                </div>
                <div className="text-[11px] text-amber-800 mt-1 underline">
                  Click to inspect inventory
                </div>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-white rounded-xl border border-[#E7E5E4] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif-display text-lg font-semibold text-[#1C1917]">
                    Recent Customer Orders
                  </h3>
                  <p className="text-xs text-[#78716C]">
                    Latest orders placed via Cash on Delivery or Razorpay
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-[#78350F] font-semibold hover:underline flex items-center gap-1"
                >
                  <span>View All Orders</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAFAF9] text-[#78716C] border-b border-[#E7E5E4]">
                    <tr>
                      <th className="py-2.5 px-3 font-medium">Order Number</th>
                      <th className="py-2.5 px-3 font-medium">Customer</th>
                      <th className="py-2.5 px-3 font-medium">Payment</th>
                      <th className="py-2.5 px-3 font-medium">Status</th>
                      <th className="py-2.5 px-3 font-medium text-right">Total</th>
                      <th className="py-2.5 px-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5F5F4]">
                    {orders.slice(0, 5).map((ord) => (
                      <tr key={ord.id} className="hover:bg-[#FAFAF9]">
                        <td className="py-3 px-3 font-mono font-medium text-[#1C1917]">
                          {ord.orderNumber}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-[#1C1917]">{ord.customerName}</div>
                          <div className="text-[11px] text-[#A8A29E]">{ord.customerEmail}</div>
                        </td>
                        <td className="py-3 px-3 capitalize">
                          {ord.paymentMethod === 'razorpay' ? 'Razorpay (Paid)' : 'COD (Pending)'}
                        </td>
                        <td className="py-3 px-3">
                          <span className="capitalize px-2 py-0.5 rounded text-[11px] font-semibold bg-stone-100 text-stone-800">
                            {ord.orderStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-semibold tabular-nums text-[#1C1917]">
                          ${ord.totalAmount.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setSelectedOrderDetails(ord)}
                            className="p-1 text-[#78350F] hover:bg-stone-100 rounded"
                            title="Inspect details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- 2. PRODUCTS MANAGEMENT ---------------- */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-xl border border-[#E7E5E4] p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif-display text-lg font-semibold text-[#1C1917]">
                  Product Catalog & Inventory
                </h3>
                <p className="text-xs text-[#78716C]">
                  Manage prices, adjust stock levels, and toggle product visibility
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingProduct({
                    name: '',
                    price: 49,
                    originalPrice: 69,
                    stock: 20,
                    categoryId: categories[0]?.id || 'cat-1',
                    categoryName: categories[0]?.name || 'Watches',
                    description: '',
                    materials: 'Stainless Steel, Genuine Leather',
                    sku: `LL-ACC-${Math.floor(100 + Math.random() * 900)}`,
                    isActive: true,
                    images: [''],
                  });
                  setIsProductModalOpen(true);
                }}
                className="px-4 py-2 bg-[#1C1917] hover:bg-[#292524] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs self-start"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Filter bar */}
            <div className="flex flex-wrap items-center gap-3 pt-2 pb-1 border-b border-[#E7E5E4] text-xs">
              <div className="flex items-center bg-[#FAFAF9] border border-[#D6D3D1] rounded-lg px-2.5 py-1.5 w-64">
                <Search className="w-3.5 h-3.5 text-[#78716C] mr-2" />
                <input
                  type="text"
                  placeholder="Filter name or SKU..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full bg-transparent text-xs text-[#1C1917] focus:outline-none"
                />
              </div>

              <select
                value={productCatFilter}
                onChange={(e) => setProductCatFilter(e.target.value)}
                className="bg-[#FAFAF9] border border-[#D6D3D1] rounded-lg px-2.5 py-1.5 text-xs text-[#1C1917] focus:outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  showLowStockOnly
                    ? 'bg-amber-100 border-amber-300 text-amber-900'
                    : 'bg-[#FAFAF9] border-[#D6D3D1] text-[#57534E] hover:text-[#1C1917]'
                }`}
              >
                {showLowStockOnly ? 'Showing Low Stock (<=5)' : 'Filter Low Stock'}
              </button>
            </div>

            {/* Product Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFAF9] text-[#78716C] border-b border-[#E7E5E4]">
                  <tr>
                    <th className="py-2.5 px-3 font-medium">Item</th>
                    <th className="py-2.5 px-3 font-medium">Category / SKU</th>
                    <th className="py-2.5 px-3 font-medium">Price</th>
                    <th className="py-2.5 px-3 font-medium">Stock Level</th>
                    <th className="py-2.5 px-3 font-medium">Visibility</th>
                    <th className="py-2.5 px-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F5F4]">
                  {filteredProducts.map((p) => {
                    const isLow = p.stock > 0 && p.stock <= 5;
                    const isOut = p.stock <= 0;
                    return (
                      <tr key={p.id} className="hover:bg-[#FAFAF9]">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 object-cover rounded bg-[#18181B] border border-[#E7E5E4]"
                            />
                            <div>
                              <div className="font-medium text-[#1C1917]">{p.name}</div>
                              {p.isBestseller && (
                                <span className="text-[10px] text-amber-800 font-semibold">
                                  Bestseller
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="text-[#1C1917]">{p.categoryName}</div>
                          <div className="font-mono text-[11px] text-[#78716C]">{p.sku}</div>
                        </td>

                        <td className="py-3 px-3 font-mono font-semibold tabular-nums text-[#1C1917]">
                          ${p.price.toFixed(2)}
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              value={p.stock}
                              onChange={(e) =>
                                handleQuickStockUpdate(p.id, parseInt(e.target.value) || 0)
                              }
                              className="w-16 border border-[#D6D3D1] rounded px-2 py-1 text-xs font-mono tabular-nums text-center focus:outline-none focus:border-[#78350F]"
                            />
                            {isOut ? (
                              <span className="text-[11px] text-red-600 font-semibold">Out</span>
                            ) : isLow ? (
                              <span className="text-[11px] text-amber-700 font-semibold">Low</span>
                            ) : null}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <button
                            onClick={() => handleToggleProductStatus(p.id)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                              p.isActive
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-neutral-200 text-neutral-600'
                            }`}
                          >
                            {p.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setIsProductModalOpen(true);
                              }}
                              className="p-1.5 text-stone-600 hover:text-[#78350F] hover:bg-stone-100 rounded"
                              title="Edit product"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---------------- 3. ORDERS MANAGEMENT ---------------- */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl border border-[#E7E5E4] p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif-display text-lg font-semibold text-[#1C1917]">
                  Order Fulfillment & Management
                </h3>
                <p className="text-xs text-[#78716C]">
                  Update shipment status, track payment gateways, and manage order lifecycles
                </p>
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#78716C]">Filter status:</span>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="bg-[#FAFAF9] border border-[#D6D3D1] rounded-lg px-2.5 py-1.5 text-xs text-[#1C1917] focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFAF9] text-[#78716C] border-b border-[#E7E5E4]">
                  <tr>
                    <th className="py-2.5 px-3 font-medium">Order Number</th>
                    <th className="py-2.5 px-3 font-medium">Customer & Address</th>
                    <th className="py-2.5 px-3 font-medium">Date Placed</th>
                    <th className="py-2.5 px-3 font-medium">Payment Mode</th>
                    <th className="py-2.5 px-3 font-medium">Current Status</th>
                    <th className="py-2.5 px-3 font-medium text-right">Total</th>
                    <th className="py-2.5 px-3 font-medium text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F5F4]">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-[#FAFAF9]">
                      <td className="py-3 px-3 font-mono font-medium text-[#1C1917]">
                        {ord.orderNumber}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-medium text-[#1C1917]">{ord.customerName}</div>
                        <div className="text-[11px] text-[#78716C]">{ord.shippingAddress.city}, {ord.shippingAddress.state}</div>
                        <div className="text-[11px] text-[#A8A29E]">{ord.customerPhone}</div>
                      </td>

                      <td className="py-3 px-3 text-[#78716C]">
                        {new Date(ord.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="py-3 px-3">
                        <span className="capitalize font-medium">
                          {ord.paymentMethod === 'razorpay' ? 'Razorpay (Paid)' : 'Cash on Delivery'}
                        </span>
                        {ord.paymentTransactionId && (
                          <div className="font-mono text-[10px] text-[#78716C]">
                            {ord.paymentTransactionId}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <select
                          value={ord.orderStatus}
                          onChange={(e) =>
                            handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)
                          }
                          className="bg-white border border-[#D6D3D1] rounded px-2 py-1 text-xs font-medium capitalize text-[#1C1917] focus:outline-none focus:border-[#78350F]"
                        >
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled (Restores Stock)</option>
                        </select>
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-semibold tabular-nums text-[#1C1917]">
                        ${ord.totalAmount.toFixed(2)}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setSelectedOrderDetails(ord)}
                          className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-[#1C1917] rounded text-xs transition-colors"
                        >
                          View Items ({ord.items.length})
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---------------- 4. COUPONS MANAGEMENT ---------------- */}
        {activeTab === 'coupons' && (
          <div className="bg-white rounded-xl border border-[#E7E5E4] p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif-display text-lg font-semibold text-[#1C1917]">
                  Discount Coupons
                </h3>
                <p className="text-xs text-[#78716C]">
                  Create promotional codes with minimum order limits and expiration dates
                </p>
              </div>

              <button
                onClick={() => setIsCouponModalOpen(true)}
                className="px-4 py-2 bg-[#1C1917] hover:bg-[#292524] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs self-start"
              >
                <Plus className="w-4 h-4" />
                <span>Create Coupon</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFAF9] text-[#78716C] border-b border-[#E7E5E4]">
                  <tr>
                    <th className="py-2.5 px-3 font-medium">Coupon Code</th>
                    <th className="py-2.5 px-3 font-medium">Discount Offer</th>
                    <th className="py-2.5 px-3 font-medium">Min Order Spend</th>
                    <th className="py-2.5 px-3 font-medium">Usage Count</th>
                    <th className="py-2.5 px-3 font-medium">Valid Until</th>
                    <th className="py-2.5 px-3 font-medium text-right">Status Toggle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F5F4]">
                  {coupons.map((c) => (
                    <tr key={c.id} className="hover:bg-[#FAFAF9]">
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-[#78350F] text-sm">{c.code}</div>
                        <div className="text-[11px] text-[#78716C]">{c.description}</div>
                      </td>

                      <td className="py-3 px-3 font-medium">
                        {c.discountType === 'percentage'
                          ? `${c.discountValue}% Off Total`
                          : `$${c.discountValue} Flat Discount`}
                      </td>

                      <td className="py-3 px-3 font-mono tabular-nums">
                        ${c.minOrderAmount.toFixed(2)}
                      </td>

                      <td className="py-3 px-3 font-mono tabular-nums">
                        {c.usageCount} times redeemed
                      </td>

                      <td className="py-3 px-3 text-[#78716C]">
                        {c.validUntil}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleToggleCoupon(c.id)}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            c.isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-stone-200 text-stone-600'
                          }`}
                        >
                          {c.isActive ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---------------- 5. CATEGORIES MANAGEMENT ---------------- */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-xl border border-[#E7E5E4] p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif-display text-lg font-semibold text-[#1C1917]">
                  Product Categories
                </h3>
                <p className="text-xs text-[#78716C]">
                  Organize accessories into structured catalog departments
                </p>
              </div>

              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="px-4 py-2 bg-[#1C1917] hover:bg-[#292524] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs self-start"
              >
                <Plus className="w-4 h-4" />
                <span>New Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-4 rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm text-[#1C1917]">{cat.name}</h4>
                    <span className="font-mono text-[#78350F] font-medium">
                      {cat.itemCount} products
                    </span>
                  </div>
                  <p className="text-[#78716C] leading-relaxed">{cat.description}</p>
                  <div className="text-[11px] text-[#A8A29E] font-mono">slug: /{cat.slug}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ---------------- MODAL: ADD / EDIT PRODUCT ---------------- */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-[#E7E5E4] p-6 sm:p-8 overflow-hidden my-8">
            <div className="flex justify-between items-center pb-4 border-b border-[#E7E5E4]">
              <h3 className="font-serif-display text-xl font-semibold text-[#1C1917]">
                {editingProduct.id ? 'Edit Product' : 'Add New Accessory'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 text-[#78716C] hover:text-[#1C1917]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#57534E] font-medium mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full bg-[#FAFAF9] border border-[#D6D3D1] rounded-lg px-3 py-2 text-[#1C1917] focus:outline-none focus:border-[#78350F]"
                    placeholder="Minimalist Obsidian Chronograph"
                  />
                </div>

                <div>
                  <label className="block text-[#57534E] font-medium mb-1">Category *</label>
                  <select
                    value={editingProduct.categoryId || 'cat-1'}
                    onChange={(e) => {
                      const selected = categories.find((c) => c.id === e.target.value);
                      setEditingProduct({
                        ...editingProduct,
                        categoryId: e.target.value,
                        categoryName: selected?.name || 'Accessories',
                      });
                    }}
                    className="w-full bg-[#FAFAF9] border border-[#D6D3D1] rounded-lg px-3 py-2 text-[#1C1917] focus:outline-none focus:border-[#78350F]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#57534E] font-medium mb-1">Selling Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingProduct.price ?? ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#FAFAF9] border border-[#D6D3D1] rounded-lg px-3 py-2 text-[#1C1917] font-mono tabular-nums focus:outline-none focus:border-[#78350F]"
                  />
                </div>

                <div>
                  <label className="block text-[#57534E] font-medium mb-1">Original Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.originalPrice ?? ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: parseFloat(e.target.value) || undefined })}
                    className="w-full bg-[#FAFAF9] border border-[#D6D3D1] rounded-lg px-3 py-2 text-[#1C1917] font-mono tabular-nums focus:outline-none focus:border-[#78350F]"
                  />
                </div>

                <div>
                  <label className="block text-[#57534E] font-medium mb-1">Initial Stock *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editingProduct.stock ?? ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#FAFAF9] border border-[#D6D3D1] rounded-lg px-3 py-2 text-[#1C1917] font-mono tabular-nums focus:outline-none focus:border-[#78350F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#57534E] font-medium mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={editingProduct.sku || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full bg-[#FAFAF9] border border-[#D6D3D1] rounded-lg px-3 py-2 text-[#1C1917] font-mono focus:outline-none focus:border-[#78350F]"
                  />
                </div>

                <div>
                  <label className="block text-[#57534E] font-medium mb-1">Materials</label>
                  <input
                    type="text"
                    value={editingProduct.materials || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, materials: e.target.value })}
                    placeholder="316L Stainless Steel, Italian Leather"
                    className="w-full bg-[#FAFAF9] border border-[#D6D3D1] rounded-lg px-3 py-2 text-[#1C1917] focus:outline-none focus:border-[#78350F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#57534E] font-medium mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full bg-[#FAFAF9] border border-[#D6D3D1] rounded-lg px-3 py-2 text-[#1C1917] focus:outline-none focus:border-[#78350F]"
                  placeholder="Detailed product overview..."
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isActive !== false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isActive: e.target.checked })}
                    className="text-[#78350F]"
                  />
                  <span>Active in store</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingProduct.isBestseller)}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isBestseller: e.target.checked })}
                    className="text-[#78350F]"
                  />
                  <span>Highlight as Bestseller</span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#E7E5E4] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 border border-[#D6D3D1] text-[#57534E] rounded-lg hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1C1917] hover:bg-[#292524] text-white font-medium rounded-lg shadow-xs"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: CREATE COUPON ---------------- */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#E7E5E4] p-6">
            <div className="flex justify-between items-center pb-3 border-b border-[#E7E5E4]">
              <h3 className="font-serif-display text-lg font-semibold text-[#1C1917]">
                Create Discount Coupon
              </h3>
              <button
                onClick={() => setIsCouponModalOpen(false)}
                className="p-1 text-[#78716C] hover:text-[#1C1917]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-3 pt-4 text-xs">
              <div>
                <label className="block text-[#57534E] font-medium mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={newCoupon.code || ''}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  placeholder="SUMMER25"
                  className="w-full bg-[#FAFAF9] border border-[#D6D3D1] rounded-lg px-3 py-2 text-[#1C1917] font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#57534E] font-medium mb-1">Discount Type</label>
                  <select
                    value={newCoupon.discountType || 'percentage'}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value as any })}
                    className="w-full bg-[#FAFAF9] border border-[#D6D3D1] rounded-lg px-3 py-2 text-[#1C1917]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#57534E] font-medium mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={newCoupon.discountValue ?? ''}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#FAFAF9] border border-[#D6D3D1] rounded-lg px-3 py-2 text-[#1C1917] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#57534E] font-medium mb-1">Minimum Order Amount ($)</label>
                <input
                  type="number"
                  value={newCoupon.minOrderAmount ?? ''}
                  onChange={(e) => setNewCoupon({ ...newCoupon, minOrderAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#FAFAF9] border border-[#D6D3D1] rounded-lg px-3 py-2 text-[#1C1917] font-mono"
                />
              </div>

              <div>
                <label className="block text-[#57534E] font-medium mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={newCoupon.validUntil || ''}
                  onChange={(e) => setNewCoupon({ ...newCoupon, validUntil: e.target.value })}
                  className="w-full bg-[#FAFAF9] border border-[#D6D3D1] rounded-lg px-3 py-2 text-[#1C1917]"
                />
              </div>

              <div className="pt-3 border-t border-[#E7E5E4] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 border border-[#D6D3D1] rounded-lg text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1C1917] text-white font-medium rounded-lg"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: CREATE CATEGORY ---------------- */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#E7E5E4] p-6">
            <div className="flex justify-between items-center pb-3 border-b border-[#E7E5E4]">
              <h3 className="font-serif-display text-lg font-semibold text-[#1C1917]">
                New Category
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1 text-[#78716C] hover:text-[#1C1917]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3 pt-4 text-xs">
              <div>
                <label className="block text-[#57534E] font-medium mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={newCategory.name || ''}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="Eyewear & Glasses"
                  className="w-full bg-[#FAFAF9] border border-[#D6D3D1] rounded-lg px-3 py-2 text-[#1C1917]"
                />
              </div>

              <div>
                <label className="block text-[#57534E] font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newCategory.description || ''}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="w-full bg-[#FAFAF9] border border-[#D6D3D1] rounded-lg px-3 py-2 text-[#1C1917]"
                />
              </div>

              <div className="pt-3 border-t border-[#E7E5E4] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 border border-[#D6D3D1] rounded-lg text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1C1917] text-white font-medium rounded-lg"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: INSPECT ORDER ITEMS ---------------- */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#E7E5E4] p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#E7E5E4]">
              <div>
                <h3 className="font-serif-display text-lg font-semibold text-[#1C1917]">
                  Order {selectedOrderDetails.orderNumber}
                </h3>
                <p className="text-xs text-[#78716C]">
                  Snapshot price & inventory log
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="p-1 text-[#78716C] hover:text-[#1C1917]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#FAFAF9] p-3 rounded-lg border border-[#E7E5E4] space-y-1.5">
                <div>Customer: <strong>{selectedOrderDetails.customerName}</strong> ({selectedOrderDetails.customerEmail})</div>
                <div>Phone: <strong>{selectedOrderDetails.customerPhone}</strong></div>
                <div>Address: {selectedOrderDetails.shippingAddress.street}, {selectedOrderDetails.shippingAddress.city}, {selectedOrderDetails.shippingAddress.postalCode}</div>
                {selectedOrderDetails.notes && (
                  <div className="text-amber-800 italic pt-1">Note: {selectedOrderDetails.notes}</div>
                )}
              </div>

              <div className="text-xs font-semibold uppercase tracking-wider text-[#1C1917] pt-2">
                Purchased Items (Frozen Unit Price)
              </div>

              <div className="divide-y divide-[#E7E5E4] max-h-48 overflow-y-auto">
                {selectedOrderDetails.items.map((i) => (
                  <div key={i.id} className="py-2 flex justify-between items-center">
                    <div>
                      <div className="font-medium text-[#1C1917]">{i.productName}</div>
                      <div className="text-[#78716C]">
                        Qty: {i.quantity} @ ${i.unitPrice.toFixed(2)} each {i.selectedColor && `(${i.selectedColor})`}
                      </div>
                    </div>
                    <div className="font-mono font-semibold text-[#1C1917] tabular-nums">
                      ${i.subtotal.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-[#E7E5E4] space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono tabular-nums">${selectedOrderDetails.subtotal.toFixed(2)}</span>
                </div>
                {selectedOrderDetails.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount ({selectedOrderDetails.couponCode}):</span>
                    <span className="font-mono tabular-nums">-${selectedOrderDetails.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Fee:</span>
                  <span className="font-mono tabular-nums">${selectedOrderDetails.shippingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-[#1C1917] pt-1 border-t border-[#E7E5E4]">
                  <span>Total Amount:</span>
                  <span className="font-mono tabular-nums">${selectedOrderDetails.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="px-4 py-2 bg-[#1C1917] text-white rounded-lg text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
