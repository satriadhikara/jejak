import { Hono } from "hono";

import routes from "@/routes";
import logger from "@/middlewares/logger";
import { errorHandler } from "@/middlewares/error-handler";
import cors from "@/middlewares/cors";
import sessionMiddleware from "@/middlewares/session";
import type { AuthContextVariables } from "@/lib/auth";

const app = new Hono<{ Variables: AuthContextVariables }>({
  strict: true,
}).basePath("/api");

app.use("/*", cors);
app.use("/*", logger);
app.use("/*", sessionMiddleware);
app.onError(errorHandler);

app.route("/", routes);

export default app;
