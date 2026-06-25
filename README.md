# Boutique — Fashion E-Commerce Platform

<div align="center">

[![Live Demo](https://img.shields.io/badge/🛍️_Live_Demo-Visit_Boutique-FF6B9D?style=for-the-badge&logoColor=white)](https://boutique-ecommerce-website-five.vercel.app/)

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DD0031?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=stripe&logoColor=white)

</div>

---

Full-stack monorepo fashion e-commerce platform with AI-powered search, real-time chat, Stripe payments, and a full admin dashboard.

---

## 🚀 Quick Start (Development)

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

## 🏗️ Production Deploy

```bash
cp .env.example .env   # fill all production values
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

---

## ✨ Key Features

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

## 📁 Project Structure
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

│       └── modules/

│           ├── auth/           ← Register, login, JWT refresh

│           ├── products/       ← CRUD, variants, images, AI search

│           ├── orders/         ← Cart (Redis) + order pipeline

│           ├── payments/       ← Stripe intents + webhook

│           ├── reviews/        ← Ratings, verified purchase

│           ├── wishlist/       ← Save products

│           ├── discounts/      ← Promo codes

│           ├── chat/           ← Support chat REST

│           └── analytics/      ← Revenue, top products

│

└── frontend/                   ← React + Vite

└── src/

├── pages/

│   ├── Home.jsx

│   ├── ProductList.jsx

│   ├── Checkout.jsx    ← Stripe Elements

│   ├── Chat.jsx        ← Socket.IO

│   └── admin/

│       ├── Dashboard.jsx

│       ├── Analytics.jsx

│       └── ...

└── store/              ← Zustand (auth, cart)

---

## 🔌 API Reference

| Module | Endpoints |
|---|---|
| Auth | `POST /api/auth/register,login,refresh,logout` |
| Users | `GET/PUT /api/users/me` |
| Products | `GET /api/products`, `/api/products/search` |
| Cart | `GET/POST/PUT/DELETE /api/orders/cart/*` |
| Orders | `GET/POST /api/orders` |
| Payments | `POST /api/payments/create-intent`, webhook |
| Reviews | `GET/POST /api/reviews/product/:id` |
| Wishlist | `GET/POST/DELETE /api/wishlist/:productId` |
| Discounts | `POST /api/discounts/apply` |
| Chat | `GET/POST /api/chat/rooms` |
| Analytics | `GET /api/analytics/overview,revenue,top-products` |

---

<div align="center">
  Made with ❤️ by <a href="https://boutique-ecommerce-website-five.vercel.app/">Natnael Abebe</a>
</div>
