import { defineMiddleware } from "astro:middleware";

const ADMIN_COOKIE = "admin_session";
const ADMIN_SECRET = "authism-admin-secret-2024";

function verifySession(token: string): boolean {
  if (!token) return false;
  try {
    const decoded = atob(token);
    const [username, timestamp] = decoded.split(":");
    if (username !== "admin") return false;
    const sessionTime = parseInt(timestamp);
    const now = Date.now();
    return now - sessionTime < 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const cookie = context.cookies.get(ADMIN_COOKIE);
    const token = cookie?.value;

    if (!token || !verifySession(token)) {
      return context.redirect("/admin/login");
    }
  }

  if (pathname === "/admin/login") {
    const cookie = context.cookies.get(ADMIN_COOKIE);
    const token = cookie?.value;

    if (token && verifySession(token)) {
      return context.redirect("/admin");
    }
  }

  return next();
});
