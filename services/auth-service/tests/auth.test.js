import request from "supertest";
import { createApp } from "../src/app.js";
import { connectTestDB, disconnectTestDB, clearCollections } from "./db.js";
import User from "../src/models/User.js";
import bcrypt from "bcryptjs";

process.env.JWT_SECRET = "test_jwt_secret_for_phase0";
process.env.NODE_ENV = "test";

const app = createApp();

beforeAll(async () => {
  await connectTestDB();
}, 60000);

afterAll(async () => {
  await disconnectTestDB();
});

beforeEach(async () => {
  await clearCollections();
});

describe("V-1: Register ignores client-supplied role", () => {
  it("should create a customer even when role:admin is sent", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Hacker", email: "hacker@test.com", password: "123456", role: "admin" });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe("customer");

    const dbUser = await User.findOne({ email: "hacker@test.com" });
    expect(dbUser.role).toBe("customer");
  });
});

describe("V-6: Passwords are bcrypt-hashed and never in responses", () => {
  it("should not return password in register response", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Test", email: "test@test.com", password: "secret123" });

    expect(res.status).toBe(201);
    expect(res.body.user).not.toHaveProperty("password");
  });

  it("should not return password in login response", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ name: "Test", email: "login@test.com", password: "secret123" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "login@test.com", password: "secret123" });

    expect(res.status).toBe(200);
    expect(res.body.user).not.toHaveProperty("password");
  });

  it("should store a bcrypt hash, not plaintext", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ name: "Hash", email: "hash@test.com", password: "plaintext123" });

    const dbUser = await User.findOne({ email: "hash@test.com" }).select("+password");
    expect(dbUser.password).not.toBe("plaintext123");
    expect(dbUser.password.startsWith("$2a$")).toBe(true);
    expect(await bcrypt.compare("plaintext123", dbUser.password)).toBe(true);
  });
});

describe("V-7: Email uniqueness is case-insensitive", () => {
  it("should reject N@T.com as duplicate of n@t.com", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ name: "First", email: "n@t.com", password: "123456" });

    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Second", email: "N@T.com", password: "123456" });

    expect(res.status).toBe(409);
  });
});

describe("V-2: Non-admin blocked from admin routes", () => {
  it("should return 403 when customer accesses /api/auth/users", async () => {
    const reg = await request(app)
      .post("/api/auth/register")
      .send({ name: "Customer", email: "cust@test.com", password: "123456" });

    const res = await request(app)
      .get("/api/auth/users")
      .set("Authorization", `Bearer ${reg.body.token}`);

    expect(res.status).toBe(403);
  });

  it("should return 401 when no token is provided", async () => {
    const res = await request(app).get("/api/auth/users");
    expect(res.status).toBe(401);
  });
});

describe("Auth: login works with correct credentials", () => {
  it("should return a JWT token on successful login", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ name: "Login", email: "user@test.com", password: "mypassword" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "user@test.com", password: "mypassword" });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("user@test.com");
  });

  it("should reject wrong password", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ name: "Login", email: "wrong@test.com", password: "correct" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "wrong@test.com", password: "incorrect" });

    expect(res.status).toBe(401);
  });
});