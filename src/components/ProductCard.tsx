import React from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { Plus, Eye, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenDetails,
}) => {
  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = React.useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = addToCart(product, 1);
    if (result.success) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1800);
    }
  };

  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock <= 0;

  return (
    <div
      onClick={() => onOpenDetails(product)}
      className="group flex flex-col bg-white rounded-xl border border-[#E7E5E4] overflow-hidden hover:border-[#D6D3D1] hover:shadow-md transition-all duration-300 cursor-pointer relative"
    >
      {/* Product Image Slot (65%-70% of card visual) */}
      <div className="relative aspect-[4/3] bg-[#18181B] overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Quiet Single Tag (No badge spam) */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.isBestseller && (
            <span className="text-[11px] font-medium tracking-wide bg-[#1C1917]/90 text-white px-2 py-0.5 rounded shadow-xs">
              Bestseller
            </span>
          )}
          {product.originalPrice && !product.isBestseller && (
            <span className="text-[11px] font-medium tracking-wide bg-[#78350F]/90 text-white px-2 py-0.5 rounded shadow-xs">
              Save ${product.originalPrice - product.price}
            </span>
          )}
        </div>

        {/* Quick View / Add overlay button on hover */}
        <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
              isOutOfStock
                ? 'bg-neutral-800 text-neutral-400 cursor-not-allowed'
                : justAdded
                ? 'bg-emerald-700 text-white'
                : 'bg-white hover:bg-[#F5F5F4] text-[#1C1917]'
            }`}
            title={isOutOfStock ? 'Out of stock' : 'Quick add to bag'}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added to Bag</span>
              </>
            ) : isOutOfStock ? (
              <span>Out of Stock</span>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Quick Add</span>
              </>
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(product);
            }}
            className="p-2 bg-white/90 hover:bg-white text-[#1C1917] rounded-lg shadow-sm transition-colors"
            title="Inspect details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Card Content & Metadata */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Unboxed Metadata (Zero-pill discipline) */}
          <div className="flex items-center gap-1.5 text-xs text-[#78716C] mb-1">
            <span className="uppercase tracking-wider font-medium text-[11px]">
              {product.categoryName}
            </span>
            <span aria-hidden="true">·</span>
            <span>{product.sku}</span>
          </div>

          <h3 className="font-medium text-sm text-[#1C1917] group-hover:text-[#78350F] transition-colors line-clamp-1">
            {product.name}
          </h3>
        </div>

        {/* Pricing & Stock Status */}
        <div className="flex items-baseline justify-between pt-2 border-t border-[#F5F5F4]">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-base text-[#1C1917] font-mono tabular-nums">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-[#A8A29E] line-through font-mono tabular-nums">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <div className="text-right">
            {isOutOfStock ? (
              <span className="text-xs font-medium text-red-600">Out of stock</span>
            ) : isLowStock ? (
              <span className="text-xs font-medium text-amber-700">
                Only {product.stock} left
              </span>
            ) : (
              <span className="text-xs text-[#78716C]">In stock</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
