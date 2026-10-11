import React, { useState } from 'react';
import { ShoppingBag, User as UserIcon, Shield, Search, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onSelectCategory: (categoryId: string) => void;
  activeCategory: string;
  onOpenAuth: () => void;
  onOpenAccount: () => void;
  onToggleAdmin: () => void;
  isAdminView: boolean;
  onSearchChange: (q: string) => void;
  searchQuery: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSelectCategory,
  activeCategory,
  onOpenAuth,
  onOpenAccount,
  onToggleAdmin,
  isAdminView,
  onSearchChange,
  searchQuery,
}) => {
  const { itemCount, setIsCartOpen } = useCart();
  const { currentUser, isAdmin } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navCategories = [
    { id: 'all', label: 'All Essentials' },
    { id: 'cat-1', label: 'Watches' },
    { id: 'cat-2', label: 'Sunglasses' },
    { id: 'cat-3', label: 'Wallets' },
    { id: 'cat-4', label: 'Bags' },
    { id: 'cat-5', label: 'Bracelets' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#FAFAF9]/95 backdrop-blur-md border-b border-[#E7E5E4] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element in display face) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              if (isAdminView) onToggleAdmin();
              onSelectCategory('all');
            }}
            className="text-2xl font-serif-display font-semibold tracking-tight text-[#1C1917] hover:text-[#78350F] transition-colors whitespace-nowrap"
          >
            LuxeLane
          </button>
        </div>

        {/* Zone 2: 4-5 single-line clean text navigation links */}
        {!isAdminView && (
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#57534E]">
            {navCategories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`relative py-1 transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'text-[#1C1917] font-semibold'
                      : 'hover:text-[#1C1917]'
                  }`}
                >
                  {cat.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#78350F] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>
        )}

        {isAdminView && (
          <div className="hidden md:flex items-center text-sm font-medium text-[#78350F]">
            <span>Admin Management Portal</span>
          </div>
        )}

        {/* Zone 3: Primary Action / Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Search Toggle */}
          {!isAdminView && (
            <div className="relative">
              {isSearchOpen ? (
                <div className="flex items-center bg-[#F5F5F4] border border-[#D6D3D1] rounded-lg px-2.5 py-1.5 transition-all w-48 sm:w-64">
                  <Search className="w-4 h-4 text-[#78716C] mr-2 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search accessories..."
                    autoFocus
                    className="w-full bg-transparent text-xs text-[#1C1917] placeholder-[#A8A29E] focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      onSearchChange('');
                    }}
                    className="text-[#A8A29E] hover:text-[#1C1917] ml-1 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 text-[#57534E] hover:text-[#1C1917] transition-colors rounded-lg hover:bg-[#F5F5F4]"
                  title="Search products"
                  aria-label="Open search input"
                >
                  <Search className="w-4.5 h-4.5" />
                </button>
              )}
            </div>
          )}

          {/* Admin Switcher Button */}
          <button
            onClick={onToggleAdmin}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border whitespace-nowrap ${
              isAdminView
                ? 'bg-[#1C1917] text-white border-[#1C1917]'
                : 'bg-white text-[#57534E] border-[#E7E5E4] hover:bg-[#F5F5F4] hover:text-[#1C1917]'
            }`}
            title="Toggle Admin View"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{isAdminView ? 'Storefront' : 'Admin'}</span>
          </button>

          {/* Account Button */}
          <button
            onClick={() => {
              if (currentUser) {
                onOpenAccount();
              } else {
                onOpenAuth();
              }
            }}
            className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 text-xs font-medium text-[#57534E] hover:text-[#1C1917] rounded-lg hover:bg-[#F5F5F4] transition-colors whitespace-nowrap"
            title={currentUser ? `Signed in as ${currentUser.name}` : 'Sign in'}
          >
            <UserIcon className="w-4.5 h-4.5 sm:w-4 sm:h-4 text-[#78716C]" />
            <span className="hidden sm:inline">
              {currentUser ? currentUser.name.split(' ')[0] : 'Sign In'}
            </span>
          </button>

          {/* Cart Bag Drawer Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center justify-center p-2 text-[#1C1917] hover:text-[#78350F] transition-colors rounded-lg hover:bg-[#F5F5F4]"
            aria-label="View shopping cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#78350F] text-white text-[10px] font-semibold rounded-full min-w-4.5 h-4.5 flex items-center justify-center px-1 tabular-nums">
                {itemCount}
              </span>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#57534E] hover:text-[#1C1917]"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E7E5E4] bg-[#FAFAF9] px-4 pt-3 pb-5 space-y-2">
          <div className="text-xs uppercase font-semibold text-[#A8A29E] tracking-wider mb-2">
            Categories
          </div>
          <div className="grid grid-cols-2 gap-2">
            {navCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  setMobileMenuOpen(false);
                }}
                className={`text-left text-sm py-2 px-3 rounded-md transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-[#E7E5E4] font-semibold text-[#1C1917]'
                    : 'text-[#57534E] hover:bg-[#F5F5F4]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-[#E7E5E4] flex items-center justify-between">
            <button
              onClick={() => {
                onToggleAdmin();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-xs font-medium text-[#78350F] py-1.5"
            >
              <Shield className="w-4 h-4" />
              <span>{isAdminView ? 'Switch to Storefront' : 'Switch to Admin Panel'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
