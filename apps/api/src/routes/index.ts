import { Hono } from "hono";

import healthRoutes from "@/routes/health.route";
import authRoutes from "@/routes/auth.route";
import leaderboardRoutes from "@/routes/leaderboard.route";

const routes = new Hono();

routes.route("/health", healthRoutes);
routes.route("/auth", authRoutes);
routes.route("/leaderboard", leaderboardRoutes);

export default routes;
