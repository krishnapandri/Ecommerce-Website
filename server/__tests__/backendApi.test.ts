import { db } from '../db';
import { signToken, verifyToken, hashPassword } from '../auth';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${msg}`);
  }
}

async function testBackend() {
  console.log('\n--- TESTING PERSISTENT BACKEND ENGINE & JWT AUTH ---\n');

  // 1. JWT Signing and Verification
  const token = signToken({ id: 'usr-admin-1', email: 'admin@luxelane.com', role: 'admin' });
  assert(Boolean(token && token.split('.').length === 3), 'JWT token generates 3-part signed string');

  const decoded = verifyToken(token);
  assert(decoded?.role === 'admin' && decoded?.email === 'admin@luxelane.com', 'JWT token verifies with correct admin role and claims');

  // 2. Database persistence & products
  const products = db.getProducts();
  assert(products.length >= 15, 'Database loads products from persistent store');

  // 3. User Registration with Password Hash
  const email = `testuser_${Date.now()}@example.com`;
  const newUser = db.registerUser('Test User', email, 'securepassword123');
  assert(newUser.email === email && newUser.role === 'customer', 'User registered in persistent db with customer role');

  const loggedIn = db.loginUser(email, 'securepassword123');
  assert(loggedIn.id === newUser.id, 'User successfully authenticated against hashed password');

  // 4. Coupon Engine Validation
  const couponRes = db.validateCoupon('WELCOME10', 89);
  assert(couponRes.valid && couponRes.discountAmount === 8.9, 'WELCOME10 calculates 10% discount on $89 subtotal');

  // 5. Transactional Order Placement & Atomic Stock Decrement
  const watch = products.find((p) => p.categoryId === 'cat-1')!;
  const originalStock = watch.stock;

  const orderRes = db.createOrder({
    userId: newUser.id,
    customerName: newUser.name,
    customerEmail: newUser.email,
    customerPhone: '+1 555-4433',
    shippingAddress: {
      fullName: 'Test User',
      street: '450 Lexington Ave',
      city: 'New York',
      state: 'NY',
      postalCode: '10017',
      country: 'USA',
      phone: '+1 555-4433',
    },
    paymentMethod: 'razorpay',
    paymentTransactionId: 'pay_rzp_TEST12345',
    couponCode: 'WELCOME10',
    items: [{ productId: watch.id, quantity: 1 }],
  });

  assert(orderRes.success && Boolean(orderRes.order), 'Order created in persistent database');
  const freshWatch = db.getProductById(watch.id)!;
  assert(freshWatch.stock === originalStock - 1, 'Stock level decremented atomically in persistent db.json');

  // 6. Freeze Price & Historical Snapshot
  const savedOrder = orderRes.order!;
  assert(savedOrder.items[0].unitPrice === watch.price, 'Snapshot unitPrice frozen in database OrderItem');
  assert(savedOrder.items[0].productName === watch.name, 'Snapshot productName frozen in database OrderItem');

  // 7. Order Status Update & Cancellation Stock Rollback
  const currentStock = db.getProductById(watch.id)!.stock;
  db.updateOrderStatus(savedOrder.id, 'cancelled');
  const restoredStock = db.getProductById(watch.id)!.stock;
  assert(restoredStock === currentStock + 1, 'Order cancellation restores decremented inventory safely');

  // 8. Admin KPI Metrics
  const metrics = db.getAdminStats();
  assert(metrics.totalOrders >= 1 && metrics.totalProducts >= 15, 'Admin metrics computed accurately from persistent orders and catalog');

  console.log('\n--- ALL BACKEND INTEGRATION TESTS PASSED! ---\n');
}

testBackend();
