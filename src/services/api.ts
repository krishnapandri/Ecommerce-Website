import {
  Product,
  Category,
  Order,
  OrderItem,
  Coupon,
  User,
  Address,
  PaymentMethod,
  OrderStatus,
  AdminStats,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_COUPONS,
  INITIAL_ORDERS,
  INITIAL_USERS,
} from '../data/mockData';

const STORAGE_KEYS = {
  PRODUCTS: 'luxelane_products_v1',
  CATEGORIES: 'luxelane_categories_v1',
  ORDERS: 'luxelane_orders_v1',
  COUPONS: 'luxelane_coupons_v1',
  USERS: 'luxelane_users_v1',
  CURRENT_USER: 'luxelane_current_user_v1',
  AUTH_TOKEN: 'luxelane_auth_token_v1',
  CART: 'luxelane_cart_v1',
};

const memoryFallback: Record<string, string> = {};

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(key);
      if (!raw) {
        window.localStorage.setItem(key, JSON.stringify(defaultValue));
        return defaultValue;
      }
      return JSON.parse(raw);
    } else {
      if (!memoryFallback[key]) {
        memoryFallback[key] = JSON.stringify(defaultValue);
        return defaultValue;
      }
      return JSON.parse(memoryFallback[key]);
    }
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify(value));
    } else {
      memoryFallback[key] = JSON.stringify(value);
    }
  } catch {
    // ignore
  }
}

class LuxeLaneRepository {
  private products: Product[] = [];
  private categories: Category[] = [];
  private orders: Order[] = [];
  private coupons: Coupon[] = [];
  private users: User[] = [];
  private token: string | null = null;

  constructor() {
    this.init();
    if (typeof window !== 'undefined') {
      this.syncWithBackend();
    }
  }

  private init() {
    this.products = loadFromStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    this.categories = loadFromStorage(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    this.orders = loadFromStorage(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    this.coupons = loadFromStorage(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
    this.users = loadFromStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
    this.token = loadFromStorage<string | null>(STORAGE_KEYS.AUTH_TOKEN, null);
  }

  // ----------------------------------------------------
  // BACKEND HTTP SYNC HELPER
  // ----------------------------------------------------
  private async fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T | null> {
    try {
      if (typeof window === 'undefined') return null;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
      };

      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await fetch(endpoint, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.warn(`Fetch to ${endpoint} failed, relying on local sync:`, err);
      return null;
    }
  }

  public async syncWithBackend() {
    try {
      const [backendProducts, backendCategories, backendCoupons] = await Promise.all([
        this.fetchApi<Product[]>('/api/products?activeOnly=false'),
        this.fetchApi<Category[]>('/api/categories'),
        this.fetchApi<Coupon[]>('/api/admin/coupons'),
      ]);

      if (backendProducts && backendProducts.length > 0) {
        this.products = backendProducts;
        saveToStorage(STORAGE_KEYS.PRODUCTS, this.products);
      }
      if (backendCategories && backendCategories.length > 0) {
        this.categories = backendCategories;
        saveToStorage(STORAGE_KEYS.CATEGORIES, this.categories);
      }
      if (backendCoupons && backendCoupons.length > 0) {
        this.coupons = backendCoupons;
        saveToStorage(STORAGE_KEYS.COUPONS, this.coupons);
      }
    } catch (e) {
      // Graceful offline fallback
    }
  }

  public setAuthToken(token: string | null) {
    this.token = token;
    saveToStorage(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  public getAuthToken(): string | null {
    return this.token;
  }

  // ----------------------------------------------------
  // PRODUCTS
  // ----------------------------------------------------
  public getProducts(params?: {
    categoryId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'price-asc' | 'price-desc' | 'rating' | 'newest';
    activeOnly?: boolean;
  }): Product[] {
    let result = [...this.products];

    if (params?.activeOnly !== false) {
      result = result.filter((p) => p.isActive);
    }

    if (params?.categoryId && params.categoryId !== 'all') {
      result = result.filter((p) => p.categoryId === params.categoryId);
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }

    if (params?.minPrice !== undefined) {
      result = result.filter((p) => p.price >= params.minPrice!);
    }

    if (params?.maxPrice !== undefined) {
      result = result.filter((p) => p.price <= params.maxPrice!);
    }

    if (params?.sortBy) {
      switch (params.sortBy) {
        case 'price-asc':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          result.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          result.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          break;
      }
    }

    return result;
  }

  public getAllProductsAdmin(): Product[] {
    return [...this.products];
  }

  public getProductById(id: string): Product | undefined {
    return this.products.find((p) => p.id === id);
  }

  public saveProduct(productData: Partial<Product>): Product {
    if (productData.id) {
      const index = this.products.findIndex((p) => p.id === productData.id);
      if (index === -1) throw new Error('Product not found');

      const updated: Product = {
        ...this.products[index],
        ...productData,
      };
      this.products[index] = updated;
      saveToStorage(STORAGE_KEYS.PRODUCTS, this.products);
      this.recalculateCategoryCounts();

      // Async backend update
      this.fetchApi<Product>(`/api/admin/products/${productData.id}`, {
        method: 'PUT',
        body: JSON.stringify(productData),
      });

      return updated;
    } else {
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        name: productData.name || 'Untitled Accessory',
        slug:
          productData.slug ||
          (productData.name || 'product')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, ''),
        description: productData.description || '',
        details: productData.details || ['Handcrafted with premium materials'],
        price: Number(productData.price) || 0,
        originalPrice: productData.originalPrice ? Number(productData.originalPrice) : undefined,
        categoryId: productData.categoryId || 'cat-1',
        categoryName:
          this.categories.find((c) => c.id === productData.categoryId)?.name ||
          'Accessories',
        stock: Math.max(0, Number(productData.stock) || 0),
        isActive: productData.isActive !== false,
        isFeatured: Boolean(productData.isFeatured),
        isBestseller: Boolean(productData.isBestseller),
        images: productData.images && productData.images.length > 0 ? productData.images : [''],
        rating: 5.0,
        reviewCount: 1,
        sku: productData.sku || `LL-ACC-${Math.floor(100 + Math.random() * 900)}`,
        colorOptions: productData.colorOptions || ['Standard'],
        materials: productData.materials || 'Brass, Leather, Stainless Steel',
        createdAt: new Date().toISOString(),
      };

      this.products.unshift(newProduct);
      saveToStorage(STORAGE_KEYS.PRODUCTS, this.products);
      this.recalculateCategoryCounts();

      // Async backend create
      this.fetchApi<Product>('/api/admin/products', {
        method: 'POST',
        body: JSON.stringify(newProduct),
      });

      return newProduct;
    }
  }

  public toggleProductStatus(id: string): Product {
    const prod = this.getProductById(id);
    if (!prod) throw new Error('Product not found');
    prod.isActive = !prod.isActive;
    saveToStorage(STORAGE_KEYS.PRODUCTS, this.products);
    this.recalculateCategoryCounts();

    this.fetchApi(`/api/admin/products/${id}/toggle`, { method: 'PATCH' });
    return prod;
  }

  public updateProductStock(id: string, newStock: number): Product {
    const prod = this.getProductById(id);
    if (!prod) throw new Error('Product not found');
    prod.stock = Math.max(0, newStock);
    saveToStorage(STORAGE_KEYS.PRODUCTS, this.products);

    this.fetchApi(`/api/admin/products/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ stock: newStock }),
    });
    return prod;
  }

  private recalculateCategoryCounts() {
    this.categories = this.categories.map((cat) => ({
      ...cat,
      itemCount: this.products.filter(
        (p) => p.categoryId === cat.id && p.isActive
      ).length,
    }));
    saveToStorage(STORAGE_KEYS.CATEGORIES, this.categories);
  }

  // ----------------------------------------------------
  // CATEGORIES
  // ----------------------------------------------------
  public getCategories(): Category[] {
    return [...this.categories];
  }

  public saveCategory(categoryData: Partial<Category>): Category {
    if (categoryData.id) {
      const idx = this.categories.findIndex((c) => c.id === categoryData.id);
      if (idx === -1) throw new Error('Category not found');
      this.categories[idx] = {
        ...this.categories[idx],
        ...categoryData,
      };
      saveToStorage(STORAGE_KEYS.CATEGORIES, this.categories);
      return this.categories[idx];
    } else {
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        name: categoryData.name || 'New Category',
        slug:
          categoryData.slug ||
          (categoryData.name || 'category')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-'),
        description: categoryData.description || '',
        iconName: categoryData.iconName || 'ShoppingBag',
        itemCount: 0,
        featuredImage: categoryData.featuredImage,
      };
      this.categories.push(newCat);
      saveToStorage(STORAGE_KEYS.CATEGORIES, this.categories);

      this.fetchApi('/api/admin/categories', {
        method: 'POST',
        body: JSON.stringify(newCat),
      });

      return newCat;
    }
  }

  // ----------------------------------------------------
  // COUPONS
  // ----------------------------------------------------
  public getCoupons(): Coupon[] {
    return [...this.coupons];
  }

  public validateCoupon(
    code: string,
    subtotal: number
  ): { valid: boolean; coupon?: Coupon; discountAmount: number; error?: string } {
    const cleanCode = code.trim().toUpperCase();
    const coupon = this.coupons.find(
      (c) => c.code.toUpperCase() === cleanCode && c.isActive
    );

    if (!coupon) {
      return { valid: false, discountAmount: 0, error: 'Invalid or inactive promotional coupon code.' };
    }

    if (new Date(coupon.validUntil).getTime() < new Date().getTime()) {
      return { valid: false, discountAmount: 0, error: 'This coupon has expired.' };
    }

    if (subtotal < coupon.minOrderAmount) {
      return {
        valid: false,
        discountAmount: 0,
        error: `Requires a minimum purchase amount of $${coupon.minOrderAmount}.`,
      };
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
    } else {
      discount = coupon.discountValue;
    }

    discount = Math.min(discount, subtotal);
    discount = Math.round(discount * 100) / 100;

    return { valid: true, coupon, discountAmount: discount };
  }

  public saveCoupon(data: Partial<Coupon>): Coupon {
    if (data.id) {
      const idx = this.coupons.findIndex((c) => c.id === data.id);
      if (idx === -1) throw new Error('Coupon not found');
      this.coupons[idx] = { ...this.coupons[idx], ...data };
      saveToStorage(STORAGE_KEYS.COUPONS, this.coupons);
      return this.coupons[idx];
    } else {
      const newCoupon: Coupon = {
        id: `coup-${Date.now()}`,
        code: (data.code || 'SAVE10').toUpperCase().trim(),
        description: data.description || 'Special store discount',
        discountType: data.discountType || 'percentage',
        discountValue: Number(data.discountValue) || 10,
        minOrderAmount: Number(data.minOrderAmount) || 0,
        maxDiscountAmount: data.maxDiscountAmount ? Number(data.maxDiscountAmount) : undefined,
        isActive: data.isActive !== false,
        validUntil: data.validUntil || '2027-12-31',
        usageCount: 0,
      };
      this.coupons.push(newCoupon);
      saveToStorage(STORAGE_KEYS.COUPONS, this.coupons);

      this.fetchApi('/api/admin/coupons', {
        method: 'POST',
        body: JSON.stringify(newCoupon),
      });

      return newCoupon;
    }
  }

  public toggleCouponStatus(id: string): Coupon {
    const coupon = this.coupons.find((c) => c.id === id);
    if (!coupon) throw new Error('Coupon not found');
    coupon.isActive = !coupon.isActive;
    saveToStorage(STORAGE_KEYS.COUPONS, this.coupons);

    this.fetchApi(`/api/admin/coupons/${id}/toggle`, { method: 'PATCH' });
    return coupon;
  }

  // ----------------------------------------------------
  // TRANSACTIONAL ORDER PLACEMENT
  // ----------------------------------------------------
  public createOrder(params: {
    userId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: Address;
    paymentMethod: PaymentMethod;
    paymentTransactionId?: string;
    couponCode?: string;
    items: { productId: string; quantity: number; selectedColor?: string }[];
    notes?: string;
  }): { success: boolean; order?: Order; error?: string } {
    if (!params.items || params.items.length === 0) {
      return { success: false, error: 'Cannot place an order with an empty cart.' };
    }

    const orderItems: OrderItem[] = [];
    let calculatedSubtotal = 0;

    for (const item of params.items) {
      const product = this.getProductById(item.productId);
      if (!product) {
        return { success: false, error: `Product ID ${item.productId} was not found.` };
      }
      if (!product.isActive) {
        return { success: false, error: `"${product.name}" is currently unavailable.` };
      }
      if (product.stock < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for "${product.name}". Remaining stock: ${product.stock}, requested: ${item.quantity}.`,
        };
      }

      const lineTotal = product.price * item.quantity;
      calculatedSubtotal += lineTotal;

      orderItems.push({
        id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        productId: product.id,
        productName: product.name,
        unitPrice: product.price,
        quantity: item.quantity,
        subtotal: lineTotal,
        image: product.images[0],
        selectedColor: item.selectedColor,
      });
    }

    let discountAmount = 0;
    if (params.couponCode) {
      const validation = this.validateCoupon(params.couponCode, calculatedSubtotal);
      if (validation.valid && validation.coupon) {
        discountAmount = validation.discountAmount;
        validation.coupon.usageCount += 1;
        saveToStorage(STORAGE_KEYS.COUPONS, this.coupons);
      }
    }

    const shippingFee = calculatedSubtotal >= 50 ? 0 : 5;
    const finalTotal = Math.max(0, calculatedSubtotal - discountAmount + shippingFee);

    for (const item of params.items) {
      const product = this.getProductById(item.productId);
      if (product) {
        product.stock -= item.quantity;
      }
    }
    saveToStorage(STORAGE_KEYS.PRODUCTS, this.products);

    const orderNumber = `LX-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      userId: params.userId,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      customerPhone: params.customerPhone,
      shippingAddress: params.shippingAddress,
      paymentMethod: params.paymentMethod,
      paymentStatus: params.paymentMethod === 'razorpay' ? 'completed' : 'pending',
      paymentTransactionId: params.paymentTransactionId,
      orderStatus: 'confirmed',
      items: orderItems,
      subtotal: Math.round(calculatedSubtotal * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
      couponCode: params.couponCode,
      shippingFee,
      totalAmount: Math.round(finalTotal * 100) / 100,
      notes: params.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.orders.unshift(newOrder);
    saveToStorage(STORAGE_KEYS.ORDERS, this.orders);

    // Call real backend endpoint
    this.fetchApi('/api/orders', {
      method: 'POST',
      body: JSON.stringify(params),
    });

    return { success: true, order: newOrder };
  }

  // ----------------------------------------------------
  // ORDER MANAGEMENT
  // ----------------------------------------------------
  public getOrders(userId?: string): Order[] {
    if (userId) {
      return this.orders.filter((o) => o.userId === userId);
    }
    return [...this.orders];
  }

  public getOrderById(id: string): Order | undefined {
    return this.orders.find((o) => o.id === id || o.orderNumber === id);
  }

  public updateOrderStatus(orderId: string, status: OrderStatus): Order {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');

    const previousStatus = order.orderStatus;
    order.orderStatus = status;
    order.updatedAt = new Date().toISOString();

    if (status === 'cancelled' && previousStatus !== 'cancelled') {
      for (const item of order.items) {
        const product = this.getProductById(item.productId);
        if (product) {
          product.stock += item.quantity;
        }
      }
      saveToStorage(STORAGE_KEYS.PRODUCTS, this.products);
    }

    if (previousStatus === 'cancelled' && status !== 'cancelled') {
      for (const item of order.items) {
        const product = this.getProductById(item.productId);
        if (product) {
          product.stock = Math.max(0, product.stock - item.quantity);
        }
      }
      saveToStorage(STORAGE_KEYS.PRODUCTS, this.products);
    }

    saveToStorage(STORAGE_KEYS.ORDERS, this.orders);

    // Async call to backend
    this.fetchApi(`/api/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });

    return order;
  }

  // ----------------------------------------------------
  // ADMIN DASHBOARD STATS
  // ----------------------------------------------------
  public getAdminStats(): AdminStats {
    const totalRevenue = this.orders
      .filter((o) => o.orderStatus !== 'cancelled')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const lowStockCount = this.products.filter(
      (p) => p.isActive && p.stock <= 5
    ).length;

    const pendingOrdersCount = this.orders.filter(
      (o) => o.orderStatus === 'confirmed' || o.orderStatus === 'processing'
    ).length;

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders: this.orders.length,
      totalCustomers: this.users.filter((u) => u.role === 'customer').length,
      totalProducts: this.products.length,
      lowStockCount,
      pendingOrdersCount,
      recentOrders: this.orders.slice(0, 5),
    };
  }

  // ----------------------------------------------------
  // AUTHENTICATION & USERS
  // ----------------------------------------------------
  public getUsers(): User[] {
    return [...this.users];
  }

  public register(name: string, email: string, password: string): User {
    const cleanEmail = email.toLowerCase().trim();
    const existing = this.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      role: 'customer',
      createdAt: new Date().toISOString(),
    };

    this.users.push(newUser);
    saveToStorage(STORAGE_KEYS.USERS, this.users);
    this.setCurrentUser(newUser);

    // Register on backend & receive JWT token
    this.fetchApi<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }).then((res) => {
      if (res?.token) {
        this.setAuthToken(res.token);
      }
    });

    return newUser;
  }

  public login(email: string, password?: string): User {
    const cleanEmail = email.toLowerCase().trim();
    const user = this.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      throw new Error('Invalid email or password.');
    }
    this.setCurrentUser(user);

    // Authenticate on backend & receive JWT token
    this.fetchApi<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: password || (user.role === 'admin' ? 'admin123' : 'password123') }),
    }).then((res) => {
      if (res?.token) {
        this.setAuthToken(res.token);
      }
    });

    return user;
  }

  public getCurrentUser(): User | null {
    return loadFromStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  }

  public setCurrentUser(user: User | null): void {
    if (user) {
      saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
    } else {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        window.localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      }
      this.token = null;
    }
  }

  public updateUserAddress(userId: string, address: Address): User {
    const user = this.users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');
    user.address = address;
    user.phone = address.phone;
    saveToStorage(STORAGE_KEYS.USERS, this.users);
    const current = this.getCurrentUser();
    if (current?.id === userId) {
      this.setCurrentUser(user);
    }

    this.fetchApi('/api/auth/address', {
      method: 'PUT',
      body: JSON.stringify({ address }),
    });

    return user;
  }
}

export const api = new LuxeLaneRepository();
