import { createHealthRouter } from "@/routes/health.route";
import authRoutes from "@/routes/auth.route";
import { createPointsRouter } from "@/routes/points.route";
import { createMapsRoute } from "@/routes/maps.route";
import { createRouter } from "@/lib/create-router";
import { createStorageRoute } from "@/routes/storage.route";
import { createReportRoute } from "@/routes/report.route";
import { createUserRouter } from "@/routes/user.route";
import { createAdminRouter } from "@/routes/admin.route";

type RoutesDependencies = {
  healthRouter?: ReturnType<typeof createRouter>;
  authRouter?: ReturnType<typeof createRouter>;
  pointsRouter?: ReturnType<typeof createRouter>;
  mapsRouter?: ReturnType<typeof createRouter>;
  storageRouter?: ReturnType<typeof createRouter>;
  reportRouter?: ReturnType<typeof createRouter>;
  userRouter?: ReturnType<typeof createRouter>;
  adminRouter?: ReturnType<typeof createRouter>;
};

export const createRoutes = ({
  healthRouter = createHealthRouter(),
  authRouter = authRoutes,
  pointsRouter = createPointsRouter(),
  mapsRouter = createMapsRoute(),
  storageRouter = createStorageRoute(),
  reportRouter = createReportRoute(),
  userRouter = createUserRouter(),
  adminRouter = createAdminRouter(),
}: RoutesDependencies = {}) => {
  const routes = createRouter();

  routes.route("/health", healthRouter);
  routes.route("/auth", authRouter);
  routes.route("/points", pointsRouter);
  routes.route("/maps", mapsRouter);
  routes.route("/storage", storageRouter);
  routes.route("/reports", reportRouter);
  routes.route("/user", userRouter);
  routes.route("/admin", adminRouter);
  return routes;
};

export default createRoutes();
