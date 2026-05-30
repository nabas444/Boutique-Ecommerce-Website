# Boutique — Fashion E-Commerce Platform

Full-stack monorepo: **React + TypeScript/Express + PostgreSQL + Redis + Docker**

---

## Quick Start (Development)

```bash
# 1. Clone and set up environment
cp .env.example .env
# Edit .env — add your Stripe, OpenAI, Cloudinary, SMTP keys

# 2. Start all services
docker compose up -d

# 3. Run DB migrations + seed
docker compose exec backend npx prisma migrate dev --name init
docker compose exec backend npm run db:seed

# 4. Open the app
open http://localhost:5173
```

### Default accounts (after seed)

| Role     | Email                    | Password        |
|----------|--------------------------|-----------------|
| Admin    | admin@boutique.com       | Admin@1234      |
| Customer | customer@example.com     | Customer@1234   |

---

## Production Deploy

```bash
cp .env.example .env   # fill all production values
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

---

## Project Structure

```
boutique/
├── docker-compose.yml          ← Dev (hot reload)
├── docker-compose.prod.yml     ← Production (built images)
├── .env.example                ← All required env vars
├── nginx/
│   └── nginx.conf              ← Reverse proxy config
├── .github/
│   └── workflows/ci.yml        ← GitHub Actions CI
│
├── backend/                    ← TypeScript Express API
│   ├── prisma/
│   │   ├── schema.prisma       ← 14-table DB schema
│   │   └── seed.ts             ← Sample data seeder
│   └── src/
│       ├── app.ts              ← Express entry point
│       ├── config/             ← DB, Redis, Stripe
│       ├── middleware/         ← Auth, errors, rate limit, upload
│       ├── modules/
│       │   ├── auth/           ← Register, login, JWT refresh
│       │   ├── products/       ← CRUD, variants, images, AI search
│       │   ├── orders/         ← Cart (Redis) + order pipeline
│       │   ├── payments/       ← Stripe intents + webhook
│       │   ├── reviews/        ← Ratings, verified purchase
│       │   ├── wishlist/       ← Save products
│       │   ├── discounts/      ← Promo codes
│       │   ├── chat/           ← Support chat REST
│       │   └── analytics/      ← Revenue, top products
│       ├── sockets/            ← Socket.IO real-time chat
│       └── utils/              ← JWT, slug, email
│
└── frontend/                   ← React + Vite
    └── src/
        ├── App.jsx             ← Routes (public + auth-gated)
        ├── api/client.js       ← Axios + auto token refresh
        ├── store/              ← Zustand (auth, cart)
        ├── hooks/              ← useAuth, useCart, useChat
        ├── components/
        │   ├── ui/             ← MainLayout, AdminLayout
        │   └── product/        ← ProductCard
        └── pages/
            ├── Home.jsx
            ├── ProductList.jsx ← Filters, AI search, pagination
            ├── ProductDetail.jsx
            ├── Login.jsx / Register.jsx
            ├── Cart.jsx
            ├── Checkout.jsx    ← Stripe Elements
            ├── Orders.jsx / OrderDetail.jsx
            ├── Wishlist.jsx
            ├── Chat.jsx        ← Socket.IO customer chat
            ├── Profile.jsx
            └── admin/
                ├── Dashboard.jsx   ← Revenue charts
                ├── Products.jsx    ← CRUD with image upload
                ├── Orders.jsx      ← Status management
                ├── Discounts.jsx   ← Promo code manager
                ├── Chat.jsx        ← All customer chats
                └── Analytics.jsx   ← Charts + top products
```

---

## Key Features

| Feature | Stack |
|---|---|
| Auth | JWT access + refresh token rotation, bcrypt |
| Public browsing | No login required to view products |
| AI search | OpenAI embeddings + pgvector semantic search |
| Real-time chat | Socket.IO buyer ↔ admin with typing indicators |
| Payments | Stripe Payment Intents + webhook confirmation |
| Image upload | Multer → Sharp resize → Cloudinary CDN |
| Emails | Nodemailer — welcome, order confirm, shipping |
| Cart | Redis-backed, persists 7 days |
| Discounts | Percent/fixed, expiry, usage limits |
| Analytics | Revenue charts, top products, order status pie |
| Docker | Dev hot-reload + production multi-stage builds |
| CI | GitHub Actions — lint, type-check, integration tests |

---

## API Reference

| Module | Base path |
|---|---|
| Auth | `POST /api/auth/register,login,refresh,logout` |
| Users | `GET/PUT /api/users/me`, addresses |
| Products | `GET /api/products`, `/api/products/search` |
| Categories | `GET /api/categories` |
| Cart | `GET/POST/PUT/DELETE /api/orders/cart/*` |
| Orders | `GET/POST /api/orders`, status update |
| Payments | `POST /api/payments/create-intent`, webhook |
| Reviews | `GET/POST /api/reviews/product/:id` |
| Wishlist | `GET/POST/DELETE /api/wishlist/:productId` |
| Discounts | `POST /api/discounts/apply`, admin CRUD |
| Chat | `GET/POST /api/chat/rooms`, messages |
| Analytics | `GET /api/analytics/overview,revenue,top-products` |
