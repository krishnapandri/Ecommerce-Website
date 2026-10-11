export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
  address?: Address;
}

export interface Address {
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  itemCount: number;
  featuredImage?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  details: string[];
  price: number;
  originalPrice?: number;
  categoryId: string;
  categoryName: string;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  isBestseller?: boolean;
  images: string[];
  rating: number;
  reviewCount: number;
  sku: string;
  colorOptions?: string[];
  materials?: string;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export type PaymentMethod = 'cod' | 'razorpay';
export type PaymentStatus = 'pending' | 'completed' | 'failed';
export type OrderStatus = 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  image?: string;
  selectedColor?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentTransactionId?: string;
  orderStatus: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  shippingFee: number;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  isActive: boolean;
  validUntil: string;
  usageCount: number;
}

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockCount: number;
  pendingOrdersCount: number;
  recentOrders: Order[];
}

export interface AuthResponse {
  user: User;
  token: string;
}
