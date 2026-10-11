import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Coupon } from '../types';
import { api } from '../services/api';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  appliedCoupon: Coupon | null;
  couponError: string | null;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number, selectedColor?: string) => { success: boolean; message: string };
  updateQuantity: (productId: string, quantity: number, selectedColor?: string) => void;
  removeFromCart: (productId: string, selectedColor?: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'luxelane_cart_state_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to persist cart:', e);
    }
  }, [items]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Recalculate coupon discount if subtotal changes
  let discount = 0;
  if (appliedCoupon) {
    const res = api.validateCoupon(appliedCoupon.code, subtotal);
    if (res.valid) {
      discount = res.discountAmount;
    } else {
      // Coupon no longer valid (e.g. subtotal dropped below min)
      setAppliedCoupon(null);
      setCouponError(res.error || 'Coupon condition no longer met.');
    }
  }

  const shipping = items.length === 0 ? 0 : subtotal >= 50 ? 0 : 5;
  const total = Math.max(0, subtotal - discount + shipping);

  const addToCart = (
    product: Product,
    quantity: number = 1,
    selectedColor?: string
  ): { success: boolean; message: string } => {
    // Check fresh product stock from repository
    const freshProduct = api.getProductById(product.id) || product;
    if (freshProduct.stock <= 0) {
      return { success: false, message: 'This item is currently out of stock.' };
    }

    const existingIndex = items.findIndex(
      (item) =>
        item.productId === product.id &&
        (!selectedColor || item.selectedColor === selectedColor)
    );

    const currentQtyInCart = existingIndex > -1 ? items[existingIndex].quantity : 0;
    if (currentQtyInCart + quantity > freshProduct.stock) {
      return {
        success: false,
        message: `Only ${freshProduct.stock} item(s) available in stock.`,
      };
    }

    setItems((prev) => {
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += quantity;
        return next;
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            product: freshProduct,
            quantity,
            selectedColor: selectedColor || (freshProduct.colorOptions?.[0]),
          },
        ];
      }
    });

    setIsCartOpen(true);
    return { success: true, message: `Added "${product.name}" to cart.` };
  };

  const updateQuantity = (
    productId: string,
    quantity: number,
    selectedColor?: string
  ) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedColor);
      return;
    }

    const freshProduct = api.getProductById(productId);
    const maxStock = freshProduct ? freshProduct.stock : 99;
    const finalQty = Math.min(quantity, maxStock);

    setItems((prev) =>
      prev.map((item) => {
        if (
          item.productId === productId &&
          (!selectedColor || item.selectedColor === selectedColor)
        ) {
          return { ...item, quantity: finalQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string, selectedColor?: string) => {
    setItems((prev) =>
      prev.filter(
        (item) =>
          !(
            item.productId === productId &&
            (!selectedColor || item.selectedColor === selectedColor)
          )
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const applyCoupon = (code: string): { success: boolean; message: string } => {
    setCouponError(null);
    if (!code.trim()) {
      return { success: false, message: 'Please enter a coupon code.' };
    }

    const validation = api.validateCoupon(code, subtotal);
    if (!validation.valid || !validation.coupon) {
      const err = validation.error || 'Invalid promotional coupon.';
      setCouponError(err);
      return { success: false, message: err };
    }

    setAppliedCoupon(validation.coupon);
    return {
      success: true,
      message: `Coupon "${validation.coupon.code}" applied! You saved $${validation.discountAmount.toFixed(2)}.`,
    };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  return (
    <CartContext.Provider
      value={{
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
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};
