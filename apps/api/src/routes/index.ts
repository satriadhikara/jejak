import { Hono } from "hono";

import healthRoutes from "@/routes/health.route";
import authRoutes from "@/routes/auth.route";

const routes = new Hono();

routes.route("/health", healthRoutes);
routes.route("/auth", authRoutes);

export default routes;
