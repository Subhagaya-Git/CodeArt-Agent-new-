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

## Prerequisites

- **Docker** 20.10+ with the Compose v2 plugin (`docker compose version` should print a version)
- That's it for the Docker path. For local dev without Docker: **Node 18+** and a local MongoDB on `mongodb://localhost:27017`.

## Quick start (Docker) — standalone, no CodeArts or extra tooling required

```bash
# 1. Clone the repo
git clone <your-remote-url> shophub
cd shophub

# 2. Create your env file and set a real JWT secret
cp .env.example .env
#    Edit .env and replace JWT_SECRET with a long random string, e.g.:
#    node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# 3. Build and start every service + MongoDB + Redis + frontend
docker compose up --build

# 4. Stop everything (leaves data intact)
docker compose down

#    Reset the database too:
docker compose down -v
```

Once all containers report `healthy`, open:

- **Frontend:** http://localhost:5173
- **Gateway API:** http://localhost:4000
- **MongoDB:** localhost:27017 (replica set `rs0`)
- **Redis:** localhost:6379

The stack is fully self-contained: MongoDB, Redis, all five services, and the
frontend all run inside containers. No host-side Node or MongoDB is required.

## Default admin (seeded on first start)

On first start, Auth Service seeds an admin user if one does not yet exist:

| Field   | Value                |
|---------|----------------------|
| email   | `admin@shophub.com`  |
| password| `admin12345`         |
| role    | `admin`              |

Log in at http://localhost:5173/login to access the admin dashboard, product
CRUD, and order management. **Change this password in any non-demo deployment.**

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

Each service reads its own `.env` (see `.env.example` in each service folder —
copy to `.env` and edit). `JWT_SECRET` must match across all services and the
gateway. The frontend reads `VITE_API_URL` from `frontend/.env`.

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


## Scope

Customer: register/login, product listing + pagination, product detail, category filter + search, cart, checkout (mock payment), order history, product reviews/ratings.

Admin: login (role check), product CRUD, order list + status updates (Pending/Shipped/Delivered), dashboard stats (aggregated across services).

Out of scope: real payment gateway, multi-vendor/marketplace, Kubernetes/service mesh/service discovery, message brokers/event-driven architecture, advanced analytics/recommendation engine.