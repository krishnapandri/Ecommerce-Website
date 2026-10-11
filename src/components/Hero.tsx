import React from 'react';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { getProductPlaceholder } from '../utils/productImages';

interface HeroProps {
  onExplore: () => void;
  onSelectCategory: (catId: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onExplore, onSelectCategory }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FAFAF9] via-[#F5F5F4] to-[#FAFAF9] border-b border-[#E7E5E4] py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#78350F] uppercase">
              <span>Handcrafted Daily Wear</span>
              <span aria-hidden="true">·</span>
              <span>2026 Collection</span>
            </div>

            <h1 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#1C1917] leading-[1.1] text-balance">
              Refined accessories crafted for everyday distinction.
            </h1>

            <p className="text-base sm:text-lg text-[#57534E] max-w-xl leading-relaxed">
              Timeless watches, polarized sunglasses, vegetable-tanned leather wallets, and architectural jewelry. Exceptional craftsmanship without luxury markups.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onExplore}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#1C1917] hover:bg-[#292524] text-white text-sm font-medium rounded-lg transition-all shadow-sm group whitespace-nowrap"
              >
                <span>Shop Featured Collection</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => onSelectCategory('cat-1')}
                className="inline-flex items-center gap-2 px-5 py-3.5 bg-white hover:bg-[#F5F5F4] text-[#1C1917] text-sm font-medium rounded-lg border border-[#D6D3D1] transition-all whitespace-nowrap"
              >
                <span>View Watches</span>
              </button>
            </div>

            {/* Quiet trust markers */}
            <div className="pt-6 border-t border-[#E7E5E4] flex flex-wrap items-center gap-6 text-xs text-[#78716C]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#78350F]" />
                <span>3-Year Warranty</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#78350F]" />
                <span>Free Shipping over $50</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#78350F]" />
                <span>Cash on Delivery & Razorpay</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Campaign Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden bg-[#18181B] border border-[#27272A] shadow-xl group aspect-[4/3]">
              <img
                src={getProductPlaceholder('watches', 'Minimalist Obsidian Chronograph')}
                alt="LuxeLane Featured Chronograph"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                <div className="text-xs uppercase tracking-wider text-[#FBBF24] font-medium mb-1">
                  Bestseller Spotlight
                </div>
                <div className="font-serif-display text-xl font-semibold">
                  Obsidian Chronograph 40mm
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/20 text-xs text-white/80">
                  <span className="font-mono tabular-nums text-sm font-semibold text-white">
                    $89.00 <span className="line-through text-white/50 text-xs">$129.00</span>
                  </span>
                  <span className="text-white/90">In Stock · Ready to Ship</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
