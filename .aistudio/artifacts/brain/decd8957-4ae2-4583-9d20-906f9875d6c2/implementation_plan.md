# LuxeLane — Modern MVP E-Commerce Platform for Fashion & Lifestyle Accessories

A modern, responsive e-commerce web application and administrative management system for **LuxeLane**, offering affordable fashion and lifestyle accessories (watches, sunglasses, wallets, bracelets, bags, and mobile accessories) with a complete transactional backend and intuitive admin controls.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and aesthetic choices were confirmed through user input:
> - **Brand Identity**: LuxeLane — Clean, premium-feel affordable lifestyle accessories with warm minimalist restraint and high typographic clarity.
> - **Backend API & Data Layer**: Integrated Express TypeScript REST API with transactional entity persistence, stock reservation, and real server-side validation.
> - **Payment Strategy**: Interactive Razorpay checkout simulation with instant verification, cryptographic signature handling, and Cash on Delivery (COD) order placement.
> - **Authentication & Authorization**: Role-based authentication (Admin vs. Customer) using token-based session auth and secure password hashing.

---

### 1. Overview & Core Concept

- **What It Does**: LuxeLane delivers an end-to-end shopping experience for fashion accessories. Customers can browse curated categories, search and filter with instant results, view high-detail product pages, manage carts, apply promotional coupons, and complete checkouts via Cash on Delivery or Razorpay. Administrators access a protected `/admin` portal to monitor revenue and metrics, update inventory and prices, create coupon codes, and process customer orders.
- **Target Audience / Persona**: Style-conscious shoppers seeking affordable, high-quality everyday accessories, and store managers requiring an efficient, uncluttered operational dashboard.
- **Key Value**: Real business logic and inventory integrity: prices and coupons are verified on the server, stock is decremented transactionally upon confirmation, and order history records snapshot prices to ensure historical accuracy.

---

### 2. User Experience & Visual Design

#### Visual Identity & Theme
- **Aesthetic Direction**: Clean luxury and warm minimalism. Quiet, high-end editorial restraint without generic AI gimmicks (zero purple gradients, zero pill-badge clutter, zero fake status dots).
- **Color Palette & Discipline (60-30-10)**:
  - *Dominant Canvas (60%)*: Crisp alabaster and soft neutral paper (`#FAFAF9` / `#FFFFFF`).
  - *Structural Surfaces (30%)*: Muted stone borders (`#E7E5E4`), rich slate charcoal typography (`#1C1917` / `#44403C`), and subtle warm surfaces (`#F5F5F4`).
  - *Disciplined Accent (10%)*: Warm bronze-gold / rich amber-espresso (`#78350F` / `#92400E`) used selectively for checkout CTAs, active filter highlights, and critical administrative badges.
- **Typography & Scale**:
  - *Display / Headings*: High-contrast serif `Playfair Display` or clean architectural `Plus Jakarta Sans` for distinctive editorial headlines (`clamp(2rem, 3.5vw, 3rem)`).
  - *Body Prose & Controls*: `Plus Jakarta Sans` / `DM Sans` (15px, 1.6 line height).
  - *Numbers & Pricing*: Tabular figures (`tabular-nums font-medium`) for vertical pricing alignment in cards, tables, and cart line items.
- **Anti-Slop Discipline**:
  - Metadata rendered as unboxed text with subtle typographic separators (`·` or `/`), never rounded candy capsules.
  - No decorative pulsing green dots or pseudo-technical labels.
  - Buttons and segmented tabs use concise, single-line labels (`whitespace-nowrap`).

#### Customer User Flows
1. **Storefront Landing**:
   - Slim 3-zone top navigation: Brand wordmark (`LuxeLane`), clean category links (`Watches`, `Sunglasses`, `Wallets`, `Bags`, `Bracelets`), and header actions (Search, Account/Login, Cart Drawer counter).
   - Hero Campaign: Editorial showcase featuring bestselling collections with direct CTA to browse.
   - Curated Categories: Visual cards for Watches, Sunglasses, Wallets, Bags, Bracelets, and Mobile Essentials.
   - Featured Grid: 3-column desktop layout with high-ratio product imagery, subtle hover lift, stock status, and Quick Add.
2. **Product Catalog & Details (PDP)**:
   - Dynamic search, price range filter, category selection, and sorting (Price: Low to High, High to Low, Rating, Newest).
   - Contiguous purchase module on product detail view with multi-image gallery, real-time stock availability, quantity stepper, and "Add to Cart" trigger with slide-over drawer feedback.
3. **Cart & Secure Checkout**:
   - Slide-over cart drawer and full checkout view with line items, coupon code entry with instant validation feedback, and delivery address form.
   - Payment selection between **Cash on Delivery** and **Razorpay Online Payment** (interactive modal with instant payment verification).
   - Order confirmation screen with unique Order ID, itemized receipt, and delivery timeline.
4. **Customer Account**:
   - Order history with live statuses (`Pending`, `Confirmed`, `Shipped`, `Delivered`, `Cancelled`), saved addresses, and profile management.

#### Admin Management Flows (`/admin`)
1. **Overview Dashboard**: Metrics for total gross revenue, active orders, customer count, and low-stock warning alerts.
2. **Product Management**: Grid/table view with status toggle (Active/Inactive), stock count, price edit, category assignment, and modal to add/edit products.
3. **Order Management**: Filterable order queue with status updater (`Confirmed`, `Shipped`, `Delivered`, `Cancelled`) and order items breakdown with freeze-price history.
4. **Coupons & Categories**: Create percentage or fixed discount coupons with minimum purchase limits, expiry dates, and category management.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Full-Stack Express TypeScript API over Client-Only Mocking**
  - *Chosen Approach*: Implement an Express backend running alongside Vite (`server.ts` + `/api/*` endpoints), backed by a schema-driven transactional store with file/in-memory persistence.
  - *Why*: The prompt requires strict server-side price validation, coupon eligibility, concurrency control, and role-based authorization. A real backend ensures prices cannot be tampered with in the browser.
  - *Alternatives Considered*: Pure localStorage mock. Rejected because client-side mock violates the requirement that the backend validates prices and inventory safely.
- **Decision 2: Transactional Concurrency & Inventory Decrement**
  - *Chosen Approach*: Atomic inventory check and decrement during order placement. If any line item exceeds remaining stock, the order creation fails immediately with a clear item-level error message.
  - *Why*: Prevents overselling and race conditions when multiple users buy popular accessories simultaneously.
- **Decision 3: Historical Order Price Snapshotting**
  - *Chosen Approach*: When an order is placed, `unitPrice` and `productName` are explicitly recorded in `OrderItem` records.
  - *Why*: Future product price adjustments or catalog renaming do not corrupt historical financial reports or user receipts.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        LuxeLane Architecture                           │
└────────────────────────────────────────────────────────────────────────┘

 [ Client Browser: React 19 + TypeScript + Tailwind CSS ]
    ├── Customer Views:
    │     ├── TopBar (Brand, Nav Links, Cart Counter, Auth Menu)
    │     ├── StorefrontHero & CategoryShowcase
    │     ├── ProductCatalog (Search, Filters, Sort, ProductCard)
    │     ├── ProductDetailModal / PurchaseModule
    │     ├── CartDrawer & CheckoutModal (Address, Coupon, Payment)
    │     ├── RazorpayModal (Interactive payment simulation & signature)
    │     └── CustomerAccount (Order History, Profile)
    ├── Admin Portal (/admin):
    │     ├── AdminNavbar & MetricCards (Revenue, Orders, Low Stock)
    │     ├── ProductManager (Add, Edit, Deactivate, Inventory)
    │     ├── OrderManager (Status Lifecycle, Customer Info, Items)
    │     └── CouponManager (Discounts, Expiry, Min Spend)
    └── State / API Clients:
          ├── AuthContext (JWT/Token, Role: Admin | Customer)
          ├── CartContext (Persistent cart state, totals, discounts)
          └── ApiService (/api/products, /api/orders, /api/auth, etc.)
                               │  REST API Calls (/api/*)
                               ▼
 [ Backend Server: Node.js + Express + TypeScript (server.ts) ]
    ├── Middleware (Auth verify, Role guard, Error handler)
    ├── Controllers & Routes:
    │     ├── /api/auth (Register, Login, Me)
    │     ├── /api/categories (CRUD)
    │     ├── /api/products (Public list, detail; Admin CRUD & stock)
    │     ├── /api/coupons (Validation & Admin CRUD)
    │     ├── /api/orders (Create with stock transaction, history, status updates)
    │     └── /api/admin/metrics (KPI summary, revenue, low stock)
    └── Data & Business Engine:
          ├── Schema Definitions (User, Product, Order, OrderItem, Coupon)
          ├── Atomic Transaction Guard (Stock check & decrement)
          └── Seed Data Engine (20+ premium accessories with rich specs)
```

#### Entity Schema Design
- **User**: `id`, `name`, `email`, `passwordHash`, `role` (`'customer' | 'admin'`), `createdAt`.
- **Category**: `id`, `name`, `slug`, `description`, `imageUrl`.
- **Product**: `id`, `name`, `slug`, `description`, `price`, `originalPrice`, `categoryId`, `stock`, `isActive`, `isFeatured`, `images` (`string[]`), `rating`, `reviewCount`, `sku`, `tags`.
- **Cart & CartItem**: `userId`, `items: { productId, quantity }[]`.
- **Order**: `id`, `orderNumber`, `userId`, `customerName`, `customerEmail`, `shippingAddress`, `paymentMethod` (`'cod' | 'razorpay'`), `paymentStatus` (`'pending' | 'completed' | 'failed'`), `orderStatus` (`'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'`), `subtotal`, `discountAmount`, `shippingFee`, `totalAmount`, `couponCode`, `items: OrderItem[]`, `createdAt`.
- **OrderItem**: `id`, `orderId`, `productId`, `productName`, `unitPrice`, `quantity`, `subtotal`.
- **Coupon**: `id`, `code`, `discountType` (`'percentage' | 'fixed'`), `discountValue`, `minOrderAmount`, `isActive`, `validUntil`.

---

### Implementation Phasing

1. **Phase 1: Backend Foundation & Data Persistence**
   - Configure `server.ts` Express application on port 3000 with complete TypeScript typings.
   - Seed realistic initial database with accessories (Watches, Sunglasses, Wallets, Leather Bags, Minimalist Bracelets, Tech Sleeves).
   - Implement authentication endpoints, product query/mutation APIs, coupon validation, and transactional order placement with inventory guards.
2. **Phase 2: Customer Storefront & Catalog Experience**
   - Build 3-zone clean TopBar navigation with brand wordmark, category tabs, search input, and cart badge.
   - Implement Storefront Hero, Category Grid, and 3-column Featured Accessories display.
   - Build filterable catalog with price slider, category picker, keyword search, and sorting.
   - Build contiguous Product Detail Modal / View with multi-angle image preview and quantity selector.
3. **Phase 3: Shopping Cart, Coupon Validation & Multi-Option Checkout**
   - Implement slide-over Cart Drawer with real-time subtotal calculation.
   - Implement Checkout flow with address validation, coupon code verification against backend API, and selection between Cash on Delivery and Razorpay.
   - Implement interactive Razorpay checkout modal with payment ID generation, order receipt, and transactional inventory decrement.
4. **Phase 4: Customer Account & Admin Dashboard (`/admin`)**
   - Build Customer Order History view with order timeline and item breakdown.
   - Build Admin Dashboard with KPI summary cards (Gross Sales, Orders, Products, Low Stock Alert).
   - Build Admin Product Management (Add new accessory, adjust stock, modify price, toggle active status).
   - Build Admin Order Management (Update status from Confirmed $\to$ Shipped $\to$ Delivered, handle cancellations with stock restoration).
   - Build Admin Coupon Manager.
5. **Phase 5: Verification & Polish**
   - Test full customer purchase flow (Browse $\to$ Cart $\to$ Coupon $\to$ Razorpay / COD $\to$ Receipt).
   - Test admin inventory updates and order tracking.
   - Verify zero compile errors and verify WCAG AA responsive design.
