# MERN Performance Optimization for Mynzo (WebView Native Feel)

Tumhare codebase ko analyse karne ke baad, main ye MERN-side optimizations propose kar raha hoon jo Flutter WebView me app ko native jaisi smooth feel denge.

## Current State Analysis

**Achha kya hai already:**
- ✅ Code splitting via `React.lazy()` — sab pages lazy-loaded hain
- ✅ `OptimizedImage` component with lazy loading + fallback
- ✅ `cachedFetch` utility with in-memory + sessionStorage cache
- ✅ Backend already uses `compression()` middleware + `helmet()`
- ✅ Product model me indexes lagaye hue hain
- ✅ Backend uploads pe 7-day cache headers set hain
- ✅ `ProductCard` is `memo()`-ized

**Kya fix karna hai (Problems found):**

| # | Problem | Impact |
|---|---------|--------|
| 1 | Homepage pe **5 parallel API calls** (chips, banners, products, top-buys, trending-brands) | Slow initial load, high TTFB |
| 2 | `getProducts` returns **ALL approved products** at once — no pagination | Massive payload, long parse time |
| 3 | 3 Google Fonts loading (Nunito + Plus Jakarta Sans + Syne) — **only Nunito used** | Render-blocking, extra 150KB+ |
| 4 | No combined homepage API — **4 separate backend hits** needed | N+1 network round trips |
| 5 | `getTopBuys` returns **full product objects** (no projection) | Oversized JSON payloads |
| 6 | `normaliseProduct()` called repeatedly on every render — **no memoization** | Wasted CPU on re-renders |
| 7 | No Vite chunk splitting config — single vendor bundle | Large initial JS download |
| 8 | `ProductCard` memo comparison only checks `product.id`, ignores wishlist changes | Stale UI after wishlist toggle |
| 9 | No `prefetchCritical()` called on app boot | Cache cold on first visit |
| 10 | Splash video is `.mp4` in public — **not preloaded, no size optimization** | Slow splash, blocks rendering |
| 11 | Banner auto-slide creates new `setInterval` without proper cleanup on mount | Potential memory leaks |
| 12 | `console.log` statements throughout production code | Performance drag in WebView |

---

## Proposed Changes

### Phase 1: Backend API Optimization (Critical — biggest impact)

---

#### [NEW] Combined Homepage API endpoint
**File:** [homepageRoutes.js](file:///d:/Github/Mynzo/Backend/Router/homepageRoutes.js)

Create a **single `/homepage` API** that returns everything the homepage needs in 1 request:
```
GET /homepage → { banners, chips, subchips, products, topBuys, trendingBrands }
```
This replaces the current 5 separate API calls with 1, cutting network round-trips by 80%.

#### [MODIFY] [productController.js](file:///d:/Github/Mynzo/Backend/Controllers/productController.js)

- Add a `getHomepageData()` controller that runs **all 5 queries in `Promise.all()`** with proper MongoDB projections
- Add `limit` + `skip` pagination to `getProducts()` for category browsing
- Add `.select()` projection to `getTopBuys()` — return only the fields the UI needs
- Add compound index `{ status: 1, sales: -1 }` for top-buys query optimization

#### [MODIFY] [Product.js](file:///d:/Github/Mynzo/Backend/Models/Product.js)

Add compound indexes:
```js
productSchema.index({ status: 1, sales: -1 });       // top-buys
productSchema.index({ status: 1, 'flags.crazyDeals': 1 }); // crazy deals filter
productSchema.index({ status: 1, 'flags.flashSale': 1 });  // flash sale filter
```

#### [MODIFY] [app.js](file:///d:/Github/Mynzo/Backend/app.js)

Register the new `/homepage` route.

---

### Phase 2: Frontend API & Data Optimization (High Impact)

---

#### [MODIFY] [Home.jsx](file:///d:/Github/Mynzo/Frontend/src/pages/Home.jsx)

- Replace 5 separate `cachedFetch()` calls with **single `/homepage`** call
- Wrap `normaliseProduct` calls in `useMemo()` to avoid re-computation on every render
- Wrap `getFilteredCategoryProducts`, `getHomeFilteredDeals`, `getFlashFilteredDeals` in `useMemo()`
- Remove unused `TOP_10_BUYS`, `TRENDING_BRANDS`, `BEAUTY_SUB_CATEGORIES` constants (dead code)
- Implement **lazy rendering of sections** — only mount sections after they scroll into view using `IntersectionObserver`

#### [MODIFY] [AppContext.jsx](file:///d:/Github/Mynzo/Frontend/src/context/AppContext.jsx)

- Remove excessive `console.log('🔌...')` statements from production code (keep only errors)
- Memoize `mapCartItems` with `useCallback`
- Memoize context value with `useMemo` to prevent unnecessary re-renders of entire tree

#### [MODIFY] [apiCache.js](file:///d:/Github/Mynzo/Frontend/src/utils/apiCache.js)

- Call `prefetchCritical()` on app boot from `main.jsx`
- Add the new `/homepage` endpoint to prefetch list
- Remove `console.log` for API base URL

---

### Phase 3: Bundle Size & Font Optimization (Medium Impact)

---

#### [MODIFY] [index.html](file:///d:/Github/Mynzo/Frontend/index.html)

- Remove **Plus Jakarta Sans** and **Syne** fonts — only Nunito is used globally (`* { font-family: 'Nunito'... }`)
- This saves ~150-200KB of font downloads and eliminates 2 render-blocking requests
- Add `font-display: swap` preconnect hints
- Remove the hardcoded `dns-prefetch` to `localhost:5000` (useless in production)

#### [MODIFY] [vite.config.js](file:///d:/Github/Mynzo/Frontend/vite.config.js)

Add proper chunk splitting configuration:
```js
build: {
  target: 'es2015',
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react': ['react', 'react-dom', 'react-router-dom'],
        'vendor-ui': ['framer-motion', 'lucide-react'],
        'vendor-firebase': ['firebase/app', 'firebase/messaging'],
      }
    }
  }
}
```
This splits the vendor bundle so React core loads first and heavy libs like Firebase/Framer load on demand.

---

### Phase 4: Component-Level Performance (Medium Impact)

---

#### [NEW] [LazySection.jsx](file:///d:/Github/Mynzo/Frontend/src/components/ui/LazySection.jsx)

A lightweight `IntersectionObserver`-based wrapper that only renders children when scrolled into view. This means:
- Banner loads immediately
- Crazy Deals loads when scrolled to
- Flash Sale, Top 10, Trending Brands load even later

This is **virtual rendering for sections** — the biggest performance win for homepage scroll.

#### [MODIFY] [ProductCard.jsx](file:///d:/Github/Mynzo/Frontend/src/components/ui/ProductCard.jsx)

- Fix the `memo` comparison to also check `isInWishlist` state
- Remove unused `bestPrice`, `getProductBrand`, `getBadgeText` functions (dead code)

#### [MODIFY] [OptimizedImage.jsx](file:///d:/Github/Mynzo/Frontend/src/components/ui/OptimizedImage.jsx)

- Add `srcSet` / `sizes` support for responsive images (serve smaller images on mobile WebView)
- Add `fetchpriority="low"` for below-fold images

---

### Phase 5: Prefetching & Cache Warm-up

---

#### [MODIFY] [main.jsx](file:///d:/Github/Mynzo/Frontend/src/main.jsx)

- Call `prefetchCritical()` immediately before React renders — so API data is in cache by the time Home.jsx mounts
- This means the homepage loads from cache (instant) while background sync refreshes data

---

## Summary of Impact

| Optimization | Before | After | Impact |
|---|---|---|---|
| Homepage API calls | 5 requests | 1 request | **~400ms saved** |
| Font downloads | 3 families (~250KB) | 1 family (~80KB) | **~170KB saved** |
| Vendor bundle | 1 chunk (all libs) | 3 chunks (split) | **Faster initial paint** |
| Product payload | Full objects (all fields) | Projected (needed fields only) | **~40% smaller JSON** |
| Section rendering | All at once | IntersectionObserver lazy | **60% less DOM at load** |
| Re-renders | Unmemoized computed data | `useMemo`/`useCallback` | **Fewer re-renders** |
| Console logs | ~15 in production | 0 in hot paths | **Less GC pressure** |
| Cache warm-up | On demand | Prefetch at boot | **Instant homepage** |

> [!IMPORTANT]
> **Total estimated improvement:** Homepage load time should drop from ~2-3s to under 800ms on a mid-range phone WebView, making it feel significantly more native.

---

## Open Questions

> [!IMPORTANT]
> 1. **Kya tumhare paas CDN (Cloudflare/BunnyCDN) already configured hai images ke liye?** Agar nahi, to ye Phase 6 me add kar sakte hain — but requires server config changes outside this codebase.

> [!IMPORTANT]
> 2. **Product images ka average size kitna hai currently?** Agar 1MB+ hain, to backend me `sharp` (already installed) se automatic WebP thumbnails generate karne ka system bana sakte hain — but that's a separate phase.

> [!IMPORTANT]
> 3. **Category browsing me pagination chahiye?** Currently `getProducts` returns ALL approved products at once. I recommend adding `?page=1&limit=20` pagination — but this will change how the category filter UI works on the homepage.

---

## Verification Plan

### Automated Tests
```bash
# Build should succeed with no errors
cd d:\Github\Mynzo\Frontend && npm run build

# Check bundle sizes (should be < 700KB initial)
# Vite build output will show chunk sizes
```

### Manual Verification
- Test homepage load time in Chrome DevTools with throttling (Slow 3G)
- Verify all sections still render correctly
- Test the `/homepage` combined API returns correct data
- Verify font rendering looks correct with only Nunito
- Test WebView in Flutter to confirm improvement
