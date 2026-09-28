# ShopHub

Mid-level E-Commerce web application built as a modular microservices system for learning/portfolio purposes. Not production-grade distributed infrastructure (no Kubernetes, no service mesh, no message broker).

## Architecture

```
/frontend                  React + Vite + React Router + Axios + Tailwind
/services
  /gateway                 API gateway (single public entry point, CORS, rate limit, admin stats)
  /auth-service            Register/login, bcrypt, JWT, /verify-token      (Users)
  /product-service         Products CRUD, filter, search, pagination, reviews (Products, Reviews)
  /cart-service            Cart CRUD per user, validates via Product Service  (Cart)
  /order-service           Checkout, order history, status updates            (Orders, Order_Items)
/docker-compose.yml        Runs MongoDB + all services + gateway + frontend
```

Each service owns its own MongoDB database and is independently runnable. Services communicate over plain REST/HTTP. JWT is verified with a shared secret (`JWT_SECRET`) — no round-trip to Auth Service on every request.

## Quick start (Docker)

```bash
cp .env.example .env        # then edit JWT_SECRET
docker compose up --build
```

- Frontend: http://localhost:5173
- Gateway API: http://localhost:4000

## Local development (without Docker)

Requires Node 18+ and a local MongoDB on `mongodb://localhost:27017`.

```bash
npm run install:all
# run MongoDB, then in separate terminals:
npm run dev:auth
npm run dev:product
npm run dev:cart
npm run dev:order
npm run dev:gateway
npm run dev:frontend
```

Each service reads its own `.env` (see `.env.example` in each service folder). `JWT_SECRET` must match across all services and the gateway.

## Ports

| Service          | Port |
|------------------|------|
| Frontend (Vite)  | 5173 |
| Gateway          | 4000 |
| Auth Service     | 4001 |
| Product Service  | 4002 |
| Cart Service     | 4003 |
| Order Service    | 4004 |
| MongoDB          | 27017 |

## Default admin

On first start, Auth Service seeds an admin user:
- email: `admin@shophub.com`
- password: `admin12345`

## Scope

Customer: register/login, product listing + pagination, product detail, category filter + search, cart, checkout (mock payment), order history, product reviews/ratings.

Admin: login (role check), product CRUD, order list + status updates (Pending/Shipped/Delivered), dashboard stats (aggregated across services).

Out of scope: real payment gateway, multi-vendor/marketplace, Kubernetes/service mesh/service discovery, message brokers/event-driven architecture, advanced analytics/recommendation engine.