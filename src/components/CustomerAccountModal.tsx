import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Order, Address } from '../types';
import { X, User, Package, MapPin, LogOut, Shield, CheckCircle2, Clock } from 'lucide-react';

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

  if (!isOpen || !currentUser) return null;

  const orders: Order[] = api.getOrders(currentUser.id);

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    updateAddress(addressForm);
    setAddressSavedNotice(true);
    setTimeout(() => setAddressSavedNotice(false), 2500);
  };

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
            <div className="space-y-4">
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
                    className="p-4 bg-[#FAFAF9] border border-[#E7E5E4] rounded-xl space-y-3 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E7E5E4] pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-sm text-[#1C1917]">
                          {order.orderNumber}
                        </span>
                        <span className="text-[#A8A29E]">·</span>
                        <span className="text-[#78716C]">
                          {new Date(order.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded border text-[11px] font-semibold capitalize ${getStatusColor(
                            order.orderStatus
                          )}`}
                        >
                          {order.orderStatus}
                        </span>
                        <span className="text-xs font-mono font-semibold text-[#1C1917] tabular-nums">
                          ${order.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Order line items */}
                    <div className="space-y-1.5">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-xs">
                          <span className="text-[#57534E]">
                            {item.productName} <span className="text-[#A8A29E]">× {item.quantity}</span>
                          </span>
                          <span className="font-mono tabular-nums text-[#1C1917]">
                            ${item.subtotal.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-[#E7E5E4] flex flex-wrap justify-between items-center text-[11px] text-[#78716C]">
                      <span>
                        Payment: {order.paymentMethod === 'razorpay' ? 'Razorpay Online' : 'Cash on Delivery'}
                      </span>
                      {order.couponCode && (
                        <span className="text-amber-800">Coupon: {order.couponCode} applied</span>
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
