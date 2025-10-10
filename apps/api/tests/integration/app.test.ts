import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test";

import { createApp } from "@/app";
import { createRoutes } from "@/routes";
import { createHealthRouter } from "@/routes/health.route";
import type { HealthStatus } from "@/services/health.service";

let server: ReturnType<typeof Bun.serve>;

const healthStatus: HealthStatus = {
  status: "ok",
  uptime: 0,
  timestamp: new Date().toISOString(),
  services: {
    database: "up",
  },
};

describe("app integration", () => {
  beforeAll(() => {
    const getHealthStatus = mock(async () => healthStatus);

    const routes = createRoutes({
      healthRouter: createHealthRouter({ getHealthStatus }),
    });

    const app = createApp({ routes });

    server = Bun.serve({
      port: 0,
      fetch: app.fetch,
    });
  });

  afterAll(() => {
    server.stop();
  });

  it("responds to health check", async () => {
    const url = new URL("/api/health", server.url);

    const response = await fetch(url);

    expect(response.status).toBe(200);
  });
});
