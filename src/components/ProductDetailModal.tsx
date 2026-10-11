import React, { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { X, Check, Star, ShieldCheck, Truck, RefreshCw, AlertCircle, ShoppingBag } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
}) => {
  const { addToCart } = useCart();
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (product && product.colorOptions && product.colorOptions.length > 0) {
      setSelectedColor(product.colorOptions[0]);
    }
    setQuantity(1);
    setToastMessage(null);
  }, [product]);

  if (!product) return null;

  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const res = addToCart(product, quantity, selectedColor);
    if (res.success) {
      setToastMessage(res.message);
      setTimeout(() => setToastMessage(null), 3000);
    } else {
      setToastMessage(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div
        className="relative bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-[#E7E5E4] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dismiss Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white text-[#57534E] hover:text-[#1C1917] rounded-full transition-colors shadow-xs"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery / Visual Column */}
          <div className="bg-[#18181B] p-6 flex flex-col justify-center items-center relative aspect-square md:aspect-auto">
            <img
              src={product.images[0]}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full max-h-[420px] object-contain rounded-lg"
            />
            {product.materials && (
              <div className="absolute bottom-4 left-6 right-6 text-center text-xs text-stone-400">
                Crafted from: {product.materials}
              </div>
            )}
          </div>

          {/* Contiguous Purchase Module */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div>
              {/* Unboxed Metadata (Zero-pill discipline) */}
              <div className="flex items-center gap-2 text-xs text-[#78716C] mb-2">
                <span className="uppercase font-semibold tracking-wider text-[#78350F]">
                  {product.categoryName}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">{product.sku}</span>
              </div>

              <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#1C1917] leading-tight">
                {product.name}
              </h2>

              {/* Price & Rating */}
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-[#1C1917] font-mono tabular-nums">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-[#A8A29E] line-through font-mono tabular-nums">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-xs text-[#57534E] pl-4 border-l border-[#E7E5E4]">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium">{product.rating}</span>
                  <span className="text-[#A8A29E]">({product.reviewCount} reviews)</span>
                </div>
              </div>

              {/* Stock status indicator */}
              <div className="mt-3">
                {isOutOfStock ? (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span>Currently out of stock</span>
                  </div>
                ) : isLowStock ? (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded inline-flex">
                    <span>Only {product.stock} units remaining in stock</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                    <Check className="w-4 h-4" />
                    <span>In stock ({product.stock} units available)</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-[#57534E] mt-4 leading-relaxed">
                {product.description}
              </p>

              {/* Specifications / Highlights */}
              {product.details && product.details.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[#F5F5F4]">
                  <div className="text-xs font-semibold text-[#1C1917] uppercase tracking-wider mb-2">
                    Key Specifications
                  </div>
                  <ul className="text-xs text-[#57534E] space-y-1.5">
                    {product.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#78350F] font-bold">·</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Color variant selector if available */}
              {product.colorOptions && product.colorOptions.length > 0 && (
                <div className="mt-5">
                  <div className="text-xs font-medium text-[#1C1917] mb-2">
                    Color: <span className="text-[#78350F] font-semibold">{selectedColor}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.colorOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setSelectedColor(opt)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                          selectedColor === opt
                            ? 'border-[#78350F] bg-[#FEF3C7]/40 text-[#78350F] font-semibold'
                            : 'border-[#E7E5E4] text-[#57534E] hover:border-[#D6D3D1]'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Purchase Actions */}
            <div className="pt-4 border-t border-[#E7E5E4] space-y-4">
              <div className="flex items-center gap-4">
                {/* Quantity Stepper */}
                <div className="flex items-center border border-[#D6D3D1] rounded-lg overflow-hidden bg-[#FAFAF9]">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="px-3 py-2 text-sm font-medium text-[#57534E] hover:bg-[#E7E5E4] transition-colors disabled:opacity-40"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="px-3 py-2 text-sm font-mono font-medium text-[#1C1917] tabular-nums min-w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity((q) => Math.min(product.stock, q + 1))
                    }
                    disabled={quantity >= product.stock || isOutOfStock}
                    className="px-3 py-2 text-sm font-medium text-[#57534E] hover:bg-[#E7E5E4] transition-colors disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                {/* Primary Add to Bag CTA */}
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 py-3 px-6 text-sm font-medium rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${
                    isOutOfStock
                      ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                      : 'bg-[#1C1917] hover:bg-[#292524] text-white'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    {isOutOfStock ? 'Sold Out' : `Add to Bag · $${(product.price * quantity).toFixed(2)}`}
                  </span>
                </button>
              </div>

              {/* Feedback toast */}
              {toastMessage && (
                <div className="p-2.5 rounded-lg text-xs font-medium bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] flex items-center gap-2">
                  <Check className="w-3.5 h-3.5" />
                  <span>{toastMessage}</span>
                </div>
              )}

              {/* Value props */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-[#78716C] text-center border-t border-[#F5F5F4]">
                <div className="flex flex-col items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-[#78350F]" />
                  <span>Free Shipping &gt;$50</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#78350F]" />
                  <span>3-Yr Guarantee</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5 text-[#78350F]" />
                  <span>30-Day Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
