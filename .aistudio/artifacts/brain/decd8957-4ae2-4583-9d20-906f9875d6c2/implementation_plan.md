# LuxeLane — Full-Stack Express Backend & Persistent Transactional Engine

Integrate an Express TypeScript backend into the existing LuxeLane application, mounted in `server.ts` on port 3000 with Vite middlewares, backed by a persistent file-based JSON database with atomic transactions, JWT Bearer authentication, and complete REST API endpoints for catalog, orders, coupons, and administrative operations.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following technical architectural choices were confirmed by user feedback:
> - **Database Persistence**: File-backed transactional database (`data/db.json`) with atomic file writes, crash resilience, and automatic seeding.
> - **Server Architecture**: Full-stack Express REST API mounted in `server.ts` on port 3000 with `vite.middlewares` in development (`npm run dev` running `tsx server.ts`).
> - **Authentication & Authorization**: Cryptographic JWT Bearer tokens for customer and admin sessions, verified via server-side authorization middleware (`authMiddleware` and `adminOnlyMiddleware`).
> - **Seamless Client Integration**: Frontend `src/services/api.ts` upgraded to consume real `/api/*` REST endpoints with Bearer token authorization headers, with instant state sync and offline fallback resilience.

---

### 1. Overview & Core Concept

- **What It Does**: Provides a real, decoupled HTTP REST backend API powering LuxeLane. All price calculations, inventory validation, coupon eligibility checks, order creation, order cancellation stock rollbacks, and admin operations are executed strictly on the Node.js server.
- **Security & Integrity**: Endpoints enforce server-side validation: client totals are never trusted; stock is checked and decremented atomically during order placement; passwords and tokens are validated with cryptographic signatures; administrative endpoints require verified `admin` role claims.

---

### 2. Backend REST Endpoints & Contracts

#### 1. Authentication (`/api/auth`)
- `POST /api/auth/register`: `{ name, email, password }` $\to$ Returns User profile and JWT Bearer token.
- `POST /api/auth/login`: `{ email, password }` $\to$ Validates credentials and returns User profile and JWT Bearer token.
- `GET /api/auth/me`: Authenticated with `Bearer <token>` $\to$ Returns current user profile with saved address.
- `PUT /api/auth/address`: Authenticated $\to$ Updates user's saved shipping address and contact phone.

#### 2. Products & Catalog (`/api/products`)
- `GET /api/products`: Query params (`categoryId`, `search`, `minPrice`, `maxPrice`, `sortBy`, `activeOnly`) $\to$ Filtered product list.
- `GET /api/products/:id`: Returns single product details and specifications.
- `POST /api/admin/products`: Requires `admin` JWT $\to$ Creates new product with SKU and stock.
- `PUT /api/admin/products/:id`: Requires `admin` JWT $\to$ Updates product details, price, or stock.
- `PATCH /api/admin/products/:id/toggle`: Requires `admin` JWT $\to$ Toggles active/inactive visibility.
- `PATCH /api/admin/products/:id/stock`: Requires `admin` JWT $\to$ Updates stock quantity.

#### 3. Categories (`/api/categories`)
- `GET /api/categories`: Returns categories with live product counts.
- `POST /api/admin/categories`: Requires `admin` JWT $\to$ Creates new category.

#### 4. Promotional Coupons (`/api/coupons`)
- `POST /api/coupons/validate`: `{ code, subtotal }` $\to$ Evaluates active status, expiry date, and minimum spend, returning verified discount amount.
- `GET /api/admin/coupons`: Requires `admin` JWT $\to$ Lists all coupons with redemption counters.
- `POST /api/admin/coupons`: Requires `admin` JWT $\to$ Creates new percentage or fixed discount coupon.
- `PATCH /api/admin/coupons/:id/toggle`: Requires `admin` JWT $\to$ Toggles coupon active status.

#### 5. Transactional Orders (`/api/orders`)
- `POST /api/orders`: `{ customerName, customerEmail, customerPhone, shippingAddress, paymentMethod, paymentTransactionId, couponCode, items, notes }`
  - Validates stock for each item.
  - Recalculates subtotal from catalog prices.
  - Applies coupon discount on server.
  - Decrements stock atomically in database.
  - Snapshots `productName` and `unitPrice` into `OrderItem` records.
  - Returns finalized `Order` object.
- `GET /api/orders`: Authenticated $\to$ Returns customer's order history (or all orders for admin).
- `GET /api/orders/:id`: Authenticated $\to$ Returns order details with items and tracking.
- `PATCH /api/admin/orders/:id/status`: Requires `admin` JWT $\to$ Updates status (`confirmed`, `processing`, `shipped`, `delivered`, `cancelled`). Cancelling automatically restores stock.

#### 6. Admin Analytics (`/api/admin/metrics`)
- `GET /api/admin/metrics`: Requires `admin` JWT $\to$ Returns gross revenue, order count, live products, low-stock alerts, and recent orders.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Full-Stack `server.ts` with Vite Middleware on Port 3000**
  - *Chosen Approach*: Use Express mounted with `vite.middlewares` in `server.ts`, changing `"dev": "tsx server.ts"` in `package.json`.
  - *Why*: Satisfies AI Studio's single-port (3000) constraint without CORS or proxy lag, allowing seamless unified development and single-command deployment.
- **Decision 2: Atomic File-Backed JSON Store (`data/db.json`)**
  - *Chosen Approach*: Implement a file persistence engine with write-queue locking and temporary file renaming (`atomic write`).
  - *Why*: Ensures data persists across server restarts and page refreshes without requiring external database server configuration, while preventing file corruption during concurrent writes.
- **Decision 3: Lightweight Cryptographic JWT Implementation**
  - *Chosen Approach*: Implement HMAC-SHA256 signature verification using Node.js built-in `crypto` module.
  - *Why*: Zero third-party bundle bloat, zero native binary compilation issues, standard `Bearer <token>` authorization format.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                   LuxeLane Full-Stack Architecture                     │
└────────────────────────────────────────────────────────────────────────┘

 [ Client Browser: React 19 Frontend (Vite) ]
    ├── Components (Navbar, Catalog, PDP, Bag, Checkout, Admin)
    ├── AuthContext (Stores JWT token, role, user profile)
    ├── CartContext (Client UI state, totals, slide-out drawer)
    └── ApiService (src/services/api.ts)
           │
           │ HTTP Fetch Requests (/api/*)
           │ Authorization: Bearer <JWT_TOKEN>
           ▼
 [ Server: Node.js Express API (server.ts, port 3000) ]
    ├── Middleware Stack:
    │     ├── express.json()
    │     ├── requestLogger
    │     ├── authMiddleware (validates JWT, attaches req.user)
    │     └── adminOnlyMiddleware (verifies role === 'admin')
    ├── Route Controllers:
    │     ├── /api/auth (Register, Login, Me, Address)
    │     ├── /api/products & /api/admin/products (CRUD, Stock)
    │     ├── /api/categories & /api/admin/categories
    │     ├── /api/coupons & /api/admin/coupons (Validation)
    │     ├── /api/orders & /api/admin/orders (Transactions)
    │     └── /api/admin/metrics (KPI Summary)
    ├── Vite Dev Middleware:
    │     └── vite.middlewares (Serves React SPA on same port)
    └── Persistent Storage Engine (server/db.ts):
          ├── data/db.json (Persistent JSON document store)
          ├── Atomic Write Guard (Locking + temp file swap)
          └── Transactional Inventory Lock (Race-condition protection)
```

---

### Implementation Phasing

1. **Phase 1: Server Infrastructure & Persistent Storage Engine**
   - Create `data/db.json` seeded with initial categories, products, coupons, orders, and users.
   - Implement `server/db.ts` with atomic read/write and file locking.
   - Implement `server/auth.ts` with HMAC-SHA256 JWT token creation, verification, and role guards.
2. **Phase 2: Express Server & API Route Controllers**
   - Create `server.ts` with Express routing for `/api/auth`, `/api/products`, `/api/categories`, `/api/coupons`, `/api/orders`, and `/api/admin/metrics`.
   - Mount Vite middleware in development mode and static file serving in production.
   - Update `package.json` dev script to `"dev": "tsx server.ts"`.
3. **Phase 3: Frontend API Client Adaptation**
   - Update `src/services/api.ts` to call backend REST endpoints via `fetch` with JWT Bearer tokens in headers.
   - Maintain seamless synchronous caching and optimistic UI updates for instant customer responsiveness.
4. **Phase 4: Verification & Automated API Tests**
   - Add automated API integration test script (`test-api.ts`) verifying real HTTP responses from `/api/*` (auth, products, inventory decrement, order creation, coupon validation, admin metrics).
   - Verify zero compile errors with `compile_applet` and restart dev server via `restart_dev_server`.
