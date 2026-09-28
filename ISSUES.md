# ISSUES — ShopHub Microservices Baseline Audit

Audited 2026-09-28 against the microservices codebase (commit `256a47a`).
This is a re-derivation of the prompt's defect list against the **actual** code,
which differs from the prompt's assumed `backend/`+`frontend/` monolith.

## Verified-correct behaviour (must not regress)

| # | Behaviour | Status |
|---|---|---|
| V-1 | Register ignores client-supplied `role` | ✅ `authController.register` never reads `req.body.role` |
| V-2 | Non-admin blocked from admin routes | ✅ `requireAdmin` middleware on all admin routes |
| V-3 | Users cannot read another user's order | ✅ `orderController.getOrderById` checks `order.user_id !== req.user.id` |
| V-4 | Checkout uses server-side pricing | ✅ Prices come from cart snapshot (set by product service), not client |
| V-5 | Order items snapshot name/price at purchase | ✅ `checkout` maps `name`, `price`, `image_url` from cart into order |
| V-7 | Email uniqueness is case-insensitive | ✅ Schema `lowercase: true` + unique index |
| V-8 | Route guard loading states correct | ✅ `ProtectedRoute` waits on `loading` before redirecting |

| # | Behaviour | Status | Note |
|---|---|---|---|
| V-6 | Passwords hashed, never in response | ⚠️ Partial | `toJSON` deletes password from responses, but schema lacks `select: false` — password loads into memory on every query. Fix: add `select: false`. |

## Critical

| ID | Defect | Location | Detail |
|---|---|---|---|
| C-1 | No env validation at startup | all `server.js` | `JWT_SECRET` unset → `jwt.sign(payload, undefined)` throws at first auth op, not at boot. No fail-fast. |
| C-2 | Stock never decremented on order | `order-service/.../orderController.js:30-52` | Checkout checks `product.stock < qty` but NEVER decrements stock. No decrement endpoint exists in product-service. Unlimited orders against finite stock. **Worse than prompt's C-2.** |
| C-4 | Cross-service transaction impossible | architecture | Checkout spans 3 services (cart, product, order) with 3 separate MongoDB databases. A MongoDB transaction **cannot span multiple databases across services**. The prompt's §4.3 requirement ("all money moves inside a transaction") is architecturally impossible with the current 3-DB microservices split. **This is the strongest argument for consolidating into a single backend.** |
| C-5 | No tests exist | entire repo | 0 tests. Prompt requires 24+ backend tests as the safety net for the rebuild. |

## High

| ID | Defect | Location | Detail |
|---|---|---|---|
| H-1 | Regex injection in search | `product-service/.../productController.js:23` | `$regex: req.query.search` with raw input. `?search=(` → 500. ReDoS exposure. Text index unused. |
| H-2 | Mass assignment on product update | `product-service/.../productController.js:81` | `findByIdAndUpdate(id, req.body)` — no whitelist. Admin can forge `reviews`, `createdAt`, `__v`. |
| H-4 | Cancel doesn't restore stock | `order-service/.../orderController.js:111-128` | Status can be set to "Cancelled" but no stock restoration (moot while C-2 stands, but must be fixed together). |
| H-5 | No status-transition rules | `order-service/.../orderController.js:111-128` | Any status → any status. No state machine. Delivered→Pending allowed. |
| H-6 | Gateway admin stats unauthenticated | `gateway/.../statsController.js` | `/api/admin/stats` doesn't verify JWT itself. Auth/product stats endpoints are public → anyone gets partial dashboard data. |

## Medium

| ID | Defect | Detail |
|---|---|---|
| M-1 | Revenue counts Pending orders | `orderController.js:137` — `status: { $ne: "Cancelled" }` includes Pending. Should count paid/fulfilled only. |
| M-2 | Reviews not purchase-gated | Any authenticated user can review any product without purchasing. |
| M-3 | JWT in localStorage | Frontend `AuthContext` stores token in localStorage (XSS exposure). |
| M-4 | No 401 refresh handling | Axios interceptor removes token on 401 but doesn't refresh. |
| M-5 | CORS allows all origins | All services use `cors()` with no allowlist. |
| M-6 | No rate limiting on individual services | Only gateway has rate limiting. Direct access to services bypasses it. |
| M-7 | No idempotency on checkout | Retried checkouts create duplicate orders. |
| M-8 | Inter-service calls lack retry/circuit breaker | Cart/order services call product service with no resilience patterns. |
| M-9 | No graceful shutdown | No SIGTERM handling on any service. |
| M-10 | Password not `select: false` | V-6 partial — password loads into memory on queries. |

## Low

| ID | Defect | Detail |
|---|---|---|
| L-1 | Money stored as floats | Prices are `Number` (floats), not integer cents. |
| L-2 | No replica set | MongoDB standalone → no transaction support. |
| L-3 | Missing indexes | No explicit indexes on `category`, `price`, `createdAt`, or compound. |
| L-4 | Offset pagination | Uses skip/limit, not cursor-based. |
| L-5 | Error messages leak internals | `error: err.message` in all error responses. |
| L-6 | No frontend tests | 0 frontend tests. |
| L-7 | No /ready endpoint | Only /health, no readiness check. |
| L-8 | No structured logging | morgan (dev format), no JSON logs / correlation IDs. |