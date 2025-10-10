import { createMiddleware } from "hono/factory";
import type { AuthContextVariables } from "@/lib/auth";

export const requireAuth = createMiddleware<{
  Variables: AuthContextVariables;
}>(async (c, next) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  await next();
});
