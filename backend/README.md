# Storify Backend

REST API for the Storify Shopify-like multi-tenant e-commerce platform.

## Stack

- **Express** (ESM) — HTTP server
- **MongoDB / Mongoose** — primary datastore
- **JWT** (access + refresh, cookie-based) — auth
- **Cloudinary + Multer** — image / file storage
- **Helmet, CORS, rate limiter, mongo-sanitize** — security
- **Morgan** — request logging
- **Nodemon** — dev hot-reload

> No Redis is used. Caching/queues can be added later if needed.

## Folder structure

```
backend/
├── src/
│   ├── config/          # env, db, cloudinary
│   ├── controllers/     # route handlers (one per resource)
│   ├── middleware/      # auth, errors, upload, rate limit, store context
│   ├── models/          # mongoose schemas
│   ├── routes/          # express routers (mounted in routes/index.js)
│   ├── services/        # reserved for cross-controller business logic
│   ├── utils/           # ApiError, ApiResponse, asyncHandler, token, pagination, seed
│   ├── validators/      # reserved for request validation
│   ├── app.js           # express app (no listen)
│   └── server.js        # boot + db connect + signal handling
├── .env.example
├── .gitignore
├── nodemon.json
└── package.json
```

## Setup

```bash
cd backend
npm install
cp .env.example .env   # then fill in MONGO_URI, JWT_*, CLOUDINARY_*
npm run seed           # creates default plans + master admin
npm run dev
```

Server: `http://localhost:5000/api/v1`
Health: `GET /api/v1/health`

Default master admin (after seeding): `admin@storify.local` / `admin12345`

## Auth flow

1. `POST /auth/signup` — body `{ name, email, password }` → sets `accessToken` + `refreshToken` httpOnly cookies.
2. `POST /auth/login` — same.
3. `GET /auth/me` — current user (requires cookie or `Authorization: Bearer <token>`).
4. `POST /auth/refresh` — rotates refresh token, issues new pair.
5. `POST /auth/logout` — invalidates refresh token and clears cookies.

## Resource routes

All store-scoped routes use either `/stores/:storeId/...` or an `x-store-id` header.

| Resource | Path |
|---|---|
| Auth | `/api/v1/auth/*` |
| Users (self) | `/api/v1/users/me`, `/me/password`, `/me/avatar` |
| Stores | `/api/v1/stores`, `/:storeId`, `/:storeId/logo` |
| Products | `/api/v1/stores/:storeId/products` |
| Categories | `/api/v1/stores/:storeId/categories` |
| Customers | `/api/v1/stores/:storeId/customers` |
| Orders | `/api/v1/stores/:storeId/orders` |
| Plans (public) | `/api/v1/plans`, `/plans/:slug` |
| Subscribe | `POST /api/v1/plans/subscribe` |
| Master admin | `/api/v1/admin/*` (requires `master_admin` role) |
| Uploads | `/api/v1/uploads/single`, `/multiple`, `/:id` |
| Public storefront | `/api/v1/public/stores/:slug`, `/products`, `/announcements` |

## Uploads

Multer pipes directly into Cloudinary via `multer-storage-cloudinary`. Single image fields use `upload.single('field')`; product galleries use `upload.array('images', 8)`. Max file size is configured by `UPLOAD_MAX_FILE_SIZE_MB`.

## Error format

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "Invalid email" }]
}
```

## Success format

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 87, "totalPages": 5 }
}
```
