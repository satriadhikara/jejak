import { createRouter } from "@/lib/create-router";
import { requireAuth } from "@/middlewares/require-auth";
import { requireAdmin } from "@/middlewares/require-admin";
import { getAdminStats } from "@/services/admin.service";

type AdminRouteDependencies = {
  getAdminStats: typeof getAdminStats;
};

const defaultDependencies: AdminRouteDependencies = {
  getAdminStats,
};

export const createAdminRouter = (
  deps: AdminRouteDependencies = defaultDependencies,
) => {
  const router = createRouter();

  router.use("/*", requireAdmin);

  router.get("/stats", async (c) => {
    try {
      const stats = await deps.getAdminStats();
      return c.json({ data: stats });
    } catch (error) {
      console.error("Error in admin stats endpoint:", error);
      return c.json({ error: "Failed to fetch admin statistics" }, 500);
    }
  });

  return router;
};

export default createAdminRouter();
