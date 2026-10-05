import request from "supertest";
import { createApp } from "../src/app.js";
import { connectTestDB, disconnectTestDB, clearCollections } from "./db.js";
import User from "../src/models/User.js";
import bcrypt from "bcryptjs";
import { refreshStore } from "../src/services/refreshStore.js";
import { loginLockout } from "../src/middleware/security.js";

process.env.JWT_SECRET = "test_jwt_secret_for_phase0";
process.env.NODE_ENV = "test";

const app = createApp();

function cookieFrom(res) {
  const raw = res.headers["set-cookie"] || [];
  const refresh = raw.find((c) => c.startsWith("refreshToken="));
  return refresh ? refresh.split(";")[0] : null;
}

beforeAll(async () => {
  await connectTestDB();
}, 60000);

afterAll(async () => {
  await disconnectTestDB();
});

beforeEach(async () => {
  await clearCollections();
  refreshStore._clear();
  loginLockout._clear();
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
      .set("Authorization", `Bearer ${reg.body.accessToken}`);

    expect(res.status).toBe(403);
  });

  it("should return 401 when no token is provided", async () => {
    const res = await request(app).get("/api/auth/users");
    expect(res.status).toBe(401);
  });
});

describe("Auth: login works with correct credentials", () => {
  it("should return a JWT access token on successful login", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ name: "Login", email: "user@test.com", password: "mypassword" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "user@test.com", password: "mypassword" });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
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

describe("Security: access + refresh token scheme", () => {
  it("returns an access token and an httpOnly refresh cookie on login", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ name: "Tok", email: "tok@test.com", password: "secret123" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "tok@test.com", password: "secret123" });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.token).toBeUndefined();

    const cookie = cookieFrom(res);
    expect(cookie).toBeTruthy();
    const raw = res.headers["set-cookie"].join(";");
    expect(raw).toMatch(/HttpOnly/i);
  });

  it("GET /api/auth/me returns the current user from the access token", async () => {
    const reg = await request(app)
      .post("/api/auth/register")
      .send({ name: "Me", email: "me@test.com", password: "secret123" });

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${reg.body.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("me@test.com");
  });

  it("refresh rotates the refresh token and rejects the old cookie", async () => {
    const reg = await request(app)
      .post("/api/auth/register")
      .send({ name: "R", email: "r@test.com", password: "secret123" });

    const cookie = cookieFrom(reg);
    const first = await request(app).post("/api/auth/refresh").set("Cookie", cookie);
    expect(first.status).toBe(200);
    expect(first.body.accessToken).toBeDefined();

    const reuse = await request(app).post("/api/auth/refresh").set("Cookie", cookie);
    expect(reuse.status).toBe(401);
  });

  it("logout revokes the refresh token", async () => {
    const reg = await request(app)
      .post("/api/auth/register")
      .send({ name: "L", email: "l@test.com", password: "secret123" });

    const cookie = cookieFrom(reg);
    const lo = await request(app).post("/api/auth/logout").set("Cookie", cookie);
    expect(lo.status).toBe(200);

    const res = await request(app).post("/api/auth/refresh").set("Cookie", cookie);
    expect(res.status).toBe(401);
  });

  it("locks the account after repeated failed logins", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ name: "Lock", email: "lock@test.com", password: "rightpass" });

    for (let i = 0; i < 5; i += 1) {
      await request(app)
        .post("/api/auth/login")
        .send({ email: "lock@test.com", password: "wrongpass" });
    }

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "lock@test.com", password: "rightpass" });

    expect(res.status).toBe(429);
  });

  it("rejects invalid registration input via zod", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "", email: "not-an-email", password: "123" });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });
});
