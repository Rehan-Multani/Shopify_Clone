# 🚀 Storify (Shopify Clone) — Complete End-to-End Project Blueprint

## 📌 Project Overview

**Storify** ek multi-tenant e-commerce platform hai (Shopify jaisa) jahan:
- **SuperAdmin** (Master Admin) — Puri platform ko manage karta hai
- **Admin/Merchant** — Apna online store banata hai (2 types: Single Vendor & Multi Vendor)
- **Sub-Vendor** — Multi-Vendor store mein individual sellers
- **End Customer** — Store ke website pe products kharidta hai

---

## 🏗️ Current Project Status (What Exists)

| Component | Status | Details |
|-----------|--------|---------|
| SuperAdmin Panel | ✅ Built | Login, Overview, Merchants, Plans, Stores, Analytics, Settings, Support, Billing, Announcements, Apps |
| Merchant Auth | ✅ Built | Login, Signup, Forgot Password (OTP), Reset Password |
| Merchant Dashboard | ✅ Built | Products, Categories, Orders, Customers, Discounts, Coupons, Marketing, Themes, Pages, Blog, Files, etc. |
| Store Model | ✅ Built | Single Vendor & Multi Vendor types supported |
| Plan/Subscription | ✅ Built | Plan CRUD, Razorpay subscription payment |
| Payment Gateway (Subscription) | ✅ Built | Razorpay for plan purchase |
| Customer Storefront | ❌ Missing | Public-facing store website for end customers |
| Order Management | ⚠️ Partial | UI tabs exist, but no Order model/API |
| Customer Model | ❌ Missing | No customer authentication/model |
| Delivery System | ❌ Missing | No self-delivery or Shiprocket integration |
| Payment Gateway (Customer Checkout) | ❌ Missing | Razorpay for customer product purchase |
| Multi-Vendor Sub-Vendor System | ⚠️ Partial | UI exists (VendorsTabSingle), but no Vendor model/API |
| Website Deployment Pipeline | ❌ Missing | No deployment automation |

---

## 🔺 Complete Hierarchy Flow

```mermaid
graph TD
    SA["🔴 SUPERADMIN<br/>(Platform Owner)"]
    SA --> M1["🟠 MERCHANT / ADMIN<br/>(Store Owner)"]
    
    M1 --> SV["🟢 SINGLE VENDOR STORE<br/>(Merchant = Seller)"]
    M1 --> MV["🔵 MULTI VENDOR STORE<br/>(Marketplace)"]
    
    MV --> V1["🟣 SUB-VENDOR 1"]
    MV --> V2["🟣 SUB-VENDOR 2"]
    MV --> V3["🟣 SUB-VENDOR N..."]
    
    SV --> C1["👤 END CUSTOMERS"]
    V1 --> C1
    V2 --> C1
    V3 --> C1
    
    style SA fill:#dc2626,color:#fff
    style M1 fill:#f97316,color:#fff
    style SV fill:#22c55e,color:#fff
    style MV fill:#3b82f6,color:#fff
    style V1 fill:#a855f7,color:#fff
    style V2 fill:#a855f7,color:#fff
    style V3 fill:#a855f7,color:#fff
    style C1 fill:#6b7280,color:#fff
```

---

## 🔴 PANEL 1: SUPERADMIN (Master Admin) Panel

### Role & Responsibilities
SuperAdmin puri Storify platform ka owner hai. Ye kisi specific store ka nahi, balki **pure SaaS platform** ka admin hai.

### What SuperAdmin Does:

| Feature | Description | Current Status |
|---------|-------------|----------------|
| **Merchant Management** | Create, Edit, Delete, Suspend merchants. Auto-generated password email bhejta hai | ✅ Done |
| **Plan Management** | Create subscription plans (Basic, Pro, Enterprise) with features, limits, pricing | ✅ Done |
| **Store Monitoring** | Sabhi stores ko view/monitor karna, revenue track karna | ✅ Done |
| **Analytics Dashboard** | Platform-wide stats: Total merchants, stores, revenue, orders, growth graphs | ✅ Done |
| **Billing Management** | Subscription payments track karna, overdue follow-ups | ✅ Done |
| **Support Tickets** | Merchants ke support requests handle karna | ✅ Done |
| **Announcements** | Platform-wide announcements send karna | ✅ Done |
| **App Marketplace** | Third-party apps/integrations manage karna | ✅ Done |
| **Settings** | Platform branding, SMTP config, payment gateway keys, commission rates | ✅ Done |
| **🆕 Commission System** | Har transaction pe platform commission lena (e.g., 2-5%) | ❌ To Build |
| **🆕 Payout Management** | Merchants ko unka revenue payout karna | ❌ To Build |
| **🆕 KYC Verification** | Merchant documents verify karna (GST, PAN, Bank Details) | ❌ To Build |

### SuperAdmin Flow:

```mermaid
sequenceDiagram
    participant SA as SuperAdmin
    participant Platform as Storify Platform
    participant M as Merchant
    
    SA->>Platform: Login (/superadmin/login)
    SA->>Platform: Create Subscription Plans
    SA->>Platform: Create Merchant Account
    Platform->>M: Email with Login Credentials
    M->>Platform: Login & Choose Plan
    M->>Platform: Pay via Razorpay
    Platform->>SA: Subscription Revenue Received
    SA->>Platform: Monitor Analytics & Revenue
    SA->>Platform: Handle Support Tickets
```

---

## 🟠 PANEL 2: MERCHANT / ADMIN Panel (Store Owner)

Merchant woh insaan hai jo apna online store banata hai. **2 Types hote hain:**

---

### 🟢 TYPE A: SINGLE VENDOR MERCHANT

> **Single Vendor = Merchant khud hi seller hai.** Jaise ek brand apna own store chalata hai (e.g., Nike.com)

#### Single Vendor Merchant ke Roles & Features:

| Module | Features | Status |
|--------|----------|--------|
| **Store Setup** | Store name, logo, banner, description, contact info, social links, custom domain | ✅ Done |
| **Product Management** | Add/Edit/Delete products with images, variants, pricing, inventory, SKU, tags | ✅ Done |
| **Category Management** | Create categories, assign products | ✅ Done |
| **Order Management** | View orders, update status (Pending → Processing → Shipped → Delivered) | ⚠️ UI Only |
| **Customer Management** | View customers, their order history | ⚠️ UI Only |
| **Coupons & Discounts** | Create coupon codes, percentage/flat discounts, min order, expiry | ✅ Done |
| **Marketing** | Campaigns, automations, attribution tracking | ⚠️ UI Only |
| **Themes** | Store theme customize karna (colors, layout) | ⚠️ UI Only |
| **Pages** | Static pages (About, Contact, Privacy, Terms, Refund Policy) | ✅ Done |
| **Blog** | Blog posts likhna for SEO | ⚠️ UI Only |
| **Files** | Image/asset management | ⚠️ UI Only |
| **Analytics** | Store-level sales, orders, revenue charts | ⚠️ UI Only |
| **Profile** | Merchant profile update, password change | ✅ Done |
| **🆕 Delivery Setup** | Self-delivery OR Shiprocket integration choose karna | ❌ To Build |
| **🆕 Payment Setup** | Razorpay keys configure karna for customer payments | ❌ To Build |
| **🆕 Invoice Generation** | Auto-generate PDF invoices | ❌ To Build |

#### Single Vendor Dashboard Flow:

```mermaid
graph LR
    Login["Merchant Login"] --> Dashboard["Dashboard Overview"]
    Dashboard --> Products["Products"]
    Dashboard --> Orders["Orders"]
    Dashboard --> Customers["Customers"]
    Dashboard --> Marketing["Marketing"]
    Dashboard --> Discounts["Discounts & Coupons"]
    Dashboard --> Content["Content (Pages/Blog)"]
    Dashboard --> Analytics["Analytics"]
    Dashboard --> Settings["Store Settings"]
    
    Products --> AddProd["Add/Edit Products"]
    Products --> Categories["Manage Categories"]
    Products --> Inventory["Track Inventory"]
    
    Orders --> Process["Process Orders"]
    Orders --> Delivery["Manage Delivery"]
    
    Settings --> DeliverySetup["Delivery Config"]
    Settings --> PaymentSetup["Payment Config"]
    Settings --> ThemeSetup["Theme Config"]
```

---

### 🔵 TYPE B: MULTI VENDOR MERCHANT (Marketplace Owner)

> **Multi Vendor = Merchant ek marketplace chalata hai** jahan multiple sellers apne products sell karte hain (e.g., Amazon, Flipkart)

#### Multi Vendor Merchant ke EXTRA Roles (Single Vendor ke upar):

| Module | Features | Status |
|--------|----------|--------|
| **Vendor Management** | Add/Edit/Delete sub-vendors, approve vendor applications | ⚠️ UI Only |
| **Vendor Onboarding** | Vendor registration, KYC, bank details collection | ❌ To Build |
| **Commission Management** | Per-vendor ya per-category commission set karna | ❌ To Build |
| **Vendor Payouts** | Vendors ko unka revenue payout karna (minus commission) | ❌ To Build |
| **Product Approval** | Vendor ke products approve/reject karna | ❌ To Build |
| **Vendor Analytics** | Individual vendor performance tracking | ❌ To Build |
| **Revenue Split** | Order revenue automatically split karna (Vendor share + Commission) | ❌ To Build |
| **Vendor Dashboard** | Separate limited dashboard for sub-vendors | ❌ To Build |

#### Single Vendor vs Multi Vendor — Comparison:

| Feature | Single Vendor 🟢 | Multi Vendor 🔵 |
|---------|-----------------|-----------------|
| Who sells? | Merchant khud | Multiple Sub-Vendors |
| Product upload | Merchant karta hai | Vendors karte hain (Merchant approve karta hai) |
| Revenue | 100% merchant ka | Split: Vendor share + Merchant commission |
| Delivery | Merchant manage karta hai | Vendor ya Merchant — configurable |
| Store branding | One brand | Marketplace with vendor profiles |
| Dashboard | Single dashboard | Admin dashboard + Vendor sub-dashboards |
| Plan Cost | Lower (less features needed) | Higher (more features needed) |
| Customer sees | One seller | Multiple sellers/shops |
| Order routing | Direct to merchant | Auto-route to respective vendor |
| Payout | Not needed | Vendor payouts needed |

---

### 🟣 SUB-VENDOR Panel (Multi-Vendor Store mein)

> Sub-Vendor woh seller hai jo Multi-Vendor marketplace pe sell karta hai. Isko **limited access** milta hai.

#### Sub-Vendor ke Roles:

| Feature | Description |
|---------|-------------|
| **Registration** | Apply to sell on marketplace, submit KYC docs |
| **Product Management** | Apne products add/edit (marketplace admin approval needed) |
| **Order Management** | Sirf apne orders dekhna & process karna |
| **Inventory** | Apna stock manage karna |
| **Revenue Dashboard** | Apni earnings dekhna (after commission deduction) |
| **Delivery** | Apne orders ki delivery manage karna |
| **Profile** | Business profile, bank details, KYC update |
| **Support** | Marketplace admin ko support request bhejna |

#### Sub-Vendor **CANNOT** do:
- ❌ Other vendors ke products/orders dekhna
- ❌ Store theme/branding change karna
- ❌ Plans/subscription manage karna
- ❌ Customer data access karna (beyond their own orders)
- ❌ Marketplace settings change karna
- ❌ Discount codes create karna (only marketplace admin can)

---

## 💳 PAYMENT GATEWAY — Complete Flow

### Ye project mein **2 alag Razorpay integrations** chahiye:

---

### Payment Flow 1: Subscription Payment (Merchant → SuperAdmin)
> **Already Built ✅**

Jab merchant plan kharidta hai (Basic/Pro/Enterprise), tab Razorpay se pay karta hai.

```mermaid
sequenceDiagram
    participant M as Merchant
    participant FE as Frontend
    participant BE as Backend
    participant RP as Razorpay
    participant SA as SuperAdmin

    M->>FE: Select Plan & Click Subscribe
    FE->>BE: POST /api/payments/create-order {planId}
    BE->>RP: razorpay.orders.create()
    RP-->>BE: Order ID + Amount
    BE-->>FE: Order details + Razorpay Key
    FE->>RP: Open Razorpay Checkout Modal
    M->>RP: Pay via Card/UPI/NetBanking
    RP-->>FE: Payment Success (razorpay_payment_id, razorpay_signature)
    FE->>BE: POST /api/payments/verify {payment details}
    BE->>BE: Verify Signature (HMAC SHA256)
    BE->>BE: Create Subscription Record
    BE->>BE: Create Store (if new)
    BE-->>FE: Success Response
    Note over SA: Revenue appears in SuperAdmin Analytics
```

**Files Involved:**
- [paymentController.js](file:///d:/Github/Shopify_Clone/backend/src/Controllers/paymentController.js) — Order creation & verification
- [Subscription.js](file:///d:/Github/Shopify_Clone/backend/src/Models/Subscription.js) — Subscription model
- [Plan.js](file:///d:/Github/Shopify_Clone/backend/src/Models/Plan.js) — Plan pricing

---

### Payment Flow 2: Customer Checkout Payment (Customer → Merchant) 
> **❌ To Build**

Jab end customer store pe product kharidta hai.

```mermaid
sequenceDiagram
    participant C as Customer
    participant SF as Storefront
    participant BE as Backend
    participant RP as Razorpay
    participant M as Merchant
    participant V as Vendor (Multi-Vendor only)

    C->>SF: Add to Cart → Checkout
    SF->>BE: POST /api/checkout/create-order {items, address, coupon}
    BE->>BE: Validate stock, apply coupon, calculate total
    BE->>RP: razorpay.orders.create() [Merchant's Razorpay Keys]
    RP-->>BE: Order ID
    BE-->>SF: Order details
    SF->>RP: Razorpay Checkout Modal
    C->>RP: Pay
    RP-->>SF: Payment Success
    SF->>BE: POST /api/checkout/verify-payment
    BE->>BE: Verify Signature
    BE->>BE: Create Order record
    BE->>BE: Reduce stock
    BE->>BE: Split revenue (if Multi-Vendor)
    BE-->>M: Order notification
    BE-->>V: Order notification (if Multi-Vendor)
    BE-->>C: Order confirmation email
```

#### New Models Needed for Customer Checkout:

```
📁 Models/
├── Customer.js          — Customer auth (email, password, addresses)
├── Cart.js              — Shopping cart (items, quantities)
├── Order.js             — Order details (items, payment, status, delivery)
├── OrderItem.js         — Individual items in order (vendor-wise split)
├── Address.js           — Customer shipping/billing addresses
├── Review.js            — Product reviews & ratings
└── Transaction.js       — Payment transaction logs
```

#### Merchant Payment Configuration:
Har merchant apna Razorpay account connect karega:
- Merchant Settings → Payment Gateway → Enter Razorpay Key ID & Secret
- Store model mein `razorpayKeyId` aur `razorpayKeySecret` (encrypted) fields add honge
- Customer checkout pe merchant ke keys use honge

> [!IMPORTANT]
> **SuperAdmin ka Razorpay** = Subscription payments ke liye (merchant se platform fee lena)
> **Merchant ka Razorpay** = Customer checkout payments ke liye (customer se product payment lena)
> Ye **2 alag Razorpay accounts** honge!

---

## 🚚 DELIVERY SYSTEM — Complete Architecture

### Delivery ke **2 Options** honge:

---

### Option 1: Self-Delivery (Vendor khud deliver karta hai)

> Merchant/Vendor ke paas apni delivery team hai. Wo khud order pack karke deliver karta hai.

```mermaid
graph TD
    Order["📦 New Order Received"] --> SD{"Self-Delivery?"}
    SD -->|Yes| Pack["Merchant packs order"]
    Pack --> Assign["Assign delivery person"]
    Assign --> Pickup["Pickup from warehouse"]
    Pickup --> Transit["In Transit"]
    Transit --> Deliver["Delivered to Customer"]
    Deliver --> Confirm["Customer confirms delivery"]
```

#### Self-Delivery Features:

| Feature | Description |
|---------|-------------|
| **Delivery Zones** | Pin-code based delivery areas define karna |
| **Delivery Charges** | Distance/weight based delivery fee |
| **Delivery Staff** | Delivery boy add karna (name, phone, vehicle) |
| **Order Assignment** | Orders delivery staff ko assign karna |
| **Status Tracking** | Manual status updates (Packed → Shipped → Out for Delivery → Delivered) |
| **COD Support** | Cash on Delivery option |
| **Delivery Slots** | Time slot based delivery |

#### New Models for Self-Delivery:

```
📁 Models/
├── DeliveryZone.js      — Serviceable pin codes, delivery charges
├── DeliveryStaff.js     — Delivery personnel details
├── Shipment.js          — Shipment tracking (order-wise)
└── DeliveryConfig.js    — Store-level delivery settings
```

---

### Option 2: Shiprocket Integration (Third-Party Courier)

> Merchant third-party couriers (BlueDart, Delhivery, DTDC, etc.) use karta hai via **Shiprocket API**.

```mermaid
sequenceDiagram
    participant M as Merchant
    participant BE as Backend
    participant SR as Shiprocket API
    participant Courier as Courier Partner
    participant C as Customer

    M->>BE: "Ship this order"
    BE->>SR: POST /v1/external/orders/create/adhoc
    SR-->>BE: Shiprocket Order ID + AWB Number
    BE->>SR: POST /v1/external/courier/assign
    SR-->>BE: Courier assigned (e.g., BlueDart)
    SR->>Courier: Pickup scheduled
    Courier->>Courier: Pickup → In Transit → Delivered
    SR-->>BE: Webhook: Status updates
    BE-->>M: Dashboard updated
    BE-->>C: Email/SMS tracking updates
    
    Note over C: Customer can track via AWB number
```

#### Shiprocket Integration Steps:

| Step | API Endpoint | Description |
|------|-------------|-------------|
| 1. Auth | `POST /v1/external/auth/login` | Email + Password se token lena |
| 2. Create Order | `POST /v1/external/orders/create/adhoc` | Order details bhejne |
| 3. Get Rates | `POST /v1/external/courier/serviceability/` | Courier rates compare karna |
| 4. Assign Courier | `POST /v1/external/courier/assign` | Best courier select karna |
| 5. Generate Label | `POST /v1/external/courier/generate/label` | Shipping label download |
| 6. Track | `GET /v1/external/courier/track/awb/{awb}` | Live tracking |
| 7. Cancel | `POST /v1/external/orders/cancel` | Order cancel karna |
| 8. Webhooks | Shiprocket → Our Server | Auto status updates receive karna |

#### Shiprocket Config Model:

```javascript
// Store mein add hoga:
shiprocketConfig: {
    enabled: Boolean,
    email: String,          // Shiprocket login email
    password: String,       // Encrypted
    token: String,          // Auto-refreshed auth token
    defaultPickupLocation: String,
    autoAssignCourier: Boolean,
    preferredCouriers: [String]  // ["BlueDart", "Delhivery"]
}
```

#### Delivery Decision Flow:

```mermaid
graph TD
    Order["New Order"] --> Check{"Delivery Method?"}
    Check -->|Self-Delivery| Zone{"In Delivery Zone?"}
    Zone -->|Yes| SelfDeliver["Assign Delivery Staff"]
    Zone -->|No| Reject["Cannot deliver / Suggest Shiprocket"]
    
    Check -->|Shiprocket| Rates["Fetch Courier Rates"]
    Rates --> Compare["Show rates to merchant"]
    Compare --> Select["Merchant selects courier"]
    Select --> Ship["Create Shiprocket order"]
    Ship --> Track["Auto-track via webhooks"]
    
    Check -->|Both| Smart["Smart Routing"]
    Smart --> LocalCheck{"Local order?"}
    LocalCheck -->|Yes| SelfDeliver
    LocalCheck -->|No| Rates
```

> [!TIP]
> **Merchant Settings mein Delivery Configuration:**
> - "Self-Delivery Only" — Sirf local delivery
> - "Shiprocket Only" — Sirf courier partners
> - "Hybrid" — Local = Self, Outstation = Shiprocket

---

## 🌐 WEBSITE DEPLOYMENT — Complete Strategy

### Architecture Overview:

```mermaid
graph TB
    subgraph "Frontend (Vercel)"
        LandingPage["Storify Landing Page<br/>storify.com"]
        SuperAdminUI["SuperAdmin Dashboard<br/>storify.com/superadmin"]
        MerchantUI["Merchant Dashboard<br/>storify.com/dashboard"]
    end
    
    subgraph "Customer Storefronts (Vercel)"
        Store1["Store 1<br/>storename.storify.com<br/>OR<br/>storify.com/store/storename"]
        Store2["Store 2<br/>mybrand.com (Custom Domain)"]
    end
    
    subgraph "Backend (Railway/Render)"
        API["Express.js API Server<br/>api.storify.com"]
    end
    
    subgraph "Database (MongoDB Atlas)"
        DB["MongoDB Atlas<br/>Cloud Database"]
    end
    
    subgraph "Storage (Cloudinary)"
        CDN["Images & Assets<br/>CDN Delivery"]
    end
    
    subgraph "Third Party"
        RP["Razorpay"]
        SR["Shiprocket"]
        SMTP["Email (NodeMailer + SMTP)"]
    end
    
    LandingPage --> API
    SuperAdminUI --> API
    MerchantUI --> API
    Store1 --> API
    Store2 --> API
    API --> DB
    API --> CDN
    API --> RP
    API --> SR
    API --> SMTP
```

---

### Deployment Plan — Step by Step:

#### Step 1: Frontend Deployment (Vercel)

| Item | Detail |
|------|--------|
| **Platform** | Vercel (Free tier available) |
| **Framework** | Vite + React (already configured with [vercel.json](file:///d:/Github/Shopify_Clone/frontend/vercel.json)) |
| **Command** | `npm run build` → deploys `dist/` folder |
| **Environment Variables** | `VITE_API_URL=https://api.storify.com` |
| **Custom Domain** | `storify.com` → Vercel dashboard se connect |
| **Auto Deploy** | Git push → auto build & deploy |

#### Step 2: Backend Deployment (Railway OR Render)

| Item | Detail |
|------|--------|
| **Platform** | Railway (recommended) or Render |
| **Runtime** | Node.js 18+ |
| **Command** | `npm start` → runs `node src/server.js` |
| **Environment Variables** | See below |
| **Custom Domain** | `api.storify.com` |

**Required Environment Variables (.env):**

```env
# Server
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/storify

# JWT
JWT_SECRET=your-super-secret-key

# Razorpay (SuperAdmin - Subscription Payments)
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxx

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=email@gmail.com
SMTP_PASS=app-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=xxxxx
CLOUDINARY_API_KEY=xxxxx
CLOUDINARY_API_SECRET=xxxxx

# Shiprocket
SHIPROCKET_EMAIL=xxx@gmail.com
SHIPROCKET_PASSWORD=xxx

# Frontend URL (for CORS)
FRONTEND_URL=https://storify.com
```

#### Step 3: Database (MongoDB Atlas)

| Item | Detail |
|------|--------|
| **Platform** | MongoDB Atlas (Free M0 tier to start) |
| **Region** | Mumbai (ap-south-1) for low latency |
| **Scaling** | M0 (Free) → M10 → M30 as traffic grows |
| **Backup** | Enable daily automated backups |
| **Indexes** | Already configured in models |

#### Step 4: Customer Storefront Deployment

> [!IMPORTANT]
> **Customer Storefront = Woh website jo end customer dekhta hai (product pages, cart, checkout)**
> 
> Iske liye **2 approaches** hain:

**Approach A: Subdomain-based (Recommended)**
```
store-slug.storify.com
Example: nikes-store-k2f8g.storify.com
```
- Vercel pe wildcard subdomain configure karna (`*.storify.com`)
- Frontend mein dynamic routing: subdomain se store slug extract → API call → store data load

**Approach B: Path-based**
```
storify.com/store/store-slug
Example: storify.com/store/nikes-store-k2f8g
```
- Simple React routing
- No DNS configuration needed

**Approach C: Custom Domain (Premium feature)**
```
www.nikeshop.com → maps to store-slug.storify.com
```
- Merchant apna domain connect karta hai
- Vercel pe domain add karna → CNAME record merchant ko batana
- Premium plans mein available

---

### Deployment Workflow:

```mermaid
graph LR
    Dev["Local Development"] -->|git push| GH["GitHub"]
    GH -->|Auto Deploy| Vercel["Vercel (Frontend)"]
    GH -->|Auto Deploy| Railway["Railway (Backend)"]
    Railway --> Atlas["MongoDB Atlas"]
    Railway --> Cloudinary["Cloudinary (Images)"]
    
    Vercel --> Prod["🌐 Production<br/>storify.com"]
    Railway --> API["🔗 API<br/>api.storify.com"]
```

---

## 👤 CUSTOMER STOREFRONT — Complete Flow

> Ye woh website hai jo end customer dekhta hai (jaise Shopify ka store dekhne mein aata hai)

### Customer Journey:

```mermaid
graph TD
    Visit["Customer visits store URL"] --> Home["Store Homepage"]
    Home --> Browse["Browse Products / Categories"]
    Browse --> PDP["Product Detail Page"]
    PDP --> Cart["Add to Cart"]
    Cart --> Checkout["Checkout"]
    Checkout --> Auth{"Logged in?"}
    Auth -->|No| GuestOrLogin["Guest Checkout / Login / Signup"]
    Auth -->|Yes| Address["Select/Add Address"]
    GuestOrLogin --> Address
    Address --> Coupon["Apply Coupon (Optional)"]
    Coupon --> Payment["Select Payment Method"]
    Payment --> Razorpay["Pay via Razorpay"]
    Razorpay --> Success["Order Confirmed ✅"]
    Success --> Track["Track Order"]
    
    Home --> Pages["Static Pages (About, Contact, etc.)"]
    Home --> Search["Search Products"]
```

### Customer Storefront Pages Needed:

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Store homepage with featured products, banners |
| Products | `/products` | All products grid with filters |
| Product Detail | `/products/:slug` | Single product page with images, description, reviews |
| Category | `/category/:slug` | Category-wise product listing |
| Cart | `/cart` | Shopping cart with quantity update |
| Checkout | `/checkout` | Address + Payment |
| Order Confirmation | `/order/:id` | Order success page |
| Order Tracking | `/track/:id` | Delivery tracking |
| Account | `/account` | Customer profile, order history |
| Login/Signup | `/login`, `/signup` | Customer authentication |
| Pages | `/page/:slug` | Privacy, Terms, About, Contact |
| Search | `/search?q=` | Search results |

---

## 📊 Complete Data Model Architecture

```mermaid
erDiagram
    SUPERADMIN ||--o{ PLAN : creates
    SUPERADMIN ||--o{ MERCHANT : manages
    
    MERCHANT ||--o{ STORE : owns
    MERCHANT ||--o{ SUBSCRIPTION : has
    
    PLAN ||--o{ SUBSCRIPTION : referenced_in
    PLAN ||--o{ STORE : determines_type
    
    STORE ||--o{ PRODUCT : contains
    STORE ||--o{ CATEGORY : has
    STORE ||--o{ ORDER : receives
    STORE ||--o{ VENDOR : has_sub_vendors
    STORE ||--o{ COUPON : offers
    STORE ||--o{ STOREPAGE : has_pages
    
    VENDOR ||--o{ PRODUCT : uploads
    VENDOR ||--o{ ORDERITEM : fulfills
    
    CUSTOMER ||--o{ ORDER : places
    CUSTOMER ||--o{ ADDRESS : has
    CUSTOMER ||--o{ REVIEW : writes
    CUSTOMER ||--o{ CART : has
    
    ORDER ||--o{ ORDERITEM : contains
    ORDER ||--|| SHIPMENT : tracked_by
    ORDER ||--|| TRANSACTION : paid_via
    
    PRODUCT ||--o{ REVIEW : receives
    PRODUCT ||--|| CATEGORY : belongs_to
```

---

## 🛠️ Implementation Phases (Roadmap)

### Phase 1: Core Backend Completion (1-2 Weeks)

| Task | Priority | Files |
|------|----------|-------|
| Create Customer Model (auth, profile, addresses) | 🔴 High | `Models/Customer.js`, `Models/Address.js` |
| Create Order Model & Controller | 🔴 High | `Models/Order.js`, `Models/OrderItem.js`, `Controllers/orderController.js` |
| Create Cart Model & Controller | 🔴 High | `Models/Cart.js`, `Controllers/cartController.js` |
| Customer Authentication (JWT) | 🔴 High | `Controllers/customerAuthController.js`, `Helpers/customerAuthMiddleware.js` |
| Customer Checkout + Razorpay | 🔴 High | `Controllers/checkoutController.js` |
| Review & Rating System | 🟡 Medium | `Models/Review.js`, `Controllers/reviewController.js` |
| Transaction/Payment Logs | 🟡 Medium | `Models/Transaction.js` |

---

### Phase 2: Customer Storefront (2-3 Weeks)

| Task | Priority |
|------|----------|
| Store Homepage (dynamic based on store slug) | 🔴 High |
| Product Listing Page (with filters, search, sort) | 🔴 High |
| Product Detail Page (images gallery, add to cart) | 🔴 High |
| Shopping Cart | 🔴 High |
| Checkout Flow (address, coupon, payment) | 🔴 High |
| Customer Auth Pages (Login, Signup, Forgot Password) | 🔴 High |
| Order Confirmation & History | 🟡 Medium |
| Search Functionality | 🟡 Medium |
| Product Reviews UI | 🟡 Medium |
| Responsive Design (Mobile-first) | 🔴 High |

---

### Phase 3: Delivery System (1-2 Weeks)

| Task | Priority |
|------|----------|
| Self-Delivery: Delivery Zone & Staff models | 🟡 Medium |
| Self-Delivery: Order assignment & status tracking | 🟡 Medium |
| Shiprocket API Integration (auth, create order, track) | 🟡 Medium |
| Shiprocket Webhook Handler (auto status updates) | 🟡 Medium |
| Delivery Settings Page in Merchant Dashboard | 🟡 Medium |
| Customer Order Tracking Page | 🟡 Medium |

---

### Phase 4: Multi-Vendor System (2-3 Weeks)

| Task | Priority |
|------|----------|
| Vendor Model & Registration | 🟡 Medium |
| Vendor Authentication & Dashboard | 🟡 Medium |
| Product Approval Workflow | 🟡 Medium |
| Commission System (per-vendor, per-category) | 🟡 Medium |
| Revenue Split Logic (auto on order completion) | 🟡 Medium |
| Vendor Payout System | 🟢 Low |
| Vendor KYC Verification | 🟢 Low |

---

### Phase 5: Deployment & Launch (1 Week)

| Task | Priority |
|------|----------|
| MongoDB Atlas setup & migration | 🔴 High |
| Backend deploy to Railway | 🔴 High |
| Frontend deploy to Vercel | 🔴 High |
| Domain & SSL configuration | 🔴 High |
| Cloudinary for production images | 🔴 High |
| Customer storefront subdomain routing | 🟡 Medium |
| Performance optimization | 🟡 Medium |
| Security audit (CORS, rate limiting, input validation) | 🔴 High |

---

### Phase 6: Polish & Advanced Features (Ongoing)

| Task | Priority |
|------|----------|
| Email notifications (order updates, delivery updates) | 🟡 Medium |
| SMS notifications (OTP, delivery) | 🟢 Low |
| SEO optimization (meta tags, sitemap, structured data) | 🟡 Medium |
| PWA support (installable web app) | 🟢 Low |
| Analytics (Google Analytics integration) | 🟢 Low |
| Invoice PDF generation | 🟡 Medium |
| Inventory alerts (low stock notifications) | 🟢 Low |
| Wishlist feature | 🟢 Low |
| Product comparison | 🟢 Low |

---

## Open Questions

> [!IMPORTANT]
> **Ye questions ka answer chahiye before implementation start karne se:**

1. **Customer Storefront Architecture**: Storefront ko ek separate frontend app banana hai ya current Vite app mein hi integrate karna hai?
   - Option A: Same app mein route-based (`/store/:slug/...`)
   - Option B: Alag Vite/Next.js app (better for SEO with SSR)

2. **Shiprocket Account**: Kya Shiprocket test/sandbox account hai? API keys hain?

3. **Custom Domain**: Kya merchants ko custom domain support dena hai (Phase 1 mein ya baad mein)?

4. **Multi-Vendor Priority**: Multi-vendor features Phase 1 mein chahiye ya baad mein?

5. **Mobile App**: Sirf web ya React Native mobile app bhi plan mein hai?

6. **Real-time Features**: Order status ke liye WebSocket/Socket.io chahiye ya polling se kaam chalega?

7. **Screenshot Reference**: Aapne Shopify Hierarchy ka screenshot mention kiya hai — kya wo attach ho gaya hai? Agar nahi toh please share karein.

---

## Verification Plan

### Automated Tests
- API endpoint testing (Postman/Thunder Client collections)
- Payment flow testing with Razorpay test mode
- Shiprocket sandbox API testing

### Manual Verification
- End-to-end user journey: Signup → Plan Purchase → Store Setup → Add Products → Customer Purchase → Delivery
- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile responsiveness testing
- Payment gateway testing with test cards
