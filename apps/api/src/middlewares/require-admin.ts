import { createMiddleware } from "hono/factory";
import type { AuthContextVariables } from "@/lib/auth";

export const requireAdmin = createMiddleware<{
  Variables: AuthContextVariables;
}>(async (c, next) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (user.role !== "admin") {
    return c.json({ error: "Forbidden: Admin access required" }, 403);
  }

  await next();
});
