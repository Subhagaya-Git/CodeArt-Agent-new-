# VERIFICATION REPORT — ShopHub Microservices Baseline

**Date:** 2026-09-28
**Commit:** `256a47a` "First prompt: initial commit"
**Method:** Static review of all 33 backend source files + 23 frontend files across 5 services + gateway.

## Stack verified

- 5 Express services (ESM): gateway (4000), auth (4001), product (4002), cart (4003), order (4004)
- Frontend: React 18 + Vite 5 + React Router 6 + Tailwind 3 + Axios
- MongoDB via Mongoose 8 (standalone, no replica set)
- JWT shared-secret verification across services
- Docker Compose for orchestration

## Test coverage

- Backend tests: **0** (no test framework installed)
- Frontend tests: **0**
- This is the single largest gap vs. the prompt's baseline (which assumes 24 backend tests).

## Critical findings (reproductions)

### C-2: Stock never decremented
```
File: services/order-service/src/controllers/orderController.js
Lines 30-52: checkout loops through cart items, checks stock, creates order, clears cart.
NO call to decrement stock. No decrement endpoint exists in product-service.
```
Reproduction: Create a product with stock:1. Place 10 orders. All 10 succeed. Stock remains 1.

### C-4: Cross-service transaction impossible
```
Checkout touches 3 separate MongoDB databases:
  - cart_db (cart-service) — read cart, clear cart
  - product_db (product-service) — check stock
  - order_db (order-service) — create order
MongoDB transactions are scoped to a single session on a single database.
A transaction cannot span 3 databases across 3 services.
```
This makes the prompt's §4.3 mandate ("all money moves inside a transaction")
architecturally impossible without consolidating the services.

### H-1: Regex injection
```
GET /api/products?search=(
→ productController.js:23: $regex: "(" → MongoServerError: Invalid regular expression
→ 500 returned to anonymous visitor
```

### H-2: Mass assignment
```
PUT /api/products/:id  (admin)
Body: { "name": "x", "price": 1, "stock": 1, "category": "x", "reviews": [{...}] }
→ productController.js:81: findByIdAndUpdate(id, req.body)
→ reviews array overwritten with attacker-controlled data
```

## Summary

| Severity | Count |
|---|---|
| Critical | 5 (C-1, C-2, C-4, C-5, + V-6 partial) |
| High | 6 |
| Medium | 10 |
| Low | 8 |
| **Total** | **29** |

The codebase is functional for a demo but has data-integrity defects (C-2, C-4) that make it
unsuitable for production. The microservices split is the root cause of C-4 and must be resolved
before transactional checkout can be implemented.