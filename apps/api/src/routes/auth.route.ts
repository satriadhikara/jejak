import { auth } from "@/lib/auth";
import { Hono } from "hono";

const authRoutes = new Hono();

authRoutes.on(["POST", "GET"], "/*", (c) => {
  return auth.handler(c.req.raw);
});

export default authRoutes;
