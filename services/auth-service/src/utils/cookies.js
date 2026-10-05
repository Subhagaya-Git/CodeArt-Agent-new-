import { REFRESH_TTL_SECONDS } from "./jwt.js";

export const REFRESH_COOKIE = "refreshToken";

const PROD = () => process.env.NODE_ENV === "production";

/**
 * Refresh token cookie: httpOnly + Secure (prod) + SameSite, scoped to the
 * auth API path so it is not sent on unrelated requests.
 */
export function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: PROD(),
    sameSite: "lax",
    path: "/api/auth",
    maxAge: REFRESH_TTL_SECONDS * 1000,
  };
}

export function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE, token, refreshCookieOptions());
}

export function clearRefreshCookie(res) {
  const { maxAge, ...opts } = refreshCookieOptions();
  res.clearCookie(REFRESH_COOKIE, opts);
}