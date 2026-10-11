import React, { useState, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { api } from './services/api';
import { Product, Order } from './types';
import { PromoBanner } from './components/PromoBanner';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CategoryShowcase } from './components/CategoryShowcase';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { CustomerAccountModal } from './components/CustomerAccountModal';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';
import { Filter, SlidersHorizontal, ArrowUpDown, Sparkles, ShieldCheck } from 'lucide-react';

function Storefront() {
  const { currentUser } = useAuth();
  const { setIsCartOpen } = useCart();

  // Navigation & View state
  const [isAdminView, setIsAdminView] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'rating' | 'newest'>('newest');
  const [maxPrice, setMaxPrice] = useState<number>(150);

  // Modals state
  const [activeProductModal, setActiveProductModal] = useState<Product | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Data fetching from transactional repository
  const categories = useMemo(() => api.getCategories(), []);
  const allProducts = useMemo(() => {
    return api.getProducts({
      categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
      search: searchQuery,
      maxPrice: maxPrice,
      sortBy: sortBy,
      activeOnly: true,
    });
  }, [selectedCategory, searchQuery, maxPrice, sortBy]);

  // Featured / Bestsellers quick slices
  const bestsellers = useMemo(() => {
    return api.getProducts({ activeOnly: true }).filter((p) => p.isBestseller).slice(0, 3);
  }, []);

  const handleOrderCompleted = (order: Order) => {
    // Optionally trigger feedback or keep checkout open on receipt
  };

  if (isAdminView) {
    return <AdminDashboard onBackToStorefront={() => setIsAdminView(false)} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF9] text-[#1C1917]">
      {/* 1. Slim Promo Announcement */}
      <PromoBanner />

      {/* 2. Top Navigation Bar (3-Zone Contract) */}
      <Navbar
        onSelectCategory={setSelectedCategory}
        activeCategory={selectedCategory}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenAccount={() => setIsAccountModalOpen(true)}
        onToggleAdmin={() => setIsAdminView(true)}
        isAdminView={isAdminView}
        onSearchChange={setSearchQuery}
        searchQuery={searchQuery}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* 3. Hero Section (shown when no specific search is active) */}
        {!searchQuery && selectedCategory === 'all' && (
          <Hero
            onExplore={() => {
              const el = document.getElementById('catalog-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            onSelectCategory={(id) => {
              setSelectedCategory(id);
              const el = document.getElementById('catalog-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        )}

        {/* 4. Categories Showcase */}
        {!searchQuery && (
          <CategoryShowcase
            categories={categories}
            activeCategory={selectedCategory}
            onSelectCategory={(id) => {
              setSelectedCategory(id);
              const el = document.getElementById('catalog-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        )}

        {/* 5. Product Catalog & Filter Grid */}
        <section id="catalog-section" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          {/* Section Header & Interactive Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 mb-6 border-b border-[#E7E5E4] gap-4">
            <div>
              <div className="text-xs uppercase font-semibold tracking-wider text-[#78350F] mb-1">
                {selectedCategory === 'all'
                  ? 'Complete Catalog'
                  : categories.find((c) => c.id === selectedCategory)?.name || 'Accessories'}
              </div>
              <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#1C1917]">
                {searchQuery ? `Search Results for "${searchQuery}"` : 'All Accessories'}
              </h2>
              <div className="text-xs text-[#78716C] mt-1 tabular-nums">
                Showing {allProducts.length} items
              </div>
            </div>

            {/* Filter & Sort Controls */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              {/* Price Filter Slider */}
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#D6D3D1]">
                <span className="text-[#78716C]">Max:</span>
                <span className="font-mono tabular-nums font-semibold text-[#1C1917] min-w-9">
                  ${maxPrice}
                </span>
                <input
                  type="range"
                  min="20"
                  max="150"
                  step="5"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-20 sm:w-28 accent-[#78350F] cursor-pointer"
                />
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-[#D6D3D1]">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#78716C]" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-xs text-[#1C1917] focus:outline-none cursor-pointer"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Customer Rated</option>
                </select>
              </div>

              {/* Reset button if filtered */}
              {(selectedCategory !== 'all' || searchQuery || maxPrice < 150) && (
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                    setMaxPrice(150);
                  }}
                  className="text-xs text-[#78350F] hover:underline font-medium px-2 py-1"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Product Grid (3-column desktop layout adhering to design rules) */}
          {allProducts.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-2xl border border-[#E7E5E4] p-8">
              <div className="w-12 h-12 rounded-full bg-[#F5F5F4] flex items-center justify-center mx-auto mb-3 text-[#A8A29E]">
                <Filter className="w-6 h-6" />
              </div>
              <h3 className="font-serif-display text-lg font-semibold text-[#1C1917]">
                No accessories found
              </h3>
              <p className="text-xs text-[#78716C] max-w-sm mx-auto mt-1 mb-5">
                We couldn't find any products matching your active price or search criteria.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                  setMaxPrice(150);
                }}
                className="px-4 py-2 bg-[#1C1917] text-white text-xs font-semibold rounded-lg hover:bg-[#292524] transition-colors"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {allProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenDetails={(p) => setActiveProductModal(p)}
                />
              ))}
            </div>
          )}
        </section>

        {/* 6. Brand Story & Craftsmanship Note */}
        {!searchQuery && (
          <section className="py-16 bg-[#F5F5F4] border-t border-[#E7E5E4]">
            <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
              <div className="text-xs uppercase font-semibold tracking-wider text-[#78350F]">
                Our Philosophy
              </div>
              <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#1C1917] text-balance">
                High standards without artificial luxury markups.
              </h2>
              <p className="text-sm text-[#57534E] leading-relaxed max-w-2xl mx-auto">
                By designing in-house and manufacturing directly with specialized ateliers, LuxeLane delivers surgical-grade steel, vegetable-tanned Italian leathers, and scratch-resistant sapphire crystals at accessible price points.
              </p>
              <div className="pt-4 flex flex-wrap justify-center gap-8 text-xs text-[#78716C]">
                <div><strong className="text-[#1C1917]">Surgical Steel</strong> · Hypoallergenic 316L</div>
                <div><strong className="text-[#1C1917]">Full-Grain</strong> · Vegetable-Tanned</div>
                <div><strong className="text-[#1C1917]">UV400 TAC</strong> · True Polarization</div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* 7. Footer */}
      <Footer
        onSelectCategory={(id) => {
          setSelectedCategory(id);
          window.scrollTo({ top: 500, behavior: 'smooth' });
        }}
        onOpenAdmin={() => setIsAdminView(true)}
      />

      {/* MODALS & DRAWERS */}
      {/* Contiguous Product Detail Modal */}
      <ProductDetailModal
        product={activeProductModal}
        onClose={() => setActiveProductModal(null)}
      />

      {/* Slide-over Shopping Cart Drawer */}
      <CartDrawer
        onProceedToCheckout={() => setIsCheckoutModalOpen(true)}
      />

      {/* Checkout Modal (Address, COD, Razorpay Gateway) */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onOrderCompleted={handleOrderCompleted}
      />

      {/* Customer Account & Order History Modal */}
      <CustomerAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onSwitchToAdmin={() => {
          setIsAccountModalOpen(false);
          setIsAdminView(true);
        }}
      />

      {/* Auth Modal (Register / Login / Demo accounts) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAdminLoginSuccess={() => setIsAdminView(true)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Storefront />
      </CartProvider>
    </AuthProvider>
  );
}
