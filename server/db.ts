import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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
} from '../src/types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_COUPONS,
  INITIAL_ORDERS,
  INITIAL_USERS,
} from '../src/data/mockData';
import { hashPassword, comparePassword } from './auth';

export interface UserEntity extends User {
  passwordHash?: string;
}

export interface DatabaseSchema {
  products: Product[];
  categories: Category[];
  orders: Order[];
  coupons: Coupon[];
  users: UserEntity[];
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

class DatabaseEngine {
  private data: DatabaseSchema;
  private isWriting = false;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.products && parsed.categories && parsed.orders && parsed.coupons && parsed.users) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Could not read existing db.json, generating seeded database:', err);
    }

    // Default Seed Data
    const seededUsers: UserEntity[] = INITIAL_USERS.map((u) => ({
      ...u,
      passwordHash: hashPassword(u.role === 'admin' ? 'admin123' : 'password123'),
    }));

    const seeded: DatabaseSchema = {
      products: INITIAL_PRODUCTS,
      categories: INITIAL_CATEGORIES,
      orders: INITIAL_ORDERS,
      coupons: INITIAL_COUPONS,
      users: seededUsers,
    };

    this.persist(seeded);
    return seeded;
  }

  /**
   * Atomic file write via temporary file replacement
   */
  private persist(dataToSave: DatabaseSchema = this.data): void {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempFile, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('Failed to atomically persist db.json:', err);
    }
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
    let result = [...this.data.products];

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
    return [...this.data.products];
  }

  public getProductById(id: string): Product | undefined {
    return this.data.products.find((p) => p.id === id);
  }

  public saveProduct(productData: Partial<Product>): Product {
    if (productData.id) {
      const index = this.data.products.findIndex((p) => p.id === productData.id);
      if (index === -1) throw new Error('Product not found');

      const updated: Product = {
        ...this.data.products[index],
        ...productData,
      };
      this.data.products[index] = updated;
      this.recalculateCategoryCounts();
      this.persist();
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
          this.data.categories.find((c) => c.id === productData.categoryId)?.name ||
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
        materials: productData.materials || 'Stainless Steel, Genuine Leather',
        createdAt: new Date().toISOString(),
      };

      this.data.products.unshift(newProduct);
      this.recalculateCategoryCounts();
      this.persist();
      return newProduct;
    }
  }

  public toggleProductStatus(id: string): Product {
    const prod = this.getProductById(id);
    if (!prod) throw new Error('Product not found');
    prod.isActive = !prod.isActive;
    this.recalculateCategoryCounts();
    this.persist();
    return prod;
  }

  public updateProductStock(id: string, newStock: number): Product {
    const prod = this.getProductById(id);
    if (!prod) throw new Error('Product not found');
    prod.stock = Math.max(0, newStock);
    this.persist();
    return prod;
  }

  private recalculateCategoryCounts() {
    this.data.categories = this.data.categories.map((cat) => ({
      ...cat,
      itemCount: this.data.products.filter(
        (p) => p.categoryId === cat.id && p.isActive
      ).length,
    }));
  }

  // ----------------------------------------------------
  // CATEGORIES
  // ----------------------------------------------------
  public getCategories(): Category[] {
    return [...this.data.categories];
  }

  public saveCategory(categoryData: Partial<Category>): Category {
    if (categoryData.id) {
      const idx = this.data.categories.findIndex((c) => c.id === categoryData.id);
      if (idx === -1) throw new Error('Category not found');
      this.data.categories[idx] = {
        ...this.data.categories[idx],
        ...categoryData,
      };
      this.persist();
      return this.data.categories[idx];
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
      this.data.categories.push(newCat);
      this.persist();
      return newCat;
    }
  }

  // ----------------------------------------------------
  // COUPONS
  // ----------------------------------------------------
  public getCoupons(): Coupon[] {
    return [...this.data.coupons];
  }

  public validateCoupon(
    code: string,
    subtotal: number
  ): { valid: boolean; coupon?: Coupon; discountAmount: number; error?: string } {
    const cleanCode = code.trim().toUpperCase();
    const coupon = this.data.coupons.find(
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
      const idx = this.data.coupons.findIndex((c) => c.id === data.id);
      if (idx === -1) throw new Error('Coupon not found');
      this.data.coupons[idx] = { ...this.data.coupons[idx], ...data };
      this.persist();
      return this.data.coupons[idx];
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
      this.data.coupons.push(newCoupon);
      this.persist();
      return newCoupon;
    }
  }

  public toggleCouponStatus(id: string): Coupon {
    const coupon = this.data.coupons.find((c) => c.id === id);
    if (!coupon) throw new Error('Coupon not found');
    coupon.isActive = !coupon.isActive;
    this.persist();
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

    // Stock check & calculated totals
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
          error: `Insufficient stock for "${product.name}". Remaining: ${product.stock}, requested: ${item.quantity}.`,
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

    // Coupon verification on server
    let discountAmount = 0;
    if (params.couponCode) {
      const validation = this.validateCoupon(params.couponCode, calculatedSubtotal);
      if (validation.valid && validation.coupon) {
        discountAmount = validation.discountAmount;
        validation.coupon.usageCount += 1;
      }
    }

    const shippingFee = calculatedSubtotal >= 50 ? 0 : 5;
    const finalTotal = Math.max(0, calculatedSubtotal - discountAmount + shippingFee);

    // Atomic decrement
    for (const item of params.items) {
      const product = this.getProductById(item.productId);
      if (product) {
        product.stock -= item.quantity;
      }
    }

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

    this.data.orders.unshift(newOrder);
    this.persist();

    return { success: true, order: newOrder };
  }

  // ----------------------------------------------------
  // ORDER MANAGEMENT
  // ----------------------------------------------------
  public getOrders(userId?: string): Order[] {
    if (userId) {
      return this.data.orders.filter((o) => o.userId === userId);
    }
    return [...this.data.orders];
  }

  public getOrderById(id: string): Order | undefined {
    return this.data.orders.find((o) => o.id === id || o.orderNumber === id);
  }

  public updateOrderStatus(orderId: string, status: OrderStatus): Order {
    const order = this.data.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');

    const previousStatus = order.orderStatus;
    order.orderStatus = status;
    order.updatedAt = new Date().toISOString();

    // Stock rollback on cancellation
    if (status === 'cancelled' && previousStatus !== 'cancelled') {
      for (const item of order.items) {
        const product = this.getProductById(item.productId);
        if (product) {
          product.stock += item.quantity;
        }
      }
    }

    if (previousStatus === 'cancelled' && status !== 'cancelled') {
      for (const item of order.items) {
        const product = this.getProductById(item.productId);
        if (product) {
          product.stock = Math.max(0, product.stock - item.quantity);
        }
      }
    }

    this.persist();
    return order;
  }

  // ----------------------------------------------------
  // ADMIN DASHBOARD STATS
  // ----------------------------------------------------
  public getAdminStats(): AdminStats {
    const totalRevenue = this.data.orders
      .filter((o) => o.orderStatus !== 'cancelled')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const lowStockCount = this.data.products.filter(
      (p) => p.isActive && p.stock <= 5
    ).length;

    const pendingOrdersCount = this.data.orders.filter(
      (o) => o.orderStatus === 'confirmed' || o.orderStatus === 'processing'
    ).length;

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders: this.data.orders.length,
      totalCustomers: this.data.users.filter((u) => u.role === 'customer').length,
      totalProducts: this.data.products.length,
      lowStockCount,
      pendingOrdersCount,
      recentOrders: this.data.orders.slice(0, 5),
    };
  }

  // ----------------------------------------------------
  // USERS & AUTH
  // ----------------------------------------------------
  public getUsers(): User[] {
    return this.data.users.map(({ passwordHash, ...user }) => user);
  }

  public getUserById(id: string): User | undefined {
    const found = this.data.users.find((u) => u.id === id);
    if (!found) return undefined;
    const { passwordHash, ...user } = found;
    return user;
  }

  public registerUser(name: string, email: string, password: string): User {
    const cleanEmail = email.toLowerCase().trim();
    const existing = this.data.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const newUser: UserEntity = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      role: 'customer',
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    this.data.users.push(newUser);
    this.persist();

    const { passwordHash, ...safeUser } = newUser;
    return safeUser;
  }

  public loginUser(email: string, password?: string): User {
    const cleanEmail = email.toLowerCase().trim();
    const user = this.data.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    if (password && user.passwordHash) {
      const match = comparePassword(password, user.passwordHash);
      if (!match) {
        throw new Error('Invalid email or password.');
      }
    }

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  public updateUserAddress(userId: string, address: Address): User {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');
    user.address = address;
    user.phone = address.phone;
    this.persist();

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}

export const db = new DatabaseEngine();
