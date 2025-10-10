import { auth } from "@/lib/auth";
import { createRouter } from "@/lib/create-router";

const authRoutes = createRouter();

authRoutes.on(["POST", "GET"], "/*", (c) => {
  return auth.handler(c.req.raw);
});

export default authRoutes;
