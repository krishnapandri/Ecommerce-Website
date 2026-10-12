import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Order, Address } from '../types';
import { X, User, Package, MapPin, LogOut, Shield, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { OrderTrackingVisualization } from './OrderTrackingVisualization';

interface CustomerAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToAdmin: () => void;
}

export const CustomerAccountModal: React.FC<CustomerAccountModalProps> = ({
  isOpen,
  onClose,
  onSwitchToAdmin,
}) => {
  const { currentUser, logout, updateAddress, switchDemoRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');

  const [addressForm, setAddressForm] = useState<Address>(() => {
    return (
      currentUser?.address || {
        fullName: currentUser?.name || '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'United States',
        phone: currentUser?.phone || '',
      }
    );
  });
  const [addressSavedNotice, setAddressSavedNotice] = useState(false);
  const [orders, setOrders] = useState<Order[]>(() =>
    currentUser ? api.getOrders(currentUser.id) : []
  );

  React.useEffect(() => {
    if (currentUser) {
      setOrders(api.getOrders(currentUser.id));
      if (currentUser.address) {
        setAddressForm(currentUser.address);
      }
    } else {
      setOrders([]);
    }
  }, [isOpen, currentUser]);

  const refreshOrders = () => {
    if (currentUser) {
      setOrders(api.getOrders(currentUser.id));
    }
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    updateAddress(addressForm);
    setAddressSavedNotice(true);
    setTimeout(() => setAddressSavedNotice(false), 2500);
  };

  if (!isOpen || !currentUser) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'processing':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'shipped':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'delivered':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'cancelled':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-stone-700 bg-stone-50 border-stone-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div
        className="relative bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-[#E7E5E4] overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E7E5E4] flex items-center justify-between bg-[#FAFAF9]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1C1917] text-white flex items-center justify-center font-serif-display font-semibold text-lg">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-serif-display text-lg font-semibold text-[#1C1917]">
                {currentUser.name}
              </h2>
              <div className="text-xs text-[#78716C] flex items-center gap-2">
                <span>{currentUser.email}</span>
                <span aria-hidden="true">·</span>
                <span className="capitalize font-medium text-[#78350F]">
                  {currentUser.role} Account
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#78716C] hover:text-[#1C1917] rounded-lg transition-colors"
            aria-label="Close account modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-[#E7E5E4] px-6 bg-white gap-6 text-xs font-medium text-[#78716C]">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'orders'
                ? 'border-[#78350F] text-[#1C1917] font-semibold'
                : 'border-transparent hover:text-[#1C1917]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Order History ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-[#78350F] text-[#1C1917] font-semibold'
                : 'border-transparent hover:text-[#1C1917]'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Profile & Delivery Address</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {/* Top status bar */}
              <div className="flex items-center justify-between pb-2 border-b border-[#E7E5E4] text-xs">
                <div>
                  <span className="font-semibold text-[#1C1917]">Shipment Tracking & History</span>
                  <span className="text-[#78716C] ml-1.5">({orders.length} {orders.length === 1 ? 'order' : 'orders'})</span>
                </div>
                <button
                  onClick={refreshOrders}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#78350F] hover:bg-[#F5F5F4] rounded-lg transition-colors font-medium border border-[#E7E5E4]"
                  title="Check for status updates"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Status</span>
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12 text-[#78716C]">
                  <Package className="w-10 h-10 mx-auto text-[#D6D3D1] mb-2" />
                  <p className="font-serif-display text-base text-[#1C1917]">No orders yet</p>
                  <p className="text-xs text-[#78716C] mt-1">
                    Your placed orders will appear here with live tracking updates.
                  </p>
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-5 bg-[#FAFAF9] border border-[#E7E5E4] rounded-2xl space-y-4 text-xs shadow-2xs"
                  >
                    {/* Order summary header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E7E5E4] pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-[#1C1917]">
                          {order.orderNumber}
                        </span>
                        <span className="text-[#A8A29E]">·</span>
                        <span className="text-[#78716C]">
                          Placed on {new Date(order.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold capitalize ${getStatusColor(
                            order.orderStatus
                          )}`}
                        >
                          {order.orderStatus}
                        </span>
                        <span className="text-sm font-mono font-bold text-[#1C1917] tabular-nums">
                          ${order.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* LIVE TRACKING VISUALIZATION PIPELINE */}
                    <OrderTrackingVisualization order={order} initialExpanded={true} />

                    {/* Order items breakdown */}
                    <div className="bg-white rounded-xl border border-[#E7E5E4] p-3.5 space-y-2.5">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#78716C]">
                        Items in this package ({order.items.reduce((acc, i) => acc + i.quantity, 0)})
                      </div>
                      <div className="divide-y divide-[#F5F5F4]">
                        {order.items.map((item) => (
                          <div key={item.id} className="py-2 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.productName}
                                  referrerPolicy="no-referrer"
                                  className="w-9 h-9 object-cover rounded bg-[#18181B] shrink-0 border border-[#E7E5E4]"
                                />
                              )}
                              <div className="truncate">
                                <span className="font-medium text-[#1C1917] block truncate">
                                  {item.productName}
                                </span>
                                <span className="text-[11px] text-[#78716C]">
                                  Qty: {item.quantity} · ${item.unitPrice.toFixed(2)} each {item.selectedColor ? `· ${item.selectedColor}` : ''}
                                </span>
                              </div>
                            </div>
                            <span className="font-mono font-semibold tabular-nums text-[#1C1917] shrink-0">
                              ${item.subtotal.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order footer metadata */}
                    <div className="pt-2 flex flex-wrap justify-between items-center text-[11px] text-[#78716C] gap-2">
                      <div className="flex items-center gap-1.5">
                        <span>Payment Mode:</span>
                        <strong className="text-[#1C1917]">
                          {order.paymentMethod === 'razorpay' ? 'Razorpay Online (Paid)' : 'Cash on Delivery (Pay at delivery)'}
                        </strong>
                      </div>
                      {order.couponCode && (
                        <div className="text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Coupon {order.couponCode} applied (-${order.discountAmount.toFixed(2)})
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <form onSubmit={handleSaveAddress} className="space-y-4 text-xs max-w-lg">
              {addressSavedNotice && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Delivery address saved successfully!</span>
                </div>
              )}

              <div>
                <label className="block text-[#57534E] font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={addressForm.fullName}
                  onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                  className="w-full bg-[#FAFAF9] border border-[#D6D3D1] rounded-lg px-3 py-2 text-[#1C1917] focus:outline-none focus:border-[#78350F]"
                />
              </div>

              <div>
                <label className="block text-[#57534E] font-medium mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={addressForm.street}
                  onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                  className="w-full bg-[#FAFAF9] border border-[#D6D3D1] rounded-lg px-3 py-2 text-[#1C1917] focus:outline-none focus:border-[#78350F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#57534E] font-medium mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full bg-[#FAFAF9] border border-[#D6D3D1] rounded-lg px-3 py-2 text-[#1C1917] focus:outline-none focus:border-[#78350F]"
                  />
                </div>
                <div>
                  <label className="block text-[#57534E] font-medium mb-1">State / Province</label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full bg-[#FAFAF9] border border-[#D6D3D1] rounded-lg px-3 py-2 text-[#1C1917] focus:outline-none focus:border-[#78350F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#57534E] font-medium mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                    className="w-full bg-[#FAFAF9] border border-[#D6D3D1] rounded-lg px-3 py-2 text-[#1C1917] focus:outline-none focus:border-[#78350F]"
                  />
                </div>
                <div>
                  <label className="block text-[#57534E] font-medium mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="w-full bg-[#FAFAF9] border border-[#D6D3D1] rounded-lg px-3 py-2 text-[#1C1917] focus:outline-none focus:border-[#78350F]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-[#1C1917] hover:bg-[#292524] text-white font-medium rounded-lg transition-colors shadow-xs"
              >
                Save Shipping Address
              </button>
            </form>
          )}
        </div>

        {/* Footer Actions & Switcher */}
        <div className="px-6 py-4 bg-[#FAFAF9] border-t border-[#E7E5E4] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                switchDemoRole('admin');
                onSwitchToAdmin();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D6D3D1] text-[#78350F] hover:bg-[#F5F5F4] rounded-lg font-medium transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Switch to Admin Portal</span>
            </button>
          </div>

          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex items-center gap-1.5 text-stone-600 hover:text-red-700 font-medium transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
