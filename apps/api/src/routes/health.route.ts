import { Hono } from "hono";

import { getHealthStatus } from "@/services/health.service";

type HealthRouteDependencies = {
  getHealthStatus: typeof getHealthStatus;
};

const defaultDependencies: HealthRouteDependencies = {
  getHealthStatus,
};

export const createHealthRouter = (
  deps: HealthRouteDependencies = defaultDependencies,
) => {
  const router = new Hono();

  router.get("/", async (c) => {
    const status = await deps.getHealthStatus();
    return c.json(status);
  });

  return router;
};

export default createHealthRouter();
