import { Hono } from "hono";

import { createHealthRouter } from "@/routes/health.route";
import authRoutes from "@/routes/auth.route";
import { createLeaderboardRouter } from "@/routes/leaderboard.route";

type RoutesDependencies = {
  healthRouter?: Hono;
  authRouter?: Hono;
  leaderboardRouter?: Hono;
};

export const createRoutes = ({
  healthRouter = createHealthRouter(),
  authRouter = authRoutes,
  leaderboardRouter = createLeaderboardRouter(),
}: RoutesDependencies = {}) => {
  const routes = new Hono();

  routes.route("/health", healthRouter);
  routes.route("/auth", authRouter);
  routes.route("/leaderboard", leaderboardRouter);

  return routes;
};

export default createRoutes();
