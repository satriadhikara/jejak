import app from "@/app";
import { env } from "@/lib/env";

const port = env.PORT ?? 3000;

export default {
  port,
  fetch: app.fetch,
};
