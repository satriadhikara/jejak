import { Hono } from "hono";

import { getHealthStatus } from "@/services/health.service";

const healthRoutes = new Hono();

healthRoutes.get("/", async (c) => {
  const status = await getHealthStatus();
  return c.json(status);
});

export default healthRoutes;
