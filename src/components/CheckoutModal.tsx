import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Address, Order, PaymentMethod } from '../types';
import { RazorpayModal } from './RazorpayModal';
import { X, CheckCircle, Truck, CreditCard, Banknote, ShieldCheck, ArrowRight } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCompleted: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderCompleted,
}) => {
  const { items, subtotal, discount, shipping, total, appliedCoupon, clearCart } = useCart();
  const { currentUser, updateAddress } = useAuth();

  const [address, setAddress] = useState<Address>(() => {
    if (currentUser?.address) return currentUser.address;
    return {
      fullName: currentUser?.name || '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States',
      phone: currentUser?.phone || '',
    };
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const handleAddressChange = (field: keyof Address, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const validateAddress = (): boolean => {
    if (
      !address.fullName.trim() ||
      !address.street.trim() ||
      !address.city.trim() ||
      !address.postalCode.trim() ||
      !address.phone.trim()
    ) {
      setErrorMessage('Please fill in all required shipping address fields.');
      return false;
    }
    return true;
  };

  const executeOrderCreation = (paymentTransactionId?: string) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const payload = {
      userId: currentUser?.id || `guest-${Date.now()}`,
      customerName: address.fullName,
      customerEmail: currentUser?.email || 'customer@example.com',
      customerPhone: address.phone,
      shippingAddress: address,
      paymentMethod,
      paymentTransactionId,
      couponCode: appliedCoupon?.code,
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        selectedColor: i.selectedColor,
      })),
      notes,
    };

    const result = api.createOrder(payload);

    setIsSubmitting(false);

    if (result.success && result.order) {
      // Save address to user profile if logged in
      if (currentUser) {
        updateAddress(address);
      }
      clearCart();
      setConfirmedOrder(result.order);
      onOrderCompleted(result.order);
    } else {
      setErrorMessage(result.error || 'Failed to process order. Please try again.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAddress()) return;

    if (paymentMethod === 'razorpay') {
      // Launch Razorpay gateway modal
      setShowRazorpayModal(true);
    } else {
      // Cash on Delivery direct placement
      executeOrderCreation();
    }
  };

  const handleRazorpaySuccess = (paymentId: string) => {
    setShowRazorpayModal(false);
    executeOrderCreation(paymentId);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
        <div
          className="relative bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-[#E7E5E4] overflow-hidden my-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#E7E5E4] flex items-center justify-between bg-[#FAFAF9]">
            <h2 className="font-serif-display text-xl font-semibold text-[#1C1917]">
              {confirmedOrder ? 'Order Confirmed' : 'Checkout & Delivery'}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 text-[#78716C] hover:text-[#1C1917] rounded-lg transition-colors"
              aria-label="Close checkout"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {confirmedOrder ? (
            /* Post-Order Receipt / Confirmation View */
            <div className="p-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10" />
              </div>

              <div>
                <h3 className="font-serif-display text-2xl font-semibold text-[#1C1917]">
                  Thank you for your order!
                </h3>
                <p className="text-sm text-[#57534E] mt-1">
                  Your order <span className="font-mono font-semibold text-[#78350F]">{confirmedOrder.orderNumber}</span> has been confirmed and scheduled for packaging.
                </p>
              </div>

              {/* Order Snapshot Box */}
              <div className="bg-[#FAFAF9] border border-[#E7E5E4] rounded-xl p-5 text-left text-xs max-w-lg mx-auto space-y-3">
                <div className="flex justify-between pb-2 border-b border-[#E7E5E4]">
                  <span className="text-[#78716C]">Payment Method:</span>
                  <span className="font-semibold text-[#1C1917]">
                    {confirmedOrder.paymentMethod === 'razorpay'
                      ? 'Razorpay Online (Paid)'
                      : 'Cash on Delivery (Pending)'}
                  </span>
                </div>
                {confirmedOrder.paymentTransactionId && (
                  <div className="flex justify-between pb-2 border-b border-[#E7E5E4]">
                    <span className="text-[#78716C]">Transaction ID:</span>
                    <span className="font-mono font-medium text-[#1C1917]">
                      {confirmedOrder.paymentTransactionId}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pb-2 border-b border-[#E7E5E4]">
                  <span className="text-[#78716C]">Deliver to:</span>
                  <span className="font-medium text-[#1C1917] text-right">
                    {confirmedOrder.shippingAddress.fullName}, {confirmedOrder.shippingAddress.street}, {confirmedOrder.shippingAddress.city}
                  </span>
                </div>
                <div className="flex justify-between pt-1 font-semibold text-sm">
                  <span>Total Billed:</span>
                  <span className="font-mono tabular-nums text-[#78350F]">
                    ${confirmedOrder.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-[#1C1917] text-white text-xs font-semibold rounded-lg hover:bg-[#292524] transition-colors"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Shipping Details */}
                <div className="md:col-span-7 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#1C1917] uppercase tracking-wider">
                    <Truck className="w-4 h-4 text-[#78350F]" />
                    <span>Shipping Address</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[#57534E] font-medium mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={address.fullName}
                        onChange={(e) => handleAddressChange('fullName', e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-[#FAFAF9] border border-[#D6D3D1] rounded-lg px-3 py-2 text-xs text-[#1C1917] focus:outline-none focus:border-[#78350F]"
                      />
                    </div>

                    <div>
                      <label className="block text-[#57534E] font-medium mb-1">Street Address *</label>
                      <input
                        type="text"
                        required
                        value={address.street}
                        onChange={(e) => handleAddressChange('street', e.target.value)}
                        placeholder="123 Fashion Blvd, Apt 4B"
                        className="w-full bg-[#FAFAF9] border border-[#D6D3D1] rounded-lg px-3 py-2 text-xs text-[#1C1917] focus:outline-none focus:border-[#78350F]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[#57534E] font-medium mb-1">City *</label>
                        <input
                          type="text"
                          required
                          value={address.city}
                          onChange={(e) => handleAddressChange('city', e.target.value)}
                          placeholder="New York"
                          className="w-full bg-[#FAFAF9] border border-[#D6D3D1] rounded-lg px-3 py-2 text-xs text-[#1C1917] focus:outline-none focus:border-[#78350F]"
                        />
                      </div>
                      <div>
                        <label className="block text-[#57534E] font-medium mb-1">State / Province</label>
                        <input
                          type="text"
                          value={address.state}
                          onChange={(e) => handleAddressChange('state', e.target.value)}
                          placeholder="NY"
                          className="w-full bg-[#FAFAF9] border border-[#D6D3D1] rounded-lg px-3 py-2 text-xs text-[#1C1917] focus:outline-none focus:border-[#78350F]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[#57534E] font-medium mb-1">Postal / ZIP Code *</label>
                        <input
                          type="text"
                          required
                          value={address.postalCode}
                          onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                          placeholder="10001"
                          className="w-full bg-[#FAFAF9] border border-[#D6D3D1] rounded-lg px-3 py-2 text-xs text-[#1C1917] focus:outline-none focus:border-[#78350F]"
                        />
                      </div>
                      <div>
                        <label className="block text-[#57534E] font-medium mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          value={address.phone}
                          onChange={(e) => handleAddressChange('phone', e.target.value)}
                          placeholder="+1 555-0199"
                          className="w-full bg-[#FAFAF9] border border-[#D6D3D1] rounded-lg px-3 py-2 text-xs text-[#1C1917] focus:outline-none focus:border-[#78350F]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[#57534E] font-medium mb-1">Delivery Notes (Optional)</label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Leave package at the concierge or front porch"
                        className="w-full bg-[#FAFAF9] border border-[#D6D3D1] rounded-lg px-3 py-2 text-xs text-[#1C1917] focus:outline-none focus:border-[#78350F]"
                      />
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="pt-4 border-t border-[#E7E5E4] space-y-3">
                    <div className="text-xs font-semibold text-[#1C1917] uppercase tracking-wider">
                      Payment Option
                    </div>

                    <div className="space-y-2">
                      <label
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          paymentMethod === 'cod'
                            ? 'border-[#78350F] bg-amber-50/30'
                            : 'border-[#E7E5E4] hover:border-[#D6D3D1]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="mt-0.5 text-[#78350F]"
                        />
                        <div className="flex-1 text-xs">
                          <div className="flex items-center gap-1.5 font-semibold text-[#1C1917]">
                            <Banknote className="w-4 h-4 text-[#78350F]" />
                            <span>Cash on Delivery (COD)</span>
                          </div>
                          <p className="text-[#78716C] mt-0.5">
                            Pay in cash when your order arrives at your doorstep. Verified delivery.
                          </p>
                        </div>
                      </label>

                      <label
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          paymentMethod === 'razorpay'
                            ? 'border-[#78350F] bg-amber-50/30'
                            : 'border-[#E7E5E4] hover:border-[#D6D3D1]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'razorpay'}
                          onChange={() => setPaymentMethod('razorpay')}
                          className="mt-0.5 text-[#78350F]"
                        />
                        <div className="flex-1 text-xs">
                          <div className="flex items-center gap-1.5 font-semibold text-[#1C1917]">
                            <CreditCard className="w-4 h-4 text-[#78350F]" />
                            <span>Razorpay Online Payment (UPI, Cards, NetBanking)</span>
                          </div>
                          <p className="text-[#78716C] mt-0.5">
                            Instant zero-touch digital payment with 256-bit encryption.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Order Summary Sidebar */}
                <div className="md:col-span-5 bg-[#FAFAF9] p-5 rounded-xl border border-[#E7E5E4] flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-serif-display text-base font-semibold text-[#1C1917] mb-3">
                      Order Summary
                    </h3>

                    <div className="max-h-48 overflow-y-auto divide-y divide-[#E7E5E4] text-xs pr-1">
                      {items.map((i) => (
                        <div key={`${i.productId}-${i.selectedColor}`} className="py-2 flex justify-between gap-2">
                          <div className="truncate">
                            <span className="font-medium text-[#1C1917]">{i.product.name}</span>
                            <span className="text-[#78716C] ml-1">× {i.quantity}</span>
                            {i.selectedColor && (
                              <div className="text-[10px] text-[#A8A29E]">{i.selectedColor}</div>
                            )}
                          </div>
                          <span className="font-mono tabular-nums text-[#1C1917] shrink-0 font-medium">
                            ${(i.product.price * i.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-[#E7E5E4] space-y-1.5 text-xs text-[#57534E]">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-mono tabular-nums">${subtotal.toFixed(2)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-emerald-700 font-medium">
                          <span>Coupon ({appliedCoupon?.code})</span>
                          <span className="font-mono tabular-nums">-${discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span className="font-mono tabular-nums">
                          {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold text-[#1C1917] pt-2 border-t border-[#E7E5E4]">
                        <span>Total Due</span>
                        <span className="font-mono tabular-nums">${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#E7E5E4] space-y-3">
                    <button
                      type="submit"
                      disabled={isSubmitting || items.length === 0}
                      className="w-full py-3.5 px-4 bg-[#1C1917] hover:bg-[#292524] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 whitespace-nowrap"
                    >
                      {isSubmitting ? (
                        <span>Validating and Placing Order...</span>
                      ) : (
                        <>
                          <span>
                            {paymentMethod === 'razorpay'
                              ? `Proceed to Razorpay · $${total.toFixed(2)}`
                              : `Confirm Order (COD) · $${total.toFixed(2)}`}
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#78716C]">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#78350F]" />
                      <span>Encrypted SSL · 100% Purchase Protection</span>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Razorpay Gateway Simulation Modal */}
      {showRazorpayModal && (
        <RazorpayModal
          amount={total}
          orderNumber={`TMP-${Date.now().toString().slice(-5)}`}
          customerName={address.fullName}
          customerEmail={currentUser?.email || 'customer@example.com'}
          onSuccess={handleRazorpaySuccess}
          onClose={() => setShowRazorpayModal(false)}
        />
      )}
    </>
  );
};
