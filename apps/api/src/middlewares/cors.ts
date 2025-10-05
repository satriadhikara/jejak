import { cors } from "hono/cors";

import { env } from "@/lib/env";

const corsMiddleware = cors({
  origin: env.CLIENT_ORIGIN,
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  credentials: true,
  maxAge: 600,
});

export default corsMiddleware;
