import React from 'react';
import { ShieldCheck, Truck, RotateCcw, CreditCard } from 'lucide-react';

interface FooterProps {
  onSelectCategory: (id: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory, onOpenAdmin }) => {
  return (
    <footer className="bg-[#1C1917] text-white border-t border-[#292524] pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Value Prop Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-[#292524] text-xs">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-[#292524] text-[#FBBF24]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-white text-sm">Complimentary Delivery</div>
              <p className="text-[#A8A29E] mt-1 leading-relaxed">
                Free standard express delivery across all domestic orders exceeding $50.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-[#292524] text-[#FBBF24]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-white text-sm">3-Year International Warranty</div>
              <p className="text-[#A8A29E] mt-1 leading-relaxed">
                Every timepiece, leather good, and eyewear frame is warrantied against defects.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-[#292524] text-[#FBBF24]">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-white text-sm">Hassle-Free 30-Day Returns</div>
              <p className="text-[#A8A29E] mt-1 leading-relaxed">
                Try your accessories in your daily life. Simple returns and exchanges.
              </p>
            </div>
          </div>
        </div>

        {/* 4-column Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs text-[#A8A29E]">
          <div className="space-y-3">
            <div className="font-serif-display text-lg text-white font-semibold">LuxeLane</div>
            <p className="leading-relaxed">
              Curated fashion and lifestyle accessories crafted from premium materials at sensible prices.
            </p>
            <div className="pt-2 text-[11px] text-[#78716C]">
              Est. 2026 · Direct to Consumer
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">
              Collections
            </div>
            <div><button onClick={() => onSelectCategory('cat-1')} className="hover:text-white transition-colors">Watches & Timepieces</button></div>
            <div><button onClick={() => onSelectCategory('cat-2')} className="hover:text-white transition-colors">Polarized Eyewear</button></div>
            <div><button onClick={() => onSelectCategory('cat-3')} className="hover:text-white transition-colors">Leather Wallets</button></div>
            <div><button onClick={() => onSelectCategory('cat-4')} className="hover:text-white transition-colors">Bags & Commute Folios</button></div>
            <div><button onClick={() => onSelectCategory('cat-5')} className="hover:text-white transition-colors">Minimalist Bracelets</button></div>
          </div>

          <div className="space-y-2">
            <div className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">
              Customer Care
            </div>
            <div><span className="hover:text-white transition-colors cursor-pointer">Shipping & Delivery Rates</span></div>
            <div><span className="hover:text-white transition-colors cursor-pointer">Warranty & Authenticity</span></div>
            <div><span className="hover:text-white transition-colors cursor-pointer">Returns & Exchanges</span></div>
            <div><span className="hover:text-white transition-colors cursor-pointer">Care & Leather Maintenance</span></div>
          </div>

          <div className="space-y-2">
            <div className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">
              Store Operations
            </div>
            <div><button onClick={onOpenAdmin} className="text-[#FBBF24] hover:underline font-medium">Administrator Dashboard</button></div>
            <div className="pt-3">
              <span className="text-[11px] block text-[#78716C]">Supported Payments:</span>
              <span className="text-stone-300">Cash on Delivery · Razorpay (UPI / Visa / MC)</span>
            </div>
          </div>
        </div>

        {/* Bottom line */}
        <div className="pt-8 border-t border-[#292524] flex flex-col sm:flex-row items-center justify-between text-xs text-[#78716C] gap-4">
          <div>
            © 2026 LuxeLane Essentials Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span aria-hidden="true">·</span>
            <span>Terms of Purchase</span>
            <span aria-hidden="true">·</span>
            <span>Accessibility</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
