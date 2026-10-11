import React, { useState } from 'react';
import { X } from 'lucide-react';

export const PromoBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-[#1C1917] text-[#FAFAF9] text-xs py-2 px-4 border-b border-[#292524] relative z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex-1 text-center font-medium tracking-wide">
          <span>Complimentary express delivery on orders over $50</span>
          <span className="mx-2 text-[#78716C]">·</span>
          <span className="text-[#FBBF24]">Use code WELCOME10 for 10% off</span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-[#A8A29E] hover:text-white transition-colors p-0.5 rounded"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
