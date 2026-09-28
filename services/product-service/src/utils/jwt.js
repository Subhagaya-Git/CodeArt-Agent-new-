import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}