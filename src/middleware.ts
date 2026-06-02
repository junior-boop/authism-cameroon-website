import { defineMiddleware } from "astro:middleware";

const ADMIN_COOKIE = "admin_token";
const ADMIN_PASSWORD = "admin1234";

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const token = context.cookies.get(ADMIN_COOKIE)?.value;
  const authed = token === ADMIN_PASSWORD;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !authed) {
    return context.redirect("/admin/login");
  }

  if (pathname === "/admin/login" && authed) {
    return context.redirect("/admin");
  }

  return next();
});
