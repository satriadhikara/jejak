import { createHealthRouter } from "@/routes/health.route";
import authRoutes from "@/routes/auth.route";
import { createPointsRouter } from "@/routes/points.route";
import { createMapsRoute } from "@/routes/maps.route";
import { createRouter } from "@/lib/create-router";
import { createStorageRoute } from "@/routes/storage.route";
import { createReportRoute } from "@/routes/report.route";

type RoutesDependencies = {
  healthRouter?: ReturnType<typeof createRouter>;
  authRouter?: ReturnType<typeof createRouter>;
  pointsRouter?: ReturnType<typeof createRouter>;
  mapsRouter?: ReturnType<typeof createRouter>;
  storageRouter?: ReturnType<typeof createRouter>;
  reportRouter?: ReturnType<typeof createRouter>;
};

export const createRoutes = ({
  healthRouter = createHealthRouter(),
  authRouter = authRoutes,
  pointsRouter = createPointsRouter(),
  mapsRouter = createMapsRoute(),
  storageRouter = createStorageRoute(),
  reportRouter = createReportRoute(),
}: RoutesDependencies = {}) => {
  const routes = createRouter();

  routes.route("/health", healthRouter);
  routes.route("/auth", authRouter);
  routes.route("/points", pointsRouter);
  routes.route("/maps", mapsRouter);
  routes.route("/storage", storageRouter);
  routes.route("/reports", reportRouter);
  return routes;
};

export default createRoutes();
