import { getHealthStatus } from "@/services/health.service";
import { createRouter } from "@/lib/create-router";

type HealthRouteDependencies = {
  getHealthStatus: typeof getHealthStatus;
};

const defaultDependencies: HealthRouteDependencies = {
  getHealthStatus,
};

export const createHealthRouter = (
  deps: HealthRouteDependencies = defaultDependencies,
) => {
  const router = createRouter();

  router.get("/", async (c) => {
    const status = await deps.getHealthStatus();
    return c.json(status);
  });

  return router;
};

export default createHealthRouter();
