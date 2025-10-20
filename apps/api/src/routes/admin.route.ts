import { createRouter } from "@/lib/create-router";
import { requireAdmin } from "@/middlewares/require-admin";
import {
  getAdminStats,
  getAllReports,
  getNewReports,
  getInProgressReports,
  getCompletedReports,
} from "@/services/admin.service";

type AdminRouteDependencies = {
  getAdminStats: typeof getAdminStats;
  getAllReports: typeof getAllReports;
  getNewReports: typeof getNewReports;
  getInProgressReports: typeof getInProgressReports;
  getCompletedReports: typeof getCompletedReports;
};

const defaultDependencies: AdminRouteDependencies = {
  getAdminStats,
  getAllReports,
  getNewReports,
  getInProgressReports,
  getCompletedReports,
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

  router.get("/reports", async (c) => {
    try {
      const reports = await deps.getAllReports();
      return c.json({ data: reports });
    } catch (error) {
      console.error("Error in admin reports endpoint:", error);
      return c.json({ error: "Failed to fetch admin reports" }, 500);
    }
  });

  router.get("/reports/new", async (c) => {
    try {
      const reports = await deps.getNewReports();
      return c.json({ data: reports });
    } catch (error) {
      console.error("Error in admin new reports endpoint:", error);
      return c.json({ error: "Failed to fetch new reports" }, 500);
    }
  });

  router.get("/reports/in-progress", async (c) => {
    try {
      const reports = await deps.getInProgressReports();
      return c.json({ data: reports });
    } catch (error) {
      console.error("Error in admin in-progress reports endpoint:", error);
      return c.json({ error: "Failed to fetch in-progress reports" }, 500);
    }
  });

  router.get("/reports/completed", async (c) => {
    try {
      const reports = await deps.getCompletedReports();
      return c.json({ data: reports });
    } catch (error) {
      console.error("Error in admin completed reports endpoint:", error);
      return c.json({ error: "Failed to fetch completed reports" }, 500);
    }
  });

  return router;
};

export default createAdminRouter();
