import request from "supertest";
import jwt from "jsonwebtoken";
import { createApp } from "../src/app.js";
import { connectTestDB, disconnectTestDB, clearCollections } from "./db.js";
import Product from "../src/models/Product.js";

process.env.JWT_SECRET = "test_jwt_secret_for_phase0";
process.env.NODE_ENV = "test";

const app = createApp();

function adminToken() {
  return jwt.sign({ id: "admin123", role: "admin", name: "Admin" }, process.env.JWT_SECRET);
}

function customerToken() {
  return jwt.sign({ id: "cust123", role: "customer", name: "Cust" }, process.env.JWT_SECRET);
}

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

beforeEach(async () => {
  await clearCollections();
});

async function createProduct(overrides = {}) {
  const product = await Product.create({
    name: "Test Product",
    description: "A test product",
    price: 29.99,
    stock: 10,
    category: "Electronics",
    image_url: "https://example.com/img.jpg",
    ...overrides,
  });
  return product;
}

describe("H-1: Regex injection in search is fixed", () => {
  it("should return 200 (not 500) for search with regex special chars", async () => {
    await createProduct({ name: "Wireless (Bluetooth) Headphones" });

    const res = await request(app).get("/api/products?search=(");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("products");
  });

  it("should return 200 for search with another regex char", async () => {
    await createProduct();

    const res = await request(app).get("/api/products?search=.*+?^${}");

    expect(res.status).toBe(200);
  });

  it("should still match products by name", async () => {
    await createProduct({ name: "UniqueHeadphones" });

    const res = await request(app).get("/api/products?search=UniqueHeadphones");

    expect(res.status).toBe(200);
    expect(res.body.products.length).toBe(1);
    expect(res.body.products[0].name).toBe("UniqueHeadphones");
  });
});

describe("H-2: Mass assignment on product update is fixed", () => {
  it("should NOT allow forging reviews via update", async () => {
    const product = await createProduct();
    const token = adminToken();

    const res = await request(app)
      .put(`/api/products/${product._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Updated",
        price: 19.99,
        stock: 5,
        category: "Electronics",
        reviews: [{ user: "fake", rating: 5, comment: "forged" }],
      });

    expect(res.status).toBe(200);

    const dbProduct = await Product.findById(product._id);
    expect(dbProduct.reviews.length).toBe(0);
  });

  it("should NOT allow forging createdAt via update", async () => {
    const product = await createProduct();
    const token = adminToken();
    const originalCreatedAt = product.createdAt;

    const res = await request(app)
      .put(`/api/products/${product._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Updated",
        price: 19.99,
        stock: 5,
        category: "Electronics",
        createdAt: "2000-01-01T00:00:00.000Z",
      });

    expect(res.status).toBe(200);

    const dbProduct = await Product.findById(product._id);
    expect(dbProduct.createdAt.toISOString()).toBe(originalCreatedAt.toISOString());
  });

  it("should allow updating whitelisted fields", async () => {
    const product = await createProduct();
    const token = adminToken();

    const res = await request(app)
      .put(`/api/products/${product._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "New Name", price: 99.99, stock: 3, category: "Home" });

    expect(res.status).toBe(200);
    expect(res.body.product.name).toBe("New Name");
    expect(res.body.product.price).toBe(99.99);
    expect(res.body.product.stock).toBe(3);
    expect(res.body.product.category).toBe("Home");
  });
});

describe("V-2: Non-admin blocked from product admin routes", () => {
  it("should return 403 when customer creates a product", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${customerToken()}`)
      .send({ name: "X", price: 10, stock: 1, category: "X" });

    expect(res.status).toBe(403);
  });

  it("should return 403 when customer deletes a product", async () => {
    const product = await createProduct();
    const res = await request(app)
      .delete(`/api/products/${product._id}`)
      .set("Authorization", `Bearer ${customerToken()}`);

    expect(res.status).toBe(403);
  });
});

describe("Product listing and pagination", () => {
  it("should return paginated products", async () => {
    for (let i = 0; i < 15; i++) {
      await createProduct({ name: `Product ${i}` });
    }

    const res = await request(app).get("/api/products?page=1&limit=5");

    expect(res.status).toBe(200);
    expect(res.body.products.length).toBe(5);
    expect(res.body.pagination.total).toBe(15);
    expect(res.body.pagination.totalPages).toBe(3);
  });

  it("should filter by category", async () => {
    await createProduct({ name: "A", category: "Electronics" });
    await createProduct({ name: "B", category: "Clothing" });

    const res = await request(app).get("/api/products?category=Clothing");

    expect(res.status).toBe(200);
    expect(res.body.products.length).toBe(1);
    expect(res.body.products[0].category).toBe("Clothing");
  });
});