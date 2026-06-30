# 🧠 Storify — Project Brain (End-to-End Complete Reference)

> **Ye document poore Storify project ka "brain" hai — har cheez ka flow, architecture, file mapping, aur end-to-end lifecycle yahan documented hai.**

---

## 📌 Project Ka Summary

**Storify** ek **multi-tenant SaaS e-commerce platform** hai (Shopify clone). Isme **3 panels** hain:

| Panel | Kaun use karta hai | Frontend | Port |
|-------|--------------------|----------|------|
| **SuperAdmin Panel** | Platform Owner (Master Admin) | `superadmin-frontend/` | 5174 |
| **Merchant/Admin Panel** | Store Owners (Merchants) | `admin-frontend/` | 5173 |
| **Customer Storefront** | End Customers (Buyers) | `admin-frontend/` ke andar hi embed hai | 5173 |

Backend **Microservices Architecture** pe hai — **6 services** independently chalte hain, **API Gateway** sabko route karta hai.

---

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTENDS (React + Vite)                   │
│                                                                     │
│  ┌──────────────────────┐    ┌───────────────────────────────────┐  │
│  │ superadmin-frontend   │    │ admin-frontend                    │  │
│  │ Port: 5174            │    │ Port: 5173                        │  │
│  │                       │    │                                   │  │
│  │ • SuperAdmin Login    │    │ • Merchant Login/Signup            │  │
│  │ • Overview            │    │ • Merchant Dashboard               │  │
│  │ • Merchants Mgmt      │    │ • Vendor Login/Dashboard           │  │
│  │ • Plans Mgmt          │    │ • Customer Storefront (embedded)   │  │
│  │ • Stores Monitoring   │    │ • Landing Page (Home/Pricing)      │  │
│  │ • Analytics           │    │                                   │  │
│  │ • Billing             │    │                                   │  │
│  │ • Support Tickets     │    │                                   │  │
│  │ • Announcements       │    │                                   │  │
│  │ • Settings            │    │                                   │  │
│  └──────────┬───────────┘    └──────────────┬────────────────────┘  │
│             │                               │                       │
│             └───────────┬───────────────────┘                       │
│                         ▼                                           │
│                    API CALLS                                        │
│              (via VITE_API_BASE_URL)                                │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    API GATEWAY (Port 5000)                          │
│                    services/gateway/                                │
│                                                                     │
│  • CORS handling                                                    │
│  • Helmet security                                                  │
│  • Cookie parsing                                                   │
│  • JWT Auth middleware (gateway-level)                               │
│  • Proxy routing → downstream microservices                         │
│  • Path rewriting (/api/merchants → /api/admin/merchants)           │
│  • Error enrichment (adds service name to error responses)          │
│  • Static file serving (/uploads/)                                  │
└───┬──────────┬──────────┬──────────┬──────────┬─────────────────────┘
    │          │          │          │          │
    ▼          ▼          ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ Auth   │ │Merchant│ │Catalog │ │ Store  │ │Billing │
│Service │ │ Admin  │ │Service │ │Service │ │Service │
│ :5001  │ │Service │ │ :5003  │ │ :5004  │ │ :5005  │
│        │ │ :5002  │ │        │ │        │ │        │
└────┬───┘ └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘
     │         │          │          │          │
     └─────────┴──────────┴──────────┴──────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │  MongoDB     │
                   │  (Single DB) │
                   └──────────────┘
```

---

## 📂 Complete Folder Structure

```
Shopify_Clone_Main/
│
├── admin-frontend/                    # Merchant Panel + Customer Storefront
│   ├── .env                           # API URLs (all service endpoints)
│   ├── src/
│   │   ├── App.jsx                    # Main router (domain resolution + all routes)
│   │   ├── main.jsx                   # React entry point
│   │   ├── App.css / index.css        # Global styles
│   │   └── modules/user/
│   │       ├── pages/
│   │       │   ├── Home.jsx           # Landing page
│   │       │   ├── Pricing.jsx        # Pricing page
│   │       │   ├── Enterprise.jsx     # Enterprise page
│   │       │   ├── Login.jsx          # Merchant login
│   │       │   ├── Signup.jsx         # Merchant signup
│   │       │   ├── ForgotPassword.jsx # OTP-based password reset
│   │       │   ├── Dashboard.jsx      # Merchant dashboard (tab-based)
│   │       │   ├── PickPlan.jsx       # Plan selection page
│   │       │   ├── Subscribe.jsx      # Razorpay subscription checkout
│   │       │   ├── VendorLogin.jsx    # Sub-vendor login
│   │       │   ├── VendorDashboard.jsx# Sub-vendor dashboard
│   │       │   ├── NotFound.jsx       # 404 page
│   │       │   └── storefront/        # Customer-facing storefront pages
│   │       │       ├── StorefrontHome.jsx
│   │       │       ├── StorefrontCatalog.jsx
│   │       │       ├── StorefrontProductDetails.jsx
│   │       │       ├── StorefrontCart.jsx
│   │       │       ├── StorefrontCheckout.jsx
│   │       │       ├── StorefrontAuth.jsx
│   │       │       ├── StorefrontAccount.jsx
│   │       │       ├── StorefrontWishlist.jsx
│   │       │       ├── StorefrontOrderTrack.jsx
│   │       │       └── StorefrontPage.jsx
│   │       ├── components/
│   │       │   ├── Header.jsx                  # Landing page header
│   │       │   ├── Footer.jsx                  # Landing page footer
│   │       │   ├── MegaMenu.jsx                # Navigation mega menu
│   │       │   ├── DashboardSidebar.jsx        # Merchant dashboard sidebar
│   │       │   ├── DashboardHeader.jsx         # Merchant dashboard header
│   │       │   ├── MerchantProtectedRoute.jsx  # Auth guard (merchant)
│   │       │   ├── VendorProtectedRoute.jsx    # Auth guard (vendor)
│   │       │   ├── VendorDashboardSidebar.jsx  # Vendor sidebar
│   │       │   ├── dashboard/                  # 64 Dashboard tab components
│   │       │   │   ├── MerchantDashboard.jsx   # Dashboard overview
│   │       │   │   ├── ProductsTab.jsx         # Product management
│   │       │   │   ├── SingleVendorProductsTab.jsx
│   │       │   │   ├── CategoryTab.jsx         # Category CRUD
│   │       │   │   ├── OrdersTab.jsx           # Order listing
│   │       │   │   ├── OrderDetail.jsx         # Single order view
│   │       │   │   ├── CreateOrder.jsx         # Manual order creation
│   │       │   │   ├── CustomersTab.jsx        # Customer management
│   │       │   │   ├── CouponsTab.jsx          # Coupon management
│   │       │   │   ├── DiscountsTab.jsx        # Discounts
│   │       │   │   ├── BannersTab.jsx          # Banner management
│   │       │   │   ├── VendorsTabSingle.jsx    # Sub-vendor management
│   │       │   │   ├── StoresTabSingle.jsx     # Store management
│   │       │   │   ├── PagesTab.jsx            # Static pages (CMS)
│   │       │   │   ├── ThemesTab.jsx           # Theme selection
│   │       │   │   ├── ThemeCustomizer.jsx     # Theme customizer
│   │       │   │   ├── DomainsTab.jsx          # Domain management
│   │       │   │   ├── AnalyticsTab.jsx        # Store analytics
│   │       │   │   ├── ReportsTab.jsx          # Reports
│   │       │   │   ├── MarketingOverview.jsx   # Marketing dashboard
│   │       │   │   ├── MerchantProfileTab.jsx  # Profile settings
│   │       │   │   ├── StoreProfileTab.jsx     # Store settings
│   │       │   │   ├── SupportTab.jsx          # Support tickets
│   │       │   │   ├── SidekickChat.jsx        # AI chat assistant
│   │       │   │   └── ... (aur bhi tabs)
│   │       │   └── storefront/                 # Storefront rendering system
│   │       │       ├── StorefrontContainer.jsx # Main container (resolves store)
│   │       │       ├── StorefrontLayout.jsx    # Layout + routing
│   │       │       ├── ThemeRenderer.jsx       # Theme-based rendering
│   │       │       ├── SectionRenderer.jsx     # Section-based page builder
│   │       │       ├── storeUrlHelper.js       # URL utilities
│   │       │       ├── headers/                # Header variants
│   │       │       └── sections/               # Section components
│   │       └── sections/                       # Landing page sections
│   │           ├── HeroSection.jsx
│   │           ├── FeatureSection.jsx
│   │           ├── PlatformSection.jsx
│   │           └── ... (9 sections total)
│
├── superadmin-frontend/                # SuperAdmin Panel
│   ├── .env                            # Same API URLs
│   ├── src/
│   │   ├── App.jsx                     # Router (/superadmin/*)
│   │   └── modules/masterAdmin/
│   │       ├── pages/
│   │       │   ├── MasterAdminLogin.jsx
│   │       │   ├── MasterAdminPage.jsx  # Tab-based master page
│   │       │   └── NotFound.jsx
│   │       └── components/
│   │           ├── MasterAdminHeader.jsx
│   │           ├── MasterAdminSidebar.jsx
│   │           ├── ProtectedRoute.jsx   # Auth guard (admin)
│   │           └── tabs/                # 10 SuperAdmin tabs
│   │               ├── OverviewTab.jsx
│   │               ├── MerchantsTab.jsx
│   │               ├── PlansTab.jsx
│   │               ├── StoresTab.jsx
│   │               ├── AnalyticsTab.jsx
│   │               ├── BillingTab.jsx
│   │               ├── SupportTab.jsx
│   │               ├── AnnouncementsTab.jsx
│   │               ├── AppsTab.jsx
│   │               └── SettingsTab.jsx
│
├── services/                           # Backend Microservices
│   ├── package.json                    # Root runner config
│   ├── start.js                        # Sab services ek saath start karta hai
│   │
│   ├── shared/                         # Shared utilities (sab services use karti hain)
│   │   ├── connectDB.js                # MongoDB connection
│   │   ├── generateToken.js            # JWT token generation (30 days expiry)
│   │   ├── sendEmail.js                # Nodemailer email utility
│   │   └── uploadMiddleware.js         # Multer file upload
│   │
│   ├── gateway/                        # API Gateway (Port 5000)
│   │   └── src/
│   │       ├── server.js               # Express server bootstrap
│   │       ├── app.js                  # Proxy routing rules (226 lines)
│   │       └── middleware/
│   │           └── auth.js             # Gateway-level JWT auth (176 lines)
│   │
│   ├── auth-service/                   # Authentication Service (Port 5001)
│   │   └── src/
│   │       ├── server.js / app.js
│   │       ├── controllers/
│   │       │   ├── adminAuthController.js    # SuperAdmin login/logout
│   │       │   ├── merchantAuthController.js # Merchant login/signup/forgot/reset
│   │       │   ├── vendorAuthController.js   # Vendor login
│   │       │   └── verifyController.js       # Token verification endpoint
│   │       ├── models/
│   │       │   ├── MasterAdmin.js       # SuperAdmin model
│   │       │   ├── Merchant.js          # Merchant model
│   │       │   └── Vendor.js            # Vendor model
│   │       └── routes/
│   │           └── authRoutes.js        # All auth routes
│   │
│   ├── merchant-admin-service/         # Merchant Admin Service (Port 5002)
│   │   └── src/
│   │       ├── server.js / app.js
│   │       ├── controllers/
│   │       │   ├── merchantController.js    # Merchant CRUD (SuperAdmin use)
│   │       │   ├── planController.js        # Plan CRUD
│   │       │   ├── analyticsController.js   # Platform analytics
│   │       │   ├── supportController.js     # Support tickets
│   │       │   └── adminProfileController.js# Admin profile
│   │       ├── models/
│   │       │   ├── MasterAdmin.js, Merchant.js, Plan.js
│   │       │   ├── Store.js, Subscription.js
│   │       │   ├── SupportTicket.js, Order.js
│   │       │   ├── Customer.js, Product.js
│   │       └── routes/
│   │           ├── merchantRoutes.js
│   │           ├── planRoutes.js
│   │           ├── analyticsRoutes.js
│   │           └── supportRoutes.js
│   │
│   ├── catalog-service/                # Catalog Service (Port 5003)
│   │   └── src/
│   │       ├── server.js / app.js
│   │       ├── controllers/
│   │       │   ├── productController.js    # Product CRUD
│   │       │   ├── categoryController.js   # Category CRUD
│   │       │   ├── couponController.js     # Coupon CRUD
│   │       │   ├── customerController.js   # Customer CRUD + Auth
│   │       │   ├── vendorController.js     # Vendor CRUD
│   │       │   └── bannerController.js     # Banner CRUD
│   │       ├── models/
│   │       │   ├── Product.js, Category.js, Coupon.js
│   │       │   ├── Customer.js, Address.js
│   │       │   ├── Vendor.js, Banner.js
│   │       │   ├── Subscriber.js, Wishlist.js
│   │       └── routes/
│   │           ├── productRoutes.js, categoryRoutes.js
│   │           ├── couponRoutes.js, customerRoutes.js
│   │           ├── vendorRoutes.js, bannerRoutes.js
│   │
│   ├── store-service/                  # Store Service (Port 5004)
│   │   └── src/
│   │       ├── server.js / app.js
│   │       ├── controllers/
│   │       │   ├── storeController.js      # Store CRUD + settings (40KB!)
│   │       │   ├── storePageController.js  # CMS pages CRUD
│   │       │   ├── themeController.js      # Theme management
│   │       │   └── orderController.js      # Order management
│   │       ├── models/
│   │       │   ├── Store.js, StorePage.js
│   │       │   ├── Theme.js, Order.js
│   │       │   ├── Merchant.js, PlatformSetting.js
│   │       ├── data/                       # Seed/default data
│   │       └── routes/
│   │           ├── storeRoutes.js
│   │           ├── storePageRoutes.js
│   │           ├── themeRoutes.js
│   │           └── orderRoutes.js
│   │
│   └── billing-service/                # Billing Service (Port 5005)
│       └── src/
│           ├── server.js / app.js
│           ├── controllers/
│           │   └── paymentController.js    # Razorpay payment handling
│           ├── models/
│           │   ├── Plan.js, Subscription.js
│           │   ├── Merchant.js, Store.js
│           └── routes/
│               └── billingRoutes.js
│
├── nginx/
│   └── storefront-wildcard.conf        # Nginx wildcard domain config (production)
│
├── deploy-frontend.sh                  # Frontend deploy script (VPS)
├── ecosystem.config.cjs                # PM2 config (production)
├── plans.md                            # Detailed project roadmap
└── brain.md                            # 👈 YE FILE
```

---

## 🔄 End-to-End Request Flow

### Request Lifecycle (Frontend → Gateway → Service → DB → Response):

```
Frontend (React)
    │
    │  HTTP Request (e.g. POST /api/products)
    │  Headers: Cookie(jwt_merchant=xxx) or Authorization: Bearer xxx
    │
    ▼
API Gateway (Port 5000) ─── gateway/src/app.js
    │
    │  Step 1: CORS check (allowed origins)
    │  Step 2: Helmet security headers
    │  Step 3: Morgan logging (dev mode)
    │  Step 4: Cookie parsing
    │  Step 5: gatewayAuthMiddleware
    │          ├── Path matching → determine requiredAuth (admin/merchant/vendor/null)
    │          ├── extractToken() → cookies se ya Authorization header se
    │          ├── verifyTokenWithAuthService() → auth-service ko POST /api/auth/verify
    │          ├── Role enforcement (admin-only, merchant-only, etc.)
    │          └── Inject trusted headers: x-admin-id, x-merchant-id, x-vendor-id
    │  Step 6: Route matching → createServiceProxy()
    │          ├── Path rewriting (e.g. /api/merchants → /api/admin/merchants)
    │          ├── Forward trusted headers to downstream service
    │          └── Error enrichment (adds service name)
    │
    ▼
Downstream Microservice (e.g. catalog-service:5003)
    │
    │  Step 1: Express body parsing (json/urlencoded)
    │  Step 2: Route matching → Controller function
    │  Step 3: Read x-merchant-id from headers (trusted by gateway)
    │  Step 4: MongoDB query via Mongoose
    │  Step 5: Return JSON response
    │
    ▼
Response travels back through Gateway → Frontend
```

---

## 🔐 Authentication System — Complete Flow

### 3 Types of Auth:

| Auth Type | Cookie Name | Token Verify | Used For |
|-----------|-------------|-------------|----------|
| **SuperAdmin** | `jwt_admin` | `/api/auth/verify` (type: admin) | SuperAdmin Panel |
| **Merchant** | `jwt_merchant` | `/api/auth/verify` (type: merchant) | Merchant Dashboard |
| **Vendor** | `jwt_vendor` | `/api/auth/verify` (type: vendor) | Vendor Dashboard |

### Login Flow (Merchant Example):

```
┌──────────┐    POST /api/merchants/login     ┌─────────┐
│ Frontend │ ──────────────────────────────► │ Gateway │
│ Login.jsx│                                  │ :5000   │
└──────────┘                                  └────┬────┘
                                                   │ Path rewrite:
                                                   │ /api/merchants/login → /api/auth/merchant/login
                                                   ▼
                                            ┌──────────────┐
                                            │ Auth Service │
                                            │ :5001        │
                                            │              │
                                            │ 1. Find Merchant by email
                                            │ 2. bcrypt.compare(password)
                                            │ 3. generateToken(merchant._id)
                                            │ 4. Set cookie: jwt_merchant
                                            │ 5. Return { success, merchant }
                                            └──────────────┘
```

### Token Verification Flow (Gateway → Auth Service):

```
Every protected request:
Gateway extractToken(req) → reads cookie or Bearer token
Gateway POST http://auth-service:5001/api/auth/verify { token, type }
Auth Service → jwt.verify(token) → find user in DB → return { valid, id, type }
Gateway → inject headers: x-merchant-id = verified.id
Downstream service → reads x-merchant-id from headers (trusts gateway)
```

---

## 🔀 API Gateway Routing Map

### Gateway (Port 5000) → Service Routing:

| Frontend API Call | Gateway Route | Rewrites To | Target Service |
|-------------------|--------------|-------------|----------------|
| `/api/auth/*` | `/api/auth` | — | Auth (5001) |
| `/api/master-admin/login` | aliased | `/api/auth/admin/login` | Auth (5001) |
| `/api/master-admin/logout` | aliased | `/api/auth/admin/logout` | Auth (5001) |
| `/api/merchants/login` | aliased | `/api/auth/merchant/login` | Auth (5001) |
| `/api/merchants/forgot-password` | aliased | `/api/auth/merchant/forgot-password` | Auth (5001) |
| `/api/merchants/verify-otp` | aliased | `/api/auth/merchant/verify-otp` | Auth (5001) |
| `/api/merchants/reset-password` | aliased | `/api/auth/merchant/reset-password` | Auth (5001) |
| `/api/master-admin/profile` | aliased | `/api/admin/profile` | Merchant Admin (5002) |
| `/api/merchants/*` | rewritten | `/api/admin/merchants/*` | Merchant Admin (5002) |
| `/api/plans/*` | rewritten | `/api/admin/plans/*` | Merchant Admin (5002) |
| `/api/stores/admin/all` | rewritten | `/api/admin/stores/all` | Merchant Admin (5002) |
| `/api/master-admin/analytics` | rewritten | `/api/admin/analytics` | Merchant Admin (5002) |
| `/api/master-admin/overview` | rewritten | `/api/admin/overview` | Merchant Admin (5002) |
| `/api/support-tickets/*` | rewritten | `/api/admin/support-tickets/*` | Merchant Admin (5002) |
| `/api/admin/*` | — | — | Merchant Admin (5002) |
| `/api/products/*` | — | — | Catalog (5003) |
| `/api/categories/*` | — | — | Catalog (5003) |
| `/api/coupons/*` | — | — | Catalog (5003) |
| `/api/customers/*` | — | — | Catalog (5003) |
| `/api/banners/*` | — | — | Catalog (5003) |
| `/api/vendors/*` | — | — | Catalog (5003) |
| `/api/stores/*` | — | — | Store (5004) |
| `/api/themes/*` | — | — | Store (5004) |
| `/api/store-pages/*` | — | — | Store (5004) |
| `/api/orders/*` | — | — | Store (5004) |
| `/api/payments/*` | rewritten | `/api/billing/*` | Billing (5005) |
| `/api/billing/*` | — | — | Billing (5005) |

---

## 🧩 Service-wise Responsibility Map

### 1️⃣ Auth Service (Port 5001) — `services/auth-service/`
**Purpose:** Authentication & authorization for all user types.

| Feature | Controller | Endpoint |
|---------|-----------|----------|
| Admin Login | `adminAuthController.js` | `POST /api/auth/admin/login` |
| Admin Logout | `adminAuthController.js` | `POST /api/auth/admin/logout` |
| Merchant Login | `merchantAuthController.js` | `POST /api/auth/merchant/login` |
| Merchant Signup | `merchantAuthController.js` | `POST /api/auth/merchant/signup` |
| Forgot Password | `merchantAuthController.js` | `POST /api/auth/merchant/forgot-password` |
| Verify OTP | `merchantAuthController.js` | `POST /api/auth/merchant/verify-otp` |
| Reset Password | `merchantAuthController.js` | `POST /api/auth/merchant/reset-password` |
| Vendor Login | `vendorAuthController.js` | `POST /api/auth/vendor/login` |
| Token Verify | `verifyController.js` | `POST /api/auth/verify` |

**Models:** `MasterAdmin.js`, `Merchant.js`, `Vendor.js`

---

### 2️⃣ Merchant Admin Service (Port 5002) — `services/merchant-admin-service/`
**Purpose:** SuperAdmin operations — merchant CRUD, plans, analytics, support.

| Feature | Controller | Endpoint Pattern |
|---------|-----------|-----------------|
| Merchant CRUD | `merchantController.js` | `/api/admin/merchants/*` |
| Plan CRUD | `planController.js` | `/api/admin/plans/*` |
| Platform Analytics | `analyticsController.js` | `/api/admin/analytics/*` |
| Platform Overview | `analyticsController.js` | `/api/admin/overview` |
| Support Tickets | `supportController.js` | `/api/admin/support-tickets/*` |
| Admin Profile | `adminProfileController.js` | `/api/admin/profile` |

**Models:** `MasterAdmin.js`, `Merchant.js`, `Plan.js`, `Store.js`, `Subscription.js`, `SupportTicket.js`, `Order.js`, `Customer.js`, `Product.js`

---

### 3️⃣ Catalog Service (Port 5003) — `services/catalog-service/`
**Purpose:** Product catalog, categories, coupons, customers, vendors, banners.

| Feature | Controller | Endpoint Pattern |
|---------|-----------|-----------------|
| Products CRUD | `productController.js` | `/api/products/*` |
| Categories CRUD | `categoryController.js` | `/api/categories/*` |
| Coupons CRUD | `couponController.js` | `/api/coupons/*` |
| Customer CRUD + Auth | `customerController.js` | `/api/customers/*` |
| Vendor CRUD | `vendorController.js` | `/api/vendors/*` |
| Banner CRUD | `bannerController.js` | `/api/banners/*` |

**Models:** `Product.js`, `Category.js`, `Coupon.js`, `Customer.js`, `Address.js`, `Vendor.js`, `Banner.js`, `Subscriber.js`, `Wishlist.js`

---

### 4️⃣ Store Service (Port 5004) — `services/store-service/`
**Purpose:** Store management, themes, CMS pages, orders, domain resolution.

| Feature | Controller | Endpoint Pattern |
|---------|-----------|-----------------|
| Store CRUD + Config | `storeController.js` | `/api/stores/*` |
| Domain Resolution | `storeController.js` | `GET /api/stores/domain/resolve?domain=xxx` |
| CMS Pages CRUD | `storePageController.js` | `/api/store-pages/*` |
| Theme Management | `themeController.js` | `/api/themes/*` |
| Order Management | `orderController.js` | `/api/orders/*` |

**Models:** `Store.js`, `StorePage.js`, `Theme.js`, `Order.js`, `Merchant.js`, `PlatformSetting.js`

---

### 5️⃣ Billing Service (Port 5005) — `services/billing-service/`
**Purpose:** Razorpay payment integration for subscription plans.

| Feature | Controller | Endpoint Pattern |
|---------|-----------|-----------------|
| Create Razorpay Order | `paymentController.js` | `POST /api/billing/create-order` |
| Verify Payment | `paymentController.js` | `POST /api/billing/verify` |
| Subscription History | `paymentController.js` | `GET /api/billing/subscriptions` |

**Models:** `Plan.js`, `Subscription.js`, `Merchant.js`, `Store.js`

---

## 🌐 Frontend Routes Map

### Admin Frontend (`admin-frontend`, Port 5173):

| Route | Page/Component | Auth Required |
|-------|---------------|---------------|
| `/` | `Home.jsx` (Landing) | ❌ |
| `/pricing` | `Pricing.jsx` | ❌ |
| `/enterprise` | `Enterprise.jsx` | ❌ |
| `/admin/login` | `Login.jsx` | ❌ |
| `/signup` | `Signup.jsx` | ❌ |
| `/forgot-password` | `ForgotPassword.jsx` | ❌ |
| `/dashboard` | `Dashboard.jsx` | ✅ Merchant |
| `/dashboard/:tab/*` | `Dashboard.jsx` (dynamic tabs) | ✅ Merchant |
| `/dashboard/plan` | `PickPlan.jsx` | ✅ Merchant |
| `/dashboard/plan/subscribe` | `Subscribe.jsx` | ✅ Merchant |
| `/vendor/login` | `VendorLogin.jsx` | ❌ |
| `/vendor/dashboard` | `VendorDashboard.jsx` | ✅ Vendor |
| `/vendor/dashboard/:tab/*` | `VendorDashboard.jsx` | ✅ Vendor |
| `/store/:storeId/*` | `StorefrontContainer.jsx` | ❌ |
| `*` | `NotFound.jsx` | ❌ |

### Custom Domain Handling:
Jab koi custom domain (e.g. `mybrand.com`) se access karta hai:
1. `App.jsx` check karta hai — kya hostname system domain hai?
2. Agar nahi → `fetch(/api/stores/domain/resolve?domain=hostname)`
3. Store milta hai → `StorefrontContainer` render hota hai
4. Store nahi milta → "Store Not Found" error page

### SuperAdmin Frontend (`superadmin-frontend`, Port 5174):

| Route | Page | Auth Required |
|-------|------|---------------|
| `/` | Redirect → `/superadmin` | ❌ |
| `/superadmin/login` | `MasterAdminLogin.jsx` | ❌ |
| `/superadmin` | Redirect → `/superadmin/overview` | ✅ Admin |
| `/superadmin/:tab` | `MasterAdminPage.jsx` (dynamic tabs) | ✅ Admin |
| `*` | `NotFound.jsx` | ❌ |

**SuperAdmin Tabs:** overview, merchants, plans, stores, analytics, billing, support, announcements, apps, settings

---

## 💰 Payment Flow (Razorpay Subscription)

```
Merchant selects plan (PickPlan.jsx)
    │
    ▼
Subscribe.jsx → POST /api/payments/create-order { planId }
    │  Gateway rewrites → /api/billing/create-order
    │
    ▼
billing-service → paymentController.js
    │  razorpay.orders.create({ amount, currency })
    │  Returns orderId + razorpay key
    │
    ▼
Frontend opens Razorpay Checkout Modal
    │  Customer pays via UPI/Card/NetBanking
    │
    ▼
Razorpay callback → POST /api/payments/verify { razorpay_payment_id, razorpay_order_id, razorpay_signature }
    │
    ▼
billing-service verifies HMAC signature
    │  Creates Subscription record
    │  Updates Store/Merchant status
    │  Returns success
```

---

## 🛍️ Customer Storefront Flow

```
Customer visits store URL
    │
    ├── Path-based: /store/:storeId
    └── Custom Domain: mybrand.com → domain resolution
    │
    ▼
StorefrontContainer.jsx
    │  Fetches store data, theme, categories
    │
    ▼
StorefrontLayout.jsx (applies theme)
    │
    ├── StorefrontHome.jsx       → Featured products, banners
    ├── StorefrontCatalog.jsx    → Product listing with filters
    ├── StorefrontProductDetails → Single product page
    ├── StorefrontCart.jsx       → Shopping cart
    ├── StorefrontCheckout.jsx   → Address + Payment
    ├── StorefrontAuth.jsx       → Customer login/register
    ├── StorefrontAccount.jsx    → Customer profile + orders
    ├── StorefrontWishlist.jsx   → Saved products
    ├── StorefrontOrderTrack.jsx → Order tracking
    └── StorefrontPage.jsx       → Static CMS pages
```

---

## 🚀 Development Setup — Kaise Start Karein

### Step 1: Backend (Saari Services Ek Saath)
```bash
cd services
npm run dev
# Ye start.js chalaata hai → 6 services start hote hain (ports 5000-5005)
```

### Step 2: Admin Frontend
```bash
cd admin-frontend
npm run dev
# Vite dev server → http://localhost:5173
```

### Step 3: SuperAdmin Frontend
```bash
cd superadmin-frontend
npm run dev
# Vite dev server → http://localhost:5174
```

### Environment Variables (`.env` files):

**Admin Frontend (.env):**
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_AUTH_API_URL=http://localhost:5001/api/auth
VITE_MERCHANT_ADMIN_API_URL=http://localhost:5002/api/admin
VITE_ADMIN_API_URL=http://localhost:5002/api/admin
VITE_CATALOG_API_URL=http://localhost:5003/api
VITE_STORE_API_URL=http://localhost:5004/api
VITE_BILLING_API_URL=http://localhost:5005/api/billing
```

**Each Backend Service (.env):** MONGODB_URL, JWT_SECRET, PORT, + service-specific configs

---

## 🌍 Production Deployment

### Architecture:
- **VPS** pe hosted (cloudedata.in)
- **PM2** for process management (`ecosystem.config.cjs`)
- **Nginx** as reverse proxy (wildcard domain support)
- **MongoDB** (remote/Atlas)

### Production URLs:
| Component | URL |
|-----------|-----|
| Admin Frontend | `admin.cloudedata.in` |
| SuperAdmin Frontend | `storify.cloudedata.in` |
| API Gateway | Port 5000 (proxied via Nginx) |
| Custom Domains | `*.cloudedata.in` → Nginx catch-all → admin-frontend dist |

### Deploy Process:
```bash
# Frontend deploy only (backend untouched):
./deploy-frontend.sh
# 1. git pull
# 2. npm run build (admin-frontend)
# 3. Copy nginx wildcard config
# 4. nginx reload
```

### PM2 Services (ecosystem.config.cjs):
| Service | Name | Port |
|---------|------|------|
| Gateway | `storify-gateway` | 5000 |
| Auth | `storify-auth-service` | 5001 |
| Merchant Admin | `storify-merchant-admin-service` | 5002 |
| Catalog | `storify-catalog-service` | 5003 |
| Store | `storify-store-service` | 5004 |
| Billing | `storify-billing-service` | 5005 |

---

## 🔧 Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| **Frontend Framework** | React 19 + Vite 8 |
| **Styling** | Tailwind CSS 4 |
| **Routing** | React Router DOM 7 |
| **Charts** | Recharts 3 |
| **Drag & Drop** | dnd-kit |
| **Backend** | Node.js + Express |
| **API Gateway** | http-proxy-middleware |
| **Database** | MongoDB + Mongoose 9 |
| **Auth** | JWT (jsonwebtoken) + bcryptjs |
| **Payments** | Razorpay |
| **Email** | Nodemailer |
| **File Upload** | Multer |
| **Process Manager** | PM2 |
| **Web Server** | Nginx |
| **Module System** | ES Modules (`"type": "module"`) |

---

## ⚠️ Important Notes & Gotchas

1. **Gateway ko body parser nahi lagaya** — kyunki proxy middleware POST/PUT requests mein conflict karta hai. Body parsing sirf downstream services mein hota hai.

2. **Models duplicate hain** — Merchant.js, Store.js, Plan.js jaise models **multiple services** mein exist karte hain (auth-service, merchant-admin-service, store-service sab mein). Ye by design hai (microservices independence), par schema sync rakhna zaroori hai.

3. **Customer storefront admin-frontend ke andar hai** — alag frontend nahi hai. `/store/:storeId` route ya custom domain se access hota hai.

4. **Gateway auth middleware `verifyTokenWithAuthService()`** — har protected request pe gateway auth-service ko ek internal HTTP call karta hai token verify karne ke liye. Ye bottleneck ban sakta hai high traffic pe.

5. **Vendor ka storeId token mein hai** — Vendor login pe `x-store-id` header set hota hai, ye downstream services mein store-scoped queries ke liye use hota hai.

6. **CORS currently fully open** — `callback(null, true)` se sab origins allowed hain. Production mein tighten karna hoga.

7. **`/uploads/` static serve** — Gateway se directly serve hota hai (`gateway/public/uploads/`). Production mein Nginx se serve hota hai.

---

## 📊 Current Status at a Glance

| Feature | Status |
|---------|--------|
| SuperAdmin Panel (Full CRUD) | ✅ Complete |
| Merchant Auth (Login/Signup/Forgot) | ✅ Complete |
| Merchant Dashboard (Products/Categories/Coupons) | ✅ Complete |
| Vendor Management & Dashboard | ✅ Complete |
| Customer Storefront (Browse/Cart/Checkout) | ✅ Complete |
| Razorpay Subscription Payment | ✅ Complete |
| Theme System (Customizer + Storefront) | ✅ Complete |
| CMS Pages (Privacy/Terms/About/etc.) | ✅ Complete |
| Domain Management (Custom Domains) | ✅ Complete |
| Banner Management | ✅ Complete |
| Support Tickets | ✅ Complete |
| Order Management | ⚠️ Partial (UI + basic API) |
| Customer Checkout Payment (Razorpay) | ❌ Not Built |
| Delivery System (Self/Shiprocket) | ❌ Not Built |
| Multi-Vendor Revenue Split | ❌ Not Built |
| Invoice PDF Generation | ❌ Not Built |
| Commission System | ❌ Not Built |

---

> **Last Updated:** June 30, 2026
