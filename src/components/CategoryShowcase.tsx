import React from 'react';
import { Category } from '../types';
import { Watch, Glasses, Wallet, ShoppingBag, Sparkles, Smartphone, ArrowRight } from 'lucide-react';

interface CategoryShowcaseProps {
  categories: Category[];
  activeCategory: string;
  onSelectCategory: (id: string) => void;
}

export const CategoryShowcase: React.FC<CategoryShowcaseProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
}) => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'Watch':
        return <Watch className="w-5 h-5 text-[#78350F]" />;
      case 'Glasses':
        return <Glasses className="w-5 h-5 text-[#78350F]" />;
      case 'Wallet':
        return <Wallet className="w-5 h-5 text-[#78350F]" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-5 h-5 text-[#78350F]" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-[#78350F]" />;
      case 'Smartphone':
        return <Smartphone className="w-5 h-5 text-[#78350F]" />;
      default:
        return <ShoppingBag className="w-5 h-5 text-[#78350F]" />;
    }
  };

  return (
    <section className="py-12 bg-white border-b border-[#E7E5E4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs uppercase font-semibold tracking-wider text-[#78350F] mb-1">
              Curated Collections
            </div>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#1C1917]">
              Browse By Category
            </h2>
          </div>
          <button
            onClick={() => onSelectCategory('all')}
            className="text-xs font-semibold text-[#78350F] hover:text-[#92400E] inline-flex items-center gap-1 self-start md:self-auto"
          >
            <span>View All ({categories.reduce((acc, c) => acc + c.itemCount, 0)} items)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex flex-col p-4 rounded-xl border text-left transition-all duration-200 group ${
                  isSelected
                    ? 'border-[#78350F] bg-[#FEF3C7]/20 shadow-sm'
                    : 'border-[#E7E5E4] bg-[#FAFAF9] hover:border-[#D6D3D1] hover:bg-white hover:shadow-xs'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-white border border-[#E7E5E4] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-2xs">
                  {getIcon(cat.iconName)}
                </div>
                <div className="font-medium text-sm text-[#1C1917] group-hover:text-[#78350F] transition-colors">
                  {cat.name}
                </div>
                <div className="text-xs text-[#78716C] mt-1 tabular-nums">
                  {cat.itemCount} items
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
