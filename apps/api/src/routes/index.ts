import { Hono } from "hono";

import { createHealthRouter } from "@/routes/health.route";
import authRoutes from "@/routes/auth.route";
import { createPointsRouter } from "@/routes/points.route";

type RoutesDependencies = {
  healthRouter?: Hono;
  authRouter?: Hono;
  pointsRouter?: Hono;
};

export const createRoutes = ({
  healthRouter = createHealthRouter(),
  authRouter = authRoutes,
  pointsRouter = createPointsRouter(),
}: RoutesDependencies = {}) => {
  const routes = new Hono();

  routes.route("/health", healthRouter);
  routes.route("/auth", authRouter);
  routes.route("/points", pointsRouter);

  return routes;
};

export default createRoutes();
