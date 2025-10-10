import { createHealthRouter } from "@/routes/health.route";
import authRoutes from "@/routes/auth.route";
import { createPointsRouter } from "@/routes/points.route";
import { createRouter } from "@/lib/create-router";

type RoutesDependencies = {
  healthRouter?: ReturnType<typeof createRouter>;
  authRouter?: ReturnType<typeof createRouter>;
  pointsRouter?: ReturnType<typeof createRouter>;
};

export const createRoutes = ({
  healthRouter = createHealthRouter(),
  authRouter = authRoutes,
  pointsRouter = createPointsRouter(),
}: RoutesDependencies = {}) => {
  const routes = createRouter();

  routes.route("/health", healthRouter);
  routes.route("/auth", authRouter);
  routes.route("/points", pointsRouter);

  return routes;
};

export default createRoutes();
