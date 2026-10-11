/**
 * Unit & Integration Test Suite for LuxeLane Business Engine:
 * - Authentication & Role authorization
 * - Price calculation & validation
 * - Coupon validation & discount formulas
 * - Transactional inventory decrement & out-of-stock prevention
 * - Order price freeze snapshotting
 * - Order cancellation inventory rollback
 */

import { api } from '../api';

function assert(condition: boolean, testName: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${testName}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${testName}`);
  }
}

async function runTests() {
  console.log('\n--- STARTING LUXELANE BUSINESS ENGINE TESTS ---\n');

  // Test 1: Category and Product Retrieval
  const products = api.getProducts();
  assert(products.length >= 15, 'Products loaded correctly from catalog');
  const categories = api.getCategories();
  assert(categories.length === 6, 'All 6 categories initialized');

  // Test 2: Authentication
  const user = api.register('Test Buyer', 'buyer@test.com', 'password123');
  assert(user.email === 'buyer@test.com', 'User registration generates customer record');
  assert(user.role === 'customer', 'Default registered role is customer');

  const loggedIn = api.login('admin@luxelane.com');
  assert(loggedIn.role === 'admin', 'Admin login recognized with admin role');

  // Test 3: Coupon Validation Engine
  const validCoupon = api.validateCoupon('WELCOME10', 100);
  assert(validCoupon.valid && validCoupon.discountAmount === 10, '10% coupon calculates $10 on $100');

  const minSpendFail = api.validateCoupon('LUXE20', 40);
  assert(!minSpendFail.valid, 'Coupon with minimum spend threshold rejects under-threshold totals');

  const minSpendSuccess = api.validateCoupon('LUXE20', 100);
  assert(minSpendSuccess.valid && minSpendSuccess.discountAmount === 20, 'Coupon calculates 20% over threshold');

  // Test 4: Inventory Decrement & Order Creation
  const testProduct = products[0];
  const initialStock = testProduct.stock;
  assert(initialStock > 0, 'Target product has available initial stock');

  const orderResult = api.createOrder({
    userId: user.id,
    customerName: user.name,
    customerEmail: user.email,
    customerPhone: '+1 555-9988',
    shippingAddress: {
      fullName: 'Test Buyer',
      street: '100 Broadway',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA',
      phone: '+1 555-9988',
    },
    paymentMethod: 'cod',
    items: [{ productId: testProduct.id, quantity: 2 }],
  });

  assert(orderResult.success && Boolean(orderResult.order), 'Order creation succeeded');
  const freshProduct = api.getProductById(testProduct.id);
  assert(freshProduct?.stock === initialStock - 2, 'Stock atomically decremented by ordered quantity');

  // Test 5: Historical Price & Product Name Freeze
  const createdOrder = orderResult.order!;
  assert(createdOrder.items[0].productName === testProduct.name, 'Snapshot product name frozen in OrderItem');
  assert(createdOrder.items[0].unitPrice === testProduct.price, 'Snapshot unit price frozen in OrderItem');

  // Test 6: Oversell Guard
  const oversellAttempt = api.createOrder({
    userId: user.id,
    customerName: user.name,
    customerEmail: user.email,
    customerPhone: '+1 555-9988',
    shippingAddress: createdOrder.shippingAddress,
    paymentMethod: 'cod',
    items: [{ productId: testProduct.id, quantity: 99999 }],
  });
  assert(!oversellAttempt.success, 'Oversell attempt rejected when quantity exceeds stock');

  // Test 7: Cancellation Inventory Rollback
  const stockBeforeCancel = api.getProductById(testProduct.id)!.stock;
  api.updateOrderStatus(createdOrder.id, 'cancelled');
  const stockAfterCancel = api.getProductById(testProduct.id)!.stock;
  assert(stockAfterCancel === stockBeforeCancel + 2, 'Inventory restored upon order cancellation');

  // Test 8: Admin KPIs
  const stats = api.getAdminStats();
  assert(stats.totalProducts >= 15, 'Admin stats report accurate product count');
  assert(stats.totalOrders >= 2, 'Admin stats report accurate order count');

  console.log('\n--- ALL BUSINESS LOGIC & TRANSACTION TESTS COMPLETED SUCCESSFULLY! ---\n');
}

runTests();
