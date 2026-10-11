import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { X, Trash2, Tag, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const {
    items,
    itemCount,
    subtotal,
    discount,
    shipping,
    total,
    appliedCoupon,
    couponError,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    const res = applyCoupon(couponCodeInput);
    setCouponFeedback(res.message);
    if (res.success) {
      setCouponCodeInput('');
    }
  };

  const freeShippingThreshold = 50;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end">
      {/* Click outside to close */}
      <div
        className="fixed inset-0"
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 border-l border-[#E7E5E4] animate-slideLeft">
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-[#E7E5E4] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#78350F]" />
            <h2 className="font-serif-display text-lg font-semibold text-[#1C1917]">
              Shopping Bag
            </h2>
            <span className="text-xs text-[#78716C] font-mono tabular-nums">
              ({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 text-[#78716C] hover:text-[#1C1917] hover:bg-[#F5F5F4] rounded-lg transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress */}
        <div className="px-6 py-3 bg-[#FAFAF9] border-b border-[#E7E5E4] text-xs">
          {remainingForFreeShipping > 0 ? (
            <div>
              <p className="text-[#57534E]">
                Add <span className="font-semibold text-[#78350F] font-mono tabular-nums">${remainingForFreeShipping.toFixed(2)}</span> more to unlock <span className="font-semibold">Free Express Shipping</span>.
              </p>
              <div className="w-full bg-[#E7E5E4] h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-[#78350F] h-full rounded-full transition-all duration-300"
                  style={{ width: `${freeShippingPercent}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>You have unlocked Complimentary Express Shipping!</span>
            </div>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-[#F5F5F4]">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 text-[#78716C]">
              <div className="w-16 h-16 rounded-full bg-[#F5F5F4] flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-[#A8A29E]" />
              </div>
              <h3 className="font-serif-display text-lg font-semibold text-[#1C1917] mb-1">
                Your bag is empty
              </h3>
              <p className="text-xs text-[#78716C] max-w-xs mb-6">
                Explore our curated watches, polarized shades, and leather goods to start your order.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="px-5 py-2.5 bg-[#1C1917] text-white text-xs font-semibold rounded-lg hover:bg-[#292524] transition-colors shadow-xs"
              >
                Browse Accessories
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={`${item.productId}-${item.selectedColor || ''}`}
                className="py-4 flex gap-4 items-center"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 bg-[#18181B] rounded-lg overflow-hidden shrink-0 border border-[#E7E5E4]">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-medium text-[#1C1917] truncate">
                      {item.product.name}
                    </h4>
                    <button
                      onClick={() =>
                        removeFromCart(item.productId, item.selectedColor)
                      }
                      className="text-[#A8A29E] hover:text-red-600 transition-colors p-0.5"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {item.selectedColor && (
                    <div className="text-[11px] text-[#78716C] mt-0.5">
                      Color: {item.selectedColor}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    {/* Stepper */}
                    <div className="flex items-center border border-[#D6D3D1] rounded bg-white">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.quantity - 1,
                            item.selectedColor
                          )
                        }
                        className="px-2 py-0.5 text-xs text-[#57534E] hover:bg-[#F5F5F4]"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-mono font-medium tabular-nums text-[#1C1917]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.quantity + 1,
                            item.selectedColor
                          )
                        }
                        disabled={item.quantity >= item.product.stock}
                        className="px-2 py-0.5 text-xs text-[#57534E] hover:bg-[#F5F5F4] disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-xs font-semibold text-[#1C1917] font-mono tabular-nums">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer with Coupon & Checkout */}
        {items.length > 0 && (
          <div className="p-6 border-t border-[#E7E5E4] bg-[#FAFAF9] space-y-4">
            {/* Coupon Code Accordion/Form */}
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-amber-50/80 border border-amber-200/80 rounded-lg px-3 py-2 text-xs">
                <div className="flex items-center gap-1.5 text-amber-900">
                  <Tag className="w-3.5 h-3.5 text-amber-700" />
                  <span className="font-semibold">{appliedCoupon.code}</span>
                  <span className="text-amber-800">
                    ({appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}% off` : `$${appliedCoupon.discountValue} off`})
                  </span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs text-amber-800 hover:text-red-700 font-medium underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                    placeholder="Enter coupon (e.g. WELCOME10)"
                    className="flex-1 bg-white border border-[#D6D3D1] rounded-lg px-3 py-1.5 text-xs text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:border-[#78350F]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-white border border-[#D6D3D1] hover:border-[#1C1917] text-xs font-medium text-[#1C1917] rounded-lg transition-colors whitespace-nowrap"
                  >
                    Apply
                  </button>
                </div>
                {(couponError || couponFeedback) && (
                  <p
                    className={`text-[11px] ${
                      couponError ? 'text-red-600' : 'text-emerald-700'
                    }`}
                  >
                    {couponError || couponFeedback}
                  </p>
                )}
              </form>
            )}

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-[#57534E] pt-2 border-t border-[#E7E5E4]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums text-[#1C1917] font-medium">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon Discount</span>
                  <span className="font-mono tabular-nums">-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="font-mono tabular-nums text-[#1C1917]">
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-[#1C1917] pt-2 border-t border-[#E7E5E4]">
                <span>Total Amount</span>
                <span className="font-mono tabular-nums">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Trigger */}
            <button
              onClick={() => {
                setIsCartOpen(false);
                onProceedToCheckout();
              }}
              className="w-full py-3.5 px-4 bg-[#1C1917] hover:bg-[#292524] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all whitespace-nowrap"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
