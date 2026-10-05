import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
  me,
  getProfile,
  verifyTokenEndpoint,
  listUsers,
  stats,
} from "../controllers/authController.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { strictAuthLimiter } from "../middleware/security.js";
import { registerSchema, loginSchema } from "../validation/authSchemas.js";

const router = Router();

router.post("/register", strictAuthLimiter, validate(registerSchema), register);
router.post("/login", strictAuthLimiter, validate(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);

router.get("/me", authenticate, me);
router.get("/profile", authenticate, getProfile);
router.get("/verify-token", verifyTokenEndpoint);
router.get("/users", authenticate, requireAdmin, listUsers);
router.get("/stats", stats);

export default router;
