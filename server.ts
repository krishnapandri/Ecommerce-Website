import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import {
  signToken,
  authMiddleware,
  optionalAuthMiddleware,
  adminOnlyMiddleware,
  AuthenticatedRequest,
} from './server/auth';
import { OrderStatus } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  // JSON request body parser
  app.use(express.json());

  // ----------------------------------------------------------------
  // AUTHENTICATION ROUTES
  // ----------------------------------------------------------------
  app.post('/api/auth/register', (req: Request, res: Response): void => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        res.status(400).json({ error: 'Name, email, and password are required' });
        return;
      }
      const user = db.registerUser(name, email, password);
      const token = signToken(user);
      res.status(201).json({ user, token });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Registration failed' });
    }
  });

  app.post('/api/auth/login', (req: Request, res: Response): void => {
    try {
      const { email, password } = req.body;
      if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
      }
      const user = db.loginUser(email, password);
      const token = signToken(user);
      res.json({ user, token });
    } catch (err: any) {
      res.status(401).json({ error: err.message || 'Authentication failed' });
    }
  });

  app.get('/api/auth/me', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const user = db.getUserById(req.user.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ user });
  });

  app.put('/api/auth/address', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const { address } = req.body;
      if (!address) {
        res.status(400).json({ error: 'Address data is required' });
        return;
      }
      const updatedUser = db.updateUserAddress(req.user.userId, address);
      res.json({ user: updatedUser });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to update address' });
    }
  });

  // ----------------------------------------------------------------
  // PRODUCTS & CATALOG ROUTES
  // ----------------------------------------------------------------
  app.get('/api/products', (req: Request, res: Response): void => {
    const { categoryId, search, minPrice, maxPrice, sortBy, activeOnly } = req.query;
    const products = db.getProducts({
      categoryId: categoryId as string,
      search: search as string,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      sortBy: sortBy as any,
      activeOnly: activeOnly !== 'false',
    });
    res.json(products);
  });

  app.get('/api/products/:id', (req: Request, res: Response): void => {
    const product = db.getProductById(req.params.id);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(product);
  });

  // ----------------------------------------------------------------
  // CATEGORIES ROUTES
  // ----------------------------------------------------------------
  app.get('/api/categories', (_req: Request, res: Response): void => {
    const categories = db.getCategories();
    res.json(categories);
  });

  // ----------------------------------------------------------------
  // COUPONS ROUTES
  // ----------------------------------------------------------------
  app.post('/api/coupons/validate', (req: Request, res: Response): void => {
    const { code, subtotal } = req.body;
    if (!code || subtotal === undefined) {
      res.status(400).json({ error: 'Coupon code and subtotal are required' });
      return;
    }
    const result = db.validateCoupon(code, Number(subtotal));
    res.json(result);
  });

  // ----------------------------------------------------------------
  // ORDERS ROUTES
  // ----------------------------------------------------------------
  app.post('/api/orders', optionalAuthMiddleware, (req: AuthenticatedRequest, res: Response): void => {
    try {
      const {
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        paymentMethod,
        paymentTransactionId,
        couponCode,
        items,
        notes,
      } = req.body;

      const userId = req.user?.userId || `guest-${Date.now()}`;

      const result = db.createOrder({
        userId,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        paymentMethod,
        paymentTransactionId,
        couponCode,
        items,
        notes,
      });

      if (!result.success) {
        res.status(400).json({ error: result.error || 'Failed to place order' });
        return;
      }

      res.status(201).json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal order creation failure' });
    }
  });

  app.get('/api/orders', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    // Admin can see all, customer sees their own
    const orders = req.user.role === 'admin'
      ? db.getOrders()
      : db.getOrders(req.user.userId);
    res.json(orders);
  });

  app.get('/api/orders/:id', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
    const order = db.getOrderById(req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    // Authorization check: User must own the order or be an admin
    if (req.user && req.user.role !== 'admin' && order.userId !== req.user.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    res.json(order);
  });

  // ----------------------------------------------------------------
  // ADMIN DASHBOARD & MANAGEMENT ROUTES (adminOnlyMiddleware)
  // ----------------------------------------------------------------
  app.get('/api/admin/metrics', authMiddleware, adminOnlyMiddleware, (_req: Request, res: Response): void => {
    const stats = db.getAdminStats();
    res.json(stats);
  });

  app.get('/api/admin/products', authMiddleware, adminOnlyMiddleware, (_req: Request, res: Response): void => {
    const products = db.getAllProductsAdmin();
    res.json(products);
  });

  app.post('/api/admin/products', authMiddleware, adminOnlyMiddleware, (req: Request, res: Response): void => {
    try {
      const saved = db.saveProduct(req.body);
      res.status(201).json(saved);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to create product' });
    }
  });

  app.put('/api/admin/products/:id', authMiddleware, adminOnlyMiddleware, (req: Request, res: Response): void => {
    try {
      const saved = db.saveProduct({ ...req.body, id: req.params.id });
      res.json(saved);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to update product' });
    }
  });

  app.patch('/api/admin/products/:id/toggle', authMiddleware, adminOnlyMiddleware, (req: Request, res: Response): void => {
    try {
      const updated = db.toggleProductStatus(req.params.id);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to toggle status' });
    }
  });

  app.patch('/api/admin/products/:id/stock', authMiddleware, adminOnlyMiddleware, (req: Request, res: Response): void => {
    try {
      const { stock } = req.body;
      const updated = db.updateProductStock(req.params.id, parseInt(stock) || 0);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to update stock' });
    }
  });

  app.get('/api/admin/orders', authMiddleware, adminOnlyMiddleware, (_req: Request, res: Response): void => {
    const orders = db.getOrders();
    res.json(orders);
  });

  app.patch('/api/admin/orders/:id/status', authMiddleware, adminOnlyMiddleware, (req: Request, res: Response): void => {
    try {
      const { status } = req.body;
      const updated = db.updateOrderStatus(req.params.id, status as OrderStatus);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to update order status' });
    }
  });

  app.get('/api/admin/coupons', authMiddleware, adminOnlyMiddleware, (_req: Request, res: Response): void => {
    const coupons = db.getCoupons();
    res.json(coupons);
  });

  app.post('/api/admin/coupons', authMiddleware, adminOnlyMiddleware, (req: Request, res: Response): void => {
    try {
      const saved = db.saveCoupon(req.body);
      res.status(201).json(saved);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to create coupon' });
    }
  });

  app.patch('/api/admin/coupons/:id/toggle', authMiddleware, adminOnlyMiddleware, (req: Request, res: Response): void => {
    try {
      const updated = db.toggleCouponStatus(req.params.id);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to toggle coupon' });
    }
  });

  app.post('/api/admin/categories', authMiddleware, adminOnlyMiddleware, (req: Request, res: Response): void => {
    try {
      const saved = db.saveCategory(req.body);
      res.status(201).json(saved);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to create category' });
    }
  });

  // ----------------------------------------------------------------
  // FRONTEND SPA SERVING (Vite middleware in dev, dist in prod)
  // ----------------------------------------------------------------
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  // Start listening on port 3000
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LuxeLane full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
